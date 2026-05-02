'use client';

import { useState } from 'react';
import { FileJson, FileText, Shield, AlertCircle } from 'lucide-react';
import { buildPassport, exportPassportPDF, exportPassportJSON } from '../core/PassportExporter';
import {
  analyzeSkillGap,
  AVAILABLE_COUNTRIES,
  getSkillGapDiagnostics,
  getDemandTierForCountry,
  getProfileAlignment,
} from '../core/SkillGapAnalyzer';
import type { MigrantPerson } from '../models/MigrantPerson';
import type { PsychProfile } from '../models/PsychProfile';

interface Props {
  migrant: MigrantPerson | null;
  psychProfile: PsychProfile | null;
  psychScreeningDone: boolean;
}

export function PassportPanel({ migrant, psychProfile, psychScreeningDone }: Props) {
  const [targetCountry, setTargetCountry] = useState('');
  const [exporting, setExporting] = useState(false);

  const missingCV = !migrant;
  const missingPsych = !psychProfile && !psychScreeningDone;
  const missingCountry = !targetCountry;

  const handleExport = async (format: 'pdf' | 'json') => {
    if (!migrant) return;
    const currentMigrant = migrant;

    setExporting(true);
    try {
      let liveDiagnostics = targetCountry ? getSkillGapDiagnostics(currentMigrant, targetCountry) : undefined;

      if (targetCountry) {
        try {
          const response = await fetch('/api/rigorous-data', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              country: targetCountry,
              demandTier: getDemandTierForCountry(targetCountry),
              profileAlignment: getProfileAlignment(currentMigrant, targetCountry),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data?.diagnostics) {
              liveDiagnostics = data.diagnostics;
            }
          }
        } catch {
          // Keep local diagnostics if live APIs fail.
        }
      }

      const skillGap = targetCountry
        ? {
            targetCountry,
            recommendations: analyzeSkillGap(currentMigrant, targetCountry),
            diagnostics: liveDiagnostics,
          }
        : null;
      const passport = buildPassport(currentMigrant, psychProfile, skillGap);
      if (format === 'pdf') exportPassportPDF(passport);
      else exportPassportJSON(passport);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[
          { done: !missingCV,      label: 'CV subido y procesado',        tip: 'Sube tu CV en el panel "Perfil Migratorio"' },
          { done: !missingPsych,   label: 'Test psicológico completado',  tip: 'Completa el Test RIASEC + Big Five' },
          { done: !missingCountry, label: 'País destino seleccionado',     tip: 'Elige un país abajo para incluir la hoja de ruta' },
        ].map(({ done, label, tip }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: done ? 'rgba(0,200,170,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${done ? '#00c8aa' : '#333'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {done && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00c8aa' }} />}
            </div>
            <span style={{ color: done ? '#ccc' : '#555', fontSize: '0.82rem' }}>{label}</span>
            {!done && (
              <span style={{ color: '#3a3a3a', fontSize: '0.72rem', marginLeft: 'auto', textAlign: 'right' }}>{tip}</span>
            )}
          </div>
        ))}
      </div>

      {/* Country selector (optional for roadmap) */}
      <div>
        <p style={{ color: '#555', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
          País destino para hoja de ruta <span style={{ color: '#3a3a3a' }}>(opcional)</span>
        </p>
        <select
          value={targetCountry}
          onChange={e => setTargetCountry(e.target.value)}
          style={{
            width: '100%',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '0.6rem 0.8rem',
            color: targetCountry ? '#fff' : '#555',
            fontSize: '0.85rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">Sin hoja de ruta...</option>
          {AVAILABLE_COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Warning if CV missing */}
      {missingCV && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
          background: 'rgba(240,196,0,0.06)',
          border: '1px solid rgba(240,196,0,0.2)',
          borderRadius: '8px', padding: '0.8rem',
        }}>
          <AlertCircle size={14} color="#f0c400" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: '#888', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
            Se necesita el CV para emitir el pasaporte. El test psicológico puede incluirse aunque no esté completo.
          </p>
        </div>
      )}

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: '0.7rem' }}>
        <button
          onClick={() => handleExport('pdf')}
          disabled={missingCV || exporting}
          style={{
            flex: 1,
            background: missingCV ? '#111' : 'rgba(0,200,170,0.1)',
            color: missingCV ? '#333' : '#00c8aa',
            border: `1px solid ${missingCV ? '#222' : 'rgba(0,200,170,0.35)'}`,
            borderRadius: '10px',
            padding: '0.8rem',
            cursor: missingCV ? 'default' : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <FileText size={15} />
          {exporting ? 'Generando...' : 'Exportar PDF'}
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={missingCV || exporting}
          style={{
            flex: 1,
            background: missingCV ? '#111' : 'rgba(255,255,255,0.04)',
            color: missingCV ? '#333' : '#aaa',
            border: `1px solid ${missingCV ? '#222' : '#2a2a2a'}`,
            borderRadius: '10px',
            padding: '0.8rem',
            cursor: missingCV ? 'default' : 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
        >
          <FileJson size={15} />
          Exportar JSON
        </button>
      </div>

      {/* Manifesto note */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
        borderTop: '1px solid #111', paddingTop: '1rem',
      }}>
        <Shield size={13} color="#3a3a3a" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ color: '#333', fontSize: '0.75rem', margin: 0, lineHeight: 1.6 }}>
          Este pasaporte es <strong style={{ color: '#444' }}>auto-emitido</strong>. Ninguna institución lo genera, ninguna puede revocarlo. Es un <em>proof of self</em> — el conocimiento de quién eres y dónde encajas, que solo tú posees.
        </p>
      </div>
    </div>
  );
}
