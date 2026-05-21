// src/routes/auth.ts — BFF (Backend For Frontend) auth proxy
//
// The frontend never talks to Authentik directly for token exchange or refresh.
// All token operations go through this backend, which stores the refresh token
// in an HttpOnly, Secure, SameSite=Strict cookie — inaccessible to JS.
//
//   POST /api/auth/token    — exchange auth code for tokens (PKCE)
//   POST /api/auth/refresh  — use cookie refresh token, return new access token
//   POST /api/auth/logout   — revoke + clear cookie

import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

const AUTHENTIK_URL = process.env.AUTHENTIK_ISSUER
  ? process.env.AUTHENTIK_ISSUER.replace(/\/application\/o\/[^/]+\/?$/, '')
  : 'https://auth.nammon.men'
const TOKEN_ENDPOINT = `${AUTHENTIK_URL}/application/o/token/`
const REVOKE_ENDPOINT = `${AUTHENTIK_URL}/application/o/revoke/`
const CLIENT_ID = process.env.AUTHENTIK_CLIENT_ID ?? 'portfolio'

const COOKIE_NAME = 'n4mmon_rt'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30  // 30 days

const IS_PROD = process.env.NODE_ENV === 'production'

export const authRoutes = new Hono()

// ─── POST /api/auth/token ─────────────────────────────────────────────────
// Receives: { code, code_verifier, redirect_uri } from the frontend callback.
// Exchanges with Authentik, stores refresh_token in HttpOnly cookie.
// Returns: { access_token, expires_in, user: { sub, email, name } }

authRoutes.post('/token', async (c) => {
  let body: { code?: string; code_verifier?: string; redirect_uri?: string }
  try {
    body = await c.req.json() as typeof body
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'INVALID_JSON' }, 400)
  }

  if (!body.code || !body.code_verifier || !body.redirect_uri) {
    return c.json({ error: 'code, code_verifier, and redirect_uri are required', code: 'MISSING_FIELDS' }, 400)
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code: body.code,
    code_verifier: body.code_verifier,
    redirect_uri: body.redirect_uri,
  })

  const upstream = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    console.warn('[auth/token] upstream error:', upstream.status, err)
    return c.json({ error: 'Token exchange failed', code: 'UPSTREAM_ERROR' }, 401)
  }

  const tokens = await upstream.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }

  if (tokens.refresh_token) {
    setCookie(c, COOKIE_NAME, tokens.refresh_token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'Strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/api/auth',
    })
  }

  return c.json({
    access_token: tokens.access_token,
    expires_in: tokens.expires_in ?? 3600,
  })
})

// ─── POST /api/auth/refresh ───────────────────────────────────────────────
// Reads HttpOnly cookie, exchanges with Authentik for new tokens.
// Returns: { access_token, expires_in }

authRoutes.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, COOKIE_NAME)
  if (!refreshToken) {
    return c.json({ error: 'No refresh token', code: 'NO_REFRESH_TOKEN' }, 401)
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
  })

  const upstream = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (!upstream.ok) {
    deleteCookie(c, COOKIE_NAME, { path: '/api/auth' })
    return c.json({ error: 'Refresh failed', code: 'REFRESH_FAILED' }, 401)
  }

  const tokens = await upstream.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }

  // Rotate the cookie if Authentik issued a new refresh token
  if (tokens.refresh_token) {
    setCookie(c, COOKIE_NAME, tokens.refresh_token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: 'Strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/api/auth',
    })
  }

  return c.json({
    access_token: tokens.access_token,
    expires_in: tokens.expires_in ?? 3600,
  })
})

// ─── POST /api/auth/logout ────────────────────────────────────────────────
// Revokes refresh token upstream, clears cookie.

authRoutes.post('/logout', async (c) => {
  const refreshToken = getCookie(c, COOKIE_NAME)

  if (refreshToken) {
    // Best-effort revocation — do not fail if upstream is down
    try {
      const params = new URLSearchParams({
        token: refreshToken,
        token_type_hint: 'refresh_token',
        client_id: CLIENT_ID,
      })
      await fetch(REVOKE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
    } catch {
      // swallow — cookie is being cleared regardless
    }
  }

  deleteCookie(c, COOKIE_NAME, { path: '/api/auth' })
  return c.json({ ok: true })
})
