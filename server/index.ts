import express, { type ErrorRequestHandler, type Request } from 'express'
import helmet from 'helmet'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { defaultContent } from '../src/content/defaults.ts'
import { referencedUploads, validateContent, withDefaults } from '../src/content/schema.ts'
import type { SiteContent } from '../src/content/types.ts'

const ENV_FILE = path.resolve(import.meta.dirname, '../.env')
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE)

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT ?? 3001)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''
const CONTENT_FILE = path.join(import.meta.dirname, 'content.json')
const UPLOAD_DIR = path.join(import.meta.dirname, 'uploads')
const DIST_DIR = path.resolve(import.meta.dirname, '../dist')
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_FAILURES = 10

if (!ADMIN_PASSWORD) {
  console.warn('⚠  ADMIN_PASSWORD is not set — admin login is disabled. Copy .env.example to .env.')
} else if (ADMIN_PASSWORD.length < 12) {
  console.warn('⚠  ADMIN_PASSWORD is shorter than 12 characters. Use a long, unique password in production.')
}

// ---------- content storage ----------

async function loadContent(): Promise<SiteContent> {
  try {
    return withDefaults(JSON.parse(await readFile(CONTENT_FILE, 'utf8')))
  } catch {
    return defaultContent
  }
}

async function writeAtomic(file: string, data: string | Buffer): Promise<void> {
  const tmp = `${file}.${randomBytes(6).toString('hex')}.tmp`
  await writeFile(tmp, data)
  await rename(tmp, file)
}

// Remove uploads no longer used by the content. Recent files are kept because an
// admin may have uploaded them for changes that are not saved yet.
async function removeUnusedUploads(content: SiteContent): Promise<void> {
  const used = referencedUploads(content)
  const files = await readdir(UPLOAD_DIR).catch(() => [] as string[])
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  for (const file of files) {
    if (used.has(`/uploads/${file}`)) continue
    const full = path.join(UPLOAD_DIR, file)
    const info = await stat(full).catch(() => null)
    if (info && info.mtimeMs < cutoff) await unlink(full).catch(() => {})
  }
}

// ---------- auth ----------

// In-memory sessions: token -> expiry timestamp. Restarting the server logs everyone out.
const sessions = new Map<string, number>()
// Failed login attempts per IP: protects the password against guessing.
const loginFailures = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [token, expires] of sessions) if (expires < now) sessions.delete(token)
  for (const [ip, entry] of loginFailures) if (entry.resetAt < now) loginFailures.delete(ip)
}, 10 * 60 * 1000).unref()

function passwordMatches(input: string): boolean {
  const a = Buffer.from(input)
  const b = Buffer.from(ADMIN_PASSWORD)
  return ADMIN_PASSWORD.length > 0 && a.length === b.length && timingSafeEqual(a, b)
}

function bearerToken(req: Request): string | null {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(req.get('authorization') ?? '')
  return match ? match[1] : null
}

function isAuthorized(req: Request): boolean {
  const token = bearerToken(req)
  if (!token) return false
  const expires = sessions.get(token)
  if (!expires || expires < Date.now()) {
    sessions.delete(token)
    return false
  }
  return true
}

const requireAuth: express.RequestHandler = (req, res, next) => {
  if (isAuthorized(req)) next()
  else res.status(401).json({ error: 'Niet ingelogd' })
}

// ---------- image uploads ----------

// The file type is decided by the file's own bytes, never by its name or the
// browser's claim. SVG is deliberately not allowed (it can contain scripts).
function detectImageType(buf: Buffer): 'jpg' | 'png' | 'webp' | 'gif' | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  if (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a') return 'gif'
  return null
}

// ---------- app ----------

const app = express()
app.disable('x-powered-by')
// Behind a reverse proxy (nginx, Render, …) set TRUST_PROXY=1 so rate limiting sees real client IPs
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY)

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        ...(IS_PRODUCTION && process.env.FORCE_HTTPS !== '0' ? { upgradeInsecureRequests: [] } : {}),
      },
    },
    // HSTS only makes sense once the site is served over HTTPS
    strictTransportSecurity: IS_PRODUCTION && process.env.FORCE_HTTPS !== '0',
  }),
)

// API responses must never be cached by browsers or proxies
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.get('/api/content', async (_req, res) => {
  res.json(await loadContent())
})

app.post('/api/login', express.json({ limit: '2kb' }), (req, res) => {
  const ip = req.ip ?? 'unknown'
  const now = Date.now()
  const failures = loginFailures.get(ip)
  if (failures && failures.resetAt > now && failures.count >= LOGIN_MAX_FAILURES) {
    res.set('Retry-After', String(Math.ceil((failures.resetAt - now) / 1000)))
    res.status(429).json({ error: 'Te veel mislukte pogingen. Probeer het over 15 minuten opnieuw.' })
    return
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!passwordMatches(password)) {
    const entry = failures && failures.resetAt > now ? failures : { count: 0, resetAt: now + LOGIN_WINDOW_MS }
    entry.count++
    loginFailures.set(ip, entry)
    res.status(401).json({ error: 'Onjuist wachtwoord' })
    return
  }

  loginFailures.delete(ip)
  const token = randomBytes(32).toString('hex')
  sessions.set(token, now + SESSION_TTL_MS)
  res.json({ token })
})

app.post('/api/logout', (req, res) => {
  const token = bearerToken(req)
  if (token) sessions.delete(token)
  res.status(204).end()
})

app.get('/api/session', (req, res) => {
  res.status(isAuthorized(req) ? 204 : 401).end()
})

app.put('/api/content', requireAuth, express.json({ limit: '1mb' }), async (req, res) => {
  const errors = validateContent(req.body)
  if (errors.length > 0) {
    res.status(400).json({ error: `Ongeldige inhoud: ${errors[0]}`, details: errors.slice(0, 20) })
    return
  }
  // Re-run the default merge: drops unknown keys and keeps menu anchors fixed
  const content = withDefaults(req.body)
  await writeAtomic(CONTENT_FILE, JSON.stringify(content, null, 2))
  void removeUnusedUploads(content)
  res.json(content)
})

app.post(
  '/api/upload',
  requireAuth,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], limit: MAX_UPLOAD_BYTES }),
  async (req, res) => {
    const body = req.body
    if (!Buffer.isBuffer(body) || body.length === 0) {
      res.status(415).json({ error: 'Alleen JPG, PNG, WebP of GIF afbeeldingen zijn toegestaan' })
      return
    }
    const type = detectImageType(body)
    if (!type) {
      res.status(415).json({ error: 'Dit bestand is geen geldige JPG, PNG, WebP of GIF afbeelding' })
      return
    }
    await mkdir(UPLOAD_DIR, { recursive: true })
    const name = `${randomBytes(16).toString('hex')}.${type}`
    await writeAtomic(path.join(UPLOAD_DIR, name), body)
    res.status(201).json({ url: `/uploads/${name}` })
  },
)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Niet gevonden' })
})

// Uploaded images: random file names never change, so they can be cached forever
app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    dotfiles: 'deny',
    index: false,
    immutable: true,
    maxAge: '1y',
    fallthrough: false,
  }),
)

// Production: serve the built front-end
if (IS_PRODUCTION && existsSync(DIST_DIR)) {
  app.use('/assets', express.static(path.join(DIST_DIR, 'assets'), { immutable: true, maxAge: '1y' }))
  app.use(express.static(DIST_DIR, { index: false }))
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

// Errors: short message for the client, details only in the server log
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === 'number' ? err.status : 500
  if (status >= 500) console.error(err)
  const message =
    status === 413 ? 'Bestand of inhoud is te groot (afbeeldingen max 5 MB)' : status === 404 ? 'Niet gevonden' : status < 500 ? 'Ongeldig verzoek' : 'Er ging iets mis op de server'
  if (!res.headersSent) res.status(status).json({ error: message })
}
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
