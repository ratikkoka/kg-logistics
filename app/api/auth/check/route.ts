import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';

// POST /api/auth/check - Check if a user is authorized
export async function POST(_request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ authorized: false });
    }

    const authorized = await isUserAuthorized(user.id);

    return NextResponse.json({ authorized });
  } catch (error) {
    console.error('Error checking authorization:', error);

    return NextResponse.json(
      { error: 'Failed to check authorization' },
      { status: 500 }
    );
  }
}
