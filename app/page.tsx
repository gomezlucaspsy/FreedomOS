'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { InstallPWA } from '../src/components/InstallPWA';
import { Activity, FileText, Brain, TrendingUp, BookOpen, Route } from 'lucide-react';
import { DocumentUploader } from '../src/components/DocumentUploader';
import { SkillGapPanel } from '../src/components/SkillGapPanel';
import { PsychTest } from '../src/components/PsychTest';
import { PassportPanel } from '../src/components/PassportPanel';
import { HermesChat } from '../src/components/HermesChat';
import { JobMatchesPanel } from '../src/components/JobMatchesPanel';
import { getStoredMigrantProfile, storeMigrantProfile } from '../src/core/MigrantProfileStore';
import { getPsychMemoryCycle } from '../src/core/PsychMemoryCycle';
import { getScreeningSessions } from '../src/core/ScreeningSessionStore';
import type { MigrantPerson } from '../src/models/MigrantPerson';
import type { PsychProfile } from '../src/models/PsychProfile';

export default function Home() {
  const [migrantPerson, setMigrantPerson] = useState<MigrantPerson | null>(null);
  const [psychScreeningDone, setPsychScreeningDone] = useState(false);
  const [screeningSessionsCount, setScreeningSessionsCount] = useState(0);
  const psychProfile: PsychProfile | null = getPsychMemoryCycle().activeEntry?.profile ?? null;

  const handleScreeningSaved = () => {
    const sessions = getScreeningSessions();
    setPsychScreeningDone(sessions.length > 0);
    setScreeningSessionsCount(sessions.length);
  };

  useEffect(() => {
    const sessions = getScreeningSessions();
    const storedMigrant = getStoredMigrantProfile();
    if (storedMigrant) {
      setMigrantPerson(storedMigrant);
    }
    setPsychScreeningDone(sessions.length > 0);
    setScreeningSessionsCount(sessions.length);
  }, []);

  return (
    <div className="app-container">
      <InstallPWA />
      <HermesChat />

      <header className="app-header">
        <h1 className="title-tech">
          FreedomOS // Demographic Engine
        </h1>
        <p className="subtitle-status">
          <Activity size={16} color="var(--accent-cyan)" />
          Ontology Subsystem Online &rarr; Sandbox Active
        </p>
      </header>

      <main className="section-grid">
        <div className="feature-card">
          <FileText size={32} color="var(--accent-cyan)" className="feature-icon" />
          <h2>Perfil Migratorio desde Documento</h2>
          <p>
            Sube tu CV o carta de presentación (.docx / .txt) para generar tu perfil migratorio y ver en qué países hay demanda de tus habilidades.
          </p>
          <DocumentUploader
            onMigrantParsed={(person) => {
              setMigrantPerson(person);
              storeMigrantProfile(person);
            }}
          />
        </div>

        <div className="feature-card">
          <TrendingUp size={32} color="var(--accent-cyan)" className="feature-icon" />
          <h2>Brecha de Habilidades</h2>
          <p>
            Selecciona tu país destino y la IA te indica qué habilidades aprender para aumentar tu empleabilidad, con tiempo estimado y plataformas.
          </p>
          <SkillGapPanel migrant={migrantPerson} />
        </div>

        <div className="feature-card">
          <Brain size={32} color="var(--accent-cyan)" className="feature-icon" />
          <h2>Screening de Bienestar</h2>
          <p>
            Evaluación breve para orientar bienestar, resiliencia y soporte social en contexto migratorio.
          </p>
          <PsychTest onScreeningSaved={handleScreeningSaved} />
        </div>

        <div className="feature-card">
          <BookOpen size={32} color="var(--accent-cyan)" className="feature-icon" />
          <h2>Pasaporte de Perfil</h2>
          <p>
            Exporta tu perfil completo en PDF o JSON para uso personal, con trazabilidad y control del usuario.
          </p>
          <PassportPanel
            migrant={migrantPerson}
            psychProfile={psychProfile}
            psychScreeningDone={psychScreeningDone}
          />
        </div>

        <div className="feature-card">
          <TrendingUp size={32} color="var(--accent-cyan)" className="feature-icon" />
          <h2>Matching de Vacantes</h2>
          <p>
            Busca vacantes en tiempo real, compara fit por skills/idioma/seniority y detecta brechas para aplicar mejor.
          </p>
          <JobMatchesPanel migrant={migrantPerson} />
        </div>

        <div className="feature-card feature-card-route">
          <Route size={32} color="var(--accent-cyan)" className="feature-icon" />
          <h2>Ruta de Ingeniería Social</h2>
          <p>
            Abre la pantalla completa con el Sankey de casos exitosos basado en educación, experiencia laboral, habilidades e indicadores de screening.
          </p>
          <Link href="/ingenieria-social" className="route-link-button">
            Abrir pantalla completa
          </Link>
        </div>
      </main>
    </div>
  );
}
