import { useEffect, useState } from 'react';
import { InstallPWA } from './components/InstallPWA';
import { Network, Database, Activity, FileText, Brain, TrendingUp, BookOpen } from 'lucide-react';
import { OntologyGraph } from './core/OntologyGraph';
import { runSimulation } from './sandbox/MigrationSimulator';
import { DocumentUploader } from './components/DocumentUploader';
import { SkillGapPanel } from './components/SkillGapPanel';
import { PsychTest } from './components/PsychTest';
import { PassportPanel } from './components/PassportPanel';
import type { MigrantPerson } from './models/MigrantPerson';
import type { PsychProfile } from './models/PsychProfile';
import './index.css';

function App() {
  const [profileData, setProfileData] = useState<any>(null);
  const [migrantPerson, setMigrantPerson] = useState<MigrantPerson | null>(null);
  const [psychProfile, setPsychProfile] = useState<PsychProfile | null>(null);

  useEffect(() => {
    // Run the sandbox simulation when app mounts
    const graph = new OntologyGraph();
    const result = runSimulation(graph);
    setProfileData(result);
  }, []);

  return (
    <div className="app-container">
      <InstallPWA />
      
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
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <Network size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Simulación: Cadena de Significantes</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Observa cómo la población "Cohorte A" ha migrado de Siria a Alemania. El perfil resultante 
            no sobreescribe el nodo, sino que <strong>encadena</strong> los eventos históricos y asimila los shocks culturales en tiempo real.
          </p>
          
          <pre style={{
            background: '#000',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '12px',
            overflowX: 'auto',
            color: 'var(--accent-cyan)',
            border: '1px solid #333'
          }}>
            {profileData ? JSON.stringify(profileData, null, 2) : 'Calculando topología...'}
          </pre>
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
          <PsychTest onProfileComplete={setPsychProfile} />
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

        <div style={{
          background: 'var(--bg-panel)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Database size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Arquitectura Viva</h2>
          <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', listStyle: 'none', padding: 0 }}>
            <li style={{marginBottom: '1rem'}}>
              <strong style={{color: '#fff'}}>1. Nodos Flotantes:</strong> Las poblaciones existen independientes de su ubicación física.
            </li>
            <li style={{marginBottom: '1rem'}}>
              <strong style={{color: '#fff'}}>2. Event Sourcing:</strong> Una migración no es un campo de base de datos; es un <i>MigrationEvent</i> inmortalizado en el timeline del nodo.
            </li>
            <li style={{marginBottom: '1rem'}}>
              <strong style={{color: '#fff'}}>3. PWA Instalable:</strong> La aplicación actual incluye un service worker activo y te invitará a instalarla nativamente.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
