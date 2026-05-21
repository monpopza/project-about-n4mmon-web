<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const auth = useAuthStore()
const profileStore = useProfileStore()

const stats = computed(() => [
  {
    label: 'Skills',
    value: profileStore.data.skills.reduce((sum, s) => sum + s.items.length, 0),
    icon: '&#9881;',
    color: 'primary',
    link: '/admin/skills',
  },
  {
    label: 'Projects',
    value: profileStore.data.projects.length,
    icon: '&#128196;',
    color: 'success',
    link: '/admin/projects',
  },
  {
    label: 'Experience',
    value: profileStore.data.experience.length,
    icon: '&#128197;',
    color: 'warning',
    link: '/admin/experience',
  },
  {
    label: 'Social Links',
    value: profileStore.data.socialLinks.length,
    icon: '&#128279;',
    color: 'info',
    link: '/admin/social',
  },
])

const quickActions = [
  { label: 'Edit Profile', to: '/admin/profile', icon: '&#128100;' },
  { label: 'Manage Skills', to: '/admin/skills', icon: '&#9881;' },
  { label: 'Manage Projects', to: '/admin/projects', icon: '&#128196;' },
  { label: 'Manage Experience', to: '/admin/experience', icon: '&#128197;' },
  { label: 'Social Links', to: '/admin/social', icon: '&#128279;' },
  { label: 'Blog Posts', to: '/admin/posts', icon: '&#128221;' },
]
</script>

<template>
  <div class="p-4">
    <header class="mb-4">
      <h1 class="h3 fw-bold mb-1">Dashboard</h1>
      <p class="text-body-secondary mb-0">
        Welcome back, {{ auth.user?.name ?? 'Admin' }}. Manage your portfolio content below.
      </p>
    </header>

    <!-- Stats cards -->
    <section aria-labelledby="stats-heading" class="mb-5">
      <h2 id="stats-heading" class="visually-hidden">Portfolio statistics</h2>
      <div class="row g-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="col-6 col-lg-3"
        >
          <RouterLink
            :to="stat.link"
            class="text-decoration-none"
            :aria-label="`View ${stat.label} — ${stat.value} items`"
          >
            <div class="card border-0 shadow-sm stat-card h-100">
              <div class="card-body p-4 d-flex flex-column">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <span
                    class="fs-3"
                    aria-hidden="true"
                    v-html="stat.icon"
                  ></span>
                  <span :class="`badge bg-${stat.color}-subtle text-${stat.color} border border-${stat.color}-subtle`">
                    {{ stat.value }}
                  </span>
                </div>
                <p class="fw-semibold text-body mb-0">{{ stat.label }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Quick actions -->
    <section aria-labelledby="actions-heading">
      <h2 id="actions-heading" class="h5 fw-bold mb-3">Quick Actions</h2>
      <div class="row g-3">
        <div
          v-for="action in quickActions"
          :key="action.label"
          class="col-6 col-md-4 col-lg-3"
        >
          <RouterLink
            :to="action.to"
            class="btn btn-outline-secondary w-100 d-flex align-items-center gap-2 justify-content-center py-3"
            :aria-label="action.label"
          >
            <span aria-hidden="true" v-html="action.icon"></span>
            <span>{{ action.label }}</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stat-card {
  background-color: var(--bs-body-bg);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1) !important;
}
</style>
