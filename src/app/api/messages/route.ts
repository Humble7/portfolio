import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/validators/message";
import { rateLimit } from "@/lib/rate-limit";

// Public: submit a contact message
export async function POST(request: Request) {
  try {
    // Reject oversized payloads early (max ~3KB)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 3000) {
      return NextResponse.json(
        { success: false, error: "Request too large" },
        { status: 413 }
      );
    }

    const body = await request.json();

    // Honeypot: if the hidden field has a value, it's a bot
    if (body.website) {
      // Return success to not reveal the trap
      return NextResponse.json({ success: true });
    }

    // Rate limiting by IP (5 messages per hour)
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               hdrs.get("x-real-ip") ||
               "unknown";
    const { allowed, remaining } = rateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await prisma.message.create({ data: parsed.data });

    return NextResponse.json(
      { success: true },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// Admin: list all messages
export async function GET() {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: messages });
}
