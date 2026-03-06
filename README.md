# ToolNext

This project is reinitialized with a fresh Next.js 16 setup while keeping all app features under `src/` unchanged.

## Stack

- Next.js 16 (App Router, TypeScript)
- `next-intl` i18n
- `next-themes`
- Tailwind CSS v4
- Cloudflare Workers deployment via `@opennextjs/cloudflare`

## Local Development

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Install Dependencies with `proxy_on`

If your environment provides `proxy_on` command, you can enable CLI proxy during install:

```bash
yarn install:proxy
```

Equivalent manual form:

```bash
proxy_on yarn install
```

## Cloudflare Deployment (Workers)

1. Login once:

```bash
npx wrangler login
```

2. Build OpenNext output (Cloudflare CI should run `yarn build`):

```bash
yarn build
```

(Optional: `yarn build:cf` is an alias)

3. Deploy:

```bash
yarn deploy
```

4. Optional local preview:

```bash
yarn preview
```

## Environment Variables

- For preview/deploy local env, copy `.dev.vars.example` to `.dev.vars` and fill values if needed.
- For production, set variables in Cloudflare dashboard (Workers -> Settings -> Variables).

## Useful Scripts

```bash
yarn dev
yarn lint
yarn build
yarn build:next
yarn build:cf
yarn preview
yarn deploy
yarn cf-typegen
yarn install:proxy
```
