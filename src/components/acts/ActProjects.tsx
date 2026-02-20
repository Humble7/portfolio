"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { FadeInOnScroll } from "@/components/scroll";
import { Badge } from "@/components/ui";
import { ExternalLink, Github, Play, Apple } from "lucide-react";
import { YouTubeLazy } from "@/components/projects/YouTubeLazy";

const projects = [
  {
    title: "DotShake",
    description:
      "Wiggly Art Made Simple — draw, shake, and watch ordinary lines transform into lively, expressive animated art. A personal side project built with Swift, featuring intuitive drawing tools, signature wiggly line technology, and one-tap sharing. Available on iOS, iPadOS, and macOS.",
    tags: ["Swift", "Graphics & Design", "Side Project"],
    image: null,
    color: "from-violet-500/20 to-fuchsia-500/20",
    appStoreUrl: "https://apps.apple.com/us/app/dotshake/id6747894313",
    githubUrl: null,
    youtubeUrl: "https://www.youtube.com/watch?v=7Z6_AWqATxU",
  },
  {
    title: "DiDi Trip Lifecycle",
    description:
      "Worked on mission-critical modules in the ride-hailing trip lifecycle — in-trip real-time coordination, trip-end page redesign with modular RIBs architecture, and marketing surfaces with A/B testing hooks.",
    tags: ["RIBs", "Objective-C", "Swift"],
    image: null,
    color: "from-orange-500/20 to-amber-500/20",
    appStoreUrl: null,
    githubUrl: null,
    youtubeUrl: null,
  },
  {
    title: "iOS Startup Optimization",
    description:
      "Improved app launch time by 8% through binary rearrangement. Built a decentralized startup framework supporting priority-based task registration and dependency resolution. Restricted overuse of +load via Mach-O modification.",
    tags: ["Mach-O", "Binary", "Performance"],
    image: null,
    color: "from-blue-500/20 to-purple-500/20",
    appStoreUrl: null,
    githubUrl: null,
    youtubeUrl: null,
  },
  {
    title: "Shopee Networking Layer",
    description:
      "Optimized networking with QUIC and HTTP-DNS for faster connections. Built a network monitoring library for all requests. Managed the internal networking framework used across all Shopee iOS apps.",
    tags: ["QUIC", "HTTP-DNS", "Networking"],
    image: null,
    color: "from-green-500/20 to-cyan-500/20",
    appStoreUrl: null,
    githubUrl: null,
    youtubeUrl: null,
  },
  {
    title: "TDMN App Suite",
    description:
      "Migrating legacy UIKit interfaces to SwiftUI while preserving core functionalities. Maintaining and delivering regular updates for CartR, UK Strollers, and Smart Lock apps across multiple markets.",
    tags: ["SwiftUI", "UIKit", "Migration"],
    image: null,
    color: "from-pink-500/20 to-violet-500/20",
    appStoreUrl: null,
    githubUrl: null,
    youtubeUrl: null,
  },
];

export function ActProjects() {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(projects.length - 1) * 100}%`]
  );

  return (
    <section
      ref={containerRef}
      className="relative"
      id="projects"
      style={{ height: `${projects.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="pt-24 pb-8 px-6">
          <div className="max-w-7xl mx-auto">
            <FadeInOnScroll>
              <p className="text-accent text-sm uppercase tracking-widest mb-4">
                Chapter Three
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                Selected Work
              </h2>
            </FadeInOnScroll>
          </div>
        </div>

        {/* Horizontal scroll gallery */}
        <div className="flex-1 flex items-center">
          <motion.div
            className="flex gap-8 px-6"
            style={prefersReducedMotion ? {} : { x }}
          >
            {projects.map((project, i) => (
              <div
                key={project.title}
                className="min-w-[85vw] md:min-w-[60vw] lg:min-w-[50vw]"
              >
                <div
                  className={`glass rounded-3xl p-8 md:p-12 h-full flex flex-col justify-between bg-gradient-to-br ${project.color}`}
                >
                  {/* Project video/image */}
                  {project.youtubeUrl ? (
                    <YouTubeLazy url={project.youtubeUrl} className="mb-8" />
                  ) : (
                    <div className="aspect-video rounded-2xl bg-white/5 mb-8 flex items-center justify-center">
                      <Play size={48} className="text-muted/30" />
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="accent">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-3">
                      {project.title}
                    </h3>
                    <p className="text-muted leading-relaxed mb-6 max-w-lg">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-4">
                      {project.appStoreUrl && (
                        <a
                          href={project.appStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
                        >
                          <Apple size={16} />
                          App Store
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                        >
                          <Github size={16} />
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Progress dots */}
        <div className="pb-8 flex justify-center gap-2">
          {projects.map((_, i) => (
            <ProjectDot key={i} index={i} progress={scrollYProgress} total={projects.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectDot({
  index,
  progress,
  total,
}: {
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  total: number;
}) {
  const opacity = useTransform(
    progress,
    [
      (index - 0.5) / total,
      index / total,
      (index + 0.5) / total,
    ],
    [0.3, 1, 0.3]
  );

  return (
    <motion.div
      className="w-2 h-2 rounded-full bg-accent"
      style={{ opacity }}
    />
  );
}
