"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const items = [
  { q: "Do I need a real product photo?", a: "Yes — that's what makes the output feel genuine. We analyze the actual packshot for palette, category, and positioning. Stock photos work, but real images are dramatically better." },
  { q: "Which languages and markets are supported?", a: "30+ languages including full Arabic with RTL layout. Tone is adapted per market — not just translated." },
  { q: "Can I regenerate just one section instead of the whole page?", a: "Yes. Every section supports targeted regeneration with guidance like \"more premium\" or \"stronger CTA for COD buyers.\"" },
  { q: "Does it integrate with Shopify, Webflow, etc.?", a: "Export as clean HTML or copy individual sections. Native publishing integrations are on the roadmap for Pro and Enterprise." },
  { q: "What about brand consistency across assets?", a: "Brand kits keep voice, tone, palette, and audience locked across landing pages, ad copy, voiceovers, and posters — so every output sounds aligned." },
  { q: "Can I cancel anytime?", a: "Yes. Monthly plans cancel at the end of the period. Annual plans are prorated. No surprises." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section">
      <div className="container container-narrow">
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <span className="badge badge-brand badge-plain">FAQ</span>
          <h2 style={{ marginTop: "var(--space-4)" }}>Common questions</h2>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "1rem", padding: "1.25rem 1.5rem", fontSize: "var(--text-base)", fontWeight: 600,
                  }}
                >
                  {it.q}
                  <span style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 400 : 0, overflow: "hidden",
                    transition: "max-height var(--duration-slow) var(--ease-standard)",
                  }}
                >
                  <p style={{ padding: "0 1.5rem 1.25rem", fontSize: "var(--text-sm)" }}>{it.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
