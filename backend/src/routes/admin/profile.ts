// src/routes/admin/profile.ts — admin profile management
//
//   GET /api/admin/profile  — read full profile (including draft fields)
//   PUT /api/admin/profile  — update scalar profile fields

import { Hono } from 'hono'
import { getDb } from '../../db/database.js'
import type { ProfileMeta, AppVariables } from '../../types/index.js'

export const adminProfileRoutes = new Hono<{ Variables: AppVariables }>()

// ─── GET /api/admin/profile ───────────────────────────────────────────────

adminProfileRoutes.get('/', (c) => {
  const db = getDb()
  const meta = db.query<ProfileMeta, []>('SELECT * FROM profile_meta WHERE id = 1').get()

  if (!meta) {
    return c.json({ error: 'Profile not found', code: 'NOT_FOUND' }, 404)
  }

  return c.json(meta)
})

// ─── PUT /api/admin/profile ───────────────────────────────────────────────

adminProfileRoutes.put('/', async (c) => {
  const db = getDb()

  let body: unknown
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return c.json({ error: 'Body must be a JSON object', code: 'INVALID_BODY' }, 400)
  }

  const data = body as Record<string, unknown>

  // Allowed scalar fields — no id or timestamps accepted from client
  const ALLOWED_FIELDS = [
    'name', 'title', 'tagline', 'bio', 'avatar', 'resume', 'email',
    'github', 'linkedin', 'twitter', 'seo_title', 'seo_description',
  ]

  const updates: Record<string, string> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in data) {
      const val = data[field]
      if (typeof val !== 'string') {
        return c.json({ error: `Field '${field}' must be a string`, code: 'INVALID_FIELD', field }, 400)
      }
      updates[field] = val
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided', code: 'NO_FIELDS' }, 400)
  }

  const setClauses = Object.keys(updates).map((f) => `${f} = ?`).join(', ')
  const values = Object.values(updates)

  db.prepare(
    `UPDATE profile_meta SET ${setClauses}, updated_at = datetime('now') WHERE id = 1`,
  ).run(...values)

  const updated = db.query<ProfileMeta, []>('SELECT * FROM profile_meta WHERE id = 1').get()
  return c.json(updated)
})
