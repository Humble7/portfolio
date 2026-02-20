import type { Metadata } from "next";
import { inter } from "@/styles/fonts";
import { ToastProvider } from "@/components/ui/Toast";
import { PageTracker } from "@/components/PageTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zhen Chen | Senior iOS Engineer",
    template: "%s | Zhen Chen",
  },
  description:
    "Senior iOS Engineer with 5+ years of experience building high-performance mobile apps at DiDi, Shopee, and more.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <PageTracker />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
