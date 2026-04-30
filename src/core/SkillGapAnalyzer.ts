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
};

const COUNTRY_CRITICAL_SKILLS: Record<string, string[]> = {
  // ── Europe ────────────────────────────────────────
  'Alemania':        ['TypeScript', 'React', 'Docker', 'SQL', 'Git', 'Alemán', 'Inglés'],
  'Austria':         ['SQL', 'Java', 'Inglés', 'Alemán', 'Excel'],
  'Bélgica':         ['Python', 'SQL', 'Inglés', 'Francés', 'Power BI'],
  'Chequia':         ['Java', 'SQL', 'Python', 'C#', 'Inglés'],
  'Dinamarca':       ['Python', 'React', 'SQL', 'Scrum', 'Inglés'],
  'España':          ['React', 'JavaScript', 'SQL', 'Inglés', 'Excel'],
  'Finlandia':       ['Python', 'React', 'Machine Learning', 'Docker', 'Inglés'],
  'Francia':         ['Python', 'React', 'SQL', 'Francés', 'Inglés'],
  'Irlanda':         ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS', 'Inglés'],
  'Italia':          ['SQL', 'Python', 'Inglés', 'Excel', 'Figma'],
  'Noruega':         ['Python', 'SQL', 'Inglés', 'Data Science', 'Git'],
  'Países Bajos':    ['TypeScript', 'React', 'Docker', 'Scrum', 'Inglés', 'Neerlandés'],
  'Polonia':         ['Java', 'Python', 'React', 'SQL', 'Inglés'],
  'Portugal':        ['React', 'Node.js', 'SQL', 'Inglés', 'Git'],
  'Reino Unido':     ['Python', 'React', 'Machine Learning', 'SQL', 'Inglés'],
  'Suecia':          ['Python', 'React', 'SQL', 'Machine Learning', 'Inglés'],
  'Suiza':           ['Python', 'Java', 'SQL', 'Inglés', 'Alemán'],
  // ── Americas ──────────────────────────────────────
  'Argentina':       ['React', 'Python', 'SQL', 'Inglés', 'Git'],
  'Brasil':          ['React', 'Python', 'SQL', 'Portugués', 'Java'],
  'Canadá':          ['Python', 'Machine Learning', 'React', 'SQL', 'AWS', 'Inglés'],
  'Chile':           ['React', 'Python', 'SQL', 'Inglés', 'Data Science'],
  'Colombia':        ['React', 'Node.js', 'SQL', 'Inglés', 'Python'],
  'Estados Unidos':  ['React', 'TypeScript', 'AWS', 'Python', 'Machine Learning', 'Git', 'Inglés'],
  'México':          ['React', 'Java', 'SQL', 'Inglés', 'Python'],
  'Uruguay':         ['React', 'Node.js', 'SQL', 'Inglés', 'Git'],
  // ── Asia-Pacific ──────────────────────────────────
  'Australia':       ['Python', 'SQL', 'AWS', 'React', 'Inglés'],
  'Corea del Sur':   ['React', 'TypeScript', 'Python', 'SQL', 'Coreano'],
  'Japón':           ['Java', 'Python', 'SQL', 'Japonés', 'C++'],
  'Nueva Zelanda':   ['Python', 'SQL', 'React', 'Inglés', 'Git'],
  'Singapur':        ['Python', 'Machine Learning', 'React', 'SQL', 'Inglés', 'Docker'],
  'China':           ['Python', 'Machine Learning', 'Java', 'SQL', 'Mandarín', 'Docker'],
  'Rusia':           ['Python', 'C++', 'SQL', 'Linux', 'Java'],
  // ── Middle East ───────────────────────────────────
  'Arabia Saudita':  ['SQL', 'Power BI', 'Excel', 'Inglés', 'Gestión de proyectos'],
  'Emiratos Árabes': ['SQL', 'Power BI', 'Excel', 'Scrum', 'Inglés'],
  'Qatar':           ['SQL', 'Excel', 'Inglés', 'Power BI', 'Git'],
  // ── Africa ────────────────────────────────────────
  'Sudáfrica':       ['Python', 'React', 'SQL', 'Inglés', 'Java'],
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
