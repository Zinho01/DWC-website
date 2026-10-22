import { defaultContent } from './defaults.ts'
import { isIconName, isSafeHref, isUploadPath, MAX_LIST_LENGTH, MAX_TEXT_LENGTH } from './safety.ts'
import type { SiteContent } from './types.ts'

// The defaults double as the schema. Their shape is derived once: every list item
// must match the merged shape of *all* default items of that list, so a list that
// is empty in one place (e.g. the bullets of one privacy section) is still checked
// against the items used elsewhere. A list with no default items at all must stay empty.

type Shape = { kind: 'string' | 'number' | 'boolean' } | { kind: 'object'; keys: Record<string, Shape> } | { kind: 'array'; item: Shape | null }

function deriveShape(value: unknown): Shape {
  if (Array.isArray(value)) {
    return { kind: 'array', item: value.reduce<Shape | null>((acc, item) => mergeShapes(acc, deriveShape(item)), null) }
  }
  if (value !== null && typeof value === 'object') {
    const keys: Record<string, Shape> = {}
    for (const [key, v] of Object.entries(value)) keys[key] = deriveShape(v)
    return { kind: 'object', keys }
  }
  const kind = typeof value
  if (kind !== 'string' && kind !== 'number' && kind !== 'boolean') throw new Error(`Unsupported default value: ${kind}`)
  return { kind }
}

function mergeShapes(a: Shape | null, b: Shape | null): Shape | null {
  if (!a) return b
  if (!b) return a
  if (a.kind === 'object' && b.kind === 'object') {
    const keys = { ...a.keys }
    for (const [key, shape] of Object.entries(b.keys)) keys[key] = mergeShapes(keys[key] ?? null, shape)!
    return { kind: 'object', keys }
  }
  if (a.kind === 'array' && b.kind === 'array') return { kind: 'array', item: mergeShapes(a.item, b.item) }
  return a
}

const contentShape = deriveShape(defaultContent)

function emptyValue(shape: Shape): unknown {
  switch (shape.kind) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return Object.fromEntries(Object.entries(shape.keys).map(([key, s]) => [key, emptyValue(s)]))
  }
}

// ---------- validation ----------

function checkValue(value: unknown, shape: Shape, path: string, errors: string[]): void {
  if (shape.kind === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${path} moet een lijst zijn`)
      return
    }
    if (value.length > MAX_LIST_LENGTH) errors.push(`${path} heeft te veel items (max ${MAX_LIST_LENGTH})`)
    if (!shape.item) {
      if (value.length > 0) errors.push(`${path} moet leeg zijn`)
      return
    }
    value.forEach((item, i) => checkValue(item, shape.item!, `${path}[${i}]`, errors))
    return
  }
  if (shape.kind === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${path} moet een object zijn`)
      return
    }
    for (const [key, s] of Object.entries(shape.keys)) {
      checkValue((value as Record<string, unknown>)[key], s, path ? `${path}.${key}` : key, errors)
    }
    return
  }
  if (typeof value !== shape.kind) {
    errors.push(`${path} moet van type ${shape.kind} zijn`)
    return
  }
  if (typeof value === 'string') checkString(value, path, errors)
}

// Extra rules for strings, based on the field name
function checkString(value: string, path: string, errors: string[]): void {
  const key = path.slice(path.lastIndexOf('.') + 1)
  if (value.length > MAX_TEXT_LENGTH) errors.push(`${path} is te lang (max ${MAX_TEXT_LENGTH} tekens)`)
  if (key.endsWith('Url') && !isSafeHref(value)) errors.push(`${path} is geen geldige link (gebruik #sectie, /pad, https://…, mailto: of tel:)`)
  if (key === 'url' && !isSafeHref(value)) errors.push(`${path} is geen geldige link`)
  if (key === 'image' && value !== '' && !isUploadPath(value)) errors.push(`${path} moet een geüploade afbeelding zijn`)
  if (key === 'icon' && !isIconName(value)) errors.push(`${path} is geen geldige icoonnaam`)
}

export function validateContent(value: unknown): string[] {
  const errors: string[] = []
  checkValue(value, contentShape, '', errors)
  return errors
}

// ---------- normalising stored content ----------

// Keep only known keys; fill missing ones from the defaults (or empty values inside list items).
function fill(value: unknown, defaults: unknown, shape: Shape): unknown {
  if (shape.kind === 'array') {
    if (!Array.isArray(value)) return defaults ?? []
    const item = shape.item
    return item ? value.map((v) => fill(v, undefined, item)) : []
  }
  if (shape.kind === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return defaults ?? emptyValue(shape)
    const out: Record<string, unknown> = {}
    for (const [key, s] of Object.entries(shape.keys)) {
      out[key] = fill((value as Record<string, unknown>)[key], (defaults as Record<string, unknown> | undefined)?.[key], s)
    }
    return out
  }
  return typeof value === shape.kind ? value : (defaults ?? emptyValue(shape))
}

export function withDefaults(value: unknown): SiteContent {
  const content = fill(value, defaultContent, contentShape) as SiteContent
  // Menu targets are fixed by the site layout: only the labels are editable.
  content.nav = defaultContent.nav.map((item, i) => ({ id: item.id, label: content.nav[i]?.label ?? item.label }))
  return content
}

// All uploaded images that the content refers to
export function referencedUploads(content: SiteContent): Set<string> {
  const images = [
    content.history.image,
    ...content.news.items.map((i) => i.image),
    ...content.events.items.map((i) => i.image),
    ...content.team.members.map((m) => m.image),
  ]
  return new Set(images.filter(isUploadPath))
}
