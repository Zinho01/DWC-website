import type { Accent } from '../content/types.ts'

// Full class names so Tailwind can see them at build time
export const accentText: Record<Accent, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
}

export const accentBorder: Record<Accent, string> = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  tertiary: 'border-tertiary',
}
