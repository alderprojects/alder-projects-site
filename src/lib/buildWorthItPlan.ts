// Worth-It Plan synthesis function — V7 Commit 14.
//
// Property-DEPENDENT when address provided. Reuses V4-V5 engine for
// the property layer (decision tree, town tier, lake/flood overlays)
// and V6 + V7 content for the prose layer.

import { CONFIG } from './recommender-config'
import type { TopicId } from './property-modules'
import type { BriefScenarioId, Season, PathTab } from './recommender-config.types'
import { getScopeVariant } from './scope-variants'
import { MOVES, getMovesForScope, getMovesByPath, getSaturdayMoves } from '../content/moves'
import type { Move } from '../content/moves'
import { getStopConditionsForTopic } from '../content/diy-stop-conditions'
import type { StopCondition } from '../content/diy-stop-conditions'
import { getSkipListForCart } from '../content/skip-list'
import type { SkipItem } from '../content/skip-list'
import { buildSmartCart, type LeanCartItem } from './buildSmartCart'
import { randomBytes, createHash } from 'crypto'

// ---------- Public types ---------------------------------------------

export type WorthItInput = {
  topic: TopicId
  scopeVariantId: string
  scenario: BriefScenarioId
  season: Season
  address?: string
  slug?: string
  customerEmail: string
  upgradedFromCartId?: string
}

export type WorthItOutput = {
  planCode: string
  privateToken: string                 // unhashed; only returned at creation
  privateTokenHash: string             // SHA-256 of token, stored in KV
  createdAt: string
  customerEmail: string

  topic: TopicId
  scopeVariantId: string
  scopeLabel: string
  scenario: BriefScenarioId
  address?: string
  townName?: string
  townTier?: string

  bestPath: {
    title: string
    description: string
    ctaCopy: string
  }

  // Moves keyed by path tab id
  movesByPath: Record<string, Move[]>

  // Supporting cards
  whatToBuy: LeanCartItem[]
  thisSaturday: Move[]
  whatToSkip: SkipItem[]
  diyStopLine: StopCondition[]
  planPaths: PathTab[]

  worthItScore: 'Strong' | 'Moderate' | 'Light'

  summary: {
    estSpend: { low: number; high: number }
    totalTimeHours: { low: number; high: number }
    comfortLift: 'High' | 'Medium' | 'Low'
    confidence: 'High' | 'Medium' | 'Low'
  }

  configVersion: string
  pdfTemplateVersion: string
  upgradedFromCartId?: string
  refunded?: boolean
}

// ---------- Implementation -------------------------------------------

export function buildWorthItPlan(input: WorthItInput): WorthItOutput {
  const variant = getScopeVariant(input.topic, input.scopeVariantId)
  if (!variant) {
    throw new Error(`Unknown scope variant: ${input.topic}/${input.scopeVariantId}`)
  }

  const planCode = generatePlanCode(input.address, input.slug)
  const { privateToken, privateTokenHash } = generatePrivateToken()
  const createdAt = new Date().toISOString()

  const planPaths: PathTab[] =
    CONFIG.products.worthIt.pathTabsByTopic[input.topic] ?? []

  // Build movesByPath by walking each path tab.
  const movesByPath: Record<string, Move[]> = {}
  for (const path of planPaths) {
    movesByPath[path.id] = getMovesByPath(input.topic, input.scopeVariantId, path.id)
  }

  // Best path heuristic: if 'best_overall' has moves, that is the
  // default. Otherwise the first non-empty path.
  const bestPathId =
    movesByPath['best_overall']?.length
      ? 'best_overall'
      : planPaths.find(p => movesByPath[p.id]?.length)?.id ?? planPaths[0]?.id

  const bestPathMoves = bestPathId ? movesByPath[bestPathId] : []
  const bestPath = {
    title: bestPathLabel(input.scenario, input.scopeVariantId),
    description:
      bestPathMoves.length > 0
        ? `${bestPathMoves.length} high-payoff moves ranked for your project. Start with #${bestPathMoves[0].rank}: ${bestPathMoves[0].title}.`
        : 'Your plan path is ready. Review the highest-payoff moves below.',
    ctaCopy: 'Start checklist',
  }

  // Cross-product: pull lean cart items from buildSmartCart for the
  // What-to-Buy panel.
  const cartProjection = buildSmartCart({
    topic: input.topic,
    scopeVariantId: input.scopeVariantId,
    scenario: input.scenario,
    season: input.season,
    customerEmail: input.customerEmail,
  })

  const thisSaturday = getSaturdayMoves(input.topic, input.scopeVariantId, 5)
  const whatToSkip = getSkipListForCart(input.topic, input.scopeVariantId, input.scenario)
  const diyStopLine = getStopConditionsForTopic(input.topic)

  const allMoves = getMovesForScope(input.topic, input.scopeVariantId)
  const summary = computeSummary(allMoves, variant.estCostRange)
  const worthItScore = scoreToTier(summary)

  const townName = inferTownNameFromAddress(input.address)
  const townTier = inferTownTier(input.address)

  return {
    planCode,
    privateToken,
    privateTokenHash,
    createdAt,
    customerEmail: input.customerEmail,

    topic: input.topic,
    scopeVariantId: input.scopeVariantId,
    scopeLabel: variant.label,
    scenario: input.scenario,
    address: input.address,
    townName,
    townTier,

    bestPath,
    movesByPath,

    whatToBuy: cartProjection.leanCart.items,
    thisSaturday,
    whatToSkip,
    diyStopLine,
    planPaths,

    worthItScore,

    summary,

    configVersion: CONFIG.version,
    pdfTemplateVersion: CONFIG.products.worthIt.pdfTemplateVersion,
    upgradedFromCartId: input.upgradedFromCartId,
  }
}

// ---------- Helpers --------------------------------------------------

function bestPathLabel(scenario: BriefScenarioId, scopeVariantId: string): string {
  if (scenario === 'tight_budget') return 'Tight-Budget Path'
  if (scenario === 'premium') return 'Premium Path'
  if (scenario === 'lake_property') return 'Lake-Season Path'
  if (scenario === 'already_have_basics') return 'Second-Pass Path'
  if (scopeVariantId.includes('cosmetic')) return 'Cosmetic Refresh: This Weekend'
  if (scopeVariantId.includes('cabinet_hardware')) return 'Cabinet Hardware Swap: This Weekend'
  if (scopeVariantId.includes('weatherization')) return 'DIY Air-Sealing Pass'
  if (scopeVariantId.includes('lake_season')) return 'Lake-Season Open-Up'
  if (scopeVariantId.includes('heat_pump')) return 'Heat Pump Readiness Path'
  return 'Best Path for You: This Weekend'
}

function computeSummary(moves: Move[], estCostRange: { low: number; high: number }): {
  estSpend: { low: number; high: number }
  totalTimeHours: { low: number; high: number }
  comfortLift: 'High' | 'Medium' | 'Low'
  confidence: 'High' | 'Medium' | 'Low'
} {
  const totalSpendLow = moves.reduce((acc, m) => acc + (m.spend?.low ?? 0), 0)
  const totalSpendHigh = moves.reduce((acc, m) => acc + (m.spend?.high ?? 0), 0)
  const totalMinutes = moves.reduce((acc, m) => acc + (m.timeMinutes ?? 0), 0)

  const highImpact = moves.filter(m => m.impactLevel === 'high').length
  const highConfidence = moves.filter(m => m.confidenceLevel === 'high').length

  return {
    estSpend: {
      low: Math.max(estCostRange.low, totalSpendLow),
      high: Math.max(estCostRange.high, totalSpendHigh),
    },
    totalTimeHours: {
      low: Math.round((totalMinutes / 60) * 0.6),
      high: Math.round((totalMinutes / 60) * 1.1),
    },
    comfortLift: highImpact >= 3 ? 'High' : highImpact >= 1 ? 'Medium' : 'Low',
    confidence: highConfidence >= moves.length * 0.6 ? 'High' : highConfidence >= moves.length * 0.3 ? 'Medium' : 'Low',
  }
}

function scoreToTier(summary: ReturnType<typeof computeSummary>): 'Strong' | 'Moderate' | 'Light' {
  if (summary.comfortLift === 'High' && summary.confidence === 'High') return 'Strong'
  if (summary.comfortLift !== 'Low') return 'Moderate'
  return 'Light'
}

// Plan code format: TOWN-XXXX where TOWN is uppercase 4-5 char
// abbreviation (STOWE, BURL, MONT, etc.) or 'PROJ' if no town.
// XXXX is base32 random 4 chars.
function generatePlanCode(address?: string, slug?: string): string {
  const townPart = inferTownAbbrev(address, slug)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `${townPart}-${suffix}`
}

function inferTownAbbrev(address?: string, slug?: string): string {
  const source = (slug ?? address ?? '').toLowerCase()
  if (!source) return 'PROJ'
  const map: Array<[string, string]> = [
    ['stowe', 'STOWE'],
    ['burlington', 'BURL'],
    ['south burlington', 'SOBU'],
    ['montpelier', 'MONT'],
    ['manchester', 'MANCH'],
    ['woodstock', 'WOOD'],
    ['middlebury', 'MIDD'],
    ['brattleboro', 'BRAT'],
    ['st. johnsbury', 'STJOH'],
    ['st johnsbury', 'STJOH'],
    ['vergennes', 'VERG'],
    ['waterbury', 'WBURY'],
    ['shelburne', 'SHEL'],
    ['ludlow', 'LUDL'],
    ['rutland', 'RUTL'],
    ['williston', 'WILLY'],
    ['essex', 'ESSEX'],
    ['barre', 'BARRE'],
    ['st albans', 'STALB'],
    ['st. albans', 'STALB'],
  ]
  for (const [needle, abbrev] of map) {
    if (source.includes(needle)) return abbrev
  }
  // Fallback: first word, uppercased, 4-5 chars
  const firstWord = source.replace(/[^a-z\s]/g, '').trim().split(/\s+/)[0] ?? 'proj'
  return firstWord.slice(0, 5).toUpperCase() || 'PROJ'
}

function inferTownNameFromAddress(address?: string): string | undefined {
  if (!address) return undefined
  // Heuristic: assume "Street, City, VT ZIP" — pull City. This is
  // intentionally minimal; the V8 address-parsing layer replaces it.
  const parts = address.split(',').map(s => s.trim())
  if (parts.length < 2) return undefined
  return parts[parts.length - 2] || undefined
}

function inferTownTier(address?: string): string | undefined {
  const town = inferTownNameFromAddress(address)?.toLowerCase()
  if (!town) return undefined
  if (['stowe', 'manchester', 'woodstock'].some(t => town.includes(t))) return 'resort_premium'
  if (['burlington', 'south burlington', 'williston', 'essex', 'colchester', 'winooski'].some(t => town.includes(t))) {
    return 'burlington_metro'
  }
  return 'small_city'
}

// Generate a 32-char URL-safe private token + its SHA-256 hash. The
// unhashed token is returned ONLY at creation time and embedded in
// the magic link sent by email; the hash is stored in KV.
function generatePrivateToken(): { privateToken: string; privateTokenHash: string } {
  const raw = randomBytes(24)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  const hash = createHash('sha256').update(raw).digest('hex')
  return { privateToken: raw, privateTokenHash: hash }
}

// Verify a token against a stored hash. Used by the dashboard route
// before unlocking a plan.
export function verifyPrivateToken(token: string, hashHex: string): boolean {
  const computed = createHash('sha256').update(token).digest('hex')
  return computed === hashHex
}

// Used by tests + the chat-driven re-render: rebuild moves from a
// stored plan without re-fetching everything.
export { MOVES }
