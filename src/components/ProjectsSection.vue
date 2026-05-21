<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import type { Project } from '@/types/index'

const profileStore = useProfileStore()
const showAll = ref(false)

const visibleProjects = computed<Project[]>(() => {
  return showAll.value
    ? profileStore.data.projects
    : profileStore.data.projects.filter((p) => p.featured)
})

const hasHidden = computed<boolean>(() => {
  return profileStore.data.projects.some((p) => !p.featured)
})
</script>

<template>
  <section id="projects" class="py-5" aria-labelledby="projects-heading">
    <div class="container py-4">
      <div class="row justify-content-center mb-5">
        <div class="col-12 col-md-8 text-center">
          <h2 id="projects-heading" class="fw-bold mb-2">Projects</h2>
          <p class="text-body-secondary mb-0">
            Things I have built — from web apps to AI pipelines.
          </p>
        </div>
      </div>

      <div id="projects-grid" class="row g-4">
        <article
          v-for="project in visibleProjects"
          :key="project.title"
          class="col-12 col-md-6 col-lg-6"
        >
          <div class="card h-100 border-0 shadow-sm project-card">
            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
                <h3 class="h5 card-title fw-bold mb-0">{{ project.title }}</h3>
                <span
                  v-if="project.featured"
                  class="badge bg-primary-subtle text-primary border border-primary-subtle flex-shrink-0"
                >
                  Featured
                </span>
              </div>

              <p class="card-text text-body-secondary flex-grow-1 lh-lg">
                {{ project.description }}
              </p>

              <!-- Tech stack tags -->
              <div
                class="d-flex flex-wrap gap-2 mb-4"
                role="list"
                :aria-label="project.title + ' tech stack'"
              >
                <span
                  v-for="tech in project.tech"
                  :key="tech"
                  class="badge text-bg-secondary rounded-pill"
                  role="listitem"
                >
                  {{ tech }}
                </span>
              </div>

              <!-- Links -->
              <div class="d-flex gap-2 flex-wrap">
                <a
                  v-if="project.github"
                  :href="project.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-outline-primary"
                  :aria-label="'View ' + project.title + ' source code on GitHub (opens in new tab)'"
                >
                  GitHub
                </a>
                <a
                  v-if="project.live"
                  :href="project.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-primary"
                  :aria-label="'View ' + project.title + ' live demo (opens in new tab)'"
                >
                  Live Demo
                </a>
                <span
                  v-if="!project.live"
                  class="text-body-tertiary small align-self-center"
                >
                  No live demo
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Show all toggle -->
      <div v-if="hasHidden" class="text-center mt-5">
        <button
          class="btn btn-outline-primary btn-lg"
          @click="showAll = !showAll"
          :aria-expanded="showAll"
          aria-controls="projects-grid"
        >
          {{ showAll ? 'Show Less' : 'Show All Projects' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.project-card {
  background-color: var(--bs-body-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
}
</style>
