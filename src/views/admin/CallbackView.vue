<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const error = ref<string | null>(null)

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const errorParam = params.get('error')
  const errorDesc = params.get('error_description')

  if (errorParam) {
    error.value = errorDesc ?? errorParam
    return
  }

  if (!code) {
    error.value = 'No authorization code received from the identity provider.'
    return
  }

  try {
    await auth.handleCallback(code)
    await router.replace({ name: 'admin-dashboard' })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed.'
  }
})
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary">
    <div class="text-center p-4" style="max-width: 400px;">
      <div v-if="!error">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Completing sign in...</span>
        </div>
        <p class="text-body-secondary mb-0">Completing sign in...</p>
      </div>

      <div v-else>
        <div class="text-danger mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="currentColor"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
          </svg>
        </div>
        <h1 class="h5 fw-bold mb-2">Authentication Failed</h1>
        <p class="text-body-secondary mb-4 small">{{ error }}</p>
        <a href="/" class="btn btn-outline-primary" aria-label="Return to portfolio home">
          Return Home
        </a>
      </div>
    </div>
  </div>
</template>
