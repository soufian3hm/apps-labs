import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}>
      <div>
        <Link href="/"><Logo /></Link>
        <div style={{ fontSize: "clamp(4rem, 12vw, 8rem)", fontWeight: 800, letterSpacing: "var(--tracking-tight)", lineHeight: 1, marginTop: "var(--space-8)", color: "var(--brand)" }}>
          404
        </div>
        <h1 style={{ fontSize: "var(--text-2xl)", marginTop: "var(--space-4)" }}>This page wandered off</h1>
        <p style={{ marginTop: "var(--space-3)", maxWidth: "40ch", marginInline: "auto" }}>
          The link is broken or the page was moved. Let's get you somewhere useful.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: 8, marginTop: "var(--space-6)" }}>
          <Link href="/"><Button variant="primary">Back to home</Button></Link>
          <Link href="/dashboard"><Button variant="secondary">Go to dashboard</Button></Link>
        </div>
      </div>
    </main>
  );
}
