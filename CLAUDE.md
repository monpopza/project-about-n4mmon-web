# CLAUDE.md — Personal Webpage (Bun + Vue 3 + Bootstrap 5)

## Project Purpose
Build a personal portfolio/profile webpage that presents who I am — skills, projects, experience, and contact — using Vue 3 (Composition API), Bootstrap 5, and Bun as the runtime and package manager.

## Stack
- **Runtime & Package Manager:** Bun (NOT npm, NOT yarn, NOT pnpm)
- **Framework:** Vue 3 with Composition API (`<script setup>`)
- **UI Library:** Bootstrap 5 (CSS + JS via CDN or installed package)
- **Build Tool:** Vite (via `bun create vite`)
- **Language:** TypeScript preferred; JavaScript acceptable
- **Styling:** Bootstrap utility classes first; scoped `<style>` for custom overrides only

## Commands
```bash
# Install dependencies
bun install

# Dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Type check
bun run type-check
```
IMPORTANT: Always use `bun` not `npm` or `npx`. If a command fails, check bun compatibility before switching runtimes.

## Project Structure
```
my-portfolio/
├── CLAUDE.md
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── assets/           ← static images, resume PDF
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── data/
│   │   └── profile.ts    ← ALL personal data lives here (single source of truth)
│   ├── components/
│   │   ├── NavBar.vue
│   │   ├── HeroSection.vue
│   │   ├── AboutSection.vue
│   │   ├── SkillsSection.vue
│   │   ├── ProjectsSection.vue
│   │   ├── ExperienceSection.vue
│   │   └── ContactSection.vue
│   └── types/
│       └── index.ts      ← shared TypeScript interfaces
```

## Page Sections (Build in This Order)
1. **NavBar** — sticky top, smooth scroll links, mobile hamburger (Bootstrap navbar)
2. **Hero** — name, title, one-liner tagline, CTA buttons (View Work / Contact Me)
3. **About** — photo + bio paragraph, personality, what I do
4. **Skills** — grouped by category (Frontend / Backend / Tools), Bootstrap badges or progress bars
5. **Projects** — Bootstrap card grid, each with: title, description, tech tags, GitHub + Live links
6. **Experience** — timeline or accordion (jobs / education), Bootstrap list-group or accordion component
7. **Contact** — email link, social icons (LinkedIn, GitHub, Twitter), optional contact form

## Data Architecture
All personal content MUST be stored in `src/data/profile.ts`, not hardcoded in templates.

```typescript
// src/data/profile.ts — structure to follow
export const profile = {
  name: "Your Name",
  title: "Your Job Title",
  tagline: "One sentence about what you do.",
  bio: "Paragraph about yourself...",
  avatar: "/assets/avatar.jpg",
  resume: "/assets/resume.pdf",
  email: "you@example.com",
  social: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: "https://twitter.com/yourusername",
  },
  skills: [
    { category: "Frontend", items: ["Vue.js", "TypeScript", "Bootstrap"] },
    { category: "Backend", items: ["Node.js", "Python", "PostgreSQL"] },
    { category: "Tools", items: ["Git", "Docker", "Bun"] },
  ],
  projects: [
    {
      title: "Project Name",
      description: "What it does and why it matters.",
      tech: ["Vue", "Bun", "PostgreSQL"],
      github: "https://github.com/...",
      live: "https://...",
      featured: true,
    },
  ],
  experience: [
    {
      company: "Company Name",
      role: "Job Title",
      period: "Jan 2023 – Present",
      description: "What you did and achieved.",
      type: "work", // "work" | "education"
    },
  ],
}
```

## Code Style Rules
- Use `<script setup lang="ts">` for all Vue components — no Options API
- Use `defineProps<{}>()` for typed props — no runtime prop validators
- Bootstrap utility classes first; only add `<style scoped>` when Bootstrap can't solve it
- No inline styles (`style=""`) — use Bootstrap classes or CSS variables
- Components are single responsibility — one section per file
- Import profile data from `src/data/profile.ts` — never hardcode content in templates

## Design Directives
- Color theme: define CSS variables in `src/main.ts` or `App.vue` so the palette is changeable in one place
- Mobile-first: every section must work on 375px width — test with Bootstrap `col-` grid breakpoints
- Smooth scroll: `scroll-behavior: smooth` on the `html` element
- Dark/light mode toggle is optional but encouraged — use Bootstrap `data-bs-theme="dark"`
- Animations: CSS transitions only — `transition`, `opacity`, `transform`. No heavy animation libraries.
- Accessible: use semantic HTML (`<section>`, `<nav>`, `<main>`, `<footer>`), add `aria-label` on icon-only buttons

## What NOT to Do
- Do NOT use Options API (`export default { data() {} }`)
- Do NOT hardcode personal info inside component templates
- Do NOT install Tailwind — Bootstrap only for this project
- Do NOT use `npm` or `yarn` — Bun only
- Do NOT create unnecessary abstractions for a single-page site
- Do NOT add a backend or API — this is a purely static site

## Build & Deploy
Target: static site deployable to Netlify, Vercel, or GitHub Pages.
```bash
bun run build
# Output: dist/ folder — deploy this directory
```
If deploying to a subdirectory (e.g. GitHub Pages `username.github.io/repo`), set `base` in `vite.config.ts`:
```typescript
export default defineConfig({ base: '/repo-name/' })
```

## Reference Docs
- Bootstrap 5: https://getbootstrap.com/docs/5.3/
- Vue 3 Composition API: https://vuejs.org/guide/extras/composition-api-faq
- Vite config: https://vitejs.dev/config/
- Bun docs: https://bun.sh/docs
