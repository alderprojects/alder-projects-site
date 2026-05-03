// Town page structure template.
//
// Standalone town pages live at /{townSlug} (or /towns/{townSlug} if
// routing collision — see commit 8 for resolution). Prose lives in
// src/content/towns/{slug-without-vt}.ts.
//
// Voice rules enforced (per voice-guide.md):
//   - Lead names this town's actual cost reality (rule 1)
//   - Town-specific opening hook — different per town
//   - At least one Vermont-specific per H2 (rule 6)
//   - At least 3 "Trap:" callouts
//   - Every dollar figure pulls from FACTS (rule 4)
//   - Body length ≥ 1,200 chars (lower bar than guides — town pages
//     are shorter, more reference-y)
//   - 4-7 H2 sections
//   - 4-5 FAQ items

import type { ContentSection, FaqItem } from './seasonal-guide-template'

export type TownTier = 'resort_premium' | 'burlington_metro' | 'small_city' | 'rural'

export type TownPageContent = {
  slug: string                    // 'stowe-vt' (URL is /{slug} or /towns/{slug})
  townName: string                // 'Stowe'
  county: string                  // 'Lamoille County'
  townTier: TownTier
  utility: string                 // 'GMP' | 'BED' | 'VPPSA member utility' etc.
  population?: number
  medianHomeValue?: number

  metaTitle: string
  metaDescription: string
  h1: string

  leadParagraph: string           // 2-4 sentences — town-specific hook

  sections: ContentSection[]      // 4-7 H2

  faq: FaqItem[]                  // 4-5 items

  factIds: string[]

  // Internal linking — minimum 5 outbound. Town × service slugs +
  // related guides + property tool funnel.
  relatedGuideSlugs: string[]
  relatedServiceSlugs?: string[]  // {service}-{town}-vt slugs for this town

  // For property tool funnel: address pre-fill in this town.
  sampleAddress: string
  samplePropertySlug: string

  byline?: string
  verifyDate: string
}

export const TOWN_PAGE_REQUIRED_PATTERNS = [
  'opener: what makes this town different',
  'costs: project cost ranges localized to this town',
  'regulators: zoning / design review / utility quirks',
  'timing: seasonal constraints specific to this town',
] as const

export const TOWN_PAGE_MIN_BODY_CHARS = 1200
export const TOWN_PAGE_FAQ_MIN = 4
export const TOWN_PAGE_FAQ_MAX = 5
export const TOWN_PAGE_H2_MIN = 4
export const TOWN_PAGE_H2_MAX = 7

export function validateTownPage(c: TownPageContent): string[] {
  const violations: string[] = []

  if (c.sections.length < TOWN_PAGE_H2_MIN) {
    violations.push(
      `${c.slug}: only ${c.sections.length} H2 sections (min ${TOWN_PAGE_H2_MIN})`,
    )
  }
  if (c.sections.length > TOWN_PAGE_H2_MAX) {
    violations.push(
      `${c.slug}: ${c.sections.length} H2 sections (max ${TOWN_PAGE_H2_MAX})`,
    )
  }

  if (c.faq.length < TOWN_PAGE_FAQ_MIN) {
    violations.push(
      `${c.slug}: only ${c.faq.length} FAQ items (min ${TOWN_PAGE_FAQ_MIN})`,
    )
  }
  if (c.faq.length > TOWN_PAGE_FAQ_MAX) {
    violations.push(
      `${c.slug}: ${c.faq.length} FAQ items (max ${TOWN_PAGE_FAQ_MAX})`,
    )
  }

  const bodyChars =
    c.leadParagraph.length +
    c.sections.reduce((n, s) => n + s.h2.length + s.body.length, 0) +
    c.faq.reduce((n, f) => n + f.question.length + f.answer.length, 0)

  if (bodyChars < TOWN_PAGE_MIN_BODY_CHARS) {
    violations.push(
      `${c.slug}: body ${bodyChars} chars (min ${TOWN_PAGE_MIN_BODY_CHARS})`,
    )
  }

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
    violations.push(`${c.slug}: factIds is empty`)
  }

  const linkCount =
    c.relatedGuideSlugs.length + (c.relatedServiceSlugs?.length ?? 0)
  if (linkCount < 5) {
    violations.push(
      `${c.slug}: ${linkCount} related links (min 5 outbound internal links per voice-guide)`,
    )
  }

  return violations
}
