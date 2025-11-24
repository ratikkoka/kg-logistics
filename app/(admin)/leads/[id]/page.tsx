import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { isUserAuthorized } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LeadDetailView from '@/components/dashboard/lead-detail-view';

export default async function LeadDetailPage({
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

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      emails: {
        orderBy: { sentAt: 'desc' },
        include: {
          template: true,
        },
      },
    },
  });

  if (!lead) {
    redirect('/dashboard');
  }

  return <LeadDetailView lead={lead} />;
}
