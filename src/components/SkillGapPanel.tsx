'use client';

import { useState } from 'react';
import { TrendingUp, Clock, Search, ChevronDown } from 'lucide-react';
import {
  analyzeSkillGap,
  AVAILABLE_COUNTRIES,
  getCareerPaths,
  CAREER_PATHS,
  getSkillGapDiagnostics,
  getDemandTierForCountry,
  getProfileAlignment,
} from '../core/SkillGapAnalyzer';
import {
  getCountryMobilityPack,
  getRecommendedPortalsForProfile,
  getVisaTypeLabel,
} from '../core/CountryMobilityMap';
import type { MigrantPerson } from '../models/MigrantPerson';
import type { SkillRecommendation, CareerPath } from '../core/SkillGapAnalyzer';
import type { CountryDemandDiagnostics } from '../core/RigorousData';

const PRIORITY_COLORS = { crítica: '#f55700', alta: '#f5c400', media: '#00f5c4' } as const;
const BARRIER_COLORS = { ninguna: '#00f5c4', baja: '#f5c400', media: '#f55700' } as const;

interface Props {
  migrant: MigrantPerson | null;
}

function CareerPathCard({ path, matched }: { path: CareerPath; matched: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: matched ? 'rgba(0,245,196,0.04)' : '#0a0a0a',
      border: `1px solid ${matched ? 'rgba(0,245,196,0.2)' : '#1f1f1f'}`,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>{path.icon}</span>
          <strong style={{ color: matched ? 'var(--accent-cyan)' : '#888', fontSize: '0.88rem' }}>{path.sector}</strong>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            fontSize: '0.65rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 700,
            color: BARRIER_COLORS[path.entryBarrier],
          }}>
            Entrada {path.entryBarrier}
          </span>
          <ChevronDown size={13} color="#555" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1rem 0.9rem', borderTop: '1px solid #1a1a1a' }}>
          <p style={{ color: '#666', fontSize: '0.78rem', margin: '0.6rem 0 0.8rem' }}>{path.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {path.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <div style={{
                  minWidth: 22, height: 22, borderRadius: '50%',
                  background: i === 0 ? 'rgba(0,245,196,0.15)' : '#1a1a1a',
                  border: `1px solid ${i === 0 ? 'rgba(0,245,196,0.4)' : '#2a2a2a'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i === 0 ? 'var(--accent-cyan)' : '#555', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                    <span style={{ color: '#ddd', fontSize: '0.83rem', fontWeight: 600 }}>{step.role}</span>
                    <span style={{ color: '#00f5c4', fontSize: '0.72rem', fontWeight: 600 }}>{step.salaryRange}</span>
                    {step.timeMonths > 0 && (
                      <span style={{ color: '#444', fontSize: '0.7rem' }}>
                        <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />+{step.timeMonths} meses
                      </span>
                    )}
                  </div>
                  {step.note && <p style={{ color: '#555', fontSize: '0.73rem', margin: '0.15rem 0 0', lineHeight: 1.5 }}>{step.note}</p>}
                  {step.skillsToLearn.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' as const, marginTop: '0.25rem' }}>
                      {step.skillsToLearn.map(s => (
                        <span key={s} style={{
                          background: '#1a1a1a', color: '#777', border: '1px solid #2a2a2a',
                          borderRadius: '3px', padding: '0.08rem 0.35rem', fontSize: '0.67rem',
                        }}>📚 {s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillGapPanel({ migrant }: Props) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [recommendations, setRecommendations] = useState<SkillRecommendation[] | null>(null);
  const [diagnostics, setDiagnostics] = useState<CountryDemandDiagnostics | null>(null);
  const [isLoadingDiagnostics, setIsLoadingDiagnostics] = useState(false);
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gaps' | 'careers'>('gaps');

  const handleAnalyze = async () => {
    if (!migrant || !selectedCountry) return;

    setDiagnosticsError(null);
    setRecommendations(analyzeSkillGap(migrant, selectedCountry));
    const fallbackDiagnostics = getSkillGapDiagnostics(migrant, selectedCountry);
    setDiagnostics(fallbackDiagnostics);

    setIsLoadingDiagnostics(true);
    try {
      const response = await fetch('/api/rigorous-data', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          country: selectedCountry,
          demandTier: getDemandTierForCountry(selectedCountry),
          profileAlignment: getProfileAlignment(migrant, selectedCountry),
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo consultar fuentes en vivo');
      }

      const data = await response.json();
      if (data?.diagnostics) {
        setDiagnostics(data.diagnostics as CountryDemandDiagnostics);
      }
    } catch {
      setDiagnosticsError('Mostrando estimacion local: fuentes en vivo no disponibles temporalmente.');
    } finally {
      setIsLoadingDiagnostics(false);
    }
  };

  const careerPaths = migrant ? getCareerPaths(migrant.skills) : CAREER_PATHS.map(path => ({ path, matched: false }));
  const mobilityPack = selectedCountry ? getCountryMobilityPack(selectedCountry) : null;
  const recommendedPortals = mobilityPack ? getRecommendedPortalsForProfile(mobilityPack, migrant.skills, 10) : [];

  if (!migrant) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#555', fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
          Sube tu CV para ver brechas personalizadas.<br />
          <strong style={{ color: '#666' }}>Las rutas de carrera están disponibles sin CV.</strong>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: 0 }}>
            🗺️ Rutas de carrera realistas para inmigrantes
          </p>
          {careerPaths.map(({ path, matched }) => (
            <CareerPathCard key={path.id} path={path} matched={matched} />
          ))}
        </div>
      </div>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid #1f1f1f', paddingBottom: '0' }}>
        {(['gaps', 'careers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem', fontWeight: 600,
              color: activeTab === tab ? 'var(--accent-cyan)' : '#555',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-cyan)' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            {tab === 'gaps' ? '🎯 Brechas por país' : '🗺️ Rutas de carrera'}
          </button>
        ))}
      </div>

      {/* Tab: Skill Gap */}
      {activeTab === 'gaps' && (
        <>
          {/* Country selector */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <select
              value={selectedCountry}
              onChange={e => {
                setSelectedCountry(e.target.value);
                setRecommendations(null);
                setDiagnostics(null);
                setDiagnosticsError(null);
              }}
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
              {diagnostics && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid #242424',
                  borderRadius: '8px',
                  padding: '0.8rem 0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <div style={{ color: '#bbb', fontSize: '0.78rem' }}>
                      Rigurosidad de datos · modelo <strong style={{ color: '#ddd' }}>{diagnostics.modelVersion}</strong>
                    </div>
                    <div style={{ color: '#888', fontSize: '0.74rem' }}>
                      {isLoadingDiagnostics ? 'Sincronizando fuentes en vivo...' : `Actualizado: ${new Date(diagnostics.updatedAt).toLocaleDateString('es-ES')}`}
                    </div>
                  </div>

                  {diagnosticsError && (
                    <p style={{ color: '#8b7f6a', fontSize: '0.72rem', margin: 0 }}>
                      {diagnosticsError}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.88rem' }}>
                      Score demanda: {diagnostics.score}/100
                    </span>
                    <span style={{ color: '#999', fontSize: '0.78rem' }}>
                      Confianza: {diagnostics.confidenceScore}/100 ({diagnostics.confidenceLevel})
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {diagnostics.components.map(component => (
                      <div key={component.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', fontSize: '0.74rem' }}>
                        <span style={{ color: '#7d7d7d' }}>{component.label}</span>
                        <span style={{ color: '#9a9a9a' }}>
                          {component.value}/100 · peso {(component.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {diagnostics.sources.map(source => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#8fcfc2',
                          border: '1px solid #24453f',
                          background: 'rgba(0,245,196,0.06)',
                          borderRadius: '4px',
                          padding: '0.12rem 0.42rem',
                          fontSize: '0.7rem',
                          textDecoration: 'none',
                        }}
                      >
                        {source.name}
                      </a>
                    ))}
                  </div>

                  {diagnostics.legalLimitations.map(limitation => (
                    <p key={limitation} style={{ color: '#737373', fontSize: '0.72rem', margin: 0, lineHeight: 1.5 }}>
                      {limitation}
                    </p>
                  ))}
                </div>
              )}

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

              {mobilityPack && (
                <div style={{
                  marginTop: '0.3rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid #232323',
                  borderRadius: '8px',
                  padding: '0.9rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <p style={{ color: '#d6d6d6', fontSize: '0.8rem', margin: 0, fontWeight: 700 }}>
                      Rutas migratorias y portales recomendados para {mobilityPack.country}
                    </p>
                    <span style={{ color: '#777', fontSize: '0.72rem' }}>
                      Verifica siempre requisitos vigentes en fuentes oficiales.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {mobilityPack.visaTracks.map(track => (
                      <div key={track.id} style={{
                        background: '#0a0a0a',
                        border: '1px solid #1f1f1f',
                        borderRadius: '8px',
                        padding: '0.7rem 0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#e3e3e3', fontSize: '0.82rem' }}>{track.title}</strong>
                          <span style={{
                            color: '#84d6c9',
                            border: '1px solid #24453f',
                            background: 'rgba(0,245,196,0.08)',
                            borderRadius: '4px',
                            padding: '0.1rem 0.42rem',
                            fontSize: '0.68rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 700,
                          }}>
                            {getVisaTypeLabel(track.type)}
                          </span>
                        </div>

                        <p style={{ color: '#8d8d8d', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>
                          {track.summary}
                        </p>

                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' as const }}>
                          {track.requiredSkills.map(skill => (
                            <span key={skill} style={{
                              background: '#171717',
                              color: '#8ccbc0',
                              border: '1px solid #243f3a',
                              borderRadius: '3px',
                              padding: '0.08rem 0.35rem',
                              fontSize: '0.67rem',
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                          <a
                            href={track.officialUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: '#8fcfc2',
                              border: '1px solid #24453f',
                              background: 'rgba(0,245,196,0.06)',
                              borderRadius: '4px',
                              padding: '0.12rem 0.45rem',
                              fontSize: '0.7rem',
                              textDecoration: 'none',
                            }}
                          >
                            Fuente oficial
                          </a>
                          <span style={{ color: '#6e6e6e', fontSize: '0.69rem' }}>{track.caution}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ color: '#bdbdbd', fontSize: '0.77rem', margin: 0, fontWeight: 600 }}>
                      Portales recomendados para postular
                    </p>
                    {recommendedPortals.length === 0 ? (
                      <p style={{ color: '#666', fontSize: '0.73rem', margin: 0 }}>
                        Sin portales priorizados para este perfil por ahora.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gap: '0.45rem' }}>
                        {recommendedPortals.map(portal => (
                          <a
                            key={portal.id}
                            href={portal.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '0.6rem',
                              alignItems: 'center',
                              background: '#0a0a0a',
                              border: '1px solid #1f1f1f',
                              borderRadius: '6px',
                              padding: '0.48rem 0.6rem',
                              textDecoration: 'none',
                            }}
                          >
                            <span style={{ color: '#dadada', fontSize: '0.76rem' }}>{portal.name}</span>
                            <span style={{
                              color: portal.category === 'government' ? '#a8d8c8' : '#888',
                              fontSize: '0.67rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}>
                              {portal.category}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Tab: Career Paths */}
      {activeTab === 'careers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ color: '#555', fontSize: '0.78rem', margin: '0 0 0.3rem', lineHeight: 1.6 }}>
            Rutas realistas desde el primer día en el país. Las marcadas en verde corresponden a habilidades de tu CV.
          </p>
          {careerPaths.map(({ path, matched }) => (
            <CareerPathCard key={path.id} path={path} matched={matched} />
          ))}
        </div>
      )}
    </div>
  );
}
