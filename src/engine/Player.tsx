import { useEffect, useMemo, useState } from 'react'
import type { Demo, Frame, Lang } from '../types'
import { renderView } from '../renderers'
import { CodePanel } from '../components/CodePanel'

const MAX_FRAMES = 2000

function collect(demo: Demo, values: Record<string, string>): { frames: Frame[]; error?: string } {
  try {
    const frames: Frame[] = []
    for (const f of demo.run(values)) {
      frames.push(f)
      if (frames.length >= MAX_FRAMES) break
    }
    return { frames }
  } catch (e) {
    return { frames: [], error: e instanceof Error ? e.message : String(e) }
  }
}

const SPEEDS = [0.5, 1, 2, 4]

export function Player({ demo, lang, onLang }: { demo: Demo; lang: Lang; onLang: (l: Lang) => void }) {
  const defaults = useMemo(() => Object.fromEntries(demo.inputs.map((i) => [i.key, i.default])), [demo])
  const [draft, setDraft] = useState(defaults)
  const [values, setValues] = useState(defaults)
  const { frames, error } = useMemo(() => collect(demo, values), [demo, values])

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const last = Math.max(frames.length - 1, 0)
  const frame = frames[Math.min(step, last)]

  useEffect(() => {
    if (!playing) return
    if (step >= last) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, last)), 800 / speed)
    return () => clearTimeout(t)
  }, [playing, step, last, speed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, last))
      else if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0))
      else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else return
      if (e.key !== ' ') setPlaying(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [last])

  const apply = () => {
    setValues(draft)
    setStep(0)
    setPlaying(false)
  }

  return (
    <div className="player">
      <form
        className="player-inputs"
        onSubmit={(e) => {
          e.preventDefault()
          apply()
        }}
      >
        {demo.inputs.map((i) => (
          <label key={i.key}>
            <span>{i.label}</span>
            <input value={draft[i.key]} onChange={(e) => setDraft({ ...draft, [i.key]: e.target.value })} />
          </label>
        ))}
        <button type="submit">套用</button>
        <button type="button" className="ghost" onClick={() => setDraft(defaults)}>
          還原範例
        </button>
      </form>

      {error ? (
        <div className="player-error">{error}</div>
      ) : (
        <div className="player-body">
          <div className="player-stage">
            <div className="stage-views">{frame?.views.map((v, i) => renderView(v, i))}</div>
            <div className="stage-note">{frame?.note}</div>
            {frame?.vars && (
              <div className="stage-vars">
                {Object.entries(frame.vars).map(([k, v]) => (
                  <span key={k}>
                    <b>{k}</b> = {v}
                  </span>
                ))}
              </div>
            )}
            <div className="controls">
              <button onClick={() => { setStep(0); setPlaying(false) }} title="回到開頭">⏮</button>
              <button onClick={() => { setStep((s) => Math.max(s - 1, 0)); setPlaying(false) }} title="上一步(←)">◀</button>
              <button className="primary" onClick={() => { if (step >= last) setStep(0); setPlaying(!playing) }} title="播放/暫停(空白鍵)">
                {playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => { setStep((s) => Math.min(s + 1, last)); setPlaying(false) }} title="下一步(→)">▶|</button>
              <input
                type="range"
                min={0}
                max={last}
                value={Math.min(step, last)}
                onChange={(e) => { setStep(Number(e.target.value)); setPlaying(false) }}
              />
              <span className="step-count">
                {Math.min(step, last) + 1} / {frames.length}
              </span>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} title="速度">
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}×
                  </option>
                ))}
              </select>
            </div>
          </div>
          <CodePanel code={demo.code} lang={lang} onLang={onLang} activeTag={frame?.line} />
        </div>
      )}
    </div>
  )
}
