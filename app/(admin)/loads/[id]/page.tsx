import { redirect } from 'next/navigation';

import { checkAdminAccess } from '@/lib/auth-check';
import { prisma } from '@/lib/prisma';
import LoadDetailView from '@/components/dashboard/load-detail-view';

export default async function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check authentication and authorization (cached per request)
  await checkAdminAccess();

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
