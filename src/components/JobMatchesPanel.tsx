'use client';

import { useMemo, useState } from 'react';
import { Briefcase, Search, ExternalLink, Radar, CheckCircle2, CircleDashed } from 'lucide-react';
import { AVAILABLE_COUNTRIES } from '../core/SkillGapAnalyzer';
import { matchJobsForMigrant, type ExternalJob, type JobMatchResult } from '../core/JobMatcher';
import type { MigrantPerson } from '../models/MigrantPerson';

interface JobsApiResponse {
  jobs: ExternalJob[];
  meta?: {
    total?: number;
    providers?: {
      adzuna?: number;
      fallback?: number;
    };
  };
}

interface Props {
  migrant: MigrantPerson | null;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#00f5c4';
  if (score >= 65) return '#f5c400';
  return '#f55700';
}

export function JobMatchesPanel({ migrant }: Props) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [query, setQuery] = useState('');
  const [rawJobs, setRawJobs] = useState<ExternalJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<{ adzuna?: number; fallback?: number } | null>(null);

  const matches = useMemo<JobMatchResult[]>(() => {
    if (!migrant) return [];
    return matchJobsForMigrant(migrant, rawJobs, 12);
  }, [migrant, rawJobs]);

  const suggestedQuery = useMemo(() => {
    if (!migrant || migrant.skills.length === 0) return 'software developer';
    return migrant.skills.slice(0, 3).join(' ');
  }, [migrant]);

  const handleSearch = async () => {
    if (!migrant) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          country: selectedCountry || undefined,
          query: query.trim() || undefined,
          skills: migrant.skills,
          limit: 18,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar vacantes en este momento.');
      }

      const data = (await response.json()) as JobsApiResponse;
      setRawJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setProviders(data.meta?.providers ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Error cargando vacantes.');
    } finally {
      setLoading(false);
    }
  };

  if (!migrant) {
    return (
      <p style={{ color: '#555', fontSize: '0.86rem', margin: 0, textAlign: 'center', lineHeight: 1.7 }}>
        Sube tu CV para activar matching con vacantes reales y ranking explicable.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
        <select
          value={selectedCountry}
          onChange={event => setSelectedCountry(event.target.value)}
          style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '8px',
            color: selectedCountry ? '#fff' : '#666',
            fontSize: '0.82rem',
            padding: '0.58rem 0.62rem',
            outline: 'none',
          }}
        >
          <option value="">Pais destino (opcional)</option>
          {AVAILABLE_COUNTRIES.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={suggestedQuery}
          style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.82rem',
            padding: '0.58rem 0.62rem',
            outline: 'none',
          }}
        />
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        style={{
          border: 'none',
          borderRadius: '8px',
          background: loading ? '#133f38' : 'var(--accent-cyan)',
          color: '#00130f',
          fontWeight: 700,
          fontSize: '0.82rem',
          padding: '0.62rem 0.8rem',
          cursor: loading ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.45rem',
        }}
      >
        <Search size={14} /> {loading ? 'Buscando vacantes...' : 'Buscar y rankear vacantes'}
      </button>

      {providers && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap',
          color: '#666',
          fontSize: '0.72rem',
        }}>
          <span>
            Fuentes: Adzuna {providers.adzuna ?? 0} · Seed {providers.fallback ?? 0}
          </span>
          <span>{matches.length} vacantes rankeadas</span>
        </div>
      )}

      {error && <p style={{ color: '#f55700', fontSize: '0.8rem', margin: 0 }}>{error}</p>}

      {matches.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {matches.map(match => (
            <article
              key={`${match.job.source}-${match.job.id}`}
              style={{
                background: '#0a0a0a',
                border: '1px solid #212121',
                borderRadius: '8px',
                padding: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.45rem' }}>
                  <Briefcase size={15} color="#8ba8a1" style={{ marginTop: '0.08rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <strong style={{ color: '#efefef', fontSize: '0.86rem', lineHeight: 1.4 }}>{match.job.title}</strong>
                    <span style={{ color: '#8a8a8a', fontSize: '0.75rem' }}>
                      {match.job.company} · {match.job.location}
                    </span>
                  </div>
                </div>

                <span style={{
                  color: scoreColor(match.overallScore),
                  border: `1px solid ${scoreColor(match.overallScore)}40`,
                  borderRadius: '999px',
                  padding: '0.18rem 0.48rem',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  whiteSpace: 'nowrap',
                }}>
                  Fit {match.overallScore}/100
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.33rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#7f7f7f', fontSize: '0.68rem', border: '1px solid #292929', borderRadius: '4px', padding: '0.08rem 0.35rem' }}>
                  Skills {match.breakdown.skillScore}
                </span>
                <span style={{ color: '#7f7f7f', fontSize: '0.68rem', border: '1px solid #292929', borderRadius: '4px', padding: '0.08rem 0.35rem' }}>
                  Idioma {match.breakdown.languageScore}
                </span>
                <span style={{ color: '#7f7f7f', fontSize: '0.68rem', border: '1px solid #292929', borderRadius: '4px', padding: '0.08rem 0.35rem' }}>
                  Seniority {match.breakdown.seniorityScore}
                </span>
                <span style={{ color: '#7f7f7f', fontSize: '0.68rem', border: '1px solid #292929', borderRadius: '4px', padding: '0.08rem 0.35rem' }}>
                  Movilidad {match.breakdown.mobilityScore}
                </span>
              </div>

              {match.matchedSkills.length > 0 && (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {match.matchedSkills.slice(0, 6).map(skill => (
                    <span
                      key={`${match.job.id}-ok-${skill}`}
                      style={{
                        background: 'rgba(0,245,196,0.08)',
                        border: '1px solid rgba(0,245,196,0.25)',
                        borderRadius: '4px',
                        color: '#86dccc',
                        fontSize: '0.68rem',
                        padding: '0.08rem 0.38rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <CheckCircle2 size={10} /> {skill}
                    </span>
                  ))}
                </div>
              )}

              {match.missingSkills.length > 0 && (
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {match.missingSkills.slice(0, 4).map(skill => (
                    <span
                      key={`${match.job.id}-gap-${skill}`}
                      style={{
                        background: 'rgba(245,87,0,0.08)',
                        border: '1px solid rgba(245,87,0,0.25)',
                        borderRadius: '4px',
                        color: '#e4a17d',
                        fontSize: '0.68rem',
                        padding: '0.08rem 0.38rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <CircleDashed size={10} /> {skill}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {match.reasons.map(reason => (
                  <span key={`${match.job.id}-${reason}`} style={{ color: '#727272', fontSize: '0.72rem', display: 'flex', gap: '0.32rem', alignItems: 'center' }}>
                    <Radar size={11} color="#5f7f79" /> {reason}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ color: '#666', fontSize: '0.7rem' }}>{match.job.source}</span>
                <a
                  href={match.job.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#7dd0c0', fontSize: '0.73rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  Ver vacante <ExternalLink size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p style={{ color: '#5d5d5d', fontSize: '0.82rem', margin: 0, textAlign: 'center' }}>
          Ejecuta una busqueda para ver matching en tiempo real entre tu perfil y vacantes.
        </p>
      )}
    </div>
  );
}
