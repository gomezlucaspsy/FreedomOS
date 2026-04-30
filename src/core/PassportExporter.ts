import { jsPDF } from 'jspdf';
import type { MigrantPassport } from '../models/MigrantPassport';
import type { MigrantPerson } from '../models/MigrantPerson';
import type { PsychProfile } from '../models/PsychProfile';
import type { SkillRecommendation } from './SkillGapAnalyzer';
import type { CountryDemandDiagnostics } from './RigorousData';
import { BIG_FIVE_LABELS } from '../models/PsychProfile';

// ─── Build passport object ────────────────────────────────────────────────────

export function buildPassport(
  migrant: MigrantPerson,
  psychProfile: PsychProfile | null,
  skillGap: { targetCountry: string; recommendations: SkillRecommendation[]; diagnostics?: CountryDemandDiagnostics } | null
): MigrantPassport {
  return {
    version: '1.0',
    issuedAt: new Date().toISOString(),
    issuedBy: 'FreedomOS',
    holder: {
      fullName: migrant.fullName,
      originCountry: migrant.originCountry,
      currentCountry: migrant.currentCountry,
      email: migrant.email,
      languages: migrant.languages,
    },
    professional: {
      skills: migrant.skills,
      experience: migrant.experience,
      education: migrant.education,
    },
    psychological: psychProfile
      ? {
          hollandCode: psychProfile.topRIASEC.join(''),
          adaptabilityScore: psychProfile.adaptabilityScore,
          integrationRisk: psychProfile.integrationRisk,
          topCountryMatches: psychProfile.countryMatch.slice(0, 10),
          bigFiveSummary: Object.fromEntries(
            Object.entries(psychProfile.bigFive).map(([k, v]) => [
              BIG_FIVE_LABELS[k as keyof typeof BIG_FIVE_LABELS], v
            ])
          ),
          responseQualityLevel: psychProfile.responseQuality?.level,
          resultConfidence: psychProfile.responseQuality?.confidence,
          psychometricWarnings: psychProfile.responseQuality?.warnings,
          interpretiveCautions: psychProfile.interpretiveCautions,
        }
      : null,
    skillGapRoadmap: skillGap,
  };
}

// ─── Export as JSON ───────────────────────────────────────────────────────────

export function exportPassportJSON(passport: MigrantPassport): void {
  const blob = new Blob([JSON.stringify(passport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FreedomOS_Passport_${passport.holder.fullName.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Export as PDF ────────────────────────────────────────────────────────────

const CYAN = [0, 200, 170] as const;
const WHITE = [255, 255, 255] as const;
const DARK = [10, 10, 10] as const;
const GRAY = [120, 120, 120] as const;
const PANEL = [22, 22, 22] as const;

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFillColor(...CYAN);
  doc.rect(14, y, 182, 0.4, 'F');
  doc.setTextColor(...CYAN);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(text.toUpperCase(), 14, y + 5);
  return y + 10;
}

function field(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x, y);
  doc.setTextColor(...WHITE);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const lines = doc.splitTextToSize(value || '—', 80);
  doc.text(lines, x, y + 4);
  return y + 4 + lines.length * 4;
}

function pill(doc: jsPDF, text: string, x: number, y: number, color: number[] = [...CYAN]): number {
  const w = doc.getTextWidth(text) + 4;
  doc.setFillColor(color[0], color[1], color[2], 0.15);
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y - 3.5, w, 5, 1, 1, 'FD');
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x + 2, y);
  return w + 3;
}

function bar(doc: jsPDF, label: string, value: number, x: number, y: number, color: number[] = [...CYAN]): number {
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x, y);
  doc.setTextColor(...WHITE);
  doc.text(`${value}%`, x + 60, y);
  doc.setFillColor(30, 30, 30);
  doc.roundedRect(x, y + 1.5, 60, 3, 1, 1, 'F');
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y + 1.5, 60 * (value / 100), 3, 1, 1, 'F');
  return y + 8;
}

export function exportPassportPDF(passport: MigrantPassport): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  let y = 0;

  // ── Cover header ─────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 297, 'F');

  doc.setFillColor(...PANEL);
  doc.rect(0, 0, W, 42, 'F');

  doc.setFillColor(...CYAN);
  doc.rect(0, 0, 3, 42, 'F');

  doc.setTextColor(...CYAN);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FreedomOS', 10, 14);

  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('MIGRANT SELF-PASSPORT  //  v1.0', 10, 20);

  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(passport.holder.fullName, 10, 31);

  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Emitido: ${new Date(passport.issuedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, 10, 37);
  doc.text(`${passport.holder.originCountry}  →  ${passport.holder.currentCountry}`, W - 14, 37, { align: 'right' });

  y = 52;

  // ── Holder info ───────────────────────────────────────────────────────────────
  y = sectionTitle(doc, '01 · Datos del Titular', y);
  const col2 = W / 2 + 5;
  field(doc, 'Nombre completo', passport.holder.fullName, 14, y);
  field(doc, 'País de origen', passport.holder.originCountry, col2, y);
  y += 10;
  field(doc, 'Email', passport.holder.email ?? '—', 14, y);
  field(doc, 'Idiomas', passport.holder.languages.join(', ') || '—', col2, y);
  y += 14;

  // ── Skills ────────────────────────────────────────────────────────────────────
  y = sectionTitle(doc, '02 · Perfil Profesional', y);
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Habilidades detectadas', 14, y);
  y += 5;
  let px = 14;
  for (const skill of passport.professional.skills) {
    if (px + doc.getTextWidth(skill) + 8 > W - 14) { px = 14; y += 7; }
    px += pill(doc, skill, px, y);
  }
  if (passport.professional.skills.length === 0) {
    doc.setTextColor(...GRAY); doc.setFontSize(8); doc.text('No detectadas', 14, y);
  }
  y += 10;

  if (passport.professional.experience.length > 0) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(7.5);
    doc.text('Experiencia', 14, y);
    y += 4;
    for (const exp of passport.professional.experience.slice(0, 4)) {
      doc.setTextColor(...WHITE);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${exp.role}  ·  ${exp.company}`, 14, y);
      doc.setTextColor(...GRAY);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${exp.durationYears} año(s)`, W - 14, y, { align: 'right' });
      y += 5;
    }
    y += 4;
  }

  // ── Psychological profile ─────────────────────────────────────────────────────
  y = sectionTitle(doc, '03 · Perfil Psicológico', y);
  if (passport.psychological) {
    const psych = passport.psychological;
    const RISK_COLOR: Record<string, number[]> = {
      bajo: [0, 200, 170], medio: [240, 196, 0], alto: [240, 80, 0]
    };

    doc.setTextColor(...GRAY); doc.setFontSize(7.5); doc.text('Código Holland', 14, y);
    doc.setTextColor(...CYAN); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text(psych.hollandCode, 14, y + 9);

    doc.setTextColor(...GRAY); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('Adaptabilidad', 50, y);
    doc.setTextColor(...CYAN); doc.setFontSize(16);
    doc.text(`${psych.adaptabilityScore}%`, 50, y + 8);

    doc.setTextColor(...GRAY); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('Riesgo integración', 90, y);
    const rc = RISK_COLOR[psych.integrationRisk] ?? [...GRAY];
    doc.setTextColor(rc[0], rc[1], rc[2]);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(psych.integrationRisk.toUpperCase(), 90, y + 8);

    y += 16;

    // Big Five bars
    doc.setTextColor(...GRAY); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('Personalidad (Big Five)', 14, y); y += 5;
    for (const [label, val] of Object.entries(psych.bigFiveSummary)) {
      y = bar(doc, label, val as number, 14, y);
    }
    y += 2;

    // Top country matches
    doc.setTextColor(...GRAY); doc.setFontSize(7.5); doc.text('Compatibilidad por país (top 10)', 14, y); y += 5;
    for (const { country, score } of psych.topCountryMatches) {
      y = bar(doc, country, score, 14, y, [...CYAN]);
    }
    y += 4;
  } else {
    doc.setTextColor(...GRAY); doc.setFontSize(8);
    doc.text('Test psicológico no completado.', 14, y);
    y += 12;
  }

  // ── Skill gap roadmap ─────────────────────────────────────────────────────────
  y = sectionTitle(doc, '04 · Hoja de Ruta — Brecha de Habilidades', y);
  if (passport.skillGapRoadmap && passport.skillGapRoadmap.recommendations.length > 0) {
    const PRIORITY_COLORS: Record<string, number[]> = {
      'crítica': [240, 80, 0], alta: [240, 196, 0], media: [0, 200, 170]
    };
    doc.setTextColor(...GRAY); doc.setFontSize(7.5);
    doc.text(`País destino: ${passport.skillGapRoadmap.targetCountry}`, 14, y); y += 6;
    for (const rec of passport.skillGapRoadmap.recommendations) {
      if (y > 270) { doc.addPage(); doc.setFillColor(...DARK); doc.rect(0, 0, W, 297, 'F'); y = 14; }
      const pc = PRIORITY_COLORS[rec.priority] ?? [...GRAY];
      pill(doc, rec.priority.toUpperCase(), 14, y, pc);
      doc.setTextColor(...WHITE); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(rec.skill, 14 + doc.getTextWidth(rec.priority) + 8, y);
      doc.setTextColor(...GRAY); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
      doc.text(`~${rec.learningWeeks} sem · ${rec.platforms.join(', ')}`, W - 14, y, { align: 'right' });
      y += 4;
      const lines = doc.splitTextToSize(rec.reason, W - 28);
      doc.setTextColor(100, 100, 100);
      doc.text(lines, 14, y);
      y += lines.length * 4 + 3;
    }
  } else if (passport.skillGapRoadmap) {
    doc.setTextColor(0, 200, 170); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
    doc.text(`✓ Tu perfil ya cubre las habilidades clave para ${passport.skillGapRoadmap.targetCountry}.`, 14, y);
    y += 10;
  } else {
    doc.setTextColor(...GRAY); doc.setFontSize(8);
    doc.text('Análisis de brecha no completado.', 14, y);
    y += 10;
  }

  // ── Footer ────────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...PANEL);
    doc.rect(0, 285, W, 12, 'F');
    doc.setTextColor(...GRAY);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('FreedomOS · Self-issued · No institutional endorsement', 14, 291);
    doc.text(`${i} / ${pageCount}`, W - 14, 291, { align: 'right' });
    doc.setTextColor(...CYAN);
    doc.text('Proof of Self', W / 2, 291, { align: 'center' });
  }

  doc.save(`FreedomOS_Passport_${passport.holder.fullName.replace(/\s+/g, '_')}.pdf`);
}
