'use client';

import { useEffect, useState } from 'react';

interface CountResponse {
  reveal: boolean;
  count?: number;
}

/**
 * Social-proof counter shown under the waitlist form. Renders nothing until the
 * server says it should be revealed (feature flag on + count ≥ threshold), so
 * early visitors never see a discouraging small number.
 */
export function WaitlistCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/waitlist/count')
      .then((r) => (r.ok ? (r.json() as Promise<CountResponse>) : null))
      .then((data) => {
        if (alive && data?.reveal && typeof data.count === 'number') setCount(data.count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="ourai-fade-up flex items-center justify-center gap-2 text-sm text-neutral-500">
      <span aria-hidden className="flex -space-x-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-5 w-5 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-violet-500 dark:border-neutral-950"
          />
        ))}
      </span>
      <span>
        <span className="font-semibold text-neutral-900 dark:text-white">
          {count.toLocaleString()}
        </span>{' '}
        people have already pre-registered
      </span>
    </p>
  );
}
