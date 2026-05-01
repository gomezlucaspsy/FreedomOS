import { COUNTRY_MOBILITY_EXTENDED } from './CountryMobilityExtended';

export type VisaTrackType = 'work_and_travel' | 'student' | 'fifo' | 'skilled' | 'sponsored';

export interface VisaTrack {
  id: string;
  type: VisaTrackType;
  title: string;
  summary: string;
  officialUrl: string;
  eligibility: string[];
  typicalRoles: string[];
  requiredSkills: string[];
  caution: string;
}

export interface JobPortal {
  id: string;
  name: string;
  url: string;
  category: 'general' | 'niche' | 'government' | 'company-careers';
  sectors: string[];
  notes?: string;
}

export interface CountryMobilityPack {
  country: string;
  visaTracks: VisaTrack[];
  portals: JobPortal[];
}

const COUNTRY_MOBILITY: Record<string, CountryMobilityPack> = {
  'Australia': {
    country: 'Australia',
    visaTracks: [
      {
        id: 'au-whv-417-462',
        type: 'work_and_travel',
        title: 'Working Holiday Visa (subclass 417 / 462)',
        summary: 'Permite trabajar temporalmente y financiar la estancia mientras viajas.',
        officialUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing',
        eligibility: ['Edad y pasaporte elegible segun pais', 'Fondos iniciales', 'Seguro medico recomendado'],
        typicalRoles: ['Hospitality staff', 'Farm worker', 'Warehouse operator', 'Housekeeping'],
        requiredSkills: ['Inglés', 'RSA (Responsible Service of Alcohol)', 'Manual Handling'],
        caution: 'Las condiciones dependen de nacionalidad y cupos; verificar siempre la web oficial de Home Affairs.',
      },
      {
        id: 'au-student-500',
        type: 'student',
        title: 'Student Visa (subclass 500)',
        summary: 'Ruta de estudio con permiso laboral parcial durante el periodo academico.',
        officialUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
        eligibility: ['Oferta de institucion registrada (CRICOS)', 'Seguro OSHC', 'Prueba de fondos'],
        typicalRoles: ['Retail assistant', 'Barista', 'Kitchen hand', 'Customer service'],
        requiredSkills: ['Inglés', 'Atención al cliente', 'Manipulación de alimentos'],
        caution: 'El limite de horas de trabajo puede cambiar por normativa vigente.',
      },
      {
        id: 'au-fifo-mining',
        type: 'fifo',
        title: 'FIFO Mining Pathway',
        summary: 'Ruta laboral en mineria y energia por turnos fly-in fly-out, especialmente en WA y QLD.',
        officialUrl: 'https://www.seek.com.au/fifo-jobs',
        eligibility: ['Derecho laboral vigente en Australia', 'Examenes medicos y de seguridad', 'Disponibilidad para roster por turnos'],
        typicalRoles: ['Mine site cleaner', 'Utility worker', 'Drill offsider', 'Plant operator'],
        requiredSkills: ['White Card', 'Working at Heights', 'Confined Space Entry', 'First Aid/CPR'],
        caution: 'Cada empresa exige tickets distintos y validacion medica previa.',
      },
      {
        id: 'au-sponsored-482',
        type: 'sponsored',
        title: 'Temporary Skill Shortage Visa (subclass 482)',
        summary: 'Ruta con empleador sponsor para ocupaciones incluidas en listas vigentes.',
        officialUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482',
        eligibility: ['Oferta laboral sponsor', 'Experiencia demostrable', 'Requisitos de ingles del stream'],
        typicalRoles: ['Chef', 'Registered nurse', 'Software engineer', 'Construction trades'],
        requiredSkills: ['Inglés', 'Cocina profesional', 'Enfermería', 'TypeScript'],
        caution: 'La elegibilidad depende del occupation list y del stream activo.',
      },
    ],
    portals: [
      { id: 'au-seek', name: 'SEEK Australia', url: 'https://www.seek.com.au/', category: 'general', sectors: ['tech', 'hospitality', 'construction', 'logistics', 'healthcare'] },
      { id: 'au-indeed', name: 'Indeed Australia', url: 'https://au.indeed.com/', category: 'general', sectors: ['all'] },
      { id: 'au-linkedin', name: 'LinkedIn Jobs AU', url: 'https://www.linkedin.com/jobs/', category: 'general', sectors: ['all'] },
      { id: 'au-workforce', name: 'Workforce Australia', url: 'https://www.workforceaustralia.gov.au/', category: 'government', sectors: ['all'], notes: 'Portal oficial de empleo y programas de colocacion.' },
      { id: 'au-harvest', name: 'Harvest Trail Jobs', url: 'https://www.workforceaustralia.gov.au/individuals/coaching/careers/harvest', category: 'government', sectors: ['agriculture'], notes: 'Clave para trabajo regional y estacional.' },
      { id: 'au-workpac', name: 'WorkPac', url: 'https://www.workpacgroup.com/jobs', category: 'niche', sectors: ['fifo', 'mining', 'construction'] },
      { id: 'au-hays-mining', name: 'Hays Resources & Mining', url: 'https://www.hays.com.au/jobs/resources-mining-jobs', category: 'niche', sectors: ['fifo', 'mining'] },
      { id: 'au-rio', name: 'Rio Tinto Careers', url: 'https://www.riotinto.com/careers', category: 'company-careers', sectors: ['fifo', 'mining'] },
      { id: 'au-bhp', name: 'BHP Careers', url: 'https://www.bhp.com/careers', category: 'company-careers', sectors: ['fifo', 'mining'] },
      { id: 'au-fmg', name: 'Fortescue Careers', url: 'https://www.fmgl.com.au/careers', category: 'company-careers', sectors: ['fifo', 'mining'] },
      { id: 'au-hospitality', name: 'Scout Jobs AU', url: 'https://www.scoutjobs.com.au/', category: 'niche', sectors: ['hospitality'] },
      { id: 'au-transport', name: 'JobSearch Transport AU', url: 'https://www.seek.com.au/driver-jobs', category: 'niche', sectors: ['logistics', 'transport'] },
    ],
  },
  'Canadá': {
    country: 'Canadá',
    visaTracks: [
      {
        id: 'ca-iec-wh',
        type: 'work_and_travel',
        title: 'International Experience Canada (Working Holiday)',
        summary: 'Permiso abierto temporal para trabajar y viajar en Canada.',
        officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html',
        eligibility: ['Pais elegible IEC', 'Edad segun convenio bilateral', 'Seguro medico y fondos'],
        typicalRoles: ['Hospitality staff', 'Ski resort worker', 'Warehouse picker', 'Farm labor'],
        requiredSkills: ['Inglés', 'Atención al cliente', 'Manual Handling'],
        caution: 'Pool por invitaciones; revisa fechas y rondas del programa IEC.',
      },
      {
        id: 'ca-student',
        type: 'student',
        title: 'Study Permit + empleo parcial',
        summary: 'Permiso de estudios con opcion de empleo parcial durante periodos autorizados.',
        officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html',
        eligibility: ['Carta de aceptacion DLI', 'Prueba de fondos', 'Cumplir condiciones del permiso'],
        typicalRoles: ['Retail associate', 'Food service worker', 'Tutor assistant'],
        requiredSkills: ['Inglés', 'Atención al cliente', 'Manipulación de alimentos'],
        caution: 'Las horas permitidas para trabajo de estudiantes se actualizan periodicamente.',
      },
      {
        id: 'ca-sponsored',
        type: 'sponsored',
        title: 'Employer-specific Work Permit (LMIA stream)',
        summary: 'Ruta patrocinada por empleador para ocupaciones con escasez local.',
        officialUrl: 'https://www.canada.ca/en/employment-social-development/services/foreign-workers.html',
        eligibility: ['Oferta laboral con LMIA cuando aplique', 'Experiencia acorde al puesto'],
        typicalRoles: ['Truck driver', 'Caregiver', 'Cook', 'Software developer'],
        requiredSkills: ['Conducción profesional', 'Cuidado de personas mayores', 'Cocina profesional', 'TypeScript'],
        caution: 'El requisito LMIA puede cambiar segun programa y provincia.',
      },
      {
        id: 'ca-skilled-express',
        type: 'skilled',
        title: 'Express Entry (Skilled pathways)',
        summary: 'Ruta para perfiles calificados con puntaje por idioma, experiencia y educacion.',
        officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html',
        eligibility: ['Perfil en pool', 'Resultados de idioma', 'Evaluacion de estudios cuando aplique'],
        typicalRoles: ['Software engineer', 'Nurse', 'Data analyst', 'Electrician'],
        requiredSkills: ['Inglés', 'SQL', 'Python', 'Electricidad básica'],
        caution: 'Los cortes CRS y draws cambian en cada ronda.',
      },
    ],
    portals: [
      { id: 'ca-jobbank', name: 'Job Bank (Official)', url: 'https://www.jobbank.gc.ca/', category: 'government', sectors: ['all'] },
      { id: 'ca-indeed', name: 'Indeed Canada', url: 'https://ca.indeed.com/', category: 'general', sectors: ['all'] },
      { id: 'ca-linkedin', name: 'LinkedIn Jobs CA', url: 'https://www.linkedin.com/jobs/', category: 'general', sectors: ['all'] },
      { id: 'ca-eluta', name: 'Eluta', url: 'https://www.eluta.ca/', category: 'general', sectors: ['all'] },
      { id: 'ca-wowjobs', name: 'WowJobs', url: 'https://www.wowjobs.ca/', category: 'general', sectors: ['all'] },
      { id: 'ca-care', name: 'Care.com Canada', url: 'https://www.care.com/en-ca/jobs', category: 'niche', sectors: ['healthcare', 'caregiving'] },
      { id: 'ca-truck', name: 'TruckersReport Jobs', url: 'https://www.thetruckersreport.com/jobs/', category: 'niche', sectors: ['transport', 'logistics'] },
      { id: 'ca-construction', name: 'Workopolis Construction', url: 'https://www.workopolis.com/en/jobs/in-construction', category: 'niche', sectors: ['construction'] },
    ],
  },
  'Nueva Zelanda': {
    country: 'Nueva Zelanda',
    visaTracks: [
      {
        id: 'nz-wh',
        type: 'work_and_travel',
        title: 'Working Holiday Visa',
        summary: 'Permite trabajar temporalmente y recorrer Nueva Zelanda.',
        officialUrl: 'https://www.immigration.govt.nz/new-zealand-visas/options/work',
        eligibility: ['Nacionalidad y edad elegibles', 'Fondos y billete de salida o fondos para compra'],
        typicalRoles: ['Fruit picker', 'Hospitality assistant', 'Housekeeper', 'Warehouse worker'],
        requiredSkills: ['Inglés', 'Agricultura y campo', 'Atención al cliente'],
        caution: 'Los cupos y fechas de apertura dependen del acuerdo bilateral.',
      },
      {
        id: 'nz-student',
        type: 'student',
        title: 'Student Visa',
        summary: 'Ruta de estudios con opciones de trabajo parcial segun condiciones.',
        officialUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/student-visa',
        eligibility: ['Oferta educativa', 'Fondos', 'Seguro medico y cumplimiento de condiciones'],
        typicalRoles: ['Barista', 'Retail assistant', 'Kitchen hand'],
        requiredSkills: ['Inglés', 'RSA (Responsible Service of Alcohol)', 'Atención al cliente'],
        caution: 'Revisar limite de horas y condiciones del permiso vigente.',
      },
      {
        id: 'nz-sponsored',
        type: 'sponsored',
        title: 'Accredited Employer Work Visa',
        summary: 'Ruta patrocinada por empleadores acreditados.',
        officialUrl: 'https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa',
        eligibility: ['Oferta de empleador acreditado', 'Salario y ocupacion en linea con requisitos'],
        typicalRoles: ['Caregiver', 'Construction worker', 'Truck driver', 'Software developer'],
        requiredSkills: ['Conducción profesional', 'Cuidado de personas mayores', 'Albañilería', 'React'],
        caution: 'Los umbrales salariales y requisitos se revisan periodicamente.',
      },
    ],
    portals: [
      { id: 'nz-seek', name: 'SEEK NZ', url: 'https://www.seek.co.nz/', category: 'general', sectors: ['all'] },
      { id: 'nz-trademe', name: 'Trade Me Jobs', url: 'https://www.trademe.co.nz/a/jobs', category: 'general', sectors: ['all'] },
      { id: 'nz-linkedin', name: 'LinkedIn Jobs NZ', url: 'https://www.linkedin.com/jobs/', category: 'general', sectors: ['all'] },
      { id: 'nz-picknz', name: 'PickNZ', url: 'https://www.picknz.co.nz/', category: 'government', sectors: ['agriculture'], notes: 'Portal orientado a empleo de cosecha y granjas.' },
      { id: 'nz-winz', name: 'Work and Income', url: 'https://www.workandincome.govt.nz/work/index.html', category: 'government', sectors: ['all'] },
      { id: 'nz-backpacker', name: 'BackpackerBoard Jobs', url: 'https://www.backpackerboard.co.nz/work_jobs/', category: 'niche', sectors: ['work-and-travel', 'hospitality', 'agriculture'] },
      { id: 'nz-healthcare', name: 'Kiwi Health Jobs', url: 'https://www.kiwihealthjobs.com/', category: 'niche', sectors: ['healthcare', 'caregiving'] },
    ],
  },
  'Irlanda': {
    country: 'Irlanda',
    visaTracks: [
      {
        id: 'ie-student',
        type: 'student',
        title: 'Student Route (Stamp 2)',
        summary: 'Ruta academica con opciones de trabajo parcial dentro de limites regulatorios.',
        officialUrl: 'https://www.irishimmigration.ie/',
        eligibility: ['Programa elegible', 'Fondos', 'Seguro medico'],
        typicalRoles: ['Hospitality worker', 'Retail assistant', 'Support staff'],
        requiredSkills: ['Inglés', 'Atención al cliente', 'Manipulación de alimentos'],
        caution: 'Las condiciones de trabajo dependen del tipo de programa y calendario academico.',
      },
      {
        id: 'ie-critical',
        type: 'skilled',
        title: 'Critical Skills Employment Permit',
        summary: 'Ruta para ocupaciones de alta demanda con posibilidad de residencia a mediano plazo.',
        officialUrl: 'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/',
        eligibility: ['Oferta en ocupacion elegible', 'Umbral salarial del permiso'],
        typicalRoles: ['Software engineer', 'Data scientist', 'Nurse'],
        requiredSkills: ['TypeScript', 'Python', 'SQL', 'Inglés'],
        caution: 'La lista de ocupaciones elegibles y umbrales salariales se actualiza.',
      },
      {
        id: 'ie-general-permit',
        type: 'sponsored',
        title: 'General Employment Permit',
        summary: 'Ruta patrocinada para ocupaciones fuera de critical skills con requisitos especificos.',
        officialUrl: 'https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/general-employment-permit/',
        eligibility: ['Oferta laboral valida', 'Cumplir labor market needs test cuando aplique'],
        typicalRoles: ['Chef', 'Care assistant', 'Logistics roles'],
        requiredSkills: ['Cocina profesional', 'Cuidado de personas mayores', 'Logística de almacén'],
        caution: 'Los criterios dependen del rol y el empleador.',
      },
    ],
    portals: [
      { id: 'ie-irishjobs', name: 'IrishJobs', url: 'https://www.irishjobs.ie/', category: 'general', sectors: ['all'] },
      { id: 'ie-jobsie', name: 'Jobs.ie', url: 'https://www.jobs.ie/', category: 'general', sectors: ['all'] },
      { id: 'ie-linkedin', name: 'LinkedIn Jobs IE', url: 'https://www.linkedin.com/jobs/', category: 'general', sectors: ['all'] },
      { id: 'ie-eures', name: 'EURES Ireland', url: 'https://eures.europa.eu/index_en', category: 'government', sectors: ['all'] },
      { id: 'ie-publicjobs', name: 'publicjobs.ie', url: 'https://www.publicjobs.ie/', category: 'government', sectors: ['government', 'administration'] },
      { id: 'ie-caterer', name: 'CatererGlobal', url: 'https://www.catererglobal.com/', category: 'niche', sectors: ['hospitality'] },
      { id: 'ie-health', name: 'HSE Jobs', url: 'https://www.hse.ie/eng/staff/jobs/', category: 'niche', sectors: ['healthcare', 'caregiving'] },
      { id: 'ie-techlife', name: 'TechLife Ireland Jobs', url: 'https://www.techlifeireland.com/', category: 'niche', sectors: ['tech'] },
    ],
  },
  'España': {
    country: 'España',
    visaTracks: [
      {
        id: 'es-student',
        type: 'student',
        title: 'Estancia por estudios',
        summary: 'Ruta academica con condiciones de trabajo parcial segun normativa vigente.',
        officialUrl: 'https://www.inclusion.gob.es/',
        eligibility: ['Admisión a centro autorizado', 'Medios economicos', 'Seguro medico'],
        typicalRoles: ['Hostelería', 'Retail', 'Atención al cliente'],
        requiredSkills: ['Español funcional', 'Atención al cliente', 'Manipulación de alimentos'],
        caution: 'Revisa requisitos vigentes en Extranjeria antes de postular.',
      },
      {
        id: 'es-sponsored',
        type: 'sponsored',
        title: 'Autorizacion de residencia y trabajo por cuenta ajena',
        summary: 'Ruta con contrato laboral y tramite por empleador.',
        officialUrl: 'https://extranjeros.inclusion.gob.es/',
        eligibility: ['Oferta laboral formal', 'Cumplir requisitos documentales'],
        typicalRoles: ['Construcción', 'Cuidados', 'Transporte', 'Hostelería'],
        requiredSkills: ['Albañilería', 'Cuidado de personas mayores', 'Conducción profesional', 'Cocina profesional'],
        caution: 'La viabilidad depende de catalogo de ocupaciones y situacion documental.',
      },
      {
        id: 'es-seasonal',
        type: 'work_and_travel',
        title: 'Contratacion temporal en origen (campañas estacionales)',
        summary: 'Ruta de trabajo temporal usada en agricultura y campañas concretas.',
        officialUrl: 'https://www.sepe.es/',
        eligibility: ['Oferta en campaña autorizada', 'Documentacion migratoria correspondiente'],
        typicalRoles: ['Recolector', 'Empaquetado', 'Manipulacion en almacenes agricolas'],
        requiredSkills: ['Agricultura y campo', 'Manual Handling'],
        caution: 'No es equivalente a Working Holiday; revisar convocatorias oficiales.',
      },
    ],
    portals: [
      { id: 'es-infojobs', name: 'InfoJobs', url: 'https://www.infojobs.net/', category: 'general', sectors: ['all'] },
      { id: 'es-linkedin', name: 'LinkedIn Jobs ES', url: 'https://www.linkedin.com/jobs/', category: 'general', sectors: ['all'] },
      { id: 'es-indeed', name: 'Indeed España', url: 'https://es.indeed.com/', category: 'general', sectors: ['all'] },
      { id: 'es-sepe', name: 'SEPE Empleo', url: 'https://www.sepe.es/HomeSepe/personas/encontrar-trabajo.html', category: 'government', sectors: ['all'] },
      { id: 'es-lanbide', name: 'Lanbide', url: 'https://www.lanbide.euskadi.eus/', category: 'government', sectors: ['all'] },
      { id: 'es-turijobs', name: 'Turijobs', url: 'https://www.turijobs.com/', category: 'niche', sectors: ['hospitality', 'tourism'] },
      { id: 'es-hosteleo', name: 'Hosteleo', url: 'https://hosteleo.com/es', category: 'niche', sectors: ['hospitality'] },
      { id: 'es-logistica', name: 'LogisticaJobs', url: 'https://www.infojobs.net/ofertas-trabajo/logistica', category: 'niche', sectors: ['logistics', 'transport'] },
      { id: 'es-construccion', name: 'Construyendoempleo', url: 'https://construyendoempleo.com/', category: 'niche', sectors: ['construction'] },
    ],
  },
};

const SKILL_TO_SECTOR: Record<string, string[]> = {
  'cocina profesional': ['hospitality'],
  'manipulación de alimentos': ['hospitality'],
  'manipulacion de alimentos': ['hospitality'],
  'atención al cliente': ['hospitality', 'retail'],
  'atencion al cliente': ['hospitality', 'retail'],
  'logística de almacén': ['logistics'],
  'logistica de almacen': ['logistics'],
  'conducción profesional': ['transport', 'logistics'],
  'conduccion profesional': ['transport', 'logistics'],
  'carretillero (forklift)': ['logistics'],
  'albañilería': ['construction'],
  'albanileria': ['construction'],
  'electricidad básica': ['construction'],
  'electricidad basica': ['construction'],
  'fontanería básica': ['construction'],
  'fontaneria basica': ['construction'],
  'cuidado de personas mayores': ['caregiving', 'healthcare'],
  'auxiliar de enfermería': ['caregiving', 'healthcare'],
  'auxiliar de enfermeria': ['caregiving', 'healthcare'],
  'enfermería': ['healthcare'],
  'enfermeria': ['healthcare'],
  'agricultura y campo': ['agriculture'],
  'react': ['tech'],
  'typescript': ['tech'],
  'python': ['tech'],
  'sql': ['tech'],
  'white card': ['fifo', 'mining', 'construction'],
  'working at heights': ['fifo', 'mining', 'construction'],
  'confined space entry': ['fifo', 'mining'],
  'first aid/cpr': ['fifo', 'healthcare'],
  'rsa (responsible service of alcohol)': ['hospitality'],
  'rsg (responsible service of gambling)': ['hospitality'],
};

function inferSectorsFromSkills(skills: string[]): Set<string> {
  const sectors = new Set<string>();
  for (const skill of skills) {
    const tags = SKILL_TO_SECTOR[skill.toLowerCase()];
    if (!tags) continue;
    tags.forEach(tag => sectors.add(tag));
  }
  return sectors;
}

export function getCountryMobilityPack(country: string): CountryMobilityPack | null {
  return COUNTRY_MOBILITY[country] ?? COUNTRY_MOBILITY_EXTENDED[country] ?? null;
}

export function getRecommendedPortalsForProfile(pack: CountryMobilityPack, profileSkills: string[], maxResults = 8): JobPortal[] {
  const sectors = inferSectorsFromSkills(profileSkills);

  const scored = pack.portals.map(portal => {
    let score = 0;
    if (portal.category === 'government') score += 1;
    if (portal.sectors.includes('all')) score += 2;

    for (const sector of portal.sectors) {
      if (sectors.has(sector)) score += 3;
    }

    return { portal, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.portal)
    .slice(0, maxResults);
}

export function getVisaTypeLabel(type: VisaTrackType): string {
  if (type === 'work_and_travel') return 'Work and Travel';
  if (type === 'student') return 'Student Visa';
  if (type === 'fifo') return 'FIFO';
  if (type === 'skilled') return 'Skilled';
  return 'Employer Sponsored';
}
