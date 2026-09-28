import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { ProgressData } from '../types'
import { migrate, type StorageAdapter } from './adapter'
import { topicStatus } from '../engine/mastery'
import { dayKey } from '../engine/mastery'

/**
 * Synchronizacja z Supabase.
 * - Klucz: TYLKO publiczny anon/publishable (VITE_SUPABASE_ANON_KEY). Service role nigdy nie trafia do frontendu.
 * - Bezpieczeństwo zapewniają polityki RLS (supabase/schema.sql): każdy widzi i zmienia tylko własne wiersze.
 * - Model: pełny snapshot postępu w profiles.progress (szybkie wczytanie na nowym urządzeniu)
 *   + znormalizowane tabele (attempts, mastery, mistakes, mock_exams, sessions, achievements, daily_activity)
 *   do analiz i widoku rodzica.
 */

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(URL_ && KEY_)

let clientPromise: Promise<SupabaseClient> | null = null
export function getClient(): Promise<SupabaseClient> | null {
  if (!supabaseConfigured) return null
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(URL_!, KEY_!, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } }),
    )
  }
  return clientPromise
}

export async function currentUser(): Promise<User | null> {
  const c = getClient()
  if (!c) return null
  const client = await c
  const { data } = await client.auth.getUser()
  return data.user ?? null
}

export async function signInWithEmail(email: string): Promise<string | null> {
  const c = getClient()
  if (!c) return 'Supabase nie jest skonfigurowany.'
  const client = await c
  const redirect = window.location.origin + window.location.pathname
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } })
  return error ? error.message : null
}

export async function verifyCode(email: string, token: string): Promise<string | null> {
  const c = getClient()
  if (!c) return 'Supabase nie jest skonfigurowany.'
  const client = await c
  const { error } = await client.auth.verifyOtp({ email, token, type: 'email' })
  return error ? error.message : null
}

export async function signOut(): Promise<void> {
  const c = getClient()
  if (!c) return
  await (await c).auth.signOut()
}

export class SupabaseAdapter implements StorageAdapter {
  readonly name = 'supabase'
  private lastSynced: { attempts: number; exams: Set<string>; sessions: Set<string> } = { attempts: 0, exams: new Set(), sessions: new Set() }

  constructor(private client: SupabaseClient, private user: User) {}

  async load(): Promise<ProgressData | null> {
    const { data, error } = await this.client.from('profiles').select('progress').eq('id', this.user.id).maybeSingle()
    if (error || !data?.progress) return null
    const p = migrate(data.progress)
    this.lastSynced.attempts = p.attempts.length
    p.exams.forEach((e) => this.lastSynced.exams.add(e.id))
    p.sessions.forEach((s) => this.lastSynced.sessions.add(s.id))
    return p
  }

  async save(p: ProgressData): Promise<void> {
    const uid = this.user.id
    const c = this.client
    await c.from('profiles').upsert({ id: uid, display_name: p.profile.name, settings: p.profile, progress: p, progress_updated_at: new Date(p.updatedAt).toISOString() })

    // Nowe próby odpowiedzi
    const newAttempts = p.attempts.slice(this.lastSynced.attempts)
    if (newAttempts.length) {
      const { error } = await c.from('question_attempts').insert(
        newAttempts.map((a) => ({ user_id: uid, question_id: a.qid, topic_id: a.topic, category: a.category, correct: a.correct, score: a.score, mode: a.mode, answered_at: new Date(a.at).toISOString() })),
      )
      if (!error) this.lastSynced.attempts = p.attempts.length
    }

    // Mastery (per temat)
    const mastery = Object.entries(p.topics).map(([topic, t]) => ({
      user_id: uid, topic_id: topic, attempts: t.attempts, correct: t.correct, score: t.ewma, status: topicStatus(t), manual_mastered: !!t.manualMastered, updated_at: new Date(t.lastAt || Date.now()).toISOString(),
    }))
    if (mastery.length) await c.from('mastery').upsert(mastery)

    // Błędy
    const mistakes = Object.values(p.mistakes).map((m) => ({
      user_id: uid, question_id: m.qid, count: m.count, last_given: m.lastGiven, expected: m.expected, resolved: m.resolved, flagged: !!m.flagged, first_at: new Date(m.firstAt).toISOString(), last_at: new Date(m.lastAt).toISOString(),
    }))
    if (mistakes.length) await c.from('mistakes').upsert(mistakes)

    // Próbne konkursy
    const exams = p.exams.filter((e) => !this.lastSynced.exams.has(e.id))
    if (exams.length) {
      const { error } = await c.from('mock_exams').insert(
        exams.map((e) => ({ id: e.id, user_id: uid, stage: e.stage, started_at: new Date(e.startedAt).toISOString(), finished_at: new Date(e.finishedAt).toISOString(), duration_sec: e.durationSec, points: e.points, max_points: e.max, percent: e.percent, by_category: e.byCategory, items: e.items })),
      )
      if (!error) exams.forEach((e) => this.lastSynced.exams.add(e.id))
    }

    // Sesje nauki
    const sessions = p.sessions.filter((s) => !this.lastSynced.sessions.has(s.id))
    if (sessions.length) {
      const { error } = await c.from('study_sessions').insert(
        sessions.map((s) => ({ id: s.id, user_id: uid, mode: s.mode, label: s.label, started_at: new Date(s.startedAt).toISOString(), ended_at: new Date(s.endedAt).toISOString(), active_sec: s.activeSec, questions: s.questions, correct: s.correct, xp: s.xp })),
      )
      if (!error) sessions.forEach((s) => this.lastSynced.sessions.add(s.id))
    }

    // Osiągnięcia
    const ach = Object.entries(p.achievements).map(([id, at]) => ({ user_id: uid, achievement_id: id, unlocked_at: new Date(at).toISOString() }))
    if (ach.length) await c.from('achievements').upsert(ach)

    // Historia dzienna
    const today = dayKey(Date.now())
    const todays = p.attempts.filter((a) => dayKey(a.at) === today)
    const activeSec = p.sessions.filter((s) => dayKey(s.startedAt) === today).reduce((sum, s) => sum + s.activeSec, 0)
    await c.from('daily_activity').upsert({ user_id: uid, day: today, questions: todays.length, correct: todays.filter((a) => a.correct).length, active_sec: activeSec })
  }

  async clear(): Promise<void> {
    await this.client.from('profiles').update({ progress: null }).eq('id', this.user.id)
  }
}
