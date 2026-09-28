import type { Question } from '../types'
import { GRAMMAR_QUESTIONS } from './questions/grammar'
import { VOCAB_QUESTIONS } from './questions/vocab'
import { REACTION_QUESTIONS } from './questions/reactions'
import { READING_QUESTIONS } from './questions/reading'
import { LANDESKUNDE_QUESTIONS } from './questions/landeskunde'
import { UNESCO_QUESTIONS } from './questions/unesco'
import { HOEREN_QUESTIONS, NATUR_QUESTIONS } from './questions/natur-hoeren'
import { TOPIC_BY_ID } from './topics'

/** Rejestr wszystkich pytań. Nowe pakiety pytań wystarczy dopisać do tej tablicy. */
export const QUESTIONS: Question[] = [
  ...GRAMMAR_QUESTIONS,
  ...VOCAB_QUESTIONS,
  ...REACTION_QUESTIONS,
  ...READING_QUESTIONS,
  ...LANDESKUNDE_QUESTIONS,
  ...UNESCO_QUESTIONS,
  ...NATUR_QUESTIONS,
  ...HOEREN_QUESTIONS,
]

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]))

/** Walidacja integralności banku pytań (uruchamiana w testach i w trybie dev) */
export function validateQuestions(list: Question[] = QUESTIONS): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const q of list) {
    if (ids.has(q.id)) errors.push(`Duplikat id: ${q.id}`)
    ids.add(q.id)
    if (!TOPIC_BY_ID[q.topic]) errors.push(`${q.id}: nieznany temat ${q.topic}`)
    if (!q.explanation) errors.push(`${q.id}: brak wyjaśnienia`)
    switch (q.type) {
      case 'mc':
      case 'reaction':
        if (q.answer < 0 || q.answer >= q.options.length) errors.push(`${q.id}: zły indeks odpowiedzi`)
        if (new Set(q.options).size !== q.options.length) errors.push(`${q.id}: powtórzone opcje`)
        break
      case 'multi':
        if (!q.answers.length || q.answers.some((a) => a >= q.options.length)) errors.push(`${q.id}: złe odpowiedzi multi`)
        break
      case 'input':
      case 'transform':
        if (!q.accept.length) errors.push(`${q.id}: brak akceptowanych odpowiedzi`)
        break
      case 'gap': {
        const n = (q.text.match(/\{\d+\}/g) ?? []).length
        if (n !== q.blanks.length) errors.push(`${q.id}: liczba luk ${n} ≠ ${q.blanks.length}`)
        break
      }
      case 'wordbank': {
        const n = (q.text.match(/\{\d+\}/g) ?? []).length
        if (n !== q.answers.length) errors.push(`${q.id}: liczba luk ${n} ≠ ${q.answers.length}`)
        if (q.answers.some((a) => a >= q.bank.length)) errors.push(`${q.id}: indeks poza bankiem`)
        break
      }
      case 'reading':
        q.items.forEach((it, i) => {
          if (it.answer >= it.options.length) errors.push(`${q.id}: podpunkt ${i} zły indeks`)
        })
        break
      case 'match':
        if (new Set(q.pairs.map((p) => p[1]).concat(q.extra ?? [])).size !== q.pairs.length + (q.extra?.length ?? 0))
          errors.push(`${q.id}: powtórzone odpowiedzi w dopasowaniu`)
        break
      default:
        break
    }
  }
  return errors
}

export function questionsForTopic(topicId: string): Question[] {
  return QUESTIONS.filter((q) => q.topic === topicId)
}
