"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

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
            The Vision
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-8">
            Performance is a{" "}
            <span className="text-gradient">feature</span>.
          </h2>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            From binary rearrangement to QUIC networking — I believe every
            millisecond counts. The best apps don&apos;t just work, they
            feel instant. That&apos;s the standard I build to.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
