import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { isUserAuthorized } from '@/lib/auth';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const errorUrl = new URL('/login', request.url);

    errorUrl.searchParams.set('error', error || 'oauth_error');
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription);
    }

    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const cookieStore = await cookies();

    // Create Supabase client with proper cookie handling for OAuth callback
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Handle cookie setting errors
              console.error('Error setting cookies:', error);
            }
          },
        },
      }
    );

    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      const errorUrl = new URL('/login', request.url);

      errorUrl.searchParams.set('error', exchangeError.message || 'auth_error');

      return NextResponse.redirect(errorUrl);
    }

    if (data?.user) {
      // Check if user is authorized
      const authorized = await isUserAuthorized(data.user.id);

      if (!authorized) {
        // User is not authorized, sign them out and redirect to unauthorized
        await supabase.auth.signOut();

        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
