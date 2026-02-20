"use client";

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
  if (visits.length === 0) {
    return <p className="text-muted text-sm">No visits yet.</p>;
  }

  return (
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
          {visits.map((v) => (
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
        </tbody>
      </table>
    </div>
  );
}
