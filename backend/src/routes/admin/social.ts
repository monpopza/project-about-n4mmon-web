// src/routes/admin/social.ts — admin social links CRUD
//
//   GET    /api/admin/social-links      — all links
//   POST   /api/admin/social-links      — create link
//   PUT    /api/admin/social-links/:id  — update link
//   DELETE /api/admin/social-links/:id  — delete link

import { Hono } from 'hono'
import { getDb } from '../../db/database.js'
import type { SocialLinkRecord, AppVariables } from '../../types/index.js'

export const adminSocialRoutes = new Hono<{ Variables: AppVariables }>()

// ─── GET /api/admin/social-links ─────────────────────────────────────────

adminSocialRoutes.get('/', (c) => {
  const db = getDb()
  const rows = db.query<SocialLinkRecord, []>(
    'SELECT * FROM social_links ORDER BY sort_order ASC',
  ).all()
  return c.json(rows)
})

// ─── POST /api/admin/social-links ────────────────────────────────────────

adminSocialRoutes.post('/', async (c) => {
  const db = getDb()
  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const label = requireString(data, 'label')
  if (!label) return c.json({ error: 'Field "label" is required', code: 'MISSING_FIELD', field: 'label' }, 400)

  const url = requireString(data, 'url')
  if (!url) return c.json({ error: 'Field "url" is required', code: 'MISSING_FIELD', field: 'url' }, 400)

  const result = db.prepare(`
    INSERT INTO social_links (label, url, icon, desc, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    label,
    url,
    typeof data.icon === 'string' ? data.icon : '',
    typeof data.desc === 'string' ? data.desc : '',
    typeof data.sort_order === 'number' ? data.sort_order : 0,
  )

  const row = db.query<SocialLinkRecord, [number]>('SELECT * FROM social_links WHERE id = ?')
    .get(Number(result.lastInsertRowid))

  return c.json(row, 201)
})

// ─── PUT /api/admin/social-links/:id ────────────────────────────────────

adminSocialRoutes.put('/:id', async (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<SocialLinkRecord, [number]>('SELECT id FROM social_links WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Social link not found', code: 'NOT_FOUND' }, 404)

  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const updates: Record<string, string | number> = {}
  if (typeof data.label === 'string') updates.label = data.label
  if (typeof data.url === 'string') updates.url = data.url
  if (typeof data.icon === 'string') updates.icon = data.icon
  if (typeof data.desc === 'string') updates.desc = data.desc
  if (typeof data.sort_order === 'number') updates.sort_order = data.sort_order

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided', code: 'NO_FIELDS' }, 400)
  }

  const setClauses = Object.keys(updates).map((f) => `${f} = ?`).join(', ')
  db.prepare(`UPDATE social_links SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), id)

  const row = db.query<SocialLinkRecord, [number]>('SELECT * FROM social_links WHERE id = ?').get(id)
  return c.json(row)
})

// ─── DELETE /api/admin/social-links/:id ──────────────────────────────────

adminSocialRoutes.delete('/:id', (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<SocialLinkRecord, [number]>('SELECT id FROM social_links WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Social link not found', code: 'NOT_FOUND' }, 404)

  db.prepare('DELETE FROM social_links WHERE id = ?').run(id)
  return c.json({ deleted: true, id })
})

// ─── Helpers ──────────────────────────────────────────────────────────────

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
