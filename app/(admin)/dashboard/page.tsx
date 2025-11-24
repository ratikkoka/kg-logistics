import { checkAdminAccess } from '@/lib/auth-check';
import LeadsDashboard from '@/components/dashboard/leads-dashboard';

export default async function DashboardPage() {
  // Check authentication and authorization (cached per request)
  await checkAdminAccess();

  return (
    <>
      <h1 className='mb-4 text-2xl font-bold break-words sm:mb-8 sm:text-4xl'>
        Leads Dashboard
      </h1>
      <LeadsDashboard />
    </>
  );
}
