<script setup lang="ts">
import { ref, reactive } from 'vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import type { SocialLink } from '@/types/index'

const profileStore = useProfileStore()
const auth = useAuthStore()

const links = reactive<SocialLink[]>(
  JSON.parse(JSON.stringify(profileStore.data.socialLinks)) as SocialLink[]
)

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)
const editingIndex = ref<number | null>(null)
const deletingIndex = ref<number | null>(null)

const blank = (): SocialLink => ({
  label: '',
  url: '',
  icon: 'github',
  desc: '',
})

const editForm = reactive<SocialLink>(blank())

function startAdd(): void {
  Object.assign(editForm, blank())
  editingIndex.value = -1
}

function startEdit(index: number): void {
  Object.assign(editForm, JSON.parse(JSON.stringify(links[index])) as SocialLink)
  editingIndex.value = index
}

function cancelEdit(): void {
  editingIndex.value = null
}

function saveEdit(): void {
  if (editingIndex.value === -1) {
    links.push({ ...editForm })
  } else if (editingIndex.value !== null) {
    Object.assign(links[editingIndex.value], { ...editForm })
  }
  editingIndex.value = null
}

function requestDelete(index: number): void {
  deletingIndex.value = index
  import('bootstrap').then(({ Modal }) => {
    const el = document.getElementById('confirm-delete-social')
    if (el) Modal.getOrCreateInstance(el).show()
  })
}

function confirmDelete(): void {
  if (deletingIndex.value !== null) {
    links.splice(deletingIndex.value, 1)
    deletingIndex.value = null
  }
}

async function save(): Promise<void> {
  saving.value = true
  saved.value = false
  error.value = null

  const token = auth.getAccessToken()
  if (!token) { error.value = 'Not authenticated.'; saving.value = false; return }

  try {
    await profileStore.saveProfile(token, { socialLinks: JSON.parse(JSON.stringify(links)) as SocialLink[] })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Save failed.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <header class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h1 class="h3 fw-bold mb-1">Social Links</h1>
        <p class="text-body-secondary mb-0">Manage social media links shown on the portfolio.</p>
      </div>
      <button class="btn btn-primary" type="button" aria-label="Add new social link" @click="startAdd">
        + Add Link
      </button>
    </header>

    <div v-if="saved" class="alert alert-success" role="alert">Social links saved successfully.</div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <!-- Inline editor -->
    <div v-if="editingIndex !== null" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h2 class="h5 fw-bold mb-4">{{ editingIndex === -1 ? 'New Link' : 'Edit Link' }}</h2>

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label for="social-label" class="form-label fw-semibold">Label</label>
            <input id="social-label" v-model="editForm.label" type="text" class="form-control" required aria-label="Social platform label" placeholder="GitHub" />
          </div>
          <div class="col-12 col-md-6">
            <label for="social-icon" class="form-label fw-semibold">Icon Key</label>
            <input id="social-icon" v-model="editForm.icon" type="text" class="form-control" aria-label="Icon key matching ICONS record" placeholder="github, linkedin, twitter..." />
            <p class="text-body-tertiary small mt-1 mb-0">Must match an icon key in SocialLinksSection.vue</p>
          </div>
          <div class="col-12">
            <label for="social-url" class="form-label fw-semibold">URL</label>
            <input id="social-url" v-model="editForm.url" type="url" class="form-control" required aria-label="Social profile URL" placeholder="https://..." />
          </div>
          <div class="col-12">
            <label for="social-desc" class="form-label fw-semibold">Description</label>
            <input id="social-desc" v-model="editForm.desc" type="text" class="form-control" aria-label="Social link description" placeholder="Short description shown on card" />
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-primary" type="button" aria-label="Save social link" @click="saveEdit">Save</button>
          <button class="btn btn-outline-secondary" type="button" aria-label="Cancel editing" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Links list -->
    <div class="list-group mb-4">
      <div
        v-for="(link, index) in links"
        :key="index"
        class="list-group-item border-0 shadow-sm mb-2 rounded"
      >
        <div class="d-flex align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
            <span
              class="badge bg-secondary-subtle text-secondary border rounded"
              :title="`Icon key: ${link.icon}`"
            >
              {{ link.icon }}
            </span>
            <div class="min-w-0">
              <p class="fw-semibold mb-0 small">{{ link.label }}</p>
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-body-secondary small text-truncate d-block"
                :aria-label="`Open ${link.label} profile (opens in new tab)`"
              >
                {{ link.url }}
              </a>
            </div>
          </div>

          <div class="d-flex gap-2 flex-shrink-0">
            <button
              class="btn btn-sm btn-outline-primary"
              type="button"
              :aria-label="`Edit ${link.label}`"
              @click="startEdit(index)"
            >
              Edit
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              type="button"
              :aria-label="`Delete ${link.label}`"
              @click="requestDelete(index)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="links.length === 0 && editingIndex === null" class="text-center py-5 text-body-secondary">
      <p class="mb-3">No social links yet.</p>
      <button class="btn btn-primary" type="button" aria-label="Add first social link" @click="startAdd">Add First Link</button>
    </div>

    <button
      class="btn btn-primary px-4"
      type="button"
      :disabled="saving"
      aria-label="Save social links"
      @click="save"
    >
      <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ saving ? 'Saving...' : 'Save Changes' }}
    </button>

    <ConfirmModal
      id="confirm-delete-social"
      title="Delete Link"
      :message="`Delete '${deletingIndex !== null ? links[deletingIndex]?.label : ''}'?`"
      confirm-label="Delete"
      @confirm="confirmDelete"
    />
  </div>
</template>
