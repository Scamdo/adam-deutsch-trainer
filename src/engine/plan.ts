import { STAGE_DATES } from '../content/categories'
import { TOPICS, TOPIC_BY_ID } from '../content/topics'
import { QUESTIONS } from '../content'
import type { CategoryId, MasteryStatus, ProgressData, Stage } from '../types'
import { dayKey, topicPercent, topicStatus } from './mastery'
import { dueCount, openMistakes } from './session'

const DAY = 86_400_000

/** Wagi kategorii = udział punktów w arkuszach danego etapu (analiza arkuszy 2022-2026) */
export const STAGE_WEIGHTS: Record<Stage, Partial<Record<CategoryId, number>>> = {
  szkolny: { lesen: 0.3, wortschatz: 0.22, grammatik: 0.2, landeskunde: 0.125, schreiben: 0.125, reaktionen: 0.075 },
  rejonowy: { grammatik: 0.28, wortschatz: 0.22, lesen: 0.2, unesco: 0.2, reaktionen: 0.1 },
  wojewodzki: { lesen: 0.33, grammatik: 0.25, hoeren: 0.17, natur: 0.13, landeskunde: 0.12 },
}

export function currentStage(now = Date.now()): Stage {
  if (now < new Date(STAGE_DATES.szkolny).getTime() + DAY) return 'szkolny'
  if (now < new Date(STAGE_DATES.rejonowy).getTime() + DAY) return 'rejonowy'
  return 'wojewodzki'
}

/** Liczba dni kalendarzowych do etapu (dziś = 0) */
export function daysUntil(stage: Stage, now = Date.now()): number {
  const t = new Date(STAGE_DATES[stage])
  const a = new Date(now)
  return Math.round((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY)
}

export function categoryPercent(p: ProgressData, cat: CategoryId, stage?: Stage): number {
  const topics = TOPICS.filter((t) => t.category === cat && (!stage || t.stages.includes(stage)))
  if (!topics.length) return 0
  let w = 0
  let s = 0
  for (const t of topics) {
    const weight = t.priority === 1 ? 3 : t.priority === 2 ? 2 : 1
    w += weight
    s += weight * topicPercent(p.topics[t.id])
  }
  return Math.round(s / w)
}

/** Procent przygotowania do etapu: 75% pokrycie/mastery + 25% najlepszy próbny konkurs */
export function readiness(p: ProgressData, stage: Stage): number {
  const weights = STAGE_WEIGHTS[stage]
  let cov = 0
  let sum = 0
  for (const [cat, w] of Object.entries(weights)) {
    // e-mail nie ma banku pytań - bierzemy wynik z próbnych konkursów
    const pc = cat === 'schreiben' ? writingPercent(p) : categoryPercent(p, cat as CategoryId, stage)
    cov += (w as number) * pc
    sum += w as number
  }
  cov = cov / sum
  const mocks = p.exams.filter((e) => e.stage === stage)
  const bestMock = mocks.length ? Math.max(...mocks.map((e) => e.percent)) : null
  return Math.round(bestMock == null ? cov * 0.85 : cov * 0.75 + bestMock * 0.25)
}

function writingPercent(p: ProgressData): number {
  const items = p.exams.flatMap((e) => e.items.filter((i) => i.category === 'schreiben'))
  if (!items.length) return 0
  const last = items.slice(-3)
  return Math.round((last.reduce((s, i) => s + i.points, 0) / last.reduce((s, i) => s + i.max, 0)) * 100)
}

export interface WeakArea {
  id: string
  label: string
  percent: number
  status: MasteryStatus
  kind: 'topic' | 'tag'
  topicId: string
  due: number
}

const TAG_LABELS: Record<string, string> = {
  'rel-dat': 'Relativpronomen im Dativ',
  'rel-gen': 'Relativpronomen im Genitiv (dessen/deren)',
  'rel-praep': 'Relativsatz mit Präposition',
  'dat-pl': 'Dativ Plural (-n)',
  'n-dekl': 'n-Deklination',
  'adj-stark': 'Adjektiv: starke Deklination',
  'adj-schwach': 'Adjektiv: schwache Deklination',
  'adj-gemischt': 'Adjektiv nach ein/kein',
  'sein-haben': 'Perfekt: sein oder haben',
  'partizip-stark': 'Partizip II starker Verben',
  'obwohl-trotzdem': 'obwohl vs. trotzdem',
  'denn-weil': 'denn vs. weil',
  'als-wenn': 'als vs. wenn',
  'passiv-perfekt': 'Passiv Perfekt (worden)',
  'passiv-praet': 'Passiv Präteritum',
  'wo-plus': 'Wo(r)- + Präposition',
  'reflexiv-dat': 'Reflexivpronomen im Dativ',
  'site-land': 'UNESCO: Objekt → Bundesland',
  'site-year': 'UNESCO: Jahr der Aufnahme',
  'hauptstaedte': 'Landeshauptstädte',
  buchstaben: 'Rechtschreibung (Buchstaben ergänzen)',
  'antonym-adj': 'Antonyme: Adjektive mit Endung',
  'nicht-muessen': 'nicht müssen vs. nicht dürfen',
}

export function weakAreas(p: ProgressData, limit = 6): WeakArea[] {
  const out: WeakArea[] = []
  for (const t of TOPICS) {
    const st = p.topics[t.id]
    if (!st || st.attempts < 3) continue
    out.push({ id: t.id, label: t.title, percent: Math.round(st.ewma * 100), status: topicStatus(st), kind: 'topic', topicId: t.id, due: dueForTopic(p, t.id) })
  }
  for (const [tag, st] of Object.entries(p.tags)) {
    if (!TAG_LABELS[tag] || st.attempts < 3) continue
    const q = QUESTIONS.find((x) => x.tags.includes(tag))
    if (!q) continue
    out.push({ id: 'tag:' + tag, label: TAG_LABELS[tag], percent: Math.round(st.ewma * 100), status: topicStatus(st), kind: 'tag', topicId: q.topic, due: 0 })
  }
  return out.filter((w) => w.percent < 80).sort((a, b) => a.percent - b.percent).slice(0, limit)
}

export function strongAreas(p: ProgressData, limit = 5): WeakArea[] {
  return TOPICS.filter((t) => (p.topics[t.id]?.attempts ?? 0) >= 4)
    .map((t) => ({ id: t.id, label: t.title, percent: Math.round(p.topics[t.id].ewma * 100), status: topicStatus(p.topics[t.id]), kind: 'topic' as const, topicId: t.id, due: 0 }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit)
}

function dueForTopic(p: ProgressData, topicId: string, now = Date.now()): number {
  return QUESTIONS.filter((q) => q.topic === topicId && p.qstates[q.id] && p.qstates[q.id].due <= now).length
}

export interface Recommendation {
  title: string
  reason: string
  to: string
  cta: string
  tone: 'urgent' | 'focus' | 'normal'
}

export function recommend(p: ProgressData, now = Date.now()): Recommendation {
  const stage = currentStage(now)
  const days = daysUntil(stage, now)
  const mistakes = openMistakes(p)
  const due = dueCount(p, now)
  const weak = weakAreas(p, 1)[0]
  const mockThisWeek = p.exams.some((e) => e.stage === stage && now - e.finishedAt < 6 * DAY)

  if (p.attempts.length === 0) {
    return { title: 'Test startowy', reason: 'Zacznij od krótkiej sesji mieszanej - system rozpozna Twoje mocne i słabe strony.', to: '/trening?mode=adaptive&n=15', cta: 'Rozpocznij (15 pytań)', tone: 'focus' }
  }
  if (days <= 3 && days >= 0 && !p.exams.some((e) => e.stage === stage && now - e.finishedAt < 2 * DAY)) {
    return { title: `Próbny ${stage === 'szkolny' ? 'etap szkolny' : stage === 'rejonowy' ? 'etap rejonowy' : 'etap wojewódzki'}`, reason: `Do konkursu zostały ${days} dni. Zrób pełną symulację 90 minut w warunkach egzaminu.`, to: `/konkurs?stage=${stage}`, cta: 'Start symulacji', tone: 'urgent' }
  }
  if (mistakes >= 8) {
    return { title: 'Napraw swoje błędy', reason: `Masz ${mistakes} nierozwiązanych błędów. Każdy powtórzony błąd to realny punkt na konkursie.`, to: '/trening?mode=mistakes&n=12', cta: 'Trening z błędów', tone: 'urgent' }
  }
  if (weak && weak.percent < 60) {
    return { title: `Słaby obszar: ${weak.label}`, reason: `Wynik ${weak.percent}%. Przeczytaj krótką lekcję i zrób celowany trening.`, to: `/nauka/${weak.topicId}`, cta: 'Lekcja + trening', tone: 'focus' }
  }
  if (due >= 10) {
    return { title: 'Powtórki na dziś', reason: `${due} pytań czeka na powtórkę - teraz jest najlepszy moment, żeby utrwalić je na długo.`, to: '/trening?mode=review&n=15', cta: 'Zacznij powtórkę', tone: 'normal' }
  }
  if (!mockThisWeek && p.attempts.length > 60) {
    return { title: 'Cotygodniowy próbny konkurs', reason: 'W tym tygodniu nie było jeszcze symulacji - to najlepszy pomiar postępu.', to: `/konkurs?stage=${stage}`, cta: 'Próbny konkurs', tone: 'normal' }
  }
  const untouched = TOPICS.find((t) => t.priority === 1 && t.stages.includes(stage) && !(p.topics[t.id]?.attempts) && t.lesson)
  if (untouched) {
    return { title: `Nowy temat: ${untouched.title}`, reason: `${untouched.titlePl} - kluczowy temat konkursowy, jeszcze nie ćwiczony.`, to: `/nauka/${untouched.id}`, cta: 'Otwórz lekcję', tone: 'normal' }
  }
  if (stage === 'rejonowy') {
    return { title: 'UNESCO - trening mieszany', reason: 'Temat etapu rejonowego: 12 z 60 punktów. Utrwalaj obiekty, kraje związkowe i lata wpisu.', to: '/unesco?tab=trening', cta: 'Trening UNESCO', tone: 'normal' }
  }
  return { title: 'Trening adaptacyjny', reason: 'System dobierze pytania z obszarów, które najbardziej podniosą Twój wynik.', to: '/trening?mode=adaptive&n=15', cta: 'Trenuj 15 pytań', tone: 'normal' }
}

export interface DailyTask {
  id: string
  label: string
  detail: string
  to: string
  minutes: number
  done: boolean
  progress: number // 0..1
}

export function dailyPlan(p: ProgressData, now = Date.now()): DailyTask[] {
  const stage = currentStage(now)
  const today = dayKey(now)
  const todays = p.attempts.filter((a) => dayKey(a.at) === today)
  const goal = p.profile.dailyGoal
  const reviewDone = todays.filter((a) => a.mode === 'review' || a.mode === 'mistakes').length
  const due = dueCount(p, now) + openMistakes(p)
  const weak = weakAreas(p, 1)[0]
  const tasks: DailyTask[] = []

  tasks.push({ id: 'goal', label: `Cel dnia: ${goal} pytań`, detail: `${todays.length}/${goal} wykonanych`, to: '/trening?mode=adaptive&n=15', minutes: Math.round(goal * 0.6), done: todays.length >= goal, progress: Math.min(1, todays.length / goal) })
  if (due > 0 || reviewDone > 0) {
    const target = Math.min(15, due + reviewDone)
    tasks.push({ id: 'review', label: 'Powtórki i błędy', detail: `${Math.max(0, due)} czeka`, to: '/trening?mode=review&n=15', minutes: 8, done: reviewDone >= target && target > 0, progress: target ? Math.min(1, reviewDone / target) : 1 })
  }
  if (weak) {
    const doneWeak = todays.filter((a) => a.topic === weak.topicId).length
    tasks.push({ id: 'weak', label: `Słaby temat: ${weak.label}`, detail: `${weak.percent}% · cel: 8 pytań`, to: `/trening?mode=topic&topic=${weak.topicId}&n=8`, minutes: 7, done: doneWeak >= 8, progress: Math.min(1, doneWeak / 8) })
  }
  if (stage === 'szkolny') {
    const lk = todays.filter((a) => a.category === 'landeskunde').length
    tasks.push({ id: 'lk', label: 'Landeskunde D-A-CH', detail: 'cel: 8 pytań', to: '/trening?mode=adaptive&cat=landeskunde&n=8', minutes: 5, done: lk >= 8, progress: Math.min(1, lk / 8) })
  } else if (stage === 'rejonowy') {
    const un = todays.filter((a) => a.category === 'unesco').length
    tasks.push({ id: 'unesco', label: 'UNESCO Deutschland', detail: 'cel: 10 pytań', to: '/unesco?tab=trening', minutes: 7, done: un >= 10, progress: Math.min(1, un / 10) })
  } else {
    const nd = todays.filter((a) => a.category === 'natur' || a.category === 'hoeren').length
    tasks.push({ id: 'natur', label: 'Naturdenkmale + Hören', detail: 'cel: 8 pytań', to: '/trening?mode=adaptive&cat=natur,hoeren&n=8', minutes: 8, done: nd >= 8, progress: Math.min(1, nd / 8) })
  }
  return tasks
}

export interface PlanPhase {
  stage: Stage
  title: string
  from: string
  to: string
  goal: string
  focus: { label: string; topicIds?: string[]; to: string }[]
  weekly: string[]
}

export function planPhases(): PlanPhase[] {
  return [
    {
      stage: 'szkolny',
      title: 'Sprint: etap szkolny',
      from: '2026-09-29',
      to: '2026-10-05',
      goal: 'Wynik ≥ 36/40 (awans mają tylko najlepsze 5%). Zero straconych punktów na antonimach i e-mailu.',
      focus: [
        { label: 'Rekcja czasowników + Wo(r)-/Da(r)-', topicIds: ['verben-praepositionen', 'praepositionaladverbien'], to: '/nauka/verben-praepositionen' },
        { label: 'Antonimy z poprawną końcówką', topicIds: ['antonyme'], to: '/nauka/antonyme' },
        { label: 'Konnektoren, wenn/als, Reflexiv, Modalverben', topicIds: ['konnektoren', 'wenn-als-ob', 'reflexivverben', 'modalverben'], to: '/nauka/konnektoren' },
        { label: 'Landeskunde D-A-CH (podstawy)', to: '/landeskunde' },
        { label: 'E-mail: 3 rozwinięte punkty + XYZ', topicIds: ['email'], to: '/nauka/email' },
      ],
      weekly: ['Codziennie: 25 pytań + powtórki', '2× pełny próbny etap szkolny (np. czwartek i sobota)', '2 e-maile na czas (15 min) z porównaniem z wzorem', 'Dzień przed konkursem: tylko powtórka błędów + odpoczynek'],
    },
    {
      stage: 'rejonowy',
      title: 'Etap rejonowy: UNESCO + precyzja form',
      from: '2026-10-06',
      to: '2026-11-30',
      goal: 'Wynik ≥ 51/60 (próg 85%). Kluczowe: formy wyrazów i czasowników bez błędów, 12 pkt z UNESCO.',
      focus: [
        { label: 'UNESCO: 28 kluczowych obiektów (ok. 4 tygodniowo)', to: '/unesco' },
        { label: 'Formy wyrazów i czasowników (zero tolerancji)', topicIds: ['wortbildung', 'perfekt', 'praeteritum', 'passiv', 'adjektivdeklination'], to: '/nauka/wortbildung' },
        { label: 'Pisownia i uzupełnianie liter', topicIds: ['rechtschreibung'], to: '/nauka/rechtschreibung' },
        { label: 'Reakcje językowe - rejestr du/Sie', topicIds: ['reaktionen-alltag'], to: '/nauka/reaktionen-alltag' },
        { label: 'Stolice krajów związkowych DE/AT', to: '/landeskunde' },
      ],
      weekly: ['5 dni × 25 min: trening adaptacyjny + UNESCO', 'Co tydzień: 1 próbny etap rejonowy', 'Niedziela: przegląd „Moje błędy” i mapa UNESCO', 'Ostatni tydzień: 2 symulacje + fiszki UNESCO'],
    },
    {
      stage: 'wojewodzki',
      title: 'Etap wojewódzki: laureat',
      from: '2026-12-01',
      to: '2027-03-01',
      goal: 'Laureat ≥ 90%, finalista ≥ 40%. Dochodzi słuchanie, transformacje i Naturdenkmale.',
      focus: [
        { label: 'Hörverstehen (2 zadania, 10 pkt)', to: '/trening?mode=adaptive&cat=hoeren&n=3' },
        { label: 'Transformacje zdań i tłumaczenia fragmentów', topicIds: ['relativsaetze', 'infinitiv-zu', 'indirekte-fragen', 'temporal'], to: '/nauka/relativsaetze' },
        { label: 'Präposition + Artikel (bitten um die, abhängen vom)', topicIds: ['verben-praepositionen', 'wechselpraepositionen'], to: '/nauka/verben-praepositionen' },
        { label: 'Naturdenkmale & Nationalparks', to: '/unesco?tab=natur' },
      ],
      weekly: ['4 dni × 30 min treningu', 'Co tydzień: 1 tekst słuchany + 1 długi tekst czytany', 'Co 2 tygodnie: próbny etap wojewódzki (beta)', 'Niemieckie podcasty/wiadomości (np. Deutsche Welle „Langsam gesprochene Nachrichten”) 3× w tygodniu'],
    },
  ]
}

export function weeklyRecommendations(p: ProgressData): string[] {
  const stage = currentStage()
  const weak = weakAreas(p, 4)
  const recs = weak.map((w) => `${w.label} (${w.percent}%)`)
  const untouched = TOPICS.filter((t) => t.priority === 1 && t.stages.includes(stage) && !(p.topics[t.id]?.attempts)).slice(0, 3)
  for (const t of untouched) recs.push(`${t.title} - jeszcze nie ćwiczony`)
  if (!recs.length) recs.push('Utrzymuj formę: trening adaptacyjny + 1 próbny konkurs')
  return recs.slice(0, 6)
}

export const topicTitle = (id: string) => TOPIC_BY_ID[id]?.title ?? id
