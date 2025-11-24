import { checkAdminAccess } from '@/lib/auth-check';
import ManualLeadForm from '@/components/leads/manual-lead-form';

export default async function NewLeadPage() {
  // Check authentication and authorization (cached per request)
  await checkAdminAccess();

  return (
    <div className='px-4 pt-4 pb-4 sm:pt-8 sm:pb-8'>
      <h1 className='mb-4 text-2xl font-bold break-words sm:mb-8 sm:text-4xl'>
        Create New Lead
      </h1>
      <ManualLeadForm />
    </div>
  );
}
