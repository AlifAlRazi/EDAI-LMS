"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ChevronRight, Activity, Map } from "lucide-react";

export default function QuizClient({ courseId, quiz, pastResult }: any) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(pastResult || null);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentIdx];
  const isFinished = currentIdx >= questions.length;

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(curr => curr + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API logic to POST /api/quiz/diagnostic
    setTimeout(() => {
      setResults({
        score: 50,
        gapNodes: ["q2_concept"],
        studyPath: ["Introduction to Graphs", "Graph Theory Basics"],
        explanation: "I noticed you struggled with relationships between entities. Let's trace back to 'Graph Theory Basics' so you can build a stronger foundation before mapping dense knowledge vectors."
      });
      setIsSubmitting(false);
      setCurrentIdx(questions.length); // Push to results view
    }, 1500);
  };

  // IF ALREADY COMPLETED OR JUST FINISHED -> SHOW RESULTS SUMMARY
  if (results) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-dark-100 border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-primary-600 to-accent-600 flex items-center justify-center p-[2px] mb-4">
            <div className="w-full h-full bg-dark rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-primary-500/20" />
              <span className="text-2xl font-bold text-white relative z-10">{results.score}%</span>
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Analysis Complete</h1>
          <p className="text-white/60">We've mapped your knowledge footprint.</p>
        </div>

        {results.gapNodes?.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Knowledge Gaps Detected</h3>
                <p className="text-sm text-red-200/80">We found {results.gapNodes.length} areas requiring reinforcement.</p>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded-lg mt-4 mb-6">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                <p className="text-sm text-white/80 italic">"{results.explanation}" - EdAI</p>
              </div>
            </div>

            <div className="space-y-3 relative pb-4">
              <h4 className="text-sm font-semibold text-white/50 uppercase tracking-widest pl-2 mb-3">Your Recommended Path</h4>
              <div className="absolute left-[11px] top-9 bottom-4 w-px bg-white/10" />
              {results.studyPath?.map((path: string, i: number) => (
                <div key={i} className="flex items-center gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-dark-100 border border-accent-500 flex items-center justify-center text-[10px] font-bold text-accent-400 shrink-0">
                    {i + 1}
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white flex-1">
                    {path}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white"
            onClick={() => router.push(`/dashboard`)}
          >
            Start My Path <Map className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // STANDARD QUIZ VIEW
  return (
    <div className="max-w-3xl w-full">
      {/* Progress */}
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
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-full transition-all duration-300"
            style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
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
          transition={{ duration: 0.3 }}
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
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-primary-400 bg-primary-400" : "border-white/30"
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-base flex-1 ${isSelected ? "text-primary-100 font-medium" : ""}`}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!answers[currentQuestion?._id] || isSubmitting}
          className="bg-primary-600 hover:bg-primary-500 text-white w-40 shadow-glow-violet h-12 text-lg"
        >
          {isSubmitting ? (
             <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : currentIdx === questions.length - 1 ? "Submit" : (
            <>Next <ChevronRight className="w-5 h-5 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
