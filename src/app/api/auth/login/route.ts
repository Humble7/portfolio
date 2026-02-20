import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signToken, verifyPassword, getAuthCookieConfig } from "@/lib/auth";
import { loginSchema } from "@/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signToken({ userId: admin.id, email: admin.email });
    const cookieStore = await cookies();
    const cookieConfig = getAuthCookieConfig(token);
    cookieStore.set(cookieConfig.name, cookieConfig.value, cookieConfig);

    return NextResponse.json({
      success: true,
      data: { user: { id: admin.id, email: admin.email, name: admin.name } },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
