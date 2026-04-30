import type { MigrantPerson } from '../models/MigrantPerson';

export interface SkillRecommendation {
  skill: string;
  priority: 'crítica' | 'alta' | 'media';
  learningWeeks: number;
  platforms: string[];
  reason: string;
}

const SKILL_LEARNING_META: Record<string, Omit<SkillRecommendation, 'skill'>> = {
  'React':            { priority: 'crítica', learningWeeks: 6,  platforms: ['freeCodeCamp', 'Scrimba', 'Udemy'],          reason: 'Framework frontend más demandado en el mercado tech.' },
  'TypeScript':       { priority: 'alta',    learningWeeks: 4,  platforms: ['TS Docs', 'Udemy', 'Frontend Masters'],       reason: 'Estándar en proyectos React y Node.js modernos.' },
  'Node.js':          { priority: 'alta',    learningWeeks: 5,  platforms: ['The Odin Project', 'Udemy', 'Node Docs'],     reason: 'Backend JS con alta demanda en startups y corporaciones.' },
  'Python':           { priority: 'crítica', learningWeeks: 8,  platforms: ['Codecademy', 'freeCodeCamp', 'Coursera'],     reason: 'Líder en IA, Data Science y automatización.' },
  'SQL':              { priority: 'crítica', learningWeeks: 3,  platforms: ['SQLZoo', 'Mode Analytics', 'Khan Academy'],   reason: 'Habilidad transversal requerida en casi todos los roles tech.' },
  'Docker':           { priority: 'alta',    learningWeeks: 3,  platforms: ['Play with Docker', 'Udemy', 'Docker Docs'],   reason: 'Estándar de despliegue en entornos profesionales.' },
  'AWS':              { priority: 'alta',    learningWeeks: 8,  platforms: ['AWS Free Tier', 'A Cloud Guru', 'Udemy'],     reason: 'Cloud dominante; certificación AWS muy valorada internacionalmente.' },
  'Machine Learning': { priority: 'alta',    learningWeeks: 16, platforms: ['Coursera (Andrew Ng)', 'fast.ai', 'Kaggle'],  reason: 'Sector de mayor crecimiento salarial en tech.' },
  'Power BI':         { priority: 'media',   learningWeeks: 3,  platforms: ['Microsoft Learn', 'Udemy', 'YouTube'],        reason: 'Herramienta BI más adoptada en empresas no-tech.' },
  'Scrum':            { priority: 'media',   learningWeeks: 1,  platforms: ['Scrum.org', 'Coursera', 'LinkedIn Learning'], reason: 'Metodología estándar; certificación PSM valorada mundialmente.' },
  'Git':              { priority: 'crítica', learningWeeks: 1,  platforms: ['GitHub Skills', 'Atlassian', 'freeCodeCamp'], reason: 'Control de versiones imprescindible en cualquier rol tech.' },
  'Inglés':           { priority: 'crítica', learningWeeks: 24, platforms: ['Duolingo', 'British Council', 'Cambly'],      reason: 'Idioma de trabajo en la mayoría de países destino.' },
  'Alemán':           { priority: 'alta',    learningWeeks: 52, platforms: ['Goethe Institut', 'Duolingo', 'Babbel'],      reason: 'Requerido para integración laboral plena en Alemania.' },
  'Excel':            { priority: 'media',   learningWeeks: 2,  platforms: ['Microsoft Learn', 'Chandoo.org', 'Udemy'],    reason: 'Habilidad de oficina universal en roles no-tech.' },
  'Figma':            { priority: 'media',   learningWeeks: 3,  platforms: ['Figma Community', 'YouTube', 'Coursera'],     reason: 'Herramienta de diseño UI/UX más adoptada.' },
  'JavaScript':       { priority: 'crítica', learningWeeks: 8,  platforms: ['freeCodeCamp', 'The Odin Project', 'MDN'],    reason: 'Base del desarrollo web moderno.' },
};

const COUNTRY_CRITICAL_SKILLS: Record<string, string[]> = {
  'Alemania':        ['TypeScript', 'React', 'Docker', 'SQL', 'Git', 'Alemán', 'Inglés'],
  'Canadá':          ['Python', 'Machine Learning', 'React', 'SQL', 'AWS', 'Inglés'],
  'España':          ['React', 'JavaScript', 'SQL', 'Inglés', 'Excel'],
  'Países Bajos':    ['TypeScript', 'React', 'Docker', 'Scrum', 'Inglés'],
  'Australia':       ['Python', 'SQL', 'AWS', 'React', 'Inglés'],
  'Reino Unido':     ['Python', 'React', 'Machine Learning', 'SQL', 'Inglés'],
  'Portugal':        ['React', 'Node.js', 'SQL', 'Inglés', 'Git'],
  'Emiratos Árabes': ['SQL', 'Power BI', 'Excel', 'Scrum', 'Inglés'],
  'Estados Unidos':  ['React', 'TypeScript', 'AWS', 'Python', 'Machine Learning', 'Git', 'Inglés'],
  'Irlanda':         ['TypeScript', 'React', 'Node.js', 'Docker', 'AWS', 'Inglés'],
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
