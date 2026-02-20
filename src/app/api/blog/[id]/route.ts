import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { updateBlogSchema } from "@/validators/blog";
import { clearCachePrefix } from "@/lib/api-cache";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
  }

  const auth = await verifyAuth();
  if (!auth && post.status !== "PUBLISHED") {
    return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: post });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateBlogSchema.safeParse(body);

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

    const post = await prisma.blogPost.update({
      where: { id },
      data: data as Parameters<typeof prisma.blogPost.update>[0]["data"],
    });

    clearCachePrefix("blog:");
    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.blogPost.delete({ where: { id } });
    clearCachePrefix("blog:");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
  }
}
