// src/types/index.ts — shared TypeScript interfaces for profile data

export interface SkillCategory {
  category: string
  items: string[]
}

export interface Project {
  title: string
  description: string
  tech: string[]
  github: string
  live: string
  featured: boolean
}

export interface Experience {
  company: string
  role: string
  period: string
  description: string
  type: 'work' | 'education'
}

export interface SocialLinks {
  github: string
  linkedin: string
  twitter: string
}

// S20-T09 — individual social link entry for the SocialLinksSection component
export interface SocialLink {
  label: string
  url: string
  icon: string   // matches icon key in SocialLinksSection ICONS record
  desc: string
}

export interface Profile {
  name: string
  title: string
  tagline: string
  bio: string
  avatar: string
  resume: string
  email: string
  social: SocialLinks
  skills: SkillCategory[]
  projects: Project[]
  experience: Experience[]
  // S20-T09 — social links for the dedicated SocialLinksSection
  socialLinks: SocialLink[]
}
