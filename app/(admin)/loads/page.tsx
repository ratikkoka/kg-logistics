import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';
import LoadsDashboard from '@/components/dashboard/loads-dashboard';

export default async function LoadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check authorization (hasAccess)
  const authorized = await isUserAuthorized(user.id);

  if (!authorized) {
    redirect('/unauthorized');
  }

  return (
    <>
      <h1 className='mb-4 text-2xl font-bold break-words sm:mb-8 sm:text-4xl'>
        Loads Dashboard
      </h1>
      <LoadsDashboard />
    </>
  );
}
