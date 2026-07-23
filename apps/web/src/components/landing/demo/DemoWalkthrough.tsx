'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SCENES } from './scenes';
import { track } from '@/lib/analytics/track';
import { EVENTS } from '@/lib/analytics/config';

const SCENE_MS = 4200;

/**
 * Auto-advancing, staged product story. It plays through the full value loop —
 * idea → shipped → measured results — as a lightweight animated mock. Users can
 * click any step to jump; hovering pauses. A real screen recording can replace
 * this later by rendering a <video> in place of the scene panel.
 */
export function DemoWalkthrough() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const startedRef = useRef(false);

  const go = useCallback((index: number) => {
    const next = ((index % SCENES.length) + SCENES.length) % SCENES.length;
    setActive(next);
  }, []);

  // Auto-advance timer.
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(active + 1), SCENE_MS);
    return () => clearTimeout(t);
  }, [active, paused, go]);

  // Analytics: first play, per-scene, and completion.
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      track(EVENTS.DEMO_STARTED);
    }
    const scene = SCENES[active];
    if (scene) track(EVENTS.DEMO_SCENE_VIEWED, { scene: scene.id, index: active });
    if (active === SCENES.length - 1) track(EVENTS.DEMO_COMPLETED);
  }, [active]);

  const scene = SCENES[active];
  if (!scene) return null;

  return (
    <div
      className="mx-auto max-w-5xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Step rail — an even grid (2×4 / 4×2) so it never orphans a last item */}
      <ol className="mx-auto mb-6 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
        {SCENES.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === active}
              className={`w-full truncate rounded-lg px-3 py-1.5 text-center text-xs font-medium transition ${
                i === active
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
            >
              {i + 1}. {s.label}
            </button>
          </li>
        ))}
      </ol>

      {/* Stage — browser-chrome framing around the active scene */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-950">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 truncate text-xs text-neutral-400">
            app.ourai.dev — {scene.label}
          </span>
        </div>
        <div className="grid gap-0 p-5 sm:min-h-[320px]">
          <div key={scene.id}>{scene.render()}</div>
        </div>
      </div>

      {/* Caption + progress */}
      <div className="mt-4">
        <div className="flex gap-1">
          {SCENES.map((s, i) => (
            <div
              key={s.id}
              className="h-1 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
            >
              <div
                className={`h-full rounded-full bg-neutral-900 dark:bg-white ${
                  i < active ? 'w-full' : i === active ? 'w-full' : 'w-0'
                }`}
                style={
                  i === active && !paused
                    ? { animation: `ourai-grow ${SCENE_MS}ms linear` }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-white">
            {active + 1}. {scene.label}.
          </span>{' '}
          {scene.caption}
        </p>
      </div>
    </div>
  );
}
