import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { getCache, setCache, clearCache } from "@/lib/api-cache";

const CACHE_KEY = "blog:categories";

export async function GET() {
  try {
    const cached = getCache(CACHE_KEY);
    if (cached) return NextResponse.json({ success: true, data: cached });

    const categories = await prisma.blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });
    setCache(CACHE_KEY, categories);
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const maxOrder = await prisma.blogCategory.aggregate({ _max: { sortOrder: true } });
    const category = await prisma.blogCategory.create({
      data: { name, sortOrder: (maxOrder._max.sortOrder ?? -1) + 1 },
    });

    clearCache(CACHE_KEY);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ success: false, error: "Category already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
