"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  User,
  Image,
  MessageSquare,
  BarChart3,
  PenLine,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/resume", label: "Resume", icon: User },
  { href: "/admin/uploads", label: "Media", icon: Image },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/content", label: "Content", icon: PenLine },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change — state derived during render instead of in an effect
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    // Full navigation clears the client router cache, which still holds
    // authenticated /admin pages after the cookie is gone
    window.location.href = "/admin/login";
  };

  // The login page renders inside this layout too — no sidebar there
  if (pathname === "/admin/login") return null;

  const sidebarContent = (
    <>
      <div className="p-6 border-b hairline flex items-center justify-between">
        <Link href="/admin" className="font-serif text-xl tracking-tight">
          Admin
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden p-1 text-muted hover:text-foreground cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:text-foreground hover:bg-foreground/[0.04]"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t hairline">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-muted hover:text-red-600 hover:bg-red-500/5 transition-colors w-full cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b hairline glass-strong border-x-0 border-t-0 flex items-center px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 text-muted hover:text-foreground cursor-pointer"
        >
          <Menu size={22} />
        </button>
        <span className="ml-3 text-sm font-bold">Admin</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-out sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 w-64 h-full bg-background border-r hairline flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen border-r hairline bg-glass-bg flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
