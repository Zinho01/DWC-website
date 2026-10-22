import type { SectionHeading } from '../content/types.ts'
import { Reveal } from './Reveal.tsx'

interface SectionHeaderProps {
  heading: SectionHeading
  eyebrowClass?: string
}

export function SectionHeader({ heading, eyebrowClass = 'text-secondary' }: SectionHeaderProps) {
  return (
    <Reveal className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
      <span className={`${eyebrowClass} font-bold text-label-lg uppercase tracking-wider block mb-2`}>{heading.eyebrow}</span>
      <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg mb-4">{heading.title}</h2>
      {heading.intro && <p className="text-body-md text-on-surface-variant">{heading.intro}</p>}
    </Reveal>
  )
}
