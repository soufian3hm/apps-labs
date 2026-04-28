import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "var(--sidebar-width) 1fr", minHeight: "100dvh" }} className="dash-layout">
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {children}
      </div>
      <style>{`@media (max-width: 900px) { .dash-layout { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
