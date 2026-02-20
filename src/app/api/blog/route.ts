import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { createBlogSchema } from "@/validators/blog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim() || "";

  const auth = await verifyAuth();
  const isPublic = !auth;

  // Full-text search path
  if (q) {
    const posts = await prisma.$queryRaw`
      SELECT * FROM blog_posts
      WHERE (${isPublic}::boolean = false OR status = 'PUBLISHED')
        AND (${status}::text IS NULL OR status = ${status ?? ""}::text)
        AND (${category}::text IS NULL OR category = ${category ?? ""}::text)
        AND (${tag}::text IS NULL OR ${tag ?? ""}::text = ANY(tags))
        AND to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,''))
            @@ plainto_tsquery('simple', ${q})
      ORDER BY ts_rank(
        to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'')),
        plainto_tsquery('simple', ${q})
      ) DESC
    `;
    return NextResponse.json({ success: true, data: posts });
  }

  // Standard Prisma path
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (isPublic) where.status = "PUBLISHED";
  if (tag) where.tags = { has: tag };
  if (category) where.category = category;

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: posts });
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createBlogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.publishedAt) {
      data.publishedAt = new Date(parsed.data.publishedAt);
    }
    if (parsed.data.status === "PUBLISHED" && !parsed.data.publishedAt) {
      data.publishedAt = new Date();
    }

    const post = await prisma.blogPost.create({ data: data as Parameters<typeof prisma.blogPost.create>[0]["data"] });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { success: false, error: "A post with this slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
