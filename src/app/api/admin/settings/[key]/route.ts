import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const row = await prisma.siteSetting.findUnique({ where: { key } });

  return NextResponse.json({
    success: true,
    data: { key, value: row?.value ?? null },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { key } = await params;
  const body = await request.json();

  if (body.value === undefined || body.value === null) {
    return NextResponse.json({ success: false, error: "Missing value" }, { status: 400 });
  }

  const value = String(body.value);

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json({ success: true });
}
