import type { RIASECQuestion } from '../data/riasecQuestions';
import type { BFI10Question } from '../data/bfi10Questions';
import type {
  RIASECCategory,
  RIASECScores,
  BigFiveScores,
  PsychProfile,
  ResponseQuality,
} from '../models/PsychProfile';

// Country RIASEC affinity (which Holland types are most valued in each country's labor market)
const COUNTRY_RIASEC_AFFINITY: Record<string, RIASECScores> = {
  // ── Europe ──────────────────────────────────────────────
  'Alemania':        { R: 80, I: 90, C: 85, S: 40, E: 50, A: 30 },
  'Austria':         { R: 70, I: 75, C: 80, S: 55, E: 60, A: 65 },
  'Bélgica':         { I: 75, C: 85, E: 70, S: 65, A: 55, R: 50 },
  'Chequia':         { R: 75, I: 70, C: 75, E: 55, S: 50, A: 50 },
  'Dinamarca':       { I: 80, S: 85, A: 65, E: 65, C: 70, R: 55 },
  'España':          { R: 40, I: 50, A: 80, S: 80, E: 70, C: 55 },
  'Finlandia':       { I: 90, R: 75, C: 80, S: 65, E: 55, A: 60 },
  'Francia':         { A: 80, S: 70, I: 65, E: 65, C: 60, R: 40 },
  'Irlanda':         { R: 50, I: 90, A: 55, S: 60, E: 75, C: 80 },
  'Italia':          { A: 85, R: 55, S: 65, E: 65, C: 55, I: 50 },
  'Noruega':         { R: 75, I: 80, S: 80, E: 60, C: 65, A: 50 },
  'Países Bajos':    { R: 60, I: 90, A: 50, S: 55, E: 70, C: 80 },
  'Polonia':         { R: 70, I: 70, C: 70, E: 60, S: 55, A: 50 },
  'Portugal':        { R: 40, I: 60, A: 75, S: 75, E: 65, C: 55 },
  'Reino Unido':     { R: 45, I: 80, A: 60, S: 70, E: 80, C: 70 },
  'Suecia':          { I: 85, S: 80, C: 75, E: 60, A: 65, R: 55 },
  'Suiza':           { I: 85, C: 90, R: 70, E: 65, S: 50, A: 45 },
  // ── Americas ────────────────────────────────────────────
  'Argentina':       { I: 65, A: 70, E: 65, S: 65, C: 55, R: 50 },
  'Brasil':          { E: 75, S: 70, A: 70, I: 60, C: 55, R: 55 },
  'Canadá':          { R: 60, I: 90, S: 80, E: 70, C: 55, A: 50 },
  'Chile':           { I: 65, E: 70, C: 65, S: 60, R: 60, A: 55 },
  'Colombia':        { E: 70, S: 75, A: 65, I: 55, C: 55, R: 55 },
  'Estados Unidos':  { R: 60, I: 85, A: 65, S: 55, E: 90, C: 65 },
  'México':          { E: 75, S: 70, A: 65, R: 60, C: 55, I: 50 },
  'Uruguay':         { S: 75, I: 65, A: 65, E: 60, C: 60, R: 50 },
  // ── Asia-Pacific ────────────────────────────────────────
  'Australia':       { R: 70, I: 80, A: 45, S: 75, E: 65, C: 60 },
  'Corea del Sur':   { I: 85, R: 80, C: 85, E: 65, A: 65, S: 45 },
  'Japón':           { R: 80, I: 85, C: 90, E: 55, S: 50, A: 60 },
  'Nueva Zelanda':   { S: 80, R: 70, I: 70, E: 65, A: 65, C: 60 },
  'Singapur':        { I: 90, E: 85, C: 85, R: 55, S: 60, A: 50 },
  'China':           { I: 85, R: 80, C: 90, E: 75, S: 45, A: 55 },
  'Rusia':           { I: 85, R: 75, C: 80, A: 65, E: 55, S: 45 },
  // ── Middle East ─────────────────────────────────────────
  'Arabia Saudita':  { E: 80, C: 80, R: 75, I: 65, S: 50, A: 35 },
  'Emiratos Árabes': { R: 60, I: 55, A: 35, S: 40, E: 90, C: 85 },
  'Qatar':           { E: 85, C: 85, R: 70, I: 60, S: 45, A: 35 },
  // ── Africa ──────────────────────────────────────────────
  'Sudáfrica':       { I: 65, E: 70, S: 65, R: 60, C: 60, A: 55 },
};

function normalize(sum: number, count: number): number {
  return Math.round(((sum / count - 1) / 4) * 100);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function mean(values: number[]): number {
  return values.length ? values.reduce((acc, v) => acc + v, 0) / values.length : 0;
}

function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const meanA = mean(a);
  const meanB = mean(b);
  const num = a.reduce((acc, ai, i) => acc + (ai - meanA) * (b[i] - meanB), 0);
  const denA = Math.sqrt(a.reduce((acc, ai) => acc + Math.pow(ai - meanA, 2), 0));
  const denB = Math.sqrt(b.reduce((acc, bi) => acc + Math.pow(bi - meanB, 2), 0));
  if (denA === 0 || denB === 0) return 0;
  return Math.max(-1, Math.min(1, num / (denA * denB)));
}

function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const sumSquares = a.reduce((acc, ai, i) => acc + Math.pow(ai - b[i], 2), 0);
  return Math.sqrt(sumSquares);
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

export function assessResponseQuality(answers: number[], responseTimesMs: number[]): ResponseQuality {
  const answered = answers.filter(v => v >= 1 && v <= 5);
  const completeness = Math.round((answered.length / answers.length) * 100);

  const averageResponseTimeMs = Math.round(mean(responseTimesMs.filter(v => v > 0)));
  const fastCount = responseTimesMs.filter(v => v > 0 && v < 1200).length;
  const fastResponseRate = Math.round((fastCount / Math.max(responseTimesMs.filter(v => v > 0).length, 1)) * 100);

  let maxRun = 1;
  let currentRun = 1;
  for (let i = 1; i < answers.length; i++) {
    if (answers[i] === answers[i - 1]) {
      currentRun += 1;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 1;
    }
  }
  const straightLiningRate = Math.round((maxRun / Math.max(answers.length, 1)) * 100);

  const acquiescenceIndex = Number((mean(answered) - 3).toFixed(2));

  let penalty = 0;
  if (completeness < 95) penalty += 30;
  if (fastResponseRate > 40) penalty += 20;
  if (straightLiningRate > 40) penalty += 20;
  if (Math.abs(acquiescenceIndex) > 1.1) penalty += 15;
  if (averageResponseTimeMs > 0 && averageResponseTimeMs < 1400) penalty += 15;

  const confidence = Math.max(0, Math.min(100, 100 - penalty));
  const level: 'alta' | 'media' | 'baja' = confidence >= 80 ? 'alta' : confidence >= 60 ? 'media' : 'baja';

  const warnings: string[] = [];
  if (fastResponseRate > 40) warnings.push('Respuestas muy rápidas detectadas; interpreta los resultados con cautela.');
  if (straightLiningRate > 40) warnings.push('Patrón repetitivo alto (straightlining); puede reducir la precisión del perfil.');
  if (Math.abs(acquiescenceIndex) > 1.1) warnings.push('Sesgo de aquiescencia elevado (tendencia a responder siempre alto o bajo).');
  if (completeness < 95) warnings.push('Hay respuestas faltantes imputadas en modo neutral.');

  return {
    completeness,
    averageResponseTimeMs,
    fastResponseRate,
    straightLiningRate,
    acquiescenceIndex,
    confidence,
    level,
    warnings,
  };
}

export function buildPsychProfile(
  riasec: RIASECScores,
  bigFive: BigFiveScores,
  responseQuality: ResponseQuality
): PsychProfile {
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

  // Hybrid country fit: profile correlation + normalized distance + adaptability.
  // This avoids over-relying on a single similarity index.
  const countryMatch = Object.entries(COUNTRY_RIASEC_AFFINITY).map(([country, affinity]) => {
    const keys = Object.keys(affinity) as RIASECCategory[];
    const userVector = keys.map(k => riasec[k] / 100);
    const marketVector = keys.map(k => affinity[k] / 100);

    const corr = pearsonCorrelation(userVector, marketVector);
    const corr01 = clamp01((corr + 1) / 2);

    const maxDist = Math.sqrt(keys.length);
    const distNorm = clamp01(euclideanDistance(userVector, marketVector) / maxDist);
    const closeness = 1 - distNorm;

    const scoreRaw = corr01 * 0.5 + closeness * 0.3 + (adaptabilityScore / 100) * 0.2;
    const score = Math.round(clamp01(scoreRaw) * 100);
    return { country, score };
  }).sort((a, b) => b.score - a.score);

  const interpretiveCautions = [
    'Instrumento de orientación: no equivale a diagnóstico clínico.',
    'El Big Five usado es BFI-10 (escala breve), útil para tamizaje inicial.',
  ];

  return {
    riasec,
    bigFive,
    topRIASEC,
    adaptabilityScore,
    integrationRisk,
    countryMatch,
    responseQuality,
    interpretiveCautions,
    countryMatchMethod: 'hybrid_v1',
  };
}
