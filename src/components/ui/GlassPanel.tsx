"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hover3d?: boolean;
  as?: React.ElementType;
}

export function GlassPanel({
  children,
  className,
  hover3d = false,
  as: Component = "div",
}: GlassPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3d || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
    );
  };

  const handleMouseLeave = () => {
    if (hover3d) setTransform("");
  };

  return (
    <Component
      ref={ref}
      className={cn("glass rounded-2xl p-6", className)}
      style={{
        transform,
        transition: hover3d ? "transform 0.3s ease-out" : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Component>
  );
}
