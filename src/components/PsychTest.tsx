'use client';

import { useState } from 'react';
import { Brain, RotateCcw, AlertCircle } from 'lucide-react';
import { ALL_VALIDATED_QUESTIONS, VALIDATED_COUNTS } from '../data/validatedScreeningQuestions';
import { scoreValidatedBattery, assessValidatedResponseQuality } from '../core/ValidatedScreeningScorer';
import { deriveMonitoringFlags } from '../core/PsychOutcomeModel';
import type { MonitoringFlag } from '../core/PsychOutcomeModel';
import { generateWeeklyInterventionPlan } from '../core/BehaviorInterventionEngine';
import { getScreeningSessions, storeScreeningSession } from '../core/ScreeningSessionStore';
import type { PsychScreeningSession } from '../models/PsychScreening';

const LIKERT_PHQ4 = ['Nunca', 'Varios días', 'Más de la mitad', 'Casi todos los días'];
const LIKERT_GENERIC = ['No, para nada', 'Pocas veces', 'A veces', 'A menudo', 'Siempre'];

const FLAG_COLORS = {
  low: '#00f5c4',
  medium: '#f5c400',
  high: '#f55700',
} as const;

const QUALITY_COLORS = { alta: '#00f5c4', media: '#f5c400', baja: '#f55700' } as const;

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: '4px', height: '6px' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
    </div>
  );
}

function MonitoringFlagDisplay({ flag }: { flag: MonitoringFlag }) {
  const color = flag.level === 'high' ? FLAG_COLORS.high : flag.level === 'medium' ? FLAG_COLORS.medium : FLAG_COLORS.low;

  return (
    <div style={{ background: '#0a0a0a', border: `1px solid ${color}44`, borderRadius: '8px', padding: '0.75rem', marginBottom: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
        <AlertCircle size={14} style={{ color }} />
        <span style={{ color, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>
          {flag.id.replace(/_/g, ' ')}
        </span>
        <span style={{ color: '#888', fontSize: '0.7rem', marginLeft: 'auto', textTransform: 'uppercase' }}>
          {flag.level}
        </span>
      </div>
      <p style={{ color: '#999', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
        {flag.rationale}
      </p>
    </div>
  );
}

function Results({ session, onReset }: { session: PsychScreeningSession; onReset: () => void }) {
  const sessions = getScreeningSessions();
  const flags = deriveMonitoringFlags(sessions);
  const interventionPlan = generateWeeklyInterventionPlan(sessions);
  const quality = session.responseQualityConfidence;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Screening completado
        </p>
        <p style={{ color: '#ddd', fontSize: '0.82rem', margin: 0 }}>
          Se han recogido 4 medidas validadas: PHQ-4 (distress), WHO-5 (bienestar), BRS (resiliencia), OSSS-3 (soporte social).
        </p>
      </div>

      {flags.length > 0 && (
        <div>
          <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
            Flags de monitoreo
          </p>
          {flags.map((flag) => (
            <MonitoringFlagDisplay key={flag.id} flag={flag} />
          ))}
        </div>
      )}

      {flags.length === 0 && (
        <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '0.9rem', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '0.82rem', margin: 0 }}>
            ✓ Sin flags de monitoreo elevados en este intento.
          </p>
        </div>
      )}

      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Scores por instrumento
        </p>
        {session.scores.map((score) => (
          <div key={score.instrumentId} style={{ marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '0.2rem' }}>
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{score.instrumentId}</span>
              <span>{score.normalized ?? score.raw}</span>
            </div>
            <Bar value={score.normalized ?? (score.raw / 100) * 100} color={score.severity === 'alto' ? FLAG_COLORS.high : score.severity === 'moderado' ? FLAG_COLORS.medium : FLAG_COLORS.low} />
            {score.interpretiveNotes && (
              <p style={{ color: '#666', fontSize: '0.7rem', margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                {score.interpretiveNotes[0]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', padding: '1rem' }}>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Plan semanal adaptativo
        </p>
        <p style={{ color: '#888', fontSize: '0.75rem', marginTop: 0, marginBottom: '0.8rem' }}>
          Intensidad actual: <strong style={{ color: '#ddd', textTransform: 'uppercase' }}>{interventionPlan.intensity}</strong>
        </p>

        {interventionPlan.actions.map((entry) => (
          <div key={entry.id} style={{ border: '1px solid #1f1f1f', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <strong style={{ color: '#e6e6e6', fontSize: '0.8rem' }}>{entry.title}</strong>
              <span style={{ color: '#777', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                {entry.step} · {entry.weeklyTarget}x/semana
              </span>
            </div>
            <p style={{ color: '#999', fontSize: '0.74rem', margin: '0 0 0.3rem 0' }}>
              <strong style={{ color: '#bbb' }}>Cue:</strong> {entry.cue}
            </p>
            <p style={{ color: '#999', fontSize: '0.74rem', margin: '0 0 0.3rem 0' }}>
              <strong style={{ color: '#bbb' }}>Accion:</strong> {entry.action}
            </p>
            <p style={{ color: '#999', fontSize: '0.74rem', margin: '0 0 0.3rem 0' }}>
              <strong style={{ color: '#bbb' }}>Refuerzo:</strong> {entry.reinforcement}
            </p>
            <p style={{ color: '#6e6e6e', fontSize: '0.7rem', margin: 0 }}>
              {entry.rationale}
            </p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '0.7rem' }}>
          {interventionPlan.guardrails.map((guardrail) => (
            <p key={guardrail} style={{ color: '#777', fontSize: '0.72rem', margin: '0 0 0.35rem 0' }}>
              • {guardrail}
            </p>
          ))}
        </div>
      </div>

      {sessions.length > 1 && (
        <div>
          <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
            Historial de sesiones
          </p>
          {sessions.slice(0, 6).map((sess, idx) => (
            <div key={sess.id} style={{ fontSize: '0.74rem', color: '#888', marginBottom: '0.3rem', padding: '0.4rem', borderLeft: `2px solid ${idx === 0 ? '#00f5c4' : '#333'}` }}>
              <span style={{ fontWeight: 600, color: idx === 0 ? '#00f5c4' : '#999' }}>
                {idx === 0 ? 'Última' : `Hace ${sess.id}`}
              </span>
              {' · '}
              {new Date(sess.occurredAt).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', padding: '1rem' }}>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Calidad de respuesta
        </p>
        {quality !== undefined ? (
          <div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#ddd', marginBottom: '0.3rem' }}>
              Confianza:{' '}
              <strong style={{ color: QUALITY_COLORS[quality >= 80 ? 'alta' : quality >= 60 ? 'media' : 'baja'] }}>
                {quality}%
              </strong>
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>Sin datos de calidad disponibles.</p>
        )}

        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #1f1f1f', paddingTop: '0.7rem' }}>
          <p style={{ margin: 0, fontSize: '0.73rem', color: '#777', lineHeight: 1.5 }}>
            Este screening es para seguimiento de bienestar, no para diagnóstico clínico. Si experimentas distress elevado o cambios de bienestar, consulta con un profesional de salud mental.
          </p>
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          background: 'transparent',
          color: '#555',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          padding: '0.45rem 1rem',
          cursor: 'pointer',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          alignSelf: 'flex-start',
        }}
      >
        <RotateCcw size={12} /> Repetir screening
      </button>
    </div>
  );
}

interface PsychTestProps {
  onScreeningSaved?: (session: PsychScreeningSession) => void;
}

export function PsychTest({ onScreeningSaved }: PsychTestProps) {
  const latestSession = getScreeningSessions()[0] ?? null;
  const [step, setStep] = useState(latestSession ? VALIDATED_COUNTS.total + 1 : 0);
  const [answers, setAnswers] = useState<number[]>(Array(VALIDATED_COUNTS.total).fill(0));
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>(Array(VALIDATED_COUNTS.total).fill(0));
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [session, setSession] = useState<PsychScreeningSession | null>(latestSession);

  const isIntro = step === 0;
  const isResults = step === VALIDATED_COUNTS.total + 1;
  const questionIndex = step - 1;
  const progress = !isIntro && !isResults ? (questionIndex / VALIDATED_COUNTS.total) * 100 : 0;
  const currentQuestion = !isIntro && !isResults ? ALL_VALIDATED_QUESTIONS[questionIndex] : null;

  const getLikert = (): string[] => {
    if (currentQuestion?.instrumentId === 'phq4') return LIKERT_PHQ4;
    return LIKERT_GENERIC;
  };

  const getPhaseLabel = (): string => {
    if (!currentQuestion) return '';
    const inst = currentQuestion.instrumentId;
    if (inst === 'phq4') return 'Bloque 1/4 · Distress';
    if (inst === 'who5') return 'Bloque 2/4 · Bienestar';
    if (inst === 'brs') return 'Bloque 3/4 · Resiliencia';
    if (inst === 'osss3') return 'Bloque 4/4 · Soporte social';
    return '';
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    const newTimes = [...responseTimesMs];
    const adjustedValue = currentQuestion?.instrumentId === 'phq4' ? value : value;
    newAnswers[questionIndex] = adjustedValue;
    newTimes[questionIndex] = Math.max(0, Date.now() - questionStartedAt);
    setAnswers(newAnswers);
    setResponseTimesMs(newTimes);

    if (step === VALIDATED_COUNTS.total) {
      const scores = scoreValidatedBattery(newAnswers);
      const { confidence, level, warnings } = assessValidatedResponseQuality(newAnswers, newTimes);

      const newSession: PsychScreeningSession = {
        id: `screening-${Date.now()}`,
        userId: 'anonymous',
        occurredAt: new Date().toISOString(),
        cadence: 'baseline',
        instrumentIds: ['phq4', 'who5', 'brs', 'osss3'],
        scores,
        responseQualityConfidence: confidence,
        notes: warnings.length > 0 ? warnings : undefined,
      };

      const stored = storeScreeningSession(newSession);
      setSession(stored);
      onScreeningSaved?.(stored);
      setStep(VALIDATED_COUNTS.total + 1);
    } else {
      setQuestionStartedAt(Date.now());
      setStep((s) => s + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers(Array(VALIDATED_COUNTS.total).fill(0));
    setResponseTimesMs(Array(VALIDATED_COUNTS.total).fill(0));
    setQuestionStartedAt(Date.now());
    setSession(null);
  };

  if (isIntro) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Brain size={28} color="var(--accent-cyan)" style={{ marginBottom: '0.8rem' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '0.4rem' }}>
          <strong style={{ color: '#fff' }}>{VALIDATED_COUNTS.total} preguntas · ~8 min</strong>
        </p>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          PHQ-4 · WHO-5 · BRS · OSSS-3
        </p>
        <p style={{ color: '#666', fontSize: '0.74rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          Screening validado de distress, bienestar, resiliencia y soporte social. Diseñado para seguimiento repetido. No es un diagnóstico clínico.
        </p>
        <button
          onClick={() => {
            setQuestionStartedAt(Date.now());
            setStep(1);
          }}
          style={{
            background: 'var(--accent-cyan)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '0.7rem 2.2rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Comenzar Screening
        </button>
      </div>
    );
  }

  if (isResults && session) {
    return <Results session={session} onReset={reset} />;
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#555', marginBottom: '0.3rem' }}>
          <span>{getPhaseLabel()}</span>
          <span>
            {step} / {VALIDATED_COUNTS.total}
          </span>
        </div>
        <div style={{ background: '#1a1a1a', borderRadius: '4px', height: '4px' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '4px', transition: 'width 0.2s' }} />
        </div>
      </div>

      {/* Question */}
      <p style={{ color: '#fff', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '1.5rem', minHeight: '3.5rem' }}>
        {currentQuestion?.text}
      </p>

      {/* Likert scale */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {getLikert().map((label, i) => {
          const val = i + 1;
          const selected = answers[questionIndex] === val;
          return (
            <button
              key={i}
              onClick={() => handleAnswer(val)}
              style={{
                background: selected ? 'rgba(0,245,196,0.08)' : 'transparent',
                border: `1px solid ${selected ? 'var(--accent-cyan)' : '#2a2a2a'}`,
                borderRadius: '8px',
                padding: '0.55rem 1rem',
                color: selected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.84rem',
                textAlign: 'left',
                transition: 'all 0.12s',
              }}
            >
              {val}. {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
