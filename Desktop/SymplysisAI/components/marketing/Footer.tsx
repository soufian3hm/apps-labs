import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        { href: "/#features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/#how", label: "How it works" },
        { href: "/dashboard", label: "Dashboard" },
      ],
    },
    {
      title: "Use cases",
      links: [
        { href: "#", label: "Landing pages" },
        { href: "#", label: "Ad copy" },
        { href: "#", label: "Voiceovers" },
        { href: "#", label: "Posters" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "#", label: "About" },
        { href: "#", label: "Careers" },
        { href: "#", label: "Blog" },
        { href: "#", label: "Contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "#", label: "Privacy" },
        { href: "#", label: "Terms" },
        { href: "#", label: "Security" },
        { href: "#", label: "DPA" },
      ],
    },
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--color-border-subtle)", background: "var(--color-bg-secondary)", marginTop: "var(--space-16)" }}>
      <div className="container" style={{ paddingBlock: "var(--space-16)" }}>
        <div style={{ display: "grid", gap: "var(--space-12)", gridTemplateColumns: "1.4fr repeat(4, 1fr)" }} className="footer-grid">
          <div>
            <Logo />
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", maxWidth: "30ch", marginTop: "var(--space-4)" }}>
              From product to campaign — AI-generated assets that feel structured, aligned, and ready to sell.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginBottom: "var(--space-4)" }}>
                {c.title}
              </div>
              <ul role="list" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }} className="footer-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="divider" style={{ marginBlock: "var(--space-10)" }} />

        <div className="row row-between" style={{ flexWrap: "wrap", gap: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
          <span>© {new Date().getFullYear()} SymplysisAI. All rights reserved.</span>
          <span>Built for product-led marketing teams.</span>
        </div>
      </div>
      <style>{`
        .footer-link:hover { color: var(--color-text-primary); }
        @media (max-width: 860px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
