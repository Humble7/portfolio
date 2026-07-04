"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { TextReveal, FadeInOnScroll } from "@/components/scroll";
import { useContent } from "@/lib/site-content";

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
    ["rgb(111, 106, 99)", "rgb(0, 47, 167)"]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);

  return (
    <motion.span
      ref={ref}
      style={prefersReducedMotion ? { color: "rgb(0, 47, 167)" } : { color, scale }}
      className="inline-block font-serif italic"
    >
      {children}
    </motion.span>
  );
}

/** Parse text with {keyword} markers into mixed text + AnimatedKeyword elements */
function RichParagraph({ text }: { text: string }) {
  const parts = text.split(/(\{[^}]+\})/g);
  return (
    <p className="text-xl md:text-2xl leading-relaxed text-muted">
      {parts.map((part, i) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <AnimatedKeyword key={i}>{part.slice(1, -1)}</AnimatedKeyword>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export function ActBuilder() {
  const [skills, setSkills] = useState<{ name: string; category: string }[]>([]);

  const label = useContent("builder.label", "Chapter Two");
  const heading = useContent(
    "builder.heading",
    "I build native apps that feel right. Smooth, fast, and delightful."
  );
  const paragraph1 = useContent(
    "builder.paragraph1",
    "My craft lives at the intersection of {binary-level performance} and {modular architecture}. From app launch optimization to mission-critical trip modules at scale."
  );
  const paragraph2 = useContent(
    "builder.paragraph2",
    "From {RIBs architecture at DiDi} to {QUIC networking at Shopee}, I thrive in large-scale production environments."
  );

  useEffect(() => {
    fetch("/api/resume/skills")
      .then((r) => { if (r.ok) return r.json(); })
      .then((d) => { if (d?.data) setSkills(d.data); });
  }, []);

  return (
    <section className="py-32 px-6" id="builder">
      <div className="max-w-5xl mx-auto">
        <FadeInOnScroll>
          <p className="kicker mb-6">03 — {label}</p>
        </FadeInOnScroll>

        <TextReveal className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight mb-16">
          {heading}
        </TextReveal>

        <div className="mb-32 space-y-8 max-w-3xl">
          <FadeInOnScroll delay={0.1}>
            <RichParagraph text={paragraph1} />
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.2}>
            <RichParagraph text={paragraph2} />
          </FadeInOnScroll>
        </div>

        {/* Skills — ruled index grid, like a magazine spec table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 border-t border-l hairline">
          {skills.map((skill, i) => (
            <div key={skill.name} className="border-b border-r hairline">
              <FadeInOnScroll delay={Math.min(i * 0.04, 0.4)} direction="up" distance={16}>
                <div className="p-5 group hover:bg-foreground/[0.03] transition-colors h-full">
                  <p className="font-mono text-[0.65rem] text-muted mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="font-medium mb-1 group-hover:text-accent transition-colors">
                    {skill.name}
                  </p>
                  <p className="text-xs text-muted">{skill.category}</p>
                </div>
              </FadeInOnScroll>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
