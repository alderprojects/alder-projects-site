// v7.2.7 — Tier 4 SVG fallback generator.
//
// Emits one SVG per function tag we use, plus a default `_package.svg`.
// The runtime helper `resolveImagePath` uses these for any entry not
// covered by Tier 1/3.
//
// Icons sourced from Lucide (lucide.dev) — MIT License. We embed the
// path data inline rather than depending on the Lucide package, since
// we only need a small subset and the SVGs are static at build time.
//
// Output:
//   public/product-images/categories/{function-tag}.svg
//   public/product-images/categories/_package.svg  (default)
//   public/product-images/categories/_topic-*.svg  (per-topic fallbacks)
//
// Usage:
//   npx tsx scripts/images/05-source-svg-fallback.ts

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { FN_ICON, DEFAULT_FN_ICON } from './sources'

const OUT_DIR = 'public/product-images/categories'

// Lucide icon path data (24x24 viewBox). Subset covering FN_ICON values
// + topic icons. Source: https://lucide.dev (MIT License).
const ICONS: Record<string, string> = {
  utensils:
    'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
  archive: 'M5 8v13h14V8 M2 4h20v4H2z M10 12h4',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.6.8c0 7-2 13-9 17.24 M2 21c0-3 1.85-5.36 5.08-6',
  'circle-dot': 'M12 12L12 12 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  'rows-3': 'M21 15H3 M21 9H3 M21 3H3 M21 21H3',
  'rotate-cw':
    'M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8 M21 3v5h-5',
  magnet:
    'm6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15 M5 8l4 4 M12 15l4 4',
  square: 'M3 3h18v18H3z',
  refrigerator:
    'M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z M5 10h14 M15 7v3 M15 14v4',
  'paint-bucket':
    'm19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z M5 2l5 5 M2 13h15 M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z',
  'grip-horizontal':
    'M12 9h.01 M19 9h.01 M5 9h.01 M12 15h.01 M19 15h.01 M5 15h.01',
  circle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  'door-open':
    'M13 4h3a2 2 0 0 1 2 2v14 M2 20h3 M13 20h9 M10 12v.01 M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z',
  lightbulb:
    'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5 M9 18h6 M10 22h4',
  'pencil-line':
    'M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z M15 5l3 3',
  paintbrush:
    'M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7 M14.5 17.5 4.5 15',
  wrench:
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z',
  ruler:
    'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z M14.5 12.5 12 15 M9.5 7.5 7 10 M11 4l-1 1 M12 8l1-1',
  armchair:
    'M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3 M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z M5 18v2 M19 18v2',
  umbrella:
    'M22 12a10.06 10.06 0 0 0-20 0Z M12 12v8a2 2 0 0 0 4 0 M12 2v1',
  flame:
    'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z',
  'utensils-crossed':
    'm16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8 M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7 M2.1 21.8 6.4 17.5 M9 11.5 2.1 21.8 M22 22l-2.83-2.83 M14.5 14.5 18 18',
  snowflake:
    'M2 12h20 M12 2v20 M20 16-4-4 4-4 M4 8l4 4-4 4 M16 4-4 4-4-4 M4 20l4-4 4 4',
  waves:
    'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
  bug:
    'M8 2l1.88 1.88 M14.12 3.88 16 2 M9 7.13v-1a3.003 3.003 0 1 1 6 0v1 M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6 M12 20v-9 M6.53 9C4.6 8.8 3 7.1 3 5 M6 13H2 M3 21c0-2.1 1.7-3.9 3.8-4 M20.97 5c0 2.1-1.6 3.8-3.5 4 M22 13h-4 M17.2 17c2.1.1 3.8 1.9 3.8 4',
  'thermometer-snowflake':
    'M2 12h10 M9 4v16 M12 9 9 6l3 3 M9 12l3 3-3-3 M14 4h6v6 M14 20h6v-6 M3 12h.01',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  wind: 'M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2 M9.6 4.6A2 2 0 1 1 11 8H2 M12.6 19.4A2 2 0 1 0 14 16H2',
  tag: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z M7 7h.01',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  'shower-head':
    'm4 4 2.5 2.5 M13.5 6.5a4.95 4.95 0 0 0-7 7 M15 5 5 15 M14 17v.01 M10 16v.01 M13 13v.01 M16 10v.01 M11 20v.01 M17 14v.01 M20 11v.01',
  fan: 'M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z M12 12v.01',
  drill:
    'M12 4V2 M5 10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7l5 5v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z M14 4h2a2 2 0 0 1 2 2v3 M5 10v3 M5 18v2 M12 22v-6',
  cross: 'M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z',
  flashlight:
    'M18 6c0 2-2 2-2 4v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10c0-2-2-2-2-4V2h12v4z M6 6h12 M12 12v3',
  thermometer: 'M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z',
  droplet: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z',
  cable:
    'M4 9a2 2 0 0 1-2-2V5h6v2a2 2 0 0 1-2 2Z M3 5V3 M7 5V3 M19 21a2 2 0 0 1-2-2v-2h6v2a2 2 0 0 1-2 2Z M21 21v-2 M17 21v-2 M5 9c0 4 8 7 8 11 M19 17c0-4-8-7-8-11',
  'arrow-up': 'm5 12 7-7 7 7 M12 19V5',
  'spray-can':
    'M3 3h.01 M7 5h.01 M11 7h.01 M3 7h.01 M7 9h.01 M3 11h.01 M15 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M9 16h.01 M14 21H8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h6v13zm0 0V8a2 2 0 0 1 2-2h2 M16 6V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3',
  package:
    'm7.5 4.27 9 5.15 M3.3 7 12 12l8.7-5 M12 22V12 M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
}

// Topic-level fallback icons used when a function tag isn't mapped
// to a specific Lucide icon.
const TOPIC_ICONS: Record<string, string> = {
  kitchen: 'utensils',
  outdoor: 'umbrella',
  mudroom: 'square',
  bathroom: 'shower-head',
  weatherization: 'wind',
  home_repair: 'wrench',
  universal: 'package',
}

const ALDER_GREEN = '#1f3a2e'
const SOFT_BG = '#f5efe2'

function svgFor(iconName: string): string {
  const path = ICONS[iconName] ?? ICONS[DEFAULT_FN_ICON]
  // Render the icon as multiple paths; lucide path-data uses spaces
  // but each subpath effectively starts with M. Split on " M" while
  // keeping the M prefix.
  const subpaths = path.split(/(?=\sM)/g).map(p => p.trim())
  const paths = subpaths
    .map(d => `<path d="${d}" />`)
    .join('')
  // 800x800 viewport, white square bg with soft border, centered icon
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="${SOFT_BG}"/>
  <g transform="translate(280 280) scale(10)" fill="none" stroke="${ALDER_GREEN}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    ${paths}
  </g>
</svg>
`
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const written: string[] = []

  // Per-function-tag SVGs
  for (const [fnTag, iconName] of Object.entries(FN_ICON)) {
    const svg = svgFor(iconName)
    const path = join(OUT_DIR, `${fnTag}.svg`)
    writeFileSync(path, svg)
    written.push(path)
  }

  // Per-topic fallback SVGs
  for (const [topic, iconName] of Object.entries(TOPIC_ICONS)) {
    const svg = svgFor(iconName)
    const path = join(OUT_DIR, `_topic-${topic}.svg`)
    writeFileSync(path, svg)
    written.push(path)
  }

  // Default fallback
  writeFileSync(join(OUT_DIR, '_package.svg'), svgFor(DEFAULT_FN_ICON))
  written.push(join(OUT_DIR, '_package.svg'))

  console.log(`=== Tier 4 SVG fallback ===`)
  console.log(`Wrote ${written.length} SVGs to ${OUT_DIR}`)
}

main()
