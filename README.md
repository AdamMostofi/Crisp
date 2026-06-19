<div align="center">

# Crisp

**Paste a messy URL. Get a clean, short link.**

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind%20v4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)

---

Crisp strips tracking junk from URLs and returns a short, clean link — no accounts, no dashboards, no analytics. Paste, copy, done.

```text
Before: https://example.com/page?utm_source=twitter&utm_medium=social&fbclid=abc123&ref=newsletter
After:  https://crisp.dev/s/Ab3XyZ
```

</div>

---

## Why Crisp?

Link shorteners have a bad reputation — they harvest click data, sell analytics, and bury links behind redirect forests. Crisp does the opposite.

- **Privacy by construction** — no accounts, no logs, no tracking of who submitted what. The tool is the product; your data is not.
- **Deterministic** — the same URL always produces the same short link. No hidden expiry, no surprise 404s.
- **One job** — paste, clean, copy, share. The interface disappears the moment you have what you need.
- **Clean by default** — strips 50+ tracking parameters (`utm_*`, `fbclid`, `gclid`, `ref`, `_ga`, `_gl`, and more). Fragments are removed. Everything else is preserved.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Paste a messy URL. Done.

```bash
npm test          # run tests
npm run lint      # check code style
```

---

## Architecture

| Layer | Tech |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database | SQLite via `@libsql/client` (local) / Turso (production) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Font | [Sora](https://fonts.google.com/specimen/Sora) |

**Routes**

| Method | Path | What it does |
|---|---|---|
| `POST` | `/api/shorten` | Sanitizes a URL, stores it, returns a short code |
| `GET` | `/s/:code` | 302-redirects to the original clean URL |

**Sanitization** strips known tracking parameters, removes the URL fragment, and preserves everything else. Stripped params are shown to the user so they know what was removed.

---

## Deploy to Production

Crisp uses **Turso** (libSQL) for production persistence and runs on **Vercel**.

### 1. Create a Turso Database

```bash
# Install the Turso CLI
curl -sSfL https://get.turso.dev | sh

# Log in (opens browser)
turso auth login

# Create a database
turso db create crisp

# Get the connection details
turso db show crisp --url        # → TURSO_DB_URL
turso db tokens create crisp     # → TURSO_AUTH_TOKEN
```

Alternatively, create a database through the [Turso Dashboard](https://turso.tech).

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAdamMostofi%2FCrisp)

Or manually:

1. Push the repo to GitHub: `git push origin main`
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the `AdamMostofi/Crisp` repository
4. Add these environment variables:
   - `TURSO_DB_URL` — your Turso database URL
   - `TURSO_AUTH_TOKEN` — your Turso auth token
5. Deploy

Vercel auto-detects Next.js. No additional configuration needed.

### Local Development

Without setting `TURSO_DB_URL`, Crisp falls back to a local SQLite file at `./data/crisp.db`. Data is ephemeral on Vercel — always use Turso in production.

---

## API & MCP *(in development)*

The web UI is free and always will be. We're building:

- **REST API** — programmatic URL shortening for your own tools and workflows. Higher rate limits, custom slugs, API keys.
- **MCP Server** — integrate Crisp directly into AI tools like Claude, Cursor, and GitHub Copilot. Let agents clean URLs on the fly.

Follow the [repository](https://github.com/AdamMostofi/Crisp) for updates.

---

## License

MIT © [Adam Mostofi](https://github.com/AdamMostofi)
