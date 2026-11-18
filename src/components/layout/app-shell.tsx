import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BotIcon, FlowIcon, DashboardSquare01Icon, Settings01Icon, Search01Icon } from "@hugeicons/core-free-icons";

const NAV = [
  { label: "Overview", icon: DashboardSquare01Icon },
  { label: "Diagram Agent", icon: FlowIcon, active: true },
  { label: "Agents", icon: BotIcon },
  { label: "Settings", icon: Settings01Icon },
];

export function AppShell({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex h-screen bg-sidebar text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col gap-1 px-2 py-3 md:flex">
        <div className="flex items-center gap-2.5 px-2 pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-sm font-semibold text-brand-foreground">H</span>
          <span>
            <span className="block text-sm font-medium">Hixfi</span>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Workspace</span>
          </span>
        </div>
        <div className="mb-2 flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.6} /> Search
          <kbd className="ml-auto rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
        </div>
        <p className="px-2 pb-1 pt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">Build</p>
        {NAV.map((n) => (
          <div key={n.label} className={`flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors ${n.active ? "bg-fill-active text-foreground" : "text-muted-foreground hover:bg-fill hover:text-foreground"}`}>
            <HugeiconsIcon icon={n.icon} size={16} strokeWidth={1.6} /> {n.label}
          </div>
        ))}
      </aside>
      <main className="m-0 flex min-w-0 flex-1 flex-col overflow-hidden bg-background md:my-2 md:mr-2 md:rounded-xl md:border md:border-border">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
          <span className="text-sm text-muted-foreground">Workspace /</span>
          <span className="text-sm font-medium">{title}</span>
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </header>
        {children}
      </main>
    </div>
  );
}
