import { cn } from "@/lib/utils";

interface BlogRendererProps {
  content: string;
  className?: string;
}

export function BlogRenderer({ content, className }: BlogRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-invert prose-lg max-w-none",
        "prose-headings:font-bold prose-headings:tracking-tight",
        "prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl",
        "prose-p:text-muted prose-p:leading-relaxed",
        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
        "prose-strong:text-foreground",
        "prose-code:text-accent prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
        "prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl",
        "prose-img:rounded-2xl",
        "prose-blockquote:border-accent prose-blockquote:text-muted",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
