import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LoadDetailView from '@/components/dashboard/load-detail-view';

export default async function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const load = await prisma.load.findUnique({
    where: { id },
    include: {
      lead: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!load) {
    redirect('/loads');
  }

  return <LoadDetailView load={load} />;
}
