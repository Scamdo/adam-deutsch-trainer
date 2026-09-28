import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Crosshair, Dumbbell, MapPin, RotateCcw, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { BUNDESLAENDER, FACTS, OESTERREICH_LAENDER, type Region } from '../content/dach'
import { MAPS } from '../data/maps'
import { MapView } from '../components/MapView'
import { cx, PageHeader, Segmented } from '../components/ui'
import { topicPercent } from '../engine/mastery'
import { TOPICS } from '../content/topics'
import { Bar } from '../components/ui'

type Country = 'DE' | 'AT' | 'CH'

export default function Landeskunde() {
  const p = useStore((s) => s.p)
  const [country, setCountry] = useState<Country>('DE')
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore')
  const lkTopics = TOPICS.filter((t) => t.category === 'landeskunde')

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Landeskunde D-A-CH"
        title="Deutschland · Österreich · Schweiz"
        subtitle="Zakres z programu: podstawowe (szkolny) i szerokie (rejonowy, wojewódzki) wiadomości z geografii, historii i kultury. Priorytet: to, o co faktycznie pytały arkusze."
        right={<Link to="/trening?mode=adaptive&cat=landeskunde&n=15" className="btn-primary"><Dumbbell className="h-4 w-4" /> Trening Landeskunde</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-5">
        {lkTopics.map((t) => (
          <Link key={t.id} to={`/trening?mode=topic&topic=${t.id}&n=10`} className="card card-pad transition hover:-translate-y-0.5">
            <div className="text-sm font-bold">{t.title}</div>
            <div className="mt-2 flex items-center gap-2">
              <Bar value={topicPercent(p.topics[t.id])} color="#f59e0b" height="h-1.5" />
              <span className="text-xs font-bold tabular-nums">{topicPercent(p.topics[t.id])}%</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card card-pad lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Segmented value={country} onChange={setCountry} options={[{ value: 'DE', label: '🇩🇪 Deutschland' }, { value: 'AT', label: '🇦🇹 Österreich' }, { value: 'CH', label: '🇨🇭 Schweiz' }]} />
            {country !== 'CH' && (
              <Segmented value={mode} onChange={setMode} options={[{ value: 'explore', label: <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Odkrywaj</span> }, { value: 'quiz', label: <span className="flex items-center gap-1"><Crosshair className="h-3.5 w-3.5" />Quiz mapy</span> }]} />
            )}
          </div>
          {country === 'CH' ? <SwissMap /> : mode === 'explore' ? <ExploreMap country={country} /> : <MapQuiz key={country} country={country} />}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="card card-pad">
            <h2 className="h2 mb-3">Najważniejsze fakty</h2>
            <div className="grid gap-2">
              {FACTS.filter((f) => f.country === country || (country === 'CH' && f.country === 'LI')).map((f) => (
                <div key={f.label + f.value} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/[0.03]">
                  <div className="label">{f.label}</div>
                  <div className="text-[15px] font-semibold">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {country !== 'CH' && <CapitalsTable regions={country === 'DE' ? BUNDESLAENDER : OESTERREICH_LAENDER} title={country === 'DE' ? '16 Bundesländer i stolice' : '9 Bundesländer Austrii i stolice'} />}
    </div>
  )
}

function ExploreMap({ country }: { country: 'DE' | 'AT' }) {
  const regions = country === 'DE' ? BUNDESLAENDER : OESTERREICH_LAENDER
  const [sel, setSel] = useState<Region | null>(null)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <MapView which={country} highlight={sel ? [sel.iso] : []} onRegionClick={(iso) => setSel(regions.find((r) => r.iso === iso) ?? null)} />
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
        {sel ? (
          <div className="animate-rise">
            <div className="label">Bundesland</div>
            <div className="font-display text-xl font-bold">{sel.name}</div>
            <div className="mt-3 label">Landeshauptstadt</div>
            <div className="text-lg font-semibold text-brand-600 dark:text-brand-300">{sel.capital}</div>
            <p className="mt-3 text-sm leading-relaxed">{sel.note}</p>
          </div>
        ) : (
          <p className="text-sm muted">Kliknij kraj związkowy na mapie, żeby zobaczyć stolicę i najważniejsze informacje.</p>
        )}
      </div>
    </div>
  )
}

function MapQuiz({ country }: { country: 'DE' | 'AT' }) {
  const regions = country === 'DE' ? BUNDESLAENDER : OESTERREICH_LAENDER
  const order = useMemo(() => [...regions].sort(() => Math.random() - 0.5), [regions])
  const [i, setI] = useState(0)
  const [ask, setAsk] = useState<'land' | 'capital'>('land')
  const [answer, setAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const target = order[i]
  const done = i >= order.length
  const click = (iso: string) => {
    if (answer || done) return
    setAnswer(iso)
    if (iso === target.iso) setScore((s) => s + 1)
  }
  const next = () => {
    setAnswer(null)
    setI((x) => x + 1)
  }
  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="font-display text-4xl font-bold">{score}/{order.length}</div>
        <p className="muted">{score === order.length ? 'Perfekt! Wszystkie bezbłędnie.' : 'Powtórz, aż będzie komplet.'}</p>
        <button className="btn-primary" onClick={() => { setI(0); setScore(0) }}><RotateCcw className="h-4 w-4" /> Jeszcze raz</button>
      </div>
    )
  }
  const correct = answer === target.iso
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[17px] font-semibold">
          {ask === 'land' ? <>Wo liegt <b className="text-brand-600 dark:text-brand-300">{target.name}</b>?</> : <>In welchem Bundesland liegt <b className="text-brand-600 dark:text-brand-300">{target.capital}</b>?</>}
        </div>
        <div className="flex items-center gap-2">
          <Segmented value={ask} onChange={(v) => { setAsk(v); setAnswer(null) }} options={[{ value: 'land', label: 'Kraj' }, { value: 'capital', label: 'Stolica' }]} />
          <span className="chip-muted">{i + 1}/{order.length} · {score} ✓</span>
        </div>
      </div>
      <MapView
        which={country}
        noTooltip
        onRegionClick={click}
        regionColor={(iso) => (!answer ? undefined : iso === target.iso ? '#10b981' : iso === answer ? '#f43f5e' : undefined)}
      />
      {answer && (
        <div className={cx('flex animate-pop items-center justify-between gap-3 rounded-xl p-3', correct ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-rose-50 dark:bg-rose-500/10')}>
          <span className="flex items-center gap-2 text-sm font-semibold">
            {correct ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-rose-600" />}
            {target.name} - stolica: {target.capital}
          </span>
          <button className="btn-primary px-4 py-2" onClick={next}>Dalej</button>
        </div>
      )}
    </div>
  )
}

function SwissMap() {
  const [sel, setSel] = useState<string | null>(null)
  const r = MAPS.CH.regions.find((x) => x.iso === sel)
  return (
    <div>
      <MapView which="CH" highlight={sel ? [sel] : []} onRegionClick={setSel} />
      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/[0.03]">
        {r ? <><b>Kanton {r.name}</b> - jeden z 26 kantonów Szwajcarii.</> : 'Szwajcaria ma 26 kantonów. Kliknij kanton, aby zobaczyć nazwę. Bern = Bundesstadt, Zürich = największe miasto, Genf = siedziba ONZ (Europa) i Czerwonego Krzyża.'}
      </div>
    </div>
  )
}

function CapitalsTable({ regions, title }: { regions: Region[]; title: string }) {
  const [hide, setHide] = useState(false)
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h2 className="h2">{title}</h2>
        <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setHide((h) => !h)}>{hide ? 'Pokaż stolice' : 'Ukryj stolice (fiszki)'}</button>
      </div>
      <div className="grid sm:grid-cols-2">
        {regions.map((r) => (
          <div key={r.iso} className="flex flex-col border-t border-slate-100 px-4 py-2.5 dark:border-white/[0.05] sm:odd:border-r">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{r.name}</span>
              <span className={cx('font-bold text-brand-600 transition dark:text-brand-300', hide && 'rounded bg-slate-200 text-transparent dark:bg-white/10')}>{r.capital}</span>
            </div>
            <span className="text-xs muted">{r.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
