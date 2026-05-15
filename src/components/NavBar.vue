<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { profile } from '@/data/profile'

const isDark = ref(false)
const isScrolled = ref(false)

function toggleDarkMode(): void {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-bs-theme', isDark.value ? 'dark' : 'light')
}

function handleScroll(): void {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]
</script>

<template>
  <nav
    class="navbar navbar-expand-lg sticky-top"
    :class="isScrolled ? 'shadow-sm navbar-scrolled' : ''"
    aria-label="Main navigation"
  >
    <div class="container">
      <!-- Brand -->
      <a class="navbar-brand fw-bold fs-4" href="#hero">
        {{ profile.name }}
      </a>

      <!-- Dark mode toggle + hamburger -->
      <div class="d-flex align-items-center gap-2 ms-auto">
        <button
          class="btn btn-sm btn-outline-secondary border-0 d-lg-none"
          type="button"
          @click="toggleDarkMode"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-pressed="isDark"
        >
          <span v-if="isDark">&#9728;</span>
          <span v-else>&#9790;</span>
        </button>

        <button
          class="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation menu"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>

      <!-- Nav links -->
      <div class="collapse navbar-collapse" id="navbarMain">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">
          <li v-for="link in navLinks" :key="link.href" class="nav-item">
            <a class="nav-link px-3" :href="link.href">{{ link.label }}</a>
          </li>

          <!-- Dark mode toggle (desktop) -->
          <li class="nav-item d-none d-lg-block ms-2">
            <button
              class="btn btn-sm btn-outline-secondary border-0"
              type="button"
              @click="toggleDarkMode"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              :aria-pressed="isDark"
            >
              <span v-if="isDark">&#9728; Light</span>
              <span v-else>&#9790; Dark</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: var(--bs-body-bg);
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

.navbar-scrolled {
  border-bottom: 1px solid var(--bs-border-color);
}

.nav-link {
  transition: color 0.15s ease;
}

.nav-link:hover {
  color: var(--bs-primary) !important;
}
</style>
