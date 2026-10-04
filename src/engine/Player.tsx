import { useEffect, useMemo, useRef, useState } from 'react'
import type { Demo, Frame, Lang } from '../types'
import { collectFrames } from './frames'
import { maxArrayLen, renderView } from '../renderers'
import { Legend } from '../renderers/legend'
import { CodePanel } from '../components/CodePanel'
import { parseCode } from './code'

const SPEEDS = [0.5, 1, 2, 4]

type Mode = 'watch' | 'predict'

/** 由字串產生固定的亂數種子,同一步重畫時選項順序不變 */
function seeded(seed: number) {
  let s = seed % 2147483647 || 1
  return () => (s = (s * 48271) % 2147483647) / 2147483647
}

/** 猜下一步的選項:正確的那一行 + 最多 3 個本次動畫實際跑過的其他行 */
function predictOptions(frames: Frame[], step: number, code: string): { tag: string; text: string }[] {
  const next = frames[step + 1]
  if (!next) return []
  const lines = parseCode(code)
  const textOf = (tag: string) => lines.find((l) => l.tag === tag)?.text.trim() ?? tag
  const used = [...new Set(frames.map((f) => f.line))].filter((t) => t !== next.line)
  const rnd = seeded(step * 7919 + frames.length)
  const pick = used.sort(() => rnd() - 0.5).slice(0, 3)
  return [next.line, ...pick].sort(() => rnd() - 0.5).map((tag) => ({ tag, text: textOf(tag) }))
}

export function Player({ demo, lang, onLang }: { demo: Demo; lang: Lang; onLang: (l: Lang) => void }) {
  const defaults = useMemo(() => Object.fromEntries(demo.inputs.map((i) => [i.key, i.default])), [demo])
  const [draft, setDraft] = useState(defaults)
  const [values, setValues] = useState(defaults)
  const { frames, error } = useMemo(() => collectFrames(demo, values), [demo, values])

  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [mode, setMode] = useState<Mode>('watch')
  const [guess, setGuess] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const last = Math.max(frames.length - 1, 0)
  const cur = Math.min(step, last)
  const frame = frames[cur]
  const prev = cur > 0 ? frames[cur - 1] : undefined

  const go = (s: number) => {
    setStep(Math.max(0, Math.min(s, last)))
    setGuess(null)
  }

  useEffect(() => {
    if (!playing) return
    if (step >= last) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, last)), 800 / speed)
    return () => clearTimeout(t)
  }, [playing, step, last, speed])

  // 鍵盤:猜題模式下 → 不直接前進(要先作答)
  const keyState = useRef({ last, mode, guess })
  useEffect(() => {
    keyState.current = { last, mode, guess }
  }, [last, mode, guess])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') return
      const { last, mode, guess } = keyState.current
      const blocked = mode === 'predict' && guess === null
      if (e.key === 'ArrowRight') {
        if (blocked) return
        setStep((s) => Math.min(s + 1, last))
        setGuess(null)
      } else if (e.key === 'ArrowLeft') {
        setStep((s) => Math.max(s - 1, 0))
        setGuess(null)
      } else if (e.key === 'Home') {
        setStep(0)
        setGuess(null)
      } else if (e.key === 'End') {
        if (blocked) return
        setStep(last)
        setGuess(null)
      } else if (e.key === ' ') {
        if (mode === 'predict') return
        e.preventDefault()
        setPlaying((p) => !p)
        return
      } else return
      e.preventDefault()
      setPlaying(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const apply = (v = draft) => {
    setValues(v)
    setStep(0)
    setPlaying(false)
    setGuess(null)
  }

  const randomize = () => {
    if (!demo.random) return
    const v = demo.random()
    setDraft(v)
    apply(v)
  }

  const options = useMemo(
    () => (mode === 'predict' ? predictOptions(frames, cur, demo.code[lang]) : []),
    [mode, frames, cur, demo, lang],
  )
  const answerTag = frames[cur + 1]?.line

  const choose = (tag: string) => {
    if (guess !== null) return
    setGuess(tag)
    setScore((s) => ({ right: s.right + (tag === answerTag ? 1 : 0), total: s.total + 1 }))
  }

  const changed = (k: string, v: string | number) => prev !== undefined && String(prev.vars?.[k]) !== String(v)

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
        {demo.random && (
          <button type="button" onClick={randomize} title="產生一組隨機輸入並套用">
            🎲 隨機
          </button>
        )}
        <button
          type="button"
          className="ghost"
          onClick={() => {
            setDraft(defaults)
            apply(defaults)
          }}
        >
          還原範例
        </button>
        <div className="mode-switch" role="tablist" aria-label="模式">
          <button type="button" role="tab" aria-selected={mode === 'watch'} className={mode === 'watch' ? 'on' : ''} onClick={() => { setMode('watch'); setGuess(null) }}>
            看動畫
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'predict'}
            className={mode === 'predict' ? 'on' : ''}
            onClick={() => { setMode('predict'); setPlaying(false); setGuess(null) }}
            title="每一步先猜下一行會執行哪裡,再看答案"
          >
            猜下一步
          </button>
        </div>
      </form>

      {error ? (
        <div className="player-error">⚠ {error}</div>
      ) : (
        <div className="player-body">
          <div className="player-stage">
            <div className="stage-views">{frame && frame.views.map((v, i) => renderView(v, i, maxArrayLen(frame.views)))}</div>
            {frame && <Legend views={frame.views} />}
            <div className="stage-note">
              <span className="note-step">步驟 {cur + 1}</span>
              {frame?.note}
            </div>
            {frame?.vars && (
              <div className="stage-vars">
                {Object.entries(frame.vars).map(([k, v]) => (
                  <span key={k} className={changed(k, v) ? 'changed' : ''} title={changed(k, v) ? `上一步是 ${prev?.vars?.[k] ?? '(無)'}` : undefined}>
                    <b>{k}</b> = {v}
                  </span>
                ))}
              </div>
            )}

            {mode === 'predict' && (
              <div className="predict">
                {cur >= last ? (
                  <div className="predict-q">
                    演算法跑完了。這次猜對 {score.right} / {score.total} 步
                    {score.total > 0 && `(${Math.round((score.right / score.total) * 100)}%)`}。
                    <button type="button" className="ghost" onClick={() => { go(0); setScore({ right: 0, total: 0 }) }}>
                      從頭再猜一次
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="predict-q">
                      🤔 下一步會執行哪一行?
                      <span className="muted">猜對 {score.right} / {score.total}</span>
                    </div>
                    <div className="predict-options">
                      {options.map((o) => (
                        <button
                          key={o.tag}
                          type="button"
                          onClick={() => choose(o.tag)}
                          className={guess === null ? '' : o.tag === answerTag ? 'right' : o.tag === guess ? 'wrong' : 'faded'}
                        >
                          <code>{o.text}</code>
                        </button>
                      ))}
                    </div>
                    {guess !== null && (
                      <div className="predict-result">
                        {guess === answerTag ? '✔ 答對了!' : '✘ 不是這行。'}
                        <span className="muted">下一步:{frames[cur + 1]?.note}</span>
                        <button type="button" className="primary" onClick={() => go(cur + 1)}>
                          看下一步 →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="controls">
              <button onClick={() => { go(0); setPlaying(false) }} title="回到開頭(Home)" aria-label="回到開頭">⏮</button>
              <button onClick={() => { go(cur - 1); setPlaying(false) }} title="上一步(←)" aria-label="上一步">◀</button>
              <button
                className="primary"
                disabled={mode === 'predict'}
                onClick={() => { if (step >= last) setStep(0); setPlaying(!playing) }}
                title={mode === 'predict' ? '猜題模式請一步一步作答' : '播放 / 暫停(空白鍵)'}
                aria-label="播放或暫停"
              >
                {playing ? '⏸' : '▶'}
              </button>
              <button
                disabled={mode === 'predict' && guess === null && cur < last}
                onClick={() => { go(cur + 1); setPlaying(false) }}
                title="下一步(→)"
                aria-label="下一步"
              >
                ▶|
              </button>
              <input
                type="range"
                min={0}
                max={last}
                value={cur}
                aria-label="進度"
                onChange={(e) => { go(Number(e.target.value)); setPlaying(false) }}
              />
              <span className="step-count">
                {cur + 1} / {frames.length}
              </span>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} title="速度" aria-label="速度">
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {s}×
                  </option>
                ))}
              </select>
            </div>
            <div className="kbd-hint">
              <kbd>←</kbd> <kbd>→</kbd> 單步 · <kbd>空白</kbd> 播放 · <kbd>Home</kbd> <kbd>End</kbd> 頭尾 · 輸入框可改成自己的資料
            </div>

            <details className="step-log">
              <summary>旁白紀錄(已看 {cur + 1} / {frames.length} 步,點一下跳過去)</summary>
              <ol>
                {frames.slice(0, cur + 1).map((f, i) => (
                  <li key={i} className={i === cur ? 'now' : ''} onClick={() => { go(i); setPlaying(false) }}>
                    {f.note}
                  </li>
                ))}
              </ol>
            </details>
          </div>
          <CodePanel code={demo.code} lang={lang} onLang={onLang} activeTag={frame?.line} />
        </div>
      )}
    </div>
  )
}
