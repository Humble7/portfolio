"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxLayer({
  children,
  className,
  speed = 0.5,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [
    -100 * speed,
    100 * speed,
  ]);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={prefersReducedMotion ? {} : { y }}
    >
      {children}
    </motion.div>
  );
}
