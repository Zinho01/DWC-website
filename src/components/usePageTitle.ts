import { useEffect } from 'react'
import { useContent } from '../content/ContentContext.tsx'

export function usePageTitle(page?: string) {
  const { siteName } = useContent().content
  useEffect(() => {
    document.title = page ? `${page} — ${siteName}` : siteName
  }, [page, siteName])
}
