"use client";

import { createContext, useContext } from "react";
import { useScroll, useMotionValueEvent, MotionValue } from "motion/react";
import { useState } from "react";

interface ScrollContextType {
  scrollYProgress: MotionValue<number>;
  scrollY: MotionValue<number>;
  direction: "up" | "down";
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export function useScrollContext() {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error("useScrollContext must be used within ScrollProvider");
  return ctx;
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress, scrollY } = useScroll();
  const [direction, setDirection] = useState<"up" | "down">("down");

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setDirection(latest > prev ? "down" : "up");
  });

  return (
    <ScrollContext.Provider value={{ scrollYProgress, scrollY, direction }}>
      {children}
    </ScrollContext.Provider>
  );
}
