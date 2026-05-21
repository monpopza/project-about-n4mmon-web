<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import ConfirmModal from '@/components/admin/ConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

interface Post {
  id?: string
  title: string
  slug: string
  content: string
  excerpt: string
  published: boolean
  createdAt?: string
  updatedAt?: string
}

const posts = ref<Post[]>([])
const loading = ref(false)
const saving = ref(false)
const saved = ref(false)
const error = ref<string | null>(null)
const editingPost = ref<Post | null>(null)
const deletingId = ref<string | null>(null)
const previewTab = ref<'write' | 'preview'>('write')

const blank = (): Post => ({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  published: false,
})

async function fetchPosts(): Promise<void> {
  if (!API_BASE) return
  loading.value = true
  error.value = null
  const token = auth.getAccessToken()
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    posts.value = await res.json() as Post[]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

fetchPosts()

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function startAdd(): void {
  editingPost.value = blank()
  previewTab.value = 'write'
}

function startEdit(post: Post): void {
  editingPost.value = { ...post }
  previewTab.value = 'write'
}

function cancelEdit(): void {
  editingPost.value = null
}

function onTitleInput(): void {
  if (editingPost.value && !editingPost.value.id) {
    editingPost.value.slug = slugify(editingPost.value.title)
  }
}

// Simple markdown → HTML renderer (headings, bold, italic, lists, links, code)
const markdownPreview = computed<string>(() => {
  if (!editingPost.value?.content) return '<p class="text-body-secondary">Nothing to preview yet.</p>'
  let html = editingPost.value.content
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.slice(3, -3).replace(/^\w+\n/, '')
      return `<pre><code>${escapeHtml(code)}</code></pre>`
    })
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n+/g, '</p><p>')

  return `<p>${html}</p>`.replace(/<p>\s*(<h[1-3]>|<pre>|<ul>|<ol>)/g, '$1').replace(/(<\/h[1-3]>|<\/pre>|<\/ul>|<\/ol>)\s*<\/p>/g, '$1')
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function savePost(): Promise<void> {
  if (!editingPost.value) return
  saving.value = true
  saved.value = false
  error.value = null

  const token = auth.getAccessToken()
  if (!token) { error.value = 'Not authenticated.'; saving.value = false; return }

  const post = editingPost.value
  const isNew = !post.id

  try {
    if (!API_BASE) {
      // Offline mode: manage in local array
      if (isNew) {
        posts.value.push({ ...post, id: Date.now().toString() })
      } else {
        const idx = posts.value.findIndex((p) => p.id === post.id)
        if (idx >= 0) posts.value[idx] = { ...post }
      }
    } else {
      const url = isNew ? `${API_BASE}/posts` : `${API_BASE}/posts/${post.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(post),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const updated = await res.json() as Post
      if (isNew) {
        posts.value.push(updated)
      } else {
        const idx = posts.value.findIndex((p) => p.id === post.id)
        if (idx >= 0) posts.value[idx] = updated
      }
    }
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
    editingPost.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Save failed.'
  } finally {
    saving.value = false
  }
}

function requestDelete(post: Post): void {
  deletingId.value = post.id ?? null
  import('bootstrap').then(({ Modal }) => {
    const el = document.getElementById('confirm-delete-post')
    if (el) Modal.getOrCreateInstance(el).show()
  })
}

async function confirmDelete(): Promise<void> {
  if (!deletingId.value) return
  const token = auth.getAccessToken()
  if (!token) return

  try {
    if (API_BASE) {
      const res = await fetch(`${API_BASE}/posts/${deletingId.value}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    }
    posts.value = posts.value.filter((p) => p.id !== deletingId.value)
    deletingId.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Delete failed.'
  }
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="p-4">
    <header class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h1 class="h3 fw-bold mb-1">Blog Posts</h1>
        <p class="text-body-secondary mb-0">Write, edit, and publish blog posts with markdown.</p>
      </div>
      <button class="btn btn-primary" type="button" aria-label="Write new blog post" @click="startAdd">
        + New Post
      </button>
    </header>

    <div v-if="saved" class="alert alert-success" role="alert">Post saved successfully.</div>
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>

    <!-- Post editor -->
    <div v-if="editingPost" class="card border-0 shadow-sm mb-4">
      <div class="card-body p-4">
        <h2 class="h5 fw-bold mb-4">{{ editingPost.id ? 'Edit Post' : 'New Post' }}</h2>

        <div class="mb-3">
          <label for="post-title" class="form-label fw-semibold">Title</label>
          <input
            id="post-title"
            v-model="editingPost.title"
            type="text"
            class="form-control"
            required
            aria-label="Post title"
            @input="onTitleInput"
          />
        </div>

        <div class="mb-3">
          <label for="post-slug" class="form-label fw-semibold">Slug</label>
          <input
            id="post-slug"
            v-model="editingPost.slug"
            type="text"
            class="form-control"
            aria-label="Post URL slug"
          />
          <p class="text-body-tertiary small mt-1 mb-0">Auto-generated from title. URL: /posts/{{ editingPost.slug }}</p>
        </div>

        <div class="mb-3">
          <label for="post-excerpt" class="form-label fw-semibold">Excerpt</label>
          <textarea
            id="post-excerpt"
            v-model="editingPost.excerpt"
            class="form-control"
            rows="2"
            aria-label="Post excerpt for listing page"
            placeholder="Short summary shown in post listings..."
          ></textarea>
        </div>

        <!-- Write / Preview tabs -->
        <div class="mb-3">
          <label class="form-label fw-semibold d-block" id="content-label">Content (Markdown)</label>
          <ul class="nav nav-tabs mb-0" role="tablist" aria-label="Content editor tabs">
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: previewTab === 'write' }"
                type="button"
                role="tab"
                :aria-selected="previewTab === 'write'"
                aria-controls="content-write-panel"
                @click="previewTab = 'write'"
              >
                Write
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                class="nav-link"
                :class="{ active: previewTab === 'preview' }"
                type="button"
                role="tab"
                :aria-selected="previewTab === 'preview'"
                aria-controls="content-preview-panel"
                @click="previewTab = 'preview'"
              >
                Preview
              </button>
            </li>
          </ul>

          <div
            v-show="previewTab === 'write'"
            id="content-write-panel"
            role="tabpanel"
            aria-label="Markdown editor"
          >
            <textarea
              id="post-content"
              v-model="editingPost.content"
              class="form-control font-monospace"
              rows="16"
              aria-labelledby="content-label"
              placeholder="Write your post in Markdown..."
              style="border-top-left-radius: 0; border-top-right-radius: 0;"
            ></textarea>
          </div>

          <div
            v-show="previewTab === 'preview'"
            id="content-preview-panel"
            class="border rounded-bottom p-3 bg-body"
            role="tabpanel"
            aria-label="Markdown preview"
            style="min-height: 200px;"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="markdown-preview" v-html="markdownPreview"></div>
          </div>
        </div>

        <div class="mb-4">
          <div class="form-check">
            <input
              id="post-published"
              v-model="editingPost.published"
              type="checkbox"
              class="form-check-input"
              aria-label="Mark post as published"
            />
            <label for="post-published" class="form-check-label fw-semibold">Published</label>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button
            class="btn btn-primary"
            type="button"
            :disabled="saving"
            aria-label="Save blog post"
            @click="savePost"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ saving ? 'Saving...' : 'Save Post' }}
          </button>
          <button class="btn btn-outline-secondary" type="button" aria-label="Cancel editing post" @click="cancelEdit">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Posts table -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading posts...</span>
      </div>
    </div>

    <div v-else-if="posts.length > 0" class="table-responsive mb-4">
      <table class="table table-hover align-middle">
        <caption class="visually-hidden">Blog posts list</caption>
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Slug</th>
            <th scope="col">Status</th>
            <th scope="col">Date</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id">
            <td class="fw-semibold">{{ post.title }}</td>
            <td class="text-body-secondary small font-monospace">{{ post.slug }}</td>
            <td>
              <span
                class="badge rounded-pill"
                :class="post.published ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'"
              >
                {{ post.published ? 'Published' : 'Draft' }}
              </span>
            </td>
            <td class="text-body-secondary small">{{ formatDate(post.updatedAt ?? post.createdAt) }}</td>
            <td>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-sm btn-outline-primary"
                  type="button"
                  :aria-label="`Edit post: ${post.title}`"
                  @click="startEdit(post)"
                >
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  type="button"
                  :aria-label="`Delete post: ${post.title}`"
                  @click="requestDelete(post)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!editingPost" class="text-center py-5 text-body-secondary">
      <p class="mb-3">No posts yet.</p>
      <button class="btn btn-primary" type="button" aria-label="Write first blog post" @click="startAdd">Write First Post</button>
    </div>

    <ConfirmModal
      id="confirm-delete-post"
      title="Delete Post"
      :message="`Delete '${deletingId ? posts.find((p) => p.id === deletingId)?.title ?? 'this post' : ''}'? This cannot be undone.`"
      confirm-label="Delete"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3) {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.markdown-preview :deep(pre) {
  background-color: var(--bs-tertiary-bg);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
}

.markdown-preview :deep(code) {
  font-size: 0.875em;
  background-color: var(--bs-tertiary-bg);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

.markdown-preview :deep(pre) :deep(code) {
  background: none;
  padding: 0;
}

.markdown-preview :deep(a) {
  color: var(--bs-primary);
}

.markdown-preview :deep(li) {
  margin-bottom: 0.25rem;
}
</style>
