# Deployment Guide — project-about-n4mmon-web

**Target:** GitHub Pages (static site)
**Build tool:** Vite + Bun
**Last updated:** 2026-05-15

---

## Prerequisites

1. **GitHub repository** — the project must be pushed to a GitHub repository named `project-about-n4mmon-web` (or the `base` in `vite.config.ts` must match the actual repo name).
2. **GitHub Pages enabled** — go to the repository on GitHub, navigate to Settings → Pages → Build and deployment → Source, and select **GitHub Actions**.
3. **No additional secrets** — this site is fully static with no API keys; the workflow requires no repository secrets.

---

## How the Workflow Triggers

The workflow file is located at `.github/workflows/deploy.yml`.

- **Automatic trigger:** every push to the `main` branch runs the full build and deploy pipeline.
- **No manual trigger** is configured by default. See the manual deploy section below if needed.
- **Concurrency control:** only one deployment runs at a time. A new push to `main` while a deployment is in progress will cancel the in-progress run and start a fresh one.

### Pipeline stages

```
push to main
  └── build job
        ├── actions/checkout@v4        — clone repository
        ├── oven-sh/setup-bun@v2       — install Bun (latest)
        ├── bun install --frozen-lockfile — install dependencies exactly as locked
        ├── bun run build              — runs vue-tsc then vite build → dist/
        ├── actions/configure-pages@v4 — configure the Pages environment
        └── actions/upload-pages-artifact@v3 — upload dist/ as the deployable artifact
  └── deploy job (needs: build)
        └── actions/deploy-pages@v4   — publish artifact to GitHub Pages
```

---

## Expected URL

Once the first successful deployment completes, the site is accessible at:

```
https://<username>.github.io/project-about-n4mmon-web/
```

Replace `<username>` with the GitHub account or organization that owns the repository.

The `base: '/project-about-n4mmon-web/'` setting in `vite.config.ts` ensures all Vite-generated asset paths (JS chunks, CSS, images) are prefixed with the subdirectory path, so resources load correctly from the Pages URL.

---

## Manual Deploy

If you need to deploy outside of the automated pipeline (e.g., from a local machine for a hotfix):

```bash
# 1. Install dependencies
bun install --frozen-lockfile

# 2. Build the production artifact
bun run build
# Output: dist/ directory

# 3. Upload dist/ manually
#    Option A — GitHub web UI: Settings → Pages → upload dist/ contents
#    Option B — gh-pages CLI:
#      npx gh-pages -d dist
#    Option C — push dist/ to a gh-pages branch:
#      git subtree push --prefix dist origin gh-pages
```

Note: the automated Actions workflow is the canonical deployment path. Manual deploys should only be used as a last resort and should be followed by a normal push to `main` to re-sync the pipeline state.

---

## Caveats

### No Vue Router — no hash mode needed

This project does not use Vue Router. It is a single-page static site with anchor-based smooth scroll navigation. There are no client-side routes, so no special router configuration (hash mode vs. history mode) is required.

If Vue Router is added in the future, use `createWebHashHistory()` (hash mode: `/#/path`) for GitHub Pages compatibility. GitHub Pages serves a single `index.html` and does not support server-side URL rewriting needed for history mode without a custom 404 redirect workaround.

### Repo name must match `base`

If the GitHub repository is renamed, the `base` value in `vite.config.ts` must be updated to match. A mismatch causes all assets (JS/CSS) to return 404 on the deployed site.

```ts
// vite.config.ts
base: '/your-actual-repo-name/',
```

### Branch protection

The workflow only deploys from `main`. Pushes to feature branches (`feat/*`, `fix/*`) do not trigger a deployment. This is intentional.

### GitHub Pages environment

The workflow uses the `github-pages` environment in GitHub Actions. If the environment does not exist in the repository settings, GitHub will create it automatically on first deployment. Deployment protection rules (e.g., required reviewers) can be added to this environment in Settings → Environments → github-pages.

---

*Deployment guide maintained by DevOps Engineer — T503 (Sprint 11, 2026-05-15)*
