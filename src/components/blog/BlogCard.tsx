import Link from "next/link";
import { Badge } from "@/components/ui";
import { Calendar } from "lucide-react";

interface BlogCardProps {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverImage?: string | null;
  tags: string[];
  category?: string;
  publishedAt?: string | null;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function BlogCard({
  slug,
  title,
  excerpt,
  content,
  coverImage,
  tags,
  category,
  publishedAt,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="glass rounded-sm overflow-hidden transition-colors duration-200 hover:border-accent/50 h-full flex flex-col">
        {coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-3">
            {category && category !== "General" && (
              <Badge>{category}</Badge>
            )}
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>
          <h2 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
            {title}
          </h2>
          <p className="text-muted text-sm leading-relaxed flex-1 line-clamp-4">
            {excerpt || (content ? stripHtml(content) : "")}
          </p>
          {publishedAt && (
            <div className="flex items-center gap-2 mt-4 text-xs text-muted">
              <Calendar size={12} />
              {new Date(publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
