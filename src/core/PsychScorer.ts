import type { RIASECQuestion } from '../data/riasecQuestions';
import type { BFI10Question } from '../data/bfi10Questions';
import type { RIASECCategory, RIASECScores, BigFiveScores, PsychProfile } from '../models/PsychProfile';

// Country RIASEC affinity (which Holland types are most valued in each country's labor market)
const COUNTRY_RIASEC_AFFINITY: Record<string, RIASECScores> = {
  'Alemania':        { R: 80, I: 90, C: 85, S: 40, E: 50, A: 30 },
  'Canadá':          { R: 60, I: 90, S: 80, E: 70, C: 55, A: 50 },
  'España':          { R: 40, I: 50, A: 80, S: 80, E: 70, C: 55 },
  'Países Bajos':    { R: 60, I: 90, A: 50, S: 55, E: 70, C: 80 },
  'Australia':       { R: 70, I: 80, A: 45, S: 75, E: 65, C: 60 },
  'Reino Unido':     { R: 45, I: 80, A: 60, S: 70, E: 80, C: 70 },
  'Portugal':        { R: 40, I: 60, A: 75, S: 75, E: 65, C: 55 },
  'Emiratos Árabes': { R: 60, I: 55, A: 35, S: 40, E: 90, C: 85 },
  'Estados Unidos':  { R: 60, I: 85, A: 65, S: 55, E: 90, C: 65 },
  'Irlanda':         { R: 50, I: 90, A: 55, S: 60, E: 75, C: 80 },
};

function normalize(sum: number, count: number): number {
  return Math.round(((sum / count - 1) / 4) * 100);
}

export function scoreRIASEC(questions: RIASECQuestion[], answers: number[]): RIASECScores {
  const sums: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  questions.forEach((q, i) => {
    sums[q.category] += answers[i] ?? 3;
    counts[q.category]++;
  });
  return {
    R: normalize(sums.R, counts.R),
    I: normalize(sums.I, counts.I),
    A: normalize(sums.A, counts.A),
    S: normalize(sums.S, counts.S),
    E: normalize(sums.E, counts.E),
    C: normalize(sums.C, counts.C),
  };
}

export function scoreBigFive(questions: BFI10Question[], answers: number[]): BigFiveScores {
  const sums: Record<string, number[]> = { O: [], C: [], E: [], A: [], N: [] };
  questions.forEach((q, i) => {
    const raw = answers[i] ?? 3;
    sums[q.trait].push(q.reversed ? 6 - raw : raw);
  });
  const avg = (arr: number[]) =>
    arr.length ? Math.round(((arr.reduce((a, b) => a + b, 0) / arr.length - 1) / 4) * 100) : 50;
  return { O: avg(sums.O), C: avg(sums.C), E: avg(sums.E), A: avg(sums.A), N: avg(sums.N) };
}

export function buildPsychProfile(riasec: RIASECScores, bigFive: BigFiveScores): PsychProfile {
  const topRIASEC = (Object.entries(riasec) as [RIASECCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  // Adaptability: Openness + Conscientiousness + Agreeableness, penalized by Neuroticism
  const adaptabilityScore = Math.min(100, Math.max(0, Math.round(
    bigFive.O * 0.35 + bigFive.C * 0.25 + bigFive.A * 0.2 - bigFive.N * 0.2 + 20
  )));

  // Integration risk based on Neuroticism and low Agreeableness
  const riskScore = bigFive.N * 0.6 + (100 - bigFive.A) * 0.4;
  const integrationRisk: 'bajo' | 'medio' | 'alto' =
    riskScore < 35 ? 'bajo' : riskScore < 60 ? 'medio' : 'alto';

  // Country match: dot product of person's RIASEC with each country's affinity profile
  const countryMatch = Object.entries(COUNTRY_RIASEC_AFFINITY).map(([country, affinity]) => {
    const keys = Object.keys(affinity) as RIASECCategory[];
    const dot = keys.reduce((acc, k) => acc + (riasec[k] / 100) * (affinity[k] / 100), 0);
    const base = (dot / keys.length) * 100;
    const score = Math.min(100, Math.round(base * 0.8 + adaptabilityScore * 0.2));
    return { country, score };
  }).sort((a, b) => b.score - a.score);

  return { riasec, bigFive, topRIASEC, adaptabilityScore, integrationRisk, countryMatch };
}
