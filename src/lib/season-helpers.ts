// Helpers for seasonal + property-context inference. All seasonal
// windows, the lake-town list, and refund-risk flags live in CONFIG.
// These helpers are date/property → enum mappings only.

import { CONFIG } from './recommender-config'
import type { Season } from './recommender-config.types'
import type { PropertyProfile, VisitorSignals } from './property-modules'

// inferSeason: walks CONFIG.seasonalWindows and returns the season the
// given date falls into. Handles deep_winter wrapping year-end (Dec 15
// through Feb 28) where startMonth > endMonth.
export function inferSeason(date: Date = new Date()): Season {
  const month = date.getMonth() + 1   // JS months are 0-indexed
  const day = date.getDate()

  for (const window of CONFIG.seasonalWindows) {
    if (window.startMonth > window.endMonth) {
      // Year-wrap window (e.g. Dec 15 - Feb 28)
      const inLatePart =
        month > window.startMonth ||
        (month === window.startMonth && day >= window.startDay)
      const inEarlyPart =
        month < window.endMonth ||
        (month === window.endMonth && day <= window.endDay)
      if (inLatePart || inEarlyPart) return window.season
    } else {
      const afterStart =
        month > window.startMonth ||
        (month === window.startMonth && day >= window.startDay)
      const beforeEnd =
        month < window.endMonth ||
        (month === window.endMonth && day <= window.endDay)
      if (afterStart && beforeEnd) return window.season
    }
  }
  return 'deep_winter'  // fallback for any gap in the windows
}

type LakeProfile = Pick<PropertyProfile, 'town'> & {
  regulators?: { shorelandBuffer?: boolean } | unknown
}

export function isLakeProperty(profile: LakeProfile): boolean {
  // Property's regulator concerns include a shoreland buffer (ANR Atlas
  // detected a lake/pond/major stream within the protected radius), OR
  // the property is in a known lake town from CONFIG.lakeTowns.
  const regs = profile.regulators as { shorelandBuffer?: boolean } | undefined
  if (regs?.shorelandBuffer === true) return true
  return CONFIG.lakeTowns.includes(profile.town)
}

type FloodProfile = {
  regulators?: { floodZone?: boolean; riverCorridor?: boolean } | unknown
}

export function isFloodProperty(profile: FloodProfile): boolean {
  const regs = profile.regulators as { floodZone?: boolean; riverCorridor?: boolean } | undefined
  return regs?.floodZone === true || regs?.riverCorridor === true
}

// detectRefundRisk: walks CONFIG.refundRiskFlags. Currently topic-based
// flags are the only kind defined; signal_match is reserved for future
// flags (e.g. specific URL params).
export function detectRefundRisk(signals: Pick<VisitorSignals, 'topic'>): boolean {
  if (!signals.topic) return false
  for (const flag of CONFIG.refundRiskFlags) {
    if (flag.detect === 'topic_match' && flag.triggers.includes(signals.topic)) {
      return true
    }
  }
  return false
}
