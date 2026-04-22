import { requireAdmin } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { Search, ShieldAlert, GraduationCap, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  await requireAdmin();
  await connectDB();

  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Users</h1>
          <p className="text-sm text-white/50 mt-1">Manage students, instructors, and access roles.</p>
        </div>
      </div>

      <div className="bg-dark-100 border border-white/5 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9 bg-dark border-white/10 text-white placeholder:text-white/30 w-full rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-dark/50 text-white/50 text-xs uppercase border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Role</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Enrolled Courses</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u: any) => (
                <tr key={u._id.toString()} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold shrink-0">
                        {u.image ? <img src={u.image} alt="" className="w-full h-full rounded-full" /> : u.name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name || "Unnamed User"}</p>
                        <p className="text-xs text-white/40">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === "admin" ? (
                      <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 gap-1.5">
                        <ShieldAlert className="w-3 h-3" /> Admin
                      </Badge>
                    ) : u.role === "instructor" ? (
                      <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10 gap-1.5">
                        <GraduationCap className="w-3 h-3" /> Instructor
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-white/20 text-white/70 bg-white/5">
                        Student
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {u.enrolledCourses?.length || 0}
                  </td>
                  <td className="px-6 py-4 text-white/50 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
