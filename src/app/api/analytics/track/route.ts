import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isDuplicate } from "@/lib/visit-dedup";
import { getCountryFromIP } from "@/lib/geo";
import { rateLimit } from "@/lib/rate-limit";
import { getSetting } from "@/lib/settings";

const BOT_PATTERN = /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|mediapartners|googlebot|baiduspider|yandex|sogou|duckduckbot|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot|vercel|prerender/i;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Duration update (sent via sendBeacon as POST)
    if (body.visitId && typeof body.duration === "number") {
      return handleDurationUpdate(body.visitId, body.duration);
    }

    // New visit
    const path = typeof body.path === "string" ? body.path : null;
    if (!path || path.length > 500) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const hdrs = await headers();

    // Skip bot traffic
    const ua = hdrs.get("user-agent") || "";
    if (BOT_PATTERN.test(ua)) {
      return NextResponse.json({ ok: true });
    }
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "unknown";

    // Rate limit: 60 tracking requests per minute per IP
    const { allowed } = rateLimit(ip, 60, 60_000);
    if (!allowed) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    // Geo lookup
    const headerCountry =
      hdrs.get("x-vercel-ip-country") || hdrs.get("cf-ipcountry");
    const country = await getCountryFromIP(ip, headerCountry);

    const detailedTracking = await getSetting("trackVisits", true, true);
    const timezone =
      typeof body.timezone === "string" && body.timezone.length < 100
        ? body.timezone
        : "";

    // Create raw visit record only if detailed tracking is on
    let visitId: string | undefined;
    if (detailedTracking) {
      const visit = await prisma.pageVisit.create({
        data: { path, country, timezone },
      });
      visitId = visit.id;
    }

    // Aggregate: dedup same IP+path per day
    if (!isDuplicate(ip, path)) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      await prisma.pageView.upsert({
        where: {
          path_country_date: { path, country, date: today },
        },
        update: { count: { increment: 1 } },
        create: { path, country, date: today, count: 1 },
      });
    }

    return NextResponse.json({ ok: true, visitId });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function handleDurationUpdate(visitId: unknown, duration: unknown) {
  if (
    typeof visitId !== "string" ||
    typeof duration !== "number" ||
    duration < 0 ||
    duration > 86400
  ) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await prisma.pageVisit.update({
      where: { id: visitId },
      data: { duration: Math.round(duration) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
