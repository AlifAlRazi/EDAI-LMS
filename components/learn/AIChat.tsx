"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, X, BookOpen, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { lessonTitle: string; chunk: string }[];
  streaming?: boolean;
}

interface AIChatProps {
  courseId: string;
  lessonId?: string;
  lessonTitle?: string;
  onClose?: () => void;
}

// Animated typing indicator
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export default function AIChat({ courseId, lessonId, lessonTitle, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your EdAI tutor${lessonTitle ? ` for **${lessonTitle}**` : ""}. Ask me anything about the course material and I'll answer using the lesson content. 🎓`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setError(null);

    const userMsg: Message = { role: "user", content: text };
    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId,
          message: text,
          // Only send last 8 messages as history (exclude current empty assistant placeholder)
          conversationHistory: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.delta) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + data.delta,
                };
              }
              return updated;
            });
          }

          if (data.done) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "assistant") {
                updated[updated.length - 1] = {
                  ...last,
                  streaming: false,
                  sources: data.sources ?? [],
                };
              }
              return updated;
            });
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setMessages((prev) => prev.slice(0, -1)); // Remove the empty assistant placeholder
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }, [input, isStreaming, messages, courseId, lessonId]);

  // Submit on Enter (Shift+Enter = new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-dark-100 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-gradient-to-r from-primary-900/30 to-accent-900/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Tutor</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-green-400">Online</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-primary-600 to-accent-600"
                  : "bg-white/10"
              }`}>
                {msg.role === "assistant"
                  ? <Bot className="w-3.5 h-3.5 text-white" />
                  : <User className="w-3.5 h-3.5 text-white/60" />
                }
              </div>

              <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {/* Bubble */}
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-tr-sm"
                    : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
                }`}>
                  {msg.streaming && !msg.content ? (
                    <TypingIndicator />
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        code: ({ children }) => <code className="bg-black/30 px-1 rounded text-xs font-mono">{children}</code>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mt-1">{children}</ul>,
                        li: ({ children }) => <li className="text-white/80">{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>

                {/* Source citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {msg.sources.slice(0, 3).map((src, si) => (
                      <div
                        key={si}
                        title={src.chunk}
                        className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-md px-2 py-1 text-[10px] text-white/50 hover:text-white/70 hover:border-white/20 transition-colors cursor-default"
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                        {src.lessonTitle}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 bg-dark shrink-0">
        <div className="flex gap-2 items-end bg-dark-100 border border-white/10 rounded-xl px-3 py-2 focus-within:border-primary-500/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this lesson…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 resize-none outline-none max-h-28 leading-relaxed disabled:opacity-50"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 112)}px`;
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-primary-500 hover:to-accent-500 transition-all"
          >
            {isStreaming ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-white/25 text-center mt-1.5">⏎ to send · Shift+⏎ for new line</p>
      </div>
    </div>
  );
}
