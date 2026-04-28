"use client";
import { Search, Bell, Command } from "lucide-react";

export function Topbar({ title }: { title?: string }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 20,
      height: 64,
      background: "oklch(99.2% 0.002 270 / 0.85)",
      backdropFilter: "saturate(180%) blur(12px)",
      WebkitBackdropFilter: "saturate(180%) blur(12px)",
      borderBottom: "1px solid var(--color-border-subtle)",
      display: "flex", alignItems: "center",
      padding: "0 1.5rem",
      gap: "1rem",
    }}>
      <h1 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginRight: "auto" }}>
        {title ?? ""}
      </h1>

      <button style={{
        display: "inline-flex", alignItems: "center", gap: "0.5rem",
        padding: "0.4375rem 0.625rem 0.4375rem 0.75rem",
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)",
        minWidth: 240,
      }} className="topbar-search">
        <Search size={14} />
        <span style={{ flex: 1, textAlign: "left" }}>Search projects, sections…</span>
        <span className="kbd"><Command size={10} style={{ display: "inline" }} />K</span>
      </button>

      <button aria-label="Notifications" className="btn btn-ghost btn-icon btn-sm" style={{ position: "relative" }}>
        <Bell size={18} />
        <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--color-error)", border: "2px solid var(--color-bg-primary)" }} />
      </button>

      <span className="avatar" style={{ width: 32, height: 32, fontSize: "var(--text-xs)", background: "linear-gradient(135deg, oklch(80% 0.12 264), oklch(70% 0.16 320))", color: "white" }}>L</span>

      <style>{`@media (max-width: 600px) { .topbar-search { min-width: 0 !important; } .topbar-search > span:first-of-type { display: none; } }`}</style>
    </header>
  );
}
