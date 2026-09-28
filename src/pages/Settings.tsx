import { useRef, useState } from 'react'
import { Cloud, Download, ExternalLink, Moon, Monitor, RotateCcw, Sun, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'
import { signInWithEmail, signOut, supabaseConfigured, verifyCode } from '../storage/supabase'
import { cx, PageHeader } from '../components/ui'
import { QUESTIONS } from '../content'
import { UNESCO_SITES } from '../content/unesco'
import { TOPICS } from '../content/topics'

export function applyTheme(theme: 'system' | 'light' | 'dark') {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

export default function Settings() {
  const p = useStore((s) => s.p)
  const update = useStore((s) => s.updateProfile)
  const reset = useStore((s) => s.reset)
  const importJson = useStore((s) => s.importJson)
  const sync = useStore((s) => s.sync)
  const email = useStore((s) => s.userEmail)
  const connect = useStore((s) => s.connectRemote)
  const [confirm, setConfirm] = useState(false)
  const [mail, setMail] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `adam-deutsch-trainer-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <PageHeader eyebrow="Ustawienia" title="Ustawienia i dane" />

      <section className="card card-pad grid gap-4">
        <h2 className="h2">Profil</h2>
        <label className="grid gap-1.5">
          <span className="label">Imię</span>
          <input className="field" value={p.profile.name} onChange={(e) => update({ name: e.target.value })} />
        </label>
        <div className="grid gap-1.5">
          <span className="label">Motyw</span>
          <div className="flex gap-2">
            {([['system', 'System', Monitor], ['light', 'Jasny', Sun], ['dark', 'Ciemny', Moon]] as const).map(([v, l, I]) => (
              <button key={v} onClick={() => { update({ theme: v }); applyTheme(v) }} className={cx('btn flex-1 border-2', p.profile.theme === v ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200' : 'border-slate-200 dark:border-white/10')}>
                <I className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card card-pad grid gap-3">
        <h2 className="h2 flex items-center gap-2"><Cloud className="h-5 w-5 text-brand-500" /> Synchronizacja (Supabase)</h2>
        {!supabaseConfigured ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed dark:bg-white/[0.03]">
            <b>Tryb lokalny.</b> Postęp zapisuje się w tej przeglądarce (localStorage) i działa bez internetu. Aby synchronizować między urządzeniami, właściciel aplikacji ustawia zmienne <code className="rounded bg-slate-200 px-1 dark:bg-white/10">VITE_SUPABASE_URL</code> i <code className="rounded bg-slate-200 px-1 dark:bg-white/10">VITE_SUPABASE_ANON_KEY</code> (instrukcja w README). Do tego czasu używaj eksportu/importu poniżej.
          </div>
        ) : email ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-sm dark:bg-emerald-500/10">
            <span>Zalogowano jako <b>{email}</b> · status: <b>{sync === 'synced' ? 'zsynchronizowano' : sync === 'syncing' ? 'synchronizacja…' : sync === 'error' ? 'błąd' : 'lokalnie'}</b></span>
            <button className="btn-secondary px-3 py-1.5 text-xs" onClick={async () => { await signOut(); location.reload() }}>Wyloguj</button>
          </div>
        ) : (
          <div className="grid gap-2">
            <p className="text-sm muted">Zaloguj się e-mailem (link lub 6-cyfrowy kod). Bez hasła.</p>
            <div className="flex gap-2">
              <input className="field" type="email" placeholder="adres e-mail" value={mail} onChange={(e) => setMail(e.target.value)} />
              <button className="btn-primary" onClick={async () => setMsg((await signInWithEmail(mail)) ?? 'Wysłano e-mail. Kliknij link lub wpisz kod poniżej.')}>Wyślij</button>
            </div>
            <div className="flex gap-2">
              <input className="field" placeholder="kod z e-maila (opcjonalnie)" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btn-secondary" onClick={async () => { const err = await verifyCode(mail, code); setMsg(err ?? 'Zalogowano!'); if (!err) await connect() }}>Potwierdź</button>
            </div>
            {msg && <p className="text-sm font-semibold">{msg}</p>}
          </div>
        )}
      </section>

      <section className="card card-pad grid gap-3">
        <h2 className="h2">Kopia zapasowa</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={exportData}><Download className="h-4 w-4" /> Eksportuj postęp (.json)</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Importuj</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setMsg(importJson(await f.text()) ? 'Zaimportowano postęp.' : 'Nieprawidłowy plik.') }} />
          <button className="btn ml-auto bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300" onClick={() => setConfirm(true)}><RotateCcw className="h-4 w-4" /> Resetuj postęp</button>
        </div>
      </section>

      <section className="card card-pad grid gap-2 text-sm leading-relaxed">
        <h2 className="h2">O aplikacji i źródłach</h2>
        <p>Bank: <b>{QUESTIONS.length}</b> oryginalnych pytań · <b>{TOPICS.length}</b> tematów · <b>{UNESCO_SITES.length}</b> obiektów UNESCO. Pytania są autorskie - nie kopiują arkuszy Kuratorium; odwzorowują ich strukturę i typy zadań.</p>
        <p className="font-semibold">Przeanalizowane materiały Mazowieckiego Kuratora Oświaty:</p>
        <ul className="grid gap-1">
          {[
            ['Program merytoryczny j. niemiecki 2026/27', 'https://konkursy.kuratorium.waw.pl/download/4/26393/PROGRAMMERYTORYCZNYJNIEMIECKI202627.pdf'],
            ['Regulamin konkursów przedmiotowych 2026/27', 'https://konkursy.kuratorium.waw.pl/download/4/26397/Regulaminkonkursowprzedmiotowych202627.pdf'],
            ['Harmonogram etapu szkolnego / rejonowego / wojewódzkiego', 'https://konkursy.kuratorium.waw.pl/ko/konkursy-przedmiotowe/regulaminy-z-zalacznikami/20037,REGULAMIN-KONKURSOW-PRZEDMIOTOWYCH-DLA-UCZNIOW-KLAS-IV-VIII-SZKOL-PODSTAWOWYCH-W.html'],
            ['Bank zadań konkursowych (arkusze i modele 2019/20-2025/26)', 'https://konkursy.kuratorium.waw.pl/ko/form/907,Bank-zadan-konkursowych.html'],
          ].map(([l, u]) => (
            <li key={u}><a href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline dark:text-brand-300">{l} <ExternalLink className="h-3 w-3" /></a></li>
          ))}
        </ul>
        <p className="text-xs muted">Mapy: granice administracyjne Natural Earth (domena publiczna). Nagrania: syntezator mowy przeglądarki (Web Speech API).</p>
      </section>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirm(false)} />
          <div className="card relative w-full max-w-sm animate-pop p-6">
            <h3 className="h2">Na pewno zresetować?</h3>
            <p className="mt-2 text-sm muted">Usuniesz cały postęp, błędy, historię konkursów i osiągnięcia. Najpierw możesz zrobić eksport.</p>
            <div className="mt-5 flex gap-2">
              <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>Anuluj</button>
              <button className="btn flex-1 bg-rose-500 text-white hover:bg-rose-600" onClick={async () => { await reset(); setConfirm(false) }}>Resetuj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
