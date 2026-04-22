"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AlertCircle, CheckCircle2, Map, RotateCcw, ChevronRight, Trophy, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";

// Dynamically import CourseGraph (ReactFlow requires browser)
const CourseGraph = dynamic(() => import("@/components/knowledge-graph/CourseGraph"), { ssr: false });

// ─── Types ─────────────────────────────────────────────────────────────────────

interface DiagnosticResult {
  score: number;
  totalQuestions: number;
  gapNodes: string[];         // knowledgeNode IDs
  strongNodes: string[];
  recommendedPath: string[];  // lesson/node labels
  explanation?: string;
}

interface KnowledgeNodeDef {
  id: string;
  label: string;
  difficulty?: string;
}

interface GapAnalysisResultProps {
  courseId: string;
  result: DiagnosticResult;
  knowledgeNodes?: KnowledgeNodeDef[];
  onStartPath?: () => void;
}

// ─── Animated Score Circle ─────────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 400);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144">
        {/* Track */}
        <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {/* Fill */}
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="text-3xl font-heading font-extrabold text-white"
        >
          {score}%
        </motion.div>
        <div className="text-xs text-white/40 mt-0.5">Score</div>
      </div>
    </div>
  );
}

// ─── Draggable Path Item (for customize mode) ─────────────────────────────────

function PathItem({ label, index }: { label: string; index: number }) {
  return (
    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 cursor-grab active:cursor-grabbing hover:bg-white/[0.06] transition-colors">
      <GripVertical className="w-4 h-4 text-white/20 shrink-0" />
      <span className="w-5 h-5 rounded-full bg-primary-600/40 text-primary-300 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
      <span className="text-sm text-white/80 flex-1">{label}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function GapAnalysisResult({ courseId, result, knowledgeNodes = [], onStartPath }: GapAnalysisResultProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "customize">("view");
  const [path, setPath] = useState(result.recommendedPath);
  const [saving, setSaving] = useState(false);

  // Build ReactFlow nodes from knowledgeNodes, coloring by gap/strong status
  const graphNodes: Node[] = useMemo(() => {
    if (!knowledgeNodes.length) return [];
    return knowledgeNodes.map((n, i) => ({
      id: n.id,
      type: "knowledge",
      position: { x: (i % 3) * 220 + 40, y: Math.floor(i / 3) * 160 + 40 },
      data: {
        label: n.label,
        difficulty: n.difficulty,
        status: result.gapNodes.includes(n.id)
          ? "gap"
          : result.strongNodes.includes(n.id)
          ? "strong"
          : "default",
      },
    }));
  }, [knowledgeNodes, result]);

  const graphEdges: Edge[] = [];

  const handleStartPath = async () => {
    setSaving(true);
    try {
      // In production this would PATCH the enrollment to set recommendedPath
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Your personalized path is set! Starting now…");
      onStartPath?.();
      router.push(`/dashboard`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasGraph = graphNodes.length > 0;
  const hasGaps = result.gapNodes.length > 0;

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-glow-violet"
          >
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-heading font-extrabold text-white mb-2">
            Diagnostic Complete
          </h1>
          <p className="text-white/50 text-lg">
            We've mapped your knowledge footprint
          </p>
        </motion.div>

        {/* Score + Graph + Results */}
        <div className={`grid gap-8 ${hasGraph ? "lg:grid-cols-2" : "lg:grid-cols-1 max-w-2xl mx-auto"}`}>

          {/* LEFT: Graph (or score-only if no nodes configured) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <ScoreCircle score={result.score} />

            {hasGraph ? (
              <div className="h-[420px] rounded-2xl overflow-hidden border border-white/5">
                <CourseGraph
                  nodes={graphNodes as any}
                  edges={graphEdges}
                  courseId={courseId}
                  editable={false}
                />
              </div>
            ) : (
              <div className="glass-dark border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-white/40 text-sm">Knowledge graph visualization available once course nodes are configured.</p>
              </div>
            )}
          </motion.div>

          {/* RIGHT: Gaps, Strengths, Path */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* AI Explanation */}
            {result.explanation && (
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-600/30 flex items-center justify-center shrink-0">
                    <Map className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-300 mb-1">EdAI Analysis</p>
                    <p className="text-sm text-white/70 leading-relaxed italic">"{result.explanation}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gaps */}
            {hasGaps ? (
              <div>
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  Your Knowledge Gaps ({result.gapNodes.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.gapNodes.map((id) => {
                    const node = knowledgeNodes.find((n) => n.id === id);
                    return (
                      <motion.span
                        key={id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        {node?.label ?? id}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-sm text-green-300 font-medium">No significant gaps detected — great foundation!</p>
              </div>
            )}

            {/* Strengths */}
            {result.strongNodes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Your Strengths ({result.strongNodes.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.strongNodes.map((id) => {
                    const node = knowledgeNodes.find((n) => n.id === id);
                    return (
                      <span
                        key={id}
                        className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        ✓ {node?.label ?? id}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended Path */}
            {result.recommendedPath.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-accent-400" />
                    Recommended Learning Path
                  </h3>
                  <button
                    onClick={() => setMode(mode === "customize" ? "view" : "customize")}
                    className="text-xs text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {mode === "customize" ? "Done" : "Customize"}
                  </button>
                </div>

                <div className="space-y-2 relative">
                  {/* Connecting line */}
                  <div className="absolute left-[27px] top-6 bottom-6 w-px bg-white/10" />
                  {path.map((label, i) => (
                    <AnimatePresence key={label}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        {mode === "customize" ? (
                          <PathItem label={label} index={i} />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full border border-accent-500/50 bg-dark-100 flex items-center justify-center text-[10px] font-bold text-accent-400 shrink-0 z-10">
                              {i + 1}
                            </div>
                            <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white/80">
                              {label}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleStartPath}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold h-12 shadow-glow-violet"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Start Recommended Path
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
