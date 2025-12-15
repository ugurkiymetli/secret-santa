import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
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
  const events = await Event.find().populate("organizerId", "name username");
  return NextResponse.json({ events });
}
