import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().optional().default(""),
  email: z.string().email().optional().default(""),
  location: z.string().optional().default(""),
  avatarUrl: z.string().optional().nullable(),
  resumeUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal("")),
  githubUrl: z.string().url().optional().nullable().or(z.literal("")),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  description: z.string().optional().default(""),
  logoUrl: z.string().optional().nullable(),
  companyUrl: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string().optional().default(""),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  current: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional().default(""),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().default(""),
  proficiency: z.number().int().min(0).max(100).optional().default(0),
  sortOrder: z.number().int().optional().default(0),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
