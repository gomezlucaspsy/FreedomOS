export type ScreeningInstrumentId =
  | 'riasec_interest'
  | 'bfi10'
  | 'phq4'
  | 'who5'
  | 'brs'
  | 'osss3'
  | 'adaptation_context';

export type ScreeningPurpose = 'orientation' | 'monitoring' | 'prediction-input';

export type ScreeningCadence = 'baseline' | 'followup_2w' | 'followup_6w' | 'followup_12w' | 'quarterly';

export type EvidenceLevel = 'validated-short-form' | 'validated-brief-monitoring' | 'contextual-self-report';

export interface ScreeningInstrumentDefinition {
  id: ScreeningInstrumentId;
  label: string;
  domains: string[];
  purpose: ScreeningPurpose[];
  repeatedUse: boolean;
  evidenceLevel: EvidenceLevel;
  notes: string[];
}

export interface ScreeningSubscaleScore {
  id: string;
  label: string;
  raw: number;
  normalized?: number;
}

export interface ScreeningScore {
  instrumentId: ScreeningInstrumentId;
  raw: number;
  normalized?: number;
  severity?: 'normal' | 'leve' | 'moderado' | 'alto';
  subscales?: ScreeningSubscaleScore[];
  interpretiveNotes?: string[];
}

export interface AdaptationContextSnapshot {
  employmentStable?: boolean;
  housingStable?: boolean;
  localSupportLevel?: number;
  languageConfidence?: number;
  recentStressLevel?: number;
  sleepQuality?: number;
}

export interface PsychScreeningSession {
  id: string;
  userId: string;
  occurredAt: string;
  cadence: ScreeningCadence;
  instrumentIds: ScreeningInstrumentId[];
  scores: ScreeningScore[];
  responseQualityConfidence?: number;
  context?: AdaptationContextSnapshot;
  notes?: string[];
}

export interface ObservedOutcomeLabel {
  measuredAt: string;
  distressElevated: boolean;
  wellbeingLow: boolean;
  supportNeedHigh: boolean;
  adaptationRiskElevated: boolean;
}

export const PSYCH_SCREENING_INSTRUMENTS: Record<ScreeningInstrumentId, ScreeningInstrumentDefinition> = {
  riasec_interest: {
    id: 'riasec_interest',
    label: 'RIASEC interest profile',
    domains: ['vocational-interest'],
    purpose: ['orientation', 'prediction-input'],
    repeatedUse: false,
    evidenceLevel: 'contextual-self-report',
    notes: ['Use for orientation and fit exploration, not as a mental-health outcome measure.'],
  },
  bfi10: {
    id: 'bfi10',
    label: 'BFI-10',
    domains: ['personality'],
    purpose: ['orientation', 'prediction-input'],
    repeatedUse: false,
    evidenceLevel: 'validated-short-form',
    notes: ['Brief trait reference. Useful as an input, but limited for individual prediction by itself.'],
  },
  phq4: {
    id: 'phq4',
    label: 'PHQ-4',
    domains: ['distress', 'anxiety', 'depression'],
    purpose: ['monitoring', 'prediction-input'],
    repeatedUse: true,
    evidenceLevel: 'validated-brief-monitoring',
    notes: ['Suitable for brief follow-up distress screening. Not a diagnosis.'],
  },
  who5: {
    id: 'who5',
    label: 'WHO-5 Well-Being Index',
    domains: ['wellbeing'],
    purpose: ['monitoring', 'prediction-input'],
    repeatedUse: true,
    evidenceLevel: 'validated-brief-monitoring',
    notes: ['Suitable for repeated wellbeing tracking.'],
  },
  brs: {
    id: 'brs',
    label: 'Brief Resilience Scale',
    domains: ['resilience'],
    purpose: ['monitoring', 'prediction-input'],
    repeatedUse: true,
    evidenceLevel: 'validated-brief-monitoring',
    notes: ['Useful as a protective-factor input in follow-up models.'],
  },
  osss3: {
    id: 'osss3',
    label: 'Oslo Social Support Scale 3',
    domains: ['social-support'],
    purpose: ['monitoring', 'prediction-input'],
    repeatedUse: true,
    evidenceLevel: 'validated-brief-monitoring',
    notes: ['Useful for support-need flags and adaptation modeling.'],
  },
  adaptation_context: {
    id: 'adaptation_context',
    label: 'Adaptation context quick check',
    domains: ['housing', 'employment', 'support', 'language', 'stress', 'sleep'],
    purpose: ['monitoring', 'prediction-input'],
    repeatedUse: true,
    evidenceLevel: 'contextual-self-report',
    notes: ['Context variables often add more predictive value than a trait measure alone.'],
  },
};

export const BASELINE_SCREENING_BATTERY: ScreeningInstrumentId[] = ['riasec_interest', 'bfi10', 'phq4', 'who5', 'brs', 'osss3', 'adaptation_context'];

export const FOLLOWUP_SCREENING_BATTERY: ScreeningInstrumentId[] = ['phq4', 'who5', 'brs', 'osss3', 'adaptation_context'];