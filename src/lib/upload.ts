import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "./prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUpload(file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url = `/uploads/${filename}`;

  const upload = await prisma.upload.create({
    data: {
      filename: file.name,
      url,
      mimeType: file.type,
      size: file.size,
    },
  });

  return upload;
}
