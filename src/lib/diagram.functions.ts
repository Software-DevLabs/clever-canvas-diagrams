import { createServerFn } from "@tanstack/react-start";
import { sanitizeDiagram, type ChatMsg, type Diagram } from "./diagram";

const INSTRUCTIONS = `You are Diagram Agent, an AI that designs clear architecture / flow diagrams.
Always reply with ONLY a JSON object (no markdown fences):
{"reply": "<short friendly explanation, markdown allowed>", "diagram": {"title": string, "nodes": [...], "edges": [...], "tags": [...]}}
nodes: {"id": kebab-id, "label": short text (<=3 words), "shape": "circle"|"rect"|"diamond"|"cylinder"|"pill", "tone": "purple"|"green"|"yellow"|"orange"|"pink"|"blue", "col": number, "row": number}
- circle = clients/users/entry points, rect = services/steps, diamond = decisions/checks/events, cylinder = databases/storage, pill = final outputs/agents.
- Same tone = same group. Layout left-to-right: col 0..7 (columns), row 0..4 (rows, decimals allowed). Main flow on one row, branches below. Never overlap nodes.
edges: {"source": id, "target": id, "label"?: one short word like "request"}.
tags: 2-4 group labels {"label", "tone", "col", "row"} placed slightly above their group (row ~ main row - 1).
When the user asks for changes, return the FULL updated diagram based on the current one. Reply in the user's language.`;

function extractText(res: unknown): string {
  const r = res as { output_text?: string; output?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }> };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  return (r.output ?? [])
    .flatMap((o) => (o.type === "message" ? (o.content ?? []) : []))
    .filter((c) => c.type === "output_text")
    .map((c) => c.text ?? "")
    .join("");
}

export const runDiagramAgent = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMsg[]; current: Diagram | null }) => input)
  .handler(async ({ data }): Promise<{ reply: string; diagram: Diagram | null; error?: string }> => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const history = data.messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));
    if (data.current) {
      history.splice(history.length - 1, 0, { role: "user", content: `Current diagram JSON: ${JSON.stringify(data.current)}` });
    }
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: INSTRUCTIONS,
        input: history,
      });
      const text = extractText(res).trim();
      const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      const parsed = JSON.parse(json) as { reply?: string; diagram?: unknown };
      return { reply: parsed.reply ?? "Here is your diagram.", diagram: sanitizeDiagram(parsed.diagram) };
    } catch (e) {
      console.error("diagram agent failed", e);
      const msg = e instanceof GatewayError && e.code === "payment_required"
        ? "AI credits are used up. Please add credits and try again."
        : e instanceof GatewayError && e.httpStatus === 429
          ? "Too many requests right now. Please wait a moment."
          : "The agent could not build that diagram. Please try again.";
      return { reply: "", diagram: null, error: msg };
    }
  });
