"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface AnalyticsFiltersProps {
  countries: string[];
  currentCountry?: string;
  currentFrom?: string;
  currentTo?: string;
}

const quickRanges = [
  { label: "Today", days: 0 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getActiveRange(from?: string, to?: string): number | null {
  if (!from) return 30; // default is 30 days
  const today = formatDate(new Date());
  if (to && to !== today) return null;
  for (const r of quickRanges) {
    const rangeFrom = new Date();
    rangeFrom.setDate(rangeFrom.getDate() - r.days);
    if (formatDate(rangeFrom) === from) return r.days;
  }
  return null;
}

export function AnalyticsFilters({
  countries,
  currentCountry,
  currentFrom,
  currentTo,
}: AnalyticsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      router.push(`/admin/analytics?${params.toString()}`);
    },
    [router, searchParams]
  );

  const activeRange = getActiveRange(currentFrom, currentTo);

  const btnBase =
    "px-3 py-1.5 text-sm rounded-sm border transition-colors cursor-pointer";
  const btnActive = "bg-accent/15 border-accent/50 text-accent";
  const btnInactive =
    "bg-foreground/[0.04] hairline text-muted hover:text-foreground hover:border-foreground/25";
  const inputClass =
    "bg-foreground/[0.04] border hairline rounded-sm px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent/50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick range buttons */}
      {quickRanges.map((r) => (
        <button
          key={r.days}
          onClick={() => {
            const from = new Date();
            from.setDate(from.getDate() - r.days);
            updateFilter({ from: formatDate(from), to: formatDate(new Date()) });
          }}
          className={`${btnBase} ${activeRange === r.days ? btnActive : btnInactive}`}
        >
          {r.label}
        </button>
      ))}

      {/* Custom date inputs */}
      <input
        type="date"
        defaultValue={currentFrom}
        onChange={(e) => updateFilter({ from: e.target.value })}
        className={inputClass}
      />
      <span className="text-muted text-sm">to</span>
      <input
        type="date"
        defaultValue={currentTo}
        onChange={(e) => updateFilter({ to: e.target.value })}
        className={inputClass}
      />

      {/* Country filter */}
      <select
        defaultValue={currentCountry || ""}
        onChange={(e) => updateFilter({ country: e.target.value })}
        className={inputClass}
      >
        <option value="">All countries</option>
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
