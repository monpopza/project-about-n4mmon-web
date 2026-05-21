// src/stores/auth.ts
// Pinia store wrapping the Authentik PKCE composable.
// Provides reactive auth state consumed by the router guard and admin components.

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

export const useAuthStore = defineStore('auth', () => {
  const auth = useAuth()

  const isAuthenticated = computed(() => auth.isAuthenticated.value)
  const user = computed(() => auth.user.value)
  const authLoading = computed(() => auth.authLoading.value)

  function getAccessToken(): string | null {
    return auth.getAccessToken()
  }

  async function login(): Promise<void> {
    await auth.login()
  }

  async function handleCallback(code: string): Promise<void> {
    await auth.handleCallback(code)
  }

  async function refreshToken(): Promise<void> {
    await auth.refreshToken()
  }

  async function logout(): Promise<void> {
    await auth.logout()
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
})
