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
          <p className="text-accent text-sm uppercase tracking-widest mb-4">
            {label}
          </p>
        </FadeInOnScroll>

        <TextReveal className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-32">
          {heading}
        </TextReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <ParallaxLayer speed={0.2} className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px">
            <div className="h-full bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
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
                      <div className="absolute left-[4px] md:left-1/2 md:-translate-x-1/2 w-[30px] h-[30px] rounded-full bg-black border-2 border-accent z-10 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.logoUrl}
                          alt={`${item.company} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="absolute left-[12px] md:left-1/2 md:-translate-x-1/2 w-[15px] h-[15px] rounded-full bg-accent/50 border-2 border-accent z-10" />
                    )}

                    {/* Content */}
                    <div
                      className={`pl-12 md:pl-0 md:w-1/2 ${
                        i % 2 === 0 ? "md:text-right md:pr-16" : "md:pl-16"
                      }`}
                    >
                      <span className="text-accent font-mono text-sm">
                        {year}
                      </span>
                      <h3 className="text-2xl font-bold mt-1 mb-1">
                        {item.companyUrl ? (
                          <a
                            href={item.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:text-accent-hover transition-colors underline decoration-accent/60 underline-offset-4 hover:decoration-accent"
                          >
                            {item.company}
                          </a>
                        ) : (
                          item.company
                        )}
                        {item.location && ` — ${item.location}`}
                      </h3>
                      <p className="text-sm text-accent/70 mb-3">{item.role}</p>
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
