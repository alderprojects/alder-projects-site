#!/usr/bin/env bash
# =============================================================================
# Read v1 cron smoke test
# =============================================================================
# Hits each of the 5 cron endpoints with the bearer secret and reports
# pass/fail. Run after a fresh staging deploy or any time you suspect a
# cron handler regressed.
#
# Usage:
#   BASE_URL=https://read.alderprojects.com \
#   CRON_SECRET="$(vercel env pull --environment=production - 2>/dev/null | grep CRON_SECRET | cut -d= -f2 | tr -d '"')" \
#   ./scripts/test-crons.sh
#
# Or set BASE_URL=http://localhost:3000 and run against `npm run dev`
# (Vercel cron auth still applies — set CRON_SECRET in .env.local).
#
# Each test reports the HTTP status and a one-line summary parsed from the
# JSON response. Exit code is non-zero if any cron returns non-2xx.
# =============================================================================

set -uo pipefail

: "${BASE_URL:?BASE_URL is required (e.g. https://read.alderprojects.com)}"
: "${CRON_SECRET:?CRON_SECRET is required}"

# Strip trailing slash for clean concatenation
BASE_URL="${BASE_URL%/}"

pass=0
fail=0
results=()

hit() {
  local path="$1"
  local extra_args="${2:-}"
  local label="$3"
  local url="${BASE_URL}${path}"

  echo
  echo "▶ ${label}"
  echo "  GET ${url}${extra_args}"

  local body status
  body=$(curl -s -o /tmp/cron-test-body.$$ -w '%{http_code}' \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    "${url}${extra_args}")
  status="$body"
  body=$(cat /tmp/cron-test-body.$$)
  rm -f /tmp/cron-test-body.$$

  if [[ "$status" =~ ^2 ]]; then
    pass=$((pass + 1))
    echo "  ✓ ${status}"
    # Pretty-print first 400 chars of the JSON response
    echo "  $(echo "$body" | head -c 400)"
    results+=("PASS  ${label}  (${status})")
  else
    fail=$((fail + 1))
    echo "  ✗ ${status}"
    echo "  $(echo "$body" | head -c 400)"
    results+=("FAIL  ${label}  (${status})")
  fi
}

echo "========================================="
echo "Read v1 cron smoke test"
echo "BASE_URL=${BASE_URL}"
echo "========================================="

# 1. Auth check — wrong secret should 401
echo
echo "▶ Auth check (wrong secret should 401)"
authcode=$(curl -s -o /dev/null -w '%{http_code}' \
  -H "Authorization: Bearer wrong-secret-deliberately" \
  "${BASE_URL}/api/cron/catalog-refresh")
if [[ "$authcode" == "401" ]]; then
  pass=$((pass + 1))
  echo "  ✓ 401 (correctly rejects bad secret)"
  results+=("PASS  auth 401 rejection")
else
  fail=$((fail + 1))
  echo "  ✗ expected 401, got ${authcode}"
  results+=("FAIL  auth 401 rejection (got ${authcode})")
fi

# 2. Catalog refresh — should succeed (OBSERVE_ONLY mode, no writes,
#    digest email only if drift detected; on a fresh universe with no
#    prior snapshots, expect productsRefreshed=0 + driftCount=0)
hit "/api/cron/catalog-refresh" "" "Catalog refresh (observe-only)"

# 3. Catalog expand — should succeed and create 3-5 CatalogExpansionCandidate
#    rows. Pass ?scope=window_weatherization to bypass the day-of-year
#    rotation and get a deterministic scope for testing.
hit "/api/cron/catalog-expand" "?scope=window_weatherization" "Catalog expand (forced scope)"

# 4. Daily digest — should succeed; emails only sent if there are pending
#    candidates from step 3 (or Monday heartbeat). Check your inbox.
hit "/api/cron/daily-digest" "" "Daily digest"

# 5. GSC sync — expected to skip with DISABLE_GSC_CRON=true on initial
#    setup; if you've configured the service account it'll actually run.
hit "/api/cron/gsc-sync" "" "GSC sync (likely skipped until service account configured)"

# 6. Vision extract — week-1 stub, always returns {skipped: true}
hit "/api/cron/vision-extract" "" "Vision extract (week-1 stub)"

echo
echo "========================================="
echo "Summary: ${pass} pass, ${fail} fail"
echo "========================================="
for r in "${results[@]}"; do
  echo "  ${r}"
done

exit $((fail > 0 ? 1 : 0))
