<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const REDIRECT_PREFIX = 'https://s.nammon.cc/'

// ── Types ────────────────────────────────────────────────────────────────────

interface ShortLink {
  code: string
  url: string
  note: string
  clicks: number
  createdAt: string
}

// ── State ────────────────────────────────────────────────────────────────────

const links = ref<ShortLink[]>([])
const loading = ref(false)
const fetchError = ref<string | null>(null)

// Create form
const formUrl = ref('')
const formCode = ref('')
const formNote = ref('')
const creating = ref(false)
const createError = ref<string | null>(null)
const createSuccess = ref(false)

// Delete
const pendingDeleteCode = ref<string | null>(null)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

// ── Helpers ──────────────────────────────────────────────────────────────────

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

function getAuthHeaders(): HeadersInit {
  const token = auth.getAccessToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token ?? ''}`,
  }
}

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchLinks(): Promise<void> {
  if (!API_BASE) {
    fetchError.value = 'API not configured (VITE_API_BASE_URL is not set).'
    return
  }

  loading.value = true
  fetchError.value = null

  try {
    const response = await fetch(`${API_BASE}/admin/shortlinks`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    links.value = (await response.json()) as ShortLink[]
  } catch (err) {
    fetchError.value = err instanceof Error ? err.message : 'Failed to load short links.'
  } finally {
    loading.value = false
  }
}

// ── Create ────────────────────────────────────────────────────────────────────

async function createLink(): Promise<void> {
  if (!formUrl.value.trim()) return

  creating.value = true
  createError.value = null
  createSuccess.value = false

  const body: { url: string; code?: string; note?: string } = {
    url: formUrl.value.trim(),
  }
  if (formCode.value.trim()) body.code = formCode.value.trim()
  if (formNote.value.trim()) body.note = formNote.value.trim()

  try {
    const response = await fetch(`${API_BASE}/admin/shortlinks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}${text ? ': ' + text : ''}`)
    }
    // Refresh list and reset form
    formUrl.value = ''
    formCode.value = ''
    formNote.value = ''
    createSuccess.value = true
    setTimeout(() => { createSuccess.value = false }, 3000)
    await fetchLinks()
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Failed to create short link.'
  } finally {
    creating.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

function requestDelete(code: string): void {
  pendingDeleteCode.value = code
  deleteError.value = null
  const el = document.getElementById('confirm-delete-shortlink')
  if (el) {
    import('bootstrap').then(({ Modal }) => {
      Modal.getOrCreateInstance(el).show()
    })
  }
}

async function deleteLink(code: string): Promise<void> {
  deleting.value = true
  deleteError.value = null

  try {
    const response = await fetch(`${API_BASE}/admin/shortlinks/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    links.value = links.value.filter((l) => l.code !== code)
    pendingDeleteCode.value = null
  } catch (err) {
    deleteError.value = err instanceof Error ? err.message : 'Failed to delete short link.'
  } finally {
    deleting.value = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  fetchLinks()
})
</script>

<template>
  <div class="p-4">
    <!-- Page header -->
    <header class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h1 class="h3 fw-bold mb-1">Short Links</h1>
        <p class="text-body-secondary mb-0">
          Manage redirect links served at
          <a :href="REDIRECT_PREFIX" target="_blank" rel="noopener" class="text-body-secondary">
            {{ REDIRECT_PREFIX }}
          </a>
        </p>
      </div>
      <button
        class="btn btn-outline-secondary btn-sm"
        type="button"
        :disabled="loading"
        aria-label="Refresh short links list"
        @click="fetchLinks"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ loading ? 'Loading…' : 'Refresh' }}
      </button>
    </header>

    <!-- Create form -->
    <div class="card shadow-sm mb-4">
      <div class="card-header fw-semibold">Create New Short Link</div>
      <div class="card-body">
        <div v-if="createSuccess" class="alert alert-success py-2" role="status">
          Short link created successfully.
        </div>
        <div v-if="createError" class="alert alert-danger py-2" role="alert">{{ createError }}</div>

        <form @submit.prevent="createLink" novalidate>
          <div class="row g-3">
            <!-- URL (required) -->
            <div class="col-12 col-md-5">
              <label for="sl-url" class="form-label fw-semibold small">
                Destination URL <span class="text-danger" aria-hidden="true">*</span>
              </label>
              <input
                id="sl-url"
                v-model="formUrl"
                type="url"
                class="form-control"
                placeholder="https://example.com/long/path"
                required
                aria-required="true"
                aria-label="Destination URL (required)"
              />
            </div>

            <!-- Short code (optional) -->
            <div class="col-12 col-md-3">
              <label for="sl-code" class="form-label fw-semibold small">Short Code</label>
              <input
                id="sl-code"
                v-model="formCode"
                type="text"
                class="form-control"
                placeholder="auto-generated"
                aria-label="Short code (optional, auto-generated if blank)"
              />
            </div>

            <!-- Note (optional) -->
            <div class="col-12 col-md-4">
              <label for="sl-note" class="form-label fw-semibold small">Note</label>
              <input
                id="sl-note"
                v-model="formNote"
                type="text"
                class="form-control"
                placeholder="Optional description"
                aria-label="Note (optional)"
              />
            </div>
          </div>

          <div class="mt-3">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="creating || !formUrl.trim()"
              aria-label="Create short link"
            >
              <span
                v-if="creating"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ creating ? 'Creating…' : 'Create Link' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Global alerts -->
    <div v-if="fetchError" class="alert alert-danger" role="alert">{{ fetchError }}</div>
    <div v-if="deleteError" class="alert alert-danger" role="alert">{{ deleteError }}</div>

    <!-- Loading skeleton -->
    <div v-if="loading && links.length === 0" class="text-center py-5">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading short links…</span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!loading && !fetchError && links.length === 0"
      class="text-center py-5 text-body-secondary"
    >
      <p class="mb-0">No short links yet. Create one above.</p>
    </div>

    <!-- Links table -->
    <div v-else-if="links.length > 0" class="table-responsive">
      <table class="table table-hover align-middle" aria-label="Short links list">
        <thead class="table-light">
          <tr>
            <th scope="col">Short Code</th>
            <th scope="col">Redirect URL</th>
            <th scope="col">Note</th>
            <th scope="col" class="text-end">Clicks</th>
            <th scope="col">Created</th>
            <th scope="col" class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in links" :key="link.code">
            <!-- Short code + redirect link -->
            <td>
              <a
                :href="REDIRECT_PREFIX + link.code"
                target="_blank"
                rel="noopener"
                class="font-monospace fw-semibold text-decoration-none"
                :aria-label="`Open short link ${link.code}`"
              >
                {{ link.code }}
              </a>
            </td>

            <!-- Destination URL truncated -->
            <td>
              <a
                :href="link.url"
                target="_blank"
                rel="noopener"
                class="text-body-secondary text-decoration-none small"
                :title="link.url"
                :aria-label="`Destination URL: ${link.url}`"
              >
                {{ truncate(link.url, 50) }}
              </a>
            </td>

            <!-- Note -->
            <td class="text-body-secondary small">
              {{ link.note || '—' }}
            </td>

            <!-- Clicks -->
            <td class="text-end">
              <span class="badge bg-secondary-subtle text-secondary border">
                {{ link.clicks }}
              </span>
            </td>

            <!-- Created -->
            <td class="text-body-secondary small">{{ formatDate(link.createdAt) }}</td>

            <!-- Delete action -->
            <td class="text-end">
              <button
                class="btn btn-sm btn-outline-danger"
                type="button"
                :aria-label="`Delete short link ${link.code}`"
                @click="requestDelete(link.code)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm delete modal -->
    <ConfirmModal
      id="confirm-delete-shortlink"
      title="Delete Short Link"
      :message="`Delete '${pendingDeleteCode}'? This cannot be undone. All click data for this link will be lost.`"
      confirm-label="Delete"
      :danger="true"
      @confirm="pendingDeleteCode !== null && deleteLink(pendingDeleteCode)"
    />
  </div>
</template>
