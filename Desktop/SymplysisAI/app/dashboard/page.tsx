import Link from "next/link";
import { ArrowUpRight, TrendingUp, FileText, Image as ImageIcon, Mic, MoreHorizontal, Sparkles } from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const kpis = [
  { label: "Generations this month", value: "127", change: "+24%", trend: "up" },
  { label: "Active campaigns", value: "8", change: "+2", trend: "up" },
  { label: "Avg. time to ship", value: "18m", change: "−42%", trend: "down" },
  { label: "Brand kits", value: "3", change: "0", trend: "flat" },
];

const recent = [
  { name: "Hydra Serum landing page", brand: "Aurora Skincare", type: "Landing page", status: "Ready", when: "2h ago" },
  { name: "Q4 winter campaign — Meta ads", brand: "Aurora Skincare", type: "Ad copy", status: "Ready", when: "Yesterday" },
  { name: "Vellum scarf — UGC voiceover", brand: "Vellum", type: "Voiceover", status: "Generating", when: "Yesterday" },
  { name: "Northwind protein — poster set", brand: "Northwind", type: "Poster", status: "Draft", when: "2 days ago" },
  { name: "Aurora — welcome email sequence", brand: "Aurora Skincare", type: "Email", status: "Ready", when: "3 days ago" },
];

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Overview" />
      <main style={{ padding: "2rem 1.5rem 4rem", maxWidth: 1280, width: "100%" }}>
        {/* Greeting */}
        <div className="row row-between" style={{ marginBottom: "var(--space-8)", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)" }}>Good afternoon, Layla 👋</h2>
            <p style={{ marginTop: "0.375rem" }}>Pick up where you left off, or start something new.</p>
          </div>
          <Link href="/dashboard/generate">
            <Button variant="primary" leadingIcon={<Sparkles size={14} />}>New generation</Button>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid-auto" style={{ ["--min" as never]: "220px", marginBottom: "var(--space-10)" }}>
          {kpis.map((k) => (
            <Card key={k.label} hover>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", fontWeight: 500, letterSpacing: "0.02em" }}>{k.label}</div>
              <div className="row" style={{ marginTop: "0.5rem", gap: "0.625rem", alignItems: "baseline" }}>
                <span style={{ fontSize: "var(--text-3xl)", fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>{k.value}</span>
                <span style={{
                  fontSize: "var(--text-xs)", fontWeight: 600,
                  color: k.trend === "up" ? "var(--color-success)" : k.trend === "down" ? "var(--color-success)" : "var(--color-text-tertiary)",
                  display: "inline-flex", alignItems: "center", gap: 2,
                }}>
                  <TrendingUp size={12} style={{ transform: k.trend === "down" ? "rotate(180deg)" : undefined }} /> {k.change}
                </span>
              </div>
              <Sparkline />
            </Card>
          ))}
        </div>

        {/* Two-up: recent + quick start */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }} className="dash-cols">
          {/* Recent generations */}
          <Card style={{ padding: 0 }}>
            <div className="row row-between" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border-subtle)" }}>
              <div>
                <h3 style={{ fontSize: "var(--text-base)" }}>Recent generations</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 2 }}>Your last 5 projects across brands</p>
              </div>
              <Link href="/dashboard/history" style={{ fontSize: "var(--text-sm)", color: "var(--brand)", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <div>
              {recent.map((r, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto auto auto",
                  gap: "1rem", alignItems: "center",
                  padding: "0.875rem 1.5rem",
                  borderBottom: i < recent.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                  transition: "background var(--duration-base)",
                }} className="recent-row">
                  <span style={{
                    width: 36, height: 36, borderRadius: "var(--radius-md)",
                    background: "var(--brand-soft)", color: "var(--brand-active)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {r.type === "Voiceover" ? <Mic size={16} /> : r.type === "Poster" ? <ImageIcon size={16} /> : <FileText size={16} />}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{r.brand} · {r.type}</div>
                  </div>
                  <Badge tone={r.status === "Ready" ? "success" : r.status === "Generating" ? "info" : "neutral"}>{r.status}</Badge>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{r.when}</span>
                  <button aria-label="More" className="btn btn-ghost btn-icon btn-sm"><MoreHorizontal size={16} /></button>
                </div>
              ))}
            </div>
            <style>{`.recent-row:hover { background: var(--color-surface-hover); }`}</style>
          </Card>

          {/* Quick start */}
          <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
            <Card>
              <h3 style={{ fontSize: "var(--text-base)", marginBottom: "0.375rem" }}>Quick start</h3>
              <p style={{ fontSize: "var(--text-sm)", marginBottom: "1rem" }}>Drop a product image and let SymplysisAI build the rest.</p>
              <Link href="/dashboard/generate"><Button variant="brand" size="md" style={{ width: "100%" }} leadingIcon={<Sparkles size={14} />}>Start generating</Button></Link>
            </Card>

            <Card>
              <h3 style={{ fontSize: "var(--text-base)", marginBottom: "0.75rem" }}>Tip of the day</h3>
              <p style={{ fontSize: "var(--text-sm)" }}>
                Lock your brand voice in <strong>Brand kits</strong> before generating — every asset will inherit tone, palette, and audience automatically.
              </p>
            </Card>

            <Card style={{ background: "linear-gradient(135deg, oklch(20% 0.06 264), oklch(15% 0.06 290))", color: "white", borderColor: "transparent" }}>
              <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(80% 0.02 270)", fontWeight: 600 }}>Pro tip</span>
              <h3 style={{ color: "white", fontSize: "var(--text-base)", marginTop: 6, marginBottom: 8 }}>Try section regeneration</h3>
              <p style={{ color: "oklch(85% 0.02 270)", fontSize: "var(--text-sm)", marginBottom: "1rem" }}>Refine just the hero or just the FAQ — no need to regenerate the whole page.</p>
              <Button size="sm" style={{ background: "white", color: "oklch(20% 0.06 264)" }}>Try it</Button>
            </Card>
          </div>
        </div>

        <style>{`@media (max-width: 1024px) { .dash-cols { grid-template-columns: 1fr !important; } }`}</style>
      </main>
    </>
  );
}

function Sparkline() {
  return (
    <svg width="100%" height="36" viewBox="0 0 200 36" style={{ marginTop: "0.75rem" }} aria-hidden="true">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,28 L20,22 L40,26 L60,18 L80,20 L100,12 L120,16 L140,8 L160,12 L180,4 L200,6 L200,36 L0,36 Z" fill="url(#spark)" />
      <path d="M0,28 L20,22 L40,26 L60,18 L80,20 L100,12 L120,16 L140,8 L160,12 L180,4 L200,6" fill="none" stroke="var(--brand)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
