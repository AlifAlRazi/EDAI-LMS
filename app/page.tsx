import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "EdAI LMS — AI-Powered Personalized Learning",
  description:
    "EdAI uses Knowledge Graphs and AI diagnostics to detect your knowledge gaps and build a personalized learning path. 150+ courses, real-time AI tutor, and adaptive quizzes.",
  keywords: ["AI learning", "personalized education", "knowledge graph", "LMS", "online courses", "adaptive learning"],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "EdAI LMS — AI-Powered Personalized Learning",
    description: "Detect your knowledge gaps with AI and get a personalized learning path. 150+ courses across AI, Math, and Computer Science.",
    url: baseUrl,
    siteName: "EdAI LMS",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "EdAI LMS" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EdAI LMS — AI-Powered Personalized Learning",
    description: "Detect your knowledge gaps with AI. Personalized paths. Real-time AI tutor. 150+ courses.",
    images: ["/og-default.png"],
  },
  robots: { index: true, follow: true },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-dark w-full">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
