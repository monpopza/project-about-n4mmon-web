// src/routes/admin/skills.ts — admin skill category + item CRUD
//
//   GET    /api/admin/skills                        — all categories with items
//   POST   /api/admin/skills                        — create category
//   PUT    /api/admin/skills/:id                    — update category
//   DELETE /api/admin/skills/:id                    — delete category (cascades items)
//   POST   /api/admin/skills/:id/items              — add item to category
//   PUT    /api/admin/skills/:id/items/:itemId      — update item
//   DELETE /api/admin/skills/:id/items/:itemId      — delete item

import { Hono } from 'hono'
import { getDb } from '../../db/database.js'
import type { SkillCategory, SkillItem, SkillCategoryWithItems, AppVariables } from '../../types/index.js'

export const adminSkillsRoutes = new Hono<{ Variables: AppVariables }>()

// ─── GET /api/admin/skills ────────────────────────────────────────────────

adminSkillsRoutes.get('/', (c) => {
  const db = getDb()

  const categories = db.query<SkillCategory, []>(
    'SELECT id, category, sort_order FROM skill_categories ORDER BY sort_order ASC',
  ).all()

  const items = db.query<SkillItem, []>(
    'SELECT id, category_id, label, sort_order FROM skill_items ORDER BY sort_order ASC',
  ).all()

  const itemsMap = new Map<number, SkillItem[]>()
  for (const item of items) {
    const list = itemsMap.get(item.category_id) ?? []
    list.push(item)
    itemsMap.set(item.category_id, list)
  }

  const result: SkillCategoryWithItems[] = categories.map((cat) => ({
    ...cat,
    items: itemsMap.get(cat.id) ?? [],
  }))

  return c.json(result)
})

// ─── POST /api/admin/skills ───────────────────────────────────────────────

adminSkillsRoutes.post('/', async (c) => {
  const db = getDb()
  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const category = requireString(data, 'category')
  if (!category) return c.json({ error: 'Field "category" is required', code: 'MISSING_FIELD', field: 'category' }, 400)

  const sortOrder = typeof data.sort_order === 'number' ? data.sort_order : 0

  const result = db.prepare(
    'INSERT INTO skill_categories (category, sort_order) VALUES (?, ?)',
  ).run(category, sortOrder)

  const row = db.query<SkillCategory, [number]>(
    'SELECT id, category, sort_order FROM skill_categories WHERE id = ?',
  ).get(Number(result.lastInsertRowid))

  return c.json({ ...(row ?? {}), items: [] }, 201)
})

// ─── PUT /api/admin/skills/:id ────────────────────────────────────────────

adminSkillsRoutes.put('/:id', async (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<SkillCategory, [number]>(
    'SELECT id FROM skill_categories WHERE id = ?',
  ).get(id)
  if (!existing) return c.json({ error: 'Skill category not found', code: 'NOT_FOUND' }, 404)

  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const updates: Record<string, string | number> = {}
  if (typeof data.category === 'string') updates.category = data.category
  if (typeof data.sort_order === 'number') updates.sort_order = data.sort_order

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided', code: 'NO_FIELDS' }, 400)
  }

  const setClauses = Object.keys(updates).map((f) => `${f} = ?`).join(', ')
  db.prepare(`UPDATE skill_categories SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), id)

  const row = db.query<SkillCategory, [number]>(
    'SELECT id, category, sort_order FROM skill_categories WHERE id = ?',
  ).get(id)

  return c.json(row)
})

// ─── DELETE /api/admin/skills/:id ────────────────────────────────────────

adminSkillsRoutes.delete('/:id', (c) => {
  const db = getDb()
  const id = parseId(c.req.param('id'))
  if (!id) return c.json({ error: 'Invalid id', code: 'INVALID_ID' }, 400)

  const existing = db.query<SkillCategory, [number]>(
    'SELECT id FROM skill_categories WHERE id = ?',
  ).get(id)
  if (!existing) return c.json({ error: 'Skill category not found', code: 'NOT_FOUND' }, 404)

  // Foreign key cascade deletes items
  db.prepare('DELETE FROM skill_categories WHERE id = ?').run(id)
  return c.json({ deleted: true, id })
})

// ─── POST /api/admin/skills/:id/items ─────────────────────────────────────

adminSkillsRoutes.post('/:id/items', async (c) => {
  const db = getDb()
  const catId = parseId(c.req.param('id'))
  if (!catId) return c.json({ error: 'Invalid category id', code: 'INVALID_ID' }, 400)

  const catExists = db.query<{ id: number }, [number]>(
    'SELECT id FROM skill_categories WHERE id = ?',
  ).get(catId)
  if (!catExists) return c.json({ error: 'Skill category not found', code: 'NOT_FOUND' }, 404)

  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const label = requireString(data, 'label')
  if (!label) return c.json({ error: 'Field "label" is required', code: 'MISSING_FIELD', field: 'label' }, 400)

  const sortOrder = typeof data.sort_order === 'number' ? data.sort_order : 0

  const result = db.prepare(
    'INSERT INTO skill_items (category_id, label, sort_order) VALUES (?, ?, ?)',
  ).run(catId, label, sortOrder)

  const row = db.query<SkillItem, [number]>(
    'SELECT id, category_id, label, sort_order FROM skill_items WHERE id = ?',
  ).get(Number(result.lastInsertRowid))

  return c.json(row, 201)
})

// ─── PUT /api/admin/skills/:id/items/:itemId ──────────────────────────────

adminSkillsRoutes.put('/:id/items/:itemId', async (c) => {
  const db = getDb()
  const itemId = parseId(c.req.param('itemId'))
  if (!itemId) return c.json({ error: 'Invalid item id', code: 'INVALID_ID' }, 400)

  const existing = db.query<SkillItem, [number]>(
    'SELECT id FROM skill_items WHERE id = ?',
  ).get(itemId)
  if (!existing) return c.json({ error: 'Skill item not found', code: 'NOT_FOUND' }, 404)

  const data = await parseBody(c)
  if (!data) return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)

  const updates: Record<string, string | number> = {}
  if (typeof data.label === 'string') updates.label = data.label
  if (typeof data.sort_order === 'number') updates.sort_order = data.sort_order

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No valid fields provided', code: 'NO_FIELDS' }, 400)
  }

  const setClauses = Object.keys(updates).map((f) => `${f} = ?`).join(', ')
  db.prepare(`UPDATE skill_items SET ${setClauses} WHERE id = ?`).run(...Object.values(updates), itemId)

  const row = db.query<SkillItem, [number]>(
    'SELECT id, category_id, label, sort_order FROM skill_items WHERE id = ?',
  ).get(itemId)

  return c.json(row)
})

// ─── DELETE /api/admin/skills/:id/items/:itemId ───────────────────────────

adminSkillsRoutes.delete('/:id/items/:itemId', (c) => {
  const db = getDb()
  const itemId = parseId(c.req.param('itemId'))
  if (!itemId) return c.json({ error: 'Invalid item id', code: 'INVALID_ID' }, 400)

  const existing = db.query<SkillItem, [number]>(
    'SELECT id FROM skill_items WHERE id = ?',
  ).get(itemId)
  if (!existing) return c.json({ error: 'Skill item not found', code: 'NOT_FOUND' }, 404)

  db.prepare('DELETE FROM skill_items WHERE id = ?').run(itemId)
  return c.json({ deleted: true, id: itemId })
})

// ─── Helpers ──────────────────────────────────────────────────────────────

async function parseBody(c: { req: { json: () => Promise<unknown> } }): Promise<Record<string, unknown> | null> {
  try {
    const body = await c.req.json()
    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      return body as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

function requireString(data: Record<string, unknown>, field: string): string | null {
  const val = data[field]
  if (typeof val !== 'string' || val.trim() === '') return null
  return val.trim()
}

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}
