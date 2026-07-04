"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface BlogFiltersProps {
  categories: string[];
}

export function BlogFilters({ categories }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";
  const currentQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(currentQuery);

  const tabs = ["All", ...categories];

  const buildUrl = useCallback(
    (params: { category?: string; q?: string }) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (params.category !== undefined) {
        if (params.category === "All") sp.delete("category");
        else sp.set("category", params.category);
      }
      if (params.q !== undefined) {
        if (params.q === "") sp.delete("q");
        else sp.set("q", params.q);
      }
      const qs = sp.toString();
      return `/blog${qs ? `?${qs}` : ""}`;
    },
    [searchParams],
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== currentQuery) {
        router.push(buildUrl({ q: query }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, currentQuery, router, buildUrl]);

  // Sync external searchParams → local state
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  return (
    <div className="flex flex-col gap-6 mb-12">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((cat) => {
          const isActive = cat === currentCategory;
          return (
            <button
              key={cat}
              onClick={() => router.push(buildUrl({ category: cat }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-foreground/[0.04] text-muted hover:bg-foreground/[0.08] hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search box */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-11 pr-4 py-3 rounded-sm bg-transparent border border-border text-foreground placeholder:text-muted focus:outline-none focus:border-accent text-sm"
        />
      </div>
    </div>
  );
}
