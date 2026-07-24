import { notFound, redirect } from 'next/navigation';
import { RequestsBoard } from '@/components/requests/RequestsBoard';
import { getCurrentUser } from '@/lib/auth';
import { isFlagEnabled } from '@/lib/flags/server';

export const dynamic = 'force-dynamic';

export default async function RequestsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  // Dark-launched: 404 until the `product-workflow` flag is enabled for the user.
  if (!(await isFlagEnabled('productWorkflow', user.id))) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Requests</h1>
      <RequestsBoard companyId={companyId} />
    </main>
  );
}
