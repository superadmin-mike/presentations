# Marc CRM Platform Portal - Deployment Guide

**Last Updated**: 2026-06-01  
**Status**: Ready for Deployment ✅

## Pre-Deployment Checklist

### Prerequisites
- [ ] Node.js v24+ installed
- [ ] npm v10+ installed
- [ ] Backend API running and accessible
- [ ] PostgreSQL database configured and seeded
- [ ] SSL certificates ready (for HTTPS)
- [ ] Domain name configured (if deploying to production)

### Code Verification
- [ ] All TypeScript compiles without errors
- [ ] No console errors or warnings
- [ ] All environment variables configured
- [ ] Test suite passes (run `node test-portal.mjs`)
- [ ] Browser testing completed on target browsers

### Security Review
- [ ] JWT token expiry configured on backend
- [ ] CORS headers properly set on API server
- [ ] Environment variables don't contain secrets
- [ ] localStorage tokens are httpOnly on API (if applicable)
- [ ] API rate limiting configured on backend

## Deployment Strategies

### Option 1: Docker Container (Recommended)

#### Create Dockerfile
```dockerfile
FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src ./src
COPY public ./public
COPY *.config.* ./
COPY tsconfig*.json ./
COPY .env* ./

# Build production bundle
RUN npm run build

# Expose port
EXPOSE 3000

# Serve with static server or Nginx
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
```

#### Build and Run
```bash
# Build image
docker build -t marc-crm-portal:latest .

# Run container
docker run -p 3000:3000 \
  -e VITE_API_URL=https://api.example.com/api \
  marc-crm-portal:latest
```

#### Docker Compose Example
```yaml
version: '3.8'

services:
  portal:
    build: .
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://api:3001/api
    depends_on:
      - api

  api:
    image: marc-crm-api:latest
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/crm
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: crm
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

### Option 2: Nginx + Node.js

#### Build Production Bundle
```bash
npm run build
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name crm.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.example.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    # Serve static files with caching
    location / {
        root /var/www/marc-crm-portal/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
}
```

#### Deploy Commands
```bash
# Build
npm run build

# Copy to server
scp -r dist/* user@server:/var/www/marc-crm-portal/

# Reload Nginx
ssh user@server 'sudo systemctl reload nginx'
```

### Option 3: Vercel / Netlify (Frontend Only)

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### vercel.json Configuration
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@api_url"
  },
  "redirects": [
    {
      "source": "/api/:path*",
      "destination": "https://api.example.com/api/:path*"
    }
  ]
}
```

#### Environment Variables on Vercel
1. Go to Project Settings
2. Add Environment Variables:
   - Name: `VITE_API_URL`
   - Value: `https://api.example.com/api`

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### netlify.toml Configuration
```toml
[build]
  command = "npm run build"
  publish = "dist"

[env]
  VITE_API_URL = "https://api.example.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Environment Configuration for Production

### Create Production .env File
```env
# Production API URL (must be HTTPS)
VITE_API_URL=https://api.example.com/api

# Optional: Analytics or monitoring
# VITE_SENTRY_DSN=https://...
# VITE_ANALYTICS_ID=...
```

### Build with Environment
```bash
# Development
npm run build  # Uses .env.development if exists

# Production
VITE_API_URL=https://api.example.com/api npm run build

# Or build then change API URL
npm run build
# Then inject at runtime via window.__RUNTIME_CONFIG__
```

## Performance Optimization

### Minification & Bundling
- ✅ Already configured in Vite
- CSS minified: ~30KB → ~8KB gzipped
- JS minified: ~150KB → ~50KB gzipped

### Caching Strategy
```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

# Don't cache HTML (re-fetch on each load)
location ~* \.html$ {
    expires 0;
    add_header Cache-Control "public, must-revalidate";
}
```

### CDN Integration
1. Build production bundle
2. Upload `dist/` to CDN (CloudFlare, AWS CloudFront, etc.)
3. Configure API proxy on CDN
4. Update VITE_API_URL to CDN origin

## Monitoring & Health Checks

### Application Health Endpoint
Add to backend API:
```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    version: '1.0.0',
    database: 'connected'
  });
});
```

### Monitoring Setup
```bash
# Health check endpoint for load balancer
GET /api/health

# Expected response:
# { "status": "healthy", "database": "connected" }
```

### Error Tracking (Optional)
```javascript
// Add to src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

## Post-Deployment Verification

### Manual Testing
- [ ] Load http://yourdomain.com in browser
- [ ] Test login with all three roles
- [ ] Verify each dashboard displays correctly
- [ ] Test CSV export on Supervisor dashboard
- [ ] Check console for errors (F12)
- [ ] Verify token persists across page refresh
- [ ] Test logout functionality

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] First Contentful Paint < 1.5 seconds
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5 seconds

### Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No sensitive data in localStorage (except token)
- [ ] CORS properly configured
- [ ] Authentication required for protected routes

### Monitoring
- [ ] Error rate < 0.1%
- [ ] API response time < 500ms
- [ ] Database connection stable
- [ ] Memory usage stable
- [ ] CPU usage under 50%

## Troubleshooting

### Blank Page After Deploy
1. Check browser console (F12)
2. Verify VITE_API_URL is correct
3. Check if index.html is served correctly
4. Verify React is loaded: `window.React` in console

### 404 on Page Refresh
- Nginx not configured to serve SPA
- Solution: Add `try_files $uri $uri/ /index.html;`

### CORS Errors
- Backend API not allowing origin
- Solution: Add to backend:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

### API Timeout
- Network connectivity issue
- Backend not running
- VITE_API_URL incorrect
- Solution: Verify with `curl https://api.example.com/api/health`

### Token Not Persisting
- localStorage disabled in browser
- Private/incognito mode
- Browser storage full
- Solution: Check browser settings, clear cache

## Rollback Procedure

### Quick Rollback
```bash
# Keep previous production build
cp -r dist dist.v1.0

# Deploy v1.0
# If issues, restore previous:
rm -rf dist
cp -r dist.v1.0 dist
systemctl reload nginx
```

### Blue-Green Deployment
```bash
# Deploy new version to new directory
/var/www/marc-crm-portal-v2/dist

# Update Nginx to point to new version
# Nginx reloads without downtime

# If issues, revert Nginx config
# Old version still available
```

## Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Check API response times
- [ ] Review security logs
- [ ] Update dependencies monthly
- [ ] Run backup of database
- [ ] Test disaster recovery plan

### Dependency Updates
```bash
# Check for updates
npm outdated

# Install minor/patch updates
npm update

# Install major version updates
npm install react@latest

# Rebuild and test
npm run build
npm run preview
```

### Database Backups
```bash
# Backup PostgreSQL
pg_dump crm_database > backup_2026-06-01.sql

# Restore from backup
psql crm_database < backup_2026-06-01.sql
```

## Deployment Timeline

### Week 1: Staging
- Deploy to staging environment
- Run full test suite
- Performance testing
- Security audit

### Week 2: Production (Phased)
- Deploy to production
- Monitor closely first 24 hours
- Collect user feedback
- Document any issues

### Week 3+: Operations
- Monitor health metrics
- Fix reported bugs
- Plan for improvements
- Document learnings

## Contacts & Support

**Deployment Issues**: Contact DevOps team  
**API Issues**: Contact Backend team  
**Frontend Bugs**: File issue in repository  

---

**Deployment Status**: Ready ✅  
**Last Verified**: 2026-06-01  
**Next Review**: 2026-07-01
