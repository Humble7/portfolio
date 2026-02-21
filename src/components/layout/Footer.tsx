"use client";

import { useState } from "react";
import { Github, Linkedin, Mail, Check } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const { profile } = useSiteContent();

  const name = profile?.name || "Portfolio";
  const email = profile?.email || "";
  const githubUrl = profile?.githubUrl || "";
  const linkedinUrl = profile?.linkedinUrl || "";

  const copyEmail = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} {name}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          )}
          {email && (
            <button
              onClick={copyEmail}
              className="text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Copy email"
              title={copied ? "Copied!" : "Copy email"}
            >
              {copied ? <Check size={20} className="text-green-400" /> : <Mail size={20} />}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
