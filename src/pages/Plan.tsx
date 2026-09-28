import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Circle, Flag, Target } from 'lucide-react'
import { useStore } from '../store/useStore'
import { STAGE_DATES, STAGE_FORMAT, STAGE_LABEL } from '../content/categories'
import { TOPIC_BY_ID } from '../content/topics'
import { currentStage, dailyPlan, daysUntil, planPhases, readiness, weeklyRecommendations } from '../engine/plan'
import { topicPercent } from '../engine/mastery'
import { Bar, cx, PageHeader, Ring } from '../components/ui'
import type { Stage } from '../types'

export default function Plan() {
  const p = useStore((s) => s.p)
  const update = useStore((s) => s.updateProfile)
  const stage = currentStage()
  const phases = planPhases()
  const today = dailyPlan(p)
  const weekly = weeklyRecommendations(p)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Plan nauki" title="Droga do laureata" subtitle="Plan oparty na oficjalnym harmonogramie MKO 2026/27. Aktualny etap jest podświetlony, a rekomendacje zmieniają się na podstawie Twoich wyników." />

      {/* Oś czasu etapów */}
      <div className="grid gap-3 md:grid-cols-3">
        {(['szkolny', 'rejonowy', 'wojewodzki'] as Stage[]).map((s) => {
          const d = daysUntil(s)
          const active = s === stage
          const r = readiness(p, s)
          return (
            <div key={s} className={cx('card card-pad relative overflow-hidden', active && 'ring-2 ring-brand-500')}>
              {active && <span className="chip absolute right-3 top-3 bg-brand-500 text-white">Teraz</span>}
              <div className="label">{new Date(STAGE_DATES[s]).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div className="mt-1 font-display text-xl font-bold">{STAGE_LABEL[s]}</div>
              <div className="mt-1 text-sm muted">{STAGE_FORMAT[s].points} pkt · {STAGE_FORMAT[s].minutes} min · {STAGE_FORMAT[s].threshold}</div>
              <div className="mt-4 flex items-center gap-4">
                <Ring value={r} size={64} stroke={7}>
                  <span className="text-sm font-bold">{r}%</span>
                </Ring>
                <div className="text-sm">
                  <div className="font-display text-2xl font-bold">{d > 0 ? d : 0}</div>
                  <div className="muted">{d > 0 ? 'dni do startu' : 'zakończony / dziś'}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card card-pad lg:col-span-2">
          <h2 className="h2 mb-3 flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-brand-500" /> Dziś</h2>
          <div className="grid gap-2">
            {today.map((t) => (
              <Link key={t.id} to={t.to} className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                {t.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />}
                <span className="flex-1 text-sm font-semibold">{t.label}</span>
                <span className="text-xs muted">~{t.minutes} min</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/[0.05]">
            <div className="label mb-2">Cel dzienny (pytania)</div>
            <div className="flex gap-2">
              {[15, 25, 40, 60].map((g) => (
                <button key={g} onClick={() => update({ dailyGoal: g })} className={cx('btn flex-1 border-2 px-2 py-1.5', p.profile.dailyGoal === g ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200' : 'border-slate-200 dark:border-white/10')}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/[0.05]">
            <div className="label mb-2">Priorytety na ten tydzień</div>
            <ul className="grid gap-1.5 text-sm">
              {weekly.map((w) => (
                <li key={w} className="flex gap-2"><Target className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-3">
          {phases.map((ph) => (
            <div key={ph.stage} className={cx('card card-pad', ph.stage !== stage && 'opacity-80')}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="h2 flex items-center gap-2"><Flag className="h-4 w-4 text-brand-500" />{ph.title}</h3>
                <span className="chip-muted">{fmt(ph.from)} – {fmt(ph.to)}</span>
              </div>
              <p className="mt-2 text-sm font-medium">{ph.goal}</p>
              <div className="mt-3 grid gap-2">
                {ph.focus.map((f) => {
                  const pctv = f.topicIds ? Math.round(f.topicIds.reduce((s, id) => s + topicPercent(p.topics[id]), 0) / f.topicIds.length) : null
                  return (
                    <Link key={f.label} to={f.to} className="rounded-xl border border-slate-100 p-3 transition hover:border-brand-300 dark:border-white/[0.05]">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-semibold">{f.label}</span>
                        {pctv != null && <span className="font-bold tabular-nums">{pctv}%</span>}
                      </div>
                      {pctv != null && <Bar value={pctv} className="mt-2" height="h-1.5" />}
                      {f.topicIds && <div className="mt-1.5 text-xs muted">{f.topicIds.map((t) => TOPIC_BY_ID[t]?.title).join(' · ')}</div>}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
                <div className="label mb-1.5">Rytm tygodnia</div>
                <ul className="grid gap-1 text-sm">
                  {ph.weekly.map((w) => (
                    <li key={w}>• {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const fmt = (d: string) => new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
