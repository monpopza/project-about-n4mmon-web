// src/routes/admin/posts.ts — admin blog post CRUD
//
//   GET    /api/admin/posts      — all posts (including unpublished)
//   POST   /api/admin/posts      — create post
//   PUT    /api/admin/posts/:id  — update post
//   DELETE /api/admin/posts/:id  — delete post

import { Hono } from 'hono'
import { getDb } from '../../db/database.js'
import type { PostRecord, AppVariables } from '../../types/index.js'

export const adminPostsRoutes = new Hono<{ Variables: AppVariables }>()

// ─── GET /api/admin/posts ─────────────────────────────────────────────────

adminPostsRoutes.get('/', (c) => {
  const db = getDb()
  const rows = db.query<PostRecord, []>(
    'SELECT * FROM posts ORDER BY created_at DESC',
  ).all()
  return c.json(rows)
})

// ─── POST /api/admin/posts ────────────────────────────────────────────────

adminPostsRoutes.post('/', async (c) => {
  const db = getDb()
  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const title = requireString(data, 'title')
  if (!title) return c.json({ error: 'Field "title" is required', code: 'MISSING_FIELD', field: 'title' }, 400)

  // Auto-generate slug from title if not provided
  let slug = typeof data.slug === 'string' && data.slug.trim() !== ''
    ? data.slug.trim()
    : slugify(title)

  // Ensure slug uniqueness
  const existing = db.query<{ id: number }, [string]>('SELECT id FROM posts WHERE slug = ?').get(slug)
  if (existing) {
    slug = `${slug}-${Date.now()}`
  }

  const published = data.published === true ? 1 : 0
  const publishedAt = published ? new Date().toISOString() : null

  const result = db.prepare(`
    INSERT INTO posts (title, slug, excerpt, body, published, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    title,
    slug,
    typeof data.excerpt === 'string' ? data.excerpt : '',
    typeof data.body === 'string' ? data.body : '',
    published,
    publishedAt,
  )

  const row = db.query<PostRecord, [number]>('SELECT * FROM posts WHERE id = ?')
    .get(Number(result.lastInsertRowid))

  return c.json(row, 201)
})

// ─── PUT /api/admin/posts/:id ─────────────────────────────────────────────

adminPostsRoutes.put('/:id', async (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<PostRecord, [number]>('SELECT * FROM posts WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Post not found', code: 'NOT_FOUND' }, 404)

  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const updates: Record<string, string | number | null> = {}
  if (typeof data.title === 'string') updates.title = data.title
  if (typeof data.slug === 'string' && data.slug.trim() !== '') {
    // Check slug uniqueness (exclude current post)
    const slugConflict = db.query<{ id: number }, [string, number]>(
      'SELECT id FROM posts WHERE slug = ? AND id != ?',
    ).get(data.slug.trim(), id)
    if (slugConflict) {
      return c.json({ error: 'Slug already in use', code: 'SLUG_CONFLICT', field: 'slug' }, 400)
    }
    updates.slug = data.slug.trim()
  }
  if (typeof data.excerpt === 'string') updates.excerpt = data.excerpt
  if (typeof data.body === 'string') updates.body = data.body

  // Handle publish state transition
  if (typeof data.published === 'boolean') {
    updates.published = data.published ? 1 : 0
    if (data.published && existing.published === 0) {
      // Transitioning from draft → published: set published_at
      updates.published_at = new Date().toISOString()
    } else if (!data.published) {
      updates.published_at = null
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided', code: 'NO_FIELDS' }, 400)
  }

  const setClauses = Object.keys(updates).map((f) => `${f} = ?`).join(', ')
  db.prepare(`UPDATE posts SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`)
    .run(...Object.values(updates), id)

  const row = db.query<PostRecord, [number]>('SELECT * FROM posts WHERE id = ?').get(id)
  return c.json(row)
})

// ─── DELETE /api/admin/posts/:id ──────────────────────────────────────────

adminPostsRoutes.delete('/:id', (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<PostRecord, [number]>('SELECT id FROM posts WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Post not found', code: 'NOT_FOUND' }, 404)

  db.prepare('DELETE FROM posts WHERE id = ?').run(id)
  return c.json({ deleted: true, id })
})

// ─── Helpers ──────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

async function parseBody(c: { req: { json: () => Promise<unknown> } }): Promise<Record<string, unknown> | null> {
  try {
    const body = await c.req.json()
    return typeof body === 'object' && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null
  } catch { return null }
}

function requireString(data: Record<string, unknown>, field: string): string | null {
  const val = data[field]
  return typeof val === 'string' && val.trim() !== '' ? val.trim() : null
}

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}
