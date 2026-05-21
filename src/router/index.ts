// src/router/index.ts
// Vue Router configuration.
// Public routes: / (portfolio), /admin/callback (PKCE redirect handler)
// Admin routes: /admin/* — all require authentication via Authentik PKCE.
// Navigation guard: unauthenticated access to admin routes triggers the PKCE login flow.

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import PublicView from '@/views/PublicView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'public',
    component: PublicView,
  },
  {
    path: '/admin/callback',
    name: 'admin-callback',
    component: () => import('@/views/admin/CallbackView.vue'),
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    path: '/admin',
    name: 'admin-layout',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'admin-profile',
        component: () => import('@/views/admin/ProfileEditorView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'skills',
        name: 'admin-skills',
        component: () => import('@/views/admin/SkillsEditorView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'projects',
        name: 'admin-projects',
        component: () => import('@/views/admin/ProjectsEditorView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'experience',
        name: 'admin-experience',
        component: () => import('@/views/admin/ExperienceEditorView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'social',
        name: 'admin-social',
        component: () => import('@/views/admin/SocialEditorView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'posts',
        name: 'admin-posts',
        component: () => import('@/views/admin/PostsEditorView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// Navigation guard — deferred import to avoid circular dependency with Pinia
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  // Dynamically import auth store to avoid Pinia initialization order issues
  const { useAuthStore } = await import('@/stores/auth')
  const auth = useAuthStore()

  // If still loading (refresh token in flight) wait briefly
  if (auth.authLoading) {
    await new Promise<void>((resolve) => {
      const unwatch = setInterval(() => {
        if (!auth.authLoading) {
          clearInterval(unwatch)
          resolve()
        }
      }, 50)
    })
  }

  if (auth.isAuthenticated) return true

  // Not authenticated — trigger PKCE login
  await auth.login()
  return false
})

export default router
