import { requireAdmin } from "@/lib/auth";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | Admin",
  description: "Platform-wide analytics for EdAI LMS admins.",
};

const AnalyticsClient = dynamic(() => import("./analytics-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  return <AnalyticsClient />;
}
