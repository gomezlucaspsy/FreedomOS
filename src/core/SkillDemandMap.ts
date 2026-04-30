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
    skills: ['TypeScript', 'React', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'Docker', 'Kubernetes', 'Ingeniería', 'Medicina', 'Enfermería', 'SQL', 'AWS', 'Azure', 'Cuidado de personas mayores', 'Albañilería', 'Conducción profesional', 'Logística de almacén', 'Cocina profesional', 'Carretillero (forklift)', 'Electricidad básica', 'Fontanería básica'],
    demandLevel: 'alta',
    reason: 'Déficit crítico de trabajadores en tech, salud y oficios (Fachkräftemangel). Escasez en todos los niveles.',
  },
  'Austria': {
    skills: ['Ingeniería', 'Turismo', 'Python', 'Java', 'SQL', 'Contabilidad', 'Arquitectura', 'Enfermería', 'Logística', 'Cocina profesional', 'Cuidado de personas mayores', 'Albañilería', 'Atención al cliente'],
    demandLevel: 'media',
    reason: 'Economía estable con alta demanda en turismo, ingeniería, salud y hostelería.',
  },
  'Bélgica': {
    skills: ['Python', 'Java', 'SQL', 'React', 'Finanzas', 'Logística', 'Derecho', 'Contabilidad', 'Power BI', 'Logística de almacén', 'Conducción profesional', 'Atención al cliente'],
    demandLevel: 'media',
    reason: 'Capital de la UE con alta demanda de perfiles multilingüe en instituciones europeas y logística.',
  },
  'Chequia': {
    skills: ['Ingeniería', 'Java', 'Python', 'SQL', 'C#', 'Logística', 'Contabilidad', 'React', 'Manufactura', 'Logística de almacén', 'Albañilería'],
    demandLevel: 'media',
    reason: 'Hub manufacturero y tech de Europa Central con costo de vida competitivo.',
  },
  'Dinamarca': {
    skills: ['Python', 'React', 'Data Science', 'Enfermería', 'Ingeniería', 'Machine Learning', 'Scrum', 'SQL', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Agricultura y campo'],
    demandLevel: 'alta',
    reason: 'País líder en innovación con alta calidad de vida; demanda de perfiles tech, salud y cuidados.',
  },
  'España': {
    skills: ['Marketing', 'SEO', 'Diseño', 'Figma', 'JavaScript', 'React', 'Python', 'Turismo', 'Contabilidad', 'Logística', 'Cocina profesional', 'Atención al cliente', 'Logística de almacén', 'Agricultura y campo', 'Limpieza profesional', 'Albañilería', 'Cuidado de personas mayores'],
    demandLevel: 'media',
    reason: 'Ecosistema startup en crecimiento y gran demanda de hostelería, construcción y cuidados.',
  },
  'Finlandia': {
    skills: ['Python', 'React', 'Machine Learning', 'Ingeniería', 'SQL', 'Docker', 'Data Science', 'C++', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Conducción profesional'],
    demandLevel: 'alta',
    reason: 'Ecosistema tech maduro + envejecimiento poblacional con escasez de cuidadores.',
  },
  'Francia': {
    skills: ['Python', 'React', 'Java', 'Machine Learning', 'Diseño', 'Marketing', 'Finanzas', 'Ingeniería', 'SQL', 'Cocina profesional', 'Agricultura y campo', 'Atención al cliente', 'Logística de almacén'],
    demandLevel: 'media',
    reason: 'French Tech Visa + fuerte demanda en hostelería, agricultura y logística.',
  },
  'Irlanda': {
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Azure', 'GCP', 'Scrum', 'CI/CD', 'Cocina profesional', 'Atención al cliente', 'Cuidado de personas mayores'],
    demandLevel: 'alta',
    reason: 'Sede europea de Google, Meta, Microsoft. Escasez también en hostelería y cuidados.',
  },
  'Italia': {
    skills: ['Diseño', 'Arquitectura', 'Turismo', 'Marketing', 'Ingeniería', 'SQL', 'Python', 'Contabilidad', 'Cocina profesional', 'Agricultura y campo', 'Albañilería', 'Limpieza profesional'],
    demandLevel: 'media',
    reason: 'Fuerte en moda, diseño y turismo. Alta demanda de trabajadores en hostelería y campo.',
  },
  'Noruega': {
    skills: ['Ingeniería', 'Enfermería', 'Medicina', 'Python', 'SQL', 'Logística', 'Arquitectura', 'Data Science', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Albañilería', 'Conducción profesional'],
    demandLevel: 'alta',
    reason: 'Salarios más altos de Europa; alta demanda en salud, energía, ingeniería y oficios.',
  },
  'Países Bajos': {
    skills: ['TypeScript', 'React', 'Angular', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Science', 'Finanzas', 'Logística', 'Scrum', 'Logística de almacén', 'Conducción profesional', 'Atención al cliente', 'Agricultura y campo'],
    demandLevel: 'alta',
    reason: 'Hub tecnológico y logístico europeo; gran puerto de Rotterdam con demanda permanente de logística.',
  },
  'Polonia': {
    skills: ['Java', 'Python', 'React', 'C#', 'SQL', 'Ingeniería', 'Contabilidad', 'Docker', 'Manufactura', 'Logística de almacén', 'Albañilería'],
    demandLevel: 'media',
    reason: 'Mercado tech y manufacturero en rápido crecimiento.',
  },
  'Portugal': {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Marketing', 'Diseño', 'Figma', 'SEO', 'Contabilidad', 'Cocina profesional', 'Turismo', 'Atención al cliente', 'Limpieza profesional'],
    demandLevel: 'media',
    reason: 'Destino popular para latinoamericanos + alta demanda en turismo y hostelería.',
  },
  'Reino Unido': {
    skills: ['Python', 'Machine Learning', 'IA', 'React', 'Node.js', 'Finanzas', 'Derecho', 'Medicina', 'Enfermería', 'CI/CD', 'Cuidado de personas mayores', 'Conducción profesional', 'Albañilería', 'Auxiliar de enfermería', 'Cocina profesional'],
    demandLevel: 'alta',
    reason: 'Global Talent Visa + escasez crítica de conductores, cuidadores y trabajadores de construcción.',
  },
  'Suecia': {
    skills: ['Python', 'React', 'Machine Learning', 'Data Science', 'Ingeniería', 'SQL', 'Docker', 'Scrum', 'Enfermería', 'Cuidado de personas mayores', 'Auxiliar de enfermería', 'Logística de almacén'],
    demandLevel: 'alta',
    reason: 'Cuna de Spotify, Klarna, IKEA + envejecimiento con escasez de cuidadores.',
  },
  'Suiza': {
    skills: ['Python', 'Java', 'Machine Learning', 'Finanzas', 'Ingeniería', 'SQL', 'Data Science', 'Medicina', 'Contabilidad', 'Cocina profesional', 'Turismo', 'Cuidado de personas mayores'],
    demandLevel: 'alta',
    reason: 'Salarios más altos de Europa en finanzas, pharma, hostelería de lujo y cuidados.',
  },
  // ── Americas ────────────────────────────────────────────────────────────────
  'Argentina': {
    skills: ['React', 'Python', 'Node.js', 'Diseño', 'Marketing', 'Data Science', 'Java', 'SQL', 'Atención al cliente', 'Logística de almacén'],
    demandLevel: 'media',
    reason: 'Ecosistema tech local robusto; exportación de talento digital con salarios en USD.',
  },
  'Brasil': {
    skills: ['React', 'Python', 'Java', 'SQL', 'Marketing', 'Diseño', 'Node.js', 'Data Science', 'Cocina profesional', 'Agricultura y campo', 'Logística de almacén'],
    demandLevel: 'media',
    reason: 'Mayor economía de Latam; fintech y agtech en expansión. Requiere portugués.',
  },
  'Canadá': {
    skills: ['Machine Learning', 'IA', 'Data Science', 'Python', 'React', 'Node.js', 'Enfermería', 'Medicina', 'Ingeniería', 'AWS', 'GCP', 'Scrum', 'Cuidado de personas mayores', 'Conducción profesional', 'Logística de almacén', 'Albañilería', 'Cocina profesional'],
    demandLevel: 'alta',
    reason: 'Express Entry prioriza tech y salud + gran escasez de oficios calificados y cuidadores.',
  },
  'Chile': {
    skills: ['React', 'Python', 'SQL', 'Ingeniería', 'Finanzas', 'Marketing', 'Data Science', 'Java', 'Atención al cliente', 'Agricultura y campo'],
    demandLevel: 'media',
    reason: 'Economía más estable de Latam; Start-Up Chile atrae emprendedores globales.',
  },
  'Colombia': {
    skills: ['React', 'Node.js', 'Python', 'Marketing', 'Diseño', 'SQL', 'Logística', 'Java', 'Atención al cliente', 'Logística de almacén'],
    demandLevel: 'media',
    reason: 'Hub tech emergente en Medellín y Bogotá; demanda de desarrolladores y servicios.',
  },
  'Estados Unidos': {
    skills: ['Machine Learning', 'IA', 'React', 'TypeScript', 'Python', 'Java', 'AWS', 'Docker', 'Kubernetes', 'Data Science', 'Finanzas', 'Cocina profesional', 'Logística de almacén', 'Conducción profesional', 'Agricultura y campo', 'Albañilería', 'Cuidado de personas mayores'],
    demandLevel: 'alta',
    reason: 'Mayor mercado tech + enorme demanda de servicios, construcción, transporte y cuidados.',
  },
  'México': {
    skills: ['React', 'Java', 'Python', 'SQL', 'Logística', 'Marketing', 'Contabilidad', 'Ingeniería', 'Manufactura', 'Logística de almacén', 'Atención al cliente'],
    demandLevel: 'media',
    reason: 'Nearshoring en auge + manufactura en expansión por relocalización de empresas.',
  },
  'Uruguay': {
    skills: ['React', 'Node.js', 'Python', 'SQL', 'Diseño', 'Contabilidad', 'Marketing', 'Java', 'Atención al cliente', 'Turismo'],
    demandLevel: 'media',
    reason: 'País más digitalizado de Latam; alta calidad de vida y estabilidad institucional.',
  },
  // ── Asia-Pacific ────────────────────────────────────────────────────────────
  'Australia': {
    skills: ['Enfermería', 'Medicina', 'Ingeniería', 'Python', 'Java', 'SQL', 'AWS', 'GCP', 'Arquitectura', 'Contabilidad', 'Agricultura y campo', 'Cuidado de personas mayores', 'Albañilería', 'Conducción profesional'],
    demandLevel: 'alta',
    reason: 'Skilled Occupation List + gran escasez de cuidadores, agricultores y trabajadores de obra.',
  },
  'Corea del Sur': {
    skills: ['React', 'TypeScript', 'Python', 'Java', 'Machine Learning', 'Diseño', 'SQL', 'Docker', 'Manufactura', 'Logística de almacén'],
    demandLevel: 'alta',
    reason: 'Líder en semiconductores, gaming y manufactura; visa para trabajadores de manufactura activa.',
  },
  'Japón': {
    skills: ['Java', 'Python', 'C++', 'React', 'SQL', 'Ingeniería', 'Medicina', 'Machine Learning'],
    demandLevel: 'alta',
    reason: 'Envejecimiento poblacional crea demanda urgente de trabajadores calificados. Visa HSP accesible.',
  },
  'Nueva Zelanda': {
    skills: ['Enfermería', 'Medicina', 'Ingeniería', 'Python', 'React', 'SQL', 'Arquitectura', 'Turismo', 'Agricultura y campo', 'Cuidado de personas mayores', 'Albañilería'],
    demandLevel: 'alta',
    reason: 'Skilled Migrant Category + alta demanda en salud, construcción y agro.',
  },
  'Singapur': {
    skills: ['Python', 'Machine Learning', 'React', 'TypeScript', 'Finanzas', 'Data Science', 'Docker', 'Kubernetes', 'SQL', 'Cocina profesional', 'Logística de almacén'],
    demandLevel: 'alta',
    reason: 'Hub financiero y tech de Asia + alta demanda en hostelería y logística portuaria.',
  },
  'China': {
    skills: ['Python', 'Machine Learning', 'IA', 'Java', 'C++', 'React', 'SQL', 'Data Science', 'Mandarín', 'Kubernetes', 'Docker', 'Manufactura'],
    demandLevel: 'alta',
    reason: 'Segunda economía global; líder en IA, manufactura avanzada. Mandarín casi obligatorio.',
  },
  'Rusia': {
    skills: ['Python', 'C++', 'Java', 'Machine Learning', 'Data Science', 'SQL', 'Matemática', 'Ingeniería', 'Ruso', 'Linux'],
    demandLevel: 'media',
    reason: 'Fuerte tradición en matemática aplicada, ciberseguridad e ingeniería. Ecosistema tech local con Yandex, Sber y 1C.',
  },
  // ── Middle East ─────────────────────────────────────────────────────────────
  'Arabia Saudita': {
    skills: ['Ingeniería', 'Arquitectura', 'Logística', 'Finanzas', 'SQL', 'Power BI', 'Gestión de proyectos', 'Medicina', 'Albañilería', 'Conducción profesional', 'Limpieza profesional', 'Logística de almacén'],
    demandLevel: 'alta',
    reason: 'Vision 2030 impulsa mega-proyectos; alta demanda de ingenieros, trabajadores de obra y transporte.',
  },
  'Emiratos Árabes': {
    skills: ['Finanzas', 'Contabilidad', 'Logística', 'Arquitectura', 'Ingeniería', 'Marketing', 'Gestión de proyectos', 'SQL', 'Power BI', 'Cocina profesional', 'Atención al cliente', 'Logística de almacén', 'Limpieza profesional'],
    demandLevel: 'alta',
    reason: 'Economía en expansión; hostelería de lujo, logística y construcción con gran demanda de migrantes.',
  },
  'Qatar': {
    skills: ['Ingeniería', 'Arquitectura', 'Logística', 'Gestión de proyectos', 'Finanzas', 'SQL', 'Medicina', 'Enfermería', 'Albañilería', 'Conducción profesional', 'Logística de almacén'],
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
