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
  const { giftLimit } = await req.json();

  // 1. Get all participants (excluding organizers if they don't participate? 
  // Assuming organizers CAN participate if they want, but usually they just manage. 
  // Let's assume only role='USER' participates for now, or all users.)
  // The prompt says "Organizer that will add names... Then these users..."
  // Let's assume only 'USER' role participates.
  const participants = await User.find({ role: 'USER' });

  if (participants.length < 2) {
    return NextResponse.json({ error: 'Not enough participants (min 2)' }, { status: 400 });
  }

  // 2. Derangement (Secret Santa) Algorithm
  // Simple shuffle and shift approach is easiest for valid derangement
  let shuffled = [...participants];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Check for self-matches (fixed points) and rotate if needed
  // A simple rotation guarantees no fixed points if we rotate by 1, 
  // provided the list is shuffled first to ensure randomness.
  // Actually, just shuffling isn't enough to guarantee no self-match (1/n chance).
  // But if we shuffle, then assign i to (i+1)%n, it is a guaranteed derangement.
  
  const updates = participants.map((user, index) => {
    // Find the user in the shuffled list
    // Wait, the rotation method:
    // 1. Shuffle the array of users: [A, B, C, D] -> [C, A, D, B]
    // 2. Assign index i to index (i+1)%n
    // C gives to A, A gives to D, D gives to B, B gives to C.
    // This works and is random.
    
    const giver = shuffled[index];
    const receiver = shuffled[(index + 1) % shuffled.length];
    
    return User.updateOne(
      { _id: giver._id },
      { assignedMatch: receiver._id, isRevealed: false }
    );
  });

  await Promise.all(updates);

  // 3. Create/Update Event
  // Check if event exists
  let event = await Event.findOne();
  if (!event) {
    // We need an organizer ID. Since we checked auth, we can get it from token.
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const payload: any = await verifyToken(token!);
    
    event = await Event.create({
      status: 'ACTIVE',
      giftLimit: giftLimit || 20,
      organizerId: payload.userId
    });
  } else {
    event.status = 'ACTIVE';
    event.giftLimit = giftLimit || event.giftLimit;
    await event.save();
  }

  return NextResponse.json({ success: true, count: participants.length });
}
