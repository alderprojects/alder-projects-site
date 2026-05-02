// Shared types for the data graph.
//
// Today the site is Vermont-only. Data is tagged by state so we can extend
// to NH/ME/MA later without rebuilding the graph. `federal` is a sentinel
// for entries that apply regardless of state (e.g. IRS Section 25D).
//
// State-aware accessors (e.g. getRebatesForState) return entries whose
// `state` matches the requested state OR is `federal`, so a VT homeowner
// gets both VT-specific and federally applicable items.

export type State = 'VT' | 'NH' | 'ME' | 'MA' | 'federal'

export const DEFAULT_STATE: State = 'VT'
