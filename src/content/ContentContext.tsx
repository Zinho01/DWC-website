import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaultContent } from './defaults.ts'
import { withDefaults } from './schema.ts'
import type { SiteContent } from './types.ts'

interface ContentState {
  content: SiteContent
  loading: boolean
  setContent: (content: SiteContent) => void
  reload: () => Promise<void>
}

const ContentContext = createContext<ContentState | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    try {
      const res = await fetch('/api/content')
      if (res.ok) setContent(withDefaults(await res.json()))
    } catch {
      // API unreachable: keep showing the built-in defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return <ContentContext.Provider value={{ content, loading, setContent, reload }}>{children}</ContentContext.Provider>
}

export function useContent(): ContentState {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}
