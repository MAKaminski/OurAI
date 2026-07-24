import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { StartWizard } from '@/components/start/StartWizard';

export const dynamic = 'force-dynamic';

/** Value-first onboarding: signed-in users get from nothing to their first
 * request in three guided steps. Auth-gate here; the flow itself is a client
 * component so each step can hold its own state. */
export default async function StartPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <StartWizard />;
}
