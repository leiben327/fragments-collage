/**
 * Shared “archival table” atmosphere: warm paper wash, film grain, faint ruled lines.
 * Used behind Memory Fragments wall and Random Fragment Challenge.
 */
export function ArchivalTableBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_12%_25%,rgba(232,212,207,0.38),transparent_52%),radial-gradient(ellipse_60%_50%_at_92%_78%,rgba(197,203,184,0.26),transparent_48%),linear-gradient(178deg,#faf7f2_0%,var(--paper)_42%,#e8e0d4_100%)]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply max-lg:opacity-[0.038] max-sm:opacity-[0.028] [background-image:url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E')]"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply max-lg:opacity-[0.055] max-sm:opacity-[0.045] [background-image:repeating-linear-gradient(-11deg,transparent,transparent_6px,rgba(61,56,50,0.035)_6px,rgba(61,56,50,0.035)_7px)]"
        aria-hidden
      />
    </>
  );
}
