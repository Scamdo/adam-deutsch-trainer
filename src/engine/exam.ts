import { QUESTIONS } from '../content'
import { WRITING_TASKS, type WritingTask } from '../content/email'
import { LAND_NAMES, UNESCO_SITES } from '../content/unesco'
import type { InputQuestion, MatchQuestion, MCQuestion, Question, Stage, TrueFalseQuestion } from '../types'
import { pointsOf } from './check'
import { shuffle } from './session'

export interface ExamTask {
  no: number
  title: string
  instruction: string
  questions: Question[]
  points: number
}

export interface ExamDef {
  stage: Stage
  minutes: number
  tasks: ExamTask[]
  writing?: { task: WritingTask; no: number; points: number }
  maxPoints: number
  beta?: boolean
}

const byTag = (tag: string) => QUESTIONS.filter((q) => q.tags.includes(tag))
const one = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const take = <T,>(arr: T[], n: number): T[] => shuffle(arr).slice(0, n)

/** Wybiera n pytań, maksymalnie różnorodnych tematycznie */
function diverse(pool: Question[], n: number): Question[] {
  const out: Question[] = []
  const used = new Set<string>()
  for (const q of shuffle(pool)) {
    if (out.length >= n) break
    if (used.has(q.topic)) continue
    used.add(q.topic)
    out.push(q)
  }
  for (const q of shuffle(pool)) {
    if (out.length >= n) break
    if (!out.includes(q)) out.push(q)
  }
  return out
}

function trimTF(q: TrueFalseQuestion, n: number): TrueFalseQuestion {
  return { ...q, items: q.items.slice(0, n) }
}

function task(no: number, title: string, instruction: string, questions: Question[]): ExamTask {
  return { no, title, instruction, questions, points: questions.reduce((s, q) => s + pointsOf(q), 0) }
}

export function generateSzkolny(): ExamDef {
  const t1 = trimTF(one(byTag('exam-szk-t1')) as TrueFalseQuestion, 4)
  const t2 = one(byTag('exam-szk-t2'))
  const t3 = one(byTag('exam-szk-t3'))
  const t4 = take(QUESTIONS.filter((q) => q.type === 'reaction' && q.stage.includes('szkolny')), 3)
  const t5 = diverse(QUESTIONS.filter((q) => q.type === 'mc' && q.category === 'grammatik' && q.difficulty <= 2 && (q as MCQuestion).stem?.includes('___')), 5)
  const t6 = take(QUESTIONS.filter((q) => q.topic === 'antonyme'), 5)
  const t7 = one(byTag('exam-szk-t7'))
  const t8 = diverse(QUESTIONS.filter((q) => q.category === 'landeskunde' && q.type === 'mc'), 5)
  const tasks = [
    task(1, 'Zadanie 1 · Leseverstehen', 'Przeczytaj tekst. Zdecyduj, które zdania są zgodne z treścią tekstu (R), a które nie (F).', [t1]),
    task(2, 'Zadanie 2 · Leseverstehen', 'Przeczytaj tekst, z którego usunięto trzy zdania. Wstaw w luki właściwe zdania. Dwa zdania są zbędne.', [t2]),
    task(3, 'Zadanie 3 · Frage und Antwort', 'Dopasuj odpowiedzi do pytań. Dwie odpowiedzi są zbędne.', [t3]),
    task(4, 'Zadanie 4 · Sprachreaktionen', 'Przeczytaj opisy sytuacji. Wybierz właściwą reakcję.', t4),
    task(5, 'Zadanie 5 · Grammatik', 'Wybierz poprawne uzupełnienie luki.', t5),
    task(6, 'Zadanie 6 · Antonyme', 'Zastąp podkreślony wyraz antonimem. Wymagana pełna poprawność gramatyczna i ortograficzna.', t6),
    task(7, 'Zadanie 7 · Lückentext', 'Wybierz wyraz, który poprawnie uzupełnia lukę w tekście.', [t7]),
    task(8, 'Zadanie 8 · Landeskunde', 'Wybierz poprawną odpowiedź.', t8),
  ]
  const writing = { task: one(WRITING_TASKS), no: 9, points: 5 }
  return { stage: 'szkolny', minutes: 90, tasks, writing, maxPoints: tasks.reduce((s, t) => s + t.points, 0) + writing.points }
}

function unescoMatchTask(): MatchQuestion {
  const core = UNESCO_SITES.filter((s) => s.core && s.deutsch)
  const chosen = take(core, 6)
  const describe = (s: (typeof core)[number]) => {
    const nameTokens = s.name.toLowerCase().split(/[\s,.()-]+/).filter((t) => t.length > 3)
    const kws = s.keywords.filter((k) => !nameTokens.some((t) => k.toLowerCase().includes(t))).slice(0, 3)
    return `${s.lands.map((l) => LAND_NAMES[l]).join(' / ')} · seit ${s.year} · ${kws.join(', ')}`
  }
  return {
    id: 'exam-unesco-match',
    type: 'match',
    stage: ['rejonowy'],
    category: 'unesco',
    topic: 'unesco-objekte',
    difficulty: 3,
    prompt: 'Dopasuj opisy do obiektów UNESCO. Dwa opisy są zbędne.',
    explanation: 'Zadanie generowane z bazy obiektów UNESCO.',
    tags: ['exam-rej-t9'],
    source: 'Program 2026/27, etap rejonowy - UNESCO',
    pairs: chosen.slice(0, 4).map((s) => [s.name.replace(/ \(.+\)$/, ''), describe(s)] as [string, string]),
    extra: chosen.slice(4).map(describe),
  }
}

export function generateRejonowy(): ExamDef {
  const wordform = QUESTIONS.filter((q): q is InputQuestion => q.type === 'input' && (q.category === 'grammatik' || q.category === 'wortschatz') && /\(.+\)/.test(q.stem) && q.difficulty >= 2 && q.topic !== 'antonyme' && !q.tags.includes('buchstaben'))
  const verbTopics = ['perfekt', 'praeteritum', 'passiv', 'zeitformen', 'modalverben', 'konjunktiv2']
  const verbform = wordform.filter((q) => verbTopics.includes(q.topic))
  const otherForms = wordform.filter((q) => !verbTopics.includes(q.topic))
  const unescoOpen = QUESTIONS.filter((q) => q.category === 'unesco' && q.type === 'input')
  const tasks = [
    task(1, 'Zadanie 1 · Überschriften', 'Dopasuj nagłówki do tekstów. Dwa nagłówki są zbędne.', [one(byTag('exam-rej-t1'))]),
    task(2, 'Zadanie 2 · Richtig/Falsch', 'Przeczytaj tekst. Zdecyduj, które zdania są zgodne z treścią (R), a które nie (F).', [one(byTag('exam-rej-t2'))]),
    task(3, 'Zadanie 3 · Sprachreaktionen', 'Wybierz właściwą reakcję w każdej sytuacji.', take(QUESTIONS.filter((q) => q.type === 'reaction'), 6)),
    task(4, 'Zadanie 4 · Grammatik', 'Wybierz poprawne uzupełnienie luki.', diverse(QUESTIONS.filter((q) => q.type === 'mc' && q.category === 'grammatik' && q.difficulty >= 2), 5)),
    task(5, 'Zadanie 5 · Wortbank', 'Wstaw w luki wyrazy z ramki. Trzy wyrazy są zbędne.', [one(byTag('exam-rej-t5'))]),
    task(6, 'Zadanie 6 · Wortformen', 'Wpisz poprawną formę wyrazu podanego w nawiasie (pełna poprawność).', diverse(otherForms, 7)),
    task(7, 'Zadanie 7 · Verbformen', 'Wpisz poprawną formę czasownika (pełna poprawność).', diverse(verbform, 5)),
    task(8, 'Zadanie 8 · Rechtschreibung', 'Uzupełnij brakujące litery - wpisz całe słowa.', take(byTag('buchstaben'), 6)),
    task(9, 'Zadanie 9 · UNESCO', 'Dopasuj opisy do obiektów. Dwa opisy są zbędne.', [unescoMatchTask()]),
    task(10, 'Zadanie 10 · UNESCO - odpowiedzi otwarte', 'Odpowiedz krótko po niemiecku. Pisownia nazw własnych musi być w pełni poprawna.', take(unescoOpen, 8)),
  ]
  return { stage: 'rejonowy', minutes: 90, tasks, maxPoints: tasks.reduce((s, t) => s + t.points, 0) }
}

export function generateWojewodzki(): ExamDef {
  const audio = QUESTIONS.filter((q) => q.category === 'hoeren')
  const tasks = [
    task(1, 'Zadanie 1-2 · Hörverstehen', 'Wysłuchaj nagrań (każde możesz odtworzyć dwa razy) i odpowiedz na pytania.', take(audio, 2)),
    task(3, 'Zadanie 3-4 · Leseverstehen', 'Przeczytaj teksty i odpowiedz na pytania.', take(byTag('lesen-mc'), 2)),
    task(5, 'Zadanie 5 · Richtig/Falsch', 'Zdecyduj, które zdania są zgodne z treścią tekstu.', [one(byTag('exam-rej-t2'))]),
    task(6, 'Zadanie 6 · Präpositionen & Rektion', 'Uzupełnij luki.', diverse(QUESTIONS.filter((q) => q.type === 'input' && ['verben-praepositionen', 'relativsaetze', 'wechselpraepositionen', 'kasus'].includes(q.topic)), 5)),
    task(7, 'Zadanie 7 · Transformationen', 'Przekształć zdania, zachowując ich sens.', take(QUESTIONS.filter((q) => q.type === 'transform'), 4)),
    task(8, 'Zadanie 8 · Landeskunde', 'Wybierz poprawną odpowiedź.', diverse(QUESTIONS.filter((q) => q.category === 'landeskunde' && q.type === 'mc' && q.difficulty === 3), 4)),
    task(9, 'Zadanie 9 · Naturdenkmale', 'Wybierz poprawną odpowiedź.', take(QUESTIONS.filter((q) => q.category === 'natur' && q.type === 'mc'), 6)),
  ]
  return { stage: 'wojewodzki', minutes: 90, tasks, maxPoints: tasks.reduce((s, t) => s + t.points, 0), beta: true }
}

export function generateExam(stage: Stage): ExamDef {
  if (stage === 'szkolny') return generateSzkolny()
  if (stage === 'rejonowy') return generateRejonowy()
  return generateWojewodzki()
}
