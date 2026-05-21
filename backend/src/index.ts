// src/index.ts — Hono application entry point
// Registers all routes, applies middleware, starts server on configured port.

import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { getDb } from './db/database.js'
import { seedIfEmpty } from './db/seed.js'
import { corsMiddleware } from './middleware/cors.js'
import { authMiddleware } from './middleware/auth.js'
import { authRoutes } from './routes/auth.js'
import { publicRoutes } from './routes/public.js'
import { adminProfileRoutes } from './routes/admin/profile.js'
import { adminSkillsRoutes } from './routes/admin/skills.js'
import { adminProjectsRoutes } from './routes/admin/projects.js'
import { adminExperienceRoutes } from './routes/admin/experience.js'
import { adminSocialRoutes } from './routes/admin/social.js'
import { adminMediaRoutes } from './routes/admin/media.js'
import { adminPostsRoutes } from './routes/admin/posts.js'
import { adminExportRoutes } from './routes/admin/export.js'
import type { AppVariables } from './types/index.js'

// ─── Startup validation ───────────────────────────────────────────────────
// Fail fast on missing required environment variables before any app wiring.

function validateEnv(): void {
  const required: Record<string, string | undefined> = {
    AUTHENTIK_JWKS_URL: process.env.AUTHENTIK_JWKS_URL,
    AUTHENTIK_ISSUER: process.env.AUTHENTIK_ISSUER,
    AUTHENTIK_CLIENT_ID: process.env.AUTHENTIK_CLIENT_ID,
  }

  const missing = Object.entries(required)
    .filter(([, v]) => !v || v.trim() === '')
    .map(([k]) => k)

  if (missing.length > 0) {
    console.error(
      `[startup] Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in the values.',
    )
    process.exit(1)
  }
}

// Run validation before any module that reads env vars during init.
// (DB + seed do not require AUTHENTIK_* vars, but auth middleware does.)
validateEnv()

// ─── Database + seed ─────────────────────────────────────────────────────

const db = getDb()
seedIfEmpty(db)

// ─── App ──────────────────────────────────────────────────────────────────

const app = new Hono<{ Variables: AppVariables }>()

// Structured request logging (writes to stdout — no secrets logged)
app.use('*', logger())

// CORS must run before auth so preflight OPTIONS requests succeed
app.use('*', corsMiddleware)

// ─── Public routes (no auth) ──────────────────────────────────────────────

app.route('/api/auth', authRoutes)
app.route('/api', publicRoutes)

// ─── Protected admin routes ───────────────────────────────────────────────
// authMiddleware runs on every /api/admin/* path.

const admin = new Hono<{ Variables: AppVariables }>()
admin.use('*', authMiddleware)

admin.route('/profile', adminProfileRoutes)
admin.route('/skills', adminSkillsRoutes)
admin.route('/projects', adminProjectsRoutes)
admin.route('/experience', adminExperienceRoutes)
admin.route('/social-links', adminSocialRoutes)
admin.route('/media', adminMediaRoutes)
admin.route('/posts', adminPostsRoutes)
admin.route('/export', adminExportRoutes)

app.route('/api/admin', admin)

// ─── Global 404 ───────────────────────────────────────────────────────────

app.notFound((c) => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404))

// ─── Global error handler ─────────────────────────────────────────────────

app.onError((err, c) => {
  // Never log request body or auth headers — only message + stack
  console.error('[error]', err.message, err.stack)
  return c.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, 500)
})

// ─── Start ────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT ?? '3001', 10)

export default {
  port: PORT,
  fetch: app.fetch,
}

console.log(`[portfolio-backend] Listening on http://localhost:${PORT}`)
console.log(`[portfolio-backend] API base: http://localhost:${PORT}/api`)
