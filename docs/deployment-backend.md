# Backend Deployment Runbook — portfolio-api

**Service:** portfolio-api (Bun + Hono)
**Port:** 3001 (localhost only)
**Systemd unit:** portfolio-api.service
**Working directory:** /root/www/nammon.men/api/
**VPS:** 194.233.87.204 (Ubuntu 24.04)

This runbook covers one-time setup on the VPS to enable the portfolio CMS backend.
Follow each step in order. Do not skip steps. If anything fails, stop and diagnose before continuing.

---

## Prerequisites

- SSH access to root@194.233.87.204 confirmed
- Bun installed at /usr/bin/bun on the VPS (verify: `bun --version`)
- Gitea Actions runner (gitea-runner) is registered and healthy
- nginx container is running (verify: `docker ps | grep nginx`)

---

## Step 1 — Create the API working directory

```bash
mkdir -p /root/www/nammon.men/api
```

Verify it exists:

```bash
ls -la /root/www/nammon.men/
# Expected: api/ directory present
```

---

## Step 2 — Create .env from the example template

```bash
cp /root/agentic/n-it-company-project/company-workspace/project-workspace/project-about-n4mmon-web/backend/.env.example \
   /root/www/nammon.men/api/.env
chmod 600 /root/www/nammon.men/api/.env
```

---

## Step 3 — Set secrets in .env

Open the file with your editor:

```bash
nano /root/www/nammon.men/api/.env
```

Fill in or verify every variable. Do NOT leave any value blank.

| Variable | Where to get the value |
|----------|----------------------|
| PORT | 3001 (keep as-is) |
| DATABASE_PATH | ./data/portfolio.db (keep as-is) |
| AUTHENTIK_JWKS_URL | Authentik Admin → Applications → portfolio → JWKS URL |
| ALLOWED_ORIGIN | https://nammon.men (keep as-is) |
| UPLOAD_DIR | ../www/nammon.men/about/assets/uploads (keep as-is) |

Save and close. Confirm permissions:

```bash
stat -c "%a %n" /root/www/nammon.men/api/.env
# Expected: 600 /root/www/nammon.men/api/.env
```

---

## Step 4 — Add nginx location blocks to the nammon.men vhost

Open the nammon.men nginx vhost config:

```bash
nano /root/nginx/conf.d/nammon.men.conf
```

Inside the `server` block for HTTPS (port 443), add the contents of `backend/nginx-api.conf`
from this repository. Insert it after the existing frontend location blocks, before the closing brace.

The two blocks to add are:
- `location /api/` — proxies API requests to port 3001
- `location /assets/uploads/` — serves uploaded media with long-lived cache headers

Save the file.

---

## Step 5 — Validate nginx config and reload

ALWAYS validate before reloading. Never skip this step.

```bash
docker exec nginx nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If the test fails, review the error message and fix the config before proceeding.

Once the test passes:

```bash
docker exec nginx nginx -s reload
```

---

## Step 6 — Install the systemd unit file

```bash
cp /root/agentic/n-it-company-project/company-workspace/project-workspace/project-about-n4mmon-web/backend/portfolio-api.service \
   /etc/systemd/system/portfolio-api.service
```

Reload systemd to pick up the new unit:

```bash
systemctl daemon-reload
```

---

## Step 7 — Enable and start the service

```bash
systemctl enable portfolio-api
systemctl start portfolio-api
```

Enable ensures the service restarts automatically after a reboot.

---

## Step 8 — Verify the service is running

Check the service status:

```bash
systemctl status portfolio-api
```

Expected output includes:
```
Active: active (running) since ...
```

If the service has failed or is in activating state, check logs immediately:

```bash
journalctl -u portfolio-api -n 50 --no-pager
```

Common failure causes at this stage:
- `/root/www/nammon.men/api/.env` missing or not readable
- Bun not found at `/usr/bin/bun` (check `which bun`)
- `node_modules` absent — the CI/CD pipeline handles this, but on first run you may need:
  `cd /root/www/nammon.men/api && bun install --frozen-lockfile --production`
- Port 3001 already in use: `ss -tlnp | grep 3001`

---

## Step 9 — Verify the API health endpoint

```bash
curl -sf http://localhost:3001/api/health
```

Expected: JSON response with status OK. Example:
```json
{"status":"ok"}
```

If the curl returns a connection refused error, the service has not bound to port 3001 yet.
Wait 2-3 seconds and retry. If it still fails, check the logs (Step 8).

---

## Step 10 — Smoke test the public endpoint through nginx

```bash
curl -sf https://nammon.men/api/health
```

Expected: Same JSON response as Step 9, served over HTTPS via nginx.

If this fails but Step 9 succeeded, the nginx proxy config is the issue.
Re-check Step 4 and Step 5.

---

## Ongoing Operations

### Restart the service (after .env changes or troubleshooting)

```bash
systemctl restart portfolio-api
```

### Tail live logs

```bash
journalctl -u portfolio-api -f
```

### Stop the service

```bash
systemctl stop portfolio-api
```

### Check if port 3001 is bound

```bash
ss -tlnp | grep 3001
```

---

## CI/CD Behaviour (Automatic on Push)

After this one-time setup, the Gitea Actions workflow `deploy-vps.yml` handles all subsequent deployments automatically on push to main:

1. Builds the Vue 3 frontend
2. Rsyncs `backend/` to `/root/www/nammon.men/api/`
3. Runs `bun install --frozen-lockfile --production`
4. Runs `bun run migrate` (database migrations)
5. Restarts `portfolio-api` via systemctl
6. Verifies `http://localhost:3001/api/health` responds

No manual steps are required after the initial setup is complete.

---

## Rollback Procedure

If a deployment breaks the API:

```bash
# 1. Stop the broken service
systemctl stop portfolio-api

# 2. In the Gitea UI, find the last known-good commit and revert
#    OR manually rsync the previous backend build to /root/www/nammon.men/api/

# 3. Restart
systemctl start portfolio-api

# 4. Verify
curl -sf http://localhost:3001/api/health
```

---

*deployment-backend.md — Last updated 2026-05-21 by @devops (sprint22-devops-001)*
