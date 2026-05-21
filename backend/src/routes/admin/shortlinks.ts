// src/routes/admin/shortlinks.ts
//
// Proxy routes that forward shortlink management requests from the portfolio
// admin panel to the shortlink backend (Bun + Hono, Docker, port 3000).
//
// Auth contract:
//   - Inbound:  portfolio authMiddleware (Authentik JWT) — enforced by the
//               parent admin router in index.ts before reaching these routes.
//   - Outbound: ADMIN_TOKEN bearer token used as service-to-service credential
//               recognised by the shortlink backend's ADMIN_TOKEN fallback path
//               in its authentik-auth middleware.
//
// Route map:
//   GET    /api/admin/shortlinks              → GET  /api/stats      (list all links + stats)
//   POST   /api/admin/shortlinks              → POST /shorten        (create a short link)
//   DELETE /api/admin/shortlinks/:code        → DELETE /api/link/:code
//   GET    /api/admin/shortlinks/activity     → GET  /api/activity   (recent click activity)

import { Hono } from 'hono'
import type { Context } from 'hono'
import type { AppVariables } from '../../types/index.js'

const SHORTLINK_URL = process.env.SHORTLINK_BACKEND_URL ?? 'http://127.0.0.1:3000'
const SHORTLINK_TOKEN = process.env.SHORTLINK_ADMIN_TOKEN ?? ''

// ─── Proxy helper ────────────────────────────────────────────────────────────

async function proxyTo(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${SHORTLINK_URL}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${SHORTLINK_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

type AdminContext = Context<{ Variables: AppVariables }>

// Returns a 503 response when SHORTLINK_ADMIN_TOKEN is not configured.
function notConfigured(c: AdminContext): Response {
  return c.json(
    { error: 'Shortlink backend not configured', code: 'SHORTLINK_NOT_CONFIGURED' },
    503,
  )
}

// Converts an upstream error or non-ok response into a 502 Gateway Error.
function upstreamError(c: AdminContext): Response {
  return c.json(
    { error: 'Shortlink backend error', code: 'UPSTREAM_ERROR' },
    502,
  )
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const adminShortlinksRoutes = new Hono<{ Variables: AppVariables }>()

// GET /api/admin/shortlinks — list all links with click stats
adminShortlinksRoutes.get('/', async (c) => {
  if (!SHORTLINK_TOKEN) return notConfigured(c)
  try {
    const upstream = await proxyTo('/api/stats')
    if (!upstream.ok) return upstreamError(c)
    const data: unknown = await upstream.json()
    return c.json(data, upstream.status as 200)
  } catch {
    return upstreamError(c)
  }
})

// GET /api/admin/shortlinks/activity — recent click activity
// Registered BEFORE /:code so the literal segment "activity" wins over the param.
adminShortlinksRoutes.get('/activity', async (c) => {
  if (!SHORTLINK_TOKEN) return notConfigured(c)
  try {
    const upstream = await proxyTo('/api/activity')
    if (!upstream.ok) return upstreamError(c)
    const data: unknown = await upstream.json()
    return c.json(data, upstream.status as 200)
  } catch {
    return upstreamError(c)
  }
})

// POST /api/admin/shortlinks — create a short link
// Body forwarded as-is: { url, code?, note? }
adminShortlinksRoutes.post('/', async (c) => {
  if (!SHORTLINK_TOKEN) return notConfigured(c)
  try {
    const body = await c.req.text()
    const upstream = await proxyTo('/shorten', {
      method: 'POST',
      body,
    })
    if (!upstream.ok) return upstreamError(c)
    const data: unknown = await upstream.json()
    return c.json(data, upstream.status as 200 | 201)
  } catch {
    return upstreamError(c)
  }
})

// DELETE /api/admin/shortlinks/:code — delete a short link by code
adminShortlinksRoutes.delete('/:code', async (c) => {
  if (!SHORTLINK_TOKEN) return notConfigured(c)
  const code = c.req.param('code')
  try {
    const upstream = await proxyTo(`/api/link/${encodeURIComponent(code)}`, {
      method: 'DELETE',
    })
    if (!upstream.ok) return upstreamError(c)
    // DELETE may return 204 No Content — handle both JSON and empty body
    const text = await upstream.text()
    if (!text) return c.body(null, 204)
    return c.json(JSON.parse(text) as unknown, upstream.status as 200)
  } catch {
    return upstreamError(c)
  }
})
