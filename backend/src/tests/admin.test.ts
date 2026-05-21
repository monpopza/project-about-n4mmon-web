// src/tests/admin.test.ts — integration tests for admin endpoints
// Auth middleware is bypassed by using ADMIN_TOKEN static fallback.

import { describe, test, expect, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { getDb } from '../db/database.js'
import { seedIfEmpty } from '../db/seed.js'
import { corsMiddleware } from '../middleware/cors.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminProfileRoutes } from '../routes/admin/profile.js'
import { adminSkillsRoutes } from '../routes/admin/skills.js'
import { adminProjectsRoutes } from '../routes/admin/projects.js'
import { adminExperienceRoutes } from '../routes/admin/experience.js'
import { adminSocialRoutes } from '../routes/admin/social.js'
import { adminPostsRoutes } from '../routes/admin/posts.js'
import { adminExportRoutes } from '../routes/admin/export.js'
import type { AppVariables } from '../types/index.js'

// ─── Set env vars before module init ─────────────────────────────────────

process.env.DATABASE_PATH = ':memory:'
process.env.AUTHENTIK_JWKS_URL = 'https://auth.nammon.men/application/o/portfolio/.well-known/jwks.json'
process.env.AUTHENTIK_ISSUER = 'https://auth.nammon.men/application/o/portfolio/'
process.env.AUTHENTIK_CLIENT_ID = 'portfolio'
process.env.ADMIN_TOKEN = 'test-admin-token-abc'
process.env.ADMIN_EMAIL = 'admin@nammon.men'

const BEARER = `Bearer ${process.env.ADMIN_TOKEN}`

// Build the test app
const app = new Hono<{ Variables: AppVariables }>()
app.use('*', corsMiddleware)

const admin = new Hono<{ Variables: AppVariables }>()
admin.use('*', authMiddleware)
admin.route('/profile', adminProfileRoutes)
admin.route('/skills', adminSkillsRoutes)
admin.route('/projects', adminProjectsRoutes)
admin.route('/experience', adminExperienceRoutes)
admin.route('/social-links', adminSocialRoutes)
admin.route('/posts', adminPostsRoutes)
admin.route('/export', adminExportRoutes)

app.route('/api/admin', admin)

beforeAll(() => {
  const db = getDb()
  seedIfEmpty(db)
})

// ─── Auth guard ───────────────────────────────────────────────────────────

describe('Auth guard', () => {
  test('returns 401 without token', async () => {
    const res = await app.request('/api/admin/profile')
    expect(res.status).toBe(401)
  })

  test('returns 401 with wrong token', async () => {
    const res = await app.request('/api/admin/profile', {
      headers: { Authorization: 'Bearer wrong-token' },
    })
    expect(res.status).toBe(401)
  })

  test('returns 200 with valid ADMIN_TOKEN', async () => {
    const res = await app.request('/api/admin/profile', {
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
  })
})

// ─── Profile ─────────────────────────────────────────────────────────────

describe('GET /api/admin/profile', () => {
  test('returns seeded profile data', async () => {
    const res = await app.request('/api/admin/profile', {
      headers: { Authorization: BEARER },
    })
    const body = await res.json() as Record<string, unknown>
    expect(body.name).toBe('N4mmon Dev')
    expect(typeof body.email).toBe('string')
    expect(typeof body.id).toBe('number')
  })
})

describe('PUT /api/admin/profile', () => {
  test('updates profile name', async () => {
    const res = await app.request('/api/admin/profile', {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Name' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body.name).toBe('Updated Name')
  })

  test('returns 400 for empty body', async () => {
    const res = await app.request('/api/admin/profile', {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
  })

  test('returns 400 for non-string field', async () => {
    const res = await app.request('/api/admin/profile', {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 123 }),
    })
    expect(res.status).toBe(400)
  })
})

// ─── Skills ───────────────────────────────────────────────────────────────

describe('Skills CRUD', () => {
  let catId: number
  let itemId: number

  test('GET /api/admin/skills returns seeded categories', async () => {
    const res = await app.request('/api/admin/skills', {
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as Array<{ id: number; category: string; items: unknown[] }>
    expect(body.length).toBeGreaterThan(0)
    expect(typeof body[0].id).toBe('number')
    expect(Array.isArray(body[0].items)).toBe(true)
  })

  test('POST /api/admin/skills creates new category', async () => {
    const res = await app.request('/api/admin/skills', {
      method: 'POST',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Test Category', sort_order: 99 }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { id: number; category: string }
    catId = body.id
    expect(body.category).toBe('Test Category')
  })

  test('POST /api/admin/skills/:id/items adds item', async () => {
    const res = await app.request(`/api/admin/skills/${catId}/items`, {
      method: 'POST',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Test Skill' }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { id: number; label: string }
    itemId = body.id
    expect(body.label).toBe('Test Skill')
  })

  test('PUT /api/admin/skills/:id/items/:itemId updates item', async () => {
    const res = await app.request(`/api/admin/skills/${catId}/items/${itemId}`, {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Updated Skill' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { label: string }
    expect(body.label).toBe('Updated Skill')
  })

  test('DELETE /api/admin/skills/:id/items/:itemId deletes item', async () => {
    const res = await app.request(`/api/admin/skills/${catId}/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
  })

  test('DELETE /api/admin/skills/:id cascades items', async () => {
    const res = await app.request(`/api/admin/skills/${catId}`, {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
  })

  test('GET 404 for non-existent category delete', async () => {
    const res = await app.request('/api/admin/skills/99999', {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(404)
  })
})

// ─── Projects ─────────────────────────────────────────────────────────────

describe('Projects CRUD', () => {
  let projectId: number

  test('GET /api/admin/projects returns all projects', async () => {
    const res = await app.request('/api/admin/projects', {
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as Array<{ id: number }>
    expect(body.length).toBeGreaterThan(0)
  })

  test('POST /api/admin/projects creates project', async () => {
    const res = await app.request('/api/admin/projects', {
      method: 'POST',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Project',
        description: 'A test project',
        tech: ['Bun', 'TypeScript'],
        github: 'https://github.com/test',
        live: '',
        featured: true,
        published: true,
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { id: number; tech: string[]; featured: boolean }
    projectId = body.id
    expect(Array.isArray(body.tech)).toBe(true)
    expect(body.featured).toBe(true)
  })

  test('PUT /api/admin/projects/:id updates project', async () => {
    const res = await app.request(`/api/admin/projects/${projectId}`, {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Renamed Project', published: false }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { title: string; published: boolean }
    expect(body.title).toBe('Renamed Project')
    expect(body.published).toBe(false)
  })

  test('DELETE /api/admin/projects/:id deletes project', async () => {
    const res = await app.request(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
  })
})

// ─── Experience ───────────────────────────────────────────────────────────

describe('Experience CRUD', () => {
  let expId: number

  test('GET /api/admin/experience returns all entries', async () => {
    const res = await app.request('/api/admin/experience', {
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as unknown[]
    expect(body.length).toBeGreaterThan(0)
  })

  test('POST /api/admin/experience creates entry', async () => {
    const res = await app.request('/api/admin/experience', {
      method: 'POST',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company: 'Test Corp',
        role: 'Developer',
        period: '2024',
        description: 'Did stuff',
        type: 'work',
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { id: number; type: string }
    expId = body.id
    expect(body.type).toBe('work')
  })

  test('PUT /api/admin/experience/:id updates entry', async () => {
    const res = await app.request(`/api/admin/experience/${expId}`, {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'education' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { type: string }
    expect(body.type).toBe('education')
  })

  test('DELETE /api/admin/experience/:id deletes entry', async () => {
    const res = await app.request(`/api/admin/experience/${expId}`, {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
  })
})

// ─── Social Links ─────────────────────────────────────────────────────────

describe('Social Links CRUD', () => {
  let linkId: number

  test('GET /api/admin/social-links returns all links', async () => {
    const res = await app.request('/api/admin/social-links', {
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as unknown[]
    expect(body.length).toBeGreaterThan(0)
  })

  test('POST /api/admin/social-links creates link', async () => {
    const res = await app.request('/api/admin/social-links', {
      method: 'POST',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Test', url: 'https://test.com', icon: 'test', desc: 'A test link' }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { id: number }
    linkId = body.id
  })

  test('PUT /api/admin/social-links/:id updates link', async () => {
    const res = await app.request(`/api/admin/social-links/${linkId}`, {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Updated Test' }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { label: string }
    expect(body.label).toBe('Updated Test')
  })

  test('DELETE /api/admin/social-links/:id deletes link', async () => {
    const res = await app.request(`/api/admin/social-links/${linkId}`, {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
  })
})

// ─── Posts ────────────────────────────────────────────────────────────────

describe('Posts CRUD', () => {
  let postId: number

  test('GET /api/admin/posts returns all posts', async () => {
    const res = await app.request('/api/admin/posts', {
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })

  test('POST /api/admin/posts creates post and auto-generates slug', async () => {
    const res = await app.request('/api/admin/posts', {
      method: 'POST',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Hello World Post',
        excerpt: 'A short excerpt',
        body: 'Full post body content here.',
        published: false,
      }),
    })
    expect(res.status).toBe(201)
    const body = await res.json() as { id: number; slug: string; published: number }
    postId = body.id
    expect(body.slug).toContain('hello-world-post')
    expect(body.published).toBe(0)
  })

  test('PUT /api/admin/posts/:id can publish post', async () => {
    const res = await app.request(`/api/admin/posts/${postId}`, {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: true }),
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { published: number; published_at: string }
    expect(body.published).toBe(1)
    expect(typeof body.published_at).toBe('string')
  })

  test('PUT /api/admin/posts/:id rejects duplicate slug', async () => {
    // Create a second post
    const res1 = await app.request('/api/admin/posts', {
      method: 'POST',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Another Post', slug: 'another-post' }),
    })
    const b1 = await res1.json() as { id: number }

    // Try to rename first post to same slug
    const res2 = await app.request(`/api/admin/posts/${postId}`, {
      method: 'PUT',
      headers: { Authorization: BEARER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'another-post' }),
    })
    expect(res2.status).toBe(400)

    // Cleanup
    await app.request(`/api/admin/posts/${b1.id}`, {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
  })

  test('DELETE /api/admin/posts/:id deletes post', async () => {
    const res = await app.request(`/api/admin/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
  })
})

// ─── Export ───────────────────────────────────────────────────────────────

describe('GET /api/admin/export', () => {
  test('returns JSON with all required top-level keys', async () => {
    const res = await app.request('/api/admin/export', {
      headers: { Authorization: BEARER },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(typeof body.exported_at).toBe('string')
    expect(typeof body.version).toBe('string')
    expect(typeof body.profile).toBe('object')
    expect(Array.isArray(body.skills)).toBe(true)
    expect(Array.isArray(body.projects)).toBe(true)
    expect(Array.isArray(body.experience)).toBe(true)
    expect(Array.isArray(body.social_links)).toBe(true)
    expect(Array.isArray(body.posts)).toBe(true)
    expect(Array.isArray(body.media)).toBe(true)
  })

  test('Content-Disposition header is set', async () => {
    const res = await app.request('/api/admin/export', {
      headers: { Authorization: BEARER },
    })
    const cd = res.headers.get('Content-Disposition')
    expect(cd).toContain('attachment')
    expect(cd).toContain('portfolio-export-')
  })
})
