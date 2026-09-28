import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Check, CheckCircle2, Clock, Dumbbell, RotateCcw, Search, TriangleAlert } from 'lucide-react'
import { useStore } from '../store/useStore'
import { QUESTION_BY_ID } from '../content'
import { CATEGORIES, CATEGORY_BY_ID } from '../content/categories'
import { TOPIC_BY_ID } from '../content/topics'
import { dueCount } from '../engine/session'
import { shortPrompt } from '../components/QuizRunner'
import { cx, Empty, fmtDate, Md, PageHeader, relTime, Segmented, Stat } from '../components/ui'
import type { CategoryId } from '../types'

export default function Mistakes() {
  const p = useStore((s) => s.p)
  const resolve = useStore((s) => s.resolveMistake)
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')
  const [cat, setCat] = useState<CategoryId | ''>('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const list = useMemo(() => {
    return Object.values(p.mistakes)
      .filter((m) => QUESTION_BY_ID[m.qid])
      .filter((m) => (filter === 'open' ? !m.resolved || m.flagged : filter === 'resolved' ? m.resolved : true))
      .filter((m) => !cat || QUESTION_BY_ID[m.qid].category === cat)
      .filter((m) => !q || shortPrompt(QUESTION_BY_ID[m.qid]).toLowerCase().includes(q.toLowerCase()) || TOPIC_BY_ID[QUESTION_BY_ID[m.qid].topic]?.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.count - a.count || b.lastAt - a.lastAt)
  }, [p.mistakes, filter, cat, q])

  const openCount = Object.values(p.mistakes).filter((m) => !m.resolved || m.flagged).length
  const resolvedCount = Object.values(p.mistakes).filter((m) => m.resolved).length
  const topTopics = useMemo(() => {
    const c: Record<string, number> = {}
    for (const m of Object.values(p.mistakes)) if (!m.resolved && QUESTION_BY_ID[m.qid]) c[QUESTION_BY_ID[m.qid].topic] = (c[QUESTION_BY_ID[m.qid].topic] ?? 0) + m.count
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [p.mistakes])

  return (
    <div>
      <PageHeader
        eyebrow="Moje błędy"
        title="Każdy błąd to punkt do odzyskania"
        subtitle="Błąd uznajemy za naprawiony po 2 poprawnych odpowiedziach z rzędu. Do tego czasu wraca w treningach częściej."
        right={
          <Link to="/trening?mode=mistakes&n=15" className={cx('btn-primary', !openCount && 'pointer-events-none opacity-50')}>
            <Dumbbell className="h-4 w-4" /> Trening tylko z moich błędów
          </Link>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Do naprawy" value={openCount} icon={<TriangleAlert className="h-4 w-4" />} accent="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300" />
        <Stat label="Naprawione" value={resolvedCount} icon={<CheckCircle2 className="h-4 w-4" />} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
        <div className="card card-pad col-span-2">
          <div className="label mb-2">Najczęstsze źródła błędów</div>
          {topTopics.length ? (
            <div className="flex flex-wrap gap-2">
              {topTopics.map(([t, n]) => (
                <Link key={t} to={`/nauka/${t}`} className="chip-muted hover:bg-brand-50 hover:text-brand-700">
                  {TOPIC_BY_ID[t]?.title} <b>×{n}</b>
                </Link>
              ))}
            </div>
          ) : (
            <span className="text-sm muted">Brak - świetnie!</span>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <Segmented value={filter} onChange={setFilter} options={[{ value: 'open', label: `Do naprawy (${openCount})` }, { value: 'resolved', label: 'Naprawione' }, { value: 'all', label: 'Wszystkie' }]} />
        <select value={cat} onChange={(e) => setCat(e.target.value as CategoryId | '')} className="field md:w-52">
          <option value="">Wszystkie kategorie</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="relative md:ml-auto md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Szukaj…" className="field pl-9" />
        </div>
      </div>

      {list.length === 0 ? (
        <Empty icon={<CheckCircle2 className="h-6 w-6" />} title={filter === 'open' ? 'Brak błędów do naprawy' : 'Pusto'} body="Błędy z treningów i próbnych konkursów pojawią się tutaj automatycznie." />
      ) : (
        <div className="grid gap-3">
          {list.map((m) => {
            const question = QUESTION_BY_ID[m.qid]
            const c = CATEGORY_BY_ID[question.category]
            const expanded = open === m.qid
            return (
              <div key={m.qid} className="card overflow-hidden">
                <button onClick={() => setOpen(expanded ? null : m.qid)} className="flex w-full items-start gap-3 p-4 text-left">
                  <span className={cx('mt-0.5 flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-sm font-bold', m.resolved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300')}>×{m.count}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug">{shortPrompt(question)}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs muted">
                      <span className="font-semibold" style={{ color: c.hex }}>{c.name}</span>
                      <span>{TOPIC_BY_ID[question.topic]?.title}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{relTime(m.lastAt)}</span>
                      {m.flagged && <span className="chip bg-brand-100 px-2 py-0.5 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">oznaczone</span>}
                    </span>
                  </span>
                </button>
                {expanded && (
                  <div className="animate-rise border-t border-slate-100 px-4 pb-4 pt-3 text-sm dark:border-white/[0.05]">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-500/10">
                        <div className="label mb-1 text-rose-600 dark:text-rose-300">Twoja odpowiedź</div>
                        <div className="font-semibold">{m.lastGiven}</div>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
                        <div className="label mb-1 text-emerald-600 dark:text-emerald-300">Poprawna odpowiedź</div>
                        <div className="font-semibold">{m.expected}</div>
                      </div>
                    </div>
                    <div className="mt-3 leading-relaxed"><Md text={question.explanation} /></div>
                    <div className="mt-2 text-xs muted">Pierwszy raz: {fmtDate(m.firstAt)} · ostatnio: {fmtDate(m.lastAt, true)} · naprawa: {m.fixStreak}/2</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link to={`/trening?mode=mistakes&n=10`} className="btn-primary px-3 py-2 text-xs"><RotateCcw className="h-3.5 w-3.5" /> Powtórz</Link>
                      {TOPIC_BY_ID[question.topic]?.lesson && <Link to={`/nauka/${question.topic}`} className="btn-secondary px-3 py-2 text-xs"><BookOpen className="h-3.5 w-3.5" /> Lekcja</Link>}
                      {!m.resolved && <button onClick={() => resolve(m.qid)} className="btn-ghost px-3 py-2 text-xs"><Check className="h-3.5 w-3.5" /> Oznacz jako zrozumiane</button>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Review() {
  const p = useStore((s) => s.p)
  const due = dueCount(p)
  const now = Date.now()
  const upcoming = useMemo(() => {
    const buckets = [
      { label: 'Teraz', max: 0 },
      { label: 'Jutro', max: 1 },
      { label: '2-3 dni', max: 3 },
      { label: 'Tydzień', max: 7 },
      { label: 'Później', max: Infinity },
    ]
    const counts = buckets.map(() => 0)
    for (const s of Object.values(p.qstates)) {
      const d = (s.due - now) / 86_400_000
      const i = buckets.findIndex((b) => d <= b.max)
      counts[i]++
    }
    return buckets.map((b, i) => ({ ...b, n: counts[i] }))
  }, [p.qstates, now])
  const max = Math.max(1, ...upcoming.map((u) => u.n))
  const flagged = p.flagged.filter((id) => QUESTION_BY_ID[id])

  return (
    <div>
      <PageHeader
        eyebrow="Powtórki"
        title="Spaced repetition"
        subtitle="Pytania wracają w rosnących odstępach: 10 min → 1 → 3 → 7 → 16 → 35 dni. Najwięcej zapamiętasz, powtarzając dokładnie wtedy, gdy zaczynasz zapominać."
        right={<Link to="/trening?mode=review&n=20" className={cx('btn-primary', !due && 'pointer-events-none opacity-50')}><RotateCcw className="h-4 w-4" /> Powtórz teraz ({due})</Link>}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card card-pad">
          <h2 className="h2 mb-4">Harmonogram powtórek</h2>
          <div className="flex h-44 items-end gap-3">
            {upcoming.map((u) => (
              <div key={u.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-sm font-bold tabular-nums">{u.n}</span>
                <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-violet-400" style={{ height: `${(u.n / max) * 120 + 4}px` }} />
                <span className="text-xs muted">{u.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <h2 className="h2 mb-3">Oznaczone „do powtórek” ({flagged.length})</h2>
          {flagged.length === 0 ? (
            <p className="text-sm muted">Po odpowiedzi kliknij „Dodaj do powtórek”, żeby zachować pytanie tutaj.</p>
          ) : (
            <div className="grid max-h-72 gap-2 overflow-y-auto">
              {flagged.map((id) => (
                <div key={id} className="rounded-xl bg-slate-50 p-2.5 text-sm dark:bg-white/[0.03]">{shortPrompt(QUESTION_BY_ID[id])}</div>
              ))}
            </div>
          )}
          {flagged.length > 0 && <Link to={`/trening?mode=review&n=${Math.min(25, flagged.length + due)}`} className="btn-secondary mt-3 w-full">Trenuj oznaczone</Link>}
        </div>
      </div>
    </div>
  )
}
