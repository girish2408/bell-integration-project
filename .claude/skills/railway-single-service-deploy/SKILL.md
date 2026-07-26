---
name: railway-single-service-deploy
description: Use when deploying a Node monorepo (API plus SPA) to Railway as one service on one origin. Covers railway.json, PORT and host binding, npm-workspace build ordering, serving the SPA from the API with an API-path exclusion, health checks, and the failure modes that produce a working local app and a broken deploy. Trigger before writing any deploy config or build script.
---

# Railway single-service deploy

One service, one origin, one URL. The API serves the built SPA and its own routes. No
CORS, no build-time API base URL, no second service.

## Non-negotiables

**Bind to the injected `PORT`, on `0.0.0.0`.** Railway injects `PORT`; a hardcoded 3000 or
a `localhost` bind produces a service that starts cleanly and is unreachable — the single
most common Railway failure.

```ts
const port = Number(process.env.PORT) || 3000;
await app.listen(port, "0.0.0.0");
```

**Never commit `.env`.** Set variables in the Railway dashboard or with `railway variables`.

**Reference other services by variable, not by URL.** If a second service ever appears,
use `${{ other.RAILWAY_PRIVATE_DOMAIN }}` rather than pasting a hostname.

## Build ordering with npm workspaces

The shared package must build before its consumers, or the API build fails on a missing
`dist`:

```json
{
  "workspaces": ["apps/*", "packages/*"],
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "npm run build -w @pay/contracts && npm run build -w @pay/api && npm run build -w @pay/web",
    "start": "node apps/api/dist/main.js",
    "dev": "npm run dev -w @pay/api & npm run dev -w @pay/web"
  }
}
```

Railway runs `npm ci` at the root, so workspace hoisting resolves the internal
`"@pay/contracts": "*"` dependency without any registry publish.

## railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Health check path must be a real route that returns 200 without touching any dependency.
Pointing it at `/` works until the SPA build fails, at which point the health check hides
the error instead of reporting it.

## Serving the SPA from Nest

```ts
ServeStaticModule.forRoot({
  rootPath: join(__dirname, "..", "..", "web", "dist"),
  exclude: ["/api/{*path}"],
})
```

Two things matter:

1. **Exclude the API prefix.** Without it, the static middleware answers `/api/payments`
   with `index.html`, and the client fails to parse HTML as JSON — a confusing 200-with-a-
   crash rather than an honest 404.
2. **`{*path}` is Express 5 / Nest 11 syntax.** The old `/api/*` wildcard throws a
   `path-to-regexp` error at boot on Express 5. If a deploy dies immediately with a
   `Missing parameter name` error, this is why.

Set the global prefix so routes and the exclusion agree:

```ts
app.setGlobalPrefix("api");
```

## Dev proxy so relative paths work locally too

```ts
// apps/web/vite.config.ts
server: { proxy: { "/api": "http://localhost:3000" } }
```

Now `fetch("/api/payments")` is correct in both environments and no `VITE_API_URL` exists
to be misconfigured.

## Verify path resolution before deploying

`__dirname` inside `apps/api/dist/` is not where you think it is. Confirm the built SPA is
actually reachable from the compiled output:

```bash
npm run build && node -e "console.log(require('fs').existsSync('apps/web/dist/index.html'))"
```

If that prints `false` locally, the deploy will serve a blank page.

## Deploy

```bash
npm i -g @railway/cli
railway login
railway init                 # or: railway link  (existing project)
railway up                   # deploy from local
railway domain               # generate the public URL
railway logs                 # watch the boot
```

For a repo you will keep iterating on, connect the GitHub repo in the dashboard instead
and let pushes to `main` deploy.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Build passes, health check fails, endless restarts | Hardcoded port or `localhost` bind | `PORT` env + `0.0.0.0` |
| Deploy crashes instantly, `Missing parameter name` | Express 4 wildcard on Express 5 | `/api/{*path}` |
| SPA loads, all API calls return HTML | Static middleware not excluding `/api` | Add `exclude` |
| `Cannot find module '@pay/contracts'` | Build order, or contracts not built | Build contracts first |
| Blank page, 200 responses | `rootPath` wrong relative to `dist` | Verify with the `existsSync` check |
| Works locally, 404 on refresh at a sub-route | No SPA fallback | Serve `index.html` for unmatched non-API paths |
| Build times out | `npm install` instead of `npm ci`, or dev deps in prod | `npm ci`, prune |

## Pre-deploy checklist

- [ ] `PORT` from env, bound to `0.0.0.0`
- [ ] `/api/health` returns 200 with no dependencies
- [ ] `healthcheckPath` set in `railway.json`
- [ ] Root `build` script orders contracts → api → web
- [ ] Static `exclude` covers the API prefix, in Express 5 syntax
- [ ] SPA fallback serves `index.html`; `/api/*` misses still return JSON 404
- [ ] No `.env` committed; `.gitignore` covers `node_modules`, `dist`, `.env`
- [ ] Fresh clone → `npm ci && npm run build && npm start` works before you push
