"use client";

import { useState } from "react";
import { SOCIAL_LINKS } from "@/lib/constants";
import { Github, Linkedin, Mail, Check } from "lucide-react";

const EMAIL = "chenzhennba@gmail.com";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Zhen Chen. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href={SOCIAL_LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-foreground transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>
          <button
            onClick={copyEmail}
            className="text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Copy email"
            title={copied ? "Copied!" : "Copy email"}
          >
            {copied ? <Check size={20} className="text-green-400" /> : <Mail size={20} />}
          </button>
        </div>
      </div>
    </footer>
  );
}
