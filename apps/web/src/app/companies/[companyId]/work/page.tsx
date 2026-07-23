import { OutstandingWork } from '@/components/work/OutstandingWork';

export default function WorkPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Outstanding work</h1>
      <OutstandingWork />
    </main>
  );
}
