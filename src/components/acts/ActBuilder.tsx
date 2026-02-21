"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { TextReveal, FadeInOnScroll } from "@/components/scroll";
import { Card } from "@/components/ui";
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
          <p className="text-accent text-sm uppercase tracking-widest mb-4">
            {label}
          </p>
        </FadeInOnScroll>

        <TextReveal className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-16">
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
