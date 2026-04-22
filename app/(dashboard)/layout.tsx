import { requireAuth, getCurrentUser } from "@/lib/auth";
import { Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserMenu from "@/components/dashboard/UserMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 bg-dark-100 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading text-xl font-bold text-white">EdAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/courses" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Browse Courses
            </Link>
            <Link href="/dashboard/progress" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              My Progress
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-accent-500/50 text-accent-400 bg-accent-500/10 hover:bg-accent-500/20">
                Admin Panel
              </Button>
            </Link>
          )}

          {/* Real user avatar + sign-out dropdown */}
          <UserMenu
            name={user?.name}
            email={user?.email}
            image={user?.image}
            role={user?.role}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-dark">
        {children}
      </main>
    </div>
  );
}
