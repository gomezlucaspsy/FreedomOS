import mammoth from 'mammoth';
import type { MigrantPerson, WorkExperience, Education } from '../models/MigrantPerson';

// ─── Keyword banks ────────────────────────────────────────────────────────────

const SKILL_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python',
  'Java', 'C#', 'C++', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD',
  'Machine Learning', 'IA', 'Data Science', 'Excel', 'Power BI', 'Tableau',
  'Marketing', 'SEO', 'Diseño', 'Figma', 'Photoshop', 'Illustrator',
  'Contabilidad', 'Finanzas', 'Logística', 'Gestión de proyectos',
  'Enfermería', 'Medicina', 'Ingeniería', 'Arquitectura', 'Derecho',
  'Scrum', 'Agile', 'Jira', 'REST', 'GraphQL', 'Linux',
];

const LANGUAGE_KEYWORDS = [
  'Español', 'English', 'Inglés', 'Francés', 'French', 'Alemán', 'German',
  'Italiano', 'Portugués', 'Mandarín', 'Árabe', 'Ruso', 'Japonés',
  'Catalán', 'Euskera',
];

const COUNTRY_HINTS: { pattern: RegExp; country: string }[] = [
  { pattern: /argentina/i,  country: 'Argentina' },
  { pattern: /españa|spain/i, country: 'España' },
  { pattern: /alemania|germany/i, country: 'Alemania' },
  { pattern: /canada/i, country: 'Canadá' },
  { pattern: /estados unidos|usa|united states/i, country: 'Estados Unidos' },
  { pattern: /mexico|méxico/i, country: 'México' },
  { pattern: /colombia/i, country: 'Colombia' },
  { pattern: /chile/i, country: 'Chile' },
  { pattern: /uruguay/i, country: 'Uruguay' },
  { pattern: /brasil|brazil/i, country: 'Brasil' },
  { pattern: /reino unido|uk|united kingdom/i, country: 'Reino Unido' },
];

// ─── Extraction helpers ───────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSkills(text: string): string[] {
  return SKILL_KEYWORDS.filter(skill =>
    new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i').test(text)
  );
}

function extractLanguages(text: string): string[] {
  return LANGUAGE_KEYWORDS.filter(lang =>
    new RegExp(`\\b${escapeRegex(lang)}\\b`, 'i').test(text)
  );
}

function extractCountry(text: string): string {
  for (const { pattern, country } of COUNTRY_HINTS) {
    if (pattern.test(text)) return country;
  }
  return 'Desconocido';
}

function extractEmail(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match?.[0];
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/\+?[\d\s\-().]{7,20}/);
  return match?.[0]?.trim();
}

function extractName(text: string): string {
  // First non-empty line is usually the name in a CV
  const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 2 && l.length < 60);
  return firstLine ?? 'Sin nombre';
}

function extractExperience(text: string): WorkExperience[] {
  const experiences: WorkExperience[] = [];
  // Look for patterns like "Role at/en Company (N years)" or "Role | Company"
  const lines = text.split('\n');
  for (const line of lines) {
    const atMatch = line.match(/(.+?)\s+(?:at|en|@)\s+(.+?)(?:\s*[–\-]\s*(.+))?$/i);
    if (atMatch) {
      const yearMatch = line.match(/(\d+)\s+a[ñn]os?/i);
      experiences.push({
        role: atMatch[1].trim(),
        company: atMatch[2].replace(/[()]/g, '').trim(),
        durationYears: yearMatch ? parseInt(yearMatch[1]) : 1,
      });
    }
  }
  return experiences.slice(0, 6);
}

function extractEducation(text: string): Education[] {
  const education: Education[] = [];
  const degreeKeywords = ['Licenciatura', 'Ingeniería', 'Maestría', 'Doctorado', 'Bachelor', 'Master', 'PhD', 'Técnico', 'Diplomado'];
  const lines = text.split('\n');
  for (const line of lines) {
    if (degreeKeywords.some(kw => new RegExp(kw, 'i').test(line))) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      education.push({
        degree: line.trim(),
        institution: '',
        year: yearMatch ? parseInt(yearMatch[0]) : undefined,
      });
    }
  }
  return education.slice(0, 4);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function parseDocumentToMigrant(file: File): Promise<MigrantPerson> {
  let rawText = '';

  if (file.name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    rawText = result.value;
  } else if (file.name.endsWith('.txt')) {
    rawText = await file.text();
  } else {
    throw new Error('Formato no soportado. Usa .docx o .txt');
  }

  const originCountry = extractCountry(rawText);

  return {
    id: `migrant_${Date.now()}`,
    fullName: extractName(rawText),
    originCountry,
    currentCountry: originCountry,
    email: extractEmail(rawText),
    phone: extractPhone(rawText),
    skills: extractSkills(rawText),
    languages: extractLanguages(rawText),
    education: extractEducation(rawText),
    experience: extractExperience(rawText),
    rawText,
  };
}
