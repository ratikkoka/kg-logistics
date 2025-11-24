import { redirect } from 'next/navigation';

import { checkAdminAccess } from '@/lib/auth-check';
import { prisma } from '@/lib/prisma';
import LeadDetailView from '@/components/dashboard/lead-detail-view';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check authentication and authorization (cached per request)
  await checkAdminAccess();

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
