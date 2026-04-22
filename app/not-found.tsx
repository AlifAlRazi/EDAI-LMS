import { motion } from "framer-motion";
import Link from "next/link";
import { Home, BookOpen, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-700/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent-700/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-8 max-w-lg">
        {/* 404 number */}
        <div className="relative">
          <div className="text-[10rem] font-heading font-extrabold leading-none select-none"
               style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            404
          </div>
          <div className="absolute inset-0 text-[10rem] font-heading font-extrabold leading-none text-white/[0.03] select-none">
            404
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-heading font-bold text-white">Page Not Found</h1>
          <p className="text-white/50 leading-relaxed">
            Looks like you've ventured off the knowledge graph. This page doesn't exist — but your learning path does.
          </p>
        </div>

        {/* Knowledge graph decorative nodes */}
        <div className="flex justify-center items-center gap-3 py-2">
          {["Calculus", "ML Basics", "Python"].map((label, i) => (
            <div
              key={label}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-white/40 border border-white/10 bg-white/[0.02]"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-glow-violet"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/courses"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
