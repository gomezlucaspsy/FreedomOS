import { buildOutcomeFeatureVector, deriveMonitoringFlags } from './PsychOutcomeModel';
import type { PsychScreeningSession } from '../models/PsychScreening';

export type ActionDomain = 'wellbeing' | 'resilience' | 'support' | 'adaptation';

export type ActionStep = 'starter' | 'standard' | 'advanced';

export interface BehaviorAction {
  id: string;
  domain: ActionDomain;
  title: string;
  cue: string;
  action: string;
  reinforcement: string;
  weeklyTarget: number;
  step: ActionStep;
  rationale: string;
}

export interface WeeklyInterventionPlan {
  generatedAt: string;
  modelVersion: string;
  intensity: 'low' | 'medium' | 'high';
  actions: BehaviorAction[];
  guardrails: string[];
}

function sessionsSorted(sessions: PsychScreeningSession[]): PsychScreeningSession[] {
  return [...sessions].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
}

function countStableRecentSessions(sessions: PsychScreeningSession[]): number {
  const ordered = sessionsSorted(sessions);
  const recent = ordered.slice(-2);

  return recent.filter((session) => {
    const flags = deriveMonitoringFlags([session]);
    return flags.length === 0;
  }).length;
}

function toStep(intensity: 'low' | 'medium' | 'high', stableRecentSessions: number): ActionStep {
  if (intensity === 'high') return 'starter';
  if (stableRecentSessions >= 2) return 'advanced';
  if (intensity === 'low') return 'advanced';
  return 'standard';
}

function targetForStep(step: ActionStep, base: number): number {
  if (step === 'starter') return Math.max(1, base - 2);
  if (step === 'advanced') return base + 1;
  return base;
}

export function generateWeeklyInterventionPlan(sessions: PsychScreeningSession[]): WeeklyInterventionPlan {
  const flags = deriveMonitoringFlags(sessions);
  const features = buildOutcomeFeatureVector(sessions);
  const stableRecentSessions = countStableRecentSessions(sessions);

  const hasHighFlag = flags.some((flag) => flag.level === 'high');
  const intensity: 'low' | 'medium' | 'high' = hasHighFlag ? 'high' : flags.length >= 2 ? 'medium' : 'low';
  const step = toStep(intensity, stableRecentSessions);

  const actions: BehaviorAction[] = [];

  const needsDistressSupport = flags.some((flag) => flag.id === 'distress_elevated' || flag.id === 'wellbeing_low');
  if (needsDistressSupport) {
    actions.push({
      id: 'wellbeing-regulation-loop',
      domain: 'wellbeing',
      title: 'Micro-rutina de regulacion emocional',
      cue: 'Despues de desayunar o al terminar tu jornada',
      action: 'Respiracion guiada + registro breve de estado durante 10 minutos.',
      reinforcement: 'Marca de cumplimiento diario y nota de energia percibida.',
      weeklyTarget: targetForStep(step, 5),
      step,
      rationale: 'PHQ-4/WHO-5 sugiere reforzar practicas cortas y repetibles de regulacion.',
    });
  }

  const needsResilienceSupport = (features.latestBrs ?? 5) < 3 || (features.deltaBrs ?? 0) < -0.3;
  if (needsResilienceSupport) {
    actions.push({
      id: 'resilience-recovery-loop',
      domain: 'resilience',
      title: 'Bloque de recuperacion activa',
      cue: 'Antes de dormir, tres dias por semana',
      action: 'Escribe un estresor del dia y define una respuesta concreta para manana.',
      reinforcement: 'Refuerzo de dominio: visualiza continuidad semanal y recuperacion percibida.',
      weeklyTarget: targetForStep(step, 3),
      step,
      rationale: 'Resiliencia baja o en descenso: conviene practicar respuestas de afrontamiento concretas.',
    });
  }

  const needsSocialSupport = flags.some((flag) => flag.id === 'support_need_high') || (features.localSupportLevel ?? 5) <= 2;
  if (needsSocialSupport) {
    actions.push({
      id: 'social-support-loop',
      domain: 'support',
      title: 'Contacto pro-social estructurado',
      cue: 'Lunes y jueves a la misma hora',
      action: 'Contacta una persona de confianza o grupo comunitario y solicita/ofrece apoyo concreto.',
      reinforcement: 'Refuerzo social: registrar interacciones utiles y percepcion de apoyo.',
      weeklyTarget: targetForStep(step, 2),
      step,
      rationale: 'Soporte social bajo incrementa riesgo de desadaptacion; priorizar vinculo frecuente ayuda.',
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: 'adaptation-maintenance-loop',
      domain: 'adaptation',
      title: 'Mantenimiento de adaptacion',
      cue: 'Cada domingo por la tarde',
      action: 'Planifica 3 acciones de la semana para empleo, idioma y bienestar.',
      reinforcement: 'Chequeo semanal de metas cumplidas y ajuste de dificultad.',
      weeklyTarget: targetForStep(step, 1),
      step,
      rationale: 'Sin flags elevados: mantener consistencia y subir dificultad de forma gradual.',
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    modelVersion: 'behavior-plan.v1',
    intensity,
    actions: actions.slice(0, 3),
    guardrails: [
      'Este plan es orientativo y no es un tratamiento clinico.',
      'Puedes editar o pausar cualquier accion para mantener autonomia.',
      'Si el malestar aumenta, busca apoyo profesional local.',
    ],
  };
}
