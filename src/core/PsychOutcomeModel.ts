import type {
  AdaptationContextSnapshot,
  ObservedOutcomeLabel,
  PsychScreeningSession,
  ScreeningInstrumentId,
  ScreeningScore,
} from '../models/PsychScreening';

export interface MonitoringFlag {
  id: 'distress_elevated' | 'wellbeing_low' | 'support_need_high' | 'adaptation_risk_elevated';
  level: 'low' | 'medium' | 'high';
  sourceInstrumentIds: ScreeningInstrumentId[];
  rationale: string;
}

export interface OutcomeFeatureVector {
  latestPhq4?: number;
  latestWho5?: number;
  latestBrs?: number;
  latestOsss3?: number;
  deltaPhq4?: number;
  deltaWho5?: number;
  deltaBrs?: number;
  deltaOsss3?: number;
  responseQualityConfidence?: number;
  housingStable?: number;
  employmentStable?: number;
  localSupportLevel?: number;
  languageConfidence?: number;
  recentStressLevel?: number;
  sleepQuality?: number;
}

function sortSessionsByDate(sessions: PsychScreeningSession[]): PsychScreeningSession[] {
  return [...sessions].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
}

function getLatestScore(sessions: PsychScreeningSession[], instrumentId: ScreeningInstrumentId): ScreeningScore | undefined {
  const ordered = sortSessionsByDate(sessions);
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    const score = ordered[index].scores.find(entry => entry.instrumentId === instrumentId);
    if (score) return score;
  }
  return undefined;
}

function getBaselineScore(sessions: PsychScreeningSession[], instrumentId: ScreeningInstrumentId): ScreeningScore | undefined {
  const ordered = sortSessionsByDate(sessions);
  for (const session of ordered) {
    const score = session.scores.find(entry => entry.instrumentId === instrumentId);
    if (score) return score;
  }
  return undefined;
}

function toBinary(value?: boolean): number | undefined {
  if (value === undefined) return undefined;
  return value ? 1 : 0;
}

function getLatestContext(sessions: PsychScreeningSession[]): AdaptationContextSnapshot | undefined {
  const ordered = sortSessionsByDate(sessions);
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    if (ordered[index].context) return ordered[index].context;
  }
  return undefined;
}

function delta(latest?: number, baseline?: number): number | undefined {
  if (latest === undefined || baseline === undefined) return undefined;
  return latest - baseline;
}

export function buildOutcomeFeatureVector(sessions: PsychScreeningSession[]): OutcomeFeatureVector {
  const latestPhq4 = getLatestScore(sessions, 'phq4')?.raw;
  const latestWho5 = getLatestScore(sessions, 'who5')?.normalized ?? getLatestScore(sessions, 'who5')?.raw;
  const latestBrs = getLatestScore(sessions, 'brs')?.raw;
  const latestOsss3 = getLatestScore(sessions, 'osss3')?.raw;

  const baselinePhq4 = getBaselineScore(sessions, 'phq4')?.raw;
  const baselineWho5 = getBaselineScore(sessions, 'who5')?.normalized ?? getBaselineScore(sessions, 'who5')?.raw;
  const baselineBrs = getBaselineScore(sessions, 'brs')?.raw;
  const baselineOsss3 = getBaselineScore(sessions, 'osss3')?.raw;

  const latestSession = sortSessionsByDate(sessions).at(-1);
  const context = getLatestContext(sessions);

  return {
    latestPhq4,
    latestWho5,
    latestBrs,
    latestOsss3,
    deltaPhq4: delta(latestPhq4, baselinePhq4),
    deltaWho5: delta(latestWho5, baselineWho5),
    deltaBrs: delta(latestBrs, baselineBrs),
    deltaOsss3: delta(latestOsss3, baselineOsss3),
    responseQualityConfidence: latestSession?.responseQualityConfidence,
    housingStable: toBinary(context?.housingStable),
    employmentStable: toBinary(context?.employmentStable),
    localSupportLevel: context?.localSupportLevel,
    languageConfidence: context?.languageConfidence,
    recentStressLevel: context?.recentStressLevel,
    sleepQuality: context?.sleepQuality,
  };
}

export function deriveMonitoringFlags(sessions: PsychScreeningSession[]): MonitoringFlag[] {
  const flags: MonitoringFlag[] = [];
  const phq4 = getLatestScore(sessions, 'phq4')?.raw;
  const who5 = getLatestScore(sessions, 'who5')?.normalized ?? getLatestScore(sessions, 'who5')?.raw;
  const brs = getLatestScore(sessions, 'brs')?.raw;
  const osss3 = getLatestScore(sessions, 'osss3')?.raw;
  const context = getLatestContext(sessions);

  if (phq4 !== undefined && phq4 >= 6) {
    flags.push({
      id: 'distress_elevated',
      level: phq4 >= 9 ? 'high' : 'medium',
      sourceInstrumentIds: ['phq4'],
      rationale: 'PHQ-4 elevated screening range. Treat as a support flag, not a diagnosis.',
    });
  }

  if (who5 !== undefined && who5 < 50) {
    flags.push({
      id: 'wellbeing_low',
      level: who5 < 28 ? 'high' : 'medium',
      sourceInstrumentIds: ['who5'],
      rationale: 'WHO-5 wellbeing score is below the usual monitoring threshold.',
    });
  }

  if ((osss3 !== undefined && osss3 <= 8) || (context?.localSupportLevel !== undefined && context.localSupportLevel <= 2)) {
    flags.push({
      id: 'support_need_high',
      level: 'medium',
      sourceInstrumentIds: osss3 !== undefined ? ['osss3'] : ['adaptation_context'],
      rationale: 'Low social support is associated with increased support needs during adaptation.',
    });
  }

  const adaptationRiskSignals = [
    phq4 !== undefined && phq4 >= 6,
    who5 !== undefined && who5 < 50,
    brs !== undefined && brs < 3,
    osss3 !== undefined && osss3 <= 8,
    context?.housingStable === false,
    context?.employmentStable === false,
    context?.recentStressLevel !== undefined && context.recentStressLevel >= 4,
  ].filter(Boolean).length;

  if (adaptationRiskSignals >= 3) {
    flags.push({
      id: 'adaptation_risk_elevated',
      level: adaptationRiskSignals >= 5 ? 'high' : 'medium',
      sourceInstrumentIds: ['phq4', 'who5', 'brs', 'osss3', 'adaptation_context'],
      rationale: 'Multiple wellbeing, resilience, support, and context signals are elevated at the same time.',
    });
  }

  return flags;
}

export function deriveObservedOutcomeLabel(sessions: PsychScreeningSession[]): ObservedOutcomeLabel {
  const featureVector = buildOutcomeFeatureVector(sessions);
  return {
    measuredAt: sortSessionsByDate(sessions).at(-1)?.occurredAt ?? new Date().toISOString(),
    distressElevated: (featureVector.latestPhq4 ?? 0) >= 6,
    wellbeingLow: (featureVector.latestWho5 ?? 100) < 50,
    supportNeedHigh: (featureVector.latestOsss3 ?? 14) <= 8 || (featureVector.localSupportLevel ?? 5) <= 2,
    adaptationRiskElevated:
      ((featureVector.latestPhq4 ?? 0) >= 6 ? 1 : 0) +
      ((featureVector.latestWho5 ?? 100) < 50 ? 1 : 0) +
      ((featureVector.latestBrs ?? 5) < 3 ? 1 : 0) +
      ((featureVector.latestOsss3 ?? 14) <= 8 ? 1 : 0) +
      ((featureVector.housingStable ?? 1) === 0 ? 1 : 0) +
      ((featureVector.employmentStable ?? 1) === 0 ? 1 : 0) >= 3,
  };
}