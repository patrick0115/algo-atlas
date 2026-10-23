import { useEffect, useMemo, useState } from 'react'
import type { Status } from '../types'
import { PROBLEMS } from '../data/problems'
import { findStub } from '../data/categories'
import { useProgress } from '../engine/progress'
import { hasSolution } from '../solutions'
import { dueProblems } from '../engine/review'
import { addDays, buildPlan, EXTENDED_STAGE, extendedPool, EXTRA_STAGE, extraPool, extrasFor, nextUp, schedule, weekStart, weeksLeft, type PlanItem } from '../engine/plan'

// 刷題藍圖頁:上面挑今天要寫的題目,下面是整條路線的每週排程。
// 設定與「今天」清單存在 localStorage,只在本機。

const KEY = 'lcv:plan:v1'

interface Settings {
  perWeek: number
  /** 目標日 YYYY-MM-DD */
  target: string
  skipPaid: boolean
  /** 今天挑的題目;換日時沒寫完的會留下來 */
  today: { date: string; ids: number[] }
}

const DEFAULTS: Settings = { perWeek: 7, target: '2027-03-31', skipPaid: true, today: { date: '', ids: [] } }

const STATUS: { id: Status; label: string }[] = [
  { id: 'ok', label: '會' },
  { id: 'fuzzy', label: '模糊' },
  { id: 'no', label: '不會' },
]
const STATUS_LABEL = Object.fromEntries(STATUS.map((s) => [s.id, s.label])) as Record<Status, string>

const SHOW_WEEKS = 4
/** 延伸題庫一次列出幾題 */
const SHOW_EXTENDED = 10

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (t: number) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const md = (t: number) => {
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
const parseYmd = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}
const nameOf = (id: string) => findStub(id)?.stub.name ?? id

function load(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return DEFAULTS
  }
}

function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const [s, setS] = useState<Settings>(load)
  const update = (patch: Partial<Settings>) => {
    const next = { ...s, ...patch }
    setS(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* 儲存失敗就只在這次瀏覽有效 */
    }
  }
  return [s, update]
}

function ProblemTitle({ it }: { it: PlanItem }) {
  const p = it.problem
  const title = p.id + '. ' + p.title
  return (
    <span className="plan-title">
      {hasSolution(p.id) ? (
        <a className="plan-solution" href={'#/q/' + p.id} title="查看本站題解">
          {title}
        </a>
      ) : (
        <span title="題解尚未提供">{title}</span>
      )}
      {p.titleZh && <span className="zh">{p.titleZh}</span>}
      {p.paid && <span className="muted"> 🔒</span>}
      <a className="plan-leetcode" href={'https://leetcode.com/problems/' + p.slug + '/'} target="_blank" rel="noreferrer" title="在 LeetCode 開啟題目">
        LeetCode ↗
      </a>
    </span>
  )
}

function Meta({ it }: { it: PlanItem }) {
  const p = it.problem
  return (
    <span className="plan-meta">
      <span className={`diff diff-${p.difficulty}`}>{p.difficulty}</span>
      {p.patterns[0] && (
        <a className="tag" href={`#/p/${p.patterns[0]}`} title="先看這個演算法的講義">
          {nameOf(p.patterns[0])}
        </a>
      )}
    </span>
  )
}

/** focus:從題解頁回來時要捲到的題號;找不到這題(延伸題庫後段)就捲到延伸題庫 */
export function Plan({ focus }: { focus?: number }) {
  const { store, mark } = useProgress()
  const [settings, update] = useSettings()
  const [now] = useState(() => Date.now())
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const plan = useMemo(() => buildPlan(PROBLEMS, { skipPaid: settings.skipPaid }), [settings.skipPaid])
  const pool = useMemo(() => extraPool(PROBLEMS, { skipPaid: settings.skipPaid }), [settings.skipPaid])
  const ext = useMemo(() => extendedPool(PROBLEMS, { skipPaid: settings.skipPaid }).map((problem) => ({ problem, stage: EXTENDED_STAGE })), [settings.skipPaid])
  const byId = useMemo(
    () =>
      new Map<number, PlanItem>([
        ...ext.map((it) => [it.problem.id, it] as const),
        ...pool.map((problem) => [problem.id, { problem, stage: EXTRA_STAGE }] as const),
        ...plan.map((it) => [it.problem.id, it] as const),
      ]),
    [plan, pool, ext],
  )
  const sch = schedule(plan, store, now, settings.perWeek)
  const extras = extrasFor(sch.weeks, pool, store, now)
  const extraDone = extras[0].filter((it) => store[it.problem.id]).length

  // 換日:昨天挑了但沒寫完的留下來
  const todayStr = ymd(now)
  const todayIds =
    settings.today.date === todayStr
      ? settings.today.ids
      : settings.today.ids.filter((id) => !store[id])
  const today = todayIds.map((id) => byId.get(id)).filter((it): it is PlanItem => !!it)
  const setToday = (ids: number[]) => update({ today: { date: todayStr, ids } })
  const addToday = (ids: number[]) => setToday([...todayIds, ...ids.filter((id) => !todayIds.includes(id))])

  const target = parseYmd(settings.target) || parseYmd(DEFAULTS.target)
  const left = weeksLeft(now, target)
  const remaining = plan.length - sch.done
  const buffer = left - sch.weeks.length
  const needPerWeek = left > 0 ? Math.ceil(remaining / left) : remaining
  const due = dueProblems(PROBLEMS, store, now).length
  const upcoming = nextUp(plan, store, todayIds, 1)
  const nextExtra = extras.flat().find((it) => !store[it.problem.id] && !todayIds.includes(it.problem.id))
  const extDone = ext.filter((it) => store[it.problem.id]).length
  const extNext = ext.filter((it) => !store[it.problem.id]).slice(0, SHOW_EXTENDED)
  const extWritten = ext.filter((it) => hasSolution(it.problem.id)).length

  useEffect(() => {
    if (!focus) return
    const el = document.getElementById(`plan-q-${focus}`) ?? document.getElementById('plan-ext')
    if (!el) return
    for (let d = el.closest('details'); d; d = d.parentElement?.closest('details') ?? null) d.open = true
    el.scrollIntoView({ block: 'center' })
    el.classList.add('focus')
  }, [focus])

  const toggleReveal = (id: number) => {
    const next = new Set(revealed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setRevealed(next)
  }

  const routeRow = (it: PlanItem) => {
    const s = store[it.problem.id]?.status
    const inToday = todayIds.includes(it.problem.id)
    return (
      <li key={it.problem.id} id={`plan-q-${it.problem.id}`} className={s ? 'done' : ''}>
        <ProblemTitle it={it} />
        <Meta it={it} />
        <span className="plan-act">
          {s ? (
            <span className={`plan-status st-${s}`}>✓ {STATUS_LABEL[s]}</span>
          ) : inToday ? (
            <span className="muted">今天</span>
          ) : (
            <button className="small" onClick={() => addToday([it.problem.id])}>
              ＋今天
            </button>
          )}
        </span>
      </li>
    )
  }

  const weekCard = (w: (typeof sch.weeks)[number], i: number) => {
    const stages = [...new Set(w.items.map((it) => it.stage.name))]
    const done = w.items.filter((it) => store[it.problem.id]).length
    return (
      <section key={w.start} className={`plan-week${i === 0 ? ' current' : ''}`}>
        <header>
          <b>{i === 0 ? '本週' : `第 ${i + 1} 週`}</b>
          <span className="muted">
            {md(w.start)}–{md(addDays(w.start, 6))} · {stages.join('、')}
          </span>
          <span className="plan-count">
            {done}/{w.items.length}
          </span>
        </header>
        <ol>{w.items.map(routeRow)}</ol>
        {extras[i].length > 0 && (
          <details className="plan-extra" open={i === 0}>
            <summary>
              加練(選寫) <span className="muted">同主題再練,寫不寫都不影響進度 · {extras[i].filter((it) => store[it.problem.id]).length}/{extras[i].length}</span>
            </summary>
            <ol>{extras[i].map(routeRow)}</ol>
          </details>
        )}
      </section>
    )
  }

  return (
    <div className="page plan">
      <h1>刷題藍圖</h1>
      <p className="lead">
        核心題是 NeetCode 150,依「基本功 → 樹與 Heap → 回溯、貪心與圖 → 動態規劃」排好,先修的演算法在前、
        同一個演算法內由易到難,Hard 集中在最後衝刺。每週另附幾題同主題的加練,有空再寫。
        核心題多寫就往前推、少寫就往後延,只要每週不低於「保底」就趕得上目標日。
      </p>

      <div className="plan-stats">
        <div>
          <b>
            {sch.doneThisWeek}/{settings.perWeek}
            {extraDone > 0 && <small> +{extraDone} 加練</small>}
          </b>
          <span>本週核心({md(weekStart(now))} 起)</span>
        </div>
        <div>
          <b>{needPerWeek} 題</b>
          <span>保底:每週核心寫到這個數,{settings.target} 前寫得完</span>
        </div>
        <div>
          <b>
            {sch.done}/{plan.length}
          </b>
          <span>核心總進度</span>
        </div>
        <div>
          <b className={buffer < 0 ? 'bad' : ''}>{ymd(sch.finish)}</b>
          <span>
            照每週 {settings.perWeek} 題寫完,{buffer >= 0 ? `比目標早 ${buffer} 週,留給複習` : `比目標晚 ${-buffer} 週`}
          </span>
        </div>
      </div>
      <div className="plan-bar" title={`${sch.done}/${plan.length}`}>
        <i style={{ width: `${(sch.done / Math.max(1, plan.length)) * 100}%` }} />
      </div>

      <section className="plan-today">
        <h2>今天寫這些</h2>
        {today.length === 0 ? (
          <div className="plan-quick">
            <span className="muted">還沒挑題目。照路線排下一批:</span>
            {[1, 2, 3].map((n) => (
              <button key={n} className={n === 1 ? 'primary' : ''} onClick={() => addToday(nextUp(plan, store, todayIds, n).map((it) => it.problem.id))}>
                {n} 題
              </button>
            ))}
            {nextExtra && (
              <button onClick={() => addToday([nextExtra.problem.id])} title={`${nextExtra.problem.id}. ${nextExtra.problem.title}`}>
                加練 1 題
              </button>
            )}
          </div>
        ) : (
          <ol className="plan-today-list">
            {today.map((it) => {
              const p = it.problem
              const s = store[p.id]?.status
              const hidden = !revealed.has(p.id)
              return (
                <li key={p.id} className={s ? 'done' : ''}>
                  <div className="plan-today-head">
                    <ProblemTitle it={it} />
                    <button className="ghost small" onClick={() => setToday(todayIds.filter((x) => x !== p.id))} title="從今天移除">
                      ✕
                    </button>
                  </div>
                  <div className="plan-today-body">
                    <Meta it={it} />
                    <span className="muted">{it.stage.name}</span>
                    {p.key && (
                      <button className={`plan-key${hidden ? ' hidden' : ''}`} onClick={() => toggleReveal(p.id)}>
                        {hidden ? '提示 · · ·' : p.key}
                      </button>
                    )}
                  </div>
                  <div className="plan-today-mark">
                    <span className="muted">寫完標記:</span>
                    <span className="mark-buttons">
                      {STATUS.map((st) => (
                        <button key={st.id} className={s === st.id ? 'primary' : ''} onClick={() => mark(p.id, s === st.id ? null : st.id)}>
                          {st.label}
                        </button>
                      ))}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
        <p className="plan-today-foot">
          {today.length > 0 && upcoming.length > 0 && (
            <button className="small" onClick={() => addToday(upcoming.map((it) => it.problem.id))}>
              ＋ 再加下一題({upcoming[0].problem.id}. {upcoming[0].problem.title})
            </button>
          )}
          {today.length > 0 && nextExtra && (
            <button className="small" onClick={() => addToday([nextExtra.problem.id])}>
              ＋ 加練一題({nextExtra.problem.id}. {nextExtra.problem.title})
            </button>
          )}
          {due > 0 && (
            <a href="#/review">
              另有 {due} 題到期該複習 →
            </a>
          )}
        </p>
        <p className="muted small-note">
          標記「不會 / 模糊」的題目會自動排進<a href="#/review">複習</a>;沒寫完的題目明天還會在這裡。
        </p>
      </section>

      <details className="plan-settings">
        <summary>設定:每週 {settings.perWeek} 題 · 目標 {settings.target}{settings.skipPaid ? ' · 跳過付費題' : ''}</summary>
        <div className="filters">
          <label>
            每週{' '}
            <input
              type="number"
              min={1}
              max={50}
              value={settings.perWeek}
              onChange={(e) => update({ perWeek: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
            />{' '}
            題
          </label>
          <label>
            目標日 <input type="date" value={settings.target} onChange={(e) => e.target.value && update({ target: e.target.value })} />
          </label>
          <label className="check">
            <input type="checkbox" checked={settings.skipPaid} onChange={(e) => update({ skipPaid: e.target.checked })} />
            跳過付費題(需要 LeetCode Premium)
          </label>
        </div>
      </details>

      <h2>路線</h2>
      {remaining === 0 && <p>整條路線都寫完了。接下來把「模糊 / 不會」的題目在<a href="#/review">複習頁</a>重寫一輪。</p>}
      {sch.earlier.length > 0 && (
        <details className="plan-week earlier">
          <summary>
            <b>之前已寫過</b> <span className="muted">{sch.earlier.length} 題</span>
          </summary>
          <ol>{sch.earlier.map(routeRow)}</ol>
        </details>
      )}
      {sch.weeks.slice(0, SHOW_WEEKS).map(weekCard)}
      {sch.weeks.length > SHOW_WEEKS && (
        <details className="plan-later">
          <summary>
            之後還有 {sch.weeks.length - SHOW_WEEKS} 週({sch.weeks.slice(SHOW_WEEKS).reduce((n, w) => n + w.items.length, 0)} 題)
          </summary>
          {sch.weeks.slice(SHOW_WEEKS).map((w, i) => weekCard(w, i + SHOW_WEEKS))}
        </details>
      )}

      <h2 id="plan-ext">延伸題庫</h2>
      <p className="muted">
        NeetCode 450 以外的題目,依 LeetCode 熱門度(讚數、好評比例)由高到低排。核心路線寫完、或想多練時從這裡往下挑。
        已寫 {extDone}/{ext.length} 題 · 本站題解 {extWritten} 題
      </p>
      <section className="plan-week">
        <header>
          <b>接下來的 {extNext.length} 題</b>
        </header>
        <ol>{extNext.map(routeRow)}</ol>
      </section>
    </div>
  )
}
