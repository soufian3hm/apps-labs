import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="section">
      <div className="container">
        <div style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-2xl)",
          padding: "clamp(2.5rem, 6vw, 5rem)",
          background: "linear-gradient(135deg, oklch(20% 0.06 264) 0%, oklch(15% 0.05 280) 100%)",
          color: "var(--color-text-inverse)",
          textAlign: "center",
        }}>
          <div aria-hidden="true" style={{
            position: "absolute", inset: 0, opacity: 0.5,
            background: "radial-gradient(60% 60% at 20% 20%, oklch(60% 0.22 264 / 0.5), transparent 60%), radial-gradient(50% 50% at 90% 80%, oklch(60% 0.22 320 / 0.4), transparent 60%)",
          }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ color: "white", maxWidth: "20ch", margin: "0 auto var(--space-4)" }}>
              From product to campaign in one guided system
            </h2>
            <p style={{ color: "oklch(85% 0.02 270)", maxWidth: "50ch", margin: "0 auto var(--space-8)", fontSize: "var(--text-lg)" }}>
              Stop staring at blank pages. Stop stitching tools together. Upload your product and ship a full campaign today.
            </p>
            <div className="row" style={{ justifyContent: "center", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link href="/signup">
                <Button variant="brand" size="xl" trailingIcon={<ArrowRight size={18} />}>
                  Start free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="xl" style={{ background: "oklch(100% 0 0 / 0.08)", color: "white", border: "1px solid oklch(100% 0 0 / 0.18)" }}>
                  See pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
