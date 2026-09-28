import type { ProgressData } from '../types'
import { UNESCO_SITES } from '../content/unesco'
import { streakDays } from './mastery'

/** Poziomy: każdy kolejny wymaga nieco więcej XP (ok. 25-40 pytań na poziom na starcie) */
export function levelFromXp(xp: number): { level: number; current: number; next: number; progress: number } {
  let level = 1
  let need = 300
  let acc = 0
  while (xp >= acc + need) {
    acc += need
    level++
    need = Math.round(need * 1.18)
  }
  return { level, current: xp - acc, next: need, progress: (xp - acc) / need }
}

export const LEVEL_TITLES = ['Anfänger', 'Entdecker', 'Leser', 'Sprachprofi', 'Grammatik-Ninja', 'Wortakrobat', 'Kulturkenner', 'Welterbe-Experte', 'Finalist-Anwärter', 'Laureat-Anwärter', 'Deutsch-Meister']
export const levelTitle = (l: number) => LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, l - 1)]

export interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  test: (p: ProgressData) => boolean
}

const answered = (p: ProgressData) => p.attempts.length
const coreUnesco = UNESCO_SITES.filter((s) => s.core).map((s) => `un-s2l-${s.id}`)

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', title: 'Pierwszy krok', desc: 'Pierwsza odpowiedź w aplikacji', icon: '🚀', test: (p) => answered(p) >= 1 },
  { id: 'q50', title: 'Rozgrzewka', desc: '50 rozwiązanych pytań', icon: '🔥', test: (p) => answered(p) >= 50 },
  { id: 'q250', title: 'Maratończyk', desc: '250 rozwiązanych pytań', icon: '🏃', test: (p) => answered(p) >= 250 },
  { id: 'q1000', title: 'Tysiącznik', desc: '1000 rozwiązanych pytań', icon: '🏔️', test: (p) => answered(p) >= 1000 },
  { id: 'streak3', title: 'Rytm', desc: '3 dni nauki z rzędu', icon: '📅', test: (p) => streakDays(p.activeDays) >= 3 },
  { id: 'streak7', title: 'Tydzień mocy', desc: '7 dni nauki z rzędu', icon: '⚡', test: (p) => streakDays(p.activeDays) >= 7 },
  { id: 'streak14', title: 'Nie do zatrzymania', desc: '14 dni nauki z rzędu', icon: '💎', test: (p) => streakDays(p.activeDays) >= 14 },
  { id: 'perfect', title: 'Seria 10', desc: '10 poprawnych odpowiedzi z rzędu', icon: '🎯', test: (p) => lastRun(p) >= 10 },
  { id: 'mock1', title: 'Próba generalna', desc: 'Pierwszy próbny konkurs', icon: '📝', test: (p) => p.exams.length >= 1 },
  { id: 'mock85', title: 'Próg rejonowy', desc: 'Próbny konkurs ≥ 85%', icon: '🥈', test: (p) => p.exams.some((e) => e.percent >= 85) },
  { id: 'mock90', title: 'Poziom laureata', desc: 'Próbny konkurs ≥ 90%', icon: '🏆', test: (p) => p.exams.some((e) => e.percent >= 90) },
  { id: 'fix10', title: 'Łowca błędów', desc: '10 naprawionych błędów', icon: '🛠️', test: (p) => Object.values(p.mistakes).filter((m) => m.resolved).length >= 10 },
  { id: 'lessons10', title: 'Teoretyk', desc: '10 przeczytanych lekcji', icon: '📚', test: (p) => Object.keys(p.lessonsRead).length >= 10 },
  { id: 'unesco', title: 'Welterbe-Kenner', desc: 'Wszystkie kluczowe obiekty UNESCO przypisane poprawnie do krajów', icon: '🏛️', test: (p) => coreUnesco.every((id) => (p.qstates[id]?.correct ?? 0) > 0) },
  { id: 'level5', title: 'Poziom 5', desc: 'Osiągnij 5. poziom', icon: '⭐', test: (p) => levelFromXp(p.xp).level >= 5 },
]

function lastRun(p: ProgressData): number {
  let best = 0
  let cur = 0
  for (const a of p.attempts.slice(-300)) {
    cur = a.correct ? cur + 1 : 0
    best = Math.max(best, cur)
  }
  return best
}

export function newlyUnlocked(p: ProgressData): string[] {
  return ACHIEVEMENTS.filter((a) => !p.achievements[a.id] && a.test(p)).map((a) => a.id)
}
