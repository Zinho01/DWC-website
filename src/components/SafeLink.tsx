import type { AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { safeHref } from '../content/safety.ts'

// Link with an admin-editable href: unsafe values become "#", pages on this site use the
// router (no full reload), external links open in a new tab.
export function SafeLink({ href = '', children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const url = safeHref(href)
  if (url.startsWith('/') && !url.startsWith('/uploads/')) {
    return (
      <Link to={url} {...rest}>
        {children}
      </Link>
    )
  }
  const external = /^https?:\/\//i.test(url)
  return (
    <a href={url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  )
}
