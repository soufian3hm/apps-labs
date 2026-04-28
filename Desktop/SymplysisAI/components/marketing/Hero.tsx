import Link from "next/link";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section style={{ position: "relative", paddingTop: "calc(var(--section-y) + 1rem)", paddingBottom: "var(--section-y)", overflow: "hidden" }}>
      {/* Background mesh */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: -1,
        background:
          "radial-gradient(60% 50% at 20% 10%, oklch(94% 0.08 264 / 0.7), transparent 60%)," +
          "radial-gradient(50% 50% at 85% 0%, oklch(94% 0.07 320 / 0.6), transparent 65%)," +
          "radial-gradient(60% 60% at 50% 100%, oklch(96% 0.05 200 / 0.5), transparent 70%)",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: -1, opacity: 0.4,
        backgroundImage: "linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, black, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, black, transparent 80%)",
      }} />

      <div className="container" style={{ textAlign: "center" }}>
        <div className="row" style={{ justifyContent: "center", marginBottom: "var(--space-6)" }}>
          <span className="eyebrow">
            <Sparkles size={12} style={{ color: "var(--brand)" }} />
            New — Section regeneration with brand context
          </span>
        </div>

        <h1 className="text-balance" style={{ maxWidth: "18ch", margin: "0 auto var(--space-6)" }}>
          Upload your product. Launch smarter marketing.
        </h1>

        <p className="text-pretty" style={{
          fontSize: "var(--text-lg)", color: "var(--color-text-secondary)",
          maxWidth: "58ch", margin: "0 auto var(--space-10)",
        }}>
          SymplysisAI turns a single product image into a full campaign — landing pages,
          ad copy, voiceovers, and posters — all aligned to your brand and ready to ship.
        </p>

        <div className="row" style={{ justifyContent: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link href="/signup">
            <Button variant="primary" size="lg" trailingIcon={<ArrowRight size={16} />}>
              Start free
            </Button>
          </Link>
          <Button variant="secondary" size="lg" leadingIcon={<Play size={14} />}>
            Watch the 90s demo
          </Button>
        </div>

        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: "var(--space-4)" }}>
          No credit card required • Cancel anytime
        </p>

        {/* Product visual mock */}
        <div style={{
          marginTop: "var(--space-16)",
          maxWidth: 1080,
          marginInline: "auto",
          padding: "0.5rem",
          background: "linear-gradient(180deg, oklch(95% 0.04 264 / 0.6), transparent)",
          borderRadius: "var(--radius-2xl)",
          border: "1px solid var(--color-border-subtle)",
          boxShadow: "var(--shadow-xl)",
        }}>
          <div style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "calc(var(--radius-2xl) - 4px)",
            overflow: "hidden",
          }}>
            <HeroMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 460 }} className="hero-mock">
      <aside style={{ borderRight: "1px solid var(--color-border-subtle)", padding: "1rem", background: "var(--color-bg-secondary)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: "1rem" }}>
          {["#ff6058", "#ffbd2d", "#28c93f"].map((c) => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Workspace</div>
        {["Generator", "History", "Brand kits", "Settings"].map((l, i) => (
          <div key={l} style={{
            padding: "0.5rem 0.75rem", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)",
            background: i === 0 ? "var(--color-surface-selected)" : "transparent",
            color: i === 0 ? "var(--brand-active)" : "var(--color-text-secondary)",
            fontWeight: i === 0 ? 600 : 500, marginBottom: 4,
          }}>{l}</div>
        ))}
      </aside>
      <div style={{ padding: "1.5rem" }}>
        <div className="row row-between" style={{ marginBottom: "1.25rem" }}>
          <div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>Project</div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-base)" }}>Aurora Skincare — Hydra Serum</div>
          </div>
          <span className="badge badge-success">Ready</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="hero-grid">
          {[
            { t: "Landing page", s: "8 sections" },
            { t: "Ad copy", s: "12 variants" },
            { t: "Voiceover", s: "30s • EN" },
            { t: "Poster", s: "1080×1350" },
            { t: "Email", s: "3 sequences" },
            { t: "UGC script", s: "Coming soon" },
          ].map((c, i) => (
            <div key={c.t} style={{
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-md)", padding: "0.875rem",
              background: i === 0 ? "var(--brand-soft)" : "var(--color-bg-elevated)",
            }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{c.t}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 2 }}>{c.s}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1.25rem", padding: "1rem", border: "1px dashed var(--color-border-default)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, oklch(85% 0.10 200), oklch(80% 0.12 320))" }} />
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            <div style={{ color: "var(--color-text-primary)", fontWeight: 600, fontSize: "var(--text-sm)" }}>hydra-serum-packshot.png</div>
            Analyzed • Detected: Skincare · Premium · Cool palette
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .hero-mock { grid-template-columns: 1fr !important; }
          .hero-mock aside { display: none; }
          .hero-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
