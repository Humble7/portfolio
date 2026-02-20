import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";

export async function GET() {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const uploads = await prisma.upload.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, data: uploads });
}

export async function DELETE(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    const upload = await prisma.upload.findUnique({ where: { id } });
    if (!upload) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // Delete file from Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.portfolio_uploads_READ_WRITE_TOKEN;
    await del(upload.url, { token }).catch(() => {});

    await prisma.upload.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const upload = await saveUpload(file);

    return NextResponse.json({ success: true, data: upload });
  } catch {
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
