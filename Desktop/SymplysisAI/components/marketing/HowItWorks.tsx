const steps = [
  { n: "01", title: "Upload your product", body: "A real packshot or product photo. We extract palette, category, style, and likely positioning." },
  { n: "02", title: "Confirm brand context", body: "Voice, audience, market, language. Optional but powerful — the more we know, the more aligned the output." },
  { n: "03", title: "Generate the campaign", body: "Landing page, ad copy, voiceover, poster — all composed from one source of truth in seconds." },
  { n: "04", title: "Refine and ship", body: "Regenerate single sections, hide what you don't need, and export final assets ready for launch." },
];

export function HowItWorks() {
  return (
    <section id="how" className="section" style={{ background: "var(--color-bg-secondary)" }}>
      <div className="container">
        <div style={{ display: "grid", gap: "var(--space-12)", gridTemplateColumns: "1fr 1.4fr", alignItems: "start" }} className="how-grid">
          <div style={{ position: "sticky", top: 96 }}>
            <span className="badge badge-brand badge-plain">How it works</span>
            <h2 style={{ marginTop: "var(--space-4)" }}>Four steps from product to campaign</h2>
            <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-lg)" }}>
              No blank page. No jumping between tools. A guided workflow that compresses launch time
              from days to minutes.
            </p>
          </div>

          <ol role="list" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", listStyle: "none", padding: 0, margin: 0 }}>
            {steps.map((s) => (
              <li key={s.n} className="card" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--space-5)", alignItems: "start" }}>
                <span style={{
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "var(--text-sm)",
                  color: "var(--brand-active)",
                  background: "var(--brand-soft)",
                  padding: "0.375rem 0.625rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600,
                }}>{s.n}</span>
                <div>
                  <h3 style={{ fontSize: "var(--text-xl)" }}>{s.title}</h3>
                  <p style={{ marginTop: "var(--space-2)" }}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <style>{`@media (max-width: 860px) { .how-grid { grid-template-columns: 1fr !important; } .how-grid > div:first-child { position: static !important; } }`}</style>
      </div>
    </section>
  );
}
