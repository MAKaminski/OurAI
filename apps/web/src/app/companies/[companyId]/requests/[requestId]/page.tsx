import { notFound, redirect } from 'next/navigation';
import { RequestDetail } from '@/components/requests/RequestDetail';
import { getCurrentUser } from '@/lib/auth';
import { isFlagEnabled } from '@/lib/flags/server';

export const dynamic = 'force-dynamic';

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; requestId: string }>;
}) {
  const { companyId, requestId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!(await isFlagEnabled('productWorkflow', user.id))) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <RequestDetail companyId={companyId} requestId={requestId} />
    </main>
  );
}
