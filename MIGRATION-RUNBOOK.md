# Read v1 (v7.3.1) — Migration Runbook

This is the step-by-step for getting `read-v1` deployed to the staging
environment at `read.alderprojects.com`. Estimated total time: 30-45
minutes if you have the accounts ready, 60-90 if you're creating them
from scratch.

Steps marked **YOU** require your hands on an external account or DNS
console (I can't do these from the CLI session). Steps marked **CODE**
are already shipped in the branch.

---

## Pre-flight (5 min) — already done

- **CODE** `read-v1` branch exists locally with 5 commits (foundation +
  week-1 auth + expansion bundle + docs + tsc fixes)
- **CODE** Schema is 23 tables, validated, Prisma client generated
- **CODE** `npm install` succeeded; package-lock.json regenerated
- **CODE** `npx tsc --noEmit` is clean
- **CODE** All 9 route handlers export correct verbs

## 1. Push the branch (1 min)

```bash
cd "/Users/evanturner/Claude Work/alder-projects-site"
git push -u origin read-v1
```

This makes `read-v1` visible to Vercel for the next step. If the existing
prod Vercel project (`alderprojects.com`) has GitHub integration, this
push will trigger a preview deploy to a `*.vercel.app` URL — that's fine;
the staging project below replaces it.

## 2. Provision Neon Postgres (5 min) — **YOU**

1. https://console.neon.tech → New Project
2. Name: `alder-read-v1`
3. Region: `aws-us-east-2` (matches Vercel `iad1`)
4. Postgres version: 16 (default)
5. After creation, grab two connection strings from the dashboard:
   - **Pooled** (the one with `-pooler` in the host) — for `DATABASE_URL`
   - **Direct** (no `-pooler`) — for `DIRECT_URL` (Prisma migrations need this)

## 3. Create new Vercel staging project (10 min) — **YOU**

1. https://vercel.com/new → Import `alderprojects/alder-projects-site`
2. Name: `alder-read-v1` (distinct from the prod project)
3. Production Branch: **`read-v1`** (NOT `main` — this is the key setting
   that keeps prod untouched)
4. Framework Preset: Next.js (auto-detected)
5. **Do NOT deploy yet** — env vars need to be set first
6. Settings → Environment Variables → paste the values below into the
   "Production" environment (this project's "production" = our staging)

### Env vars to set (paste from [.env.local.example](.env.local.example))

Critical (without these, the deploy will boot but everything breaks):

```
DATABASE_URL=<Neon pooled URL from step 2>
DIRECT_URL=<Neon direct URL from step 2>
RESEND_API_KEY=<from resend.com/api-keys>
ANTHROPIC_API_KEY=<from console.anthropic.com>
AMAZON_PAAPI_ACCESS_KEY=<existing>
AMAZON_PAAPI_SECRET_KEY=<existing>
AMAZON_PAAPI_ASSOCIATE_TAG=alderstaging-20
AMAZON_PAAPI_REGION=us-east-1
CRON_SECRET=<generate with: openssl rand -hex 32>
BLOB_READ_WRITE_TOKEN=<from Vercel project's Storage tab → Create Blob Store>
NEXT_PUBLIC_BASE_URL=https://read.alderprojects.com
```

Mode flags (start conservative):

```
CATALOG_OBSERVE_ONLY=true          # keep until end of week 2
DISABLE_CATALOG_CRON=false
DISABLE_CATALOG_EXPAND_CRON=false
DISABLE_DIGEST_EMAIL=false
DISABLE_GSC_CRON=true              # keep true until step 7 below
DISABLE_VISION_EXTRACT_CRON=false  # the every-minute stub
GSC_SITE_URL=https://alderprojects.com/
GSC_SERVICE_ACCOUNT_JSON=          # empty until step 7
```

Resend addresses (optional — sensible defaults bake in):

```
ALERT_EMAIL=hello@alderprojects.com
ALERT_FROM_EMAIL=alerts@alderprojects.com
MAGIC_LINK_FROM_EMAIL=Alder Read <read@alderprojects.com>
```

## 4. Verify Resend domain + sender (5 min) — **YOU**

1. https://resend.com/domains → confirm `alderprojects.com` is verified
   (SPF/DKIM records show green)
2. If not verified yet: add the DNS records Resend shows you. Propagation
   ~5 min.
3. Sender identities don't need separate setup with a verified domain —
   any address on the domain works as a from-address.

## 5. DNS for the staging subdomain (5 min, propagation 5-30 min) — **YOU**

In your DNS console (likely Namecheap, Cloudflare, or wherever
`alderprojects.com` is registered):

- Add record:
  - Type: `CNAME`
  - Name: `read`
  - Value: `cname.vercel-dns.com.`
  - TTL: 300

Then back in Vercel:

- Settings → Domains → Add → `read.alderprojects.com`
- Vercel will detect the CNAME and issue an SSL cert automatically (~2 min)

## 6. Run the migration (3 min) — semi-**YOU**

The schema needs to be applied to the Neon DB. Two ways:

**A. Apply locally pointing at staging Neon (fastest):**

```bash
cd "/Users/evanturner/Claude Work/alder-projects-site"

# Use the connection strings from step 2 — put them in a temp .env.staging
cat > .env.staging <<EOF
DATABASE_URL="<Neon pooled URL>"
DIRECT_URL="<Neon direct URL>"
EOF

# Generate migration files and apply in one shot
npx dotenv -e .env.staging -- npx prisma migrate dev --name read-v1-foundation-and-expansion

# Verify
npx dotenv -e .env.staging -- npx prisma studio  # opens browser, should show 23 tables

# Clean up
rm .env.staging
```

This creates `prisma/migrations/<timestamp>_read-v1-foundation-and-expansion/migration.sql`
locally. **Commit that file** — production migration in week 4 uses it.

**B. Auto-apply on first Vercel deploy:**

Add to package.json scripts:
```json
"vercel-build": "prisma migrate deploy && next build"
```

Less explicit, but skips the local dotenv dance. I'd do A unless you
hate having Postgres credentials in a temp file.

## 7. (Optional, can skip for week 1) GSC service account (15 min) — **YOU**

The GSC cron stays disabled (`DISABLE_GSC_CRON=true`) until this is done.
Daily digest works without it; you only lose the AI Overview signal section.

Follow the 10-step process in [docs/READ-V1-BRIEF-PATCH.md](docs/READ-V1-BRIEF-PATCH.md)
under "Environment variables" — Google Cloud Console → service account →
Search Console property user.

Then flip `DISABLE_GSC_CRON=false` in Vercel env.

## 8. First deploy + smoke test (5 min)

After steps 1-6 are done:

1. Vercel: hit "Deploy" on the project (or push another commit — auto-deploys)
2. Watch the deploy logs for build errors. Common gotchas:
   - Prisma client not generated → check build script includes `prisma generate`
   - Missing env var at build time → `NEXT_PUBLIC_BASE_URL` is the usual one
3. Once deploy is green, run the smoke test:

```bash
BASE_URL=https://read.alderprojects.com \
CRON_SECRET="<the secret you set in Vercel>" \
./scripts/test-crons.sh
```

Expected results:
- ✓ auth 401 rejection
- ✓ catalog-refresh — returns `{ok: true, summary: {productsRefreshed: 0, ...}}` (universe loader is stubbed, returns 0 products until wired)
- ✓ catalog-expand?scope=window_weatherization — returns `{ok: true, scopeId: 'window_weatherization', candidatesGenerated: 3-5}`. Check the DB:
  ```sql
  SELECT title, "commodityRiskScore", status FROM "CatalogExpansionCandidate" ORDER BY "createdAt" DESC LIMIT 5;
  ```
- ✓ daily-digest — returns `{ok: true, candidatesPending: 3-5, emailSent: true}`. Check `hello@alderprojects.com` inbox for `[STAGING] Alder Read · 3 expansion` subject line.
- ✓ gsc-sync — returns `{skipped: true, reason: 'DISABLE_GSC_CRON=true'}` (expected)
- ✓ vision-extract — returns `{skipped: true, reason: 'stub_until_week_2'}` (expected)

If all 6 are green, **the cron layer of v7.3.1 is deployed and live.**

## 9. Auth smoke test (3 min)

```
1. Visit https://read.alderprojects.com/account/sign-in
2. Enter your email, click "Send sign-in link"
3. Check inbox for "Sign in to Alder Read" email
4. Click the magic link
5. Should land on /account showing "Signed in as <your email>"
6. Click "Sign out", verify back at /account/sign-in
```

If the email doesn't arrive within 30s, check:
- `RESEND_API_KEY` is set in Vercel env
- `MAGIC_LINK_FROM_EMAIL` uses an address on a Resend-verified domain
- Vercel function logs for the `/api/auth/magic-link/request` route

## 10. Photo upload smoke test (2 min)

Once signed in, grab the session cookie from browser dev tools, then:

```bash
curl -X POST https://read.alderprojects.com/api/photos/test-upload \
  -H "Cookie: alder_session=<the cookie value>" \
  -F "file=@/path/to/any/kitchen.jpg"
```

Expected response:
```json
{
  "ok": true,
  "photo": {
    "blobUrl": "https://<store>.public.blob.vercel-storage.com/photos/...",
    "blobKey": "photos/<userId>/<sha-prefix>.jpg",
    "mimeType": "image/jpeg",
    "bytes": 184320,
    "widthPx": 4032,
    "heightPx": 3024,
    "perceptualHash": "8b3f1a2c5e7d9f01"
  }
}
```

Visit the `blobUrl` in a browser — should show the photo with all EXIF
stripped (orientation baked into pixels, all camera/GPS metadata gone).

## After all 10 steps — v7.3.1 staging is complete

Week 1 success gates from the brief — track in this list:

- [ ] `read.alderprojects.com` is live and loads
- [ ] All 23 tables present in Neon (verify in Prisma Studio)
- [ ] Magic-link sign-in works end-to-end
- [ ] Photo upload test endpoint returns blob URL
- [ ] Catalog cron has run at least 4x and email digests received
- [ ] Catalog expansion cron generated 3+ candidates
- [ ] First daily digest email arrived
- [ ] Reject + supply-evidence flows work from email
- [ ] Vision eval harness passes pass criteria on 30+ test photos
  (this one's blocked on you populating `test-photos/<roomtype>/`)

## Cutover to prod (week 4 — NOT YET)

When the 4-week build is done, this runbook gets a sister
`MERGE-TO-MAIN.md` covering:
- DB backup before migration
- Migration applied to prod Neon
- Feature flags default-off check
- 301 redirects from `read.alderprojects.com/*` to `alderprojects.com/*`
- Ramp schedule days 28-35

Not in scope for this commit.
