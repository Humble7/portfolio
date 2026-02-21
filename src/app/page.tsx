"use client";

import { ScrollProvider, ScrollProgress } from "@/components/scroll";
import { Navbar, Footer } from "@/components/layout";
import { SiteContentProvider } from "@/lib/site-content";
import {
  ActHero,
  ActEngineer,
  ActBuilder,
  ActProjects,
  ActVision,
  ActContact,
} from "@/components/acts";

export default function Home() {
  return (
    <SiteContentProvider>
      <ScrollProvider>
        <ScrollProgress />
        <Navbar />
        <main>
          <ActHero />
          <ActEngineer />
          <ActBuilder />
          <ActProjects />
          <ActVision />
          <ActContact />
        </main>
        <Footer />
      </ScrollProvider>
    </SiteContentProvider>
  );
}
