import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Bootstrap 5 CSS + JS bundle (includes Popper)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.config.errorHandler = (err) => { console.error('[Vue]', err) }

// Seed auth session from refresh token before mounting (prevents login flash)
const { useAuthStore } = await import('@/stores/auth')
const auth = useAuthStore()
await auth.refreshToken()

// Fetch profile data from API (falls back to static data if unavailable)
const { useProfileStore } = await import('@/stores/profile')
const profileStore = useProfileStore()
await profileStore.fetchProfile()

app.mount('#app')
