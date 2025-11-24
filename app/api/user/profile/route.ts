import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// GET /api/user/profile - Get user profile (name from profile table)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || user.id;

    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    return NextResponse.json({
      name: profile?.name || null,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);

    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
