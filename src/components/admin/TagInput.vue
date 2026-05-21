<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string[]
  placeholder?: string
  id?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Add tag and press Enter',
  id: 'tag-input',
  label: 'Tags',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const inputValue = ref('')

function addTag(): void {
  const raw = inputValue.value.trim().replace(/,+$/, '')
  if (!raw) return
  const newTag = raw.trim()
  if (!newTag || props.modelValue.includes(newTag)) {
    inputValue.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, newTag])
  inputValue.value = ''
}

function removeTag(tag: string): void {
  emit('update:modelValue', props.modelValue.filter((t) => t !== tag))
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
  } else if (event.key === 'Backspace' && inputValue.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue[props.modelValue.length - 1])
  }
}
</script>

<template>
  <div class="tag-input-wrapper border rounded p-2 d-flex flex-wrap gap-2 align-items-center">
    <span
      v-for="tag in modelValue"
      :key="tag"
      class="badge bg-primary-subtle text-primary border border-primary-subtle d-inline-flex align-items-center gap-1"
    >
      {{ tag }}
      <button
        type="button"
        class="btn-close btn-close-sm ms-1"
        style="font-size: 0.6rem;"
        :aria-label="`Remove tag ${tag}`"
        @click="removeTag(tag)"
      ></button>
    </span>

    <input
      :id="id"
      v-model="inputValue"
      type="text"
      class="tag-input-field border-0 bg-transparent flex-grow-1"
      :placeholder="placeholder"
      :aria-label="label"
      style="outline: none; min-width: 120px;"
      @keydown="onKeydown"
      @blur="addTag"
    />
  </div>
</template>

<style scoped>
.tag-input-wrapper {
  background-color: var(--bs-body-bg);
  cursor: text;
  min-height: 42px;
}

.tag-input-wrapper:focus-within {
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.tag-input-field {
  font-size: 0.875rem;
}
</style>
