<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/-Crisp-0a0a0a?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkwyIDd2MTBsMTAgNSAxMC01VjdsLTEwLTV6IiBzdHJva2U9IiMyMmM1NWUiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0xMiAxNXY1bTEwLTVsLTEwIDUiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+" />
  <img src="https://img.shields.io/badge/-Crisp-0a0a0a?style=for-the-badge" alt="Crisp" />
</picture>

**Paste a messy URL. Get a clean, short link.**

Crisp strips tracking junk (`utm_*`, `fbclid`, `gclid`, and 50+ more) from URLs and returns a deterministic short link. No accounts, no dashboards, no analytics. One paste, one copy, done.

```bash
# Before
https://example.com/page?utm_source=twitter&utm_medium=social&fbclid=abc123&ref=newsletter&_ga=xyz

# After  →  https://crisp.dev/s/Ab3XyZ
```

---

## Why Crisp?

Link shorteners have a bad reputation — they harvest click data, sell analytics, and bury your link behind redirect forests. Crisp does the opposite:

- **Privacy by construction** — no accounts, no logs, no tracking. The tool is the product; your data is not.
- **Deterministic** — the same URL always produces the same short link. No hidden expiry, no surprise 404s.
- **One job** — paste, clean, copy, share. The interface disappears the moment you have what you need.
- **Clean by default** — strips 50+ tracking parameters automatically. Your links look as clean as the intent behind sharing them.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Paste a messy URL. Done.

### Run tests

```bash
npm test
```

---

## Architecture

| Layer | Tech |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Database | SQLite via `better-sqlite3` (local) / Turso (production) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Font | [Sora](https://fonts.google.com/specimen/Sora) |

```
POST /api/shorten    → sanitize URL, store, return short code
GET  /s/:code        → 302 redirect to original URL
```

### Sanitization

Crisp strips known tracking parameters (`utm_*`, `fbclid`, `gclid`, `ref`, `_ga`, `_gl`, and more), removes URL fragments, and preserves everything else. The stripped params are shown to the user so they know exactly what was removed.

---

## API

The web UI is free and always will be. A programmatic API with higher rate limits and custom slugs is coming. [Follow the project](https://github.com/AdamMostofi/Crisp) for updates.

---

## License

MIT © [Adam Mostofi](https://github.com/AdamMostofi)

---

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/made%20with-Sora-22c55e?style=flat-square" />
  <img src="https://img.shields.io/badge/made%20with-Sora-22c55e?style=flat-square" alt="Sora" />
</picture>
