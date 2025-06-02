# Deployment Guide

This guide covers various methods to deploy the Bioinformatics Project Tracker to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [Custom Server](#custom-server)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Analytics](#monitoring-and-analytics)

## Prerequisites

Before deploying, ensure you have:

- Node.js 14.0 or higher
- npm or yarn package manager
- Git for version control
- A hosting platform account (GitHub, Netlify, Vercel, etc.)

## Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build` folder with:
- Minified and bundled JavaScript
- Optimized CSS
- Compressed images
- Cache-friendly file names with hashes

### 3. Test Production Build Locally
```bash
# Install serve globally if you haven't already
npm install -g serve

# Serve the production build
serve -s build -l 3000
```

## Deployment Options

## GitHub Pages

Perfect for personal projects and demonstrations.

### Step 1: Install gh-pages
```bash
npm install --save-dev gh-pages
```

### Step 2: Add Deploy Scripts to package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "homepage": "https://yourusername.github.io/bioinf-tracker"
}
```

### Step 3: Deploy
```bash
npm run deploy
```

### Step 4: Configure GitHub Repository
1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Select "Deploy from a branch"
4. Choose `gh-pages` branch
5. Your app will be available at `https://yourusername.github.io/bioinf-tracker`

### Automatic Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## Netlify

Excellent for rapid deployment with continuous integration.

### Method 1: Git Integration (Recommended)

1. **Connect Repository**
   - Login to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose your Git provider and repository

2. **Configure Build Settings**
   ```
   Base directory: (leave empty)
   Build command: npm run build
   Publish directory: build
   ```

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add any required environment variables

4. **Deploy**
   - Netlify automatically builds and deploys on every push to main branch

### Method 2: Manual Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

### Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
  
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "max-age=31536000"
    
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "max-age=31536000"
    
[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "max-age=31536000"
```

## Vercel

Optimal for React applications with excellent performance.

### Method 1: Git Integration

1. **Connect Repository**
   - Login to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**
   ```
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Deploy**
   - Vercel automatically deploys on every push

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "Cache-Control": "max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Custom Server

For deployment on your own server infrastructure.

### Apache Configuration

Create `.htaccess` in build directory:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/build;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

## Docker Deployment

For containerized deployment across different environments.

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build output to nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Nginx Configuration

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Build and Run Docker Container

```bash
# Build the image
docker build -t bioinf-tracker .

# Run the container
docker run -p 8080:80 bioinf-tracker

# Or with docker-compose
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  bioinf-tracker:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

## Environment Configuration

### Environment Variables

Create `.env.production`:

```env
REACT_APP_VERSION=1.0.0
REACT_APP_BUILD_DATE=06/02/2025
REACT_APP_ENVIRONMENT=production
REACT_APP_ANALYTICS_ID=your-analytics-id
```

### Build-time Configuration

Update `package.json` scripts:

```json
{
  "scripts": {
    "build:staging": "REACT_APP_ENVIRONMENT=staging npm run build",
    "build:production": "REACT_APP_ENVIRONMENT=production npm run build"
  }
}
```

## Performance Optimization

### Bundle Analysis

Analyze bundle size to optimize performance:

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Add script to package.json
"analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"

# Run analysis
npm run analyze
```

### Code Splitting

Implement lazy loading for routes:

```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Analytics = lazy(() => import('./components/AdvancedAnalytics'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Your app routes */}
    </Suspense>
  );
}
```

### Service Worker

Enable service worker for offline functionality:

```javascript
// In src/index.js
import { register } from './serviceWorkerRegistration';

// Register service worker
register();
```

## Monitoring and Analytics

### Google Analytics

Add to `public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Monitoring

Consider integrating services like:
- Sentry for error tracking
- LogRocket for session replay
- Hotjar for user behavior analytics

### Performance Monitoring

Monitor Core Web Vitals:

```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send metrics to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Troubleshooting

### Common Issues

1. **Routing Issues on Production**
   - Ensure proper server configuration for SPA routing
   - Check that all routes redirect to index.html

2. **Large Bundle Size**
   - Use bundle analyzer to identify large dependencies
   - Implement code splitting
   - Consider dynamic imports

3. **Caching Issues**
   - Verify cache headers are properly set
   - Check that build files have unique hashes
   - Clear CDN cache if applicable

4. **Environment Variables Not Working**
   - Ensure variables start with `REACT_APP_`
   - Check build-time vs runtime configuration
   - Verify environment-specific .env files

### Health Checks

Create a health check endpoint:

```javascript
// Add to public folder: health.json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-06-02T18:46:21.000Z"
}
```

Monitor application health:
```bash
curl https://yourdomain.com/health.json
```

---

This deployment guide covers the most common deployment scenarios for the Bioinformatics Project Tracker. Choose the method that best fits your infrastructure and requirements. 