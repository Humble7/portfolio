"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";
import { useSiteContent } from "@/lib/site-content";

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hideBlog, setHideBlog] = useState(false);
  const prevScroll = useRef(0);
  const { profile } = useSiteContent();

  const brandName = profile?.name || "Portfolio";

  useEffect(() => {
    fetch("/api/admin/settings/showBlog")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.data?.value === "false") setHideBlog(true); });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > prevScroll.current && y > 150);
      setScrolled(y > 50);
      prevScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled ? "glass-strong border-x-0 border-t-0" : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-2xl tracking-tight text-foreground hover:text-accent transition-colors"
        >
          {brandName}
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.filter((l) => !(hideBlog && l.href === "/blog")).map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-mono text-xs uppercase tracking-[0.18em] text-foreground/70 hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-strong border-t hairline"
        >
          <ul className="px-6 py-4 space-y-4">
            {NAV_LINKS.filter((l) => !(hideBlog && l.href === "/blog")).map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block font-mono text-sm uppercase tracking-[0.18em] text-muted hover:text-accent transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.header>
  );
}
