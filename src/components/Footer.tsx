import { useContent } from '../content/ContentContext.tsx'
import { Icon } from './Icon.tsx'
import { Reveal } from './Reveal.tsx'
import { Logo } from './Logo.tsx'
import { NavItemLink } from './NavItemLink.tsx'

const socials = [
  { icon: 'public', label: 'Website' },
  { icon: 'forum', label: 'Forum' },
  { icon: 'share', label: 'Delen' },
]

export function Footer() {
  const { nav, footer } = useContent().content

  return (
    <footer className="w-full bg-surface-container-low pt-16 pb-12 mt-12 border-t border-surface-container-highest">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-gutter flex flex-col items-center text-center">
        <Logo className="w-16 h-16 mb-6" />
        <nav className="flex flex-wrap justify-center gap-x-6 sm:gap-x-8 gap-y-3 mb-8" aria-label="Footermenu">
          {nav.map((item) => (
            <NavItemLink key={item.id} id={item.id} className="text-body-md text-on-surface-variant hover:text-on-surface transition-colors">
              {item.label}
            </NavItemLink>
          ))}
        </nav>
        <div className="flex gap-4 mb-8">
          {socials.map((s) => (
            <a key={s.icon} aria-label={s.label} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-all" href="#">
              <Icon name={s.icon} className="!text-[20px]" />
            </a>
          ))}
        </div>
        <p className="text-on-surface-variant text-body-sm">{footer.copyright}</p>
      </Reveal>
    </footer>
  )
}
