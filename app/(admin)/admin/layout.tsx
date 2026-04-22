import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { LayoutDashboard, BookOpen, Users, Settings, Brain, LogOut, BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Ensure user is an admin
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-dark w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-100 border-r border-white/5 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-xl font-bold text-white">EdAI Admin</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5 rounded-xl h-12"
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="w-full justify-start text-white/50 border-white/10 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit Admin
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-dark/50 backdrop-blur-md sticky top-0 z-10">
          <h1 className="font-heading text-xl font-semibold text-white">Administration</h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{user.name}</div>
              <div className="text-xs text-white/50">{user.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              {user.name?.[0] || "A"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
