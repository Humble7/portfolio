"use client";

import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

interface YouTubeEmbedProps {
  url: string;
  className?: string;
}

export function YouTubeEmbed({ url, className }: YouTubeEmbedProps) {
  const videoId = extractYouTubeId(url);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Pre-warm connection
          const link = document.createElement("link");
          link.rel = "preconnect";
          link.href = "https://www.youtube.com";
          document.head.appendChild(link);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (!videoId) return null;

  return (
    <div
      ref={ref}
      className={`relative aspect-video rounded-2xl overflow-hidden bg-white/5 ${className || ""}`}
    >
      {loaded ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button
          onClick={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full flex items-center justify-center group cursor-pointer"
        >
          <img
            src={getYouTubeThumbnail(videoId)}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          <div className="relative w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={28} className="text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}
