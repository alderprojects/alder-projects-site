// scripts/source-catalogs/outdoor-seasonal-opening.ts
// V7.2.5 — Spring opening / water startup catalog

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const OUTDOOR_SEASONAL_OPENING_TOPIC = 'outdoor'
export const OUTDOOR_SEASONAL_OPENING_SCOPE = 'outdoor_seasonal_opening'
export const OUTDOOR_SEASONAL_OPENING_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'absentee_owner',
]

export const OUTDOOR_SEASONAL_OPENING_METADATA = {
  smartCartPromise:
    'Avoid losing your first weekend to leaks, missing supplies, filter mistakes, and reset work.',
  primaryCustomerPain:
    "Opening day at a Vermont second home should be relaxing. It's usually a list of small surprises — a slow leak, a clogged filter, a moldy bathroom — that eat your first weekend.",
  valueProposition:
    "A $150 opening kit prepared in advance prevents 4-6 hours of unplanned shopping trips during a 48-hour visit. The math is real: weekend trips to the lake have fixed travel time; every hour spent at Lowe's is an hour off the dock.",
  routeOutRules: [
    {
      condition: 'has_visible_water_damage',
      destination: 'small_pro',
      reason:
        "Water damage discovered at opening is a plumber problem, not a Smart Cart problem. Get it assessed before doing anything else.",
    },
    {
      condition: 'has_septic_concerns',
      destination: 'small_pro',
      reason:
        "Septic system concerns at opening (slow drains, odor, ground saturation) need a septic pro, not a kit. Especially in Vermont where septic systems often need post-winter inspection.",
    },
  ],
  seasonalUrgency: {
    season: 'spring_opening',
    deadline: '04-15',
    label:
      'Best by mid-April so your kit is at the property before opening weekend, not arriving at the wrong address while you wait.',
  },
}

export const OUTDOOR_SEASONAL_OPENING_SLOTS: CartSlot[] = [
  // ============================================================
  // SLOT 1: Water test kit
  // ============================================================
  {
    slotId: 'opening_water_test_kit',
    slotLabel: 'Drinking water test kit',
    slotKind: 'core',
    conditionalOn: ['has_recent_water_test', 'on_municipal_water'],
    tiers: {
      budget: {
        productName: 'Watersafe All-in-One basic test strips',
        priceLow: 12,
        priceHigh: 22,
        affiliateUrl:
          'https://www.amazon.com/s?k=watersafe+all+in+one+test+kit&tag=alderprojects-20',
        productSpec:
          'Quick-dip test strips for chlorine, hardness, lead, pesticides, bacteria, nitrates. Results in minutes. Useful for screening; not a substitute for lab analysis on bacteria.',
      },
      sweet_spot: {
        productName: 'Tap Score by SimpleLab — Essential Well Water mail-in lab test',
        priceLow: 165,
        priceHigh: 195,
        affiliateUrl:
          'https://www.amazon.com/s?k=tap+score+simplelab+well+water+test&tag=alderprojects-20',
        productSpec:
          'Mail-in lab analysis. Tests for 50+ contaminants including bacteria, lead, arsenic, radon-in-water (Vermont-specific concern), nitrates, hardness, pH. Results in 5-10 days. Includes interpretation guidance.',
      },
      premium: {
        productName: 'Tap Score Advanced Well Water test (95+ analytes)',
        priceLow: 280,
        priceHigh: 360,
        affiliateUrl:
          'https://www.amazon.com/s?k=tap+score+advanced+well+water&tag=alderprojects-20',
        productSpec:
          'Comprehensive panel including pesticides, herbicides, VOCs, full metals panel. Worth it for new property purchase or known contamination concerns. Overkill for routine annual testing.',
      },
    },
    slotPurpose:
      "Verify the water is safe to drink before pouring coffee on opening day.",
    whyItMatters:
      "Wells that sat unused over winter can develop bacterial contamination from low flow. Vermont well water has known background concerns including arsenic in some regions and radon-in-water. Annual testing is the right baseline; opening-day testing is the right timing.",
    commonMistake:
      "Skipping the test because the water 'tasted fine last year'. Bacterial contamination has no taste. Test results take 5-10 days for the lab — order it before you arrive so you have a fresh test for the season.",
    whyThis:
      "Tap Score Essential covers Vermont's specific concerns (radon, arsenic, bacteria) at a price comparable to a single bottled water case for the season. The interpretation guidance is the real value — raw results without context are noise.",
    whyNotCheaper:
      "Strip tests are useful for screening (is the chlorine in your municipal water in range?). They are not reliable for bacteria detection or low-concentration metals. For an annual well water test, the lab analysis is worth the price difference.",
    whyNotPremium:
      "The Advanced panel makes sense for a new property purchase, after a known contamination event, or once every 5 years for full re-baselining. Annual routine testing is well-served by the Essential panel.",
    contextNote:
      "Vermont Department of Health recommends annual private well testing for bacteria and every 5 years for chemistry. State data on regional contamination is publicly available and worth reviewing before choosing a test panel.",
    warnings: [
      "Test BEFORE drinking, not after. Same-day results are not available for proper bacteria testing.",
      "Sampling matters. Follow the kit's sampling instructions exactly — improper sampling produces useless results.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'sediment_filter',
      reason:
        "You have a recent test. The next-step gap is filtration matched to your test results — typically a sediment filter for most rural Vermont wells.",
    },
    whenToSkip: [
      'Property is on municipal water (state tests this)',
      'Tested within the last 12 months and results were within range',
    ],
    citations: [
      'Vermont Department of Health well water testing guidance',
      'Tap Score by SimpleLab product documentation',
      'EPA private well water testing recommendations',
    ],
  },

  // ============================================================
  // SLOT 2: Leak check kit
  // ============================================================
  {
    slotId: 'opening_leak_check',
    slotLabel: 'Leak check kit (manual)',
    slotKind: 'core',
    conditionalOn: ['has_leak_detector_installed'],
    tiers: {
      sweet_spot: {
        productName: 'Pressure gauge + dye tablets + paper towels kit',
        priceLow: 18,
        priceHigh: 30,
        affiliateUrl:
          'https://www.amazon.com/s?k=water+pressure+gauge+toilet+dye+leak+detection&tag=alderprojects-20',
        productSpec:
          'Hose-bib pressure gauge ($10) + toilet dye tablets ($6) + paper towels for visual inspection. Manual leak detection in 30 minutes covering toilets, supply pressure, visible-leak inspection of all fixtures.',
      },
    },
    slotPurpose:
      "First-day systematic leak inspection. Catch leaks that started over winter before they become visible damage.",
    whyItMatters:
      "Slow toilet leaks waste 200+ gallons/day and only become visible when the water bill arrives — months later, after the damage. The dye tablet method takes 10 minutes per toilet and catches leaks that auto-detection sensors won't see.",
    whyThis:
      "Manual inspection on opening day is the highest-leverage 30 minutes you'll spend. Pressure gauge tells you the supply is correct; dye tablets catch toilet flapper leaks; paper towels under fittings catch joint drips.",
    whyNotCheaper:
      "There is no cheaper version. The kit is already cheap.",
    whyNotPremium:
      "Smart leak sensors are the better long-term answer (covered in freeze prevention scope). For opening-day, manual inspection is the right tactical move.",
    contextNote:
      "Do this BEFORE turning on the water heater or running fixtures. A leak with no water pressure is hidden; a leak after pressure is restored is loud and expensive.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'leak_detector',
      reason:
        "You're past manual inspection — get permanent leak detection sensors so you don't repeat the process every spring.",
    },
    citations: [
      'EPA WaterSense leak detection guide',
      'Toilet dye tablet test methodology',
    ],
  },

  // ============================================================
  // SLOT 3: Filter replacement
  // ============================================================
  {
    slotId: 'opening_filter_replacement',
    slotLabel: 'Whole-house water filter replacement',
    slotKind: 'core',
    conditionalOn: ['has_no_filter_system', 'replaced_filters_recently'],
    tiers: {
      budget: {
        productName: 'Generic 10" sediment filter (5-micron, single)',
        priceLow: 6,
        priceHigh: 12,
        affiliateUrl:
          'https://www.amazon.com/s?k=10+inch+sediment+filter+5+micron&tag=alderprojects-20',
        productSpec:
          'Standard 10-inch housing filter, 5-micron sediment. Covers most basic whole-house sediment filtration. Replace every 3-6 months in active use.',
      },
      sweet_spot: {
        productName: 'Pentek 10" sediment + carbon block 2-pack',
        priceLow: 28,
        priceHigh: 45,
        affiliateUrl:
          'https://www.amazon.com/s?k=pentek+sediment+carbon+block+10+inch&tag=alderprojects-20',
        productSpec:
          'Pentek-brand 10" filters: 1 sediment (5-micron) + 1 carbon block. Sediment removes silt and rust; carbon removes chlorine, taste, odor. Covers most Vermont well systems running 6 months. Pentek is the industry standard, longer-lasting than generic.',
      },
      premium: {
        productName: 'Big Blue 4.5" x 20" filter housing + premium media',
        priceLow: 95,
        priceHigh: 160,
        affiliateUrl:
          'https://www.amazon.com/s?k=big+blue+water+filter+housing+4.5+20&tag=alderprojects-20',
        productSpec:
          'Big Blue housing for high-flow whole-house filtration. Required for homes with high water demand or known sediment loads. More expensive media but lasts much longer (12+ months).',
      },
    },
    slotPurpose:
      "Replace filter cartridges that have been sitting unused all winter or are reaching end-of-life.",
    whyItMatters:
      "Filter cartridges that sit in standing water all winter can grow bacteria. Even if the housing held water without freezing, the media degrades. Spring is the right replacement window.",
    commonMistake:
      "Buying filters before checking housing size. Filters come in 10\", 4.5\"x10\", 4.5\"x20\", and various proprietary sizes. Wrong size = filter doesn't seal = water bypasses the filter entirely.",
    whyThis:
      "Pentek 2-pack covers the typical Vermont well system: sediment first (catches silt) followed by carbon (improves taste). Industry-standard quality at retail-direct price.",
    whyNotCheaper:
      "Generic filters cost ~$6 each but inconsistent quality. The Pentek 2-pack is the right balance of price and reliability for the typical household.",
    whyNotPremium:
      "Big Blue is the right call ONLY if your existing housing is Big Blue. If you have standard 10\" housing, premium media in a smaller size is the better fit.",
    contextNote:
      "Measure your filter housing BEFORE ordering. Photograph it next to a ruler. Most homes have either standard 10\" or Big Blue 4.5\"x10\". Mismatches don't seal.",
    warnings: [
      "Always wear nitrile gloves when handling old cartridges. The accumulated sediment can include bacteria.",
      "Sanitize the housing with a bleach rinse if filters were sitting in standing water through winter.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'pressure_gauge',
      reason:
        "You've replaced filters. The next-step gap is monitoring pressure across the filter — a pressure gauge catches a clogged filter before it stops flow.",
    },
    whenToSkip: [
      'Property has no whole-house filter system',
      'Filter replaced within last 3 months',
    ],
    citations: [
      'Pentek product documentation',
      'EPA Drinking Water filter selection guidance',
    ],
  },

  // ============================================================
  // SLOT 4: Cleaning reset kit
  // ============================================================
  {
    slotId: 'opening_cleaning_kit',
    slotLabel: 'Spring cleaning reset kit (consumables)',
    slotKind: 'core',
    conditionalOn: ['has_full_cleaning_supplies'],
    tiers: {
      budget: {
        productName: 'Basic cleaning consumables (Lysol, Mr Clean, Comet, sponges)',
        priceLow: 25,
        priceHigh: 45,
        affiliateUrl:
          'https://www.amazon.com/s?k=cleaning+supplies+kit+all+purpose+sponges&tag=alderprojects-20',
        productSpec:
          'Multi-surface cleaner, scrubbing cleanser, sponges, paper towels. Covers a 2-bath, 1-kitchen, basic-living-room cleaning reset.',
      },
      sweet_spot: {
        productName: 'Method-tier cleaning kit + microfiber + Mrs. Meyer\'s + bleach',
        priceLow: 60,
        priceHigh: 95,
        affiliateUrl:
          'https://www.amazon.com/s?k=method+mrs+meyers+microfiber+cleaning+kit&tag=alderprojects-20',
        productSpec:
          'Better-quality cleaners that don\'t leave residue. Includes microfiber for streak-free surfaces. Mrs. Meyer\'s for non-toxic surfaces; bleach (Concrobium or 30% hydrogen peroxide) for mold/mildew on grout and bathrooms.',
      },
    },
    slotPurpose:
      "Reset all surfaces, especially in bathrooms and kitchen, after months of unused space.",
    whyItMatters:
      "Mold and mildew develop in unused bathrooms over winter. The first-day clean prevents these from spreading and prevents the smell that makes guests uncomfortable on day one.",
    commonMistake:
      "Buying full cleaning supply kits when only consumable refills are needed. If your second home already has buckets, mops, and gloves stored, you only need the consumables — bleach, microfiber, all-purpose cleaner.",
    whyThis:
      "Microfiber + non-toxic cleaners do better on second-home surfaces (often older finishes that don't tolerate harsh chemistry). Bleach for grout and shower; gentler products for everywhere else.",
    whyNotCheaper:
      "Generic cleaning kits include items you may already have. If buckets and gloves are at the property, consumables-only is the right answer.",
    whyNotPremium:
      "Premium cleaning service kits ($150+) are for daily-use second homes (Airbnb scenarios). For a personal weekend home, the consumables kit covers actual cleaning need.",
    contextNote:
      "Open windows during first cleaning. Vermont second homes that sat closed for months have stale-air smells that ventilation alone won't clear — but ventilation is required for many cleaners.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'odor_absorber',
      reason:
        "You have cleaning supplies. The next-step gap is moisture/odor control — DampRid, ventilation, or dehumidifier — to prevent the same musty smell next opening.",
    },
    citations: [
      'CDC mold cleanup guidance',
      'Method, Mrs. Meyer\'s product documentation',
    ],
  },

  // ============================================================
  // SLOT 5: Dehumidifier (entry-level)
  // ============================================================
  {
    slotId: 'opening_dehumidifier',
    slotLabel: 'Dehumidifier (basement or whole-house)',
    slotKind: 'addon',
    conditionalOn: ['has_dehumidifier'],
    tiers: {
      budget: {
        productName: 'Generic 30-pint dehumidifier',
        priceLow: 130,
        priceHigh: 200,
        affiliateUrl:
          'https://www.amazon.com/s?k=30+pint+dehumidifier+basement&tag=alderprojects-20',
        productSpec:
          '30-pint capacity. Covers ~1,500 sq ft. Manual drain bucket or hose attachment. 3-5 year typical lifespan.',
      },
      sweet_spot: {
        productName: 'hOmeLabs 50-pint dehumidifier with continuous drain',
        priceLow: 220,
        priceHigh: 320,
        affiliateUrl:
          'https://www.amazon.com/s?k=homelabs+50+pint+dehumidifier+continuous+drain&tag=alderprojects-20',
        productSpec:
          '50-pint capacity. Covers ~3,000 sq ft. Built-in pump for continuous drain over distance. Energy Star rated. Best for damp Vermont basements that need long-running coverage.',
      },
      premium: {
        productName: 'Aprilaire whole-house dehumidifier (1850, 1830)',
        priceLow: 1100,
        priceHigh: 1900,
        affiliateUrl:
          'https://www.amazon.com/s?k=aprilaire+whole+house+dehumidifier+1850&tag=alderprojects-20',
        productSpec:
          'Whole-house unit ducted into HVAC system. Requires professional install. Best for chronic moisture problems or radon mitigation pairing. ~$2,500 installed.',
      },
    },
    slotPurpose:
      "Reduce ambient moisture in basements, crawlspaces, and seasonal homes to prevent mold growth and protect stored items.",
    whyItMatters:
      "Vermont summers are humid. Basements that stay above 60% relative humidity grow mold within weeks. A dehumidifier is the difference between a usable basement and one with permanent musty smell.",
    commonMistake:
      "Buying a dehumidifier before identifying water source. If you have water seeping into the basement, a dehumidifier treats the symptom while the actual problem (drainage, foundation, leak) gets worse. Test for source first.",
    whyThis:
      "hOmeLabs 50-pint with continuous drain works well in Vermont basements where you don't want to empty the bucket twice a day. The pump-assisted drain handles uphill discharge to a sink or floor drain.",
    whyNotCheaper:
      "30-pint units fail under typical Vermont basement load. They run constantly, fill the bucket twice a day, and burn out within 2-3 seasons. The 50-pint is the right size for most homes.",
    whyNotPremium:
      "Whole-house dehumidifiers integrate into HVAC and run quieter, but require pro install and are 5-8x the cost. For most Vermont basements, the 50-pint portable does the job.",
    contextNote:
      "Run with continuous drain to a floor drain or pump to a sink. Bucket-only operation is fine for testing but unsustainable for season-long use.",
    warnings: [
      "Don't use dehumidifier on a damp/wet floor without identifying the water source. The unit will mask drainage problems.",
      "Empty bucket weekly even on continuous drain mode (backup safety).",
    ],
    routeOutOfSmartCartIf: [
      {
        condition: 'visible_water_damage',
        destination: 'small_pro',
        reason:
          "Visible water damage is a foundation, drainage, or leak problem. A dehumidifier is the wrong solution. Get it diagnosed first.",
      },
    ],
    citations: [
      'hOmeLabs product documentation',
      'EPA basement moisture control guidance',
    ],
  },

  // ============================================================
  // SLOT 6: Opening tote (labeled bin)
  // ============================================================
  {
    slotId: 'opening_tote',
    slotLabel: 'Labeled "Spring Opening" supply tote',
    slotKind: 'core',
    conditionalOn: ['has_organized_supplies'],
    tiers: {
      sweet_spot: {
        productName: 'Sterilite 27-quart latching tote + label maker labels',
        priceLow: 22,
        priceHigh: 35,
        affiliateUrl:
          'https://www.amazon.com/s?k=sterilite+latching+tote+27+quart+labels&tag=alderprojects-20',
        productSpec:
          'Latching plastic tote, ~14"x18"x10". Holds opening kit consumables: water test, leak check, cleaning supplies, filter replacements, fresh batteries, light bulbs, dead-bulb spares. Label clearly on outside.',
      },
    },
    slotPurpose:
      "Centralize spring opening supplies so they're at the property, ready to use, without a Lowe's run on day one.",
    whyItMatters:
      "Driving to Lowe's during opening weekend costs 2-3 hours of weekend time. A pre-stocked tote at the property eliminates that trip.",
    whyThis:
      "Sterilite latching totes seal against critters and moisture. Labeled clearly so anyone (you, partner, property manager) finds it instantly.",
    contextNote:
      "Refill in the fall after closing — write a 'replenish list' in the tote so the next opening doesn't surprise you.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'basic_consumables',
      reason:
        "You're organized. The next-step gap is making sure consumables (batteries, bulbs, filters) are stocked, not just the tote being labeled.",
    },
    citations: ['Sterilite product line documentation'],
  },

  // ============================================================
  // SLOT 7: Basic consumables
  // ============================================================
  {
    slotId: 'opening_consumables',
    slotLabel: 'Basic consumables (batteries, bulbs, lighter)',
    slotKind: 'core',
    conditionalOn: ['has_consumables_stocked'],
    tiers: {
      sweet_spot: {
        productName: 'AA/AAA battery 24-pack + 6 LED bulbs + lighter + duct tape',
        priceLow: 35,
        priceHigh: 55,
        affiliateUrl:
          'https://www.amazon.com/s?k=aa+aaa+battery+pack+led+bulbs+duct+tape+lighter&tag=alderprojects-20',
        productSpec:
          '24-pack mixed AA/AAA batteries (Amazon Basics or Energizer). 6 LED bulbs (60W equivalent, soft white). Long-stem lighter. Roll of duct tape. Covers smoke detectors, remote controls, flashlights, light fixtures.',
      },
    },
    slotPurpose:
      "Have replacements on-hand for the supplies that always run out at the worst time.",
    whyItMatters:
      "A dead smoke detector battery on opening night is annoying. A dead smoke detector battery during a 2am alarm is a real problem. Stock replacements before you need them.",
    whyThis:
      "Mixed pack covers the most common battery sizes; LED bulbs are universal (60W eq is the standard residential). Lighter for grill, fireplace, candle. Duct tape for the inevitable problem.",
    whyNotCheaper:
      "There's no real cheaper version. Battery and bulb costs are what they are.",
    whyNotPremium:
      "Premium consumable kits add specialty bulbs and exotic batteries you don't need.",
    citations: ['Smoke detector battery replacement standards'],
  },

  // ============================================================
  // SLOT 8: Shutoff valve labels (cross-scope)
  // ============================================================
  {
    slotId: 'opening_shutoff_labels',
    slotLabel: 'Shutoff valve labels (if not already done)',
    slotKind: 'addon',
    conditionalOn: ['has_shutoff_labels'],
    tiers: {
      sweet_spot: {
        productName: 'Adhesive shutoff valve identification labels',
        priceLow: 8,
        priceHigh: 15,
        affiliateUrl:
          'https://www.amazon.com/s?k=plumbing+shutoff+valve+labels+adhesive&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_freeze_prevention slot — universe entry reused via additive tag merge.',
      },
    },
    slotPurpose:
      "Spring is a good time to refresh labels that may have peeled or faded over winter.",
    whyItMatters:
      "Same as freeze prevention — anyone in the house should be able to find shutoffs in an emergency.",
    whyThis:
      "If you already labeled in fall, this slot is skipped via state-probe. If you didn't, do it now.",
    contextNote:
      "This slot reuses the universe entry from outdoor_freeze_prevention via tag merge — same product, same Amazon listing, no duplication.",
    citations: [
      'Cross-scope universe reuse pattern (v7.2.4 architecture)',
    ],
  },
]

export const OUTDOOR_SEASONAL_OPENING_SKIP_LIST: SkipItem[] = [
  // ===== Type A =====
  {
    id: 'skip_filter_no_housing_check',
    type: 'wrong_version',
    title: 'Buying water filters before checking housing size',
    marketingPitch: 'Universal-fit replacement filter, works with all systems.',
    realReason:
      "Filters come in incompatible sizes — 10\", 4.5\"x10\", 4.5\"x20\", proprietary models. \"Universal\" is a marketing claim. The wrong size doesn't seal, water bypasses the filter, and you've wasted $30. Photograph and measure the housing first.",
    amountSaved: { low: 25, high: 45 },
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['Pentek and generic filter sizing guidance'],
  },
  {
    id: 'skip_fridge_filter_for_sediment',
    type: 'wrong_version',
    title: 'Fridge filters when the issue is whole-house sediment',
    marketingPitch: 'Convenient inline filter, replaces every 6 months.',
    realReason:
      "Fridge filters handle taste/smell at one fixture. They don't address whole-house sediment that's also affecting your shower and washing machine. If the issue is taste at the kitchen tap, the fridge filter is right. If it's sediment everywhere, you need whole-house filtration.",
    amountSaved: { low: 35, high: 60 },
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['Whole-house vs point-of-use filter selection guide'],
  },
  {
    id: 'skip_dehumidifier_water_source_unknown',
    type: 'wrong_version',
    title: 'Dehumidifier when the real issue is drainage or leaks',
    marketingPitch: 'Whole-basement humidity control.',
    realReason:
      "Dehumidifiers treat ambient moisture. They don't fix water sources. If your basement floods because of foundation drainage, the dehumidifier runs continuously, costs $50/month in electricity, and the floor still gets wet. Diagnose source first.",
    amountSaved: { low: 200, high: 320 },
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['EPA basement moisture diagnosis guidance'],
  },
  {
    id: 'skip_full_kit_when_only_consumables',
    type: 'wrong_version',
    title: 'Full cleaning kits when only consumables needed',
    marketingPitch: 'Complete spring cleaning starter set.',
    realReason:
      "If your second home already has buckets, mops, gloves, and basic supplies stored, the kit duplicates what you have. Buy consumables only — bleach, microfiber, multi-surface cleaner — and you've saved $30 plus you don't accumulate redundant gear.",
    amountSaved: { low: 25, high: 45 },
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['Cleaning supply per-item vs kit pricing'],
  },
  {
    id: 'skip_cheap_moisture_meter',
    type: 'wrong_version',
    title: 'Cheap moisture meters with poor usefulness',
    marketingPitch: '"Detects all moisture problems."',
    realReason:
      "$10-20 meters at the bottom of the price range have inconsistent readings and limited probe depth. They produce numbers that look authoritative but mislead diagnosis. If you need a moisture meter, the $40-60 General Tools or Klein meter is the right tier; below that is hobbyist quality with professional-looking output.",
    amountSaved: { low: 10, high: 25 },
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['Moisture meter accuracy testing'],
  },

  // ===== Type B =====
  {
    id: 'skip_outdoor_furniture_at_opening',
    type: 'wrong_category',
    title: 'Buying outdoor furniture during opening week',
    realReason:
      "Smart Cart's outdoor_lake_season covers furniture decisions properly. Spring opening should focus on water, leaks, cleaning, and filters — not new chairs. Furniture shopping during opening eats your weekend and gets you the wrong chairs (no time to compare). Defer to a separate decision.",
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['Sequential project planning principles'],
  },
  {
    id: 'skip_smart_lock_during_opening',
    type: 'wrong_category',
    title: 'Smart lock installation during spring opening',
    realReason:
      "Smart locks are great. Installation during your already-busy opening weekend is the wrong timing. Schedule it for a quieter weekend in May or June — the wrong-time lock costs more in frustration than it saves in convenience.",
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['Property setup project sequencing'],
  },
  {
    id: 'skip_lawn_mower_purchase_opening',
    type: 'wrong_category',
    title: 'Major lawn equipment purchases during opening week',
    realReason:
      "Same logic — mower, leaf blower, chainsaw decisions deserve their own research. During opening week you're triaging actual problems. Defer the large purchase decision to once the property is open and you can actually test what you need.",
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['Project sequencing and decision quality'],
  },
  {
    id: 'skip_rebadged_municipal_test',
    type: 'wrong_category',
    title: 'Buying lab tests for municipal water',
    realReason:
      "Municipal water systems test their water continuously and publish results. Vermont's reports are publicly available. A homeowner lab test on municipal water is duplicating work the utility already does. Save the money and read the utility's annual report.",
    appliesToScope: ['outdoor_seasonal_opening'],
    citations: ['EPA municipal water testing requirements'],
  },
]

export const OUTDOOR_SEASONAL_OPENING_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_organized_supplies', 'has_consumables_stocked', 'has_shutoff_labels'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
  absentee_owner: { selectedTier: 'sweet_spot', alreadyHave: [] },
}
