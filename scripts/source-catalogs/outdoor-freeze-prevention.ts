// scripts/source-catalogs/outdoor-freeze-prevention.ts
// V7.2.5 — Source catalog in pre-ingestion shape (v7.2.2 format
// with embedded products). Ingestion tool splits to universe +
// scope catalog.

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CartSlot, SkipItemV2 as SkipItem } from '../../src/lib/smart-cart-model'

export const OUTDOOR_FREEZE_PREVENTION_TOPIC = 'outdoor'
export const OUTDOOR_FREEZE_PREVENTION_SCOPE = 'outdoor_freeze_prevention'
export const OUTDOOR_FREEZE_PREVENTION_SCENARIOS = [
  'just_starting',
  'already_have_basics',
  'tight_budget',
  'absentee_owner',
]

// V7.2.5 NEW METADATA — at the top of the source file so the
// ingestion tool can pick it up and write to the scope catalog.
export const OUTDOOR_FREEZE_PREVENTION_METADATA = {
  smartCartPromise:
    'Spend $100-$500 to reduce risk of frozen pipes, water damage, and emergency calls.',
  primaryCustomerPain:
    "A burst pipe in an unoccupied home can flood for days before anyone knows. Vermont second-home owners are the highest-risk segment.",
  valueProposition:
    "A $400 spend on detection and prevention can defer or avoid a $5,000-$25,000 water damage repair, plus eliminate the cost of an emergency plumber visit (which doesn't exist in rural Vermont in January anyway).",
  routeOutRules: [
    {
      condition: 'has_visible_water_damage',
      destination: 'small_pro',
      reason:
        'Active or recent water damage means the prevention window has already closed. Get the damage assessed by a plumber before adding sensors.',
    },
    {
      condition: 'has_unconditioned_crawlspace',
      destination: 'verify_first',
      reason:
        'Pipe insulation in an unconditioned crawlspace below 20°F is not enough on its own. You need either heated tape, a freeze alarm, or to drain the system. Get a verification visit first.',
    },
    {
      condition: 'planning_long_absence_no_wifi',
      destination: 'verify_first',
      reason:
        "Without reliable WiFi or cellular, smart sensors won't reach you. Consider draining the water system entirely, or installing a cellular hub before sensors.",
    },
  ],
  seasonalUrgency: {
    season: 'pre_winter',
    deadline: '11-01',
    label:
      "Best by November 1 — typical Vermont first hard freeze window. Ship times in October are 2-5 days; in late November they slip.",
  },
}

export const OUTDOOR_FREEZE_PREVENTION_SLOTS: CartSlot[] = [
  // ============================================================
  // SLOT 1: WiFi water leak sensor
  // ============================================================
  {
    slotId: 'freeze_leak_sensor',
    slotLabel: 'Water leak detector (WiFi or LoRa)',
    slotKind: 'core',
    conditionalOn: ['has_leak_detection'],
    tiers: {
      budget: {
        productName: 'Govee Water Leak Detector 5-Pack (audible only, no WiFi)',
        priceLow: 22,
        priceHigh: 32,
        amazonAsin: 'B07QSFRSJX',
        affiliateUrl: 'https://www.amazon.com/dp/B07QSFRSJX?tag=alderprojects-20',
        productSpec:
          'Audible-only 100dB alarm, no WiFi or remote alerts. Battery-powered. Useful only when someone is in the house to hear it.',
      },
      sweet_spot: {
        productName: 'Govee WiFi Water Leak Detector 3-Pack with Gateway (H5054)',
        priceLow: 45,
        priceHigh: 65,
        amazonAsin: 'B07J9HZ5VN',
        affiliateUrl: 'https://www.amazon.com/dp/B07J9HZ5VN?tag=alderprojects-20',
        productSpec:
          'WiFi gateway + 3 sensors. App and email alerts within seconds of leak. 100dB local siren. Gateway requires 2.4GHz WiFi only (not 5GHz). 5-year battery on sensors. Place at water heater, washing machine, under sinks, near sump pump.',
      },
      premium: {
        productName: 'YoLink Water Leak Starter Kit (Hub + 2 Leak Sensor 4)',
        priceLow: 80,
        priceHigh: 120,
        amazonAsin: 'B0DWWXJ4MY',
        affiliateUrl: 'https://www.amazon.com/dp/B0DWWXJ4MY?tag=alderprojects-20',
        productSpec:
          'LoRa long-range (1/4 mile open air). Works where WiFi is spotty. Hub options include cellular (no internet required). 105dB built-in siren on each sensor. Freeze warning in addition to leak. SMS, email, app alerts. Compatible with Alexa, IFTTT, Home Assistant. Best for properties with marginal WiFi or large outbuildings.',
      },
    },
    slotPurpose: 'Detect a leak within seconds, before it becomes a flood.',
    whyItMatters:
      'A pinhole leak in a copper pipe at 1 gallon per minute fills a finished basement in 12 hours. With detection, the same leak is a $50 plumber call. Without it, $15,000+ in damage and mold remediation.',
    commonMistake:
      'Buying audible-only alarms for an absentee property. If no one is there to hear the alarm, the alarm is theater.',
    whyThis:
      'Govee WiFi 3-pack covers the three highest-risk locations (water heater, washing machine, under-kitchen-sink) at the price of one good plumber visit. Setup is 15 minutes. The 5-year battery means you do not have to think about it again until 2031.',
    whyNotCheaper:
      'The audible-only Govee 5-pack is fine if you live in the house full-time and will hear the alarm. For a Vermont second home where you visit monthly, an audible alarm might run for 2 weeks before you hear it. The real product is detection that reaches your phone — that requires WiFi.',
    whyNotPremium:
      "YoLink LoRa is the right call IF (a) your WiFi is unreliable, (b) the property is large enough that sensors are far from the router, or (c) you want cellular fallback during power outages. For most Vermont second homes with decent WiFi, the Govee WiFi delivers 95% of the value at half the price.",
    contextNote:
      "Govee gateway only pairs with H5054 sensors. If you grow the system later, you must use the same generation. Confirm the bundled gateway and sensors match before opening.",
    warnings: [
      'Govee gateway requires 2.4GHz WiFi. Many newer routers default to 5GHz only or merge bands; you may need to enable a separate 2.4GHz network.',
      'Place sensors at floor level or in pans, not on countertops. Probes need direct water contact.',
      "Test the alert path (intentionally trigger a sensor) once a year. App notifications can silently break after firmware updates.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'smart_shutoff_valve',
      reason:
        'You already detect leaks. The next-step gap is automatic shutoff so the leak stops without you driving 2 hours to manually close the main valve.',
    },
    whenToSkip: [
      'Property has municipal water with auto-shutoff at the meter (rare in rural Vermont)',
      'Property is fully drained for winter (no water in pipes)',
    ],
    routeOutOfSmartCartIf: [
      {
        condition: 'has_visible_active_leak',
        destination: 'small_pro',
        reason:
          'Stop shopping. Call a plumber. Sensors are for prevention, not for diagnosing an active leak.',
      },
    ],
    citations: [
      'Govee H5054 + H5040 gateway product documentation',
      'YoLink LoRa product specs (1/4 mile open-air range)',
      'Insurance industry data on water damage as the most common non-weather homeowner claim',
    ],
  },

  // ============================================================
  // SLOT 2: Pipe insulation
  // ============================================================
  {
    slotId: 'freeze_pipe_insulation',
    slotLabel: 'Pipe insulation foam (6 ft tubes)',
    slotKind: 'core',
    conditionalOn: ['has_pipe_insulation', 'pipes_in_conditioned_space_only'],
    tiers: {
      budget: {
        productName: 'Frost King 1/2" copper foam pipe insulation, 6 ft (single)',
        priceLow: 4,
        priceHigh: 7,
        amazonAsin: 'B07XLQ5TPG',
        affiliateUrl: 'https://www.amazon.com/dp/B07XLQ5TPG?tag=alderprojects-20',
        productSpec:
          'Polyethylene foam, pre-slit, 6 ft length. For 1/2" copper pipe (which is 5/8" OD). Single tube. Slip on, no taping needed for short runs.',
      },
      sweet_spot: {
        productName: 'Frost King 3/4" copper foam pipe insulation, 3 ft 4-pack',
        priceLow: 12,
        priceHigh: 18,
        amazonAsin: 'B000BQLSBI',
        affiliateUrl: 'https://www.amazon.com/dp/B000BQLSBI?tag=alderprojects-20',
        productSpec:
          'Polyethylene foam, pre-slit, 3/8" wall thickness, 3 ft length × 4 tubes. For 3/4" copper or 1/2" iron pipe. Most common size for Vermont residential supply lines. Black color.',
      },
      premium: {
        productName: 'Frost King 1" rubber tubular pipe insulation, 6 ft',
        priceLow: 14,
        priceHigh: 22,
        amazonAsin: 'B003A0YX82',
        affiliateUrl: 'https://www.amazon.com/dp/B003A0YX82?tag=alderprojects-20',
        productSpec:
          'Closed-cell rubber, 1/2" wall thickness, 6 ft length. For 1" pipe ID. Higher R-value than polyethylene foam. Use on pipes in unconditioned spaces or where temperature drops below 20°F. More flexible at cold temperatures.',
      },
    },
    slotPurpose:
      'Slow heat loss on supply pipes so they take longer to reach freezing temperature.',
    whyItMatters:
      'Pipe insulation does not prevent freezing on its own. It buys hours of time before a pipe freezes. In a conditioned basement that briefly drops to 35°F during a power outage, insulation can mean the difference between cold pipes and burst pipes.',
    commonMistake:
      "Buying pipe insulation without measuring pipe diameter first. 1/2\" copper, 3/4\" copper, and 1\" iron pipe each take a different size sleeve. Wrong size means gaps.",
    whyThis:
      "Frost King 3/4\" 4-pack is the most common Vermont residential supply line size. Four 3-foot pieces covers ~12 feet of pipe — enough for the typical run from main shutoff to water heater plus exposed runs to outside hose bibs.",
    whyNotCheaper:
      'Single 6-foot tubes are fine for one pipe run. The 4-pack saves ~30% per foot if you have multiple runs, which most Vermont homes do.',
    whyNotPremium:
      "1\" rubber insulation is the right call for pipes in unconditioned crawlspaces or near outside walls. For pipes inside the conditioned basement envelope, the foam tubes are sufficient and easier to install. Save the rubber for the spots that actually need it.",
    contextNote:
      'Vermont frost line is approximately 48 inches in northern counties. Supply lines in unheated crawlspaces have higher freeze risk than those running through finished basements.',
    warnings: [
      "Measure pipe outer diameter (OD), not nominal. 1/2\" copper has a 5/8\" OD; the insulation sleeve must match the OD, not the nominal.",
      'Pipe insulation alone is not enough for unconditioned spaces below 20°F. You need heat tape too in those locations.',
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'pipe_freeze_alarm',
      reason:
        "Insulation slows freezing. A freeze alarm tells you when a pipe is approaching freezing temperature so you can act before the pipe bursts.",
    },
    whenToSkip: [
      'All supply pipes are inside conditioned, heated space and the heating system is reliable',
      'Property is fully winterized (drained) for the season',
    ],
    citations: [
      'Frost King Amazon listing (B000BQLSBI, B07XLQ5TPG, B003A0YX82)',
      'EPA pipe insulation guidance for cold-climate residential',
      'NFPA freeze prevention recommendations',
    ],
  },

  // ============================================================
  // SLOT 3: Heat tape (with thermostat)
  // ============================================================
  {
    slotId: 'freeze_heat_tape',
    slotLabel: 'Self-regulating heat tape with built-in thermostat',
    slotKind: 'core',
    conditionalOn: ['has_heat_tape', 'no_unconditioned_pipes'],
    tiers: {
      budget: {
        productName: 'Generic constant-wattage heat cable, 6 ft',
        priceLow: 18,
        priceHigh: 30,
        affiliateUrl:
          'https://www.amazon.com/s?k=heat+cable+6ft+constant+wattage&tag=alderprojects-20',
        productSpec:
          'Constant-wattage cable. Requires separate thermostat outlet to avoid running constantly. NOT recommended without a thermostat — fire risk.',
      },
      sweet_spot: {
        productName: 'Frost King 6 ft self-regulating heat cable with built-in thermostat',
        priceLow: 32,
        priceHigh: 48,
        affiliateUrl:
          'https://www.amazon.com/s?k=frost+king+self+regulating+heat+cable+thermostat+6ft&tag=alderprojects-20',
        productSpec:
          'Self-regulating cable adjusts wattage based on pipe temperature. Built-in thermostat turns on at 38°F, off at 50°F. UL listed. Plug-in (no hardwiring required). 6 ft covers a single run; longer cables available in 12, 24, and 50 ft.',
      },
      premium: {
        productName: 'EasyHeat or Pentair self-regulating heat cable kit with insulation',
        priceLow: 75,
        priceHigh: 130,
        affiliateUrl:
          'https://www.amazon.com/s?k=easyheat+self+regulating+pipe+heating+cable+kit&tag=alderprojects-20',
        productSpec:
          'Pro-grade self-regulating cable + matching pipe insulation sleeve. Higher watt density. Used by plumbers for permanent installations. Often hardwired.',
      },
    },
    slotPurpose:
      'Actively heat pipes in unconditioned spaces to prevent freezing during deep cold.',
    whyItMatters:
      'For pipes in unheated crawlspaces, attics, or runs along exterior walls, insulation alone is insufficient when ambient temperature drops below 15°F for sustained periods. Heat tape is the active prevention layer.',
    commonMistake:
      'Buying constant-wattage heat tape WITHOUT a thermostat. These cables run continuously when plugged in and are a documented fire-risk source. Always self-regulating, always with thermostat — no exception.',
    whyThis:
      "Frost King self-regulating cable adjusts output based on pipe temperature, eliminating the constant-on fire risk. Built-in thermostat means no separate outlet box. UL listed. The plug-in design lets you install without an electrician for a single pipe run.",
    whyNotCheaper:
      'Constant-wattage heat cables without thermostats are a known fire risk per the NFPA. The $15 savings is not worth the risk to a home you are not in to monitor.',
    whyNotPremium:
      'Pro-grade kits with hardwired installation are the right call for permanent solutions on long pipe runs (>20 ft) or where outlets are not available. For most single exposed pipe runs, the plug-in self-regulating cable does the same job.',
    contextNote:
      'Heat tape is layered ON TOP of pipe insulation, with insulation OUTSIDE. Bare pipe → heat tape spiraled on → insulation sleeve → done. Skipping the insulation step doubles the energy cost.',
    warnings: [
      'NEVER use heat tape without a thermostat. Constant-on heat tape is a documented fire risk.',
      'NEVER overlap heat tape on itself (creates hot spots).',
      'Inspect heat tape annually for cracks or damage. Replace immediately if damaged.',
      'Most heat tape is rated for 3-5 years of use. Plan for replacement.',
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'pipe_freeze_alarm',
      reason:
        'You have prevention. Add detection (a freeze alarm) so you know if the heat tape fails or the breaker trips.',
    },
    whenToSkip: [
      'No pipes run through unheated spaces (entirely in conditioned basement)',
      'Property is winterized (drained) and not in use during freeze risk',
      'Pipes are PEX (more freeze-tolerant than copper, though still freeze-vulnerable)',
    ],
    routeOutOfSmartCartIf: [
      {
        condition: 'permanent_install_long_run',
        destination: 'small_pro',
        reason:
          "For permanent installations on pipe runs longer than 20 feet, or where the cable needs to be hardwired, hire a plumber or electrician. Heat tape is fire-risk if installed incorrectly.",
      },
    ],
    citations: [
      'NFPA fire risk documentation on heat tape',
      'Frost King product line documentation',
      'Pentair / Raychem self-regulating heat cable specifications',
    ],
  },

  // ============================================================
  // SLOT 4: Smart thermostat
  // ============================================================
  {
    slotId: 'freeze_smart_thermostat',
    slotLabel: 'Smart thermostat with remote temperature alerts',
    slotKind: 'core',
    conditionalOn: ['has_smart_thermostat', 'incompatible_hvac_system'],
    tiers: {
      budget: {
        productName: 'Honeywell Home Programmable Thermostat (non-smart)',
        priceLow: 30,
        priceHigh: 50,
        affiliateUrl:
          'https://www.amazon.com/s?k=honeywell+home+programmable+thermostat&tag=alderprojects-20',
        productSpec:
          '7-day programmable. No WiFi, no remote control, no temperature alerts. Useful for setting a vacation hold, but you cannot check temp remotely or adjust if heat fails.',
      },
      sweet_spot: {
        productName: 'Honeywell Home T9 Smart Thermostat with WiFi',
        priceLow: 130,
        priceHigh: 200,
        affiliateUrl:
          'https://www.amazon.com/s?k=honeywell+home+t9+smart+thermostat&tag=alderprojects-20',
        productSpec:
          'WiFi connected, app-controlled, geofencing. Works with most C-wire-equipped systems. Sends alerts if home temperature drops below set threshold. Compatible with most 24V residential HVAC systems including heat pumps, gas furnaces, and many oil/propane systems. Verify compatibility with your system before buying.',
      },
      premium: {
        productName: 'Ecobee Smart Thermostat Premium with sensors',
        priceLow: 230,
        priceHigh: 290,
        affiliateUrl:
          'https://www.amazon.com/s?k=ecobee+smart+thermostat+premium&tag=alderprojects-20',
        productSpec:
          'WiFi, voice control, room sensors included. Air quality monitoring, smoke detection alerts. Best for multi-zone homes or properties wanting whole-house intelligence beyond freeze prevention.',
      },
    },
    slotPurpose:
      "Maintain a minimum temperature setpoint when away, and alert you if the house starts cooling unexpectedly.",
    whyItMatters:
      "Without remote alerts, the first sign of a heat failure in an absentee home is often a frozen pipe. A smart thermostat that tells you the house is at 38°F and dropping is a $150 spend that can prevent a $15,000 repair.",
    commonMistake:
      "Buying a smart thermostat without verifying HVAC compatibility. Some Vermont second homes have older oil systems, propane heaters, or zoned hydronic systems that don't work with modern smart thermostats — or work but lose features. Check compatibility BEFORE buying.",
    whyThis:
      "Honeywell T9 has the broadest HVAC compatibility in the smart-thermostat category and the alert system is reliable. The geofencing automatically holds a higher minimum when you're not home but you're driving toward the property. App-based override is essential for Vermont second-home owners.",
    whyNotCheaper:
      "Non-smart programmable thermostats are fine if you live in the house full-time and will see the temperature display daily. For a property visited monthly, you cannot react to a problem you cannot see.",
    whyNotPremium:
      "Ecobee Premium adds room sensors and voice control. Both useful in a primary residence with multiple zones. For a single-zone Vermont second home where the question is just 'is the heat working?', the Honeywell T9 answers that question for $80 less.",
    contextNote:
      "Set the away minimum no lower than 50°F for properties with water in pipes. 50°F gives ~6 hours of buffer before pipes reach freeze risk if heat fails. Lower setpoints save energy but reduce the buffer window for response.",
    warnings: [
      "Verify HVAC compatibility before buying. Honeywell and Ecobee both publish compatibility checkers.",
      "C-wire required for most smart thermostats. If your existing thermostat uses only 2 wires, you may need an electrician to add a C-wire.",
      "WiFi outage = no alerts. Pair with a freeze alarm that has cellular backup if reliability is critical.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'leak_detector',
      reason:
        "Smart thermostat tells you the heat is working. A leak detector tells you whether the pipes are still intact. Together they cover the two most common failure modes.",
    },
    whenToSkip: [
      'HVAC system incompatible with smart thermostats (verified)',
      'No reliable WiFi at the property',
    ],
    routeOutOfSmartCartIf: [
      {
        condition: 'incompatible_hvac_system',
        destination: 'verify_first',
        reason:
          "Smart thermostats require specific HVAC wiring. Verify compatibility first via the manufacturer's compatibility tool. If incompatible, route to a different solution like a freeze alarm.",
      },
    ],
    citations: [
      'Honeywell Home T9 product documentation',
      'Ecobee Premium product documentation',
      'Vermont residential heating systems compatibility data',
    ],
  },

  // ============================================================
  // SLOT 5: Hose bib cover
  // ============================================================
  {
    slotId: 'freeze_hose_bib_cover',
    slotLabel: 'Outdoor hose bib (faucet) cover',
    slotKind: 'core',
    conditionalOn: ['has_hose_bib_covers', 'no_outdoor_hose_bibs'],
    tiers: {
      budget: {
        productName: 'Foam hose bib cover (single)',
        priceLow: 3,
        priceHigh: 6,
        affiliateUrl:
          'https://www.amazon.com/s?k=foam+hose+bib+cover+outdoor+faucet&tag=alderprojects-20',
        productSpec:
          'Closed-cell foam, slip-on. Single bib. ~$3 each. Useful for moderate climates or short cold snaps. Less effective below 15°F.',
      },
      sweet_spot: {
        productName: 'Frost King insulated thermal hose bib cover (2-pack)',
        priceLow: 10,
        priceHigh: 18,
        affiliateUrl:
          'https://www.amazon.com/s?k=frost+king+thermal+hose+bib+cover&tag=alderprojects-20',
        productSpec:
          'Hard plastic shell with foam interior. Strap or stake mount. Effective to ~10°F. 2-pack covers most homes.',
      },
      premium: {
        productName: 'Frost-proof outdoor faucet replacement (sillcock, 12")',
        priceLow: 35,
        priceHigh: 65,
        affiliateUrl:
          'https://www.amazon.com/s?k=frost+proof+outdoor+faucet+sillcock+12+inch&tag=alderprojects-20',
        productSpec:
          'Permanent solution: replaces the faucet entirely with a frost-proof sillcock that has the shutoff valve inside the heated wall. Requires plumbing skill or pro install. Permanent fix vs. seasonal cover.',
      },
    },
    slotPurpose:
      'Insulate the outdoor faucet to prevent water in the bib from freezing and pushing back into the supply line.',
    whyItMatters:
      "An outdoor faucet that freezes can crack the supply line behind the wall, causing the leak to appear inside the house when temperatures rise. The cover does not freeze-proof — it slows freezing and gives you time to drain the bib.",
    commonMistake:
      "Leaving covers off a hose bib that has water in the supply line. Even with a cover, you should disconnect the hose and shut off the supply valve inside before freezing weather.",
    whyThis:
      "Frost King thermal cover works in real Vermont conditions (down to ~10°F) with the supply shut off and bib drained. The 2-pack covers front and back yard bibs in one purchase. Hard shell prevents critter damage that foam covers don't.",
    whyNotCheaper:
      'Foam covers fail below 15°F and are easily torn off by wind or critters. They are appropriate for moderate climates, not Vermont winters.',
    whyNotPremium:
      "A frost-proof sillcock is the permanent solution and worth doing on next renovation. For an existing home in October, the cover is the right tactical move; the sillcock replacement is a spring project.",
    contextNote:
      "ALWAYS shut off and drain the outdoor faucet before installing the cover. The cover insulates; it does not heat. Water in the bib will still freeze if temperatures stay below 20°F for sustained periods.",
    warnings: [
      "Disconnect garden hoses before winter. Hoses left connected trap water in the bib that cannot drain, defeating the cover.",
      "Some older sillcocks have an inside shutoff with a separate drain plug. Find both before assuming the bib is drained.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'shutoff_labels',
      reason:
        "You have hose bibs covered. The next-step gap is labeling all shutoffs (water main, water heater, individual bib supply valves) so anyone in the house during an emergency knows where to turn things off.",
    },
    whenToSkip: [
      'No outdoor hose bibs',
      'Property has frost-proof sillcocks installed (modern construction)',
      'Property is fully winterized (water shut off at main)',
    ],
    citations: [
      'Frost King hose bib cover documentation',
      'Vermont residential plumbing freeze data',
    ],
  },

  // ============================================================
  // SLOT 6: Draft sealing kit
  // ============================================================
  {
    slotId: 'freeze_draft_sealing',
    slotLabel: 'Door and window draft sealing kit',
    slotKind: 'addon',
    conditionalOn: ['has_weatherstripping_recent', 'has_no_drafts'],
    tiers: {
      budget: {
        productName: 'Generic foam weatherstripping tape, 17 ft',
        priceLow: 5,
        priceHigh: 10,
        affiliateUrl:
          'https://www.amazon.com/s?k=foam+weatherstripping+tape+door+window&tag=alderprojects-20',
        productSpec:
          'Foam compression tape with adhesive backing. 17-30 ft roll. Compresses under door/window. Effective for 1-2 seasons before degradation.',
      },
      sweet_spot: {
        productName: 'Frost King V-strip + door sweep + draft stoppers kit',
        priceLow: 25,
        priceHigh: 40,
        affiliateUrl:
          'https://www.amazon.com/s?k=frost+king+v+strip+door+sweep+draft+stopper&tag=alderprojects-20',
        productSpec:
          'V-shaped vinyl weatherstripping for door jambs (longer-lasting than foam). Door sweep for under-door gap. Foam draft stoppers for window sills. Covers a typical 3-door, 8-window Vermont home.',
      },
      premium: {
        productName: 'Door silicone bulb weatherstripping + storm windows assessment',
        priceLow: 80,
        priceHigh: 150,
        affiliateUrl:
          'https://www.amazon.com/s?k=silicone+bulb+door+weatherstripping&tag=alderprojects-20',
        productSpec:
          'Silicone bulb seal for doors (premium durability). For windows, the premium answer is replacement or storm windows, not weatherstripping — at this point you should be looking at the next renovation.',
      },
    },
    slotPurpose:
      "Reduce cold air infiltration so the heating system isn't fighting drafts and the freeze-vulnerable spots stay warmer.",
    whyItMatters:
      "Drafts increase heating cost and create cold pockets near pipes in exterior walls. Even modest weatherstripping reduces freeze risk and saves 5-15% on heating cost.",
    commonMistake:
      "Foam weatherstripping on door jambs that get heavy use. The foam compresses permanently within 1-2 seasons and stops sealing. V-strip vinyl lasts 5-10 years.",
    whyThis:
      "Kit includes V-strip (lasts longer than foam) plus door sweep plus window sill draft stoppers — the three highest-leverage draft sources in a typical Vermont home.",
    whyNotCheaper:
      "Foam weatherstripping is fine for windows that don't open often. For doors used daily, the foam compresses within months. The kit's V-strip is the right material for high-use locations.",
    whyNotPremium:
      "Silicone bulb seal is the gold standard but installation is more demanding. For a typical seasonal-home homeowner, the V-strip kit covers 90% of draft sources at half the price.",
    citations: [
      'M-D Building Products and Frost King weatherstripping product lines',
      'DOE residential weatherstripping guidance',
    ],
  },

  // ============================================================
  // SLOT 7: Shutoff labels
  // ============================================================
  {
    slotId: 'freeze_shutoff_labels',
    slotLabel: 'Utility shutoff labeling kit',
    slotKind: 'core',
    conditionalOn: ['has_shutoff_labels'],
    tiers: {
      sweet_spot: {
        productName: 'Adhesive shutoff valve identification labels (assortment)',
        priceLow: 8,
        priceHigh: 15,
        affiliateUrl:
          'https://www.amazon.com/s?k=plumbing+shutoff+valve+labels+adhesive&tag=alderprojects-20',
        productSpec:
          'Pre-printed adhesive labels for water main, hot water, cold water, gas, individual fixture shutoffs. Weather-resistant. ~30 labels per pack.',
      },
    },
    slotPurpose:
      "Make it possible for anyone in the house — guest, contractor, neighbor — to find and operate critical shutoffs in an emergency.",
    whyItMatters:
      "When a pipe bursts at 2am, the first 5 minutes of finding the right valve makes the difference between $200 and $5,000 of damage. Unlabeled valves cost time you don't have.",
    whyThis:
      "An $8 spend that pays back the first time anyone needs to shut off water and isn't sure which valve to turn. Especially valuable for absentee homes where a neighbor or property manager may need to act on your behalf.",
    whyNotCheaper:
      "Hand-written tags work but fade and fall off. Adhesive printed labels last 5+ years.",
    whyNotPremium:
      "Engraved brass tags exist for $3-5 each but the value beyond plastic adhesive labels is minimal.",
    contextNote:
      "Pair this with a printed shutoff diagram taped near the main panel showing each labeled valve's location. The labels are useless if no one can find the basement utility room.",
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'emergency_docs',
      reason:
        "Labels are in place. The next-step gap is a printed emergency contact sheet — plumber, electrician, neighbor with key, insurance — kept near the labels.",
    },
    citations: [
      'NFPA fire and safety labeling standards',
      'Insurance industry water damage minimization guidance',
    ],
  },

  // ============================================================
  // SLOT 8: Smart shutoff valve (premium)
  // ============================================================
  {
    slotId: 'freeze_smart_shutoff_valve',
    slotLabel: 'Automatic water shutoff valve',
    slotKind: 'addon',
    conditionalOn: ['has_smart_shutoff', 'water_already_drained'],
    tiers: {
      sweet_spot: {
        productName: 'Moen Flo Smart Water Shutoff (3/4")',
        priceLow: 380,
        priceHigh: 530,
        affiliateUrl:
          'https://www.amazon.com/s?k=moen+flo+smart+water+shutoff+3+4&tag=alderprojects-20',
        productSpec:
          'WiFi-connected automatic shutoff valve installed at the main supply line. Detects abnormal flow patterns and shuts off water automatically. Manual control via app. Requires professional plumber install (1-3 hours, ~$200-400 labor).',
      },
      premium: {
        productName: 'YoLink Smart Water Shutoff Valve with LoRa hub',
        priceLow: 250,
        priceHigh: 400,
        affiliateUrl:
          'https://www.amazon.com/s?k=yolink+smart+water+shutoff+valve&tag=alderprojects-20',
        productSpec:
          "LoRa-based shutoff valve. Works without WiFi via cellular hub option. Pairs with YoLink leak sensors for automatic shutoff on leak detection. Better for properties with marginal WiFi.",
      },
    },
    slotPurpose:
      "Automatically shut off the water supply when a leak is detected, without requiring you to be present.",
    whyItMatters:
      "Detection alone tells you a leak happened. Automatic shutoff stops the leak. For a property visited monthly, this is the difference between a 2-hour leak and a 30-day leak.",
    commonMistake:
      "Buying a smart shutoff valve and installing it yourself without plumbing experience. These valves go on the main supply line. A botched install is a worse leak than the one you're trying to prevent.",
    whyThis:
      "Moen Flo is the verified residential auto-shutoff. Pairs with leak sensors, learns your home's normal water-use patterns, and shuts off on anomaly. ~$500 installed for the valve plus pro install. Real insurance discount qualifying — many insurers offer 5-15% premium reduction.",
    whyNotCheaper:
      "There is no real cheaper tier. Either you have leak detection that requires you to act, or you have automatic shutoff that acts for you. Half-measures here are not useful.",
    whyNotPremium:
      "YoLink is a strong alternative if your WiFi is unreliable or you already have YoLink leak sensors. For most Vermont second homes with reasonable WiFi, Moen Flo is the better-supported option.",
    contextNote:
      "Almost always requires professional plumber install. Budget $200-400 for labor in addition to the device cost. Verify with your insurance carrier whether installation qualifies for premium discount BEFORE buying.",
    warnings: [
      "Professional plumber install is the right call. DIY install on a main supply line is a real risk.",
      "Verify your home's water main valve is accessible and can be shut off easily before scheduling install.",
    ],
    routeOutOfSmartCartIf: [
      {
        condition: 'water_already_drained',
        destination: 'verify_first',
        reason:
          "If you've already drained the water system for winter, an auto-shutoff valve is unnecessary until spring opening. Reconsider in April.",
      },
      {
        condition: 'no_main_shutoff_access',
        destination: 'small_pro',
        reason:
          "If your home's main shutoff is buried, frozen, or inaccessible, fix that problem first via a plumber visit. Adding a smart shutoff to an inaccessible main line creates new failure modes.",
      },
    ],
    citations: [
      'Moen Flo product documentation',
      'YoLink smart water shutoff specifications',
      'Insurance industry data on auto-shutoff premium discounts',
    ],
  },

  // ============================================================
  // SLOT 9: Freeze alarm (non-WiFi backup)
  // ============================================================
  {
    slotId: 'freeze_alarm_non_wifi',
    slotLabel: 'Cellular or phone-line freeze alarm (no WiFi)',
    slotKind: 'addon',
    conditionalOn: ['has_freeze_alarm', 'has_reliable_wifi'],
    tiers: {
      sweet_spot: {
        productName: 'Marcell or Temp Stick cellular temperature monitor',
        priceLow: 130,
        priceHigh: 220,
        affiliateUrl:
          'https://www.amazon.com/s?k=marcell+cellular+temperature+monitor&tag=alderprojects-20',
        productSpec:
          'Cellular-connected temperature monitor with built-in SIM. No WiFi required. Sends alert when temperature drops below threshold. Subscription required for cellular service ($5-12/month).',
      },
    },
    slotPurpose:
      "Get freeze alerts on properties without reliable WiFi.",
    whyItMatters:
      "Many rural Vermont second homes have unreliable or no WiFi. WiFi-dependent sensors fail silently when the router reboots or the ISP drops. A cellular freeze alarm has independent connectivity.",
    commonMistake:
      "Relying on WiFi sensors at a property where you've personally experienced WiFi outages. If you've ever lost internet at the cabin, your sensors will lose internet too — at the worst possible moment.",
    whyThis:
      "For homes without WiFi, this is the only category of freeze monitoring that actually works. Subscription cost ($60-150/year) is real, but it's the difference between getting an alert and not getting an alert.",
    whyNotCheaper:
      "There is no real cheaper option for cellular monitoring. The hardware is bundled with the subscription model.",
    whyNotPremium:
      "Higher-tier monitoring services exist (with multiple sensors, redundant alerts, professional monitoring) for $300-500/year. Worth considering for very high-value properties or art/wine collection storage.",
    contextNote:
      "Subscription is mandatory for cellular service. Budget $5-12/month ongoing in addition to hardware cost. Some services offer 1-year prepay discounts.",
    warnings: [
      "Subscription must be renewed. A lapsed subscription means a silent sensor.",
      "Cellular signal must be checkable at the property before purchase. Some Vermont valleys have no cellular coverage either.",
    ],
    nextBestIfAlreadyHave: {
      targetSlotOrFunction: 'leak_detector',
      reason:
        "You have temperature monitoring. The next-step gap is leak detection. Heat working is necessary but not sufficient — pipes can still leak from other causes.",
    },
    citations: [
      'Marcell and Temp Stick product documentation',
      'Cellular monitoring service comparisons',
    ],
  },
]

export const OUTDOOR_FREEZE_PREVENTION_SKIP_LIST: SkipItem[] = [
  // ===== Type A: Wrong version =====
  {
    id: 'skip_constant_wattage_heat_tape',
    type: 'wrong_version',
    title: 'Constant-wattage heat tape without thermostat',
    marketingPitch: 'Cheaper heat cable, just plug it in.',
    realReason:
      "Documented fire risk per the NFPA. Constant-wattage cables run continuously when plugged in and have started home fires when overheated under insulation. Always self-regulating, always with a thermostat — no exceptions. The $15 saved is not worth a house fire risk in a property you're not present to monitor.",
    amountSaved: { low: 15, high: 25 },
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['NFPA fire risk documentation on heat cables'],
  },
  {
    id: 'skip_audible_only_alarms_for_absentee',
    type: 'wrong_version',
    title: 'Audible-only leak alarms for an absentee property',
    marketingPitch: '100dB alarm — loud enough to hear from anywhere in the house.',
    realReason:
      "If no one is in the house to hear it, the alarm is theater. For a Vermont second home visited monthly, an audible-only alarm running continuously for 2 weeks before discovery does no good. The $40 saved by skipping WiFi is the wrong save — this is precisely the slot where WiFi matters.",
    amountSaved: { low: 30, high: 45 },
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Govee H5054 product documentation'],
  },
  {
    id: 'skip_smart_thermostat_no_compatibility_check',
    type: 'wrong_version',
    title: 'Smart thermostat without verifying HVAC compatibility',
    marketingPitch: 'Universal compatibility, works with any system.',
    realReason:
      "Smart thermostats fail to install or lose features on many older Vermont heating systems (oil boilers, hydronic baseboards, propane heaters with proprietary controls). The $150 thermostat that won't work is more expensive than the $30 programmable that does. Verify with the manufacturer's compatibility tool before buying.",
    amountSaved: { low: 100, high: 180 },
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Honeywell Home and Ecobee compatibility checker tools'],
  },
  {
    id: 'skip_thin_pipe_insulation_unconditioned',
    type: 'wrong_version',
    title: '3/8" wall foam insulation in unconditioned crawlspaces',
    marketingPitch: 'Standard pipe insulation for any application.',
    realReason:
      'Thin foam insulation is for pipes in conditioned space (R-value ~3). In an unheated crawlspace at 0°F, the foam buys minutes, not hours. Use 1/2" wall rubber insulation (R-value ~5) plus heat tape for unconditioned spaces. The $5 saved is meaningless if the pipe still freezes.',
    amountSaved: { low: 5, high: 12 },
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Frost King product line documentation by application'],
  },
  {
    id: 'skip_foam_hose_bib_cover_vermont',
    type: 'wrong_version',
    title: 'Foam hose bib covers in Vermont',
    marketingPitch: 'Slip-on foam cover, easy install.',
    realReason:
      'Foam covers fail below 15°F and are easily torn off by wind or critters. Effective for moderate climates. In Vermont winters with sustained cold and wildlife pressure, the hard-shell thermal cover is the right tier. The $5 saved makes the cover worse than no cover.',
    amountSaved: { low: 5, high: 10 },
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Cold-climate hose bib cover testing'],
  },

  // ===== Type B: Wrong category =====
  {
    id: 'skip_propane_heater_winterization',
    type: 'wrong_category',
    title: 'Propane patio heaters marketed as winterization',
    realReason:
      "Propane patio heaters are outdoor seasonal heaters for entertaining. They are not freeze prevention. They cannot be safely operated indoors (CO risk), and outdoors they don't address pipe freezing inside the house. Skip.",
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['CDC carbon monoxide guidance for indoor propane use'],
  },
  {
    id: 'skip_pipe_heating_alone_for_unconditioned',
    type: 'wrong_category',
    title: 'Pipe insulation alone for pipes in unconditioned crawlspaces',
    realReason:
      'Insulation slows freezing; it does not prevent it. For a crawlspace below 20°F for sustained periods, pipe insulation buys hours, not days. You need heat tape WITH insulation, not insulation as a standalone solution. Buying insulation for an unconditioned space and stopping there is a partial solution that fails on the worst nights.',
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Pipe insulation R-value testing in cold climates'],
  },
  {
    id: 'skip_smart_lighting_as_security',
    type: 'wrong_category',
    title: 'Smart lighting marketed as "occupied appearance" for absentee homes',
    realReason:
      "Marketed as security/freeze-prevention bundle. Smart lighting that turns on lights doesn't prevent freezing or detect leaks. Spend the $200 on actual freeze prevention — leak sensors, smart thermostat, freeze alarm — not on lights that look like someone is home.",
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Insurance industry data on absentee home loss prevention'],
  },
  {
    id: 'skip_universal_pipe_insulation_kit',
    type: 'wrong_category',
    title: 'Pre-bundled "complete pipe insulation kit" with multiple sizes',
    realReason:
      "Kits include sizes you don't need (1/4\", 5/8\", 1.25\") for $50+. Most homes have one or two pipe sizes — typically 1/2\" or 3/4\" copper. Buy the right size in bulk for $20. The kit's convenience pricing is real but you're paying for foam tubes you'll throw away.",
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Per-size vs kit pricing analysis'],
  },
  {
    id: 'skip_decorative_pipe_covers',
    type: 'wrong_category',
    title: 'Decorative wood or plastic pipe covers',
    realReason:
      "Marketed for finished basements as visual concealment of pipe runs. They have R-value near zero. If your goal is freeze prevention, the decorative cover does nothing. If your goal is aesthetics, do the foam insulation underneath the decorative cover — but don't substitute one for the other.",
    appliesToScope: ['outdoor_freeze_prevention'],
    citations: ['Pipe insulation vs cosmetic cover R-value comparison'],
  },
]

export const OUTDOOR_FREEZE_PREVENTION_SCENARIO_DEFAULTS = {
  just_starting: {
    selectedTier: 'sweet_spot',
    alreadyHave: [],
  },
  already_have_basics: {
    selectedTier: 'sweet_spot',
    alreadyHave: ['has_pipe_insulation', 'has_shutoff_labels'],
  },
  tight_budget: {
    selectedTier: 'budget',
    alreadyHave: [],
  },
  absentee_owner: {
    selectedTier: 'sweet_spot',
    alreadyHave: [],
    // Absentee owners get the leak sensor, smart thermostat, and freeze
    // alarm prioritized. Heat tape and insulation are baseline. Hose bib
    // and draft sealing are addons. Smart shutoff valve is the key add.
  },
}
