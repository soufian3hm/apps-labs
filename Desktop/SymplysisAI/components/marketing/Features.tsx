import { Image as ImageIcon, Layers, Wand2, Globe, History, Shapes } from "lucide-react";

const features = [
  { icon: ImageIcon, title: "Starts from a real product image", body: "Upload a packshot. We analyze visual identity, palette, category, and positioning — then build everything around it." },
  { icon: Layers,    title: "Full landing page structure", body: "Hero, features, benefits, FAQ, reviews, guarantees, pricing, footer — composed to convert, not just to fill space." },
  { icon: Wand2,     title: "Section-level regeneration", body: "Refine any section with guidance like “make it more premium” or “stronger CTA for COD buyers.” Real iteration, not lottery generation." },
  { icon: Shapes,    title: "Multi-output campaign engine", body: "Landing pages, ad copy, voiceovers, posters — all from one source of truth so every asset sounds aligned." },
  { icon: Globe,     title: "Localized for real markets", body: "Multi-language with Arabic and full RTL support. Culturally adapted tone — not just machine translation." },
  { icon: History,   title: "Workspace, not a one-shot tool", body: "History, duplication, resumable projects. Marketers revisit campaigns — your tool should remember them." },
];

export function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "60ch", margin: "0 auto var(--space-12)" }}>
          <span className="badge badge-brand badge-plain">Why teams switch</span>
          <h2 style={{ marginTop: "var(--space-4)" }}>A creative operating system, not a prompt box</h2>
          <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-lg)" }}>
            Most brands don’t struggle for ideas. They struggle to turn ideas into polished, on-brand assets fast.
            SymplysisAI compresses that gap.
          </p>
        </div>

        <div className="grid-auto" style={{ ["--min" as never]: "300px" }}>
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card card-hover" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <span style={{
                width: 40, height: 40, borderRadius: "var(--radius-md)",
                background: "var(--brand-soft)", color: "var(--brand-active)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={20} />
              </span>
              <h3 style={{ fontSize: "var(--text-lg)" }}>{title}</h3>
              <p style={{ fontSize: "var(--text-sm)" }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
