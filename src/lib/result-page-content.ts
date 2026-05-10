// v7.2.7 — initial Smart Cart value props.
// v7.2.11 — full result-page content maps: per-scope header,
// cross-sells, skip reason badges, spec chip extractor.
//
// All copy authored to match the spec; no fabricated claims, no
// review counts, no property-value promises.

// TopicId lives in property-modules. Import is from the .tsx file
// at runtime (Next.js / tsx resolves the extension automatically).
import type { TopicId } from './property-modules'
import type { CartSlot } from './smart-cart-model'
// (no .tsx in import path — the bundler resolves .tsx, .ts, .d.ts in
// that order. No runtime change needed.)

// ---------- Types ---------------------------------------------------

export interface ValuePropChip {
  title: string
  body: string
}

export interface ScopeHeaderContent {
  title: string
  framing: string
}

export interface CrossSellCard {
  /** Scope variant id of the destination cart. */
  scopeVariantId: string
  /** Short topic / project title. */
  title: string
  /** One-sentence reason. */
  reason: string
  /** Optional season chip ("Pre-winter", "Mud season", etc.). */
  seasonChip?: string
  /** Heroicon-style key for the small icon. */
  icon?: string
}

// ---------- "Why these picks?" — always-true Smart Cart chips -----

export const SMART_CART_VALUE_PROPS: ValuePropChip[] = [
  {
    title: 'Right size for most homes',
    body: 'Picks fit standard drawers, doors, and cabinets.',
  },
  {
    title: 'Better quality, better value',
    body: 'Sweet-spot picks last; budget tier traps avoided.',
  },
  {
    title: 'Avoids early remodel spending',
    body: 'Improvements first — bigger projects later, on purpose.',
  },
  {
    title: 'Saves time and extra trips',
    body: 'Cart works as a set, not a string of one-off purchases.',
  },
  {
    title: 'Works as a set',
    body: 'Each pick complements the others; nothing redundant.',
  },
]

// ---------- Per-scope header content (friction → cart bridge) -----

const FALLBACK_HEADER: ScopeHeaderContent = {
  title: 'Your project cart is ready',
  framing:
    'Alder built this cart around your project so you can buy what matters first and skip what can wait.',
}

export const SCOPE_HEADER_CONTENT: Record<string, ScopeHeaderContent> = {
  kitchen_organizers: {
    title: 'Make your kitchen work without renovating it',
    framing:
      'If the kitchen feels off but still works, better access and less clutter may solve more than new cabinets would.',
  },
  kitchen_cosmetic_refresh: {
    title: 'Refresh the kitchen before you remodel it',
    framing:
      'If the kitchen is functional but dated, start with the visible upgrades that change the feel before you spend remodel money.',
  },
  kitchen_cabinet_hardware_swap: {
    title: 'Swap your cabinet hardware in one afternoon',
    framing:
      'Hardware is one of the fastest ways to update a working kitchen, but fit and finish matter.',
  },
  outdoor_lake_season: {
    title: 'Open the lake place without losing your first weekend',
    framing:
      'The right supplies in one place can turn opening day into lake time instead of a hardware-store run.',
  },
  outdoor_freeze_prevention: {
    title: 'Protect the pipes before the first hard freeze',
    framing:
      'For homes that sit empty, prevention and alerts matter more than finding out after damage is done.',
  },
  outdoor_seasonal_opening: {
    title: 'Open the seasonal home without first-weekend chaos',
    framing:
      'A stocked opening kit helps you get the house running before the weekend disappears.',
  },
  outdoor_deck_refresh: {
    title: 'Refresh the deck before you replace it',
    framing:
      'If the structure is sound, the right refresh supplies may buy time before a bigger rebuild.',
  },
  mudroom_entry_reset: {
    title: 'Keep mud season from taking over the house',
    framing:
      'Boots, towels, kids, pets, and lake gear need a landing zone before they spread through the house.',
  },
  universal_owner_kit: {
    title: 'The minimal kit that prevents extra trips',
    framing:
      'The basics are worth having on site before a small project turns into another run to the store.',
  },
  universal_project_prep: {
    title: 'Measure twice, buy once',
    framing:
      'Wrong measurements are one of the easiest ways to waste money before the project starts.',
  },
  home_moisture_control: {
    title: 'Catch moisture before it becomes a bigger problem',
    framing:
      'Small moisture clues are easier to manage before they become odor, mold, or repair issues.',
  },
  home_water_quality: {
    title: 'Test your water before you treat it',
    framing:
      'The right filter depends on the actual problem. Start with the test before buying a fix.',
  },
  outdoor_dock_lake: {
    title: 'Maintain the dock before it needs replacing',
    framing:
      'Small hardware and safety upgrades can extend a usable dock before the rebuild conversation starts.',
  },
  home_safety_kit: {
    title: 'Cover the safety basics for a seasonal home',
    framing:
      'Empty homes still need fresh batteries, working detectors, and basic emergency supplies.',
  },
}

export function getScopeHeaderContent(scopeVariantId: string): ScopeHeaderContent {
  return SCOPE_HEADER_CONTENT[scopeVariantId] ?? FALLBACK_HEADER
}

// ---------- Cross-scope discovery ---------------------------------

export const SCOPE_CROSS_SELLS: Record<string, CrossSellCard[]> = {
  kitchen_organizers: [
    { scopeVariantId: 'mudroom_entry_reset', title: 'Mudroom reset', reason: 'Keep gear from spilling into the kitchen.', icon: 'square' },
    { scopeVariantId: 'kitchen_cabinet_hardware_swap', title: 'Cabinet hardware swap', reason: 'Update the look without touching the layout.', icon: 'grip-horizontal' },
    { scopeVariantId: 'outdoor_seasonal_opening', title: 'Seasonal opening', reason: 'Stock the basics before the first weekend back.', seasonChip: 'Spring', icon: 'sun' },
  ],
  kitchen_cosmetic_refresh: [
    { scopeVariantId: 'kitchen_cabinet_hardware_swap', title: 'Cabinet hardware swap', reason: 'The fastest visible upgrade.', icon: 'grip-horizontal' },
    { scopeVariantId: 'kitchen_organizers', title: 'Kitchen organizers', reason: 'Function first, then finishes.', icon: 'archive' },
    { scopeVariantId: 'universal_owner_kit', title: 'Owner kit', reason: 'Avoid another paint-store run mid-project.', icon: 'wrench' },
  ],
  kitchen_cabinet_hardware_swap: [
    { scopeVariantId: 'kitchen_cosmetic_refresh', title: 'Cosmetic refresh', reason: 'Pair with paint for a bigger lift.', icon: 'paintbrush' },
    { scopeVariantId: 'kitchen_organizers', title: 'Kitchen organizers', reason: 'Make the new look easier to live with.', icon: 'archive' },
    { scopeVariantId: 'universal_project_prep', title: 'Project prep kit', reason: 'Measure twice on hardware spacing.', icon: 'ruler' },
  ],
  outdoor_lake_season: [
    { scopeVariantId: 'outdoor_seasonal_opening', title: 'Seasonal opening', reason: 'Get the house running first.', seasonChip: 'Spring', icon: 'sun' },
    { scopeVariantId: 'outdoor_dock_lake', title: 'Dock & lake upkeep', reason: 'Extend the dock before rebuilding.', icon: 'waves' },
    { scopeVariantId: 'mudroom_entry_reset', title: 'Mudroom reset', reason: 'Lake gear needs a landing zone.', icon: 'square' },
    { scopeVariantId: 'home_safety_kit', title: 'Safety basics', reason: 'Working detectors, fresh extinguisher.', icon: 'cross' },
  ],
  outdoor_freeze_prevention: [
    { scopeVariantId: 'home_moisture_control', title: 'Moisture control', reason: 'Cold + condensation often arrive together.', icon: 'wind' },
    { scopeVariantId: 'home_safety_kit', title: 'Safety basics', reason: 'Empty homes need working detectors.', icon: 'cross' },
    { scopeVariantId: 'universal_owner_kit', title: 'Owner kit', reason: 'Tools you want before the freeze.', icon: 'wrench' },
    { scopeVariantId: 'outdoor_seasonal_opening', title: 'Seasonal closing', reason: 'Close it down right before winter.', seasonChip: 'Pre-winter', icon: 'snowflake' },
  ],
  outdoor_seasonal_opening: [
    { scopeVariantId: 'outdoor_lake_season', title: 'Lake season setup', reason: 'Past the basics, into use.', seasonChip: 'Summer', icon: 'sun' },
    { scopeVariantId: 'outdoor_dock_lake', title: 'Dock upkeep', reason: 'Catch wear before season fully starts.', icon: 'waves' },
    { scopeVariantId: 'home_safety_kit', title: 'Safety basics', reason: 'Replace batteries, check detectors.', icon: 'cross' },
  ],
  outdoor_deck_refresh: [
    { scopeVariantId: 'outdoor_lake_season', title: 'Lake season setup', reason: 'Furnish the deck after refreshing it.', icon: 'sun' },
    { scopeVariantId: 'universal_project_prep', title: 'Project prep', reason: 'Test stains and measure boards.', icon: 'ruler' },
    { scopeVariantId: 'universal_owner_kit', title: 'Owner kit', reason: 'Pressure washer + brushes nearby.', icon: 'wrench' },
  ],
  mudroom_entry_reset: [
    { scopeVariantId: 'universal_owner_kit', title: 'Owner kit', reason: 'Hooks and hardware sit nearby.', icon: 'wrench' },
    { scopeVariantId: 'kitchen_organizers', title: 'Kitchen organizers', reason: 'Adjacent room, same logic.', icon: 'archive' },
    { scopeVariantId: 'home_safety_kit', title: 'Safety basics', reason: 'Detectors near entry zones.', icon: 'cross' },
  ],
  universal_owner_kit: [
    { scopeVariantId: 'universal_project_prep', title: 'Project prep kit', reason: 'Measure and label before buying.', icon: 'ruler' },
    { scopeVariantId: 'kitchen_cabinet_hardware_swap', title: 'Hardware swap', reason: 'A weekend project to start with.', icon: 'grip-horizontal' },
    { scopeVariantId: 'home_safety_kit', title: 'Safety basics', reason: 'Working detectors, fresh extinguisher.', icon: 'cross' },
  ],
  universal_project_prep: [
    { scopeVariantId: 'universal_owner_kit', title: 'Owner kit', reason: 'Tools that pair with prep work.', icon: 'wrench' },
    { scopeVariantId: 'kitchen_cabinet_hardware_swap', title: 'Hardware swap', reason: 'Prep tools cover this scope.', icon: 'grip-horizontal' },
    { scopeVariantId: 'kitchen_cosmetic_refresh', title: 'Cosmetic refresh', reason: 'Sample boards, painter\'s tape.', icon: 'paintbrush' },
  ],
  home_moisture_control: [
    { scopeVariantId: 'outdoor_freeze_prevention', title: 'Freeze prevention', reason: 'Often the same homes, same season.', seasonChip: 'Pre-winter', icon: 'snowflake' },
    { scopeVariantId: 'home_water_quality', title: 'Water quality', reason: 'Source and intake checks pair well.', icon: 'droplet' },
    { scopeVariantId: 'home_safety_kit', title: 'Safety basics', reason: 'Detectors near plumbing matter.', icon: 'cross' },
  ],
  home_water_quality: [
    { scopeVariantId: 'home_moisture_control', title: 'Moisture control', reason: 'Same systems often need attention.', icon: 'wind' },
    { scopeVariantId: 'outdoor_freeze_prevention', title: 'Freeze prevention', reason: 'Pipes that move water need both.', seasonChip: 'Pre-winter', icon: 'snowflake' },
    { scopeVariantId: 'universal_owner_kit', title: 'Owner kit', reason: 'Filter wrenches, basic plumbing tools.', icon: 'wrench' },
  ],
  outdoor_dock_lake: [
    { scopeVariantId: 'outdoor_seasonal_opening', title: 'Seasonal opening', reason: 'Open the house, then the dock.', seasonChip: 'Spring', icon: 'sun' },
    { scopeVariantId: 'outdoor_lake_season', title: 'Lake season setup', reason: 'Dock + waterfront together.', icon: 'waves' },
    { scopeVariantId: 'home_safety_kit', title: 'Safety basics', reason: 'Waterfront homes need them.', icon: 'cross' },
  ],
  home_safety_kit: [
    { scopeVariantId: 'home_moisture_control', title: 'Moisture control', reason: 'Detectors and dehumidifiers pair.', icon: 'wind' },
    { scopeVariantId: 'outdoor_freeze_prevention', title: 'Freeze prevention', reason: 'Empty-home risk spans both.', seasonChip: 'Pre-winter', icon: 'snowflake' },
    { scopeVariantId: 'universal_owner_kit', title: 'Owner kit', reason: 'Tools to fix what detectors find.', icon: 'wrench' },
  ],
}

export function getCrossSellScopes(scopeVariantId: string): CrossSellCard[] {
  return SCOPE_CROSS_SELLS[scopeVariantId] ?? []
}

// ---------- Skip reason badges -----------------------------------

export type SkipReasonBadge =
  | 'Low impact now'
  | 'Wait until measurements'
  | 'Too custom too soon'
  | 'Premium but unnecessary'
  | 'Wrong fit'
  | 'Better after layout is set'

const REASON_PATTERNS: Array<{ re: RegExp; badge: SkipReasonBadge }> = [
  { re: /\bcustom|made[\s-]to[\s-]order|bespoke\b/i, badge: 'Too custom too soon' },
  { re: /\bmeasur(e|ement)|fit\s+first|sizing|opening\s+must\b/i, badge: 'Wait until measurements' },
  { re: /\bpremium|over[\s-]?priced|over[\s-]?built|brand\s+tax\b/i, badge: 'Premium but unnecessary' },
  { re: /\bwrong\s+(size|version|category|fit)|won['’]t\s+fit\b/i, badge: 'Wrong fit' },
  { re: /\blayout|after\s+install|after\s+remodel\b/i, badge: 'Better after layout is set' },
]

export function getSkipReasonBadge(realReason: string): SkipReasonBadge {
  for (const { re, badge } of REASON_PATTERNS) {
    if (re.test(realReason)) return badge
  }
  return 'Low impact now'
}

// ---------- Spec callouts (chips on product card) ----------------

const MAX_CHIP_LEN = 36
const MAX_CHIPS = 3

const REVIEW_RE = /\b\d+\.?\d*\s*stars?|\d[\d,]*\+?\s*reviews?|reviewer\s+(favorite|favourite|pick)|top[\s-]?rated|best[\s-]?seller|[#1]+[\s-]?best/i

/**
 * Pull short product feature chips from the productSpec string. Filters
 * out review/rating phrases and overlong fragments.
 */
export function extractSpecChips(productSpec: string): string[] {
  if (!productSpec) return []
  const sentences = productSpec
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s && !REVIEW_RE.test(s))

  const out: string[] = []
  for (const s of sentences) {
    for (const part of s.split(/,\s*/)) {
      const cleaned = part
        .replace(/[.!?]+$/, '')
        .replace(/^\(|\)$/g, '')
        .trim()
      if (
        cleaned.length === 0 ||
        cleaned.length > MAX_CHIP_LEN ||
        REVIEW_RE.test(cleaned) ||
        /^(reviewer|review|warranty|guaranteed|covers?\s+\d|lifetime)/i.test(cleaned)
      ) {
        continue
      }
      out.push(cleaned)
      if (out.length >= MAX_CHIPS) return out
    }
  }
  return out
}

// ---------- Start Here selection (server-runnable) -------------
//
// v7.2.11 hotfix: this helper used to live in StartHerePicks.tsx,
// which has a 'use client' directive. V2ResultLayout (server) needs
// the helper to dedupe hero slots from the full list, so it's
// hosted here in a server-OK module. Importing it from the client
// component is fine; importing it from a server component is also
// fine because this module has no client directive.

const START_HERE_MAX = 3

export function selectStartHere(coreSlots: CartSlot[]): CartSlot[] {
  if (coreSlots.length === 0) return []
  // Prefer slots with costBenefitClaim, preserving catalog order otherwise
  const withClaim = coreSlots.filter(s => s.costBenefitClaim)
  const without = coreSlots.filter(s => !s.costBenefitClaim)
  const ordered = [...withClaim, ...without]
  return ordered.slice(0, Math.min(START_HERE_MAX, coreSlots.length))
}

// ---------- Topic icon for cross-sell cards ---------------------

const TOPIC_ICON_MAP: Partial<Record<TopicId, string>> = {
  kitchen: 'utensils',
  outdoor: 'sun',
  mudroom: 'square',
  bath: 'shower-head',
  weatherization: 'wind',
  home_repair: 'wrench',
  universal: 'package',
}

export function getTopicIconKey(topic: TopicId): string {
  return TOPIC_ICON_MAP[topic] ?? 'package'
}
