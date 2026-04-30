export type DemandTier = 'alta' | 'media' | 'baja';

export interface DataSourceMetadata {
  id: string;
  name: string;
  url: string;
  coverage: string;
  updateFrequency: string;
  lastUpdated: string;
  evidenceType: 'official' | 'survey' | 'observational' | 'crowdsourced';
}

export interface ScoringComponent {
  id: 'employmentTrend' | 'salarySignal' | 'techIntensity' | 'macroStability' | 'profileAlignment';
  label: string;
  weight: number;
  value: number;
  weightedValue: number;
  sourceIds: string[];
}

export interface CountryDemandDiagnostics {
  country: string;
  modelVersion: string;
  score: number;
  confidenceScore: number;
  confidenceLevel: 'alta' | 'media' | 'baja';
  updatedAt: string;
  components: ScoringComponent[];
  sources: DataSourceMetadata[];
  legalLimitations: string[];
}

export type ScoringComponentId = ScoringComponent['id'];

const SOURCE_REGISTRY: Record<string, DataSourceMetadata> = {
  bls: {
    id: 'bls',
    name: 'U.S. Bureau of Labor Statistics (BLS)',
    url: 'https://api.bls.gov/',
    coverage: 'United States labor and wage statistics',
    updateFrequency: 'Monthly / Quarterly depending on series',
    lastUpdated: '2026-04-30',
    evidenceType: 'official',
  },
  ilo: {
    id: 'ilo',
    name: 'ILOSTAT (International Labour Organization)',
    url: 'https://www.ilo.org/ilostat-files/WEBDEV/docs/API-UserGuide.pdf',
    coverage: 'International labor indicators across countries',
    updateFrequency: 'Periodic releases by indicator',
    lastUpdated: '2026-04-30',
    evidenceType: 'official',
  },
  oecd: {
    id: 'oecd',
    name: 'OECD Migration Database',
    url: 'https://www.oecd.org/en/data/datasets/overview-data-on-migration-flows-and-migrant-populations.html',
    coverage: 'Migration flows, integration outcomes, and population indicators',
    updateFrequency: 'Annual / periodic',
    lastUpdated: '2026-04-30',
    evidenceType: 'official',
  },
  stackOverflow: {
    id: 'stackOverflow',
    name: 'Stack Overflow Developer Survey',
    url: 'https://survey.stackoverflow.co/',
    coverage: 'Technology usage, salaries, and developer preferences',
    updateFrequency: 'Annual',
    lastUpdated: '2026-04-30',
    evidenceType: 'survey',
  },
  octoverse: {
    id: 'octoverse',
    name: 'GitHub Octoverse',
    url: 'https://octoverse.github.com/',
    coverage: 'Observed coding activity and ecosystem trends',
    updateFrequency: 'Annual',
    lastUpdated: '2026-04-30',
    evidenceType: 'observational',
  },
  crowdsourcedSalary: {
    id: 'crowdsourcedSalary',
    name: 'Crowdsourced salary references (PayScale/Glassdoor/Salary.com)',
    url: 'https://www.glassdoor.com/',
    coverage: 'Supplemental salary benchmarks by role and location',
    updateFrequency: 'Quarterly (recommended)',
    lastUpdated: '2026-04-30',
    evidenceType: 'crowdsourced',
  },
};

const BASE_COMPONENT_BY_TIER: Record<DemandTier, Omit<Record<ScoringComponent['id'], number>, 'profileAlignment'>> = {
  alta: {
    employmentTrend: 78,
    salarySignal: 74,
    techIntensity: 80,
    macroStability: 72,
  },
  media: {
    employmentTrend: 63,
    salarySignal: 60,
    techIntensity: 62,
    macroStability: 61,
  },
  baja: {
    employmentTrend: 48,
    salarySignal: 47,
    techIntensity: 45,
    macroStability: 50,
  },
};

const COMPONENT_WEIGHTS: Record<ScoringComponent['id'], number> = {
  employmentTrend: 0.35,
  salarySignal: 0.25,
  techIntensity: 0.2,
  macroStability: 0.1,
  profileAlignment: 0.1,
};

function getLevel(score: number): 'alta' | 'media' | 'baja' {
  if (score >= 75) return 'alta';
  if (score >= 55) return 'media';
  return 'baja';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function resolveDataSources(ids: string[]): DataSourceMetadata[] {
  return ids.map(id => SOURCE_REGISTRY[id]).filter(Boolean);
}

export function buildCountryDemandDiagnostics(params: {
  country: string;
  demandTier: DemandTier;
  profileAlignment: number;
  modelVersion?: string;
  componentOverrides?: Partial<Record<ScoringComponentId, number>>;
  sourceIds?: string[];
  sourcesOverride?: DataSourceMetadata[];
  confidenceBoost?: number;
}): CountryDemandDiagnostics {
  const base = BASE_COMPONENT_BY_TIER[params.demandTier];
  const profileAlignment = Math.max(0, Math.min(100, Math.round(params.profileAlignment)));
  const componentOverrides = params.componentOverrides ?? {};

  const employmentTrend = clamp(Math.round(componentOverrides.employmentTrend ?? base.employmentTrend), 0, 100);
  const salarySignal = clamp(Math.round(componentOverrides.salarySignal ?? base.salarySignal), 0, 100);
  const techIntensity = clamp(Math.round(componentOverrides.techIntensity ?? base.techIntensity), 0, 100);
  const macroStability = clamp(Math.round(componentOverrides.macroStability ?? base.macroStability), 0, 100);
  const aligned = clamp(Math.round(componentOverrides.profileAlignment ?? profileAlignment), 0, 100);

  const components: ScoringComponent[] = [
    {
      id: 'employmentTrend',
      label: 'Employment trend (official stats)',
      weight: COMPONENT_WEIGHTS.employmentTrend,
      value: employmentTrend,
      weightedValue: Math.round(employmentTrend * COMPONENT_WEIGHTS.employmentTrend),
      sourceIds: ['bls', 'ilo'],
    },
    {
      id: 'salarySignal',
      label: 'Salary signal (official + supplemental)',
      weight: COMPONENT_WEIGHTS.salarySignal,
      value: salarySignal,
      weightedValue: Math.round(salarySignal * COMPONENT_WEIGHTS.salarySignal),
      sourceIds: ['bls', 'crowdsourcedSalary'],
    },
    {
      id: 'techIntensity',
      label: 'Tech intensity (survey + observed activity)',
      weight: COMPONENT_WEIGHTS.techIntensity,
      value: techIntensity,
      weightedValue: Math.round(techIntensity * COMPONENT_WEIGHTS.techIntensity),
      sourceIds: ['stackOverflow', 'octoverse'],
    },
    {
      id: 'macroStability',
      label: 'Labor/migration macro stability',
      weight: COMPONENT_WEIGHTS.macroStability,
      value: macroStability,
      weightedValue: Math.round(macroStability * COMPONENT_WEIGHTS.macroStability),
      sourceIds: ['ilo', 'oecd'],
    },
    {
      id: 'profileAlignment',
      label: 'Profile alignment against target-country skills',
      weight: COMPONENT_WEIGHTS.profileAlignment,
      value: aligned,
      weightedValue: Math.round(aligned * COMPONENT_WEIGHTS.profileAlignment),
      sourceIds: [],
    },
  ];

  const score = Math.round(components.reduce((acc, component) => acc + component.weightedValue, 0));

  const sourceIds = Array.from(new Set(params.sourceIds ?? components.flatMap(component => component.sourceIds)));
  const sources = params.sourcesOverride ?? resolveDataSources(sourceIds);

  const confidenceScore = clamp(
    Math.round((sources.length / 6) * 70 + 25 + (params.confidenceBoost ?? 0)),
    35,
    98
  );

  return {
    country: params.country,
    modelVersion: params.modelVersion ?? 'rigorous-score-v0.1',
    score,
    confidenceScore,
    confidenceLevel: getLevel(confidenceScore),
    updatedAt: new Date().toISOString(),
    components,
    sources,
    legalLimitations: [
      'Self-assessment only. This output is guidance, not a legal, migration, or hiring decision.',
      'Recommendations are estimates and must be validated with official country-specific sources.',
      'Current implementation combines structured assumptions and source metadata; live ingestion connectors are planned.',
    ],
  };
}
