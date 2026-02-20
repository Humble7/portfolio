import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function DELETE(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "90", 10);

  if (isNaN(days) || days < 1) {
    return NextResponse.json({ success: false, error: "Invalid days" }, { status: 400 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const result = await prisma.pageVisit.deleteMany({
    where: { visitedAt: { lt: cutoff } },
  });

  return NextResponse.json({ success: true, deleted: result.count });
}
