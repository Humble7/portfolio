"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

export function ActHero() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const subtitleOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section ref={ref} className="relative h-[140vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a2e] to-black"
          style={prefersReducedMotion ? {} : { opacity: useTransform(scrollYProgress, [0, 0.5], [0.3, 1]) }}
        />

        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black"
          style={prefersReducedMotion ? {} : { opacity: overlayOpacity }}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={prefersReducedMotion ? {} : { scale: headlineScale }}
        >
          <h1 className="text-5xl sm:text-7xl md:text-[6rem] font-bold leading-[0.95] tracking-tight mb-8">
            <span className="text-gradient">Crafting Native</span>
            <br />
            <span className="text-foreground">Experiences</span>
          </h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-muted max-w-2xl mx-auto"
            style={prefersReducedMotion ? {} : { opacity: subtitleOpacity }}
          >
            Senior iOS Engineer. 5+ years at DiDi, Shopee, Mozat &amp; more.
            <br />
            Building high-performance, user-centric mobile apps.
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 flex flex-col items-center gap-2"
          style={prefersReducedMotion ? {} : { opacity: indicatorOpacity }}
        >
          <span className="text-xs text-muted uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={20} className="text-muted" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
