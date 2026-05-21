/**
 * schema.ts — SQLite schema constants and TypeScript interfaces
 * Project:  project-about-n4mmon-web (portfolio CMS backend)
 * Database: backend/data/portfolio.db (bun:sqlite)
 * Author:   @dba — 2026-05-21
 *
 * Usage:
 *   import { createDatabase, type ProfileMeta, type Post } from './schema'
 *   import { Database } from 'bun:sqlite'
 *   const db = new Database('backend/data/portfolio.db')
 *   createDatabase(db)
 */

import type { Database } from 'bun:sqlite'

// ─── TypeScript Interfaces ─────────────────────────────────────────────────────

/** Singleton profile row. id is always 1. */
export interface ProfileMeta {
  id: 1
  name: string
  title: string
  tagline: string
  bio: string
  avatar: string
  resume: string | null
  email: string | null
  github: string | null
  linkedin: string | null
  twitter: string | null
  meta_title: string | null
  meta_description: string | null
  og_image: string | null
  updated_at: string
}

/** Skill category group (e.g. "Frontend", "Backend"). */
export interface Skill {
  id: number
  category: string
  sort_order: number
  created_at: string
}

/** Individual skill badge — child of a Skill row. */
export interface SkillItem {
  id: number
  skill_id: number
  name: string
  sort_order: number
}

/** Portfolio project card. tech is a JSON-serialised string[]. */
export interface Project {
  id: number
  title: string
  description: string
  /** JSON-encoded string array, e.g. '["Vue 3","Bun"]' */
  tech: string
  github: string | null
  live: string | null
  /** 0 = not featured, 1 = featured (above the fold) */
  featured: 0 | 1
  /** 0 = draft, 1 = published */
  published: 0 | 1
  sort_order: number
  created_at: string
  updated_at: string
}

/** Work or education timeline entry. */
export interface Experience {
  id: number
  company: string
  role: string
  period: string
  description: string
  type: 'work' | 'education'
  sort_order: number
  /** 0 = hidden, 1 = visible */
  published: 0 | 1
  created_at: string
}

/** External social / profile link. */
export interface SocialLink {
  id: number
  label: string
  url: string
  /** Must match a key in SocialLinksSection.vue ICONS record */
  icon: string
  description: string | null
  sort_order: number
  /** 0 = hidden, 1 = visible */
  visible: 0 | 1
}

/** Uploaded file metadata record. */
export interface Media {
  id: number
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  uploaded_at: string
}

/** Blog post stored as Markdown content. */
export interface Post {
  id: number
  slug: string
  title: string
  /** Raw Markdown — rendering is the frontend's responsibility */
  content: string
  excerpt: string | null
  /** 0 = draft, 1 = published */
  published: 0 | 1
  published_at: string | null
  created_at: string
  updated_at: string
}

// ─── SQL Create Statements ─────────────────────────────────────────────────────
// Kept as constants so the Hono backend can run them programmatically
// and so @be can reference exact DDL without reading the .sql files.

export const SQL_PRAGMAS = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
`

export const SQL_CREATE_PROFILE_META = `
CREATE TABLE IF NOT EXISTS profile_meta (
  id               INTEGER  PRIMARY KEY CHECK (id = 1),
  name             TEXT     NOT NULL,
  title            TEXT     NOT NULL,
  tagline          TEXT     NOT NULL,
  bio              TEXT     NOT NULL,
  avatar           TEXT     NOT NULL DEFAULT '/assets/avatar.svg',
  resume           TEXT,
  email            TEXT,
  github           TEXT,
  linkedin         TEXT,
  twitter          TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  og_image         TEXT,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`

export const SQL_CREATE_SKILLS = `
CREATE TABLE IF NOT EXISTS skills (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  category   TEXT     NOT NULL UNIQUE,
  sort_order INTEGER  NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_skills_sort_order
  ON skills (sort_order ASC);
`

export const SQL_CREATE_SKILL_ITEMS = `
CREATE TABLE IF NOT EXISTS skill_items (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  skill_id   INTEGER  NOT NULL REFERENCES skills (id) ON DELETE CASCADE,
  name       TEXT     NOT NULL,
  sort_order INTEGER  NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_skill_items_skill_id
  ON skill_items (skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_items_sort_order
  ON skill_items (skill_id, sort_order ASC);
`

export const SQL_CREATE_PROJECTS = `
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  title       TEXT     NOT NULL,
  description TEXT     NOT NULL,
  tech        TEXT     NOT NULL DEFAULT '[]',
  github      TEXT,
  live        TEXT,
  featured    INTEGER  NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  published   INTEGER  NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  sort_order  INTEGER  NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_projects_published_sort
  ON projects (published, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_projects_featured
  ON projects (featured, published);
`

export const SQL_CREATE_EXPERIENCE = `
CREATE TABLE IF NOT EXISTS experience (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  company     TEXT     NOT NULL,
  role        TEXT     NOT NULL,
  period      TEXT     NOT NULL,
  description TEXT     NOT NULL,
  type        TEXT     NOT NULL CHECK (type IN ('work', 'education')),
  sort_order  INTEGER  NOT NULL DEFAULT 0,
  published   INTEGER  NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_experience_type_sort
  ON experience (type, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_experience_published_sort
  ON experience (published, sort_order ASC);
`

export const SQL_CREATE_SOCIAL_LINKS = `
CREATE TABLE IF NOT EXISTS social_links (
  id          INTEGER  PRIMARY KEY AUTOINCREMENT,
  label       TEXT     NOT NULL,
  url         TEXT     NOT NULL,
  icon        TEXT     NOT NULL,
  description TEXT,
  sort_order  INTEGER  NOT NULL DEFAULT 0,
  visible     INTEGER  NOT NULL DEFAULT 1 CHECK (visible IN (0, 1))
);
CREATE INDEX IF NOT EXISTS idx_social_links_visible_sort
  ON social_links (visible, sort_order ASC);
`

export const SQL_CREATE_MEDIA = `
CREATE TABLE IF NOT EXISTS media (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  filename      TEXT     NOT NULL UNIQUE,
  original_name TEXT     NOT NULL,
  mime_type     TEXT     NOT NULL,
  size_bytes    INTEGER  NOT NULL CHECK (size_bytes >= 0),
  url           TEXT     NOT NULL,
  uploaded_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_at
  ON media (uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_mime_type
  ON media (mime_type);
`

export const SQL_CREATE_POSTS = `
CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  slug         TEXT     NOT NULL UNIQUE,
  title        TEXT     NOT NULL,
  content      TEXT     NOT NULL,
  excerpt      TEXT,
  published    INTEGER  NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  published_at DATETIME,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posts_slug
  ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_published_at
  ON posts (published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts (created_at DESC);
`

// Singleton row bootstrap — profile_meta must have exactly one row with id=1.
const SQL_SEED_PROFILE_META_SINGLETON = `
INSERT OR IGNORE INTO profile_meta (id, name, title, tagline, bio)
VALUES (1, '', '', '', '');
`

// ─── createDatabase ────────────────────────────────────────────────────────────

/**
 * Initialise the SQLite database by running all migration DDL statements.
 *
 * This function is idempotent: it uses CREATE TABLE IF NOT EXISTS and
 * CREATE INDEX IF NOT EXISTS throughout. Safe to call on every app startup.
 *
 * @param db  An open bun:sqlite Database instance
 */
export function createDatabase(db: Database): void {
  // Run all DDL inside a single transaction for atomicity.
  // If any statement fails, the entire transaction is rolled back.
  db.transaction(() => {
    // Pragmas must be set outside a transaction in some SQLite builds,
    // but WAL and foreign_keys are session-level and safe here.
    db.run('PRAGMA journal_mode = WAL')
    db.run('PRAGMA foreign_keys = ON')

    // Migration 001 — core tables
    db.run(SQL_CREATE_PROFILE_META)
    db.run(SQL_SEED_PROFILE_META_SINGLETON)
    db.run(SQL_CREATE_SKILLS)
    db.run(SQL_CREATE_SKILL_ITEMS)
    db.run(SQL_CREATE_PROJECTS)
    db.run(SQL_CREATE_EXPERIENCE)
    db.run(SQL_CREATE_SOCIAL_LINKS)
    db.run(SQL_CREATE_MEDIA)

    // Migration 002 — blog
    db.run(SQL_CREATE_POSTS)
  })()
}
