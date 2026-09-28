import { useMemo, useState } from 'react'
import { MAPS, type MapDef } from '../data/maps'
import { cx } from './ui'

export interface MapPoint {
  id: string
  lat: number
  lon: number
  label: string
  color?: string
  active?: boolean
  dim?: boolean
}

export function project(map: MapDef, lat: number, lon: number): [number, number] {
  return [(lon - map.lon0) * map.c * map.k + map.pad, (map.lat1 - lat) * map.k + map.pad]
}

interface Props {
  which: 'DE' | 'AT' | 'CH' | 'DACH'
  points?: MapPoint[]
  highlight?: string[] // ISO regionów do wyróżnienia
  regionColor?: (iso: string) => string | undefined
  onRegionClick?: (iso: string) => void
  onPointClick?: (id: string) => void
  showLabels?: boolean
  className?: string
  interactiveRegions?: boolean
  noTooltip?: boolean
}

/** Mapa SVG (granice: Natural Earth, domena publiczna) z punktami obiektów */
export function MapView({ which, points = [], highlight = [], regionColor, onRegionClick, onPointClick, showLabels, className, interactiveRegions, noTooltip }: Props) {
  const map = MAPS[which]
  const [hover, setHover] = useState<string | null>(null)
  const centroids = useMemo(() => {
    const out: Record<string, [number, number]> = {}
    for (const r of map.regions) {
      const nums = r.d.match(/-?\d+\.?\d*/g)?.map(Number) ?? []
      let sx = 0
      let sy = 0
      let n = 0
      for (let i = 0; i + 1 < nums.length; i += 2) {
        sx += nums[i]
        sy += nums[i + 1]
        n++
      }
      out[r.iso] = [sx / n, sy / n]
    }
    return out
  }, [map])
  const hoverName = hover ? map.regions.find((r) => r.iso === hover)?.name : null
  const activePoint = points.find((p) => p.active)

  return (
    <div className={cx('relative', className)}>
      <svg viewBox={`0 0 ${map.width} ${map.height}`} className="h-auto w-full select-none" role="img" aria-label="Mapa">
        <g>
          {map.regions.map((r) => {
            const hi = highlight.includes(r.iso)
            const custom = regionColor?.(r.iso)
            return (
              <path
                key={r.iso}
                d={r.d}
                onMouseEnter={() => setHover(r.iso)}
                onMouseLeave={() => setHover((h) => (h === r.iso ? null : h))}
                onClick={() => onRegionClick?.(r.iso)}
                className={cx(
                  'stroke-white transition-colors duration-200 dark:stroke-ink-950',
                  custom ? '' : hi ? 'fill-brand-500/80' : r.country === 'DE' || which !== 'DACH' ? 'fill-slate-200 dark:fill-ink-700' : 'fill-slate-100 dark:fill-ink-800',
                  (onRegionClick || interactiveRegions) && 'cursor-pointer hover:fill-brand-300 dark:hover:fill-brand-500/50',
                )}
                style={custom ? { fill: custom } : undefined}
                strokeWidth={which === 'CH' ? 1.2 : 1.4}
                strokeLinejoin="round"
              />
            )
          })}
        </g>
        {showLabels &&
          map.regions.map((r) => {
            const [x, y] = centroids[r.iso]
            return (
              <text key={r.iso} x={x} y={y} textAnchor="middle" className="pointer-events-none fill-slate-600 text-[9px] font-semibold dark:fill-slate-300">
                {r.name.length > 14 ? r.iso.split('-')[1] : r.name}
              </text>
            )
          })}
        {points.map((p) => {
          const [x, y] = project(map, p.lat, p.lon)
          return (
            <g key={p.id} transform={`translate(${x},${y})`} onClick={() => onPointClick?.(p.id)} className={cx(onPointClick && 'cursor-pointer')} opacity={p.dim ? 0.35 : 1}>
              {p.active && <circle r={14} className="animate-ping fill-brand-500/30" style={{ transformOrigin: 'center', transformBox: 'fill-box' }} />}
              <circle r={p.active ? 8 : 5.5} fill={p.color ?? '#10b981'} stroke="white" strokeWidth={2} />
              <title>{p.label}</title>
            </g>
          )
        })}
      </svg>
      {!noTooltip && (hoverName || activePoint) && (
        <div className="pointer-events-none absolute left-2 top-2 rounded-lg bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {activePoint ? activePoint.label : hoverName}
        </div>
      )}
    </div>
  )
}
