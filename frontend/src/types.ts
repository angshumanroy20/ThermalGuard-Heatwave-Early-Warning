export interface WardDemographics {
  elderly_pct: number;
  children_pct: number;
  outdoor_worker_pct: number;
  informal_housing_pct: number;
  ndvi_vegetation: number;
}

export interface WardInfrastructure {
  hospitals_count: number;
  cooling_centers_count: number;
  power_grid_zone: string;
}

export interface ThermalMetrics {
  temp_current_c: number;
  temp_max_c: number;
  rel_humidity_pct: number;
  wind_speed_ms: number;
  solar_radiation_wm2: number;
  wbgt_outdoor_c: number;
  utci_c: number;
  heat_index_c: number;
  wet_bulb_tw: number;
  globe_temp_tg: number;
  dew_point_td: number;
  ehf_index: number;
  imd_category: string;
  imd_departure_c: number;
  imd_color_code: string;
}

export interface WardVulnerability {
  vulnerability_score: number;
  elderly_children_factor: number;
  outdoor_worker_factor: number;
  housing_heattrap_factor: number;
  ndvi_deficiency_factor: number;
}

export interface WardRisk {
  tier: 'SAFE' | 'MODERATE' | 'SEVERE' | 'EXTREME';
  tier_title: string;
  tier_color: string;
  composite_risk_score: number;
  expected_hospital_surge_pct: number;
  immediate_actions: string[];
  metrics: ThermalMetrics;
  vulnerability: WardVulnerability;
}

export interface WardSummary {
  id: string;
  name: string;
  city: string;
  region_type: string;
  lat: number;
  lon: number;
  pop_density_sqkm: number;
  demographics: WardDemographics;
  infrastructure: WardInfrastructure;
  weather: any;
  risk: WardRisk;
}

export interface HourlyPoint {
  hour: string;
  temp_c: number;
  wbgt_c: number;
  solar_wm2: number;
  rel_humidity_pct: number;
}

export interface ForecastDay {
  day_index: number;
  date: string;
  day_name: string;
  risk_eval: WardRisk;
  hourly_profile: HourlyPoint[];
}

export interface RoleAdvisoryItem {
  title: string;
  badge: string;
  actions: string[];
}

export interface RoleAdvisories {
  citizens: RoleAdvisoryItem;
  asha_workers: RoleAdvisoryItem;
  outdoor_workers: RoleAdvisoryItem;
  hospitals: RoleAdvisoryItem;
  municipal_utilities: RoleAdvisoryItem;
}

export interface WardDetailsResponse {
  ward: WardSummary;
  city: string;
  region_type: string;
  current_evaluation: WardRisk;
  forecast_5days: ForecastDay[];
  role_advisories: RoleAdvisories;
}

export interface SystemStatus {
  system: string;
  status: string;
  active_scenario: string;
  timestamp: string;
  data_pipelines: {
    [key: string]: {
      name: string;
      status: string;
      criteria?: string;
      frequency?: string;
      percentiles?: string;
      lead_time?: string;
      resolution?: string;
      reporting_districts?: number;
      national_cases_ytd?: number;
    };
  };
}

export interface AnalystReviewItem {
  id: string;
  city: string;
  ward_id: string;
  ward_name: string;
  created_at: string;
  ai_tier: 'SAFE' | 'MODERATE' | 'SEVERE' | 'EXTREME';
  ai_risk_score: number;
  predicted_surge_pct: number;
  metrics: {
    temp_max_c: number;
    rel_humidity_pct: number;
    wbgt_outdoor_c: number;
    utci_c: number;
    heat_index_c: number;
    imd_color_code: string;
    imd_category: string;
  };
  analyst_notes: string;
  status: string;
}

export interface ApprovedBroadcastItem {
  id: string;
  city: string;
  ward_name: string;
  tier: string;
  risk_score: number;
  approved_by: string;
  approved_at: string;
  analyst_notes?: string;
  dispatched_recipients?: number;
  channels_used: string[];
}
