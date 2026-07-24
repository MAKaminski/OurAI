import { MonoPanel } from '@/components/product/FeatureBlock';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';

type Line = [who: string, text: string, color: 'blue' | 'violet' | 'green' | 'zinc'];

/**
 * The "pictures" format: a captioned sequence of product screens. These are
 * illustrative HTML mockups (not real screenshots), so the guide is honest
 * while still showing the flow step by step.
 */
export function ExampleGallery({
  screens,
}: {
  screens: { caption: string; label: string; lines: Line[] }[];
}) {
  return (
    <Stagger className="grid gap-6 sm:grid-cols-2">
      {screens.map((s, i) => (
        <StaggerItem key={i}>
          <MonoPanel label={s.label} lines={s.lines} />
          <p className="mt-3 text-sm text-zinc-400">
            <span className="font-mono text-xs text-zinc-600">{i + 1}. </span>
            {s.caption}
          </p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
