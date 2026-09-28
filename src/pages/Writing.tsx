import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BookOpen, Check, Eye, PenLine, Timer } from 'lucide-react'
import { WRITING_TASKS, writingChecks } from '../content/email'
import { cx, PageHeader } from '../components/ui'

export default function Writing() {
  const [i, setI] = useState(0)
  const [text, setText] = useState('')
  const [showModel, setShowModel] = useState(false)
  const [timer, setTimer] = useState<number | null>(null)
  const task = WRITING_TASKS[i]
  const checks = writingChecks(text)
  const words = text.trim().split(/\s+/).filter(Boolean).length

  useEffect(() => {
    if (timer == null || timer <= 0) return
    const t = setTimeout(() => setTimer((x) => (x == null ? x : x - 1)), 1000)
    return () => clearTimeout(t)
  }, [timer])

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Wypowiedź pisemna · zad. 9 etapu szkolnego"
        title="E-Mail & Blogeintrag"
        subtitle="5 z 40 punktów: po 1 pkt za każdy rozwinięty element treści + 2 pkt za poprawność (maks. 5 błędów). Ćwicz na czas: 15 minut na tekst."
        right={<Link to="/nauka/email" className="btn-secondary"><BookOpen className="h-4 w-4" /> Lekcja: struktura</Link>}
      />
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {WRITING_TASKS.map((t, k) => (
          <button key={t.id} onClick={() => { setI(k); setText(''); setShowModel(false); setTimer(null) }} className={cx('chip shrink-0 border-2 px-3 py-1.5 text-sm', k === i ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-200 dark:border-white/10')}>
            {k + 1}. {t.kind}
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="card card-pad">
            <p className="text-[15px] font-semibold">{task.situation} W swojej wypowiedzi:</p>
            <ul className="mt-2 grid gap-1.5 text-[15px]">{task.points.map((p, k) => <li key={k} className="flex gap-2"><span className="font-bold text-pink-500">{k + 1}.</span>{p}</li>)}</ul>
            <p className="mt-2 text-sm muted">Podpisz się jako XYZ.</p>
          </div>
          <div className="card card-pad">
            <div className="mb-2 flex items-center justify-between">
              <span className="label">Twój tekst · {words} słów</span>
              <button className={cx('btn px-3 py-1.5 text-xs', timer != null && timer < 120 ? 'bg-rose-500 text-white' : 'btn-secondary')} onClick={() => setTimer(timer == null ? 15 * 60 : null)}>
                <Timer className="h-3.5 w-3.5" /> {timer == null ? 'Start 15:00' : `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`}
              </button>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={13} spellCheck={false} autoCorrect="off" autoCapitalize="off" className="field leading-relaxed" placeholder={task.kind === 'Blogeintrag' ? 'Liebe Leserinnen und Leser,' : 'Lieber …, / Liebe …,'} />
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="card card-pad">
            <h3 className="h2 mb-3 flex items-center gap-2"><PenLine className="h-4 w-4 text-pink-500" /> Kontrola techniczna</h3>
            <div className="grid gap-2 text-sm">
              {checks.map((c) => (
                <div key={c.label} className={cx('flex items-start gap-2', c.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                  {c.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}{c.label}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/[0.03]">
              <b>Samoocena treści:</b> czy każdy z 3 punktów ma co najmniej 2 zdania (informacja + szczegół/uzasadnienie)? Jeśli któryś jest tylko „wspomniany” - na konkursie nie dostaniesz za niego punktu.
            </div>
          </div>
          <div className="card card-pad">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="h2">Wzór i zwroty</h3>
              <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setShowModel((s) => !s)}><Eye className="h-3.5 w-3.5" /> {showModel ? 'Ukryj' : 'Pokaż wzór'}</button>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">{task.phrases.map((ph) => <span key={ph} className="chip-muted">{ph}</span>)}</div>
            {showModel && <div className="animate-rise whitespace-pre-wrap rounded-xl bg-pink-50 p-3 text-[15px] leading-relaxed dark:bg-pink-500/10">{task.model}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
