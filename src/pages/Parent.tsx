import { Link } from 'react-router-dom'
import { CalendarClock, Clock, ShieldCheck, Target, Timer, Trophy, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import { STAGE_DATES, STAGE_LABEL } from '../content/categories'
import { TOPICS } from '../content/topics'
import { categoryPercent, currentStage, daysUntil, readiness, strongAreas, weakAreas, weeklyRecommendations } from '../engine/plan'
import { topicStatus } from '../engine/mastery'
import { useDaily } from './Stats'
import { BarChart } from '../components/Charts'
import { Bar, fmtDate, fmtDuration, PageHeader, pct, relTime, Ring, Stat } from '../components/ui'
import { CATEGORIES } from '../content/categories'

export default function Parent() {
  const p = useStore((s) => s.p)
  const daily = useDaily(p, 14)
  const stage = currentStage()
  const week = daily.slice(-7)
  const weekSec = week.reduce((s, d) => s + d.sec, 0)
  const weekN = week.reduce((s, d) => s + d.n, 0)
  const weekC = week.reduce((s, d) => s + d.correct, 0)
  const total = p.attempts.length
  const acc = pct(p.attempts.filter((a) => a.correct).length, total)
  const totalSec = p.sessions.reduce((s, x) => s + x.activeSec, 0)
  const weak = weakAreas(p, 5)
  const strong = strongAreas(p, 5)
  const lastAct = Math.max(0, ...p.attempts.map((a) => a.at))
  const mastered = TOPICS.filter((t) => topicStatus(p.topics[t.id]) === 'mastered').length
  const good = TOPICS.filter((t) => topicStatus(p.topics[t.id]) === 'good').length
  const exams = [...p.exams].sort((a, b) => b.finishedAt - a.finishedAt)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Widok rodzica"
        title={`Postęp ${p.profile.name === 'Adam' ? 'Adama' : p.profile.name}`}
        subtitle="Tylko informacje edukacyjne: czas nauki, wyniki, mocne i słabe obszary. Bez śledzenia aktywności poza aplikacją."
        right={<span className="chip-muted"><ShieldCheck className="h-3.5 w-3.5" /> dane zostają w tej przeglądarce{useStore.getState().userEmail ? ' i na koncie Supabase' : ''}</span>}
      />

      <div className="card card-pad flex flex-col items-center gap-5 sm:flex-row">
        <Ring value={readiness(p, stage)} size={120} stroke={11}>
          <span className="font-display text-3xl font-bold">{readiness(p, stage)}%</span>
          <span className="text-[11px] muted">przygotowania</span>
        </Ring>
        <div className="flex-1">
          <div className="label">Najbliższy etap</div>
          <div className="font-display text-xl font-bold">{STAGE_LABEL[stage]} · {new Date(STAGE_DATES[stage]).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })} ({Math.max(0, daysUntil(stage))} dni)</div>
          <p className="mt-1 text-sm muted">
            Ostatnia aktywność: <b className="text-slate-800 dark:text-slate-100">{lastAct ? relTime(lastAct) : 'brak'}</b>. Tematy opanowane: <b className="text-slate-800 dark:text-slate-100">{mastered}</b>, dobre: <b className="text-slate-800 dark:text-slate-100">{good}</b> z {TOPICS.length}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Czas nauki (7 dni)" value={fmtDuration(weekSec)} sub={`łącznie ${fmtDuration(totalSec)}`} icon={<Clock className="h-4 w-4" />} />
        <Stat label="Sesje" value={p.sessions.length} sub={`${p.activeDays.length} dni aktywnych`} icon={<Timer className="h-4 w-4" />} />
        <Stat label="Pytania (7 dni)" value={weekN} sub={`łącznie ${total}`} icon={<Zap className="h-4 w-4" />} />
        <Stat label="Accuracy" value={`${acc}%`} sub={`w tym tygodniu ${pct(weekC, weekN)}%`} icon={<Target className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card card-pad">
          <h2 className="h2 mb-4">Minuty nauki - ostatnie 14 dni</h2>
          <BarChart color="#6366f1" data={daily.map((d) => ({ label: d.label, value: Math.round(d.sec / 60), sub: `${d.n} pytań` }))} format={(v) => `${v} min`} />
        </div>
        <div className="card card-pad">
          <h2 className="h2 mb-3">Mastery w kategoriach</h2>
          <div className="grid gap-3">
            {CATEGORIES.filter((c) => c.id !== 'hoeren').map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{c.namePl}</span><span className="font-bold tabular-nums">{categoryPercent(p, c.id)}%</span></div>
                <Bar value={categoryPercent(p, c.id)} color={c.hex} height="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card card-pad">
          <h2 className="h2 mb-3 flex items-center gap-2"><TrendingDown className="h-5 w-5 text-rose-500" /> Najsłabsze obszary</h2>
          {weak.length ? weak.map((w) => <Row key={w.id} label={w.label} v={w.percent} bad />) : <p className="text-sm muted">Za mało danych lub brak słabych obszarów.</p>}
        </div>
        <div className="card card-pad">
          <h2 className="h2 mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-500" /> Najmocniejsze obszary</h2>
          {strong.length ? strong.map((w) => <Row key={w.id} label={w.label} v={w.percent} />) : <p className="text-sm muted">Za mało danych.</p>}
        </div>
        <div className="card card-pad">
          <h2 className="h2 mb-3 flex items-center gap-2"><CalendarClock className="h-5 w-5 text-brand-500" /> Na następny tydzień</h2>
          <ul className="grid gap-2 text-sm">{weeklyRecommendations(p).map((r) => <li key={r} className="flex gap-2"><span className="text-brand-500">•</span>{r}</li>)}</ul>
        </div>
      </div>

      <div className="card card-pad">
        <h2 className="h2 mb-3 flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Historia próbnych konkursów</h2>
        {exams.length ? (
          <div className="grid gap-2">
            {exams.map((e) => (
              <Link key={e.id} to={`/konkurs?id=${e.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm hover:bg-brand-50 dark:bg-white/[0.03]">
                <span className="font-semibold">{STAGE_LABEL[e.stage]}</span>
                <span className="muted">{fmtDate(e.finishedAt, true)}</span>
                <span className="font-bold tabular-nums">{e.points}/{e.max} · {e.percent}%</span>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm muted">Brak próbnych konkursów.</p>}
      </div>
    </div>
  )
}

function Row({ label, v, bad }: { label: string; v: number; bad?: boolean }) {
  return (
    <div className="mb-2.5">
      <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{label}</span><span className={bad ? 'font-bold text-rose-500' : 'font-bold text-emerald-500'}>{v}%</span></div>
      <Bar value={v} color={bad ? '#f43f5e' : '#10b981'} height="h-1.5" />
    </div>
  )
}
