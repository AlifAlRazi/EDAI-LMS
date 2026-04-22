import { requireAuth } from "@/lib/auth";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Progress",
  description: "Track your learning progress, quiz scores, streaks, and knowledge gaps on EdAI.",
};

const ProgressClient = dynamic(
  () => import("./progress-client"),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )}
);

export default async function ProgressPage() {
  await requireAuth();
  return <ProgressClient />;
}
