import type { MigrantPerson } from '../models/MigrantPerson';

const STORAGE_KEY = 'freedomos.migrantProfile';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredMigrantProfile(): MigrantPerson | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<MigrantPerson> | null;
    if (!parsed || typeof parsed !== 'object') return null;

    if (typeof parsed.id !== 'string' || typeof parsed.fullName !== 'string') return null;
    if (!Array.isArray(parsed.skills) || !Array.isArray(parsed.languages)) return null;
    if (!Array.isArray(parsed.education) || !Array.isArray(parsed.experience)) return null;

    return parsed as MigrantPerson;
  } catch {
    return null;
  }
}

export function storeMigrantProfile(profile: MigrantPerson): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
