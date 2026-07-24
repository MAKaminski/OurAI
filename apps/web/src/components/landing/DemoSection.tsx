import { VideoDemo } from '@/components/demo/VideoDemo';
import { Reveal } from '@/components/motion/Reveal';
import { site } from '@/lib/site';

export function DemoSection() {
  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">
          From an idea to shipped — watch the whole loop
        </h2>
        <p className="mt-3 text-zinc-400">
          One idea moves through your whole team and a fleet of AI agents, and ends as a measured
          result. Here&apos;s the full story in eight steps.
        </p>
      </Reveal>
      <div className="mt-12">
        {/* Swappable: plays a real recording when site.demoVideo is set, else
            the animated walkthrough tells the same story end to end. */}
        <VideoDemo src={site.demoVideo || undefined} />
      </div>
    </section>
  );
}
