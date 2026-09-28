// ===== Model domeny =====

export type Stage = 'szkolny' | 'rejonowy' | 'wojewodzki'

export type CategoryId =
  | 'grammatik'
  | 'wortschatz'
  | 'lesen'
  | 'reaktionen'
  | 'schreiben'
  | 'landeskunde'
  | 'unesco'
  | 'natur'
  | 'hoeren'

export type Difficulty = 1 | 2 | 3

export type QType =
  | 'mc' // A/B/C/D - jedna odpowiedź
  | 'multi' // wybór wielu odpowiedzi
  | 'input' // wpisywanie odpowiedzi
  | 'gap' // tekst z lukami do wpisania
  | 'match' // dopasowanie
  | 'order' // układanie kolejności
  | 'reaction' // reakcja językowa (A/B/C w sytuacji)
  | 'transform' // transformacja zdania
  | 'reading' // czytanie ze zrozumieniem (tekst + podpunkty)
  | 'wordbank' // luki + bank słów (zadanie leksykalno-gramatyczne)
  | 'truefalse' // richtig / falsch

interface QBase {
  id: string
  type: QType
  stage: Stage[]
  category: CategoryId
  topic: string // id tematu z curriculum
  difficulty: Difficulty
  /** Polecenie (krótko, PL lub DE - jak w arkuszu) */
  prompt: string
  explanation: string
  tags: string[]
  /** Źródło zakresu - odniesienie do programu 2026/27 lub typu zadania z arkuszy */
  source: string
  /** Pytania z mapą/obrazem itp. */
  media?: { kind: 'site'; siteId: string }
}

export interface MCQuestion extends QBase {
  type: 'mc' | 'reaction'
  stem?: string // zdanie z luką "___" lub sytuacja
  options: string[]
  answer: number
}

export interface MultiQuestion extends QBase {
  type: 'multi'
  stem?: string
  options: string[]
  answers: number[]
}

export interface InputQuestion extends QBase {
  type: 'input' | 'transform'
  stem: string
  /** Akceptowane odpowiedzi - pierwsza to wzorcowa */
  accept: string[]
  /** Domyślnie true: wielkość liter ma znaczenie (jak na konkursie) */
  caseSensitive?: boolean
  hint?: string
}

export interface GapQuestion extends QBase {
  type: 'gap'
  /** Tekst z lukami oznaczonymi {0}, {1}... */
  text: string
  blanks: string[][]
  hint?: string
}

export interface MatchQuestion extends QBase {
  type: 'match'
  pairs: [string, string][]
  /** Dodatkowe odpowiedzi-pułapki po prawej stronie */
  extra?: string[]
}

export interface OrderQuestion extends QBase {
  type: 'order'
  /** Poprawna kolejność */
  items: string[]
  /** Alternatywne poprawne kolejności */
  alt?: string[][]
}

export interface TFItem {
  statement: string
  answer: boolean
}

export interface TrueFalseQuestion extends QBase {
  type: 'truefalse'
  stem?: string
  items: TFItem[]
}

export interface ReadingSubItem {
  q: string
  options: string[]
  answer: number
}

export interface ReadingQuestion extends QBase {
  type: 'reading'
  title?: string
  passage: string
  items: ReadingSubItem[]
}

export interface WordbankQuestion extends QBase {
  type: 'wordbank'
  text: string // luki {0}..{n}
  bank: string[]
  answers: number[] // indeks w bank dla każdej luki
}

export type Question =
  | MCQuestion
  | MultiQuestion
  | InputQuestion
  | GapQuestion
  | MatchQuestion
  | OrderQuestion
  | TrueFalseQuestion
  | ReadingQuestion
  | WordbankQuestion

/** Odpowiedź ucznia - format zależny od typu */
export type AnswerValue =
  | { kind: 'index'; value: number }
  | { kind: 'indices'; value: number[] }
  | { kind: 'text'; value: string }
  | { kind: 'texts'; value: string[] }
  | { kind: 'map'; value: (number | null)[] } // dopasowanie / wordbank / reading / tf (indeks lub 1/0)
  | { kind: 'order'; value: number[] }

export interface CheckResult {
  correct: boolean
  score: number // 0..1
  /** Poprawność poszczególnych części (luki, podpunkty) */
  parts?: boolean[]
  givenText: string
  expectedText: string
}

// ===== Curriculum =====

export interface Lesson {
  intro: string // krótkie wyjaśnienie PL (markdown-lite)
  rules?: { title: string; body: string }[]
  examples: { de: string; pl?: string }[]
  pitfalls: string[]
  wrongRight: { wrong: string; right: string; why: string }[]
  table?: { head: string[]; rows: string[][] }
}

export interface Topic {
  id: string
  category: CategoryId
  title: string
  titlePl: string
  stages: Stage[]
  priority: 1 | 2 | 3 // 1 = kluczowe na konkursie
  evidence: string // dlaczego jest w curriculum (arkusze/program)
  lesson?: Lesson
}

// ===== Postęp / persistence =====

export interface QState {
  n: number
  correct: number
  streak: number
  lapses: number
  interval: number // dni
  due: number // timestamp ms
  lastAt: number
  lastCorrect: boolean
}

export interface TopicState {
  attempts: number
  correct: number
  ewma: number
  lastAt: number
  manualMastered?: boolean
}

export interface Mistake {
  qid: string
  count: number
  firstAt: number
  lastAt: number
  lastGiven: string
  expected: string
  resolved: boolean
  fixStreak: number
  flagged?: boolean
}

export interface AttemptLog {
  qid: string
  at: number
  correct: boolean
  score: number
  topic: string
  category: CategoryId
  mode: 'learn' | 'train' | 'review' | 'mistakes' | 'exam' | 'unesco' | 'landeskunde'
}

export interface StudySession {
  id: string
  startedAt: number
  endedAt: number
  activeSec: number
  mode: AttemptLog['mode']
  questions: number
  correct: number
  xp: number
  label: string
}

export interface ExamItemResult {
  qid: string
  task: number
  points: number
  max: number
  given: string
  expected: string
  category: CategoryId
  topic: string
}

export interface ExamRecord {
  id: string
  stage: Stage
  startedAt: number
  finishedAt: number
  durationSec: number
  points: number
  max: number
  percent: number
  byCategory: Record<string, { points: number; max: number }>
  items: ExamItemResult[]
}

export interface Profile {
  name: string
  createdAt: number
  dailyGoal: number // pytań dziennie
  theme: 'system' | 'light' | 'dark'
  targetStage: Stage
}

export interface ProgressData {
  version: number
  profile: Profile
  xp: number
  qstates: Record<string, QState>
  topics: Record<string, TopicState>
  tags: Record<string, TopicState>
  mistakes: Record<string, Mistake>
  flagged: string[]
  attempts: AttemptLog[]
  sessions: StudySession[]
  exams: ExamRecord[]
  achievements: Record<string, number> // id -> timestamp odblokowania
  activeDays: string[] // YYYY-MM-DD
  lessonsRead: Record<string, number>
  updatedAt: number
}

export type MasteryStatus = 'new' | 'learning' | 'weak' | 'good' | 'mastered'
