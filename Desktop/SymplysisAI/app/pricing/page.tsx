import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { PricingTable } from "@/components/marketing/PricingTable";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <section style={{ paddingTop: "calc(var(--section-y) + 1rem)", paddingBottom: "var(--section-y)", position: "relative" }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, zIndex: -1,
            background: "radial-gradient(60% 50% at 50% 0%, oklch(94% 0.06 264 / 0.7), transparent 70%)",
          }} />
          <div className="container" style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
            <span className="eyebrow">Pricing</span>
            <h1 style={{ marginTop: "var(--space-4)", maxWidth: "20ch", marginInline: "auto" }}>
              One source of truth. Every asset your campaign needs.
            </h1>
            <p style={{ fontSize: "var(--text-lg)", maxWidth: "55ch", margin: "var(--space-6) auto 0" }}>
              Start free. Upgrade when you need more output, more brands, or more team seats. Cancel anytime.
            </p>
          </div>
          <div className="container">
            <PricingTable />
          </div>
        </section>

        <section className="section" style={{ background: "var(--color-bg-secondary)" }}>
          <div className="container container-narrow" style={{ textAlign: "center" }}>
            <h2>Compare every feature</h2>
            <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-base)" }}>
              See what's included in each plan.
            </p>
          </div>
          <div className="container" style={{ marginTop: "var(--space-10)" }}>
            <ComparisonTable />
          </div>
        </section>

        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function ComparisonTable() {
  const rows: { group: string; items: { feat: string; vals: (string | boolean)[] }[] }[] = [
    {
      group: "Generation",
      items: [
        { feat: "Generations / month", vals: ["20", "Unlimited", "Unlimited"] },
        { feat: "Landing pages", vals: [true, true, true] },
        { feat: "Ad copy variants", vals: [true, true, true] },
        { feat: "Voiceover scripts + audio", vals: [false, true, true] },
        { feat: "Posters", vals: [false, true, true] },
        { feat: "Email sequences", vals: [false, true, true] },
        { feat: "UGC scripts", vals: [false, false, true] },
      ],
    },
    {
      group: "Brand & workflow",
      items: [
        { feat: "Brand kits", vals: ["1", "5", "Unlimited"] },
        { feat: "Languages", vals: ["4", "30+", "30+ + custom"] },
        { feat: "Arabic / RTL", vals: [false, true, true] },
        { feat: "Section regeneration", vals: [false, true, true] },
        { feat: "Project history", vals: [true, true, true] },
        { feat: "Duplicate & adapt projects", vals: [false, true, true] },
      ],
    },
    {
      group: "Team & security",
      items: [
        { feat: "Seats", vals: ["1", "10", "Unlimited"] },
        { feat: "SSO (SAML)", vals: [false, false, true] },
        { feat: "Role-based access", vals: [false, false, true] },
        { feat: "DPA", vals: [false, false, true] },
        { feat: "Dedicated success manager", vals: [false, false, true] },
      ],
    },
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr style={{ background: "var(--color-bg-secondary)" }}>
              <th style={{ ...thStyle, width: "40%" }}></th>
              {["Starter", "Pro", "Enterprise"].map((p) => (
                <th key={p} style={{ ...thStyle, textAlign: "center" }}>
                  <div style={{ fontSize: "var(--text-base)", fontWeight: 600, color: "var(--color-text-primary)" }}>{p}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <>
                <tr key={g.group}>
                  <td colSpan={4} style={{ padding: "1rem 1.25rem", fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)", background: "var(--color-bg-secondary)", borderTop: "1px solid var(--color-border-subtle)" }}>
                    {g.group}
                  </td>
                </tr>
                {g.items.map((it) => (
                  <tr key={it.feat} style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
                    <td style={{ padding: "0.75rem 1.25rem", fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>{it.feat}</td>
                    {it.vals.map((v, i) => (
                      <td key={i} style={{ padding: "0.75rem 1.25rem", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                        {typeof v === "boolean" ? (
                          v ? <span style={{ color: "var(--brand)" }}>✓</span> : <span style={{ color: "var(--color-border-strong)" }}>—</span>
                        ) : v}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "1rem 1.25rem",
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  color: "var(--color-text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
