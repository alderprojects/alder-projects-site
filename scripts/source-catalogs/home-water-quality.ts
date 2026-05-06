// scripts/source-catalogs/home-water-quality.ts
// V7.2.5 — Water quality + filtration catalog

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const HOME_WATER_QUALITY_TOPIC = 'home_repair'
export const HOME_WATER_QUALITY_SCOPE = 'home_water_quality'
export const HOME_WATER_QUALITY_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'absentee_owner',
]

export const HOME_WATER_QUALITY_METADATA = {
  smartCartPromise:
    'Test before treating. Avoid buying the wrong filter for the wrong water problem.',
  primaryCustomerPain:
    "Vermont rural homes are mostly on private wells. Water quality varies by region (arsenic in some areas, radon-in-water in others, manganese, iron, hardness everywhere). Buying a filter system without testing first means you almost always solve the wrong problem.",
  valueProposition:
    "A $165 lab test plus the right targeted filter system ($75-$250) replaces a $2,500 whole-house treatment system that addressed the wrong contaminant. Test first, treat right.",
  routeOutRules: [
    {
      condition: 'has_bacteria_positive_test',
      destination: 'small_pro',
      reason:
        "Positive bacteria test (E. coli, total coliform) requires shock chlorination of the well, then UV treatment or chlorine injection. This is well-pump pro work, not Smart Cart.",
    },
    {
      condition: 'has_arsenic_above_mcl',
      destination: 'small_pro',
      reason:
        "Arsenic above the EPA MCL of 10 ppb requires specific reverse osmosis or adsorption media — sized to your usage and tested for breakthrough. Pro consultation, not a $50 pitcher filter.",
    },
    {
      condition: 'has_radon_in_water_high',
      destination: 'small_pro',
      reason:
        "Radon in water above ~4,000 pCi/L typically requires aeration treatment — engineered system, not point-of-use. Vermont DEC has a regional radon program; consult them first.",
    },
  ],
  seasonalUrgency: undefined, // Year-round; spring opening peaks testing demand
}

export const HOME_WATER_QUALITY_SLOTS: CartSlot[] = [
  {
    slotId: 'water_basic_test_strips',
    slotLabel: 'Basic test strips (screening only)',
    slotKind: 'core',
    conditionalOn: ['has_recent_lab_test'],
    tiers: {
      sweet_spot: {
        productName: 'Watersafe All-in-One basic test strips',
        priceLow: 12,
        priceHigh: 22,
        affiliateUrl:
          'https://www.amazon.com/s?k=watersafe+all+in+one+test+kit&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge. Quick-dip strips for chlorine, hardness, lead, pesticides, bacteria screen, nitrates. Screening only.',
      },
    },
    slotPurpose:
      "Quick at-home screen for major contaminant categories. NOT a substitute for lab analysis on bacteria or trace metals.",
    whyItMatters:
      "Strips give a fast read on whether anything obvious is wrong — high hardness, chlorine in well water (shouldn't be), nitrate spike. Useful as a baseline before deciding whether to spend on a lab test.",
    whyThis:
      "Watersafe is the consumer standard. Cross-scope reuse from outdoor_seasonal_opening.",
    whyNotCheaper:
      "Cheaper strips are pH-only or hardness-only. The Watersafe all-in-one is the right balance.",
    whyNotPremium:
      "There's no premium tier in strip-format. The premium answer is the lab test, not a fancier strip.",
    contextNote:
      "Strips are screening only. They are not reliable for bacteria detection, low-concentration metals, or radon. Positive screen → confirm with lab; negative screen → still get an annual lab test for the things strips can't see.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'lab_water_test',
      reason:
        "Strips screen for the obvious. The lab test catches the things strips miss — bacteria, low-level metals, radon-in-water.",
    },
    citations: [
      'Cross-scope universe reuse pattern',
      'Watersafe product documentation',
      'EPA private well testing guidance',
    ],
  },
  {
    slotId: 'water_lab_test',
    slotLabel: 'Mail-in lab water test (well water panel)',
    slotKind: 'core',
    conditionalOn: ['has_recent_lab_test', 'on_municipal_water'],
    tiers: {
      sweet_spot: {
        productName: 'Tap Score by SimpleLab — Essential Well Water mail-in lab test',
        priceLow: 165,
        priceHigh: 195,
        affiliateUrl:
          'https://www.amazon.com/s?k=tap+score+simplelab+well+water+test&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge. 50+ contaminants including bacteria, lead, arsenic, radon-in-water, nitrates, hardness, pH.',
      },
      premium: {
        productName: 'Tap Score Advanced Well Water test (95+ analytes)',
        priceLow: 280,
        priceHigh: 360,
        affiliateUrl:
          'https://www.amazon.com/s?k=tap+score+advanced+well+water&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge. Comprehensive panel for new property purchase or known contamination.',
      },
    },
    slotPurpose:
      "Test for what's actually in your water before deciding what to filter.",
    whyItMatters:
      "Filters target specific contaminants. A sediment filter doesn't remove arsenic; an arsenic filter doesn't remove bacteria. Without a lab test, you're guessing — and the guess is usually wrong.",
    commonMistake:
      "Buying a 'whole-house water treatment system' before testing. These systems range from $1,500-$5,000 installed. They might solve your problem or they might solve the wrong one. Test first.",
    whyThis:
      "Tap Score Essential covers Vermont-specific concerns (radon, arsenic, manganese, bacteria, hardness) at a price comparable to one bottled-water case. Cross-scope reuse from outdoor_seasonal_opening.",
    contextNote:
      "Vermont DEC publishes regional water quality data. Check your county's public data first to see what's likely. Then use the lab test to confirm for your specific well.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'sediment_filter',
      reason:
        "You have current test results. Build the right filter system based on what the test showed — sediment filter for silt, carbon for chlorine/taste, RO for arsenic, etc.",
    },
    citations: [
      'Cross-scope universe reuse pattern',
      'Tap Score by SimpleLab documentation',
      'Vermont DEC water quality regional data',
    ],
  },
  {
    slotId: 'water_bacteria_test',
    slotLabel: 'Bacteria-specific test kit',
    slotKind: 'addon',
    conditionalOn: ['has_recent_bacteria_test'],
    tiers: {
      sweet_spot: {
        productName: 'Coliform/E. coli well water bacteria test kit',
        priceLow: 28,
        priceHigh: 45,
        affiliateUrl:
          'https://www.amazon.com/s?k=coliform+e+coli+well+water+bacteria+test+kit&tag=alderprojects-20',
        productSpec:
          'Mail-in or 48-hour incubation kit for total coliform and E. coli detection. Useful as standalone bacteria test between full lab panels (annual full + every 6 months bacteria).',
      },
    },
    slotPurpose:
      "Stand-alone bacteria test between annual full panels.",
    whyItMatters:
      "Vermont DEC recommends annual bacteria testing for private wells and every 5 years for chemistry. The bacteria test is the higher-frequency check; the full panel is the deeper check.",
    whyThis:
      "Mail-in or incubation bacteria-only kits are cheaper than full panels and let you test more often. Run after well work, after flood events, or anytime taste changes.",
    whyNotCheaper:
      "Free state-laboratory testing exists in some counties. Check Vermont Department of Health first; if a free test is available, use it.",
    whyNotPremium:
      "Bacteria testing is binary: present or not. Premium versions offer faster turnaround but no different result quality.",
    contextNote:
      "Test bacteria after any well work, lightning strike near the well, flooding, or unusual taste/smell change. Don't wait for an annual cycle if conditions changed.",
    routeOutOfSmartCartIf: [
      {
        condition: 'has_bacteria_positive_test',
        destination: 'small_pro',
        reason:
          "Positive bacteria test means shock chlorination of the well + retest, or installing UV/chlorine treatment. Well-pump pro work.",
      },
    ],
    citations: ['Vermont DEC private well bacteria testing guidance'],
  },
  {
    slotId: 'water_sediment_filter',
    slotLabel: 'Whole-house sediment filter',
    slotKind: 'core',
    conditionalOn: ['has_sediment_filter'],
    tiers: {
      budget: {
        productName: 'Generic 10" sediment filter (5-micron, single)',
        priceLow: 6,
        priceHigh: 12,
        affiliateUrl:
          'https://www.amazon.com/s?k=10+inch+sediment+filter+5+micron&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge.',
      },
      sweet_spot: {
        productName: 'Pentek 10" sediment + carbon block 2-pack',
        priceLow: 28,
        priceHigh: 45,
        affiliateUrl:
          'https://www.amazon.com/s?k=pentek+sediment+carbon+block+10+inch&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge.',
      },
      premium: {
        productName: 'Big Blue 4.5" x 20" filter housing + premium media',
        priceLow: 95,
        priceHigh: 160,
        affiliateUrl:
          'https://www.amazon.com/s?k=big+blue+water+filter+housing+4.5+20&tag=alderprojects-20',
        productSpec:
          'Same product as outdoor_seasonal_opening — universe entry reused via additive tag merge.',
      },
    },
    slotPurpose:
      "Remove silt, rust, and visible particulates from incoming water.",
    whyItMatters:
      "Sediment shortens the life of every downstream fixture. Even if your water is clean of contaminants, sediment damages valves, water heaters, washing machine pumps, and any point-of-use filter.",
    whyThis:
      "Cross-scope reuse from outdoor_seasonal_opening. Pentek 2-pack (sediment + carbon) is the right tier for typical Vermont well water.",
    contextNote:
      "Sediment filter is the foundation. Add carbon for taste/chlorine, RO for trace metals or arsenic, UV for bacteria. Always start with sediment — it protects everything downstream.",
    citations: ['Cross-scope universe reuse pattern', 'Pentek product documentation'],
  },
  {
    slotId: 'water_fridge_filter',
    slotLabel: 'Refrigerator water filter (point-of-use)',
    slotKind: 'addon',
    conditionalOn: ['has_fridge_filter_compatible'],
    tiers: {
      budget: {
        productName: 'Generic-brand fridge filter compatible with major brands',
        priceLow: 12,
        priceHigh: 25,
        affiliateUrl:
          'https://www.amazon.com/s?k=refrigerator+water+filter+compatible+samsung+lg+whirlpool&tag=alderprojects-20',
        productSpec:
          'Aftermarket fridge filter compatible with Samsung, LG, Whirlpool, and other brand-specific filter housings. Carbon-based filtration. ~50% cost of OEM.',
      },
      sweet_spot: {
        productName: 'OEM fridge filter (Samsung HAF-CIN, LG LT700P, etc.)',
        priceLow: 35,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=samsung+haf+cin+lg+lt700p+oem+refrigerator+filter&tag=alderprojects-20',
        productSpec:
          'Original-equipment filter from your refrigerator manufacturer. NSF-certified for the specific contaminants the filter is designed to remove. Tested fit with no leaks. 6-month replacement cycle.',
      },
    },
    slotPurpose:
      "Final taste/odor polish at the kitchen tap. Useful even with whole-house filtration.",
    whyItMatters:
      "Fridge filters target taste and odor at the point of consumption. They are a luxury add-on if whole-house filtration is in place; they are essential if there's no whole-house filter and the issue is taste only.",
    commonMistake:
      "Buying generic universal fridge filters. Many have poor fit and bypass water around the filter, defeating the entire point. Either OEM or use a verified-compatible brand (e.g., Aqua Crest with documented fit testing).",
    whyThis:
      "OEM filters fit reliably and meet NSF certifications. Generic 'compatible' filters are a real coin flip on fit and quality.",
    whyNotCheaper:
      "Generic filters at 50% the price are tempting. Reviews show ~30% report fit issues or leaking. The OEM premium buys reliability.",
    whyNotPremium:
      "Premium 'lifetime' filters don't exist for this category — all are 6-month consumables.",
    contextNote:
      "Replace every 6 months even if water still tastes fine. Carbon filters lose effectiveness on a time basis, not a usage basis. The filter housing date stamp matters more than the visible cleanliness.",
    citations: ['NSF certification standards for refrigerator filters'],
  },
  {
    slotId: 'water_drinking_filter',
    slotLabel: 'Drinking water filter (pitcher or under-sink)',
    slotKind: 'core',
    conditionalOn: ['has_drinking_water_filter'],
    tiers: {
      budget: {
        productName: 'Brita Standard 10-cup pitcher with filter',
        priceLow: 25,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=brita+standard+10+cup+pitcher&tag=alderprojects-20',
        productSpec:
          'Brita pitcher with standard activated carbon filter. NSF certified for chlorine, taste, odor, mercury, copper, zinc. Does NOT remove lead, arsenic, or bacteria. 40-gallon filter life.',
      },
      sweet_spot: {
        productName: 'ZeroWater 10-cup pitcher with TDS meter',
        priceLow: 38,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=zerowater+10+cup+pitcher+tds+meter&tag=alderprojects-20',
        productSpec:
          '5-stage ion exchange + activated carbon. Certified to reduce lead, chromium, mercury, fluoride, plus all the items Brita addresses. TDS meter included shows when filter is exhausted. 20-30 gallon filter life (shorter than Brita due to deeper filtration).',
      },
      premium: {
        productName: 'Aquasana AQ-5300+ 3-stage under-sink filter system',
        priceLow: 130,
        priceHigh: 195,
        affiliateUrl:
          'https://www.amazon.com/s?k=aquasana+aq+5300+under+sink+filter+3+stage&tag=alderprojects-20',
        productSpec:
          'Under-sink installation with dedicated faucet. 3-stage filtration. NSF certified for 77 contaminants including lead, asbestos, chlorine, chloramines, and more. 600-gallon filter life. Installation requires basic plumbing.',
      },
    },
    slotPurpose:
      "Drinking water that tastes right and removes the contaminants you actually have.",
    whyItMatters:
      "Brita is fine for taste/chlorine. ZeroWater handles taste plus reduces lead and other heavy metals. Aquasana is the under-sink system for households drinking 10+ gallons/week. Match the filter to your test results, not your shopping list.",
    commonMistake:
      "Pitcher filter when the issue is sediment or arsenic. Pitchers don't address either. Sediment kills the filter cartridge faster; arsenic isn't removed by activated carbon. Read your test results first.",
    whyThis:
      "ZeroWater is the verified upgrade over Brita for households concerned about lead or heavy metals. The included TDS meter is the actual differentiator — you see when the filter is exhausted.",
    whyNotCheaper:
      "Brita Standard works but doesn't address heavy metals. If your test shows any concern, ZeroWater is the right tier.",
    whyNotPremium:
      "Aquasana under-sink is the right call for high-volume households or for filtering directly from the tap. Pitcher solutions cap at ~3 gallons/day reasonably; under-sink scales unlimited.",
    citations: [
      'NSF certification standards for drinking water pitchers',
      'ZeroWater contaminant reduction documentation',
      'Aquasana AQ-5300+ specifications',
    ],
  },
  {
    slotId: 'water_filter_wrench',
    slotLabel: 'Filter housing wrench + spare O-ring',
    slotKind: 'addon',
    conditionalOn: ['has_filter_wrench'],
    tiers: {
      sweet_spot: {
        productName: 'Standard 10" filter housing wrench + spare O-ring kit',
        priceLow: 12,
        priceHigh: 22,
        affiliateUrl:
          'https://www.amazon.com/s?k=10+inch+filter+housing+wrench+o+ring&tag=alderprojects-20',
        productSpec:
          'Plastic wrench sized for standard 10" filter housings + 2 spare O-rings + silicone grease packet. ~$15. The O-rings are the failure point — they go bad before the housing.',
      },
    },
    slotPurpose:
      "Open the filter housing without breaking it, with replacement O-rings on hand.",
    whyItMatters:
      "Filter housings tighten over time. Without the wrench, you can't get them off. Without spare O-rings, when the original O-ring fails (and they always do), you're driving to the hardware store with water dripping.",
    whyThis:
      "$15 prevents 30-60 minutes of frustration plus a hardware store run. The silicone grease keeps O-rings supple — apply at every filter change.",
    whyNotCheaper:
      "Generic wrenches without spare O-rings save $5; you need the O-rings anyway.",
    whyNotPremium:
      "There's no premium tier for this product category.",
    contextNote:
      "Apply silicone grease (provided) to the O-ring at every filter change. Dry O-rings tear; greased ones last 5+ replacement cycles.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'pressure_gauge',
      reason:
        "You can service filter housings. The next-step gap is monitoring pressure — a gauge tells you when a filter is clogged before flow drops noticeably.",
    },
    citations: ['Filter housing maintenance guidance'],
  },
  {
    slotId: 'water_pressure_gauge',
    slotLabel: 'Water pressure gauge (hose-bib mount)',
    slotKind: 'addon',
    conditionalOn: ['has_pressure_gauge'],
    tiers: {
      sweet_spot: {
        productName: 'Hose-bib mount water pressure gauge (0-200 PSI)',
        priceLow: 10,
        priceHigh: 18,
        affiliateUrl:
          'https://www.amazon.com/s?k=hose+bib+water+pressure+gauge&tag=alderprojects-20',
        productSpec:
          '3/4" garden-hose-thread fitting. 0-200 PSI dial gauge. Screw onto any hose bib for instant pressure read. Lasts 10+ years.',
      },
    },
    slotPurpose:
      "Check incoming water pressure to diagnose system issues.",
    whyItMatters:
      "Low water pressure can mean clogged filter, failing pressure tank, or supply issue. The $12 gauge tells you which problem you have. Without it you're guessing.",
    whyThis:
      "Hose-bib gauge is the cheapest reliable diagnostic tool in plumbing. Screw it on, read the number, you know if pressure is in spec (40-80 PSI normal) or out.",
    whyNotCheaper:
      "Sub-$8 gauges are unreliable. The $12 mid-range gauge lasts a decade.",
    whyNotPremium:
      "Continuous-monitoring smart pressure sensors exist. For occasional diagnostic use, the analog gauge is right-sized.",
    contextNote:
      "Read pressure both before and after filters. A 20+ PSI drop across a filter means it's clogged.",
    citations: ['Water pressure diagnosis guidance'],
  },
]

export const HOME_WATER_QUALITY_SKIP_LIST: SkipItem[] = [
  {
    id: 'skip_filter_no_test_first',
    type: 'wrong_version',
    title: 'Buying filter system before water testing',
    marketingPitch: 'Comprehensive whole-house water treatment.',
    realReason:
      "Filters target specific contaminants. A $2,500 system that addresses chlorine when your real problem is arsenic doesn't fix arsenic. Test first, then size and select the system. The lab test ($165) is the highest-leverage spend in this entire scope.",
    amountSaved: { low: 1500, high: 4500 },
    appliesToScope: ['home_water_quality'],
    citations: ['EPA water treatment selection guidance'],
  },
  {
    id: 'skip_pitcher_for_sediment',
    type: 'wrong_version',
    title: 'Pitcher filter when the issue is sediment',
    marketingPitch: 'Convenient counter-top water filtration.',
    realReason:
      "Pitcher filters address taste, chlorine, some metals. They don't address sediment — sediment clogs the pitcher filter within weeks instead of months and provides no real protection. If you have visible particulates, install a whole-house sediment filter; the pitcher is downstream.",
    amountSaved: { low: 25, high: 60 },
    appliesToScope: ['home_water_quality'],
    citations: ['Filter type vs contaminant matching'],
  },
  {
    id: 'skip_under_sink_ro_no_test',
    type: 'wrong_version',
    title: 'Under-sink reverse osmosis (RO) before water test',
    marketingPitch: '99% pure drinking water.',
    realReason:
      "RO removes nearly everything — including beneficial minerals. It's the right answer if you have arsenic, fluoride, or specific metals to address. It's expensive overkill ($300-$600 + filter replacement costs) if your test shows only chlorine taste. Test first.",
    amountSaved: { low: 200, high: 500 },
    appliesToScope: ['home_water_quality'],
    citations: ['RO system contaminant matching'],
  },
  {
    id: 'skip_universal_fridge_filter',
    type: 'wrong_version',
    title: '"Universal" generic fridge filters',
    marketingPitch: 'Compatible with all refrigerators, half the price of OEM.',
    realReason:
      "30%+ of generic 'universal' fridge filters report fit issues. Water bypasses around the filter, you get unfiltered water, and you don't know it. Either OEM or use a verified-compatible brand (Aqua Crest with documented fit testing).",
    amountSaved: { low: 15, high: 30 },
    appliesToScope: ['home_water_quality'],
    citations: ['Fridge filter compatibility data'],
  },
  {
    id: 'skip_taste_as_safety',
    type: 'wrong_version',
    title: 'Treating water taste as a safety indicator',
    marketingPitch: '"Tastes great, must be safe."',
    realReason:
      "Water that tastes fine can have invisible bacteria, lead, arsenic, or radon. Water that tastes bad can be perfectly safe but contain harmless chlorine. Taste is not a safety signal. Annual lab testing is the safety check.",
    amountSaved: { low: 0, high: 0 },
    appliesToScope: ['home_water_quality'],
    citations: ['EPA private well safety guidance'],
  },
  {
    id: 'skip_municipal_water_lab_test',
    type: 'wrong_category',
    title: 'Lab tests for municipal water',
    realReason:
      "Municipal water systems test continuously and publish results. Vermont's annual reports are publicly available. Homeowner lab tests on municipal water duplicate work the utility already does. Read the utility's annual Consumer Confidence Report; save the $165.",
    appliesToScope: ['home_water_quality'],
    citations: ['EPA municipal water testing requirements'],
  },
  {
    id: 'skip_water_softener_no_hardness',
    type: 'wrong_category',
    title: 'Water softener without hardness test',
    realReason:
      "Softeners address hardness — calcium and magnesium. They don't help with bacteria, metals, sediment, taste. Vermont well hardness varies widely by region; some areas have soft water that doesn't need softening. Test hardness; only buy a softener if test shows it's actually needed.",
    appliesToScope: ['home_water_quality'],
    citations: ['Water softener applicability'],
  },
  {
    id: 'skip_alkaline_water_devices',
    type: 'wrong_category',
    title: 'Alkaline / "ionized" / "structured" water devices',
    realReason:
      "$300-$3,000 devices that claim to alter water at the molecular level for health benefits. The peer-reviewed evidence does not support the health claims. Skip in favor of lab-tested filtration that addresses real contaminants.",
    appliesToScope: ['home_water_quality'],
    citations: ['Peer-reviewed alkaline water health-claim analysis'],
  },
]

export const HOME_WATER_QUALITY_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_recent_lab_test', 'has_sediment_filter'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
  absentee_owner: { selectedTier: 'sweet_spot', alreadyHave: [] },
}
