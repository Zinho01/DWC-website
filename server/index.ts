// Node server for local development and for hosts that run a normal Node process.
// On Vercel the same app runs as a function instead (server/vercel.ts).
import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ENV_FILE = path.resolve(import.meta.dirname, '../.env')
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE)

// Imported after .env is loaded, because the app reads its settings on import
const { app, finishApp } = await import('./app.ts')

const PORT = Number(process.env.PORT ?? 3001)
const DIST_DIR = path.resolve(import.meta.dirname, '../dist')

// Production: serve the built front-end
if (process.env.NODE_ENV === 'production' && existsSync(DIST_DIR)) {
  app.use('/assets', express.static(path.join(DIST_DIR, 'assets'), { immutable: true, maxAge: '1y' }))
  app.use(express.static(DIST_DIR, { index: false }))
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

finishApp().listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
