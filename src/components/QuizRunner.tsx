import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Bookmark, BookmarkCheck, Check, Flame, RotateCcw, Sparkles, Trophy, X } from 'lucide-react'
import type { AnswerValue, AttemptLog, CheckResult, Question } from '../types'
import { check, isAnswered } from '../engine/check'
import { useStore } from '../store/useStore'
import { CATEGORY_BY_ID } from '../content/categories'
import { TOPIC_BY_ID } from '../content/topics'
import { UNESCO_BY_ID, LAND_NAMES } from '../content/unesco'
import { QuestionView } from './QuestionView'
import { MapView } from './MapView'
import { Bar, cx, Md, Ring } from './ui'

interface Props {
  questions: Question[]
  mode: AttemptLog['mode']
  label: string
  onRestart?: () => void
}

interface Done {
  q: Question
  r: CheckResult & { note?: string }
}

export function useActiveTimer() {
  const active = useRef(0)
  const last = useRef(Date.now())
  useEffect(() => {
    const bump = () => (last.current = Date.now())
    const t = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - last.current < 90_000) active.current += 1
    }, 1000)
    window.addEventListener('pointerdown', bump)
    window.addEventListener('keydown', bump)
    return () => {
      clearInterval(t)
      window.removeEventListener('pointerdown', bump)
      window.removeEventListener('keydown', bump)
    }
  }, [])
  return active
}

export function QuizRunner({ questions, mode, label, onRestart }: Props) {
  const nav = useNavigate()
  const loc = useLocation()
  const inSession = /mode=|stage=/.test(loc.search)
  const answer = useStore((s) => s.answer)
  const addSession = useStore((s) => s.addSession)
  const toggleFlag = useStore((s) => s.toggleFlag)
  const flagged = useStore((s) => s.p.flagged)
  const xpNow = useStore((s) => s.p.xp)

  const [queue, setQueue] = useState<Question[]>(questions)
  const [idx, setIdx] = useState(0)
  const [value, setValue] = useState<AnswerValue | undefined>()
  const [result, setResult] = useState<(CheckResult & { note?: string }) | null>(null)
  const [done, setDone] = useState<Done[]>([])
  const [requeued, setRequeued] = useState<Set<string>>(new Set())
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const startXp = useRef(xpNow)
  const startedAt = useRef(Date.now())
  const timer = useActiveTimer()
  const saved = useRef(false)

  const q = queue[idx]
  const firstTry = useMemo(() => done.filter((d, i) => done.findIndex((x) => x.q.id === d.q.id) === i), [done])
  const correctFirst = firstTry.filter((d) => d.r.correct).length

  const save = useCallback(() => {
    if (saved.current || done.length === 0) return
    saved.current = true
    addSession({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      startedAt: startedAt.current,
      endedAt: Date.now(),
      activeSec: timer.current,
      mode,
      questions: firstTry.length,
      correct: correctFirst,
      xp: useStore.getState().p.xp - startXp.current,
      label,
    })
  }, [addSession, correctFirst, done.length, firstTry.length, label, mode, timer])

  useEffect(() => () => save(), [save])

  const submit = useCallback(() => {
    if (!q || result || !isAnswered(q, value)) return
    const r = check(q, value!)
    setResult(r)
    setDone((d) => [...d, { q, r }])
    setStreak((s) => (r.correct ? s + 1 : 0))
    answer(q, { correct: r.correct, score: r.score, given: r.givenText, expected: r.expectedText }, mode)
    if (!r.correct && !requeued.has(q.id) && queue.length - idx > 1) {
      setRequeued((s) => new Set(s).add(q.id))
      setQueue((qq) => {
        const pos = Math.min(qq.length, idx + 4)
        return [...qq.slice(0, pos), q, ...qq.slice(pos)]
      })
    }
  }, [q, result, value, answer, mode, requeued, queue.length, idx])

  const next = useCallback(() => {
    if (!result) return
    if (idx + 1 >= queue.length) {
      setFinished(true)
      save()
      return
    }
    setIdx((i) => i + 1)
    setValue(undefined)
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [result, idx, queue.length, save])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      if (result) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [result, next])

  if (!questions.length) return null

  if (finished) {
    const wrong = firstTry.filter((d) => !d.r.correct)
    const acc = Math.round((correctFirst / Math.max(1, firstTry.length)) * 100)
    const gained = xpNow - startXp.current
    return (
      <div className="mx-auto max-w-2xl animate-rise">
        <div className="card card-pad flex flex-col items-center gap-4 text-center sm:p-8">
          <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 p-3 text-white shadow-glow">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="label">{label}</div>
            <h2 className="h1 mt-1">{acc >= 90 ? 'Ausgezeichnet!' : acc >= 75 ? 'Sehr gut!' : acc >= 55 ? 'Gut gemacht!' : 'Weiter üben!'}</h2>
          </div>
          <Ring value={acc} size={128} stroke={11} color={acc >= 80 ? '#10b981' : acc >= 60 ? '#6366f1' : '#f43f5e'}>
            <span className="font-display text-3xl font-bold">{acc}%</span>
            <span className="text-xs muted">za 1. razem</span>
          </Ring>
          <div className="grid w-full grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
              <div className="font-display text-xl font-bold">{correctFirst}/{firstTry.length}</div>
              <div className="text-xs muted">poprawnie</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
              <div className="font-display text-xl font-bold text-amber-500">+{gained}</div>
              <div className="text-xs muted">XP</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]">
              <div className="font-display text-xl font-bold">{Math.max(1, Math.round(timer.current / 60))} min</div>
              <div className="text-xs muted">aktywnie</div>
            </div>
          </div>
          {wrong.length > 0 && (
            <div className="w-full text-left">
              <div className="label mb-2">Do powtórki ({wrong.length})</div>
              <div className="grid gap-2">
                {wrong.map((d) => (
                  <div key={d.q.id} className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-sm dark:border-rose-500/20 dark:bg-rose-500/5">
                    <div className="font-semibold">{shortPrompt(d.q)}</div>
                    <div className="mt-1 text-rose-700 dark:text-rose-300">Twoja: {d.r.givenText}</div>
                    <div className="text-emerald-700 dark:text-emerald-300">Poprawnie: {d.r.expectedText}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            {wrong.length > 0 && (
              <button className="btn-primary flex-1" onClick={() => nav('/trening?mode=mistakes&n=' + Math.min(15, wrong.length + 3))}>
                <RotateCcw className="h-4 w-4" /> Powtórz błędy
              </button>
            )}
            <button className="btn-secondary flex-1" onClick={() => (onRestart ? onRestart() : nav(0))}>
              <Sparkles className="h-4 w-4" /> Nowa sesja
            </button>
            <Link to="/" className="btn-ghost flex-1">Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  const cat = CATEGORY_BY_ID[q.category]
  const topic = TOPIC_BY_ID[q.topic]
  const isFlagged = flagged.includes(q.id)
  const site = q.media?.kind === 'site' ? UNESCO_BY_ID[q.media.siteId] : null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 pb-40">
      <div className="flex items-center gap-3">
        <button onClick={() => { save(); nav(-1) }} className="btn-ghost -ml-2 px-2" aria-label="Zakończ">
          <X className="h-5 w-5" />
        </button>
        <Bar value={(idx / queue.length) * 100} className="flex-1" height="h-2.5" />
        <div className="flex items-center gap-1 text-sm font-bold tabular-nums">
          {streak >= 3 && (
            <span className="mr-1 flex items-center gap-0.5 text-orange-500">
              <Flame className="h-4 w-4" />
              {streak}
            </span>
          )}
          {idx + 1}/{queue.length}
        </div>
      </div>

      <div key={q.id + idx} className="card card-pad animate-rise sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="chip" style={{ background: cat.hex + '1a', color: cat.hex }}>{cat.name}</span>
          <span className="chip-muted">{topic?.title}</span>
          <span className="ml-auto flex gap-0.5" title={`Poziom trudności ${q.difficulty}/3`}>
            {[1, 2, 3].map((d) => (
              <span key={d} className={cx('h-1.5 w-4 rounded-full', d <= q.difficulty ? 'bg-brand-500' : 'bg-slate-200 dark:bg-white/10')} />
            ))}
          </span>
        </div>
        <QuestionView q={q} value={value} onChange={setValue} revealed={!!result} result={result ?? undefined} seed={String(idx)} onEnter={submit} />
      </div>

      {/* Pasek akcji / feedback */}
      <div className={cx('fixed inset-x-0 z-30 px-3 lg:bottom-0 lg:left-64', inSession ? 'bottom-0' : 'bottom-[64px]')}>
        <div className="mx-auto max-w-2xl pb-3">
          {!result ? (
            <div className="card flex items-center gap-3 p-3 shadow-xl">
              <span className="hidden flex-1 text-xs muted sm:block">Enter = sprawdź{q.type === 'mc' || q.type === 'reaction' ? ' · 1-4 = wybór' : ''}</span>
              <button className="btn-primary w-full py-3 sm:w-auto sm:px-8" disabled={!isAnswered(q, value)} onClick={submit}>
                Sprawdź <Check className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className={cx('animate-pop overflow-hidden rounded-2xl border-2 shadow-xl', result.correct ? 'border-emerald-500 bg-emerald-50 dark:bg-[#0d2019]' : 'border-rose-500 bg-rose-50 dark:bg-[#26121a]', !result.correct && 'animate-shake')}>
              <div className="flex max-h-[45vh] flex-col gap-2 overflow-y-auto p-4">
                <div className={cx('flex items-center gap-2 font-display text-lg font-bold', result.correct ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
                  {result.correct ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  {result.correct ? pickPraise(q.id) : result.score > 0 ? `Częściowo (${Math.round(result.score * 100)}%)` : 'Niestety nie'}
                </div>
                {!result.correct && (
                  <div className="text-sm">
                    <span className="font-semibold">Poprawnie: </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">{result.expectedText}</span>
                  </div>
                )}
                {result.note && <div className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">{result.note}</div>}
                <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  <Md text={q.explanation} />
                </div>
                {site && (
                  <div className="mt-1 flex items-center gap-3 rounded-xl bg-white/70 p-2 dark:bg-black/20">
                    <MapView which="DE" className="w-24 shrink-0" highlight={site.lands} points={[{ id: site.id, lat: site.lat, lon: site.lon, label: site.name, active: true }]} noTooltip />
                    <div className="text-xs">
                      <div className="font-bold">{site.name}</div>
                      <div className="muted">{site.place} · {site.lands.map((l) => LAND_NAMES[l]).join(', ')} · {site.year}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-black/5 bg-white/50 p-3 dark:border-white/5 dark:bg-black/20">
                <button className="btn-ghost px-3 text-xs" onClick={() => toggleFlag(q.id)}>
                  {isFlagged ? <BookmarkCheck className="h-4 w-4 text-brand-500" /> : <Bookmark className="h-4 w-4" />}
                  <span className="hidden sm:inline">{isFlagged ? 'W powtórkach' : 'Dodaj do powtórek'}</span>
                </button>
                {topic?.lesson && (
                  <Link to={`/nauka/${topic.id}`} className="btn-ghost px-3 text-xs">
                    <BookOpen className="h-4 w-4" /> <span className="hidden sm:inline">Lekcja</span>
                  </Link>
                )}
                <button autoFocus className={cx('btn ml-auto px-6 py-3 text-white', result.correct ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600')} onClick={next}>
                  Dalej <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const PRAISE = ['Richtig!', 'Genau!', 'Perfekt!', 'Sehr gut!', 'Super!', 'Stimmt!', 'Korrekt!']
function pickPraise(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0
  return PRAISE[Math.abs(h) % PRAISE.length]
}

export function shortPrompt(q: Question): string {
  switch (q.type) {
    case 'mc':
    case 'reaction':
    case 'multi':
      return q.stem ?? q.prompt
    case 'input':
    case 'transform':
      return q.stem
    case 'gap':
    case 'wordbank':
      return q.text.replace(/\{\d+\}/g, '___').slice(0, 140) + (q.text.length > 140 ? '…' : '')
    case 'reading':
      return q.title ? `Tekst: ${q.title}` : q.prompt
    case 'truefalse':
      return q.stem && q.stem.length < 100 ? q.stem : `Richtig/Falsch: ${q.items[0].statement}`
    case 'match':
      return `Dopasowanie: ${q.pairs[0][0].slice(0, 60)}…`
    case 'order':
      return `Kolejność: ${q.items.slice(0, 4).join(' ')}…`
  }
}
