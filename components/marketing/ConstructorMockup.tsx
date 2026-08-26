/** A lightweight illustrative mockup of the canvas editor (selection handles,
 * a floating toolbar) — deliberately hand-drawn with CSS rather than a real
 * screenshot, so it can't go stale the next time the editor's UI changes. */
export default function ConstructorMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
      <div className="flex items-center gap-1.5 rounded-lg bg-stone-50 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-rose-300" />
        <span className="h-2 w-2 rounded-full bg-amber-300" />
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        <span className="ml-3 flex-1 rounded-full bg-white px-3 py-1 text-[0.65rem] text-stone-400">
          Playfair Display · 56 · Bold
        </span>
      </div>

      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-[#3C0F1A] to-[#2a0a12]">
        <div className="absolute inset-6 flex flex-col justify-center gap-3">
          <p
            className="text-2xl text-[#CBA25B]"
            style={{ fontFamily: "var(--font-playfair-display), Georgia, serif" }}
          >
            Anna &amp; Igor
          </p>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#F2E4D8]/70">
            September 12, 2026
          </p>
        </div>

        <div className="absolute left-5 top-8 h-14 w-56 rounded border-2 border-rose-500/90">
          <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-rose-500 bg-white" />
          <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-rose-500 bg-white" />
          <span className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full border-2 border-rose-500 bg-white" />
          <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-rose-500 bg-white" />
          <span className="absolute -top-6 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-rose-500 bg-white" />
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-stone-400">
        Drag, resize, and rotate anything — your text, your photos, your layout
      </p>
    </div>
  );
}
