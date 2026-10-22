import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useContent } from '../content/ContentContext.tsx'
import type { NavItem } from '../content/types.ts'
import { Icon } from './Icon.tsx'
import { Logo } from './Logo.tsx'
import { isPageItem, NavItemLink, PAGE_ROUTES } from './NavItemLink.tsx'
import { useScrollSpy } from './useScrollSpy.ts'

function useScrolled(offset = 24): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [offset])
  return scrolled
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function Header() {
  const { content } = useContent()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  // Only home page sections take part in scroll-spy; on a page, that page is active
  const sectionIds = useMemo(() => content.nav.map((n) => n.id).filter((id) => !isPageItem(id)), [content.nav])
  const activeSection = useScrollSpy(sectionIds, 120, pathname)
  const activePage = Object.entries(PAGE_ROUTES).find(([, route]) => route === pathname)?.[0]
  const active = activePage ?? (pathname === '/' ? activeSection : '')
  const scrolled = useScrolled()
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-3 sm:inset-x-6 z-50 mx-auto max-w-6xl rounded-full border transition-all duration-300 motion-reduce:transition-none ${
          scrolled
            ? 'top-2 bg-surface-container/85 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35),0_0_24px_rgba(160,120,255,0.12)]'
            : 'top-3 sm:top-4 bg-surface-container/55 border-white/[0.08] shadow-[0_8px_32px_rgba(139,92,246,0.12)]'
        } backdrop-blur-xl`}
      >
        <div className={`flex items-center justify-between gap-3 pl-2 pr-2 sm:pl-3 transition-[height] duration-300 motion-reduce:transition-none ${scrolled ? 'h-14' : 'h-16'}`}>
          <NavItemLink id="home" className="flex items-center gap-3 min-w-0 rounded-full pr-2 focus-visible:outline-2 focus-visible:outline-secondary">
            <Logo className={`shrink-0 ring-1 ring-white/15 transition-all duration-300 ${scrolled ? 'w-9 h-9' : 'w-10 h-10'}`} alt="" />
            <span className="font-headline text-[15px] sm:text-lg tracking-tight text-on-surface truncate lg:hidden xl:inline">{content.siteName}</span>
            <span className="font-headline text-lg tracking-tight text-on-surface hidden lg:inline xl:hidden" title={content.siteName}>
              {initials(content.siteName)}
            </span>
          </NavItemLink>

          <DesktopLinks items={content.nav} active={active} />

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/admin"
              aria-label="Beheer"
              title="Beheer"
              className="hidden lg:flex w-10 h-10 rounded-full bg-primary/90 hover:bg-primary items-center justify-center shadow-[0_0_16px_rgba(208,188,255,0.35)] transition-colors"
            >
              <Icon name="person" className="text-on-primary !text-[20px]" />
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-white/10 transition-colors"
              aria-label="Menu openen"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside the header: its backdrop-filter would otherwise trap position:fixed */}
      {menuOpen && <MobileMenu items={content.nav} active={active} siteName={content.siteName} onClose={closeMenu} />}
    </>
  )
}

function DesktopLinks({ items, active }: { items: NavItem[]; active: string }) {
  const listRef = useRef<HTMLUListElement>(null)
  const [indicator, setIndicator] = useState<CSSProperties | null>(null)

  // Move the glowing pill behind the active link
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      // measure the <li>: it is positioned (so links paint above the indicator), which makes it the links' offsetParent
      const item = list.querySelector<HTMLElement>(`[data-id="${active}"]`)?.parentElement
      setIndicator(item && item.offsetWidth > 0 ? { left: item.offsetLeft, width: item.offsetWidth } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    void document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [active, items])

  return (
    <nav aria-label="Hoofdmenu" className="hidden lg:block min-w-0">
      <ul ref={listRef} className="relative flex items-center">
        {indicator && (
          <li
            aria-hidden="true"
            className="absolute inset-y-0 rounded-full bg-primary-container/20 ring-1 ring-primary/35 shadow-[0_0_18px_rgba(160,120,255,0.35)] transition-[left,width] duration-300 ease-out motion-reduce:transition-none pointer-events-none"
            style={indicator}
          />
        )}
        {items.map((item) => (
          <li key={item.id} className="relative">
            <NavItemLink
              id={item.id}
              current={item.id === active}
              className={`block whitespace-nowrap rounded-full px-3 xl:px-3.5 py-2 text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-secondary ${
                item.id === active ? 'text-on-surface font-medium' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.label}
            </NavItemLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

interface MobileMenuProps {
  items: NavItem[]
  active: string
  siteName: string
  onClose: () => void
}

function MobileMenu({ items, active, siteName, onClose }: MobileMenuProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // keep keyboard focus inside the menu
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('a, button')
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    // the full menu appears from lg upwards, so the overlay is no longer needed
    const wide = window.matchMedia('(min-width: 1024px)')
    const onWide = (e: MediaQueryListEvent) => e.matches && onClose()

    window.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
    }
  }, [onClose])

  return (
    <div
      ref={dialogRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] lg:hidden overflow-y-auto bg-surface/90 backdrop-blur-2xl menu-overlay"
    >
      <div className="absolute -right-24 -top-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -left-24 bottom-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative min-h-full flex flex-col px-6 pt-5 pb-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Logo className="w-10 h-10 ring-1 ring-white/15 shrink-0" alt="" />
            <span className="font-headline text-body-md text-on-surface truncate">{siteName}</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Menu sluiten"
            className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-on-surface hover:bg-white/10 transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav aria-label="Mobiel menu" className="flex-1 flex items-center py-10">
          <ul className="w-full flex flex-col gap-1">
            {items.map((item, i) => {
              const isActive = item.id === active
              return (
                <li key={item.id} className="fade-up" style={{ animationDelay: `${60 + i * 45}ms` }}>
                  <NavItemLink
                    id={item.id}
                    onNavigate={onClose}
                    current={isActive}
                    className={`group flex items-center gap-4 py-2.5 font-headline text-headline-md transition-colors ${
                      isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                        isActive ? 'bg-primary shadow-[0_0_12px_rgba(208,188,255,0.9)]' : 'bg-outline-variant group-hover:bg-on-surface-variant'
                      }`}
                    />
                    {item.label}
                  </NavItemLink>
                </li>
              )
            })}
          </ul>
        </nav>

        <Link
          to="/admin"
          className="fade-up self-start flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-body-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
          style={{ animationDelay: `${60 + items.length * 45}ms` }}
        >
          <Icon name="person" className="!text-[18px]" /> Beheer
        </Link>
      </div>
    </div>
  )
}
