interface LogoProps {
  className?: string
  alt?: string
}

// The DWC logo is a circular badge on a square photo, so always crop it to a circle.
export function Logo({ className = '', alt = 'Dutch Whovian Community logo' }: LogoProps) {
  return <img src="/images/logo.jpg" alt={alt} className={`rounded-full object-cover aspect-square ${className}`} />
}
