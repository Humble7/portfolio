"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { TextReveal, FadeInOnScroll } from "@/components/scroll";
import { Card } from "@/components/ui";

const skills = [
  { name: "Swift", category: "Language" },
  { name: "Objective-C", category: "Language" },
  { name: "SwiftUI", category: "Language" },
  { name: "JavaScript", category: "Language" },
  { name: "Python", category: "Language" },
  { name: "RIBs", category: "Architecture" },
  { name: "MVVM", category: "Architecture" },
  { name: "Coordinator", category: "Architecture" },
  { name: "Instruments", category: "Performance" },
  { name: "os_signpost", category: "Performance" },
  { name: "MachOView", category: "Performance" },
  { name: "Hopper", category: "Performance" },
  { name: "Xcode", category: "Tooling" },
  { name: "CocoaPods", category: "Tooling" },
  { name: "SPM", category: "Tooling" },
  { name: "Jenkins", category: "CI/CD" },
];

function AnimatedKeyword({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.3"],
  });

  const color = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgb(134, 134, 139)", "rgb(41, 151, 255)"]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);

  return (
    <motion.span
      ref={ref}
      style={prefersReducedMotion ? { color: "rgb(41, 151, 255)" } : { color, scale }}
      className="inline-block font-bold"
    >
      {children}
    </motion.span>
  );
}

export function ActBuilder() {
  return (
    <section className="min-h-[250vh] py-60 px-6" id="builder">
      <div className="max-w-5xl mx-auto">
        <FadeInOnScroll>
          <p className="text-accent text-sm uppercase tracking-widest mb-4">
            Chapter Two
          </p>
        </FadeInOnScroll>

        <TextReveal className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-16">
          I build native apps that feel right. Smooth, fast, and delightful.
        </TextReveal>

        <div className="mb-32 space-y-8 max-w-3xl">
          <FadeInOnScroll delay={0.1}>
            <p className="text-xl md:text-2xl leading-relaxed text-muted">
              My craft lives at the intersection of{" "}
              <AnimatedKeyword>binary-level performance</AnimatedKeyword> and{" "}
              <AnimatedKeyword>modular architecture</AnimatedKeyword>. From app launch
              optimization to mission-critical trip modules at scale.
            </p>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.2}>
            <p className="text-xl md:text-2xl leading-relaxed text-muted">
              From <AnimatedKeyword>RIBs architecture at DiDi</AnimatedKeyword> to{" "}
              <AnimatedKeyword>QUIC networking at Shopee</AnimatedKeyword>, I
              thrive in large-scale production environments.
            </p>
          </FadeInOnScroll>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {skills.map((skill, i) => (
            <FadeInOnScroll key={skill.name} delay={i * 0.05} direction="up">
              <Card className="text-center py-6">
                <p className="font-semibold mb-1">{skill.name}</p>
                <p className="text-xs text-muted">{skill.category}</p>
              </Card>
            </FadeInOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
