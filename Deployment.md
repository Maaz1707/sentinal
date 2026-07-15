# Deployment

## Target Platform

Deploy the app to Vercel as a static Vite site.

## Prerequisites

- Node.js installed
- Dependencies installed with `npm install`

## Local Verification

```bash
npm run build
npm run lint
```

## Vercel Setup

1. Import the Git repository into Vercel.
2. Keep the framework preset as Vite.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. The included `vercel.json` already configures the build and SPA rewrites.

## GitHub Pages Setup

1. Push the repository to GitHub.
2. In the repository settings, enable GitHub Pages from GitHub Actions.
3. Merge or push to `main` to trigger `.github/workflows/deploy.yml`.
4. The workflow builds the app and publishes `dist/` to Pages.

## Asset Paths

- Static public assets live under `public/`.
- The Leaflet images are served from `public/images/`.
- The app does not require runtime environment variables.

## Verification Checklist

- `npm run build` succeeds
- `npm run lint` succeeds
- the dashboard opens without manual setup
- the demo button starts the scripted scenario
- map, alerts, routes, and trust panels render on the first load

## Notes

If you want to tighten the production bundle later, split the map and simulation surfaces into lazily loaded chunks.