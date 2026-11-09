import express, { type ErrorRequestHandler, type Request } from 'express'
import helmet from 'helmet'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { defaultContent } from '../src/content/defaults.ts'
import { referencedUploads, validateContent, withDefaults } from '../src/content/schema.ts'
import type { SiteContent } from '../src/content/types.ts'
import { helmetOptions } from './security.ts'
import { createStorage, HttpError, type ImageType } from './storage.ts'

const IS_PRODUCTION = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''
const SESSION_TTL_MS = 8 * 60 * 60 * 1000
// Vercel Functions accept request bodies up to 4.5 MB
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_FAILURES = 10

const storage = createStorage(import.meta.dirname)
console.log(`Content storage: ${storage.description}`)

if (!ADMIN_PASSWORD) {
  console.warn('⚠  ADMIN_PASSWORD is not set — admin login is disabled. Copy .env.example to .env.')
} else if (ADMIN_PASSWORD.length < 12) {
  console.warn('⚠  ADMIN_PASSWORD is shorter than 12 characters. Use a long, unique password in production.')
}

// ---------- content ----------

async function loadContent(): Promise<SiteContent> {
  try {
    const saved = await storage.readContent()
    return saved ? withDefaults(saved) : defaultContent
  } catch (err) {
    console.error('Could not read content, using defaults:', err)
    return defaultContent
  }
}

// ---------- auth ----------

// Sessions are signed tokens "<expiry>.<nonce>.<signature>", so any server instance
// can check them without shared memory (needed on serverless hosting). The signing key
// also depends on the password: changing ADMIN_PASSWORD logs everyone out.
// Without SESSION_SECRET a random key is used, so restarting the server logs everyone out.
const SESSION_SECRET = process.env.SESSION_SECRET || (process.env.VERCEL ? '' : randomBytes(32).toString('hex'))
if (process.env.VERCEL && !SESSION_SECRET) console.warn('⚠  SESSION_SECRET is not set — admin login is disabled.')
else if (SESSION_SECRET.length < 32) console.warn('⚠  SESSION_SECRET is shorter than 32 characters.')
const SESSION_KEY = createHmac('sha256', SESSION_SECRET).update(`session:${ADMIN_PASSWORD}`).digest()
const LOGIN_ENABLED = ADMIN_PASSWORD.length > 0 && SESSION_SECRET.length > 0

// Failed login attempts per IP: protects the password against guessing.
// On serverless hosting this is kept per instance, so it is a best-effort limit.
const loginFailures = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of loginFailures) if (entry.resetAt < now) loginFailures.delete(ip)
}, 10 * 60 * 1000).unref()

function sign(payload: string): string {
  return createHmac('sha256', SESSION_KEY).update(payload).digest('hex')
}

function createSessionToken(): string {
  const payload = `${Date.now() + SESSION_TTL_MS}.${randomBytes(16).toString('hex')}`
  return `${payload}.${sign(payload)}`
}

function passwordMatches(input: string): boolean {
  // Compare fixed-length digests so the comparison takes the same time for any input length
  const a = createHmac('sha256', SESSION_KEY).update(input).digest()
  const b = createHmac('sha256', SESSION_KEY).update(ADMIN_PASSWORD).digest()
  return LOGIN_ENABLED && timingSafeEqual(a, b)
}

function isAuthorized(req: Request): boolean {
  if (!LOGIN_ENABLED) return false
  const match = /^Bearer ((\d{13,})\.[a-f0-9]{32})\.([a-f0-9]{64})$/.exec(req.get('authorization') ?? '')
  if (!match) return false
  const [, payload, expires, signature] = match
  const valid = timingSafeEqual(Buffer.from(sign(payload), 'hex'), Buffer.from(signature, 'hex'))
  return valid && Number(expires) > Date.now()
}

const requireAuth: express.RequestHandler = (req, res, next) => {
  if (isAuthorized(req)) next()
  else res.status(401).json({ error: 'Niet ingelogd' })
}

// ---------- image uploads ----------

// The file type is decided by the file's own bytes, never by its name or the
// browser's claim. SVG is deliberately not allowed (it can contain scripts).
function detectImageType(buf: Buffer): ImageType | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  if (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a') return 'gif'
  return null
}

// ---------- app ----------

export const app = express()
app.disable('x-powered-by')
// Vercel sets X-Forwarded-For itself. Behind another reverse proxy (nginx, Render, …)
// set TRUST_PROXY=1 so rate limiting sees real client IPs.
if (process.env.VERCEL) app.set('trust proxy', true)
else if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY)

app.use(helmet(helmetOptions(IS_PRODUCTION && process.env.FORCE_HTTPS !== '0')))

// API responses must never be cached by browsers or proxies
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.get('/api/content', async (_req, res) => {
  res.json(await loadContent())
})

app.post('/api/login', express.json({ limit: '2kb' }), (req, res) => {
  if (!LOGIN_ENABLED) {
    res.status(503).json({ error: 'Inloggen is uitgeschakeld: ADMIN_PASSWORD of SESSION_SECRET is niet ingesteld op de server' })
    return
  }

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
  res.json({ token: createSessionToken() })
})

// Tokens are not stored on the server: logging out removes the token in the browser
app.post('/api/logout', (_req, res) => {
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
  await storage.writeContent(JSON.stringify(content, null, 2))
  // Finish the clean-up before answering: serverless functions may stop right after the response
  await storage.removeUnusedUploads(referencedUploads(content)).catch((err) => console.error('Upload clean-up failed:', err))
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
    const name = `${randomBytes(16).toString('hex')}.${type}`
    await storage.writeUpload(name, body, type)
    res.status(201).json({ url: `/uploads/${name}` })
  },
)

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Niet gevonden' })
})

app.use('/uploads', storage.serveUploads)

/** Registers the error handler; call after any extra routes have been added. */
export function finishApp(): typeof app {
  // Errors: short message for the client, details only in the server log
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = typeof err?.status === 'number' ? err.status : 500
    if (status >= 500 && !(err instanceof HttpError)) console.error(err)
    const message =
      err instanceof HttpError
        ? err.message
        : status === 413
          ? 'Bestand of inhoud is te groot (afbeeldingen max 4 MB)'
          : status === 404
            ? 'Niet gevonden'
            : status < 500
              ? 'Ongeldig verzoek'
              : 'Er ging iets mis op de server'
    if (!res.headersSent) res.status(status).json({ error: message })
    else res.destroy()
  }
  app.use(errorHandler)
  return app
}
