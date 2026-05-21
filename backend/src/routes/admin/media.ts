// src/routes/admin/media.ts — media upload and listing
//
//   POST /api/admin/media/upload — upload file (multipart/form-data)
//   GET  /api/admin/media        — list all uploaded media

import { Hono } from 'hono'
import { join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { getDb } from '../../db/database.js'
import type { MediaRecord, AppVariables } from '../../types/index.js'

const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5 MB

// Allowlists for MIME type, extension, and magic bytes.
// Magic bytes: first N bytes that identify the true file format regardless of declared MIME.
type MimeRule = { exts: string[]; magic: Uint8Array; offset?: number; mask?: Uint8Array }
const MIME_RULES = new Map<string, MimeRule>([
  ['image/jpeg',      { exts: ['.jpg', '.jpeg'], magic: new Uint8Array([0xFF, 0xD8, 0xFF]) }],
  ['image/png',       { exts: ['.png'],          magic: new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) }],
  ['image/gif',       { exts: ['.gif'],          magic: new Uint8Array([0x47, 0x49, 0x46, 0x38]) }],
  ['image/webp',      { exts: ['.webp'],         magic: new Uint8Array([0x52, 0x49, 0x46, 0x46]) }],
  ['image/svg+xml',   { exts: ['.svg'],          magic: new Uint8Array([0x3C]) }],      // '<' — text-based; checked via sniffSvg()
  ['application/pdf', { exts: ['.pdf'],          magic: new Uint8Array([0x25, 0x50, 0x44, 0x46]) }], // %PDF
])

const ALLOWED_EXTENSIONS = new Set(
  [...MIME_RULES.values()].flatMap((r) => r.exts),
)

// Upload directory: relative to backend root or absolute
const UPLOAD_DIR_RAW = process.env.UPLOAD_DIR ?? '../public/assets/uploads'
const UPLOAD_DIR = UPLOAD_DIR_RAW.startsWith('/')
  ? UPLOAD_DIR_RAW
  : join(process.cwd(), UPLOAD_DIR_RAW)

// URL prefix used in stored `url` column (adjust to match nginx config)
const UPLOAD_URL_PREFIX = process.env.UPLOAD_URL_PREFIX ?? '/assets/uploads'

export const adminMediaRoutes = new Hono<{ Variables: AppVariables }>()

// Verify magic bytes of a buffer against the rule for the declared MIME type.
// SVGs are text-based — we check for an XML/SVG tag within the first 256 bytes.
function checkMagicBytes(buf: Uint8Array, mime: string): boolean {
  const rule = MIME_RULES.get(mime)
  if (!rule) return false

  if (mime === 'image/svg+xml') {
    const head = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, 256)).trimStart().toLowerCase()
    return head.startsWith('<svg') || head.startsWith('<?xml')
  }

  if (buf.length < rule.magic.length) return false
  for (let i = 0; i < rule.magic.length; i++) {
    if (buf[i] !== rule.magic[i]) return false
  }
  return true
}

// ─── GET /api/admin/media ─────────────────────────────────────────────────

adminMediaRoutes.get('/', (c) => {
  const db = getDb()
  const rows = db.query<MediaRecord, []>(
    'SELECT * FROM media ORDER BY uploaded_at DESC',
  ).all()
  return c.json(rows)
})

// ─── POST /api/admin/media/upload ────────────────────────────────────────

adminMediaRoutes.post('/upload', async (c) => {
  let formData: FormData
  try {
    formData = await c.req.formData()
  } catch {
    return c.json({ error: 'Failed to parse multipart form data', code: 'PARSE_ERROR' }, 400)
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return c.json({ error: 'Field "file" is required (multipart file upload)', code: 'MISSING_FILE' }, 400)
  }

  // 1. MIME type allowlist (declared by browser)
  if (!MIME_RULES.has(file.type)) {
    return c.json({
      error: `File type "${file.type}" is not allowed`,
      code: 'INVALID_MIME_TYPE',
    }, 400)
  }

  // 2. Size guard — before reading full buffer
  if (file.size > MAX_FILE_SIZE) {
    return c.json({
      error: `File exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      code: 'FILE_TOO_LARGE',
    }, 400)
  }

  // 3. Extension allowlist — derived from the declared MIME rule
  const rule = MIME_RULES.get(file.type)!
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext) || !rule.exts.includes(ext)) {
    return c.json({
      error: `Extension "${ext}" does not match MIME type "${file.type}"`,
      code: 'INVALID_EXTENSION',
    }, 400)
  }

  // 4. Magic-byte validation — read actual bytes, not browser-declared type
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  if (!checkMagicBytes(bytes, file.type)) {
    return c.json({ error: 'File content does not match declared MIME type', code: 'INVALID_FILE_CONTENT' }, 400)
  }

  // UUID filename — no predictable path, no user-controlled characters
  const filename = `${crypto.randomUUID()}${ext}`

  // Ensure upload directory exists
  try {
    mkdirSync(UPLOAD_DIR, { recursive: true })
  } catch {
    return c.json({ error: 'Upload directory could not be created', code: 'SERVER_ERROR' }, 500)
  }

  // Write file
  const destPath = join(UPLOAD_DIR, filename)
  try {
    writeFileSync(destPath, Buffer.from(buffer))
  } catch {
    return c.json({ error: 'Failed to write uploaded file', code: 'SERVER_ERROR' }, 500)
  }

  const url = `${UPLOAD_URL_PREFIX}/${filename}`
  const db = getDb()

  const result = db.prepare(
    'INSERT INTO media (filename, original_name, mime_type, size_bytes, url) VALUES (?, ?, ?, ?, ?)',
  ).run(filename, file.name, file.type, file.size, url)

  const row = db.query<MediaRecord, [number]>('SELECT * FROM media WHERE id = ?')
    .get(Number(result.lastInsertRowid))

  return c.json(row, 201)
})
