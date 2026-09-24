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

interface FlowData {
  nodes: { id: string }[];
  links: { source: string; target: string; value: number }[];
}

// Bandas translúcidas coloreadas por su nodo de origen, nodos finos con separación amplia y
// etiquetas con contorno para que el diagrama no se vea como un bloque sólido.
function FlowChart({ data, colorMap, ariaLabel }: { data: FlowData; colorMap: Record<string, string>; ariaLabel: string }) {
  return (
    <div className="social-sankey-chart-wrap">
      <div className="social-sankey-canvas" role="img" aria-label={ariaLabel}>
        <ResponsiveSankey
          data={data}
          margin={{ top: 24, right: 200, bottom: 24, left: 190 }}
          align="justify"
          sort="input"
          colors={(node: any) => colorMap[node.id] ?? '#898781'}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.3}
          nodeThickness={14}
          nodeSpacing={30}
          nodeInnerPadding={0}
          nodeBorderWidth={0}
          nodeBorderRadius={3}
          linkOpacity={0.38}
          linkHoverOpacity={0.75}
          linkHoverOthersOpacity={0.06}
          linkContract={1}
          linkBlendMode="normal"
          enableLinkGradient={false}
          label={(node: any) => `${node.id} · ${Math.round(node.value)}`}
          labelPosition="outside"
          labelOrientation="horizontal"
          labelPadding={10}
          labelTextColor="#e8f1f5"
          nodeTooltip={({ node }: any) => (
            <div className="sankey-tooltip">
              <strong>{String(node.id)}</strong>
              <span>{Math.round(node.value)} casos por 100</span>
            </div>
          )}
          linkTooltip={({ link }: any) => (
            <div className="sankey-tooltip">
              <strong>{String(link.source.id)} &rarr; {String(link.target.id)}</strong>
              <span>{Math.round(link.value)} casos por 100</span>
            </div>
          )}
          theme={{
            labels: {
              text: {
                fontSize: 12,
                fontWeight: 600,
                fill: '#e8f1f5',
                outlineWidth: 3,
                outlineColor: '#07121b',
                outlineOpacity: 1,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

function FlowLegend({ items }: { items: [string, string][] }) {
  return (
    <>
      <ul className="social-sankey-legend">
        {items.map(([label, color]) => (
          <li key={label}><i style={{ background: color }} />{label}</li>
        ))}
      </ul>
      <p className="social-sankey-scroll-hint">Desliza horizontalmente para ver el diagrama completo.</p>
    </>
  );
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
      { source: 'Total casos',  target: 'Secundaria',       value: secondary },
      { source: 'Total casos',  target: 'Universidad',      value: university },
      { source: 'Total casos',  target: 'Posgrado',         value: postgrad },
      // Education → Career decision
      { source: 'Secundaria',   target: 'Mismo campo',      value: secSame },
      { source: 'Secundaria',   target: 'Cambio de carrera',value: secCambio },
      { source: 'Secundaria',   target: 'Emprendimiento',   value: secEmp },
      { source: 'Universidad',  target: 'Mismo campo',      value: uniSame },
      { source: 'Universidad',  target: 'Cambio de carrera',value: uniCambio },
      { source: 'Universidad',  target: 'Emprendimiento',   value: uniEmp },
      { source: 'Posgrado',     target: 'Mismo campo',      value: postgradSame },
      { source: 'Posgrado',     target: 'Cambio de carrera',value: postgradCambio },
      { source: 'Posgrado',     target: 'Emprendimiento',   value: postgradEmp },
      // Career decision → Outcome
      { source: 'Mismo campo',      target: 'Integración exitosa', value: sfEx },
      { source: 'Mismo campo',      target: 'Integración parcial', value: sfPa },
      { source: 'Mismo campo',      target: 'No integró',          value: sfNo },
      { source: 'Cambio de carrera',target: 'Integración exitosa', value: cbEx },
      { source: 'Cambio de carrera',target: 'Integración parcial', value: cbPa },
      { source: 'Cambio de carrera',target: 'No integró',          value: cbNo },
      { source: 'Emprendimiento',   target: 'Integración exitosa', value: emEx },
      { source: 'Emprendimiento',   target: 'Integración parcial', value: emPa },
      { source: 'Emprendimiento',   target: 'No integró',          value: emNo },
    ],
  };

  // Paleta validada para fondo oscuro: educación = rampa azul ordinal, decisiones = categórica,
  // resultados = colores de estado (bueno / advertencia / crítico).
  const nodeColorMap: Record<string, string> = {
    'Total casos':          '#c3c2b7',
    'Secundaria':           '#86b6ef',
    'Universidad':          '#3987e5',
    'Posgrado':             '#1c5cab',
    'Mismo campo':          '#d55181',
    'Cambio de carrera':    '#9085e9',
    'Emprendimiento':       '#d95926',
    'Integración exitosa':  '#0ca30c',
    'Integración parcial':  '#fab219',
    'No integró':           '#d03b3b',
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
      { source: 'Proficiente en idioma', target: 'Skilled', value: skilledProf },
      { source: 'Proficiente en idioma', target: 'Family', value: familyProf },
      { source: 'Proficiente en idioma', target: 'Humanitarian', value: humanProf },

      { source: 'No proficiente', target: 'Skilled', value: skilledNotProf },
      { source: 'No proficiente', target: 'Family', value: familyNotProf },
      { source: 'No proficiente', target: 'Humanitarian', value: humanNotProf },

      { source: 'Skilled', target: 'Integración laboral exitosa', value: skilledEmp },
      { source: 'Skilled', target: 'Sin integración laboral', value: skilledNotEmp },
      { source: 'Family', target: 'Integración laboral exitosa', value: familyEmp },
      { source: 'Family', target: 'Sin integración laboral', value: familyNotEmp },
      { source: 'Humanitarian', target: 'Integración laboral exitosa', value: humanEmp },
      { source: 'Humanitarian', target: 'Sin integración laboral', value: humanNotEmp },
    ],
  };

  const languageNodeColorMap: Record<string, string> = {
    'Proficiente en idioma': '#3987e5',
    'No proficiente': '#d95926',
    Skilled: '#199e70',
    Family: '#9085e9',
    Humanitarian: '#d55181',
    'Integración laboral exitosa': '#0ca30c',
    'Sin integración laboral': '#d03b3b',
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

      <FlowChart
        data={sankeyData}
        colorMap={nodeColorMap}
        ariaLabel="Diagrama de flujo: nivel educativo, decisión de carrera y resultado de integración"
      />
      <FlowLegend
        items={[
          ['Nivel educativo', '#3987e5'],
          ['Mismo campo', '#d55181'],
          ['Cambio de carrera', '#9085e9'],
          ['Emprendimiento', '#d95926'],
          ['Integración exitosa', '#0ca30c'],
          ['Integración parcial', '#fab219'],
          ['No integró', '#d03b3b'],
        ]}
      />

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

      <FlowChart
        data={languageIntegrationData}
        colorMap={languageNodeColorMap}
        ariaLabel="Diagrama de flujo: dominio del idioma, tipo de visa y resultado laboral"
      />
      <FlowLegend
        items={[
          ['Proficiente en idioma', '#3987e5'],
          ['No proficiente', '#d95926'],
          ['Skilled', '#199e70'],
          ['Family', '#9085e9'],
          ['Humanitarian', '#d55181'],
          ['Empleo', '#0ca30c'],
          ['Sin empleo', '#d03b3b'],
        ]}
      />

      <p className="social-sankey-footnote">
        Fuente real: Australian Bureau of Statistics, Permanent migrants in Australia (2021 release).
        Proficiency en inglés: Skilled 96.2%, Family 82.4%, Humanitarian 70.8%.
        Empleo: Skilled 81.2%, Family 62.1%, Humanitarian 42.9%.
      </p>
    </section>
  );
}
