import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function AdminCoursesPage() {
  await requireAdmin();
  await connectDB();

  // Fetch all courses
  const courses = await Course.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Courses</h1>
          <p className="text-sm text-white/50 mt-1">Manage your course catalog and curriculum.</p>
        </div>
        
        <Link href="/admin/courses/new">
          <Button className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white shadow-glow-violet">
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="bg-dark-100 border border-white/5 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="Search courses..." 
              className="pl-9 bg-dark border-white/10 text-white placeholder:text-white/30 w-full rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-dark/50 text-white/50 text-xs uppercase border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Course</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Price</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Enrollments</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/40">
                    No courses found. Create one to get started.
                  </td>
                </tr>
              ) : (
                courses.map((course: any) => (
                  <tr key={course._id.toString()} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-white/5 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-white/30" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{course.title}</p>
                          <p className="text-xs text-white/40">{course.category || "Uncategorized"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={course.isPublished ? "border-green-500/50 text-green-400 bg-green-500/10" : "border-orange-500/50 text-orange-400 bg-orange-500/10"}>
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {course.isFree ? "Free" : `$${course.price}`}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {course.enrollmentCount || 0}
                    </td>
                    <td className="px-6 py-4 flex gap-2 justify-end">
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/courses/${course._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
