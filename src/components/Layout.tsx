import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Cloud,
  CloudOff,
  Dumbbell,
  Flame,
  Globe2,
  Landmark,
  LayoutDashboard,
  Menu,
  PenLine,
  RotateCcw,
  Settings,
  Trophy,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { levelFromXp } from '../engine/gamification'
import { streakDays } from '../engine/mastery'
import { openMistakes, dueCount } from '../engine/session'
import { cx } from './ui'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
  badge?: number
}

export function useNav(): NavItem[][] {
  const p = useStore((s) => s.p)
  return [
    [
      { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
      { to: '/plan', label: 'Plan nauki', icon: <CalendarDays className="h-[18px] w-[18px]" /> },
      { to: '/nauka', label: 'Nauka', icon: <BookOpen className="h-[18px] w-[18px]" /> },
      { to: '/trening', label: 'Trening', icon: <Dumbbell className="h-[18px] w-[18px]" /> },
      { to: '/bledy', label: 'Moje błędy', icon: <TriangleAlert className="h-[18px] w-[18px]" />, badge: openMistakes(p) },
      { to: '/powtorki', label: 'Powtórki', icon: <RotateCcw className="h-[18px] w-[18px]" />, badge: dueCount(p) },
      { to: '/konkurs', label: 'Próbny konkurs', icon: <Trophy className="h-[18px] w-[18px]" /> },
    ],
    [
      { to: '/landeskunde', label: 'Landeskunde', icon: <Globe2 className="h-[18px] w-[18px]" /> },
      { to: '/unesco', label: 'UNESCO / rejonowy', icon: <Landmark className="h-[18px] w-[18px]" /> },
      { to: '/pisanie', label: 'E-Mail', icon: <PenLine className="h-[18px] w-[18px]" /> },
    ],
    [
      { to: '/statystyki', label: 'Statystyki', icon: <BarChart3 className="h-[18px] w-[18px]" /> },
      { to: '/rodzic', label: 'Postęp Adama', icon: <Users className="h-[18px] w-[18px]" /> },
      { to: '/ustawienia', label: 'Ustawienia', icon: <Settings className="h-[18px] w-[18px]" /> },
    ],
  ]
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 font-display text-sm font-bold text-white shadow-glow">AD</div>
      <div className="leading-tight">
        <div className="font-display text-[15px] font-bold tracking-tight">ADAM DEUTSCH TRAINER</div>
        <div className="text-[11px] font-semibold muted">Konkurs Kuratoryjny 2026/27</div>
      </div>
    </div>
  )
}

function PlayerChip() {
  const p = useStore((s) => s.p)
  const sync = useStore((s) => s.sync)
  const lvl = levelFromXp(p.xp)
  const streak = streakDays(p.activeDays)
  return (
    <div className="flex items-center gap-3 text-sm font-bold">
      <span className="flex items-center gap-1 text-orange-500" title="Dni nauki z rzędu">
        <Flame className="h-4 w-4" />
        {streak}
      </span>
      <span className="flex items-center gap-1.5" title={`Poziom ${lvl.level} · ${p.xp} XP`}>
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400 text-[11px] font-extrabold text-amber-950">{lvl.level}</span>
        <span className="tabular-nums text-amber-600 dark:text-amber-400">{p.xp} XP</span>
      </span>
      <span title={sync === 'synced' ? 'Zsynchronizowano z chmurą' : sync === 'local' ? 'Zapis lokalny (ta przeglądarka)' : sync === 'error' ? 'Błąd synchronizacji' : 'Synchronizacja…'} className="text-slate-400">
        {sync === 'local' || sync === 'error' ? <CloudOff className="h-4 w-4" /> : <Cloud className={cx('h-4 w-4', sync === 'synced' && 'text-emerald-500')} />}
      </span>
    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const groups = useNav()
  return (
    <nav className="flex flex-col gap-5">
      {groups.map((g, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {gi === 1 && <div className="label mb-1 px-3">Moduły konkursowe</div>}
          {gi === 2 && <div className="label mb-1 px-3">Analiza</div>}
          {g.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cx(
                  'group flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-semibold transition',
                  isActive ? 'bg-brand-500 text-white shadow-glow' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white',
                )
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {!!item.badge && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{item.badge > 99 ? '99+' : item.badge}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

const MOBILE = [
  { to: '/', label: 'Start', icon: LayoutDashboard },
  { to: '/nauka', label: 'Nauka', icon: BookOpen },
  { to: '/trening', label: 'Trening', icon: Dumbbell },
  { to: '/konkurs', label: 'Konkurs', icon: Trophy },
]

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => setOpen(false), [loc.pathname])
  const inSession = /^\/(trening|konkurs)/.test(loc.pathname) && /mode=|stage=/.test(loc.search)

  return (
    <div className="min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-6 border-r border-slate-200/80 bg-white/80 px-4 py-5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink-900/80 lg:flex">
        <Brand />
        <div className="scrollbar-none -mx-1 flex-1 overflow-y-auto px-1">
          <NavLinks />
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
          <PlayerChip />
        </div>
      </aside>

      {/* Top bar mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-[#f5f6fa]/85 px-4 py-2.5 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink-950/85 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 font-display text-[11px] font-bold text-white">AD</div>
          <div className="font-display text-sm font-bold tracking-tight">Deutsch Trainer</div>
        </div>
        <PlayerChip />
      </header>

      <main className={cx('px-4 pb-28 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-8')}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Bottom nav mobile */}
      {!inSession && (
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-white/[0.06] dark:bg-ink-900/90 lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            {MOBILE.map((m) => (
              <NavLink key={m.to} to={m.to} end={m.to === '/'} className={({ isActive }) => cx('flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold', isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500')}>
                <m.icon className="h-5 w-5" />
                {m.label}
              </NavLink>
            ))}
            <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-slate-500">
              <Menu className="h-5 w-5" />
              Więcej
            </button>
          </div>
        </nav>
      )}

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[82%] max-w-xs animate-rise flex-col gap-5 overflow-y-auto bg-white p-5 dark:bg-ink-900">
            <div className="flex items-center justify-between">
              <Brand />
              <button className="btn-ghost px-2" onClick={() => setOpen(false)} aria-label="Zamknij">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
      <Toasts />
    </div>
  )
}

function Toasts() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)
  useEffect(() => {
    if (!toasts.length) return
    const t = setTimeout(() => dismiss(toasts[0].id), 4500)
    return () => clearTimeout(t)
  }, [toasts, dismiss])
  if (!toasts.length) return null
  const t = toasts[0]
  return (
    <div className="fixed inset-x-0 top-3 z-[60] flex justify-center px-4">
      <button onClick={() => dismiss(t.id)} className="flex animate-pop items-center gap-3 rounded-2xl border border-amber-300/60 bg-white px-4 py-3 text-left shadow-2xl dark:border-amber-400/30 dark:bg-ink-800">
        <span className="text-2xl">{t.icon}</span>
        <span>
          <span className="block text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t.title}</span>
          <span className="block text-sm font-semibold">{t.body}</span>
        </span>
      </button>
    </div>
  )
}
