import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, Clock, Flag, History, Play, Send, Trophy, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CATEGORY_BY_ID, STAGE_FORMAT, STAGE_LABEL } from '../content/categories'
import { QUESTION_BY_ID } from '../content'
import { TOPIC_BY_ID } from '../content/topics'
import { writingChecks } from '../content/email'
import { generateExam, type ExamDef } from '../engine/exam'
import { check, isAnswered, pointsOf } from '../engine/check'
import type { AnswerOutcome } from '../engine/mastery'
import { QuestionView } from '../components/QuestionView'
import { shortPrompt } from '../components/QuizRunner'
import { Bar, cx, Empty, fmtDate, fmtDuration, PageHeader, Ring } from '../components/ui'
import type { AnswerValue, ExamItemResult, ExamRecord, Question, Stage } from '../types'

export default function Exam() {
  const [sp] = useSearchParams()
  const stage = sp.get('stage') as Stage | null
  const id = sp.get('id')
  if (stage) return <ExamRunner key={stage + sp.get('r')} stage={stage} />
  if (id) return <ExamReport id={id} />
  return <ExamHome />
}

function ExamHome() {
  const exams = useStore((s) => s.p.exams)
  const sorted = [...exams].sort((a, b) => b.finishedAt - a.finishedAt)
  const DESC: Record<Stage, string> = {
    szkolny: '9 zadań · 40 pkt · czytanie, pytanie-odpowiedź, reakcje, gramatyka, antonimy, tekst z lukami, Landeskunde, e-mail.',
    rejonowy: '10 zadań · 60 pkt · nagłówki, P/F, reakcje, luki, bank słów, formy wyrazów i czasowników, pisownia, UNESCO.',
    wojewodzki: 'Wersja beta · słuchanie (syntezator mowy), czytanie, rekcja, transformacje, Landeskunde, Naturdenkmale.',
  }
  return (
    <div>
      <PageHeader eyebrow="Próbny konkurs" title="Symulacja w warunkach egzaminu" subtitle="Struktura, proporcje zadań, punktacja i czas odwzorowane na podstawie arkuszy MKO 2022-2026. Treści są oryginalne. Podczas egzaminu brak podpowiedzi - wynik i analiza dopiero na końcu." />
      <div className="grid gap-4 md:grid-cols-3">
        {(['szkolny', 'rejonowy', 'wojewodzki'] as Stage[]).map((s) => {
          const best = exams.filter((e) => e.stage === s).reduce<number | null>((m, e) => (m == null || e.percent > m ? e.percent : m), null)
          return (
            <div key={s} className="card card-pad flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">{STAGE_LABEL[s]}</span>
                {s === 'wojewodzki' && <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">beta</span>}
              </div>
              <p className="text-sm muted">{DESC[s]}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 font-semibold"><Clock className="h-4 w-4 text-brand-500" />{STAGE_FORMAT[s].minutes} min</span>
                <span className="muted">Najlepszy: <b className="text-slate-800 dark:text-slate-100">{best != null ? `${best}%` : '—'}</b></span>
              </div>
              <div className="text-xs muted">{STAGE_FORMAT[s].threshold}</div>
              <Link to={`/konkurs?stage=${s}&r=${Date.now() % 100000}`} className="btn-primary mt-auto"><Play className="h-4 w-4" /> Rozpocznij</Link>
            </div>
          )
        })}
      </div>

      <h2 className="h2 mb-3 mt-8 flex items-center gap-2"><History className="h-5 w-5 text-brand-500" /> Historia ({sorted.length})</h2>
      {sorted.length === 0 ? (
        <Empty icon={<Trophy className="h-6 w-6" />} title="Jeszcze brak próbnych konkursów" body="Pierwszy wynik będzie punktem odniesienia do mierzenia postępów." />
      ) : (
        <div className="card overflow-hidden">
          {sorted.map((e, i) => (
            <Link key={e.id} to={`/konkurs?id=${e.id}`} className={cx('flex items-center gap-4 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]', i && 'border-t border-slate-100 dark:border-white/[0.05]')}>
              <Ring value={e.percent} size={44} stroke={5} color={e.percent >= 90 ? '#8b5cf6' : e.percent >= 85 ? '#10b981' : e.percent >= 60 ? '#6366f1' : '#f43f5e'}>
                <span className="text-[11px] font-bold">{e.percent}</span>
              </Ring>
              <div className="flex-1">
                <div className="font-semibold">{STAGE_LABEL[e.stage]} · {e.points}/{e.max} pkt</div>
                <div className="text-xs muted">{fmtDate(e.finishedAt, true)} · {fmtDuration(e.durationSec)}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

type Phase = 'intro' | 'run' | 'self' | 'done'

function ExamRunner({ stage }: { stage: Stage }) {
  const nav = useNavigate()
  const addExam = useStore((s) => s.addExam)
  const [exam] = useState<ExamDef>(() => generateExam(stage))
  const [phase, setPhase] = useState<Phase>('intro')
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [flags, setFlags] = useState<Set<string>>(new Set())
  const [taskIdx, setTaskIdx] = useState(0)
  const [writing, setWriting] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [left, setLeft] = useState(exam.minutes * 60)
  const startedAt = useRef(0)
  const [selfEval, setSelfEval] = useState<{ content: boolean[]; lang: number }>({ content: [false, false, false], lang: 2 })
  const [recordId, setRecordId] = useState<string | null>(null)

  const pages = exam.tasks.length + (exam.writing ? 1 : 0)
  const allQs = useMemo(() => exam.tasks.flatMap((t) => t.questions.map((q) => ({ q, task: t.no }))), [exam])
  const key = (task: number, q: Question) => `${task}:${q.id}`
  const answeredCount = allQs.filter(({ q, task }) => isAnswered(q, answers[key(task, q)])).length

  useEffect(() => {
    if (phase !== 'run') return
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t)
          setPhase(exam.writing ? 'self' : 'done')
          return 0
        }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase, exam.writing])

  useEffect(() => {
    if (phase !== 'run') return
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [phase])

  // Ocena
  const graded = useMemo(() => {
    if (phase === 'intro' || phase === 'run') return null
    return allQs.map(({ q, task }) => {
      const v = answers[key(task, q)]
      const max = pointsOf(q)
      const r = v ? check(q, v) : { correct: false, score: 0, givenText: '—', expectedText: '' , parts: undefined }
      const expected = v ? r.expectedText : check(q, { kind: 'text', value: '' }).expectedText
      const pts = r.parts ? r.parts.filter(Boolean).length : r.correct ? max : 0
      return { q, task, max, pts, given: r.givenText, expected, correct: r.correct, score: r.score, answered: isAnswered(q, v) }
    })
  }, [phase, allQs, answers])

  const writingPts = exam.writing ? selfEval.content.filter(Boolean).length + (selfEval.content.some(Boolean) ? selfEval.lang : 0) : 0

  const finalize = () => {
    if (!graded || recordId) return
    const items: ExamItemResult[] = graded.map((g) => ({ qid: g.q.id, task: g.task, points: g.pts, max: g.max, given: g.given, expected: g.expected, category: g.q.category, topic: g.q.topic }))
    if (exam.writing) items.push({ qid: 'writing:' + exam.writing.task.id, task: exam.writing.no, points: writingPts, max: exam.writing.points, given: writing.slice(0, 400), expected: '', category: 'schreiben', topic: 'email' })
    const points = items.reduce((s, i) => s + i.points, 0)
    const byCategory: ExamRecord['byCategory'] = {}
    for (const i of items) {
      const c = (byCategory[i.category] ??= { points: 0, max: 0 })
      c.points += i.points
      c.max += i.max
    }
    const rec: ExamRecord = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      stage,
      startedAt: startedAt.current,
      finishedAt: Date.now(),
      durationSec: exam.minutes * 60 - left,
      points,
      max: exam.maxPoints,
      percent: Math.round((points / exam.maxPoints) * 100),
      byCategory,
      items,
    }
    const wrong: { q: Question; o: AnswerOutcome }[] = graded
      .filter((g) => QUESTION_BY_ID[g.q.id] && g.answered) // tylko odpowiedziane - puste nie trafiają do „Moich błędów”
      .map((g) => ({ q: g.q, o: { correct: g.correct, score: g.score, given: g.given, expected: g.expected } }))
    addExam(rec, wrong)
    setRecordId(rec.id)
    nav(`/konkurs?id=${rec.id}`, { replace: true })
  }

  useEffect(() => {
    if (phase === 'done' && !exam.writing) finalize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card card-pad flex flex-col gap-4 sm:p-8">
          <div className="label text-brand-600 dark:text-brand-300">Próbny konkurs</div>
          <h1 className="h1">{STAGE_LABEL[stage]}{exam.beta ? ' (beta)' : ''}</h1>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]"><div className="font-display text-xl font-bold">{exam.minutes}</div><div className="text-xs muted">minut</div></div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]"><div className="font-display text-xl font-bold">{pages}</div><div className="text-xs muted">zadań</div></div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.04]"><div className="font-display text-xl font-bold">{exam.maxPoints}</div><div className="text-xs muted">punktów</div></div>
          </div>
          <ul className="grid gap-2 text-sm">
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />Brak podpowiedzi i wyjaśnień w trakcie - jak na prawdziwym konkursie.</li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />Możesz oznaczać pytania „wróć później” (<Flag className="inline h-3.5 w-3.5" />) i swobodnie przechodzić między zadaniami.</li>
            <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />Odpowiedzi wpisywane: pełna poprawność ortograficzna, wielkość liter ma znaczenie.</li>
            {exam.writing && <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />E-mail oceniasz sam na końcu według kryteriów MKO (3 pkt treść + 2 pkt poprawność), z wzorcową odpowiedzią.</li>}
            <li className="flex gap-2"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />Po upływie czasu test zakończy się automatycznie.</li>
          </ul>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => nav('/konkurs')}>Anuluj</button>
            <button className="btn-primary flex-1 py-3" onClick={() => { startedAt.current = Date.now(); setPhase('run') }}>
              <Play className="h-4 w-4" /> Start - {exam.minutes}:00
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'self' && exam.writing) {
    const w = exam.writing.task
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <PageHeader eyebrow="Ostatni krok" title={`Oceń swój ${w.kind === 'E-Mail' ? 'e-mail' : 'wpis'} (zad. ${exam.writing.no})`} subtitle="Kryteria jak w modelu oceniania MKO. Bądź surowy - na konkursie nikt nie da punktu „za dobre chęci”." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card card-pad">
            <div className="label mb-2">Twój tekst</div>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{writing || <span className="muted">(brak tekstu)</span>}</div>
          </div>
          <div className="card card-pad">
            <div className="label mb-2">Wzorcowa odpowiedź</div>
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{w.model}</div>
          </div>
        </div>
        <div className="card card-pad">
          <div className="label mb-3">Treść - po 1 pkt za każdy ROZWINIĘTY element</div>
          <div className="grid gap-2">
            {w.points.map((pt, i) => (
              <label key={i} className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-slate-200 p-3 dark:border-white/10">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-indigo-500" checked={selfEval.content[i]} onChange={(e) => setSelfEval((s) => ({ ...s, content: s.content.map((x, k) => (k === i ? e.target.checked : x)) }))} />
                <span className="text-sm font-medium">{pt}</span>
              </label>
            ))}
          </div>
          <div className="label mb-3 mt-5">Poprawność językowa (błędy gramatyczne, leksykalne, ortograficzne)</div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[{ v: 2, l: 'maks. 5 błędów', p: '2 pkt' }, { v: 1, l: '6-10 błędów', p: '1 pkt' }, { v: 0, l: 'ponad 10 błędów', p: '0 pkt' }].map((o) => (
              <button key={o.v} onClick={() => setSelfEval((s) => ({ ...s, lang: o.v }))} className={cx('rounded-xl border-2 p-3 text-left', selfEval.lang === o.v ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 dark:border-white/10')}>
                <div className="font-bold">{o.p}</div>
                <div className="text-xs muted">{o.l}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-1.5 text-sm">
            {writingChecks(writing).map((c) => (
              <div key={c.label} className={cx('flex items-center gap-2', c.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                {c.ok ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {c.label}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.05]">
            <div className="font-display text-xl font-bold">{writingPts}/5 pkt</div>
            <button className="btn-primary" onClick={finalize}>Zobacz wynik <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'done') return <div className="card card-pad">Obliczanie wyniku…</div>

  // ---------- RUN ----------
  const isWritingPage = exam.writing && taskIdx === exam.tasks.length
  const task = exam.tasks[taskIdx]
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-28">
      <div className="sticky top-[52px] z-20 -mx-4 border-b border-slate-200/70 bg-[#f5f6fa]/90 px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink-950/90 sm:mx-0 sm:rounded-2xl sm:border lg:top-2">
        <div className="flex items-center gap-3">
          <div className={cx('flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-display text-lg font-bold tabular-nums', left < 300 ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900')}>
            <Clock className="h-4 w-4" />{mm}:{ss}
          </div>
          <Bar value={(answeredCount / allQs.length) * 100} className="flex-1" />
          <span className="text-sm font-bold tabular-nums">{answeredCount}/{allQs.length}</span>
          <button className="btn-primary px-3 py-2" onClick={() => setConfirm(true)}><Send className="h-4 w-4" /><span className="hidden sm:inline">Zakończ</span></button>
        </div>
        <div className="scrollbar-none mt-3 flex gap-1.5 overflow-x-auto">
          {Array.from({ length: pages }, (_, i) => {
            const t = exam.tasks[i]
            const done = t ? t.questions.every((q) => isAnswered(q, answers[key(t.no, q)])) : writing.trim().length > 30
            const fl = t ? t.questions.some((q) => flags.has(key(t.no, q))) : false
            return (
              <button key={i} onClick={() => setTaskIdx(i)} className={cx('relative h-9 min-w-9 shrink-0 rounded-lg border-2 px-2 text-sm font-bold', i === taskIdx ? 'border-brand-500 bg-brand-500 text-white' : done ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-ink-850')}>
                {t ? t.no : exam.writing!.no}
                {fl && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {isWritingPage && exam.writing ? (
        <div className="card card-pad animate-rise sm:p-6">
          <div className="label mb-1">Zadanie {exam.writing.no} · {exam.writing.points} pkt</div>
          <h2 className="h2 mb-2">{exam.writing.task.kind}</h2>
          <p className="text-[15px] font-medium">{exam.writing.task.situation} W swojej wypowiedzi:</p>
          <ul className="my-3 grid gap-1.5 text-[15px]">
            {exam.writing.task.points.map((p, i) => <li key={i} className="flex gap-2"><span className="font-bold text-brand-500">•</span>{p}</li>)}
          </ul>
          <p className="mb-3 text-sm muted">Podpisz się jako XYZ. Pisz po niemiecku.</p>
          <textarea value={writing} onChange={(e) => setWriting(e.target.value)} rows={12} spellCheck={false} autoCorrect="off" autoCapitalize="off" className="field font-medium leading-relaxed" placeholder="Liebe …," />
          <div className="mt-2 text-right text-xs muted">{writing.trim().split(/\s+/).filter(Boolean).length} słów</div>
        </div>
      ) : task ? (
        <div className="flex animate-rise flex-col gap-4" key={task.no}>
          <div>
            <div className="label">{task.title} · {task.points} pkt</div>
            <p className="mt-1 text-[15px] font-semibold">{task.instruction}</p>
          </div>
          {task.questions.map((q, qi) => {
            const k = key(task.no, q)
            return (
              <div key={k} className="card card-pad relative sm:p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-brand-500">{task.no}.{qi + 1}</span>
                  <button onClick={() => setFlags((f) => { const n = new Set(f); if (n.has(k)) n.delete(k); else n.add(k); return n })} className={cx('btn px-2.5 py-1 text-xs', flags.has(k) ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'btn-ghost')}>
                    <Flag className="h-3.5 w-3.5" /> {flags.has(k) ? 'Wróć później' : 'Oznacz'}
                  </button>
                </div>
                <QuestionView q={q} value={answers[k]} onChange={(v) => setAnswers((a) => ({ ...a, [k]: v }))} seed={'exam' + task.no} examMode />
              </div>
            )
          })}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button className="btn-secondary flex-1" disabled={taskIdx === 0} onClick={() => { setTaskIdx((i) => i - 1); window.scrollTo({ top: 0 }) }}><ArrowLeft className="h-4 w-4" /> Poprzednie</button>
        {taskIdx < pages - 1 ? (
          <button className="btn-primary flex-1" onClick={() => { setTaskIdx((i) => i + 1); window.scrollTo({ top: 0 }) }}>Następne <ArrowRight className="h-4 w-4" /></button>
        ) : (
          <button className="btn-success flex-1" onClick={() => setConfirm(true)}><Send className="h-4 w-4" /> Zakończ test</button>
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirm(false)} />
          <div className="card relative w-full max-w-sm animate-pop p-6">
            <h3 className="h2">Zakończyć test?</h3>
            <p className="mt-2 text-sm muted">
              Odpowiedziano na {answeredCount} z {allQs.length} pytań{exam.writing ? (writing.trim() ? ', e-mail napisany' : ', e-mail pusty') : ''}.
              {flags.size > 0 && ` Masz ${flags.size} oznaczonych pytań.`} Pozostały czas: {mm}:{ss}.
            </p>
            <div className="mt-5 flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>Wróć</button>
              <button className="btn-primary flex-1" onClick={() => { setConfirm(false); setPhase(exam.writing ? 'self' : 'done') }}>Zakończ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExamReport({ id }: { id: string }) {
  const e = useStore((s) => s.p.exams.find((x) => x.id === id))
  const [showAll, setShowAll] = useState(false)
  if (!e) return <Empty icon={<Trophy className="h-6 w-6" />} title="Nie znaleziono wyniku" body="Ten próbny konkurs nie istnieje." action={<Link to="/konkurs" className="btn-primary">Wróć</Link>} />
  const threshold = e.stage === 'rejonowy' ? 85 : e.stage === 'wojewodzki' ? 90 : 90
  const verdict =
    e.stage === 'szkolny'
      ? e.percent >= 90 ? 'Wynik na poziomie awansu (top 5% zwykle wymaga ~36+/40).' : e.percent >= 80 ? 'Blisko - do awansu potrzeba zwykle niemal bezbłędnego wyniku.' : 'Poniżej realnego progu awansu - skup się na rekomendacjach.'
      : e.stage === 'rejonowy'
        ? e.percent >= 85 ? 'Próg 85% osiągnięty - awans do etapu wojewódzkiego!' : `Do progu 85% brakuje ${Math.ceil(0.85 * e.max) - e.points} pkt.`
        : e.percent >= 90 ? 'Poziom laureata (≥90%)!' : e.percent >= 40 ? 'Poziom finalisty (≥40%). Do laureata: 90%.' : 'Poniżej progu finalisty (40%).'
  const wrong = e.items.filter((i) => i.points < i.max)
  const byTask = Object.values(
    e.items.reduce<Record<number, { task: number; points: number; max: number }>>((acc, i) => {
      const t = (acc[i.task] ??= { task: i.task, points: 0, max: 0 })
      t.points += i.points
      t.max += i.max
      return acc
    }, {}),
  ).sort((a, b) => a.task - b.task)
  const weakTopics = Object.entries(
    wrong.reduce<Record<string, number>>((acc, i) => {
      acc[i.topic] = (acc[i.topic] ?? 0) + (i.max - i.points)
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Link to="/konkurs" className="btn-ghost -ml-2"><ArrowLeft className="h-4 w-4" /> Próbne konkursy</Link>
      </div>
      <div className="card card-pad flex flex-col items-center gap-5 sm:flex-row sm:p-7">
        <Ring value={e.percent} size={140} stroke={12} color={e.percent >= threshold ? '#10b981' : e.percent >= 60 ? '#6366f1' : '#f43f5e'}>
          <span className="font-display text-4xl font-bold">{e.percent}%</span>
          <span className="text-xs muted">{e.points}/{e.max} pkt</span>
        </Ring>
        <div className="flex-1 text-center sm:text-left">
          <div className="label">{STAGE_LABEL[e.stage]} · {fmtDate(e.finishedAt, true)} · {fmtDuration(e.durationSec)}</div>
          <h1 className="h1 mt-1">{e.percent >= threshold ? 'Hervorragend!' : e.percent >= 70 ? 'Solide Leistung!' : 'Da geht noch mehr!'}</h1>
          <p className="mt-2 text-[15px]">{verdict}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Link to={`/konkurs?stage=${e.stage}&r=${Date.now() % 100000}`} className="btn-primary">Nowy próbny konkurs</Link>
            {wrong.length > 0 && <Link to="/trening?mode=mistakes&n=15" className="btn-secondary">Trenuj błędy z testu</Link>}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card card-pad">
          <h2 className="h2 mb-3">Wynik według kategorii</h2>
          <div className="grid gap-3">
            {Object.entries(e.byCategory).map(([c, v]) => {
              const cat = CATEGORY_BY_ID[c as keyof typeof CATEGORY_BY_ID]
              const pc = Math.round((v.points / v.max) * 100)
              return (
                <div key={c}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{cat?.name ?? c}</span><span className="tabular-nums"><b>{v.points}</b>/{v.max} · {pc}%</span></div>
                  <Bar value={pc} color={cat?.hex} />
                </div>
              )
            })}
          </div>
        </div>
        <div className="card card-pad">
          <h2 className="h2 mb-3">Wynik według zadań</h2>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {byTask.map((t) => (
              <div key={t.task} className={cx('rounded-xl p-2 text-center', t.points === t.max ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : t.points / t.max >= 0.6 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300')}>
                <div className="text-[11px] font-bold opacity-70">Zad. {t.task}</div>
                <div className="font-display font-bold">{t.points}/{t.max}</div>
              </div>
            ))}
          </div>
          {weakTopics.length > 0 && (
            <div className="mt-5">
              <div className="label mb-2">Rekomendacja nauki</div>
              <div className="grid gap-2">
                {weakTopics.map(([t, lost]) => (
                  <Link key={t} to={TOPIC_BY_ID[t]?.lesson ? `/nauka/${t}` : `/trening?mode=topic&topic=${t}&n=10`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm hover:bg-brand-50 dark:bg-white/[0.03] dark:hover:bg-brand-500/10">
                    <span className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-brand-500" />{TOPIC_BY_ID[t]?.title ?? t}</span>
                    <span className="text-rose-500">−{lost} pkt</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card card-pad">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="h2">Lista błędów ({wrong.length})</h2>
          {wrong.length > 8 && <button className="btn-ghost text-sm" onClick={() => setShowAll((s) => !s)}>{showAll ? 'Pokaż mniej' : 'Pokaż wszystkie'}</button>}
        </div>
        {wrong.length === 0 ? (
          <p className="text-sm muted">Bezbłędnie! 🎉</p>
        ) : (
          <div className="grid gap-2">
            {(showAll ? wrong : wrong.slice(0, 8)).map((w, i) => {
              const q = QUESTION_BY_ID[w.qid]
              return (
                <div key={i} className="rounded-xl border border-slate-100 p-3 text-sm dark:border-white/[0.06]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{q ? shortPrompt(q) : w.qid.startsWith('writing') ? 'E-mail / wpis' : 'Zadanie UNESCO (dopasowanie)'}</span>
                    <span className="shrink-0 text-xs font-bold text-rose-500">Zad. {w.task} · {w.points}/{w.max}</span>
                  </div>
                  {w.expected && (
                    <div className="mt-1.5 grid gap-0.5">
                      <div className="flex gap-1.5 text-rose-700 dark:text-rose-300"><X className="mt-0.5 h-3.5 w-3.5 shrink-0" />{w.given}</div>
                      <div className="flex gap-1.5 text-emerald-700 dark:text-emerald-300"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />{w.expected}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
