/**
 * v7.4.0 — Vermont cost/rebate dataset access.
 *
 * data/vermont-costs.json is the ONLY source of financial numbers in the
 * pipeline. LLM output never carries costs, rebates, or payback figures —
 * rule 3 of the product spec. Every line item records its provenance
 * (sourceGuideSlug + verifiedAt) so recommendations can cite the guide
 * they got their numbers from (v7.4.1c citation layer).
 */

import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { CostItemSchema, type CostItem, type RebateInfo, type Citation } from './types'

const DATASET_PATH = path.join(process.cwd(), 'data', 'vermont-costs.json')

// Rebates older than this render as "check current program", never a number.
const REBATE_FRESHNESS_DAYS = 120

let cached: CostItem[] | null = null

export function loadDataset(): CostItem[] {
  if (cached) return cached
  const raw = fs.readFileSync(DATASET_PATH, 'utf-8')
  const parsed = z.array(CostItemSchema).parse(JSON.parse(raw))
  cached = parsed
  return parsed
}

/** All line items for a category (exact match on the dataset's category vocab). */
export function itemsForCategory(category: string): CostItem[] {
  return loadDataset().filter((i) => i.category === category)
}

/**
 * Best-match line item for a candidate: exact category match, then the item
 * whose name shares the most words with the candidate title. Conservative —
 * returns null rather than guessing across categories.
 */
export function matchItem(category: string, titleHint: string): CostItem | null {
  const items = itemsForCategory(category)
  if (items.length === 0) return null
  if (items.length === 1) return items[0]
  const hintWords = new Set(titleHint.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3))
  let best: CostItem | null = null
  let bestScore = 0
  for (const item of items) {
    const words = item.item.toLowerCase().split(/[^a-z0-9]+/)
    const score = words.filter((w) => hintWords.has(w)).length
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }
  return best ?? items[0]
}

export function isRebateStale(verifiedAt: string, now = new Date()): boolean {
  const verified = new Date(verifiedAt)
  if (isNaN(verified.getTime())) return true
  const ageDays = (now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24)
  return ageDays > REBATE_FRESHNESS_DAYS
}

export function rebateFromItem(item: CostItem): RebateInfo | null {
  if (!item.rebate) return null
  return {
    program: item.rebate.program,
    amount: item.rebate.amount,
    verifiedAt: item.rebate.verifiedAt,
    stale: isRebateStale(item.rebate.verifiedAt),
  }
}

export function citationFromItem(item: CostItem): Citation {
  return {
    guideSlug: item.sourceGuideSlug,
    guideTitle: item.sourceGuideTitle ?? slugToTitle(item.sourceGuideSlug),
    verifiedAt: item.verifiedAt,
  }
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => (w === 'vt' ? 'VT' : w === 'vermont' ? 'Vermont' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/** Distinct dataset categories — injected into the candidate prompt so the
 * model maps to real categories instead of inventing vocab. */
export function datasetCategories(): string[] {
  return Array.from(new Set(loadDataset().map((i) => i.category)))
}
