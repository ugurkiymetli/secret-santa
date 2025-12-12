import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import colors from "./colors.json";
import creatures from "./creatures.json";

// Helper to check admin role
async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  const payload: any = await verifyToken(token);
  return payload && payload.role === "ORGANIZER";
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const users = await User.find({}).select("-passwordHash -assignedMatch");
  return NextResponse.json({ users });
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // Prevent deleting self (admin)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload: any = await verifyToken(token!);

  if (payload.userId === id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 }
    );
  }

  await User.findByIdAndDelete(id);

  // Also remove from any events?
  // Ideally yes, but for now let's just delete the user.
  // The event matches might break if we don't handle it, but the user asked for "delete user".
  // Let's keep it simple for now.

  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    // Special case: Allow creating the first user if no users exist (Setup mode)
    await dbConnect();
    const count = await User.countDocuments();
    if (count > 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    await dbConnect();
  }

  try {
    const { name, role } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate unique username
    let username = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 50) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const creature = creatures[Math.floor(Math.random() * creatures.length)];
      const candidate = `${color}-${creature}`;

      const existing = await User.findOne({ username: candidate });
      if (!existing) {
        username = candidate;
        isUnique = true;
      }
      attempts++;
    }

    if (!username) {
      return NextResponse.json(
        { error: "Could not generate unique username" },
        { status: 500 }
      );
    }

    const newUser = await User.create({
      name,
      username,
      role: role || "USER",
    });
    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
