"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Target, Circle, BookOpen, X, ArrowRight } from "lucide-react";
import Link from "next/link";

// ─── Node Status Types ─────────────────────────────────────────────────────────

type NodeStatus = "gap" | "strong" | "current" | "default" | "unreached";

interface KnowledgeNodeData {
  label: string;
  difficulty?: string;
  status?: NodeStatus;
  lessonId?: string;
  description?: string;
  [key: string]: unknown;
}

// ─── Custom Node Renderers ─────────────────────────────────────────────────────

function KnowledgeNode({ data, selected }: NodeProps) {
  const d = data as KnowledgeNodeData;
  const status = d.status ?? "default";

  const styles: Record<NodeStatus, { border: string; bg: string; icon: React.ReactNode; badge: string }> = {
    gap: {
      border: "border-red-500",
      bg: "bg-red-500/10",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
      badge: "bg-red-500/20 text-red-400 border-red-500/40",
    },
    strong: {
      border: "border-green-500",
      bg: "bg-green-500/10",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
      badge: "bg-green-500/20 text-green-400 border-green-500/40",
    },
    current: {
      border: "border-primary-500",
      bg: "bg-primary-500/10",
      icon: <Target className="w-3.5 h-3.5 text-primary-400" />,
      badge: "bg-primary-500/20 text-primary-400 border-primary-500/40",
    },
    default: {
      border: "border-white/20",
      bg: "bg-white/5",
      icon: <Circle className="w-3.5 h-3.5 text-white/30" />,
      badge: "bg-white/10 text-white/50 border-white/20",
    },
    unreached: {
      border: "border-white/10",
      bg: "bg-white/[0.02]",
      icon: <Circle className="w-3.5 h-3.5 text-white/15" />,
      badge: "bg-white/5 text-white/30 border-white/10",
    },
  };

  const s = styles[status];
  const isPulsing = status === "current";

  return (
    <div className={`relative rounded-xl border-2 ${s.border} ${s.bg} p-3 min-w-[140px] max-w-[180px] backdrop-blur-sm shadow-lg transition-all duration-200 ${selected ? "ring-2 ring-white/30 ring-offset-1 ring-offset-transparent" : ""}`}>
      {isPulsing && (
        <div className={`absolute inset-0 rounded-xl border-2 border-primary-500 animate-ping opacity-30`} />
      )}

      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white/20 !border-white/40" />

      <div className="flex items-center gap-2 mb-1.5">
        {s.icon}
        <span className="text-xs font-semibold text-white leading-tight line-clamp-2">{d.label}</span>
      </div>

      {d.difficulty && (
        <span className={`inline-flex items-center text-[10px] font-medium border rounded-full px-2 py-0.5 ${s.badge}`}>
          {d.difficulty}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white/20 !border-white/40" />
    </div>
  );
}

const nodeTypes = { knowledge: KnowledgeNode };

// ─── Node Detail Panel ─────────────────────────────────────────────────────────

function NodeDetailPanel({
  node,
  onClose,
  courseId,
}: {
  node: Node<KnowledgeNodeData> | null;
  onClose: () => void;
  courseId?: string;
}) {
  if (!node) return null;
  const d = node.data as KnowledgeNodeData;
  const statusLabel: Record<NodeStatus, string> = {
    gap: "Knowledge Gap",
    strong: "Mastered",
    current: "In Progress",
    default: "Available",
    unreached: "Not Yet Reached",
  };

  return (
    <AnimatePresence>
      <motion.div
        key="node-panel"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-4 right-4 w-72 bg-dark-100 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-heading font-bold text-white text-base pr-2">{d.label}</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {d.status && (
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-3 border ${
              d.status === "gap" ? "bg-red-500/10 text-red-400 border-red-500/30" :
              d.status === "strong" ? "bg-green-500/10 text-green-400 border-green-500/30" :
              d.status === "current" ? "bg-primary-500/10 text-primary-400 border-primary-500/30" :
              "bg-white/5 text-white/50 border-white/10"
            }`}>
              {statusLabel[d.status as NodeStatus] ?? d.status}
            </div>
          )}

          {d.description && (
            <p className="text-white/60 text-sm leading-relaxed mb-4">{d.description}</p>
          )}

          {d.difficulty && (
            <p className="text-xs text-white/40 mb-4">Difficulty: <span className="text-white/70 capitalize">{d.difficulty}</span></p>
          )}

          {d.lessonId && courseId && (
            <Link href={`/learn/${courseId}/${d.lessonId}`}>
              <div className="flex items-center gap-2 w-full bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <BookOpen className="w-4 h-4" />
                Go to Lesson
                <ArrowRight className="w-4 h-4 ml-auto" />
              </div>
            </Link>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main CourseGraph Component ────────────────────────────────────────────────

interface CourseGraphProps {
  nodes: Node<KnowledgeNodeData>[];
  edges: Edge[];
  courseId?: string;
  editable?: boolean;
  onNodesChange?: (changes: any) => void;
  onEdgesChange?: (changes: any) => void;
  onConnect?: (connection: any) => void;
}

export default function CourseGraph({
  nodes: initialNodes,
  edges: initialEdges,
  courseId,
  editable = false,
  onNodesChange: onNodesChangeExternal,
  onEdgesChange: onEdgesChangeExternal,
  onConnect: onConnectExternal,
}: CourseGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<KnowledgeNodeData> | null>(null);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<KnowledgeNodeData>);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Minimap colors based on status
  const minimapNodeColor = useCallback((node: Node) => {
    const status = (node.data as KnowledgeNodeData).status;
    if (status === "gap") return "#ef4444";
    if (status === "strong") return "#22c55e";
    if (status === "current") return "#7c3aed";
    return "#ffffff22";
  }, []);

  const defaultEdgeOptions = {
    animated: true,
    style: { strokeDasharray: "5 5", stroke: "rgba(255,255,255,0.15)", strokeWidth: 1.5 },
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={editable ? onNodesChange : undefined}
        onEdgesChange={editable ? onEdgesChange : undefined}
        onConnect={editable ? onConnectExternal : undefined}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={editable}
        nodesConnectable={editable}
        elementsSelectable={true}
        className="!bg-dark"
      >
        <Background
          color="rgba(124,58,237,0.06)"
          gap={32}
          size={1}
        />
        <Controls
          className="!bg-dark-100 !border-white/10 !rounded-xl [&>button]:!bg-dark-100 [&>button]:!border-white/10 [&>button]:!text-white/60 [&>button:hover]:!bg-white/10"
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(0,0,0,0.6)"
          className="!bg-dark-100 !border-white/10 !rounded-xl"
        />

        {/* Legend */}
        <Panel position="top-left">
          <div className="bg-dark-100/80 backdrop-blur-md border border-white/10 rounded-xl p-3 space-y-2">
            {[
              { color: "bg-red-500", label: "Knowledge Gap" },
              { color: "bg-green-500", label: "Mastered" },
              { color: "bg-primary-500", label: "In Progress" },
              { color: "bg-white/20", label: "Available" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-[11px] text-white/50">{label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </ReactFlow>

      {/* Node detail side panel */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          courseId={courseId}
        />
      )}
    </div>
  );
}

// ─── Read-Only Variant (for course detail pages) ───────────────────────────────

export function ReadOnlyCourseGraph({
  knowledgeNodes,
  courseId,
}: {
  knowledgeNodes: { id: string; label: string; difficulty?: string; description?: string; lessonId?: string }[];
  courseId?: string;
}) {
  const nodes: Node<KnowledgeNodeData>[] = useMemo(
    () =>
      knowledgeNodes.map((n, i) => ({
        id: n.id,
        type: "knowledge",
        position: {
          x: (i % 4) * 220 + 40,
          y: Math.floor(i / 4) * 160 + 40,
        },
        data: {
          label: n.label,
          difficulty: n.difficulty,
          description: n.description,
          lessonId: n.lessonId,
          status: "default" as NodeStatus,
        },
      })),
    [knowledgeNodes]
  );

  return (
    <CourseGraph nodes={nodes} edges={[]} courseId={courseId} editable={false} />
  );
}
