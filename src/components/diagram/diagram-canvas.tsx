import { useEffect, useMemo } from "react";
import {
  ReactFlow, Background, BackgroundVariant, Controls, Handle, Position, MarkerType,
  BaseEdge, EdgeLabelRenderer, useNodesInitialized, useReactFlow, getSmoothStepPath, ReactFlowProvider,
  type NodeProps, type EdgeProps, type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Diagram, DNode, DTag } from "@/lib/diagram";

const COL = 210, ROW = 130;
const SIZES: Record<DNode["shape"], [number, number]> = {
  circle: [118, 118], rect: [132, 70], diamond: [104, 104], cylinder: [132, 84], pill: [140, 58],
};

function handles() {
  return (
    <>
      <Handle type="target" position={Position.Left} id="l" className="dg-handle" />
      <Handle type="target" position={Position.Top} id="t" className="dg-handle" />
      <Handle type="source" position={Position.Right} id="r" className="dg-handle" />
      <Handle type="source" position={Position.Bottom} id="b" className="dg-handle" />
      <Handle type="target" position={Position.Bottom} id="bt" className="dg-handle" />
    </>
  );
}

function ShapeNode({ data }: NodeProps<Node<DNode & Record<string, unknown>>>) {
  const [w, h] = SIZES[data.shape];
  return (
    <div className="dg-node" data-tone={data.tone} data-shape={data.shape} style={{ width: w, height: h }}>
      {data.shape === "cylinder" && <span className="dg-cyl-top" />}
      <span className="dg-label">{data.label}</span>
      {handles()}
    </div>
  );
}

function TagNode({ data }: NodeProps<Node<DTag & Record<string, unknown>>>) {
  return (
    <div className="dg-tag-wrap" data-tone={data.tone}>
      <svg width="22" height="22" viewBox="0 0 24 24" className="dg-cursor"><path d="M3 2l18 8-8 2-3 9z" /></svg>
      <span className="dg-tag">{data.label}</span>
    </div>
  );
}

function LabeledEdge(p: EdgeProps) {
  const [path, lx, ly] = getSmoothStepPath({ ...p, borderRadius: 14 });
  return (
    <>
      <BaseEdge path={path} {...(p.markerEnd ? { markerEnd: p.markerEnd } : {})} className="dg-edge" />
      {p.label && (
        <EdgeLabelRenderer>
          <div className="dg-edge-label" style={{ transform: `translate(-50%,-50%) translate(${lx}px,${ly}px)` }}>{p.label}</div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function FitOnLoad() {
  const ready = useNodesInitialized();
  const { fitView } = useReactFlow();
  useEffect(() => { if (ready) requestAnimationFrame(() => fitView({ padding: 0.15 })); }, [ready, fitView]);
  return null;
}

const nodeTypes = { shape: ShapeNode, tag: TagNode };
const edgeTypes = { labeled: LabeledEdge };

export function DiagramCanvas({ diagram }: { diagram: Diagram }) {
  const { nodes, edges } = useMemo(() => {
    const pos = new Map<string, DNode>();
    diagram.nodes.forEach((n) => pos.set(n.id, n));
    const nodes: Node[] = [
      ...diagram.nodes.map((n) => {
        const [w, h] = SIZES[n.shape];
        return { id: n.id, type: "shape", data: n as unknown as Record<string, unknown>, position: { x: n.col * COL + (140 - w) / 2, y: n.row * ROW + (118 - h) / 2 } };
      }),
      ...diagram.tags.map((t, i) => ({ id: `tag-${i}`, type: "tag", data: t as unknown as Record<string, unknown>, position: { x: t.col * COL, y: t.row * ROW }, selectable: false })),
    ];
    const edges: Edge[] = diagram.edges.map((e, i) => {
      const s = pos.get(e.source)!, t = pos.get(e.target)!;
      const dr = t.row - s.row, dc = t.col - s.col;
      let sourceHandle = "r", targetHandle = "l";
      if (Math.abs(dc) < 0.5) { sourceHandle = dr > 0 ? "b" : "r"; targetHandle = dr > 0 ? "t" : "bt"; }
      else if (dr < -0.5 && dc >= 0) { sourceHandle = "r"; targetHandle = "bt"; }
      return {
        id: `e${i}`, source: e.source, target: e.target, sourceHandle, targetHandle, label: e.label, type: "labeled",
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "var(--dg-ink)" },
      };
    });
    return { nodes, edges };
  }, [diagram]);

  return (
    <ReactFlowProvider key={JSON.stringify(diagram)}>
      <ReactFlow

        defaultNodes={nodes} defaultEdges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        minZoom={0.2} fitView fitViewOptions={{ padding: 0.2 }} proOptions={{ hideAttribution: true }} className="dg-flow"
      >
        <Background variant={BackgroundVariant.Dots} gap={14} size={1.2} color="var(--dg-dot)" />
        <FitOnLoad />
        <Controls showInteractive={false} className="dg-controls" />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
