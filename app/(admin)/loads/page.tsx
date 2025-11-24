import { checkAdminAccess } from '@/lib/auth-check';
import LoadsDashboard from '@/components/dashboard/loads-dashboard';

export default async function LoadsPage() {
  // Check authentication and authorization (cached per request)
  await checkAdminAccess();

  return (
    <>
      <h1 className='mb-4 text-2xl font-bold break-words sm:mb-8 sm:text-4xl'>
        Loads Dashboard
      </h1>
      <LoadsDashboard />
    </>
  );
}
