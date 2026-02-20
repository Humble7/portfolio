"use client";

import { useRef } from "react";
import { useScroll, type MotionValue } from "motion/react";
import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface ScrollActContextType {
  progress: MotionValue<number>;
}

const ScrollActContext = createContext<ScrollActContextType | null>(null);

export function useScrollAct() {
  const ctx = useContext(ScrollActContext);
  if (!ctx) throw new Error("useScrollAct must be used within ScrollAct");
  return ctx;
}

interface ScrollActProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  offset?: ["start end" | "start start" | "end start" | "end end", "start end" | "start start" | "end start" | "end end"];
}

export function ScrollAct({
  children,
  className,
  id,
  offset = ["start end", "end start"],
}: ScrollActProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  return (
    <ScrollActContext.Provider value={{ progress: scrollYProgress }}>
      <section ref={ref} id={id} className={cn("relative", className)}>
        {children}
      </section>
    </ScrollActContext.Provider>
  );
}
