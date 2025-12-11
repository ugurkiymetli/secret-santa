import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to check admin role
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
  const users = await User.find({}).select('-passwordHash');
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    // Special case: Allow creating the first user if no users exist (Setup mode)
    await dbConnect();
    const count = await User.countDocuments();
    if (count > 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    await dbConnect();
  }

  try {
    const { username, role } = await req.json();
    const newUser = await User.create({
      username,
      role: role || 'USER',
    });
    return NextResponse.json({ user: newUser });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
