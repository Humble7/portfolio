"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useContent } from "@/lib/site-content";

/** Parse "text {accent} more text" into mixed elements */
function AccentHeading({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <h2 className="font-serif text-5xl sm:text-6xl md:text-8xl leading-[1.05] mb-10">
      {parts.map((part, i) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <span key={i} className="italic text-accent">{part.slice(1, -1)}</span>
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

  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const label = useContent("vision.label", "The Vision");
  const heading = useContent("vision.heading", "Performance is a {feature}.");
  const description = useContent(
    "vision.description",
    "From binary rearrangement to QUIC networking — I believe every millisecond counts. The best apps don't just work, they feel instant. That's the standard I build to."
  );

  return (
    <section ref={ref} className="relative h-[130vh]" id="vision">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
          style={prefersReducedMotion ? {} : { opacity, y }}
        >
          <div className="border-t hairline w-16 mx-auto mb-10" />
          <p className="kicker mb-10">05 — {label}</p>
          <AccentHeading text={heading} />
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="border-t hairline w-16 mx-auto mt-10" />
        </motion.div>
      </div>
    </section>
  );
}
