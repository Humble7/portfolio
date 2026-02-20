"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { TextReveal, FadeInOnScroll } from "@/components/scroll";
import { Card } from "@/components/ui";

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
  const [skills, setSkills] = useState<{ name: string; category: string }[]>([]);

  useEffect(() => {
    fetch("/api/resume/skills")
      .then((r) => { if (r.ok) return r.json(); })
      .then((d) => { if (d?.data) setSkills(d.data); });
  }, []);

  return (
    <section className="py-32 px-6" id="builder">
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
