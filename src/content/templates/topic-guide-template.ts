// Topic guide structure template.
//
// Topic guides are 7,000-10,000 char deep guides on a project type
// (heat pump rebate stacking, weatherization, solar+battery stack,
// ADU permitting, rebate stack overview). They live at /guides/{slug}
// and the prose is in src/content/topics/{slug}.ts.
//
// Voice rules enforced (per voice-guide.md):
//   - Lead names the actual problem (rule 1)
//   - At least one Vermont-specific per H2 (rule 6)
//   - At least 3 "Trap:" callouts
//   - Every dollar figure pulls from FACTS (rule 4)
//   - 6-10 H2 sections (overview, costs, rebates, sequencing, traps,
//     contractor selection, timing, FAQ pattern)
//   - 4-6 FAQ items
//   - Body length ≥ 7,000 chars

import type { ContentSection, FaqItem } from './seasonal-guide-template'
import type { SmartCartGuideCTAConfig } from '@/components/SmartCartGuideCTA'

export type TopicId =
  | 'heat_pump'
  | 'weatherization'
  | 'kitchen'
  | 'bath'
  | 'outdoor'
  | 'solar_battery'
  | 'addition_adu'
  | 'rebate_strat'
  | 'rebate_eligibility'
  | 'contractor_vetting'
  | 'property_tax'
  | 'flood_zone'
  | 'mud_season'
  | 'well_septic'
  | 'general_orientation'
  | 'home_repair' // v7.2.14 — basement moisture prep + future home-repair guides

export type TopicGuideContent = {
  slug: string                    // 'vermont-heat-pump-rebate-stack-2026' (URL is /guides/{slug})
  topicId: TopicId
  metaTitle: string
  metaDescription: string
  h1: string                      // Problem-as-headline
  leadParagraph: string

  sections: ContentSection[]      // 6-10 H2

  faq: FaqItem[]                  // 4-6 items

  affiliateKitId?: string

  factIds: string[]

  // Internal linking — minimum 5 outbound. Use V4 TOPIC_AFFINITY to
  // pick high-affinity neighbors first.
  relatedGuideSlugs: string[]
  relatedTownSlugs: string[]

  byline?: string
  verifyDate: string

  /**
   * v7.2.14 fix-up — when set, the guide renders three Smart Cart CTAs:
   *   1. Top-of-guide button after the lead paragraph.
   *   2. Inline boxed CTA at the end of any section whose H2 contains
   *      "What the $19.99 Smart Cart actually does".
   *   3. Hero CTA at the bottom of the guide, replacing GuideFooter's
   *      property-tool funnel.
   */
  smartCartCta?: SmartCartGuideCTAConfig

  /**
   * v7.2.15 — render the concrete "Why $19.99?" trust module after the
   * second CTA in the guide. Names the failure mode the buyer fears.
   * Today: 'window' or 'basement'. Omit on guides without a paired
   * Smart Cart pilot.
   */
  why1999Variant?: 'window' | 'basement'
}

// Required H2 patterns (semantic, not literal). A topic guide
// typically hits these in roughly this order:
export const TOPIC_GUIDE_REQUIRED_PATTERNS = [
  'overview: what this project actually is in VT',
  'costs: what it costs (statewide median + tier variation)',
  'rebates: what stacks (cite FACTS for amounts)',
  'sequencing: order of operations (this before that)',
  'traps: common mistakes that cost money',
  'contractors: how to vet for this specifically',
  'timing: when in the VT calendar to schedule',
] as const

export const TOPIC_GUIDE_MIN_BODY_CHARS = 7000
export const TOPIC_GUIDE_FAQ_MIN = 4
export const TOPIC_GUIDE_FAQ_MAX = 6
export const TOPIC_GUIDE_H2_MIN = 6
export const TOPIC_GUIDE_H2_MAX = 10

export function validateTopicGuide(c: TopicGuideContent): string[] {
  const violations: string[] = []

  if (c.sections.length < TOPIC_GUIDE_H2_MIN) {
    violations.push(
      `${c.slug}: only ${c.sections.length} H2 sections (min ${TOPIC_GUIDE_H2_MIN})`,
    )
  }
  if (c.sections.length > TOPIC_GUIDE_H2_MAX) {
    violations.push(
      `${c.slug}: ${c.sections.length} H2 sections (max ${TOPIC_GUIDE_H2_MAX})`,
    )
  }

  if (c.faq.length < TOPIC_GUIDE_FAQ_MIN) {
    violations.push(
      `${c.slug}: only ${c.faq.length} FAQ items (min ${TOPIC_GUIDE_FAQ_MIN})`,
    )
  }
  if (c.faq.length > TOPIC_GUIDE_FAQ_MAX) {
    violations.push(
      `${c.slug}: ${c.faq.length} FAQ items (max ${TOPIC_GUIDE_FAQ_MAX})`,
    )
  }

  const bodyChars =
    c.leadParagraph.length +
    c.sections.reduce((n, s) => n + s.h2.length + s.body.length, 0) +
    c.faq.reduce((n, f) => n + f.question.length + f.answer.length, 0)

  if (bodyChars < TOPIC_GUIDE_MIN_BODY_CHARS) {
    violations.push(
      `${c.slug}: body ${bodyChars} chars (min ${TOPIC_GUIDE_MIN_BODY_CHARS})`,
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
    violations.push(`${c.slug}: factIds is empty — every guide must cite FACTS`)
  }

  if (c.relatedGuideSlugs.length + c.relatedTownSlugs.length < 5) {
    violations.push(
      `${c.slug}: ${
        c.relatedGuideSlugs.length + c.relatedTownSlugs.length
      } related links (min 5 outbound internal links per voice-guide)`,
    )
  }

  return violations
}
