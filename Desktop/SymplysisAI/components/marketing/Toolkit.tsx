import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText, LayoutTemplate, Mic, PanelsTopLeft } from "lucide-react";
import { BRAND_LOGO_URL } from "@/lib/brand";

const tools = [
  {
    id: "ad-copy",
    icon: FileText,
    title: "Ad Copy",
    eyebrow: "Meta · Google · TikTok",
    body: "Framework-aware copy tuned to offer, network, and language, generated in batches instead of single shots.",
    bullets: ["Hook · Primary · Headline · CTA", "9 networks, 6 frameworks", "Per-run language override"],
    cta: "Open Ad Copy",
  },
  {
    id: "landing-page",
    icon: LayoutTemplate,
    title: "Landing Page",
    eyebrow: "Section-based system",
    body: "Hero, features, proof, pricing, and FAQ all share the same workspace memory, image context, and offer logic.",
    bullets: ["9 section templates", "Image + copy per section", "Export to HTML or Framer"],
    cta: "Open Landing Page",
  },
  {
    id: "voiceover",
    icon: Mic,
    title: "Voiceover",
    eyebrow: "Tone + pacing",
    body: "Spoken scripts that mirror workspace voice with narrative structure, ready for direct reads, UGC, and VSL production.",
    bullets: ["15s, 30s, 60s reads", "Energy + pacing dials", "UGC, VSL, direct reads"],
    cta: "Open Voiceover",
  },
  {
    id: "poster",
    icon: PanelsTopLeft,
    title: "Poster",
    eyebrow: "Launch creative",
    body: "Poster concepts for launches, bundles, and seasonal drops, always workspace-aligned and composed for handoff.",
    bullets: ["Composition blueprints", "Headline + supporting copy", "Ready to hand to design"],
    cta: "Open Poster",
  },
];

const wires = [
  { id: "ad-copy", path: "M500 340 C445 258 392 217 312 182" },
  { id: "landing-page", path: "M500 340 C440 420 392 472 312 514" },
  { id: "voiceover", path: "M500 340 C560 258 612 216 692 182" },
  { id: "poster", path: "M500 340 C560 420 612 472 692 514" },
];

export function Toolkit() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "62ch", margin: "0 auto var(--space-12)" }}>
          <span className="badge badge-brand badge-plain">The toolkit</span>
          <h2 style={{ marginTop: "var(--space-4)" }}>Four tools. One creative brain.</h2>
          <p style={{ marginTop: "var(--space-4)", fontSize: "var(--text-lg)" }}>
            Each tool is built for the surface it serves. All four read from the same workspace
            memory, offer catalog, and run history.
          </p>
        </div>

        <div
          style={{
            maxWidth: 1180,
            marginInline: "auto",
            padding: "0.5rem",
            background: "linear-gradient(180deg, oklch(95% 0.04 264 / 0.7), transparent)",
            borderRadius: "var(--radius-2xl)",
            border: "1px solid var(--color-border-subtle)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <div
            className="toolkit-shell"
            style={{
              position: "relative",
              minHeight: 760,
              padding: "clamp(1.25rem, 2.8vw, 2rem)",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "calc(var(--radius-2xl) - 4px)",
              overflow: "hidden",
              isolation: "isolate",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(40% 35% at 20% 20%, oklch(96% 0.04 264 / 0.9), transparent 60%)," +
                  "radial-gradient(40% 35% at 80% 20%, oklch(96% 0.04 320 / 0.7), transparent 60%)," +
                  "linear-gradient(to right, oklch(96% 0.003 270) 1px, transparent 1px)," +
                  "linear-gradient(to bottom, oklch(96% 0.003 270) 1px, transparent 1px)",
                backgroundSize: "auto, auto, 44px 44px, 44px 44px",
                opacity: 0.9,
              }}
            />

            <svg
              className="toolkit-wires"
              viewBox="0 0 1000 680"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
              <defs>
                <linearGradient id="toolkit-wire" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="oklch(74% 0.08 264 / 0.25)" />
                  <stop offset="48%" stopColor="oklch(58% 0.18 264 / 0.8)" />
                  <stop offset="100%" stopColor="oklch(72% 0.07 320 / 0.3)" />
                </linearGradient>
                <filter id="toolkit-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {wires.map((wire) => (
                <g key={wire.id}>
                  <path
                    d={wire.path}
                    fill="none"
                    stroke="oklch(86% 0.015 270)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={wire.path}
                    fill="none"
                    stroke="url(#toolkit-wire)"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeDasharray="4 10"
                  />
                </g>
              ))}

              {wires.flatMap((wire, index) => [
                <circle key={`${wire.id}-pulse-a`} r="4" fill="var(--brand)" filter="url(#toolkit-glow)">
                  <animateMotion
                    dur={`${4.8 + index * 0.5}s`}
                    repeatCount="indefinite"
                    path={wire.path}
                    begin={`-${index * 0.9}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur={`${4.8 + index * 0.5}s`}
                    repeatCount="indefinite"
                    begin={`-${index * 0.9}s`}
                  />
                </circle>,
                <circle key={`${wire.id}-pulse-b`} r="2.75" fill="oklch(66% 0.16 210)" filter="url(#toolkit-glow)">
                  <animateMotion
                    dur={`${5.4 + index * 0.45}s`}
                    repeatCount="indefinite"
                    path={wire.path}
                    begin={`-${1.6 + index * 0.7}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.95;0.95;0"
                    dur={`${5.4 + index * 0.45}s`}
                    repeatCount="indefinite"
                    begin={`-${1.6 + index * 0.7}s`}
                  />
                </circle>,
              ])}
            </svg>

            <div
              className="toolkit-hub"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 268,
                zIndex: 2,
              }}
            >
              <div
                style={{
                  padding: "0.5rem",
                  borderRadius: "var(--radius-2xl)",
                  background: "linear-gradient(180deg, oklch(96% 0.04 264), oklch(95% 0.02 270))",
                  border: "1px solid var(--color-border-subtle)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div
                  style={{
                    padding: "1.4rem",
                    borderRadius: "calc(var(--radius-2xl) - 4px)",
                    border: "1px solid var(--color-border-subtle)",
                    background: "linear-gradient(180deg, white, oklch(98% 0.002 270))",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      margin: "0 auto var(--space-4)",
                      borderRadius: "22px",
                      background: "linear-gradient(135deg, oklch(96% 0.04 264), white)",
                      border: "1px solid var(--color-border-subtle)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <Image src={BRAND_LOGO_URL} alt="SymplysisAI" width={40} height={40} unoptimized />
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                    Shared Core
                  </p>
                  <h3 style={{ fontSize: "var(--text-xl)", marginTop: "0.5rem" }}>Workspace Memory</h3>
                  <p style={{ marginTop: "0.625rem", fontSize: "var(--text-sm)" }}>
                    Offer catalog, run history, and shared context flow into every tool node.
                  </p>
                  <div
                    className="toolkit-hub-pills"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                      marginTop: "var(--space-5)",
                    }}
                  >
                    {["Memory", "Catalog", "History"].map((item) => (
                      <span
                        key={item}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "var(--radius-full)",
                          background: "var(--brand-soft)",
                          color: "var(--brand-active)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {tools.map(({ id, icon: Icon, title, eyebrow, body, bullets, cta }) => (
              <article
                key={id}
                className={`tool-node tool-node-${id}`}
                style={{
                  position: "absolute",
                  width: "min(31vw, 300px)",
                  zIndex: 3,
                  padding: "0.5rem",
                  borderRadius: "var(--radius-2xl)",
                  background: "linear-gradient(180deg, oklch(96% 0.03 264 / 0.75), transparent)",
                  border: "1px solid var(--color-border-subtle)",
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    padding: "1.25rem",
                    borderRadius: "calc(var(--radius-2xl) - 4px)",
                    border: "1px solid var(--color-border-subtle)",
                    background: "var(--color-bg-elevated)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-4)",
                  }}
                >
                  <div className="row row-between" style={{ alignItems: "flex-start", gap: "0.75rem" }}>
                    <div>
                      <p style={{ fontSize: "var(--text-xs)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                        {eyebrow}
                      </p>
                      <h3 style={{ fontSize: "var(--text-xl)", marginTop: "0.625rem" }}>{title}</h3>
                    </div>
                    <span
                      style={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        borderRadius: "14px",
                        background: "var(--brand-soft)",
                        color: "var(--brand-active)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon size={18} />
                    </span>
                  </div>

                  <p style={{ fontSize: "var(--text-sm)" }}>{body}</p>

                  <ul role="list" style={{ display: "grid", gap: "0.625rem" }}>
                    {bullets.map((bullet) => (
                      <li key={bullet} className="row" style={{ gap: "0.5rem", alignItems: "center" }}>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--brand)",
                            boxShadow: "0 0 0 4px oklch(58% 0.18 264 / 0.12)",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/dashboard/generate"
                    style={{
                      marginTop: "auto",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "var(--text-sm)",
                      fontWeight: 600,
                      color: "var(--brand-active)",
                    }}
                  >
                    {cta}
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </article>
            ))}

            <style>{`
              .tool-node-ad-copy { left: 4.5%; top: 10%; }
              .tool-node-landing-page { left: 6%; bottom: 8%; }
              .tool-node-voiceover { right: 4.5%; top: 10%; }
              .tool-node-poster { right: 6%; bottom: 8%; }

              @media (max-width: 1140px) {
                .tool-node {
                  width: min(34vw, 280px) !important;
                }
              }

              @media (max-width: 980px) {
                .toolkit-shell {
                  min-height: auto !important;
                  display: grid !important;
                  gap: 1rem !important;
                }

                .toolkit-wires {
                  display: none !important;
                }

                .toolkit-hub {
                  position: relative !important;
                  left: auto !important;
                  top: auto !important;
                  transform: none !important;
                  width: 100% !important;
                  max-width: 320px !important;
                  margin: 0 auto !important;
                  order: 0;
                }

                .tool-node {
                  position: relative !important;
                  left: auto !important;
                  right: auto !important;
                  top: auto !important;
                  bottom: auto !important;
                  width: 100% !important;
                  max-width: none !important;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
    </section>
  );
}
