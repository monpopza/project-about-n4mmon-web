// src/db/seed.ts — seed the database from static profile data on first run.
// Checks profile_meta count first — if > 0 the DB is already seeded; exits early.

import type { Database } from 'bun:sqlite'

// Profile data inlined here (mirrors src/data/profile.ts in the frontend)
// so the backend has no build-time dependency on the Vue frontend.
const SEED_PROFILE = {
  name: 'N4mmon Dev',
  title: 'Full-Stack Developer & AI Engineer',
  tagline: 'Building intelligent systems and clean web experiences.',
  bio: 'I am a full-stack developer and AI engineer focused on building practical, production-ready systems that combine modern web interfaces with intelligent backends. I work across the entire stack — from Vue.js frontends and Bun-powered APIs to multi-agent AI pipelines using Claude and Python. I enjoy turning complex problems into tools people actually want to use.',
  avatar: '/assets/avatar.svg',
  resume: '/assets/resume.pdf',
  email: 'hello@n4mmon.dev',
  github: 'https://github.com/n4mmon',
  linkedin: 'https://linkedin.com/in/n4mmon',
  twitter: 'https://twitter.com/n4mmon',
  seo_title: 'N4mmon Dev — Full-Stack Developer & AI Engineer',
  seo_description: 'Portfolio of N4mmon Dev — full-stack web development and AI engineering.',
}

const SEED_SKILLS = [
  { category: 'Frontend', items: ['Vue.js 3', 'TypeScript', 'Bootstrap 5', 'Vite', 'React'] },
  { category: 'Backend', items: ['Bun', 'Hono', 'Python', 'FastAPI', 'Node.js', 'REST APIs'] },
  {
    category: 'AI & Data',
    items: ['Claude API', 'Anthropic SDK', 'Multi-agent Systems', 'RAG', 'LLM Pipelines'],
  },
  {
    category: 'Tools & DevOps',
    items: ['Git', 'Docker', 'Firebase', 'GitHub Actions', 'Claude Code'],
  },
]

const SEED_PROJECTS = [
  {
    title: 'ShortLink Web',
    description:
      'A production-ready URL shortener with GeoIP-based click analytics, QR code generation, and Firebase Auth-protected admin dashboard.',
    tech: ['Vue 3', 'TypeScript', 'Bun', 'Hono', 'Firebase', 'Chart.js'],
    github: 'https://github.com/n4mmon/project-shortlink-web',
    live: 'https://s.nammon.cc',
    featured: 1,
    published: 1,
  },
  {
    title: 'Polymarket AI Agent',
    description:
      'An AI prediction market analysis system using a multi-agent LLM pipeline. Autonomously discovers and scores real-money prediction markets.',
    tech: ['TypeScript', 'Claude API', 'Tavily', 'Bun', 'SQLite', 'Vue 3'],
    github: 'https://github.com/n4mmon/project-polymarket-web',
    live: '',
    featured: 1,
    published: 1,
  },
  {
    title: 'Android Remote Bot',
    description:
      'An ADB wireless remote agent for Android devices with SOC2-compliant append-only audit trail and allowlist-enforced command security.',
    tech: ['Python', 'FastAPI', 'Vue 3', 'ADB', 'Claude API', 'Docker'],
    github: 'https://github.com/n4mmon/project-remote-android-bot',
    live: '',
    featured: 0,
    published: 1,
  },
  {
    title: 'CC Trade Company',
    description:
      'An autonomous financial trading agent system with 8 specialized AI agents featuring dual-approval risk+compliance gate before any trade executes.',
    tech: ['Python', 'Claude API', 'Webull API', 'Multi-agent', 'FastAPI'],
    github: 'https://github.com/n4mmon/project-trade-company',
    live: '',
    featured: 0,
    published: 1,
  },
  {
    title: 'This Portfolio',
    description:
      'Personal portfolio site built with Vue 3 (Composition API), Bootstrap 5, and Bun. Auto-deploys to GitHub Pages on every push to main.',
    tech: ['Vue 3', 'TypeScript', 'Bootstrap 5', 'Bun', 'Vite', 'GitHub Actions'],
    github: 'https://github.com/n4mmon/project-about-n4mmon-web',
    live: 'https://n4mmon.github.io/project-about-n4mmon-web/',
    featured: 0,
    published: 1,
  },
]

const SEED_EXPERIENCE = [
  {
    company: 'Claude Code Agent Team',
    role: 'Full-Stack Developer & AI Engineer',
    period: 'Jan 2024 – Present',
    description:
      'Designing and building full-stack web applications and AI-driven systems. Projects include a production URL shortener, multi-agent AI pipelines, and an autonomous trading research system.',
    type: 'work' as const,
  },
  {
    company: 'Freelance / Independent',
    role: 'Frontend Developer',
    period: 'Jun 2022 – Dec 2023',
    description:
      'Built and maintained web dashboards using Vue.js and TypeScript for clients across e-commerce and logistics.',
    type: 'work' as const,
  },
  {
    company: 'Faculty of Engineering',
    role: 'B.Sc. Computer Science',
    period: '2018 – 2022',
    description:
      'Graduated with a focus on software engineering and machine learning. Final project: real-time anomaly detection for IoT sensor data.',
    type: 'education' as const,
  },
]

const SEED_SOCIAL_LINKS = [
  { label: 'GitHub', url: 'https://github.com/n4mmon', icon: 'github', desc: 'Code, projects, and open source' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/n4mmon', icon: 'linkedin', desc: 'Professional network & resume' },
  { label: 'Twitter / X', url: 'https://twitter.com/n4mmon', icon: 'twitter', desc: 'Thoughts and dev updates' },
  { label: 'Facebook', url: 'https://facebook.com/n4mmon', icon: 'facebook', desc: 'Follow on Facebook' },
  { label: 'YouTube', url: 'https://youtube.com/@n4mmon', icon: 'youtube', desc: 'Videos and tutorials' },
  { label: 'Instagram', url: 'https://instagram.com/n4mmon', icon: 'instagram', desc: 'Photos and behind the scenes' },
  { label: 'TikTok', url: 'https://tiktok.com/@n4mmon', icon: 'tiktok', desc: 'Short-form content' },
  { label: 'Discord', url: 'https://discord.gg/n4mmon', icon: 'discord', desc: 'Join the community server' },
  { label: 'Twitch', url: 'https://twitch.tv/n4mmon', icon: 'twitch', desc: 'Live coding streams' },
]

export function seedIfEmpty(db: Database): void {
  const row = db.query<{ count: number }, []>('SELECT COUNT(*) as count FROM profile_meta').get()
  if (row && row.count > 0) {
    console.log('[seed] Database already seeded — skipping.')
    return
  }

  console.log('[seed] Empty database detected — seeding from profile data...')

  // Profile meta (single row, id = 1)
  db.prepare(`
    INSERT INTO profile_meta
      (id, name, title, tagline, bio, avatar, resume, email, github, linkedin, twitter, seo_title, seo_description)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    SEED_PROFILE.name,
    SEED_PROFILE.title,
    SEED_PROFILE.tagline,
    SEED_PROFILE.bio,
    SEED_PROFILE.avatar,
    SEED_PROFILE.resume,
    SEED_PROFILE.email,
    SEED_PROFILE.github,
    SEED_PROFILE.linkedin,
    SEED_PROFILE.twitter,
    SEED_PROFILE.seo_title,
    SEED_PROFILE.seo_description,
  )

  // Skills
  for (let ci = 0; ci < SEED_SKILLS.length; ci++) {
    const cat = SEED_SKILLS[ci]
    const result = db.prepare(
      'INSERT INTO skill_categories (category, sort_order) VALUES (?, ?)',
    ).run(cat.category, ci)
    const catId = result.lastInsertRowid as number
    for (let ii = 0; ii < cat.items.length; ii++) {
      db.prepare(
        'INSERT INTO skill_items (category_id, label, sort_order) VALUES (?, ?, ?)',
      ).run(catId, cat.items[ii], ii)
    }
  }

  // Projects
  for (let i = 0; i < SEED_PROJECTS.length; i++) {
    const p = SEED_PROJECTS[i]
    db.prepare(`
      INSERT INTO projects (title, description, tech, github, live, featured, published, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(p.title, p.description, JSON.stringify(p.tech), p.github, p.live, p.featured, p.published, i)
  }

  // Experience
  for (let i = 0; i < SEED_EXPERIENCE.length; i++) {
    const e = SEED_EXPERIENCE[i]
    db.prepare(`
      INSERT INTO experience (company, role, period, description, type, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.company, e.role, e.period, e.description, e.type, i)
  }

  // Social links
  for (let i = 0; i < SEED_SOCIAL_LINKS.length; i++) {
    const s = SEED_SOCIAL_LINKS[i]
    db.prepare(`
      INSERT INTO social_links (label, url, icon, desc, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `).run(s.label, s.url, s.icon, s.desc, i)
  }

  console.log('[seed] Seed complete.')
}
