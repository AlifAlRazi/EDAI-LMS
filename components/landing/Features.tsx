"use client";

import { motion } from "framer-motion";
import { GitGraph, BrainCircuit, PenTool, Focus, Eye, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: GitGraph,
    title: "Knowledge Graph Mapping",
    description: "Visual prerequisite trees for every course. See exactly how concepts connect before you start learning.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    borderColor: "group-hover:border-blue-500/50",
  },
  {
    icon: BrainCircuit,
    title: "Gap Detection AI",
    description: "Identifies missing prerequisite knowledge using diagnostic tests tailored to your specific goals.",
    color: "text-accent-400",
    bg: "bg-accent-500/10",
    borderColor: "group-hover:border-accent-500/50",
  },
  {
    icon: PenTool,
    title: "Adaptive Quizzes",
    description: "RAG-powered questions automatically generated from your course material to ensure you've mastered the content.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    borderColor: "group-hover:border-green-500/50",
  },
  {
    icon: Focus,
    title: "Personalized Paths",
    description: "Learning order instantly customized to prioritize gaps. Learn what you need, skip what you already know.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    borderColor: "group-hover:border-orange-500/50",
  },
  {
    icon: Eye,
    title: "Transparent AI",
    description: "No black boxes. See exactly WHY the AI recommends each resource based on your graph analysis.",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    borderColor: "group-hover:border-pink-500/50",
  },
  {
    icon: UserCog,
    title: "Instructor Control",
    description: "Teachers can review, modify, and approve AI generation to guarantee the highest pedagogical quality.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    borderColor: "group-hover:border-purple-500/50",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-dark-100 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
            Intelligence Built-In
          </h2>
          <p className="font-sans text-white/60 text-lg">
            EdAI brings state-of-the-art LLM and graph technology directly into your learning flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "group relative p-8 rounded-2xl glass-dark border border-white/5 transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-2xl hover:bg-white/[0.02]",
                feature.borderColor
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110",
                  feature.bg
                )}
              >
                <feature.icon className={cn("w-6 h-6", feature.color)} />
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="font-sans text-white/50 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
