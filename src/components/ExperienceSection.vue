<script setup lang="ts">
import { useProfileStore } from '@/stores/profile'
import type { Experience } from '@/types/index'

const profileStore = useProfileStore()
const experience = profileStore.data.experience as Experience[]

function getBadgeVariant(type: 'work' | 'education'): string {
  return type === 'work' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-success-subtle text-success border border-success-subtle'
}

function getTypeLabel(type: 'work' | 'education'): string {
  return type === 'work' ? 'Work' : 'Education'
}
</script>

<template>
  <section
    id="experience"
    class="py-5 bg-body-tertiary"
    aria-labelledby="experience-heading"
  >
    <div class="container py-4">
      <div class="row justify-content-center mb-5">
        <div class="col-12 col-md-8 text-center">
          <h2 id="experience-heading" class="fw-bold mb-2">Experience</h2>
          <p class="text-body-secondary mb-0">My professional journey and education.</p>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-12 col-lg-9">
          <div class="experience-timeline" role="list" aria-label="Experience timeline">
            <article
              v-for="(item, index) in experience"
              :key="index"
              class="experience-item d-flex gap-4 mb-4"
              role="listitem"
            >
              <!-- Timeline indicator -->
              <div class="experience-timeline-indicator d-flex flex-column align-items-center flex-shrink-0">
                <div class="experience-dot rounded-circle" :class="item.type === 'work' ? 'bg-primary' : 'bg-success'"></div>
                <div v-if="index < experience.length - 1" class="experience-line"></div>
              </div>

              <!-- Card content -->
              <div class="card border-0 shadow-sm experience-card flex-grow-1 mb-2">
                <div class="card-body p-4">
                  <div class="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                    <div>
                      <h3 class="h5 fw-bold mb-1">{{ item.role }}</h3>
                      <p class="text-body-secondary mb-0 fw-semibold">{{ item.company }}</p>
                    </div>
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                      <span class="badge rounded-pill" :class="getBadgeVariant(item.type)">
                        {{ getTypeLabel(item.type) }}
                      </span>
                      <span class="badge bg-body-secondary text-body border rounded-pill small">
                        {{ item.period }}
                      </span>
                    </div>
                  </div>

                  <p class="text-body-secondary mb-0 lh-lg">{{ item.description }}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience-timeline-indicator {
  padding-top: 1.25rem;
}

.experience-dot {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 2px solid var(--bs-body-bg);
  box-shadow: 0 0 0 2px currentColor;
}

.experience-line {
  flex: 1;
  width: 2px;
  background-color: var(--bs-border-color);
  margin-top: 4px;
  min-height: 2rem;
}

.experience-card {
  background-color: var(--bs-body-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.experience-card:hover {
  transform: translateX(4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
