import { TranscriptRoom } from '@/components/transcript/TranscriptRoom';

export default async function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Live session</h1>
      <TranscriptRoom sessionId={sessionId} />
    </main>
  );
}
