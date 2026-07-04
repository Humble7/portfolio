import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-widest",
        variant === "default" && "border-border text-muted",
        variant === "accent" && "border-accent/40 text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
