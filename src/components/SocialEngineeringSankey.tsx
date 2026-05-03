'use client';

import { ResponsiveSankey } from '@nivo/sankey';
import type { MigrantPerson } from '../models/MigrantPerson';
import type { PsychProfile } from '../models/PsychProfile';

interface SocialEngineeringSankeyProps {
  migrantPerson: MigrantPerson | null;
  psychProfile: PsychProfile | null;
  screeningSessionsCount: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(v, max));
}

function r(v: number) {
  return Math.round(v);
}

export function SocialEngineeringSankey({
  migrantPerson,
  psychProfile,
}: SocialEngineeringSankeyProps) {
  const absRealData = {
    streamShare: {
      skilled: 59,
      family: 32,
      humanitarian: 9,
    },
    proficientRate: {
      skilled: 0.962,
      family: 0.824,
      humanitarian: 0.708,
    },
    employedRate: {
      skilled: 0.812,
      family: 0.621,
      humanitarian: 0.429,
    },
  };

  const educationEntries = migrantPerson?.education ?? [];
  const skills = migrantPerson?.skills ?? [];
  const experience = migrantPerson?.experience ?? [];
  const languages = migrantPerson?.languages ?? [];
  const adaptability = psychProfile?.adaptabilityScore ?? 50;
  const riskLevel = psychProfile?.integrationRisk ?? 'medio';

  // Detect education level from actual data
  const hasPostgrad = educationEntries.some(e =>
    /master|phd|doctor|mba|posgrado|maestr|especiali/i.test(e.degree)
  );
  const hasUniversity = educationEntries.some(e =>
    /bachelor|licenc|ingenier|univers|grado|college|técnico/i.test(e.degree)
  );

  const experienceYears = experience.reduce((sum, e) => sum + e.durationYears, 0);
  const adaptBoost = (adaptability - 50) * 0.003;
  const langBoost = clamp(languages.length * 0.04, 0, 0.18);
  const riskMult = riskLevel === 'alto' ? 0.74 : riskLevel === 'medio' ? 0.90 : 1.0;

  // ── Layer 1 → Layer 2: split 100 cases by education level ──────────────────
  const cohort = 100;
  let postgrad = hasPostgrad ? clamp(14 + educationEntries.length * 4, 14, 32) : 8;
  let university = (hasUniversity && !hasPostgrad)
    ? clamp(28 + educationEntries.length * 5, 28, 54)
    : (hasPostgrad ? 22 : 20);
  let secondary = clamp(cohort - postgrad - university, 10, 48);

  // Normalise to exactly 100
  const eduSum = postgrad + university + secondary;
  postgrad = r((postgrad / eduSum) * cohort);
  university = r((university / eduSum) * cohort);
  secondary = cohort - postgrad - university;

  // ── Layer 2 → Layer 3: each education level splits into career decisions ───
  // Rates: same field / career change / entrepreneurship
  const expStability = clamp(skills.length * 3 + experienceYears * 5, 0, 100);
  const uniSameRate = clamp(0.38 + expStability * 0.003, 0.35, 0.58);

  const postgradSame   = r(postgrad * 0.56);
  const postgradCambio = r(postgrad * 0.30);
  const postgradEmp    = postgrad - postgradSame - postgradCambio;

  const uniSame        = r(university * uniSameRate);
  const uniCambio      = r(university * 0.37);
  const uniEmp         = university - uniSame - uniCambio;

  const secSame        = r(secondary * 0.28);
  const secCambio      = r(secondary * 0.44);
  const secEmp         = secondary - secSame - secCambio;

  const totalSame   = postgradSame + uniSame + secSame;
  const totalCambio = postgradCambio + uniCambio + secCambio;
  const totalEmp    = postgradEmp + uniEmp + secEmp;

  // ── Layer 3 → Layer 4: career decision → integration outcome ───────────────
  const sameSuccess  = clamp(0.64 + adaptBoost + langBoost, 0.40, 0.84) * riskMult;
  const sameParcial  = clamp(0.22, 0.10, 0.32);

  const cambioSuccess = clamp(0.46 + adaptBoost + langBoost, 0.28, 0.68) * riskMult;
  const cambioParcial = clamp(0.30, 0.15, 0.40);

  const empSuccess   = clamp(0.36 + adaptBoost + langBoost * 1.3, 0.20, 0.60) * riskMult;
  const empParcial   = clamp(0.28, 0.14, 0.38);

  const safe = (v: number) => Math.max(1, v);

  const sfEx = safe(r(totalSame * sameSuccess));
  const sfPa = safe(r(totalSame * sameParcial));
  const sfNo = safe(totalSame - sfEx - sfPa);

  const cbEx = safe(r(totalCambio * cambioSuccess));
  const cbPa = safe(r(totalCambio * cambioParcial));
  const cbNo = safe(totalCambio - cbEx - cbPa);

  const emEx = safe(r(totalEmp * empSuccess));
  const emPa = safe(r(totalEmp * empParcial));
  const emNo = safe(totalEmp - emEx - emPa);

  const totalExitosa  = sfEx + cbEx + emEx;
  const totalParcial  = sfPa + cbPa + emPa;
  const totalNoIntegro = sfNo + cbNo + emNo;

  const sankeyData = {
    nodes: [
      // Layer 1
      { id: 'Total casos' },
      // Layer 2 — education level
      { id: 'Secundaria' },
      { id: 'Universidad' },
      { id: 'Posgrado' },
      // Layer 3 — career decision
      { id: 'Mismo campo' },
      { id: 'Cambio de carrera' },
      { id: 'Emprendimiento' },
      // Layer 4 — outcome
      { id: 'Integración exitosa' },
      { id: 'Integración parcial' },
      { id: 'No integró' },
    ],
    links: [
      // Total → Education
      { source: 'Total casos',  target: 'Secundaria',       value: secondary, startColor: '#ffffff', endColor: '#8fd0ff' },
      { source: 'Total casos',  target: 'Universidad',      value: university, startColor: '#ffffff', endColor: '#57b8ff' },
      { source: 'Total casos',  target: 'Posgrado',         value: postgrad, startColor: '#ffffff', endColor: '#2f8eff' },
      // Education → Career decision
      { source: 'Secundaria',   target: 'Mismo campo',      value: secSame, startColor: '#f7fbff', endColor: '#ffd84a' },
      { source: 'Secundaria',   target: 'Cambio de carrera',value: secCambio, startColor: '#f7fbff', endColor: '#ffad33' },
      { source: 'Secundaria',   target: 'Emprendimiento',   value: secEmp, startColor: '#f7fbff', endColor: '#ff7c4f' },
      { source: 'Universidad',  target: 'Mismo campo',      value: uniSame, startColor: '#f7fbff', endColor: '#ffd84a' },
      { source: 'Universidad',  target: 'Cambio de carrera',value: uniCambio, startColor: '#f7fbff', endColor: '#ffad33' },
      { source: 'Universidad',  target: 'Emprendimiento',   value: uniEmp, startColor: '#f7fbff', endColor: '#ff7c4f' },
      { source: 'Posgrado',     target: 'Mismo campo',      value: postgradSame, startColor: '#f7fbff', endColor: '#ffd84a' },
      { source: 'Posgrado',     target: 'Cambio de carrera',value: postgradCambio, startColor: '#f7fbff', endColor: '#ffad33' },
      { source: 'Posgrado',     target: 'Emprendimiento',   value: postgradEmp, startColor: '#f7fbff', endColor: '#ff7c4f' },
      // Career decision → Outcome
      { source: 'Mismo campo',      target: 'Integración exitosa', value: sfEx, startColor: '#d8ff8f', endColor: '#3dff8f' },
      { source: 'Mismo campo',      target: 'Integración parcial', value: sfPa, startColor: '#fff089', endColor: '#ffe066' },
      { source: 'Mismo campo',      target: 'No integró',          value: sfNo, startColor: '#ff9ab2', endColor: '#ff4d6d' },
      { source: 'Cambio de carrera',target: 'Integración exitosa', value: cbEx, startColor: '#d8ff8f', endColor: '#3dff8f' },
      { source: 'Cambio de carrera',target: 'Integración parcial', value: cbPa, startColor: '#fff089', endColor: '#ffe066' },
      { source: 'Cambio de carrera',target: 'No integró',          value: cbNo, startColor: '#ff9ab2', endColor: '#ff4d6d' },
      { source: 'Emprendimiento',   target: 'Integración exitosa', value: emEx, startColor: '#d8ff8f', endColor: '#3dff8f' },
      { source: 'Emprendimiento',   target: 'Integración parcial', value: emPa, startColor: '#fff089', endColor: '#ffe066' },
      { source: 'Emprendimiento',   target: 'No integró',          value: emNo, startColor: '#ff9ab2', endColor: '#ff4d6d' },
    ],
  };

  // High-contrast palette for dark background
  const nodeColorMap: Record<string, string> = {
    'Total casos':          '#e8eaf6',
    // Education — blue family
    'Secundaria':           '#64b5f6',
    'Universidad':          '#1e88e5',
    'Posgrado':             '#0d47a1',
    // Career — amber/orange family
    'Mismo campo':          '#ffca28',
    'Cambio de carrera':    '#fb8c00',
    'Emprendimiento':       '#e64a19',
    // Outcomes
    'Integración exitosa':  '#00e676',
    'Integración parcial':  '#ffd740',
    'No integró':           '#ff1744',
  };

  const kpis = [
    { label: 'Integración exitosa', value: `${totalExitosa} / 100` },
    { label: 'Integración parcial', value: `${totalParcial} / 100` },
    { label: 'No integró',          value: `${totalNoIntegro} / 100` },
    { label: 'Adaptabilidad',       value: `${Math.round(adaptability)}%` },
  ];

  const skilledShare = absRealData.streamShare.skilled;
  const familyShare = absRealData.streamShare.family;
  const humanShare = absRealData.streamShare.humanitarian;

  const skilledProf = r(skilledShare * absRealData.proficientRate.skilled);
  const familyProf = r(familyShare * absRealData.proficientRate.family);
  const humanProf = r(humanShare * absRealData.proficientRate.humanitarian);

  const skilledNotProf = skilledShare - skilledProf;
  const familyNotProf = familyShare - familyProf;
  const humanNotProf = humanShare - humanProf;

  const skilledEmp = r(skilledShare * absRealData.employedRate.skilled);
  const familyEmp = r(familyShare * absRealData.employedRate.family);
  const humanEmp = r(humanShare * absRealData.employedRate.humanitarian);

  const skilledNotEmp = skilledShare - skilledEmp;
  const familyNotEmp = familyShare - familyEmp;
  const humanNotEmp = humanShare - humanEmp;

  const languageIntegrationData = {
    nodes: [
      { id: 'Proficiente en idioma' },
      { id: 'No proficiente' },
      { id: 'Skilled' },
      { id: 'Family' },
      { id: 'Humanitarian' },
      { id: 'Integración laboral exitosa' },
      { id: 'Sin integración laboral' },
    ],
    links: [
      { source: 'Proficiente en idioma', target: 'Skilled', value: skilledProf, startColor: '#ffffff', endColor: '#8cd2ff' },
      { source: 'Proficiente en idioma', target: 'Family', value: familyProf, startColor: '#ffffff', endColor: '#8cd2ff' },
      { source: 'Proficiente en idioma', target: 'Humanitarian', value: humanProf, startColor: '#ffffff', endColor: '#8cd2ff' },

      { source: 'No proficiente', target: 'Skilled', value: skilledNotProf, startColor: '#ffd0da', endColor: '#ff8ca5' },
      { source: 'No proficiente', target: 'Family', value: familyNotProf, startColor: '#ffd0da', endColor: '#ff8ca5' },
      { source: 'No proficiente', target: 'Humanitarian', value: humanNotProf, startColor: '#ffd0da', endColor: '#ff8ca5' },

      { source: 'Skilled', target: 'Integración laboral exitosa', value: skilledEmp, startColor: '#c9f8ff', endColor: '#4dff99' },
      { source: 'Skilled', target: 'Sin integración laboral', value: skilledNotEmp, startColor: '#c9f8ff', endColor: '#ff6262' },
      { source: 'Family', target: 'Integración laboral exitosa', value: familyEmp, startColor: '#c9f8ff', endColor: '#4dff99' },
      { source: 'Family', target: 'Sin integración laboral', value: familyNotEmp, startColor: '#c9f8ff', endColor: '#ff6262' },
      { source: 'Humanitarian', target: 'Integración laboral exitosa', value: humanEmp, startColor: '#c9f8ff', endColor: '#4dff99' },
      { source: 'Humanitarian', target: 'Sin integración laboral', value: humanNotEmp, startColor: '#c9f8ff', endColor: '#ff6262' },
    ],
  };

  const languageNodeColorMap: Record<string, string> = {
    'Proficiente en idioma': '#eaf6ff',
    'No proficiente': '#ffb4c4',
    Skilled: '#4aa3ff',
    Family: '#57d9a3',
    Humanitarian: '#ffb347',
    'Integración laboral exitosa': '#00e676',
    'Sin integración laboral': '#ff4d6d',
  };

  const totalProf = skilledProf + familyProf + humanProf;
  const totalNotProf = skilledNotProf + familyNotProf + humanNotProf;
  const totalLangEmp = skilledEmp + familyEmp + humanEmp;
  const totalLangNotEmp = skilledNotEmp + familyNotEmp + humanNotEmp;

  const languageKpis = [
    { label: 'Proficiente en idioma', value: `${totalProf} / 100` },
    { label: 'No proficiente', value: `${totalNotProf} / 100` },
    { label: 'Integración laboral', value: `${totalLangEmp} / 100` },
    { label: 'Sin integración laboral', value: `${totalLangNotEmp} / 100` },
  ];

  return (
    <section className="social-sankey-screen">
      <div className="social-sankey-head">
        <h2>Ingeniería Social de Éxito · Trayectoria Educativa y Laboral</h2>
        <p>
          Flujo de 100 casos simulados: nivel educativo &rarr; decisión de carrera &rarr; resultado de integración.
          El ancho de cada banda representa la cantidad de personas en esa trayectoria.
        </p>
      </div>

      <div className="social-sankey-kpis">
        {kpis.map((kpi) => (
          <div className="social-sankey-kpi" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </div>
        ))}
      </div>

      <div className="social-sankey-chart-wrap">
        <div className="social-sankey-canvas">
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 20, right: 130, bottom: 20, left: 120 }}
            align="justify"
            colors={(node: any) => nodeColorMap[node.id] ?? '#90a4ae'}
            nodeOpacity={1}
            nodeThickness={22}
            nodeSpacing={20}
            nodeBorderWidth={0}
            nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
            nodeTooltip={({ node }: any) => (
              <div className="sankey-tooltip">
                <strong>{String(node.id)}</strong>
                <span>{Math.round(node.value)} casos por 100</span>
              </div>
            )}
            linkOpacity={0.82}
            linkHoverOthersOpacity={0.08}
            linkBlendMode="normal"
            enableLinkGradient
            linkTooltip={({ link }: any) => (
              <div className="sankey-tooltip">
                <strong>{String(link.source.id)} &rarr; {String(link.target.id)}</strong>
                <span>{Math.round(link.value)} casos por 100</span>
              </div>
            )}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={10}
            labelTextColor={{ from: 'color', modifiers: [['brighter', 1.8]] }}
            theme={{
              labels: {
                text: {
                  fontSize: 12,
                  fontWeight: 700,
                  fill: '#ffffff',
                },
              },
            }}
          />
        </div>
      </div>

      <p className="social-sankey-footnote">
        Mayor nivel educativo y mantener el campo de trabajo aumentan la probabilidad de integración exitosa.
        La adaptabilidad psicológica y el idioma mejoran todos los caminos.
      </p>

      <div className="social-sankey-head" style={{ marginTop: '1.2rem' }}>
        <h2>Integración Exitosa vs Idioma (Datos Reales)</h2>
        <p>
          Modelo con datos oficiales (ABS, Australia 2021): proporción por proficiency en inglés, composición por
          stream migratorio y resultado laboral (empleado vs no empleado).
        </p>
      </div>

      <div className="social-sankey-kpis">
        {languageKpis.map((kpi) => (
          <div className="social-sankey-kpi" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
          </div>
        ))}
      </div>

      <div className="social-sankey-chart-wrap">
        <div className="social-sankey-canvas">
          <ResponsiveSankey
            data={languageIntegrationData}
            margin={{ top: 20, right: 130, bottom: 20, left: 120 }}
            align="justify"
            colors={(node: any) => languageNodeColorMap[node.id] ?? '#d7e3ea'}
            nodeOpacity={1}
            nodeThickness={22}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeTooltip={({ node }: any) => (
              <div className="sankey-tooltip">
                <strong>{String(node.id)}</strong>
                <span>{Math.round(node.value)} casos por 100</span>
              </div>
            )}
            linkOpacity={0.84}
            linkHoverOthersOpacity={0.1}
            linkBlendMode="normal"
            enableLinkGradient
            linkTooltip={({ link }: any) => (
              <div className="sankey-tooltip">
                <strong>{String(link.source.id)} &rarr; {String(link.target.id)}</strong>
                <span>{Math.round(link.value)} casos por 100</span>
              </div>
            )}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={10}
            labelTextColor={{ from: 'color', modifiers: [['brighter', 1.8]] }}
            theme={{
              labels: {
                text: {
                  fontSize: 12,
                  fontWeight: 700,
                  fill: '#ffffff',
                },
              },
            }}
          />
        </div>
      </div>

      <p className="social-sankey-footnote">
        Fuente real: Australian Bureau of Statistics, Permanent migrants in Australia (2021 release).
        Proficiency en inglés: Skilled 96.2%, Family 82.4%, Humanitarian 70.8%.
        Empleo: Skilled 81.2%, Family 62.1%, Humanitarian 42.9%.
      </p>
    </section>
  );
}
