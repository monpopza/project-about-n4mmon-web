<script setup lang="ts">
import { useProfileStore } from '@/stores/profile'
const profileStore = useProfileStore()
const profile = profileStore.data

const highlights = [
  { icon: '&#128187;', label: 'Full-Stack Dev' },
  { icon: '&#129302;', label: 'AI Engineer' },
  { icon: '&#128640;', label: 'Systems Builder' },
  { icon: '&#128736;', label: 'Open Source' },
]
</script>

<template>
  <section id="about" class="py-5" aria-labelledby="about-heading">
    <div class="container py-4">
      <div class="row justify-content-center mb-4">
        <div class="col-12 col-md-8 text-center">
          <h2 id="about-heading" class="fw-bold mb-2">About Me</h2>
          <p class="text-body-secondary mb-0">A little bit about who I am and what I do.</p>
        </div>
      </div>

      <div class="row align-items-center g-5">
        <!-- Avatar + highlights -->
        <div class="col-12 col-md-5 col-lg-4 d-flex flex-column align-items-center">
          <img
            :src="profile.avatar"
            :alt="profile.name + ' profile picture'"
            class="about-avatar rounded-circle mb-4 shadow"
            width="200"
            height="200"
            loading="lazy"
          />

          <div class="row g-3 w-100">
            <div
              v-for="h in highlights"
              :key="h.label"
              class="col-6"
            >
              <div class="about-chip card h-100 border-0 shadow-sm text-center p-3">
                <span class="fs-3 mb-1" aria-hidden="true" v-html="h.icon"></span>
                <small class="fw-semibold text-body-secondary">{{ h.label }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Bio text -->
        <div class="col-12 col-md-7 col-lg-8">
          <h3 class="h4 fw-semibold mb-3">
            Hi, I am {{ profile.name }} — {{ profile.title }}
          </h3>
          <p class="text-body-secondary lh-lg mb-4">
            {{ profile.bio }}
          </p>

          <div class="row g-3 mb-4">
            <div class="col-12 col-sm-6">
              <p class="mb-1 fw-semibold small text-body-secondary text-uppercase">Email</p>
              <a :href="'mailto:' + profile.email" class="text-primary text-decoration-none">
                {{ profile.email }}
              </a>
            </div>
            <div class="col-12 col-sm-6">
              <p class="mb-1 fw-semibold small text-body-secondary text-uppercase">GitHub</p>
              <a
                :href="profile.social.github"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary text-decoration-none"
              >
                github.com/n4mmon
              </a>
            </div>
          </div>

          <div class="d-flex flex-wrap gap-3">
            <a :href="profile.social.github" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              GitHub Profile
            </a>
            <a :href="profile.social.linkedin" target="_blank" rel="noopener noreferrer" class="btn btn-outline-primary">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-avatar {
  object-fit: cover;
  border: 3px solid var(--bs-primary);
  padding: 3px;
  background-color: var(--bs-body-bg);
}

.about-chip {
  background-color: var(--bs-tertiary-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.about-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>
