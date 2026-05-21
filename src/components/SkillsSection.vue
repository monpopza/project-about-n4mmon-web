<script setup lang="ts">
import { useProfileStore } from '@/stores/profile'
import type { SkillCategory } from '@/types/index'
const profileStore = useProfileStore()

// Map categories to Bootstrap color variants for badges
const categoryColors: Record<string, string> = {
  Frontend: 'primary',
  Backend: 'success',
  'AI & Data': 'warning',
  'Tools & DevOps': 'secondary',
}

function getBadgeClass(category: string): string {
  const color = categoryColors[category] ?? 'info'
  return `bg-${color}`
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Frontend: '&#128196;',
    Backend: '&#9881;',
    'AI & Data': '&#129504;',
    'Tools & DevOps': '&#128295;',
  }
  return icons[category] ?? '&#11088;'
}

const skills = profileStore.data.skills as SkillCategory[]
</script>

<template>
  <section
    id="skills"
    class="py-5 bg-body-tertiary"
    aria-labelledby="skills-heading"
  >
    <div class="container py-4">
      <div class="row justify-content-center mb-5">
        <div class="col-12 col-md-8 text-center">
          <h2 id="skills-heading" class="fw-bold mb-2">Skills</h2>
          <p class="text-body-secondary mb-0">Technologies and tools I work with.</p>
        </div>
      </div>

      <div class="row g-4">
        <div
          v-for="skillGroup in skills"
          :key="skillGroup.category"
          class="col-12 col-sm-6 col-lg-3"
        >
          <div class="card h-100 border-0 shadow-sm skill-card">
            <div class="card-body p-4">
              <div class="d-flex align-items-center gap-2 mb-3">
                <span class="fs-4" aria-hidden="true" v-html="getCategoryIcon(skillGroup.category)"></span>
                <h3 class="h6 fw-bold mb-0 text-body">{{ skillGroup.category }}</h3>
              </div>

              <div class="d-flex flex-wrap gap-2" role="list" :aria-label="skillGroup.category + ' skills'">
                <span
                  v-for="skill in skillGroup.items"
                  :key="skill"
                  class="badge rounded-pill text-bg-light skill-badge"
                  role="listitem"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <!-- Category accent bar -->
            <div class="skill-card-accent" :class="'bg-' + (categoryColors[skillGroup.category] ?? 'info')"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skill-card {
  position: relative;
  overflow: hidden;
  background-color: var(--bs-body-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.skill-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
}

.skill-card-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.8;
}

.skill-badge {
  font-size: 0.8rem;
  border: 1px solid var(--bs-border-color);
  color: var(--bs-body-color) !important;
  background-color: var(--bs-tertiary-bg) !important;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.skill-badge:hover {
  background-color: var(--bs-primary) !important;
  color: #fff !important;
  border-color: var(--bs-primary);
}
</style>
