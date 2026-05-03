// Seasonal guide structure template.
//
// The actual prose lives in src/content/seasons/{slug}.ts — each file
// exports a SeasonalGuideContent record matching this shape. The
// template encodes the structure so every seasonal guide follows the
// same Vermont specificity bar.
//
// Voice rules enforced at draft time (per voice-guide.md):
//   - Lead paragraph names the actual problem (rule 1)
//   - At least one Vermont-specific detail per H2 (rule 6)
//   - At least 3 "Trap:" callouts across the guide
//   - Every dollar figure pulls from FACTS (rule 4)
//   - 6-12 H2 sections
//   - 4-6 FAQ items
//   - Body length ≥ 7,000 chars
//
// Schema generators here produce the Article + FAQPage + BreadcrumbList
// JSON-LD for every seasonal guide page render.

import type { Season } from '../../lib/recommender-config.types'

export type SeasonalGuideContent = {
  slug: string                    // 'lake-season' (URL is /vermont-lake-season)
  season: Season                  // 'lake' | 'mud' | 'spring_blackfly' | 'fall_leaf' | 'pre_winter' | 'deep_winter'
  metaTitle: string               // < 60 chars ideal
  metaDescription: string         // < 160 chars ideal
  h1: string                      // Problem-as-headline, not topic label
  leadParagraph: string           // 2-4 sentences. Hooks with specific number / statute / trap.

  // 6-12 H2 sections. Each must include ≥1 VT-specific detail (rule 6).
  // Section body is markdown-ish text — ** for bold, paragraphs separated
  // by blank lines, "Trap:" callouts inline.
  sections: ContentSection[]

  // 4-6 FAQ items. Real questions a Vermont homeowner asks, not generic
  // search-engine questions.
  faq: FaqItem[]

  // Affiliate kit slot — 5-7 items max, picked by V4 ACCESSORY_KITS.
  // Voice-guide affiliate density rule applies (≤1 per 1,500 chars body).
  affiliateKitId?: string         // refers to V4 ACCESSORY_KITS catalog

  // FACT ids cited anywhere in this guide. Used by GuideFooter to render
  // the Sources block automatically.
  factIds: string[]

  // Internal links — minimum 5 outbound (rule: voice-guide internal
  // linking minimums). Use V4 TOPIC_AFFINITY to pick high-affinity
  // neighbors first.
  relatedGuideSlugs: string[]     // /guides/* slugs
  relatedTownSlugs: string[]      // standalone town slugs (stowe-vt etc.)

  // E-E-A-T scaffold (rendered by <GuideFooter />).
  byline?: string                 // defaults to 'Alder Projects editorial team'
  verifyDate: string              // ISO YYYY-MM-DD
}

export type ContentSection = {
  h2: string
  body: string                    // markdown-ish
}

export type FaqItem = {
  question: string
  answer: string
}

// Required H2 patterns for a seasonal guide. Drafts should hit most of
// these — the template doesn't hard-enforce, but voice-regression-test
// (commit 17) checks structural compliance.
//
// Why a pattern, not a list of literal H2 strings: each guide writes
// its own H2 voice ("Mud season is real, and it's not metaphorical"
// not "What is mud season?"). The pattern says what kind of section
// must appear, not the exact words.
export const SEASONAL_GUIDE_REQUIRED_PATTERNS = [
  'opener: what this season actually is in Vermont',
  'problems: what comes with this season',
  'do/dont: what you can and cannot do this season',
  'rules: Vermont-specific rules / statutes that apply',
  'kit: shopping list / accessory kit (V4 catalog)',
  'action: what to do this week / before the season hits',
] as const

// Body length minimum — voice-guide structure expectation.
export const SEASONAL_GUIDE_MIN_BODY_CHARS = 7000

// FAQ count window.
export const SEASONAL_GUIDE_FAQ_MIN = 4
export const SEASONAL_GUIDE_FAQ_MAX = 6

// H2 section count window.
export const SEASONAL_GUIDE_H2_MIN = 6
export const SEASONAL_GUIDE_H2_MAX = 12

// Validation — call from voice-regression-test (commit 17). Returns
// list of human-readable violations (empty array = pass).
export function validateSeasonalGuide(c: SeasonalGuideContent): string[] {
  const violations: string[] = []

  if (c.sections.length < SEASONAL_GUIDE_H2_MIN) {
    violations.push(
      `${c.slug}: only ${c.sections.length} H2 sections (min ${SEASONAL_GUIDE_H2_MIN})`
    )
  }
  if (c.sections.length > SEASONAL_GUIDE_H2_MAX) {
    violations.push(
      `${c.slug}: ${c.sections.length} H2 sections (max ${SEASONAL_GUIDE_H2_MAX})`
    )
  }

  if (c.faq.length < SEASONAL_GUIDE_FAQ_MIN) {
    violations.push(
      `${c.slug}: only ${c.faq.length} FAQ items (min ${SEASONAL_GUIDE_FAQ_MIN})`
    )
  }
  if (c.faq.length > SEASONAL_GUIDE_FAQ_MAX) {
    violations.push(
      `${c.slug}: ${c.faq.length} FAQ items (max ${SEASONAL_GUIDE_FAQ_MAX})`
    )
  }

  const bodyChars =
    c.leadParagraph.length +
    c.sections.reduce((n, s) => n + s.h2.length + s.body.length, 0) +
    c.faq.reduce((n, f) => n + f.question.length + f.answer.length, 0)

  if (bodyChars < SEASONAL_GUIDE_MIN_BODY_CHARS) {
    violations.push(
      `${c.slug}: body ${bodyChars} chars (min ${SEASONAL_GUIDE_MIN_BODY_CHARS})`
    )
  }

  // Trap callout count — at least 3 across the full guide.
  const trapCount =
    (c.leadParagraph.match(/\bTrap:/g) ?? []).length +
    c.sections.reduce(
      (n, s) => n + (s.body.match(/\bTrap:/g) ?? []).length,
      0,
    )
  if (trapCount < 3) {
    violations.push(`${c.slug}: only ${trapCount} "Trap:" callouts (min 3)`)
  }

  if (c.factIds.length === 0) {
    violations.push(`${c.slug}: factIds is empty — every guide must cite FACTS`)
  }

  if (c.relatedGuideSlugs.length + c.relatedTownSlugs.length < 5) {
    violations.push(
      `${c.slug}: ${
        c.relatedGuideSlugs.length + c.relatedTownSlugs.length
      } related links (min 5 outbound internal links per voice-guide)`
    )
  }

  return violations
}
