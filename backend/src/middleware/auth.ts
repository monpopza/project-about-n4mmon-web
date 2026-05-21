// src/middleware/auth.ts — Authentik JWT validation middleware
//
// Flow:
//   1. Extract Bearer token from Authorization header
//   2. If token === ADMIN_TOKEN (static fallback), inject synthetic admin user
//   3. Otherwise: fetch JWKS from Authentik (cached 5 min), verify RS256 JWT,
//      validate iss + aud + exp, extract { sub, email, name, groups }
//   4. Attach AuthUser to Hono context — downstream handlers use c.get('user')
//   5. Return 401 on any failure

import type { Context, MiddlewareHandler, Next } from 'hono'
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import type { AuthUser, AppVariables } from '../types/index.js'

// Read config lazily (at request time) so tests can set env vars before the
// first request without needing to reset cached module-level constants.
function getConfig() {
  return {
    jwksUrl: process.env.AUTHENTIK_JWKS_URL ??
      'https://auth.nammon.men/application/o/portfolio/.well-known/jwks.json',
    issuer: process.env.AUTHENTIK_ISSUER ?? 'https://auth.nammon.men/application/o/portfolio/',
    audience: process.env.AUTHENTIK_CLIENT_ID ?? 'portfolio',
    adminToken: process.env.ADMIN_TOKEN ?? '',
    adminEmail: process.env.ADMIN_EMAIL ?? '',
  }
}

// JWKS set is memoized per URL — recreated only if the configured URL changes.
// jose's createRemoteJWKSet handles caching and key rotation internally.
let _jwksUrl = ''
let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null

function getJwks(): ReturnType<typeof createRemoteJWKSet> {
  const url = getConfig().jwksUrl
  if (_jwks && url === _jwksUrl) return _jwks
  _jwksUrl = url
  _jwks = createRemoteJWKSet(new URL(url), { cacheMaxAge: 5 * 60 * 1000 })
  return _jwks
}

// Rate limiter: count auth failures per IP — simple in-memory, single instance.
// Only invalid JWT attempts are counted — ADMIN_TOKEN matches succeed without penalty.
// Key: IP address, Value: { count, resetAt }
const _authFailures = new Map<string, { count: number; resetAt: number }>()
const AUTH_FAIL_WINDOW_MS = 60_000   // 1 minute sliding window
const AUTH_FAIL_MAX = 20             // max failures per window per IP

// Clean up stale entries every 5 minutes to prevent unbounded map growth.
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of _authFailures) {
    if (entry.resetAt < now) _authFailures.delete(ip)
  }
}, 5 * 60 * 1000)

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = _authFailures.get(ip)
  if (!entry || entry.resetAt < now) {
    _authFailures.set(ip, { count: 1, resetAt: now + AUTH_FAIL_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > AUTH_FAIL_MAX
}

function extractBearer(header: string | undefined): string | null {
  if (!header || !header.startsWith('Bearer ')) return null
  const token = header.slice(7).trim()
  return token.length > 0 ? token : null
}

interface AuthentikClaims extends JWTPayload {
  email?: string
  name?: string
  groups?: string[]
  preferred_username?: string
}

export const authMiddleware: MiddlewareHandler<{ Variables: AppVariables }> = async (
  c: Context<{ Variables: AppVariables }>,
  next: Next,
) => {
  const ip = c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown'
  const config = getConfig()

  const authHeader = c.req.header('authorization')
  const token = extractBearer(authHeader)

  if (!token) {
    return c.json({ error: 'Authorization header missing or malformed', code: 'MISSING_TOKEN' }, 401)
  }

  // Static ADMIN_TOKEN fallback (for service-to-service calls from n4mmon-dashboard).
  // ADMIN_TOKEN matches are NOT counted as failures — no rate limit penalty.
  if (config.adminToken && token === config.adminToken) {
    c.set('user', {
      sub: 'admin-token',
      email: config.adminEmail,
      name: 'Admin',
      groups: ['portfolio-admins'],
    })
    return next()
  }

  // Rate limit check happens here — only for actual OIDC JWT validation attempts.
  if (isRateLimited(ip)) {
    return c.json({ error: 'Too many failed authentication attempts', code: 'RATE_LIMITED' }, 429)
  }

  // OIDC JWT validation
  try {
    const { payload } = await jwtVerify<AuthentikClaims>(token, getJwks(), {
      issuer: config.issuer,
      audience: config.audience,
    })

    const user: AuthUser = {
      sub: payload.sub ?? '',
      email: payload.email ?? payload.preferred_username ?? '',
      name: payload.name ?? payload.preferred_username ?? '',
      groups: Array.isArray(payload.groups) ? payload.groups : [],
    }

    if (!user.sub) {
      return c.json({ error: 'JWT missing subject claim', code: 'INVALID_TOKEN' }, 401)
    }

    c.set('user', user)
    return next()
  } catch (err: unknown) {
    // Never log the token itself.
    const msg = err instanceof Error ? err.message : 'JWT validation failed'
    console.warn(`[auth] JWT validation failed for IP ${ip}: ${msg}`)
    return c.json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' }, 401)
  }
}

// Helper: check if user is an admin (used by route handlers)
export function isAdmin(user: AuthUser): boolean {
  const adminEmail = getConfig().adminEmail
  if (adminEmail && user.email === adminEmail) return true
  if (user.groups.includes('portfolio-admins')) return true
  return false
}
