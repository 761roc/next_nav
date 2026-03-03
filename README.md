# ToolNext

A Next.js multilingual navigation hub (minimal + light glassmorphism) ready for Cloudflare Pages CI/CD from GitHub.

## Tech Stack

- Next.js 16 + TypeScript + App Router
- `next-intl` for i18n (`zh`, `zh-Hant`, `en`, `fr`, `ja`)
- `next-themes` for `light` / `dark` / `system` theme modes
- Tailwind CSS v4 + custom glassmorphism styles

## Features

- Clickable navigation cards for both external URLs and internal routes.
- Theme switcher with `light`, `dark`, `system` (default `light`).
- Locale switcher with Chinese as default locale.
- Minimal UI with lightweight glass effects and responsive layout.

## Local Development

```bash
yarn install --registry=https://registry.npmmirror.com
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## i18n Structure

- Messages: `src/messages/{zh,zh-Hant,en,fr,ja}.json`
- Routing: `src/i18n/routing.ts`
- Middleware: `middleware.ts`

## Cloudflare Pages Deployment (GitHub Auto Deploy)

1. Push this project to GitHub (`main` branch).
2. In Cloudflare dashboard: `Workers & Pages` -> `Create` -> `Pages` -> `Connect to Git`.
3. Select this repository.
4. Use build settings:
   - Framework preset: `Next.js`
   - Build command: `yarn build`
   - Build output directory: `.next`
5. Set environment variables and Node.js version in Cloudflare Pages project settings if needed.
6. Every push to `main` triggers production deployment; pull requests trigger preview deployments.

## Useful Scripts

```bash
yarn dev
yarn lint
yarn build
yarn start
```
