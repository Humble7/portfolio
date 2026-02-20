import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin
  const password = await hash("change-me-immediately", 12);
  const admin = await prisma.admin.upsert({
    where: { email: "chenzhennba@gmail.com" },
    update: {},
    create: {
      email: "chenzhennba@gmail.com",
      name: "Zhen Chen",
      password,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create default resume profile
  await prisma.resumeProfile.upsert({
    where: { id: "default-profile" },
    update: {},
    create: {
      id: "default-profile",
      name: "Zhen Chen",
      title: "Senior iOS Engineer",
      bio: "Senior iOS Engineer with 5+ years of experience building high-performance, user-centric mobile apps in large-scale production environments. Specialized in optimizing app performance and working on mission-critical modules in the ride-hailing domain (DiDi), including in-trip coordination, trip-end workflows, and marketing surfaces. Skilled in modular architecture (RIBs, MVVM), binary-level performance tuning, and cross-functional collaboration.",
      email: "chenzhennba@gmail.com",
      location: "Australia",
      githubUrl: "https://github.com/Humble7",
      linkedinUrl: "https://www.linkedin.com/in/humble7/",
    },
  });
  console.log("Default resume profile created");

  // Seed experiences
  const experiences = [
    {
      company: "TDMN",
      role: "iOS Engineer",
      description:
        "Migrated legacy UIKit interfaces to SwiftUI while preserving core functionalities and enhancing UI responsiveness. Maintained and delivered regular updates for CartR, UK Strollers, and Smart Lock apps.",
      startDate: new Date("2025-03-01"),
      endDate: null,
      current: true,
      sortOrder: 0,
    },
    {
      company: "Mozat",
      role: "iOS Engineer",
      description:
        "Established a unified development environment for the team, improving collaboration and code consistency. Designed a shopping app architecture based on MVVM and Coordinator patterns, enhancing app scalability and maintainability.",
      startDate: new Date("2022-12-01"),
      endDate: new Date("2023-09-01"),
      current: false,
      sortOrder: 1,
    },
    {
      company: "Shopee",
      role: "iOS Engineer",
      description:
        "Optimized networking by employing QUIC and HTTP-DNS, improving connection speed and reliability. Developed a networking monitor library for all network requests. Managed the Shopee Internal Networking Library for all iOS applications.",
      startDate: new Date("2021-09-01"),
      endDate: new Date("2022-12-01"),
      current: false,
      sortOrder: 2,
    },
    {
      company: "DiDi",
      role: "iOS Engineer",
      description:
        "Developed mission-critical modules in the trip lifecycle: in-trip real-time route updates, trip-end page redesign with RIBs architecture, and marketing module with dynamic banners and A/B testing. Optimized app launch time by 8% through binary rearrangement. Delivered a company-wide technical sharing session.",
      startDate: new Date("2020-08-01"),
      endDate: new Date("2021-08-01"),
      current: false,
      sortOrder: 3,
    },
    {
      company: "MoMo",
      role: "iOS Engineer",
      description:
        "Participated in the ArgoUI project and developed key modules using Objective-C and Swift. Built the desktop version of JSON to Objective-C model using TDD, enhancing code reliability and maintainability.",
      startDate: new Date("2019-07-01"),
      endDate: new Date("2020-08-01"),
      current: false,
      sortOrder: 4,
    },
  ];

  for (const exp of experiences) {
    await prisma.experience.create({ data: exp });
  }
  console.log(`${experiences.length} experiences created`);

  // Seed education
  const educations = [
    {
      institution: "University of Wollongong",
      degree: "Master of Computer Science",
      field: "Computer Science",
      startDate: new Date("2024-07-01"),
      endDate: new Date("2026-07-01"),
      sortOrder: 0,
    },
    {
      institution: "Dalian Neusoft University of Information",
      degree: "Bachelor of Computer Science",
      field: "Computer Science",
      startDate: new Date("2015-09-01"),
      endDate: new Date("2019-06-01"),
      sortOrder: 1,
    },
  ];

  for (const edu of educations) {
    await prisma.education.create({ data: edu });
  }
  console.log(`${educations.length} education entries created`);

  // Seed skills
  const skills = [
    { name: "Swift", category: "Languages", proficiency: 95, sortOrder: 0 },
    { name: "SwiftUI", category: "Languages", proficiency: 85, sortOrder: 1 },
    { name: "Objective-C", category: "Languages", proficiency: 90, sortOrder: 2 },
    { name: "JavaScript", category: "Languages", proficiency: 60, sortOrder: 3 },
    { name: "Python", category: "Languages", proficiency: 55, sortOrder: 4 },
    { name: "RIBs", category: "Architecture", proficiency: 85, sortOrder: 0 },
    { name: "MVVM", category: "Architecture", proficiency: 90, sortOrder: 1 },
    { name: "Coordinator", category: "Architecture", proficiency: 85, sortOrder: 2 },
    { name: "Modularization", category: "Architecture", proficiency: 80, sortOrder: 3 },
    { name: "Instruments", category: "Performance & CI/CD", proficiency: 85, sortOrder: 0 },
    { name: "os_signpost", category: "Performance & CI/CD", proficiency: 80, sortOrder: 1 },
    { name: "Xcode Metrics", category: "Performance & CI/CD", proficiency: 75, sortOrder: 2 },
    { name: "Firebase Crashlytics", category: "Performance & CI/CD", proficiency: 80, sortOrder: 3 },
    { name: "Xcode", category: "Tools", proficiency: 95, sortOrder: 0 },
    { name: "MachOView", category: "Tools", proficiency: 75, sortOrder: 1 },
    { name: "Hopper", category: "Tools", proficiency: 70, sortOrder: 2 },
    { name: "Git", category: "Tools", proficiency: 90, sortOrder: 3 },
    { name: "CocoaPods", category: "Tools", proficiency: 85, sortOrder: 4 },
    { name: "Jenkins", category: "Tools", proficiency: 70, sortOrder: 5 },
    { name: "SPM", category: "Tools", proficiency: 80, sortOrder: 6 },
  ];

  for (const skill of skills) {
    await prisma.skill.create({ data: skill });
  }
  console.log(`${skills.length} skills created`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
