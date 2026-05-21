// src/types/index.ts — shared TypeScript interfaces for portfolio backend

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  sub: string
  email: string
  name: string
  groups: string[]
}

// ─── Hono context variable extension ──────────────────────────────────────

export type AppVariables = {
  user: AuthUser
}

// ─── Profile ───────────────────────────────────────────────────────────────

export interface ProfileMeta {
  id: number
  name: string
  title: string
  tagline: string
  bio: string
  avatar: string
  resume: string
  email: string
  github: string
  linkedin: string
  twitter: string
  seo_title: string
  seo_description: string
  updated_at: string
}

// ─── Skills ────────────────────────────────────────────────────────────────

export interface SkillCategory {
  id: number
  category: string
  sort_order: number
}

export interface SkillItem {
  id: number
  category_id: number
  label: string
  sort_order: number
}

export interface SkillCategoryWithItems extends SkillCategory {
  items: SkillItem[]
}

// ─── Projects ──────────────────────────────────────────────────────────────

export interface ProjectRecord {
  id: number
  title: string
  description: string
  tech: string            // JSON array serialized as string
  github: string
  live: string
  featured: 0 | 1
  published: 0 | 1
  sort_order: number
  created_at: string
  updated_at: string
}

// ─── Experience ────────────────────────────────────────────────────────────

export interface ExperienceRecord {
  id: number
  company: string
  role: string
  period: string
  description: string
  type: 'work' | 'education'
  sort_order: number
  created_at: string
  updated_at: string
}

// ─── Social Links ──────────────────────────────────────────────────────────

export interface SocialLinkRecord {
  id: number
  label: string
  url: string
  icon: string
  desc: string
  sort_order: number
}

// ─── Blog Posts ────────────────────────────────────────────────────────────

export interface PostRecord {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  published: 0 | 1
  published_at: string | null
  created_at: string
  updated_at: string
}

// ─── Media ─────────────────────────────────────────────────────────────────

export interface MediaRecord {
  id: number
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  uploaded_at: string
}

// ─── API response shapes ────────────────────────────────────────────────────

export interface PublicProfile {
  name: string
  title: string
  tagline: string
  bio: string
  avatar: string
  resume: string
  email: string
  social: {
    github: string
    linkedin: string
    twitter: string
  }
  seo: {
    title: string
    description: string
  }
  skills: Array<{
    category: string
    items: string[]
  }>
  projects: Array<{
    id: number
    title: string
    description: string
    tech: string[]
    github: string
    live: string
    featured: boolean
  }>
  experience: Array<{
    id: number
    company: string
    role: string
    period: string
    description: string
    type: 'work' | 'education'
  }>
  socialLinks: Array<{
    id: number
    label: string
    url: string
    icon: string
    desc: string
  }>
}

// ─── Error response ─────────────────────────────────────────────────────────

export interface ErrorResponse {
  error: string
  code: string
  field?: string
}
