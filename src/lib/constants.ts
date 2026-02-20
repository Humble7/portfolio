export const SITE = {
  name: "Zhen Chen",
  title: "Senior iOS Engineer",
  description:
    "Senior iOS Engineer with 5+ years of experience building high-performance, user-centric mobile apps at DiDi, Shopee, and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/#projects" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/#contact" },
] as const;

export const SOCIAL_LINKS = {
  github: "https://github.com/Humble7",
  linkedin: "https://www.linkedin.com/in/humble7/",
  email: "mailto:chenzhennba@gmail.com",
} as const;
