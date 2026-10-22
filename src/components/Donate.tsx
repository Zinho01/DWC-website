import { useContent } from '../content/ContentContext.tsx'
import { SafeLink } from './SafeLink.tsx'
import { Icon } from './Icon.tsx'
import { Reveal } from './Reveal.tsx'

export function Donate() {
  const { donate } = useContent().content

  return (
    <section id="donaties" className="py-16 md:py-24 px-4 sm:px-gutter max-w-7xl mx-auto w-full">
      <Reveal className="relative bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container rounded-3xl px-6 py-10 sm:p-12 overflow-hidden shadow-[0_0_50px_rgba(160,120,255,0.15)] border border-primary/20 text-center">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <Icon name="volunteer_activism" className="!text-5xl text-primary mb-4" />
          <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg mb-4">{donate.title}</h2>
          <p className="text-body-md md:text-body-lg text-on-surface-variant mb-8">{donate.text}</p>
          <SafeLink
            className="inline-block bg-white text-black hover:bg-gray-100 font-bold px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
            href={donate.buttonUrl}
          >
            {donate.buttonLabel}
          </SafeLink>
        </div>
      </Reveal>
    </section>
  )
}
