export function SocialProof() {
  const logos = ["AURORA", "NORTHWIND", "LUMEN", "Vellum", "OBSIDIAN", "Helix"];
  return (
    <section style={{ paddingBlock: "var(--space-12)", borderTop: "1px solid var(--color-border-subtle)", borderBottom: "1px solid var(--color-border-subtle)" }}>
      <div className="container" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "var(--text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginBottom: "var(--space-6)", fontWeight: 500 }}>
          Trusted by 4,000+ brands and operators
        </p>
        <div style={{
          display: "grid", gap: "var(--space-8)", alignItems: "center",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          opacity: 0.55, filter: "grayscale(1)",
        }}>
          {logos.map((l) => (
            <span key={l} style={{ fontFamily: "ui-serif, Georgia, serif", fontSize: "var(--text-lg)", letterSpacing: "0.12em", fontWeight: 600 }}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
