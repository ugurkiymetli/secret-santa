import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;
  const payload: any = await verifyToken(token);
  return payload && payload.role === 'ORGANIZER';
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await dbConnect();
  const events = await Event.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { name, giftLimit, giftDate } = await req.json();
  console.log(name, giftLimit, giftDate);
  // Get organizer ID
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const payload: any = await verifyToken(token!);

  const event = await Event.create({
    name,
    giftLimit: giftLimit || 20,
    giftDate: giftDate ? new Date(giftDate) : undefined,
    organizerId: payload.userId,
    status: 'ACTIVE'
  });
console.log(event);

  return NextResponse.json({ event });
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  await Event.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
