import type { HelmetOptions } from 'helmet'

// Used by the Express server and, on Vercel, for the static pages (scripts/build-vercel.ts)
export function helmetOptions(forceHttps: boolean): HelmetOptions {
  return {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        ...(forceHttps ? { upgradeInsecureRequests: [] } : {}),
      },
    },
    // HSTS only makes sense once the site is served over HTTPS
    strictTransportSecurity: forceHttps,
  }
}
