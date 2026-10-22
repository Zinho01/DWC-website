import type { SiteContent } from '../content/types.ts'

const TOKEN_KEY = 'dwc-admin-token'

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable: the session just won't survive a reload
  }
}

export class UnauthorizedError extends Error {}

export async function login(password: string): Promise<string> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (res.status === 401) throw new UnauthorizedError('Onjuist wachtwoord')
  if (!res.ok) throw new Error('Inloggen mislukt — draait de server?')
  const { token } = (await res.json()) as { token: string }
  return token
}

export async function checkSession(token: string): Promise<boolean> {
  const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } })
  return res.ok
}

export async function logout(token: string): Promise<void> {
  await fetch('/api/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadImage(file: File): Promise<string> {
  if (!UPLOAD_TYPES.includes(file.type)) throw new Error('Kies een JPG, PNG, WebP of GIF afbeelding')
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Afbeelding is groter dan 5 MB')
  const token = getToken()
  if (!token) throw new UnauthorizedError('Sessie verlopen, log opnieuw in')
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': file.type, Authorization: `Bearer ${token}` },
    body: file,
  })
  if (res.status === 401) throw new UnauthorizedError('Sessie verlopen, log opnieuw in')
  const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
  if (!res.ok || !body?.url) throw new Error(body?.error ?? 'Uploaden mislukt')
  return body.url
}

export async function saveContent(token: string, content: SiteContent): Promise<SiteContent> {
  const res = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(content),
  })
  if (res.status === 401) throw new UnauthorizedError('Sessie verlopen, log opnieuw in')
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? 'Opslaan mislukt')
  }
  return (await res.json()) as SiteContent
}
