import type { MigrantPerson } from '../models/MigrantPerson';

export interface ExternalJob {
  id: string;
  source: string;
  title: string;
  company: string;
  location: string;
  country?: string;
  url: string;
  description?: string;
  skills: string[];
  seniority?: 'entry' | 'junior' | 'mid' | 'senior';
  remote?: boolean;
  visaSponsorship?: boolean;
  minSalaryUsd?: number;
  maxSalaryUsd?: number;
  postedAt?: string;
}

export interface JobMatchBreakdown {
  skillScore: number;
  languageScore: number;
  seniorityScore: number;
  mobilityScore: number;
  salaryScore: number;
}

export interface JobMatchResult {
  job: ExternalJob;
  overallScore: number;
  breakdown: JobMatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = normalize(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function inferProfileSeniority(person: MigrantPerson): 'entry' | 'junior' | 'mid' | 'senior' {
  const totalYears = person.experience.reduce((acc, exp) => acc + (exp.durationYears || 0), 0);
  if (totalYears >= 8) return 'senior';
  if (totalYears >= 4) return 'mid';
  if (totalYears >= 1) return 'junior';
  return 'entry';
}

function mapSeniorityGap(profile: string, role: string): number {
  const levels: Record<string, number> = { entry: 0, junior: 1, mid: 2, senior: 3 };
  const gap = Math.abs((levels[profile] ?? 1) - (levels[role] ?? 1));
  if (gap === 0) return 95;
  if (gap === 1) return 78;
  if (gap === 2) return 58;
  return 40;
}

function languageScore(person: MigrantPerson, description: string | undefined): number {
  if (!description) return 60;
  const text = normalize(description);
  const requiresEnglish = text.includes('english') || text.includes('ingles');
  const requiresSpanish = text.includes('spanish') || text.includes('espanol');
  const known = person.languages.map(language => normalize(language));
  const hasEnglish = known.some(language => language.includes('english') || language.includes('ingles'));
  const hasSpanish = known.some(language => language.includes('spanish') || language.includes('espanol'));

  let score = 65;
  if (requiresEnglish) score += hasEnglish ? 20 : -20;
  if (requiresSpanish) score += hasSpanish ? 12 : -12;
  return clamp(score, 30, 96);
}

function mobilityScore(job: ExternalJob): number {
  let score = 60;
  if (job.remote) score += 16;
  if (job.visaSponsorship) score += 22;
  return clamp(score, 35, 96);
}

function salaryScore(job: ExternalJob): number {
  const max = job.maxSalaryUsd ?? job.minSalaryUsd;
  if (!max) return 58;
  if (max >= 140000) return 92;
  if (max >= 100000) return 84;
  if (max >= 70000) return 76;
  if (max >= 45000) return 68;
  return 56;
}

function skillBreakdown(personSkills: string[], jobSkills: string[]): {
  score: number;
  matched: string[];
  missing: string[];
} {
  const normalizedPerson = new Set(personSkills.map(skill => normalize(skill)));
  const canonicalJobSkills = unique(jobSkills);
  if (canonicalJobSkills.length === 0) {
    return { score: 55, matched: [], missing: [] };
  }

  const matched = canonicalJobSkills.filter(skill => normalizedPerson.has(normalize(skill)));
  const missing = canonicalJobSkills.filter(skill => !normalizedPerson.has(normalize(skill)));
  const score = clamp(Math.round((matched.length / canonicalJobSkills.length) * 100), 35, 98);

  return { score, matched, missing };
}

function reasonList(params: {
  matchedSkills: string[];
  missingSkills: string[];
  job: ExternalJob;
  breakdown: JobMatchBreakdown;
}): string[] {
  const reasons: string[] = [];
  if (params.matchedSkills.length > 0) {
    reasons.push(`Match de skills: ${params.matchedSkills.slice(0, 4).join(', ')}`);
  }
  if (params.job.visaSponsorship) {
    reasons.push('El puesto indica soporte de visa/relocation.');
  }
  if (params.job.remote) {
    reasons.push('El puesto permite modalidad remota o hibrida.');
  }
  if (params.breakdown.seniorityScore >= 80) {
    reasons.push('Tu seniority estimado esta alineado con el rol.');
  }
  if (params.missingSkills.length > 0) {
    reasons.push(`Brecha principal: ${params.missingSkills.slice(0, 2).join(', ')}`);
  }
  return reasons.slice(0, 4);
}

export function matchJobsForMigrant(person: MigrantPerson, jobs: ExternalJob[], limit = 12): JobMatchResult[] {
  const personSkills = unique(person.skills);
  const profileSeniority = inferProfileSeniority(person);

  const ranked = jobs.map(job => {
    const skill = skillBreakdown(personSkills, job.skills);
    const seniority = mapSeniorityGap(profileSeniority, job.seniority ?? 'mid');
    const language = languageScore(person, job.description);
    const mobility = mobilityScore(job);
    const salary = salaryScore(job);

    const breakdown: JobMatchBreakdown = {
      skillScore: skill.score,
      languageScore: language,
      seniorityScore: seniority,
      mobilityScore: mobility,
      salaryScore: salary,
    };

    const overallScore = Math.round(
      breakdown.skillScore * 0.5 +
      breakdown.languageScore * 0.15 +
      breakdown.seniorityScore * 0.15 +
      breakdown.mobilityScore * 0.1 +
      breakdown.salaryScore * 0.1
    );

    return {
      job,
      overallScore,
      breakdown,
      matchedSkills: skill.matched,
      missingSkills: skill.missing,
      reasons: reasonList({
        matchedSkills: skill.matched,
        missingSkills: skill.missing,
        job,
        breakdown,
      }),
    };
  });

  return ranked.sort((a, b) => b.overallScore - a.overallScore).slice(0, limit);
}
