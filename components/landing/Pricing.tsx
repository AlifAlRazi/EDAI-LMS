"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    description: "Perfect for exploring the catalog.",
    price: "$0",
    interval: "forever",
    buttonText: "Join for Free",
    buttonVariant: "outline" as const,
    features: [
      { name: "Browse full course catalog", included: true },
      { name: "Limited lesson previews", included: true },
      { name: "1 free diagnostic test", included: true },
      { name: "Pay per individual course", included: true },
      { name: "Full AI gap analysis", included: false },
      { name: "Unlimited course access", included: false },
    ],
  },
  {
    name: "Pro",
    description: "For serious learners who want the fastest path.",
    price: "$19",
    interval: "/month",
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    isPopular: true,
    features: [
      { name: "Browse full course catalog", included: true },
      { name: "Full lesson access", included: true },
      { name: "Unlimited diagnostic tests", included: true },
      { name: "Unlimited course access", included: true },
      { name: "Full AI gap analysis", included: true },
      { name: "Adaptive RAG quizzes", included: true },
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-dark relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="font-sans text-white/60 text-lg">
            Start for free, or get unlimited access to all AI features and courses with Pro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className={cn(
                "relative rounded-3xl p-8 glass-dark border flex flex-col transition-transform duration-300 hover:scale-[1.02]",
                plan.isPopular 
                  ? "border-accent-500/50 shadow-[0_0_40px_rgba(124,58,237,0.15)] bg-accent-900/10" 
                  : "border-white/10"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <Badge className="bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0 shadow-lg px-3 py-1 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-8">
                <h3 className="font-heading text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="font-sans text-white/50 text-sm h-10">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-heading text-5xl font-bold text-white">{plan.price}</span>
                  <span className="font-sans text-white/40">{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="bg-accent-500/20 p-1 rounded-full shrink-0">
                        <Check className="w-4 h-4 text-accent-400" />
                      </div>
                    ) : (
                      <div className="bg-white/5 p-1 rounded-full shrink-0">
                        <X className="w-4 h-4 text-white/30" />
                      </div>
                    )}
                    <span className={cn(
                      "font-sans text-sm",
                      feature.included ? "text-white/80" : "text-white/40"
                    )}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/login" className="mt-auto">
                <Button 
                  className={cn(
                    "w-full h-12 rounded-xl text-base font-semibold",
                    plan.buttonVariant === "default" 
                      ? "bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white border-0 shadow-glow-violet"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  )}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
