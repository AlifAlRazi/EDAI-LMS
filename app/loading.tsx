export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated brain logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-glow-violet">
            <svg className="w-8 h-8 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 animate-ping opacity-20" />
        </div>

        {/* Skeleton cards */}
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-48 h-32 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <p className="text-white/30 text-sm animate-pulse">Loading EdAI…</p>
      </div>
    </div>
  );
}
