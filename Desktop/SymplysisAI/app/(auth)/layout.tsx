import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="auth-grid">
      <aside style={{
        position: "relative",
        padding: "2.5rem",
        background: "linear-gradient(135deg, oklch(20% 0.06 264) 0%, oklch(15% 0.06 290) 100%)",
        color: "white",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        overflow: "hidden",
      }} className="auth-brand">
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(60% 50% at 30% 20%, oklch(60% 0.22 264 / 0.4), transparent 60%), radial-gradient(50% 50% at 80% 90%, oklch(60% 0.22 320 / 0.35), transparent 60%)",
        }} />
        <Link href="/" style={{ position: "relative", color: "white" }}>
          <Logo textColor="white" accentColor="white" />
        </Link>
        <div style={{ position: "relative", maxWidth: "36ch" }}>
          <p style={{ fontSize: "var(--text-xl)", lineHeight: 1.4, color: "white", fontWeight: 500 }}>
            “We launched 11 product pages in a week. Same brand voice across every one — that used to be impossible.”
          </p>
          <div style={{ marginTop: "1.25rem", fontSize: "var(--text-sm)", color: "oklch(85% 0.02 270)" }}>
            <strong style={{ color: "white", fontWeight: 600 }}>Layla Rahman</strong> · Head of Growth, Aurora Skincare
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: "1.5rem", fontSize: "var(--text-xs)", color: "oklch(80% 0.02 270)" }}>
          <span>SOC 2 ready</span><span>GDPR compliant</span><span>EU + US hosting</span>
        </div>
      </aside>

      <main style={{ display: "grid", placeItems: "center", padding: "2.5rem 1.5rem" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div
            style={{
              padding: "0.5rem",
              background: "linear-gradient(180deg, oklch(95% 0.04 264 / 0.7), transparent)",
              borderRadius: "var(--radius-2xl)",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div
              style={{
                padding: "clamp(1.5rem, 4vw, 2rem)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "calc(var(--radius-2xl) - 4px)",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 860px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-brand { display: none !important; }
        }
      `}</style>
    </div>
  );
}
