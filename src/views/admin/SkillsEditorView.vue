<script setup lang="ts">
import { ref, reactive } from 'vue'
import TagInput from '@/components/admin/TagInput.vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import type { SkillCategory } from '@/types/index'

const profileStore = useProfileStore()
const auth = useAuthStore()

// Deep-copy skills for local editing
const skills = reactive<SkillCategory[]>(
  JSON.parse(JSON.stringify(profileStore.data.skills)) as SkillCategory[]
)

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)
const deletingIndex = ref<number | null>(null)

function addCategory(): void {
  skills.push({ category: 'New Category', items: [] })
}

function removeCategory(index: number): void {
  deletingIndex.value = index
  // Show Bootstrap modal
  const el = document.getElementById('confirm-delete-skill')
  if (el) {
    import('bootstrap').then(({ Modal }) => {
      Modal.getOrCreateInstance(el).show()
    })
  }
}

function confirmDelete(): void {
  if (deletingIndex.value !== null) {
    skills.splice(deletingIndex.value, 1)
    deletingIndex.value = null
  }
}

async function save(): Promise<void> {
  saving.value = true
  saved.value = false
  error.value = null

  const token = auth.getAccessToken()
  if (!token) {
    error.value = 'Not authenticated.'
    saving.value = false
    return
  }

  try {
    await profileStore.saveProfile(token, { skills: JSON.parse(JSON.stringify(skills)) as SkillCategory[] })
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
        <h1 class="h3 fw-bold mb-1">Skills</h1>
        <p class="text-body-secondary mb-0">Manage skill categories and individual skills.</p>
      </div>
      <button
        class="btn btn-primary"
        type="button"
        aria-label="Add new skill category"
        @click="addCategory"
      >
        + Add Category
      </button>
    </header>

    <div v-if="saved" class="alert alert-success" role="alert">Skills saved successfully.</div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <div class="accordion mb-4" id="skills-accordion">
      <div
        v-for="(group, index) in skills"
        :key="index"
        class="accordion-item border mb-3 rounded"
      >
        <div class="accordion-header d-flex align-items-center px-3 py-2 gap-3">
          <button
            class="accordion-button collapsed flex-grow-1 bg-transparent border-0 p-0 text-start fw-semibold"
            type="button"
            :data-bs-toggle="'collapse'"
            :data-bs-target="`#skill-collapse-${index}`"
            :aria-expanded="false"
            :aria-controls="`skill-collapse-${index}`"
            :aria-label="`Toggle ${group.category} skill category`"
          >
            {{ group.category }}
            <span class="badge bg-secondary-subtle text-secondary border ms-2">
              {{ group.items.length }}
            </span>
          </button>
          <button
            class="btn btn-sm btn-outline-danger"
            type="button"
            :aria-label="`Delete ${group.category} category`"
            @click.stop="removeCategory(index)"
          >
            Delete
          </button>
        </div>

        <div
          :id="`skill-collapse-${index}`"
          class="accordion-collapse collapse"
          :data-bs-parent="'#skills-accordion'"
        >
          <div class="accordion-body pt-2">
            <!-- Category name -->
            <div class="mb-3">
              <label :for="`category-name-${index}`" class="form-label fw-semibold small">
                Category Name
              </label>
              <input
                :id="`category-name-${index}`"
                v-model="group.category"
                type="text"
                class="form-control form-control-sm"
                :aria-label="`Category name for group ${index + 1}`"
              />
            </div>

            <!-- Skills tag input -->
            <div class="mb-2">
              <label :for="`skill-tags-${index}`" class="form-label fw-semibold small">
                Skills (press Enter or comma to add)
              </label>
              <TagInput
                :id="`skill-tags-${index}`"
                v-model="group.items"
                :label="`Skills in ${group.category}`"
                placeholder="Add skill and press Enter"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="skills.length === 0" class="text-center py-5 text-body-secondary">
      <p class="mb-3">No skill categories yet.</p>
      <button
        class="btn btn-primary"
        type="button"
        aria-label="Add first skill category"
        @click="addCategory"
      >
        Add First Category
      </button>
    </div>

    <button
      class="btn btn-primary px-4"
      type="button"
      :disabled="saving"
      aria-label="Save skills changes"
      @click="save"
    >
      <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ saving ? 'Saving...' : 'Save Changes' }}
    </button>

    <ConfirmModal
      id="confirm-delete-skill"
      title="Delete Category"
      :message="`Delete '${deletingIndex !== null ? skills[deletingIndex]?.category : ''}' and all its skills?`"
      confirm-label="Delete"
      @confirm="confirmDelete"
    />
  </div>
</template>
