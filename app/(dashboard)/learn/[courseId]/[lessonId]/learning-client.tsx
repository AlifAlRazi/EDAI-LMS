"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, MessageSquare, PlayCircle, FileText, CheckCircle2, ChevronRight, Send, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LearningClient({ course, activeLesson, completedLessonIds, gapNodes }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: "assistant", content: `Hi! I'm your EdAI tutor. Ask me anything about "${activeLesson?.title || 'this lesson'}" and I'll use the course material to answer.` }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: chatInput }]);
    setChatInput("");
    // Mock simulation of AI response based on RAG
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Based on the course knowledge graph, that's an excellent question. To summarize what we covered in ${activeLesson?.title}: AI Gap detection analyzes your prerequisites directly. Is there a specific part of the concept you'd like me to re-explain?`
      }]);
    }, 1000);
  };

  if (!activeLesson) {
    return <div className="text-white p-6">Lesson not found.</div>;
  }

  return (
    <div className="flex h-full w-full relative">
      
      {/* LEFT: Curriculum Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r border-white/5 bg-dark-100 flex flex-col shrink-0 overflow-hidden h-full z-10"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
              <h3 className="font-heading font-semibold text-white truncate">{course.title}</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white lg:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto w-[320px]">
              {course.modules?.map((mod: any, mIdx: number) => (
                <div key={mIdx}>
                  <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 text-xs font-semibold text-white/50 uppercase tracking-widest sticky top-0 backdrop-blur-md">
                    Module {mIdx + 1}: {mod.title}
                  </div>
                  <div className="divide-y divide-white/5">
                    {mod.lessons?.map((les: any, lIdx: number) => {
                      const isActive = les.id === activeLesson.id;
                      const isCompleted = completedLessonIds.includes(les.id);
                      // In a real app we cross-check les.knowledgeNodeId with gapNodes array
                      const isGap = gapNodes?.includes('dummy-logic') || (mIdx === 0 && lIdx === 1); // Mock dummy gap indicator

                      return (
                        <Link key={les.id} href={`/learn/${course._id}/${les.id}`}>
                          <div className={`px-4 py-3 flex gap-3 hover:bg-white/[0.03] transition-colors relative ${isActive ? "bg-white/5" : ""}`}>
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-accent-500" />}
                            
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : les.type === "video" ? (
                                <PlayCircle className={`w-4 h-4 ${isActive ? "text-primary-400" : "text-white/30"}`} />
                              ) : (
                                <FileText className={`w-4 h-4 ${isActive ? "text-primary-400" : "text-white/30"}`} />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <p className={`text-sm ${isActive ? "text-white font-medium" : "text-white/70"}`}>
                                {les.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-white/40">{les.duration || 5} min</span>
                                {isGap && !isCompleted && (
                                  <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-1.5 rounded-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    Gap Check
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER: Learning Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-dark/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-medium text-white">{activeLesson.title}</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setChatOpen(!chatOpen)}
            className={`border border-white/10 ${chatOpen ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Tutor Assistant
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          <div className="max-w-4xl w-full mx-auto space-y-6">
            
            {/* The actual lesson content surface */}
            <div className="aspect-video w-full bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center relative group shadow-2xl">
              {activeLesson.type === "video" ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <PlayCircle className="w-16 h-16 text-white/80 z-20 group-hover:scale-110 transition-transform cursor-pointer" />
                  <span className="absolute bottom-4 left-4 z-20 font-medium text-white text-lg">Click to play video mock</span>
                </>
              ) : (
                <div className="p-12 text-white/80 h-full w-full bg-dark-100 overflow-y-auto">
                  <h1 className="text-3xl font-bold mb-6 font-heading">{activeLesson.title}</h1>
                  <article className="prose prose-invert max-w-none font-sans">
                    <p>This is simulated markdown content for a document lesson.</p>
                    {activeLesson.content}
                  </article>
                </div>
              )}
            </div>

            <div className="p-6 glass-dark border border-white/10 rounded-xl">
              <h3 className="text-lg font-heading font-semibold text-white mb-2">Lesson Notes</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Understand the intricacies of {activeLesson.title}. Review the content above carefully as these concepts will be assessed dynamically inside the module RAG quiz.
              </p>
              <div className="flex justify-between items-center pt-6 border-t border-white/5">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                  <ChevronRight className="w-4 h-4 rotate-180 mr-2" /> Previous
                </Button>
                <div className="flex gap-3">
                  <Button className="bg-primary-600 hover:bg-primary-500 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
                  </Button>
                  <Button className="bg-white/10 hover:bg-white/20 text-white border-0">
                    Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center py-6">
               <Link href={`/learn/${course._id}/quiz/take`} className="inline-block">
                 <Button variant="outline" className="border-accent-500/50 text-accent-300 hover:bg-accent-500/10 uppercase tracking-widest text-xs font-bold h-10 w-full max-w-sm">
                   Simulate Module End Quiz →
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: AI Tutor Chat */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: 20 }}
            animate={{ width: 360, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 20 }}
            className="border-l border-white/5 bg-dark-100 flex flex-col shrink-0 overflow-hidden h-full z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-gradient-to-r from-dark-100 to-primary-900/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <h3 className="font-heading font-semibold text-white truncate text-sm">Course AI Tutor</h3>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 w-[360px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "assistant" 
                      ? "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
                      : "bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-lg rounded-tr-sm"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-dark w-[360px]">
              <form onSubmit={handleChat} className="relative">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about this lesson..."
                  className="w-full bg-dark-100 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary-500/50 transition-colors pr-10"
                />
                <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-white/10 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
              <p className="text-[10px] text-white/30 text-center mt-2">AI can make mistakes. Verify critical facts.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
