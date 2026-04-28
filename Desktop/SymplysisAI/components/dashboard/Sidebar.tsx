"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, History, Palette, Settings, LifeBuoy, ChevronsUpDown, Plus, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/app/actions/auth";

const items = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/generate", label: "New generation", icon: Sparkles },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/brand", label: "Brand kits", icon: Palette },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside style={{
      width: "var(--sidebar-width)",
      borderRight: "1px solid var(--color-border-subtle)",
      background: "var(--color-bg-secondary)",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100dvh",
    }} className="dash-sidebar">
      <div style={{ padding: "1.125rem 1rem", borderBottom: "1px solid var(--color-border-subtle)" }}>
        <Link href="/"><Logo /></Link>
      </div>

      <button style={{
        margin: "0.75rem",
        display: "flex", alignItems: "center", gap: "0.625rem",
        padding: "0.5rem 0.625rem",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-subtle)",
        background: "var(--color-bg-elevated)",
        textAlign: "left",
      }}>
        <span className="avatar" style={{ width: 28, height: 28, fontSize: "var(--text-xs)", background: "linear-gradient(135deg, oklch(80% 0.12 264), oklch(70% 0.16 320))", color: "white" }}>A</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Aurora Skincare</span>
          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>Pro plan</span>
        </span>
        <ChevronsUpDown size={14} style={{ color: "var(--color-text-tertiary)" }} />
      </button>

      <Link href="/dashboard/generate" style={{
        margin: "0 0.75rem 0.75rem",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
        height: 38,
        background: "var(--gray-900)",
        color: "white",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)", fontWeight: 500,
      }}>
        <Plus size={16} /> New generation
      </Link>

      <nav aria-label="Workspace" style={{ padding: "0.5rem 0.5rem", flex: 1 }}>
        <ul role="list" style={{ display: "flex", flexDirection: "column", gap: 2, listStyle: "none", padding: 0 }}>
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.5rem 0.625rem",
                    fontSize: "var(--text-sm)", fontWeight: 500,
                    color: active ? "var(--brand-active)" : "var(--color-text-secondary)",
                    background: active ? "var(--color-surface-selected)" : "transparent",
                    borderRadius: "var(--radius-md)",
                    transition: "background var(--duration-base), color var(--duration-base)",
                  }}
                  className="dash-nav-link"
                >
                  <Icon size={16} /> {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: "0.5rem 0.5rem 0.75rem", borderTop: "1px solid var(--color-border-subtle)" }}>
        <Link href="#" style={{
          display: "flex", alignItems: "center", gap: "0.625rem",
          padding: "0.5rem 0.625rem", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)",
        }}>
          <LifeBuoy size={16} /> Help & docs
        </Link>
        <form action={logout}>
          <button type="submit" style={{
            display: "flex", alignItems: "center", gap: "0.625rem",
            padding: "0.5rem 0.625rem", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)",
            width: "100%", background: "none", border: "none", cursor: "pointer", borderRadius: "var(--radius-md)",
          }} className="dash-nav-link">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </div>

      <style>{`
        .dash-nav-link:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
        @media (max-width: 900px) { .dash-sidebar { display: none !important; } }
      `}</style>
    </aside>
  );
}
