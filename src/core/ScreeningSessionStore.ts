import type {
  PsychScreeningSession,
  ScreeningScore,
  AdaptationContextSnapshot,
} from '../models/PsychScreening';

const STORAGE_KEY = 'freedomos.screeningSessions';
const MAX_SESSIONS = 12;

export interface StoredScreeningSession extends PsychScreeningSession {
  // inherits from PsychScreeningSession
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readSessions(): StoredScreeningSession[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((session): session is StoredScreeningSession => {
      return Boolean(
        session &&
        typeof session.id === 'string' &&
        typeof session.userId === 'string' &&
        typeof session.occurredAt === 'string' &&
        Array.isArray(session.scores)
      );
    });
  } catch {
    return [];
  }
}

function writeSessions(sessions: StoredScreeningSession[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function getScreeningSessions(): StoredScreeningSession[] {
  return readSessions().slice(0, MAX_SESSIONS);
}

export function storeScreeningSession(session: PsychScreeningSession): StoredScreeningSession {
  const stored: StoredScreeningSession = {
    ...session,
  };

  const existing = readSessions();
  const updated = [stored, ...existing].slice(0, MAX_SESSIONS);
  writeSessions(updated);

  return stored;
}

export function clearScreeningSessions() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
