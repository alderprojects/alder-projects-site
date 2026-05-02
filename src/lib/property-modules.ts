// Property page module catalog.
//
// The /property/[slug] page is composed of typed content modules. Each
// module declares how relevant it is to a visitor's intent topology
// (top-level intent, intent mode, topic, scope, town tier). The ranker
// (see property-ranker.ts) sorts the catalog against a VisitorSignals
// vector and the page renders the top-N.
//
// This file is the canonical home for the catalog AND the shared types
// used across the ranker, the hero, the rendered page, and the chat
// copilot. Keeping the types here avoids a fan-out of one-type-per-file
// and matches the catalog's single-source-of-truth role.
//
// Commit 1 ships an empty catalog and the type surface; commit 4
// populates it with module entries.

import type { ReactNode } from 'react'
import type { TownBucket } from '@/data/projects'

// ---------- Visitor signal vector --------------------------------------

export type TownTier = TownBucket // alias for spec parity; data graph calls it TownBucket

export type TopLevelIntent = 'buying' | 'owner' | 'looking' | 'researching'

export type IntentMode = 'decide' | 'do' | 'understand' | 'lookup' | 'handle'

export type Scope = 'diy' | 'mid' | 'big' | 'na'

// String union (not enum) so it composes with topicMatch's
// Partial<Record<TopicId, number>>. Keep this list and the hero picker
// in sync.
export type TopicId =
  | 'heat_pump'
  | 'kitchen'
  | 'bath'
  | 'solar_battery'
  | 'outdoor'
  | 'addition_adu'
  | 'weatherization'
  | 'rebate_strat'
  | 'property_tax'
  | 'flood_zone'
  | 'rebate_eligibility'
  | 'contractor_vetting'
  | 'general_orientation'
  | 'mud_season'
  | 'well_septic'

export const TOPICS: readonly TopicId[] = [
  'heat_pump',
  'kitchen',
  'bath',
  'solar_battery',
  'outdoor',
  'addition_adu',
  'weatherization',
  'rebate_strat',
  'property_tax',
  'flood_zone',
  'rebate_eligibility',
  'contractor_vetting',
  'general_orientation',
  'mud_season',
  'well_septic',
] as const

export type VisitorSignals = {
  topLevelIntent: TopLevelIntent
  intentMode: IntentMode
  topic: TopicId | null
  scope: Scope
  townTier: TownTier
  utilityServiceArea: string
  refundRiskFlag: boolean
  sessionDepth: number
  cameFromArticleSlug: string | null
}

// ---------- Profile shape (what /api/property returns) -----------------

// Re-exported from the page's inline type so the modules and the page
// share one definition. Keep in sync with /api/property/route.ts.
export type SnapshotFact = { label: string; value: string }
export type CostRange = { low: number; high: number; median: number; unit: string }

export type CostScope = {
  scope: 'budget' | 'mid' | 'high'
  description: string
  whatsIn: string
  whatsNot: string
  pushesHigh: string
  cost: CostRange
  permitFee: { low: number; high: number; note: string }
  vtNotes: string
}

export type CostItem = { trade: string; label: string; scopes: CostScope[] }

export type RebateItem = {
  id: string
  program: string
  category: string
  who: string
  amount: string
  amountMaxUSD: number | null
  conditions: string
  howToClaim: string
  incomeBonus: string | null
  incomeLimit: string
  source: string
  isExpired: boolean
  utilityRelevant: boolean
}

export type ZoningSummary = {
  town: string
  county: string
  setbacks: { front: number; side: number; rear: number }
  maxLotCoverage: number
  maxBuildingHeight: number
  adu: {
    byRight: boolean
    maxSizeSqFt: number
    ownerOccupancyRequired: boolean
    parkingRequirement: string
    separateUtilities: string
    notes: string
  }
  permitFeeStructure: string
  overlays: string[]
  notes: string
  zoningOffice: string
}

export type RegulatorConcern = {
  title: string
  whyCheck: string
  howToResolve: string
  cost: string
  resolvedWhen: string
}

export type CalendarItem = {
  title: string
  window: string
  importance: string
  category: string
  description: string
  action: string
}

export type SequenceStep = {
  step: number
  title: string
  what: string
  whyThisOrder: string
  trap: string
  vtTiming: string
  duration: string
  applicableRebates: string[]
}

export type SequenceItem = {
  id: string
  title: string
  scenario: string
  totalCostMidVT: string
  totalRebateStack: string
  steps: SequenceStep[]
}

export type VettingItem = {
  id: string
  name: string
  description: string
  vtRationale: string
  howTo: string[]
  redFlags: string[]
  effort: 'low' | 'medium' | 'high'
  criticalFor: string[]
}

export type PropertyProfile = {
  address: string
  slug: string
  town: string
  county: string
  bucket: TownTier
  utility: string
  ami80HouseholdOf3: number | null
  generatedAt: string
  hero: { summary: string; facts: SnapshotFact[] }
  costs: { intro: string; items: CostItem[] }
  rebates: {
    intro: string
    items: RebateItem[]
    stack: { standardUSD: number; incomeQualifiedUSD: number; itemized: { id: string; standard: number; income: number }[] }
    utility: string
  }
  regulators: { intro: string; concerns: RegulatorConcern[]; zoning: ZoningSummary | null }
  calendar: { intro: string; items: CalendarItem[] }
  sequences: { intro: string; items: SequenceItem[] }
  vetting: { intro: string; items: VettingItem[] }
  dataLinks: { label: string; url: string; what: string }[]
  chatContext: Record<string, unknown>
}

// ---------- Module definition ------------------------------------------

export type ContentType =
  | 'cost'
  | 'rebate'
  | 'sequence'
  | 'vetting'
  | 'regulatory'
  | 'calendar'
  | 'cta'
  | 'info'

export type CtaType =
  | 'diy_amazon'
  | 'handyman'
  | 'contractor_bid'
  | 'briefing'
  | 'email_capture'
  | 'chat'
  | null

export type RelevanceFactors = {
  intentMatch: Record<TopLevelIntent, number>
  modeMatch: Record<IntentMode, number>
  topicMatch: Partial<Record<TopicId, number>>
  scopeMatch: Record<Scope, number>
  townTierMatch: Partial<Record<TownTier, number>>
  isUniversal: boolean
}

export type PropertyModule = {
  moduleId: string
  title: string
  contentType: ContentType
  relevanceFactors: RelevanceFactors
  revenueWeight: number
  ctaType: CtaType
  refundRiskCompatible: boolean
  render: (profile: PropertyProfile, signals: VisitorSignals) => ReactNode
}

// ---------- Catalog ---------------------------------------------------

// Empty until commit 4 — keep the module-builder signature available so
// downstream code (ranker, page renderer, chat copilot) can be wired in
// the meantime.
export const MODULES: PropertyModule[] = []
