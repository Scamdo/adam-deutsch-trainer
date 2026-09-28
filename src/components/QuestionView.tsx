import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, Pause, Volume2, X } from 'lucide-react'
import type { AnswerValue, CheckResult, GapQuestion, InputQuestion, MatchQuestion, MCQuestion, MultiQuestion, OrderQuestion, Question, ReadingQuestion, TrueFalseQuestion, WordbankQuestion } from '../types'
import { cx } from './ui'

const L = (i: number) => String.fromCharCode(65 + i)

function seededPerm(n: number, seed: string): number[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Zdanie z [podkreślonym] wyrazem i ___ jako luką */
export function Stem({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\[[^\]]+\]|___)/g)
  return (
    <p className={cx('text-[17px] font-semibold leading-relaxed sm:text-lg', className)}>
      {parts.map((p, i) =>
        p === '___' ? (
          <span key={i} className="mx-1 inline-block min-w-12 border-b-2 border-dashed border-brand-400 align-baseline">&nbsp;</span>
        ) : p.startsWith('[') ? (
          <span key={i} className="underline decoration-brand-500 decoration-2 underline-offset-4">{p.slice(1, -1)}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  )
}

interface Props {
  q: Question
  value: AnswerValue | undefined
  onChange: (v: AnswerValue) => void
  revealed?: boolean
  result?: CheckResult
  seed?: string
  onEnter?: () => void
  examMode?: boolean
}

export function QuestionView(props: Props) {
  const { q } = props
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{q.prompt}</div>
      <Body {...props} />
    </div>
  )
}

function Body(props: Props) {
  const { q } = props
  switch (q.type) {
    case 'mc':
    case 'reaction':
      return <MCView {...props} q={q} />
    case 'multi':
      return <MultiView {...props} q={q} />
    case 'input':
    case 'transform':
      return <InputView {...props} q={q} />
    case 'gap':
      return <GapView {...props} q={q} />
    case 'match':
      return <MatchView {...props} q={q} />
    case 'order':
      return <OrderView {...props} q={q} />
    case 'truefalse':
      return <TFView {...props} q={q} />
    case 'reading':
      return <ReadingView {...props} q={q} />
    case 'wordbank':
      return <WordbankView {...props} q={q} />
  }
}

function optionState(revealed: boolean | undefined, isCorrect: boolean, isSelected: boolean) {
  if (!revealed) return isSelected ? 'option-selected' : ''
  if (isCorrect) return 'option-correct'
  if (isSelected) return 'option-wrong'
  return 'opacity-60'
}

function MCView({ q, value, onChange, revealed, seed = '', onEnter }: Props & { q: MCQuestion }) {
  const perm = useMemo(() => seededPerm(q.options.length, q.id + seed), [q.id, q.options.length, seed])
  const sel = value?.kind === 'index' ? value.value : -1
  useEffect(() => {
    if (revealed) return
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      const k = e.key.toUpperCase()
      const idx = '1234'.includes(k) ? Number(k) - 1 : 'ABCD'.includes(k) && k.length === 1 ? k.charCodeAt(0) - 65 : -1
      if (idx >= 0 && idx < perm.length) onChange({ kind: 'index', value: perm[idx] })
      if (e.key === 'Enter' && sel >= 0) onEnter?.()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [perm, onChange, revealed, sel, onEnter])
  return (
    <>
      {q.stem && (q.type === 'reaction' ? <div className="rounded-xl bg-violet-50 px-4 py-3 text-[15px] font-medium text-violet-950 dark:bg-violet-500/10 dark:text-violet-100">{q.stem}</div> : <Stem text={q.stem} />)}
      <div className="grid gap-2.5">
        {perm.map((oi, di) => (
          <button key={oi} disabled={revealed} onClick={() => onChange({ kind: 'index', value: oi })} className={cx('option', optionState(revealed, oi === q.answer, oi === sel))}>
            <span className="kbd mt-0.5 shrink-0">{L(di)}</span>
            <span className="flex-1">{q.options[oi]}</span>
            {revealed && oi === q.answer && <Check className="h-5 w-5 shrink-0 text-emerald-600" />}
            {revealed && oi === sel && oi !== q.answer && <X className="h-5 w-5 shrink-0 text-rose-600" />}
          </button>
        ))}
      </div>
    </>
  )
}

function MultiView({ q, value, onChange, revealed, seed = '' }: Props & { q: MultiQuestion }) {
  const perm = useMemo(() => seededPerm(q.options.length, q.id + seed), [q.id, q.options.length, seed])
  const sel = value?.kind === 'indices' ? value.value : []
  const toggle = (i: number) => onChange({ kind: 'indices', value: sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i] })
  return (
    <>
      {q.stem && <Stem text={q.stem} />}
      <div className="grid gap-2.5">
        {perm.map((oi) => {
          const isSel = sel.includes(oi)
          const ok = q.answers.includes(oi)
          return (
            <button key={oi} disabled={revealed} onClick={() => toggle(oi)} className={cx('option', revealed ? (ok ? 'option-correct' : isSel ? 'option-wrong' : 'opacity-60') : isSel && 'option-selected')}>
              <span className={cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2', isSel ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 dark:border-white/20')}>{isSel && <Check className="h-3.5 w-3.5" />}</span>
              <span className="flex-1">{q.options[oi]}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function InputView({ q, value, onChange, revealed, result, onEnter }: Props & { q: InputQuestion }) {
  const v = value?.kind === 'text' ? value.value : ''
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!revealed) ref.current?.focus({ preventScroll: true })
  }, [q.id, revealed])
  return (
    <>
      <Stem text={q.stem} />
      {q.hint && <div className="chip-muted w-fit">Wskazówka: {q.hint}</div>}
      <div className="relative">
        <input
          ref={ref}
          value={v}
          disabled={revealed}
          onChange={(e) => onChange({ kind: 'text', value: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && v.trim() && onEnter?.()}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={q.type === 'transform' ? 'Dokończ zdanie…' : 'Wpisz odpowiedź…'}
          className={cx('field py-3 text-lg', revealed && (result?.correct ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-rose-500 bg-rose-50 dark:bg-rose-500/10'))}
        />
        {!revealed && <SpecialChars onInsert={(ch) => { onChange({ kind: 'text', value: v + ch }); ref.current?.focus() }} />}
      </div>
    </>
  )
}

function SpecialChars({ onInsert }: { onInsert: (c: string) => void }) {
  return (
    <div className="mt-2 flex gap-1.5">
      {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((c) => (
        <button key={c} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onInsert(c)} className="kbd h-8 min-w-8 text-sm font-semibold normal-case hover:border-brand-400 hover:text-brand-600">
          {c}
        </button>
      ))}
    </div>
  )
}

function GapView({ q, value, onChange, revealed, result }: Props & { q: GapQuestion }) {
  const vals = value?.kind === 'texts' ? value.value : q.blanks.map(() => '')
  const set = (i: number, t: string) => {
    const next = [...vals]
    next[i] = t
    onChange({ kind: 'texts', value: next })
  }
  const parts = q.text.split(/(\{\d+\})/g)
  return (
    <>
      {q.hint && <div className="chip-muted w-fit">{q.hint}</div>}
      <p className="text-[17px] font-medium leading-[2.6]">
        {parts.map((p, i) => {
          const m = p.match(/^\{(\d+)\}$/)
          if (!m) return <span key={i}>{p}</span>
          const bi = Number(m[1])
          const ok = result?.parts?.[bi]
          return (
            <span key={i} className="inline-flex flex-col align-middle">
              <input
                value={vals[bi] ?? ''}
                disabled={revealed}
                onChange={(e) => set(bi, e.target.value)}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                style={{ width: `${Math.max(5, (vals[bi]?.length ?? 0) + 2)}ch` }}
                className={cx('mx-1 rounded-lg border-2 bg-white px-2 py-0.5 text-center font-semibold outline-none focus:border-brand-500 dark:bg-ink-850', revealed ? (ok ? 'border-emerald-500' : 'border-rose-500') : 'border-slate-300 dark:border-white/15')}
              />
              {revealed && !ok && <span className="mx-1 text-center text-xs font-bold leading-4 text-emerald-600">{q.blanks[bi][0]}</span>}
            </span>
          )
        })}
      </p>
    </>
  )
}

function MatchView({ q, value, onChange, revealed, result, seed = '' }: Props & { q: MatchQuestion }) {
  const rights = useMemo(() => [...q.pairs.map((p) => p[1]), ...(q.extra ?? [])], [q])
  const perm = useMemo(() => seededPerm(rights.length, q.id + seed + 'm'), [rights.length, q.id, seed])
  const vals = value?.kind === 'map' ? value.value : q.pairs.map(() => null)
  const set = (li: number, ri: number) => {
    const next = [...vals]
    next[li] = next[li] === ri ? null : ri
    onChange({ kind: 'map', value: next })
  }
  const longLeft = q.pairs.some((p) => p[0].length > 80)
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
        <div className="label mb-2">Odpowiedzi</div>
        <div className="grid gap-1.5">
          {perm.map((ri, di) => (
            <div key={ri} className="flex gap-2 text-[15px]">
              <span className="kbd shrink-0">{L(di)}</span>
              <span className={cx(revealed && ri >= q.pairs.length && 'line-through opacity-60')}>{rights[ri]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        {q.pairs.map(([left], li) => {
          const ok = result?.parts?.[li]
          return (
            <div key={li} className={cx('rounded-xl border-2 p-3', revealed ? (ok ? 'border-emerald-500/60' : 'border-rose-500/60') : 'border-slate-200 dark:border-white/[0.08]')}>
              <div className={cx('mb-2 font-semibold', longLeft ? 'text-[15px] font-medium leading-relaxed' : 'text-[16px]')}>
                <span className="mr-2 text-brand-500">{li + 1}.</span>
                {left}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {perm.map((ri, di) => {
                  const isSel = vals[li] === ri
                  const isRight = ri === li
                  return (
                    <button
                      key={ri}
                      disabled={revealed}
                      onClick={() => set(li, ri)}
                      className={cx(
                        'h-9 min-w-9 rounded-lg border-2 px-2 text-sm font-bold transition',
                        revealed
                          ? isRight
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : isSel
                              ? 'border-rose-500 bg-rose-500 text-white'
                              : 'border-slate-200 opacity-40 dark:border-white/10'
                          : isSel
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-slate-200 hover:border-brand-400 dark:border-white/10',
                      )}
                    >
                      {L(di)}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderView({ q, value, onChange, revealed, result, seed = '' }: Props & { q: OrderQuestion }) {
  const perm = useMemo(() => {
    let p = seededPerm(q.items.length, q.id + seed + 'o')
    if (p.every((x, i) => x === i)) p = [...p].reverse()
    return p
  }, [q.id, q.items.length, seed])
  const chosen = value?.kind === 'order' ? value.value : []
  const add = (i: number) => onChange({ kind: 'order', value: [...chosen, i] })
  const remove = (pos: number) => onChange({ kind: 'order', value: chosen.filter((_, k) => k !== pos) })
  return (
    <div className="flex flex-col gap-4">
      <div className={cx('flex min-h-[64px] flex-wrap content-start gap-2 rounded-xl border-2 border-dashed p-3', revealed ? (result?.correct ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5' : 'border-rose-500 bg-rose-50/50 dark:bg-rose-500/5') : 'border-slate-300 dark:border-white/15')}>
        {chosen.length === 0 && <span className="self-center text-sm muted">Klikaj elementy poniżej w odpowiedniej kolejności…</span>}
        {chosen.map((i, pos) => (
          <button key={pos} disabled={revealed} onClick={() => remove(pos)} className="animate-pop rounded-lg bg-brand-500 px-3 py-1.5 font-semibold text-white shadow-sm">
            {q.items[i]}
          </button>
        ))}
      </div>
      {!revealed && (
        <div className="flex flex-wrap gap-2">
          {perm.map((i) =>
            chosen.includes(i) ? (
              <span key={i} className="rounded-lg border-2 border-transparent bg-slate-100 px-3 py-1.5 font-semibold text-transparent dark:bg-white/[0.04]">{q.items[i]}</span>
            ) : (
              <button key={i} onClick={() => add(i)} className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 font-semibold transition hover:border-brand-400 dark:border-white/10 dark:bg-ink-850">
                {q.items[i]}
              </button>
            ),
          )}
        </div>
      )}
      {revealed && !result?.correct && (
        <div className="text-sm">
          <span className="font-semibold text-emerald-600">Poprawnie: </span>
          {q.items.join(' ')}
        </div>
      )}
    </div>
  )
}

function TFView({ q, value, onChange, revealed, result }: Props & { q: TrueFalseQuestion }) {
  const vals = value?.kind === 'map' ? value.value : q.items.map(() => null)
  const set = (i: number, v: number) => {
    const next = [...vals]
    next[i] = v
    onChange({ kind: 'map', value: next })
  }
  return (
    <div className="flex flex-col gap-4">
      {q.stem && q.stem !== 'Richtig oder falsch?' && <Passage text={q.stem} />}
      <div className="grid gap-2.5">
        {q.items.map((it, i) => {
          const ok = result?.parts?.[i]
          return (
            <div key={i} className={cx('flex items-center gap-3 rounded-xl border-2 p-3', revealed ? (ok ? 'border-emerald-500/60' : 'border-rose-500/60') : 'border-slate-200 dark:border-white/[0.08]')}>
              <span className="w-5 shrink-0 text-sm font-bold text-brand-500">{i + 1}.</span>
              <span className="flex-1 text-[15px] font-medium">{it.statement}</span>
              <div className="flex shrink-0 gap-1.5">
                {[1, 0].map((v) => {
                  const isSel = vals[i] === v
                  const isRight = (v === 1) === it.answer
                  return (
                    <button
                      key={v}
                      disabled={revealed}
                      onClick={() => set(i, v)}
                      className={cx(
                        'h-9 w-9 rounded-lg border-2 text-sm font-bold transition',
                        revealed ? (isRight ? 'border-emerald-500 bg-emerald-500 text-white' : isSel ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-200 opacity-40 dark:border-white/10') : isSel ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 hover:border-brand-400 dark:border-white/10',
                      )}
                    >
                      {v === 1 ? 'R' : 'F'}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function Passage({ text, title }: { text: string; title?: string }) {
  return (
    <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[15.5px] leading-relaxed dark:border-white/[0.06] dark:bg-white/[0.02]">
      {title && <div className="mb-2 font-display text-base font-bold">{title}</div>}
      {text.split('\n').map((l, i) => (
        <p key={i} className={i ? 'mt-2' : ''}>
          {l}
        </p>
      ))}
    </div>
  )
}

function useSpeech(text: string) {
  const [speaking, setSpeaking] = useState(false)
  const [plays, setPlays] = useState(0)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [supported])
  const play = () => {
    if (!supported) return
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'de-DE'
    u.rate = 0.95
    const voice = synth.getVoices().find((v) => v.lang.startsWith('de'))
    if (voice) u.voice = voice
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    synth.cancel()
    synth.speak(u)
    setSpeaking(true)
    setPlays((p) => p + 1)
  }
  return { speaking, plays, play, supported }
}

function AudioBox({ text, maxPlays, reveal }: { text: string; maxPlays?: number; reveal: boolean }) {
  const { speaking, plays, play, supported } = useSpeech(text)
  const exhausted = maxPlays != null && plays >= maxPlays && !speaking
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-orange-50 p-4 dark:bg-orange-500/10">
      <div className="flex items-center gap-3">
        <button onClick={play} disabled={!supported || exhausted} className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition hover:bg-orange-600 disabled:opacity-40">
          {speaking ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <div className="text-sm">
          <div className="font-semibold">Nagranie (syntezator mowy, de-DE)</div>
          <div className="muted">
            {supported ? `Odtworzono: ${plays}${maxPlays ? ` / ${maxPlays}` : ''}` : 'Twoja przeglądarka nie obsługuje syntezy mowy - tekst pokaże się poniżej.'}
          </div>
        </div>
      </div>
      {(reveal || !supported) && <Passage text={text} />}
    </div>
  )
}

function ReadingView({ q, value, onChange, revealed, result, examMode }: Props & { q: ReadingQuestion }) {
  const vals = value?.kind === 'map' ? value.value : q.items.map(() => null)
  const set = (i: number, v: number) => {
    const next = [...vals]
    next[i] = v
    onChange({ kind: 'map', value: next })
  }
  const audio = q.category === 'hoeren'
  return (
    <div className="flex flex-col gap-4">
      {audio ? <AudioBox text={q.passage} maxPlays={examMode ? 2 : undefined} reveal={!!revealed} /> : <Passage text={q.passage} title={q.title} />}
      <div className="grid gap-3">
        {q.items.map((it, i) => {
          const ok = result?.parts?.[i]
          return (
            <div key={i} className={cx('rounded-xl border-2 p-3', revealed ? (ok ? 'border-emerald-500/60' : 'border-rose-500/60') : 'border-slate-200 dark:border-white/[0.08]')}>
              <div className="mb-2 text-[15px] font-semibold">
                <span className="mr-1.5 text-brand-500">{it.q.startsWith('(') ? '' : `${i + 1}.`}</span>
                {it.q}
              </div>
              <div className={cx('grid gap-1.5', it.options.every((o) => o.length < 18) ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
                {it.options.map((o, oi) => {
                  const isSel = vals[i] === oi
                  return (
                    <button key={oi} disabled={revealed} onClick={() => set(i, oi)} className={cx('option px-3 py-2 text-[15px]', optionState(revealed, oi === it.answer, isSel))}>
                      <span className="font-bold text-slate-400">{L(oi)}</span>
                      <span>{o}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WordbankView({ q, value, onChange, revealed, result }: Props & { q: WordbankQuestion }) {
  const vals = value?.kind === 'map' ? value.value : q.answers.map(() => null)
  const set = (i: number, v: number | null) => {
    const next = [...vals]
    next[i] = v
    onChange({ kind: 'map', value: next })
  }
  const sentences = q.bank.some((b) => b.length > 30)
  const parts = q.text.split(/(\{\d+\})/g)
  const gapEl = (bi: number): ReactNode => {
    const ok = result?.parts?.[bi]
    const cur = vals[bi]
    return (
      <span className="mx-0.5 inline-flex flex-col align-middle">
        <select
          value={cur ?? ''}
          disabled={revealed}
          onChange={(e) => set(bi, e.target.value === '' ? null : Number(e.target.value))}
          className={cx('max-w-[70vw] rounded-lg border-2 bg-white px-1.5 py-0.5 text-[15px] font-semibold outline-none dark:bg-ink-850', revealed ? (ok ? 'border-emerald-500' : 'border-rose-500') : cur != null ? 'border-brand-500' : 'border-slate-300 dark:border-white/15')}
        >
          <option value="">({bi + 1}) wybierz…</option>
          {q.bank.map((b, i) => (
            <option key={i} value={i}>
              {L(i)}{sentences ? '' : ` - ${b}`}
            </option>
          ))}
        </select>
        {revealed && !ok && <span className="text-center text-xs font-bold text-emerald-600">{L(q.answers[bi])}{sentences ? '' : ` ${q.bank[q.answers[bi]]}`}</span>}
      </span>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
        <div className="label mb-2">{sentences ? 'Zdania' : 'Ramka z wyrazami'}</div>
        <div className={cx(sentences ? 'grid gap-1.5' : 'flex flex-wrap gap-1.5')}>
          {q.bank.map((b, i) => (
            <div key={i} className={cx('flex gap-2 text-[15px]', !sentences && 'rounded-lg bg-white px-2 py-1 font-semibold shadow-sm dark:bg-ink-800')}>
              <span className="font-bold text-brand-500">{L(i)}</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[16px] leading-[2.4]">
        {parts.map((p, i) => {
          const m = p.match(/^\{(\d+)\}$/)
          return m ? <span key={i}>{gapEl(Number(m[1]))}</span> : <span key={i}>{p}</span>
        })}
      </p>
    </div>
  )
}
