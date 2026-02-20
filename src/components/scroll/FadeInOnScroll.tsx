"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right";

interface FadeInOnScrollProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
}

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

export function FadeInOnScroll({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  distance = 40,
  once = true,
}: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const offset = directionOffset[direction];

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, x: offset.x * distance, y: offset.y * distance }
      }
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : prefersReducedMotion
          ? { opacity: 1 }
          : undefined
      }
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
