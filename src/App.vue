<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* ─── Global CSS variables (design system) ─── */
:root {
  --color-primary: #0d6efd;
  --color-secondary: #6c757d;
  --color-success: #198754;
  --color-danger: #dc3545;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #212529;
}

/* ─── Smooth scroll ─── */
html {
  scroll-behavior: smooth;
}

/* ─── Skip link accessibility ─── */
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  z-index: 9999;
  transition: top 0.1s ease;
}

.skip-link:focus {
  top: 0.5rem;
}

/* ─── Section separators ─── */
section + section {
  position: relative;
}

/* ─── Typography enhancements ─── */
h1, h2, h3 {
  letter-spacing: -0.01em;
}

/* ─── Focus visible for keyboard nav ─── */
:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}

/* ─── Transition for dark/light mode swap ─── */
*,
*::before,
*::after {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.15s ease;
}
</style>
