import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const { eventId } = await req.json();

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Use all users for now, or we could add a participant selection step later.
  // For simplicity, let's assume all users are participants in every event for now,
  // OR we can just fetch all users and add them to the event participants list.
  const participants = await User.find({ role: 'USER' });

  if (participants.length < 2) {
    return NextResponse.json({ error: 'Not enough participants (min 2)' }, { status: 400 });
  }

  // Derangement (Secret Santa) Algorithm
  let shuffled = [...participants];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create matches array
  const matches = participants.map((user, index) => {
    const giver = shuffled[index];
    const receiver = shuffled[(index + 1) % shuffled.length];
    
    return {
      giver: giver._id,
      receiver: receiver._id,
      isRevealed: false
    };
  });

  // Update Event
  event.participants = participants.map(p => p._id);
  event.matches = matches;
  event.status = 'ACTIVE';
  await event.save();

  return NextResponse.json({ success: true, count: participants.length });
}
