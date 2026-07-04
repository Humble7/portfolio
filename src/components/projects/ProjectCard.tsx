import { Badge } from "@/components/ui";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  coverImage?: string | null;
  tags: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
}

export function ProjectCard({
  title,
  description,
  coverImage,
  tags,
  githubUrl,
  liveUrl,
}: ProjectCardProps) {
  return (
    <article className="glass rounded-sm overflow-hidden transition-colors duration-200 hover:border-accent/50">
      {coverImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="accent">{tag}</Badge>
            ))}
          </div>
        )}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-4">{description}</p>
        <div className="flex items-center gap-4">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"
            >
              <ExternalLink size={14} />
              Live Demo
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              <Github size={14} />
              Source
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
