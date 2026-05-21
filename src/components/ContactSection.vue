<script setup lang="ts">
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const profile = profileStore.data

const socialLinks = [
  {
    label: 'GitHub',
    href: profile.social.github,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>`,
  },
  {
    label: 'LinkedIn',
    href: profile.social.linkedin,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/></svg>`,
  },
  {
    label: 'Twitter / X',
    href: profile.social.twitter,
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>`,
  },
]
</script>

<template>
  <section id="contact" class="py-5" aria-labelledby="contact-heading">
    <div class="container py-4">
      <div class="row justify-content-center mb-5">
        <div class="col-12 col-md-8 text-center">
          <h2 id="contact-heading" class="fw-bold mb-2">Get In Touch</h2>
          <p class="text-body-secondary mb-0">
            Have a project in mind or just want to say hello? My inbox is open.
          </p>
        </div>
      </div>

      <div class="row justify-content-center g-4">
        <!-- Direct contact card -->
        <div class="col-12 col-md-8 col-lg-6">
          <div class="card border-0 shadow-sm text-center p-4 contact-card">
            <div class="card-body">
              <div class="contact-icon-wrap mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="text-primary" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
                </svg>
              </div>

              <h3 class="h5 fw-semibold mb-2">Send an Email</h3>
              <p class="text-body-secondary mb-4">
                The fastest way to reach me. I typically respond within 24 hours.
              </p>

              <a
                :href="'mailto:' + profile.email"
                class="btn btn-primary btn-lg px-5"
                :aria-label="'Send email to ' + profile.email"
              >
                {{ profile.email }}
              </a>
            </div>
          </div>
        </div>

        <!-- Social links -->
        <div class="col-12 col-md-8 col-lg-4">
          <div class="card border-0 shadow-sm h-100 p-4 contact-card">
            <div class="card-body">
              <h3 class="h5 fw-semibold mb-4 text-center">Find Me Online</h3>

              <nav aria-label="Social media links">
                <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
                  <li v-for="link in socialLinks" :key="link.label">
                    <a
                      :href="link.href"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="d-flex align-items-center gap-3 text-decoration-none text-body social-link rounded p-2"
                      :aria-label="link.label + ' profile (opens in new tab)'"
                    >
                      <span class="social-icon text-primary" v-html="link.icon"></span>
                      <span class="fw-semibold">{{ link.label }}</span>
                      <span class="ms-auto text-body-tertiary small">&#8599;</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-card {
  background-color: var(--bs-body-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
}

.contact-icon-wrap {
  width: 64px;
  height: 64px;
  background-color: var(--bs-primary-bg-subtle);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-link {
  transition: background-color 0.15s ease, color 0.15s ease;
}

.social-link:hover {
  background-color: var(--bs-tertiary-bg);
}

.social-icon {
  flex-shrink: 0;
}
</style>
