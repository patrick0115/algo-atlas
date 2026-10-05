import { useEffect, useMemo, useState } from 'react'
import type { Pattern } from '../types'
import { collectFrames } from '../engine/frames'
import { maxArrayLen, renderView } from '../renderers'

const SPEEDS = [1, 2, 4, 8]

/**
 * 動畫比較:同一份輸入,讓分類裡每個演算法的動畫並排一起跑。
 * 共用一個「第幾步」,誰先跑完、誰卡在哪一步一眼看得到;已跑完的停在最後一格。
 */
export function Race({ patterns, names, presets }: { patterns: Pattern[]; names: Record<string, string>; presets: { label: string; values: Record<string, string> }[] }) {
  const first = patterns[0].demo
  const defaults = useMemo(() => Object.fromEntries(first.inputs.map((i) => [i.key, i.default])), [first])
  const [values, setValues] = useState<Record<string, string>>(presets[0]?.values ?? defaults)
  const [draft, setDraft] = useState(values)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)

  const runs = useMemo(() => patterns.map((p) => ({ p, ...collectFrames(p.demo, values) })), [patterns, values])
  const last = Math.max(0, ...runs.map((r) => r.frames.length - 1))
  // 名次:總步數少的先跑完;同步數同名次
  const finish = runs.filter((r) => !r.error).map((r) => r.frames.length)
  const rankOf = (n: number) => finish.filter((m) => m < n).length + 1
  const maxSteps = Math.max(1, ...finish)

  useEffect(() => {
    if (!playing) return
    if (step >= last) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, last)), 600 / speed)
    return () => clearTimeout(t)
  }, [playing, step, last, speed])

  const apply = (v: Record<string, string>) => {
    setDraft(v)
    setValues(v)
    setStep(0)
    setPlaying(false)
  }

  return (
    <div className="race">
      <div className="race-inputs">
        {presets.map((p) => (
          <button key={p.label} className={JSON.stringify(p.values) === JSON.stringify(values) ? 'primary' : ''} onClick={() => apply(p.values)}>
            {p.label}
          </button>
        ))}
        {first.random && <button onClick={() => apply(first.random!())}>🎲 隨機</button>}
        {first.inputs.map((i) => (
          <label key={i.key}>
            {i.label}
            <input
              value={draft[i.key] ?? ''}
              onChange={(e) => setDraft({ ...draft, [i.key]: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && apply(draft)}
            />
          </label>
        ))}
        <button onClick={() => apply(draft)}>套用</button>
      </div>

      <div className="race-grid">
        {runs.map(({ p, frames, error }) => {
          const done = step >= frames.length - 1
          const f = frames[Math.min(step, frames.length - 1)]
          return (
            <div key={p.id} className={`race-card${done ? ' finished' : ''}`}>
              <div className="race-head">
                <a href={`#/p/${p.id}`}>{names[p.id] ?? p.id}</a>
                {!error && (
                  <span className="race-count">
                    {done ? <b>✓ 第 {rankOf(frames.length)} 名</b> : null} {Math.min(step, frames.length - 1) + 1} / {frames.length} 步
                  </span>
                )}
              </div>
              {error ? (
                <div className="player-error">⚠ {error}</div>
              ) : (
                <>
                  <div className="race-stage">{f && f.views.map((v, i) => renderView(v, i, maxArrayLen(f.views)))}</div>
                  <div className="race-note">{f?.note}</div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="controls">
        <button onClick={() => { setStep(0); setPlaying(false) }} aria-label="回到開頭">⏮</button>
        <button onClick={() => { setStep(Math.max(0, step - 1)); setPlaying(false) }} aria-label="上一步">◀</button>
        <button className="primary" onClick={() => { if (step >= last) setStep(0); setPlaying(!playing) }} aria-label="播放或暫停">
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={() => { setStep(Math.min(last, step + 1)); setPlaying(false) }} aria-label="下一步">▶|</button>
        <input type="range" min={0} max={last} value={step} aria-label="進度" onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false) }} />
        <span className="step-count">
          {step + 1} / {last + 1}
        </span>
        <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="速度">
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </div>

      <div className="race-bars">
        <div className="view-label">這組輸入,每個動畫總共幾步</div>
        {runs
          .filter((r) => !r.error)
          .sort((a, b) => a.frames.length - b.frames.length)
          .map(({ p, frames }) => (
            <div key={p.id} className="race-bar-row">
              <span className="race-bar-name">{names[p.id] ?? p.id}</span>
              <span className="race-bar-track">
                <span className="race-bar" style={{ width: `${(frames.length / maxSteps) * 100}%` }} />
              </span>
              <span className="race-bar-num">{frames.length}</span>
            </div>
          ))}
        <p className="muted small-note">
          一步 ≈ 動畫裡的一格(一次比較、搬移或交換),各演算法切格的粗細不完全一樣,適合比「同一個演算法換不同輸入」和看大致趨勢;精確的複雜度以上面的總表為準。
        </p>
      </div>
    </div>
  )
}
