import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { skillSchema } from "@/validators/resume";
import { getCache, setCache, clearCache } from "@/lib/resume-cache";

const CACHE_KEY = "resume:skills";

export async function GET() {
  const cached = getCache(CACHE_KEY);
  if (cached) return NextResponse.json({ success: true, data: cached });

  const skills = await prisma.skill.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  setCache(CACHE_KEY, skills);
  return NextResponse.json({ success: true, data: skills });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = skillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({ data: parsed.data });

    clearCache(CACHE_KEY);
    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
