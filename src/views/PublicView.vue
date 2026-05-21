<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import SocialLinksSection from '@/components/SocialLinksSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import SkillsSection from '@/components/SkillsSection.vue'
import ProjectsSection from '@/components/ProjectsSection.vue'
import ExperienceSection from '@/components/ExperienceSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
</script>

<template>
  <div id="page-root">
    <a href="#main-content" class="visually-hidden-focusable btn btn-primary skip-link">
      Skip to main content
    </a>

    <NavBar />

    <main id="main-content">
      <HeroSection />
      <SocialLinksSection />
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
          <a
            :href="profileStore.data.social.github"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary text-decoration-none fw-semibold"
          >
            {{ profileStore.data.name }}
          </a>
          with Vue 3 + Bootstrap 5 + Bun
        </p>
        <p class="mb-0 small">
          &copy; {{ new Date().getFullYear() }} {{ profileStore.data.name }}. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
