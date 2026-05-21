import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AuthGate from '@/components/admin/AuthGate.vue'

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    user: null,
    authLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    getAccessToken: () => null,
  }),
}))

describe('AuthGate', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders sign in button', () => {
    const wrapper = mount(AuthGate)
    const button = wrapper.find('button[aria-label="Sign in with Authentik SSO"]')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Sign in with Authentik')
  })

  it('calls auth.login when sign in button is clicked', async () => {
    const { useAuthStore } = await import('@/stores/auth')
    const auth = useAuthStore()
    const loginSpy = vi.spyOn(auth, 'login')

    const wrapper = mount(AuthGate)
    const button = wrapper.find('button[aria-label="Sign in with Authentik SSO"]')
    await button.trigger('click')

    expect(loginSpy).toHaveBeenCalled()
  })

  it('has accessible heading and description', () => {
    const wrapper = mount(AuthGate)
    expect(wrapper.find('h1').text()).toContain('Admin Access')
    expect(wrapper.text()).toContain('Sign in with your Authentik account')
  })
})
