-- Migration: 002_blog.sql
-- Project:   project-about-n4mmon-web — Portfolio CMS backend
-- Database:  SQLite via bun:sqlite (backend/data/portfolio.db)
-- Author:    @dba
-- Created:   2026-05-21
-- Depends:   001_initial.sql (must run first)
-- Idempotent: YES — IF NOT EXISTS guard on CREATE TABLE and all indexes
--
-- Tables created in this migration:
--   posts — blog articles stored as Markdown
-- ─────────────────────────────────────────────────────────────────────────────

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ─── posts ────────────────────────────────────────────────────────────────────
-- Blog articles stored as Markdown in the content column.
-- slug is UNIQUE — used as the URL-safe identifier (/blog/<slug>).
-- published (0/1 boolean): 0 = draft, 1 = live.
-- published_at is nullable — set when first published; used for display ordering.
-- content stores raw Markdown; rendering is the frontend's responsibility.
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

-- Query patterns:
--   List published posts, newest first:      WHERE published=1 ORDER BY published_at DESC
--   Fetch single post by slug:               WHERE slug = ?
--   Admin list all posts (drafts included):  ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_slug
  ON posts (slug);

CREATE INDEX IF NOT EXISTS idx_posts_published_at
  ON posts (published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON posts (created_at DESC);
