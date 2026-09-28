import type { ProgressData } from '../types'

/**
 * Abstrakcja zapisu postępu.
 * Aplikacja jest „local-first”: zawsze zapisuje lokalnie (działa offline i bez konfiguracji),
 * a jeśli skonfigurowano Supabase i użytkownik jest zalogowany - dodatkowo synchronizuje z chmurą.
 */
export interface StorageAdapter {
  readonly name: string
  load(): Promise<ProgressData | null>
  save(data: ProgressData): Promise<void>
  clear(): Promise<void>
}

export const CURRENT_VERSION = 1

export function emptyProgress(): ProgressData {
  const now = Date.now()
  return {
    version: CURRENT_VERSION,
    profile: { name: 'Adam', createdAt: now, dailyGoal: 25, theme: 'system', targetStage: 'szkolny' },
    xp: 0,
    qstates: {},
    topics: {},
    tags: {},
    mistakes: {},
    flagged: [],
    attempts: [],
    sessions: [],
    exams: [],
    achievements: {},
    activeDays: [],
    lessonsRead: {},
    updatedAt: now,
  }
}

/** Uzupełnia brakujące pola (migracja starszych zapisów) */
export function migrate(raw: unknown): ProgressData {
  const base = emptyProgress()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<ProgressData>
  return {
    ...base,
    ...r,
    profile: { ...base.profile, ...(r.profile ?? {}) },
    version: CURRENT_VERSION,
  }
}
