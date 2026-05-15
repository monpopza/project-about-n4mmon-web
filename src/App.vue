<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import SkillsSection from '@/components/SkillsSection.vue'
import ProjectsSection from '@/components/ProjectsSection.vue'
import ExperienceSection from '@/components/ExperienceSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import { profile } from '@/data/profile'
</script>

<template>
  <div id="page-root">
    <a href="#main-content" class="visually-hidden-focusable btn btn-primary skip-link">
      Skip to main content
    </a>

    <NavBar />

    <main id="main-content">
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
    </main>

    <footer class="py-4 bg-body-tertiary border-top">
      <div class="container text-center text-body-secondary">
        <p class="mb-1 small">
          Built by
          <a :href="profile.social.github" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none fw-semibold">
            {{ profile.name }}
          </a>
          with Vue 3 + Bootstrap 5 + Bun
        </p>
        <p class="mb-0 small">
          &copy; {{ new Date().getFullYear() }} {{ profile.name }}. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
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
