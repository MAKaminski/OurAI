import { DemoWalkthrough } from '@/components/landing/demo/DemoWalkthrough';

/**
 * A swappable demo surface. When a real recording exists (`src`), it plays as a
 * looping video; until then it falls back to the in-browser animated
 * walkthrough, clearly labeled as an illustrative demo. Dropping a file path
 * into `site.demoVideo` turns on the real video with zero other changes.
 */
export function VideoDemo({
  src,
  poster,
  className = '',
}: {
  src?: string;
  poster?: string;
  className?: string;
}) {
  if (src) {
    return (
      <div
        className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e10] shadow-xl ${className}`}
      >
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="w-full"
        >
          <track kind="captions" />
        </video>
      </div>
    );
  }
  return (
    <div className={className}>
      <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.15em] text-zinc-600">
        Demo · illustrative walkthrough
      </p>
      <DemoWalkthrough />
    </div>
  );
}
