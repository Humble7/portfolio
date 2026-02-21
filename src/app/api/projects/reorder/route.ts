import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { clearCachePrefix } from "@/lib/api-cache";

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "ids must be a non-empty array" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.project.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    clearCachePrefix("projects:");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
