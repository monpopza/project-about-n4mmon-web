// src/composables/useAuth.ts
// Authentik OIDC Authorization Code + PKCE flow — BFF (Backend For Frontend) pattern.
// Access token is held in memory only — never written to storage.
// Refresh token is stored in an HttpOnly cookie managed by the backend (/api/auth/*).
// The frontend never sees or stores the refresh token.

import { ref, computed } from 'vue'

const AUTHENTIK_URL = import.meta.env.VITE_AUTHENTIK_URL ?? 'https://auth.nammon.men'
const AUTHENTIK_APP = import.meta.env.VITE_AUTHENTIK_APP ?? 'portfolio'
const CLIENT_ID = import.meta.env.VITE_AUTHENTIK_CLIENT_ID ?? ''
// VITE_API_BASE_URL already ends with /api (e.g. https://nammon.men/api).
// BFF auth routes live at /api/auth/*, so we build the prefix without the trailing /api.
const _apiUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const BFF_BASE = _apiUrl.endsWith('/api') ? _apiUrl.slice(0, -4) : _apiUrl

// Authorization endpoint — still Authentik direct (only starts the redirect, no token here)
const AUTHORIZATION_ENDPOINT = `${AUTHENTIK_URL}/application/o/authorize/`
const END_SESSION_ENDPOINT = `${AUTHENTIK_URL}/application/o/${AUTHENTIK_APP}/end-session/`

const REDIRECT_URI = `${window.location.origin}/admin/callback`

// ─── In-memory state (module-level singleton) ─────────────────────────────────
const _accessToken = ref<string | null>(null)
const _user = ref<AuthUser | null>(null)
const _loading = ref(true)

export interface AuthUser {
  sub: string
  email: string
  name: string
  picture?: string
}

// ─── PKCE helpers ─────────────────────────────────────────────────────────────
function generateCodeVerifier(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return {
      sub: payload.sub ?? '',
      email: payload.email ?? '',
      name: payload.name ?? payload.preferred_username ?? '',
      picture: payload.picture,
    }
  } catch {
    return null
  }
}

// ─── Public composable ────────────────────────────────────────────────────────
export function useAuth() {
  const isAuthenticated = computed(() => _accessToken.value !== null)
  const user = computed(() => _user.value)
  const authLoading = computed(() => _loading.value)

  function getAccessToken(): string | null {
    return _accessToken.value
  }

  async function login(): Promise<void> {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)

    // PKCE verifier lives in sessionStorage only for the duration of the redirect.
    // It is cleared immediately on callback completion.
    sessionStorage.setItem('pkce_verifier', verifier)

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      scope: 'openid profile email',
    })

    window.location.href = `${AUTHORIZATION_ENDPOINT}?${params.toString()}`
  }

  // BFF: send code + verifier to backend; backend calls Authentik and stores
  // the refresh token in an HttpOnly cookie — never exposed to JS.
  async function handleCallback(code: string): Promise<void> {
    const verifier = sessionStorage.getItem('pkce_verifier')
    if (!verifier) throw new Error('Missing PKCE verifier — session may have expired')
    sessionStorage.removeItem('pkce_verifier')

    const response = await fetch(`${BFF_BASE}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',   // send/receive HttpOnly cookies
      body: JSON.stringify({ code, code_verifier: verifier, redirect_uri: REDIRECT_URI }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Token exchange failed: ${err}`)
    }

    const tokens = await response.json() as { access_token: string; expires_in: number }
    _accessToken.value = tokens.access_token
    _user.value = decodeJwtPayload(tokens.access_token)
  }

  // BFF: backend reads HttpOnly cookie and returns a new access token.
  async function refreshToken(): Promise<void> {
    try {
      const response = await fetch(`${BFF_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        _loading.value = false
        return
      }

      const tokens = await response.json() as { access_token: string; expires_in: number }
      _accessToken.value = tokens.access_token
      _user.value = decodeJwtPayload(tokens.access_token)
    } catch {
      // Network error or no cookie — remain unauthenticated
    } finally {
      _loading.value = false
    }
  }

  // BFF: backend revokes refresh token and clears the HttpOnly cookie.
  async function logout(): Promise<void> {
    try {
      await fetch(`${BFF_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch {
      // best-effort
    }

    _accessToken.value = null
    _user.value = null

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      post_logout_redirect_uri: window.location.origin,
    })
    window.location.href = `${END_SESSION_ENDPOINT}?${params.toString()}`
  }

  return {
    isAuthenticated,
    user,
    authLoading,
    getAccessToken,
    login,
    handleCallback,
    refreshToken,
    logout,
  }
}
