import { IdeaBoard } from '@/components/ideas/IdeaBoard';

export default function IdeasPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Idea intake</h1>
      <IdeaBoard />
    </main>
  );
}
