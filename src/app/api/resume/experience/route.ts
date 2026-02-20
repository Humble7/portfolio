import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { experienceSchema } from "@/validators/resume";
import { getCache, setCache, clearCache } from "@/lib/api-cache";

const CACHE_KEY = "resume:experience";

export async function GET() {
  const cached = getCache(CACHE_KEY);
  if (cached) return NextResponse.json({ success: true, data: cached });

  const experiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
  });
  setCache(CACHE_KEY, experiences);
  return NextResponse.json({ success: true, data: experiences });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = experienceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    };

    const experience = await prisma.experience.create({ data });

    clearCache(CACHE_KEY);
    return NextResponse.json({ success: true, data: experience }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
