// src/routes/admin/experience.ts — admin experience CRUD
//
//   GET    /api/admin/experience      — all entries
//   POST   /api/admin/experience      — create entry
//   PUT    /api/admin/experience/:id  — update entry
//   DELETE /api/admin/experience/:id  — delete entry

import { Hono } from 'hono'
import { getDb } from '../../db/database.js'
import type { ExperienceRecord, AppVariables } from '../../types/index.js'

export const adminExperienceRoutes = new Hono<{ Variables: AppVariables }>()

// ─── GET /api/admin/experience ────────────────────────────────────────────

adminExperienceRoutes.get('/', (c) => {
  const db = getDb()
  const rows = db.query<ExperienceRecord, []>(
    'SELECT * FROM experience ORDER BY sort_order ASC',
  ).all()
  return c.json(rows)
})

// ─── POST /api/admin/experience ───────────────────────────────────────────

adminExperienceRoutes.post('/', async (c) => {
  const db = getDb()
  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const company = requireString(data, 'company')
  if (!company) return c.json({ error: 'Field "company" is required', code: 'MISSING_FIELD', field: 'company' }, 400)

  const role = requireString(data, 'role')
  if (!role) return c.json({ error: 'Field "role" is required', code: 'MISSING_FIELD', field: 'role' }, 400)

  const typeVal = data.type === 'education' ? 'education' : 'work'

  const result = db.prepare(`
    INSERT INTO experience (company, role, period, description, type, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    company,
    role,
    typeof data.period === 'string' ? data.period : '',
    typeof data.description === 'string' ? data.description : '',
    typeVal,
    typeof data.sort_order === 'number' ? data.sort_order : 0,
  )

  const row = db.query<ExperienceRecord, [number]>('SELECT * FROM experience WHERE id = ?')
    .get(Number(result.lastInsertRowid))

  return c.json(row, 201)
})

// ─── PUT /api/admin/experience/:id ───────────────────────────────────────

adminExperienceRoutes.put('/:id', async (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<ExperienceRecord, [number]>('SELECT id FROM experience WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Experience entry not found', code: 'NOT_FOUND' }, 404)

  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const updates: Record<string, string | number> = {}
  if (typeof data.company === 'string') updates.company = data.company
  if (typeof data.role === 'string') updates.role = data.role
  if (typeof data.period === 'string') updates.period = data.period
  if (typeof data.description === 'string') updates.description = data.description
  if (data.type === 'work' || data.type === 'education') updates.type = data.type
  if (typeof data.sort_order === 'number') updates.sort_order = data.sort_order

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided', code: 'NO_FIELDS' }, 400)
  }

  const setClauses = Object.keys(updates).map((f) => `${f} = ?`).join(', ')
  db.prepare(`UPDATE experience SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`)
    .run(...Object.values(updates), id)

  const row = db.query<ExperienceRecord, [number]>('SELECT * FROM experience WHERE id = ?').get(id)
  return c.json(row)
})

// ─── DELETE /api/admin/experience/:id ─────────────────────────────────────

adminExperienceRoutes.delete('/:id', (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<ExperienceRecord, [number]>('SELECT id FROM experience WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Experience entry not found', code: 'NOT_FOUND' }, 404)

  db.prepare('DELETE FROM experience WHERE id = ?').run(id)
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
