// V7.2.3 — cart-equivalence test suite for the hybrid universe +
// scope-catalog model.
//
// IMPORTANT: this file uses Jest's describe/test/expect API but the
// project does not currently have Jest installed (no @types/jest, no
// jest.config). When Jest is added, this file will run unchanged.
// In the meantime, the same assertions are exposed at runtime via
// /api/admin/v723-verify (server-side, no test runner needed).
//
// Coverage:
//  - Each v2-curated combination × each scenario → cart structure
//    intact (slot count > 0, sweet_spot resolved, savings sane)
//  - alreadyHave filtering hides the right slot
//  - Every universe entry traces to a source via migratedFrom
//  - Universe IDs are unique
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
import { getCatalog, getUniverse, getAllCatalogs } from '@/content/smart-cart'
import type { TopicId } from '../property-modules'
import type { BriefScenarioId } from '../recommender-config.types'

describe('v7.2.3 migration: cart equivalence', () => {
  // V7.2.3 ships ONE migrated catalog. The other 3 listed in the
  // v7.2.2 spec haven't landed in code yet (blocked on prose).
  const scopes: Array<{
    topic: TopicId
    scopeVariantId: string
    expectedCoreSlotsMax: number
    expectedSkipMax: number
  }> = [
    {
      topic: 'kitchen',
      scopeVariantId: 'kitchen_organizers',
      expectedCoreSlotsMax: 8,
      expectedSkipMax: 11,
    },
  ]

  const scenarios: BriefScenarioId[] = [
    'just_starting',
    'tight_budget',
    'already_have_basics',
    'premium',
  ]

  scopes.forEach(({ topic, scopeVariantId, expectedCoreSlotsMax, expectedSkipMax }) => {
    describe(`${topic}/${scopeVariantId}`, () => {
      scenarios.forEach(scenario => {
        test(`${scenario}: structure intact`, () => {
          const catalog = getCatalog(topic, scopeVariantId)!
          const universe = getUniverse()
          expect(catalog).toBeTruthy()
          expect(universe.length).toBeGreaterThan(0)

          const cart = buildSmartCartV2(
            {
              cartId: `TEST-${scopeVariantId}-${scenario}`,
              topic,
              scopeVariantId,
              scenario,
              customerEmail: 'test@example.com',
              selectedTier: 'sweet_spot',
              alreadyHave: [],
            },
            catalog,
            universe,
          )

          expect(cart.version).toBe(2)
          expect(cart.slots.length).toBeGreaterThan(0)
          const coreSlots = cart.slots.filter(s => s.slotKind === 'core')
          expect(coreSlots.length).toBeLessThanOrEqual(expectedCoreSlotsMax)

          // Every emitted slot must have a sweet_spot variant resolved.
          cart.slots.forEach(slot => {
            expect(slot.tiers.sweet_spot).toBeDefined()
            expect(slot.tiers.sweet_spot.productName).toBeTruthy()
            expect(slot.tiers.sweet_spot.priceLow).toBeGreaterThan(0)
            expect(slot.tiers.sweet_spot.priceHigh).toBeGreaterThanOrEqual(
              slot.tiers.sweet_spot.priceLow,
            )
            expect(slot.tiers.sweet_spot.affiliateUrl).toMatch(/amazon\.com/)
          })

          // Skip list intact and capped.
          expect(cart.skipList.length).toBeGreaterThan(0)
          expect(cart.skipList.length).toBeLessThanOrEqual(expectedSkipMax)

          // Savings math sane.
          expect(cart.savings.leanCartLow).toBeGreaterThan(0)
          expect(cart.savings.leanCartHigh).toBeGreaterThanOrEqual(
            cart.savings.leanCartLow,
          )
          expect(cart.savings.potentialSavingsHigh).toBeGreaterThanOrEqual(
            cart.savings.potentialSavingsLow,
          )
        })
      })

      test('alreadyHave filtering hides the right slot', () => {
        const catalog = getCatalog(topic, scopeVariantId)!
        const universe = getUniverse()

        const baseline = buildSmartCartV2(
          {
            cartId: 'TEST-baseline',
            topic,
            scopeVariantId,
            scenario: 'just_starting',
            customerEmail: 'test@example.com',
            selectedTier: 'sweet_spot',
            alreadyHave: [],
          },
          catalog,
          universe,
        )

        const slotsWithConditional = catalog.slots.filter(
          s => s.conditionalOn.length > 0,
        )
        if (slotsWithConditional.length === 0) return

        const flagToSet = slotsWithConditional[0].conditionalOn[0]
        const filtered = buildSmartCartV2(
          {
            cartId: 'TEST-filtered',
            topic,
            scopeVariantId,
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
    const universe = getUniverse()
    universe.forEach(p => {
      expect(p.migratedFrom).toBeDefined()
      expect(p.migratedFrom!.scope).toBeTruthy()
      expect(p.migratedFrom!.slotId).toBeTruthy()
      expect(p.migratedFrom!.tier).toMatch(/^(budget|sweet_spot|premium)$/)
    })
  })

  test('universe IDs are unique', () => {
    const universe = getUniverse()
    const ids = new Set<string>()
    universe.forEach(p => {
      expect(ids.has(p.universeId)).toBe(false)
      ids.add(p.universeId)
    })
    expect(ids.size).toBe(universe.length)
  })

  test('every catalog scenario default keys match scenarios array', () => {
    getAllCatalogs().forEach(c => {
      c.scenarios.forEach(s => {
        expect(c.scenarioDefaults[s]).toBeDefined()
      })
    })
  })
})
