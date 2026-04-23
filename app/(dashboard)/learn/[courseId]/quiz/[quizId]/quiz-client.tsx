"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

// Dynamically import GapAnalysisResult (uses ReactFlow which needs browser)
const GapAnalysisResult = dynamic(() => import("@/components/quiz/GapAnalysisResult"), { ssr: false });

export default function QuizClient({ courseId, quiz, pastResult }: any) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(pastResult || null);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIdx];

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((curr) => curr + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const res = await fetch("/api/quiz/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          quizId: quiz._id === "diagnostic" ? "diagnostic" : quiz._id,
          answers,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("Failed to grade quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
      setCurrentIdx(questions.length);
    }
  };

  // Show the rich GapAnalysisResult once finished
  if (results) {
    return (
      <GapAnalysisResult
        courseId={courseId}
        result={results}
        // Pass course knowledge nodes if available
        knowledgeNodes={[
          { id: "ml-basics", label: "ML Basics", difficulty: "beginner" },
          { id: "graph-theory", label: "Graph Theory", difficulty: "intermediate" },
          { id: "vector-embeddings", label: "Vector Embeddings", difficulty: "intermediate" },
          { id: "knowledge-graphs", label: "Knowledge Graphs", difficulty: "advanced" },
          { id: "rag-systems", label: "RAG Systems", difficulty: "advanced" },
        ]}
      />
    );
  }

  // Quiz in progress
  return (
    <div className="max-w-3xl w-full">
      {/* Progress bar */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-white/50 uppercase tracking-widest">
            Question {currentIdx + 1} of {questions.length}
          </span>
          {quiz?.type === "diagnostic" && (
            <Badge className="bg-accent-500/20 text-accent-300 border-accent-500/30">Diagnostic</Badge>
          )}
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-full transition-all duration-500"
            style={{ width: `${(currentIdx / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-dark-100 border border-white/5 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500" />

          <h2 className="text-2xl md:text-3xl font-heading font-medium text-white mb-8 leading-tight">
            {currentQuestion?.questionText}
          </h2>

          <div className="space-y-4">
            {currentQuestion?.options?.map((opt: string, i: number) => {
              const isSelected = answers[currentQuestion._id] === opt;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [currentQuestion._id]: opt })}
                  className={`w-full text-left p-5 rounded-xl border flex items-center gap-4 transition-all duration-200 ${
                    isSelected
                      ? "bg-primary-500/10 border-primary-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                      : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20 text-white/80"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary-400 bg-primary-400" : "border-white/30"}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-base flex-1 ${isSelected ? "text-primary-100 font-medium" : ""}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Next / Submit */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!answers[currentQuestion?._id] || isSubmitting}
          className="bg-primary-600 hover:bg-primary-500 text-white w-40 shadow-glow-violet h-12 text-lg"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : currentIdx === questions.length - 1 ? (
            "Submit"
          ) : (
            <>Next <ChevronRight className="w-5 h-5 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
