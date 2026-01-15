import type { Plugin } from 'vite';

/**
 * Vite plugin to add security headers
 * These headers will be added by the dev server and should be configured
 * in production via your hosting provider (e.g., Vercel, Netlify, nginx)
 */
export function securityHeaders(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        // Content Security Policy
        res.setHeader(
          'Content-Security-Policy',
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 'unsafe-eval' needed for Vite in dev
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
          ].join('; ')
        );

        // X-Frame-Options
        res.setHeader('X-Frame-Options', 'DENY');

        // X-Content-Type-Options
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // X-XSS-Protection
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // Referrer-Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions-Policy
        res.setHeader(
          'Permissions-Policy',
          [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'interest-cohort=()',
          ].join(', ')
        );

        // Strict-Transport-Security (only in production)
        if (process.env.NODE_ENV === 'production') {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        next();
      });
    },
  };
}
