import { NextRequest, NextResponse } from 'next/server';
import type { ExternalJob } from '../../../src/core/JobMatcher';

interface JobsRequest {
  country?: string;
  query?: string;
  skills?: string[];
  limit?: number;
}

const CACHE_TTL_MS = 1000 * 60 * 20;
const cache = new Map<string, { expiresAt: number; data: unknown }>();

const COUNTRY_TO_ADZUNA: Record<string, string> = {
  Alemania: 'de',
  Argentina: 'ar',
  Australia: 'au',
  Brasil: 'br',
  Canada: 'ca',
  'Canadá': 'ca',
  Espana: 'es',
  'España': 'es',
  Francia: 'fr',
  India: 'in',
  Italia: 'it',
  Mexico: 'mx',
  'México': 'mx',
  PaisesBajos: 'nl',
  'Países Bajos': 'nl',
  Polonia: 'pl',
  ReinoUnido: 'gb',
  'Reino Unido': 'gb',
  Singapur: 'sg',
  EstadosUnidos: 'us',
  'Estados Unidos': 'us',
};

const SKILL_KEYWORDS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'AWS',
  'Docker',
  'Kubernetes',
  'Excel',
  'Power BI',
  'English',
  'Ingles',
  'Scrum',
  'Agile',
  'Figma',
  'Linux',
];

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function arrify<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

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

function deduplicateJobs(jobs: ExternalJob[]): ExternalJob[] {
  const seen = new Set<string>();
  const out: ExternalJob[] = [];
  for (const job of jobs) {
    const key = `${normalize(job.title)}|${normalize(job.company)}|${normalize(job.location)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(job);
  }
  return out;
}

function deduplicateSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const skill of skills) {
    const key = normalize(skill);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(skill);
  }
  return out;
}

function extractSkillsFromText(text: string): string[] {
  const normalized = normalize(text);
  return SKILL_KEYWORDS.filter(keyword => normalized.includes(normalize(keyword)));
}

function inferSeniority(title: string): 'entry' | 'junior' | 'mid' | 'senior' {
  const normalized = normalize(title);
  if (normalized.includes('intern') || normalized.includes('trainee') || normalized.includes('entry')) return 'entry';
  if (normalized.includes('junior') || normalized.includes('jr')) return 'junior';
  if (normalized.includes('senior') || normalized.includes('staff') || normalized.includes('principal')) return 'senior';
  return 'mid';
}

// Build a normalized (accent-stripped, lowercase, no-spaces) lookup for robustness
const COUNTRY_TO_ADZUNA_NORMALIZED: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_TO_ADZUNA).map(([key, value]) => [normalize(key).replace(/\s+/g, ''), value])
);

function normalizeAdzunaCountry(country?: string): string {
  if (!country) return 'us';
  // Try exact match first, then normalized (handles encoding issues, accents, spaces)
  const exact = COUNTRY_TO_ADZUNA[country];
  if (exact) return exact;
  const normalizedKey = normalize(country).replace(/\s+/g, '');
  return COUNTRY_TO_ADZUNA_NORMALIZED[normalizedKey] ?? 'us';
}

async function fetchAdzunaJobs(params: {
  query: string;
  country?: string;
  limit: number;
}): Promise<ExternalJob[]> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  if (!appId || !appKey) return [];

  const adzunaCountry = normalizeAdzunaCountry(params.country);
  const endpoint = new URL(`https://api.adzuna.com/v1/api/jobs/${adzunaCountry}/search/1`);
  endpoint.searchParams.set('app_id', appId);
  endpoint.searchParams.set('app_key', appKey);
  endpoint.searchParams.set('results_per_page', String(Math.min(25, params.limit)));
  endpoint.searchParams.set('what', params.query);
  endpoint.searchParams.set('content-type', 'application/json');

  const response = await fetch(endpoint.toString(), { cache: 'no-store' });
  if (!response.ok) return [];
  const data = await response.json();

  const results = arrify<{
    id?: string;
    title?: string;
    description?: string;
    redirect_url?: string;
    created?: string;
    salary_min?: number;
    salary_max?: number;
    company?: { display_name?: string };
    location?: { display_name?: string; area?: string[] };
  }>(data?.results);

  return results
    .map((item, index) => {
      const description = item.description ?? '';
      const location = item.location?.display_name ?? 'Unknown';
      const title = item.title ?? 'Untitled role';
      const company = item.company?.display_name ?? 'Unknown company';
      const area = arrify(item.location?.area).join(', ');

      return {
        id: item.id ?? `adzuna-${index}-${title}`,
        source: 'Adzuna',
        title,
        company,
        location,
        country: area || params.country,
        url: item.redirect_url ?? '#',
        description,
        skills: extractSkillsFromText(`${title} ${description}`),
        seniority: inferSeniority(title),
        remote: /remote|hybrid|work from home/i.test(`${title} ${description}`),
        visaSponsorship: /visa|relocation|sponsorship/i.test(description),
        minSalaryUsd: Number.isFinite(item.salary_min) ? Number(item.salary_min) : undefined,
        maxSalaryUsd: Number.isFinite(item.salary_max) ? Number(item.salary_max) : undefined,
        postedAt: item.created,
      } as ExternalJob;
    })
    .filter(job => job.url && job.url !== '#');
}

function buildFallbackJobs(params: { query: string; country?: string; skills: string[]; limit: number }): ExternalJob[] {
  const seedSkills = params.skills.length > 0 ? params.skills.slice(0, 6) : ['JavaScript', 'React', 'SQL'];
  const baseCountry = params.country ?? 'Estados Unidos';

  const templates = [
    {
      title: `Frontend Developer (${params.query || 'React'})`,
      company: 'NovaBridge Labs',
      location: `${baseCountry} · Remoto`,
      remote: true,
      visaSponsorship: false,
      salary: [42000, 68000],
      extraSkills: ['React', 'TypeScript', 'Git'],
    },
    {
      title: `Data Analyst (${params.query || 'SQL'})`,
      company: 'Helix Mobility',
      location: `${baseCountry} · Hibrido`,
      remote: true,
      visaSponsorship: true,
      salary: [50000, 78000],
      extraSkills: ['SQL', 'Excel', 'Power BI'],
    },
    {
      title: `Backend Engineer (${params.query || 'Node.js'})`,
      company: 'Atlas Hiring',
      location: `${baseCountry} · On-site`,
      remote: false,
      visaSponsorship: true,
      salary: [70000, 110000],
      extraSkills: ['Node.js', 'Docker', 'AWS'],
    },
  ];

  const now = new Date().toISOString();

  const jobs = templates.map((template, index) => ({
    id: `fallback-${index}-${normalize(template.title)}`,
    source: 'FreedomOS Seed',
    title: template.title,
    company: template.company,
    location: template.location,
    country: baseCountry,
    url: `https://freedomos.vercel.app/jobs/${index + 1}`,
    description: 'Vacante semilla para pruebas de matching mientras se conectan APIs externas en produccion.',
    skills: deduplicateSkills([...seedSkills.slice(0, 2), ...template.extraSkills]),
    seniority: inferSeniority(template.title),
    remote: template.remote,
    visaSponsorship: template.visaSponsorship,
    minSalaryUsd: template.salary[0],
    maxSalaryUsd: template.salary[1],
    postedAt: now,
  }));

  return jobs.slice(0, Math.max(1, params.limit));
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as JobsRequest;

    const query = (body.query ?? '').trim();
    const skills = arrify(body.skills).filter(skill => typeof skill === 'string' && skill.trim().length > 0);
    const country = body.country?.trim();
    const limit = Math.max(1, Math.min(30, Number(body.limit) || 12));
    const normalizedQuery = query || skills.slice(0, 3).join(' ') || 'software';

    const cacheKey = JSON.stringify({ normalizedQuery, country, skills: skills.slice(0, 6), limit });
    const cached = getCached<{ jobs: ExternalJob[]; meta: Record<string, unknown> }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const adzunaJobs = await fetchAdzunaJobs({
      query: normalizedQuery,
      country,
      limit,
    });

    const fallbackJobs = adzunaJobs.length === 0
      ? buildFallbackJobs({ query: normalizedQuery, country, skills, limit })
      : [];

    const jobs = deduplicateJobs([...adzunaJobs, ...fallbackJobs]).slice(0, limit);

    const result = {
      jobs,
      meta: {
        total: jobs.length,
        query: normalizedQuery,
        country: country ?? null,
        providers: {
          adzuna: adzunaJobs.length,
          fallback: fallbackJobs.length,
        },
        generatedAt: new Date().toISOString(),
      },
    };

    setCached(cacheKey, result);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to fetch jobs' } },
      { status: 500 }
    );
  }
}
