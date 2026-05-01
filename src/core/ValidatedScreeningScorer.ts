import type { ValidatedQuestion } from '../data/validatedScreeningQuestions';
import type { ScreeningScore } from '../models/PsychScreening';

function scorePHQ4(answers: number[]): ScreeningScore {
  const sum = answers.slice(0, 4).reduce((acc, v) => acc + (v >= 1 && v <= 3 ? v - 1 : 0), 0);
  const normalized = Math.round((sum / 12) * 100);

  const severity =
    sum >= 9
      ? 'alto'
      : sum >= 6
        ? 'moderado'
        : sum >= 3
          ? 'leve'
          : 'normal';

  return {
    instrumentId: 'phq4',
    raw: sum,
    normalized,
    severity,
    interpretiveNotes: [
      'PHQ-4 is a brief distress screener. Score ≥6 suggests possible anxiety/depression.',
      'Not a diagnosis. If elevated, consider professional support.',
    ],
  };
}

function scoreWHO5(answers: number[]): ScreeningScore {
  const sliced = answers.slice(4, 9);
  const validAnswers = sliced.filter((v) => v >= 0 && v <= 5);
  const rawSum = validAnswers.reduce((acc, v) => acc + v, 0);
  const normalized = Math.round((rawSum / 25) * 100);

  const severity = normalized < 50 ? 'leve' : 'normal';

  return {
    instrumentId: 'who5',
    raw: rawSum,
    normalized,
    severity,
    interpretiveNotes: [
      'WHO-5 measures subjective well-being. Score <50 suggests low well-being.',
      'Use longitudinally to track changes in mood and engagement.',
    ],
  };
}

function scoreBRS(answers: number[]): ScreeningScore {
  const sliced = answers.slice(9, 15);
  const validAnswers = sliced.filter((v) => v >= 1 && v <= 5);
  const mean = validAnswers.length ? validAnswers.reduce((a, b) => a + b, 0) / validAnswers.length : 3;
  const normalized = Math.round(((mean - 1) / 4) * 100);

  const severity = mean < 3 ? 'leve' : 'normal';

  return {
    instrumentId: 'brs',
    raw: Math.round(mean * 100) / 100,
    normalized,
    severity,
    interpretiveNotes: [
      'BRS measures perceived resilience and recovery from stress.',
      'Low scores may indicate need for support or coping resources.',
    ],
  };
}

function scoreOSSS3(answers: number[]): ScreeningScore {
  const sliced = answers.slice(15, 18);
  const validAnswers = sliced.filter((v) => v >= 1 && v <= 5);
  const sum = validAnswers.reduce((acc, v) => acc + v, 0);
  const normalized = Math.round((sum / 15) * 100);

  const severity = sum <= 8 ? 'leve' : 'normal';

  return {
    instrumentId: 'osss3',
    raw: sum,
    normalized,
    severity,
    interpretiveNotes: [
      'OSSS-3 assesses perceived social support.',
      'Low scores may indicate isolation or need for community connection.',
    ],
  };
}

export function scoreValidatedBattery(answers: number[]): ScreeningScore[] {
  return [
    scorePHQ4(answers),
    scoreWHO5(answers),
    scoreBRS(answers),
    scoreOSSS3(answers),
  ];
}

export function assessValidatedResponseQuality(
  answers: number[],
  responseTimesMs: number[]
): { confidence: number; level: 'alta' | 'media' | 'baja'; warnings: string[] } {
  const answered = answers.filter((v) => v >= 0 && v <= 5);
  const completeness = Math.round((answered.length / answers.length) * 100);

  const fastResponseTimeMs = responseTimesMs.filter((v) => v > 0 && v < 800).length;
  const fastResponseRate = Math.round(
    (fastResponseTimeMs / Math.max(responseTimesMs.filter((v) => v > 0).length, 1)) * 100
  );

  let maxRun = 1;
  let currentRun = 1;
  for (let i = 1; i < answers.length; i += 1) {
    if (answers[i] === answers[i - 1]) {
      currentRun += 1;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 1;
    }
  }
  const straightLiningRate = Math.round((maxRun / Math.max(answers.length, 1)) * 100);

  let penalty = 0;
  if (completeness < 95) penalty += 20;
  if (fastResponseRate > 50) penalty += 25;
  if (straightLiningRate > 50) penalty += 25;

  const confidence = Math.max(0, Math.min(100, 100 - penalty));
  const level: 'alta' | 'media' | 'baja' = confidence >= 80 ? 'alta' : confidence >= 60 ? 'media' : 'baja';

  const warnings: string[] = [];
  if (fastResponseRate > 50)
    warnings.push('Very quick responses detected. Please take time to reflect on each question.');
  if (straightLiningRate > 50)
    warnings.push('Repetitive response pattern detected. Results may be less reliable.');
  if (completeness < 95) warnings.push('Some responses are missing. They have been imputed as neutral.');

  return { confidence, level, warnings };
}
