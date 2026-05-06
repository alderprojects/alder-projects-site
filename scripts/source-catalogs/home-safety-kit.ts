// scripts/source-catalogs/home-safety-kit.ts
// V7.2.5 — Seasonal home safety kit catalog

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const HOME_SAFETY_KIT_TOPIC = 'home_repair'
export const HOME_SAFETY_KIT_SCOPE = 'home_safety_kit'
export const HOME_SAFETY_KIT_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'absentee_owner',
]

export const HOME_SAFETY_KIT_METADATA = {
  smartCartPromise:
    'Cover the basics that are easy to forget when a home is used seasonally.',
  primaryCustomerPain:
    "Vermont second homes don't get daily checks. Smoke detectors with dead batteries, expired fire extinguishers, and missing flashlights all stay missing for months. The basics matter most when you're least able to address them — which is the moment you're at the property and discover the gap.",
  valueProposition:
    "$200-$400 of safety basics covers smoke/CO detection, fire response, first aid, lighting, and emergency power. Insurance carriers often offer premium discounts for working detectors and extinguishers.",
  routeOutRules: [
    {
      condition: 'has_active_fire_emergency',
      destination: 'small_pro',
      reason:
        "If there's an active fire, call 911. Smart Cart isn't relevant.",
    },
  ],
  seasonalUrgency: undefined, // Year-round
}

export const HOME_SAFETY_KIT_SLOTS: CartSlot[] = [
  {
    slotId: 'safety_fire_extinguisher',
    slotLabel: 'Fire extinguisher (multi-purpose)',
    slotKind: 'core',
    conditionalOn: ['has_extinguisher_current'],
    tiers: {
      budget: {
        productName: 'First Alert HOME1 1-A:10-B:C compliance extinguisher',
        priceLow: 25,
        priceHigh: 45,
        affiliateUrl:
          'https://www.amazon.com/s?k=first+alert+home1+1A10BC+fire+extinguisher&tag=alderprojects-20',
        productSpec:
          'Compliance-grade rechargeable fire extinguisher. UL rated 1-A:10-B:C. Meets minimum residential code. Single point in single location only.',
      },
      sweet_spot: {
        productName: 'First Alert PRO5 Heavy Duty Plus 3-A:40-B:C (single)',
        priceLow: 55,
        priceHigh: 85,
        amazonAsin: 'B000M2QR8U',
        affiliateUrl: 'https://www.amazon.com/dp/B000M2QR8U?tag=alderprojects-20',
        productSpec:
          'UL rated 3-A:40-B:C — exceeds minimum residential code. Heavy-duty all-metal construction with commercial-grade valve. Mounting bracket included. Color-coded gauge. Rechargeable by certified professionals after use. First Alert is the trusted home-safety brand.',
      },
      premium: {
        productName: 'Amerex B500 5-lb ABC Dry Chemical Fire Extinguisher 2-pack',
        priceLow: 145,
        priceHigh: 220,
        affiliateUrl:
          'https://www.amazon.com/s?k=amerex+b500+5+lb+abc+dry+chemical+fire+extinguisher+2+pack&tag=alderprojects-20',
        productSpec:
          'Pro-grade. UL rated 2-A:10-B:C. 5-lb dry chemical capacity, 12-18 ft range, 14-second discharge. Made in USA. Used by fire departments. 2-pack covers two zones (kitchen + garage typical).',
      },
    },
    slotPurpose:
      "Knock down small fires before they become large fires.",
    whyItMatters:
      "Most home fires start small. A working extinguisher within 10 seconds of the start can prevent total loss. Vermont rural fire response is slow — the closer the fire department, the faster help arrives, but you have minutes that matter.",
    commonMistake:
      "Buying the cheapest 1-A:10-B:C extinguisher and putting it in a hard-to-reach spot. The 3-A:40-B:C is bigger capacity for the same form factor; the visible mounting matters more than the cost.",
    whyThis:
      "First Alert PRO5 (FE3A40GR) exceeds residential code requirements with 3-A:40-B:C rating. Heavy-duty metal construction. Mountable. Rechargeable after use. ~$70 once for 12-year service life with annual checks.",
    whyNotCheaper:
      "Compliance extinguishers (1-A:10-B:C) meet minimum code but cover smaller fires. The PRO5 has 4x the B-class capacity for a small price difference.",
    whyNotPremium:
      "Amerex B500 is pro-grade for rural properties or where you want extra capacity. The PRO5 covers most residential needs at half the cost.",
    contextNote:
      "Mount one near the kitchen (most home fires start there). Add one near the garage for vehicles or workshop. Inspect annually — gauge in green = good, red = recharge or replace.",
    warnings: [
      'Read the label. Class A = wood/paper/fabric, Class B = flammable liquid (oil/gas), Class C = electrical. Most residential extinguishers are A:B:C — meaning they handle all three.',
      'Replace or recharge after any use, even partial discharge. Pressure drops permanently after release.',
      'Replace if gauge shows red, after any drop, or every 12 years.',
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'smoke_co_detector',
      reason:
        "You can fight small fires. Detection comes first — make sure smoke and CO detectors are current and tested.",
    },
    citations: [
      'First Alert PRO5 Amazon listing (B000M2QR8U)',
      'NFPA residential fire extinguisher guidance',
      'UL fire extinguisher rating standards',
    ],
  },
  {
    slotId: 'safety_smoke_co_detector',
    slotLabel: 'Smoke + CO detector (combo unit)',
    slotKind: 'core',
    conditionalOn: ['has_combo_detectors_current'],
    tiers: {
      budget: {
        productName: 'First Alert SCO5CN battery-powered smoke + CO detector (single)',
        priceLow: 25,
        priceHigh: 40,
        affiliateUrl:
          'https://www.amazon.com/s?k=first+alert+sco5cn+battery+smoke+carbon+monoxide&tag=alderprojects-20',
        productSpec:
          'Battery-powered (2 AA). Ionization smoke + electrochemical CO sensors. ~$30. Replace battery annually, replace unit every 5-7 years. Single zone.',
      },
      sweet_spot: {
        productName: 'First Alert 10-year sealed battery smoke + CO detectors (3-pack)',
        priceLow: 75,
        priceHigh: 120,
        affiliateUrl:
          'https://www.amazon.com/s?k=first+alert+10+year+sealed+battery+smoke+carbon+monoxide+3+pack&tag=alderprojects-20',
        productSpec:
          'Sealed 10-year lithium battery (no replacement needed). Smoke + CO combo. 3-pack covers most homes (one per floor + bedroom area). Replace entire unit at year 10. Industry shift to sealed-battery is the right call for absentee homes — no mid-winter dead battery chirps.',
      },
      premium: {
        productName: 'Google Nest Protect smart smoke + CO detector (3-pack)',
        priceLow: 280,
        priceHigh: 380,
        affiliateUrl:
          'https://www.amazon.com/s?k=google+nest+protect+smoke+carbon+monoxide+3+pack&tag=alderprojects-20',
        productSpec:
          'WiFi connected. Phone alerts when alarm triggers. Self-test every 200 seconds. ~10-year service life. Voice alerts (which room is on fire). Best for absentee homes where remote alerts matter.',
      },
    },
    slotPurpose:
      "Detect smoke and carbon monoxide before they cause harm.",
    whyItMatters:
      "Smoke detection in absentee homes only matters if you find out. A non-WiFi alarm in an empty house is theater. The 10-year sealed battery is the right baseline; smart alerts are the upgrade for properties with reliable WiFi.",
    commonMistake:
      "Smart smoke detectors at properties with unreliable WiFi. They lose connection silently and you don't know until you're at the property and see no app data. Either reliable WiFi + smart, OR sealed battery + non-smart. Don't buy smart for unreliable connectivity.",
    whyThis:
      "10-year sealed battery is the architectural shift. No annual battery replacement. No 3am chirps in a vacant house. After 10 years, replace the entire unit (testing tells you when). 3-pack covers most homes.",
    whyNotCheaper:
      "Annual-battery detectors are cheaper but require visits to replace. For absentee owners, the visit-required maintenance is the wrong shape. Sealed battery removes that.",
    whyNotPremium:
      "Nest Protect is the right call for properties with reliable WiFi where remote alert is essential. For properties with marginal connectivity, the sealed-battery non-smart is more reliable.",
    contextNote:
      "Place per code: at least one per floor, one in each bedroom area, one in the kitchen (10+ feet from stove). Ceiling mount or high-on-wall (within 12 inches of ceiling).",
    warnings: [
      "Test detectors monthly with the test button. Annual review for absentee homes.",
      "Replace entire unit at 10 years even if it still works. Sensor sensitivity degrades.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'first_aid_kit',
      reason:
        "Detection is in place. The next-step gap is response — first aid kit for the small injuries that don't require 911.",
    },
    citations: [
      'First Alert sealed-battery product line documentation',
      'NFPA smoke detector placement standards',
      'Nest Protect product specifications',
    ],
  },
  {
    slotId: 'safety_first_aid_kit',
    slotLabel: 'First aid kit (residential)',
    slotKind: 'core',
    conditionalOn: ['has_first_aid_kit_current'],
    tiers: {
      budget: {
        productName: 'Generic 100-piece first aid kit',
        priceLow: 22,
        priceHigh: 38,
        affiliateUrl:
          'https://www.amazon.com/s?k=first+aid+kit+100+piece+home&tag=alderprojects-20',
        productSpec:
          "100-piece assortment in plastic case. Adhesive bandages, gauze, antiseptic wipes, basic medications. Adequate for minor injuries. Many filler items (varied bandage sizes you don't use).",
      },
      sweet_spot: {
        productName: 'First Aid Only OSHA-Compliant 250-piece kit (50-person)',
        priceLow: 45,
        priceHigh: 75,
        affiliateUrl:
          'https://www.amazon.com/s?k=first+aid+only+osha+250+piece+50+person&tag=alderprojects-20',
        productSpec:
          'OSHA-compliant. 250+ pieces. ANSI standard supplies (real gauze, real bandage variety, eye wash, burn cream, CPR mask). First Aid Only is the workplace-safety standard. 50-person kit is right-sized for a household + guests.',
      },
      premium: {
        productName: 'My Medic The Medic emergency kit',
        priceLow: 130,
        priceHigh: 220,
        affiliateUrl:
          'https://www.amazon.com/s?k=my+medic+the+medic+emergency+first+aid+kit&tag=alderprojects-20',
        productSpec:
          'Modular emergency kit with trauma supplies (tourniquet, hemostatic gauze, chest seal). Includes EMT-grade items for serious injury response. Used by outdoor/wilderness families. Worth it for remote properties where EMS response is 30+ minutes.',
      },
    },
    slotPurpose:
      "First-line response for cuts, burns, sprains, and minor injuries that don't require professional help.",
    whyItMatters:
      "Vermont rural EMS response can be 20-45 minutes. The minor injury that needs care now (deep splinter, eye irritation, allergic reaction) waits for response without a kit. With a kit, most are handled at home.",
    commonMistake:
      "First aid kit buried in a closet or basement where it can't be found in an emergency. A buried kit is no kit.",
    whyThis:
      "First Aid Only is the OSHA workplace-safety standard. The 50-person kit has enough capacity for repeated use over years. Real ANSI-standard supplies, not novelty items.",
    whyNotCheaper:
      "100-piece kits are mostly bandage-variety filler. The first time you actually need real gauze, you find it doesn't have any.",
    whyNotPremium:
      "Trauma kits are for outdoor/remote applications. For typical residential use, the OSHA kit covers everything. If you have a specific trauma concern (boating, hunting, remote hiking), then yes — but that's a specific scenario.",
    contextNote:
      "Mount the kit visibly near the kitchen or main living area. Check expiration dates annually — many supplies expire in 2-5 years.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'flashlight_lantern',
      reason:
        "First aid is covered. The next-step gap is emergency lighting — power outages happen, and treating injuries in the dark is unsafe.",
    },
    citations: [
      'First Aid Only OSHA-compliant kit documentation',
      'ANSI first aid kit standards',
    ],
  },
  {
    slotId: 'safety_flashlight_lantern',
    slotLabel: 'Flashlights + LED lanterns (multi-zone)',
    slotKind: 'core',
    conditionalOn: ['has_emergency_lighting'],
    tiers: {
      budget: {
        productName: 'AAA-battery LED flashlight 4-pack',
        priceLow: 18,
        priceHigh: 32,
        affiliateUrl:
          'https://www.amazon.com/s?k=aaa+battery+led+flashlight+4+pack&tag=alderprojects-20',
        productSpec:
          '4 AAA-battery LED flashlights. ~$25. Place one in each bedroom and one in kitchen. Battery-replaceable (carry spare AAA in safety kit).',
      },
      sweet_spot: {
        productName: 'Coast LED flashlight 2-pack + Streamlight LED lantern',
        priceLow: 60,
        priceHigh: 95,
        affiliateUrl:
          'https://www.amazon.com/s?k=coast+led+flashlight+streamlight+lantern&tag=alderprojects-20',
        productSpec:
          'Coast HP1 LED flashlights (1 in bedroom, 1 in kitchen) + Streamlight Siege LED lantern for area lighting (3-mode: low/high/red). All battery-powered with replaceable batteries.',
      },
      premium: {
        productName: 'Goal Zero / Anker rechargeable lanterns + headlamps',
        priceLow: 165,
        priceHigh: 280,
        affiliateUrl:
          'https://www.amazon.com/s?k=goal+zero+rechargeable+lantern+anker+headlamp&tag=alderprojects-20',
        productSpec:
          'USB-rechargeable lanterns + headlamps. Solar-charge compatible. 50+ hour runtime. Used for camping, glamping. Worth the upgrade if you also use them for outdoor activities.',
      },
    },
    slotPurpose:
      "Lighting during power outages, emergency exits, and after-dark first aid response.",
    whyItMatters:
      "Vermont power outages from winter storms or summer thunderstorms are common. A flashlight you can find in the dark is the difference between safe navigation and falls.",
    commonMistake:
      "Decorative lanterns marketed as 'emergency lighting'. Battery-powered candles, oil lamps, etc. are aesthetic — battery life is short, output is low. Real LED flashlights and lanterns are 10x brighter at the same battery use.",
    whyThis:
      "Coast HP1 + Streamlight Siege combo is the verified-pick combination. Flashlight for navigation, lantern for area lighting. Both have replaceable batteries (AAA / D) so you can stock spares.",
    whyNotCheaper:
      "Cheap LED flashlights work but the LED quality varies. Coast and Streamlight are tested-spec LED flashlights with consistent output.",
    whyNotPremium:
      "Rechargeable systems are useful if you also camp or do power outage prep at scale. For typical residential emergency use, replaceable batteries are simpler.",
    contextNote:
      "Place one flashlight in each bedroom (someone needs to find it in the dark, half-asleep). Lantern goes in the kitchen or living area for general lighting during outages.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'emergency_power',
      reason:
        "Lighting is covered. The next-step gap is backup power for charging phones, running essential devices during longer outages.",
    },
    citations: [
      'Coast HP1 product documentation',
      'Streamlight Siege specifications',
    ],
  },
  {
    slotId: 'safety_emergency_power',
    slotLabel: 'Battery backup power station',
    slotKind: 'addon',
    conditionalOn: ['has_emergency_power'],
    tiers: {
      budget: {
        productName: 'Anker 521 PowerHouse 256Wh portable power station',
        priceLow: 165,
        priceHigh: 240,
        affiliateUrl:
          'https://www.amazon.com/s?k=anker+521+powerhouse+256wh&tag=alderprojects-20',
        productSpec:
          '256 Wh capacity. AC + USB outputs. Charges via wall outlet or solar panel. Adequate for charging phones, laptops, running CPAP for one night. ~$200.',
      },
      sweet_spot: {
        productName: 'Jackery Explorer 1000 (1002 Wh)',
        priceLow: 580,
        priceHigh: 850,
        affiliateUrl:
          'https://www.amazon.com/s?k=jackery+explorer+1000+1002+wh&tag=alderprojects-20',
        productSpec:
          '1002 Wh capacity. Multiple AC outlets, USB-C, USB-A. Powers fridge for 12+ hours, runs CPAP for 2 nights, charges phones for a week. Solar input. Industry-standard for residential backup. Jackery is the verified mid-tier brand.',
      },
      premium: {
        productName: 'EcoFlow DELTA 2 Max (2048 Wh) with expansion battery',
        priceLow: 1400,
        priceHigh: 2200,
        affiliateUrl:
          'https://www.amazon.com/s?k=ecoflow+delta+2+max+2048wh&tag=alderprojects-20',
        productSpec:
          '2048 Wh + expandable to 6kWh. Fast-charge via wall (30 min). Powers most home essentials (fridge, well pump, lighting) during multi-day outages. Premium tier.',
      },
    },
    slotPurpose:
      "Run essential devices during multi-hour or multi-day power outages.",
    whyItMatters:
      "Vermont winter storms can cause multi-day outages, especially in rural areas. A battery backup keeps phones charged (for emergency calls), preserves freezer food temporarily, and runs medical devices like CPAP.",
    commonMistake:
      "Oversizing for minimal need. A 2000+ Wh power station ($1,500+) for a household that just needs phone charging is overspend. The 256 Wh Anker is enough for most basic needs.",
    whyThis:
      "Jackery Explorer 1000 is the right size for typical residential backup. Powers a fridge for 12+ hours (preserves food), runs CPAP for 2 nights, charges every device in the house multiple times. Solar panel compatible for extended outages.",
    whyNotCheaper:
      "Anker 521 (256 Wh) is fine for very basic needs (phones only, short outages). For storms that last 24+ hours, the Jackery 1000 has the capacity to keep essentials running.",
    whyNotPremium:
      "EcoFlow DELTA 2 Max is for whole-house backup or off-grid scenarios. For typical Vermont power outages of 4-24 hours, the Jackery 1000 covers all critical needs.",
    contextNote:
      "Charge to 100%, then top off every 3 months. Battery degradation is real even when not used.",
    citations: [
      'Jackery Explorer 1000 product documentation',
      'Battery backup capacity sizing guidance',
    ],
  },
  {
    slotId: 'safety_emergency_docs',
    slotLabel: 'Emergency contact + utility documentation',
    slotKind: 'core',
    conditionalOn: ['has_emergency_docs'],
    tiers: {
      sweet_spot: {
        productName: 'Document holder + printed emergency info template',
        priceLow: 12,
        priceHigh: 25,
        affiliateUrl:
          'https://www.amazon.com/s?k=document+holder+wall+mount+emergency+info&tag=alderprojects-20',
        productSpec:
          'Wall-mounted clear acrylic document holder ($8-15). Printable emergency info template: insurance contacts, plumber/electrician/septic pro contacts, utility shutoff diagram, neighbor with key, fire/police/EMS, water test results, well info.',
      },
    },
    slotPurpose:
      "Centralize emergency information so anyone in the house — guest, contractor, neighbor — can act without having to dig.",
    whyItMatters:
      "When something goes wrong, the right contractor's number, the location of the water main, the propane company name — these are the things that take 5-10 minutes to find. In an emergency, that's an eternity. The wall-mounted sheet eliminates that friction.",
    whyThis:
      "Wall-mounted document holder near the utility area + a one-page printed emergency info sheet. Update annually. Total cost ~$20.",
    whyNotCheaper:
      "Phone notes work for you but no one else. The printed sheet works for guests, neighbors, contractors. For absentee homes, the printed copy is essential.",
    whyNotPremium:
      "Custom emergency info systems exist for $100+ — they don't add value over a printed sheet in a $10 holder.",
    contextNote:
      "Update annually. Phone numbers change, contractors retire, neighbor relationships shift. The most useful version is the current one.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'shutoff_labels',
      reason:
        "Information is centralized. The next-step gap is matching the document to the actual valves — labeled shutoffs (cross-scope reuse from outdoor_freeze_prevention).",
    },
    citations: [
      'Emergency preparedness documentation guidance',
    ],
  },
]

export const HOME_SAFETY_KIT_SKIP_LIST: SkipItem[] = [
  {
    id: 'skip_decorative_lanterns_emergency',
    type: 'wrong_version',
    title: 'Decorative lanterns marketed as emergency lighting',
    marketingPitch: 'Beautiful battery-powered "candle" lighting for emergencies.',
    realReason:
      "Decorative lanterns prioritize aesthetics over function. Battery life is short; LED output is dim. Real LED flashlights and lanterns are 10x brighter for the same battery cost. Aesthetic lighting and emergency lighting are different categories — buy the right tool for each.",
    amountSaved: { low: 15, high: 50 },
    appliesToScope: ['home_safety_kit'],
    citations: ['LED output testing residential vs decorative'],
  },
  {
    id: 'skip_smart_detectors_no_wifi',
    type: 'wrong_version',
    title: 'Smart detectors at properties with unreliable WiFi',
    marketingPitch: 'Get alerts on your phone when smoke is detected.',
    realReason:
      "Smart detectors only work when WiFi works. Vermont second homes with marginal connectivity lose detector connection silently. You think you have remote alerts; the detectors haven't been online for weeks. The 10-year sealed-battery non-smart is more reliable for unreliable connectivity.",
    amountSaved: { low: 200, high: 350 },
    appliesToScope: ['home_safety_kit'],
    citations: ['Smart detector connectivity reliability'],
  },
  {
    id: 'skip_expired_extinguishers',
    type: 'wrong_version',
    title: 'Extinguishers not checked annually or replaced at 12 years',
    marketingPitch: 'Lifetime fire extinguisher.',
    realReason:
      "Extinguisher pressure drops slowly over time. The gauge tells you the current state — green = good, red = recharge or replace. Untested extinguishers fail when needed. There's no 'lifetime' rating; certified service every 6 years and full replacement at 12 is the standard.",
    amountSaved: { low: 0, high: 0 },
    appliesToScope: ['home_safety_kit'],
    citations: ['NFPA fire extinguisher service standards'],
  },
  {
    id: 'skip_oversized_power_station',
    type: 'wrong_version',
    title: 'Oversized power stations for minimal need',
    marketingPitch: 'Power your whole home for days.',
    realReason:
      "2000+ Wh power stations at $1,500+ are for off-grid living or very long outages. For typical 4-24 hour Vermont outages, the 1000 Wh tier covers everything that matters. The bigger station is dead weight 99% of the time.",
    amountSaved: { low: 800, high: 1500 },
    appliesToScope: ['home_safety_kit'],
    citations: ['Battery backup capacity vs typical outage duration'],
  },
  {
    id: 'skip_first_aid_buried',
    type: 'wrong_version',
    title: 'First aid kit buried in basement closet',
    marketingPitch: '"Kit is in storage, ready when needed."',
    realReason:
      "A first aid kit you can't find in 30 seconds isn't a first aid kit. The injury happens; you have minutes; you don't know which closet. Mount or place visibly in the kitchen — the place injuries happen most often.",
    amountSaved: { low: 0, high: 0 },
    appliesToScope: ['home_safety_kit'],
    citations: ['Emergency response time analysis'],
  },
  {
    id: 'skip_unlabeled_emergency_info',
    type: 'wrong_category',
    title: 'Emergency info on phones only, no printed copy',
    realReason:
      "Phone-only documentation means a phone-charged household member is required for emergency response. In a power outage, your phone is dead. The printed sheet works for any household member, neighbor, or guest. Don't substitute digital for printed.",
    appliesToScope: ['home_safety_kit'],
    citations: ['Emergency preparedness redundancy'],
  },
  {
    id: 'skip_security_cameras_as_safety',
    type: 'wrong_category',
    // V7.2.5 paste 4 — original source had unescaped single quotes
    // around 'safety' inside the title, which broke the source-file
    // parse. Rewrote without the inner quotes.
    title: 'Security cameras marketed as safety upgrades',
    realReason:
      "Cameras are surveillance and deterrence — they don't extinguish fires or address medical emergencies. Different category. Don't substitute camera spend for actual safety basics.",
    appliesToScope: ['home_safety_kit'],
    citations: ['Safety vs security category distinction'],
  },
  {
    id: 'skip_panic_buttons_residential',
    type: 'wrong_category',
    title: 'Medical alert / panic button systems for non-elderly residents',
    realReason:
      "Panic buttons make sense for elderly residents living alone with health concerns. For typical residential use, a phone covers the same function. Don't add a $30/month subscription unless the specific need is real.",
    appliesToScope: ['home_safety_kit'],
    citations: ['Medical alert system applicability'],
  },
]

export const HOME_SAFETY_KIT_SCENARIO_DEFAULTS = {
  just_starting: { selectedTier: 'sweet_spot', alreadyHave: [] },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_extinguisher_current', 'has_combo_detectors_current'],
  },
  tight_budget: { selectedTier: 'budget', alreadyHave: [] },
  absentee_owner: {
    selectedTier: 'sweet_spot',
    alreadyHave: [],
    // Absentee owners benefit especially from emergency_docs (printed sheet
    // for property managers / neighbors with key) and emergency_power.
  },
}
