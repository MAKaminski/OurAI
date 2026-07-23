/**
 * A single vision statement with an accent border. Deliberately framed as the
 * founding thesis (not a fabricated customer quote) for a pre-launch product.
 */
export function Testimonial() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <figure className="relative pl-8">
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 to-violet-500"
        />
        <blockquote className="text-balance text-2xl font-medium leading-snug tracking-[-0.01em] text-zinc-100 sm:text-3xl">
          &ldquo;Copilots made individuals faster. The next unlock is watching a{' '}
          <span className="text-blue-400">team</span> and a fleet of{' '}
          <span className="text-violet-300">agents</span> move an idea to shipped —{' '}
          <span className="text-zinc-50">together, in one room</span>.&rdquo;
        </blockquote>
        <figcaption className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">
          The OurAI thesis
        </figcaption>
      </figure>
    </section>
  );
}
