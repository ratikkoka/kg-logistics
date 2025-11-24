import { checkAdminAccess } from '@/lib/auth-check';
import ContactsDashboard from '@/components/dashboard/contacts-dashboard';

export default async function ContactsPage() {
  // Check authentication and authorization (cached per request)
  await checkAdminAccess();

  return (
    <>
      <h1 className='mb-4 text-2xl font-bold break-words sm:mb-8 sm:text-4xl'>
        Contacts Dashboard
      </h1>
      <ContactsDashboard />
    </>
  );
}
