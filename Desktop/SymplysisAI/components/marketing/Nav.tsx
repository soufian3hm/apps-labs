"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#features", label: "Features" },
    { href: "/#how", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "oklch(99.2% 0.002 270 / 0.85)" : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border-subtle)" : "1px solid transparent",
        transition: "background var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)",
      }}
    >
      <div className="container row row-between" style={{ height: "var(--nav-height)" }}>
        <Link href="/" aria-label="SymplysisAI home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="nav-desktop" style={{ display: "flex", gap: "0.25rem" }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "0.5rem 0.875rem",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                borderRadius: "var(--radius-md)",
                transition: "color var(--duration-base), background var(--duration-base)",
              }}
              className="nav-link"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="row nav-desktop" style={{ gap: "0.5rem" }}>
          <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link href="/signup"><Button variant="primary" size="sm">Get started</Button></Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="nav-mobile-toggle btn btn-ghost btn-icon btn-sm"
          style={{ display: "none" }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="nav-mobile-panel" style={{
          padding: "1rem", background: "var(--color-bg-elevated)",
          borderTop: "1px solid var(--color-border-subtle)",
        }}>
          <div className="stack">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", fontSize: "var(--text-base)", fontWeight: 500 }}>
                {l.label}
              </Link>
            ))}
            <div className="row" style={{ gap: "0.5rem", marginTop: "0.75rem" }}>
              <Link href="/login" style={{ flex: 1 }}><Button variant="secondary" style={{ width: "100%" }}>Sign in</Button></Link>
              <Link href="/signup" style={{ flex: 1 }}><Button variant="primary" style={{ width: "100%" }}>Get started</Button></Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-link:hover { color: var(--color-text-primary); background: var(--color-surface-hover); }
        @media (max-width: 860px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
