-- Migration: 001_initial.sql
-- Project:   project-about-n4mmon-web — Portfolio CMS backend
-- Database:  SQLite via bun:sqlite (backend/data/portfolio.db)
-- Author:    @dba
-- Created:   2026-05-21
-- Idempotent: YES — all statements use IF NOT EXISTS / OR IGNORE guards
--
-- Tables created in this migration:
--   profile_meta   — singleton row for all scalar profile fields
--   skills         — skill category groups
--   skill_items    — individual skill badges within a category
--   projects       — portfolio project cards
--   experience     — work and education timeline entries
--   social_links   — external profile / social links
--   media          — uploaded file metadata
-- ─────────────────────────────────────────────────────────────────────────────

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── profile_meta ─────────────────────────────────────────────────────────────
-- Single-row table (id always = 1).
-- PII fields: email. Any schema change to this table must notify @compliance.
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

-- Guarantee the singleton row exists (first-run seed).
-- Subsequent runs are a no-op due to OR IGNORE.
INSERT OR IGNORE INTO profile_meta (id, name, title, tagline, bio)
VALUES (1, '', '', '', '');

-- ─── skills ───────────────────────────────────────────────────────────────────
-- One row per skill category group (Frontend, Backend, AI & Data, Tools & DevOps).
-- category is UNIQUE — prevents duplicate category names.
CREATE TABLE IF NOT EXISTS skills (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  category   TEXT     NOT NULL UNIQUE,
  sort_order INTEGER  NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skills_sort_order
  ON skills (sort_order ASC);

-- ─── skill_items ──────────────────────────────────────────────────────────────
-- Individual skill badge names, children of a skills row.
-- ON DELETE CASCADE: removing a skills row removes its items automatically.
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

-- ─── projects ─────────────────────────────────────────────────────────────────
-- Portfolio project cards.
-- tech column stores a JSON array of technology strings (e.g. '["Vue 3","Bun"]').
-- featured (0/1 boolean): controls above-the-fold visibility on the frontend.
-- published (0/1 boolean): draft/publish toggle for CMS use.
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

-- ─── experience ───────────────────────────────────────────────────────────────
-- Work and education timeline entries.
-- type must be 'work' or 'education' — enforced by CHECK constraint.
-- published (0/1 boolean): allows hiding entries without deleting them.
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

-- ─── social_links ─────────────────────────────────────────────────────────────
-- External social profile links rendered by SocialLinksSection.vue.
-- icon field must match a key in the component's ICONS record.
-- visible (0/1 boolean): allows hiding a link without deleting it.
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

-- ─── media ────────────────────────────────────────────────────────────────────
-- Uploaded file metadata. Actual files stored in the filesystem / object storage.
-- filename is UNIQUE — prevents duplicate storage paths.
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
