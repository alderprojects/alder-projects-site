import type { SeasonalGuideContent } from '../templates/seasonal-guide-template'

// Deep winter — Dec 15 through Feb 28. Vermont's heating bill
// peak. Smart thermostat optimization, ice dam mitigation,
// power outage preparedness. Interior renovation is the
// dominant project mode.

export const DEEP_WINTER_CONTENT: SeasonalGuideContent = {
  slug: 'deep-winter',
  season: 'deep_winter',
  metaTitle: "Vermont deep winter — heating bill optimization, ice dams, power outages",
  metaDescription: "Vermont's deep winter (Dec 15 - Feb 28) is the heating-bill test. Smart thermostat programming saves 15-25%. Ice dams, power outages, the projects to do indoors. Built for Vermont homeowners.",
  h1: "Vermont deep winter — your January electric bill is the case study.",

  leadParagraph: "Your heating bill in January is your smart-thermostat case study. Vermont averages 7,500-8,500 heating degree days, higher than 90% of US states. A properly programmed Ecobee with sensors saves most homeowners 15-25% off baseline. The hard part isn't the device — it's the programming. Most homeowners install a smart thermostat, accept the defaults, and capture half the available savings.",

  sections: [
    {
      h2: 'What deep winter actually is in Vermont',
      body: `Vermont's deep-winter window runs December 15 through February 28. The shape of it: short days (December solstice is 8 hours 50 minutes of daylight in Burlington), persistent below-freezing temperatures, accumulated snow load, and the year's heating-bill peak.

Average January temperatures range from 12-22°F across the state, with overnight lows below 0°F multiple times. Heating systems run continuously. The Vermont housing stock — much of it pre-1960 — is being asked to do its hardest work.

**Vermont-specific:** Vermont's 7,500-8,500 annual HDD compares to ~3,000 in coastal Massachusetts and ~5,500 in upstate New York. The math of any heating-system upgrade or weatherization investment runs faster here. A properly weatherized Vermont home in deep winter still costs more to heat than a national average home — but a well-optimized Vermont home costs significantly less than its unoptimized neighbors.`,
    },
    {
      h2: 'Smart thermostat programming that actually saves money',
      body: `The standard "install Ecobee, follow setup wizard" gets you maybe half the available savings. The other half is in setpoint scheduling and remote sensor placement.

Setpoint scheduling: most Vermont homeowners set 68°F daytime, 65°F overnight. The bigger win is wider setbacks: 70°F when occupied + active, 62°F when unoccupied or asleep. **Vermont-specific:** the heat pump's "low-temperature efficiency" is real but the energy cost of recovering from a 62°F setback in a Vermont January is still less than holding 68°F all night for most homes. Test both modes for a week each and compare your bills.

Remote sensors: a single thermostat reading the air in the hallway doesn't represent the cold side of the house. Add 2-3 remote sensors in the rooms that actually matter (bedroom, living room) and configure the thermostat to average them. **Trap:** the homeowner who installs the smart thermostat and skips the sensors. The thermostat happily heats the hallway to 68°F while the bedroom is 62°F at 5 AM. Sensors fix the gap.

**Worth knowing:** Ecobee's "smart recovery" feature pre-heats the home to hit setpoint at the schedule time, which saves money over reactive heating. Enable it and let it learn your home's thermal mass for 2-3 weeks before judging the schedule.`,
    },
    {
      h2: 'Ice dam mitigation',
      body: `Ice dams form when heat escapes through the roof, melts the snow on the upper roof, the meltwater runs down to the cold eave, and refreezes — creating a ridge of ice that backs up water under the shingles. Roof leaks in deep winter are usually ice dams, not roofing failures.

The fix is rarely on the roof. It's in the attic and ceiling: stop heat from escaping into the attic, and snow on the roof stays frozen. Specific moves: air-seal attic hatches, top plates, and bath/kitchen exhaust penetrations; verify R-49+ insulation across the attic floor; ensure soffit vents and ridge vents work (free-flow ventilation keeps the roof temperature even with the outside).

**Trap:** the homeowner who hires a roof crew to remove ice dams in January with steam. The fix is real but temporary — it's $400-1,000 per visit and the dam reforms within days because the underlying problem (heat leaking into the attic) hasn't been fixed.

**What to do:** during the active ice-dam crisis, pay for the steam removal to stop the leak ($400-1,000). After this winter, schedule attic air-sealing and insulation upgrades. EVT's 75% rebate (standard tier) makes the long-term fix affordable.`,
    },
    {
      h2: "Power outage preparedness",
      body: `Vermont sees 1-3 multi-day power outages per winter. The drivers: ice storms (worst), heavy wet snow on power lines, deep cold causing pole-mounted equipment to fail, and the occasional Quebec-derived windstorm.

Without backup heat, a Vermont home with no power in January cools at 1-2°F per hour depending on insulation. A 12-hour outage takes a 68°F home to 56°F or below. A 24-hour outage in -10°F overnight conditions can drop interior temperatures into the 30°F range — burst-pipe territory.

**Vermont-specific:** the right backup heat depends on your fuel base. If you have an oil furnace, the furnace runs on electricity (the burner motor + pump need power); even a stocked oil tank doesn't help during outage. A gasoline-fueled inverter generator (Honda EU2200i or similar, $1,000-1,500) can run the furnace circuit and keep the home above freezing. Add a manual transfer switch ($300-500 + electrician install) for safe wiring.

**Worth knowing:** propane vented heaters (Mr. Buddy Big Buddy, $130) are a stop-gap for short outages but require ventilation and don't replace whole-house heating. Best for keeping one room livable while the main system is offline.

**What to do:** inventory your outage preparedness. If you don't have either generator + manual transfer or a battery backup tied to your heat pump, plan for one before next winter.`,
    },
    {
      h2: 'The interior project window',
      body: `Deep winter is when interior projects shine. Crews aren't competing with exterior work; the EVT-network installers have spare capacity for interior weatherization (rim joists, basement insulation); kitchen and bath crews are at their most available.

Specific projects that work well in deep winter: kitchen remodel (full gut, mid-range, or refresh), bathroom remodel, basement finishing, interior paint, attic insulation, basement waterproofing (interior side), heat pump install (if scheduled before October).

**Vermont-specific:** the Vermont contractor schedule has its slowest stretch in late January through mid-February. Demand drops, crews get bored, and many will offer 10-15% discounts on interior projects scheduled for that window. **What to do:** if you're considering an interior project for spring or summer, asking the contractor whether they'd discount a January-February start can save real money.

**Trap:** assuming the discount means lower quality. The crews are the same; the discount reflects empty calendar slots, not corner-cutting. Verify the bid covers the same scope as their summer work.`,
    },
    {
      h2: 'Heat pump performance in deep winter',
      body: `Cold-climate heat pumps (NEEP-listed, the kind EVT rebates) operate efficiently down to -15°F. Below that, they continue to operate but efficiency drops. Vermont's coldest stretches push some systems past their efficient range — the system continues to heat but pulls more electricity per BTU delivered.

**Vermont-specific:** look at your January heat pump performance. If your monthly electric usage is 3,000+ kWh and your heat pump is the dominant load, you can compare to your home's pre-heat-pump heating cost (oil gallons × oil price) and verify the heat pump is winning. For most homes, even at -15°F days, heat pump heating costs less than oil heating in the same conditions. **Worth knowing:** the EVT $400 fuel-switching bonus is paid because of this — Vermont's policy goal is the conversion away from oil, and the heat pump math validates the policy.

**Trap:** the homeowner who panics during a cold snap when the heat pump runs continuously. Continuous operation in deep winter is expected and efficient — the alternative would be a backup electric resistance element, which costs significantly more to operate. If the heat pump is hitting setpoint, leave it alone.

**What to do:** track your January electric bill and compare against last year's January oil cost (or last year's electric bill if all-electric). If the comparison runs negative, contact the installer — there may be a system tuning issue. Most installers offer a 1-year tune-up included.`,
    },
    {
      h2: 'The deep-winter shopping list',
      body: `Vermont-specific items that pay for themselves multiple times over:

A roof rake ($60-100). Every Vermont homeowner needs one. Rake the lower 4-6 feet of roof after each significant snowfall to prevent ice dams. **Vermont-specific:** a $75 roof rake prevents the $5,000-15,000 roof leak that an ice dam can cause. Most return-on-investment ratio in this entire guide.

A pair of YakTrax or ice cleats ($30-50). Mid-December through March, Vermont walking surfaces are unpredictable. A slip-and-fall on ice is a real injury, not a minor annoyance. Cleats are mandatory for anyone walking the property in deep winter.

A second snow shovel for backup. The plastic blade snaps. Have a metal-edge backup. $25-40.

A 5-gallon bucket of ice melt (calcium chloride, not rock salt — calcium chloride works at -25°F, rock salt stops at +5°F). $30-40 for a winter's supply.

A battery-powered LED headlamp ($20-40). Vermont power outages happen at 6 PM in December, when daylight is already gone. A headlamp leaves your hands free to find candles, retrieve emergency supplies, or walk the basement to check on systems.

**Worth knowing:** Vermont's deep-winter hardware is mostly small items that prevent expensive problems. Stock by November 15, before the first significant snowfall.`,
    },
  ],

  faq: [
    {
      question: 'Why are my heating bills so high in January even with a heat pump?',
      answer: 'Continuous operation in -15°F conditions is expected — the heat pump is doing what it should. Compare to your historical oil cost in the same conditions; in most cases, the heat pump still wins financially. If your electric bill runs much higher than expected, contact the installer — there may be a tuning issue (refrigerant charge, defrost cycle, sizing).',
    },
    {
      question: 'How do I prevent ice dams without going on the roof?',
      answer: 'Ice dams are an attic-and-ceiling problem, not a roof problem. Air-seal attic hatches and ceiling penetrations, verify R-49+ insulation, ensure soffit and ridge ventilation work. Active dams: pay for steam removal ($400-1,000) to stop the immediate leak; schedule the long-term fix for the EVT-rebated weatherization next fall.',
    },
    {
      question: 'How long can my house last in a power outage in deep winter?',
      answer: "Without backup heat, 1-2°F drop per hour. A 12-hour outage takes 68°F to 56°F; a 24-hour outage with cold overnight can drop interior into burst-pipe range. A small inverter generator ($1,000-1,500) plus manual transfer switch keeps the heating system running. Worth investing before next winter if you don't have it.",
    },
    {
      question: 'What is the best time of year to remodel a Vermont kitchen?',
      answer: 'Late January through mid-February has the slowest Vermont contractor demand. The good crews are willing to discount 10-15% to fill calendar gaps. Asking the contractor whether a January-February start would qualify for a discount can save real money on a summer-or-fall project.',
    },
    {
      question: 'Should I lower my thermostat overnight to save money on a heat pump?',
      answer: "For most Vermont homes, yes — a 5-8°F setback (62-65°F overnight, 70°F when occupied) usually saves money even with the recovery cost. Test for a week vs. holding constant 68°F and compare your bills. The savings depend on your home's thermal mass and how cold the recovery period is.",
    },
  ],

  factIds: [
    'vt-heating-degree-days',
    'evt-ducted-heat-pump-rebate',
    'evt-fuel-switching-bonus',
    'evt-weatherization-standard-tier',
    'vt-cost-roof-asphalt',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'vermont-home-renovation-winter',
    'how-to-find-contractor-vermont',
    'vermont-renovation-permit-guide',
    'how-much-does-roof-replacement-cost-vermont',
  ],

  relatedTownSlugs: ['stowe-vt', 'burlington-vt', 'st-johnsbury-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
