// src/routes/admin/projects.ts — admin project CRUD
//
//   GET    /api/admin/projects      — all projects (including unpublished)
//   POST   /api/admin/projects      — create project
//   PUT    /api/admin/projects/:id  — update project
//   DELETE /api/admin/projects/:id  — delete project

import { Hono } from 'hono'
import { getDb } from '../../db/database.js'
import type { ProjectRecord, AppVariables } from '../../types/index.js'

export const adminProjectsRoutes = new Hono<{ Variables: AppVariables }>()

// ─── GET /api/admin/projects ──────────────────────────────────────────────

adminProjectsRoutes.get('/', (c) => {
  const db = getDb()
  const rows = db.query<ProjectRecord, []>(
    'SELECT * FROM projects ORDER BY sort_order ASC',
  ).all()

  return c.json(rows.map(deserializeProject))
})

// ─── POST /api/admin/projects ─────────────────────────────────────────────

adminProjectsRoutes.post('/', async (c) => {
  const db = getDb()
  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const title = requireString(data, 'title')
  if (!title) return c.json({ error: 'Field "title" is required', code: 'MISSING_FIELD', field: 'title' }, 400)

  const techRaw = data.tech
  const tech: string[] = Array.isArray(techRaw)
    ? techRaw.filter((t): t is string => typeof t === 'string')
    : []

  const result = db.prepare(`
    INSERT INTO projects (title, description, tech, github, live, featured, published, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    typeof data.description === 'string' ? data.description : '',
    JSON.stringify(tech),
    typeof data.github === 'string' ? data.github : '',
    typeof data.live === 'string' ? data.live : '',
    data.featured ? 1 : 0,
    data.published !== false ? 1 : 0,
    typeof data.sort_order === 'number' ? data.sort_order : 0,
  )

  const row = db.query<ProjectRecord, [number]>('SELECT * FROM projects WHERE id = ?')
    .get(Number(result.lastInsertRowid))

  return c.json(deserializeProject(row!), 201)
})

// ─── PUT /api/admin/projects/:id ──────────────────────────────────────────

adminProjectsRoutes.put('/:id', async (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<ProjectRecord, [number]>('SELECT id FROM projects WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Project not found', code: 'NOT_FOUND' }, 404)

  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const updates: Record<string, string | number> = {}
  if (typeof data.title === 'string') updates.title = data.title
  if (typeof data.description === 'string') updates.description = data.description
  if (Array.isArray(data.tech)) updates.tech = JSON.stringify((data.tech as unknown[]).filter((t): t is string => typeof t === 'string'))
  if (typeof data.github === 'string') updates.github = data.github
  if (typeof data.live === 'string') updates.live = data.live
  if (typeof data.featured === 'boolean') updates.featured = data.featured ? 1 : 0
  if (typeof data.published === 'boolean') updates.published = data.published ? 1 : 0
  if (typeof data.sort_order === 'number') updates.sort_order = data.sort_order

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided', code: 'NO_FIELDS' }, 400)
  }

  const setClauses = Object.keys(updates).map((f) => `${f} = ?`).join(', ')
  db.prepare(`UPDATE projects SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`)
    .run(...Object.values(updates), id)

  const row = db.query<ProjectRecord, [number]>('SELECT * FROM projects WHERE id = ?').get(id)
  return c.json(deserializeProject(row!))
})

// ─── DELETE /api/admin/projects/:id ──────────────────────────────────────

adminProjectsRoutes.delete('/:id', (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<ProjectRecord, [number]>('SELECT id FROM projects WHERE id = ?').get(id)
  if (!existing) return c.json({ error: 'Project not found', code: 'NOT_FOUND' }, 404)

  db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  return c.json({ deleted: true, id })
})

// ─── Helpers ──────────────────────────────────────────────────────────────

function deserializeProject(p: ProjectRecord) {
  return {
    ...p,
    tech: safeParseJson<string[]>(p.tech, []),
    featured: p.featured === 1,
    published: p.published === 1,
  }
}

function safeParseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T } catch { return fallback }
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
