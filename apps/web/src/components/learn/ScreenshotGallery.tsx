import { Stagger, StaggerItem } from '@/components/motion/Stagger';

export interface Screenshot {
  /** Path under /public. */
  src: string;
  alt: string;
  /** Fake address-bar label for the browser chrome. */
  label: string;
  caption: string;
}

/**
 * The "real screens" format: actual screenshots captured from the signed-in
 * app, framed in lightweight browser chrome. Unlike ExampleGallery (honest HTML
 * mockups), these are the real product rendered by its own components.
 */
export function ScreenshotGallery({ shots }: { shots: Screenshot[] }) {
  return (
    <Stagger className="grid gap-8 sm:grid-cols-2">
      {shots.map((s) => (
        <StaggerItem key={s.src}>
          <figure className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e10]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </span>
              <span className="ml-1 truncate font-mono text-xs text-zinc-500">{s.label}</span>
            </div>
            {/* Plain img: static asset in /public, no layout shift concerns. */}
            <img src={s.src} alt={s.alt} className="block w-full" loading="lazy" />
          </figure>
          <figcaption className="mt-3 text-sm leading-relaxed text-zinc-400">
            {s.caption}
          </figcaption>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
