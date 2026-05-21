<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'

const profileStore = useProfileStore()
const auth = useAuthStore()

const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)

// Local editable copy of scalar fields
const form = reactive({
  name: profileStore.data.name,
  title: profileStore.data.title,
  tagline: profileStore.data.tagline,
  bio: profileStore.data.bio,
  avatar: profileStore.data.avatar,
  resume: profileStore.data.resume,
  email: profileStore.data.email,
  github: profileStore.data.social.github,
  linkedin: profileStore.data.social.linkedin,
  twitter: profileStore.data.social.twitter,
})

const avatarPreview = ref(profileStore.data.avatar)

function onAvatarInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
    form.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function save(): Promise<void> {
  saving.value = true
  saved.value = false
  error.value = null

  const token = auth.getAccessToken()
  if (!token) {
    error.value = 'Not authenticated — please sign in again.'
    saving.value = false
    return
  }

  try {
    await profileStore.saveProfile(token, {
      name: form.name,
      title: form.title,
      tagline: form.tagline,
      bio: form.bio,
      avatar: form.avatar,
      resume: form.resume,
      email: form.email,
      social: {
        github: form.github,
        linkedin: form.linkedin,
        twitter: form.twitter,
      },
    })
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
  <div class="p-4" style="max-width: 720px;">
    <header class="mb-4">
      <h1 class="h3 fw-bold mb-1">Edit Profile</h1>
      <p class="text-body-secondary mb-0">Update your personal information and contact details.</p>
    </header>

    <div v-if="saved" class="alert alert-success" role="alert">
      Profile saved successfully.
    </div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <form @submit.prevent="save" novalidate>
      <!-- Avatar preview + upload -->
      <div class="mb-4 d-flex align-items-center gap-4">
        <img
          :src="avatarPreview"
          :alt="form.name + ' avatar preview'"
          class="rounded-circle border"
          width="80"
          height="80"
          style="object-fit: cover;"
        />
        <div>
          <label for="avatar-upload" class="form-label fw-semibold mb-1">
            Profile Picture
          </label>
          <input
            id="avatar-upload"
            type="file"
            class="form-control form-control-sm"
            accept="image/*"
            aria-label="Upload profile picture"
            @change="onAvatarInput"
          />
          <p class="text-body-tertiary small mt-1 mb-0">JPG, PNG, SVG. Preview only — URL stored.</p>
        </div>
      </div>

      <!-- Avatar URL (manual) -->
      <div class="mb-3">
        <label for="avatar-url" class="form-label fw-semibold">Avatar URL</label>
        <input
          id="avatar-url"
          v-model="form.avatar"
          type="text"
          class="form-control"
          placeholder="/assets/avatar.svg"
          aria-label="Avatar URL"
        />
      </div>

      <!-- Name -->
      <div class="mb-3">
        <label for="profile-name" class="form-label fw-semibold">Full Name</label>
        <input
          id="profile-name"
          v-model="form.name"
          type="text"
          class="form-control"
          required
          aria-required="true"
          placeholder="Your Name"
          aria-label="Full name"
        />
      </div>

      <!-- Title -->
      <div class="mb-3">
        <label for="profile-title" class="form-label fw-semibold">Job Title</label>
        <input
          id="profile-title"
          v-model="form.title"
          type="text"
          class="form-control"
          required
          aria-required="true"
          placeholder="Full-Stack Developer & AI Engineer"
          aria-label="Job title"
        />
      </div>

      <!-- Tagline -->
      <div class="mb-3">
        <label for="profile-tagline" class="form-label fw-semibold">Tagline</label>
        <input
          id="profile-tagline"
          v-model="form.tagline"
          type="text"
          class="form-control"
          placeholder="One sentence about what you do."
          aria-label="Tagline"
        />
      </div>

      <!-- Bio -->
      <div class="mb-3">
        <label for="profile-bio" class="form-label fw-semibold">Bio</label>
        <textarea
          id="profile-bio"
          v-model="form.bio"
          class="form-control"
          rows="5"
          placeholder="A paragraph about yourself..."
          aria-label="Biography"
        ></textarea>
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label for="profile-email" class="form-label fw-semibold">Email</label>
        <input
          id="profile-email"
          v-model="form.email"
          type="email"
          class="form-control"
          placeholder="hello@example.com"
          aria-label="Email address"
        />
      </div>

      <!-- Resume -->
      <div class="mb-3">
        <label for="profile-resume" class="form-label fw-semibold">Resume URL</label>
        <input
          id="profile-resume"
          v-model="form.resume"
          type="text"
          class="form-control"
          placeholder="/assets/resume.pdf"
          aria-label="Resume URL"
        />
      </div>

      <hr class="my-4" />
      <h2 class="h5 fw-bold mb-3">Social Links</h2>

      <!-- GitHub -->
      <div class="mb-3">
        <label for="social-github" class="form-label fw-semibold">GitHub URL</label>
        <input
          id="social-github"
          v-model="form.github"
          type="url"
          class="form-control"
          placeholder="https://github.com/username"
          aria-label="GitHub profile URL"
        />
      </div>

      <!-- LinkedIn -->
      <div class="mb-3">
        <label for="social-linkedin" class="form-label fw-semibold">LinkedIn URL</label>
        <input
          id="social-linkedin"
          v-model="form.linkedin"
          type="url"
          class="form-control"
          placeholder="https://linkedin.com/in/username"
          aria-label="LinkedIn profile URL"
        />
      </div>

      <!-- Twitter -->
      <div class="mb-3">
        <label for="social-twitter" class="form-label fw-semibold">Twitter / X URL</label>
        <input
          id="social-twitter"
          v-model="form.twitter"
          type="url"
          class="form-control"
          placeholder="https://twitter.com/username"
          aria-label="Twitter profile URL"
        />
      </div>

      <div class="d-flex gap-3 mt-4">
        <button
          type="submit"
          class="btn btn-primary px-4"
          :disabled="saving"
          aria-label="Save profile changes"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
