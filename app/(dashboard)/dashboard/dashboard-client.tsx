"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, ArrowRight, PlayCircle, BookOpen, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardClientProps {
  userName: string;
  enrollments: any[];
}

export default function DashboardClient({ userName, enrollments }: DashboardClientProps) {
  // Check if any enrollment has active knowledge gaps from a diagnostic
  const gapEnrollments = enrollments.filter(e => e.diagnosticResult?.gapNodes?.length > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-heading font-bold text-white">Good morning, {userName} 👋</h1>
        <p className="text-white/60 mt-2">Ready to pick up where you left off?</p>
      </motion.div>

      {/* Gap Alerts */}
      {gapEnrollments.map((enr, i) => (
        <motion.div key={`gap-${i}`} variants={itemVariants} className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h3 className="text-white font-medium">Knowledge Gaps Detected</h3>
              <p className="text-sm text-red-200">
                You have {enr.diagnosticResult.gapNodes.length} missing prerequisites in <span className="font-semibold">{enr.courseId.title}</span>.
              </p>
            </div>
          </div>
          <Link href={`/learn/${enr.courseId._id}/personalized`} className="w-full sm:w-auto">
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white w-full">
              Fill Gaps First <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      ))}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <motion.h2 variants={itemVariants} className="text-xl font-heading font-semibold text-white">Your Learning Paths</motion.h2>
          
          {enrollments.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center p-12 glass-dark rounded-xl border border-white/10">
              <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">You aren&apos;t enrolled in any courses yet.</h3>
              <p className="text-white/50 mb-6">Discover a new learning path driven by cutting-edge AI.</p>
              <Link href="/courses">
                <Button className="bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                  Browse Catalog
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {enrollments.map((enr) => (
                <motion.div key={enr._id} variants={itemVariants} className="glass-dark border border-white/10 rounded-2xl overflow-hidden group">
                  <div className="h-32 bg-dark-100 relative overflow-hidden">
                    {enr.courseId.thumbnail ? (
                      <img src={enr.courseId.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-accent-900/50" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-dark to-transparent" />
                  </div>
                  
                  <div className="p-5">
                    <div className="text-xs text-primary-400 font-medium mb-1 uppercase tracking-wider">{enr.courseId.category}</div>
                    <h3 className="text-lg font-heading font-bold text-white mb-4 line-clamp-1">{enr.courseId.title}</h3>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/50">Overall Progress</span>
                        <span className="text-white font-medium">{enr.completionPercentage || 0}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${enr.completionPercentage || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <Link href={`/courses/${enr.courseId.slug}`}>
                      <Button className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 group-hover:border-primary-500/50 transition-colors">
                        <PlayCircle className="w-4 h-4 mr-2 text-primary-400" />
                        Continue Learning
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Activity & Stats */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="glass-dark border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-heading font-semibold text-white mb-6">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Activity className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm text-white/50">Active Streak</div>
                  <div className="text-xl font-bold text-white">3 Days</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-white/50">Learning Time</div>
                  <div className="text-xl font-bold text-white">12.5 hrs</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-dark border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-heading font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <p className="text-sm text-white/50 italic text-center py-4">No recent activity detected.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
