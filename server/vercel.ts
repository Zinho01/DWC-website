// Entry point of the Vercel Function that handles /api/* and /uploads/*.
// Bundled into .vercel/output by scripts/build-vercel.ts.
import { finishApp } from './app.ts'

export default finishApp()
