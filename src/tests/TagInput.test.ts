import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TagInput from '@/components/admin/TagInput.vue'

describe('TagInput', () => {
  it('renders existing tags from modelValue', () => {
    const wrapper = mount(TagInput, {
      props: { modelValue: ['Vue', 'TypeScript'], id: 'tags', label: 'Tags' },
    })
    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.text()).toContain('TypeScript')
  })

  it('emits update:modelValue when Enter is pressed with new tag', async () => {
    const wrapper = mount(TagInput, {
      props: { modelValue: [], id: 'tags', label: 'Tags' },
    })
    const input = wrapper.find('input')
    await input.setValue('React')
    await input.trigger('keydown', { key: 'Enter' })
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect((emitted as unknown[][])[0][0]).toEqual(['React'])
  })

  it('emits update:modelValue when comma is pressed', async () => {
    const wrapper = mount(TagInput, {
      props: { modelValue: [], id: 'tags', label: 'Tags' },
    })
    const input = wrapper.find('input')
    await input.setValue('Bun,')
    await input.trigger('keydown', { key: ',' })
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
  })

  it('does not add duplicate tags', async () => {
    const wrapper = mount(TagInput, {
      props: { modelValue: ['Vue'], id: 'tags', label: 'Tags' },
    })
    const input = wrapper.find('input')
    await input.setValue('Vue')
    await input.trigger('keydown', { key: 'Enter' })
    const emitted = wrapper.emitted('update:modelValue')
    // Should not emit — duplicate rejected silently
    expect(emitted).toBeFalsy()
  })

  it('removes a tag when its close button is clicked', async () => {
    const wrapper = mount(TagInput, {
      props: { modelValue: ['Vue', 'React'], id: 'tags', label: 'Tags' },
    })
    const closeButtons = wrapper.findAll('button.btn-close')
    expect(closeButtons.length).toBe(2)
    await closeButtons[0].trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect((emitted as unknown[][])[0][0]).toEqual(['React'])
  })

  it('removes last tag on Backspace when input is empty', async () => {
    const wrapper = mount(TagInput, {
      props: { modelValue: ['Vue', 'React'], id: 'tags', label: 'Tags' },
    })
    const input = wrapper.find('input')
    await input.trigger('keydown', { key: 'Backspace' })
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect((emitted as unknown[][])[0][0]).toEqual(['Vue'])
  })
})
