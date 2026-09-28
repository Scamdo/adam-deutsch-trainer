import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, Clock, Flame, Medal, Target, TriangleAlert, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CATEGORIES, STAGE_FORMAT, STAGE_LABEL } from '../content/categories'
import { categoryPercent, currentStage, dailyPlan, daysUntil, readiness, recommend, STAGE_WEIGHTS, weakAreas } from '../engine/plan'
import { levelFromXp, levelTitle } from '../engine/gamification'
import { streakDays, topicStatus } from '../engine/mastery'
import { openMistakes } from '../engine/session'
import { Bar, cx, fmtDuration, relTime, Ring, Stat, StatusBadge } from '../components/ui'
import type { CategoryId } from '../types'

export default function Dashboard() {
  const p = useStore((s) => s.p)
  const stage = currentStage()
  const days = daysUntil(stage)
  const ready = readiness(p, stage)
  const rec = recommend(p)
  const plan = dailyPlan(p)
  const weak = weakAreas(p, 5)
  const lvl = levelFromXp(p.xp)
  const total = p.attempts.length
  const correct = p.attempts.filter((a) => a.correct).length
  const acc = total ? Math.round((correct / total) * 100) : 0
  const last = p.sessions[p.sessions.length - 1]
  const best = p.exams.length ? p.exams.reduce((a, b) => (b.percent > a.percent ? b : a)) : null
  const mistakes = openMistakes(p)
  const cats = CATEGORIES.filter((c) => STAGE_WEIGHTS[stage][c.id] || c.id === 'landeskunde' || c.id === 'unesco')
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend'

  return (
    <div className="flex flex-col gap-5">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1f3b] via-[#272a5e] to-[#3b2a6b] p-5 text-white shadow-xl sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold text-white/60">{greet}, {p.profile.name}!</div>
            <h1 className="font-display text-2xl font-bold leading-tight sm:text-[32px]">
              {days > 0 ? (
                <>
                  {STAGE_LABEL[stage]} za <span className="text-amber-300">{days} {days === 1 ? 'dzień' : 'dni'}</span>
                </>
              ) : days === 0 ? (
                <>Dziś {STAGE_LABEL[stage].toLowerCase()}! Viel Erfolg!</>
              ) : (
                <>{STAGE_LABEL[stage]}</>
              )}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-white/10 px-3 py-1">{STAGE_FORMAT[stage].points} pkt · {STAGE_FORMAT[stage].minutes} min · {STAGE_FORMAT[stage].tasks} zadań</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{STAGE_FORMAT[stage].threshold}</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-display font-bold text-amber-950">{lvl.level}</span>
              <div className="w-48">
                <div className="flex justify-between text-xs font-semibold text-white/70">
                  <span>{levelTitle(lvl.level)}</span>
                  <span>{lvl.current}/{lvl.next} XP</span>
                </div>
                <Bar value={lvl.progress * 100} color="#fbbf24" className="mt-1 bg-white/15" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Ring value={ready} size={132} stroke={12} color="#a5b4fc" track="stroke-white/10">
              <span className="font-display text-4xl font-bold">{ready}%</span>
              <span className="text-[11px] font-semibold text-white/60">przygotowania</span>
            </Ring>
          </div>
        </div>
      </section>

      {/* REKOMENDACJA */}
      <Link to={rec.to} className={cx('card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5', rec.tone === 'urgent' && 'ring-2 ring-rose-400/60', rec.tone === 'focus' && 'ring-2 ring-brand-400/60')}>
        <div className={cx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white', rec.tone === 'urgent' ? 'bg-rose-500' : 'bg-brand-500')}>
          <Target className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="label text-brand-600 dark:text-brand-300">Co powinieneś zrobić teraz?</div>
          <div className="font-display text-lg font-bold leading-snug">{rec.title}</div>
          <div className="text-sm muted">{rec.reason}</div>
        </div>
        <span className="btn-primary hidden shrink-0 sm:inline-flex">
          {rec.cta} <ArrowRight className="h-4 w-4" />
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-brand-500 sm:hidden" />
      </Link>

      {/* STATY */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pytania" value={total} sub={`${correct} poprawnych`} icon={<Zap className="h-4 w-4" />} />
        <Stat label="Accuracy" value={`${acc}%`} sub="wszystkie odpowiedzi" icon={<Target className="h-4 w-4" />} accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300" />
        <Stat label="Streak" value={`${streakDays(p.activeDays)} dni`} sub={`${p.activeDays.length} dni nauki łącznie`} icon={<Flame className="h-4 w-4" />} accent="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300" />
        <Stat
          label="Najlepszy próbny"
          value={best ? `${best.percent}%` : '—'}
          sub={best ? `${best.points}/${best.max} pkt · ${STAGE_LABEL[best.stage].toLowerCase()}` : 'jeszcze brak'}
          icon={<Medal className="h-4 w-4" />}
          accent="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-5">
        {/* PLAN DNIA */}
        <div className="card card-pad lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="h2">Dzisiejszy plan</h2>
            <Link to="/plan" className="text-sm font-semibold text-brand-600 dark:text-brand-300">Cały plan →</Link>
          </div>
          <div className="grid gap-2">
            {plan.map((t) => (
              <Link key={t.id} to={t.to} className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                {t.done ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" /> : <Circle className="h-6 w-6 shrink-0 text-slate-300 dark:text-slate-600" />}
                <div className="min-w-0 flex-1">
                  <div className={cx('font-semibold', t.done && 'text-slate-400 line-through')}>{t.label}</div>
                  <div className="flex items-center gap-2">
                    <Bar value={t.progress * 100} className="max-w-[180px]" height="h-1.5" color={t.done ? '#10b981' : undefined} />
                    <span className="text-xs muted">{t.detail}</span>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs muted">
                  <Clock className="h-3.5 w-3.5" />~{t.minutes} min
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-sm dark:border-white/[0.05]">
            <Link to="/bledy" className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <TriangleAlert className="h-4 w-4" /> {mistakes} błędów do powtórki
            </Link>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-slate-600 dark:bg-white/[0.03] dark:text-slate-300">
              <Clock className="h-4 w-4" />
              <span className="truncate">{last ? `Ostatnio: ${last.label}, ${relTime(last.endedAt)} (${fmtDuration(last.activeSec)})` : 'Brak sesji'}</span>
            </div>
          </div>
        </div>

        {/* SŁABE OBSZARY */}
        <div className="card card-pad lg:col-span-2">
          <h2 className="h2 mb-3">Obszary do poprawy</h2>
          {weak.length === 0 ? (
            <p className="text-sm muted">{total < 20 ? 'Rozwiąż kilkanaście pytań - system automatycznie wykryje słabsze obszary.' : 'Brak wyraźnie słabych obszarów. Tak trzymaj!'}</p>
          ) : (
            <div className="grid gap-2.5">
              {weak.map((w) => (
                <Link key={w.id} to={`/trening?mode=topic&topic=${w.topicId}&n=10`} className="group rounded-xl border border-slate-100 p-3 transition hover:border-brand-300 dark:border-white/[0.05] dark:hover:border-brand-400/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{w.label}</span>
                    <span className={cx('text-sm font-bold tabular-nums', w.percent < 60 ? 'text-rose-500' : 'text-amber-500')}>{w.percent}%</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs muted">
                    <span>{w.percent < 60 ? 'powtórz' : 'utrwal'}{w.due ? ` · ${w.due} do powtórki` : ''}</span>
                    <span className="opacity-0 transition group-hover:opacity-100">Trenuj →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KATEGORIE */}
      <section className="card card-pad">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="h2">Postęp w kategoriach</h2>
          <span className="text-xs muted">wagi wg arkuszy: {STAGE_LABEL[stage].toLowerCase()}</span>
        </div>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {cats.map((c) => {
            const v = categoryPercent(p, c.id as CategoryId)
            const w = STAGE_WEIGHTS[stage][c.id]
            return (
              <div key={c.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.hex }} />
                    {c.name}
                    <span className="font-normal muted">{c.namePl}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {w ? <span className="text-[11px] muted">{Math.round(w * 100)}% pkt</span> : null}
                    <span className="font-bold tabular-nums">{v}%</span>
                  </span>
                </div>
                <Bar value={v} color={c.hex} />
              </div>
            )
          })}
        </div>
        <TopicStatusStrip />
      </section>
    </div>
  )
}

function TopicStatusStrip() {
  const p = useStore((s) => s.p)
  const topics = Object.entries(p.topics).filter(([, t]) => t.attempts >= 3)
  if (!topics.length) return null
  const counts = { weak: 0, learning: 0, good: 0, mastered: 0 }
  for (const [, t] of topics) {
    const s = topicStatus(t)
    if (s in counts) counts[s as keyof typeof counts]++
  }
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-sm dark:border-white/[0.05]">
      <span className="mr-1 muted">Tematy:</span>
      {(['mastered', 'good', 'learning', 'weak'] as const).map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <StatusBadge status={s} />
          <b className="tabular-nums">{counts[s]}</b>
        </span>
      ))}
    </div>
  )
}
