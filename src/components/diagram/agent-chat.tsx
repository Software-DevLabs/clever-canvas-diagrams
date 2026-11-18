import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon, FlowIcon } from "@hugeicons/core-free-icons";
import type { ChatMsg } from "@/lib/diagram";

const SUGGESTIONS = [
  "Login flow with email, OTP check and dashboard",
  "E-commerce checkout: cart, payment, stock check, shipping",
  "RAG AI agent: docs, embeddings, vector DB, LLM answer",
];

export function AgentChat({ messages, busy, onSend }: { messages: ChatMsg[]; busy: boolean; onSend: (t: string) => void }) {
  const [text, setText] = useState("");
  const ta = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); if (!busy) ta.current?.focus(); }, [messages, busy]);
  const send = (t = text) => { const v = t.trim(); if (!v || busy) return; onSend(v); setText(""); };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-brand-foreground"><HugeiconsIcon icon={FlowIcon} size={20} /></div>
            <h2 className="text-lg font-medium">Describe a system, get a diagram.</h2>
            <p className="text-sm text-muted-foreground">The agent draws it on the board and can edit it when you ask.</p>
            <div className="space-y-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="block w-full rounded-lg border border-border bg-fill-subtle px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-fill hover:text-foreground">{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-fill-inverse px-3 py-2 text-sm text-fill-inverse-foreground">{m.content}</div>
          ) : (
            <div key={i} className="prose-chat text-sm"><ReactMarkdown>{m.content}</ReactMarkdown></div>
          ),
        )}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="dg-typing"><i /><i /><i /></span> Drawing your diagram…
          </div>
        )}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="m-3 rounded-xl border border-border bg-card p-2 focus-within:border-border-focus">
        <textarea
          ref={ta} value={text} rows={2} autoFocus placeholder="Ask the agent to draw or change a diagram…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          className="w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Enter to send</span>
          <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-30">
            <HugeiconsIcon icon={ArrowUp02Icon} size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
