<script setup lang="ts">
import { useProfileStore } from '@/stores/profile'
const profileStore = useProfileStore()
const profile = profileStore.data
</script>

<template>
  <section
    id="hero"
    class="hero-section d-flex align-items-center"
    aria-label="Hero — introduction"
  >
    <div class="container py-5">
      <div class="row align-items-center justify-content-center text-center text-md-start">
        <div class="col-12 col-md-8 col-lg-7">
          <p class="text-primary fw-semibold mb-2 hero-greeting">
            Hello, I am
          </p>
          <h1 class="display-3 fw-bold mb-2 hero-name">
            {{ profile.name }}
          </h1>
          <p class="fs-4 text-body-secondary mb-3 hero-title">
            {{ profile.title }}
          </p>
          <p class="lead mb-4 hero-tagline">
            {{ profile.tagline }}
          </p>

          <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
            <a
              href="#projects"
              class="btn btn-primary btn-lg px-4"
              aria-label="View my work — scroll to projects section"
            >
              View My Work
            </a>
            <a
              href="#contact"
              class="btn btn-outline-primary btn-lg px-4"
              aria-label="Contact me — scroll to contact section"
            >
              Contact Me
            </a>
            <a
              v-if="profile.resume"
              :href="profile.resume"
              class="btn btn-outline-secondary btn-lg px-4"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download resume (opens in new tab)"
            >
              Resume
            </a>
          </div>
        </div>

        <div class="col-12 col-md-4 col-lg-5 d-flex justify-content-center mt-5 mt-md-0">
          <div class="hero-avatar-wrapper">
            <img
              :src="profile.avatar"
              :alt="profile.name + ' profile picture'"
              class="hero-avatar"
              width="280"
              height="280"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <!-- Scroll hint -->
      <div class="d-flex justify-content-center mt-5 d-none d-md-flex">
        <a
          href="#about"
          class="text-body-secondary text-decoration-none scroll-hint"
          aria-label="Scroll down to About section"
        >
          <span class="d-block text-center small mb-1">Scroll down</span>
          <span class="d-block text-center fs-5">&#8595;</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  min-height: calc(100vh - 56px);
  background: linear-gradient(
    135deg,
    var(--bs-body-bg) 0%,
    var(--bs-tertiary-bg) 100%
  );
}

.hero-greeting {
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.hero-name {
  background: linear-gradient(135deg, var(--bs-primary), #6610f2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-avatar-wrapper {
  position: relative;
}

.hero-avatar {
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--bs-primary);
  padding: 4px;
  background-color: var(--bs-body-bg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-avatar:hover {
  transform: scale(1.03);
  box-shadow: 0 0 0 8px rgba(13, 110, 253, 0.15);
}

.scroll-hint {
  animation: bounce 2s infinite;
  opacity: 0.6;
}

.scroll-hint:hover {
  opacity: 1;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
</style>
