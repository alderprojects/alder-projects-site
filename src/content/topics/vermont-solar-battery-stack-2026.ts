import type { TopicGuideContent } from '../templates/topic-guide-template'

// Solar + battery stack — federal 25D 30% + EVT solar+storage
// + Vermont net metering Group 2 + utility adders. The
// out-of-state cost calculators don't capture Vermont's stack.

export const VERMONT_SOLAR_BATTERY_STACK_2026_CONTENT: TopicGuideContent = {
  slug: 'vermont-solar-battery-stack-2026',
  topicId: 'solar_battery',
  metaTitle: 'Vermont solar + battery 2026 — what it actually costs after the stack',
  metaDescription: "Federal 25D 30% credit + EVT solar+storage at $0.40/Wh + Vermont net metering Group 2 + utility adders. A typical 8kW + battery in Vermont nets $28-42k after credits — not $50k+.",
  h1: "Vermont solar + battery 2026 — the stack that out-of-state calculators miss.",

  leadParagraph: "$2,200 for a heat pump is the headline rebate everyone knows. Solar+battery in Vermont stacks higher and most homeowners don't realize. 30% federal Section 25D credit plus EVT solar+storage at $0.40/Wh of battery capacity plus Vermont Net Metering Group 2 plus utility adders. Stacked, a typical 8kW + battery in Vermont nets out to $28,000-42,000 after credits — not $50,000+ as out-of-state cost calculators suggest.",

  sections: [
    {
      h2: 'The federal Section 25D credit (still in effect)',
      body: `Federal Section 25D Residential Clean Energy Credit pays 30% of total system cost. Solar PV and battery storage both qualify. File IRS Form 5695 with your annual return.

**Vermont-specific:** the credit rolls forward if it exceeds your tax liability. A homeowner with $8,000 in tax liability who claims a $12,000 credit takes $8,000 this year and $4,000 next year. No cap. **Worth knowing:** this is different from the expired Section 25C credit (which used to cover heat pumps and weatherization at 30% up to $1,200/year). 25C expired Dec 31, 2025; 25D is still active.

**Trap:** the homeowner who confuses 25C and 25D and assumes the federal credit is gone. 25C is gone (heat pumps, weatherization). 25D is alive (solar PV, battery). The names are similar; the rules aren't.

**What to do:** before installer bid review, confirm your tax situation. If your annual tax liability is small, the credit rolls forward but takes years to fully apply. If you don't have federal tax liability at all (e.g., very low income), the credit won't help — different rebate paths matter more.`,
    },
    {
      h2: 'EVT solar + storage incentive',
      body: `EVT pays $0.40/Wh of battery capacity (verified April 2026). Eligible batteries: Tesla Powerwall, Enphase IQ Battery, Sonnen, others on the program list.

**Vermont-specific:** a Tesla Powerwall (13.5 kWh capacity) gets $0.40 × 13,500 = $5,400 in EVT incentive. A pair of Enphase IQ Batteries with combined 20 kWh capacity gets $8,000.

The battery must be paired with solar (the program is "solar + storage," not standalone storage). The incentive amount can be reduced if the homeowner declines participation in EVT/utility grid-services programs.

**Worth knowing:** the EVT solar+storage incentive is paid through the contractor at install completion, similar to the heat pump and weatherization rebates. Net invoice line, not a check to you.

**Trap:** the cheaper non-participating installer who can't file the EVT incentive paperwork. A $5,400 Powerwall incentive is real money. A non-participating installer's bid that's $2,000 lower than a participating installer's bid loses on the rebate forfeit.`,
    },
    {
      h2: 'Vermont Net Metering Group 2',
      body: `Vermont Net Metering Group 2 pays full retail rate credit on solar generation plus a $0.03/kWh adder for in-state solar. Residential systems up to 15 kW qualify. The installer files the PUC paperwork.

**Vermont-specific:** the $0.03/kWh adder is unique to Vermont — most states pay only the retail rate, not retail + adder. Over 25 years of solar production, the adder represents thousands of dollars in additional value above the credit's value alone.

**Worth knowing:** Vermont Net Metering Group 2 isn't an upfront cash incentive; it's an operating-cost credit that accrues monthly on the electric bill. A typical 8 kW Vermont system produces 9,000-11,000 kWh annually; the adder alone adds $270-330/year in credits over 25 years.

**Trap:** assuming all solar installations get Group 2. Group 2 is the residential class up to 15 kW. Larger systems (commercial-scale) fall into Group 3 with different rules. **Verify with** the installer that your specific system is Group 2 eligible.`,
    },
    {
      h2: 'Utility-side adders',
      body: `Some Vermont utilities offer additional adders for solar customers:

**Green Mountain Power (GMP)** — TOU (time-of-use) rate plan enrollment can stack additional value for solar customers, particularly with battery storage.

**Vermont Public Power Supply Authority (VPPSA) member utilities** — vary by member utility (Stowe Electric, Lyndonville Electric, etc.). Some have small additional incentives; some don't.

**Burlington Electric Department (BED)** — BED's solar program has its own structure separate from EVT. Residential customers should verify with BED directly when planning a system.

**Vermont-specific:** the utility-side stack is variable and changes by utility and by year. **Verify with** your specific utility for the current program rules. A 2024 article about GMP solar adders may not reflect the 2026 program.

**Trap:** the contractor or online cost calculator that quotes a fixed utility-side incentive without checking your utility. If your address is in BED territory and the calculator assumed GMP, the math is wrong.`,
    },
    {
      h2: 'What the stack adds up to',
      body: `Specific scenarios for a typical Vermont 8 kW solar + 13.5 kWh battery, mid-2026:

**Gross install cost** — $42,000-58,000 (varies by installer and roof complexity).

**Federal 25D 30% credit** — 30% of total system cost. On a $50,000 install: $15,000.

**EVT solar+storage** — 13,500 Wh × $0.40 = $5,400.

**Vermont Net Metering Group 2** — operational credit of ~$0.03/kWh adder. On 9,500 kWh annual production: ~$285/year. Over 25 years: ~$7,125 in credits (above retail rate value).

**Utility-side adders (GMP example, where applicable)** — variable, often $500-2,000.

**Net out-of-pocket after upfront credits** — $50,000 - $15,000 - $5,400 = $29,600. Approximately $30,000 net cash outlay for a system that produces $1,800-2,400/year in retail-rate offset plus $285/year in net-metering adder credits.

**Vermont-specific:** out-of-state cost calculators routinely quote $50,000+ for the same system without applying the Vermont stack. This understates Vermont's economics by 30-40%. Vermont's solar + battery economics are some of the best in the nation when the stack is properly applied.

**Trap:** the homeowner who hires an out-of-state installer who quotes the system at $50,000 and doesn't know how to file the Vermont-specific incentives. The federal 25D credit applies regardless of installer location, but EVT and Vermont Net Metering require Vermont-licensed/participating installers.`,
    },
    {
      h2: 'Sequencing: roof first, then solar',
      body: `Solar life is 25-30 years. If your roof has less than that, replace it first or pay $4,000-12,000 to remove + reinstall solar later.

**Vermont-specific:** the right Vermont roof for solar is usually standing seam metal (40-70 year lifespan) or new architectural asphalt shingles (25-30 year lifespan). Old asphalt with less than 10 years of remaining life is a roof-replacement decision before solar planning.

**The order:**

1. Roof condition assessment. Roofing contractor inspects. If less than 15 years remaining lifespan, replace before solar.

2. Roof replacement (if needed). $14,000-32,000 standing seam metal; $8,000-20,000 architectural asphalt. Stack is empty for the roof itself; solar credits apply only to the solar work.

3. Solar + battery design. Now sized to the new roof. Installer designs the array based on roof orientation, shading, and structural capacity.

4. Installation, paperwork, commissioning. Installer files EVT, Net Metering, and any utility-side adders.

**Trap:** putting solar on a 15-year-old asphalt roof. In year 8 of solar, the roof needs replacement. Solar removal + reinstall costs $4,000-12,000. The total project cost is now the roof + solar + R&R surcharge — exceeding what a one-time roof + solar would have cost.

**Worth knowing:** NREL studies show $3,000-5,000 in bundling savings when roof + solar are done together vs. sequentially over years. Vermont contractors can bid the combined project as a single scope.`,
    },
  ],

  faq: [
    {
      question: 'Is the federal solar tax credit still available in 2026?',
      answer: 'Yes. Section 25D Residential Clean Energy Credit is in effect at 30% of total system cost (solar PV + battery storage). It rolls forward if it exceeds tax liability. Different from Section 25C (heat pumps, weatherization) which expired Dec 31, 2025.',
    },
    {
      question: 'How much is the EVT solar+storage incentive?',
      answer: '$0.40/Wh of battery capacity. A Tesla Powerwall (13.5 kWh) gets $5,400. An Enphase pair at 20 kWh gets $8,000. Battery must be paired with solar; standalone storage doesn\'t qualify. Paid through the contractor at install completion.',
    },
    {
      question: 'Why do out-of-state cost calculators quote higher prices for Vermont solar?',
      answer: "They typically don't apply Vermont's specific stack — federal 25D + EVT solar+storage + Vermont Net Metering Group 2 adder + utility-side adders. The 30-40% gap between out-of-state calculator quotes and actual Vermont net cost is real. Use Vermont-specific installers and confirm the stack in writing.",
    },
    {
      question: 'Should I replace my roof before going solar?',
      answer: 'If your roof has less than 15 years of remaining life, yes. Solar life is 25-30 years; mismatched timing forces $4,000-12,000 in solar removal + reinstall later. Vermont roofs that pair well with solar: standing seam metal (40-70 year life) or new architectural asphalt (25-30 year life).',
    },
    {
      question: 'Do I have to use a specific installer to get the EVT solar+storage incentive?',
      answer: 'The installer must be on EVT\'s participating list and the battery on the eligible-equipment list. Confirm both at bid review in writing. Out-of-state installers without Vermont participation can install your system, but EVT incentive paperwork won\'t process — meaning $5,400+ of your stack is forfeit.',
    },
  ],

  factIds: [
    'federal-25d-clean-energy',
    'evt-solar-storage-incentive',
    'vt-net-metering-group2',
    'vt-cost-solar-8kw',
    'vt-cost-roof-asphalt',
    'vt-cost-roof-standing-seam',
  ],

  relatedGuideSlugs: [
    'heat-pump-rebates-vermont',
    'how-much-does-roof-replacement-cost-vermont',
    'how-to-find-contractor-vermont',
    'vermont-renovation-permit-guide',
    'vermont-contractor-red-flags',
  ],

  relatedTownSlugs: ['stowe-vt', 'burlington-vt', 'middlebury-vt', 'montpelier-vt'],

  byline: 'Alder Projects editorial team',
  verifyDate: '2026-05-03',
}
