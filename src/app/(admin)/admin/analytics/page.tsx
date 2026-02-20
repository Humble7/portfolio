import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";
import { Card, Toggle } from "@/components/ui";
import { Eye, Globe, FileText, TrendingUp, Clock } from "lucide-react";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { RecentVisits } from "./RecentVisits";
import { SimpleBarChart } from "@/components/admin/SimpleBarChart";

export const dynamic = "force-dynamic";

interface SearchParams {
  from?: string;
  to?: string;
  country?: string;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Default: last 30 days
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  defaultFrom.setUTCHours(0, 0, 0, 0);

  const from = params.from ? new Date(params.from) : defaultFrom;
  const to = params.to ? new Date(params.to) : now;
  to.setUTCHours(23, 59, 59, 999);

  const countryFilter = params.country || undefined;

  // Build where clause
  const where = {
    date: { gte: from, lte: to },
    ...(countryFilter ? { country: countryFilter } : {}),
  };

  const trackVisitsEnabled = await getSetting("trackVisits");

  // Fetch data in parallel
  const [pageViews, countries, dailyViews, recentVisits] = await Promise.all([
    // All page views matching filters
    prisma.pageView.findMany({
      where,
      orderBy: { date: "desc" },
    }),
    // Distinct countries for filter dropdown
    prisma.pageView
      .findMany({
        select: { country: true },
        distinct: ["country"],
        orderBy: { country: "asc" },
      })
      .then((rows) => rows.map((r) => r.country)),
    // Daily totals for chart
    prisma.pageView.groupBy({
      by: ["date"],
      where,
      _sum: { count: true },
      orderBy: { date: "asc" },
    }),
    // Recent individual visits
    prisma.pageVisit.findMany({
      where: {
        visitedAt: { gte: from, lte: to },
        ...(countryFilter ? { country: countryFilter } : {}),
      },
      orderBy: { visitedAt: "desc" },
      take: 50,
    }),
  ]);

  // Aggregate stats
  const totalViews = pageViews.reduce((sum, pv) => sum + pv.count, 0);
  const uniquePages = new Set(pageViews.map((pv) => pv.path)).size;
  const uniqueCountries = new Set(pageViews.map((pv) => pv.country)).size;

  // Today's views
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayViews = pageViews
    .filter((pv) => pv.date.toISOString().slice(0, 10) === todayStr)
    .reduce((sum, pv) => sum + pv.count, 0);

  // Chart data: daily views
  const chartData = dailyViews.map((d) => ({
    label: d.date.toISOString().slice(5, 10), // "MM-DD"
    value: d._sum.count || 0,
  }));

  // Top pages
  const pageMap = new Map<string, number>();
  for (const pv of pageViews) {
    pageMap.set(pv.path, (pageMap.get(pv.path) || 0) + pv.count);
  }
  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Top countries
  const countryMap = new Map<string, number>();
  for (const pv of pageViews) {
    countryMap.set(pv.country, (countryMap.get(pv.country) || 0) + pv.count);
  }
  const topCountries = [...countryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Average duration (only visits with duration > 0)
  const visitsWithDuration = recentVisits.filter((v) => v.duration > 0);
  const avgDuration =
    visitsWithDuration.length > 0
      ? Math.round(
          visitsWithDuration.reduce((s, v) => s + v.duration, 0) /
            visitsWithDuration.length
        )
      : 0;

  const stats = [
    { label: "Total Views", value: totalViews, icon: Eye },
    { label: "Today", value: todayViews, icon: TrendingUp },
    { label: "Avg Duration", value: formatDuration(avgDuration), icon: Clock },
    { label: "Countries", value: uniqueCountries, icon: Globe },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <Toggle label="Detailed tracking" initial={trackVisitsEnabled} settingKey="trackVisits" />
        </div>
        <AnalyticsFilters
          countries={countries}
          currentCountry={countryFilter}
          currentFrom={params.from}
          currentTo={params.to}
        />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Daily views chart */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Daily Views</h2>
        <SimpleBarChart data={chartData} height={200} />
      </Card>

      {/* Top pages + Top countries */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Top Pages</h2>
          {topPages.length === 0 ? (
            <p className="text-muted text-sm">No data yet.</p>
          ) : (
            <div className="space-y-1">
              {topPages.map(([path, count]) => (
                <div
                  key={path}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm truncate mr-4">{path}</span>
                  <span className="text-sm font-medium text-muted shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Top Countries</h2>
          {topCountries.length === 0 ? (
            <p className="text-muted text-sm">No data yet.</p>
          ) : (
            <div className="space-y-1">
              {topCountries.map(([country, count]) => (
                <div
                  key={country}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm">{country}</span>
                  <span className="text-sm font-medium text-muted">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Visits */}
      <Card className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Visits</h2>
        <RecentVisits
          visits={recentVisits.map((v) => ({
            ...v,
            visitedAt: v.visitedAt.toISOString(),
          }))}
        />
      </Card>
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
