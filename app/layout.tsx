import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

/** Syne — used for all headings (h1–h6) */
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

/** DM Sans — used for body text */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EdAI LMS — Knowledge Graph Powered Personalized Learning",
    template: "%s | EdAI LMS",
  },
  description:
    "EdAI LMS uses Knowledge Graphs, RAG, and Generative AI to detect your learning gaps and build a personalized learning path — just for you.",
  keywords: [
    "learning management system",
    "personalized learning",
    "knowledge graph",
    "RAG",
    "AI education",
    "adaptive learning",
    "EdAI",
  ],
  authors: [{ name: "EdAI Team" }],
  creator: "EdAI LMS",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
    title: "EdAI LMS — Knowledge Graph Powered Personalized Learning",
    description:
      "Detect your knowledge gaps and learn smarter with AI-powered personalized paths.",
    siteName: "EdAI LMS",
  },
  twitter: {
    card: "summary_large_image",
    title: "EdAI LMS — Knowledge Graph Powered Personalized Learning",
    description:
      "Detect your knowledge gaps and learn smarter with AI-powered personalized paths.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", syne.variable, dmSans.variable)}
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-dark font-sans antialiased",
          "selection:bg-accent/30 selection:text-white"
        )}
      >
        <TooltipProvider>
          <SessionProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: "bg-dark-100 border border-white/10 text-white",
                  description: "text-white/60",
                  actionButton: "bg-primary text-white",
                  cancelButton: "bg-dark-200 text-white/60",
                },
              }}
            />
          </SessionProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
