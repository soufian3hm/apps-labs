const quotes = [
  { q: "We launched 11 product pages in a week. Same brand voice across every one — that used to be impossible without a copywriter on retainer.", n: "Layla Rahman", r: "Head of Growth, Aurora Skincare" },
  { q: "The section regeneration is the killer feature. I don't want a magic button — I want surgical control. Symplysis gives me both.", n: "Marc Delauney", r: "Performance lead, Northwind DTC" },
  { q: "Arabic + RTL out of the box, with tone that actually sells in the Gulf. Every other tool we tried sounded like a translated brochure.", n: "Yasmin Al-Hamdi", r: "Founder, Vellum" },
  { q: "It's the closest thing to having a junior strategist, copywriter, and landing-page builder on call.", n: "Dean Park", r: "CMO, Helix Commerce" },
];

export function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "60ch", margin: "0 auto var(--space-12)" }}>
          <span className="badge badge-brand badge-plain">From operators</span>
          <h2 style={{ marginTop: "var(--space-4)" }}>Built for people who actually launch things</h2>
        </div>
        <div className="grid-auto" style={{ ["--min" as never]: "320px" }}>
          {quotes.map((t, i) => (
            <figure key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", margin: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3a2 2 0 0 1-2 2H4M19 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3a2 2 0 0 1-2 2h-1" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <blockquote style={{ margin: 0, fontSize: "var(--text-base)", color: "var(--color-text-primary)", lineHeight: 1.55 }}>
                “{t.q}”
              </blockquote>
              <figcaption className="row" style={{ gap: "0.75rem", marginTop: "auto" }}>
                <span className="avatar" style={{ background: `oklch(85% 0.10 ${(i + 1) * 80})` }}>{t.n[0]}</span>
                <span>
                  <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600 }}>{t.n}</span>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{t.r}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
