import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLogoutCookieConfig } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const cookieConfig = getLogoutCookieConfig();
  cookieStore.set(cookieConfig.name, cookieConfig.value, cookieConfig);

  return NextResponse.json({ success: true });
}
