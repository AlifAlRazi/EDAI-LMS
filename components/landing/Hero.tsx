"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Network, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background styling */}
      <div className="absolute inset-0 bg-dark z-0" />
      <div className="absolute inset-0 bg-grid opacity-20 z-0" />

      {/* Animated Orbs */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary-600/30 rounded-full blur-[120px] animate-float z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent-600/20 rounded-full blur-[150px] animate-float-slow z-0 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left: Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                Learn What You&apos;re Missing. <br className="hidden sm:block" />
                <span className="text-gradient-primary">Not What You Already Know.</span>
              </h1>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <p className="font-sans text-lg sm:text-xl text-white/60 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                EdAI uses Knowledge Graphs and AI to detect your knowledge gaps and build a 
                personalized learning path — just for you.
              </p>
            </motion.div>

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white border-0 shadow-glow-violet w-full sm:w-auto rounded-xl">
                  Start Learning Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/20 text-white hover:bg-white/5 w-full sm:w-auto rounded-xl bg-transparent">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="mt-12 flex items-center justify-center lg:justify-start gap-8"
            >
              {[
                { label: "Learners", value: "2,400+" },
                { label: "Courses", value: "150+" },
                { label: "Gap Detection Accuracy", value: "98%" },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="font-heading text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="font-sans text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: 3D Tilt Card Demo */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:block relative"
          >
            <div className={cn(
               "absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-accent-600/20",
               "rounded-3xl blur-2xl transform -rotate-3 scale-105"
            )} />
            
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              className="relative glass-dark p-8 rounded-3xl border border-white/10 shadow-2xl aspect-[4/3] flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Network className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-white font-heading font-semibold">Knowledge Graph AI</h3>
                  <p className="text-xs text-white/50">Analyzing learning gaps...</p>
                </div>
              </div>

              {/* Fake UI for visual appeal */}
              <div className="flex-1 relative border border-white/5 rounded-xl bg-dark/50 overflow-hidden font-sans">
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                  
                  {/* Edges - Background Network */}
                  <line x1="50" y1="15" x2="20" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                  <line x1="50" y1="15" x2="80" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                  <line x1="20" y1="85" x2="20" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                  <line x1="20" y1="85" x2="80" y2="85" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                  <line x1="80" y1="85" x2="80" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                  
                  {/* Edges - Converging to Gap */}
                  <line x1="20" y1="40" x2="50" y2="60" stroke="rgba(239,68,68,0.4)" strokeWidth="0.8" strokeDasharray="2 1" className="animate-pulse" />
                  <line x1="80" y1="85" x2="50" y2="60" stroke="rgba(239,68,68,0.4)" strokeWidth="0.8" strokeDasharray="2 1" className="animate-pulse" />
                  <line x1="80" y1="40" x2="50" y2="60" stroke="rgba(239,68,68,0.4)" strokeWidth="0.8" strokeDasharray="2 1" className="animate-pulse" />
                  
                  {/* Main Nodes */}
                  <circle cx="50" cy="15" r="5" fill="#4f46e5" />
                  <circle cx="20" cy="40" r="5" fill="#6d28d9" />
                  <circle cx="80" cy="40" r="5" fill="#7c3aed" />
                  <circle cx="20" cy="85" r="5" fill="#4338ca" />
                  <circle cx="80" cy="85" r="5" fill="#5b21b6" />
                  
                  {/* Gap Node (Red/Accent) - Earthquake / Ping Effect */}
                  <motion.circle 
                    cx="50" cy="60" r="6" fill="#ef4444" 
                    animate={{ 
                      x: [0, -1, 1, -1, 1, 0], 
                      y: [0, 1, -1, 1, -1, 0] 
                    }}
                    transition={{ 
                      duration: 0.3, 
                      repeat: Infinity, 
                      repeatDelay: 1.5 
                    }}
                  />
                  <motion.circle 
                    cx="50" cy="60" r="10" fill="none" stroke="#ef4444" strokeWidth="0.5"
                    style={{ transformOrigin: "50px 60px" }}
                    animate={{ 
                      scale: [1, 2], 
                      opacity: [0.8, 0] 
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      ease: "easeOut" 
                    }}
                  />
                </svg>
                
                {/* Floating Node Labels */}
                <div className="absolute top-[8%] left-[50%] -translate-x-1/2 text-[10px] text-white/90 bg-dark px-2 py-0.5 border border-white/10 rounded font-medium shadow-lg">Artificial Intelligence</div>
                <div className="absolute top-[33%] left-[20%] -translate-x-1/2 text-[10px] text-white/90 bg-dark px-2 py-0.5 border border-white/10 rounded font-medium shadow-lg">Machine Learning</div>
                <div className="absolute top-[33%] left-[80%] -translate-x-1/2 text-[10px] text-white/90 bg-dark px-2 py-0.5 border border-white/10 rounded font-medium shadow-lg">RAG Architecture</div>
                <div className="absolute top-[78%] left-[20%] -translate-x-1/2 text-[10px] text-white/90 bg-dark px-2 py-0.5 border border-white/10 rounded font-medium shadow-lg">Python</div>
                <div className="absolute top-[78%] left-[80%] -translate-x-1/2 text-[10px] text-white/90 bg-dark px-2 py-0.5 border border-white/10 rounded font-medium shadow-lg">Neural Networks</div>
                
                {/* Gap Label */}
                <motion.div 
                  className="absolute top-[68%] left-[50%] -translate-x-1/2 text-[11px] text-red-400 bg-red-500/10 px-3 py-1 border border-red-500/30 rounded-full font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)] whitespace-nowrap"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Gap Detected: Deep Learning
                </motion.div>
                
                {/* Edge Relationship Labels (Simulating the user's screenshot) */}
                <div className="absolute top-[28%] left-[35%] -translate-x-1/2 -translate-y-1/2 text-[7px] text-white/40 uppercase tracking-wider rotate-[-35deg]">Includes</div>
                <div className="absolute top-[28%] left-[65%] -translate-x-1/2 -translate-y-1/2 text-[7px] text-white/40 uppercase tracking-wider rotate-[35deg]">Enables</div>
                <div className="absolute top-[85%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-[7px] text-white/40 uppercase tracking-wider">Foundation</div>
                
                <div className="absolute top-[50%] left-[35%] -translate-x-1/2 -translate-y-1/2 text-[7px] text-red-400/70 uppercase tracking-wider rotate-[35deg]">Missing Prereq</div>
                <div className="absolute top-[50%] left-[65%] -translate-x-1/2 -translate-y-1/2 text-[7px] text-red-400/70 uppercase tracking-wider rotate-[-35deg]">Missing Prereq</div>

              </div>

            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
