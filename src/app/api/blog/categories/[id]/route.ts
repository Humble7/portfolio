import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { clearCachePrefix } from "@/lib/api-cache";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const data: { name?: string; sortOrder?: number } = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

  if (data.name === "") {
    return NextResponse.json({ success: false, error: "Name cannot be empty" }, { status: 400 });
  }

  try {
    const category = await prisma.blogCategory.update({
      where: { id },
      data,
    });
    clearCachePrefix("blog:");
    return NextResponse.json({ success: true, data: category });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ success: false, error: "Category already exists" }, { status: 409 });
    }
    if (message.includes("Record to update not found")) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const category = await prisma.blogCategory.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
  }

  // Reset posts with this category to "General"
  await prisma.blogPost.updateMany({
    where: { category: category.name },
    data: { category: "General" },
  });

  await prisma.blogCategory.delete({ where: { id } });

  clearCachePrefix("blog:");
  return NextResponse.json({ success: true });
}
