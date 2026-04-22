"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from "recharts";
import {
  Flame, Trophy, BookOpen, Clock, Zap, Target, TrendingUp,
  AlertCircle, CheckCircle2, Star, Award, ChevronRight,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CourseProgress {
  courseId: string;
  title: string;
  thumbnail: string | null;
  slug: string;
  category: string;
  completionPercentage: number;
  lessonsCompleted: number;
  totalTimeSpent: number;
  quizAttempts: { score: number; completedAt: string }[];
  gapNodes: string[];
  strongNodes: string[];
}

interface AnalyticsData {
  summary: {
    totalLessons: number;
    totalHours: number;
    streak: number;
    avgScore: number;
    coursesEnrolled: number;
  };
  courses: CourseProgress[];
  heatmap: Record<string, number>;
}

// ─── Achievement Badges ────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  { id: "first_lesson", icon: "📖", label: "First Lesson", desc: "Completed your first lesson", color: "#7c3aed" },
  { id: "gap_filled", icon: "🧠", label: "Gap Filler", desc: "Filled a knowledge gap", color: "#4f46e5" },
  { id: "quiz_ace", icon: "🎯", label: "Quiz Ace", desc: "Scored 90%+ on a quiz", color: "#0ea5e9" },
  { id: "streak_7", icon: "🔥", label: "7-Day Streak", desc: "Learned 7 days in a row", color: "#f97316" },
  { id: "course_complete", icon: "🏆", label: "Graduate", desc: "Completed a full course", color: "#eab308" },
  { id: "night_owl", icon: "🦉", label: "Night Owl", desc: "Studied after midnight", color: "#8b5cf6" },
];

// ─── Heatmap Component ─────────────────────────────────────────────────────────

function ActivityHeatmap({ heatmap }: { heatmap: Record<string, number> }) {
  const weeks = 26;
  const today = new Date();
  const days: { date: string; count: number }[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().split("T")[0];
      days.push({ date: key, count: heatmap[key] ?? 0 });
    }
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return "bg-white/[0.04]";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "bg-primary-800/60";
    if (intensity < 0.5) return "bg-primary-700";
    if (intensity < 0.75) return "bg-primary-600";
    return "bg-primary-500";
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  days.forEach((d, i) => {
    const m = new Date(d.date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ label: months[m], col: Math.floor(i / 7) });
      lastMonth = m;
    }
  });

  return (
    <div className="w-full overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-1 pl-6" style={{ gap: 3 }}>
        {Array.from({ length: weeks }, (_, w) => {
          const label = monthLabels.find((m) => m.col === w);
          return (
            <div key={w} style={{ width: 14 }} className="text-[9px] text-white/30 shrink-0">
              {label?.label ?? ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col justify-between pr-1" style={{ gap: 3 }}>
          {["M", "W", "F"].map((d) => (
            <span key={d} className="text-[9px] text-white/20 h-[14px] leading-[14px]">{d}</span>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-flow-col gap-0.5" style={{ gridTemplateRows: "repeat(7, 14px)" }}>
          {days.map((d, i) => (
            <div
              key={i}
              title={`${d.date}: ${d.count} lesson${d.count !== 1 ? "s" : ""}`}
              className={`w-[14px] h-[14px] rounded-sm ${getColor(d.count)} transition-colors cursor-default`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Radial Progress Card ──────────────────────────────────────────────────────

function CourseRadialCard({ course }: { course: CourseProgress }) {
  const pct = course.completionPercentage;
  const lastScore = course.quizAttempts.at(-1)?.score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-100 border border-white/5 rounded-2xl p-5 flex gap-4 hover:border-white/10 transition-colors"
    >
      {/* Radial chart */}
      <div className="w-16 h-16 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="60%"
            outerRadius="100%"
            data={[{ value: pct, fill: pct > 70 ? "#22c55e" : pct > 40 ? "#f59e0b" : "#7c3aed" }]}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar background={{ fill: "rgba(255,255,255,0.04)" }} dataKey="value" cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{course.title}</p>
        <p className="text-xs text-white/40 mb-2">{course.category}</p>
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>{pct}% complete</span>
          <span>·</span>
          <span>{course.lessonsCompleted} lessons</span>
          {lastScore !== undefined && (
            <>
              <span>·</span>
              <span className={lastScore >= 70 ? "text-green-400" : "text-amber-400"}>
                Last quiz: {lastScore}%
              </span>
            </>
          )}
        </div>
      </div>

      <Link href={`/courses/${course.slug}`} className="self-center text-white/20 hover:text-primary-400 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </Link>
    </motion.div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-xs text-white shadow-2xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
}

// ─── Main Progress Page ────────────────────────────────────────────────────────

export default function ProgressClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, courses, heatmap } = data;

  // Build quiz performance chart data
  const quizChartData = courses
    .flatMap((c) =>
      c.quizAttempts.map((qa, i) => ({
        name: `${c.title.slice(0, 12)}… #${i + 1}`,
        score: qa.score,
        date: new Date(qa.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      }))
    )
    .slice(-12);

  // Earned achievements (logic based on real data)
  const earnedIds = new Set<string>();
  if (summary.totalLessons >= 1) earnedIds.add("first_lesson");
  if (courses.some((c) => c.gapNodes.length > 0 && c.completionPercentage > 20)) earnedIds.add("gap_filled");
  if (courses.some((c) => c.quizAttempts.some((q) => q.score >= 90))) earnedIds.add("quiz_ace");
  if (summary.streak >= 7) earnedIds.add("streak_7");
  if (courses.some((c) => c.completionPercentage >= 100)) earnedIds.add("course_complete");

  // All gap nodes across all courses
  const allGaps = Array.from(new Set(courses.flatMap((c) => c.gapNodes)));

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-white">Learning Progress</h1>
        <p className="text-white/40 mt-1">Your complete learning analytics dashboard</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: BookOpen, label: "Lessons Done", value: summary.totalLessons, color: "text-primary-400" },
          { icon: Clock, label: "Hours Learned", value: summary.totalHours, color: "text-accent-400" },
          { icon: Flame, label: "Day Streak", value: summary.streak, color: "text-orange-400", suffix: "🔥" },
          { icon: Target, label: "Avg Quiz Score", value: `${summary.avgScore}%`, color: "text-green-400" },
          { icon: TrendingUp, label: "Courses Enrolled", value: summary.coursesEnrolled, color: "text-blue-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-dark-100 border border-white/5 rounded-2xl p-5 flex flex-col gap-2"
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div className="text-2xl font-heading font-extrabold text-white">
              {stat.value}{stat.suffix}
            </div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main grid: Heatmap + Achievements */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Activity Heatmap */}
        <div className="lg:col-span-2 bg-dark-100 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Learning Activity</h2>
              <p className="text-xs text-white/40 mt-0.5">Last 26 weeks</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span>Less</span>
              {["bg-white/[0.04]", "bg-primary-800/60", "bg-primary-600", "bg-primary-500"].map((c) => (
                <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
              <span>More</span>
            </div>
          </div>
          <ActivityHeatmap heatmap={heatmap} />
        </div>

        {/* Achievements */}
        <div className="bg-dark-100 border border-white/5 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Achievements</h2>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const earned = earnedIds.has(a.id);
              return (
                <div
                  key={a.id}
                  title={`${a.label}: ${a.desc}`}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                    earned
                      ? "bg-white/[0.04] border-white/10"
                      : "bg-white/[0.01] border-white/[0.04] opacity-40 grayscale"
                  }`}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-[10px] text-white/60 font-medium leading-tight">{a.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quiz Performance Chart */}
      {quizChartData.length > 0 && (
        <div className="bg-dark-100 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Quiz Performance</h2>
              <p className="text-xs text-white/40 mt-0.5">Last {quizChartData.length} attempts</p>
            </div>
            <div className="flex items-center gap-2">
              {(["week", "month", "all"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                    period === p ? "bg-primary-600 text-white" : "text-white/40 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={quizChartData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="score" name="Score %" stroke="#7c3aed" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: "#7c3aed", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Course cards */}
      {courses.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Course Progress</h2>
          <div className="space-y-3">
            {courses.map((c) => <CourseRadialCard key={c.courseId} course={c} />)}
          </div>
        </div>
      )}

      {/* Weak Areas */}
      {allGaps.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-semibold text-white">Your Weak Areas</h2>
          </div>
          <p className="text-white/50 text-sm mb-4">These topics were flagged as knowledge gaps in your diagnostic tests.</p>
          <div className="flex flex-wrap gap-2">
            {allGaps.map((gap) => (
              <span
                key={gap}
                className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full text-xs font-medium"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {gap}
              </span>
            ))}
          </div>
          <Link href="/courses" className="mt-4 inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
            Find courses to fill these gaps <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
