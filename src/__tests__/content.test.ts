import { describe, expect, it } from 'vitest'
import { QUESTIONS, validateQuestions } from '../content'
import { check } from '../engine/check'
import { generateRejonowy, generateSzkolny, generateWojewodzki } from '../engine/exam'
import { applyAnswer, nextQState, topicStatus } from '../engine/mastery'
import { emptyProgress } from '../storage/adapter'
import { buildSession } from '../engine/session'
import type { AnswerValue, Question } from '../types'

function correctAnswer(q: Question): AnswerValue {
  switch (q.type) {
    case 'mc':
    case 'reaction':
      return { kind: 'index', value: q.answer }
    case 'multi':
      return { kind: 'indices', value: q.answers }
    case 'input':
    case 'transform':
      return { kind: 'text', value: q.accept[0] }
    case 'gap':
      return { kind: 'texts', value: q.blanks.map((b) => b[0]) }
    case 'match':
      return { kind: 'map', value: q.pairs.map((_, i) => i) }
    case 'order':
      return { kind: 'order', value: q.items.map((_, i) => i) }
    case 'truefalse':
      return { kind: 'map', value: q.items.map((it) => (it.answer ? 1 : 0)) }
    case 'reading':
      return { kind: 'map', value: q.items.map((it) => it.answer) }
    case 'wordbank':
      return { kind: 'map', value: q.answers }
  }
}

describe('bank pytań', () => {
  it('ma co najmniej 200 pytań', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(200)
  })
  it('przechodzi walidację integralności', () => {
    expect(validateQuestions()).toEqual([])
  })
  it('wzorcowa odpowiedź każdego pytania jest oceniana jako poprawna', () => {
    const failing = QUESTIONS.filter((q) => !check(q, correctAnswer(q)).correct).map((q) => q.id)
    expect(failing).toEqual([])
  })
  it('obejmuje wszystkie typy pytań', () => {
    const types = new Set(QUESTIONS.map((q) => q.type))
    for (const t of ['mc', 'reaction', 'multi', 'input', 'transform', 'gap', 'match', 'order', 'truefalse', 'reading', 'wordbank']) expect(types.has(t as Question['type'])).toBe(true)
  })
})

describe('sprawdzanie odpowiedzi', () => {
  const q = QUESTIONS.find((x) => x.id === 'gr-rs10')!
  it('wielkość liter ma znaczenie, z komunikatem', () => {
    const r = check(q, { kind: 'text', value: 'Denen' })
    expect(r.correct).toBe(false)
    expect(r.note).toBeTruthy()
  })
  it('ignoruje spacje i kropkę końcową', () => {
    expect(check(q, { kind: 'text', value: '  denen. ' }).correct).toBe(true)
  })
})

describe('próbny konkurs', () => {
  it('etap szkolny = 40 pkt, 9 zadań', () => {
    for (let i = 0; i < 20; i++) {
      const e = generateSzkolny()
      expect(e.maxPoints).toBe(40)
      expect(e.tasks.length + (e.writing ? 1 : 0)).toBe(9)
    }
  })
  it('etap rejonowy = 60 pkt, 10 zadań', () => {
    for (let i = 0; i < 20; i++) {
      const e = generateRejonowy()
      expect(e.tasks.length).toBe(10)
      expect(e.maxPoints).toBe(60)
    }
  })
  it('etap wojewódzki generuje się', () => {
    expect(generateWojewodzki().maxPoints).toBeGreaterThan(30)
  })
})

describe('mastery i SRS', () => {
  it('interwały rosną przy poprawnych odpowiedziach i zerują się przy błędzie', () => {
    const now = Date.now()
    let s = nextQState(undefined, true, 2, now)
    expect(s.interval).toBe(1)
    s = nextQState(s, true, 2, now)
    expect(s.interval).toBe(3)
    s = nextQState(s, true, 2, now)
    expect(s.interval).toBeGreaterThan(3)
    s = nextQState(s, false, 2, now)
    expect(s.interval).toBe(0)
    expect(s.due - now).toBeLessThanOrEqual(10 * 60_000)
  })
  it('błędy trafiają do „Moich błędów” i są naprawiane po 2 poprawnych', () => {
    const q = QUESTIONS[0]
    let p = emptyProgress()
    p = applyAnswer(p, q, { correct: false, score: 0, given: 'x', expected: 'y' }, 'train')
    expect(p.mistakes[q.id].resolved).toBe(false)
    p = applyAnswer(p, q, { correct: true, score: 1, given: 'y', expected: 'y' }, 'train')
    p = applyAnswer(p, q, { correct: true, score: 1, given: 'y', expected: 'y' }, 'train')
    expect(p.mistakes[q.id].resolved).toBe(true)
  })
  it('status tematu zmienia się z wynikami', () => {
    let p = emptyProgress()
    const qs = QUESTIONS.filter((q) => q.topic === 'relativsaetze')
    for (const q of qs.slice(0, 5)) p = applyAnswer(p, q, { correct: false, score: 0, given: '', expected: '' }, 'train')
    expect(topicStatus(p.topics.relativsaetze)).toBe('weak')
  })
  it('sesja adaptacyjna preferuje słabe tematy', () => {
    let p = emptyProgress()
    const rel = QUESTIONS.filter((q) => q.topic === 'relativsaetze')
    for (const q of rel.slice(0, 6)) p = applyAnswer(p, q, { correct: false, score: 0, given: '', expected: '' }, 'train')
    const s = buildSession(p, 10, { categories: ['grammatik'] })
    expect(s.filter((q) => q.topic === 'relativsaetze').length).toBeGreaterThanOrEqual(3)
  })
})
