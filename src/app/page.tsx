"use client";

import { ScrollProvider, ScrollProgress } from "@/components/scroll";
import { Navbar, Footer } from "@/components/layout";
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
  );
}
