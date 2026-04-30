import type { MigrantPerson } from '../models/MigrantPerson';

export interface SkillRecommendation {
  skill: string;
  priority: 'crítica' | 'alta' | 'media';
  learningWeeks: number;
  platforms: string[];
  reason: string;
}

const SKILL_LEARNING_META: Record<string, Omit<SkillRecommendation, 'skill'>> = {
  // Tech
  'React':            { priority: 'crítica', learningWeeks: 6,  platforms: ['freeCodeCamp', 'Scrimba', 'Udemy'],           reason: 'Framework frontend más demandado en el mercado tech.' },
  'TypeScript':       { priority: 'alta',    learningWeeks: 4,  platforms: ['TS Docs', 'Udemy', 'Frontend Masters'],        reason: 'Estándar en proyectos React y Node.js modernos.' },
  'JavaScript':       { priority: 'crítica', learningWeeks: 8,  platforms: ['freeCodeCamp', 'The Odin Project', 'MDN'],     reason: 'Base del desarrollo web moderno.' },
  'Node.js':          { priority: 'alta',    learningWeeks: 5,  platforms: ['The Odin Project', 'Udemy', 'Node Docs'],      reason: 'Backend JS con alta demanda en startups y corporaciones.' },
  'Python':           { priority: 'crítica', learningWeeks: 8,  platforms: ['Codecademy', 'freeCodeCamp', 'Coursera'],      reason: 'Líder en IA, Data Science y automatización.' },
  'Java':             { priority: 'alta',    learningWeeks: 10, platforms: ['Codecademy', 'Udemy', 'JetBrains Academy'],    reason: 'Dominante en empresas, banca y Android. Alta empleabilidad global.' },
  'C#':               { priority: 'alta',    learningWeeks: 10, platforms: ['Microsoft Learn', 'Udemy', 'Pluralsight'],     reason: 'Stack principal de .NET; muy demandado en Europa Central.' },
  'C++':              { priority: 'media',   learningWeeks: 16, platforms: ['Learncpp.com', 'Udemy', 'Coursera'],           reason: 'Requerido en embebidos, videojuegos y sistemas de alto rendimiento.' },
  'SQL':              { priority: 'crítica', learningWeeks: 3,  platforms: ['SQLZoo', 'Mode Analytics', 'Khan Academy'],    reason: 'Habilidad transversal requerida en casi todos los roles tech.' },
  'Git':              { priority: 'crítica', learningWeeks: 1,  platforms: ['GitHub Skills', 'Atlassian', 'freeCodeCamp'],  reason: 'Control de versiones imprescindible en cualquier rol tech.' },
  'Docker':           { priority: 'alta',    learningWeeks: 3,  platforms: ['Play with Docker', 'Udemy', 'Docker Docs'],    reason: 'Estándar de despliegue en entornos profesionales.' },
  'Kubernetes':       { priority: 'alta',    learningWeeks: 5,  platforms: ['KodeKloud', 'Udemy', 'CNCF'],                  reason: 'Orquestación de contenedores; muy valorado en perfiles DevOps senior.' },
  'AWS':              { priority: 'alta',    learningWeeks: 8,  platforms: ['AWS Free Tier', 'A Cloud Guru', 'Udemy'],      reason: 'Cloud dominante; certificación AWS muy valorada internacionalmente.' },
  'Azure':            { priority: 'alta',    learningWeeks: 8,  platforms: ['Microsoft Learn', 'A Cloud Guru', 'Udemy'],    reason: 'Cloud preferido por corporaciones europeas y gobierno.' },
  'GCP':              { priority: 'media',   learningWeeks: 8,  platforms: ['Google Cloud Skills Boost', 'Coursera'],       reason: 'Fuerte en Machine Learning y analytics; demandado en startups.' },
  'Machine Learning': { priority: 'alta',    learningWeeks: 16, platforms: ['Coursera (Andrew Ng)', 'fast.ai', 'Kaggle'],   reason: 'Sector de mayor crecimiento salarial en tech.' },
  'Data Science':     { priority: 'alta',    learningWeeks: 12, platforms: ['Kaggle', 'DataCamp', 'Coursera'],              reason: 'Perfil híbrido estadística+programación altamente cotizado.' },
  'CI/CD':            { priority: 'alta',    learningWeeks: 3,  platforms: ['GitHub Actions Docs', 'Udemy', 'GitLab CI'],   reason: 'Automatización de pipelines; estándar en equipos ágiles.' },
  'Scrum':            { priority: 'media',   learningWeeks: 1,  platforms: ['Scrum.org', 'Coursera', 'LinkedIn Learning'],  reason: 'Metodología estándar; certificación PSM valorada mundialmente.' },
  'Power BI':         { priority: 'media',   learningWeeks: 3,  platforms: ['Microsoft Learn', 'Udemy', 'YouTube'],         reason: 'Herramienta BI más adoptada en empresas no-tech.' },
  'Excel':            { priority: 'media',   learningWeeks: 2,  platforms: ['Microsoft Learn', 'Chandoo.org', 'Udemy'],     reason: 'Habilidad de oficina universal en roles no-tech.' },
  'Figma':            { priority: 'media',   learningWeeks: 3,  platforms: ['Figma Community', 'YouTube', 'Coursera'],      reason: 'Herramienta de diseño UI/UX más adoptada.' },
  // Languages
  'Inglés':           { priority: 'crítica', learningWeeks: 24, platforms: ['Duolingo', 'British Council', 'Cambly'],       reason: 'Idioma de trabajo en la mayoría de países destino.' },
  'Alemán':           { priority: 'alta',    learningWeeks: 52, platforms: ['Goethe Institut', 'Duolingo', 'Babbel'],       reason: 'Requerido para integración laboral plena en Alemania, Austria y Suiza.' },
  'Francés':          { priority: 'alta',    learningWeeks: 40, platforms: ['Alliance Française', 'Duolingo', 'Babbel'],    reason: 'Abre puertas en Francia, Bélgica, Suiza y toda África francófona.' },
  'Japonés':          { priority: 'alta',    learningWeeks: 80, platforms: ['JLPT Prep', 'Duolingo', 'JapanesePod101'],    reason: 'N3/N2 JLPT multiplica empleabilidad en Japón; muy valorado.' },
  'Mandarín':         { priority: 'media',   learningWeeks: 88, platforms: ['HelloChinese', 'Coursera', 'ChinesePod'],      reason: 'Ventaja competitiva en empresas con negocios en Asia.' },
  'Coreano':          { priority: 'media',   learningWeeks: 60, platforms: ['Talk To Me In Korean', 'Duolingo', 'Coursera'], reason: 'Demandado para trabajar en Samsung, LG, Hyundai y chaebols.' },
  'Neerlandés':       { priority: 'media',   learningWeeks: 30, platforms: ['NT2', 'Duolingo', 'Babbel'],                   reason: 'Facilita integración en Países Bajos y Bélgica flamenca.' },
  'Portugués':        { priority: 'media',   learningWeeks: 20, platforms: ['Duolingo', 'Babbel', 'Pimsleur'],              reason: 'Abre mercado en Brasil y Portugal; ventaja para hispanohablantes.' },
  'Linux':            { priority: 'alta',    learningWeeks: 4,  platforms: ['Linux Journey', 'OverTheWire', 'Udemy'],        reason: 'Sistema operativo estándar en servidores; imprescindible en DevOps y perfiles de infraestructura.' },
  // ── Entry-level / Oficios ────────────────────────────────────────────────
  'Manipulación de alimentos':   { priority: 'crítica', learningWeeks: 1,  platforms: ['ServSafe', 'Cruz Roja', 'Centros de empleo'],            reason: 'Certificación obligatoria para trabajar en cocinas; se obtiene en días y es obligatoria en la UE.' },
  'Cocina profesional':          { priority: 'alta',    learningWeeks: 12, platforms: ['Escuelas de hostelería', 'FP Hostelería', 'YouTube'],      reason: 'Cocineros con oficio tienen altísima demanda en Europa; trabajo estable con propinas y extras.' },
  'Atención al cliente':         { priority: 'alta',    learningWeeks: 2,  platforms: ['Coursera', 'LinkedIn Learning', 'YouTube'],               reason: 'Habilidad transversal para retail, hostelería y call centers; se aprende rápido.' },
  'Limpieza profesional':        { priority: 'media',   learningWeeks: 1,  platforms: ['Centros de empleo', 'Sindicatos', 'SEPE'],                reason: 'Acceso inmediato al empleo sin requisitos previos; sector siempre en demanda.' },
  'Albañilería':                 { priority: 'alta',    learningWeeks: 8,  platforms: ['FP Dual', 'Sindicatos de construcción', 'YouTube'],        reason: 'Oficio de alta demanda en Europa; base para especializaciones más lucrativas.' },
  'Electricidad básica':         { priority: 'alta',    learningWeeks: 12, platforms: ['FP Básica', 'City & Guilds', 'YouTube'],                   reason: 'Escasez crónica de electricistas en Europa; con certificación accedes a trabajo estable y bien pagado.' },
  'Fontanería básica':           { priority: 'alta',    learningWeeks: 10, platforms: ['FP Básica', 'City & Guilds', 'Sindicatos'],                reason: 'Plomeros en déficit en todo el mundo occidental; salarios por encima de muchos empleos de oficina.' },
  'Pintura y decoración':        { priority: 'media',   learningWeeks: 4,  platforms: ['Sindicatos', 'YouTube', 'FP Básica'],                      reason: 'Demanda constante en construcción y reformas; entrada rápida sin grandes inversiones.' },
  'Conducción profesional':      { priority: 'alta',    learningWeeks: 6,  platforms: ['Autoescuelas', 'CAP/CPC certificación', 'ADR si aplica'],  reason: 'Licencia C (camiones) abre puertas inmediatas en logística; déficit de 400.000 conductores en Europa.' },
  'Carretillero (forklift)':     { priority: 'alta',    learningWeeks: 1,  platforms: ['Centros de formación', 'Sindicatos', 'Empresas 3PL'],      reason: 'Certificación en 2–4 días que aumenta el sueldo en almacenes y plataformas logísticas.' },
  'Logística de almacén':        { priority: 'alta',    learningWeeks: 2,  platforms: ['SEPE', 'Centros de empleo', 'Sindicatos'],                 reason: 'Entrada inmediata al mercado laboral con posibilidad real de ascenso a coordinador.' },
  'Cuidado de personas mayores': { priority: 'crítica', learningWeeks: 8,  platforms: ['Cruz Roja', 'IMSERSO', 'Cáritas', 'Formación SEPE'],      reason: 'Europa tiene escasez crítica de cuidadores; contratación casi inmediata, trabajo con contrato y derechos.' },
  'Auxiliar de enfermería':      { priority: 'alta',    learningWeeks: 26, platforms: ['FP Grado Medio', 'Cruz Roja', 'Centros de salud'],         reason: 'Puente hacia enfermería plena; reconocido en toda la UE; contratación inmediata en residencias.' },
  'Seguridad y vigilancia':      { priority: 'media',   learningWeeks: 6,  platforms: ['TIP/Habilitación oficial', 'Academias de seguridad'],      reason: 'Sector en expansión; requiere habilitación oficial (6 semanas) pero da trabajo estable.' },
  'Agricultura y campo':         { priority: 'media',   learningWeeks: 2,  platforms: ['Cooperativas agrícolas', 'YouTube', 'Oficinas rurales'],   reason: 'Primera fuente de empleo en zonas rurales; estacional pero con alojamiento incluido a veces.' },
  'Costura industrial':          { priority: 'media',   learningWeeks: 4,  platforms: ['Escuelas textiles', 'YouTube', 'Cooperativas'],            reason: 'Empleabilidad en fábricas textiles; puede derivar en patronaje y moda.' },
  'Gestión de proyectos':        { priority: 'alta',    learningWeeks: 8,  platforms: ['PMI (PMP)', 'Coursera', 'LinkedIn Learning'],              reason: 'Certificación PMP/CAPM valorada globalmente para pasar de técnico a coordinador.' },
};

const COUNTRY_CRITICAL_SKILLS: Record<string, string[]> = {
  // ── Europe ────────────────────────────────────────
  'Alemania':        ['TypeScript', 'React', 'Docker', 'SQL', 'Git', 'Alemán', 'Inglés', 'Cuidado de personas mayores', 'Albañilería', 'Conducción profesional', 'Logística de almacén', 'Cocina profesional'],
  'Austria':         ['SQL', 'Java', 'Inglés', 'Alemán', 'Excel', 'Turismo', 'Cocina profesional', 'Cuidado de personas mayores', 'Albañilería'],
  'Bélgica':         ['Python', 'SQL', 'Inglés', 'Francés', 'Power BI', 'Logística de almacén', 'Atención al cliente', 'Conducción profesional'],
  'Chequia':         ['Java', 'SQL', 'Python', 'C#', 'Inglés', 'Manufactura', 'Logística de almacén', 'Albañilería'],
  'Dinamarca':       ['Python', 'React', 'SQL', 'Scrum', 'Inglés', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Agricultura y campo'],
  'España':          ['React', 'JavaScript', 'SQL', 'Inglés', 'Excel', 'Cocina profesional', 'Atención al cliente', 'Logística de almacén', 'Agricultura y campo', 'Limpieza profesional', 'Albañilería'],
  'Finlandia':       ['Python', 'React', 'Machine Learning', 'Docker', 'Inglés', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Conducción profesional'],
  'Francia':         ['Python', 'React', 'SQL', 'Francés', 'Inglés', 'Cocina profesional', 'Agricultura y campo', 'Atención al cliente', 'Logística de almacén'],
  'Irlanda':         ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS', 'Inglés', 'Cocina profesional', 'Atención al cliente', 'Cuidado de personas mayores'],
  'Italia':          ['SQL', 'Python', 'Inglés', 'Excel', 'Figma', 'Cocina profesional', 'Agricultura y campo', 'Turismo', 'Albañilería'],
  'Noruega':         ['Python', 'SQL', 'Inglés', 'Data Science', 'Git', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Albañilería', 'Conducción profesional'],
  'Países Bajos':    ['TypeScript', 'React', 'Docker', 'Scrum', 'Inglés', 'Neerlandés', 'Logística de almacén', 'Atención al cliente', 'Agricultura y campo', 'Conducción profesional'],
  'Polonia':         ['Java', 'Python', 'React', 'SQL', 'Inglés', 'Manufactura', 'Logística de almacén', 'Albañilería'],
  'Portugal':        ['React', 'Node.js', 'SQL', 'Inglés', 'Git', 'Atención al cliente', 'Cocina profesional', 'Turismo', 'Limpieza profesional'],
  'Reino Unido':     ['Python', 'React', 'Machine Learning', 'SQL', 'Inglés', 'Cuidado de personas mayores', 'Conducción profesional', 'Albañilería', 'Auxiliar de enfermería'],
  'Suecia':          ['Python', 'React', 'SQL', 'Machine Learning', 'Inglés', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Logística de almacén'],
  'Suiza':           ['Python', 'Java', 'SQL', 'Inglés', 'Alemán', 'Cocina profesional', 'Turismo', 'Cuidado de personas mayores'],
  // ── Americas ──────────────────────────────────────
  'Argentina':       ['React', 'Python', 'SQL', 'Inglés', 'Git', 'Atención al cliente', 'Logística de almacén'],
  'Brasil':          ['React', 'Python', 'SQL', 'Portugués', 'Java', 'Cocina profesional', 'Agricultura y campo', 'Logística de almacén'],
  'Canadá':          ['Python', 'Machine Learning', 'React', 'SQL', 'AWS', 'Inglés', 'Cuidado de personas mayores', 'Conducción profesional', 'Logística de almacén', 'Albañilería'],
  'Chile':           ['React', 'Python', 'SQL', 'Inglés', 'Data Science', 'Atención al cliente', 'Agricultura y campo'],
  'Colombia':        ['React', 'Node.js', 'SQL', 'Inglés', 'Python', 'Atención al cliente', 'Logística de almacén'],
  'Estados Unidos':  ['React', 'TypeScript', 'AWS', 'Python', 'Machine Learning', 'Git', 'Inglés', 'Cocina profesional', 'Logística de almacén', 'Conducción profesional', 'Agricultura y campo'],
  'México':          ['React', 'Java', 'SQL', 'Inglés', 'Python', 'Manufactura', 'Logística de almacén', 'Atención al cliente'],
  'Uruguay':         ['React', 'Node.js', 'SQL', 'Inglés', 'Git', 'Atención al cliente', 'Turismo'],
  // ── Asia-Pacific ──────────────────────────────────
  'Australia':       ['Python', 'SQL', 'AWS', 'React', 'Inglés', 'Agricultura y campo', 'Cuidado de personas mayores', 'Albañilería', 'Conducción profesional'],
  'Corea del Sur':   ['React', 'TypeScript', 'Python', 'SQL', 'Coreano', 'Manufactura', 'Logística de almacén'],
  'Japón':           ['Java', 'Python', 'SQL', 'Japonés', 'C++', 'Manufactura', 'Cuidado de personas mayores', 'Agricultura y campo'],
  'Nueva Zelanda':   ['Python', 'SQL', 'React', 'Inglés', 'Git', 'Agricultura y campo', 'Cuidado de personas mayores', 'Albañilería'],
  'Singapur':        ['Python', 'Machine Learning', 'React', 'SQL', 'Inglés', 'Docker', 'Cocina profesional', 'Logística de almacén'],
  'China':           ['Python', 'Machine Learning', 'Java', 'SQL', 'Mandarín', 'Docker', 'Manufactura'],
  'Rusia':           ['Python', 'C++', 'SQL', 'Linux', 'Java'],
  // ── Middle East ───────────────────────────────────
  'Arabia Saudita':  ['SQL', 'Power BI', 'Excel', 'Inglés', 'Gestión de proyectos', 'Albañilería', 'Conducción profesional', 'Limpieza profesional'],
  'Emiratos Árabes': ['SQL', 'Power BI', 'Excel', 'Scrum', 'Inglés', 'Cocina profesional', 'Atención al cliente', 'Logística de almacén', 'Limpieza profesional'],
  'Qatar':           ['SQL', 'Excel', 'Inglés', 'Power BI', 'Git', 'Albañilería', 'Conducción profesional', 'Logística de almacén'],
  // ── Africa ────────────────────────────────────────
  'Sudáfrica':       ['Python', 'React', 'SQL', 'Inglés', 'Java', 'Agricultura y campo', 'Atención al cliente'],
};

export const AVAILABLE_COUNTRIES = Object.keys(COUNTRY_CRITICAL_SKILLS);

export function analyzeSkillGap(person: MigrantPerson, targetCountry: string): SkillRecommendation[] {
  const demanded = COUNTRY_CRITICAL_SKILLS[targetCountry] ?? [];
  const personSkillsLower = person.skills.map(s => s.toLowerCase());
  const gaps = demanded.filter(s => !personSkillsLower.includes(s.toLowerCase()));
  return gaps
    .map(skill => {
      const meta = SKILL_LEARNING_META[skill];
      return meta ? { skill, ...meta } : null;
    })
    .filter(Boolean) as SkillRecommendation[];
}

// ── Career Paths ─────────────────────────────────────────────────────────────

export interface CareerStep {
  role: string;
  timeMonths: number;
  salaryRange: string;
  skillsToLearn: string[];
  note?: string;
}

export interface CareerPath {
  id: string;
  sector: string;
  icon: string;
  description: string;
  triggerSkills: string[];
  entryBarrier: 'ninguna' | 'baja' | 'media';
  steps: CareerStep[];
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'hospitality',
    sector: 'Hostelería y Cocina',
    icon: '🍳',
    description: 'Sector con entrada inmediata y alta demanda en toda Europa y América. No requiere titulación previa.',
    triggerSkills: ['Cocina profesional', 'Turismo', 'Atención al cliente', 'Manipulación de alimentos'],
    entryBarrier: 'ninguna',
    steps: [
      { role: 'Ayudante de cocina / Fregador', timeMonths: 0,  salaryRange: '1.000–1.200€/mes', skillsToLearn: ['Manipulación de alimentos', 'Atención al cliente'], note: 'Accesible sin experiencia. Primer empleo en el país de destino.' },
      { role: 'Cocinero de partida',            timeMonths: 8,  salaryRange: '1.300–1.600€/mes', skillsToLearn: ['Cocina profesional'],                               note: 'Con 6–12 meses de práctica el ascenso es natural.' },
      { role: 'Jefe de cocina',                 timeMonths: 36, salaryRange: '1.800–2.800€/mes', skillsToLearn: ['Gestión de proyectos'],                              note: 'Gestión de equipo + control de costes de materia prima.' },
    ],
  },
  {
    id: 'construction',
    sector: 'Construcción y Oficios',
    icon: '🏗️',
    description: 'Europa tiene escasez crónica de trabajadores de obras. Los oficios especializados son de los empleos mejor pagados sin carrera universitaria.',
    triggerSkills: ['Albañilería', 'Pintura y decoración', 'Electricidad básica', 'Fontanería básica'],
    entryBarrier: 'ninguna',
    steps: [
      { role: 'Peón de obras',                               timeMonths: 0,  salaryRange: '1.100–1.400€/mes', skillsToLearn: ['Albañilería', 'Pintura y decoración'],      note: 'Sin certificación; aprendizaje directo en obra.' },
      { role: 'Oficial de segunda',                          timeMonths: 10, salaryRange: '1.400–1.800€/mes', skillsToLearn: [],                                           note: 'Reconocimiento por experiencia demostrada.' },
      { role: 'Oficial especialista (electricista/plomero)', timeMonths: 24, salaryRange: '2.000–3.000€/mes', skillsToLearn: ['Electricidad básica', 'Fontanería básica'], note: 'Con certificación FP: los perfiles más demandados y mejor pagados del sector.' },
      { role: 'Encargado / Jefe de obra',                    timeMonths: 60, salaryRange: '2.500–4.000€/mes', skillsToLearn: ['Gestión de proyectos'],                     note: 'Gestión de cuadrillas y plazos.' },
    ],
  },
  {
    id: 'logistics',
    sector: 'Logística y Almacén',
    icon: '📦',
    description: 'El auge del e-commerce garantiza demanda permanente. Certificaciones baratas y rápidas aumentan el sueldo desde el primer mes.',
    triggerSkills: ['Logística de almacén', 'Carretillero (forklift)', 'Conducción profesional'],
    entryBarrier: 'ninguna',
    steps: [
      { role: 'Mozo de almacén',           timeMonths: 0,  salaryRange: '1.000–1.300€/mes', skillsToLearn: ['Logística de almacén'],              note: 'Sin experiencia previa. Trabajo físico, turnos rotativos.' },
      { role: 'Carretillero certificado',   timeMonths: 1,  salaryRange: '1.300–1.600€/mes', skillsToLearn: ['Carretillero (forklift)'],            note: 'Curso de 2–4 días. Aumento de sueldo inmediato.' },
      { role: 'Conductor de camión',        timeMonths: 6,  salaryRange: '2.000–3.000€/mes', skillsToLearn: ['Conducción profesional'],             note: 'Licencia C + CAP. Déficit de 400.000 conductores en Europa.' },
      { role: 'Coordinador de almacén',     timeMonths: 18, salaryRange: '1.700–2.200€/mes', skillsToLearn: ['Excel', 'Gestión de proyectos'],      note: 'Coordinación de equipos y gestión de inventario.' },
    ],
  },
  {
    id: 'caregiving',
    sector: 'Cuidados y Asistencia Sanitaria',
    icon: '❤️',
    description: 'El envejecimiento de Europa crea millones de puestos hasta 2035. Contratación casi inmediata con formación de pocas semanas.',
    triggerSkills: ['Cuidado de personas mayores', 'Auxiliar de enfermería', 'Enfermería'],
    entryBarrier: 'baja',
    steps: [
      { role: 'Cuidador/a en domicilio',            timeMonths: 0,  salaryRange: '1.000–1.300€/mes', skillsToLearn: ['Cuidado de personas mayores'], note: 'Curso de 200h. Cruz Roja y Cáritas ofrecen formación gratuita para inmigrantes.' },
      { role: 'Auxiliar de geriatría (residencias)', timeMonths: 8,  salaryRange: '1.200–1.600€/mes', skillsToLearn: ['Auxiliar de enfermería'],       note: 'Reconocido en toda la UE. Trabajo con contrato y plena cobertura social.' },
      { role: 'Auxiliar de enfermería (hospitales)', timeMonths: 24, salaryRange: '1.500–1.900€/mes', skillsToLearn: ['Auxiliar de enfermería'],       note: 'FP Grado Medio en 2 años, o convalidación si tienes título de origen.' },
      { role: 'Enfermero/a (con homologación)',      timeMonths: 48, salaryRange: '2.200–3.200€/mes', skillsToLearn: ['Inglés'],                       note: 'Si tienes título, la homologación tarda 1–2 años pero multiplica el salario.' },
    ],
  },
  {
    id: 'cleaning',
    sector: 'Limpieza y Servicios',
    icon: '🧹',
    description: 'Sector invisible pero muy estable: hoteles, hospitales, empresas y oficinas siempre necesitan personal. Primer empleo frecuente para recién llegados.',
    triggerSkills: ['Limpieza profesional'],
    entryBarrier: 'ninguna',
    steps: [
      { role: 'Limpiador/a',                       timeMonths: 0,  salaryRange: '900–1.200€/mes',  skillsToLearn: ['Limpieza profesional'],              note: 'Sin requisitos. Suele incluir horas extra y complementos.' },
      { role: 'Supervisor/a de limpieza',           timeMonths: 18, salaryRange: '1.300–1.600€/mes', skillsToLearn: ['Atención al cliente'],               note: 'Gestión de equipo pequeño; frecuente en hoteles y hospitales.' },
      { role: 'Coordinador de servicios generales', timeMonths: 42, salaryRange: '1.600–2.200€/mes', skillsToLearn: ['Excel', 'Gestión de proyectos'],     note: 'Gestión de múltiples equipos y contratos.' },
    ],
  },
  {
    id: 'transport',
    sector: 'Transporte y Reparto',
    icon: '🚛',
    description: 'Europa tiene déficit de 400.000 conductores. Los salarios suben cada año y hay trabajo en todos los países.',
    triggerSkills: ['Conducción profesional', 'Carretillero (forklift)', 'Logística de almacén'],
    entryBarrier: 'baja',
    steps: [
      { role: 'Repartidor / Mensajero',         timeMonths: 0,  salaryRange: '1.100–1.400€/mes', skillsToLearn: ['Atención al cliente'],        note: 'Requiere carnet B. Trabajo disponible de inmediato (Amazon, DHL, Glovo).' },
      { role: 'Conductor profesional (rígido)',  timeMonths: 4,  salaryRange: '1.600–2.000€/mes', skillsToLearn: ['Conducción profesional'],     note: 'Licencia C + CAP: 3–5 meses. Escasez brutal en toda Europa.' },
      { role: 'Conductor C+E (tráiler)',         timeMonths: 8,  salaryRange: '2.200–3.000€/mes', skillsToLearn: ['Conducción profesional'],     note: 'Trayectos internacionales pagan dietas extra.' },
      { role: 'Transportista autónomo',          timeMonths: 36, salaryRange: '2.500–4.000€/mes', skillsToLearn: ['Excel', 'Gestión de proyectos'], note: 'Con camión propio o alquilado los ingresos son muy superiores.' },
    ],
  },
  {
    id: 'security',
    sector: 'Seguridad Privada',
    icon: '🛡️',
    description: 'Sector regulado con acceso relativamente rápido. Requisito: residencia legal y antecedentes limpios.',
    triggerSkills: ['Seguridad y vigilancia'],
    entryBarrier: 'baja',
    steps: [
      { role: 'Vigilante de seguridad',        timeMonths: 2,  salaryRange: '1.100–1.500€/mes', skillsToLearn: ['Seguridad y vigilancia'],   note: 'Habilitación TIP en España (6 semanas). Otros países tienen equivalentes.' },
      { role: 'Escolta / Seguridad especializada', timeMonths: 18, salaryRange: '1.500–2.200€/mes', skillsToLearn: ['Inglés'],              note: 'Mejor pagado en aeropuertos, eventos y perfiles VIP.' },
      { role: 'Jefe de seguridad',             timeMonths: 48, salaryRange: '2.000–3.000€/mes', skillsToLearn: ['Gestión de proyectos'],    note: 'Gestión de equipos y planificación de servicios.' },
    ],
  },
  {
    id: 'agriculture',
    sector: 'Agricultura y Agroindustria',
    icon: '🌾',
    description: 'Primera fuente de empleo en zonas rurales de España, Francia, Italia y Australia. Estacional pero con alojamiento incluido frecuentemente.',
    triggerSkills: ['Agricultura y campo', 'Costura industrial'],
    entryBarrier: 'ninguna',
    steps: [
      { role: 'Jornalero / Temporero',           timeMonths: 0,  salaryRange: '800–1.300€/mes',  skillsToLearn: ['Agricultura y campo'],       note: 'Sin requisitos. Contratos de 3–6 meses con alojamiento incluido a veces.' },
      { role: 'Tractorista / Operador maquinaria', timeMonths: 6, salaryRange: '1.200–1.600€/mes', skillsToLearn: ['Carretillero (forklift)'], note: 'Certificación de maquinaria agrícola; disponible en cooperativas locales.' },
      { role: 'Encargado de finca / Capataz',    timeMonths: 24, salaryRange: '1.500–2.000€/mes', skillsToLearn: ['Gestión de proyectos', 'Excel'], note: 'Gestión de cuadrillas y planificación de cosechas.' },
    ],
  },
  {
    id: 'tech-from-scratch',
    sector: 'Tecnología (desde cero)',
    icon: '💻',
    description: 'Si tienes habilidades digitales básicas, la transición a tech es la que más cambia la trayectoria económica a largo plazo.',
    triggerSkills: ['Excel', 'Atención al cliente', 'Power BI', 'Logística de almacén'],
    entryBarrier: 'media',
    steps: [
      { role: 'Soporte técnico / Help Desk',       timeMonths: 3,  salaryRange: '1.200–1.600€/mes', skillsToLearn: ['Inglés', 'Linux'],                    note: 'Bootcamp de 3 meses. Certificación CompTIA A+ valorada.' },
      { role: 'QA Tester / Analista de datos junior', timeMonths: 9, salaryRange: '1.600–2.200€/mes', skillsToLearn: ['SQL', 'Excel', 'Scrum'],            note: 'Roles de entrada al mundo tech sin necesidad de programar.' },
      { role: 'Desarrollador web junior',          timeMonths: 12, salaryRange: '1.800–2.500€/mes', skillsToLearn: ['JavaScript', 'React', 'Git'],         note: '6–12 meses autodidacta con freeCodeCamp / The Odin Project.' },
      { role: 'Desarrollador mid / Data Analyst',  timeMonths: 36, salaryRange: '2.800–4.500€/mes', skillsToLearn: ['TypeScript', 'Python', 'SQL'],        note: 'Con 2–3 años de experiencia real el salto salarial es exponencial.' },
    ],
  },
];

export function getCareerPaths(skills: string[]): { path: CareerPath; matched: boolean }[] {
  const skillsLower = skills.map(s => s.toLowerCase());
  return CAREER_PATHS.map(path => ({
    path,
    matched: path.triggerSkills.some(ts => skillsLower.includes(ts.toLowerCase())),
  })).sort((a, b) => Number(b.matched) - Number(a.matched));
}
