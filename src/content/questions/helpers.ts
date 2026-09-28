import type {
  CategoryId,
  Difficulty,
  GapQuestion,
  InputQuestion,
  MatchQuestion,
  MCQuestion,
  MultiQuestion,
  OrderQuestion,
  ReadingQuestion,
  Stage,
  TrueFalseQuestion,
  WordbankQuestion,
} from '../../types'

export const SRC = {
  lexgram: 'Program 2026/27: rozpoznawanie i stosowanie struktur leksykalno-gramatycznych (wszystkie etapy)',
  reakcje: 'Program 2026/27: reagowanie językowe w sytuacjach dnia codziennego (etap szkolny i rejonowy)',
  czytanie: 'Program 2026/27: rozumienie tekstu pisanego (wszystkie etapy)',
  pisanie: 'Program 2026/27: tworzenie wypowiedzi pisemnej typu e-mail (etap szkolny)',
  lk: 'Program 2026/27: podstawowe/szerokie wiadomości z historii, geografii i kultury krajów niemieckojęzycznych',
  unesco: 'Program 2026/27, etap rejonowy: wybrane obiekty światowego dziedzictwa kulturowego UNESCO w Niemczech',
  natur: 'Program 2026/27, etap wojewódzki: wybrane pomniki przyrody (Naturdenkmale) w Niemczech',
  hoeren: 'Program 2026/27, etap wojewódzki: rozumienie ze słuchu',
}

const ALL: Stage[] = ['szkolny', 'rejonowy', 'wojewodzki']

interface Common {
  stage?: Stage[]
  tags?: string[]
  prompt?: string
  source?: string
  category?: CategoryId
  media?: { kind: 'site'; siteId: string }
}

export function mkFactory(defaults: { category: CategoryId; source: string; stage?: Stage[]; idPrefix: string }) {
  const base = (id: string, topic: string, difficulty: Difficulty, explanation: string, c: Common) => ({
    id: `${defaults.idPrefix}-${id}`,
    stage: c.stage ?? defaults.stage ?? ALL,
    category: c.category ?? defaults.category,
    topic,
    difficulty,
    explanation,
    tags: c.tags ?? [],
    source: c.source ?? defaults.source,
    ...(c.media ? { media: c.media } : {}),
  })

  return {
    mc(id: string, topic: string, d: Difficulty, stem: string, options: string[], answer: number, explanation: string, c: Common = {}): MCQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'mc', prompt: c.prompt ?? 'Wybierz poprawną odpowiedź.', stem, options, answer }
    },
    reaction(id: string, topic: string, d: Difficulty, situation: string, options: string[], answer: number, explanation: string, c: Common = {}): MCQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'reaction', prompt: c.prompt ?? 'Wybierz właściwą reakcję.', stem: situation, options, answer }
    },
    multi(id: string, topic: string, d: Difficulty, stem: string, options: string[], answers: number[], explanation: string, c: Common = {}): MultiQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'multi', prompt: c.prompt ?? 'Zaznacz WSZYSTKIE poprawne odpowiedzi.', stem, options, answers }
    },
    input(id: string, topic: string, d: Difficulty, stem: string, accept: string[], explanation: string, c: Common & { hint?: string; caseSensitive?: boolean } = {}): InputQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'input', prompt: c.prompt ?? 'Wpisz brakujący wyraz.', stem, accept, hint: c.hint, caseSensitive: c.caseSensitive }
    },
    transform(id: string, topic: string, d: Difficulty, stem: string, accept: string[], explanation: string, c: Common & { hint?: string } = {}): InputQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'transform', prompt: c.prompt ?? 'Przekształć zdanie tak, aby zachować jego sens.', stem, accept, hint: c.hint }
    },
    gap(id: string, topic: string, d: Difficulty, text: string, blanks: string[][], explanation: string, c: Common & { hint?: string } = {}): GapQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'gap', prompt: c.prompt ?? 'Uzupełnij luki.', text, blanks, hint: c.hint }
    },
    match(id: string, topic: string, d: Difficulty, pairs: [string, string][], explanation: string, c: Common & { extra?: string[] } = {}): MatchQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'match', prompt: c.prompt ?? 'Dopasuj elementy.', pairs, extra: c.extra }
    },
    order(id: string, topic: string, d: Difficulty, items: string[], explanation: string, c: Common & { alt?: string[][] } = {}): OrderQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'order', prompt: c.prompt ?? 'Ułóż wyrazy w poprawnej kolejności.', items, alt: c.alt }
    },
    tf(id: string, topic: string, d: Difficulty, stem: string, items: { statement: string; answer: boolean }[], explanation: string, c: Common = {}): TrueFalseQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'truefalse', prompt: c.prompt ?? 'Richtig oder falsch?', stem, items }
    },
    reading(id: string, topic: string, d: Difficulty, title: string, passage: string, items: ReadingQuestion['items'], explanation: string, c: Common = {}): ReadingQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'reading', prompt: c.prompt ?? 'Przeczytaj tekst i odpowiedz na pytania.', title, passage, items }
    },
    wordbank(id: string, topic: string, d: Difficulty, text: string, bank: string[], answers: number[], explanation: string, c: Common = {}): WordbankQuestion {
      return { ...base(id, topic, d, explanation, c), type: 'wordbank', prompt: c.prompt ?? 'Wstaw w luki wyrazy z ramki. Nie wszystkie pasują.', text, bank, answers }
    },
  }
}

export type GapQ = GapQuestion
