export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage?: string;
  youtubeUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  email: string;
  location: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  sortOrder: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  sortOrder: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  sortOrder: number;
}
