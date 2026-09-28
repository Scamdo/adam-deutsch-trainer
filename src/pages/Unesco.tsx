import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Check, Dumbbell, Info, Landmark, Leaf, MapPin, Shuffle, Sparkles, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { KIND_LABEL, LAND_NAMES, UNESCO_BASICS, UNESCO_SITES, type UnescoSite } from '../content/unesco'
import { NATURE_BASICS, NATURE_SITES } from '../content/natur'
import { MapView } from '../components/MapView'
import { Bar, cx, PageHeader, Segmented } from '../components/ui'
import { daysUntil } from '../engine/plan'

type Tab = 'mapa' | 'obiekty' | 'fiszki' | 'timeline' | 'rozpoznaj' | 'trening' | 'podstawy' | 'natur'

export default function Unesco() {
  const [sp, setSp] = useSearchParams()
  const tab = (sp.get('tab') ?? 'mapa') as Tab
  const setTab = (t: Tab) => setSp({ tab: t }, { replace: true })
  const p = useStore((s) => s.p)
  const core = UNESCO_SITES.filter((s) => s.core)
  const known = core.filter((s) => (p.qstates[`un-s2l-${s.id}`]?.streak ?? 0) >= 1).length

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow={`Etap rejonowy · za ${Math.max(0, daysUntil('rejonowy'))} dni`}
        title="UNESCO-Welterbe in Deutschland"
        subtitle="Program 2026/27: historia obiektu, położenie, kraj związkowy, walory, ciekawostki. W arkuszu rejonowym temat roczny to ok. 12 z 60 pkt (zad. 9-10) + teksty w zadaniach czytania."
        right={<Link to="/trening?mode=adaptive&cat=unesco&n=15" className="btn-primary"><Dumbbell className="h-4 w-4" /> Trening mieszany</Link>}
      />

      <div className="card card-pad flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white"><Landmark className="h-5 w-5" /></span>
          <div>
            <div className="font-display font-bold">{known}/{core.length} kluczowych obiektów opanowanych</div>
            <div className="text-xs muted">„Kluczowe” = wskazane w źródłach programu. Łącznie w bazie: {UNESCO_SITES.length} obiektów (pełna lista, stan 2025).</div>
          </div>
        </div>
        <Bar value={(known / core.length) * 100} color="#10b981" className="sm:ml-auto sm:max-w-xs" />
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'mapa', label: 'Mapa' },
          { value: 'obiekty', label: 'Obiekty' },
          { value: 'fiszki', label: 'Fiszki' },
          { value: 'timeline', label: 'Timeline' },
          { value: 'rozpoznaj', label: 'Rozpoznaj obiekt' },
          { value: 'trening', label: 'Trening' },
          { value: 'podstawy', label: 'Podstawy & słownictwo' },
          { value: 'natur', label: 'Naturdenkmale (woj.)' },
        ]}
      />

      {tab === 'mapa' && <SitesMap />}
      {tab === 'obiekty' && <SitesGrid />}
      {tab === 'fiszki' && <Flashcards />}
      {tab === 'timeline' && <Timeline />}
      {tab === 'rozpoznaj' && <Recognize />}
      {tab === 'trening' && <TrainingHub />}
      {tab === 'podstawy' && <Basics />}
      {tab === 'natur' && <Nature />}
    </div>
  )
}

function useSiteFilter() {
  const [onlyCore, setOnlyCore] = useState(true)
  const sites = UNESCO_SITES.filter((s) => !onlyCore || s.core)
  return { onlyCore, setOnlyCore, sites }
}

function CoreToggle({ onlyCore, setOnlyCore }: { onlyCore: boolean; setOnlyCore: (v: boolean) => void }) {
  return <Segmented value={onlyCore ? 'core' : 'all'} onChange={(v) => setOnlyCore(v === 'core')} options={[{ value: 'core', label: 'Kluczowe (program)' }, { value: 'all', label: `Wszystkie (${UNESCO_SITES.length})` }]} />
}

function SitesMap() {
  const { onlyCore, setOnlyCore, sites } = useSiteFilter()
  const [sel, setSel] = useState<UnescoSite | null>(null)
  const [land, setLand] = useState<string | null>(null)
  const inLand = land ? sites.filter((s) => s.lands.includes(land)) : []
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="card card-pad lg:col-span-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <CoreToggle onlyCore={onlyCore} setOnlyCore={setOnlyCore} />
          <span className="text-xs muted">Kliknij punkt lub kraj związkowy</span>
        </div>
        <MapView
          which="DE"
          highlight={sel ? sel.lands : land ? [land] : []}
          onRegionClick={(iso) => { setLand(iso); setSel(null) }}
          onPointClick={(id) => { setSel(UNESCO_SITES.find((s) => s.id === id) ?? null); setLand(null) }}
          points={sites.map((s) => ({ id: s.id, lat: s.lat, lon: s.lon, label: `${s.name} (${s.year})`, color: s.nature ? '#65a30d' : s.core ? '#10b981' : '#94a3b8', active: sel?.id === s.id }))}
        />
        <div className="mt-2 flex flex-wrap gap-3 text-xs muted">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />kulturowe - kluczowe</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-lime-600" />przyrodnicze</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />pozostałe</span>
          <span>Punkt obiektu wielomiejscowego = lokalizacja reprezentatywna.</span>
        </div>
      </div>
      <div className="lg:col-span-2 lg:sticky lg:top-8 lg:self-start">
        {sel ? (
          <SiteDetail site={sel} onClose={() => setSel(null)} />
        ) : land ? (
          <div className="card card-pad animate-rise">
            <div className="label">Bundesland</div>
            <h3 className="h2 mb-3">{LAND_NAMES[land]} · {inLand.length} obiektów</h3>
            <div className="grid gap-2">
              {inLand.map((s) => (
                <button key={s.id} onClick={() => setSel(s)} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-left text-sm hover:bg-brand-50 dark:bg-white/[0.03] dark:hover:bg-brand-500/10">
                  <span className="font-semibold">{s.name}</span>
                  <span className="muted">{s.year}</span>
                </button>
              ))}
              {!inLand.length && <p className="text-sm muted">Brak obiektów w tym filtrze.</p>}
            </div>
          </div>
        ) : (
          <div className="card card-pad text-sm muted"><Info className="mb-2 h-5 w-5 text-brand-500" />Wybierz obiekt na mapie, aby zobaczyć kartę: położenie, historię, powody wpisu, ciekawostki i słownictwo.</div>
        )}
      </div>
    </div>
  )
}

export function SiteDetail({ site: s, onClose }: { site: UnescoSite; onClose?: () => void }) {
  return (
    <div className="card animate-rise overflow-hidden">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white/70">{KIND_LABEL[s.kind]} · seit {s.year}{s.core ? ' · kluczowy' : ''}</div>
            <h3 className="mt-1 font-display text-xl font-bold leading-tight">{s.name}</h3>
            <div className="text-sm text-white/80">{s.namePl}</div>
          </div>
          {onClose && <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10"><X className="h-5 w-5" /></button>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1"><MapPin className="h-3 w-3" />{s.place}</span>
          <span className="rounded-full bg-white/15 px-2.5 py-1">{s.lands.map((l) => LAND_NAMES[l]).join(' / ')}</span>
          {s.extended && <span className="rounded-full bg-white/15 px-2.5 py-1">rozszerzenie: {s.extended}</span>}
        </div>
      </div>
      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-5 text-[15px] leading-relaxed">
        <div className="flex gap-3">
          <MapView which="DE" className="w-24 shrink-0" highlight={s.lands} points={[{ id: s.id, lat: s.lat, lon: s.lon, label: s.name, active: true }]} noTooltip />
          <p><b>Czym jest: </b>{s.what}</p>
        </div>
        {s.history && <p><b>Historia: </b>{s.history}</p>}
        {s.why && <p><b>Dlaczego UNESCO: </b>{s.why}</p>}
        {s.deutsch && (
          <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <div className="label mb-1 text-emerald-700 dark:text-emerald-300">Kurz auf Deutsch - naucz się</div>
            <p className="font-medium">{s.deutsch}</p>
          </div>
        )}
        {s.features.length > 0 && (
          <div>
            <div className="label mb-1.5">Najważniejsze cechy</div>
            <ul className="grid gap-1">{s.features.map((f) => <li key={f} className="flex gap-2"><span className="text-emerald-500">▸</span>{f}</li>)}</ul>
          </div>
        )}
        {s.facts.length > 0 && (
          <div>
            <div className="label mb-1.5">Ciekawostki konkursowe</div>
            <ul className="grid gap-1">{s.facts.map((f) => <li key={f} className="flex gap-2"><Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-amber-500" />{f}</li>)}</ul>
          </div>
        )}
        {s.vocab.length > 0 && (
          <div>
            <div className="label mb-1.5">Słownictwo</div>
            <div className="grid gap-1 text-sm">{s.vocab.map(([de, pl]) => <div key={de} className="flex justify-between gap-3 border-b border-slate-100 py-1 dark:border-white/[0.05]"><b>{de}</b><span className="muted">{pl}</span></div>)}</div>
          </div>
        )}
        <div className="text-xs muted">Hasła: {s.keywords.join(' · ')}</div>
      </div>
    </div>
  )
}

function SitesGrid() {
  const { onlyCore, setOnlyCore, sites } = useSiteFilter()
  const [sel, setSel] = useState<UnescoSite | null>(null)
  const [land, setLand] = useState('')
  const list = sites.filter((s) => !land || s.lands.includes(land))
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-3 lg:col-span-3">
        <div className="flex flex-wrap items-center gap-2">
          <CoreToggle onlyCore={onlyCore} setOnlyCore={setOnlyCore} />
          <select value={land} onChange={(e) => setLand(e.target.value)} className="field w-auto py-1.5 text-sm">
            <option value="">Wszystkie kraje związkowe</option>
            {Object.entries(LAND_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {list.map((s) => (
            <button key={s.id} onClick={() => setSel(s)} className={cx('card flex flex-col gap-1 p-3.5 text-left transition hover:-translate-y-0.5', sel?.id === s.id && 'ring-2 ring-emerald-500')}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold leading-snug">{s.name}</span>
                <span className="chip-muted shrink-0">{s.year}</span>
              </div>
              <span className="text-xs muted">{s.place} · {s.lands.map((l) => LAND_NAMES[l]).join(' / ')}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{KIND_LABEL[s.kind]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-8">{sel ? <SiteDetail site={sel} onClose={() => setSel(null)} /> : <div className="card card-pad text-sm muted">Wybierz obiekt z listy.</div>}</div>
      </div>
    </div>
  )
}

function Flashcards() {
  const { onlyCore, setOnlyCore, sites } = useSiteFilter()
  const [dir, setDir] = useState<'site' | 'land'>('site')
  const [deck, setDeck] = useState(() => [...sites])
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())
  const s = deck[i % deck.length]
  const reshuffle = () => { setDeck([...sites].sort(() => Math.random() - 0.5)); setI(0); setFlip(false) }
  const go = (d: number) => { setI((x) => (x + d + deck.length) % deck.length); setFlip(false) }
  if (!s) return null
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CoreToggle onlyCore={onlyCore} setOnlyCore={(v) => { setOnlyCore(v); setTimeout(reshuffle) }} />
        <Segmented value={dir} onChange={setDir} options={[{ value: 'site', label: 'Obiekt → fakty' }, { value: 'land', label: 'Opis → obiekt' }]} />
      </div>
      <button onClick={() => setFlip((f) => !f)} className="group relative h-80 w-full [perspective:1200px]">
        <div className={cx('relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]', flip && '[transform:rotateY(180deg)]')}>
          <div className="card absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center [backface-visibility:hidden]">
            <span className="label">{i + 1}/{deck.length} · kliknij, aby odwrócić</span>
            {dir === 'site' ? (
              <>
                <Landmark className="h-8 w-8 text-emerald-500" />
                <div className="font-display text-2xl font-bold leading-tight">{s.name}</div>
                <div className="muted">{s.namePl}</div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold muted">{s.lands.map((l) => LAND_NAMES[l]).join(' / ')} · seit {s.year}</div>
                <div className="text-lg font-semibold leading-relaxed">{s.what}</div>
              </>
            )}
          </div>
          <div className="card absolute inset-0 flex flex-col justify-center gap-2 overflow-y-auto p-6 text-left [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {dir === 'site' ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{s.lands.map((l) => LAND_NAMES[l]).join(' / ')}</span>
                  <span className="chip-muted">{s.place}</span>
                  <span className="chip-muted">{s.year}</span>
                </div>
                <p className="text-[15px] font-medium">{s.deutsch || s.what}</p>
                {s.facts.slice(0, 2).map((f) => <p key={f} className="text-sm muted">• {f}</p>)}
              </>
            ) : (
              <>
                <div className="font-display text-xl font-bold">{s.name}</div>
                <div className="text-sm muted">{s.place}</div>
                <p className="text-sm">{s.keywords.join(' · ')}</p>
              </>
            )}
          </div>
        </div>
      </button>
      <div className="flex gap-2">
        <button className="btn-secondary px-3" onClick={() => go(-1)}><ArrowLeft className="h-4 w-4" /></button>
        <button className="btn flex-1 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-300" onClick={() => { setKnown((k) => { const n = new Set(k); n.delete(s.id); return n }); go(1) }}><X className="h-4 w-4" /> Jeszcze nie</button>
        <button className="btn flex-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300" onClick={() => { setKnown((k) => new Set(k).add(s.id)); go(1) }}><Check className="h-4 w-4" /> Umiem</button>
        <button className="btn-secondary px-3" onClick={() => go(1)}><ArrowRight className="h-4 w-4" /></button>
      </div>
      <div className="flex items-center justify-between text-sm muted">
        <span>Umiem: {known.size}/{deck.length}</span>
        <button className="btn-ghost px-2 py-1 text-xs" onClick={reshuffle}><Shuffle className="h-3.5 w-3.5" /> Przetasuj</button>
      </div>
    </div>
  )
}

function Timeline() {
  const { onlyCore, setOnlyCore, sites } = useSiteFilter()
  const sorted = [...sites].sort((a, b) => a.year - b.year)
  const [sel, setSel] = useState<UnescoSite | null>(null)
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="card card-pad lg:col-span-3">
        <div className="mb-4"><CoreToggle onlyCore={onlyCore} setOnlyCore={setOnlyCore} /></div>
        <ol className="relative ml-3 border-l-2 border-emerald-200 dark:border-emerald-500/20">
          {sorted.map((s, i) => (
            <li key={s.id} className="mb-3 ml-5">
              <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-ink-900" />
              <button onClick={() => setSel(s)} className="w-full rounded-xl p-2 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                <span className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">{s.year}{i > 0 && sorted[i - 1].year === s.year ? '' : ''}</span>
                <span className="ml-3 font-semibold">{s.name}</span>
                <span className="block text-xs muted">{s.lands.map((l) => LAND_NAMES[l]).join(' / ')}{s.extended ? ` · rozszerzenie ${s.extended}` : ''}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="lg:col-span-2"><div className="lg:sticky lg:top-8">{sel ? <SiteDetail site={sel} onClose={() => setSel(null)} /> : <div className="card card-pad text-sm muted">Timeline od pierwszego wpisu (Akwizgran 1978) do najnowszego (zamki Ludwika II, 2025). Kliknij rok.</div>}</div></div>
    </div>
  )
}

function Recognize() {
  const core = useMemo(() => UNESCO_SITES.filter((s) => s.core), [])
  const [round, setRound] = useState(0)
  const [answer, setAnswer] = useState<string | null>(null)
  const [score, setScore] = useState({ ok: 0, n: 0 })
  const [mode, setMode] = useState<'map' | 'text'>('map')
  const { target, options } = useMemo(() => {
    const shuffled = [...core].sort(() => Math.random() - 0.5)
    const target = shuffled[0]
    const options = shuffled.slice(0, 4).sort(() => Math.random() - 0.5)
    return { target, options }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, core])
  const pick = (id: string) => {
    if (answer) return
    setAnswer(id)
    setScore((s) => ({ ok: s.ok + (id === target.id ? 1 : 0), n: s.n + 1 }))
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card card-pad">
        <div className="mb-3 flex items-center justify-between">
          <Segmented value={mode} onChange={(m) => { setMode(m); setAnswer(null); setRound((r) => r + 1) }} options={[{ value: 'map', label: 'Po położeniu' }, { value: 'text', label: 'Po opisie' }]} />
          <span className="chip-muted">{score.ok}/{score.n}</span>
        </div>
        {mode === 'map' ? (
          <MapView which="DE" noTooltip points={[{ id: target.id, lat: target.lat, lon: target.lon, label: '', active: true }]} highlight={answer ? target.lands : []} />
        ) : (
          <div className="flex min-h-[260px] flex-col justify-center gap-3 rounded-xl bg-slate-50 p-5 dark:bg-white/[0.03]">
            <div className="label">Welche Welterbestätte ist gemeint?</div>
            <p className="text-[17px] font-medium leading-relaxed">{maskName(target)}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-[17px] font-semibold">{mode === 'map' ? 'Który obiekt leży w zaznaczonym miejscu?' : 'Wybierz obiekt pasujący do opisu:'}</div>
        {options.map((o) => (
          <button key={o.id} onClick={() => pick(o.id)} disabled={!!answer} className={cx('option', answer && (o.id === target.id ? 'option-correct' : o.id === answer ? 'option-wrong' : 'opacity-60'))}>
            <span className="flex-1">{o.name}<span className="block text-xs font-normal muted">{answer ? `${o.place} · ${o.lands.map((l) => LAND_NAMES[l]).join(' / ')} · ${o.year}` : ''}</span></span>
          </button>
        ))}
        {answer && (
          <div className="animate-pop rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/[0.03]">
            <b>{target.name}</b>: {target.what}
            <button className="btn-primary mt-3 w-full" onClick={() => { setAnswer(null); setRound((r) => r + 1) }}>Następny <ArrowRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  )
}

function TrainingHub() {
  const items = [
    { to: '/trening?mode=adaptive&cat=unesco&n=20', title: 'Trening mieszany', desc: 'Wszystkie typy pytań UNESCO, dobór adaptacyjny.', icon: <Shuffle className="h-5 w-5" /> },
    { to: '/trening?mode=topic&topic=unesco-objekte&n=15', title: 'Obiekt ↔ Bundesland', desc: 'Najczęstszy typ pytania: w którym kraju związkowym leży…?', icon: <MapPin className="h-5 w-5" /> },
    { to: '/trening?mode=topic&topic=unesco-grundlagen&n=10', title: 'Podstawy UNESCO', desc: 'Pierwszy/najnowszy wpis, Czerwona Lista, Drezno, liczby.', icon: <Info className="h-5 w-5" /> },
    { to: '/trening?mode=topic&topic=unesco-wortschatz&n=10', title: 'Słownictwo: kultura i turystyka', desc: 'Wahrzeichen, Führung, Fachwerkhaus, style architektoniczne.', icon: <BookOpen className="h-5 w-5" /> },
    { to: '/unesco?tab=rozpoznaj', title: 'Rozpoznaj obiekt', desc: 'Po położeniu na mapie lub po niemieckim opisie.', icon: <Sparkles className="h-5 w-5" /> },
    { to: '/konkurs?stage=rejonowy', title: 'Próbny etap rejonowy', desc: 'Pełna symulacja 60 pkt z zadaniami UNESCO 9-10.', icon: <Dumbbell className="h-5 w-5" /> },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Link key={it.title} to={it.to} className="card card-pad flex gap-3 transition hover:-translate-y-0.5 hover:shadow-lg">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">{it.icon}</span>
          <span><span className="block font-display font-bold">{it.title}</span><span className="text-sm muted">{it.desc}</span></span>
        </Link>
      ))}
    </div>
  )
}

function Basics() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card card-pad">
        <h2 className="h2 mb-3">Co trzeba wiedzieć o UNESCO</h2>
        <ul className="grid gap-2.5 text-[15px]">{UNESCO_BASICS.facts.map((f) => <li key={f} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />{f}</li>)}</ul>
      </div>
      <div className="card card-pad">
        <h2 className="h2 mb-3">Słownictwo tematyczne</h2>
        <div className="grid gap-1 text-sm">{UNESCO_BASICS.vocab.map(([de, pl]) => <div key={de} className="flex justify-between gap-3 border-b border-slate-100 py-1.5 dark:border-white/[0.05]"><b>{de}</b><span className="text-right muted">{pl}</span></div>)}</div>
      </div>
    </div>
  )
}

function Nature() {
  const [sel, setSel] = useState<string | null>(null)
  const s = NATURE_SITES.find((n) => n.id === sel)
  return (
    <div className="flex flex-col gap-5">
      <div className="card card-pad flex items-start gap-3 bg-lime-50 dark:bg-lime-500/10">
        <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-lime-600" />
        <div className="text-sm">
          <b>Etap wojewódzki (1 marca 2027):</b> wybrane pomniki przyrody w Niemczech - historia, położenie, kraj związkowy, walory turystyczne, ciekawostki. Moduł zawiera bazę {NATURE_SITES.length} obiektów i architekturę do rozbudowy po etapie rejonowym.
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card card-pad lg:col-span-3">
          <MapView which="DE" highlight={s ? s.lands : []} onPointClick={setSel} points={NATURE_SITES.map((n) => ({ id: n.id, lat: n.lat, lon: n.lon, label: n.name, color: '#65a30d', active: n.id === sel }))} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/trening?mode=adaptive&cat=natur&n=15" className="btn-primary"><Dumbbell className="h-4 w-4" /> Trening Naturdenkmale</Link>
            <Link to="/trening?mode=adaptive&cat=hoeren&n=3" className="btn-secondary">Hörverstehen</Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-2">
          {s ? (
            <div className="card card-pad animate-rise">
              <div className="flex items-start justify-between"><div className="label">{s.type} · {s.lands.map((l) => LAND_NAMES[l]).join(' / ')}</div><button onClick={() => setSel(null)}><X className="h-4 w-4" /></button></div>
              <h3 className="h2 mt-1">{s.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed">{s.info}</p>
              <div className="mt-3 rounded-xl bg-lime-50 p-3 text-[15px] font-medium dark:bg-lime-500/10">{s.deutsch}</div>
              <ul className="mt-3 grid gap-1 text-sm">{s.facts.map((f) => <li key={f}>• {f}</li>)}</ul>
            </div>
          ) : (
            <div className="card card-pad">
              <h3 className="h2 mb-2">Podstawy</h3>
              <ul className="grid gap-2 text-sm">{NATURE_BASICS.map((b) => <li key={b} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600" />{b}</li>)}</ul>
            </div>
          )}
          <div className="card card-pad">
            <div className="grid gap-1.5">
              {NATURE_SITES.map((n) => (
                <button key={n.id} onClick={() => setSel(n.id)} className={cx('flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/[0.03]', sel === n.id && 'bg-lime-50 dark:bg-lime-500/10')}>
                  <span className="font-semibold">{n.name}</span><span className="text-xs muted">{n.lands.map((l) => LAND_NAMES[l].split('-')[0]).join('/')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const STOP = new Set(['altstadt', 'schlösser', 'schloss', 'historische', 'grenzen', 'römischen', 'reiches', 'seine', 'stätten', 'und', 'von', 'der', 'die', 'das', 'mit', 'des', 'dom', 'zu', 'in'])
function maskName(s: UnescoSite): string {
  const tokens = [...s.name.split(/[^A-Za-zÄÖÜäöüß]+/), ...s.place.split(/[^A-Za-zÄÖÜäöüß]+/)]
    .filter((t) => t.length >= 4 && !STOP.has(t.toLowerCase()))
  let text = s.deutsch
  for (const t of tokens) {
    const stem = t.length > 6 ? t.slice(0, -2) : t
    text = text.replace(new RegExp(`\\b${stem}[A-Za-zÄÖÜäöüß]*`, 'g'), '___')
  }
  return text
}
