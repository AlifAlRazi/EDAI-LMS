"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CreateCourseClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const { courseId } = await res.json();
      router.push(`/admin/courses/${courseId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create course");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/admin/courses" className="inline-flex items-center text-sm text-white/50 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Link>
        <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-400" />
          Create New Course
        </h1>
        <p className="text-white/50 mt-2">Start by providing a title and basic description. You can use the AI generator later.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-100 border border-white/5 rounded-2xl p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Course Title</label>
            <Input
              required
              placeholder="e.g., Introduction to Machine Learning"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-dark border-white/10 text-white text-lg py-6"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">Short Description</label>
            <Textarea
              required
              placeholder="Briefly describe what students will learn..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-dark border-white/10 text-white min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-white/30 text-right">{formData.description.length}/500</p>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <Link href="/admin/courses">
              <Button type="button" variant="ghost" className="text-white/60 hover:text-white">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !formData.title || !formData.description}
              className="bg-primary-600 hover:bg-primary-500 text-white min-w-[140px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create & Continue"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
