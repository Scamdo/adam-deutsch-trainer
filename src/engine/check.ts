import type { AnswerValue, CheckResult, Question } from '../types'

export function normalize(s: string, caseSensitive = true): string {
  let t = s
    .replace(/[‘’‚′`´]/g, "'")
    .replace(/[“”„«»]/g, '"')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*([,.!?;:])\s*/g, '$1 ')
    .trim()
    .replace(/[.!?]+$/, '')
    .trim()
  if (!caseSensitive) t = t.toLowerCase()
  return t
}

export function textMatches(given: string, accept: string[], caseSensitive = true): { ok: boolean; caseOnly: boolean } {
  const g = normalize(given, caseSensitive)
  if (!g) return { ok: false, caseOnly: false }
  const ok = accept.some((a) => normalize(a, caseSensitive) === g)
  if (ok) return { ok: true, caseOnly: false }
  const caseOnly = caseSensitive && accept.some((a) => normalize(a, false) === normalize(given, false))
  return { ok: false, caseOnly }
}

const letter = (i: number) => String.fromCharCode(65 + i)

export function check(q: Question, v: AnswerValue): CheckResult & { note?: string } {
  switch (q.type) {
    case 'mc':
    case 'reaction': {
      const idx = v.kind === 'index' ? v.value : -1
      return {
        correct: idx === q.answer,
        score: idx === q.answer ? 1 : 0,
        givenText: idx >= 0 ? q.options[idx] : '—',
        expectedText: q.options[q.answer],
      }
    }
    case 'multi': {
      const sel = v.kind === 'indices' ? v.value : []
      const good = sel.filter((i) => q.answers.includes(i)).length
      const bad = sel.length - good
      const correct = good === q.answers.length && bad === 0
      return {
        correct,
        score: Math.max(0, (good - bad) / q.answers.length),
        givenText: sel.map((i) => q.options[i]).join(', ') || '—',
        expectedText: q.answers.map((i) => q.options[i]).join(', '),
      }
    }
    case 'input':
    case 'transform': {
      const given = v.kind === 'text' ? v.value : ''
      const m = textMatches(given, q.accept, q.caseSensitive ?? true)
      return {
        correct: m.ok,
        score: m.ok ? 1 : 0,
        givenText: given || '—',
        expectedText: q.accept[0],
        note: m.caseOnly ? 'Treść dobra, ale wielkość liter się nie zgadza - na konkursie to błąd.' : undefined,
      }
    }
    case 'gap': {
      const vals = v.kind === 'texts' ? v.value : []
      const parts = q.blanks.map((acc, i) => textMatches(vals[i] ?? '', acc).ok)
      const n = parts.filter(Boolean).length
      return {
        correct: n === parts.length,
        score: n / parts.length,
        parts,
        givenText: vals.map((x) => x || '—').join(' | '),
        expectedText: q.blanks.map((b) => b[0]).join(' | '),
      }
    }
    case 'match': {
      const vals = v.kind === 'map' ? v.value : []
      const rights = [...q.pairs.map((p) => p[1]), ...(q.extra ?? [])]
      const parts = q.pairs.map((_, i) => vals[i] === i)
      const n = parts.filter(Boolean).length
      return {
        correct: n === parts.length,
        score: n / parts.length,
        parts,
        givenText: q.pairs.map((p, i) => `${short(p[0])} → ${vals[i] != null ? short(rights[vals[i] as number]) : '—'}`).join('; '),
        expectedText: q.pairs.map((p) => `${short(p[0])} → ${short(p[1])}`).join('; '),
      }
    }
    case 'order': {
      const ord = v.kind === 'order' ? v.value : []
      const given = ord.map((i) => q.items[i]).join(' ')
      const variants = [q.items, ...(q.alt ?? [])].map((a) => a.join(' '))
      const correct = variants.includes(given)
      return { correct, score: correct ? 1 : 0, givenText: given || '—', expectedText: q.items.join(' ') }
    }
    case 'truefalse': {
      const vals = v.kind === 'map' ? v.value : []
      const parts = q.items.map((it, i) => vals[i] != null && (vals[i] === 1) === it.answer)
      const n = parts.filter(Boolean).length
      return {
        correct: n === parts.length,
        score: n / parts.length,
        parts,
        givenText: vals.map((x) => (x == null ? '—' : x === 1 ? 'R' : 'F')).join(' '),
        expectedText: q.items.map((it) => (it.answer ? 'R' : 'F')).join(' '),
      }
    }
    case 'reading': {
      const vals = v.kind === 'map' ? v.value : []
      const parts = q.items.map((it, i) => vals[i] === it.answer)
      const n = parts.filter(Boolean).length
      return {
        correct: n === parts.length,
        score: n / parts.length,
        parts,
        givenText: vals.map((x) => (x == null ? '—' : letter(x as number))).join(' '),
        expectedText: q.items.map((it) => letter(it.answer)).join(' '),
      }
    }
    case 'wordbank': {
      const vals = v.kind === 'map' ? v.value : []
      const parts = q.answers.map((a, i) => vals[i] === a)
      const n = parts.filter(Boolean).length
      return {
        correct: n === parts.length,
        score: n / parts.length,
        parts,
        givenText: vals.map((x) => (x == null ? '—' : short(q.bank[x as number]))).join(' | '),
        expectedText: q.answers.map((a) => short(q.bank[a])).join(' | '),
      }
    }
  }
}

function short(s: string, n = 48) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

/** Liczba „punktów” pytania w próbnym konkursie (1 za każdą lukę/podpunkt) */
export function pointsOf(q: Question): number {
  switch (q.type) {
    case 'gap':
      return q.blanks.length
    case 'match':
      return q.pairs.length
    case 'truefalse':
      return q.items.length
    case 'reading':
      return q.items.length
    case 'wordbank':
      return q.answers.length
    default:
      return 1
  }
}

export function isAnswered(q: Question, v: AnswerValue | undefined): boolean {
  if (!v) return false
  switch (v.kind) {
    case 'index':
      return v.value >= 0
    case 'indices':
      return v.value.length > 0
    case 'text':
      return v.value.trim().length > 0
    case 'texts':
      return v.value.some((x) => x.trim())
    case 'map':
      return v.value.some((x) => x != null)
    case 'order':
      return q.type === 'order' ? v.value.length === q.items.length : v.value.length > 0
  }
}
