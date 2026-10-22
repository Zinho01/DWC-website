import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'
import { PAGE_ROUTES } from './NavItemLink.tsx'

// Shared frame for the public pages: header, page content, footer.
export function SiteLayout() {
  const { pathname, hash, key } = useLocation()
  const legacyPage = pathname === '/' ? PAGE_ROUTES[hash.slice(1)] : undefined

  // New page: start at the top, or at the requested section (e.g. /#nieuws)
  useEffect(() => {
    if (legacyPage) return
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
      if (target) target.scrollIntoView({ behavior: 'instant' })
      else window.scrollTo({ top: 0, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, key, legacyPage])

  // Old links like /#contact now point to their own page
  if (legacyPage) return <Navigate to={legacyPage} replace />

  return (
    <>
      <Header />
      <main className="w-full flex flex-col text-on-surface overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
