// Builds the site for Vercel in the Build Output API format (.vercel/output):
//   static/            the Vite build (dist/)
//   functions/api.func the Express app (server/vercel.ts) bundled into one file
//   config.json        routing: static files, /api + /uploads to the function, the rest to index.html
// Run after `vite build` (see the build:vercel script in package.json).
import { build } from 'esbuild'
import helmet from 'helmet'
import { cp, rm, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { helmetOptions } from '../server/security.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, '.vercel/output')
const FUNC = path.join(OUT, 'functions/api.func')

// Static pages get the same security headers as the Express server sends
function securityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const res = {
    setHeader: (name: string, value: string | number) => (headers[name] = String(value)),
    removeHeader: (name: string) => delete headers[name],
  } as unknown as ServerResponse
  helmet(helmetOptions(true))({} as IncomingMessage, res, () => {})
  return headers
}

await rm(OUT, { recursive: true, force: true })
await cp(path.join(ROOT, 'dist'), path.join(OUT, 'static'), { recursive: true })

await build({
  entryPoints: [path.join(ROOT, 'server/vercel.ts')],
  outfile: path.join(FUNC, 'index.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  // Lets bundled CommonJS packages (express…) require Node's built-in modules
  banner: { js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);" },
  logLevel: 'warning',
})

await writeFile(
  path.join(FUNC, '.vc-config.json'),
  JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', shouldAddHelpers: false, supportsResponseStreaming: true }, null, 2),
)

await writeFile(
  path.join(OUT, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '^/assets/(.*)$', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
        // The function sets its own security headers
        { src: '^/(?!api(?:/|$)|uploads(?:/|$)).*$', headers: securityHeaders(), continue: true },
        { handle: 'filesystem' },
        { src: '^/(?:api|uploads)(?:/.*)?$', dest: '/api' },
        // Client-side routes (/contact, /admin, …) all load the single-page app
        { src: '^/.*$', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
)

console.log('Vercel build output written to .vercel/output')
