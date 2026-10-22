// Shared by the server (validation) and the front-end (rendering), so a bad value
// can neither be saved nor end up in the page.

export const MAX_TEXT_LENGTH = 5000
export const MAX_LIST_LENGTH = 50

// Uploaded images are always stored by the server under a random name.
const UPLOAD_PATH = /^\/uploads\/[a-f0-9]{32}\.(jpg|png|webp|gif)$/

export function isUploadPath(value: string): boolean {
  return UPLOAD_PATH.test(value)
}

// Links may point to a section (#…), a page on this site (/…), a website, e-mail or phone.
// Everything else (javascript:, data:, protocol-relative //…) is refused.
export function isSafeHref(value: string): boolean {
  if (value === '' || value.startsWith('#')) return true
  if (value.startsWith('/') && !value.startsWith('//')) return true
  return /^(https?:\/\/|mailto:|tel:)[^\s]+$/i.test(value)
}

export function safeHref(value: string): string {
  return isSafeHref(value) ? value : '#'
}

// Material Symbols names: lowercase letters, digits and underscores.
export function isIconName(value: string): boolean {
  return /^[a-z0-9_]{1,40}$/.test(value)
}
