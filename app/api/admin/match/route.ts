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
  const reqBody = await req.json();
  const { eventId } = reqBody;

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Determine participants
  let participants;
  
  if (reqBody.participantIds && Array.isArray(reqBody.participantIds) && reqBody.participantIds.length > 0) {
    // If specific participants were selected
    participants = await User.find({ 
      _id: { $in: reqBody.participantIds },
      role: 'USER' // Ensure they are valid users
    });
  } else {
    // Fallback to all users if no specific selection logic (or legacy behavior)
    // Though the UI should now always send participantIds
    participants = await User.find({ role: 'USER' });
  }

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
