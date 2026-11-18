/* eslint-disable @typescript-eslint/no-explicit-any */
export type Shape = "circle" | "rect" | "diamond" | "cylinder" | "pill";
export type Tone = "purple" | "green" | "yellow" | "orange" | "pink" | "blue";
export interface DNode { id: string; label: string; shape: Shape; tone: Tone; col: number; row: number }
export interface DEdge { source: string; target: string; label?: string | undefined }
export interface DTag { label: string; tone: Tone; col: number; row: number }
export interface Diagram { title: string; nodes: DNode[]; edges: DEdge[]; tags: DTag[] }
export interface ChatMsg { role: "user" | "assistant"; content: string }

const SHAPES: Shape[] = ["circle", "rect", "diamond", "cylinder", "pill"];
const TONES: Tone[] = ["purple", "green", "yellow", "orange", "pink", "blue"];

export function sanitizeDiagram(raw: unknown): Diagram | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { nodes?: any[]; edges?: any[]; tags?: any[]; title?: unknown };
  const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);
  const tone = (v: unknown): Tone => (TONES.includes(v as Tone) ? (v as Tone) : "yellow");
  const nodes: DNode[] = Array.isArray(r.nodes)
    ? r.nodes.filter((n) => n && typeof n.id === "string").map((n) => ({
        id: n.id, label: String(n.label ?? n.id),
        shape: SHAPES.includes(n.shape) ? n.shape : "rect",
        tone: tone(n.tone), col: num(n.col), row: num(n.row),
      }))
    : [];
  if (!nodes.length) return null;
  const ids = new Set(nodes.map((n) => n.id));
  const edges: DEdge[] = Array.isArray(r.edges)
    ? r.edges.filter((e) => e && ids.has(e.source) && ids.has(e.target))
        .map((e) => ({ source: e.source, target: e.target, label: e.label ? String(e.label) : undefined }))
    : [];
  const tags: DTag[] = Array.isArray(r.tags)
    ? r.tags.filter((t) => t && t.label).map((t) => ({ label: String(t.label), tone: tone(t.tone), col: num(t.col), row: num(t.row) }))
    : [];
  return { title: String(r.title ?? "Diagram"), nodes, edges, tags };
}

export const SAMPLE: Diagram = {
  title: "AI Orchestrator",
  nodes: [
    { id: "web", label: "Web App", shape: "circle", tone: "purple", col: 0, row: 0.6 },
    { id: "mobile", label: "Mobile App", shape: "circle", tone: "purple", col: 0, row: 2 },
    { id: "gw", label: "API Gateway", shape: "rect", tone: "green", col: 1, row: 1.2 },
    { id: "auth", label: "Auth Service", shape: "rect", tone: "yellow", col: 2, row: 1.2 },
    { id: "api", label: "API Service", shape: "rect", tone: "green", col: 3, row: 1.2 },
    { id: "db", label: "Database", shape: "cylinder", tone: "yellow", col: 4, row: 1.2 },
    { id: "agent", label: "AI Agent", shape: "pill", tone: "pink", col: 5, row: 1.2 },
    { id: "val", label: "Validate Request", shape: "diamond", tone: "orange", col: 3, row: 2.4 },
    { id: "log", label: "Log Event", shape: "diamond", tone: "orange", col: 4, row: 2.4 },
  ],
  edges: [
    { source: "web", target: "gw" }, { source: "mobile", target: "gw" },
    { source: "gw", target: "auth", label: "request" }, { source: "auth", target: "api", label: "token" },
    { source: "api", target: "db", label: "query" }, { source: "db", target: "agent" },
    { source: "api", target: "val" }, { source: "val", target: "log" }, { source: "log", target: "db" },
  ],
  tags: [
    { label: "Frontend", tone: "purple", col: 1.4, row: 0.3 },
    { label: "Backend", tone: "green", col: 2.6, row: 0.2 },
    { label: "Data", tone: "pink", col: 4.1, row: 0.2 },
  ],
};
