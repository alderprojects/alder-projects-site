/**
 * v7.2.17 — Seasonal content calendar.
 * Drives homepage hero rotation. Read by SeasonalHero component.
 */

export type SeasonalConfig = {
  month: number
  eyebrow: string
  headline: string
  subhead: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  chatPrompt: string
  featuredScope?: string
  featuredGuide: { label: string; href: string }
}

export const SEASONAL_CALENDAR: SeasonalConfig[] = [
  {
    month: 1,
    eyebrow: 'January',
    headline: 'Drafty winter? Fix it before replacement.',
    subhead: 'A $14,000 window replacement quote can often start with $200 of weatherization. Real Vermont math.',
    primaryCtaLabel: 'Build my weatherization cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=weatherization&scope=window_weatherization&utm_source=hero&utm_medium=seasonal&utm_campaign=jan_windows',
    secondaryCtaLabel: 'Read the guide',
    secondaryCtaHref: '/guides/windows-buy-skip-wait',
    chatPrompt: 'I have drafty windows in an old Vermont house',
    featuredScope: 'window_weatherization',
    featuredGuide: { label: 'Windows Buy/Skip/Wait', href: '/guides/windows-buy-skip-wait' },
  },
  {
    month: 2,
    eyebrow: 'February',
    headline: 'Planning your spring kitchen refresh?',
    subhead: 'Cabinet hardware drops 20-30% in late summer. Plan now, buy at the right time.',
    primaryCtaLabel: 'Build my kitchen cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=kitchen&scope=kitchen_cosmetic_refresh&utm_source=hero&utm_medium=seasonal&utm_campaign=feb_kitchen',
    secondaryCtaLabel: 'Cost estimate',
    secondaryCtaHref: '/calculator',
    chatPrompt: 'I want to refresh my kitchen this year',
    featuredScope: 'kitchen_cosmetic_refresh',
    featuredGuide: { label: 'Kitchen Refresh Buy/Skip/Wait', href: '/guides/kitchen-refresh-buy-skip-wait' },
  },
  {
    month: 3,
    eyebrow: 'March',
    headline: 'Mud season is here. Your mudroom is failing.',
    subhead: 'The $80-250 fixes that handle Vermont boot, coat, and water reality.',
    primaryCtaLabel: 'Build my mudroom cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=mudroom&scope=mudroom_entry_reset&utm_source=hero&utm_medium=seasonal&utm_campaign=mar_mudroom',
    secondaryCtaLabel: 'Cost estimate',
    secondaryCtaHref: '/calculator',
    chatPrompt: 'I need to fix my mudroom for Vermont weather',
    featuredScope: 'mudroom_entry_reset',
    featuredGuide: { label: 'The Buy/Skip/Wait Method', href: '/guides/how-to-shop-for-home-projects-without-overspending' },
  },
  {
    month: 4,
    eyebrow: 'April',
    headline: 'Opening the camp? Start with the diagnostic.',
    subhead: 'The 15-item Vermont spring open-up checklist before you buy anything new.',
    primaryCtaLabel: 'Build my spring cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=outdoor&scope=outdoor_seasonal_opening&utm_source=hero&utm_medium=seasonal&utm_campaign=apr_open',
    secondaryCtaLabel: 'Read the lake guide',
    secondaryCtaHref: '/guides/lake-season-buy-skip-wait',
    chatPrompt: 'I am opening my Vermont camp for the season',
    featuredScope: 'outdoor_seasonal_opening',
    featuredGuide: { label: 'Lake Season Buy/Skip/Wait', href: '/guides/lake-season-buy-skip-wait' },
  },
  {
    month: 5,
    eyebrow: 'May',
    headline: 'Memorial Day patio sales are a trap.',
    subhead: 'Patio furniture is at peak price in May. Here is what to actually buy this Memorial Day, and what to wait on.',
    primaryCtaLabel: 'Build my lake season cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=outdoor&scope=outdoor_lake_season&utm_source=hero&utm_medium=seasonal&utm_campaign=may_lake',
    secondaryCtaLabel: 'Read Lake Buy/Skip/Wait',
    secondaryCtaHref: '/guides/lake-season-buy-skip-wait',
    chatPrompt: 'Should I buy patio furniture this Memorial Day?',
    featuredScope: 'outdoor_lake_season',
    featuredGuide: { label: 'Lake Season Buy/Skip/Wait', href: '/guides/lake-season-buy-skip-wait' },
  },
  {
    month: 6,
    eyebrow: 'June',
    headline: 'Father\'s Day tools — what tradesmen actually want.',
    subhead: 'Real picks across grills, tools, and outdoor gear. The designer-markup skip list saves the most.',
    primaryCtaLabel: 'Build my outdoor cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=outdoor&scope=outdoor_lake_season&utm_source=hero&utm_medium=seasonal&utm_campaign=jun_outdoor',
    secondaryCtaLabel: 'Weber vs BGE vs Kamado Joe',
    secondaryCtaHref: '/guides/weber-spirit-vs-big-green-egg-vs-kamado-joe-real-cost',
    chatPrompt: 'I need outdoor gear recommendations',
    featuredScope: 'outdoor_lake_season',
    featuredGuide: { label: 'Lake Season Buy/Skip/Wait', href: '/guides/lake-season-buy-skip-wait' },
  },
  {
    month: 7,
    eyebrow: 'July',
    headline: 'Vermont basement humidity peaks now. Run the $40 test.',
    subhead: 'Before you finish, encapsulate, or call a waterproofer — the cheap diagnostic that prevents the $30,000 mistake.',
    primaryCtaLabel: 'Build my basement cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=home_repair&scope=basement_moisture_prep&utm_source=hero&utm_medium=seasonal&utm_campaign=jul_basement',
    secondaryCtaLabel: 'Read Basement Buy/Skip/Wait',
    secondaryCtaHref: '/guides/basement-buy-skip-wait',
    chatPrompt: 'My basement is humid this summer',
    featuredScope: 'basement_moisture_prep',
    featuredGuide: { label: 'Basement Buy/Skip/Wait', href: '/guides/basement-buy-skip-wait' },
  },
  {
    month: 8,
    eyebrow: 'August',
    headline: 'Cabinet hardware drops in late August. Plan your kitchen now.',
    subhead: 'The back-to-school cycle brings 20-30% off most hardware lines. Build your list now, buy at the right moment.',
    primaryCtaLabel: 'Build my hardware cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=kitchen&scope=kitchen_cabinet_hardware_swap&utm_source=hero&utm_medium=seasonal&utm_campaign=aug_hardware',
    secondaryCtaLabel: 'Designer vs Mid-Tier',
    secondaryCtaHref: '/guides/cabinet-pulls-designer-vs-mid-tier-real-difference',
    chatPrompt: 'I want to swap cabinet hardware in my kitchen',
    featuredScope: 'kitchen_cabinet_hardware_swap',
    featuredGuide: { label: 'Kitchen Refresh Buy/Skip/Wait', href: '/guides/kitchen-refresh-buy-skip-wait' },
  },
  {
    month: 9,
    eyebrow: 'September',
    headline: 'Closing the camp? 12-item lakefront shutdown.',
    subhead: 'Plus: outdoor cushion clearance is year-best in September. 30-50% off most lines.',
    primaryCtaLabel: 'Build my close-down cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=outdoor&scope=outdoor_freeze_prevention&utm_source=hero&utm_medium=seasonal&utm_campaign=sep_close',
    secondaryCtaLabel: 'Read the guide',
    secondaryCtaHref: '/guides/lake-season-buy-skip-wait',
    chatPrompt: 'I am closing my camp for the winter',
    featuredScope: 'outdoor_freeze_prevention',
    featuredGuide: { label: 'Lake Season Buy/Skip/Wait', href: '/guides/lake-season-buy-skip-wait' },
  },
  {
    month: 10,
    eyebrow: 'October',
    headline: 'Vermont\'s first freeze is 4-6 weeks out.',
    subhead: 'The winterize-or-lose-it list — pipes, hose bibs, drains, outdoor systems. Real Vermont math.',
    primaryCtaLabel: 'Build my winterize cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=outdoor&scope=outdoor_freeze_prevention&utm_source=hero&utm_medium=seasonal&utm_campaign=oct_winterize',
    secondaryCtaLabel: 'Cost estimate',
    secondaryCtaHref: '/calculator',
    chatPrompt: 'I need to winterize my Vermont home',
    featuredScope: 'outdoor_freeze_prevention',
    featuredGuide: { label: 'Buy-Timing Calendar', href: '/guides/home-improvement-buy-timing-calendar' },
  },
  {
    month: 11,
    eyebrow: 'November',
    headline: 'Patio furniture is 30-50% off. And your windows are about to be cold.',
    subhead: 'Two big seasonal plays. Stock up on outdoor for next year. Weatherize before the freeze.',
    primaryCtaLabel: 'Build my windows cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=weatherization&scope=window_weatherization&utm_source=hero&utm_medium=seasonal&utm_campaign=nov_windows',
    secondaryCtaLabel: 'Buy-Timing Calendar',
    secondaryCtaHref: '/guides/home-improvement-buy-timing-calendar',
    chatPrompt: 'I want to weatherize before winter',
    featuredScope: 'window_weatherization',
    featuredGuide: { label: 'Windows Buy/Skip/Wait', href: '/guides/windows-buy-skip-wait' },
  },
  {
    month: 12,
    eyebrow: 'December',
    headline: 'Holiday hosting + a drafty house. The 48-hour fix.',
    subhead: 'V-strip, film, caulk, door sweeps. Under $200, real results before guests arrive.',
    primaryCtaLabel: 'Build my windows cart — $19.99',
    primaryCtaHref: '/smart-cart?topic=weatherization&scope=window_weatherization&utm_source=hero&utm_medium=seasonal&utm_campaign=dec_windows',
    secondaryCtaLabel: 'Read the guide',
    secondaryCtaHref: '/guides/windows-buy-skip-wait',
    chatPrompt: 'My house is drafty and I have guests coming',
    featuredScope: 'window_weatherization',
    featuredGuide: { label: 'Windows Buy/Skip/Wait', href: '/guides/windows-buy-skip-wait' },
  },
]

export function getCurrentSeasonalConfig(): SeasonalConfig {
  const month = new Date().getMonth() + 1
  return SEASONAL_CALENDAR.find(c => c.month === month) || SEASONAL_CALENDAR[4]
}
