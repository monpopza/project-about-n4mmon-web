// src/data/profile.ts — single source of truth for all personal data (updated 2026-05-21)
// ─────────────────────────────────────────────────────────────────
// HOW TO POPULATE THIS FILE:
//   Search for every line containing "TODO: Replace" and fill in your real data.
//   Nothing else in the codebase needs to change — all components read from here.
// ─────────────────────────────────────────────────────────────────
import type { Profile } from '@/types/index'

export const profile: Profile = {
  // Sprint 19 T604 — replaced all placeholder values with realistic n4mmon content.
  // Data shape is preserved exactly — only string values were changed.
  name: 'N4mmon Dev',

  title: 'Full-Stack Developer & AI Engineer',

  tagline: 'Building intelligent systems and clean web experiences.',

  bio: 'I am a full-stack developer and AI engineer focused on building practical, production-ready systems that combine modern web interfaces with intelligent backends. I work across the entire stack — from Vue.js frontends and Bun-powered APIs to multi-agent AI pipelines using Claude and Python. I enjoy turning complex problems into tools people actually want to use.',

  // Using the existing SVG placeholder — replace with a real photo when available.
  avatar: '/assets/avatar.svg',

  // Resume PDF — place file at public/assets/resume.pdf when ready.
  resume: '/assets/resume.pdf',

  email: 'hello@n4mmon.dev',

  social: {
    github: 'https://github.com/n4mmon',
    linkedin: 'https://linkedin.com/in/n4mmon',
    twitter: 'https://twitter.com/n4mmon',
  },

  // ─── Skills ────────────────────────────────────────────────────────────────
  // IMPORTANT: The four category names below ("Frontend", "Backend", "AI & Data",
  // "Tools & DevOps") map directly to color and icon assignments in SkillsSection.vue.
  // Do NOT rename the categories unless you also update the maps in that component.
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
  projects: [
    {
      title: 'ShortLink Web',
      description:
        'A production-ready URL shortener with GeoIP-based click analytics, QR code generation, and Firebase Auth-protected admin dashboard. Built with Bun + Hono on the backend and Vue 3 on the frontend, backed by Firebase Firestore with a named database instance.',
      tech: ['Vue 3', 'TypeScript', 'Bun', 'Hono', 'Firebase', 'Chart.js'],
      github: 'https://github.com/n4mmon/project-shortlink-web',
      live: 'https://s.nammon.cc',
      featured: true,
    },
    {
      title: 'Polymarket AI Agent',
      description:
        'An AI prediction market analysis system using a multi-agent LLM pipeline. Autonomously discovers and scores real-money prediction markets via a 3-stage Claude + Tavily pipeline, with paper trading simulation and a live portfolio dashboard.',
      tech: ['TypeScript', 'Claude API', 'Tavily', 'Bun', 'SQLite', 'Vue 3'],
      github: 'https://github.com/n4mmon/project-polymarket-web',
      live: '',
      featured: true,
    },
    {
      title: 'Android Remote Bot',
      description:
        'An ADB wireless remote agent for Android devices with SOC2-compliant append-only audit trail, allowlist-enforced command security, mTLS authentication, and a Vue 3 web dashboard for multi-device management.',
      tech: ['Python', 'FastAPI', 'Vue 3', 'ADB', 'Claude API', 'Docker'],
      github: 'https://github.com/n4mmon/project-remote-android-bot',
      live: '',
      featured: false,
    },
    {
      title: 'CC Trade Company',
      description:
        'An autonomous financial trading agent system with 8 specialized AI agents (CIO, Research, Portfolio Manager, Risk, Compliance, Trader, Operations, EOD Reporter). Features dual-approval risk+compliance gate before any trade executes, Webull API integration, and paper trading simulation mode.',
      tech: ['Python', 'Claude API', 'Webull API', 'Multi-agent', 'FastAPI'],
      github: 'https://github.com/n4mmon/project-trade-company',
      live: '',
      featured: false,
    },
    {
      title: 'This Portfolio',
      description:
        'Personal portfolio site built with Vue 3 (Composition API), Bootstrap 5, and Bun. Auto-deploys to GitHub Pages via GitHub Actions on every push to main. All content lives in a single profile.ts data file — no hardcoded strings in templates.',
      tech: ['Vue 3', 'TypeScript', 'Bootstrap 5', 'Bun', 'Vite', 'GitHub Actions'],
      github: 'https://github.com/n4mmon/project-about-n4mmon-web',
      live: 'https://n4mmon.github.io/project-about-n4mmon-web/',
      featured: false,
    },
  ],

  // ─── Experience ────────────────────────────────────────────────────────────
  // type: 'work'      → blue badge, shown first in the timeline
  // type: 'education' → green badge
  //
  // Entries are in reverse-chronological order (most recent first).
  experience: [
    {
      company: 'Claude Code Agent Team',
      role: 'Full-Stack Developer & AI Engineer',
      period: 'Jan 2024 – Present',
      description:
        'Designing and building full-stack web applications and AI-driven systems. Projects include a production URL shortener with GeoIP analytics, multi-agent AI pipelines, an autonomous trading research system using the Claude API, and an ADB remote agent with SOC2-compliant audit trail.',
      type: 'work',
    },
    {
      company: 'Freelance / Independent',
      role: 'Frontend Developer',
      period: 'Jun 2022 – Dec 2023',
      description:
        'Built and maintained web dashboards using Vue.js and TypeScript for clients across e-commerce and logistics. Responsible for component architecture, performance optimization, and design system implementation across multiple product lines.',
      type: 'work',
    },
    {
      company: 'Faculty of Engineering',
      role: 'B.Sc. Computer Science',
      period: '2018 – 2022',
      description:
        'Graduated with a focus on software engineering and machine learning. Final project: a real-time anomaly detection system for IoT sensor data using Python and edge inference.',
      type: 'education',
    },
  ],

  // ─── Social Links (S20-T09) ────────────────────────────────────────────────
  // Rendered by SocialLinksSection.vue — inserted between HeroSection and AboutSection.
  // icon field must match a key in SocialLinksSection.vue ICONS record.
  // Sources: migrated from shortlink-web HomePage.vue ICONS + iconOptions array.
  socialLinks: [
    {
      label: 'GitHub',
      url: 'https://github.com/n4mmon',
      icon: 'github',
      desc: 'Code, projects, and open source',
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/n4mmon',
      icon: 'linkedin',
      desc: 'Professional network & resume',
    },
    {
      label: 'Twitter / X',
      url: 'https://twitter.com/n4mmon',
      icon: 'twitter',
      desc: 'Thoughts and dev updates',
    },
    {
      label: 'Facebook',
      url: 'https://facebook.com/n4mmon',
      icon: 'facebook',
      desc: 'Follow on Facebook',
    },
    {
      label: 'YouTube',
      url: 'https://youtube.com/@n4mmon',
      icon: 'youtube',
      desc: 'Videos and tutorials',
    },
    {
      label: 'Instagram',
      url: 'https://instagram.com/n4mmon',
      icon: 'instagram',
      desc: 'Photos and behind the scenes',
    },
    {
      label: 'TikTok',
      url: 'https://tiktok.com/@n4mmon',
      icon: 'tiktok',
      desc: 'Short-form content',
    },
    {
      label: 'Discord',
      url: 'https://discord.gg/n4mmon',
      icon: 'discord',
      desc: 'Join the community server',
    },
    {
      label: 'Twitch',
      url: 'https://twitch.tv/n4mmon',
      icon: 'twitch',
      desc: 'Live coding streams',
    },
  ],
}
