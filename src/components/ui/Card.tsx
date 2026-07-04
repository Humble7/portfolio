import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-sm p-6 transition-colors duration-200 hover:border-accent/50",
        className
      )}
    >
      {children}
    </div>
  );
}
