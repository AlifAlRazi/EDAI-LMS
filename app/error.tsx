"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GLOBAL_ERROR]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-white">Something went wrong</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            An unexpected error occurred. Don't worry — your progress is saved.
          </p>
          {error.digest && (
            <p className="text-white/20 text-xs font-mono">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
