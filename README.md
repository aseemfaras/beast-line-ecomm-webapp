# Athletica Sportswear — E-Commerce Frontend

A modern sportswear e-commerce storefront and admin dashboard built with **Next.js 16**, **React 19**, and **TypeScript**. The app is a client-rendered SPA that talks to a separate REST API backend (default port `5000`). All product, cart, order, and auth data is fetched from the backend at runtime.

## Features

- User authentication and authorization (JWT)
- Product catalog with filters, search, and product detail pages
- Shopping cart, wishlist, and checkout (Razorpay)
- Order tracking and returns
- Admin panel: products, inventory, orders, users, coupons, banners, reviews, categories

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| State | Redux Toolkit |
| Payments | Razorpay (checkout SDK) |
| API | REST (`/api/*` on backend) |

## Architecture (same-server deployment)

When the backend is already running on the same machine, a typical production layout looks like this:

```
Browser
   │
   ▼
Nginx (:80 / :443)
   ├── /          →  Next.js frontend (port 3000)  OR  static files in /var/www/athletica
   └── /api/*     →  Backend API (port 5000)
```

Nginx terminates HTTP, serves the storefront, and proxies API calls to your existing backend. This avoids CORS issues because the browser can call `/api` on the same origin.

---

## Prerequisites

Install these on your Linux server (Ubuntu 22.04/24.04 or Debian 12 used in examples below):

| Tool | Minimum version | Purpose |
|------|-----------------|---------|
| Node.js | 20.x LTS | Build and run Next.js |
| npm | 10.x | Package manager (bundled with Node) |
| Git | any recent | Clone the repository |
| Nginx | 1.18+ | Web server / reverse proxy |
| PM2 | latest (optional) | Keep Next.js running after logout |

**Assumptions for this guide**

- Backend API is already running on the same server (default: `http://127.0.0.1:5000`).
- Backend exposes routes under `/api` (e.g. `/api/auth/login`, `/api/products`).
- You have SSH access with `sudo` privileges.

---

## 1. Install Node.js on the server

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # v20.x.x
npm -v     # 10.x.x
```

---

## 2. Clone the project and install dependencies

```bash
# Create an application directory
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www

# Clone (replace with your repository URL)
git clone <repository-url> beast-line-ecomm-webapp
cd beast-line-ecomm-webapp

# Install dependencies
npm ci
# Use `npm install` instead if package-lock.json is missing
```

---

## 3. Configure environment variables

Create a `.env` file in the project root **before building**. These values are embedded into the client bundle at build time (`NEXT_PUBLIC_*`).

```bash
nano .env
```

```env
# Public URL the browser uses to reach your backend API.
# Recommended when Nginx proxies /api to the backend (see Section 7):
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP

# Or, if the API is on a separate subdomain:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Razorpay publishable key (from Razorpay dashboard)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the backend **without** `/api`. The app appends `/api` automatically. Defaults to `http://localhost:5000` if unset. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | For payments | Razorpay key ID used at checkout. |

> **Important:** After changing `.env`, you must run `npm run build` again. `NEXT_PUBLIC_*` values are baked in at build time.

### Backend CORS (if not using Nginx `/api` proxy)

If the browser calls the backend directly (e.g. `http://YOUR_SERVER_IP:5000`), ensure your backend allows the frontend origin:

```
Access-Control-Allow-Origin: http://YOUR_SERVER_IP
```

Using the Nginx `/api` reverse-proxy pattern (Section 7) is the simpler option on a single server.

---

## 4. Build the application

```bash
cd /var/www/beast-line-ecomm-webapp

# Production build
npm run build
```

A successful build creates a `.next` folder with the optimized production bundle.

```bash
# Quick local test (optional, on the server)
npm run start
# App listens on http://127.0.0.1:3000
# Press Ctrl+C to stop when done testing
```

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Hot-reload dev server on port 3000 |
| Production build | `npm run build` | Compile for production |
| Production run | `npm run start` | Serve the built app on port 3000 |
| Lint | `npm run lint` | Run ESLint |

---

## 5. Install Nginx

```bash
sudo apt install -y nginx

# Start and enable on boot
sudo systemctl start nginx
sudo systemctl enable nginx

# Allow HTTP (and HTTPS if you add TLS later)
sudo ufw allow 'Nginx Full'
sudo ufw enable   # if firewall is not already enabled

# Verify Nginx is running
sudo systemctl status nginx
```

Default document root on Ubuntu/Debian: `/var/www/html`

---

## 6. Run the frontend with PM2 (recommended)

Next.js needs a Node process in production. PM2 keeps it running and restarts it on failure or reboot.

```bash
# Install PM2 globally
sudo npm install -g pm2

cd /var/www/beast-line-ecomm-webapp

# Start the production server
pm2 start npm --name "athletica-frontend" -- start

# Save process list and enable startup on boot
pm2 save
pm2 startup
# Run the command PM2 prints (starts with sudo env PATH=...)
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs athletica-frontend
pm2 restart athletica-frontend
pm2 stop athletica-frontend
```

After deploying a new build:

```bash
cd /var/www/beast-line-ecomm-webapp
git pull
npm ci
npm run build
pm2 restart athletica-frontend
```

---

## 7. Configure Nginx (reverse proxy — recommended)

This is the **recommended** deployment when your backend is already on the same server. Nginx serves the frontend and proxies `/api` to the backend so the browser uses a single origin.

Create a site config:

```bash
sudo nano /etc/nginx/sites-available/athletica
```

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;   # or yourdomain.com

    # Frontend — proxy to Next.js (PM2 on port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API — proxy to your existing backend on port 5000
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # If your backend serves uploaded images at /uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
    }
}
```

Enable the site and reload Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/athletica /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # optional: remove default site

sudo nginx -t
sudo systemctl reload nginx
```

Set `.env` before build:

```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP
```

Then rebuild and restart:

```bash
npm run build
pm2 restart athletica-frontend
```

Open in a browser: **http://YOUR_SERVER_IP**

### Admin routes

| URL | Purpose |
|-----|---------|
| `/` | Storefront home |
| `/products` | Product listing |
| `/product/[id]` | Product detail |
| `/cart`, `/checkout`, `/wishlist`, `/profile` | Customer flows |
| `/admin` | Admin dashboard |
| `/admin/products`, `/admin/orders`, etc. | Admin modules |

---

## 8. Alternative: deploy static build to Nginx document root

Use this approach only if you want Nginx to serve **static HTML/JS/CSS files** with no Node process for the frontend. It requires an extra build configuration because the default `next build` output (`.next/`) is **not** a set of static files for Nginx.

### 8.1 Enable static export

Edit `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
```

> **Note:** The dynamic route `/product/[id]` requires `generateStaticParams()` in a Server Component. The current product page is a Client Component. For a full static export you would split it into a server `page.tsx` (with `generateStaticParams`) and a client child component. Until that is done, prefer **Section 7 (reverse proxy)**.

### 8.2 Build static artifacts

```bash
cd /var/www/beast-line-ecomm-webapp

# Ensure .env is set (Section 3)
npm run build
```

Static files are written to the `out/` directory.

### 8.3 Copy build output to Nginx document root

```bash
# Create app directory
sudo mkdir -p /var/www/athletica

# Copy static files (preserves permissions for nginx www-data user)
sudo rsync -av --delete out/ /var/www/athletica/

# Set ownership for Nginx
sudo chown -R www-data:www-data /var/www/athletica
```

On future deployments, repeat `npm run build` and the `rsync` command.

### 8.4 Nginx config for static files

```bash
sudo nano /etc/nginx/sites-available/athletica-static
```

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    root /var/www/athletica;
    index index.html;

    # Static frontend
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }

    # Proxy API to existing backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/athletica-static /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Set before build:

```env
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP
```

---

## 9. End-to-end deployment checklist

Use this order when demonstrating or deploying on a fresh server:

1. [ ] Install Node.js 20, Git, Nginx
2. [ ] Confirm backend is running: `curl http://127.0.0.1:5000/api/health` (or your health endpoint)
3. [ ] Clone repo to `/var/www/beast-line-ecomm-webapp`
4. [ ] Create `.env` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
5. [ ] `npm ci` → `npm run build`
6. [ ] Start app with PM2: `pm2 start npm --name athletica-frontend -- start`
7. [ ] Configure Nginx site (Section 7) with frontend proxy + `/api` proxy
8. [ ] `sudo nginx -t && sudo systemctl reload nginx`
9. [ ] Open `http://YOUR_SERVER_IP` in a browser
10. [ ] Test login, product listing, and checkout

---

## 10. HTTPS (optional)

For a domain name, use Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Update `.env` to use `https://yourdomain.com`, rebuild, and restart PM2.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Blank page / 502 Bad Gateway | Next.js not running | `pm2 status`, `pm2 restart athletica-frontend` |
| API calls fail / CORS errors | Wrong `NEXT_PUBLIC_API_URL` or missing CORS | Use Nginx `/api` proxy; set `NEXT_PUBLIC_API_URL` to site origin; rebuild |
| Images not loading | Backend upload path not proxied | Add `/uploads/` location in Nginx (Section 7) |
| Razorpay checkout fails | Missing or test key in production | Set `NEXT_PUBLIC_RAZORPAY_KEY_ID`; rebuild |
| Changes to `.env` not applied | Env vars are build-time for `NEXT_PUBLIC_*` | Run `npm run build` again after editing `.env` |
| `npm run build` fails on server | Low memory | Add swap: `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` |
| Nginx config error | Syntax issue | `sudo nginx -t` shows the line number |

Check logs:

```bash
# Nginx
sudo tail -f /var/log/nginx/error.log

# Next.js / PM2
pm2 logs athletica-frontend
```

---

## 12. Local development

```bash
git clone <repository-url>
cd beast-line-ecomm-webapp
npm install

# .env for local backend
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env
echo "NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx" >> .env

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
beast-line-ecomm-webapp/
├── public/                 # Static assets (icons, images)
├── src/
│   ├── app/
│   │   ├── (customer)/     # Storefront pages (home, products, cart, checkout, …)
│   │   ├── (admin)/admin/  # Admin dashboard pages
│   │   ├── context/        # App-wide React context + Redux provider
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Shared UI (Navbar, Footer, ProductCard, …)
│   ├── types/              # TypeScript interfaces
│   └── utils/
│       ├── api.ts          # HTTP client (BASE_URL + /api prefix)
│       └── redux/          # Redux store and slices
├── next.config.ts
├── package.json
└── .env                    # Not committed — create locally / on server
```

### API client

All backend calls go through `src/utils/api.ts`:

- Base URL: `process.env.NEXT_PUBLIC_API_URL` (default `http://localhost:5000`)
- Path prefix: `/api`
- Auth: JWT from `localStorage` key `athletica_token`, sent as `Authorization: Bearer <token>`

Example: `api.get("/products")` → `GET {NEXT_PUBLIC_API_URL}/api/products`

---

## License

Private — All rights reserved.
