import { NextRequest, NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import type { DataSourceMetadata, ScoringComponentId } from '../../../src/core/RigorousData';
import { buildCountryDemandDiagnostics } from '../../../src/core/RigorousData';

interface RigorousRequest {
  country: string;
  demandTier: 'alta' | 'media' | 'baja';
  profileAlignment: number;
}

interface LaborSignal {
  latest: number;
  previous: number;
  score: number;
}

interface LiveSignals {
  blsUnemployment?: LaborSignal;
  iloUnemployment?: LaborSignal;
  oecdNetMigration?: number;
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

const cache = new Map<string, { expiresAt: number; data: unknown }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached(key: string, data: unknown, ttlMs = CACHE_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function unemploymentToScore(latest: number, previous: number): number {
  const base = 100 - latest * 12;
  const trend = (previous - latest) * 10;
  return clamp(Math.round(base + trend), 20, 95);
}

function arrify<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

const COUNTRY_ALPHA3: Record<string, string> = {
  Alemania: 'DEU',
  Austria: 'AUT',
  'Bélgica': 'BEL',
  Chequia: 'CZE',
  Dinamarca: 'DNK',
  España: 'ESP',
  Finlandia: 'FIN',
  Francia: 'FRA',
  Irlanda: 'IRL',
  Italia: 'ITA',
  Noruega: 'NOR',
  'Países Bajos': 'NLD',
  Polonia: 'POL',
  Portugal: 'PRT',
  'Reino Unido': 'GBR',
  Suecia: 'SWE',
  Suiza: 'CHE',
  Argentina: 'ARG',
  Brasil: 'BRA',
  Canadá: 'CAN',
  Chile: 'CHL',
  Colombia: 'COL',
  'Estados Unidos': 'USA',
  México: 'MEX',
  Uruguay: 'URY',
  Australia: 'AUS',
  'Corea del Sur': 'KOR',
  Japón: 'JPN',
  'Nueva Zelanda': 'NZL',
  Singapur: 'SGP',
  China: 'CHN',
  Rusia: 'RUS',
  'Arabia Saudita': 'SAU',
  'Emiratos Árabes': 'ARE',
  Qatar: 'QAT',
  'Sudáfrica': 'ZAF',
};

async function fetchBlsUnemployment(): Promise<LaborSignal | null> {
  const cacheKey = 'bls:unemployment:us';
  const cached = getCached<LaborSignal>(cacheKey);
  if (cached) return cached;

  const nowYear = new Date().getUTCFullYear();
  const body: Record<string, unknown> = {
    seriesid: ['LNS14000000'],
    startyear: String(nowYear - 2),
    endyear: String(nowYear),
  };

  const key = process.env.BLS_API_KEY;
  if (key) {
    body.registrationkey = key;
  }

  const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) return null;
  const json = await response.json();
  const rows = arrify(json?.Results?.series?.[0]?.data)
    .map((row: { value?: string }) => Number(row.value))
    .filter((value: number) => Number.isFinite(value));

  if (rows.length < 2) return null;
  const latest = rows[0];
  const previous = rows[Math.min(12, rows.length - 1)];

  const signal: LaborSignal = {
    latest,
    previous,
    score: unemploymentToScore(latest, previous),
  };

  setCached(cacheKey, signal);
  return signal;
}

async function fetchIloUnemployment(alpha3: string): Promise<LaborSignal | null> {
  const cacheKey = `ilo:unemployment:${alpha3}`;
  const cached = getCached<LaborSignal>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    id: 'SDG_0852_SEX_AGE_RT_A',
    ref_area: alpha3,
    sex: 'SEX_T',
    classif1: 'AGE_YTHADULT_YGE15',
    timefrom: '2018',
    timeto: String(new Date().getUTCFullYear()),
    format: 'json',
  });

  const response = await fetch(`https://rplumber.ilo.org/data/indicator/?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;
  const json = await response.json();
  const points = arrify<{ time?: string; obs_value?: number }>(json)
    .filter(row => Number.isFinite(Number(row.obs_value)))
    .sort((a, b) => Number(b.time ?? 0) - Number(a.time ?? 0));

  if (points.length < 2) return null;

  const latest = Number(points[0].obs_value);
  const previous = Number(points[Math.min(3, points.length - 1)].obs_value);

  const signal: LaborSignal = {
    latest,
    previous,
    score: unemploymentToScore(latest, previous),
  };

  setCached(cacheKey, signal);
  return signal;
}

async function fetchOecdNetMigrationByCountry(): Promise<Record<string, number>> {
  const cacheKey = 'oecd:netmig:country';
  const cached = getCached<Record<string, number>>(cacheKey);
  if (cached) return cached;

  const response = await fetch(
    'https://sdmx.oecd.org/public/rest/data/OECD.CFE.EDS,DSD_REG_DEMO@DF_MIGR_FLOW,2.4/.?lastNObservations=1',
    { cache: 'no-store' }
  );

  if (!response.ok) return {};
  const xmlText = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    removeNSPrefix: true,
    parseAttributeValue: true,
  });

  const parsed = parser.parse(xmlText);
  const seriesList = arrify(parsed?.GenericData?.DataSet?.Series);

  const values: Record<string, number> = {};

  for (const series of seriesList) {
    const keyValues = arrify(series?.SeriesKey?.Value);
    const keyMap: Record<string, string> = {};
    for (const keyValue of keyValues) {
      if (typeof keyValue?.id === 'string' && typeof keyValue?.value === 'string') {
        keyMap[keyValue.id] = keyValue.value;
      }
    }

    if (
      keyMap.TERRITORIAL_LEVEL !== 'CTRY' ||
      keyMap.MEASURE !== 'NETMIG' ||
      keyMap.AGE !== '_T' ||
      keyMap.SEX !== '_T'
    ) {
      continue;
    }

    const refArea = keyMap.REF_AREA;
    if (!refArea) continue;

    const obs = series?.Obs;
    const obsValue = Number(obs?.ObsValue?.value);
    if (!Number.isFinite(obsValue)) continue;

    values[refArea] = obsValue;
  }

  setCached(cacheKey, values);
  return values;
}

function scoreFromNetMigration(value: number): number {
  if (value >= 500000) return 90;
  if (value >= 200000) return 82;
  if (value >= 50000) return 74;
  if (value >= 0) return 65;
  if (value >= -50000) return 56;
  if (value >= -200000) return 48;
  return 40;
}

function average(values: number[]): number | null {
  const usable = values.filter(value => Number.isFinite(value));
  if (!usable.length) return null;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RigorousRequest;
    if (!body?.country) {
      return NextResponse.json({ error: { message: 'country is required' } }, { status: 400 });
    }

    const alpha3 = COUNTRY_ALPHA3[body.country];

    const [blsSignal, iloSignal, oecdMap] = await Promise.all([
      body.country === 'Estados Unidos' ? fetchBlsUnemployment() : Promise.resolve(null),
      alpha3 ? fetchIloUnemployment(alpha3) : Promise.resolve(null),
      fetchOecdNetMigrationByCountry(),
    ]);

    const oecdNetMigration = alpha3 ? oecdMap[alpha3] : undefined;

    const employmentTrend = average([
      blsSignal?.score ?? Number.NaN,
      iloSignal?.score ?? Number.NaN,
    ]);

    const macroStability = average([
      iloSignal?.score ?? Number.NaN,
      Number.isFinite(oecdNetMigration ?? Number.NaN)
        ? scoreFromNetMigration(oecdNetMigration as number)
        : Number.NaN,
    ]);

    const sourceMetadata: DataSourceMetadata[] = [
      {
        id: 'bls',
        name: 'U.S. Bureau of Labor Statistics (BLS)',
        url: 'https://api.bls.gov/publicAPI/v2/timeseries/data/',
        coverage: 'US unemployment rate (LNS14000000)',
        updateFrequency: 'Monthly',
        lastUpdated: new Date().toISOString(),
        evidenceType: 'official',
      },
      {
        id: 'ilo',
        name: 'ILOSTAT API',
        url: 'https://rplumber.ilo.org/data/indicator/',
        coverage: 'Unemployment SDG_0852_SEX_AGE_RT_A (SEX_T, AGE_YTHADULT_YGE15)',
        updateFrequency: 'Annual updates by indicator',
        lastUpdated: new Date().toISOString(),
        evidenceType: 'official',
      },
      {
        id: 'oecd',
        name: 'OECD SDMX API',
        url: 'https://sdmx.oecd.org/public/rest/data/OECD.CFE.EDS,DSD_REG_DEMO@DF_MIGR_FLOW,2.4/',
        coverage: 'Country net migration (NETMIG), last observation',
        updateFrequency: 'Periodic',
        lastUpdated: new Date().toISOString(),
        evidenceType: 'official',
      },
      {
        id: 'stackOverflow',
        name: 'Stack Overflow Developer Survey',
        url: 'https://survey.stackoverflow.co/',
        coverage: 'Technology usage and demand trends',
        updateFrequency: 'Annual',
        lastUpdated: '2026-04-30',
        evidenceType: 'survey',
      },
      {
        id: 'octoverse',
        name: 'GitHub Octoverse',
        url: 'https://octoverse.github.com/',
        coverage: 'Observed technology activity trends',
        updateFrequency: 'Annual',
        lastUpdated: '2026-04-30',
        evidenceType: 'observational',
      },
    ];

    const componentOverrides: Partial<Record<ScoringComponentId, number>> = {
      employmentTrend: employmentTrend ?? undefined,
      macroStability: macroStability ?? undefined,
      salarySignal: macroStability ? clamp(Math.round(macroStability - 4), 40, 92) : undefined,
    };

    const liveSignalCount = [blsSignal, iloSignal, oecdNetMigration].filter(v => v !== null && v !== undefined).length;

    const diagnostics = buildCountryDemandDiagnostics({
      country: body.country,
      demandTier: body.demandTier,
      profileAlignment: body.profileAlignment,
      modelVersion: 'rigorous-score-v0.3-live',
      componentOverrides,
      sourcesOverride: sourceMetadata,
      sourceIds: sourceMetadata.map(source => source.id),
      confidenceBoost: liveSignalCount * 4,
    });

    return NextResponse.json({
      diagnostics,
      liveSignals: {
        blsUnemployment: blsSignal ?? undefined,
        iloUnemployment: iloSignal ?? undefined,
        oecdNetMigration,
      } satisfies LiveSignals,
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to compute rigorous diagnostics from live sources' } },
      { status: 500 }
    );
  }
}
