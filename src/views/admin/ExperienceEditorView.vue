<script setup lang="ts">
import { ref, reactive } from 'vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import type { Experience } from '@/types/index'

const profileStore = useProfileStore()
const auth = useAuthStore()

const experience = reactive<Experience[]>(
  JSON.parse(JSON.stringify(profileStore.data.experience)) as Experience[]
)

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)
const editingIndex = ref<number | null>(null)
const deletingIndex = ref<number | null>(null)

const blank = (): Experience => ({
  company: '',
  role: '',
  period: '',
  description: '',
  type: 'work',
})

const editForm = reactive<Experience>(blank())

function startAdd(): void {
  Object.assign(editForm, blank())
  editingIndex.value = -1
}

function startEdit(index: number): void {
  Object.assign(editForm, JSON.parse(JSON.stringify(experience[index])) as Experience)
  editingIndex.value = index
}

function cancelEdit(): void {
  editingIndex.value = null
}

function saveEdit(): void {
  if (editingIndex.value === -1) {
    experience.push({ ...editForm })
  } else if (editingIndex.value !== null) {
    Object.assign(experience[editingIndex.value], { ...editForm })
  }
  editingIndex.value = null
}

function requestDelete(index: number): void {
  deletingIndex.value = index
  import('bootstrap').then(({ Modal }) => {
    const el = document.getElementById('confirm-delete-exp')
    if (el) Modal.getOrCreateInstance(el).show()
  })
}

function confirmDelete(): void {
  if (deletingIndex.value !== null) {
    experience.splice(deletingIndex.value, 1)
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
    await profileStore.saveProfile(token, { experience: JSON.parse(JSON.stringify(experience)) as Experience[] })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Save failed.'
  } finally {
    saving.value = false
  }
}

function getBadgeVariant(type: 'work' | 'education'): string {
  return type === 'work'
    ? 'bg-primary-subtle text-primary border border-primary-subtle'
    : 'bg-success-subtle text-success border border-success-subtle'
}
</script>

<template>
  <div class="p-4">
    <header class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h1 class="h3 fw-bold mb-1">Experience</h1>
        <p class="text-body-secondary mb-0">Add and manage your work and education history.</p>
      </div>
      <button class="btn btn-primary" type="button" aria-label="Add new experience entry" @click="startAdd">
        + Add Entry
      </button>
    </header>

    <div v-if="saved" class="alert alert-success" role="alert">Experience saved successfully.</div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <!-- Inline editor -->
    <div v-if="editingIndex !== null" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h2 class="h5 fw-bold mb-4">{{ editingIndex === -1 ? 'New Entry' : 'Edit Entry' }}</h2>

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label for="exp-role" class="form-label fw-semibold">Role / Position</label>
            <input id="exp-role" v-model="editForm.role" type="text" class="form-control" required aria-label="Job role or position" />
          </div>
          <div class="col-12 col-md-6">
            <label for="exp-company" class="form-label fw-semibold">Company / Institution</label>
            <input id="exp-company" v-model="editForm.company" type="text" class="form-control" required aria-label="Company or institution name" />
          </div>
          <div class="col-12 col-md-6">
            <label for="exp-period" class="form-label fw-semibold">Period</label>
            <input id="exp-period" v-model="editForm.period" type="text" class="form-control" placeholder="Jan 2023 – Present" aria-label="Employment period" />
          </div>
          <div class="col-12 col-md-6">
            <label for="exp-type" class="form-label fw-semibold">Type</label>
            <select id="exp-type" v-model="editForm.type" class="form-select" aria-label="Experience type: work or education">
              <option value="work">Work</option>
              <option value="education">Education</option>
            </select>
          </div>
          <div class="col-12">
            <label for="exp-desc" class="form-label fw-semibold">Description</label>
            <textarea id="exp-desc" v-model="editForm.description" class="form-control" rows="3" aria-label="Experience description"></textarea>
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-primary" type="button" aria-label="Save experience entry" @click="saveEdit">Save</button>
          <button class="btn btn-outline-secondary" type="button" aria-label="Cancel editing" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Timeline list -->
    <div class="experience-timeline mb-4" role="list" aria-label="Experience timeline">
      <article
        v-for="(item, index) in experience"
        :key="index"
        class="d-flex gap-4 mb-4"
        role="listitem"
      >
        <!-- Timeline indicator -->
        <div class="d-flex flex-column align-items-center flex-shrink-0" style="padding-top: 1.25rem;">
          <div
            class="rounded-circle"
            :class="item.type === 'work' ? 'bg-primary' : 'bg-success'"
            style="width: 14px; height: 14px; flex-shrink: 0; border: 2px solid var(--bs-body-bg); box-shadow: 0 0 0 2px currentColor;"
          ></div>
          <div
            v-if="index < experience.length - 1"
            class="flex-grow-1 bg-secondary-subtle"
            style="width: 2px; margin-top: 4px; min-height: 2rem;"
          ></div>
        </div>

        <!-- Card -->
        <div class="card border-0 shadow-sm flex-grow-1 mb-2">
          <div class="card-body p-4">
            <div class="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
              <div>
                <h2 class="h6 fw-bold mb-1">{{ item.role }}</h2>
                <p class="text-body-secondary mb-0 small fw-semibold">{{ item.company }}</p>
              </div>
              <div class="d-flex flex-wrap gap-2 align-items-center">
                <span class="badge rounded-pill" :class="getBadgeVariant(item.type)">
                  {{ item.type === 'work' ? 'Work' : 'Education' }}
                </span>
                <span class="badge bg-body-secondary text-body border rounded-pill small">{{ item.period }}</span>
              </div>
            </div>
            <p class="text-body-secondary small mb-3 lh-lg">{{ item.description }}</p>
            <div class="d-flex gap-2">
              <button
                class="btn btn-sm btn-outline-primary"
                type="button"
                :aria-label="`Edit ${item.role} at ${item.company}`"
                @click="startEdit(index)"
              >
                Edit
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                type="button"
                :aria-label="`Delete ${item.role} at ${item.company}`"
                @click="requestDelete(index)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-if="experience.length === 0 && editingIndex === null" class="text-center py-5 text-body-secondary">
      <p class="mb-3">No experience entries yet.</p>
      <button class="btn btn-primary" type="button" aria-label="Add first experience entry" @click="startAdd">Add First Entry</button>
    </div>

    <button
      class="btn btn-primary px-4"
      type="button"
      :disabled="saving"
      aria-label="Save experience changes"
      @click="save"
    >
      <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ saving ? 'Saving...' : 'Save Changes' }}
    </button>

    <ConfirmModal
      id="confirm-delete-exp"
      title="Delete Entry"
      :message="`Delete '${deletingIndex !== null ? experience[deletingIndex]?.role : ''}' at '${deletingIndex !== null ? experience[deletingIndex]?.company : ''}'?`"
      confirm-label="Delete"
      @confirm="confirmDelete"
    />
  </div>
</template>
