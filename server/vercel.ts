// Entry point of the Vercel Function that handles /api/* and /uploads/*.
// Bundled into .vercel/output by scripts/build-vercel.ts.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { finishApp } from './app.ts'

const app = finishApp()

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  // Private Blob stores connected with OIDC authenticate with the token Vercel adds to
  // each request. Make it available to @vercel/blob even if no request context is set.
  const oidcToken = req.headers['x-vercel-oidc-token']
  if (typeof oidcToken === 'string' && oidcToken) process.env.VERCEL_OIDC_TOKEN = oidcToken
  app(req, res)
}
