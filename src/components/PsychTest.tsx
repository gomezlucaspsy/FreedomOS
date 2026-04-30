'use client';

import { useState } from 'react';
import { Brain, RotateCcw } from 'lucide-react';
import { RIASEC_QUESTIONS } from '../data/riasecQuestions';
import { BFI10_QUESTIONS } from '../data/bfi10Questions';
import { scoreRIASEC, scoreBigFive, buildPsychProfile, assessResponseQuality } from '../core/PsychScorer';
import { getPsychMemoryCycle } from '../core/PsychMemoryCycle';
import type { PsychProfile, RIASECCategory } from '../models/PsychProfile';
import { RIASEC_LABELS, BIG_FIVE_LABELS } from '../models/PsychProfile';

const LIKERT = ['Muy en desacuerdo', 'En desacuerdo', 'Neutral', 'De acuerdo', 'Muy de acuerdo'];

const RISK_COLORS = { bajo: '#00f5c4', medio: '#f5c400', alto: '#f55700' } as const;
const QUALITY_COLORS = { alta: '#00f5c4', media: '#f5c400', baja: '#f55700' } as const;

const RIASEC_COLORS: Record<RIASECCategory, string> = {
  R: '#ff6b35', I: '#4ecdc4', A: '#a855f7', S: '#22d3ee', E: '#f59e0b', C: '#6366f1',
};

const ALL_QUESTIONS = [...RIASEC_QUESTIONS, ...BFI10_QUESTIONS];
const TOTAL = ALL_QUESTIONS.length;
const RIASEC_COUNT = RIASEC_QUESTIONS.length;

// ─── Bar ─────────────────────────────────────────────────────────────────────
function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ background: '#1a1a1a', borderRadius: '4px', height: '6px' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
    </div>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────
function Results({ profile, onReset }: { profile: PsychProfile; onReset: () => void }) {
  const memoryCycle = getPsychMemoryCycle();
  const quality = profile.responseQuality;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* Holland code */}
      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Código Holland (top 3)
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {profile.topRIASEC.map(code => (
            <span key={code} style={{
              background: `${RIASEC_COLORS[code]}1a`,
              color: RIASEC_COLORS[code],
              border: `1px solid ${RIASEC_COLORS[code]}55`,
              borderRadius: '6px',
              padding: '0.3rem 0.8rem',
              fontWeight: 700,
              fontSize: '0.88rem',
            }}>
              {code} · {RIASEC_LABELS[code]}
            </span>
          ))}
        </div>
      </div>

      {/* RIASEC bars */}
      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Perfil Vocacional RIASEC
        </p>
        {(Object.entries(profile.riasec) as [RIASECCategory, number][]).map(([k, v]) => (
          <div key={k} style={{ marginBottom: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '0.15rem' }}>
              <span>{RIASEC_LABELS[k]}</span><span>{v}%</span>
            </div>
            <Bar value={v} color={RIASEC_COLORS[k]} />
          </div>
        ))}
      </div>

      {/* Big Five bars */}
      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Personalidad (Big Five)
        </p>
        {(Object.entries(profile.bigFive) as [keyof typeof profile.bigFive, number][]).map(([k, v]) => (
          <div key={k} style={{ marginBottom: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '0.15rem' }}>
              <span>{BIG_FIVE_LABELS[k]}</span><span>{v}%</span>
            </div>
            <Bar value={v} color="#6366f1" />
          </div>
        ))}
      </div>

      {/* Adaptability + Risk */}
      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <div style={{ flex: 1, background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '0.9rem', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Adaptabilidad</p>
          <p style={{ color: 'var(--accent-cyan)', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{profile.adaptabilityScore}%</p>
        </div>
        <div style={{ flex: 1, background: '#0a0a0a', border: `1px solid ${RISK_COLORS[profile.integrationRisk]}44`, borderRadius: '8px', padding: '0.9rem', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Riesgo integración</p>
          <p style={{ color: RISK_COLORS[profile.integrationRisk], fontSize: '1.1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>
            {profile.integrationRisk}
          </p>
        </div>
      </div>

      {/* Country match top 5 */}
      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
          Compatibilidad por país
        </p>
        {profile.countryMatch.slice(0, 5).map(({ country, score }) => (
          <div key={country} style={{ marginBottom: '0.45rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888', marginBottom: '0.15rem' }}>
              <span>{country}</span><span>{score}%</span>
            </div>
            <Bar value={score} color="var(--accent-cyan)" />
          </div>
        ))}
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', padding: '1rem' }}>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Ciclo de memoria psicológica
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {memoryCycle.entries.length === 0 ? (
            <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>
              Aún no hay recuerdos psicológicos guardados.
            </p>
          ) : memoryCycle.entries.map((entry, index) => (
            <div key={entry.id} style={{ border: '1px solid #1f1f1f', borderRadius: '8px', padding: '0.75rem 0.9rem', background: entry.stage === 'active' ? 'rgba(0,245,196,0.05)' : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.8rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ color: entry.stage === 'active' ? 'var(--accent-cyan)' : '#aaa', fontSize: '0.8rem', fontWeight: 700 }}>
                  {index === 0 ? 'Memoria actual' : `Memoria ${index + 1}`}
                </span>
                <span style={{ color: '#666', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {entry.stage === 'active' ? 'activa' : 'archivada'}
                </span>
              </div>
              <p style={{ color: '#888', fontSize: '0.74rem', margin: '0 0 0.35rem 0' }}>
                Creada: {new Date(entry.createdAt).toLocaleString()}
              </p>
              {entry.archivedAt && (
                <p style={{ color: '#666', fontSize: '0.74rem', margin: '0 0 0.35rem 0' }}>
                  Archivada: {new Date(entry.archivedAt).toLocaleString()}
                </p>
              )}
              <p style={{ color: '#ddd', fontSize: '0.82rem', margin: 0 }}>
                Holland {entry.profile.topRIASEC.join('')} · Adaptabilidad {entry.profile.adaptabilityScore}% · Riesgo {entry.profile.integrationRisk}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', padding: '1rem' }}>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Calidad psicométrica del intento
        </p>
        {quality ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#ddd' }}>
              Confianza del resultado:{' '}
              <strong style={{ color: QUALITY_COLORS[quality.level] }}>{quality.confidence}% ({quality.level})</strong>
            </p>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>
              Tiempo medio por ítem: {quality.averageResponseTimeMs} ms · Respuesta rápida: {quality.fastResponseRate}% · Patrón repetitivo: {quality.straightLiningRate}%
            </p>
            {quality.warnings.length > 0 && quality.warnings.map((warning) => (
              <p key={warning} style={{ margin: 0, fontSize: '0.78rem', color: '#f5c400' }}>
                • {warning}
              </p>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#888' }}>
            Perfil legado sin indicadores de calidad psicométrica.
          </p>
        )}
        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #1f1f1f', paddingTop: '0.7rem' }}>
          {(profile.interpretiveCautions ?? [
            'Instrumento de orientación; no sustituye evaluación clínica profesional.',
          ]).map(caution => (
            <p key={caution} style={{ margin: 0, fontSize: '0.75rem', color: '#777' }}>{caution}</p>
          ))}
        </div>
      </div>

      <button onClick={onReset} style={{
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
      }}>
        <RotateCcw size={12} /> Repetir test
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function PsychTest({ initialProfile = null, onProfileComplete, onProfileReset }: { initialProfile?: PsychProfile | null; onProfileComplete?: (p: PsychProfile) => void; onProfileReset?: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(TOTAL).fill(0));
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>(Array(TOTAL).fill(0));
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [profile, setProfile] = useState<PsychProfile | null>(initialProfile);

  const isIntro = step === 0;
  const isResults = step === TOTAL + 1 || (step === 0 && profile !== null);
  const questionIndex = step - 1;
  const progress = !isIntro && !isResults ? (questionIndex / TOTAL) * 100 : 0;
  const currentQuestion = !isIntro && !isResults ? ALL_QUESTIONS[questionIndex] : null;
  const phase = questionIndex < RIASEC_COUNT ? 'Bloque 1/2 · RIASEC' : 'Bloque 2/2 · Big Five';

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    const newTimes = [...responseTimesMs];
    newAnswers[questionIndex] = value;
    newTimes[questionIndex] = Math.max(0, Date.now() - questionStartedAt);
    setAnswers(newAnswers);
    setResponseTimesMs(newTimes);
    if (step === TOTAL) {
      const riasec = scoreRIASEC(RIASEC_QUESTIONS, newAnswers.slice(0, RIASEC_COUNT));
      const bigFive = scoreBigFive(BFI10_QUESTIONS, newAnswers.slice(RIASEC_COUNT));
      const quality = assessResponseQuality(newAnswers, newTimes);
      const built = buildPsychProfile(riasec, bigFive, quality);
      setProfile(built);
      onProfileComplete?.(built);
      setStep(TOTAL + 1);
    } else {
      setQuestionStartedAt(Date.now());
      setStep(s => s + 1);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers(Array(TOTAL).fill(0));
    setResponseTimesMs(Array(TOTAL).fill(0));
    setQuestionStartedAt(Date.now());
    setProfile(null);
    onProfileReset?.();
  };

  if (isIntro) {
    return (
      <div style={{ textAlign: 'center' }}>
        <Brain size={28} color="var(--accent-cyan)" style={{ marginBottom: '0.8rem' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '0.4rem' }}>
          <strong style={{ color: '#fff' }}>{TOTAL} preguntas · ~10 min</strong>
        </p>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
          RIASEC (intereses vocacionales) + Big Five (personalidad)
        </p>
        <p style={{ color: '#666', fontSize: '0.74rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          Uso orientativo y educativo. No constituye diagnóstico clínico ni reemplaza evaluación profesional.
        </p>
        <button onClick={() => { setQuestionStartedAt(Date.now()); setStep(1); }} style={{
          background: 'var(--accent-cyan)', color: '#000', border: 'none',
          borderRadius: '8px', padding: '0.7rem 2.2rem',
          fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
        }}>
          Comenzar Test
        </button>
      </div>
    );
  }

  if (isResults && profile) {
    return <Results profile={profile} onReset={reset} />;
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#555', marginBottom: '0.3rem' }}>
          <span>{phase}</span>
          <span>{step} / {TOTAL}</span>
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
        {LIKERT.map((label, i) => {
          const val = i + 1;
          const selected = answers[questionIndex] === val;
          return (
            <button key={i} onClick={() => handleAnswer(val)} style={{
              background: selected ? 'rgba(0,245,196,0.08)' : 'transparent',
              border: `1px solid ${selected ? 'var(--accent-cyan)' : '#2a2a2a'}`,
              borderRadius: '8px',
              padding: '0.55rem 1rem',
              color: selected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              textAlign: 'left',
              transition: 'all 0.12s',
            }}>
              {val}. {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
