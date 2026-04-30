export interface CountryOpportunity {
  country: string;
  matchedSkills: string[];
  demandLevel: 'alta' | 'media' | 'baja';
  reason: string;
}

// Demanda de habilidades por país (mapa estático, extensible)
const SKILL_DEMAND: Record<string, { skills: string[]; reason: string; demandLevel: 'alta' | 'media' | 'baja' }> = {
  // ── Europe ──────────────────────────────────────────────────────────────────
  'Alemania': {
    skills: ['TypeScript', 'React', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'Docker', 'Kubernetes', 'Ingeniería', 'Medicina', 'Enfermería', 'SQL', 'AWS', 'Azure'],
    demandLevel: 'alta',
    reason: 'Déficit crítico de trabajadores calificados en tech y salud (Fachkräftemangel).',
  },
  'Austria': {
    skills: ['Ingeniería', 'Turismo', 'Python', 'Java', 'SQL', 'Contabilidad', 'Arquitectura', 'Enfermería', 'Logística'],
    demandLevel: 'media',
    reason: 'Economía estable con alta demanda en turismo, ingeniería y salud. Puerta de entrada a Europa Central.',
  },
  'Bélgica': {
    skills: ['Python', 'Java', 'SQL', 'React', 'Finanzas', 'Logística', 'Derecho', 'Contabilidad', 'Power BI'],
    demandLevel: 'media',
    reason: 'Capital de la UE con alta demanda de perfiles multilingüe en instituciones europeas y logística.',
  },
  'Chequia': {
    skills: ['Ingeniería', 'Java', 'Python', 'SQL', 'C#', 'Logística', 'Contabilidad', 'React'],
    demandLevel: 'media',
    reason: 'Hub manufacturero y tech de Europa Central con costo de vida competitivo.',
  },
  'Dinamarca': {
    skills: ['Python', 'React', 'Data Science', 'Enfermería', 'Ingeniería', 'Machine Learning', 'Scrum', 'SQL'],
    demandLevel: 'alta',
    reason: 'País líder en innovación con alta calidad de vida; demanda de perfiles tech y salud.',
  },
  'España': {
    skills: ['Marketing', 'SEO', 'Diseño', 'Figma', 'JavaScript', 'React', 'Python', 'Turismo', 'Contabilidad', 'Logística'],
    demandLevel: 'media',
    reason: 'Ecosistema startup en crecimiento, especialmente en Barcelona y Madrid.',
  },
  'Finlandia': {
    skills: ['Python', 'React', 'Machine Learning', 'Ingeniería', 'SQL', 'Docker', 'Data Science', 'C++'],
    demandLevel: 'alta',
    reason: 'Ecosistema tech maduro (Nokia, Supercell). Visa de startup y alta empleabilidad en tech.',
  },
  'Francia': {
    skills: ['Python', 'React', 'Java', 'Machine Learning', 'Diseño', 'Marketing', 'Finanzas', 'Ingeniería', 'SQL'],
    demandLevel: 'media',
    reason: 'Programa French Tech Visa atrae talento global; fuerte en aeroespacial, lujo y tech.',
  },
  'Irlanda': {
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Azure', 'GCP', 'Scrum', 'CI/CD'],
    demandLevel: 'alta',
    reason: 'Sede europea de Google, Meta, Microsoft. Critical Skills Permit accesible.',
  },
  'Italia': {
    skills: ['Diseño', 'Arquitectura', 'Turismo', 'Marketing', 'Ingeniería', 'SQL', 'Python', 'Contabilidad'],
    demandLevel: 'media',
    reason: 'Fuerte en moda, diseño industrial y turismo. Startup visa disponible.',
  },
  'Noruega': {
    skills: ['Ingeniería', 'Enfermería', 'Medicina', 'Python', 'SQL', 'Logística', 'Arquitectura', 'Data Science'],
    demandLevel: 'alta',
    reason: 'Uno de los salarios más altos del mundo; alta demanda en salud, energía e ingeniería.',
  },
  'Países Bajos': {
    skills: ['TypeScript', 'React', 'Angular', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'Finanzas', 'Logística', 'Scrum'],
    demandLevel: 'alta',
    reason: 'Hub tecnológico y logístico europeo, alta demanda de perfiles internacionales en inglés.',
  },
  'Polonia': {
    skills: ['Java', 'Python', 'React', 'C#', 'SQL', 'Ingeniería', 'Contabilidad', 'Docker'],
    demandLevel: 'media',
    reason: 'Mercado tech en rápido crecimiento con bajo costo de vida y alta demanda de desarrolladores.',
  },
  'Portugal': {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Marketing', 'Diseño', 'Figma', 'SEO', 'Contabilidad'],
    demandLevel: 'media',
    reason: 'Destino popular para nómadas digitales latinoamericanos con Golden Visa y NHR.',
  },
  'Reino Unido': {
    skills: ['Python', 'Machine Learning', 'IA', 'React', 'Node.js', 'Finanzas', 'Derecho', 'Medicina', 'Enfermería', 'CI/CD'],
    demandLevel: 'alta',
    reason: 'Visa de talento global (Global Talent Visa) para perfiles tech y ciencias.',
  },
  'Suecia': {
    skills: ['Python', 'React', 'Machine Learning', 'Data Science', 'Ingeniería', 'SQL', 'Docker', 'Scrum', 'Enfermería'],
    demandLevel: 'alta',
    reason: 'Cuna de Spotify, Klarna, IKEA. Alta demanda tech con excelente calidad de vida.',
  },
  'Suiza': {
    skills: ['Python', 'Java', 'Machine Learning', 'Finanzas', 'Ingeniería', 'SQL', 'Data Science', 'Medicina', 'Contabilidad'],
    demandLevel: 'alta',
    reason: 'Salarios más altos de Europa. Alta demanda en finanzas, pharma, ingeniería de precisión.',
  },
  // ── Americas ────────────────────────────────────────────────────────────────
  'Argentina': {
    skills: ['React', 'Python', 'Node.js', 'Diseño', 'Marketing', 'Data Science', 'Java', 'SQL'],
    demandLevel: 'media',
    reason: 'Ecosistema tech local robusto; exportación de talento digital con salarios en USD.',
  },
  'Brasil': {
    skills: ['React', 'Python', 'Java', 'SQL', 'Marketing', 'Diseño', 'Node.js', 'Data Science'],
    demandLevel: 'media',
    reason: 'Mayor economía de Latam; fintech y agtech en expansión. Requiere portugués.',
  },
  'Canadá': {
    skills: ['Machine Learning', 'IA', 'Data Science', 'Python', 'React', 'Node.js', 'Enfermería', 'Medicina', 'Ingeniería', 'AWS', 'GCP', 'Scrum'],
    demandLevel: 'alta',
    reason: 'Programa Express Entry prioriza perfiles tech y salud con alta inmigración calificada.',
  },
  'Chile': {
    skills: ['React', 'Python', 'SQL', 'Ingeniería', 'Finanzas', 'Marketing', 'Data Science', 'Java'],
    demandLevel: 'media',
    reason: 'Economía más estable de Latam; Start-Up Chile atrae emprendedores globales.',
  },
  'Colombia': {
    skills: ['React', 'Node.js', 'Python', 'Marketing', 'Diseño', 'SQL', 'Logística', 'Java'],
    demandLevel: 'media',
    reason: 'Hub tech emergente en Medellín y Bogotá; gran demanda de desarrolladores remotos.',
  },
  'Estados Unidos': {
    skills: ['Machine Learning', 'IA', 'React', 'TypeScript', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'Data Science', 'Finanzas'],
    demandLevel: 'alta',
    reason: 'Mayor mercado tech del mundo; visa H-1B para especialistas. Alta competencia.',
  },
  'México': {
    skills: ['React', 'Java', 'Python', 'SQL', 'Logística', 'Marketing', 'Contabilidad', 'Ingeniería'],
    demandLevel: 'media',
    reason: 'Nearshoring en auge; gran demanda de perfiles tech bilingüe por empresas estadounidenses.',
  },
  'Uruguay': {
    skills: ['React', 'Node.js', 'Python', 'SQL', 'Diseño', 'Contabilidad', 'Marketing', 'Java'],
    demandLevel: 'media',
    reason: 'País más digitalizado de Latam; visa tech accesible, alta calidad de vida y estabilidad.',
  },
  // ── Asia-Pacific ────────────────────────────────────────────────────────────
  'Australia': {
    skills: ['Enfermería', 'Medicina', 'Ingeniería', 'Python', 'Java', 'SQL', 'AWS', 'GCP', 'Arquitectura', 'Contabilidad'],
    demandLevel: 'alta',
    reason: 'Lista de habilidades críticas (Skilled Occupation List) con visa permanente accesible.',
  },
  'Corea del Sur': {
    skills: ['React', 'TypeScript', 'Python', 'Java', 'Machine Learning', 'Diseño', 'SQL', 'Docker'],
    demandLevel: 'alta',
    reason: 'Líder en semiconductores, gaming y K-tech. Visa D-8 para startups y talento tech.',
  },
  'Japón': {
    skills: ['Java', 'Python', 'C++', 'React', 'SQL', 'Ingeniería', 'Medicina', 'Machine Learning'],
    demandLevel: 'alta',
    reason: 'Envejecimiento poblacional crea demanda urgente de trabajadores calificados. Visa HSP accesible.',
  },
  'Nueva Zelanda': {
    skills: ['Enfermería', 'Medicina', 'Ingeniería', 'Python', 'React', 'SQL', 'Arquitectura', 'Turismo'],
    demandLevel: 'alta',
    reason: 'Skilled Migrant Category con puntos; alta demanda en salud, construcción y tech.',
  },
  'Singapur': {
    skills: ['Python', 'Machine Learning', 'React', 'TypeScript', 'Finanzas', 'Data Science', 'Docker', 'Kubernetes', 'SQL'],
    demandLevel: 'alta',
    reason: 'Hub financiero y tech de Asia. Employment Pass accesible para perfiles calificados.',
  },
  'China': {
    skills: ['Python', 'Machine Learning', 'IA', 'Java', 'C++', 'React', 'SQL', 'Data Science', 'Mandarín', 'Kubernetes', 'Docker'],
    demandLevel: 'alta',
    reason: 'Segunda economía global; líder en IA, manufactura avanzada y comercio electrónico. Mandarín casi obligatorio.',
  },
  'Rusia': {
    skills: ['Python', 'C++', 'Java', 'Machine Learning', 'Data Science', 'SQL', 'Matemática', 'Ingeniería', 'Ruso', 'Linux'],
    demandLevel: 'media',
    reason: 'Fuerte tradición en matemática aplicada, ciberseguridad e ingeniería. Ecosistema tech local con Yandex, Sber y 1C.',
  },
  // ── Middle East ─────────────────────────────────────────────────────────────
  'Arabia Saudita': {
    skills: ['Ingeniería', 'Arquitectura', 'Logística', 'Finanzas', 'SQL', 'Power BI', 'Gestión de proyectos', 'Medicina'],
    demandLevel: 'alta',
    reason: 'Vision 2030 impulsa mega-proyectos; alta demanda de ingenieros, médicos y gestores. Sin impuesto a la renta.',
  },
  'Emiratos Árabes': {
    skills: ['Finanzas', 'Contabilidad', 'Logística', 'Arquitectura', 'Ingeniería', 'Marketing', 'Gestión de proyectos', 'SQL', 'Power BI'],
    demandLevel: 'alta',
    reason: 'Economía en expansión con exención fiscal, atractiva para perfiles de negocio y tech.',
  },
  'Qatar': {
    skills: ['Ingeniería', 'Arquitectura', 'Logística', 'Gestión de proyectos', 'Finanzas', 'SQL', 'Medicina', 'Enfermería'],
    demandLevel: 'alta',
    reason: 'Inversión masiva en infraestructura y servicios. Sin impuesto a la renta personal.',
  },
  // ── Africa ──────────────────────────────────────────────────────────────────
  'Sudáfrica': {
    skills: ['React', 'Python', 'SQL', 'Java', 'Ingeniería', 'Finanzas', 'Marketing', 'Data Science'],
    demandLevel: 'media',
    reason: 'Mayor economía del África subsahariana; hub tech emergente en Ciudad del Cabo y Johannesburgo.',
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
