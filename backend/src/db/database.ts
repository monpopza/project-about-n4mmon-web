// src/db/database.ts — SQLite connection singleton + DDL migration runner
// Uses bun:sqlite (built-in — no extra package needed).

import { Database } from 'bun:sqlite'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

const DB_PATH = process.env.DATABASE_PATH ?? './data/portfolio.db'

// Ensure the data directory exists before opening the DB file.
const dbDir = DB_PATH.startsWith('/') ? DB_PATH.replace(/\/[^/]+$/, '') : join(process.cwd(), DB_PATH.replace(/\/[^/]+$/, ''))
try {
  mkdirSync(dbDir, { recursive: true })
} catch {
  // Directory already exists — continue.
}

let _db: Database | null = null

export function getDb(): Database {
  if (_db) return _db
  const dbPath = DB_PATH.startsWith('/') ? DB_PATH : join(process.cwd(), DB_PATH)
  _db = new Database(dbPath, { create: true })
  // WAL mode — better concurrent read performance.
  _db.exec('PRAGMA journal_mode = WAL;')
  _db.exec('PRAGMA foreign_keys = ON;')
  runMigrations(_db)
  return _db
}

// ─── Schema ────────────────────────────────────────────────────────────────

function runMigrations(db: Database): void {
  db.exec(`
    -- Migration 001 — initial schema

    CREATE TABLE IF NOT EXISTS profile_meta (
      id            INTEGER PRIMARY KEY CHECK (id = 1),
      name          TEXT    NOT NULL DEFAULT '',
      title         TEXT    NOT NULL DEFAULT '',
      tagline       TEXT    NOT NULL DEFAULT '',
      bio           TEXT    NOT NULL DEFAULT '',
      avatar        TEXT    NOT NULL DEFAULT '',
      resume        TEXT    NOT NULL DEFAULT '',
      email         TEXT    NOT NULL DEFAULT '',
      github        TEXT    NOT NULL DEFAULT '',
      linkedin      TEXT    NOT NULL DEFAULT '',
      twitter       TEXT    NOT NULL DEFAULT '',
      seo_title     TEXT    NOT NULL DEFAULT '',
      seo_description TEXT  NOT NULL DEFAULT '',
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS skill_categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      category   TEXT    NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skill_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
      label       TEXT    NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      tech        TEXT    NOT NULL DEFAULT '[]',
      github      TEXT    NOT NULL DEFAULT '',
      live        TEXT    NOT NULL DEFAULT '',
      featured    INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
      published   INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS experience (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      company     TEXT    NOT NULL,
      role        TEXT    NOT NULL,
      period      TEXT    NOT NULL DEFAULT '',
      description TEXT    NOT NULL DEFAULT '',
      type        TEXT    NOT NULL DEFAULT 'work' CHECK (type IN ('work', 'education')),
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      label      TEXT    NOT NULL,
      url        TEXT    NOT NULL,
      icon       TEXT    NOT NULL DEFAULT '',
      desc       TEXT    NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS posts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT    NOT NULL,
      slug         TEXT    NOT NULL UNIQUE,
      excerpt      TEXT    NOT NULL DEFAULT '',
      body         TEXT    NOT NULL DEFAULT '',
      published    INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
      published_at TEXT,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      filename      TEXT    NOT NULL,
      original_name TEXT    NOT NULL,
      mime_type     TEXT    NOT NULL DEFAULT '',
      size_bytes    INTEGER NOT NULL DEFAULT 0,
      url           TEXT    NOT NULL,
      uploaded_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `)
}
