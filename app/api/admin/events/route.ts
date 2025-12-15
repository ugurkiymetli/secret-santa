import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

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

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload: any = await verifyToken(token!);

  await dbConnect();

  // Filter by organizerId to ensure isolation
  const events = await Event.find({ organizerId: payload.userId })
    .select("-matches.receiver")
    .sort({ createdAt: -1 });
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { name, giftLimit, giftDate } = await req.json();
  console.log(name, giftLimit, giftDate);
  // Get organizer ID
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload: any = await verifyToken(token!);

  const event = await Event.create({
    name,
    giftLimit: giftLimit || 20,
    giftDate: giftDate ? new Date(giftDate) : undefined,
    organizerId: payload.userId,
    status: "ACTIVE",
  });
  console.log(event);

  return NextResponse.json({ event });
}

export async function PUT(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id, giftLimit } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // Ensure event belongs to this organizer
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload: any = await verifyToken(token!);

  const event = await Event.findOneAndUpdate(
    { _id: id, organizerId: payload.userId },
    { giftLimit: Number(giftLimit) },
    { new: true }
  );

  if (!event) {
    return NextResponse.json(
      { error: "Event not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ event });
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

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload: any = await verifyToken(token!);

  const deletedEvent = await Event.findOneAndDelete({
    _id: id,
    organizerId: payload.userId,
  });

  if (!deletedEvent) {
    return NextResponse.json(
      { error: "Event not found or unauthorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
