"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { FadeInOnScroll } from "@/components/scroll";
import { Badge } from "@/components/ui";
import { Apple, Github, Play } from "lucide-react";
import { YouTubeLazy } from "@/components/projects/YouTubeLazy";
import { useContent } from "@/lib/site-content";

// Bug 5: Add `id` to interface so we can use stable keys
interface Project {
  id: string;
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

function ProjectCardContent({ project, colorClass }: { project: Project; colorClass: string }) {
  return (
    <div
      className={`glass rounded-3xl p-8 md:p-12 h-full flex flex-col overflow-hidden bg-gradient-to-br ${colorClass}`}
    >
      {/* Media area — flex-1 min-h-0 so it shrinks to fit available space */}
      {project.youtubeUrl ? (
        <div className="flex-1 min-h-0 mb-6">
          <YouTubeLazy url={project.youtubeUrl} className="h-full" />
        </div>
      ) : project.coverImage ? (
        <div className="flex-1 min-h-0 rounded-2xl overflow-hidden mb-6">
          <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="flex-1 min-h-0 rounded-2xl bg-white/5 mb-6 flex items-center justify-center">
          <Play size={48} className="text-muted/30" />
        </div>
      )}

      {/* Text content — shrink-0 so it always displays fully */}
      <div className="shrink-0">
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
        <p className="text-muted leading-relaxed mb-6 max-w-lg line-clamp-3">
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
  );
}

function SectionHeader({ label, heading }: { label: string; heading: string }) {
  return (
    <div className="pt-24 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <FadeInOnScroll>
          <p className="text-accent text-sm uppercase tracking-widest mb-4">
            {label}
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold">
            {heading}
          </h2>
        </FadeInOnScroll>
      </div>
    </div>
  );
}

/** Single project — centered card with fade-in, no horizontal scroll */
function SingleProject({ project, label, heading }: { project: Project; label: string; heading: string }) {
  return (
    <section className="relative" id="projects">
      <SectionHeader label={label} heading={heading} />
      <div className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <ProjectCardContent project={project} colorClass={COLORS[0]} />
          </FadeInOnScroll>
        </div>
      </div>
    </section>
  );
}

// Bug 4: Mobile fallback — native horizontal scroll with snap
function MobileGallery({ projects }: { projects: Project[] }) {
  return (
    <div className="flex gap-6 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
      {projects.map((project, i) => (
        <div
          key={project.id}
          className="min-w-[85vw] snap-center"
        >
          <ProjectCardContent project={project} colorClass={COLORS[i % COLORS.length]} />
        </div>
      ))}
    </div>
  );
}

/** Multiple projects — horizontal scroll gallery (desktop), native scroll (mobile) */
function MultipleProjects({ projects, label, heading }: { projects: Project[]; label: string; heading: string }) {
  const containerRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // Bug 1 & 2: Keep both scrollDistance and screenRatio in state,
  // computed only in useEffect to avoid SSR/hydration mismatch and initial jump.
  const [scrollDistance, setScrollDistance] = useState(0);
  const [screenRatio, setScreenRatio] = useState(projects.length - 1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile && galleryRef.current) {
        const totalWidth = galleryRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const dist = totalWidth - viewportWidth;
        setScrollDistance(dist);
        setScreenRatio(dist > 0 ? dist / viewportWidth : projects.length - 1);
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

  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

  const containerHeight = `${100 + screenRatio * 100}vh`;

  // Bug 4: On mobile, use native horizontal scroll instead of scroll-hijack
  if (isMobile) {
    return (
      <section className="relative" id="projects">
        <SectionHeader label={label} heading={heading} />
        <MobileGallery projects={projects} />
        <div className="h-8" />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative"
      id="projects"
      style={{ height: containerHeight }}
    >
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">
        <SectionHeader label={label} heading={heading} />

        <div className="flex-1 min-h-0 flex items-center py-4">
          <motion.div
            ref={galleryRef}
            className="flex gap-8 px-6 h-full items-center"
            style={prefersReducedMotion ? {} : { x }}
          >
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="min-w-[60vw] lg:min-w-[50vw] h-full"
              >
                <ProjectCardContent project={project} colorClass={COLORS[i % COLORS.length]} />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="pb-8 flex justify-center gap-2">
          {projects.map((_, i) => (
            <ProjectDot key={i} index={i} progress={scrollYProgress} total={projects.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ActProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const label = useContent("projects.label", "Chapter Three");
  const heading = useContent("projects.heading", "Selected Work");

  useEffect(() => {
    fetch("/api/projects?status=PUBLISHED")
      .then((r) => { if (r.ok) return r.json(); })
      .then((d) => { if (d?.data) setProjects(d.data); });
  }, []);

  // 0 projects — don't render the section at all
  if (projects.length === 0) return null;

  // 1 project — centered card, no horizontal scroll
  if (projects.length === 1) {
    return <SingleProject project={projects[0]} label={label} heading={heading} />;
  }

  // 2+ projects — horizontal scroll gallery
  return <MultipleProjects projects={projects} label={label} heading={heading} />;
}

// Bug 6: Clamp input range so first/last dots transition correctly
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
      Math.max(0, (index - 0.5) / total),
      index / total,
      Math.min(1, (index + 0.5) / total),
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
