// src/lib/data/index.ts
// Single import surface for the Vermont data moat.
// Consumers (calculator, answer pages, chatbot) all read from here.

import costTiersJson from './cost-tiers-vermont.json';
import townsJson from './towns-vermont.json';
import rebatesJson from './rebates-vermont.json';
import programsJson from './programs-vermont.json';

import type {
  CostTiersFile,
  TownsFile,
  RebatesData,
  ProgramsFile,
  Town,
  CostTrade,
  CostTier,
  Program,
  Rebate,
} from './types';

// Cast JSON imports through unknown to satisfy TS — the JSON shape is enforced
// at edit time by the schema in types.ts, not at runtime.
export const costTiers = costTiersJson as unknown as CostTiersFile;
export const towns = townsJson as unknown as TownsFile;
export const rebates = rebatesJson as unknown as RebatesData;
export const programs = programsJson as unknown as ProgramsFile;

// ---- Helper accessors ----

export function getTown(slug: string): Town | undefined {
  // Accept both "burlington" and "south_burlington" or "south-burlington"
  const normalized = slug.replace(/-/g, '_').toLowerCase();
  return (towns as unknown as Record<string, Town>)[normalized];
}

export function getTrade(key: string): CostTrade | undefined {
  return (costTiers as unknown as Record<string, CostTrade>)[key];
}

export function getTier(tradeKey: string, tierKey: string): CostTier | undefined {
  const trade = getTrade(tradeKey);
  return trade?.tiers[tierKey];
}

export function getPermitFee(townSlug: string, tradeKey: string): { low: number; high: number } | undefined {
  const town = getTown(townSlug);
  return town?.permit_fees[tradeKey];
}

export function getLaborMultiplier(townSlug: string): number {
  return getTown(townSlug)?.labor_multiplier ?? 1.0;
}

// Apply town's labor multiplier to a base cost tier
export function adjustForTown(tier: CostTier, townSlug: string): { low: number; high: number; median?: number } {
  const mult = getLaborMultiplier(townSlug);
  return {
    low: Math.round(tier.low * mult),
    high: Math.round(tier.high * mult),
    median: tier.median ? Math.round(tier.median * mult) : undefined,
  };
}

// Get rebates relevant to a given trade in a given town
export function getApplicableRebates(tradeKey: string, townSlug: string): Rebate[] {
  const trade = getTrade(tradeKey);
  if (!trade) return [];
  const town = getTown(townSlug);
  const applicable: Rebate[] = [];

  if (trade.vertical === 'energy' && tradeKey.includes('weather')) {
    applicable.push(rebates.weatherization.evt_standard, rebates.weatherization.evt_income_eligible, rebates.weatherization.diy_rebate);
  }
  if (tradeKey === 'heat_pump_installation') {
    applicable.push(rebates.heat_pump.evt_ductless as Rebate, rebates.heat_pump.evt_ducted as Rebate);
    if (town?.utility.electric === 'GMP') {
      applicable.push(rebates.heat_pump.gmp_income_bonus as Rebate);
    }
    if (town?.utility.electric === 'Vermont Electric Cooperative') {
      applicable.push(rebates.heat_pump.vppsa_income_bonus as Rebate);
    }
  }
  return applicable.filter(Boolean);
}

// All known towns as an array (for sitemaps and town listings)
export function allTownSlugs(): string[] {
  return Object.values(towns as unknown as Record<string, Town>).map(t => t.slug);
}

export function allTradeKeys(): string[] {
  return Object.keys(costTiers as unknown as Record<string, CostTrade>).filter(k => !k.startsWith('_'));
}

export type { Town, CostTrade, CostTier, Rebate, Program } from './types';
