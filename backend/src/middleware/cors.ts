// src/middleware/cors.ts — CORS configuration
// Only allows the configured production origin + localhost dev origins.
// No wildcard — this API accepts Authorization headers.

import { cors } from 'hono/cors'

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'https://nammon.men'

const ALLOWED_ORIGINS = [
  ALLOWED_ORIGIN,
  'http://localhost:5173',  // frontend dev
  'http://localhost:5174',  // n4mmon-dashboard dev
  'http://127.0.0.1:5173',
]

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return ALLOWED_ORIGIN  // non-browser / curl requests
    return ALLOWED_ORIGINS.includes(origin) ? origin : null
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: [],
  maxAge: 86400,  // 24h preflight cache
  credentials: true,
})
