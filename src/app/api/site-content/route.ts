import { prisma } from "@/lib/prisma";
import { getCache, setCache, cachedJson } from "@/lib/api-cache";

const CACHE_KEY = "site-content";

export async function GET() {
  const cached = getCache(CACHE_KEY);
  if (cached) return cachedJson({ success: true, data: cached });

  const [profile, settings] = await Promise.all([
    prisma.resumeProfile.findFirst(),
    prisma.siteSetting.findMany({
      where: { key: { startsWith: "content." } },
    }),
  ]);

  const content: Record<string, string> = {};
  for (const s of settings) {
    content[s.key.replace("content.", "")] = s.value;
  }

  const data = { profile, content };
  setCache(CACHE_KEY, data);
  return cachedJson({ success: true, data });
}
