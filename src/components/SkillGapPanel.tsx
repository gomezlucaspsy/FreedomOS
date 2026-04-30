'use client';

import { useState } from 'react';
import { TrendingUp, Clock, Search } from 'lucide-react';
import { analyzeSkillGap, AVAILABLE_COUNTRIES } from '../core/SkillGapAnalyzer';
import type { MigrantPerson } from '../models/MigrantPerson';
import type { SkillRecommendation } from '../core/SkillGapAnalyzer';

const PRIORITY_COLORS = { crítica: '#f55700', alta: '#f5c400', media: '#00f5c4' } as const;

interface Props {
  migrant: MigrantPerson | null;
}

export function SkillGapPanel({ migrant }: Props) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [recommendations, setRecommendations] = useState<SkillRecommendation[] | null>(null);

  const handleAnalyze = () => {
    if (!migrant || !selectedCountry) return;
    setRecommendations(analyzeSkillGap(migrant, selectedCountry));
  };

  if (!migrant) {
    return (
      <p style={{ color: '#555', fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.7 }}>
        Primero sube tu CV en el panel<br />
        <strong style={{ color: '#666' }}>"Perfil Migratorio desde Documento"</strong>.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      {/* CV skills detected */}
      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          Habilidades detectadas en tu CV
        </p>
        {migrant.skills.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {migrant.skills.map(s => (
              <span key={s} style={{
                background: 'rgba(0,245,196,0.08)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(0,245,196,0.2)',
                borderRadius: '4px',
                padding: '0.15rem 0.5rem',
                fontSize: '0.75rem',
              }}>{s}</span>
            ))}
          </div>
        ) : (
          <p style={{ color: '#555', fontSize: '0.82rem' }}>No se detectaron habilidades reconocidas en el documento.</p>
        )}
      </div>

      {/* Country selector */}
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <select
          value={selectedCountry}
          onChange={e => { setSelectedCountry(e.target.value); setRecommendations(null); }}
          style={{
            flex: 1,
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '0.6rem 0.8rem',
            color: selectedCountry ? '#fff' : '#555',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">Selecciona el país destino...</option>
          {AVAILABLE_COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={handleAnalyze}
          disabled={!selectedCountry}
          style={{
            background: selectedCountry ? 'var(--accent-cyan)' : '#1a1a1a',
            color: selectedCountry ? '#000' : '#444',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            fontWeight: 700,
            cursor: selectedCountry ? 'pointer' : 'default',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s',
          }}
        >
          <Search size={14} /> Analizar
        </button>
      </div>

      {/* Results */}
      {recommendations !== null && (
        <>
          {recommendations.length === 0 ? (
            <div style={{
              background: 'rgba(0,245,196,0.05)',
              border: '1px solid rgba(0,245,196,0.2)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <p style={{ color: 'var(--accent-cyan)', fontWeight: 700, margin: 0 }}>
                ¡Tu perfil ya cubre las habilidades clave para {selectedCountry}!
              </p>
            </div>
          ) : (
            <>
              <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>
                {recommendations.length} habilidad{recommendations.length > 1 ? 'es' : ''} recomendada{recommendations.length > 1 ? 's' : ''} para mejorar tu empleabilidad en <strong style={{ color: '#888' }}>{selectedCountry}</strong>
              </p>
              {recommendations.map(rec => (
                <div key={rec.skill} style={{
                  background: '#0a0a0a',
                  border: `1px solid ${PRIORITY_COLORS[rec.priority]}33`,
                  borderRadius: '8px',
                  padding: '0.9rem 1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <TrendingUp size={13} color={PRIORITY_COLORS[rec.priority]} />
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{rec.skill}</strong>
                    </div>
                    <span style={{
                      color: PRIORITY_COLORS[rec.priority],
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                    }}>
                      {rec.priority}
                    </span>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.78rem', margin: '0 0 0.55rem' }}>{rec.reason}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#555', fontSize: '0.72rem' }}>
                      <Clock size={11} />
                      <span>~{rec.learningWeeks} {rec.learningWeeks === 1 ? 'semana' : 'semanas'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {rec.platforms.map(p => (
                        <span key={p} style={{
                          background: '#1a1a1a',
                          color: '#777',
                          border: '1px solid #2a2a2a',
                          borderRadius: '3px',
                          padding: '0.1rem 0.4rem',
                          fontSize: '0.7rem',
                        }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
