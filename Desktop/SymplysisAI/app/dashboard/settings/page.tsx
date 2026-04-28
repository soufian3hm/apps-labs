"use client";
import { useState } from "react";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const tabs = ["Profile", "Workspace", "Brand voice", "Billing", "Members", "API"];

export default function SettingsPage() {
  const [tab, setTab] = useState("Profile");

  return (
    <>
      <Topbar title="Settings" />
      <main style={{ padding: "2rem 1.5rem 4rem", maxWidth: 1100, width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "var(--space-8)" }} className="settings-grid">
          <aside>
            <nav aria-label="Settings sections">
              <ul role="list" style={{ display: "flex", flexDirection: "column", gap: 2, listStyle: "none", padding: 0 }}>
                {tabs.map((t) => {
                  const active = tab === t;
                  return (
                    <li key={t}>
                      <button
                        onClick={() => setTab(t)}
                        aria-current={active ? "page" : undefined}
                        style={{
                          width: "100%", textAlign: "left",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "var(--text-sm)", fontWeight: 500,
                          background: active ? "var(--color-surface-selected)" : "transparent",
                          color: active ? "var(--brand-active)" : "var(--color-text-secondary)",
                        }}
                      >
                        {t}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          <div className="stack" style={{ ["--stack-gap" as never]: "1.5rem" }}>
            {tab === "Profile" && <Profile />}
            {tab === "Workspace" && <Workspace />}
            {tab === "Brand voice" && <BrandVoice />}
            {tab === "Billing" && <Billing />}
            {tab === "Members" && <Members />}
            {tab === "API" && <Apikeys />}
            <DangerZone />
          </div>
        </div>
        <style>{`@media (max-width: 760px) { .settings-grid { grid-template-columns: 1fr !important; } }`}</style>
      </main>
    </>
  );
}

function Section({ title, desc, children, action }: { title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card>
      <div className="row row-between" style={{ marginBottom: "var(--space-5)", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "var(--text-base)" }}>{title}</h3>
          {desc && <p style={{ fontSize: "var(--text-sm)", marginTop: 4 }}>{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function Profile() {
  return (
    <Section title="Profile" desc="Update your personal information and avatar." action={<Button variant="primary" size="sm">Save changes</Button>}>
      <div className="row" style={{ gap: "1.25rem", marginBottom: "var(--space-5)", alignItems: "center" }}>
        <span className="avatar" style={{ width: 64, height: 64, fontSize: "var(--text-xl)", background: "linear-gradient(135deg, oklch(80% 0.12 264), oklch(70% 0.16 320))", color: "white" }}>L</span>
        <div className="row" style={{ gap: 8 }}>
          <Button variant="secondary" size="sm">Upload new</Button>
          <Button variant="ghost" size="sm">Remove</Button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="settings-row">
        <Input label="Full name" defaultValue="Layla Rahman" />
        <Input label="Email" type="email" defaultValue="layla@aurora.co" />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <div className="field">
          <label className="label">Timezone</label>
          <select className="input"><option>Asia/Dubai (GMT+4)</option><option>Europe/London</option><option>America/New_York</option></select>
        </div>
      </div>
      <style>{`@media (max-width: 600px) { .settings-row { grid-template-columns: 1fr !important; } }`}</style>
    </Section>
  );
}

function Workspace() {
  return (
    <Section title="Workspace" desc="Settings shared by everyone in this workspace." action={<Button variant="primary" size="sm">Save changes</Button>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="settings-row">
        <Input label="Workspace name" defaultValue="Aurora Skincare" />
        <Input label="Workspace URL" defaultValue="aurora" trailing={<span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>.symplysis.ai</span>} />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <Toggle label="Auto-save generations" desc="Automatically save every project to history." defaultChecked />
        <Toggle label="Email notifications" desc="Get notified when long-running generations finish." defaultChecked />
        <Toggle label="Beta features" desc="Try unreleased capabilities before public launch." />
      </div>
    </Section>
  );
}

function BrandVoice() {
  return (
    <Section title="Brand voice" desc="Used as the default for every new generation in this workspace.">
      <Textarea label="Brand description" defaultValue="Aurora Skincare creates calm, clinical, premium skincare for women 25–45. Tone is warm but precise, never gimmicky." />
      <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="settings-row">
        <Input label="Default tone" defaultValue="Premium · calm · clinical" />
        <Input label="Default audience" defaultValue="Women, 25–45, urban" />
      </div>
      <div style={{ marginTop: "1rem" }}>
        <label className="label" style={{ display: "block", marginBottom: 8 }}>Brand palette</label>
        <div className="row" style={{ gap: 8 }}>
          {["#1B2A33", "#E7F0F2", "#7A9CA8", "#C9D8DD", "#FFFFFF"].map((c) => (
            <span key={c} title={c} style={{
              width: 36, height: 36, borderRadius: "var(--radius-md)",
              background: c, border: "1px solid var(--color-border-default)",
            }} />
          ))}
          <button className="btn btn-secondary btn-sm btn-icon" aria-label="Add color">+</button>
        </div>
      </div>
    </Section>
  );
}

function Billing() {
  return (
    <>
      <Section title="Plan" desc="You're on the Pro plan. Renews on April 28, 2026." action={<Button variant="secondary" size="sm">Change plan</Button>}>
        <div className="row" style={{ gap: "var(--space-5)", flexWrap: "wrap" }}>
          <UsageBar label="Generations" used={127} cap={null} pct={42} />
          <UsageBar label="Brand kits" used={3} cap={5} pct={60} />
          <UsageBar label="Team seats" used={4} cap={10} pct={40} />
        </div>
      </Section>
      <Section title="Payment method" desc="Your card on file. We never store CVV.">
        <div className="row row-between" style={{ padding: "1rem", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)" }}>
          <div className="row" style={{ gap: 12 }}>
            <span style={{ width: 40, height: 28, borderRadius: 4, background: "linear-gradient(135deg, #1a1f71, #4d4dff)" }} />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Visa •••• 4242</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>Expires 09/27</div>
            </div>
          </div>
          <Button variant="ghost" size="sm">Update</Button>
        </div>
      </Section>
      <Section title="Invoices">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {["Apr 2026", "Mar 2026", "Feb 2026"].map((m) => (
              <tr key={m} style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
                <td style={{ padding: "0.75rem 0", fontSize: "var(--text-sm)" }}>{m}</td>
                <td style={{ padding: "0.75rem 0", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>$39.00</td>
                <td style={{ padding: "0.75rem 0" }}><Badge tone="success">Paid</Badge></td>
                <td style={{ padding: "0.75rem 0", textAlign: "right" }}><Button variant="ghost" size="sm">Download</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function UsageBar({ label, used, cap, pct }: { label: string; used: number; cap: number | null; pct: number }) {
  return (
    <div style={{ flex: "1 1 200px" }}>
      <div className="row row-between" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{label}</span>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600 }}>{used}{cap !== null && ` / ${cap}`}</span>
      </div>
      <div style={{ height: 6, background: "var(--color-bg-tertiary)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--brand)", borderRadius: 999, transition: "width var(--duration-slow)" }} />
      </div>
    </div>
  );
}

function Members() {
  const ms = [
    { n: "Layla Rahman", e: "layla@aurora.co", r: "Owner" },
    { n: "Yusuf Khalil", e: "yusuf@aurora.co", r: "Admin" },
    { n: "Marc Delauney", e: "marc@aurora.co", r: "Editor" },
    { n: "Sasha Patel", e: "sasha@aurora.co", r: "Viewer" },
  ];
  return (
    <Section title="Members" desc="4 of 10 seats used." action={<Button variant="primary" size="sm">Invite member</Button>}>
      {ms.map((m) => (
        <div key={m.e} className="row row-between" style={{ padding: "0.75rem 0", borderTop: "1px solid var(--color-border-subtle)" }}>
          <div className="row" style={{ gap: 10 }}>
            <span className="avatar" style={{ width: 32, height: 32, fontSize: "var(--text-xs)" }}>{m.n[0]}</span>
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{m.n}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{m.e}</div>
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <Badge plain>{m.r}</Badge>
            <Button variant="ghost" size="sm">Manage</Button>
          </div>
        </div>
      ))}
    </Section>
  );
}

function Apikeys() {
  return (
    <Section title="API keys" desc="Use the SymplysisAI API to generate assets programmatically." action={<Button variant="primary" size="sm">Create key</Button>}>
      <div style={{ padding: "1rem", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Production</div>
          <div className="text-mono" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 2 }}>sk_live_••••••••••••8f3a</div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <Button variant="ghost" size="sm">Copy</Button>
          <Button variant="ghost" size="sm" style={{ color: "var(--color-error)" }}>Revoke</Button>
        </div>
      </div>
    </Section>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc?: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="row row-between" style={{ padding: "0.75rem 0", borderTop: "1px solid var(--color-border-subtle)" }}>
      <div>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => setOn((o) => !o)}
        style={{
          position: "relative", width: 38, height: 22, borderRadius: 999,
          background: on ? "var(--brand)" : "var(--color-border-strong)",
          transition: "background var(--duration-base)",
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: on ? 18 : 2,
          width: 18, height: 18, borderRadius: "50%", background: "white",
          transition: "left var(--duration-base) var(--ease-spring)", boxShadow: "var(--shadow-sm)",
        }} />
      </button>
    </div>
  );
}

function DangerZone() {
  return (
    <Card style={{ borderColor: "var(--color-error)", borderWidth: 1 }}>
      <h3 style={{ fontSize: "var(--text-base)", color: "var(--color-error)" }}>Danger zone</h3>
      <p style={{ fontSize: "var(--text-sm)", marginTop: 4, marginBottom: "1rem" }}>
        Permanent actions. Cannot be undone.
      </p>
      <div className="row row-between" style={{ padding: "0.875rem", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)" }}>
        <div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Delete workspace</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>All projects, brand kits, and team data will be permanently removed.</div>
        </div>
        <Button variant="destructive" size="sm">Delete</Button>
      </div>
    </Card>
  );
}
