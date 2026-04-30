export interface CountryOpportunity {
  country: string;
  matchedSkills: string[];
  demandLevel: 'alta' | 'media' | 'baja';
  reason: string;
}

// Demanda de habilidades por país (mapa estático, extensible)
const SKILL_DEMAND: Record<string, { skills: string[]; reason: string; demandLevel: 'alta' | 'media' | 'baja' }> = {
  'Alemania': {
    skills: ['TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C#', 'Docker', 'Kubernetes', 'Ingeniería', 'Medicina', 'Enfermería', 'SQL', 'AWS', 'Azure'],
    demandLevel: 'alta',
    reason: 'Déficit crítico de trabajadores calificados en tech y salud (Fachkräftemangel).',
  },
  'Canadá': {
    skills: ['Machine Learning', 'IA', 'Data Science', 'Python', 'React', 'Node.js', 'Enfermería', 'Medicina', 'Ingeniería', 'AWS', 'GCP', 'Scrum'],
    demandLevel: 'alta',
    reason: 'Programa Express Entry prioriza perfiles tech y salud con alta inmigración calificada.',
  },
  'España': {
    skills: ['Marketing', 'SEO', 'Diseño', 'Figma', 'JavaScript', 'React', 'Python', 'Turismo', 'Contabilidad', 'Logística'],
    demandLevel: 'media',
    reason: 'Ecosistema startup en crecimiento, especialmente en Barcelona y Madrid.',
  },
  'Países Bajos': {
    skills: ['TypeScript', 'React', 'Angular', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'Finanzas', 'Logística', 'Scrum', 'Agile'],
    demandLevel: 'alta',
    reason: 'Hub tecnológico y logístico europeo, alta demanda de perfiles internacionales en inglés.',
  },
  'Australia': {
    skills: ['Enfermería', 'Medicina', 'Ingeniería', 'Python', 'Java', 'SQL', 'AWS', 'GCP', 'Arquitectura', 'Contabilidad'],
    demandLevel: 'alta',
    reason: 'Lista de habilidades críticas (Skilled Occupation List) con visa permanente accesible.',
  },
  'Reino Unido': {
    skills: ['Python', 'Machine Learning', 'IA', 'React', 'Node.js', 'Finanzas', 'Derecho', 'Medicina', 'Enfermería', 'CI/CD'],
    demandLevel: 'alta',
    reason: 'Visa de talento global (Global Talent Visa) para perfiles tech y ciencias.',
  },
  'Portugal': {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Marketing', 'Diseño', 'Figma', 'SEO', 'Contabilidad'],
    demandLevel: 'media',
    reason: 'Destino popular para nómadas digitales latinoamericanos con Golden Visa y NHR.',
  },
  'Emiratos Árabes': {
    skills: ['Finanzas', 'Contabilidad', 'Logística', 'Arquitectura', 'Ingeniería', 'Marketing', 'Gestión de proyectos', 'SQL', 'Power BI'],
    demandLevel: 'media',
    reason: 'Economía en expansión con exención fiscal, atractiva para perfiles de negocio.',
  },
  'Estados Unidos': {
    skills: ['Machine Learning', 'IA', 'React', 'TypeScript', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'Data Science', 'Finanzas'],
    demandLevel: 'alta',
    reason: 'Mayor mercado tech del mundo; visa H-1B para especialistas. Alta competencia.',
  },
  'Irlanda': {
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Azure', 'GCP', 'Scrum', 'CI/CD'],
    demandLevel: 'alta',
    reason: 'Sede europea de Google, Meta, Microsoft. Critical Skills Permit accesible.',
  },
};

export function getOpportunitiesForSkills(skills: string[]): CountryOpportunity[] {
  const results: CountryOpportunity[] = [];

  for (const [country, data] of Object.entries(SKILL_DEMAND)) {
    const matched = skills.filter(skill =>
      data.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    if (matched.length > 0) {
      results.push({
        country,
        matchedSkills: matched,
        demandLevel: data.demandLevel,
        reason: data.reason,
      });
    }
  }

  // Sort by number of matched skills descending
  return results.sort((a, b) => b.matchedSkills.length - a.matchedSkills.length);
}
