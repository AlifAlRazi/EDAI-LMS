import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { Search, Clock, Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CourseCatalogPage() {
  headers(); // Force dynamic execution
  await connectDB();

  // In a real app we would add pagination and dynamic filtering using searchParams
  const courses = await Course.find({ isPublished: true })
    .populate("instructor", "name image")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-dark w-full flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-6">
          
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              Explore Learning Paths
            </h1>
            <p className="text-lg text-white/60">
              Discover AI-powered courses that adapt to what you already know. 
              Fill your knowledge gaps and master subjects faster.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-64 shrink-0 space-y-8">
              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input 
                    placeholder="Search courses..." 
                    className="pl-9 bg-dark-100 border-white/5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Categories</label>
                <div className="space-y-2">
                  {["All", "Computer Science", "Mathematics", "Business", "Design"].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 rounded border border-white/20 group-hover:border-primary-500 transition-colors flex items-center justify-center">
                        {cat === "All" && <div className="w-2 h-2 bg-primary-500 rounded-sm" />}
                      </div>
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 block">Level</label>
                <div className="space-y-2">
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <label key={lvl} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-4 h-4 rounded border border-white/20 group-hover:border-primary-500 transition-colors" />
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              <div className="mb-6 flex justify-between items-center bg-dark-100 border border-white/5 p-4 rounded-xl">
                <span className="text-sm text-white/50">Showing {courses.length} courses</span>
                <select className="bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none">
                  <option>Most Popular</option>
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                </select>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <Link href={`/courses/${course.slug}`} key={course._id.toString()} className="group block">
                    <div className="h-full glass-dark border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-white/10 hover:bg-white/[0.02] flex flex-col">
                      
                      {/* Image Thumbnail */}
                      <div className="relative h-48 bg-dark-100 overflow-hidden">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white/10" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30 backdrop-blur-md">
                            {course.category || "General"}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-heading text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                          {course.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                            {course.instructor?.image ? (
                              <img src={course.instructor.image} alt="" className="w-full h-full rounded-full" />
                            ) : (
                              <span className="text-[10px] text-white font-bold">{course.instructor?.name?.[0] || "?"}</span>
                            )}
                          </div>
                          <span className="text-xs text-white/60 truncate">{course.instructor?.name || "EdAI Instructor"}</span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.totalDuration || 5}h</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrollmentCount || 0}</span>
                          </div>
                          <div className="font-bold text-white">
                            {course.isFree ? "Free" : `$${course.price}`}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </Link>
                ))}
              </div>
              
              {courses.length === 0 && (
                <div className="text-center py-24 glass-dark rounded-xl border border-white/5">
                  <h3 className="text-xl font-medium text-white mb-2">No courses available yet</h3>
                  <p className="text-white/50">Check back soon for new learning paths!</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
