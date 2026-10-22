import type { MouseEvent, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

// Menu items that are their own page; all other menu ids are sections on the home page.
export const PAGE_ROUTES: Record<string, string> = {
  contact: '/contact',
  'privacy-policy': '/privacy-policy',
}

export function isPageItem(id: string): boolean {
  return id in PAGE_ROUTES
}

// Scroll to a section on the current page and keep the URL hash in sync
export function goToSection(e: MouseEvent<HTMLAnchorElement>, id: string, onDone?: () => void) {
  const target = document.getElementById(id)
  if (!target) return
  e.preventDefault()
  onDone?.()
  requestAnimationFrame(() => {
    target.scrollIntoView()
    history.replaceState(history.state, '', `#${id}`)
  })
}

interface NavItemLinkProps {
  id: string
  className?: string
  children: ReactNode
  onNavigate?: () => void
  current?: boolean
}

// Link for a menu item: a page route, an in-page scroll on the home page,
// or a link back to a home page section from another page.
export function NavItemLink({ id, className, children, onNavigate, current }: NavItemLinkProps) {
  const { pathname } = useLocation()
  const common = { className, 'data-id': id, 'aria-current': current ? ('page' as const) : undefined }

  const route = PAGE_ROUTES[id]
  if (route) {
    return (
      <Link to={route} onClick={onNavigate} {...common}>
        {children}
      </Link>
    )
  }
  if (pathname === '/') {
    return (
      <a href={`#${id}`} onClick={(e) => goToSection(e, id, onNavigate)} {...common}>
        {children}
      </a>
    )
  }
  return (
    <Link to={`/#${id}`} onClick={onNavigate} {...common}>
      {children}
    </Link>
  )
}
