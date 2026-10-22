import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

// True once the element has scrolled into view; stays true afterwards.
export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible])

  return { ref, visible }
}

interface RevealProps {
  children: ReactNode
  as?: ElementType
  delay?: number // ms, for staggering items in a row
  className?: string
}

// Fades and slides its content in when it scrolls into view (styles in index.css).
export function Reveal({ children, as: Tag = 'div', delay = 0, className = '' }: RevealProps) {
  const { ref, visible } = useInView<HTMLElement>()
  return (
    <Tag ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  )
}
