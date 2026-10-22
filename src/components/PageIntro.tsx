import type { ReactNode } from 'react'
import { Icon } from './Icon.tsx'

interface PageIntroProps {
  badge?: string
  badgeIcon?: string
  meta?: ReactNode // shown next to the badge, e.g. "Laatste update: …"
  title: string
  intro: string
}

// Opening block of a sub page: badge, big title, intro text. Animates in on load.
export function PageIntro({ badge, badgeIcon, meta, title, intro }: PageIntroProps) {
  return (
    <header className="max-w-3xl">
      {(badge || meta) && (
        <div className="fade-up flex flex-wrap items-center gap-3 mb-5">
          {badge && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-white/5 text-primary text-label-lg uppercase tracking-[0.12em]">
              {badgeIcon && <Icon name={badgeIcon} className="!text-[16px]" />}
              {badge}
            </span>
          )}
          {meta && <span className="text-body-sm text-on-surface-variant">{meta}</span>}
        </div>
      )}
      <h1 className="fade-up font-headline text-headline-lg-mobile sm:text-headline-lg md:text-headline-xl mb-5 text-balance" style={{ animationDelay: '100ms' }}>
        {title}
      </h1>
      {intro && (
        <p className="fade-up text-body-md md:text-body-lg text-on-surface-variant" style={{ animationDelay: '200ms' }}>
          {intro}
        </p>
      )}
    </header>
  )
}
