<script setup lang="ts">
import { ref, reactive } from 'vue'
import TagInput from '@/components/admin/TagInput.vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import type { Project } from '@/types/index'

const profileStore = useProfileStore()
const auth = useAuthStore()

const projects = reactive<Project[]>(
  JSON.parse(JSON.stringify(profileStore.data.projects)) as Project[]
)

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)
const editingIndex = ref<number | null>(null)
const deletingIndex = ref<number | null>(null)

const blank = (): Project => ({
  title: '',
  description: '',
  tech: [],
  github: '',
  live: '',
  featured: false,
})

const editForm = reactive<Project>(blank())

function startAdd(): void {
  Object.assign(editForm, blank())
  editingIndex.value = -1
}

function startEdit(index: number): void {
  Object.assign(editForm, JSON.parse(JSON.stringify(projects[index])) as Project)
  editingIndex.value = index
}

function cancelEdit(): void {
  editingIndex.value = null
}

function saveEdit(): void {
  if (editingIndex.value === -1) {
    projects.push({ ...editForm, tech: [...editForm.tech] })
  } else if (editingIndex.value !== null) {
    Object.assign(projects[editingIndex.value], { ...editForm, tech: [...editForm.tech] })
  }
  editingIndex.value = null
}

function requestDelete(index: number): void {
  deletingIndex.value = index
  import('bootstrap').then(({ Modal }) => {
    const el = document.getElementById('confirm-delete-project')
    if (el) Modal.getOrCreateInstance(el).show()
  })
}

function confirmDelete(): void {
  if (deletingIndex.value !== null) {
    projects.splice(deletingIndex.value, 1)
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
    await profileStore.saveProfile(token, { projects: JSON.parse(JSON.stringify(projects)) as Project[] })
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
        <h1 class="h3 fw-bold mb-1">Projects</h1>
        <p class="text-body-secondary mb-0">Add, edit, and toggle visibility of projects.</p>
      </div>
      <button
        class="btn btn-primary"
        type="button"
        aria-label="Add new project"
        @click="startAdd"
      >
        + Add Project
      </button>
    </header>

    <div v-if="saved" class="alert alert-success" role="alert">Projects saved successfully.</div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <!-- Inline editor form -->
    <div v-if="editingIndex !== null" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h2 class="h5 fw-bold mb-4">{{ editingIndex === -1 ? 'New Project' : 'Edit Project' }}</h2>

        <div class="mb-3">
          <label for="proj-title" class="form-label fw-semibold">Title</label>
          <input id="proj-title" v-model="editForm.title" type="text" class="form-control" required aria-label="Project title" />
        </div>

        <div class="mb-3">
          <label for="proj-desc" class="form-label fw-semibold">Description</label>
          <textarea id="proj-desc" v-model="editForm.description" class="form-control" rows="3" aria-label="Project description"></textarea>
        </div>

        <div class="mb-3">
          <label for="proj-tech" class="form-label fw-semibold">Tech Stack</label>
          <TagInput id="proj-tech" v-model="editForm.tech" label="Technology stack tags" placeholder="Add tech and press Enter" />
        </div>

        <div class="mb-3">
          <label for="proj-github" class="form-label fw-semibold">GitHub URL</label>
          <input id="proj-github" v-model="editForm.github" type="url" class="form-control" aria-label="GitHub repository URL" />
        </div>

        <div class="mb-3">
          <label for="proj-live" class="form-label fw-semibold">Live URL</label>
          <input id="proj-live" v-model="editForm.live" type="url" class="form-control" placeholder="Leave empty if not deployed" aria-label="Live demo URL" />
        </div>

        <div class="mb-4">
          <div class="form-check">
            <input
              id="proj-featured"
              v-model="editForm.featured"
              type="checkbox"
              class="form-check-input"
              aria-label="Show this project in the featured section"
            />
            <label for="proj-featured" class="form-check-label fw-semibold">Featured (shown by default)</label>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="button" aria-label="Save project" @click="saveEdit">Save</button>
          <button class="btn btn-outline-secondary" type="button" aria-label="Cancel editing" @click="cancelEdit">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Projects grid -->
    <div class="row g-3 mb-4">
      <article
        v-for="(project, index) in projects"
        :key="index"
        class="col-12 col-md-6"
      >
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body p-4">
            <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
              <h2 class="h6 fw-bold card-title mb-0">{{ project.title }}</h2>
              <span
                v-if="project.featured"
                class="badge bg-primary-subtle text-primary border border-primary-subtle flex-shrink-0"
              >
                Featured
              </span>
            </div>

            <p class="text-body-secondary small mb-3 lh-lg">{{ project.description }}</p>

            <div class="d-flex flex-wrap gap-1 mb-3">
              <span
                v-for="tech in project.tech"
                :key="tech"
                class="badge text-bg-secondary rounded-pill small"
              >
                {{ tech }}
              </span>
            </div>

            <div class="d-flex gap-2 flex-wrap">
              <button
                class="btn btn-sm btn-outline-primary"
                type="button"
                :aria-label="`Edit ${project.title}`"
                @click="startEdit(index)"
              >
                Edit
              </button>
              <button
                class="btn btn-sm btn-outline-secondary"
                type="button"
                :aria-label="`Toggle featured status for ${project.title}`"
                @click="project.featured = !project.featured"
              >
                {{ project.featured ? 'Unfeature' : 'Feature' }}
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                type="button"
                :aria-label="`Delete ${project.title}`"
                @click="requestDelete(index)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-if="projects.length === 0 && editingIndex === null" class="text-center py-5 text-body-secondary">
      <p class="mb-3">No projects yet.</p>
      <button class="btn btn-primary" type="button" aria-label="Add first project" @click="startAdd">Add First Project</button>
    </div>

    <button
      class="btn btn-primary px-4"
      type="button"
      :disabled="saving"
      aria-label="Save all projects"
      @click="save"
    >
      <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ saving ? 'Saving...' : 'Save All Changes' }}
    </button>

    <ConfirmModal
      id="confirm-delete-project"
      title="Delete Project"
      :message="`Delete '${deletingIndex !== null ? projects[deletingIndex]?.title : ''}'?`"
      confirm-label="Delete"
      @confirm="confirmDelete"
    />
  </div>
</template>
