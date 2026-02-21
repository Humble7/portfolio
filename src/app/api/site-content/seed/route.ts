import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { clearCache } from "@/lib/api-cache";

const DEFAULTS: Record<string, string> = {
  "content.hero.title1": "Crafting Native",
  "content.hero.title2": "Experiences",
  "content.hero.subtitle":
    "Senior iOS Engineer. 5+ years at DiDi, Shopee, Mozat & more.\nBuilding high-performance, user-centric mobile apps.",
  "content.engineer.label": "Chapter One",
  "content.engineer.heading": "Every engineer has a story. This is mine.",
  "content.builder.label": "Chapter Two",
  "content.builder.heading":
    "I build native apps that feel right. Smooth, fast, and delightful.",
  "content.builder.paragraph1":
    "My craft lives at the intersection of {binary-level performance} and {modular architecture}. From app launch optimization to mission-critical trip modules at scale.",
  "content.builder.paragraph2":
    "From {RIBs architecture at DiDi} to {QUIC networking at Shopee}, I thrive in large-scale production environments.",
  "content.projects.label": "Chapter Three",
  "content.projects.heading": "Selected Work",
  "content.vision.label": "The Vision",
  "content.vision.heading": "Performance is a {feature}.",
  "content.vision.description":
    "From binary rearrangement to QUIC networking — I believe every millisecond counts. The best apps don't just work, they feel instant. That's the standard I build to.",
  "content.contact.label": "Get in Touch",
  "content.contact.heading": "Let's build something {together}.",
  "content.contact.description":
    "I'm always interested in hearing about new projects, opportunities, and ideas. Whether you want to collaborate or just say hello, I'd love to hear from you.",
};

export async function POST() {
  const auth = await verifyAuth();
  if (!auth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let created = 0;
  for (const [key, value] of Object.entries(DEFAULTS)) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (!existing) {
      await prisma.siteSetting.create({ data: { key, value } });
      created++;
    }
  }

  clearCache("site-content");
  return NextResponse.json({ success: true, created, total: Object.keys(DEFAULTS).length });
}
