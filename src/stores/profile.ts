// src/stores/profile.ts
// Pinia store: fetches profile data from GET /api/profile on app init.
// Falls back to static profile.ts if the API is unreachable (offline / API down).
// All public section components consume this store instead of importing profile.ts directly.

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { profile as staticProfile } from '@/data/profile'
import type { Profile } from '@/types/index'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const useProfileStore = defineStore('profile', () => {
  const data = ref<Profile>({ ...staticProfile })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const source = ref<'api' | 'static'>('static')

  async function fetchProfile(): Promise<void> {
    if (!API_BASE) {
      // No API configured — use static data
      source.value = 'static'
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/profile`, { signal: AbortSignal.timeout(5000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const json = await response.json() as Profile
      data.value = json
      source.value = 'api'
    } catch (err) {
      // API unavailable — silently fall back to static profile.ts
      error.value = err instanceof Error ? err.message : 'Unknown error'
      data.value = { ...staticProfile }
      source.value = 'static'
    } finally {
      loading.value = false
    }
  }

  // Admin: save scalar profile fields (requires auth token)
  async function saveProfile(token: string, updates: Partial<Profile>): Promise<void> {
    if (!API_BASE) throw new Error('API not configured')
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error(`Save failed: HTTP ${response.status}`)
    const updated = await response.json() as Profile
    data.value = updated
  }

  return { data, loading, error, source, fetchProfile, saveProfile }
})
