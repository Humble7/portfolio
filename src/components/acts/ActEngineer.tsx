"use client";

import { useEffect, useState } from "react";
import { ScrollAct } from "@/components/scroll";
import { TextReveal } from "@/components/scroll";
import { FadeInOnScroll } from "@/components/scroll";
import { ParallaxLayer } from "@/components/scroll";
import { useContent } from "@/lib/site-content";

interface TimelineItem {
  id: string;
  company: string;
  role: string;
  description: string;
  logoUrl: string | null;
  companyUrl: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
}

export function ActEngineer() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const label = useContent("engineer.label", "Chapter One");
  const heading = useContent("engineer.heading", "Every engineer has a story. This is mine.");

  useEffect(() => {
    fetch("/api/resume/experience")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setTimeline(d.data);
      })
      .catch(() => {});
  }, []);

  return (
    <ScrollAct className="py-32 px-6" id="engineer">
      <div className="max-w-4xl mx-auto">
        <FadeInOnScroll>
          <p className="kicker mb-6">02 — {label}</p>
        </FadeInOnScroll>

        <TextReveal className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight mb-32">
          {heading}
        </TextReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <ParallaxLayer speed={0.2} className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px">
            <div className="h-full bg-gradient-to-b from-transparent via-foreground/20 to-transparent" />
          </ParallaxLayer>

          <div className="space-y-24 md:space-y-32">
            {timeline.map((item, i) => {
              const year = new Date(item.startDate).getFullYear().toString();
              return (
                <FadeInOnScroll
                  key={item.id}
                  direction={i % 2 === 0 ? "left" : "right"}
                  delay={0.1}
                >
                  <div
                    className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Dot or Logo */}
                    {item.logoUrl ? (
                      <div className="absolute left-[4px] md:left-1/2 md:-translate-x-1/2 w-[30px] h-[30px] rounded-full bg-background border border-foreground/30 z-10 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.logoUrl}
                          alt={`${item.company} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="absolute left-[12px] md:left-1/2 md:-translate-x-1/2 w-[13px] h-[13px] rounded-full bg-background border-2 border-accent z-10" />
                    )}

                    {/* Content */}
                    <div
                      className={`pl-12 md:pl-0 md:w-1/2 ${
                        i % 2 === 0 ? "md:text-right md:pr-16" : "md:pl-16"
                      }`}
                    >
                      <span className="font-mono text-xs tracking-[0.18em] text-accent">
                        {year}
                      </span>
                      <h3 className="font-serif text-3xl mt-2 mb-1">
                        {item.companyUrl ? (
                          <a
                            href={item.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-accent transition-colors underline decoration-border underline-offset-4 hover:decoration-accent"
                          >
                            {item.company}
                          </a>
                        ) : (
                          item.company
                        )}
                        {item.location && (
                          <span className="text-muted text-xl"> — {item.location}</span>
                        )}
                      </h3>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted mb-3">
                        {item.role}
                      </p>
                      <p className="text-muted leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </FadeInOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollAct>
  );
}
