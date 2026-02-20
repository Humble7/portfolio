import { put } from "@vercel/blob";
import { prisma } from "./prisma";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.portfolio_uploads_READ_WRITE_TOKEN;

export async function saveUpload(file: File) {
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

  const blob = await put(filename, file, {
    access: "public",
    token: BLOB_TOKEN,
  });

  const upload = await prisma.upload.create({
    data: {
      filename: file.name,
      url: blob.url,
      mimeType: file.type,
      size: file.size,
    },
  });

  return upload;
}
