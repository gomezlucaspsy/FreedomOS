// Validated screening instruments for psychological outcome monitoring
// These are NOT diagnostic tools but rather brief screening measures suitable for repeated use

export interface ValidatedQuestion {
  id: number;
  instrumentId: 'phq4' | 'who5' | 'brs' | 'osss3';
  text: string;
  subscale?: string;
}

// ─── PHQ-4: Ultra-brief distress screening ───────────────────────────
// Kroenke, K., Spitzer, R. L., Williams, J. B., & Löwe, B. (2009).
// An ultra-brief screening scale for anxiety and depression: the PHQ-4.
// Psychosomatics, 50(6), 613-621.

export const PHQ4_QUESTIONS: ValidatedQuestion[] = [
  {
    id: 1,
    instrumentId: 'phq4',
    text: '¿Con qué frecuencia te has sentido nervioso/a, ansioso/a o tensionado/a?',
    subscale: 'anxiety',
  },
  {
    id: 2,
    instrumentId: 'phq4',
    text: '¿Con qué frecuencia has dejado de disfrutar de cosas que normalmente te gustan?',
    subscale: 'depression',
  },
  {
    id: 3,
    instrumentId: 'phq4',
    text: '¿Con qué frecuencia te has sentido poco esperanzado, deprimido o triste?',
    subscale: 'depression',
  },
  {
    id: 4,
    instrumentId: 'phq4',
    text: '¿Con qué frecuencia te has sentido cansado o con poca energía?',
    subscale: 'somatic',
  },
];

// Scoring: 0 = Nunca, 1 = Varios días, 2 = Más de la mitad de los días, 3 = Casi todos los días
// Range: 0-12. Cutoff: ≥6 suggests possible anxiety/depression disorder.

// ─── WHO-5: Well-Being Index ───────────────────────────────────────────
// Topp, C. W., Østergaard, S. D., Søndergaard, S., & Birkeland, P. (2015).
// The WHO-5 Well-Being Index: A systematic review of the literature.
// Psychotherapy and Psychosomatics, 84(3), 167-176.

export const WHO5_QUESTIONS: ValidatedQuestion[] = [
  {
    id: 1,
    instrumentId: 'who5',
    text: 'Me he sentido alegre y de buen humor.',
  },
  {
    id: 2,
    instrumentId: 'who5',
    text: 'Me he sentido tranquilo y relajado.',
  },
  {
    id: 3,
    instrumentId: 'who5',
    text: 'Me he sentido activo y vigoroso.',
  },
  {
    id: 4,
    instrumentId: 'who5',
    text: 'He dormido bien y me he sentido descansado.',
  },
  {
    id: 5,
    instrumentId: 'who5',
    text: 'Mi vida diaria ha sido llena de cosas que me interesan.',
  },
];

// Scoring: 0-5 (Likert). Raw sum 0-25, multiply by 4 for 0-100 scale.
// Interpretation: <50 indicates risk of depression.

// ─── BRS: Brief Resilience Scale ──────────────────────────────────────
// Smith, B. W., Dalen, J., Wiggins, K., Tooley, E., Christopher, P., & Bernard, J. (2008).
// The Brief Resilience Scale: Assessing the Ability to Bounce Back.
// International Journal of Behavioral Medicine, 15(3), 194-200.

export const BRS_QUESTIONS: ValidatedQuestion[] = [
  {
    id: 1,
    instrumentId: 'brs',
    text: 'Tengo la capacidad de recuperarme rápidamente cuando enfrento momentos difíciles.',
  },
  {
    id: 2,
    instrumentId: 'brs',
    text: 'Puedo adaptarme bien a cambios difíciles o estresantes.',
  },
  {
    id: 3,
    instrumentId: 'brs',
    text: 'Es fácil para mí superar los momentos de estrés.',
  },
  {
    id: 4,
    instrumentId: 'brs',
    text: 'Tengo una tendencia a recuperarme rápidamente después de eventos difíciles.',
  },
  {
    id: 5,
    instrumentId: 'brs',
    text: 'No me cuesta recuperarme después de situaciones adversas.',
  },
  {
    id: 6,
    instrumentId: 'brs',
    text: 'Puedo manejar bien eventos estresantes.',
  },
];

// Scoring: 1-5 (Likert). Mean of items. Range: 1-5.
// Interpretation: ≤3 indicates low resilience.

// ─── OSSS-3: Oslo Social Support Scale (3-item) ───────────────────────
// Broadhead, W. E., Gehlbach, S. H., de Gruy, F. V., & Kaplan, B. H. (1988).
// The Duke-UNC Functional Social Support Questionnaire.
// Med Care, 26(7), 709-23.
// Adapted to 3-item Oslo version for brevity.

export const OSSS3_QUESTIONS: ValidatedQuestion[] = [
  {
    id: 1,
    instrumentId: 'osss3',
    text: '¿Cuántas personas cercanas sientes que puedes contar con en caso de necesidad?',
  },
  {
    id: 2,
    instrumentId: 'osss3',
    text: '¿Con qué frecuencia puedes hablar con estas personas sobre cosas que son importantes para ti?',
  },
  {
    id: 3,
    instrumentId: 'osss3',
    text: '¿Con qué frecuencia reciben ayuda práctica de estos amigos o familia cuando la necesitas?',
  },
];

// Scoring for OSSS-3 varies by item:
// Item 1: 1-5 (none to many)
// Items 2-3: 1-5 (never to always)
// Sum: 3-15. Low social support: ≤8.

export const ALL_VALIDATED_QUESTIONS = [
  ...PHQ4_QUESTIONS,
  ...WHO5_QUESTIONS,
  ...BRS_QUESTIONS,
  ...OSSS3_QUESTIONS,
];

export const VALIDATED_COUNTS = {
  phq4: PHQ4_QUESTIONS.length,
  who5: WHO5_QUESTIONS.length,
  brs: BRS_QUESTIONS.length,
  osss3: OSSS3_QUESTIONS.length,
  total: ALL_VALIDATED_QUESTIONS.length,
};
