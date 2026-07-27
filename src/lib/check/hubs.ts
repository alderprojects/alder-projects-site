/**
 * v7.4.1c — Verdict hub definitions: the engine's STANDING verdict per
 * category, rendered at /check/[slug] (programmatic "is it worth it"
 * pages) and as a verdict box atop the matching guide.
 *
 * Numbers always come from data/vermont-costs.json at render time (the
 * pages update when the dataset does). The standing verdict + rationale
 * here are editorial and change only with human review — they are the
 * category-level default, and every page's CTA is the personal Check
 * ("your home may read differently — photograph it").
 */

import { itemsForCategory } from '@/lib/recommend/dataset'
import type { CostItem } from '@/lib/recommend/types'

export interface VerdictHub {
  slug: string
  /** Query-shaped page title, e.g. "Is a Heat Pump Worth It in Vermont?" */
  question: string
  titleSuffix: string // appended after question in <title>
  verdict: 'BUY' | 'WAIT' | 'SKIP' | 'INVESTIGATE'
  /** One-paragraph standing rationale (voice-guide: open with the problem). */
  rationale: string
  /** Evidence-style bullets for the standing verdict card. */
  evidence: string[]
  nextAction: string
  /** data/vermont-costs.json category; 'other' renders no numbers. */
  datasetCategory: string
  /** Word-match hint to pick headline items from the category. */
  itemHints?: string[]
  /** Amazon category search (BUY hubs only — free-tier commerce rule). */
  categorySearchQuery?: string
  assumptions: string[]
  faqs: Array<{ q: string; a: string }>
  parentGuideSlug?: string
  parentGuideTitle?: string
}

export const VERDICT_HUBS: VerdictHub[] = [
  {
    slug: 'heat-pump-vermont',
    question: 'Is a Heat Pump Worth It in Vermont?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'BUY',
    rationale:
      'If you heat with oil or propane, the math usually lands in the heat pump’s favor before you even count rebates — and Vermont’s rebate stack is among the deepest in the country. The catch is sizing and installer choice, not whether the technology works at -10°F. Modern cold-climate units do.',
    evidence: [
      'Efficiency Vermont pays fixed rebates through participating installers',
      'Oil-to-electric fuel switching adds a bonus on top of the base rebate',
      'Single-zone installs are the sweet spot for most homes',
    ],
    nextAction: 'Get two quotes from EVT-participating installers — the rebate is paid through the contractor.',
    datasetCategory: 'heat_pump_heating',
    itemHints: ['mini-split', 'ducted', 'ductless'],
    categorySearchQuery: 'cold climate mini split heat pump',
    assumptions: [
      'You currently heat with oil, propane, or electric resistance',
      'Your electrical panel has capacity (a service upgrade has its own EVT rebate)',
    ],
    faqs: [
      {
        q: 'Do heat pumps work in Vermont winters?',
        a: 'Yes. Cold-climate heat pumps are rated to operate at -13°F and below, and Efficiency Vermont only rebates cold-climate-rated models. Most Vermont installs keep a backup heat source for the coldest snaps, but the heat pump carries the bulk of the season.',
      },
      {
        q: 'How much is the Efficiency Vermont heat pump rebate in 2026?',
        a: 'Efficiency Vermont pays $2,200 for a ducted whole-house system and $475 per indoor head for ductless systems, paid to the participating contractor at job completion. Fuel-switching from oil adds $400, and Green Mountain Power adds income-eligible bonuses in its territory.',
      },
      {
        q: 'Should I replace my boiler or add a heat pump alongside it?',
        a: 'Most Vermont homes add the heat pump alongside the existing boiler first. The heat pump takes the shoulder seasons and most of winter; the boiler stays as backup. Full boiler removal only makes sense with a whole-house ducted system and a fuel-switching plan.',
      },
    ],
    parentGuideSlug: 'vermont-heat-pump-rebate-stack-2026',
    parentGuideTitle: 'Vermont Heat Pump Rebate Stack 2026',
  },
  {
    slug: 'weather-stripping-drafts',
    question: 'Is Weather Stripping Worth It?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'BUY',
    rationale:
      'A drafty door leaks heat all season and the fix costs less than a tank of gas. Weather stripping is the rare home purchase with essentially no downside: cheap, reversible, DIY-easy, and the payback is measured in months, not years.',
    evidence: [
      'Draft sealing is consistently the cheapest heat-loss fix per dollar',
      'Renter-safe: fully reversible, take nothing with you when you move',
      'Efficiency Vermont’s weatherization programs start with air sealing for a reason',
    ],
    nextAction: 'Do the dollar-bill test on your worst door, then seal that one first.',
    datasetCategory: 'drafts_weatherization',
    itemHints: ['weather', 'strip', 'air seal', 'draft'],
    categorySearchQuery: 'door weather stripping seal kit',
    assumptions: ['You can feel a draft or see daylight at a door or window edge'],
    faqs: [
      {
        q: 'Is weather stripping worth it for renters?',
        a: 'Yes. Weather stripping is fully reversible, costs little, installs without tools in most cases, and the renter pockets the heating savings. It is one of the few home-efficiency purchases that makes sense regardless of tenure.',
      },
      {
        q: 'What should I seal first?',
        a: 'The door you can feel a draft through. Exterior door bottoms and attic hatches leak the most heat for the least sealing effort. Windows come after doors, and window inserts beat tape-on film for windows you open.',
      },
    ],
    parentGuideSlug: 'vermont-weatherization-evt-rebate',
    parentGuideTitle: 'Weatherization & EVT Rebates',
  },
  {
    slug: 'window-replacement',
    question: 'Is Window Replacement Worth It?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'SKIP',
    rationale:
      'The $14,000 window-replacement quote almost never pays back on energy savings alone — the honest math says seal and insert first. Full replacement is a comfort and rot decision, not an efficiency one. If your frames are sound, inserts get you most of the comfort for a tenth of the cost.',
    evidence: [
      'Energy payback on full replacement typically runs decades',
      'Interior inserts capture most of the draft-stopping benefit',
      'Replacement makes sense for rotted frames, failed seals, or lead paint — not drafts',
    ],
    nextAction: 'Price interior inserts for your three worst windows before taking any replacement quote.',
    datasetCategory: 'windows',
    itemHints: ['insert', 'replacement'],
    assumptions: ['Window frames are structurally sound (no rot, no failed glass seals)'],
    faqs: [
      {
        q: 'Do window inserts really work?',
        a: 'Interior window inserts create a sealed air gap that stops drafts and cuts conductive loss, capturing most of the comfort benefit of replacement windows at roughly a tenth of the installed cost. Vermont’s WindowDressers program builds them at community volunteer builds.',
      },
      {
        q: 'When is full window replacement actually worth it?',
        a: 'When frames are rotted, sashes no longer operate, glass seals have failed and fogged, or lead paint makes the existing windows a health issue. Those are repair decisions where replacement wins — pure energy savings rarely justify it on their own.',
      },
    ],
    parentGuideSlug: 'window-film-vs-replacement-vermont',
    parentGuideTitle: 'Window Film vs Replacement',
  },
  {
    slug: 'leak-sensors',
    question: 'Are Water Leak Sensors Worth It?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'BUY',
    rationale:
      'One burst washing-machine hose can cause five figures of damage while you are at work. Leak sensors are cheap insurance you install in minutes: put one under every appliance that touches water and one next to the water heater, and the first alert pays for the whole set.',
    evidence: [
      'Water damage is among the most common and expensive home insurance claims',
      'Sensors are battery-powered, renter-safe, and install with zero tools',
      'Seasonal and second homes benefit most — nobody hears a drip in an empty house',
    ],
    nextAction: 'Count your water-touching appliances (washer, water heater, dishwasher, fridge line, sump) — that is your sensor count.',
    datasetCategory: 'leak_sensors',
    categorySearchQuery: 'water leak sensor alarm',
    assumptions: ['Wi-Fi sensors assume the home has internet service year-round'],
    faqs: [
      {
        q: 'Where should leak sensors go first?',
        a: 'Under the water heater, behind the washing machine, under the kitchen sink and dishwasher, and near the sump pump. Those five spots cover the large majority of residential leak sources.',
      },
      {
        q: 'Do I need smart (Wi-Fi) sensors or are local alarms enough?',
        a: 'If someone is usually home, a loud local alarm is enough. For seasonal homes, rentals, or frequent travel, Wi-Fi sensors that push a phone alert are worth the small premium — an alarm nobody hears is a flood.',
      },
    ],
  },
  {
    slug: 'basement-moisture-check',
    question: 'Should You Finish Your Basement?',
    titleSuffix: 'Moisture First — Buy / Skip / Wait Verdict [2026]',
    verdict: 'INVESTIGATE',
    rationale:
      'Finishing a basement that has a moisture problem is how a $30,000 project becomes a $60,000 one. The verdict on finishing is always the same: run the cheap moisture diagnostics first — a $40 test prevents the five-figure mistake. No purchase until the walls pass.',
    evidence: [
      'Efflorescence, musty smell, or a running dehumidifier are all pre-existing evidence',
      'The diagnostic sequence costs under $100 total',
      'Finishing over moisture traps it in the wall assembly — mold follows',
    ],
    nextAction: 'Tape a square of plastic sheeting to the wall for 48 hours — condensation behind it means moisture is migrating through.',
    datasetCategory: 'basement_moisture',
    itemHints: ['test', 'dehumidifier', 'vapor'],
    assumptions: ['Applies to below-grade spaces in heating climates'],
    faqs: [
      {
        q: 'How do I test a basement for moisture before finishing it?',
        a: 'Tape a two-foot square of clear plastic sheeting to the concrete wall and floor, sealed on all edges, and leave it 48 hours. Condensation on the wall side means vapor is migrating through the foundation — fix that before any framing goes up.',
      },
      {
        q: 'Is a dehumidifier a fix for a wet basement?',
        a: 'A dehumidifier manages humidity; it does not fix water entry. If the plastic-sheet test shows migration or you see efflorescence, address drainage, gutters, and grading first. A dehumidifier is the maintenance layer after the causes are handled.',
      },
    ],
    parentGuideSlug: 'before-finishing-basement-moisture-checks-vermont',
    parentGuideTitle: 'Basement Moisture Checks',
  },
  {
    slug: 'refrigerator-replacement',
    question: 'Should You Replace an Old Refrigerator?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'WAIT',
    rationale:
      'An aging-but-working fridge is rarely worth replacing for efficiency alone — the savings story only pencils for pre-2000 units or failing ones. Wait for a real symptom: compressor cycling, condensation inside, warm spots, or door seals that fail the dollar-bill test.',
    evidence: [
      'Efficiency gains since ~2005 are real but too small to justify early replacement',
      'Failure symptoms, not age, are the trigger that changes the math',
      'Replacement timed to a sale beats replacement forced by a dead compressor',
    ],
    nextAction: 'Do the dollar-bill test on the door seal; if it slides out easily, replace the gasket — not the fridge.',
    datasetCategory: 'other',
    assumptions: ['Unit is post-2000 and currently keeping temperature'],
    faqs: [
      {
        q: 'How do I know when a refrigerator is actually dying?',
        a: 'Warm spots, condensation or frost where there was none, the compressor running constantly or short-cycling, and food spoiling early are the real signals. Age alone is not — many 20-year-old units run fine and cost only modestly more per year than new ones.',
      },
      {
        q: 'Is it cheaper to repair or replace an old fridge?',
        a: 'Rule of thumb: if the repair costs more than half the price of a comparable new unit and the fridge is over ten years old, replace it. Door gaskets, thermostats, and fans are cheap repairs; compressors and sealed-system leaks usually are not.',
      },
    ],
  },
  {
    slug: 'roof-replacement-timing',
    question: 'Do You Need a New Roof?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'INVESTIGATE',
    rationale:
      'A roof is the one purchase where photo-guessing is most expensive in both directions: replacing a roof with five good years left wastes five figures, and waiting on a failing one costs the sheathing underneath. Nobody should buy or wait on a roof without an on-roof inspection.',
    evidence: [
      'Curling or missing shingles and moss are visible from the ground; deck rot is not',
      'Vermont replacement pricing varies more by access and pitch than by shingle brand',
      'Standing-seam metal changes the math on snow country roofs',
    ],
    nextAction: 'Get an on-roof inspection with photos of the decking — not a from-the-driveway quote.',
    datasetCategory: 'roofing',
    itemHints: ['asphalt', 'standing-seam', 'metal'],
    assumptions: ['Asphalt roof age 15+ years or visible shingle symptoms'],
    faqs: [
      {
        q: 'How long do roofs last in Vermont?',
        a: 'Architectural asphalt typically runs 20 to 25 years in Vermont conditions; standing-seam metal runs 40 or more and sheds snow. Ice damming and freeze-thaw cycling age the edges and valleys first, which is where inspections should focus.',
      },
      {
        q: 'Should I choose asphalt or standing-seam metal in snow country?',
        a: 'Standing seam costs substantially more up front but sheds snow, outlasts two asphalt cycles, and holds resale value in Vermont. Asphalt wins on first cost and repairability. On steep, high-snow sites, metal usually wins the 30-year math.',
      },
    ],
    parentGuideSlug: 'how-much-does-roof-replacement-cost-vermont',
    parentGuideTitle: 'Roof Replacement Costs in Vermont',
  },
  {
    slug: 'solar-battery-vermont',
    question: 'Is Solar + Battery Worth It in Vermont?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'INVESTIGATE',
    rationale:
      'Vermont’s incentives make solar-plus-storage genuinely interesting, but the answer is site-specific in a way no category verdict can honestly cover: shading, roof age, utility territory, and outage exposure move the math more than the sticker price. Get the site assessment before believing any payback number.',
    evidence: [
      'Utility programs differ sharply between GMP territory and others',
      'A roof due for replacement within ten years should be re-roofed first',
      'Battery value depends on your outage frequency, not just rates',
    ],
    nextAction: 'Get two site assessments and ask each installer to separate the solar math from the battery math.',
    datasetCategory: 'solar',
    itemHints: ['solar', 'battery', 'storage'],
    assumptions: ['Grid-tied home; off-grid changes everything'],
    faqs: [
      {
        q: 'Does a home battery pay for itself in Vermont?',
        a: 'On bill savings alone, rarely. The battery case in Vermont rests on utility bring-your-own-device programs and on outage protection — if your road loses power several times a winter, the resilience value is real but personal. Ask installers to show the battery math separately from solar.',
      },
      {
        q: 'Should I replace my roof before going solar?',
        a: 'If the roof has less than ten years of life left, yes — removing and re-installing panels for a re-roof costs thousands. Solar installers will quote on any roof; the re-roof-first discipline is on you.',
      },
    ],
    parentGuideSlug: 'vermont-solar-battery-stack-2026',
    parentGuideTitle: 'Solar + Battery Stack 2026',
  },
  {
    slug: 'kitchen-remodel-vs-refresh',
    question: 'Is a Kitchen Remodel Worth It?',
    titleSuffix: 'Remodel vs Refresh — Buy / Skip / Wait Verdict [2026]',
    verdict: 'WAIT',
    rationale:
      'Most kitchens that feel dated need a refresh, not a remodel: hardware, faucet, lighting, and paint move the room for a few hundred dollars, while the full remodel starts in the tens of thousands. Wait on the gut job until the layout itself — not the finishes — is the problem.',
    evidence: [
      'Hardware, faucet, and lighting are the highest-leverage per-dollar changes',
      'Layout problems (work triangle, load-bearing walls) are what justify remodels',
      'Mid-range remodel budgets in Vermont run well into five figures',
    ],
    nextAction: 'List what actually bothers you about the kitchen; if nothing on the list is about layout, price the refresh first.',
    datasetCategory: 'kitchen',
    itemHints: ['mid-range', 'refresh', 'remodel'],
    assumptions: ['Cabinets are structurally sound and layout is workable'],
    faqs: [
      {
        q: 'What does a kitchen remodel cost in Vermont?',
        a: 'Mid-range Vermont kitchen remodels commonly land in the $30,000 to $60,000 band depending on layout changes, with older-home surprises (wiring, plumbing, load-bearing walls) driving the variance. A finish-level refresh runs two orders of magnitude less.',
      },
      {
        q: 'What is the highest-impact cheap kitchen upgrade?',
        a: 'Cabinet hardware, a new faucet, and under-cabinet lighting — roughly a few hundred dollars combined — change how a kitchen reads and functions more than any single appliance swap. Paint on sound cabinets is the next tier up.',
      },
    ],
    parentGuideSlug: 'how-much-does-kitchen-remodel-cost-vermont',
    parentGuideTitle: 'Kitchen Remodel Costs in Vermont',
  },
  {
    slug: 'led-lighting-upgrade',
    question: 'Are LED Lighting Upgrades Still Worth It?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'BUY',
    rationale:
      'If any incandescent or halogen bulbs are still burning in your house, replacing them is the fastest payback in home efficiency — often under a year in fixtures that run daily. The only skip is replacing working LEDs with marginally better LEDs; that is upgrade theater.',
    evidence: [
      'LEDs use roughly 80% less energy than the incandescents they replace',
      'Payback is fastest in high-use fixtures: kitchen, exterior, hallway',
      'Replacing working LEDs with newer LEDs rarely pencils',
    ],
    nextAction: 'Swap the five fixtures that run the most hours first; leave working LEDs alone.',
    datasetCategory: 'lighting_efficiency',
    categorySearchQuery: 'LED bulb multipack warm white dimmable',
    assumptions: ['You still have incandescent, halogen, or CFL bulbs in service'],
    faqs: [
      {
        q: 'Is it worth replacing CFL bulbs with LEDs?',
        a: 'Usually yes when the CFL dies, and often before: LEDs use about half the energy of CFLs, contain no mercury, start instantly in the cold, and last two to three times longer. Prioritize high-use and exterior fixtures.',
      },
    ],
  },
  {
    slug: 'deck-repair-vs-rebuild',
    question: 'Deck Repair or Full Rebuild?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'INVESTIGATE',
    rationale:
      'Surface boards lie: a deck can look tired on top and be structurally fine underneath, or look decent and be rotting at the ledger — the connection that causes deck collapses. The repair-versus-rebuild call lives under the deck, at the ledger and posts, not on the walking surface.',
    evidence: [
      'Ledger attachment is the failure mode that matters for safety',
      'Board-level wear is cosmetic and repairable at a fraction of rebuild cost',
      'Vermont freeze-thaw punishes posts at grade first',
    ],
    nextAction: 'Probe the ledger board and post bases with a screwdriver — soft wood there changes everything.',
    datasetCategory: 'deck',
    itemHints: ['deck'],
    assumptions: ['Pressure-treated framing typical of Vermont decks'],
    faqs: [
      {
        q: 'How do I know if my deck needs to be rebuilt or just repaired?',
        a: 'Check where it matters: the ledger (where the deck bolts to the house), the post bases, and the joist ends. If a screwdriver sinks into any of those, you are in structural territory and a professional look is warranted. Grayed or splintered surface boards alone are a repair, not a rebuild.',
      },
    ],
    parentGuideSlug: 'how-much-does-a-deck-cost-vermont',
    parentGuideTitle: 'Deck Costs in Vermont',
  },
  {
    slug: 'entry-storage-mudroom',
    question: 'Is a Mudroom Storage System Worth It?',
    titleSuffix: 'Buy / Skip / Wait Verdict [2026]',
    verdict: 'BUY',
    rationale:
      'Mud season is a storage problem before it is a cleaning problem: no bench, no boot tray, no hooks means the floor becomes all three. Entry storage is cheap, renter-safe in its freestanding forms, and the rare purchase that pays off every single day of a Vermont spring.',
    evidence: [
      'Freestanding benches and hook rails install without wall damage',
      'Boot trays are the highest-value-per-dollar item in the entry',
      'Built-ins are the upgrade path, not the starting point',
    ],
    nextAction: 'Count coats and boots that live at the door; buy hooks and tray capacity for that number plus two guests.',
    datasetCategory: 'storage',
    categorySearchQuery: 'entryway storage bench boot tray hook rail',
    assumptions: ['An entry or landing area of at least a few feet exists'],
    faqs: [
      {
        q: 'What entry storage works for renters?',
        a: 'Freestanding benches with shoe shelves, over-door hook racks, and boot trays need no fasteners and move out when you do. Wall-mounted hook rails need only two screws and are the one small hole most landlords accept.',
      },
    ],
  },
]

export function hubBySlug(slug: string): VerdictHub | undefined {
  return VERDICT_HUBS.find((h) => h.slug === slug)
}

/** Hub whose parent guide matches a guide path (for the guide verdict box). */
export function hubForGuidePath(path: string): VerdictHub | undefined {
  const slug = path.replace(/^\/guides\//, '').replace(/\/$/, '')
  return VERDICT_HUBS.find((h) => h.parentGuideSlug === slug)
}

/** Headline dataset items for a hub (cost table). */
export function hubItems(hub: VerdictHub): CostItem[] {
  if (hub.datasetCategory === 'other') return []
  const items = itemsForCategory(hub.datasetCategory)
  if (!hub.itemHints || hub.itemHints.length === 0) return items.slice(0, 6)
  const hinted = items.filter((i) => hub.itemHints!.some((h) => i.item.toLowerCase().includes(h)))
  const rest = items.filter((i) => !hinted.includes(i))
  return [...hinted, ...rest].slice(0, 6)
}
