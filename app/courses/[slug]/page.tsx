import { getSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Users, PlayCircle, BookOpen, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EnrollButton from "@/components/courses/EnrollButton";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    await connectDB();
    const course = await Course.findOne({ slug: params.slug }).select("title description category thumbnail price isFree").lean() as any;
    if (!course) return { title: "Course Not Found | EdAI LMS" };

    const price = course.isFree ? "Free" : course.price ? `$${(course.price / 100).toFixed(2)}` : "";
    const description = `${course.description?.slice(0, 155) ?? "AI-powered personalized course"} ${price ? `— ${price}` : ""}`;

    return {
      title: `${course.title} | EdAI LMS`,
      description,
      openGraph: {
        title: course.title,
        description,
        type: "article",
        images: course.thumbnail ? [{ url: course.thumbnail, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: course.title,
        description,
        images: course.thumbnail ? [course.thumbnail] : [],
      },
    };
  } catch {
    return { title: "EdAI LMS" };
  }
}


export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  headers(); // Force dynamic execution
  await connectDB();
  const session = await getSession();

  // Fetch full nested course definition
  const course = await Course.findOne({ slug: params.slug })
    .populate("instructor", "name image")
    .lean();

  if (!course || (!course.isPublished && session?.user?.role !== "admin")) {
    return notFound();
  }

  // Check enrollment
  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await Enrollment.findOne({ 
      userId: session.user.id, 
      courseId: course._id 
    }).lean();
    if (enrollment) isEnrolled = true;
  }

  // Calculate stats securely
  const totalLessons = course.modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-dark w-full flex flex-col">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative pt-32 pb-20 bg-dark-100 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          {course.thumbnail && (
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover opacity-10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-100 to-transparent" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-primary-500/20 text-primary-300 border border-primary-500/30">
                {course.category || "General"}
              </Badge>
              <Badge variant="outline" className="border-white/10 text-white/60">
                {course.level}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6 leading-tight">
              {course.title}
            </h1>
            
            <p className="text-lg text-white/60 mb-8 max-w-2xl leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                  {(course.instructor as any)?.image && (
                    <img src={(course.instructor as any).image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <span>Created by <span className="text-white font-medium">{(course.instructor as any)?.name || "Instructor"}</span></span>
              </div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.totalDuration || 5} hours total</div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {course.enrollmentCount || 0} students</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 flex-1">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Left: Course Content */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* What you'll learn */}
            <div className="glass-dark border border-white/5 p-8 rounded-2xl">
              <h2 className="text-2xl font-heading font-bold text-white mb-6">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Fallback rendering of graph concepts since standard "learning goals" array isn't mocked currently */}
                {course.knowledgeNodes?.slice(0, 6).map((node: any, i: number) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-accent-400 shrink-0" />
                    <span className="text-white/70 text-sm">Understand core elements of {(node as any).label || "concept"}</span>
                  </div>
                ))}
                {(!course.knowledgeNodes || course.knowledgeNodes.length === 0) && (
                  <div className="text-white/50 italic text-sm">Course goals are still being structured.</div>
                )}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-white">Course Curriculum</h2>
                <span className="text-sm text-white/50">{course.modules?.length || 0} modules • {totalLessons} lessons</span>
              </div>

              <div className="space-y-4">
                {course.modules?.map((mod: any, modIdx: number) => (
                  <div key={modIdx} className="border border-white/5 bg-white/[0.01] rounded-xl overflow-hidden">
                    <div className="p-5 flex justify-between items-center bg-dark-100 border-b border-white/5">
                      <h3 className="font-semibold text-white">Module {modIdx + 1}: {mod.title}</h3>
                      <span className="text-xs text-white/40">{mod.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {mod.lessons?.map((lesson: any, lesIdx: number) => {
                        const isPreviewable = !isEnrolled && modIdx === 0 && lesIdx === 0;
                        const canAccess = isPreviewable || isEnrolled;
                        
                        const LessonContent = (
                          <div className={`p-4 pl-6 flex items-center justify-between transition-colors ${canAccess ? "hover:bg-white/[0.05] cursor-pointer" : "hover:bg-white/[0.02] cursor-not-allowed"}`}>
                            <div className="flex items-center gap-3">
                              {isPreviewable ? (
                                <PlayCircle className="w-4 h-4 text-primary-400" />
                              ) : isEnrolled ? (
                                <BookOpen className="w-4 h-4 text-white/30" />
                              ) : (
                                <Lock className="w-4 h-4 text-white/20" />
                              )}
                              <span className={`text-sm ${canAccess ? "text-white/80" : "text-white/50"}`}>
                                {lesson.title}
                              </span>
                            </div>
                            {isPreviewable && (
                              <Badge variant="outline" className="text-xs border-primary-500/30 text-primary-300">Preview</Badge>
                            )}
                          </div>
                        );

                        return canAccess ? (
                          <Link key={lesIdx} href={`/learn/${course._id.toString()}/${lesson.id || lesson._id?.toString()}`}>
                            {LessonContent}
                          </Link>
                        ) : (
                          <div key={lesIdx}>{LessonContent}</div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right: Sticky Checkout Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 glass-dark border border-white/10 rounded-2xl p-6 shadow-2xl">
              {course.thumbnail && (
                <div className="aspect-video w-full rounded-xl overflow-hidden mb-6 relative group cursor-pointer">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
              
              <div className="text-3xl font-bold text-white mb-6">
                {course.isFree ? "Free" : `$${course.price}`}
              </div>


              {isEnrolled ? (
                <div className="space-y-4">
                  <Badge className="w-full bg-green-500/20 text-green-300 border-green-500/30 py-2 justify-center text-sm">
                    You are enrolled in this course
                  </Badge>
                  <Link href={`/learn/${course._id.toString()}/diagnostic`}>
                    <Button className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white h-12 shadow-glow-violet">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <EnrollButton 
                    courseId={course._id.toString()} 
                    isFree={course.isFree}
                  />
                  <p className="text-xs text-center text-white/40">Includes full lifetime access.</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="font-semibold text-white mb-4">This course includes:</h4>
                <ul className="space-y-3 text-sm text-white/60">
                  <li className="flex items-center gap-3"><PlayCircle className="w-4 h-4" /> {course.totalDuration || 5} hours on-demand video</li>
                  <li className="flex items-center gap-3"><BookOpen className="w-4 h-4" /> Comprehensive AI-Generated Notes</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-4 h-4" /> Adaptive RAG diagnostic testing</li>
                  <li className="flex items-center gap-3"><Users className="w-4 h-4" /> 24/7 AI Tutor chat assistance</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
