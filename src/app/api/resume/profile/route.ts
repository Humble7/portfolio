import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { profileSchema } from "@/validators/resume";
import { getCache, setCache, clearCache } from "@/lib/api-cache";

const CACHE_KEY = "resume:profile";

export async function GET() {
  const cached = getCache(CACHE_KEY);
  if (cached) return NextResponse.json({ success: true, data: cached });

  const profile = await prisma.resumeProfile.findFirst();
  if (profile) setCache(CACHE_KEY, profile);
  return NextResponse.json({ success: true, data: profile });
}

export async function PUT(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.resumeProfile.findFirst();

    const profile = existing
      ? await prisma.resumeProfile.update({
          where: { id: existing.id },
          data: parsed.data,
        })
      : await prisma.resumeProfile.create({ data: parsed.data });

    clearCache(CACHE_KEY);
    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
