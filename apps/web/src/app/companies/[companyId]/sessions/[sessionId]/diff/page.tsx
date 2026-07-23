import { DiffPreview } from '@/components/diff/DiffPreview';

export default async function DiffPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Review &amp; merge</h1>
      <DiffPreview workItemId={sessionId} />
    </main>
  );
}
