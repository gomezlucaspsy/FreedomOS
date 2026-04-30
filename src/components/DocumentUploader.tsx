import { useRef, useState } from 'react';
import { Upload, User, MapPin, Briefcase, Globe } from 'lucide-react';
import { parseDocumentToMigrant } from '../core/DocumentParser';
import { getOpportunitiesForSkills } from '../core/SkillDemandMap';
import type { MigrantPerson } from '../models/MigrantPerson';
import type { CountryOpportunity } from '../core/SkillDemandMap';

const DEMAND_COLORS: Record<string, string> = {
  alta: '#00f5c4',
  media: '#f5c400',
  baja: '#f55700',
};

export function DocumentUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrant, setMigrant] = useState<MigrantPerson | null>(null);
  const [opportunities, setOpportunities] = useState<CountryOpportunity[]>([]);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setMigrant(null);
    setOpportunities([]);
    try {
      const person = await parseDocumentToMigrant(file);
      const ops = getOpportunitiesForSkills(person.skills);
      setMigrant(person);
      setOpportunities(ops);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al procesar el documento.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed var(--accent-cyan)',
          borderRadius: '10px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(0,245,196,0.04)',
          transition: 'background 0.2s',
        }}
      >
        <Upload size={28} color="var(--accent-cyan)" style={{ marginBottom: '0.75rem' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Arrastra tu <strong style={{ color: '#fff' }}>CV o Carta de Presentación</strong> aquí
          <br />
          <span style={{ fontSize: '0.8rem' }}>o haz clic para seleccionar (.docx, .txt)</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.txt"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>

      {loading && (
        <p style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', textAlign: 'center' }}>
          Analizando perfil migratorio...
        </p>
      )}

      {error && (
        <p style={{ color: '#f55700', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>
      )}

      {migrant && (
        <>
          {/* Migrant profile card */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: '10px',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <User size={18} color="var(--accent-cyan)" />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{migrant.fullName}</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} color="#888" />
                <span style={{ color: '#888', fontSize: '0.82rem' }}>{migrant.originCountry}</span>
              </div>
              {migrant.email && (
                <span style={{ color: '#888', fontSize: '0.82rem' }}>{migrant.email}</span>
              )}
            </div>

            {migrant.skills.length > 0 && (
              <div style={{ marginBottom: '0.8rem' }}>
                <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Habilidades detectadas</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {migrant.skills.map(skill => (
                    <span key={skill} style={{
                      background: 'rgba(0,245,196,0.1)',
                      color: 'var(--accent-cyan)',
                      border: '1px solid rgba(0,245,196,0.25)',
                      borderRadius: '4px',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
                    }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {migrant.languages.length > 0 && (
              <div>
                <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Idiomas</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {migrant.languages.map(lang => (
                    <span key={lang} style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: '#ccc',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
                    }}>{lang}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Opportunities */}
          {opportunities.length > 0 ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <Globe size={16} color="var(--accent-cyan)" />
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                  Países que reclutan este perfil
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {opportunities.map(op => (
                  <div key={op.country} style={{
                    background: '#0a0a0a',
                    border: `1px solid ${DEMAND_COLORS[op.demandLevel]}33`,
                    borderRadius: '8px',
                    padding: '0.9rem 1rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Briefcase size={13} color={DEMAND_COLORS[op.demandLevel]} />
                        <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{op.country}</strong>
                      </div>
                      <span style={{
                        color: DEMAND_COLORS[op.demandLevel],
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontWeight: 700,
                      }}>
                        Demanda {op.demandLevel}
                      </span>
                    </div>
                    <p style={{ color: '#666', fontSize: '0.78rem', margin: '0.2rem 0 0.5rem' }}>{op.reason}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {op.matchedSkills.map(s => (
                        <span key={s} style={{
                          background: `${DEMAND_COLORS[op.demandLevel]}15`,
                          color: DEMAND_COLORS[op.demandLevel],
                          border: `1px solid ${DEMAND_COLORS[op.demandLevel]}40`,
                          borderRadius: '3px',
                          padding: '0.1rem 0.4rem',
                          fontSize: '0.7rem',
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center' }}>
              No se detectaron habilidades reconocidas. Intenta con un CV más detallado.
            </p>
          )}
        </>
      )}
    </div>
  );
}
