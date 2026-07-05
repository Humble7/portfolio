import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAuth, verifyPassword, hashPassword } from "@/lib/auth";
import { changePasswordSchema } from "@/validators/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function PUT(request: Request) {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Throttle guessing of the current password: 5 tries per 15 minutes per IP
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      hdrs.get("x-real-ip") ||
      "unknown";
    const { allowed } = rateLimit(`password:${ip}`, 5, 15 * 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { id: auth.userId } });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const valid = await verifyPassword(parsed.data.currentPassword, admin.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(parsed.data.newPassword);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
