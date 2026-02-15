# Prismoria Multi-Panel Pterodactyl Dashboard

Next.js (App Router) dashboard that aggregates servers from multiple Pterodactyl panels and allows power controls.

## Supported panel endpoints

- https://panel.xentranetwork.de
- https://panel.kingsdom.uk
- https://panel.spaceify.eu

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env
```

> For Vercel production deployments, do **not** use `localhost` in `DATABASE_URL`.
> `localhost` in serverless functions points to the function container itself, not your managed database.
> Use your provider host (for example Neon/Supabase/RDS hostname) and required SSL params.

3. Initialize database:

```bash
npx prisma migrate dev --name init
```

4. Run:

```bash
npm run dev
```

## Authentication

- Default admin email: `admin@gmail.com`
- Default admin password: `admin123`

Override via env vars:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`

For local testing without login/session, set:
- `DISABLE_AUTH="true"`
