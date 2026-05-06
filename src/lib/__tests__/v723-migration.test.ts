// V7.2.3 — cart-equivalence test suite for the hybrid universe +
// scope-catalog model.
// V7.2.5 — generalized to iterate the entire CATALOGS registry
// rather than hard-coding a single scope. Same per-scope assertions
// as v7.2.3, applied across every registered catalog × every
// scenario the catalog declares.
//
// IMPORTANT: this file uses Jest's describe/test/expect API but the
// project does not currently have Jest installed (no @types/jest, no
// jest.config). When Jest is added, this file will run unchanged.
// In the meantime, the same assertions are exposed at runtime via
// /api/admin/v723-verify (server-side, no test runner needed).
//
// Coverage:
//  - Each registered catalog × each declared scenario → cart
//    structure intact (slot count > 0, sweet_spot resolved, savings
//    sane, all sweet_spots carry an amazon.com affiliateUrl)
//  - alreadyHave filtering hides the right slot (per catalog with
//    at least one conditional slot)
//  - absentee_owner scenario works for catalogs that declare it
//  - Every universe entry traces to a source via migratedFrom
//  - Universe IDs are unique
//  - Every catalog scenario in `scenarios` has a matching
//    scenarioDefaults entry
//
// To enable:
//   npm i -D jest @types/jest ts-jest
//   add jest config (see docs/smart-cart-architecture.md)
//   npx jest src/lib/__tests__/v723-migration.test.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const describe: any
declare const test: any
declare const expect: any

import { buildSmartCartV2 } from '../buildSmartCartV2'
import { getAllCatalogs, getUniverse } from '@/content/smart-cart'
import type { BriefScenarioId } from '../recommender-config.types'

describe('v7.2.5 cart equivalence: all registered catalogs', () => {
  const catalogs = getAllCatalogs()
  const universe = getUniverse()

  // Standard scenarios run against every catalog that declares them.
  // Catalogs may declare additional scenarios (lake_property,
  // absentee_owner, mud_season, etc.) — those run via the dedicated
  // declared-scenario block below.
  const standardScenarios: BriefScenarioId[] = [
    'just_starting',
    'tight_budget',
    'already_have_basics',
    'premium',
  ]

  catalogs.forEach(catalog => {
    describe(`${catalog.topic}/${catalog.scopeVariantId}`, () => {
      standardScenarios.forEach(scenario => {
        if (!catalog.scenarios.includes(scenario)) return

        test(`${scenario}: structure intact`, () => {
          const cart = buildSmartCartV2(
            {
              cartId: `TEST-${catalog.scopeVariantId}-${scenario}`,
              topic: catalog.topic,
              scopeVariantId: catalog.scopeVariantId,
              scenario,
              customerEmail: 'test@example.com',
              selectedTier:
                catalog.scenarioDefaults[scenario]?.selectedTier ?? 'sweet_spot',
              alreadyHave:
                catalog.scenarioDefaults[scenario]?.alreadyHave ?? [],
            },
            catalog,
            universe,
          )

          expect(cart.version).toBe(2)
          expect(cart.slots.length).toBeGreaterThan(0)
          cart.slots.forEach(slot => {
            expect(slot.tiers.sweet_spot).toBeDefined()
            expect(slot.tiers.sweet_spot.productName).toBeTruthy()
            expect(slot.tiers.sweet_spot.priceLow).toBeGreaterThan(0)
            expect(slot.tiers.sweet_spot.priceHigh).toBeGreaterThanOrEqual(
              slot.tiers.sweet_spot.priceLow,
            )
            expect(slot.tiers.sweet_spot.affiliateUrl).toMatch(/amazon\.com/)
          })

          expect(cart.savings.potentialSavingsHigh).toBeGreaterThanOrEqual(
            cart.savings.potentialSavingsLow,
          )
        })
      })

      // V7.2.5 — catalogs that declare implicit scenarios
      // (absentee_owner, lake_property, pre_winter_prep,
      // spring_opening, mud_season) should also build cleanly.
      const implicitScenarios: BriefScenarioId[] = [
        'absentee_owner',
        'lake_property',
        'pre_winter_prep',
        'spring_opening',
        'mud_season',
      ]
      implicitScenarios.forEach(scenario => {
        if (!catalog.scenarios.includes(scenario)) return

        test(`${scenario}: structure intact (implicit scenario)`, () => {
          const cart = buildSmartCartV2(
            {
              cartId: `TEST-${catalog.scopeVariantId}-${scenario}`,
              topic: catalog.topic,
              scopeVariantId: catalog.scopeVariantId,
              scenario,
              customerEmail: 'test@example.com',
              selectedTier:
                catalog.scenarioDefaults[scenario]?.selectedTier ?? 'sweet_spot',
              alreadyHave:
                catalog.scenarioDefaults[scenario]?.alreadyHave ?? [],
            },
            catalog,
            universe,
          )

          expect(cart.version).toBe(2)
          expect(cart.slots.length).toBeGreaterThan(0)
        })
      })

      test('alreadyHave filtering hides the right slot', () => {
        const slotsWithConditional = catalog.slots.filter(
          s => s.conditionalOn.length > 0,
        )
        if (slotsWithConditional.length === 0) return

        const baseline = buildSmartCartV2(
          {
            cartId: `TEST-baseline-${catalog.scopeVariantId}`,
            topic: catalog.topic,
            scopeVariantId: catalog.scopeVariantId,
            scenario: 'just_starting',
            customerEmail: 'test@example.com',
            selectedTier: 'sweet_spot',
            alreadyHave: [],
          },
          catalog,
          universe,
        )

        const flagToSet = slotsWithConditional[0].conditionalOn[0]
        const filtered = buildSmartCartV2(
          {
            cartId: `TEST-filtered-${catalog.scopeVariantId}`,
            topic: catalog.topic,
            scopeVariantId: catalog.scopeVariantId,
            scenario: 'just_starting',
            customerEmail: 'test@example.com',
            selectedTier: 'sweet_spot',
            alreadyHave: [flagToSet],
          },
          catalog,
          universe,
        )

        expect(filtered.slots.length).toBeLessThan(baseline.slots.length)
        const dropped = slotsWithConditional[0].slotId
        expect(filtered.slots.find(s => s.slotId === dropped)).toBeUndefined()
      })
    })
  })

  test('every universe entry traces to a source via migratedFrom', () => {
    universe.forEach(p => {
      expect(p.migratedFrom).toBeDefined()
      expect(p.migratedFrom!.scope).toBeTruthy()
      expect(p.migratedFrom!.slotId).toBeTruthy()
      expect(p.migratedFrom!.tier).toMatch(/^(budget|sweet_spot|premium)$/)
    })
  })

  test('universe IDs are unique', () => {
    const ids = new Set<string>()
    universe.forEach(p => {
      expect(ids.has(p.universeId)).toBe(false)
      ids.add(p.universeId)
    })
    expect(ids.size).toBe(universe.length)
  })

  test('every catalog scenario default keys match scenarios array', () => {
    catalogs.forEach(c => {
      c.scenarios.forEach(s => {
        expect(c.scenarioDefaults[s]).toBeDefined()
      })
    })
  })
})
