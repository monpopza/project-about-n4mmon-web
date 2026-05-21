-- Seed: seed_from_profile.sql
-- Project:   project-about-n4mmon-web — Portfolio CMS backend
-- Source:    src/data/profile.ts (replicated as of 2026-05-21)
-- Author:    @dba
-- Created:   2026-05-21
-- Depends:   001_initial.sql, 002_blog.sql (schema must exist)
-- Idempotent: YES — all inserts use INSERT OR REPLACE / INSERT OR IGNORE
--             Running this file more than once is safe and produces the same state.
-- ─────────────────────────────────────────────────────────────────────────────

PRAGMA foreign_keys = ON;

-- ─── profile_meta ─────────────────────────────────────────────────────────────
-- Single row (id = 1). INSERT OR REPLACE overwrites the existing singleton row
-- so re-running the seed refreshes all scalar profile fields.
INSERT OR REPLACE INTO profile_meta (
  id,
  name,
  title,
  tagline,
  bio,
  avatar,
  resume,
  email,
  github,
  linkedin,
  twitter,
  meta_title,
  meta_description,
  og_image,
  updated_at
) VALUES (
  1,
  'N4mmon Dev',
  'Full-Stack Developer & AI Engineer',
  'Building intelligent systems and clean web experiences.',
  'I am a full-stack developer and AI engineer focused on building practical, production-ready systems that combine modern web interfaces with intelligent backends. I work across the entire stack — from Vue.js frontends and Bun-powered APIs to multi-agent AI pipelines using Claude and Python. I enjoy turning complex problems into tools people actually want to use.',
  '/assets/avatar.svg',
  '/assets/resume.pdf',
  'hello@n4mmon.dev',
  'https://github.com/n4mmon',
  'https://linkedin.com/in/n4mmon',
  'https://twitter.com/n4mmon',
  'N4mmon Dev — Full-Stack Developer & AI Engineer',
  'Full-stack developer and AI engineer building intelligent systems and clean web experiences with Vue.js, Bun, and Claude.',
  '/assets/avatar.svg',
  CURRENT_TIMESTAMP
);

-- ─── skills ───────────────────────────────────────────────────────────────────
-- Category names match the keys used in SkillsSection.vue categoryColors/getCategoryIcon.
-- Do NOT rename them without also updating the frontend component.

-- Remove all existing skill_items before re-seeding to avoid orphan/duplicate rows.
-- This is safe because skill_items has ON DELETE CASCADE from skills.
DELETE FROM skill_items;
DELETE FROM skills;

INSERT INTO skills (id, category, sort_order) VALUES
  (1, 'Frontend',      0),
  (2, 'Backend',       1),
  (3, 'AI & Data',     2),
  (4, 'Tools & DevOps', 3);

INSERT INTO skill_items (skill_id, name, sort_order) VALUES
  -- Frontend
  (1, 'Vue.js 3',     0),
  (1, 'TypeScript',   1),
  (1, 'Bootstrap 5',  2),
  (1, 'Vite',         3),
  (1, 'React',        4),
  -- Backend
  (2, 'Bun',          0),
  (2, 'Hono',         1),
  (2, 'Python',       2),
  (2, 'FastAPI',      3),
  (2, 'Node.js',      4),
  (2, 'REST APIs',    5),
  -- AI & Data
  (3, 'Claude API',           0),
  (3, 'Anthropic SDK',        1),
  (3, 'Multi-agent Systems',  2),
  (3, 'RAG',                  3),
  (3, 'LLM Pipelines',        4),
  -- Tools & DevOps
  (4, 'Git',            0),
  (4, 'Docker',         1),
  (4, 'Firebase',       2),
  (4, 'GitHub Actions', 3),
  (4, 'Claude Code',    4);

-- ─── projects ─────────────────────────────────────────────────────────────────
-- Re-seed by removing existing rows then inserting fresh.
-- In production, prefer individual upserts keyed on title instead.
DELETE FROM projects;

INSERT INTO projects (id, title, description, tech, github, live, featured, published, sort_order) VALUES
  (
    1,
    'ShortLink Web',
    'A production-ready URL shortener with GeoIP-based click analytics, QR code generation, and Firebase Auth-protected admin dashboard. Built with Bun + Hono on the backend and Vue 3 on the frontend, backed by Firebase Firestore with a named database instance.',
    '["Vue 3","TypeScript","Bun","Hono","Firebase","Chart.js"]',
    'https://github.com/n4mmon/project-shortlink-web',
    'https://s.nammon.cc',
    1,
    1,
    0
  ),
  (
    2,
    'Polymarket AI Agent',
    'An AI prediction market analysis system using a multi-agent LLM pipeline. Autonomously discovers and scores real-money prediction markets via a 3-stage Claude + Tavily pipeline, with paper trading simulation and a live portfolio dashboard.',
    '["TypeScript","Claude API","Tavily","Bun","SQLite","Vue 3"]',
    'https://github.com/n4mmon/project-polymarket-web',
    '',
    1,
    1,
    1
  ),
  (
    3,
    'Android Remote Bot',
    'An ADB wireless remote agent for Android devices with SOC2-compliant append-only audit trail, allowlist-enforced command security, mTLS authentication, and a Vue 3 web dashboard for multi-device management.',
    '["Python","FastAPI","Vue 3","ADB","Claude API","Docker"]',
    'https://github.com/n4mmon/project-remote-android-bot',
    '',
    0,
    1,
    2
  ),
  (
    4,
    'CC Trade Company',
    'An autonomous financial trading agent system with 8 specialized AI agents (CIO, Research, Portfolio Manager, Risk, Compliance, Trader, Operations, EOD Reporter). Features dual-approval risk+compliance gate before any trade executes, Webull API integration, and paper trading simulation mode.',
    '["Python","Claude API","Webull API","Multi-agent","FastAPI"]',
    'https://github.com/n4mmon/project-trade-company',
    '',
    0,
    1,
    3
  ),
  (
    5,
    'This Portfolio',
    'Personal portfolio site built with Vue 3 (Composition API), Bootstrap 5, and Bun. Auto-deploys to GitHub Pages via GitHub Actions on every push to main. All content lives in a single profile.ts data file — no hardcoded strings in templates.',
    '["Vue 3","TypeScript","Bootstrap 5","Bun","Vite","GitHub Actions"]',
    'https://github.com/n4mmon/project-about-n4mmon-web',
    'https://n4mmon.github.io/project-about-n4mmon-web/',
    0,
    1,
    4
  );

-- ─── experience ───────────────────────────────────────────────────────────────
-- Entries stored in reverse-chronological order (sort_order 0 = most recent).
DELETE FROM experience;

INSERT INTO experience (id, company, role, period, description, type, sort_order, published) VALUES
  (
    1,
    'Claude Code Agent Team',
    'Full-Stack Developer & AI Engineer',
    'Jan 2024 – Present',
    'Designing and building full-stack web applications and AI-driven systems. Projects include a production URL shortener with GeoIP analytics, multi-agent AI pipelines, an autonomous trading research system using the Claude API, and an ADB remote agent with SOC2-compliant audit trail.',
    'work',
    0,
    1
  ),
  (
    2,
    'Freelance / Independent',
    'Frontend Developer',
    'Jun 2022 – Dec 2023',
    'Built and maintained web dashboards using Vue.js and TypeScript for clients across e-commerce and logistics. Responsible for component architecture, performance optimization, and design system implementation across multiple product lines.',
    'work',
    1,
    1
  ),
  (
    3,
    'Faculty of Engineering',
    'B.Sc. Computer Science',
    '2018 – 2022',
    'Graduated with a focus on software engineering and machine learning. Final project: a real-time anomaly detection system for IoT sensor data using Python and edge inference.',
    'education',
    2,
    1
  );

-- ─── social_links ─────────────────────────────────────────────────────────────
-- icon values must match keys in SocialLinksSection.vue ICONS record.
DELETE FROM social_links;

INSERT INTO social_links (id, label, url, icon, description, sort_order, visible) VALUES
  (1,  'GitHub',       'https://github.com/n4mmon',          'github',    'Code, projects, and open source',   0, 1),
  (2,  'LinkedIn',     'https://linkedin.com/in/n4mmon',     'linkedin',  'Professional network & resume',      1, 1),
  (3,  'Twitter / X',  'https://twitter.com/n4mmon',         'twitter',   'Thoughts and dev updates',           2, 1),
  (4,  'Facebook',     'https://facebook.com/n4mmon',        'facebook',  'Follow on Facebook',                 3, 1),
  (5,  'YouTube',      'https://youtube.com/@n4mmon',        'youtube',   'Videos and tutorials',               4, 1),
  (6,  'Instagram',    'https://instagram.com/n4mmon',       'instagram', 'Photos and behind the scenes',       5, 1),
  (7,  'TikTok',       'https://tiktok.com/@n4mmon',         'tiktok',    'Short-form content',                 6, 1),
  (8,  'Discord',      'https://discord.gg/n4mmon',          'discord',   'Join the community server',          7, 1),
  (9,  'Twitch',       'https://twitch.tv/n4mmon',           'twitch',    'Live coding streams',                8, 1);
