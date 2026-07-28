#!/usr/bin/env node
// Generate v8 revenue-maximizing homepage mockups via OpenAI gpt-image-1.
// Reads OPENAI_API_KEY from ../../.env.local. Writes PNGs into this directory.
//
// Usage: node mockups/v8-revenue/generate-mockups.mjs [a|b|c|all]
//        defaults to "all"

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ENV_PATH = resolve(__dirname, '../../.env.local')

async function loadKey() {
  const env = await readFile(ENV_PATH, 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^OPENAI_API_KEY=(.+)$/)
    if (m) return m[1].trim()
  }
  throw new Error('OPENAI_API_KEY not found in .env.local')
}

const SHARED_STYLE = `Style: clean modern desktop website homepage UI mockup, professional product design, flat illustration style, no photographs except where noted, soft cream background (#FAF7F2), Vermont-orange accent (#C8732A), dark forest green secondary (#0D1A0B), sage green details (#7A9B6F), serif headlines (Playfair Display feel), sans-serif body (DM Sans feel), monospace for tags. Composition: 1536x1024 landscape, full top-of-page screenshot showing the hero plus the start of section 2 below it. Editorial, restrained, Vermont-credible aesthetic. NOT a marketing splash page. The layout should feel like Stripe or Mercury: confident whitespace, dense typography, minimal ornament. Render any text crisply and legibly. No stock-photo people, no generic shutterstock house images.`

const PROMPTS = {
  a: {
    file: 'concept-a-the-receipt.png',
    prompt: `${SHARED_STYLE}

Concept: "The Receipt" — a long-form sales-page homepage for Alder Projects. Anchored on a single $19.99 product with one CTA above the fold.

Render quality requirements: Every text label appears exactly ONCE. No duplicate menu items, no doubled buttons, no repeated phrases. No misspellings. No watermarks. No mojibake or stray quotation marks. No emoji. Use straight ASCII characters only — no curly quotes that may render as escaped strings.

Layout (top of page, hero section):
- Top: minimal nav bar. LEFT: a small forest-green pine-tree icon followed by "ALDER PROJECTS" wordmark in monospace, all caps, letter-spaced. RIGHT: three plain text links separated by generous spacing — "Smart Cart", "How it works", "Sign in". That is the entire nav. Do not render any item twice.
- Hero is a 55/45 split below the nav.
- LEFT 55%: cream background. Stack from top:
   * small monospace eyebrow tag in muted sage green: "SMART CART · VERMONT EDITION"
   * H1 in large serif (Playfair-like): "The shopping list for your next Vermont home project." Italicize only the word "next" in Vermont-orange.
   * sub-headline in sans-serif body, dark gray: "Tell us the project. We send back the buy list, the skip list, and the two or three things that are different here than in the box-store guide."
   * Single primary CTA button, Vermont-orange fill (#C8732A), white text, rounded corners, no icon: "Get the Smart Cart — $19.99"
   * directly under the CTA, one small italic line, dark gray: "One skipped cabinet pull pays for the cart twice."
   * a thin row of three micro-proofs in monospace, separated by middots, muted sage-green: "Built in Montpelier · 30-day refund · No account"
- RIGHT 45%: a "receipt" card mocked up to look like a tan kraft-paper receipt printed on a thermal printer. Slightly off-cream paper with subtle texture. The card shows:
   * a header strip in monospace: "KITCHEN BACKSPLASH · 4 SQ FT"
   * dotted divider
   * four item rows, each with a small monochrome icon and one short line:
       - green checkmark: "Buy: notched trowel — $9"
       - green checkmark: "Buy: pre-mixed mastic, not thinset — $22"
       - muted-red X with subtle strikethrough on the text: "Skip: spacer kit. Use nickels."
       - small orange exclamation icon: "Worth a pro: outlet relocation"
   * dotted divider
   * bold bottom line in monospace, larger: "You didn't spend $184."

Below the hero, just visible at the bottom of the frame (suggesting more content below): a three-tile stat row, each tile bordered with a thin sage-green line, sans-serif, big number on top, one-line label underneath:
   * Tile 1 — number: "$19.99" / label: "one project, one fee"
   * Tile 2 — number: "$184" / label: "average skipped purchase"
   * Tile 3 — number: "30 days" / label: "refund, no form"

Mood: dry, factual, Yankee-restrained. NOT bubbly. NOT salesy. NO badges. NO shields. NO gradients. NO drop shadows except subtle on the receipt card. The receipt graphic is the visual hook. One CTA only on the entire above-fold area.`,
  },
  b: {
    file: 'concept-b-two-minute-read.png',
    prompt: `${SHARED_STYLE}

Concept: "The Two-Minute Read" — a free 3-question diagnostic homepage for Alder Projects. The hero IS the quiz, not a button to a quiz.

Render quality requirements: Every text label appears exactly ONCE. No duplicate menu items, no doubled buttons, no repeated phrases. No misspellings. No watermarks. Use straight ASCII characters only.

Layout (top of page, hero section):
- Top: minimal nav bar. LEFT: small forest-green pine-tree icon followed by "ALDER PROJECTS" wordmark in monospace, all caps. RIGHT: three plain text links separated by generous spacing — "Smart Cart", "How it works", "Sign in". That is the entire nav. Render each link exactly once.
- Hero is centered single column, generous whitespace. Cream background.
- Stack from top, all centered:
   * small monospace eyebrow tag: "TWO-MINUTE PROJECT TRIAGE"
   * H1 in serif: "Three questions. We tell you what's actually worth doing." (italicize "actually")
   * sub-headline in sans-serif: "Free triage for Vermont homeowners with a list of projects and not enough weekends. We'll rank them by cost, urgency, and what mud season is about to do to them."
- THE QUIZ CARD, dominant element, centered, ~600px wide, white card on cream with a thin sage-green border and subtle shadow:
   * top of card, monospace small caption: "Question 1 of 3"
   * three progress dots: ● ○ ○ (filled, empty, empty), Vermont-orange for the filled
   * H3 in serif: "What part of the house is bugging you most right now?"
   * five large clickable answer chips stacked or in a 2-column grid, each rounded-rectangular with sage-green hover hint:
      - "Kitchen or bath"
      - "Basement, attic, or insulation"
      - "Roof, gutters, or siding"
      - "Outside: deck, walk, drive, yard"
      - "Honestly, I have a list"
   * small italic line under the chips: "Free. No email required to see your result."
- In the upper-right corner, NOT dominant, a small framed photo (~150px wide) of an old Vermont farmhouse exterior in spring, tilted slightly like a polaroid, with handwritten caption underneath: "Mud season, Hardwick."
- Below the quiz card, the start of a section header "What you get back" in serif, with the top of three small cards visible at the very bottom of the frame.

Mood: utilitarian, clean, functional — feels like a well-designed tax tool, not a marketing site. The quiz dominates. Vermont visual reference is incidental, not splashy.`,
  },
  c: {
    file: 'concept-c-photo-first.png',
    prompt: `${SHARED_STYLE}

Concept: "Photo-First Vermont-Native" — a quietly editorial homepage for Alder Projects whose hero is a photo upload zone. Most visually distinctive of the three.

Render quality requirements: Every text label appears exactly ONCE. No duplicate menu items, no doubled buttons, no repeated phrases. No misspellings — render the word "ignore" correctly (not "ingore"). No watermarks. Use straight ASCII characters only.

Layout (top of page, hero section):
- Top: minimal nav bar. LEFT: small forest-green pine-tree icon followed by "ALDER PROJECTS" wordmark in monospace, all caps. RIGHT: three plain text links separated by generous spacing — "Smart Cart", "How it works", "Sign in". That is the entire nav. Render each link exactly once.
- Hero is centered single column on cream background, with a single editorial-style framed photograph as a small visual anchor in the upper-left corner: a black-and-white photo of an old Vermont farmhouse kitchen interior with morning light through a window, about 200px wide, with handwritten serif caption "Hardwick, 1880."
- Centered stack from top:
   * small monospace eyebrow tag: "A QUIETER WAY TO START A PROJECT"
   * H1 in serif, large: "Take a picture of the room. We'll tell you what's worth fixing." (italicize "room")
   * sub-headline in sans-serif: "Snap your kitchen, bath, basement, or back deck. We send back what a careful Vermont neighbor would notice, in plain language, with the things you can ignore clearly marked ignore."
- THE UPLOAD ZONE, dominant element, centered, ~700px wide, ~280px tall: a dashed-border rectangle on white card with cream interior, a simple cloud-with-up-arrow line icon centered, then text: "Drag a photo here, or take one now." underneath in smaller monospace gray: "JPG or HEIC. We don't store it after the reading."
- Below the upload zone, two small horizontal buttons centered: one Vermont-orange "Upload a photo" (primary), one underlined link "See an example reading" (secondary).
- A small italic line under the buttons: "We read the photo. Then a person checks it. Both, every time."
- Sample reading card, below the buttons, off-white card with a thin border, header "Sample reading: 1880 farmhouse kitchen, Hardwick." (italic small monospace) followed by four bullet observations, each with a small icon:
   * checkmark icon, sage green: "The cabinets are fine. Paint, don't replace."
   * exclamation icon, orange: "The outlet next to the sink is pre-GFCI. Worth fixing."
   * arrow icon, gray: "The sag in the floor by the fridge is the joist, not the subfloor. Different project."
   * cart icon, dark green: "The backsplash is a $90 weekend. Smart Cart available."

Mood: editorial, quiet, Vermont-restrained — feels closer to a curated product like Kinfolk magazine or a Heath Ceramics product page than a SaaS marketing site. The photo upload is the hero, the reading sample is the proof, no aggressive sales psychology.`,
  },
}

async function generate(key, prompt, outFile) {
  console.log(`→ Generating ${outFile}…`)
  const t0 = Date.now()
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: 'high',
      n: 1,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI API ${res.status}: ${body.slice(0, 500)}`)
  }
  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error(`No b64_json in response: ${JSON.stringify(data).slice(0, 500)}`)
  const buf = Buffer.from(b64, 'base64')
  const outPath = resolve(__dirname, outFile)
  await writeFile(outPath, buf)
  const ms = Date.now() - t0
  console.log(`  ✓ wrote ${outFile} (${(buf.length / 1024).toFixed(0)} KB, ${(ms / 1000).toFixed(1)}s)`)
}

async function main() {
  const arg = (process.argv[2] || 'all').toLowerCase()
  const keys = arg === 'all' ? ['a', 'b', 'c'] : [arg]
  const apiKey = await loadKey()
  for (const k of keys) {
    const cfg = PROMPTS[k]
    if (!cfg) {
      console.error(`Unknown concept: ${k}`)
      process.exit(1)
    }
    try {
      await generate(apiKey, cfg.prompt, cfg.file)
    } catch (err) {
      console.error(`✗ ${cfg.file}: ${err.message}`)
      process.exitCode = 1
    }
  }
}

main()
