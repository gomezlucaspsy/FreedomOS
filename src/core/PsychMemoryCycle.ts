import type { PsychProfile } from '../models/PsychProfile';

const STORAGE_KEY = 'freedomos.psychMemoryCycle';
const MAX_ENTRIES = 6;

export type PsychMemoryStage = 'active' | 'archived';

export interface PsychMemoryEntry {
  id: string;
  createdAt: string;
  archivedAt?: string;
  stage: PsychMemoryStage;
  profile: PsychProfile;
}

export interface PsychMemoryCycle {
  activeEntry: PsychMemoryEntry | null;
  entries: PsychMemoryEntry[];
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readEntries(): PsychMemoryEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry): entry is PsychMemoryEntry => {
      return Boolean(
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.createdAt === 'string' &&
        typeof entry.stage === 'string' &&
        entry.profile
      );
    });
  } catch {
    return [];
  }
}

function writeEntries(entries: PsychMemoryEntry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getPsychMemoryCycle(): PsychMemoryCycle {
  const entries = readEntries().slice(0, MAX_ENTRIES);
  return {
    activeEntry: entries.find(entry => entry.stage === 'active') ?? null,
    entries,
  };
}

export function storePsychProfile(profile: PsychProfile): PsychMemoryCycle {
  const now = new Date().toISOString();
  const archived = readEntries().map(entry => (
    entry.stage === 'active'
      ? { ...entry, stage: 'archived' as const, archivedAt: now }
      : entry
  ));

  const activeEntry: PsychMemoryEntry = {
    id: `psych-${Date.now()}`,
    createdAt: now,
    stage: 'active',
    profile,
  };

  const nextEntries = [activeEntry, ...archived].slice(0, MAX_ENTRIES);
  writeEntries(nextEntries);

  return {
    activeEntry,
    entries: nextEntries,
  };
}

export function archiveActivePsychProfile(): PsychMemoryCycle {
  const now = new Date().toISOString();
  const nextEntries = readEntries().map(entry => (
    entry.stage === 'active'
      ? { ...entry, stage: 'archived' as const, archivedAt: now }
      : entry
  ));

  writeEntries(nextEntries);

  return {
    activeEntry: null,
    entries: nextEntries,
  };
}