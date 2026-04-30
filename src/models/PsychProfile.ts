export type RIASECCategory = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export const RIASEC_LABELS: Record<RIASECCategory, string> = {
  R: 'Realista',
  I: 'Investigador',
  A: 'Artístico',
  S: 'Social',
  E: 'Emprendedor',
  C: 'Convencional',
};

export type BigFiveTrait = 'O' | 'C' | 'E' | 'A' | 'N';

export const BIG_FIVE_LABELS: Record<BigFiveTrait, string> = {
  O: 'Apertura',
  C: 'Responsabilidad',
  E: 'Extraversión',
  A: 'Amabilidad',
  N: 'Neuroticismo',
};

export interface RIASECScores {
  R: number; // 0-100
  I: number;
  A: number;
  S: number;
  E: number;
  C: number;
}

export interface BigFiveScores {
  O: number; // 0-100
  C: number;
  E: number;
  A: number;
  N: number;
}

export interface PsychProfile {
  riasec: RIASECScores;
  bigFive: BigFiveScores;
  topRIASEC: RIASECCategory[];
  adaptabilityScore: number; // 0-100
  integrationRisk: 'bajo' | 'medio' | 'alto';
  countryMatch: { country: string; score: number }[];
}
