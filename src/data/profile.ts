// src/data/profile.ts — single source of truth for all personal data
// ─────────────────────────────────────────────────────────────────
// HOW TO POPULATE THIS FILE:
//   Search for every line containing "TODO: Replace" and fill in your real data.
//   Nothing else in the codebase needs to change — all components read from here.
// ─────────────────────────────────────────────────────────────────
import type { Profile } from '@/types/index'

export const profile: Profile = {
  // TODO: Replace with your real full name (displayed in NavBar brand + Hero h1 + About heading)
  name: 'Your Name',

  // TODO: Replace with your real job title (displayed below name in Hero + About section)
  title: 'Full-Stack Developer & AI Engineer',

  // TODO: Replace with your one-line tagline (displayed as lead text in Hero section)
  tagline: 'Building intelligent systems and clean web experiences.',

  // TODO: Replace with your real bio paragraph (displayed in About section body text)
  // Keep it to 2–4 sentences. Markdown is NOT rendered — plain text only.
  bio: 'I am a full-stack developer and AI engineer focused on building practical, production-ready systems that combine modern web interfaces with intelligent backends. I work across the entire stack — from Vue.js frontends and Bun-powered APIs to multi-agent AI pipelines using Claude and Python. I enjoy turning complex problems into tools people actually want to use.',

  // TODO: Replace with the path to your real avatar image.
  // Place the file at public/assets/avatar.jpg (or .png / .svg) and update this path.
  // The current SVG placeholder renders correctly in the UI if you have not added a photo yet.
  avatar: '/assets/avatar.svg',

  // TODO: Replace with the path to your real resume PDF.
  // Place the file at public/assets/resume.pdf — the Resume button in Hero will link to it.
  // If you do not have a resume yet, set this to '' and the Resume button will be hidden.
  resume: '/assets/resume.pdf',

  // TODO: Replace with your real email address (displayed in About section + Contact email button)
  email: 'you@example.com',

  social: {
    // TODO: Replace YOUR_USERNAME with your real GitHub username
    github: 'https://github.com/YOUR_USERNAME',

    // TODO: Replace YOUR_USERNAME with your real LinkedIn username (the part after linkedin.com/in/)
    linkedin: 'https://linkedin.com/in/YOUR_USERNAME',

    // TODO: Replace YOUR_USERNAME with your real Twitter/X handle (without the @)
    // If you do not use Twitter/X, you can leave this as a placeholder — the icon still renders.
    twitter: 'https://twitter.com/YOUR_USERNAME',
  },

  // ─── Skills ────────────────────────────────────────────────────────────────
  // IMPORTANT: The four category names below ("Frontend", "Backend", "AI & Data",
  // "Tools & DevOps") map directly to color and icon assignments in SkillsSection.vue.
  // Do NOT rename the categories unless you also update the maps in that component.
  //
  // TODO: Add, remove, or reorder skill items inside each category to match your real stack.
  skills: [
    {
      category: 'Frontend',
      items: ['Vue.js 3', 'TypeScript', 'Bootstrap 5', 'Vite', 'React'],
    },
    {
      category: 'Backend',
      items: ['Bun', 'Hono', 'Python', 'FastAPI', 'Node.js', 'REST APIs'],
    },
    {
      category: 'AI & Data',
      items: [
        'Claude API',
        'Anthropic SDK',
        'Multi-agent Systems',
        'RAG',
        'LLM Pipelines',
      ],
    },
    {
      category: 'Tools & DevOps',
      items: ['Git', 'Docker', 'Firebase', 'GitHub Actions', 'Claude Code'],
    },
  ],

  // ─── Projects ──────────────────────────────────────────────────────────────
  // Each entry renders as a Bootstrap card in the Projects section.
  // featured: true  → shown by default (above the "Show All" fold)
  // featured: false → hidden until user clicks "Show All Projects"
  //
  // TODO: Replace YOUR_USERNAME in every github URL with your real GitHub username.
  // TODO: Replace live URLs with your real deployed URLs (or set to '' to hide the Live Demo button).
  projects: [
    {
      title: 'ShortLink Web',
      description:
        'A production-ready URL shortener with GeoIP-based click analytics, QR code generation, and Firebase Auth-protected admin dashboard. Built with Bun + Hono on the backend and Vue 3 on the frontend, backed by Firebase Firestore with a named database instance.',
      tech: ['Vue 3', 'TypeScript', 'Bun', 'Hono', 'Firebase', 'Chart.js'],
      // TODO: Replace YOUR_USERNAME with your real GitHub username
      github: 'https://github.com/YOUR_USERNAME/project-shortlink-web',
      // TODO: Replace with your deployed URL, or set to '' if not yet live
      live: '',
      featured: true,
    },
    {
      title: 'Polymarket AI Agent',
      description:
        'An AI prediction market analysis system using a multi-agent LLM pipeline. Autonomously discovers and scores real-money prediction markets via a 3-stage Claude + Tavily pipeline, with paper trading simulation and a live portfolio dashboard.',
      tech: ['TypeScript', 'Claude API', 'Tavily', 'Bun', 'SQLite', 'Vue 3'],
      // TODO: Replace YOUR_USERNAME with your real GitHub username
      github: 'https://github.com/YOUR_USERNAME/project-polymarket-web',
      // TODO: Replace with your deployed URL, or set to '' if not yet live
      live: '',
      featured: true,
    },
    {
      title: 'Android Remote Bot',
      description:
        'An ADB wireless remote agent for Android devices with SOC2-compliant append-only audit trail, allowlist-enforced command security, mTLS authentication, and a Vue 3 web dashboard for multi-device management.',
      tech: ['Python', 'FastAPI', 'Vue 3', 'ADB', 'Claude API', 'Docker'],
      // TODO: Replace YOUR_USERNAME with your real GitHub username
      github: 'https://github.com/YOUR_USERNAME/project-remote-android-bot',
      // TODO: Replace with your deployed URL, or set to '' if not yet live
      live: '',
      featured: false,
    },
    {
      title: 'CC Trade Company',
      description:
        'An autonomous financial trading agent system with 8 specialized AI agents (CIO, Research, Portfolio Manager, Risk, Compliance, Trader, Operations, EOD Reporter). Features dual-approval risk+compliance gate before any trade executes, Webull API integration, and paper trading simulation mode.',
      tech: ['Python', 'Claude API', 'Webull API', 'Multi-agent', 'FastAPI'],
      // TODO: Replace YOUR_USERNAME with your real GitHub username
      github: 'https://github.com/YOUR_USERNAME/project-trade-company',
      // TODO: Replace with your deployed URL, or set to '' if not yet live
      live: '',
      featured: false,
    },
    {
      title: 'This Portfolio',
      description:
        'Personal portfolio site built with Vue 3 (Composition API), Bootstrap 5, and Bun. Auto-deploys to GitHub Pages via GitHub Actions on every push to main. All content lives in a single profile.ts data file — no hardcoded strings in templates.',
      tech: ['Vue 3', 'TypeScript', 'Bootstrap 5', 'Bun', 'Vite', 'GitHub Actions'],
      // TODO: Replace YOUR_USERNAME with your real GitHub username
      github: 'https://github.com/YOUR_USERNAME/project-about-n4mmon-web',
      // TODO: Replace with your GitHub Pages URL once live, e.g. https://YOUR_USERNAME.github.io/project-about-n4mmon-web/
      live: '',
      featured: false,
    },
  ],

  // ─── Experience ────────────────────────────────────────────────────────────
  // type: 'work'      → blue badge, shown first in the timeline
  // type: 'education' → green badge
  //
  // TODO: Replace ALL experience entries below with your real employment and education history.
  // Keep entries in reverse-chronological order (most recent first).
  experience: [
    {
      // TODO: Replace with your real current employer, or use 'Freelance / Independent' if self-employed
      company: 'Your Current Employer',
      // TODO: Replace with your real job title
      role: 'Full-Stack Developer & AI Engineer',
      // TODO: Replace with your real start date and end date (or 'Present')
      period: 'Jan 2024 – Present',
      // TODO: Replace with a real description of your responsibilities and key achievements
      description:
        'Designing and building full-stack web applications and AI-driven systems. Projects include a production URL shortener with GeoIP analytics, multi-agent AI pipelines, and an autonomous trading research system using the Claude API.',
      type: 'work',
    },
    {
      // TODO: Replace with your real previous employer
      company: 'Previous Employer',
      // TODO: Replace with your real job title
      role: 'Frontend Developer',
      // TODO: Replace with your real dates
      period: 'Jun 2022 – Dec 2023',
      // TODO: Replace with a real description of your role and achievements
      description:
        'Built and maintained enterprise web dashboards using Vue.js and TypeScript. Responsible for component architecture, performance optimization, and design system implementation across multiple product lines.',
      type: 'work',
    },
    {
      // TODO: Replace with your real university name
      company: 'Your University',
      // TODO: Replace with your real degree name
      role: 'B.Sc. Computer Science',
      // TODO: Replace with your real graduation year range
      period: '2018 – 2022',
      // TODO: Replace with a real description of your studies and any notable final project
      description:
        'Graduated with a focus on software engineering and machine learning. Final project: a real-time anomaly detection system for IoT sensor data.',
      type: 'education',
    },
  ],
}
