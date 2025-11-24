import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';

/**
 * Shared auth check utility for admin pages
 * This function handles both authentication and authorization checks
 * and can be reused across all admin pages to reduce code duplication
 */
export async function checkAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check authorization (hasAccess) - cached per request
  const authorized = await isUserAuthorized(user.id);

  if (!authorized) {
    redirect('/unauthorized');
  }

  return { user };
}
