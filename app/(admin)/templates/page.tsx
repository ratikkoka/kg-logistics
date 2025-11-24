import { checkAdminAccess } from '@/lib/auth-check';
import TemplatesManager from '@/components/templates/templates-manager';

export default async function TemplatesPage() {
  // Check authentication and authorization (cached per request)
  await checkAdminAccess();

  return (
    <>
      <h1 className='mb-4 text-2xl font-bold break-words sm:mb-8 sm:text-4xl'>
        Email Templates
      </h1>
      <TemplatesManager />
    </>
  );
}
