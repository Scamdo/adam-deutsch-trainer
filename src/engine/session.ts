import { QUESTIONS } from '../content'
import type { CategoryId, ProgressData, Question, Stage } from '../types'

export interface SessionFilter {
  categories?: CategoryId[]
  topics?: string[]
  stage?: Stage
  onlyIds?: string[]
  excludeTypes?: Question['type'][]
}

export type SessionMode = 'adaptive' | 'mistakes' | 'review' | 'new' | 'topic'

/**
 * Adaptacyjny dobór pytań. Każde pytanie dostaje priorytet:
 *  +100 błąd nierozwiązany i „due”  ·  +60 pytanie zaległe (SRS due)
 *  +50×(1-wynik tematu) słabe tematy ·  +30×(1-wynik tagu) słabe pod-umiejętności (np. Relativpronomen im Dativ)
 *  +25 nowe pytanie                  ·  −40 pewne (streak ≥ 3, jeszcze nie due)
 *  +10 trudność dopasowana do poziomu tematu · losowy szum 0-12 (różnorodność)
 * Następnie wybór z limitem pytań na temat, żeby sesja była urozmaicona.
 */
export function buildSession(p: ProgressData, count: number, filter: SessionFilter = {}, mode: SessionMode = 'adaptive', now = Date.now()): Question[] {
  let pool = QUESTIONS.filter((q) => {
    if (filter.onlyIds && !filter.onlyIds.includes(q.id)) return false
    if (filter.categories && !filter.categories.includes(q.category)) return false
    if (filter.topics && !filter.topics.includes(q.topic)) return false
    if (filter.stage && !q.stage.includes(filter.stage)) return false
    if (filter.excludeTypes && filter.excludeTypes.includes(q.type)) return false
    return true
  })

  if (mode === 'mistakes') {
    pool = pool.filter((q) => {
      const m = p.mistakes[q.id]
      return m && (!m.resolved || m.flagged)
    })
  } else if (mode === 'review') {
    pool = pool.filter((q) => {
      const s = p.qstates[q.id]
      return (s && s.due <= now) || p.flagged.includes(q.id)
    })
  } else if (mode === 'new') {
    pool = pool.filter((q) => !p.qstates[q.id])
  }

  const scored = pool.map((q) => ({ q, s: priority(p, q, now) }))
  scored.sort((a, b) => b.s - a.s)

  const perTopicLimit = filter.topics?.length === 1 || mode === 'mistakes' || mode === 'review' ? count : Math.max(3, Math.ceil(count / 3))
  const perTopic: Record<string, number> = {}
  const out: Question[] = []
  for (const { q } of scored) {
    if (out.length >= count) break
    const n = perTopic[q.topic] ?? 0
    if (n >= perTopicLimit) continue
    perTopic[q.topic] = n + 1
    out.push(q)
  }
  // dopełnij, jeśli limit tematów był zbyt restrykcyjny
  if (out.length < count) {
    for (const { q } of scored) {
      if (out.length >= count) break
      if (!out.includes(q)) out.push(q)
    }
  }
  return shuffle(out)
}

export function priority(p: ProgressData, q: Question, now: number): number {
  let s = 0
  const st = p.qstates[q.id]
  const m = p.mistakes[q.id]
  if (m && !m.resolved) s += st && st.due > now ? 40 : 100
  if (p.flagged.includes(q.id)) s += 45
  if (st && st.due <= now && !m) s += 60
  if (!st) s += 25
  if (st && st.streak >= 3 && st.due > now) s -= 40
  const t = p.topics[q.topic]
  const tw = t ? t.ewma : 0.5
  s += 50 * (1 - tw)
  let tagWeak = 0
  for (const tag of q.tags) {
    const ts = p.tags[tag]
    if (ts && ts.attempts >= 2) tagWeak = Math.max(tagWeak, 1 - ts.ewma)
  }
  s += 30 * tagWeak
  if (tw > 0.8 && q.difficulty === 3) s += 10
  if (tw < 0.6 && q.difficulty === 1) s += 10
  s += Math.random() * 12
  return s
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function dueCount(p: ProgressData, now = Date.now()): number {
  const ids = new Set(QUESTIONS.map((q) => q.id))
  let n = 0
  for (const [id, s] of Object.entries(p.qstates)) if (ids.has(id) && s.due <= now) n++
  for (const id of p.flagged) if (!p.qstates[id] || p.qstates[id].due > now) n++
  return n
}

export function openMistakes(p: ProgressData): number {
  return Object.values(p.mistakes).filter((m) => !m.resolved || m.flagged).length
}
