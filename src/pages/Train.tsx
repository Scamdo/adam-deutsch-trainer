import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Brain, CheckCircle2, Dumbbell, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CATEGORIES } from '../content/categories'
import { QUESTIONS } from '../content'
import { TOPIC_BY_ID } from '../content/topics'
import { buildSession, dueCount, openMistakes, type SessionMode } from '../engine/session'
import { QuizRunner } from '../components/QuizRunner'
import { cx, Empty, PageHeader, Segmented } from '../components/ui'
import type { CategoryId, Stage } from '../types'

export default function Train() {
  const [sp] = useSearchParams()
  const loc = useLocation()
  if (sp.get('mode')) return <TrainSession key={loc.key} />
  return <TrainConfig />
}

function TrainSession() {
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const mode = (sp.get('mode') ?? 'adaptive') as SessionMode
  const n = Number(sp.get('n') ?? 15)
  const cats = sp.get('cat')?.split(',').filter(Boolean) as CategoryId[] | undefined
  const topic = sp.get('topic') ?? undefined
  const stage = (sp.get('stage') ?? undefined) as Stage | undefined
  const [questions] = useState(() =>
    buildSession(useStore.getState().p, n, { categories: cats, topics: topic ? [topic] : undefined, stage }, mode),
  )
  const label =
    mode === 'mistakes' ? 'Trening z błędów' : mode === 'review' ? 'Powtórka' : mode === 'topic' && topic ? `Trening: ${TOPIC_BY_ID[topic]?.title}` : mode === 'new' ? 'Nowe pytania' : 'Trening adaptacyjny'

  if (!questions.length) {
    return (
      <Empty
        icon={<CheckCircle2 className="h-6 w-6" />}
        title={mode === 'mistakes' ? 'Brak błędów do powtórki!' : mode === 'review' ? 'Wszystkie powtórki zrobione' : 'Brak pytań dla tych filtrów'}
        body={mode === 'mistakes' || mode === 'review' ? 'Świetna robota. Wróć później albo zrób trening adaptacyjny.' : 'Zmień kryteria i spróbuj ponownie.'}
        action={<Link to="/trening?mode=adaptive&n=15" className="btn-primary">Trening adaptacyjny</Link>}
      />
    )
  }
  return <QuizRunner questions={questions} mode={mode === 'mistakes' ? 'mistakes' : mode === 'review' ? 'review' : 'train'} label={label} onRestart={() => nav(loc2(sp), { replace: true })} />
}

const loc2 = (sp: URLSearchParams) => `/trening?${sp.toString()}&r=${Date.now() % 100000}`

function TrainConfig() {
  const p = useStore((s) => s.p)
  const nav = useNavigate()
  const [mode, setMode] = useState<SessionMode>('adaptive')
  const [cats, setCats] = useState<CategoryId[]>([])
  const [stage, setStage] = useState<Stage | ''>('')
  const [n, setN] = useState(15)
  const mistakes = openMistakes(p)
  const due = dueCount(p)
  const pool = QUESTIONS.filter((q) => (!cats.length || cats.includes(q.category)) && (!stage || q.stage.includes(stage)))

  const MODES: { id: SessionMode; title: string; desc: string; icon: ReactNode; badge?: number }[] = [
    { id: 'adaptive', title: 'Adaptacyjny', desc: 'Algorytm dobiera pytania ze słabych obszarów, nowe i zaległe.', icon: <Brain className="h-5 w-5" /> },
    { id: 'mistakes', title: 'Tylko moje błędy', desc: 'Pytania, na które odpowiedziałeś źle - aż do naprawienia.', icon: <TriangleAlert className="h-5 w-5" />, badge: mistakes },
    { id: 'review', title: 'Powtórki (SRS)', desc: 'Pytania, które według krzywej zapominania trzeba teraz odświeżyć.', icon: <RotateCcw className="h-5 w-5" />, badge: due },
    { id: 'new', title: 'Nowe pytania', desc: 'Tylko pytania, których jeszcze nie widziałeś.', icon: <Sparkles className="h-5 w-5" /> },
  ]

  const start = () => {
    const params = new URLSearchParams({ mode, n: String(n) })
    if (cats.length) params.set('cat', cats.join(','))
    if (stage) params.set('stage', stage)
    nav(`/trening?${params.toString()}`)
  }

  return (
    <div>
      <PageHeader eyebrow="Trening" title="Trenuj mądrze, nie dużo" subtitle={`Bank: ${QUESTIONS.length} oryginalnych pytań w 11 typach zadań. Błędne odpowiedzi wracają częściej, opanowane - coraz rzadziej.`} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)} className={cx('card card-pad flex gap-3 text-left transition', mode === m.id ? 'ring-2 ring-brand-500' : 'hover:shadow-lg')}>
                <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', mode === m.id ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300')}>{m.icon}</span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-display font-bold">
                    {m.title}
                    {!!m.badge && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{m.badge}</span>}
                  </span>
                  <span className="text-sm muted">{m.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="card card-pad">
            <div className="label mb-3">Kategorie (puste = wszystkie)</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = cats.includes(c.id)
                return (
                  <button key={c.id} onClick={() => setCats(on ? cats.filter((x) => x !== c.id) : [...cats, c.id])} className={cx('chip border-2 px-3 py-1.5 text-sm transition', on ? 'text-white' : 'border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-transparent dark:text-slate-200')} style={on ? { background: c.hex, borderColor: c.hex } : undefined}>
                    {c.name}
                  </button>
                )
              })}
            </div>
            <div className="label mb-3 mt-5">Etap</div>
            <Segmented value={stage} onChange={setStage} options={[{ value: '', label: 'Wszystkie' }, { value: 'szkolny', label: 'Szkolny' }, { value: 'rejonowy', label: 'Rejonowy' }, { value: 'wojewodzki', label: 'Wojewódzki' }]} />
            <div className="label mb-3 mt-5">Liczba pytań</div>
            <Segmented value={String(n)} onChange={(v) => setN(Number(v))} options={[5, 10, 15, 25, 40].map((x) => ({ value: String(x), label: String(x) }))} />
          </div>
        </div>
        <div className="card card-pad flex h-fit flex-col gap-4 lg:sticky lg:top-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-glow"><Dumbbell className="h-6 w-6" /></span>
            <div>
              <div className="font-display text-lg font-bold">{MODES.find((m) => m.id === mode)?.title}</div>
              <div className="text-sm muted">{n} pytań · pula {pool.length}</div>
            </div>
          </div>
          <button className="btn-primary py-3" onClick={start}>Start</button>
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed muted dark:bg-white/[0.03]">
            <b className="text-slate-700 dark:text-slate-200">Jak działa algorytm?</b> Każde pytanie ma priorytet: nierozwiązany błąd +100, zaległa powtórka +60, słaby temat do +50, słaba pod-umiejętność (np. „Relativpronomen im Dativ”) do +30, nowe +25, pewne (3× z rzędu dobrze) −40. Błędne pytanie wraca jeszcze w tej samej sesji, a potem po 10 min, 1, 3, 7, 16… dniach.
          </div>
        </div>
      </div>
    </div>
  )
}
