import { DemoWalkthrough } from './demo/DemoWalkthrough';

export function DemoSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          From an idea to shipped — watch the whole loop
        </h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          One idea moves through your whole team and a fleet of AI agents, and ends as a measured
          result. Here&apos;s the full story in eight steps.
        </p>
      </div>
      <div className="mt-12">
        {/*
          Real product videos can be embedded per step by dropping an <video>
          (or a hosted embed) into the DemoWalkthrough stage. Until then this
          animated walkthrough plays the same story end to end.
        */}
        <DemoWalkthrough />
      </div>
    </section>
  );
}
