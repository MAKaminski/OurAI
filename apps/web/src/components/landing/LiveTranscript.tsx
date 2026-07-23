/**
 * The signature visual: a real OurAI session rendered in HTML (no image, no
 * abstract render). Blue = humans, violet = agents, green = shipped — the whole
 * brand thesis in one panel. CSP-safe.
 */
export function LiveTranscript({ className = '' }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-[#0e0e10] shadow-2xl ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-xs text-zinc-500">
          app.ourai.dev — session · saved-card-checkout
        </span>
      </div>
      <div className="space-y-2.5 p-4 font-mono text-[13px] leading-relaxed">
        <p className="text-blue-400">
          <span className="text-zinc-600">product ·</span> ship one-click checkout with saved cards
        </p>
        <p className="text-violet-300">
          <span className="text-zinc-600">agent ·</span> reading{' '}
          <span className="text-zinc-400">checkout.ts</span>, planning 3 edits…
        </p>
        <p className="text-violet-300">
          <span className="text-zinc-600">agent ·</span> editing{' '}
          <span className="text-zinc-400">payment/vault.ts</span>
          <span className="ourai-caret ml-1 inline-block w-1.5 translate-y-0.5 bg-violet-300">
            &nbsp;
          </span>
        </p>
        <p className="text-blue-400">
          <span className="text-zinc-600">dev ·</span> keep it PCI-safe — use the provider vault
        </p>
        <p className="text-zinc-500">
          <span className="text-zinc-600">diff ·</span> +142 −18 across 4 files
        </p>
        <p className="text-emerald-400">
          <span className="text-zinc-600">✓</span> human approved · PR #482 merged
        </p>
      </div>
    </div>
  );
}
