import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import User from "@/models/User"; // Ensure User model is registered
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: any = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Find events where user is a participant or has a match
  // Since we store matches in the event, we can query matches.giver
  try {
    const events = await Event.find({
      "matches.giver": payload.userId,
    })
      .populate("matches.receiver", "name")
      .lean();

    // Filter out sensitive data, only return the user's match
    const userEvents = events.map((event: any) => {
      const match = event.matches.find(
        (m: any) => m.giver.toString() === payload.userId
      );
      return {
        _id: event._id,
        name: event.name,
        giftLimit: event.giftLimit,
        giftDate: event.giftDate,
        matchName: match?.receiver?.name || null,
      };
    });

    return NextResponse.json({ events: userEvents });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
