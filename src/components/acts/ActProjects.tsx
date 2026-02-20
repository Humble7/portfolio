"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { FadeInOnScroll } from "@/components/scroll";
import { Badge } from "@/components/ui";
import { Apple, Github, Play } from "lucide-react";
import { YouTubeLazy } from "@/components/projects/YouTubeLazy";

interface Project {
  title: string;
  description: string;
  tags: string[];
  coverImage: string | null;
  youtubeUrl: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
}

const COLORS = [
  "from-violet-500/20 to-fuchsia-500/20",
  "from-orange-500/20 to-amber-500/20",
  "from-blue-500/20 to-purple-500/20",
  "from-green-500/20 to-cyan-500/20",
  "from-pink-500/20 to-violet-500/20",
];

export function ActProjects() {
  const containerRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [scrollDistance, setScrollDistance] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects?status=PUBLISHED")
      .then((r) => { if (r.ok) return r.json(); })
      .then((d) => { if (d?.data) setProjects(d.data); });
  }, []);

  useEffect(() => {
    const measure = () => {
      if (galleryRef.current) {
        const totalWidth = galleryRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        setScrollDistance(totalWidth - viewportWidth);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [projects]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -scrollDistance]
  );

  // Container height: 1 screen for initial view + proportional to scroll distance
  const screenRatio = scrollDistance > 0 ? scrollDistance / (typeof window !== "undefined" ? window.innerWidth : 1000) : projects.length - 1;
  const containerHeight = `${100 + screenRatio * 100}vh`;

  return (
    <section
      ref={containerRef}
      className="relative"
      id="projects"
      style={{ height: containerHeight }}
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
            ref={galleryRef}
            className="flex gap-8 px-6"
            style={prefersReducedMotion ? {} : { x }}
          >
            {projects.map((project, i) => (
              <div
                key={project.title}
                className="min-w-[85vw] md:min-w-[60vw] lg:min-w-[50vw]"
              >
                <div
                  className={`glass rounded-3xl p-8 md:p-12 h-full flex flex-col justify-between bg-gradient-to-br ${COLORS[i % COLORS.length]}`}
                >
                  {/* Project video/image */}
                  {project.youtubeUrl ? (
                    <YouTubeLazy url={project.youtubeUrl} className="mb-8" />
                  ) : project.coverImage ? (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-8">
                      <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                    </div>
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
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
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
