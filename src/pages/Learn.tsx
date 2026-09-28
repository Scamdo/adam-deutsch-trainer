import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, BadgeCheck, BookOpen, CheckCircle2, Dumbbell, Lightbulb, Search, Sparkles, XCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { TOPICS, TOPIC_BY_ID } from '../content/topics'
import { CATEGORIES, CATEGORY_BY_ID, STAGE_LABEL } from '../content/categories'
import { questionsForTopic } from '../content'
import { topicPercent, topicStatus } from '../engine/mastery'
import { buildSession } from '../engine/session'
import { Bar, cx, Empty, Md, PageHeader, Segmented, StatusBadge } from '../components/ui'
import { QuizRunner } from '../components/QuizRunner'
import type { CategoryId, Stage } from '../types'

export default function Learn() {
  const p = useStore((s) => s.p)
  const [stage, setStage] = useState<Stage | 'all'>('all')
  const [query, setQuery] = useState('')
  const groups = useMemo(() => {
    const qn = query.trim().toLowerCase()
    return CATEGORIES.map((c) => ({
      c,
      topics: TOPICS.filter((t) => t.category === c.id && (stage === 'all' || t.stages.includes(stage)) && (!qn || (t.title + t.titlePl).toLowerCase().includes(qn))),
    })).filter((g) => g.topics.length)
  }, [stage, query])

  return (
    <div>
      <PageHeader
        eyebrow="Nauka"
        title="Curriculum konkursowe"
        subtitle="Tematy wybrane na podstawie programu 2026/27 i analizy arkuszy 2022-2026. Każda lekcja: krótko po polsku, przykłady, pułapki, „źle → dobrze”, mini quiz."
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={stage}
          onChange={setStage}
          options={[
            { value: 'all', label: 'Wszystkie' },
            { value: 'szkolny', label: 'Szkolny' },
            { value: 'rejonowy', label: 'Rejonowy' },
            { value: 'wojewodzki', label: 'Wojewódzki' },
          ]}
        />
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj tematu…" className="field pl-9" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {groups.map(({ c, topics }) => (
          <section key={c.id}>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: c.hex }} />
              <h2 className="h2">{c.name}</h2>
              <span className="text-sm muted">{c.namePl} · {topics.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {topics.map((t) => {
                const st = p.topics[t.id]
                const status = topicStatus(st)
                const n = questionsForTopic(t.id).length
                const link = t.lesson ? `/nauka/${t.id}` : categoryLink(t.category)
                return (
                  <Link key={t.id} to={link} className="card card-pad group flex flex-col gap-2 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display font-bold leading-snug">{t.title}</div>
                        <div className="text-sm muted">{t.titlePl}</div>
                      </div>
                      <StatusBadge status={status} />
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <Bar value={topicPercent(st)} color={c.hex} height="h-1.5" />
                      <span className="w-9 text-right text-xs font-bold tabular-nums">{topicPercent(st)}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs muted">
                      {t.priority === 1 && <span className="chip bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">kluczowy</span>}
                      <span>{n} pytań</span>
                      {p.lessonsRead[t.id] && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function categoryLink(c: CategoryId) {
  if (c === 'landeskunde') return '/landeskunde'
  if (c === 'unesco') return '/unesco'
  if (c === 'natur') return '/unesco?tab=natur'
  if (c === 'hoeren') return '/trening?mode=adaptive&cat=hoeren&n=3'
  return '/trening'
}

export function TopicPage() {
  const { topicId = '' } = useParams()
  const nav = useNavigate()
  const t = TOPIC_BY_ID[topicId]
  const p = useStore((s) => s.p)
  const markRead = useStore((s) => s.markLessonRead)
  const setMastered = useStore((s) => s.setManualMastered)
  const [quiz, setQuiz] = useState<number>(0)

  if (!t) return <Empty icon={<BookOpen />} title="Nie znaleziono tematu" body="Ten temat nie istnieje." action={<Link to="/nauka" className="btn-primary">Wróć</Link>} />
  const cat = CATEGORY_BY_ID[t.category]
  const st = p.topics[t.id]
  const status = topicStatus(st)
  const qs = questionsForTopic(t.id)
  const L = t.lesson

  if (quiz) {
    return (
      <div>
        <button className="btn-ghost mb-3 -ml-2" onClick={() => setQuiz(0)}>
          <ArrowLeft className="h-4 w-4" /> Wróć do lekcji
        </button>
        <TopicQuiz key={quiz} topicId={t.id} title={t.title} count={Math.min(6, qs.length)} onRestart={() => setQuiz((x) => x + 1)} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button className="btn-ghost mb-2 -ml-2" onClick={() => nav('/nauka')}>
        <ArrowLeft className="h-4 w-4" /> Wszystkie tematy
      </button>
      <div className="mb-5 animate-rise">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip" style={{ background: cat.hex + '1a', color: cat.hex }}>{cat.name}</span>
          <StatusBadge status={status} />
          {t.stages.map((s) => (
            <span key={s} className="chip-muted">{STAGE_LABEL[s]}</span>
          ))}
        </div>
        <h1 className="h1">{t.title}</h1>
        <p className="mt-1 muted">{t.titlePl}</p>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
          <span><b>Dlaczego to ważne:</b> {t.evidence}</span>
        </div>
      </div>

      {L ? (
        <div className="flex flex-col gap-4">
          <section className="card card-pad text-[15.5px] leading-relaxed">
            <Md text={L.intro} />
          </section>

          {L.rules && (
            <section className="grid gap-3 sm:grid-cols-2">
              {L.rules.map((r) => (
                <div key={r.title} className="card card-pad">
                  <div className="mb-1 font-display font-bold">{r.title}</div>
                  <div className="text-sm leading-relaxed"><Md text={r.body} /></div>
                </div>
              ))}
            </section>
          )}

          {L.table && (
            <section className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-white/[0.03]">
                    <tr>{L.table.head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-2.5 font-bold">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {L.table.rows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-white/[0.05]">
                        {r.map((c, j) => <td key={j} className={cx('px-4 py-2', j === 0 && 'font-semibold')}><Md text={c} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {L.examples.length > 0 && (
            <section className="card card-pad">
              <h2 className="h2 mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-500" /> Przykłady</h2>
              <div className="grid gap-2">
                {L.examples.map((e, i) => (
                  <div key={i} className="rounded-xl bg-brand-50/60 px-4 py-2.5 dark:bg-brand-500/[0.07]">
                    <div className="font-semibold text-slate-900 dark:text-white">{e.de}</div>
                    {e.pl && <div className="text-sm muted">{e.pl}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {L.pitfalls.length > 0 && (
            <section className="card card-pad">
              <h2 className="h2 mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Typowe pułapki</h2>
              <ul className="grid gap-2 text-[15px]">
                {L.pitfalls.map((x, i) => (
                  <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" /><Md text={x} /></li>
                ))}
              </ul>
            </section>
          )}

          {L.wrongRight.length > 0 && (
            <section className="card card-pad">
              <h2 className="h2 mb-3">Źle → dobrze</h2>
              <div className="grid gap-2.5">
                {L.wrongRight.map((w, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-3 dark:border-white/[0.06]">
                    <div className="flex items-start gap-2 text-rose-600 dark:text-rose-400"><XCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="line-through decoration-rose-400/60">{w.wrong}</span></div>
                    <div className="mt-1 flex items-start gap-2 font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{w.right}</div>
                    <div className="mt-1 pl-6 text-sm muted">{w.why}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="card card-pad text-sm muted">Ten temat ćwiczysz w module dedykowanym.</div>
      )}

      <div className="sticky bottom-[72px] z-20 mt-6 lg:bottom-4">
        <div className="card flex flex-col gap-2 p-3 shadow-xl sm:flex-row">
          <button
            className="btn-primary flex-1"
            disabled={!qs.length}
            onClick={() => {
              markRead(t.id)
              setQuiz(1)
            }}
          >
            <Sparkles className="h-4 w-4" /> Mini quiz ({Math.min(6, qs.length)})
          </button>
          <Link to={`/trening?mode=topic&topic=${t.id}&n=12`} onClick={() => markRead(t.id)} className="btn-secondary flex-1">
            <Dumbbell className="h-4 w-4" /> Trening (12)
          </Link>
          <button className={cx('btn flex-1 border-2', st?.manualMastered ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200' : 'border-slate-200 dark:border-white/10')} onClick={() => setMastered(t.id, !st?.manualMastered)}>
            <BadgeCheck className="h-4 w-4" /> {st?.manualMastered ? 'Opanowane ✓' : 'Oznacz jako opanowane'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TopicQuiz({ topicId, title, count, onRestart }: { topicId: string; title: string; count: number; onRestart: () => void }) {
  const [session] = useState(() => buildSession(useStore.getState().p, count, { topics: [topicId] }, 'topic'))
  return <QuizRunner questions={session} mode="learn" label={`Mini quiz: ${title}`} onRestart={onRestart} />
}
