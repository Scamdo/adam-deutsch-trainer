import { useState } from 'react'

export function BarChart({ data, height = 160, color = '#6366f1', format = (v: number) => String(v) }: { data: { label: string; value: number; sub?: string }[]; height?: number; color?: string; format?: (v: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className="relative">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0, background: color, opacity: hover == null || hover === i ? 1 : 0.45 }} />
            {hover === i && (
              <div className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow">
                {format(d.value)}{d.sub ? ` · ${d.sub}` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="min-w-0 flex-1 truncate text-center text-[10px] muted">{d.label}</div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ points, height = 160, min = 0, max = 100, color = '#10b981', thresholds = [] }: { points: { label: string; value: number }[]; height?: number; min?: number; max?: number; color?: string; thresholds?: { value: number; label: string; color: string }[] }) {
  const w = 600
  const h = height
  const pad = 22
  if (!points.length) return null
  const x = (i: number) => (points.length === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (points.length - 1))
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - 2 * pad)
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join('')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
      {thresholds.map((t) => (
        <g key={t.label}>
          <line x1={pad} x2={w - pad} y1={y(t.value)} y2={y(t.value)} stroke={t.color} strokeDasharray="5 5" strokeWidth={1.5} opacity={0.7} />
          <text x={w - pad} y={y(t.value) - 4} textAnchor="end" fontSize={11} fill={t.color} fontWeight={700}>{t.label}</text>
        </g>
      ))}
      <path d={`${d}L${x(points.length - 1)},${h - pad}L${x(0)},${h - pad}Z`} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r={5} fill={color} stroke="white" strokeWidth={2} />
          <text x={x(i)} y={y(p.value) - 10} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-slate-700 dark:fill-slate-200">{p.value}</text>
          <text x={x(i)} y={h - 5} textAnchor="middle" fontSize={10} className="fill-slate-400">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}
