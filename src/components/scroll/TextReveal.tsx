"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  children: string;
  className?: string;
  revealBy?: "word" | "character";
}

export function TextReveal({
  children,
  className,
  revealBy = "word",
}: TextRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"],
  });

  if (prefersReducedMotion) {
    return <p className={className}>{children}</p>;
  }

  const units = revealBy === "word" ? children.split(" ") : children.split("");
  const separator = revealBy === "word" ? "\u00A0" : "";

  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {units.map((unit, i) => {
        const start = i / units.length;
        const end = start + 1 / units.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {unit}
            {separator}
          </Word>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const y = useTransform(progress, range, [5, 0]);

  return (
    <motion.span style={{ opacity, y }} className="inline-block">
      {children}
    </motion.span>
  );
}
