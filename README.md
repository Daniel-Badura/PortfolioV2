# Daniel Badura — Portfolio

React + TypeScript portfolio with prerendered pages and a small Express API. Requires Node.js **24 LTS** and npm. No database or secrets needed by default.

## Development

```sh
npm ci
npm ci --prefix frontend
npm run dev
```

Frontend: http://localhost:5173. API: http://localhost:5000/api/projects.
Server and frontend retain separate lockfiles. No legacy OpenSSL or ts-node workaround is required.

## Content and architecture

- `shared/projects.json`: versioned project archive, shared by frontend fallback, prerender and API.
- `frontend/src/content/profile.ts`: identity, professional links and metadata.
- `frontend/src/screens/`: overview, projects and contact.
- `frontend/src/index.css`: responsive layout and visual tokens.
- `backend/app.js`: API, static delivery, compression and security headers.
- `docs/AUDIT.md`: findings, priorities and decisions.
- `docs/VALIDATION.md`: verification results and limitations.

React 18 and Express remain. CRA was replaced by Vite because of its maintenance status and oversized dependency tree. Router 7 uses declarative mode; no framework-mode migration. Redux, axios and Tailwind were unnecessary for this small read-only portfolio; typed context, fetch and plain CSS replace them. Prerendering provides visible HTML without a runtime SSR framework.

Content follows the projects featured on [Badura Tech](https://baduratech.com/en): Music Info, skle.pl, Ogrodnictwo Badura and SHOT, plus the Badura Tech company website and client portal. Badura Tech leads the featured selection. skle.pl is labelled as a demo and SHOT as in development, with a link to Steam. Projects without a public repository show only their website or project link. Music Info and skle.pl previews come from the Badura Tech project; Badura Tech uses a public-site screenshot and SHOT uses a gameplay screenshot from Steam. The owner's DevOps / Platform Engineering focus remains. Employment history, cloud technologies, certifications, infrastructure case studies and numerical achievements must be supplied by the owner before publication.

Original media remain in source control. Unused originals are excluded from production. To update project images, add the original JPEG in `frontend/public/images/`, update the corresponding WebP path in the archive, and run `npm run assets`. It generates 360/540/720px variants and the social preview. Commit generated images; the production build does not need sharp.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
npm audit --prefix frontend
```

E2E starts an isolated production server on port 4173. It covers mobile/desktop layouts, actual image loading, axe accessibility, keyboard navigation, API failure, project search, contact submissions, no-JavaScript navigation, 404s and compression. Set `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome instead of Playwright Chromium. CI runs the same checks.

## Contact form

The contact page uses the official `@formspree/react` hook with form `moevqqvl`. No SMTP credentials, email server or database is needed. The default endpoint works without environment configuration. To override it, set `VITE_FORMSPREE_FORM_ID` in `frontend/.env.local` (see `frontend/.env.example`) or the build environment, then rebuild. This ID is public, not a secret. Docker Compose forwards it as a build argument.

The form collects name, reply email and message, validates required fields, includes Formspree's `_gotcha` honeypot, disables resubmission while sending and preserves text on errors. Without JavaScript it uses a native POST to Formspree, which provides the response page. CSP permits connections and form submissions only to the Formspree origin in addition to existing same-origin connections. No external script or CAPTCHA is loaded by the page.

Formspree receives the submitted data; the form includes a privacy notice and link to its policy. Recipient verification, notification settings, spam rules and plan limits are managed in the Formspree dashboard. Configure any additional CAPTCHA there deliberately; a browser-based CAPTCHA may require additional integration and CSP allowances. Browser tests intercept all submissions locally: they do not verify real inbox delivery or send test messages.

## Production

Set `SITE_URL` to the actual public origin **at build time**, then:

```sh
npm run build
NODE_ENV=production npm start
```

On PowerShell use `$env:NODE_ENV = 'production'`, then `npm start`.
The server honors `PORT` (default 5000). Routes: `/`, `/projects`, `/contact`; unknown routes return 404. Legacy `/facebook` and `/instagram` redirect to contact.

Without SITE_URL, canonical URLs, sitemap and absolute OG image metadata are deliberately omitted rather than pointing to an unconfirmed old domain. Titles, descriptions, robots.txt and Person JSON-LD are still generated. After setting the domain, rebuild.

Express serves CSP with a JSON-LD hash, anti-framing, nosniff and referrer/permissions headers. Hashed JS/CSS have immutable caching and Brotli/gzip variants; HTML is compressed and revalidated. HTTPS termination, redirects and HSTS belong at the production hosting/reverse proxy layer. Confirm the domain and affected subdomains before enabling HSTS.

### GitHub Actions and the portfolio VPS

The portfolio uses its own Docker Compose project on the shared VPS `178.104.2.136`. The public origin stays `https://www.daniel-badura.com`; the apex redirects to www. Host Caddy proxies only these domains to `127.0.0.1:8085`. Other sites, Docker projects, volumes and Caddy blocks are outside this deployment's scope.

`.github/workflows/quality.yml` runs lint, TypeScript, API tests, deployment-tooling tests, production build and browser tests. After successful verification, trusted `main` pushes/manual runs build an image on the GitHub runner, pin its source revision, transfer it over SSH and deploy through the root-owned gateway. No image build runs on the VPS. Queued superseded commits are skipped; active deployments are not cancelled.

Runtime: `/opt/portfolio/control/compose.yaml`, project `portfolio-production`, 192 MiB RAM, 0.5 CPU, read-only filesystem, unprivileged Node process, no capabilities, no database/volume and bounded container logs. Temporary project `portfolio-candidate` on loopback port 8086 is verified before promotion and removed afterwards. Checks cover the exact `/version.json` commit, API health, projects, pages and project images. A failed replacement restores the previous portfolio image when one exists. Uploaded images are size-bounded, checked for unsafe archive paths/links, restricted to the portfolio commit tag and checked for matching source labels before loading. Old image IDs and release metadata are retained for rollback; no global Docker cleanup runs.

One-time operator installation, from a reviewed source snapshot:

```sh
# Root, in the deployment snapshot; pass a new dedicated public key.
bash deploy/install.sh /operator/portfolio-ci.pub
```

The `portfolio-deploy` account has a locked password, no Docker/sudo group and no interactive shell access through its CI key. Its root-owned authorized key forces a gateway accepting only `status`, `deploy <40-hex-SHA>` with a gzip Docker image on stdin, or `rollback <40-hex-SHA>` for an already recorded release. The narrow sudo rule permits only the installed gateway. Source changes to the gateway/Compose require a reviewed operator update; the upload never replaces host control code.

GitHub environment `portfolio-production`: secret `PORTFOLIO_DEPLOY_KEY` holds only this dedicated private key. Repository variables: `PORTFOLIO_DEPLOY_HOST=178.104.2.136`, `PORTFOLIO_DEPLOY_USER=portfolio-deploy`, and `PORTFOLIO_SSH_KNOWN_HOSTS` containing the verified host public key obtained over an authenticated operator connection. `PORTFOLIO_DEPLOY_ENABLED=true` enables deployment. `PORTFOLIO_PUBLIC_CHECK_ENABLED=true` adds a public-domain verification after DNS cutover; keep it false during first local VPS preparation. Keys are temporary on the runner and removed on exit. No root/admin SSH key is stored in Actions.

Bootstrap sequence: install the gateway/key, configure Actions, push the tested workflow, check the candidate and production loopback endpoints, then validate and append `deploy/Caddyfile.fragment` to the current Caddy configuration without replacing existing site blocks. Reload Caddy only after validation. Change only the Cloudflare origin records for the portfolio apex/www, preserving unrelated DNS and Cloudflare settings. Verify TLS, canonical URLs, exact release SHA and existing sites before freezing the previous Heroku deployment trigger. Keep the Heroku app available as a fallback until the owner confirms retirement. No Heroku subscription cancellation is part of deployment.

Operations (using the dedicated key and verified known_hosts):

```sh
ssh portfolio-deploy@178.104.2.136 status
ssh portfolio-deploy@178.104.2.136 'rollback PREVIOUS_40_HEX_SHA'
gh workflow run quality.yml --ref main --repo Daniel-Badura/PortfolioV2
```

Pause new deployments with repository variable `PORTFOLIO_DEPLOY_ENABLED=false`; it does not stop a running deploy. Failed/ambiguous deployments require inspection of the workflow, gateway output and the scoped Compose project before retrying. The authoritative running revision is the image ID and `/version.json`; release metadata is updated only after health checks. This application has no durable server-side data; source and immutable images are its recovery inputs. Heroku build hooks remain in package.json only for fallback compatibility.

### Docker

Set SITE_URL in the shell, then run:

```sh
docker compose up --build
```

Open http://localhost:3000. The multi-stage image runs as the unprivileged Node user. Compose uses a read-only filesystem, drops capabilities and enables a health check. Local environment secrets are excluded. A running Docker daemon is required.

### Optional MongoDB

Set `DATA_SOURCE=mongodb` and `MONGO_URI` at runtime. File mode is the default even if a historical URI exists in local .env, avoiding unintended access to an old database.

The adapter preserves the legacy schema, normalizes string technology lists and maps known images to optimized versions. Additional database-only records must reference local assets included in the production build. Prerendered HTML and offline fallback use the versioned archive; database changes appear after hydration. Prefer editing the archive and rebuilding for search-engine-visible changes.

The importer upserts known projects instead of deleting the collection. Back up the database before using these explicit maintenance commands:

```sh
npm run data:feed -- --confirm
npm run data:remove -- --confirm
```

Neither seeding nor deletion was run during modernization.
