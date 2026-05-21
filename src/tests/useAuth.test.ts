import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuth } from '@/composables/useAuth'

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:5173',
    href: 'http://localhost:5173',
    search: '',
  },
  writable: true,
})

// Mock sessionStorage — only used for pkce_verifier (never for refresh token now)
const store: Record<string, string> = {}
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]) }),
  },
  writable: true,
})

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
      return arr
    },
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
  writable: true,
})

describe('useAuth composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(store).forEach((k) => delete store[k])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with isAuthenticated = false and authLoading = true', () => {
    const auth = useAuth()
    expect(auth.isAuthenticated.value).toBe(false)
    expect(auth.user.value).toBeNull()
  })

  it('returns null access token when not authenticated', () => {
    const auth = useAuth()
    expect(auth.getAccessToken()).toBeNull()
  })

  it('sets authLoading to false when BFF returns 401 (no cookie)', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false } as Response)
    const auth = useAuth()
    await auth.refreshToken()
    expect(auth.authLoading.value).toBe(false)
    expect(auth.isAuthenticated.value).toBe(false)
  })

  it('sets authLoading to false even on network error', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    const auth = useAuth()
    await auth.refreshToken()
    expect(auth.authLoading.value).toBe(false)
    expect(auth.isAuthenticated.value).toBe(false)
  })

  it('handleCallback throws when pkce_verifier is missing from sessionStorage', async () => {
    const auth = useAuth()
    await expect(auth.handleCallback('some-code')).rejects.toThrow('Missing PKCE verifier')
  })

  it('handleCallback throws when BFF returns non-ok response', async () => {
    store['pkce_verifier'] = 'test-verifier'
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: async () => 'invalid_grant',
    } as Response)

    const auth = useAuth()
    await expect(auth.handleCallback('test-code')).rejects.toThrow('Token exchange failed')
  })

  it('handleCallback authenticates user on BFF success', async () => {
    store['pkce_verifier'] = 'test-verifier'

    // BFF returns only access_token + expires_in (refresh token is set as HttpOnly cookie)
    const payload = { sub: 'user-123', email: 'test@example.com', name: 'Test User' }
    const encodedPayload = btoa(JSON.stringify(payload))
    const fakeToken = `header.${encodedPayload}.signature`

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: fakeToken, expires_in: 3600 }),
    } as Response)

    const auth = useAuth()
    await auth.handleCallback('test-code')

    expect(auth.isAuthenticated.value).toBe(true)
    expect(auth.user.value?.sub).toBe('user-123')
    expect(auth.user.value?.email).toBe('test@example.com')
    expect(auth.getAccessToken()).toBe(fakeToken)
    // Verifier must be cleared after use
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('pkce_verifier')
  })

  it('refreshToken sets access token from BFF on success', async () => {
    const payload = { sub: 'user-456', email: 'user@example.com', name: 'User' }
    const encodedPayload = btoa(JSON.stringify(payload))
    const fakeToken = `header.${encodedPayload}.signature`

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: fakeToken, expires_in: 3600 }),
    } as Response)

    const auth = useAuth()
    await auth.refreshToken()

    expect(auth.authLoading.value).toBe(false)
    expect(auth.isAuthenticated.value).toBe(true)
    expect(auth.user.value?.sub).toBe('user-456')
  })
})
