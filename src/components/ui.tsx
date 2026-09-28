import { Fragment, type ReactNode } from 'react'
import type { MasteryStatus } from '../types'
import { STATUS_LABEL } from '../engine/mastery'

export function cx(...c: (string | number | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

/** Mini-markdown: **pogrubienie** i nowe linie */
export function Md({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n')
  return (
    <span className={className}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i} className="font-bold text-slate-900 dark:text-white">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <Fragment key={i}>{part}</Fragment>
            ),
          )}
          {li < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </span>
  )
}

export function Ring({ value, size = 88, stroke = 9, color = '#6366f1', children, track }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode; track?: string }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={track ?? 'stroke-slate-200 dark:stroke-white/[0.07]'} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

export function Bar({ value, color, className, height = 'h-2' }: { value: number; color?: string; className?: string; height?: string }) {
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/[0.07]', height, className)}>
      <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color ?? '#6366f1' }} />
    </div>
  )
}

const STATUS_STYLE: Record<MasteryStatus, string> = {
  new: 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300',
  learning: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  weak: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  mastered: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
}

export function StatusBadge({ status }: { status: MasteryStatus }) {
  return <span className={cx('chip', STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>
}

export function Stat({ label, value, sub, icon, accent }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; accent?: string }) {
  return (
    <div className="card card-pad flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {icon && <span className={cx('rounded-lg p-1.5', accent ?? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300')}>{icon}</span>}
      </div>
      <div className="font-display text-2xl font-bold tabular-nums tracking-tight">{value}</div>
      {sub && <div className="text-xs muted">{sub}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, right, eyebrow }: { title: string; subtitle?: ReactNode; right?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-rise">
        {eyebrow && <div className="label mb-1 text-brand-600 dark:text-brand-300">{eyebrow}</div>}
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm muted sm:text-[15px]">{subtitle}</p>}
      </div>
      {right && <div className="flex shrink-0 flex-wrap gap-2">{right}</div>}
    </div>
  )
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="rounded-2xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{icon}</div>
      <div className="h2">{title}</div>
      <p className="max-w-md text-sm muted">{body}</p>
      {action}
    </div>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="scrollbar-none -mx-1 flex min-w-0 max-w-full gap-1 overflow-x-auto px-1">
      <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.05]">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              value === o.value ? 'bg-white text-slate-900 shadow-sm dark:bg-ink-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton', className)} />
}

export function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0
}

export function fmtDuration(sec: number) {
  if (sec < 60) return `${sec} s`
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)} h ${m % 60} min`
}

export function fmtDate(ts: number, withTime = false) {
  return new Date(ts).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) })
}

export function relTime(ts: number) {
  const d = Date.now() - ts
  const m = Math.round(d / 60000)
  if (m < 1) return 'przed chwilą'
  if (m < 60) return `${m} min temu`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h temu`
  const days = Math.round(h / 24)
  return days === 1 ? 'wczoraj' : `${days} dni temu`
}
