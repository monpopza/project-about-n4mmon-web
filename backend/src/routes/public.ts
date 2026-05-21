// src/routes/public.ts — public (no auth) endpoints
//
//   GET /api/health      — liveness probe
//   GET /api/profile     — full public profile
//   GET /api/posts       — published posts
//   GET /api/posts/:slug — single published post

import { Hono } from 'hono'
import { getDb } from '../db/database.js'
import type {
  ProfileMeta,
  SkillCategory,
  SkillItem,
  ProjectRecord,
  ExperienceRecord,
  SocialLinkRecord,
  PostRecord,
  PublicProfile,
} from '../types/index.js'

const START_TIME = Date.now()

export const publicRoutes = new Hono()

// ─── GET /api/health ──────────────────────────────────────────────────────

publicRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'portfolio-backend',
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
  })
})

// ─── GET /api/profile ────────────────────────────────────────────────────

publicRoutes.get('/profile', (c) => {
  const db = getDb()

  const meta = db.query<ProfileMeta, []>(
    'SELECT * FROM profile_meta WHERE id = 1',
  ).get()

  if (!meta) {
    return c.json({ error: 'Profile not found', code: 'NOT_FOUND' }, 404)
  }

  const categories = db.query<SkillCategory, []>(
    'SELECT id, category, sort_order FROM skill_categories ORDER BY sort_order ASC',
  ).all()

  const items = db.query<SkillItem, []>(
    'SELECT id, category_id, label, sort_order FROM skill_items ORDER BY sort_order ASC',
  ).all()

  const itemsByCategory = new Map<number, SkillItem[]>()
  for (const item of items) {
    const list = itemsByCategory.get(item.category_id) ?? []
    list.push(item)
    itemsByCategory.set(item.category_id, list)
  }

  const skills = categories.map((cat) => ({
    category: cat.category,
    items: (itemsByCategory.get(cat.id) ?? []).map((i) => i.label),
  }))

  const projectRows = db.query<ProjectRecord, []>(
    'SELECT * FROM projects WHERE published = 1 ORDER BY sort_order ASC',
  ).all()

  const projects = projectRows.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    tech: safeParseJson<string[]>(p.tech, []),
    github: p.github,
    live: p.live,
    featured: p.featured === 1,
  }))

  const experienceRows = db.query<ExperienceRecord, []>(
    'SELECT * FROM experience ORDER BY sort_order ASC',
  ).all()

  const experience = experienceRows.map((e) => ({
    id: e.id,
    company: e.company,
    role: e.role,
    period: e.period,
    description: e.description,
    type: e.type,
  }))

  const socialRows = db.query<SocialLinkRecord, []>(
    'SELECT * FROM social_links ORDER BY sort_order ASC',
  ).all()

  const socialLinks = socialRows.map((s) => ({
    id: s.id,
    label: s.label,
    url: s.url,
    icon: s.icon,
    desc: s.desc,
  }))

  const body: PublicProfile = {
    name: meta.name,
    title: meta.title,
    tagline: meta.tagline,
    bio: meta.bio,
    avatar: meta.avatar,
    resume: meta.resume,
    email: meta.email,
    social: {
      github: meta.github,
      linkedin: meta.linkedin,
      twitter: meta.twitter,
    },
    seo: {
      title: meta.seo_title,
      description: meta.seo_description,
    },
    skills,
    projects,
    experience,
    socialLinks,
  }

  return c.json(body)
})

// ─── GET /api/posts ───────────────────────────────────────────────────────

publicRoutes.get('/posts', (c) => {
  const db = getDb()
  const posts = db.query<PostRecord, []>(
    `SELECT id, title, slug, excerpt, published_at, created_at, updated_at
     FROM posts WHERE published = 1 ORDER BY published_at DESC, created_at DESC`,
  ).all()

  return c.json(posts.map(stripBody))
})

// ─── GET /api/posts/:slug ────────────────────────────────────────────────

publicRoutes.get('/posts/:slug', (c) => {
  const db = getDb()
  const slug = c.req.param('slug')

  const post = db.query<PostRecord, [string]>(
    'SELECT * FROM posts WHERE slug = ? AND published = 1',
  ).get(slug)

  if (!post) {
    return c.json({ error: 'Post not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json(post)
})

// ─── Helpers ──────────────────────────────────────────────────────────────

function safeParseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function stripBody(p: PostRecord) {
  const { body: _body, ...rest } = p
  return rest
}
