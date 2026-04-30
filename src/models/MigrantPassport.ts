import type { MigrantPerson } from './MigrantPerson';
import type { SkillRecommendation } from '../core/SkillGapAnalyzer';
import type { CountryDemandDiagnostics } from '../core/RigorousData';

export interface MigrantPassport {
  version: '1.0';
  issuedAt: string;         // ISO timestamp
  issuedBy: 'FreedomOS';
  holder: {
    fullName: string;
    originCountry: string;
    currentCountry: string;
    email?: string;
    languages: string[];
  };
  professional: {
    skills: string[];
    experience: MigrantPerson['experience'];
    education: MigrantPerson['education'];
  };
  psychological: {
    hollandCode: string;          // e.g. "ISE"
    adaptabilityScore: number;
    integrationRisk: 'bajo' | 'medio' | 'alto';
    topCountryMatches: { country: string; score: number }[];
    bigFiveSummary: Record<string, number>;
    responseQualityLevel?: 'alta' | 'media' | 'baja';
    resultConfidence?: number;
    psychometricWarnings?: string[];
    interpretiveCautions?: string[];
  } | null;
  skillGapRoadmap: {
    targetCountry: string;
    recommendations: SkillRecommendation[];
    diagnostics?: CountryDemandDiagnostics;
  } | null;
}
