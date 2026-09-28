import type { AttemptLog, MasteryStatus, ProgressData, QState, Question, TopicState } from '../types'

/**
 * ALGORYTM MASTERY + SPACED REPETITION
 *
 * 1) Pytanie (QState) - uproszczony Leitner/SM-2:
 *    - poprawnie: streak+1, interwał: 1 → 3 → 7 → 16 → 35 dni (×2.2, max 60); trudne pytania rosną wolniej
 *    - błędnie:   streak=0, lapses+1, interwał 0 → pytanie „due” za 10 min (wraca jeszcze dziś)
 * 2) Temat i tag (TopicState) - wykładnicza średnia krocząca (EWMA, α=0.3) wyniku 0..1,
 *    więc ostatnie odpowiedzi ważą więcej niż stare. Punkt startowy 0.5.
 * 3) Status tematu:
 *    New (<3 próby) · Weak (<60%) · Learning (60-80%) · Good (80-92%) · Mastered (≥92% i ≥8 prób)
 *    Ręczne „opanowane” działa, dopóki wynik nie spadnie poniżej 80%.
 */

const DAY = 86_400_000
const ALPHA = 0.3

export function emptyQState(): QState {
  return { n: 0, correct: 0, streak: 0, lapses: 0, interval: 0, due: 0, lastAt: 0, lastCorrect: false }
}

export function nextQState(prev: QState | undefined, correct: boolean, difficulty: number, now: number): QState {
  const s = { ...(prev ?? emptyQState()) }
  s.n += 1
  s.lastAt = now
  s.lastCorrect = correct
  if (correct) {
    s.correct += 1
    s.streak += 1
    const growth = difficulty === 3 ? 1.9 : 2.2
    s.interval = s.streak === 1 ? 1 : s.streak === 2 ? 3 : Math.min(60, Math.round(Math.max(s.interval, 3) * growth))
    if (s.lapses > 2 && s.streak < 4) s.interval = Math.max(1, Math.round(s.interval * 0.6)) // uporczywy błąd → częściej
    s.due = now + s.interval * DAY
  } else {
    s.streak = 0
    s.lapses += 1
    s.interval = 0
    s.due = now + 10 * 60_000
  }
  return s
}

export function nextTopicState(prev: TopicState | undefined, score: number, now: number): TopicState {
  const p = prev ?? { attempts: 0, correct: 0, ewma: 0.5, lastAt: 0 }
  const ewma = p.attempts === 0 ? (score + 0.5) / 2 : p.ewma * (1 - ALPHA) + score * ALPHA
  return { ...p, attempts: p.attempts + 1, correct: p.correct + (score >= 0.999 ? 1 : 0), ewma, lastAt: now }
}

export function topicStatus(t: TopicState | undefined): MasteryStatus {
  if (!t || t.attempts < 3) return t?.manualMastered && (t.ewma ?? 0) >= 0.8 ? 'mastered' : 'new'
  if (t.manualMastered && t.ewma >= 0.8) return 'mastered'
  if (t.ewma < 0.6) return 'weak'
  if (t.ewma < 0.8) return 'learning'
  if (t.ewma >= 0.92 && t.attempts >= 8) return 'mastered'
  return 'good'
}

export const STATUS_LABEL: Record<MasteryStatus, string> = {
  new: 'Nowy',
  learning: 'W nauce',
  weak: 'Słaby',
  good: 'Dobry',
  mastered: 'Opanowany',
}

export const STATUS_COLOR: Record<MasteryStatus, string> = {
  new: 'bg-slate-400',
  learning: 'bg-sky-500',
  weak: 'bg-rose-500',
  good: 'bg-emerald-500',
  mastered: 'bg-violet-500',
}

/** Procent opanowania tematu 0..100 do pasków postępu (uwzględnia liczbę prób) */
export function topicPercent(t: TopicState | undefined): number {
  if (!t || t.attempts === 0) return 0
  const confidence = Math.min(1, t.attempts / 8)
  return Math.round(t.ewma * confidence * 100)
}

export function dayKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface AnswerOutcome {
  correct: boolean
  score: number
  given: string
  expected: string
}

/** Czysta funkcja: zwraca nowy stan postępu po odpowiedzi */
export function applyAnswer(p: ProgressData, q: Question, o: AnswerOutcome, mode: AttemptLog['mode'], now = Date.now()): ProgressData {
  const qstates = { ...p.qstates, [q.id]: nextQState(p.qstates[q.id], o.correct, q.difficulty, now) }
  const topics = { ...p.topics, [q.topic]: { ...nextTopicState(p.topics[q.topic], o.score, now), manualMastered: p.topics[q.topic]?.manualMastered } }
  const tags = { ...p.tags }
  for (const tag of q.tags) tags[tag] = nextTopicState(tags[tag], o.score, now)

  const mistakes = { ...p.mistakes }
  const m = mistakes[q.id]
  if (!o.correct) {
    mistakes[q.id] = {
      qid: q.id,
      count: (m?.count ?? 0) + 1,
      firstAt: m?.firstAt ?? now,
      lastAt: now,
      lastGiven: o.given,
      expected: o.expected,
      resolved: false,
      fixStreak: 0,
      flagged: m?.flagged,
    }
  } else if (m && !m.resolved) {
    const fixStreak = m.fixStreak + 1
    mistakes[q.id] = { ...m, fixStreak, resolved: fixStreak >= 2 && !m.flagged }
  }

  const attempt: AttemptLog = { qid: q.id, at: now, correct: o.correct, score: o.score, topic: q.topic, category: q.category, mode }
  const attempts = [...p.attempts, attempt].slice(-4000)
  const day = dayKey(now)
  const activeDays = p.activeDays.includes(day) ? p.activeDays : [...p.activeDays, day]
  const xpGain = o.correct ? 10 + (q.difficulty - 1) * 3 : Math.round(o.score * 6) + 1

  return { ...p, qstates, topics, tags, mistakes, attempts, activeDays, xp: p.xp + xpGain, updatedAt: now }
}

export function streakDays(activeDays: string[], now = Date.now()): number {
  const set = new Set(activeDays)
  let n = 0
  let t = now
  if (!set.has(dayKey(t))) t -= DAY // jeszcze nie ćwiczył dziś - liczymy do wczoraj
  while (set.has(dayKey(t))) {
    n++
    t -= DAY
  }
  return n
}
