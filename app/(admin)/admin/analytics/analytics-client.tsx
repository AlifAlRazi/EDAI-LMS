"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Users, BookOpen, DollarSign, TrendingUp, AlertCircle, Target } from "lucide-react";

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
  };
  enrollmentTrend: { date: string; enrollments: number }[];
  courseScores: { title: string; avgScore: number }[];
  topGaps: { node: string; count: number }[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark border border-white/10 rounded-xl px-3 py-2 text-xs shadow-2xl">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? "#7c3aed" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

const SCORE_COLORS = ["#7c3aed", "#4f46e5", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function AdminAnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month">("month");

  useEffect(() => {
    fetch("/api/admin/analytics")
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

  const { summary, enrollmentTrend, courseScores, topGaps } = data;

  const trendData = period === "week" ? enrollmentTrend.slice(-7) : enrollmentTrend;

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-heading font-bold text-white">Platform Analytics</h1>
        <p className="text-white/40 mt-1">Real-time platform-wide insights</p>
      </motion.div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Users", value: summary.totalUsers.toLocaleString(), color: "text-blue-400", bg: "from-blue-600/10 to-blue-600/5" },
          { icon: BookOpen, label: "Published Courses", value: summary.totalCourses.toLocaleString(), color: "text-primary-400", bg: "from-primary-600/10 to-primary-600/5" },
          { icon: TrendingUp, label: "Total Enrollments", value: summary.totalEnrollments.toLocaleString(), color: "text-green-400", bg: "from-green-600/10 to-green-600/5" },
          { icon: DollarSign, label: "Revenue", value: `$${summary.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "text-amber-400", bg: "from-amber-600/10 to-amber-600/5" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${kpi.bg} border border-white/5 rounded-2xl p-6`}
          >
            <kpi.icon className={`w-5 h-5 ${kpi.color} mb-3`} />
            <p className="text-2xl font-heading font-extrabold text-white">{kpi.value}</p>
            <p className="text-xs text-white/40 mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Enrollment Trend */}
      <div className="bg-dark-100 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Enrollment Trend</h2>
            <p className="text-xs text-white/40 mt-0.5">New enrollments over time</p>
          </div>
          <div className="flex gap-2">
            {(["week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                  period === p ? "bg-primary-600 text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} interval={Math.floor(trendData.length / 7)} />
              <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#7c3aed" strokeWidth={2} fill="url(#enrollGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom grid: Avg Scores + Top Gaps */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Avg Quiz Score per Course */}
        <div className="bg-dark-100 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-4 h-4 text-green-400" />
            <h2 className="text-base font-semibold text-white">Avg Quiz Score by Course</h2>
          </div>
          {courseScores.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No quiz data yet</p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseScores} layout="vertical">
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="title" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgScore" name="Avg Score %" radius={[0, 4, 4, 0]}>
                    {courseScores.map((_, i) => (
                      <Cell key={i} fill={SCORE_COLORS[i % SCORE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Most Common Knowledge Gaps */}
        <div className="bg-dark-100 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <h2 className="text-base font-semibold text-white">Most Common Knowledge Gaps</h2>
          </div>
          {topGaps.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No diagnostic data yet</p>
          ) : (
            <div className="space-y-3">
              {topGaps.map((gap, i) => {
                const maxCount = topGaps[0].count;
                return (
                  <div key={gap.node} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-white/30 shrink-0 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">{gap.node}</span>
                        <span className="text-red-400 font-medium">{gap.count} students</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(gap.count / maxCount) * 100}%` }}
                          transition={{ delay: i * 0.07, duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
