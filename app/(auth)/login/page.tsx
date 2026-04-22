"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Network, BookOpen, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Animated background orbs ─────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orb */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-700/20 blur-[120px] animate-float" />
      {/* Accent orb */}
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-accent-700/20 blur-[100px] animate-float-slow" />
      {/* Bottom orb */}
      <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-primary-800/15 blur-[80px] animate-float-fast" />
      
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #7c3aed 1px, transparent 1px),
            linear-gradient(to bottom, #7c3aed 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

// ─── Floating knowledge node animation ────────────────────────────────────────

function KnowledgeGraphDemo() {
  const nodes = [
    { id: 1, label: "Calculus", x: 50, y: 20, color: "#7c3aed", delay: 0 },
    { id: 2, label: "Linear Algebra", x: 20, y: 55, color: "#3730a3", delay: 0.4 },
    { id: 3, label: "Statistics", x: 75, y: 55, color: "#6d28d9", delay: 0.8 },
    { id: 4, label: "ML Basics", x: 50, y: 80, color: "#4f46e5", delay: 1.2 },
    { id: 5, label: "Deep Learning", x: 50, y: 50, color: "#7c3aed", delay: 0.2 },
  ];

  const edges = [
    { from: { x: 50, y: 20 }, to: { x: 20, y: 55 } },
    { from: { x: 50, y: 20 }, to: { x: 75, y: 55 } },
    { from: { x: 20, y: 55 }, to: { x: 50, y: 80 } },
    { from: { x: 75, y: 55 }, to: { x: 50, y: 80 } },
  ];

  return (
    <div className="relative w-full h-64 select-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {edges.map((edge, i) => (
          <motion.line
            key={i}
            x1={`${edge.from.x}%`} y1={`${edge.from.y}%`}
            x2={`${edge.to.x}%`} y2={`${edge.to.y}%`}
            stroke="rgba(124,58,237,0.3)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: i * 0.3 + 0.5, duration: 1 }}
          />
        ))}
      </svg>
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: node.delay, type: "spring", stiffness: 200 }}
        >
          <div
            className="px-2 py-1 rounded-full text-[10px] font-sans font-medium text-white border whitespace-nowrap shadow-lg"
            style={{
              backgroundColor: `${node.color}33`,
              borderColor: `${node.color}66`,
              boxShadow: `0 0 12px ${node.color}44`,
            }}
          >
            {node.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Feature pills ─────────────────────────────────────────────────────────────

const features = [
  { icon: Network, label: "Knowledge Graph Mapping" },
  { icon: Brain, label: "Gap Detection AI" },
  { icon: Sparkles, label: "Adaptive Learning Paths" },
  { icon: BookOpen, label: "RAG-Powered Quizzes" },
];

// ─── Google sign-in button ─────────────────────────────────────────────────────

function GoogleButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "w-full h-12 flex items-center justify-center gap-3",
        "bg-white text-gray-800 hover:bg-gray-50",
        "font-sans font-medium text-sm border border-gray-200",
        "shadow-sm transition-all duration-200 hover:shadow-md",
        "rounded-xl relative overflow-hidden group"
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      ) : (
        <>
          {/* Google SVG logo */}
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>
          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </Button>
  );
}

// ─── Inner login content (uses useSearchParams — must be in Suspense) ─────────

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — Brand & Graph ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-100 border-r border-white/5 flex-col items-center justify-center px-12">
        <BackgroundOrbs />

        <div className="relative z-10 w-full max-w-md space-y-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-glow-violet">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-500 animate-pulse-glow" />
            </div>
            <span className="font-heading text-2xl font-bold text-white">EdAI</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="space-y-4"
          >
            <h1 className="font-heading text-4xl font-bold text-white leading-tight">
              Learn Smarter.{" "}
              <span className="text-gradient-primary">Fill Your Gaps.</span>
            </h1>
            <p className="font-sans text-white/50 text-base leading-relaxed">
              EdAI uses Knowledge Graphs and RAG to detect exactly what you&apos;re
              missing — then builds a personalized learning path just for you.
            </p>
          </motion.div>

          {/* Knowledge graph visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Network className="w-4 h-4 text-accent-400" />
              <span className="font-sans text-xs text-white/50 uppercase tracking-wider">
                Your Knowledge Graph
              </span>
            </div>
            <KnowledgeGraphDemo />
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-2 gap-3"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-2 glass rounded-lg px-3 py-2"
              >
                <feature.icon className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                <span className="font-sans text-xs text-white/60">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Sign In card ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-dark relative overflow-hidden">
        <BackgroundOrbs />

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-sm space-y-8"
        >
          {/* Mobile logo (shown only on small screens) */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-glow-violet">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-xl font-bold text-white">EdAI LMS</span>
          </div>

          {/* Card */}
          <div className="glass-dark rounded-2xl p-8 border border-white/10 shadow-glass space-y-6">
            {/* Header */}
            <div className="space-y-1 text-center">
              <h2 className="font-heading text-2xl font-bold text-white">
                Welcome back
              </h2>
              <p className="font-sans text-sm text-white/50">
                Sign in to continue your learning journey
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 font-sans"
              >
                {error === "OAuthAccountNotLinked"
                  ? "This email is already linked to another account."
                  : "Something went wrong. Please try again."}
              </motion.div>
            )}

            {/* Google button */}
            <GoogleButton loading={loading} onClick={handleSignIn} />

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-sans text-xs text-white/30">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Terms notice */}
            <p className="font-sans text-xs text-white/30 text-center leading-relaxed">
              By signing in, you agree to our{" "}
              <span className="text-accent-400 hover:underline cursor-pointer">Terms of Service</span>{" "}
              and{" "}
              <span className="text-accent-400 hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>

          {/* AI badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <Badge
              variant="outline"
              className="font-sans text-xs border-accent-700/50 text-accent-400 bg-accent-900/20 px-4 py-1.5 gap-2"
            >
              <Shield className="w-3 h-3" />
              Powered by Knowledge Graph AI
            </Badge>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-8 text-center"
          >
            {[
              { value: "2,400+", label: "Learners" },
            { value: "150+", label: "Courses" },
              { value: "98%", label: "Accuracy" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-sm font-bold text-white">{stat.value}</div>
                <div className="font-sans text-xs text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
