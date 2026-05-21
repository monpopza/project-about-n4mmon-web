import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProfileStore } from '@/stores/profile'
import { profile as staticProfile } from '@/data/profile'

// Mock the env variable
vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com')

describe('profileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with static profile data', () => {
    const store = useProfileStore()
    expect(store.data.name).toBe(staticProfile.name)
    expect(store.source).toBe('static')
  })

  it('fetches from API and updates data on success', async () => {
    const mockProfile = { ...staticProfile, name: 'API Name' }
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    } as Response)

    const store = useProfileStore()
    await store.fetchProfile()

    expect(store.data.name).toBe('API Name')
    expect(store.source).toBe('api')
    expect(store.error).toBeNull()
  })

  it('falls back to static data when API returns non-ok status', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response)

    const store = useProfileStore()
    await store.fetchProfile()

    expect(store.data.name).toBe(staticProfile.name)
    expect(store.source).toBe('static')
    expect(store.error).toContain('HTTP 500')
  })

  it('falls back to static data when API throws (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const store = useProfileStore()
    await store.fetchProfile()

    expect(store.data.name).toBe(staticProfile.name)
    expect(store.source).toBe('static')
    expect(store.error).toBe('Network error')
  })

  it('uses static data when no API base URL is configured', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    const fetchSpy = vi.fn()
    global.fetch = fetchSpy

    const store = useProfileStore()
    await store.fetchProfile()

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(store.source).toBe('static')
  })
})
