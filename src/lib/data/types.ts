// src/lib/data/types.ts
// Type definitions for the Vermont data moat.
// Every file in src/lib/data/ conforms to these types.

export type LeadType = 'lead' | 'affiliate' | 'phone-call' | 'education' | 'mixed';

export type CostSource = {
  name: string;
  location?: string;
  url?: string;
  year: number;
  notes?: string;
};

export type CostTier = {
  label: string;
  low: number;
  high: number;
  median?: number;
  scope_notes?: string;
};

export type CostTrade = {
  display_name: string;
  tiers: Record<string, CostTier>;
  sources: CostSource[];
  what_pushes_high: string[];
  not_included: string[];
  typical_timeline_weeks: [number, number];
  permit_required: boolean;
  diy_feasible: boolean | 'partial';
  lead_type: LeadType;
  vertical?: 'energy' | 'kitchen-bath' | 'exterior' | 'structural' | 'cosmetic';
};

export type PermitFeeRange = { low: number; high: number };

export type PermitOffice = {
  name: string;
  address?: string;
  phone?: string;
  hours?: string;
  url?: string;
};

export type TownZoning = {
  adu_allowed_by_right: boolean;
  adu_size_max_sqft?: number;
  adu_size_pct_main_house?: number;
  setback_side_ft?: number;
  setback_rear_ft?: number;
  notes?: string;
};

export type TownHousingStock = {
  median_year_built?: number;
  pre_1940_pct?: number;
  pre_1978_pct?: number;
  second_home_pct?: number;
};

export type TownUtility = {
  electric: string;
  gas?: string;
  rebate_eligible_programs: string[];
};

export type Town = {
  slug: string;
  name: string;
  county: string;
  population?: number;
  median_home_price?: number;
  permit_fees: Record<string, PermitFeeRange>;
  permit_office?: PermitOffice;
  labor_multiplier: number;
  labor_notes?: string;
  utility: TownUtility;
  zoning?: TownZoning;
  housing_stock?: TownHousingStock;
  flood_history?: { year: number; event: string }[];
  search_volume_signal?: 'low' | 'medium' | 'medium-high' | 'high';
  notes?: string;
};

export type Rebate = {
  name: string;
  max_amount: number | null;
  unit?: string;
  coverage_pct?: number;
  eligibility: string;
  expires?: string;
  url?: string;
  status?: 'active' | 'expiring' | 'expired';
  stackable_with?: string[];
};

export type RebatesData = {
  as_of_date: string;
  weatherization: Record<string, Rebate>;
  heat_pump: Record<string, Rebate | null>;
  federal: Record<string, Rebate>;
  ami_thresholds_2026: Record<string, Record<string, number>>;
};

export type Program = {
  name: string;
  due_date_annual?: string;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round' | string;
  what_it_is: string;
  what_it_does?: string;
  url?: string;
  associated_forms?: string[];
  search_intent?: 'high' | 'medium' | 'low' | 'buyer' | 'owner';
};

export type CostTiersFile = Record<string, CostTrade>;
export type TownsFile = Record<string, Town>;
export type ProgramsFile = Record<string, Program>;
