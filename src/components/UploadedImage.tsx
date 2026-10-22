import type { ReactNode } from 'react'
import { isUploadPath } from '../content/safety.ts'

interface UploadedImageProps {
  src: string
  alt: string
  className?: string
  fallback: ReactNode // shown when no (valid) image is set
}

export function UploadedImage({ src, alt, className = '', fallback }: UploadedImageProps) {
  if (!isUploadPath(src)) return <>{fallback}</>
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={className} />
}
