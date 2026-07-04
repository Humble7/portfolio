"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { useContent } from "@/lib/site-content";

export function ActHero() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0.4, 0.9], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const title1 = useContent("hero.title1", "Crafting Native");
  const title2 = useContent("hero.title2", "Experiences");
  const subtitle = useContent(
    "hero.subtitle",
    "Senior iOS Engineer. 5+ years at DiDi, Shopee, Mozat & more.\nBuilding high-performance, user-centric mobile apps."
  );

  const enter = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
        };

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col">
      <motion.div
        className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 pt-16"
        style={prefersReducedMotion ? {} : { opacity: contentOpacity, y: contentY }}
      >
        {/* Kicker */}
        <motion.p {...enter(0)} className="kicker mb-8">
          01 — Senior iOS Engineer
        </motion.p>

        {/* Headline */}
        <motion.h1
          {...enter(0.1)}
          className="font-serif text-6xl sm:text-7xl md:text-[7.5rem] leading-[1.02] tracking-tight mb-10 max-w-5xl"
        >
          {title1}
          <br />
          <span className="italic text-accent">{title2}</span>
          <span className="text-accent">.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...enter(0.25)}
          className="text-lg md:text-xl text-muted max-w-xl whitespace-pre-line leading-relaxed"
        >
          {subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div {...enter(0.4)} className="mt-12 flex items-center gap-8">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-sm font-medium hover:bg-accent hover:text-white transition-colors"
          >
            View Work
            <ArrowDown size={16} />
          </a>
          <a
            href="#contact"
            className="font-mono text-xs uppercase tracking-[0.18em] text-foreground underline decoration-border underline-offset-8 hover:text-accent hover:decoration-accent transition-colors"
          >
            Get in Touch
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom rule with index marks, magazine-footer style */}
      <motion.div {...enter(0.55)} className="max-w-7xl mx-auto w-full px-6 pb-10">
        <div className="border-t hairline pt-4 flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          <span>Portfolio — {new Date().getFullYear()}</span>
          <span className="hidden sm:inline">DiDi · Shopee · Mozat</span>
          <span className="inline-flex items-center gap-2">
            Scroll
            <motion.span
              animate={prefersReducedMotion ? {} : { y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <ArrowDown size={12} />
            </motion.span>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
