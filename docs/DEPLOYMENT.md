# Deployment Guide

This guide covers deploying Zone Guardian to production environments.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Supabase project set up
- Environment variables configured
- Sentry account (optional, for error tracking)

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in your production environment:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id  # Optional
```

### 2. Database Setup

1. Run the schema in your production Supabase project:
   - Copy `supabase/schema.sql`
   - Execute in Supabase SQL Editor
   - Verify RLS policies are active

2. Verify Row Level Security (RLS) is enabled on all tables

3. Test authentication flows in production database

### 3. Build Verification

```bash
# Run all checks before deploying
npm run format:check
npm run lint
npm run type-check
npm run test:run
npm run build
```

### 4. Security Configuration

- Update `public/security.txt` with your security contact email
- Verify security headers are configured (see platform-specific sections below)
- Ensure HTTPS is enforced in production

## Platform-Specific Deployment

### Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required variables for Production environment

4. **Security Headers**:
   - The `vercel.json` file is automatically used
   - Headers are applied automatically

5. **Custom Domain** (optional):
   - Add domain in Vercel Dashboard
   - Update `index.html` canonical URL and meta tags

### Netlify

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Configure Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add all required variables

4. **Security Headers**:
   - The `public/_headers` file is automatically used
   - Headers are applied automatically

5. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Docker

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**:
   ```nginx
   server {
     listen 80;
     server_name _;
     root /usr/share/nginx/html;
     index index.html;

     # Security headers
     add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.sentry.io wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" always;
     add_header X-Frame-Options "DENY" always;
     add_header X-Content-Type-Options "nosniff" always;
     add_header X-XSS-Protection "1; mode=block" always;
     add_header Referrer-Policy "strict-origin-when-cross-origin" always;
     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

     # SPA routing
     location / {
       try_files $uri $uri/ /index.html;
     }

     # Cache static assets
     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

3. **Build and Run**:
   ```bash
   docker build -t zone-guardian .
   docker run -p 80:80 zone-guardian
   ```

### Traditional Server (nginx)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Copy dist folder** to your server

3. **Configure nginx** (see Docker section above for nginx.conf example)

4. **Set up SSL** with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment

### 1. Verify Deployment

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Protected routes redirect properly
- [ ] Role-based access control works
- [ ] Error tracking is working (if Sentry configured)
- [ ] Security headers are present (check with browser dev tools)

### 2. Monitor

- Set up monitoring alerts for:
  - Error rates (via Sentry)
  - Application uptime
  - Performance metrics
  - Database connection issues

### 3. Update Documentation

- Update `index.html` with production URL
- Update `public/security.txt` with actual contact information
- Document any custom configurations

## Environment-Specific Configuration

### Development

- Uses development Supabase project
- More verbose logging
- Source maps enabled
- Hot module replacement

### Staging

- Uses staging Supabase project
- Production-like configuration
- Error tracking enabled
- Performance monitoring enabled

### Production

- Uses production Supabase project
- Optimized builds
- Error tracking enabled
- Performance monitoring enabled
- Security headers enforced
- HTTPS required

## Troubleshooting

### Build Fails

1. Check Node.js version (must be 20.x+)
2. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run type-check`
4. Verify all environment variables are set

### Application Doesn't Load

1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check network tab for failed requests
4. Verify Supabase URL and keys are correct

### Authentication Issues

1. Verify Supabase project is active
2. Check RLS policies are correctly configured
3. Verify redirect URLs in Supabase settings
4. Check browser console for auth errors

### Security Headers Not Applied

1. For Vercel: Check `vercel.json` is in root
2. For Netlify: Check `public/_headers` exists
3. For custom server: Verify nginx/Apache configuration
4. Test headers with: `curl -I https://your-domain.com`

## Rollback Procedure

1. **Vercel**: Use dashboard to revert to previous deployment
2. **Netlify**: Use dashboard to revert to previous deployment
3. **Docker**: Tag and deploy previous image version
4. **Traditional**: Restore previous `dist` folder from backup

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Support

For deployment issues, check:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Setup Guide](./SETUP.md)
