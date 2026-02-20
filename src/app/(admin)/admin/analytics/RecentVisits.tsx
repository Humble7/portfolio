"use client";

import { useState, useMemo } from "react";

interface Visit {
  id: string;
  path: string;
  country: string;
  timezone: string;
  duration: number;
  visitedAt: string; // ISO string from server
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

const timeFormat: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

function formatVisitorLocalTime(iso: string, tz: string): string {
  if (!tz) return "-";
  try {
    return new Date(iso).toLocaleString(undefined, {
      ...timeFormat,
      timeZone: tz,
    });
  } catch {
    return "-";
  }
}

export function RecentVisits({ visits }: { visits: Visit[] }) {
  const [dateFilter, setDateFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const countries = useMemo(
    () => [...new Set(visits.map((v) => v.country))].sort(),
    [visits],
  );

  const filtered = useMemo(() => {
    let result = visits;
    if (dateFilter) {
      result = result.filter(
        (v) => v.visitedAt.slice(0, 10) === dateFilter,
      );
    }
    if (countryFilter) {
      result = result.filter((v) => v.country === countryFilter);
    }
    return result;
  }, [visits, dateFilter, countryFilter]);

  if (visits.length === 0) {
    return <p className="text-muted text-sm">No visits yet.</p>;
  }

  const inputClass =
    "bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent/50";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={inputClass}
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(dateFilter || countryFilter) && (
          <button
            onClick={() => { setDateFilter(""); setCountryFilter(""); }}
            className="px-3 py-1.5 text-sm text-muted hover:text-foreground cursor-pointer"
          >
            Clear
          </button>
        )}
        <span className="text-xs text-muted ml-auto">
          {filtered.length} / {visits.length} visits
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-white/10">
              <th className="pb-2 pr-4">Page</th>
              <th className="pb-2 pr-4">Country</th>
              <th className="pb-2 pr-4">Your Time</th>
              <th className="pb-2 pr-4">Visitor Time</th>
              <th className="pb-2 text-right">Duration</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-white/5 last:border-0">
                <td className="py-2 pr-4 truncate max-w-[200px]">{v.path}</td>
                <td className="py-2 pr-4">{v.country}</td>
                <td className="py-2 pr-4 text-muted whitespace-nowrap" suppressHydrationWarning>
                  {new Date(v.visitedAt).toLocaleString(undefined, timeFormat)}
                </td>
                <td className="py-2 pr-4 text-muted whitespace-nowrap" suppressHydrationWarning>
                  {v.timezone
                    ? formatVisitorLocalTime(v.visitedAt, v.timezone)
                    : "-"}
                  {v.timezone && (
                    <span className="ml-1 text-[10px] text-white/30">
                      ({v.timezone.split("/").pop()})
                    </span>
                  )}
                </td>
                <td className="py-2 text-right text-muted">
                  {v.duration > 0 ? formatDuration(v.duration) : "-"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted text-sm">
                  No visits match the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
