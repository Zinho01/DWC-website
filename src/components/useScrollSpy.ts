import { useEffect, useState } from 'react'

// Returns the id of the section currently being read: the last one whose top has
// passed `offset` px from the top of the viewport (just under the floating header).
export function useScrollSpy(ids: string[], offset = 120, resetKey?: unknown): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    // in page order (the menu order can differ from the order on the page)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    if (elements.length === 0) return

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        let current = elements[0].id
        for (const el of elements) {
          if (el.getBoundingClientRect().top <= offset) current = el.id
        }
        // at the very bottom of the page the last section counts as read
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = elements[elements.length - 1].id
        setActive(current)
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ids, offset, resetKey])

  return active
}
