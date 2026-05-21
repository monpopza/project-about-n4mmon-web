<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary">
    <div class="card border-0 shadow-sm text-center p-4" style="max-width: 400px; width: 100%;">
      <div class="card-body py-5 px-4">
        <div class="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            fill="currentColor"
            class="text-primary"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/>
          </svg>
        </div>

        <h1 class="h4 fw-bold mb-2">Admin Access</h1>
        <p class="text-body-secondary mb-4">
          Sign in with your Authentik account to access the admin panel.
        </p>

        <button
          class="btn btn-primary btn-lg w-100"
          type="button"
          aria-label="Sign in with Authentik SSO"
          @click="auth.login()"
        >
          Sign in with Authentik
        </button>

        <p class="text-body-tertiary small mt-4 mb-0">
          Access is restricted to authorized users only.
        </p>
      </div>
    </div>
  </div>
</template>
