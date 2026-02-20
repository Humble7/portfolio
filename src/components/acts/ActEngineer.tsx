"use client";

import { ScrollAct } from "@/components/scroll";
import { TextReveal } from "@/components/scroll";
import { FadeInOnScroll } from "@/components/scroll";
import { ParallaxLayer } from "@/components/scroll";

const timeline = [
  {
    year: "2019",
    company: "MoMo",
    location: "Beijing",
    linkedinUrl: "https://www.linkedin.com/company/hellogroup-global/",
    description:
      "Kicked off my iOS career building the ArgoUI project with Objective-C and Swift. Developed a desktop JSON-to-ObjC model tool using TDD, sharpening my fundamentals in a fast-paced social platform.",
  },
  {
    year: "2020",
    company: "DiDi",
    location: "Beijing",
    linkedinUrl: "https://www.linkedin.com/company/didiglobal/",
    description:
      "Joined one of the world's largest ride-hailing platforms. Worked on mission-critical trip modules — in-trip coordination, trip-end workflows with RIBs architecture, and marketing surfaces. Optimized app launch time by 8% through binary rearrangement.",
  },
  {
    year: "2021",
    company: "Shopee",
    location: "Singapore",
    linkedinUrl: "https://www.linkedin.com/company/shopee/",
    description:
      "Moved to Singapore to work on e-commerce at scale. Optimized networking with QUIC and HTTP-DNS, built a network monitoring library, and managed the internal networking framework for all Shopee iOS apps.",
  },
  {
    year: "2022",
    company: "Mozat",
    location: "Singapore",
    linkedinUrl: "https://www.linkedin.com/company/mozat/",
    description:
      "Established a unified iOS development environment for the team. Designed a shopping app architecture based on MVVM and Coordinator patterns, enhancing scalability and maintainability.",
  },
{
    year: "2025",
    company: "TDMN",
    location: "Australia",
    linkedinUrl: "https://www.linkedin.com/company/trolley-data-management-network/",
    description:
      "Migrating legacy UIKit interfaces to SwiftUI while preserving core functionalities. Maintaining and delivering updates for CartR, UK Strollers, and Smart Lock apps.",
  },
];

export function ActEngineer() {
  return (
    <ScrollAct className="py-32 px-6" id="engineer">
      <div className="max-w-4xl mx-auto">
        <FadeInOnScroll>
          <p className="text-accent text-sm uppercase tracking-widest mb-4">
            Chapter One
          </p>
        </FadeInOnScroll>

        <TextReveal className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-32">
          Every engineer has a story. This is mine.
        </TextReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <ParallaxLayer speed={0.2} className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px">
            <div className="h-full bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
          </ParallaxLayer>

          <div className="space-y-24 md:space-y-32">
            {timeline.map((item, i) => (
              <FadeInOnScroll
                key={item.year}
                direction={i % 2 === 0 ? "left" : "right"}
                delay={0.1}
              >
                <div
                  className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-12 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-[12px] md:left-1/2 md:-translate-x-1/2 w-[15px] h-[15px] rounded-full bg-accent/50 border-2 border-accent z-10" />

                  {/* Content */}
                  <div
                    className={`pl-12 md:pl-0 md:w-1/2 ${
                      i % 2 === 0 ? "md:text-right md:pr-16" : "md:pl-16"
                    }`}
                  >
                    <span className="text-accent font-mono text-sm">
                      {item.year}
                    </span>
                    <h3 className="text-2xl font-bold mt-1 mb-3">
                      {item.linkedinUrl ? (
                        <a
                          href={item.linkedinUrl}
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
                    <p className="text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </div>
    </ScrollAct>
  );
}
