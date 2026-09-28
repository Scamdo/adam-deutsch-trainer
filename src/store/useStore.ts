import { create } from 'zustand'
import type { AttemptLog, ExamRecord, ProgressData, Profile, Question, StudySession } from '../types'
import { emptyProgress, migrate } from '../storage/adapter'
import { LocalStorageAdapter } from '../storage/local'
import { SupabaseAdapter, currentUser, getClient, supabaseConfigured } from '../storage/supabase'
import { applyAnswer, type AnswerOutcome } from '../engine/mastery'
import { ACHIEVEMENTS, newlyUnlocked } from '../engine/gamification'

const local = new LocalStorageAdapter()
let remote: SupabaseAdapter | null = null
let saveTimer: ReturnType<typeof setTimeout> | null = null
let remoteTimer: ReturnType<typeof setTimeout> | null = null

export type SyncState = 'local' | 'syncing' | 'synced' | 'error'

export interface Toast {
  id: number
  title: string
  body: string
  icon: string
}

interface StoreState {
  p: ProgressData
  hydrated: boolean
  sync: SyncState
  userEmail: string | null
  toasts: Toast[]
  init: () => Promise<void>
  answer: (q: Question, o: AnswerOutcome, mode: AttemptLog['mode']) => void
  addSession: (s: StudySession) => void
  addExam: (e: ExamRecord, wrong: { q: Question; o: AnswerOutcome }[]) => void
  toggleFlag: (qid: string) => void
  setManualMastered: (topicId: string, value: boolean) => void
  markLessonRead: (topicId: string) => void
  updateProfile: (patch: Partial<Profile>) => void
  resolveMistake: (qid: string) => void
  reset: () => Promise<void>
  importJson: (json: string) => boolean
  dismissToast: (id: number) => void
  connectRemote: () => Promise<void>
}

export const useStore = create<StoreState>((set, get) => {
  function commit(next: ProgressData) {
    const unlocked = newlyUnlocked(next)
    if (unlocked.length) {
      const now = Date.now()
      next = { ...next, achievements: { ...next.achievements, ...Object.fromEntries(unlocked.map((id) => [id, now])) } }
      const toasts = unlocked.map((id, i) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id)!
        return { id: now + i, title: 'Nowe osiągnięcie!', body: `${a.title} - ${a.desc}`, icon: a.icon }
      })
      set((s) => ({ toasts: [...s.toasts, ...toasts] }))
    }
    set({ p: next })
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => void local.save(get().p), 250)
    if (remote) {
      if (remoteTimer) clearTimeout(remoteTimer)
      remoteTimer = setTimeout(async () => {
        set({ sync: 'syncing' })
        try {
          await remote!.save(get().p)
          set({ sync: 'synced' })
        } catch {
          set({ sync: 'error' })
        }
      }, 2500)
    }
  }

  return {
    p: emptyProgress(),
    hydrated: false,
    sync: 'local',
    userEmail: null,
    toasts: [],

    async init() {
      const data = (await local.load()) ?? emptyProgress()
      set({ p: data, hydrated: true })
      await get().connectRemote()
    },

    async connectRemote() {
      if (!supabaseConfigured) return
      try {
        const user = await currentUser()
        if (!user) return
        const client = await getClient()!
        remote = new SupabaseAdapter(client, user)
        set({ userEmail: user.email ?? null, sync: 'syncing' })
        const cloud = await remote.load()
        const mine = get().p
        if (cloud && cloud.updatedAt > mine.updatedAt) {
          set({ p: cloud })
          await local.save(cloud)
        } else {
          await remote.save(mine)
        }
        set({ sync: 'synced' })
      } catch {
        set({ sync: 'error' })
      }
    },

    answer(q, o, mode) {
      commit(applyAnswer(get().p, q, o, mode))
    },

    addSession(s) {
      const p = get().p
      commit({ ...p, sessions: [...p.sessions, s].slice(-500), updatedAt: Date.now() })
    },

    addExam(e, wrong) {
      let p = get().p
      for (const w of wrong) p = applyAnswer(p, w.q, w.o, 'exam', e.finishedAt)
      const bonus = Math.round(e.percent)
      commit({ ...p, exams: [...p.exams, e], xp: p.xp + bonus, updatedAt: Date.now() })
    },

    toggleFlag(qid) {
      const p = get().p
      const flagged = p.flagged.includes(qid) ? p.flagged.filter((x) => x !== qid) : [...p.flagged, qid]
      commit({ ...p, flagged, updatedAt: Date.now() })
    },

    setManualMastered(topicId, value) {
      const p = get().p
      const t = p.topics[topicId] ?? { attempts: 0, correct: 0, ewma: 0.5, lastAt: 0 }
      commit({ ...p, topics: { ...p.topics, [topicId]: { ...t, manualMastered: value, ewma: value ? Math.max(t.ewma, 0.85) : t.ewma } }, updatedAt: Date.now() })
    },

    markLessonRead(topicId) {
      const p = get().p
      if (p.lessonsRead[topicId]) return
      commit({ ...p, lessonsRead: { ...p.lessonsRead, [topicId]: Date.now() }, xp: p.xp + 15, updatedAt: Date.now() })
    },

    updateProfile(patch) {
      const p = get().p
      commit({ ...p, profile: { ...p.profile, ...patch }, updatedAt: Date.now() })
    },

    resolveMistake(qid) {
      const p = get().p
      const m = p.mistakes[qid]
      if (!m) return
      commit({ ...p, mistakes: { ...p.mistakes, [qid]: { ...m, resolved: true, flagged: false } }, flagged: p.flagged.filter((x) => x !== qid), updatedAt: Date.now() })
    },

    async reset() {
      await local.clear()
      const fresh = emptyProgress()
      set({ p: fresh })
      await local.save(fresh)
      if (remote) await remote.save(fresh)
    },

    importJson(json) {
      try {
        const data = migrate(JSON.parse(json))
        commit({ ...data, updatedAt: Date.now() })
        return true
      } catch {
        return false
      }
    },

    dismissToast(id) {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    },
  }
})
