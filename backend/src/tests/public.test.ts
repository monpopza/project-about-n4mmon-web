// src/tests/public.test.ts — integration tests for public endpoints
// Uses a real in-memory SQLite database (DATABASE_PATH=:memory:)

import { describe, test, expect, beforeAll } from 'bun:test'
import { Hono } from 'hono'
import { getDb } from '../db/database.js'
import { seedIfEmpty } from '../db/seed.js'
import { publicRoutes } from '../routes/public.js'
import { corsMiddleware } from '../middleware/cors.js'

// ─── Set required env vars before any module-level DB init ────────────────

process.env.DATABASE_PATH = ':memory:'
process.env.AUTHENTIK_JWKS_URL = 'https://auth.nammon.men/application/o/portfolio/.well-known/jwks.json'
process.env.AUTHENTIK_ISSUER = 'https://auth.nammon.men/application/o/portfolio/'
process.env.AUTHENTIK_CLIENT_ID = 'portfolio'

const app = new Hono()
app.use('*', corsMiddleware)
app.route('/api', publicRoutes)

beforeAll(() => {
  const db = getDb()
  seedIfEmpty(db)
})

// ─── GET /api/health ──────────────────────────────────────────────────────

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(body.status).toBe('ok')
    expect(typeof body.uptime).toBe('number')
    expect(typeof body.timestamp).toBe('string')
  })
})

// ─── GET /api/profile ─────────────────────────────────────────────────────

describe('GET /api/profile', () => {
  test('returns 200 with profile shape', async () => {
    const res = await app.request('/api/profile')
    expect(res.status).toBe(200)
    const body = await res.json() as Record<string, unknown>
    expect(typeof body.name).toBe('string')
    expect(typeof body.title).toBe('string')
    expect(typeof body.bio).toBe('string')
    expect(Array.isArray(body.skills)).toBe(true)
    expect(Array.isArray(body.projects)).toBe(true)
    expect(Array.isArray(body.experience)).toBe(true)
    expect(Array.isArray(body.socialLinks)).toBe(true)
  })

  test('profile has seeded name from profile data', async () => {
    const res = await app.request('/api/profile')
    const body = await res.json() as { name: string }
    expect(body.name).toBe('N4mmon Dev')
  })

  test('skills have category and items arrays', async () => {
    const res = await app.request('/api/profile')
    const body = await res.json() as { skills: Array<{ category: string; items: string[] }> }
    expect(body.skills.length).toBeGreaterThan(0)
    for (const skill of body.skills) {
      expect(typeof skill.category).toBe('string')
      expect(Array.isArray(skill.items)).toBe(true)
    }
  })

  test('projects have required fields', async () => {
    const res = await app.request('/api/profile')
    const body = await res.json() as { projects: Array<Record<string, unknown>> }
    for (const p of body.projects) {
      expect(typeof p.id).toBe('number')
      expect(typeof p.title).toBe('string')
      expect(Array.isArray(p.tech)).toBe(true)
      expect(typeof p.featured).toBe('boolean')
    }
  })
})

// ─── GET /api/posts ────────────────────────────────────────────────────────

describe('GET /api/posts', () => {
  test('returns 200 with empty array when no posts', async () => {
    const res = await app.request('/api/posts')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })
})

// ─── GET /api/posts/:slug ──────────────────────────────────────────────────

describe('GET /api/posts/:slug', () => {
  test('returns 404 for non-existent slug', async () => {
    const res = await app.request('/api/posts/non-existent-slug')
    expect(res.status).toBe(404)
    const body = await res.json() as Record<string, unknown>
    expect(body.code).toBe('NOT_FOUND')
  })
})

// ─── CORS ──────────────────────────────────────────────────────────────────

describe('CORS', () => {
  test('OPTIONS preflight returns 204', async () => {
    const res = await app.request('/api/profile', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://nammon.men',
        'Access-Control-Request-Method': 'GET',
      },
    })
    // Hono CORS returns 204 for OPTIONS
    expect([200, 204]).toContain(res.status)
  })
})
