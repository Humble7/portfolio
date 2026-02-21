"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  avatarUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
}

interface SiteContent {
  profile: Profile | null;
  content: Record<string, string>;
}

const EMPTY: SiteContent = { profile: null, content: {} };

const SiteContentContext = createContext<SiteContent>(EMPTY);

// Shared fetch with TTL so multiple components share one request,
// and stale data is refreshed after 5 minutes.
let fetchPromise: Promise<SiteContent> | null = null;
let fetchedAt = 0;
const CLIENT_TTL = 5 * 60_000; // 5 minutes

function fetchSiteContent(): Promise<SiteContent> {
  const now = Date.now();
  if (!fetchPromise || now - fetchedAt > CLIENT_TTL) {
    fetchedAt = now;
    fetchPromise = fetch("/api/site-content")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.data ?? EMPTY)
      .catch(() => EMPTY);
  }
  return fetchPromise;
}

/**
 * Provider for the homepage — fetches once, shares with all children.
 */
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteContent>(EMPTY);

  useEffect(() => {
    fetchSiteContent().then(setData);
  }, []);

  return (
    <SiteContentContext.Provider value={data}>{children}</SiteContentContext.Provider>
  );
}

/**
 * Returns site content. Works both with and without a provider:
 * - Inside SiteContentProvider: returns shared context data
 * - Outside provider: auto-fetches (shared across all hooks)
 */
export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  const [fallback, setFallback] = useState<SiteContent>(EMPTY);

  const hasProvider = ctx.profile !== null || Object.keys(ctx.content).length > 0;

  useEffect(() => {
    if (!hasProvider) {
      fetchSiteContent().then(setFallback);
    }
  }, [hasProvider]);

  return hasProvider ? ctx : fallback;
}

/** Get content value with fallback */
export function useContent(key: string, fallback: string = "") {
  const { content } = useSiteContent();
  return content[key] || fallback;
}
