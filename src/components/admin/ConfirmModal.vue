<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

interface Props {
  id: string
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  message: 'Are you sure you want to proceed?',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: true,
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const modalEl = ref<HTMLElement | null>(null)
let bsModal: { hide: () => void } | null = null

onMounted(async () => {
  const el = document.getElementById(props.id)
  if (!el) return
  modalEl.value = el
  // Bootstrap Modal instance via global bootstrap object
  const { Modal } = await import('bootstrap')
  bsModal = new Modal(el)
})

onBeforeUnmount(() => {
  bsModal?.hide()
})

function onConfirm(): void {
  bsModal?.hide()
  emit('confirm')
}

function onCancel(): void {
  bsModal?.hide()
  emit('cancel')
}
</script>

<template>
  <div
    :id="id"
    class="modal fade"
    tabindex="-1"
    :aria-labelledby="`${id}-title`"
    aria-modal="true"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-0 pb-0">
          <h2 :id="`${id}-title`" class="modal-title h5 fw-bold">{{ title }}</h2>
          <button
            type="button"
            class="btn-close"
            aria-label="Close dialog"
            @click="onCancel"
          ></button>
        </div>

        <div class="modal-body pt-2">
          <p class="text-body-secondary mb-0">{{ message }}</p>
        </div>

        <div class="modal-footer border-0 pt-0">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :aria-label="cancelLabel"
            @click="onCancel"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            :class="['btn', danger ? 'btn-danger' : 'btn-primary']"
            :aria-label="confirmLabel"
            @click="onConfirm"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
