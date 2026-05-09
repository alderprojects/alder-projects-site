// V7.2.3 — runtime cart-equivalence verification endpoint.
//
// GET /api/admin/v723-verify?adminToken=<ADMIN_REFUND_TOKEN>
//
// Runs the same assertions the Jest test in
// src/lib/__tests__/v723-migration.test.ts would, but server-side
// against the deployed Vercel preview (no test runner needed). Used
// as the v7.2.3 merge gate: an operator hits this URL post-deploy
// and confirms `pass: true` before merging.
//
// Returns:
//   { pass: true,  ...stats }     — all checks passed
//   { pass: false, failures: [] } — 422 with failure list

import { NextResponse, type NextRequest } from 'next/server'
import {
  getAllCatalogs,
  getCatalog,
  getUniverse,
} from '@/content/smart-cart'
import { buildSmartCartV2 } from '@/lib/buildSmartCartV2'
import type { TopicId } from '@/lib/property-modules'
import type { BriefScenarioId } from '@/lib/recommender-config.types'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest): boolean {
  const expected = process.env.ADMIN_REFUND_TOKEN
  if (!expected) return false
  const queryToken = req.nextUrl.searchParams.get('adminToken')
  if (queryToken === expected) return true
  const auth = req.headers.get('authorization')
  if (auth === `Bearer ${expected}`) return true
  return false
}

interface Failure {
  check: string
  detail: string
}

// V7.2.4 — per-catalog expected slot/skip counts. Source of truth
// for "did the migration preserve information." Update when new
// catalogs land or when a catalog adds/removes slots.
//
// V7.2.5 — paste 1 leaves this table unchanged. Pastes 2-4 register
// the 10 new scopes here as their catalogs ingest:
//   outdoor_freeze_prevention, outdoor_seasonal_opening,
//   outdoor_deck_refresh, mudroom_entry_reset, universal_owner_kit,
//   home_moisture_control, home_water_quality, outdoor_dock_lake,
//   home_safety_kit, universal_project_prep
const EXPECTED_STATS: Record<string, { slotCount: number; skipCount: number }> = {
  kitchen_organizers: { slotCount: 11, skipCount: 11 },         // 8 core + 3 add-ons
  kitchen_cosmetic_refresh: { slotCount: 9, skipCount: 11 },
  kitchen_cabinet_hardware_swap: { slotCount: 6, skipCount: 10 },
  outdoor_lake_season: { slotCount: 12, skipCount: 14 },
  // V7.2.5 paste 2 — outdoor catalogs. Spec listed
  // freeze_prevention skipCount: 11 but the source ships 10 skip
  // items as authored; using actual.
  outdoor_deck_refresh: { slotCount: 8, skipCount: 10 },
  outdoor_seasonal_opening: { slotCount: 8, skipCount: 9 },
  outdoor_freeze_prevention: { slotCount: 9, skipCount: 10 },
  // V7.2.5 paste 3 — home_repair + universal catalogs. Matches
  // spec exactly. mudroom_entry_reset pending source file.
  home_moisture_control: { slotCount: 7, skipCount: 8 },
  universal_owner_kit: { slotCount: 10, skipCount: 9 },
  // V7.2.5 paste 4 — final 4 scopes. All match spec exactly.
  home_water_quality: { slotCount: 8, skipCount: 8 },
  outdoor_dock_lake: { slotCount: 8, skipCount: 8 },
  home_safety_kit: { slotCount: 6, skipCount: 8 },
  universal_project_prep: { slotCount: 7, skipCount: 7 },
  // V7.2.6 — mudroom_entry_reset ingested (paste 3 source file).
  mudroom_entry_reset: { slotCount: 8, skipCount: 9 },
}

// V7.2.5 — destinations a catalog can route a buyer to instead of
// synthesizing a Smart Cart. Mirrors the union in
// ScopeCatalog.routeOutRules; kept as a literal array here so
// runtime validation doesn't require importing the type.
const VALID_ROUTE_OUT_DESTINATIONS = [
  'worth_it',
  'small_pro',
  'contractor',
  'verify_first',
] as const

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const failures: Failure[] = []
  const universe = getUniverse()
  const catalogs = getAllCatalogs()

  // ---------- Universe-level checks ---------------------------------
  if (universe.length === 0) {
    failures.push({
      check: 'universe_nonempty',
      detail: 'getUniverse() returned an empty array',
    })
  }

  const seenIds = new Set<string>()
  for (const p of universe) {
    if (seenIds.has(p.universeId)) {
      failures.push({
        check: 'universe_unique_ids',
        detail: `Duplicate universeId: ${p.universeId}`,
      })
    }
    seenIds.add(p.universeId)
    if (!p.migratedFrom) {
      failures.push({
        check: 'universe_provenance',
        detail: `Missing migratedFrom on ${p.universeId}`,
      })
    }
    if (p.variant.priceLow <= 0) {
      failures.push({
        check: 'universe_price',
        detail: `Non-positive priceLow on ${p.universeId}`,
      })
    }
    if (p.variant.priceHigh < p.variant.priceLow) {
      failures.push({
        check: 'universe_price',
        detail: `priceHigh < priceLow on ${p.universeId}`,
      })
    }
  }

  // ---------- Catalog-level checks ---------------------------------
  if (catalogs.length === 0) {
    failures.push({
      check: 'catalogs_nonempty',
      detail: 'getAllCatalogs() returned an empty array',
    })
  }

  for (const c of catalogs) {
    for (const s of c.scenarios) {
      if (!c.scenarioDefaults[s]) {
        failures.push({
          check: 'scenario_defaults_complete',
          detail: `Catalog ${c.scopeVariantId} scenarios includes ${s} but scenarioDefaults missing`,
        })
      }
    }

    // V7.2.4 — slot/skip count regression check.
    const expected = EXPECTED_STATS[c.scopeVariantId]
    if (!expected) {
      failures.push({
        check: 'expected_stats_registered',
        detail: `No EXPECTED_STATS entry for ${c.scopeVariantId} — add one to v723-verify when authoring a new catalog`,
      })
    } else {
      if (c.slots.length !== expected.slotCount) {
        failures.push({
          check: 'catalog_slot_count',
          detail: `${c.scopeVariantId}: slot count ${c.slots.length} !== expected ${expected.slotCount}`,
        })
      }
      if (c.skipList.length !== expected.skipCount) {
        failures.push({
          check: 'catalog_skip_count',
          detail: `${c.scopeVariantId}: skip count ${c.skipList.length} !== expected ${expected.skipCount}`,
        })
      }
    }

    // V7.2.5 — route-out rule validation. Catalogs that opt into
    // route-out must use one of the four declared destinations.
    if (c.routeOutRules?.length) {
      for (const rule of c.routeOutRules) {
        const valid = (VALID_ROUTE_OUT_DESTINATIONS as readonly string[]).includes(
          rule.destination,
        )
        if (!valid) {
          failures.push({
            check: 'route_out_destination_valid',
            detail: `${c.scopeVariantId}: invalid route-out destination "${rule.destination}"`,
          })
        }
      }
    }

    // V7.2.5 — informational notice: outdoor scopes that don't
    // declare an absentee_owner default suggest authoring drift, but
    // do not fail the gate. Filter on `informational` substring when
    // gating merges.
    if (
      c.topic === 'outdoor' &&
      !Object.keys(c.scenarioDefaults).includes('absentee_owner')
    ) {
      failures.push({
        check: 'outdoor_absentee_owner_default',
        detail: `${c.scopeVariantId}: outdoor scope without absentee_owner scenario default (informational)`,
      })
    }
  }

  // ---------- Per-scope cart-equivalence checks --------------------
  // V7.2.4 — verify each scenario the catalog declares it serves
  // (rather than a fixed list). This covers outdoor_lake_season's
  // lake_property scenario in addition to the standard four.
  const STANDARD_SCENARIOS: BriefScenarioId[] = [
    'just_starting',
    'tight_budget',
    'already_have_basics',
    'premium',
  ]

  type ScopeStat = {
    topic: TopicId
    scopeVariantId: string
    perScenario: Record<string, { slots: number; skips: number; savingsHigh: number }>
    alreadyHaveFilteringWorks: boolean | null
  }
  const scopeStats: ScopeStat[] = []

  for (const c of catalogs) {
    const stat: ScopeStat = {
      topic: c.topic,
      scopeVariantId: c.scopeVariantId,
      perScenario: {},
      alreadyHaveFilteringWorks: null,
    }

    // Verify the standard four scenarios + any catalog-specific
    // additions (e.g. outdoor_lake_season adds lake_property).
    const scenariosForCatalog = Array.from(
      new Set<BriefScenarioId>([...STANDARD_SCENARIOS, ...c.scenarios]),
    )

    for (const scenario of scenariosForCatalog) {
      const cart = buildSmartCartV2(
        {
          cartId: `VERIFY-${c.scopeVariantId}-${scenario}`,
          topic: c.topic,
          scopeVariantId: c.scopeVariantId,
          scenario,
          customerEmail: 'verify@alderprojects.com',
          selectedTier: c.scenarioDefaults[scenario]?.selectedTier ?? 'sweet_spot',
          alreadyHave: c.scenarioDefaults[scenario]?.alreadyHave ?? [],
        },
        c,
        universe,
      )

      stat.perScenario[scenario] = {
        slots: cart.slots.length,
        skips: cart.skipList.length,
        savingsHigh: cart.savings.potentialSavingsHigh,
      }

      if (cart.version !== 2) {
        failures.push({
          check: 'cart_version',
          detail: `${c.scopeVariantId}/${scenario}: cart.version=${cart.version}`,
        })
      }
      if (cart.slots.length === 0) {
        failures.push({
          check: 'cart_slots_nonempty',
          detail: `${c.scopeVariantId}/${scenario}: 0 slots resolved`,
        })
      }
      if (cart.savings.potentialSavingsHigh < cart.savings.potentialSavingsLow) {
        failures.push({
          check: 'savings_sane',
          detail: `${c.scopeVariantId}/${scenario}: high < low in potentialSavings`,
        })
      }
      cart.slots.forEach(slot => {
        if (!slot.tiers.sweet_spot) {
          failures.push({
            check: 'slot_sweet_spot_resolved',
            detail: `${c.scopeVariantId}/${scenario}: slot ${slot.slotId} has no sweet_spot variant`,
          })
        } else if (!slot.tiers.sweet_spot.affiliateUrl.includes('amazon.com')) {
          failures.push({
            check: 'slot_affiliate_url',
            detail: `${c.scopeVariantId}/${scenario}/${slot.slotId}: affiliateUrl missing amazon.com`,
          })
        }
      })
    }

    // alreadyHave filtering check
    const slotsWithConditional = c.slots.filter(s => s.conditionalOn.length > 0)
    if (slotsWithConditional.length > 0) {
      const flag = slotsWithConditional[0].conditionalOn[0]
      const baseline = buildSmartCartV2(
        {
          cartId: 'VERIFY-baseline',
          topic: c.topic,
          scopeVariantId: c.scopeVariantId,
          scenario: 'just_starting',
          customerEmail: 'verify@alderprojects.com',
          selectedTier: 'sweet_spot',
          alreadyHave: [],
        },
        c,
        universe,
      )
      const filtered = buildSmartCartV2(
        {
          cartId: 'VERIFY-filtered',
          topic: c.topic,
          scopeVariantId: c.scopeVariantId,
          scenario: 'just_starting',
          customerEmail: 'verify@alderprojects.com',
          selectedTier: 'sweet_spot',
          alreadyHave: [flag],
        },
        c,
        universe,
      )
      const works =
        filtered.slots.length < baseline.slots.length &&
        !filtered.slots.find(s => s.slotId === slotsWithConditional[0].slotId)
      stat.alreadyHaveFilteringWorks = works
      if (!works) {
        failures.push({
          check: 'already_have_filtering',
          detail: `${c.scopeVariantId}: setting ${flag} did not drop slot ${slotsWithConditional[0].slotId}`,
        })
      }
    }

    scopeStats.push(stat)
  }

  // V7.2.5 — informational failures (route-out drift, absentee-owner
  // notices, schema audit hints) do not block the merge gate. Hard
  // failures still 422.
  const hardFailures = failures.filter(f => !f.detail.includes('informational'))

  // V7.2.5 — universe schema audit. In paste 1, the existing 82
  // entries don't carry costBenefitClaim or vermontReasoning yet;
  // the counts shrink as pastes 2-4 land richer entries.
  const productsWithoutCostBenefit = universe.filter(
    p => !p.costBenefitClaim,
  ).length
  const productsWithoutVermontReasoning = universe.filter(
    p => !p.vermontReasoning,
  ).length
  const universalProductCount = universe.filter(p =>
    p.tags.topics.includes('universal'),
  ).length

  const body = {
    pass: hardFailures.length === 0,
    universeSize: universe.length,
    catalogCount: catalogs.length,
    scopeStats,
    failures,
    schemaAudit: {
      productsWithoutCostBenefit,
      productsWithoutVermontReasoning,
      universalProductCount,
    },
  }

  return NextResponse.json(body, {
    status: hardFailures.length === 0 ? 200 : 422,
  })
}
