"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useContent } from "@/lib/site-content";

/** Parse "text {gradient} more text" into mixed elements */
function GradientHeading({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8">
      {parts.map((part, i) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <span key={i} className="text-gradient">{part.slice(1, -1)}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </h2>
  );
}

export function ActVision() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 1.05]);
  const hue = useTransform(scrollYProgress, [0, 1], [220, 280]);

  const label = useContent("vision.label", "The Vision");
  const heading = useContent("vision.heading", "Performance is a {feature}.");
  const description = useContent(
    "vision.description",
    "From binary rearrangement to QUIC networking — I believe every millisecond counts. The best apps don't just work, they feel instant. That's the standard I build to."
  );

  return (
    <section ref={ref} className="relative h-[140vh]" id="vision">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient with hue rotation */}
        <motion.div
          className="absolute inset-0"
          style={
            prefersReducedMotion
              ? { background: "radial-gradient(ellipse at center, rgba(41,151,255,0.08) 0%, transparent 70%)" }
              : {
                  background: useTransform(
                    hue,
                    (h) =>
                      `radial-gradient(ellipse at center, hsla(${h}, 80%, 50%, 0.08) 0%, transparent 70%)`
                  ),
                }
          }
        />

        <motion.div
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          style={prefersReducedMotion ? {} : { opacity, scale }}
        >
          <p className="text-accent text-sm uppercase tracking-widest mb-8">
            {label}
          </p>
          <GradientHeading text={heading} />
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
