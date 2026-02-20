"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ScaleOnScrollProps {
  children: React.ReactNode;
  className?: string;
  scaleRange?: [number, number];
}

export function ScaleOnScroll({
  children,
  className,
  scaleRange = [0.95, 1.05],
}: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [
    scaleRange[0],
    scaleRange[1],
    scaleRange[0],
  ]);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={prefersReducedMotion ? {} : { scale }}
    >
      {children}
    </motion.div>
  );
}
