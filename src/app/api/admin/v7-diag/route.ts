// V7 — pre-launch diagnostic endpoint.
//
// Hits every external dependency V7 relies on and reports back what is
// wired and what is missing. Designed to be the first thing you run
// after deploying V7 to a Vercel environment with all the env vars
// set.
//
// Auth: same token as /api/refund (ADMIN_REFUND_TOKEN), via either
//   Authorization: Bearer <token>
//   ?adminToken=<token> query string
//
// Returns 200 with a JSON report. Each check has a status:
//   ok       — wired correctly
//   warn     — present but suspicious (e.g. test-mode key in prod)
//   missing  — env var not set or dependency not reachable
//   error    — dependency reachable but returned an error
//
// Never echoes secret values. The mask helper truncates env values to
// the prefix + last 4 so the operator can sanity-check the right
// secret is present without leaking the full value to logs.

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { kv } from '@vercel/kv'
import { CONFIG } from '@/lib/recommender-config'

export const dynamic = 'force-dynamic'

type CheckStatus = 'ok' | 'warn' | 'missing' | 'error'

type Check = {
  id: string
  status: CheckStatus
  detail: string
  hint?: string
}

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_REFUND_TOKEN
  if (!expected) return false
  const url = new URL(req.url)
  const queryToken = url.searchParams.get('adminToken')
  if (queryToken === expected) return true
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${expected}`) return true
  return false
}

function mask(value: string | undefined): string {
  if (!value) return '(unset)'
  if (value.length <= 8) return `${value.slice(0, 2)}…(${value.length} chars)`
  return `${value.slice(0, 6)}…${value.slice(-4)} (${value.length} chars)`
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        hint:
          'Set ADMIN_REFUND_TOKEN in the deployed environment, then call ' +
          '/api/admin/v7-diag with Authorization: Bearer <token> or ' +
          '?adminToken=<token>.',
      },
      { status: 401 },
    )
  }

  const checks: Check[] = []

  // ---------- Env var presence ----------
  const env = process.env
  checks.push(envCheck('KV_REST_API_URL', env.KV_REST_API_URL, /^https?:\/\//))
  checks.push(envCheck('KV_REST_API_TOKEN', env.KV_REST_API_TOKEN))
  checks.push(envCheck('STRIPE_SECRET_KEY', env.STRIPE_SECRET_KEY, /^sk_/))
  checks.push(envCheck('STRIPE_WEBHOOK_SECRET', env.STRIPE_WEBHOOK_SECRET, /^whsec_/))
  checks.push(
    envCheck(
      'STRIPE_PAYMENT_LINK_SMART_CART',
      env.STRIPE_PAYMENT_LINK_SMART_CART,
      /^https:\/\/buy\.stripe\.com\//,
    ),
  )
  checks.push(
    envCheck(
      'STRIPE_PAYMENT_LINK_WORTH_IT',
      env.STRIPE_PAYMENT_LINK_WORTH_IT,
      /^https:\/\/buy\.stripe\.com\//,
    ),
  )
  checks.push(
    envCheck(
      'STRIPE_PAYMENT_LINK_UPGRADE',
      env.STRIPE_PAYMENT_LINK_UPGRADE,
      /^https:\/\/buy\.stripe\.com\//,
    ),
  )
  checks.push(envCheck('ADMIN_REFUND_TOKEN', env.ADMIN_REFUND_TOKEN))

  // V7.1 — Resend transport
  checks.push(envCheck('RESEND_API_KEY', env.RESEND_API_KEY, /^re_/))
  if (env.RESEND_API_KEY) {
    try {
      // Lightweight reachability check — list domains is a 200 with empty
      // body when no domains configured, so it's a clean smoke signal.
      const resp = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json',
        },
      })
      if (resp.ok) {
        checks.push({
          id: 'resend_smoke_test',
          status: 'ok',
          detail: 'Resend domains endpoint returned 200',
        })
      } else {
        checks.push({
          id: 'resend_smoke_test',
          status: 'error',
          detail: `Resend returned ${resp.status}`,
          hint: 'Confirm RESEND_API_KEY is valid and has domains:list permission.',
        })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown error'
      checks.push({
        id: 'resend_smoke_test',
        status: 'error',
        detail: `Resend call failed: ${msg}`,
      })
    }
  } else {
    checks.push({
      id: 'resend_smoke_test',
      status: 'missing',
      detail: 'RESEND_API_KEY not set — emails will stay queued, not sent',
    })
  }

  // ---------- V7.2.1: Worth-It pause status ----------
  checks.push({
    id: 'worth_it_status',
    status: 'ok',
    detail:
      'Worth-It is paused (coming-soon page). Notify list captures via /api/worth-it/notify-me.',
  })
  try {
    const notifyIndex = (await kv.get<string[]>('worth_it_notify:index')) ?? []
    checks.push({
      id: 'worth_it_notify_count',
      status: 'ok',
      detail: `Worth-It notify list: ${notifyIndex.length} email${notifyIndex.length === 1 ? '' : 's'} captured`,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    checks.push({
      id: 'worth_it_notify_count',
      status: 'error',
      detail: `Could not read notify list index: ${msg}`,
    })
  }

  // ---------- V7.2.2: admin cart debug endpoint ----------
  checks.push({
    id: 'admin_cart_endpoint',
    status: 'ok',
    detail:
      'Admin cart debug endpoint at /api/admin/cart/[cartId] available. Pass ?adminToken=<ADMIN_REFUND_TOKEN> to inspect cart.version and routing fields.',
  })

  // ---------- Mode detection (test vs live) ----------
  const stripeKey = env.STRIPE_SECRET_KEY ?? ''
  const isTestMode = stripeKey.startsWith('sk_test_')
  const isLiveMode = stripeKey.startsWith('sk_live_')
  checks.push({
    id: 'stripe_mode',
    status: isTestMode || isLiveMode ? 'ok' : 'warn',
    detail: isTestMode
      ? 'TEST mode (sk_test_…) — safe for end-to-end testing with card 4242 4242 4242 4242.'
      : isLiveMode
        ? 'LIVE mode (sk_live_…) — every successful checkout charges a real card.'
        : 'Cannot detect Stripe mode — secret key is not in expected format.',
  })

  // ---------- KV round-trip ----------
  try {
    const stamp = Date.now().toString(36)
    await kv.set(`diag:v7-diag:${stamp}`, { wroteAt: stamp }, { ex: 60 })
    const read = await kv.get(`diag:v7-diag:${stamp}`)
    if (read) {
      checks.push({
        id: 'kv_roundtrip',
        status: 'ok',
        detail: 'Vercel KV write + read succeeded. TTL applied (60s).',
      })
    } else {
      checks.push({
        id: 'kv_roundtrip',
        status: 'error',
        detail: 'KV write succeeded but read returned null. Check the KV instance binding.',
      })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    checks.push({
      id: 'kv_roundtrip',
      status: 'error',
      detail: `KV round-trip failed: ${msg}`,
      hint:
        'In Vercel: Storage → bind a KV (Redis) instance to this project, then redeploy so KV_REST_API_URL and KV_REST_API_TOKEN inject.',
    })
  }

  // ---------- Stripe API reachable ----------
  try {
    if (!stripeKey) {
      checks.push({
        id: 'stripe_api',
        status: 'missing',
        detail: 'STRIPE_SECRET_KEY not set — cannot exercise the Stripe API.',
      })
    } else {
      const stripe = new Stripe(stripeKey)
      const balance = await stripe.balance.retrieve()
      checks.push({
        id: 'stripe_api',
        status: 'ok',
        detail: `Stripe API reachable. Account currency: ${balance.available[0]?.currency ?? '(no available)'}.`,
      })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown error'
    checks.push({
      id: 'stripe_api',
      status: 'error',
      detail: `Stripe API call failed: ${msg}`,
      hint:
        'Verify STRIPE_SECRET_KEY is the API key (Developers → API keys), not a publishable key (pk_…).',
    })
  }

  // ---------- Payment Link resolution ----------
  for (const [envName, productLabel] of [
    ['STRIPE_PAYMENT_LINK_SMART_CART', 'Smart Cart $19.99'],
    ['STRIPE_PAYMENT_LINK_WORTH_IT', 'Worth-It Plan $39.99'],
    ['STRIPE_PAYMENT_LINK_UPGRADE', 'Upgrade $20'],
  ] as const) {
    const value = env[envName]
    if (!value) {
      // Skip — env-presence check above already flagged this.
      continue
    }
    try {
      const url = new URL(value)
      const ok = url.host === 'buy.stripe.com' && url.pathname.length > 1
      checks.push({
        id: `payment_link_${envName.toLowerCase()}`,
        status: ok ? 'ok' : 'warn',
        detail: ok
          ? `${productLabel}: ${url.host}${url.pathname.slice(0, 16)}…`
          : `${productLabel}: URL host is "${url.host}", expected buy.stripe.com.`,
      })
    } catch {
      checks.push({
        id: `payment_link_${envName.toLowerCase()}`,
        status: 'error',
        detail: `${productLabel}: URL is malformed.`,
      })
    }
  }

  // ---------- CONFIG sanity (V7 specific) ----------
  checks.push({
    id: 'config_version',
    status: CONFIG.version.includes('v7') ? 'ok' : 'warn',
    detail: `CONFIG.version = ${CONFIG.version}`,
  })
  checks.push({
    id: 'config_products_enabled',
    status:
      CONFIG.products.smartCart.enabled &&
      CONFIG.products.worthIt.enabled &&
      CONFIG.products.upgrade.enabled
        ? 'ok'
        : 'warn',
    detail: `enabled flags — smartCart=${CONFIG.products.smartCart.enabled}, worthIt=${CONFIG.products.worthIt.enabled}, upgrade=${CONFIG.products.upgrade.enabled}`,
  })

  // ---------- Summary ----------
  const failed = checks.filter(c => c.status === 'missing' || c.status === 'error')
  const warned = checks.filter(c => c.status === 'warn')
  const summary = {
    overall:
      failed.length === 0 && warned.length === 0
        ? 'green'
        : failed.length === 0
          ? 'yellow'
          : 'red',
    failed: failed.length,
    warned: warned.length,
    total: checks.length,
  }

  return NextResponse.json({
    summary,
    checks,
    masked_env: {
      KV_REST_API_URL: mask(env.KV_REST_API_URL),
      KV_REST_API_TOKEN: mask(env.KV_REST_API_TOKEN),
      STRIPE_SECRET_KEY: mask(env.STRIPE_SECRET_KEY),
      STRIPE_WEBHOOK_SECRET: mask(env.STRIPE_WEBHOOK_SECRET),
      STRIPE_PAYMENT_LINK_SMART_CART: mask(env.STRIPE_PAYMENT_LINK_SMART_CART),
      STRIPE_PAYMENT_LINK_WORTH_IT: mask(env.STRIPE_PAYMENT_LINK_WORTH_IT),
      STRIPE_PAYMENT_LINK_UPGRADE: mask(env.STRIPE_PAYMENT_LINK_UPGRADE),
      ADMIN_REFUND_TOKEN: mask(env.ADMIN_REFUND_TOKEN),
    },
    instructions: {
      next:
        summary.overall === 'green'
          ? [
              'All checks passed. Run an end-to-end test before opening live traffic:',
              '  1. Visit /smart-cart, click Build My Smart Cart',
              '  2. Pick kitchen → cosmetic_refresh → just_starting',
              '  3. Use Stripe test card 4242 4242 4242 4242 (any future expiry, any CVC)',
              '  4. Confirm redirect to /smart-cart/result/CART-XXXXXX renders',
              '  5. Hit /api/admin/email-queue (when shipped) to confirm receipt enqueued',
              '  6. Repeat for /worth-it.',
            ]
          : summary.overall === 'yellow'
            ? [
                'No hard failures. Resolve the warn items, then run an end-to-end test.',
              ]
            : [
                'Failures present. Resolve the missing/error items below before touching live traffic.',
              ],
    },
  })
}

function envCheck(key: string, value: string | undefined, format?: RegExp): Check {
  if (!value) {
    return {
      id: `env_${key.toLowerCase()}`,
      status: 'missing',
      detail: `${key} is not set`,
      hint:
        key.startsWith('STRIPE_PAYMENT_LINK_')
          ? 'Stripe → Payment links → copy the live URL (buy.stripe.com/…)'
          : key.startsWith('STRIPE_')
            ? 'Stripe → Developers → API keys / Webhooks'
            : key.startsWith('KV_')
              ? 'Vercel → Storage → bind a KV (Redis) instance'
              : undefined,
    }
  }
  if (format && !format.test(value)) {
    return {
      id: `env_${key.toLowerCase()}`,
      status: 'warn',
      detail: `${key} is set but does not match expected format`,
    }
  }
  return {
    id: `env_${key.toLowerCase()}`,
    status: 'ok',
    detail: `${key} present`,
  }
}
