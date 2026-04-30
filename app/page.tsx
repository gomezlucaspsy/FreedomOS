'use client';

import { useState } from 'react';
import { InstallPWA } from '../src/components/InstallPWA';
import { Activity, FileText, Brain, TrendingUp, BookOpen } from 'lucide-react';
import { DocumentUploader } from '../src/components/DocumentUploader';
import { SkillGapPanel } from '../src/components/SkillGapPanel';
import { PsychTest } from '../src/components/PsychTest';
import { PassportPanel } from '../src/components/PassportPanel';
import { HermesChat } from '../src/components/HermesChat';
import { getPsychMemoryCycle, storePsychProfile, archiveActivePsychProfile } from '../src/core/PsychMemoryCycle';
import type { MigrantPerson } from '../src/models/MigrantPerson';
import type { PsychProfile } from '../src/models/PsychProfile';

export default function Home() {
  const [migrantPerson, setMigrantPerson] = useState<MigrantPerson | null>(null);
  const [psychProfile, setPsychProfile] = useState<PsychProfile | null>(() => getPsychMemoryCycle().activeEntry?.profile ?? null);

  const handleProfileComplete = (profile: PsychProfile) => {
    const cycle = storePsychProfile(profile);
    setPsychProfile(cycle.activeEntry?.profile ?? profile);
  };

  const handleProfileReset = () => {
    archiveActivePsychProfile();
    setPsychProfile(null);
  };

  return (
    <div className="app-container">
      <InstallPWA />
      <HermesChat />

      <header className="app-header">
        <h1 className="title-tech">
          FreedomOS // Demographic Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="var(--accent-cyan)" />
          Ontology Subsystem Online &rarr; Sandbox Active
        </p>
      </header>

      <main style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
      }}>
        <div style={{
          background: 'var(--bg-panel)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <FileText size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>Perfil Migratorio desde Documento</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Sube tu CV o carta de presentación (.docx / .txt) para generar tu perfil migratorio y ver en qué países hay demanda de tus habilidades.
          </p>
          <DocumentUploader onMigrantParsed={setMigrantPerson} />
        </div>

        <div style={{
          background: 'var(--bg-panel)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <TrendingUp size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>Brecha de Habilidades</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Selecciona tu país destino y la IA te indica qué habilidades aprender para aumentar tu empleabilidad, con tiempo estimado y plataformas.
          </p>
          <SkillGapPanel migrant={migrantPerson} />
        </div>

        <div style={{
          background: 'var(--bg-panel)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Brain size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>Test Psicológico Migratorio</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Test RIASEC + Big Five. Descubre tu perfil vocacional, adaptabilidad y compatibilidad por país destino.
          </p>
          <PsychTest initialProfile={psychProfile} onProfileComplete={handleProfileComplete} onProfileReset={handleProfileReset} />
        </div>

        <div style={{
          background: 'var(--bg-panel)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <BookOpen size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>Pasaporte Digital</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Exporta tu perfil completo como PDF o JSON. Auto-emitido, no institucional.
            Un <em>proof of self</em> que solo tú posees y controlas.
          </p>
          <PassportPanel migrant={migrantPerson} psychProfile={psychProfile} />
        </div>
      </main>
    </div>
  );
}
