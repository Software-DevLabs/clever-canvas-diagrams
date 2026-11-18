import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/app-shell";
import { AgentChat } from "@/components/diagram/agent-chat";
import { DiagramCanvas } from "@/components/diagram/diagram-canvas";
import { SAMPLE, type ChatMsg, type Diagram } from "@/lib/diagram";
import { runDiagramAgent } from "@/lib/diagram.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diagram Agent · Hixfi" },
      { name: "description", content: "An AI agent that turns a plain description into a clean architecture or flow diagram." },
      { property: "og:title", content: "Diagram Agent · Hixfi" },
      { property: "og:description", content: "Describe a system and the AI agent draws the diagram for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const agent = useServerFn(runDiagramAgent);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [diagram, setDiagram] = useState<Diagram>(SAMPLE);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await agent({ data: { messages: next, current: touched ? diagram : null } });
      if (res.diagram) { setDiagram(res.diagram); setTouched(true); }
      setMessages([...next, { role: "assistant", content: res.error ?? res.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setMessages([]); setDiagram(SAMPLE); setTouched(false); };

  return (
    <AppShell
      title="Diagram Agent"
      actions={<button onClick={reset} className="h-7 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-fill hover:text-foreground">New diagram</button>}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="h-[45vh] shrink-0 border-border lg:h-auto lg:w-[380px] lg:border-r">
          <AgentChat messages={messages} busy={busy} onSend={send} />
        </section>
        <section className="relative min-h-0 flex-1 border-t border-border lg:border-t-0">
          <div className="absolute left-4 top-4 z-10 rounded-md bg-card/80 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">{diagram.title}</div>
          <div className="dg-board h-full"><DiagramCanvas diagram={diagram} /></div>
        </section>
      </div>
    </AppShell>
  );
}
