import { useContent } from '../content/ContentContext.tsx'
import { SafeLink } from './SafeLink.tsx'
import { Icon } from './Icon.tsx'
import { Logo } from './Logo.tsx'

export function Hero() {
  const { hero } = useContent().content

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center pt-20 px-4 sm:px-gutter"
      style={{ backgroundImage: "url('/images/hero-nebula.jpg')" }}
    >
      <div className="absolute inset-0 bg-surface/85 backdrop-blur-sm" />
      <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center py-16 md:py-24 z-10">
        <Logo className="fade-up w-28 h-28 md:w-36 md:h-36 mb-8 ring-2 ring-primary/40 shadow-[0_0_40px_rgba(160,120,255,0.45)]" />
        <h1 style={{ animationDelay: '120ms' }} className="fade-up font-headline text-headline-lg-mobile sm:text-headline-lg md:text-headline-xl mb-6 text-on-surface text-balance">{hero.title}</h1>
        <p style={{ animationDelay: '240ms' }} className="fade-up text-body-md md:text-body-lg text-on-surface-variant max-w-2xl mb-10">{hero.text}</p>
        <div className="fade-up" style={{ animationDelay: '360ms' }}>
        <SafeLink
          href={hero.buttonUrl}
          className="bg-white text-black hover:bg-gray-100 font-bold px-8 py-4 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
        >
          {hero.buttonLabel}
        </SafeLink>
        </div>
      </div>
      <a href="#nieuws" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce flex flex-col items-center text-on-surface-variant">
        <span className="text-label-md mb-1">{hero.scrollLabel}</span>
        <Icon name="arrow_downward" />
      </a>
    </section>
  )
}
