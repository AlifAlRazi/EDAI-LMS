"use client";

import { motion } from "framer-motion";
import { BookOpen, Stethoscope, Network, Rocket } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Enroll in a Course",
    description: "Browse our catalog and choose your target learning path based on your goals.",
  },
  {
    icon: Stethoscope,
    title: "Take the Diagnostic Test",
    description: "Our AI identifies what you already know and what you're missing through an adaptive quiz.",
  },
  {
    icon: Network,
    title: "Get Your Gap Analysis",
    description: "The Knowledge Graph maps your specific missing concepts, showing you exactly why you need to learn them.",
  },
  {
    icon: Rocket,
    title: "Follow Your Personalized Path",
    description: "The AI guides you through your gaps first, ensuring a solid foundation before tackling advanced topics.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-dark relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
            How <span className="text-gradient-primary">EdAI</span> Works
          </h2>
          <p className="font-sans text-white/60 text-lg">
            Stop wasting time on one-size-fits-all curricula. Our 4-step process builds a curriculum around your unique needs.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line (Desktop) */}
          <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-accent-500"
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Connecting line (Mobile) */}
                {i !== steps.length - 1 && (
                  <div className="md:hidden absolute top-[90px] bottom-[-20px] left-1/2 w-[2px] bg-white/10 -translate-x-1/2 z-0" />
                )}

                {/* Numbered Step Icon */}
                <div className="relative w-24 h-24 rounded-2xl glass-dark border border-white/10 shadow-lg flex items-center justify-center mb-6 z-10 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-glow-violet">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white shadow-xl">
                    {i + 1}
                  </div>
                  <step.icon className="w-10 h-10 text-white/80 group-hover:text-white transition-colors" />
                </div>

                <h3 className="font-heading text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-white/50 leading-relaxed px-4">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
