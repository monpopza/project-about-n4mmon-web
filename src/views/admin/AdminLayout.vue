<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import AuthGate from '@/components/admin/AuthGate.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const navLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '&#9782;' },
  { to: '/admin/profile', label: 'Profile', icon: '&#128100;' },
  { to: '/admin/skills', label: 'Skills', icon: '&#9881;' },
  { to: '/admin/projects', label: 'Projects', icon: '&#128196;' },
  { to: '/admin/experience', label: 'Experience', icon: '&#128197;' },
  { to: '/admin/social', label: 'Social Links', icon: '&#128279;' },
  { to: '/admin/posts', label: 'Blog Posts', icon: '&#128221;' },
]
</script>

<template>
  <!-- Show AuthGate when not authenticated -->
  <AuthGate v-if="!auth.isAuthenticated" />

  <div v-else class="d-flex min-vh-100">
    <!-- Sidebar (desktop) -->
    <aside
      class="admin-sidebar d-none d-lg-flex flex-column bg-dark text-white"
      aria-label="Admin navigation"
    >
      <div class="p-3 border-bottom border-secondary">
        <a href="/" class="text-white text-decoration-none">
          <span class="fw-bold fs-5">&#8592; Portfolio</span>
        </a>
      </div>

      <nav class="flex-grow-1 p-2" aria-label="Admin sections">
        <ul class="nav flex-column gap-1" role="list">
          <li v-for="link in navLinks" :key="link.to" class="nav-item" role="listitem">
            <RouterLink
              :to="link.to"
              class="nav-link text-white-50 d-flex align-items-center gap-2 rounded px-3 py-2"
              active-class="active-nav-link"
              :aria-label="link.label + ' admin section'"
            >
              <span aria-hidden="true" v-html="link.icon"></span>
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- User info + logout -->
      <div class="p-3 border-top border-secondary">
        <p class="text-white-50 small mb-1 text-truncate" :title="auth.user?.email">
          {{ auth.user?.name ?? auth.user?.email ?? 'Admin' }}
        </p>
        <button
          class="btn btn-sm btn-outline-danger w-100"
          type="button"
          aria-label="Sign out of admin panel"
          @click="auth.logout()"
        >
          Sign Out
        </button>
      </div>
    </aside>

    <!-- Mobile offcanvas toggle -->
    <div class="d-lg-none admin-mobile-header bg-dark text-white d-flex align-items-center px-3 py-2 sticky-top w-100">
      <button
        class="btn btn-sm btn-outline-light me-3"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#adminOffcanvas"
        aria-controls="adminOffcanvas"
        aria-label="Open admin navigation menu"
      >
        &#9776;
      </button>
      <span class="fw-bold">Admin Panel</span>
    </div>

    <!-- Offcanvas sidebar (mobile) -->
    <div
      id="adminOffcanvas"
      class="offcanvas offcanvas-start bg-dark text-white"
      tabindex="-1"
      aria-labelledby="adminOffcanvasLabel"
    >
      <div class="offcanvas-header border-bottom border-secondary">
        <h2 id="adminOffcanvasLabel" class="offcanvas-title fw-bold text-white fs-5">Admin Panel</h2>
        <button
          type="button"
          class="btn-close btn-close-white"
          data-bs-dismiss="offcanvas"
          aria-label="Close navigation menu"
        ></button>
      </div>

      <div class="offcanvas-body p-0 d-flex flex-column">
        <nav class="flex-grow-1 p-2" aria-label="Admin sections mobile">
          <ul class="nav flex-column gap-1" role="list">
            <li v-for="link in navLinks" :key="link.to" class="nav-item" role="listitem">
              <RouterLink
                :to="link.to"
                class="nav-link text-white-50 d-flex align-items-center gap-2 rounded px-3 py-2"
                active-class="active-nav-link"
                data-bs-dismiss="offcanvas"
                :aria-label="link.label + ' admin section'"
              >
                <span aria-hidden="true" v-html="link.icon"></span>
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="p-3 border-top border-secondary">
          <p class="text-white-50 small mb-1 text-truncate">
            {{ auth.user?.name ?? 'Admin' }}
          </p>
          <button
            class="btn btn-sm btn-outline-danger w-100"
            type="button"
            aria-label="Sign out of admin panel"
            @click="auth.logout()"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>

    <!-- Main content area -->
    <main class="admin-main flex-grow-1 bg-body-tertiary" id="admin-main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-sidebar {
  width: 220px;
  min-width: 220px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.admin-mobile-header {
  z-index: 1020;
}

.active-nav-link {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff !important;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #fff !important;
}

.admin-main {
  min-height: 100vh;
  overflow-y: auto;
}
</style>
