import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Event from "@/models/Event";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function checkSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  const payload: any = await verifyToken(token);
  return payload && payload.role === "SUPER_ADMIN";
}

export async function GET() {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const admins = await User.find({ role: "ORGANIZER" }).select("-passwordHash");
  return NextResponse.json({ admins });
}

export async function DELETE(req: Request) {
  if (!(await checkSuperAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    // 1. Find the organizer
    const organizer = await User.findById(id);
    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
    }

    if (organizer.role !== "ORGANIZER") {
      return NextResponse.json({ error: "User is not an organizer" }, { status: 400 });
    }

    // 2. Delete all events created by this organizer
    await Event.deleteMany({ organizerId: id });

    // 3. Delete all users created by this organizer
    await User.deleteMany({ createdBy: id });

    // 4. Delete the organizer
    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organizer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
