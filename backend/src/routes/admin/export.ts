// src/routes/admin/export.ts — full JSON export of all database content
//
//   GET /api/admin/export — returns complete database snapshot as JSON backup

import { Hono } from 'hono'
import { getDb } from '../../db/database.js'
import type {
  ProfileMeta,
  SkillCategory,
  SkillItem,
  ProjectRecord,
  ExperienceRecord,
  SocialLinkRecord,
  PostRecord,
  MediaRecord,
  AppVariables,
} from '../../types/index.js'

export const adminExportRoutes = new Hono<{ Variables: AppVariables }>()

adminExportRoutes.get('/', (c) => {
  const db = getDb()

  const profile = db.query<ProfileMeta, []>('SELECT * FROM profile_meta WHERE id = 1').get()

  const skillCategories = db.query<SkillCategory, []>(
    'SELECT * FROM skill_categories ORDER BY sort_order ASC',
  ).all()

  const skillItems = db.query<SkillItem, []>(
    'SELECT * FROM skill_items ORDER BY category_id ASC, sort_order ASC',
  ).all()

  const projects = db.query<ProjectRecord, []>(
    'SELECT * FROM projects ORDER BY sort_order ASC',
  ).all().map((p) => ({
    ...p,
    tech: safeParseJson<string[]>(p.tech, []),
    featured: p.featured === 1,
    published: p.published === 1,
  }))

  const experience = db.query<ExperienceRecord, []>(
    'SELECT * FROM experience ORDER BY sort_order ASC',
  ).all()

  const socialLinks = db.query<SocialLinkRecord, []>(
    'SELECT * FROM social_links ORDER BY sort_order ASC',
  ).all()

  const posts = db.query<PostRecord, []>(
    'SELECT * FROM posts ORDER BY created_at DESC',
  ).all().map((p) => ({
    ...p,
    published: p.published === 1,
  }))

  const media = db.query<MediaRecord, []>(
    'SELECT * FROM media ORDER BY uploaded_at DESC',
  ).all()

  const exportData = {
    exported_at: new Date().toISOString(),
    version: '1.0.0',
    profile,
    skills: skillCategories.map((cat) => ({
      ...cat,
      items: skillItems.filter((i) => i.category_id === cat.id),
    })),
    projects,
    experience,
    social_links: socialLinks,
    posts,
    media,
  }

  // Set filename header for browser download
  c.header('Content-Disposition', `attachment; filename="portfolio-export-${Date.now()}.json"`)
  return c.json(exportData)
})

// ─── Helpers ──────────────────────────────────────────────────────────────

function safeParseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T } catch { return fallback }
}
