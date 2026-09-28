import type { CategoryId, Stage } from '../types'

export interface CategoryMeta {
  id: CategoryId
  name: string
  namePl: string
  short: string
  color: string // klasa tailwind dla akcentu
  hex: string
  stages: Stage[]
  description: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'grammatik',
    name: 'Grammatik',
    namePl: 'Gramatyka',
    short: 'GR',
    color: 'text-indigo-500',
    hex: '#6366f1',
    stages: ['szkolny', 'rejonowy', 'wojewodzki'],
    description: 'Końcówki, rekcja, szyk, czasy, strona bierna - tu konkurs odsiewa najwięcej.',
  },
  {
    id: 'wortschatz',
    name: 'Wortschatz',
    namePl: 'Słownictwo',
    short: 'WS',
    color: 'text-sky-500',
    hex: '#0ea5e9',
    stages: ['szkolny', 'rejonowy', 'wojewodzki'],
    description: 'Antonimy, słowotwórstwo, kolokacje, pisownia - wpisywane z pełną poprawnością.',
  },
  {
    id: 'lesen',
    name: 'Leseverstehen',
    namePl: 'Czytanie',
    short: 'LV',
    color: 'text-teal-500',
    hex: '#14b8a6',
    stages: ['szkolny', 'rejonowy', 'wojewodzki'],
    description: 'Prawda/fałsz, luki zdaniowe, nagłówki, spójność tekstu.',
  },
  {
    id: 'reaktionen',
    name: 'Sprachreaktionen',
    namePl: 'Reakcje językowe',
    short: 'SR',
    color: 'text-violet-500',
    hex: '#8b5cf6',
    stages: ['szkolny', 'rejonowy'],
    description: 'Co powiedzieć w danej sytuacji - rejestr (du/Sie), uprzejmość, idiomatyka.',
  },
  {
    id: 'schreiben',
    name: 'E-Mail',
    namePl: 'Wypowiedź pisemna',
    short: 'EM',
    color: 'text-pink-500',
    hex: '#ec4899',
    stages: ['szkolny'],
    description: 'E-mail / wpis na blogu: 3 punkty treści + poprawność (maks. 5 błędów).',
  },
  {
    id: 'landeskunde',
    name: 'Landeskunde',
    namePl: 'Realioznawstwo D-A-CH',
    short: 'LK',
    color: 'text-amber-500',
    hex: '#f59e0b',
    stages: ['szkolny', 'rejonowy', 'wojewodzki'],
    description: 'Niemcy, Austria, Szwajcaria: geografia, historia, kultura, postacie.',
  },
  {
    id: 'unesco',
    name: 'UNESCO',
    namePl: 'UNESCO w Niemczech',
    short: 'UN',
    color: 'text-emerald-500',
    hex: '#10b981',
    stages: ['rejonowy'],
    description: 'Temat etapu rejonowego 2026/27: obiekty światowego dziedzictwa w Niemczech.',
  },
  {
    id: 'natur',
    name: 'Naturdenkmale',
    namePl: 'Pomniki przyrody',
    short: 'ND',
    color: 'text-lime-600',
    hex: '#65a30d',
    stages: ['wojewodzki'],
    description: 'Temat etapu wojewódzkiego 2026/27: pomniki przyrody i parki narodowe Niemiec.',
  },
  {
    id: 'hoeren',
    name: 'Hörverstehen',
    namePl: 'Słuchanie',
    short: 'HV',
    color: 'text-orange-500',
    hex: '#f97316',
    stages: ['wojewodzki'],
    description: 'Tylko etap wojewódzki. Teksty czytane przez syntezator mowy przeglądarki.',
  },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryMeta>

export const STAGE_LABEL: Record<Stage, string> = {
  szkolny: 'Etap szkolny',
  rejonowy: 'Etap rejonowy',
  wojewodzki: 'Etap wojewódzki',
}

/** Oficjalny harmonogram 2026/27 (załączniki 11-13 do regulaminu) */
export const STAGE_DATES: Record<Stage, string> = {
  szkolny: '2026-10-05T09:00:00+02:00',
  rejonowy: '2026-11-30T11:00:00+01:00',
  wojewodzki: '2027-03-01T11:00:00+01:00',
}

export const STAGE_FORMAT: Record<Stage, { minutes: number; points: number; tasks: number; threshold: string }> = {
  szkolny: { minutes: 90, points: 40, tasks: 9, threshold: 'Awans: 5% najlepszych spośród uczestników z wynikiem > 20%' },
  rejonowy: { minutes: 90, points: 60, tasks: 10, threshold: 'Awans: min. 85% punktów (lub najlepsze 25% uczestników)' },
  wojewodzki: { minutes: 90, points: 60, tasks: 12, threshold: 'Laureat: min. 90% · Finalista: min. 40%' },
}
