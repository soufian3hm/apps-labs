"use client";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const tiers = [
  {
    name: "Starter",
    monthly: 19,
    annual: 15,
    blurb: "For founders shipping their first product pages.",
    cta: "Start free",
    features: ["20 generations / month", "Landing pages + ad copy", "1 brand kit", "English + 3 languages", "Community support"],
  },
  {
    name: "Pro",
    monthly: 49,
    annual: 39,
    blurb: "For operators running multiple campaigns at once.",
    cta: "Start 14-day trial",
    features: ["Unlimited generations", "All asset types — voiceover, posters, email", "5 brand kits", "All 30+ languages incl. Arabic / RTL", "Section regeneration with guidance", "Project history + duplication", "Priority support"],
    highlight: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    annual: null,
    blurb: "For agencies and brands with complex workflows.",
    cta: "Contact sales",
    features: ["Everything in Pro", "Unlimited brand kits + team seats", "SSO + role-based access", "Custom model fine-tuning", "Dedicated success manager", "SLA + DPA"],
  },
];

export function PricingTable() {
  const [annual, setAnnual] = useState(true);
  return (
    <div>
      <div className="row" style={{ justifyContent: "center", marginBottom: "var(--space-10)", gap: "0.75rem" }}>
        <span style={{ fontSize: "var(--text-sm)", color: !annual ? "var(--color-text-primary)" : "var(--color-text-tertiary)", fontWeight: 500 }}>Monthly</span>
        <button
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((a) => !a)}
          style={{
            position: "relative",
            width: 44, height: 24, borderRadius: 999,
            background: annual ? "var(--brand)" : "var(--color-border-strong)",
            transition: "background var(--duration-base) var(--ease-standard)",
          }}
        >
          <span style={{
            position: "absolute", top: 2, left: annual ? 22 : 2,
            width: 20, height: 20, borderRadius: "50%", background: "white",
            transition: "left var(--duration-base) var(--ease-spring)", boxShadow: "var(--shadow-sm)",
          }} />
        </button>
        <span style={{ fontSize: "var(--text-sm)", color: annual ? "var(--color-text-primary)" : "var(--color-text-tertiary)", fontWeight: 500 }}>
          Annual <span className="badge badge-brand badge-plain" style={{ marginLeft: 6 }}>Save 20%</span>
        </span>
      </div>

      <div style={{ display: "grid", gap: "var(--space-6)", gridTemplateColumns: "repeat(3, 1fr)" }} className="pricing-grid">
        {tiers.map((t) => (
          <div
            key={t.name}
            className="card"
            style={{
              position: "relative",
              borderColor: t.highlight ? "var(--brand)" : undefined,
              borderWidth: t.highlight ? 2 : 1,
              boxShadow: t.highlight ? "0 24px 48px oklch(58% 0.20 264 / 0.16), var(--shadow-md)" : undefined,
              padding: "var(--space-8)",
              display: "flex", flexDirection: "column", gap: "var(--space-5)",
            }}
          >
            {t.highlight && (
              <span style={{
                position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                background: "var(--brand)", color: "white",
                padding: "0.25rem 0.75rem", borderRadius: 999, fontSize: "var(--text-xs)", fontWeight: 600,
              }}>Most popular</span>
            )}

            <div>
              <div style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>{t.name}</div>
              <p style={{ marginTop: "0.375rem", fontSize: "var(--text-sm)" }}>{t.blurb}</p>
            </div>

            <div>
              {t.monthly === null ? (
                <div style={{ fontSize: "var(--text-3xl)", fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>Custom</div>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
                  <span style={{ fontSize: "var(--text-4xl)", fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>
                    ${annual ? t.annual : t.monthly}
                  </span>
                  <span style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>/ month</span>
                </div>
              )}
              {t.monthly !== null && annual && (
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 4 }}>
                  Billed ${t.annual! * 12} annually
                </div>
              )}
            </div>

            <Link href={t.name === "Enterprise" ? "#" : "/signup"}>
              <Button variant={t.highlight ? "brand" : "secondary"} size="lg" style={{ width: "100%" }}>
                {t.cta}
              </Button>
            </Link>

            <ul role="list" style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "var(--space-2)" }}>
              {t.features.map((f) => (
                <li key={f} style={{ display: "flex", gap: "0.5rem", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                  <Check size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 920px) { .pricing-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
