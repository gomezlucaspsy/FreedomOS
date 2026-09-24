// Perfil fiscal, residencia y macroeconomía por país.
// Valores aproximados (reglas 2025/2026). Modelo simplificado para una persona soltera,
// asalariada, sin hijos. No reemplaza asesoría fiscal: verificar siempre en la autoridad oficial.

export type Region = 'Europa' | 'Américas' | 'Asia-Pacífico' | 'Medio Oriente' | 'África';
export type TaxBasis = 'mundial' | 'territorial' | 'remesa' | 'sin IRPF';

/** [límite superior del tramo (null = sin límite), tasa marginal] */
export type Bracket = [number | null, number];

export type RegimeModel =
  | { type: 'flat'; rate: number; includesSocial?: boolean; minGross?: number }
  | { type: 'exempt'; pct: number; minGross?: number; exemptCap?: number };

export interface NewcomerRegime {
  name: string;
  benefit: string;
  duration: string;
  who: string;
  /** Si existe, el simulador puede aplicar el régimen al salario. */
  model?: RegimeModel;
  /** Régimen de nicho (autónomos, visa o empleador específico): no se aplica automáticamente en rankings. */
  niche?: boolean;
}

export interface FiscalProfile {
  country: string;
  iso2: string;
  region: Region;
  currency: string;
  /** Unidades de moneda local por 1 USD (aprox. 2026). */
  fx: number;
  tax: {
    brackets: Bracket[];
    /** Deducción fija / mínimo exento sobre la base (moneda local anual). */
    std?: number;
    /** Deducción proporcional del bruto (gastos de trabajo) y su tope. */
    stdPct?: number;
    stdPctCap?: number;
    /** Tasa de seguridad social a cargo del empleado. */
    social: number;
    socialCap?: number;
    socialDeductible?: boolean;
    /** Cargas adicionales calculadas sobre el bruto (USC, NI, impuesto de tramo, etc.). */
    levies?: Bracket[];
    /** Si el bruto anual no supera este umbral, no se paga impuesto a la renta. */
    exemptBelow?: number;
    note?: string;
  };
  vat: number;
  corpTax: number;
  capitalGains: string;
  residency: { days: number | null; rule: string; basis: TaxBasis };
  regimes: NewcomerRegime[];
  path: { permanent: string; citizenship: string; dualCitizenship: 'sí' | 'no' | 'limitada' };
  eco: {
    gdpPcUSD: number;
    inflation: number;
    unemployment: number;
    minWageMonthlyUSD: number | null;
    avgGrossAnnualLocal: number;
    /** Índice de costo de vida (Nueva York = 100). */
    col: number;
    hdi: number;
  };
  authorityUrl: string;
}

const P = (p: FiscalProfile) => p;

export const FISCAL_PROFILES: FiscalProfile[] = [
  // ── Europa ─────────────────────────────────────────────────────────────────
  P({
    country: 'Alemania', iso2: 'DE', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[12096, 0], [17443, 0.2], [68480, 0.32], [277825, 0.42], [null, 0.45]],
      std: 1230, social: 0.205, socialCap: 96600, socialDeductible: true,
      note: 'Tarifa alemana aproximada por tramos lineales; clase fiscal I. Iglesia (8–9% del impuesto) no incluida.',
    },
    vat: 19, corpTax: 30, capitalGains: '25% + solidaridad (Abgeltungsteuer), exento €1.000',
    residency: { days: 183, rule: 'Domicilio (Wohnsitz) o residencia habitual > 6 meses', basis: 'mundial' },
    regimes: [
      { name: 'EU Blue Card', benefit: 'Residencia permanente en 21–27 meses; reunificación familiar sin requisito de idioma', duration: 'Indefinido', who: 'Titulados con oferta ≥ ~€48.300 (€43.760 en profesiones escasas)' },
      { name: 'Chancenkarte', benefit: 'Visa de búsqueda de empleo por puntos con permiso de trabajo de prueba 20 h/sem', duration: '12 meses', who: 'Profesionales con formación reconocida parcial o totalmente' },
    ],
    path: { permanent: '21 meses (Blue Card con B1) · 3–5 años general', citizenship: '5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 56000, inflation: 2.2, unemployment: 3.7, minWageMonthlyUSD: 2680, avgGrossAnnualLocal: 55000, col: 65, hdi: 0.959 },
    authorityUrl: 'https://www.bundesfinanzministerium.de/',
  }),
  P({
    country: 'Austria', iso2: 'AT', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[13308, 0], [21617, 0.2], [35836, 0.3], [69166, 0.4], [103072, 0.48], [1000000, 0.5], [null, 0.55]],
      social: 0.1812, socialCap: 90300, socialDeductible: true,
      note: 'Los salarios 13° y 14° tributan ~6% (no modelado).',
    },
    vat: 20, corpTax: 23, capitalGains: '27,5% plano',
    residency: { days: 183, rule: 'Domicilio o estancia habitual > 6 meses', basis: 'mundial' },
    regimes: [
      { name: 'Zuzugsbegünstigung', benefit: 'Deducción del 30% del salario (o de gastos reales) para investigadores y expertos que se trasladan', duration: '5 años', who: 'Científicos, investigadores y expertos de interés público (aprobación previa)', model: { type: 'exempt', pct: 0.3 } },
      { name: 'Red-White-Red Card', benefit: 'Permiso de residencia y trabajo por puntos', duration: '2 años renovable', who: 'Trabajadores cualificados en ocupaciones escasas' },
    ],
    path: { permanent: '5 años', citizenship: '10 años (6 en casos especiales)', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 58000, inflation: 3.5, unemployment: 5.5, minWageMonthlyUSD: null, avgGrossAnnualLocal: 50000, col: 70, hdi: 0.93 },
    authorityUrl: 'https://www.bmf.gv.at/',
  }),
  P({
    country: 'Bélgica', iso2: 'BE', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[10910, 0], [15820, 0.25], [27920, 0.4], [48320, 0.45], [null, 0.5]],
      std: 5930, social: 0.1307, socialDeductible: true,
      note: 'Recargo municipal de ~7% del impuesto no incluido.',
    },
    vat: 21, corpTax: 25, capitalGains: 'Generalmente exentas para particulares (nuevo 10% desde 2026 sobre plusvalías financieras > €10.000)',
    residency: { days: null, rule: 'Domicilio o sede de la fortuna en Bélgica (registro municipal)', basis: 'mundial' },
    regimes: [
      { name: 'Régimen de impatriados (2022)', benefit: '30% del salario como reembolso de gastos libre de impuestos', duration: '5 años + 3 prorrogables', who: 'Salario bruto ≥ €75.000 o investigadores; sin residencia belga en 5 años previos', model: { type: 'exempt', pct: 0.3, minGross: 75000 } },
    ],
    path: { permanent: '5 años', citizenship: '5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 55000, inflation: 3.0, unemployment: 5.9, minWageMonthlyUSD: 2420, avgGrossAnnualLocal: 50000, col: 68, hdi: 0.951 },
    authorityUrl: 'https://finances.belgium.be/',
  }),
  P({
    country: 'Chequia', iso2: 'CZ', region: 'Europa', currency: 'CZK', fx: 21.2,
    tax: {
      brackets: [[205600, 0], [1762812, 0.15], [null, 0.23]],
      social: 0.116, socialDeductible: false,
      note: 'El crédito personal (CZK 30.840) se modela como mínimo exento.',
    },
    vat: 21, corpTax: 21, capitalGains: '15% (exención por tenencia > 3 años en acciones)',
    residency: { days: 183, rule: '183 días en el año calendario o domicilio', basis: 'mundial' },
    regimes: [
      { name: 'Paušální daň (impuesto global)', benefit: 'Cuota mensual fija que incluye impuesto, salud y pensión para autónomos', duration: 'Anual', who: 'Autónomos con facturación ≤ CZK 2 M' },
      { name: 'Employee Card / Blue Card', benefit: 'Permiso único de residencia y trabajo', duration: '2 años renovable', who: 'Trabajadores con oferta de empleo' },
    ],
    path: { permanent: '5 años', citizenship: '10 años de residencia total', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 32000, inflation: 2.5, unemployment: 2.8, minWageMonthlyUSD: 1057, avgGrossAnnualLocal: 580000, col: 50, hdi: 0.915 },
    authorityUrl: 'https://www.financnisprava.cz/',
  }),
  P({
    country: 'Chipre', iso2: 'CY', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[22000, 0], [32000, 0.2], [42000, 0.25], [72000, 0.3], [null, 0.35]],
      social: 0.1145, socialCap: 66612, socialDeductible: true,
      note: 'Tramos de la reforma 2026.',
    },
    vat: 19, corpTax: 15, capitalGains: 'Solo sobre inmuebles en Chipre (20%); valores exentos',
    residency: { days: 183, rule: '183 días o regla de 60 días (sin otra residencia fiscal, con empleo/empresa y vivienda)', basis: 'mundial' },
    regimes: [
      { name: 'Exención 50%', benefit: '50% del salario exento de impuesto', duration: '17 años', who: 'Nuevos residentes con salario > €55.000', model: { type: 'exempt', pct: 0.5, minGross: 55000 } },
      { name: 'Exención 20%', benefit: '20% del salario exento (máx. €8.550/año)', duration: '7 años', who: 'Nuevos residentes con primer empleo en Chipre', model: { type: 'exempt', pct: 0.2, exemptCap: 8550 } },
      { name: 'Non-dom', benefit: 'Sin impuesto de defensa (SDC) sobre dividendos, intereses y rentas', duration: '17 de 20 años', who: 'Personas sin domicilio chipriota' },
    ],
    path: { permanent: '5 años (o inversión ≥ €300.000)', citizenship: '7 años (4–5 vía rápida para alta cualificación)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 38000, inflation: 1.0, unemployment: 4.5, minWageMonthlyUSD: 1150, avgGrossAnnualLocal: 28000, col: 55, hdi: 0.913 },
    authorityUrl: 'https://www.mof.gov.cy/',
  }),
  P({
    country: 'Croacia', iso2: 'HR', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[7200, 0], [50400, 0.2], [null, 0.3]],
      social: 0.2, socialDeductible: true,
      note: 'Las tasas municipales varían (15–23% / 25–33%); se usa el promedio.',
    },
    vat: 25, corpTax: 18, capitalGains: '12% (exento tras 2 años de tenencia)',
    residency: { days: 183, rule: '183 días o domicilio', basis: 'mundial' },
    regimes: [
      { name: 'Nómada digital', benefit: 'Ingresos de empleador extranjero exentos de impuesto sobre la renta', duration: 'Hasta 18 meses', who: 'Trabajadores remotos con ingresos ≥ ~€3.300/mes' },
      { name: 'Jóvenes', benefit: 'Exención 100% hasta 25 años y 50% entre 26–30', duration: 'Por edad', who: 'Residentes jóvenes' },
    ],
    path: { permanent: '5 años', citizenship: '8 años', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 24000, inflation: 4.3, unemployment: 5.0, minWageMonthlyUSD: 1207, avgGrossAnnualLocal: 17500, col: 48, hdi: 0.889 },
    authorityUrl: 'https://www.porezna-uprava.hr/',
  }),
  P({
    country: 'Dinamarca', iso2: 'DK', region: 'Europa', currency: 'DKK', fx: 6.5,
    tax: {
      brackets: [[107200, 0], [641200, 0.37], [777900, 0.445], [2592700, 0.52], [null, 0.57]],
      social: 0.08, socialDeductible: true,
      note: 'AM-bidrag 8% + impuesto municipal/estatal (reforma 2026). La deducción por empleo se incluye en el mínimo exento.',
    },
    vat: 25, corpTax: 22, capitalGains: '27% hasta DKK ~67.500, 42% por encima',
    residency: { days: 180, rule: 'Vivienda disponible + estancia > 6 meses', basis: 'mundial' },
    regimes: [
      { name: 'Forskerordningen (régimen de investigadores)', benefit: '27% plano + 8% AM (≈32,8% total) en vez de la escala progresiva', duration: '7 años', who: 'Salario ≥ ~DKK 78.000/mes o investigadores', model: { type: 'flat', rate: 0.328, includesSocial: true, minGross: 936000 } },
    ],
    path: { permanent: '8 años', citizenship: '9 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 70000, inflation: 1.9, unemployment: 6.2, minWageMonthlyUSD: null, avgGrossAnnualLocal: 560000, col: 72, hdi: 0.962 },
    authorityUrl: 'https://skat.dk/',
  }),
  P({
    country: 'España', iso2: 'ES', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[7550, 0], [12450, 0.19], [20200, 0.24], [35200, 0.3], [60000, 0.37], [300000, 0.45], [null, 0.47]],
      social: 0.065, socialCap: 61214, socialDeductible: true,
      note: 'Escala estatal + autonómica media. Varía por comunidad (Madrid más baja, Cataluña más alta).',
    },
    vat: 21, corpTax: 25, capitalGains: '19–30% (base del ahorro)',
    residency: { days: 183, rule: '183 días o centro de intereses económicos / familia en España', basis: 'mundial' },
    regimes: [
      { name: 'Ley Beckham (impatriados)', benefit: '24% fijo sobre rentas del trabajo hasta €600.000; rentas extranjeras mayormente exentas', duration: '6 años', who: 'No residente en España en 5 años previos; contrato, nómada digital, emprendedor o alta cualificación', model: { type: 'flat', rate: 0.24 } },
      { name: 'Visa nómada digital', benefit: 'Residencia para teletrabajo con acceso a Ley Beckham', duration: '3 años + 2', who: 'Ingresos ≥ 200% SMI (~€2.760/mes)' },
    ],
    path: { permanent: '5 años', citizenship: '2 años para iberoamericanos · 10 general', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 36000, inflation: 2.7, unemployment: 10.5, minWageMonthlyUSD: 1587, avgGrossAnnualLocal: 30000, col: 49, hdi: 0.918 },
    authorityUrl: 'https://sede.agenciatributaria.gob.es/',
  }),
  P({
    country: 'Estonia', iso2: 'EE', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[8400, 0], [null, 0.22]],
      social: 0.036, socialDeductible: true,
      note: 'Impuesto plano 22%; exención básica €700/mes desde 2026.',
    },
    vat: 24, corpTax: 22, capitalGains: '22% plano',
    residency: { days: 183, rule: '183 días en 12 meses o domicilio', basis: 'mundial' },
    regimes: [
      { name: 'Impuesto corporativo diferido', benefit: '0% sobre beneficios reinvertidos; 22% solo al distribuir', duration: 'Permanente', who: 'Empresas estonias (incluye e-Residency)' },
      { name: 'Visa nómada digital', benefit: 'Residencia para trabajo remoto', duration: '1 año', who: 'Ingresos ≥ €4.500/mes' },
    ],
    path: { permanent: '5 años', citizenship: '8 años', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 31000, inflation: 5.0, unemployment: 7.0, minWageMonthlyUSD: 1018, avgGrossAnnualLocal: 24000, col: 55, hdi: 0.905 },
    authorityUrl: 'https://www.emta.ee/',
  }),
  P({
    country: 'Finlandia', iso2: 'FI', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[12000, 0], [21200, 0.18], [31500, 0.265], [52100, 0.38], [88200, 0.415], [null, 0.515]],
      social: 0.095, socialDeductible: true,
      note: 'Estatal + municipal promedio (~7,5%). Impuesto de iglesia opcional no incluido.',
    },
    vat: 25.5, corpTax: 20, capitalGains: '30% hasta €30.000, 34% por encima',
    residency: { days: 183, rule: 'Vivienda principal o estancia > 6 meses', basis: 'mundial' },
    regimes: [
      { name: 'Key employee (lähdevero)', benefit: 'Impuesto en la fuente 25% plano en vez de la escala progresiva', duration: '84 meses', who: 'Expertos con salario ≥ ~€5.800/mes', model: { type: 'flat', rate: 0.25, minGross: 69600 } },
    ],
    path: { permanent: '4 años', citizenship: '8 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 54000, inflation: 1.8, unemployment: 9.5, minWageMonthlyUSD: null, avgGrossAnnualLocal: 48000, col: 65, hdi: 0.948 },
    authorityUrl: 'https://www.vero.fi/',
  }),
  P({
    country: 'Francia', iso2: 'FR', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[11600, 0], [29579, 0.11], [84577, 0.3], [181917, 0.41], [null, 0.45]],
      stdPct: 0.1, stdPctCap: 14426, social: 0.22, socialDeductible: true,
      note: 'Una parte fiscal (soltero). CSG/CRDS incluida en seguridad social.',
    },
    vat: 20, corpTax: 25, capitalGains: '30% flat tax (PFU)',
    residency: { days: 183, rule: 'Hogar o estancia principal, actividad profesional principal o centro de intereses económicos', basis: 'mundial' },
    regimes: [
      { name: 'Impatriados (art. 155 B CGI)', benefit: 'Prima de impatriación exenta (forfait 30% del salario) + 50% de ciertas rentas extranjeras', duration: '8 años', who: 'Reclutados desde el extranjero; sin residencia francesa en 5 años previos', model: { type: 'exempt', pct: 0.3 } },
      { name: 'Passeport Talent', benefit: 'Permiso plurianual para perfiles cualificados, investigadores y fundadores', duration: '4 años', who: 'Master + salario ≥ ~€41.000 o proyecto innovador' },
    ],
    path: { permanent: '5 años (carte de résident 10 años)', citizenship: '5 años (2 con máster francés)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 46000, inflation: 1.0, unemployment: 7.6, minWageMonthlyUSD: 2070, avgGrossAnnualLocal: 42000, col: 63, hdi: 0.92 },
    authorityUrl: 'https://www.impots.gouv.fr/',
  }),
  P({
    country: 'Georgia', iso2: 'GE', region: 'Europa', currency: 'GEL', fx: 2.7,
    tax: { brackets: [[null, 0.2]], social: 0.02, socialDeductible: false, note: 'Impuesto plano 20% + pensión 2%.' },
    vat: 18, corpTax: 15, capitalGains: '20% (con exenciones por tenencia)',
    residency: { days: 183, rule: '183 días en 12 meses', basis: 'territorial' },
    regimes: [
      { name: 'Pequeña empresa individual', benefit: '1% sobre facturación hasta GEL 500.000 (~US$185k)', duration: 'Mientras cumpla requisitos', who: 'Freelancers y emprendedores registrados como empresario individual', model: { type: 'flat', rate: 0.01, includesSocial: true }, niche: true },
      { name: 'Territorialidad para individuos', benefit: 'Rentas de fuente extranjera exentas', duration: 'Permanente', who: 'Residentes fiscales personas físicas' },
      { name: 'Entrada sin visa 1 año', benefit: 'Estancia de hasta 365 días sin visa', duration: '1 año', who: 'Ciudadanos de ~95 países (incl. la mayoría de Latinoamérica)' },
    ],
    path: { permanent: '6 años (o inversión)', citizenship: '10 años', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 9500, inflation: 3.5, unemployment: 13.9, minWageMonthlyUSD: null, avgGrossAnnualLocal: 25000, col: 35, hdi: 0.844 },
    authorityUrl: 'https://www.rs.ge/',
  }),
  P({
    country: 'Grecia', iso2: 'GR', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[8600, 0], [10000, 0.09], [20000, 0.2], [30000, 0.26], [40000, 0.34], [60000, 0.39], [null, 0.44]],
      social: 0.1337, socialCap: 106000, socialDeductible: true,
      note: 'Escala 2026. El crédito fiscal se modela como mínimo exento.',
    },
    vat: 24, corpTax: 22, capitalGains: '15% (valores); inmuebles suspendido',
    residency: { days: 183, rule: '183 días o residencia permanente / centro de intereses', basis: 'mundial' },
    regimes: [
      { name: 'Art. 5C (trabajadores que se trasladan)', benefit: '50% de exención sobre salario o renta profesional', duration: '7 años', who: 'No residente fiscal en Grecia en 5 de los 6 años previos', model: { type: 'exempt', pct: 0.5 } },
      { name: 'Art. 5B (HNWI)', benefit: 'Impuesto fijo €100.000/año sobre renta extranjera', duration: '15 años', who: 'Inversión ≥ €500.000' },
      { name: 'Art. 5D (pensionados)', benefit: '7% plano sobre renta extranjera', duration: '15 años', who: 'Jubilados que trasladan su residencia' },
    ],
    path: { permanent: '5 años', citizenship: '7 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 25000, inflation: 2.8, unemployment: 8.5, minWageMonthlyUSD: 1180, avgGrossAnnualLocal: 18000, col: 50, hdi: 0.908 },
    authorityUrl: 'https://www.aade.gr/',
  }),
  P({
    country: 'Hungría', iso2: 'HU', region: 'Europa', currency: 'HUF', fx: 340,
    tax: { brackets: [[null, 0.15]], social: 0.185, socialDeductible: false, note: 'Impuesto plano 15%.' },
    vat: 27, corpTax: 9, capitalGains: '15% + 13% social (con topes)',
    residency: { days: 183, rule: '183 días o domicilio permanente', basis: 'mundial' },
    regimes: [
      { name: 'Menores de 25', benefit: 'Exención de impuesto hasta el salario promedio', duration: 'Hasta los 25 años', who: 'Trabajadores jóvenes' },
      { name: 'Madres con 2+ hijos', benefit: 'Exención progresiva de impuesto sobre la renta', duration: 'Permanente (3 hijos) / desde 2026 (2 hijos, <40 años)', who: 'Madres residentes' },
      { name: 'White Card', benefit: 'Permiso de residencia para nómadas digitales', duration: '1 año + 1', who: 'Ingresos ≥ €3.000/mes de empleador extranjero' },
    ],
    path: { permanent: '3–5 años', citizenship: '8 años (3 con ascendencia húngara)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 24000, inflation: 4.5, unemployment: 4.4, minWageMonthlyUSD: 950, avgGrossAnnualLocal: 8000000, col: 42, hdi: 0.87 },
    authorityUrl: 'https://nav.gov.hu/',
  }),
  P({
    country: 'Irlanda', iso2: 'IE', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[20000, 0], [44000, 0.2], [null, 0.4]],
      social: 0.042, socialDeductible: false,
      levies: [[12012, 0.005], [27382, 0.02], [70044, 0.03], [null, 0.08]],
      note: 'Créditos personales (€4.000) como mínimo exento. USC incluido como carga adicional; PRSI 4,2%.',
    },
    vat: 23, corpTax: 12.5, capitalGains: '33%',
    residency: { days: 183, rule: '183 días en el año o 280 días en dos años', basis: 'remesa' },
    regimes: [
      { name: 'SARP', benefit: '30% del salario por encima de €100.000 exento del impuesto sobre la renta', duration: '5 años (vigente hasta 2030)', who: 'Asignados por empleador del grupo con salario ≥ €100.000', model: { type: 'exempt', pct: 0.3, minGross: 100000 } },
      { name: 'Base de remesa (non-domiciled)', benefit: 'Rentas extranjeras tributan solo si se remiten a Irlanda', duration: 'Mientras no esté domiciliado', who: 'Residentes no domiciliados' },
      { name: 'Critical Skills Employment Permit', benefit: 'Vía rápida a Stamp 4 (residencia sin permiso de trabajo)', duration: '2 años', who: 'Ocupaciones críticas con salario ≥ €38.000' },
    ],
    path: { permanent: '5 años (Stamp 4 tras 2 años con CSEP)', citizenship: '5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 108000, inflation: 2.0, unemployment: 4.8, minWageMonthlyUSD: 2750, avgGrossAnnualLocal: 55000, col: 70, hdi: 0.949 },
    authorityUrl: 'https://www.revenue.ie/',
  }),
  P({
    country: 'Italia', iso2: 'IT', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[8500, 0], [28000, 0.255], [50000, 0.355], [null, 0.455]],
      social: 0.0919, socialDeductible: true,
      note: 'IRPEF 2026 + adicionales regional y municipal (~2,5%).',
    },
    vat: 22, corpTax: 24, capitalGains: '26% (12,5% bonos del Estado)',
    residency: { days: 183, rule: 'Registro, domicilio o residencia habitual > 183 días (presencia física desde 2024)', basis: 'mundial' },
    regimes: [
      { name: 'Impatriados (D.Lgs. 209/2023)', benefit: '50% de las rentas del trabajo exentas (60% con hijo menor), hasta €600.000', duration: '5 años (+3 con hijo/vivienda)', who: 'Alta cualificación; no residente en Italia en 3 años previos', model: { type: 'exempt', pct: 0.5 } },
      { name: 'Flat tax HNWI', benefit: 'Impuesto fijo €300.000/año sobre toda la renta extranjera', duration: '15 años', who: 'No residente en 9 de los 10 años previos' },
      { name: 'Pensionados en el sur', benefit: '7% plano sobre renta extranjera', duration: '10 años', who: 'Jubilados en municipios < 20.000 hab. del sur' },
    ],
    path: { permanent: '5 años', citizenship: '10 años (4 UE, 2025: ius sanguinis limitado)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 40000, inflation: 1.7, unemployment: 6.1, minWageMonthlyUSD: null, avgGrossAnnualLocal: 32000, col: 57, hdi: 0.915 },
    authorityUrl: 'https://www.agenziaentrate.gov.it/',
  }),
  P({
    country: 'Luxemburgo', iso2: 'LU', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[12438, 0], [20000, 0.128], [30000, 0.214], [45000, 0.321], [60000, 0.385], [150000, 0.417], [220000, 0.428], [null, 0.458]],
      social: 0.1245, socialCap: 150000, socialDeductible: true,
      note: 'Clase fiscal 1, incluye contribución de solidaridad.',
    },
    vat: 17, corpTax: 23.9, capitalGains: 'Exentas tras 6 meses (participaciones < 10%)',
    residency: { days: 183, rule: 'Domicilio o estancia habitual > 6 meses', basis: 'mundial' },
    regimes: [
      { name: 'Impatriados (reforma 2025)', benefit: '50% de la remuneración anual exenta (hasta €400.000)', duration: '8 años', who: 'Salario ≥ €75.000; sin residencia en 5 años previos', model: { type: 'exempt', pct: 0.5, minGross: 75000 } },
    ],
    path: { permanent: '5 años', citizenship: '5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 135000, inflation: 2.2, unemployment: 6.5, minWageMonthlyUSD: 3110, avgGrossAnnualLocal: 78000, col: 73, hdi: 0.922 },
    authorityUrl: 'https://impotsdirects.public.lu/',
  }),
  P({
    country: 'Malta', iso2: 'MT', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[12000, 0], [16000, 0.15], [60000, 0.25], [null, 0.35]],
      social: 0.1, socialCap: 29000, socialDeductible: false,
    },
    vat: 18, corpTax: 35, capitalGains: 'No domiciliados: ganancias extranjeras exentas',
    residency: { days: 183, rule: '183 días o intención de residir', basis: 'remesa' },
    regimes: [
      { name: 'Highly Qualified Persons', benefit: '15% plano sobre salario', duration: '5 años renovable (hasta 10)', who: 'Puestos cualificados con salario ≥ ~€100.000', model: { type: 'flat', rate: 0.15, minGross: 100000 } },
      { name: 'Global Residence Programme', benefit: '15% sobre renta extranjera remitida (mínimo €15.000/año)', duration: 'Indefinido', who: 'No UE con vivienda qualificada' },
      { name: 'Nomad Residence Permit', benefit: 'Exento 12 meses, luego 10% plano', duration: '1 año renovable', who: 'Ingresos ≥ €42.000/año de fuente extranjera' },
    ],
    path: { permanent: '5 años', citizenship: '6–7 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 42000, inflation: 2.4, unemployment: 3.0, minWageMonthlyUSD: 1105, avgGrossAnnualLocal: 25000, col: 58, hdi: 0.924 },
    authorityUrl: 'https://cfr.gov.mt/',
  }),
  P({
    country: 'Noruega', iso2: 'NO', region: 'Europa', currency: 'NOK', fx: 10.1,
    tax: {
      brackets: [[200550, 0], [null, 0.22]],
      social: 0.077, socialDeductible: false,
      levies: [[226100, 0], [318300, 0.017], [725050, 0.04], [980100, 0.137], [1467200, 0.167], [null, 0.177]],
      note: '22% sobre renta ordinaria + impuesto por tramos (trinnskatt) sobre el bruto.',
    },
    vat: 25, corpTax: 22, capitalGains: '37,84% (factor 1,72 × 22%)',
    residency: { days: 183, rule: '183 días en 12 meses o 270 días en 36 meses', basis: 'mundial' },
    regimes: [
      { name: 'PAYE-ordningen', benefit: '25% plano (incluye seguridad social), sin declaración', duration: '5 años', who: 'Trabajadores extranjeros con salario ≤ ~NOK 700.000', model: { type: 'flat', rate: 0.25, includesSocial: true } },
    ],
    path: { permanent: '3 años (5 para algunos)', citizenship: '8 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 90000, inflation: 3.0, unemployment: 4.5, minWageMonthlyUSD: null, avgGrossAnnualLocal: 700000, col: 80, hdi: 0.97 },
    authorityUrl: 'https://www.skatteetaten.no/',
  }),
  P({
    country: 'Países Bajos', iso2: 'NL', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[13000, 0], [38883, 0.3575], [78426, 0.3756], [null, 0.495]],
      social: 0, socialDeductible: false,
      note: 'Box 1 incluye seguridad social nacional. Créditos fiscales aproximados como mínimo exento.',
    },
    vat: 21, corpTax: 25.8, capitalGains: 'Box 3: rendimiento ficticio ~6% gravado al 36%',
    residency: { days: null, rule: 'Circunstancias: vivienda, familia, centro de vida', basis: 'mundial' },
    regimes: [
      { name: '30% ruling', benefit: '30% del salario bruto libre de impuestos (27% desde 2027)', duration: '5 años', who: 'Reclutados del exterior con salario ≥ €46.660 (≥ €35.468 si < 30 años con máster)', model: { type: 'exempt', pct: 0.3, minGross: 46660 } },
      { name: 'Highly Skilled Migrant', benefit: 'Permiso de residencia rápido vía empleador reconocido', duration: 'Duración del contrato (máx. 5 años)', who: 'Salario ≥ ~€5.700/mes (≥ €4.200 si < 30 años)' },
      { name: 'DAFT', benefit: 'Residencia para emprendedores con inversión €4.500', duration: '2 años', who: 'Ciudadanos de EE. UU. y Japón' },
    ],
    path: { permanent: '5 años', citizenship: '5 años', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 67000, inflation: 3.2, unemployment: 3.9, minWageMonthlyUSD: 2860, avgGrossAnnualLocal: 50000, col: 67, hdi: 0.955 },
    authorityUrl: 'https://www.belastingdienst.nl/',
  }),
  P({
    country: 'Polonia', iso2: 'PL', region: 'Europa', currency: 'PLN', fx: 3.7,
    tax: {
      brackets: [[30000, 0], [120000, 0.12], [null, 0.32]],
      std: 3000, social: 0.1371, socialCap: 260190, socialDeductible: true,
      levies: [[null, 0.09]],
      note: 'Seguro de salud 9% no deducible (carga adicional).',
    },
    vat: 23, corpTax: 19, capitalGains: '19%',
    residency: { days: 183, rule: '183 días o centro de intereses vitales', basis: 'mundial' },
    regimes: [
      { name: 'Ulga na powrót', benefit: 'Exención de hasta ~PLN 85.528/año', duration: '4 años', who: 'Ciudadanos polacos o con Karta Polaka / ascendencia polaca que se trasladan' },
      { name: 'Ulga dla młodych', benefit: 'Exención hasta PLN 85.528 para menores de 26', duration: 'Hasta los 26 años', who: 'Trabajadores jóvenes' },
      { name: 'Ryczałt / IP Box', benefit: 'Tarifas planas 8,5–15% para IT o 5% sobre renta de IP', duration: 'Anual', who: 'Autónomos (B2B) en IT y creativos' },
    ],
    path: { permanent: '5 años', citizenship: '8 años (propuesta 2025)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 26000, inflation: 3.0, unemployment: 3.2, minWageMonthlyUSD: 1300, avgGrossAnnualLocal: 105000, col: 43, hdi: 0.906 },
    authorityUrl: 'https://www.podatki.gov.pl/',
  }),
  P({
    country: 'Portugal', iso2: 'PT', region: 'Europa', currency: 'EUR', fx: 0.87,
    tax: {
      brackets: [[4462, 0], [12521, 0.125], [16638, 0.16], [21687, 0.215], [26745, 0.244], [32805, 0.314], [46113, 0.349], [49455, 0.431], [87758, 0.446], [null, 0.48]],
      social: 0.11, socialDeductible: false,
      note: 'La deducción específica (€4.462) se modela como mínimo exento. Recargo de solidaridad no incluido.',
    },
    vat: 23, corpTax: 19, capitalGains: '28% (o escala si se opta)',
    residency: { days: 183, rule: '183 días o vivienda que indique intención de residencia habitual', basis: 'mundial' },
    regimes: [
      { name: 'IFICI (NHR 2.0)', benefit: '20% plano sobre rentas del trabajo cualificado + mayor parte de renta extranjera exenta', duration: '10 años', who: 'Profesiones de innovación, investigación, startups; sin residencia en 5 años previos', model: { type: 'flat', rate: 0.2 } },
      { name: 'IRS Jovem', benefit: 'Exención parcial (100% el 1er año, decreciente) hasta ~€29.000/año', duration: '10 años', who: 'Menores de 35 años' },
      { name: 'Visa D8 nómada digital', benefit: 'Residencia para trabajo remoto', duration: '1–2 años renovable', who: 'Ingresos ≥ 4× salario mínimo (~€3.680/mes)' },
    ],
    path: { permanent: '5 años', citizenship: '5 años (reforma en curso para ampliar a 7–10)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 30000, inflation: 2.3, unemployment: 6.4, minWageMonthlyUSD: 1234, avgGrossAnnualLocal: 22000, col: 46, hdi: 0.89 },
    authorityUrl: 'https://www.portaldasfinancas.gov.pt/',
  }),
  P({
    country: 'Reino Unido', iso2: 'GB', region: 'Europa', currency: 'GBP', fx: 0.75,
    tax: {
      brackets: [[12570, 0], [50270, 0.2], [125140, 0.4], [null, 0.45]],
      social: 0, socialDeductible: false,
      levies: [[12570, 0], [50270, 0.08], [null, 0.02]],
      note: 'Inglaterra. National Insurance como carga adicional. El mínimo personal se reduce por encima de £100.000 (no modelado).',
    },
    vat: 20, corpTax: 25, capitalGains: '18% / 24%',
    residency: { days: 183, rule: 'Statutory Residence Test (183 días o vínculos + días)', basis: 'mundial' },
    regimes: [
      { name: 'FIG regime (desde abril 2025)', benefit: 'Renta y ganancias extranjeras exentas', duration: '4 años', who: 'Sin residencia fiscal británica en los 10 años previos' },
      { name: 'Overseas Workday Relief', benefit: 'Salario por días trabajados fuera del RU exento (tope 30% o £300.000)', duration: '4 años', who: 'Beneficiarios del régimen FIG' },
      { name: 'Global Talent / Skilled Worker', benefit: 'Visas de trabajo con vía a residencia', duration: '5 años', who: 'Talentos avalados o con oferta de sponsor' },
    ],
    path: { permanent: 'ILR 5 años (propuesta de 10)', citizenship: '1 año tras ILR', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 54000, inflation: 3.5, unemployment: 4.8, minWageMonthlyUSD: 2760, avgGrossAnnualLocal: 37500, col: 62, hdi: 0.946 },
    authorityUrl: 'https://www.gov.uk/government/organisations/hm-revenue-customs',
  }),
  P({
    country: 'Rumanía', iso2: 'RO', region: 'Europa', currency: 'RON', fx: 4.4,
    tax: { brackets: [[null, 0.1]], social: 0.35, socialDeductible: true, note: 'Impuesto plano 10%; CAS 25% + CASS 10%.' },
    vat: 21, corpTax: 16, capitalGains: '3–6% (valores, según tenencia)',
    residency: { days: 183, rule: '183 días en 12 meses o centro de intereses vitales', basis: 'mundial' },
    regimes: [
      { name: 'Microempresa', benefit: 'Impuesto de 1–3% sobre facturación', duration: 'Anual', who: 'Empresas con facturación ≤ €100.000' },
      { name: 'Visa nómada digital', benefit: 'Residencia para trabajo remoto sin impuesto local en los primeros 183 días', duration: '1 año + 1', who: 'Ingresos ≥ 3× salario bruto medio' },
    ],
    path: { permanent: '5 años', citizenship: '8 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 20000, inflation: 7.0, unemployment: 6.0, minWageMonthlyUSD: 920, avgGrossAnnualLocal: 60000, col: 38, hdi: 0.845 },
    authorityUrl: 'https://www.anaf.ro/',
  }),
  P({
    country: 'Suecia', iso2: 'SE', region: 'Europa', currency: 'SEK', fx: 9.5,
    tax: {
      brackets: [[60000, 0], [643100, 0.28], [null, 0.48]],
      social: 0, socialDeductible: false,
      note: 'Impuesto municipal (~32%) neto del crédito por trabajo; cuota de pensión 7% compensada con crédito.',
    },
    vat: 25, corpTax: 20.6, capitalGains: '30% (ISK: impuesto sobre valor de cartera)',
    residency: { days: 183, rule: 'Estancia habitual > 6 meses o vínculos esenciales', basis: 'mundial' },
    regimes: [
      { name: 'Expertskatt', benefit: '25% del salario exento de impuestos y cotizaciones', duration: '7 años', who: 'Salario ≥ ~SEK 118.600/mes o experto aprobado', model: { type: 'exempt', pct: 0.25, minGross: 1423200 } },
    ],
    path: { permanent: '4–5 años', citizenship: '5 años (propuesta de 8 desde 2026)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 58000, inflation: 1.0, unemployment: 8.7, minWageMonthlyUSD: null, avgGrossAnnualLocal: 450000, col: 60, hdi: 0.959 },
    authorityUrl: 'https://www.skatteverket.se/',
  }),
  P({
    country: 'Suiza', iso2: 'CH', region: 'Europa', currency: 'CHF', fx: 0.8,
    tax: {
      brackets: [[15000, 0], [40000, 0.08], [80000, 0.16], [150000, 0.24], [250000, 0.3], [null, 0.34]],
      std: 5000, social: 0.13, socialDeductible: true,
      note: 'Aproximación Zúrich (federal + cantonal + comunal). Varía mucho por cantón (Zug ≈ −40%).',
    },
    vat: 8.1, corpTax: 19.6, capitalGains: 'Exentas para inversores privados (valores)',
    residency: { days: 90, rule: '30 días con actividad lucrativa o 90 días sin ella, o domicilio', basis: 'mundial' },
    regimes: [
      { name: 'Tributación a tanto alzado (forfait)', benefit: 'Impuesto sobre gasto de vida en lugar de renta mundial (base federal mínima ~CHF 434.700)', duration: 'Indefinido', who: 'Extranjeros sin actividad lucrativa en Suiza' },
      { name: 'Expat Ordinance', benefit: 'Deducción de mudanza, doble vivienda y colegio', duration: 'Asignaciones ≤ 5 años', who: 'Ejecutivos y especialistas asignados temporalmente' },
    ],
    path: { permanent: 'Permiso C: 10 años (5 UE/AELC)', citizenship: '10 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 105000, inflation: 0.2, unemployment: 2.9, minWageMonthlyUSD: null, avgGrossAnnualLocal: 105000, col: 110, hdi: 0.97 },
    authorityUrl: 'https://www.estv.admin.ch/',
  }),

  // ── Américas ───────────────────────────────────────────────────────────────
  P({
    country: 'Argentina', iso2: 'AR', region: 'Américas', currency: 'ARS', fx: 1450,
    tax: {
      brackets: [[28000000, 0], [30000000, 0.05], [32100000, 0.09], [34100000, 0.12], [37200000, 0.15], [46400000, 0.19], [55500000, 0.23], [69300000, 0.27], [90000000, 0.31], [null, 0.35]],
      social: 0.17, socialCap: 45000000, socialDeductible: true,
      note: 'Ganancias 4ta categoría: MNI + deducción especial ≈ ARS 28 M/año (se actualiza por inflación semestralmente). Montos muy volátiles.',
    },
    vat: 21, corpTax: 30, capitalGains: '15% (acciones argentinas cotizadas exentas)',
    residency: { days: 365, rule: 'Residencia permanente o 12 meses de permanencia', basis: 'mundial' },
    regimes: [
      { name: 'Residencia MERCOSUR', benefit: 'Residencia temporaria 2 años → permanente sin requisito laboral', duration: '2 años', who: 'Nacionales de países MERCOSUR y asociados' },
      { name: 'Visa nómada digital', benefit: 'Residencia transitoria para trabajo remoto', duration: '180 días + 180', who: 'Trabajadores remotos para empleadores extranjeros' },
    ],
    path: { permanent: '2–3 años', citizenship: '2 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 14000, inflation: 25, unemployment: 7.0, minWageMonthlyUSD: 230, avgGrossAnnualLocal: 18000000, col: 35, hdi: 0.865 },
    authorityUrl: 'https://www.arca.gob.ar/',
  }),
  P({
    country: 'Brasil', iso2: 'BR', region: 'Américas', currency: 'BRL', fx: 5.4,
    tax: {
      brackets: [[60000, 0], [88200, 0.2], [null, 0.275]],
      social: 0.11, socialCap: 106000, socialDeductible: true,
      note: 'Reforma 2026: exención hasta R$5.000/mes con reducción hasta R$7.350. INSS progresivo 7,5–14% (promedio).',
    },
    vat: 17, corpTax: 34, capitalGains: '15–22,5%',
    residency: { days: 183, rule: '183 días en 12 meses o visa permanente (residente desde la llegada)', basis: 'mundial' },
    regimes: [
      { name: 'Visa nómada digital', benefit: 'Residencia para trabajo remoto', duration: '1 año + 1', who: 'Ingresos ≥ US$1.500/mes o ahorros US$18.000' },
      { name: 'Residencia MERCOSUR', benefit: 'Residencia 2 años → indefinida', duration: '2 años', who: 'Nacionales MERCOSUR y asociados' },
    ],
    path: { permanent: '2 años (MERCOSUR) / indefinida por inversión', citizenship: '4 años (1 para lusófonos)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 10500, inflation: 5.0, unemployment: 5.8, minWageMonthlyUSD: 300, avgGrossAnnualLocal: 42000, col: 30, hdi: 0.786 },
    authorityUrl: 'https://www.gov.br/receitafederal/',
  }),
  P({
    country: 'Canadá', iso2: 'CA', region: 'Américas', currency: 'CAD', fx: 1.38,
    tax: {
      brackets: [[16129, 0], [57375, 0.2], [114750, 0.3], [177882, 0.43], [253414, 0.46], [null, 0.5353]],
      social: 0.075, socialCap: 71300, socialDeductible: false,
      note: 'Federal + Ontario. CPP/CPP2 + EI aproximados.',
    },
    vat: 13, corpTax: 26.5, capitalGains: '50% de la ganancia se suma a la renta',
    residency: { days: 183, rule: 'Vínculos residenciales significativos o regla de 183 días', basis: 'mundial' },
    regimes: [
      { name: 'Step-up al inmigrar', benefit: 'Los activos se valúan a mercado al llegar: solo tributa la ganancia posterior', duration: 'Al inmigrar', who: 'Nuevos residentes fiscales' },
      { name: 'Express Entry', benefit: 'Residencia permanente directa por puntos (CRS)', duration: '—', who: 'Trabajadores cualificados, experiencia canadiense, francófonos' },
    ],
    path: { permanent: 'Directa (Express Entry)', citizenship: '3 de 5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 54000, inflation: 2.0, unemployment: 6.9, minWageMonthlyUSD: 2080, avgGrossAnnualLocal: 70000, col: 64, hdi: 0.939 },
    authorityUrl: 'https://www.canada.ca/en/revenue-agency.html',
  }),
  P({
    country: 'Chile', iso2: 'CL', region: 'Américas', currency: 'CLP', fx: 940,
    tax: {
      brackets: [[11270000, 0], [25050000, 0.04], [41750000, 0.08], [58450000, 0.135], [75150000, 0.23], [100200000, 0.304], [258850000, 0.35], [null, 0.4]],
      social: 0.187, socialCap: 41000000, socialDeductible: true,
      note: 'Impuesto único de segunda categoría (UTA ≈ CLP 835.000). AFP + salud + cesantía.',
    },
    vat: 19, corpTax: 27, capitalGains: 'Renta general; acciones con presencia bursátil 10%',
    residency: { days: 183, rule: '183 días en 12 meses', basis: 'mundial' },
    regimes: [
      { name: 'Art. 3 LIR (extranjeros)', benefit: 'Rentas de fuente extranjera exentas', duration: '3 años (prorrogable 3)', who: 'Extranjeros que se domicilian en Chile' },
    ],
    path: { permanent: '2 años de residencia temporal', citizenship: '5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 17000, inflation: 4.0, unemployment: 8.7, minWageMonthlyUSD: 563, avgGrossAnnualLocal: 12000000, col: 42, hdi: 0.878 },
    authorityUrl: 'https://www.sii.cl/',
  }),
  P({
    country: 'Colombia', iso2: 'CO', region: 'Américas', currency: 'COP', fx: 3950,
    tax: {
      brackets: [[57090000, 0], [89040000, 0.19], [214730000, 0.28], [454080000, 0.33], [993540000, 0.35], [1623590000, 0.37], [null, 0.39]],
      stdPct: 0.25, stdPctCap: 41375000, social: 0.08, socialDeductible: true,
      note: 'Tabla en UVT (2026 ≈ COP 52.374). Renta exenta 25% (tope 790 UVT).',
    },
    vat: 19, corpTax: 35, capitalGains: '15% (ganancias ocasionales)',
    residency: { days: 183, rule: '183 días en 365 continuos', basis: 'mundial' },
    regimes: [
      { name: 'Visa V nómada digital', benefit: 'Estancia para trabajo remoto', duration: '2 años', who: 'Ingresos ≥ 3 SMMLV de fuente extranjera' },
      { name: 'Visa R', benefit: 'Residencia indefinida', duration: 'Indefinida', who: '5 años con visa M, o 2 años casado con colombiano' },
    ],
    path: { permanent: '5 años (visa M)', citizenship: '5 años (1 año para latinoamericanos con visa R)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 7500, inflation: 5.0, unemployment: 9.0, minWageMonthlyUSD: 443, avgGrossAnnualLocal: 30000000, col: 28, hdi: 0.788 },
    authorityUrl: 'https://www.dian.gov.co/',
  }),
  P({
    country: 'Costa Rica', iso2: 'CR', region: 'Américas', currency: 'CRC', fx: 505,
    tax: {
      brackets: [[11016000, 0], [16164000, 0.1], [28368000, 0.15], [56724000, 0.2], [null, 0.25]],
      social: 0.1083, socialDeductible: false,
      note: 'Tabla de impuesto al salario (mensual × 12).',
    },
    vat: 13, corpTax: 30, capitalGains: '15%',
    residency: { days: 183, rule: '183 días en el período fiscal', basis: 'territorial' },
    regimes: [
      { name: 'Nómadas digitales (Ley 10008)', benefit: 'Exención de impuesto sobre la renta', duration: '1 año + 1', who: 'Ingresos del exterior ≥ US$3.000/mes' },
      { name: 'Pensionado / Rentista', benefit: 'Residencia temporal con ingresos pasivos', duration: '2 años renovable', who: 'Pensión ≥ US$1.000/mes o renta ≥ US$2.500/mes' },
    ],
    path: { permanent: '3 años', citizenship: '7 años (5 para latinoamericanos y españoles)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 17000, inflation: 0.5, unemployment: 7.2, minWageMonthlyUSD: 723, avgGrossAnnualLocal: 7500000, col: 45, hdi: 0.833 },
    authorityUrl: 'https://www.hacienda.go.cr/',
  }),
  P({
    country: 'Estados Unidos', iso2: 'US', region: 'Américas', currency: 'USD', fx: 1,
    tax: {
      brackets: [[16100, 0], [28500, 0.1], [66500, 0.12], [121800, 0.22], [217875, 0.24], [272325, 0.32], [656700, 0.35], [null, 0.37]],
      social: 0.0765, socialCap: 184500, socialDeductible: false,
      note: 'Solo federal (2026, deducción estándar $16.100). Estados: 0% (TX, FL, WA, NV) a 13,3% (CA).',
    },
    vat: 7, corpTax: 21, capitalGains: '0/15/20% largo plazo',
    residency: { days: 183, rule: 'Green card o Substantial Presence Test (183 días ponderados en 3 años)', basis: 'mundial' },
    regimes: [
      { name: 'Sin régimen de impatriados', benefit: 'EE. UU. grava por ciudadanía y renta mundial; tratados pueden eximir a estudiantes/investigadores', duration: '—', who: '—' },
      { name: 'Visas O-1 / EB-2 NIW', benefit: 'Vía a green card sin sponsor (NIW) para perfiles destacados', duration: '—', who: 'Habilidad extraordinaria o interés nacional' },
    ],
    path: { permanent: 'Green card (variable, años de espera)', citizenship: '5 años (3 casado)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 89000, inflation: 2.8, unemployment: 4.3, minWageMonthlyUSD: 1257, avgGrossAnnualLocal: 66000, col: 70, hdi: 0.938 },
    authorityUrl: 'https://www.irs.gov/',
  }),
  P({
    country: 'México', iso2: 'MX', region: 'Américas', currency: 'MXN', fx: 18.5,
    tax: {
      brackets: [[8952, 0.0192], [75984, 0.064], [133536, 0.1088], [155230, 0.16], [185853, 0.1792], [374838, 0.2136], [590796, 0.2352], [1127927, 0.3], [1503902, 0.32], [4511707, 0.34], [null, 0.35]],
      social: 0.028, socialDeductible: false,
      note: 'Tarifa anual ISR. Subsidio al empleo para salarios bajos no modelado.',
    },
    vat: 16, corpTax: 30, capitalGains: '10% (bolsa) / tarifa general',
    residency: { days: null, rule: 'Casa habitación en México o centro de intereses vitales', basis: 'mundial' },
    regimes: [
      { name: 'Residente temporal por solvencia', benefit: 'Residencia para rentistas y nómadas digitales', duration: '1–4 años', who: 'Ingresos ≥ ~US$4.400/mes o ahorros ≥ ~US$73.000' },
      { name: 'RESICO', benefit: 'ISR de 1–2,5% sobre ingresos cobrados', duration: 'Anual', who: 'Personas físicas con ingresos ≤ MXN 3,5 M' },
    ],
    path: { permanent: '4 años de residencia temporal', citizenship: '5 años (2 para latinoamericanos e ibéricos)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 14000, inflation: 3.8, unemployment: 2.7, minWageMonthlyUSD: 518, avgGrossAnnualLocal: 190000, col: 38, hdi: 0.789 },
    authorityUrl: 'https://www.sat.gob.mx/',
  }),
  P({
    country: 'Panamá', iso2: 'PA', region: 'Américas', currency: 'USD', fx: 1,
    tax: {
      brackets: [[11000, 0], [50000, 0.15], [null, 0.25]],
      social: 0.11, socialDeductible: false,
    },
    vat: 7, corpTax: 25, capitalGains: '10% (inmuebles / valores locales)',
    residency: { days: 183, rule: '183 días en el año fiscal', basis: 'territorial' },
    regimes: [
      { name: 'Territorialidad', benefit: 'Rentas de fuente extranjera no gravadas', duration: 'Permanente', who: 'Todos los residentes' },
      { name: 'Visa Países Amigos', benefit: 'Residencia permanente por empleo o inversión (~US$200.000)', duration: 'Permanente', who: 'Nacionales de ~50 países (incluye la mayoría de Latinoamérica)' },
      { name: 'EMMA / SEM', benefit: 'ISR preferente 5% para personal de sedes multinacionales', duration: 'Mientras dure el empleo', who: 'Empleados de sedes de multinacionales', model: { type: 'flat', rate: 0.05 }, niche: true },
      { name: 'Pensionado', benefit: 'Residencia + descuentos en servicios', duration: 'Permanente', who: 'Pensión ≥ US$1.000/mes' },
    ],
    path: { permanent: 'Directa (Países Amigos)', citizenship: '5 años', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 19500, inflation: 0.0, unemployment: 9.5, minWageMonthlyUSD: 650, avgGrossAnnualLocal: 12000, col: 47, hdi: 0.839 },
    authorityUrl: 'https://dgi.mef.gob.pa/',
  }),
  P({
    country: 'Paraguay', iso2: 'PY', region: 'Américas', currency: 'PYG', fx: 7300,
    tax: {
      brackets: [[50000000, 0.08], [150000000, 0.09], [null, 0.1]],
      social: 0.09, socialDeductible: true, exemptBelow: 80000000,
      note: 'IRP: solo tributa si ingresos > PYG 80 M/año; muchos gastos personales son deducibles.',
    },
    vat: 10, corpTax: 10, capitalGains: '8–10%',
    residency: { days: 120, rule: '120 días en el año o residencia permanente', basis: 'territorial' },
    regimes: [
      { name: 'Territorialidad', benefit: 'Rentas de fuente extranjera no gravadas', duration: 'Permanente', who: 'Todos los residentes' },
      { name: 'Residencia temporal → permanente', benefit: 'Trámite simple, sin requisito de inversión alto', duration: '2 años', who: 'Extranjeros con medios de vida' },
    ],
    path: { permanent: '2 años', citizenship: '3 años', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 7000, inflation: 3.8, unemployment: 5.9, minWageMonthlyUSD: 397, avgGrossAnnualLocal: 45000000, col: 30, hdi: 0.756 },
    authorityUrl: 'https://www.dnit.gov.py/',
  }),
  P({
    country: 'Perú', iso2: 'PE', region: 'Américas', currency: 'PEN', fx: 3.5,
    tax: {
      brackets: [[55000, 0], [82500, 0.08], [165000, 0.14], [247500, 0.17], [302500, 0.2], [null, 0.3]],
      social: 0.13, socialDeductible: false,
      note: '7 UIT + 3 UIT de gastos deducibles (UIT 2026 ≈ S/5.500).',
    },
    vat: 18, corpTax: 29.5, capitalGains: '5% (valores locales)',
    residency: { days: 183, rule: '183 días en 12 meses', basis: 'mundial' },
    regimes: [
      { name: 'Visa rentista / trabajador', benefit: 'Residencia con vía a permanente', duration: '1 año renovable', who: 'Trabajadores con contrato o rentistas' },
    ],
    path: { permanent: '3 años', citizenship: '2 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 8500, inflation: 1.9, unemployment: 6.3, minWageMonthlyUSD: 323, avgGrossAnnualLocal: 24000, col: 32, hdi: 0.794 },
    authorityUrl: 'https://www.sunat.gob.pe/',
  }),
  P({
    country: 'Uruguay', iso2: 'UY', region: 'Américas', currency: 'UYU', fx: 40,
    tax: {
      brackets: [[576576, 0], [823680, 0.1], [1235520, 0.15], [2471040, 0.24], [4118400, 0.25], [6177600, 0.27], [9472320, 0.31], [null, 0.36]],
      social: 0.196, socialDeductible: true,
      note: 'IRPF en BPC (2026 ≈ UYU 6.864). BPS + FONASA + FRL.',
    },
    vat: 22, corpTax: 25, capitalGains: '12% (7% dividendos)',
    residency: { days: 183, rule: '183 días, centro de intereses o inversión inmobiliaria calificada', basis: 'territorial' },
    regimes: [
      { name: 'Tax holiday nuevos residentes', benefit: 'Rentas de capital del exterior exentas (o 7% permanente sobre dividendos/intereses extranjeros)', duration: '11 años', who: 'Nuevos residentes fiscales' },
      { name: 'Residencia MERCOSUR', benefit: 'Residencia permanente directa', duration: 'Permanente', who: 'Nacionales MERCOSUR y asociados' },
    ],
    path: { permanent: 'Directa (MERCOSUR) / 1–2 años', citizenship: '3 años (con familia) / 5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 24000, inflation: 4.5, unemployment: 7.0, minWageMonthlyUSD: 590, avgGrossAnnualLocal: 700000, col: 55, hdi: 0.862 },
    authorityUrl: 'https://www.gub.uy/direccion-general-impositiva/',
  }),

  // ── Asia-Pacífico ──────────────────────────────────────────────────────────
  P({
    country: 'Australia', iso2: 'AU', region: 'Asia-Pacífico', currency: 'AUD', fx: 1.52,
    tax: {
      brackets: [[18200, 0], [45000, 0.16], [135000, 0.3], [190000, 0.37], [null, 0.45]],
      social: 0, socialDeductible: false, levies: [[27222, 0], [null, 0.02]],
      note: 'Residentes 2025-26 + Medicare 2%. Superannuation (12%) la paga el empleador.',
    },
    vat: 10, corpTax: 30, capitalGains: 'Renta general (50% descuento si tenencia > 12 meses)',
    residency: { days: 183, rule: 'Test de residencia (domicilio, 183 días, intención)', basis: 'mundial' },
    regimes: [
      { name: 'Temporary resident', benefit: 'Rentas extranjeras y mayoría de ganancias de capital extranjeras exentas', duration: 'Mientras tenga visa temporal', who: 'Titulares de visas temporales (482, 500, 485…)' },
      { name: 'Working Holiday', benefit: 'Tasa 15% hasta A$45.000 (backpacker tax)', duration: '1–3 años', who: 'WHV 417/462', model: { type: 'flat', rate: 0.15 }, niche: true },
    ],
    path: { permanent: 'Visas 189/190/186', citizenship: '4 años (1 como PR)', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 65000, inflation: 2.7, unemployment: 4.3, minWageMonthlyUSD: 2680, avgGrossAnnualLocal: 100000, col: 67, hdi: 0.958 },
    authorityUrl: 'https://www.ato.gov.au/',
  }),
  P({
    country: 'China', iso2: 'CN', region: 'Asia-Pacífico', currency: 'CNY', fx: 7.15,
    tax: {
      brackets: [[60000, 0], [96000, 0.03], [204000, 0.1], [360000, 0.2], [480000, 0.25], [720000, 0.3], [1020000, 0.35], [null, 0.45]],
      social: 0.105, socialCap: 420000, socialDeductible: true,
    },
    vat: 13, corpTax: 25, capitalGains: '20% (acciones cotizadas en China exentas)',
    residency: { days: 183, rule: '183 días en el año o domicilio', basis: 'remesa' },
    regimes: [
      { name: 'Regla de 6 años', benefit: 'Renta de fuente extranjera exenta hasta 6 años consecutivos de residencia', duration: '6 años', who: 'Extranjeros residentes' },
      { name: 'Beneficios no gravados', benefit: 'Vivienda, educación de hijos e idioma exentos', duration: 'Hasta fin de 2027', who: 'Expatriados' },
    ],
    path: { permanent: 'Muy restringida', citizenship: 'Excepcional', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 13500, inflation: 0.0, unemployment: 5.2, minWageMonthlyUSD: 376, avgGrossAnnualLocal: 120000, col: 38, hdi: 0.797 },
    authorityUrl: 'https://www.chinatax.gov.cn/',
  }),
  P({
    country: 'Corea del Sur', iso2: 'KR', region: 'Asia-Pacífico', currency: 'KRW', fx: 1400,
    tax: {
      brackets: [[1500000, 0], [15500000, 0.066], [51500000, 0.165], [89500000, 0.264], [151500000, 0.385], [301500000, 0.418], [501500000, 0.44], [1001500000, 0.462], [null, 0.495]],
      stdPct: 0.25, stdPctCap: 20000000, social: 0.094, socialDeductible: true,
      note: 'Incluye impuesto local (10% del nacional).',
    },
    vat: 10, corpTax: 24, capitalGains: '22% (accionistas mayores); inmuebles progresivo',
    residency: { days: 183, rule: 'Domicilio o 183 días', basis: 'remesa' },
    regimes: [
      { name: 'Flat tax para extranjeros', benefit: '19% (20,9% con local) sobre el bruto, sin deducciones', duration: '20 años desde el primer empleo', who: 'Empleados extranjeros', model: { type: 'flat', rate: 0.209 } },
      { name: 'Residente < 5 años', benefit: 'Rentas extranjeras tributan solo si se remiten', duration: '5 de 10 años', who: 'Extranjeros residentes' },
    ],
    path: { permanent: 'F-5: 5 años (o puntos F-2)', citizenship: '5 años', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 36000, inflation: 2.0, unemployment: 2.7, minWageMonthlyUSD: 1541, avgGrossAnnualLocal: 50000000, col: 58, hdi: 0.937 },
    authorityUrl: 'https://www.nts.go.kr/',
  }),
  P({
    country: 'Japón', iso2: 'JP', region: 'Asia-Pacífico', currency: 'JPY', fx: 148,
    tax: {
      brackets: [[1950000, 0.15], [3300000, 0.2], [6950000, 0.3], [9000000, 0.33], [18000000, 0.43], [40000000, 0.5], [null, 0.55]],
      std: 580000, stdPct: 0.2, stdPctCap: 1950000, social: 0.15, socialCap: 7800000, socialDeductible: true,
      note: 'Nacional + impuesto de residente 10% + reconstrucción.',
    },
    vat: 10, corpTax: 30, capitalGains: '20,315%',
    residency: { days: 365, rule: 'Domicilio o residencia ≥ 1 año', basis: 'remesa' },
    regimes: [
      { name: 'Residente no permanente', benefit: 'Rentas extranjeras no remitidas a Japón no tributan', duration: '5 de los primeros 10 años', who: 'Extranjeros residentes' },
      { name: 'Highly Skilled Professional (HSP)', benefit: 'Residencia permanente en 1–3 años por puntos', duration: '5 años', who: '70+ puntos (80 para vía de 1 año)' },
      { name: 'Visa nómada digital', benefit: 'Estancia de 6 meses para trabajo remoto', duration: '6 meses', who: 'Ingresos ≥ ¥10 M/año' },
    ],
    path: { permanent: '10 años (1–3 con HSP)', citizenship: '5 años', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 33000, inflation: 3.0, unemployment: 2.5, minWageMonthlyUSD: 1311, avgGrossAnnualLocal: 4600000, col: 45, hdi: 0.925 },
    authorityUrl: 'https://www.nta.go.jp/',
  }),
  P({
    country: 'Malasia', iso2: 'MY', region: 'Asia-Pacífico', currency: 'MYR', fx: 4.2,
    tax: {
      brackets: [[14000, 0], [29000, 0.01], [44000, 0.03], [59000, 0.06], [79000, 0.11], [109000, 0.19], [409000, 0.25], [609000, 0.26], [2009000, 0.28], [null, 0.3]],
      social: 0.02, socialDeductible: false,
      note: 'Incluye reducción personal MYR 9.000. EPF 2% para extranjeros (desde oct. 2025).',
    },
    vat: 8, corpTax: 24, capitalGains: 'Individuos: exentas (salvo inmuebles, RPGT)',
    residency: { days: 182, rule: '182 días en el año', basis: 'territorial' },
    regimes: [
      { name: 'Renta extranjera remitida', benefit: 'Exenta para individuos', duration: 'Hasta 2036', who: 'Residentes personas físicas' },
      { name: 'DE Rantau', benefit: 'Visa nómada digital', duration: '1 año + 1', who: 'Ingresos ≥ US$24.000/año (tech)' },
      { name: 'MM2H', benefit: 'Residencia de largo plazo', duration: '5–20 años', who: 'Depósito fijo y compra de inmueble' },
    ],
    path: { permanent: 'Restringida', citizenship: '10–12 años', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 13000, inflation: 1.5, unemployment: 3.1, minWageMonthlyUSD: 405, avgGrossAnnualLocal: 42000, col: 33, hdi: 0.819 },
    authorityUrl: 'https://www.hasil.gov.my/',
  }),
  P({
    country: 'Nueva Zelanda', iso2: 'NZ', region: 'Asia-Pacífico', currency: 'NZD', fx: 1.7,
    tax: {
      brackets: [[15600, 0.105], [53500, 0.175], [78100, 0.3], [180000, 0.33], [null, 0.39]],
      social: 0.0167, socialCap: 152790, socialDeductible: false,
      note: 'ACC levy 1,67%. Sin mínimo exento.',
    },
    vat: 15, corpTax: 28, capitalGains: 'Sin impuesto general (bright-line 2 años en inmuebles)',
    residency: { days: 183, rule: '183 días en 12 meses o hogar permanente', basis: 'mundial' },
    regimes: [
      { name: 'Transitional resident', benefit: 'Mayoría de rentas extranjeras exentas', duration: '4 años', who: 'Nuevos residentes sin residencia en 10 años previos' },
      { name: 'Skilled Migrant Category', benefit: 'Residencia por puntos (6 puntos)', duration: 'Permanente tras 2 años', who: 'Trabajadores cualificados con oferta' },
    ],
    path: { permanent: '2 años con residencia', citizenship: '5 años', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 48000, inflation: 2.7, unemployment: 5.3, minWageMonthlyUSD: 2440, avgGrossAnnualLocal: 75000, col: 64, hdi: 0.938 },
    authorityUrl: 'https://www.ird.govt.nz/',
  }),
  P({
    country: 'Rusia', iso2: 'RU', region: 'Asia-Pacífico', currency: 'RUB', fx: 80,
    tax: {
      brackets: [[2400000, 0.13], [5000000, 0.15], [20000000, 0.18], [50000000, 0.2], [null, 0.22]],
      social: 0, socialDeductible: false,
      note: 'No residentes: 30%. Cotizaciones a cargo del empleador. Restricciones bancarias internacionales.',
    },
    vat: 22, corpTax: 25, capitalGains: '13–15% (exención por tenencia > 5 años)',
    residency: { days: 183, rule: '183 días en 12 meses consecutivos', basis: 'mundial' },
    regimes: [
      { name: 'Highly Qualified Specialist', benefit: '13% desde el primer día (incluso no residente)', duration: 'Duración del permiso', who: 'Salario ≥ RUB 750.000/trimestre', model: { type: 'flat', rate: 0.13 } },
    ],
    path: { permanent: '1 año tras permiso temporal', citizenship: '5 años', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 14500, inflation: 8.0, unemployment: 2.3, minWageMonthlyUSD: 339, avgGrossAnnualLocal: 1100000, col: 35, hdi: 0.832 },
    authorityUrl: 'https://www.nalog.gov.ru/',
  }),
  P({
    country: 'Singapur', iso2: 'SG', region: 'Asia-Pacífico', currency: 'SGD', fx: 1.29,
    tax: {
      brackets: [[20000, 0], [30000, 0.02], [40000, 0.035], [80000, 0.07], [120000, 0.115], [160000, 0.15], [200000, 0.18], [240000, 0.19], [280000, 0.195], [320000, 0.2], [500000, 0.22], [1000000, 0.23], [null, 0.24]],
      social: 0, socialDeductible: false,
      note: 'CPF (20%) solo para ciudadanos y PR; extranjeros con Employment Pass no cotizan.',
    },
    vat: 9, corpTax: 17, capitalGains: 'Sin impuesto a las ganancias de capital',
    residency: { days: 183, rule: '183 días en el año (o 3 años consecutivos)', basis: 'territorial' },
    regimes: [
      { name: 'Renta extranjera recibida', benefit: 'Exenta para individuos', duration: 'Permanente', who: 'Residentes personas físicas' },
      { name: 'Employment Pass / ONE Pass', benefit: 'Permiso de trabajo; ONE Pass de 5 años para top talent', duration: '2–5 años', who: 'Salario ≥ SGD 5.600/mes (ONE: ≥ SGD 30.000/mes)' },
    ],
    path: { permanent: 'Solicitable tras ~2 años con EP', citizenship: '2 años como PR', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 92000, inflation: 0.8, unemployment: 2.0, minWageMonthlyUSD: null, avgGrossAnnualLocal: 80000, col: 80, hdi: 0.946 },
    authorityUrl: 'https://www.iras.gov.sg/',
  }),
  P({
    country: 'Tailandia', iso2: 'TH', region: 'Asia-Pacífico', currency: 'THB', fx: 32.5,
    tax: {
      brackets: [[150000, 0], [300000, 0.05], [500000, 0.1], [750000, 0.15], [1000000, 0.2], [2000000, 0.25], [5000000, 0.3], [null, 0.35]],
      std: 60000, stdPct: 0.5, stdPctCap: 100000, social: 0.05, socialCap: 180000, socialDeductible: true,
    },
    vat: 7, corpTax: 20, capitalGains: 'Acciones SET exentas; otras a tasa general',
    residency: { days: 180, rule: '180 días en el año calendario', basis: 'remesa' },
    regimes: [
      { name: 'LTR visa (Long-Term Resident)', benefit: '17% plano para profesionales altamente cualificados + renta extranjera exenta', duration: '10 años', who: 'Ingresos ≥ US$80.000/año (o ≥ US$40.000 con máster)', model: { type: 'flat', rate: 0.17 } },
      { name: 'DTV (Destination Thailand Visa)', benefit: 'Visa para nómadas digitales', duration: '5 años (180 días por entrada)', who: 'Ahorros ≥ THB 500.000' },
    ],
    path: { permanent: 'Cupo anual tras 3 años', citizenship: '5 años tras PR', dualCitizenship: 'limitada' },
    eco: { gdpPcUSD: 7500, inflation: 0.0, unemployment: 1.0, minWageMonthlyUSD: 320, avgGrossAnnualLocal: 250000, col: 38, hdi: 0.798 },
    authorityUrl: 'https://www.rd.go.th/',
  }),

  // ── Medio Oriente ──────────────────────────────────────────────────────────
  P({
    country: 'Arabia Saudita', iso2: 'SA', region: 'Medio Oriente', currency: 'SAR', fx: 3.75,
    tax: { brackets: [[null, 0]], social: 0, socialDeductible: false, note: 'Sin impuesto a la renta personal. GOSI no aplica a expatriados (salvo riesgos laborales, a cargo del empleador).' },
    vat: 15, corpTax: 20, capitalGains: 'Sin impuesto para individuos',
    residency: { days: 183, rule: '183 días (relevante para empresas y tratados)', basis: 'sin IRPF' },
    regimes: [
      { name: 'Premium Residency', benefit: 'Residencia sin sponsor, propiedad inmobiliaria y negocio propio', duration: 'Permanente o anual', who: 'Pago único SAR 800.000 / anual SAR 100.000 o talento especial' },
      { name: 'Tasa por dependiente', benefit: '— (coste) SAR 400/mes por familiar dependiente', duration: 'Anual', who: 'Expatriados con familia' },
    ],
    path: { permanent: 'Premium Residency', citizenship: 'Excepcional', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 34000, inflation: 2.0, unemployment: 3.5, minWageMonthlyUSD: null, avgGrossAnnualLocal: 120000, col: 45, hdi: 0.9 },
    authorityUrl: 'https://zatca.gov.sa/',
  }),
  P({
    country: 'Emiratos Árabes', iso2: 'AE', region: 'Medio Oriente', currency: 'AED', fx: 3.67,
    tax: { brackets: [[null, 0]], social: 0, socialDeductible: false, note: 'Sin impuesto a la renta personal. Seguridad social solo para nacionales del CCG.' },
    vat: 5, corpTax: 9, capitalGains: 'Sin impuesto para individuos',
    residency: { days: 183, rule: '183 días en 12 meses (o 90 días con vivienda/empleo) para certificado de residencia fiscal', basis: 'sin IRPF' },
    regimes: [
      { name: 'Golden Visa', benefit: 'Residencia 10 años sin sponsor', duration: '10 años renovable', who: 'Inversión AED 2 M, talentos o salario ≥ AED 30.000/mes' },
      { name: 'Visa de trabajo remoto', benefit: 'Residencia para trabajar para empleador extranjero', duration: '1 año', who: 'Ingresos ≥ US$3.500/mes' },
    ],
    path: { permanent: 'Golden Visa', citizenship: 'Excepcional', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 50000, inflation: 2.0, unemployment: 2.1, minWageMonthlyUSD: null, avgGrossAnnualLocal: 180000, col: 60, hdi: 0.94 },
    authorityUrl: 'https://tax.gov.ae/',
  }),
  P({
    country: 'Qatar', iso2: 'QA', region: 'Medio Oriente', currency: 'QAR', fx: 3.64,
    tax: { brackets: [[null, 0]], social: 0, socialDeductible: false, note: 'Sin impuesto a la renta sobre salarios.' },
    vat: 0, corpTax: 10, capitalGains: 'Individuos: generalmente exentas',
    residency: { days: 183, rule: '183 días o vivienda permanente', basis: 'sin IRPF' },
    regimes: [
      { name: 'Residencia permanente', benefit: 'Derechos similares a nacionales en salud y educación', duration: 'Permanente', who: 'Cupo limitado (100/año), 20 años de residencia o méritos' },
    ],
    path: { permanent: 'Muy limitada', citizenship: 'Excepcional', dualCitizenship: 'no' },
    eco: { gdpPcUSD: 76000, inflation: 1.0, unemployment: 0.1, minWageMonthlyUSD: 495, avgGrossAnnualLocal: 150000, col: 55, hdi: 0.886 },
    authorityUrl: 'https://www.dhareeba.qa/',
  }),

  // ── África ─────────────────────────────────────────────────────────────────
  P({
    country: 'Sudáfrica', iso2: 'ZA', region: 'África', currency: 'ZAR', fx: 17.8,
    tax: {
      brackets: [[95750, 0], [237100, 0.18], [370500, 0.26], [512800, 0.31], [673000, 0.36], [857900, 0.39], [1817000, 0.41], [null, 0.45]],
      social: 0.01, socialCap: 212544, socialDeductible: false,
      note: 'El rebate primario se modela como mínimo exento. UIF 1%.',
    },
    vat: 15, corpTax: 27, capitalGains: '40% de la ganancia se suma a la renta',
    residency: { days: 91, rule: 'Residencia ordinaria o test de presencia física (91 días/año + 915 en 5 años)', basis: 'mundial' },
    regimes: [
      { name: 'Critical Skills Visa', benefit: 'Visa de trabajo sin oferta previa para habilidades críticas', duration: '5 años', who: 'Ocupaciones en la lista de habilidades críticas' },
      { name: 'Visa nómada digital', benefit: 'Residencia para trabajo remoto', duration: '3 años', who: 'Ingresos ≥ ZAR 1 M/año' },
    ],
    path: { permanent: '5 años', citizenship: '5 años tras PR', dualCitizenship: 'sí' },
    eco: { gdpPcUSD: 6300, inflation: 3.2, unemployment: 32.9, minWageMonthlyUSD: 291, avgGrossAnnualLocal: 320000, col: 36, hdi: 0.741 },
    authorityUrl: 'https://www.sars.gov.za/',
  }),
];

const BY_COUNTRY = new Map(FISCAL_PROFILES.map(p => [p.country, p]));

export const FISCAL_COUNTRIES = FISCAL_PROFILES.map(p => p.country).sort((a, b) => a.localeCompare(b, 'es'));
export const REGIONS: Region[] = ['Europa', 'Américas', 'Asia-Pacífico', 'Medio Oriente', 'África'];

export function getFiscalProfile(country: string): FiscalProfile | null {
  return BY_COUNTRY.get(country) ?? null;
}

export function flagEmoji(iso2: string): string {
  return iso2.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function bandTax(amount: number, brackets: Bracket[]): number {
  let tax = 0;
  let lower = 0;
  for (const [upTo, rate] of brackets) {
    const top = upTo ?? Infinity;
    if (amount <= lower) break;
    tax += (Math.min(amount, top) - lower) * rate;
    lower = top;
  }
  return tax;
}

function marginalRate(amount: number, brackets: Bracket[]): number {
  for (const [upTo, rate] of brackets) {
    if (upTo === null || amount <= upTo) return rate;
  }
  return 0;
}

export interface TaxResult {
  gross: number;
  incomeTax: number;
  social: number;
  levies: number;
  net: number;
  effectiveRate: number;
  marginalRate: number;
  regimeApplied: string | null;
}

/** Calcula impuesto neto anual en moneda local. Si se pasa un régimen con modelo, se aplica. */
export function computeTax(p: FiscalProfile, grossLocal: number, regime?: NewcomerRegime | null): TaxResult {
  const t = p.tax;
  const gross = Math.max(0, grossLocal);
  const model = regime?.model && gross >= (regime.model.minGross ?? 0) ? regime.model : undefined;

  let social = Math.min(gross, t.socialCap ?? Infinity) * t.social;
  const levies = t.levies ? bandTax(gross, t.levies) : 0;

  if (model?.type === 'flat') {
    const incomeTax = gross * model.rate;
    if (model.includesSocial) social = 0;
    const totalLevies = model.includesSocial ? 0 : levies;
    const net = gross - incomeTax - social - totalLevies;
    return {
      gross, incomeTax, social, levies: totalLevies, net,
      effectiveRate: gross > 0 ? 1 - net / gross : 0,
      marginalRate: model.rate + (model.includesSocial ? 0 : t.social),
      regimeApplied: regime!.name,
    };
  }

  let base = gross;
  if (model?.type === 'exempt') {
    base -= Math.min(gross * model.pct, model.exemptCap ?? Infinity);
  }
  const workDeduction = t.stdPct ? Math.min(base * t.stdPct, t.stdPctCap ?? Infinity) : 0;
  const taxable = Math.max(0, base - (t.socialDeductible ? social : 0) - (t.std ?? 0) - workDeduction);
  const incomeTax = t.exemptBelow && gross <= t.exemptBelow ? 0 : bandTax(taxable, t.brackets);
  const net = gross - incomeTax - social - levies;

  return {
    gross, incomeTax, social, levies, net,
    effectiveRate: gross > 0 ? 1 - net / gross : 0,
    marginalRate: marginalRate(taxable, t.brackets) + (t.levies ? marginalRate(gross, t.levies) : 0),
    regimeApplied: model ? regime!.name : null,
  };
}

export interface CountryComparison {
  profile: FiscalProfile;
  standard: TaxResult;
  best: TaxResult;
  /** Neto anual en USD con el mejor régimen aplicable. */
  netUSD: number;
  /** Neto ajustado por costo de vida (USD equivalentes en Nueva York). */
  netPPP: number;
}

/**
 * Compara el neto anual en todos los países.
 * Con grossUSD: mismo salario bruto en todas partes (p. ej. trabajo remoto).
 * Sin grossUSD: salario bruto promedio local de cada país.
 */
export function compareCountries(grossUSD: number | null, useRegimes: boolean): CountryComparison[] {
  return FISCAL_PROFILES.map(profile => {
    const grossLocal = grossUSD === null ? profile.eco.avgGrossAnnualLocal : grossUSD * profile.fx;
    const standard = computeTax(profile, grossLocal);
    let best = standard;
    if (useRegimes) {
      for (const r of profile.regimes) {
        if (!r.model || r.niche) continue;
        const res = computeTax(profile, grossLocal, r);
        if (res.regimeApplied && res.net > best.net) best = res;
      }
    }
    const netUSD = best.net / profile.fx;
    return { profile, standard, best, netUSD, netPPP: netUSD / (profile.eco.col / 100) };
  });
}

export function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${Math.round(value).toLocaleString('es')} ${currency}`;
  }
}

export function formatPct(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}
