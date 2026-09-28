import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Award, Clock, Flame, Target, Timer, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CATEGORIES, STAGE_LABEL } from '../content/categories'
import { TOPICS } from '../content/topics'
import { QUESTIONS } from '../content'
import { dayKey, streakDays, topicPercent, topicStatus } from '../engine/mastery'
import { ACHIEVEMENTS, levelFromXp, levelTitle } from '../engine/gamification'
import { BarChart, LineChart } from '../components/Charts'
import { Bar, cx, fmtDuration, PageHeader, pct, Stat, StatusBadge } from '../components/ui'
import type { ProgressData } from '../types'

export function useDaily(p: ProgressData, days = 14) {
  return useMemo(() => {
    const out: { key: string; label: string; n: number; correct: number; sec: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000)
      const key = dayKey(d.getTime())
      out.push({ key, label: d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' }), n: 0, correct: 0, sec: 0 })
    }
    const idx = Object.fromEntries(out.map((o, i) => [o.key, i]))
    for (const a of p.attempts) {
      const i = idx[dayKey(a.at)]
      if (i != null) {
        out[i].n++
        if (a.correct) out[i].correct++
      }
    }
    for (const s of p.sessions) {
      const i = idx[dayKey(s.startedAt)]
      if (i != null) out[i].sec += s.activeSec
    }
    return out
  }, [p.attempts, p.sessions, days])
}

export default function Stats() {
  const p = useStore((s) => s.p)
  const daily = useDaily(p)
  const total = p.attempts.length
  const correct = p.attempts.filter((a) => a.correct).length
  const time = p.sessions.reduce((s, x) => s + x.activeSec, 0)
  const lvl = levelFromXp(p.xp)
  const seen = Object.keys(p.qstates).length
  const byCat = CATEGORIES.map((c) => {
    const a = p.attempts.filter((x) => x.category === c.id)
    return { c, n: a.length, acc: pct(a.filter((x) => x.correct).length, a.length) }
  }).filter((x) => x.n > 0)
  const exams = [...p.exams].sort((a, b) => a.finishedAt - b.finishedAt)
  const topics = TOPICS.map((t) => ({ t, st: p.topics[t.id] })).filter((x) => x.st && x.st.attempts > 0).sort((a, b) => (a.st!.ewma - b.st!.ewma))

  return (
    <div className="flex flex-col gap-5">
      <PageHeader eyebrow="Statystyki" title="Twoje postępy w liczbach" subtitle="Accuracy liczone ze wszystkich odpowiedzi. Mastery tematu to średnia krocząca - ostatnie odpowiedzi ważą więcej." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Pytania" value={total} icon={<Zap className="h-4 w-4" />} />
        <Stat label="Accuracy" value={`${pct(correct, total)}%`} icon={<Target className="h-4 w-4" />} />
        <Stat label="Czas nauki" value={fmtDuration(time)} icon={<Clock className="h-4 w-4" />} />
        <Stat label="Sesje" value={p.sessions.length} icon={<Timer className="h-4 w-4" />} />
        <Stat label="Streak" value={streakDays(p.activeDays)} sub="dni z rzędu" icon={<Flame className="h-4 w-4" />} />
        <Stat label="Poziom" value={lvl.level} sub={levelTitle(lvl.level)} icon={<Award className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card card-pad">
          <h2 className="h2 mb-4">Pytania dziennie (14 dni)</h2>
          <BarChart data={daily.map((d) => ({ label: d.label, value: d.n, sub: d.n ? `${pct(d.correct, d.n)}% poprawnie` : undefined }))} />
        </div>
        <div className="card card-pad">
          <h2 className="h2 mb-4">Minuty nauki dziennie</h2>
          <BarChart color="#f59e0b" data={daily.map((d) => ({ label: d.label, value: Math.round(d.sec / 60) }))} format={(v) => `${v} min`} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card card-pad">
          <h2 className="h2 mb-4">Accuracy według kategorii</h2>
          {byCat.length ? (
            <div className="grid gap-3">
              {byCat.map(({ c, n, acc }) => (
                <div key={c.id}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{c.name}</span><span className="tabular-nums"><b>{acc}%</b> <span className="muted">({n})</span></span></div>
                  <Bar value={acc} color={c.hex} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm muted">Brak danych.</p>}
        </div>
        <div className="card card-pad">
          <h2 className="h2 mb-2">Próbne konkursy</h2>
          {exams.length ? (
            <LineChart points={exams.slice(-10).map((e) => ({ label: `${e.stage[0].toUpperCase()} ${new Date(e.finishedAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' })}`, value: e.percent }))} thresholds={[{ value: 85, label: 'próg rejonowy 85%', color: '#10b981' }, { value: 90, label: 'laureat 90%', color: '#8b5cf6' }]} />
          ) : <p className="text-sm muted">Zrób pierwszy próbny konkurs, aby zobaczyć wykres.</p>}
          <div className="mt-3 text-sm muted">Pokrycie banku pytań: <b className="text-slate-800 dark:text-slate-100">{seen}/{QUESTIONS.length}</b> ({pct(seen, QUESTIONS.length)}%)</div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <h2 className="h2 p-4 pb-2">Mastery tematów</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs muted"><tr><th className="px-4 py-2">Temat</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Próby</th><th className="w-1/3 px-4 py-2">Mastery</th></tr></thead>
            <tbody>
              {topics.map(({ t, st }) => (
                <tr key={t.id} className="border-t border-slate-100 dark:border-white/[0.05]">
                  <td className="px-4 py-2 font-semibold"><Link to={t.lesson ? `/nauka/${t.id}` : `/trening?mode=topic&topic=${t.id}&n=10`} className="hover:text-brand-600">{t.title}</Link></td>
                  <td className="px-4 py-2"><StatusBadge status={topicStatus(st)} /></td>
                  <td className="px-4 py-2 tabular-nums">{st!.correct}/{st!.attempts}</td>
                  <td className="px-4 py-2"><div className="flex items-center gap-2"><Bar value={topicPercent(st)} height="h-1.5" /><span className="w-9 text-right text-xs font-bold">{topicPercent(st)}%</span></div></td>
                </tr>
              ))}
              {!topics.length && <tr><td colSpan={4} className="px-4 py-6 text-center muted">Brak danych.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-pad">
        <h2 className="h2 mb-4">Osiągnięcia ({Object.keys(p.achievements).length}/{ACHIEVEMENTS.length})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const got = p.achievements[a.id]
            return (
              <div key={a.id} className={cx('flex flex-col items-center gap-1 rounded-2xl border p-3 text-center', got ? 'border-amber-300/60 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-500/10' : 'border-slate-200 opacity-50 grayscale dark:border-white/10')}>
                <span className="text-3xl">{a.icon}</span>
                <span className="text-sm font-bold">{a.title}</span>
                <span className="text-[11px] muted">{a.desc}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="text-center text-xs muted">Aktualny etap w planie: {STAGE_LABEL[p.profile.targetStage]}</div>
    </div>
  )
}
