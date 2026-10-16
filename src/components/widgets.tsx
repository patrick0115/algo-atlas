import { useState } from 'react'

// 複雜度章的互動元件:成長比較(選 n 看各等級的運算量)與時間預算(輸入資料範圍,反推可行的複雜度)。
// 判題機大約每秒跑 1e8 次簡單運算,這是業界通用的粗估,不是精確值。

export const OPS_PER_SEC = 1e8

const fact = (n: number) => {
  let r = 1
  for (let i = 2; i <= n; i++) {
    r *= i
    if (!Number.isFinite(r)) return Infinity
  }
  return r
}

export const CLASSES: { name: string; f: (n: number) => number; eg: string }[] = [
  { name: 'O(1)', f: () => 1, eg: '陣列取值、Hash 查找' },
  { name: 'O(log n)', f: (n) => Math.max(1, Math.log2(n)), eg: '二分搜尋、平衡樹操作' },
  { name: 'O(√n)', f: (n) => Math.sqrt(n), eg: '試除法判質數' },
  { name: 'O(n)', f: (n) => n, eg: '掃一遍、雙指標、Hash 計數' },
  { name: 'O(n log n)', f: (n) => n * Math.max(1, Math.log2(n)), eg: '排序、Heap、對答案二分' },
  { name: 'O(n²)', f: (n) => n * n, eg: '雙層迴圈、二維 DP' },
  { name: 'O(n³)', f: (n) => n ** 3, eg: '三層迴圈、區間 DP、Floyd' },
  { name: 'O(2ⁿ)', f: (n) => 2 ** n, eg: '列舉子集、位元 DP' },
  { name: 'O(n!)', f: (n) => fact(n), eg: '列舉排列' },
]

export function fmtCount(x: number): string {
  if (!Number.isFinite(x) || x >= 1e100) return '天文數字'
  if (x < 1e4) return String(Math.round(x))
  const e = Math.floor(Math.log10(x))
  const m = x / 10 ** e
  return `${m.toFixed(1).replace(/\.0$/, '')}×10${sup(e)}`
}

const sup = (e: number) =>
  String(e)
    .split('')
    .map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])
    .join('')

export function fmtTime(ops: number): string {
  const s = ops / OPS_PER_SEC
  if (!Number.isFinite(s)) return '永遠跑不完'
  if (s < 1e-3) return '< 1 毫秒'
  if (s < 1) return `約 ${Math.round(s * 1000)} 毫秒`
  if (s < 60) return `約 ${s.toFixed(s < 10 ? 1 : 0)} 秒`
  if (s < 3600) return `約 ${Math.round(s / 60)} 分鐘`
  if (s < 86400 * 365) return `約 ${Math.round(s / 3600)} 小時`
  const y = s / (86400 * 365)
  return y < 1e6 ? `約 ${Math.round(y)} 年` : `約 ${fmtCount(y)} 年`
}

/** 2×10⁸ 內 = ok(1 秒是粗估,差 2 倍以內通常還過得了);2×10⁹ 內 = 看常數與語言;再多 = 不行 */
export function verdict(ops: number): 'ok' | 'tight' | 'no' {
  if (ops <= OPS_PER_SEC * 2) return 'ok'
  if (ops <= OPS_PER_SEC * 20) return 'tight'
  return 'no'
}

const VERDICT_TEXT = { ok: '✓ 過得了', tight: '△ 看常數', no: '✗ 會超時' }

// 長條用對數刻度,0 到 1e20;超過的直接頂滿
const MAX_EXP = 20
const widthOf = (ops: number) => (Number.isFinite(ops) ? Math.min(1, Math.log10(Math.max(1, ops)) / MAX_EXP) : 1) * 100

const NS = [10, 20, 100, 1000, 10_000, 100_000, 1_000_000, 1_000_000_000]

function Bars({ n }: { n: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const sec = (Math.log10(OPS_PER_SEC) / MAX_EXP) * 100
  return (
    <div className="gw">
      <div className="gw-rows" onMouseLeave={() => setHover(null)}>
        {CLASSES.map((c, i) => {
          const ops = c.f(n)
          const v = verdict(ops)
          return (
            <div
              key={c.name}
              className={`gw-row${hover === i ? ' on' : ''}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setHover(i)}
            >
              <span className="gw-name">{c.name}</span>
              <span className="gw-track">
                <i className={`gw-bar gw-${v}`} style={{ width: `${widthOf(ops)}%` }} />
                <span className="gw-sec" style={{ left: `${sec}%` }} />
              </span>
              <span className="gw-num">{fmtCount(ops)}</span>
              <span className={`gw-v gw-v-${v}`}>{VERDICT_TEXT[v]}</span>
            </div>
          )
        })}
      </div>
      <div className="gw-scale">
        <span>1</span>
        <span style={{ left: `${(Math.log10(OPS_PER_SEC) / MAX_EXP) * 100}%` }}>10⁸ ≈ 1 秒</span>
        <span style={{ left: '100%' }}>10²⁰</span>
      </div>
      <p className="gw-detail">
        {hover === null ? (
          <span className="muted">把滑鼠移到(或點)任一列,看 n = {n.toLocaleString()} 時大概要跑多久、典型用在哪裡。</span>
        ) : (
          <>
            <b>{CLASSES[hover].name}</b>,n = {n.toLocaleString()}:約 {fmtCount(CLASSES[hover].f(n))} 次運算,{fmtTime(CLASSES[hover].f(n))}
            <span className="muted"> · 典型:{CLASSES[hover].eg}</span>
          </>
        )}
      </p>
    </div>
  )
}

export function GrowthWidget() {
  const [n, setN] = useState(1000)
  return (
    <div className="widget">
      <div className="widget-head">
        <b>成長比較</b>
        <span className="muted">長條是運算次數(對數刻度,每一格是 10 倍);直線是 1 秒的預算</span>
      </div>
      <div className="widget-ctl">
        <span className="muted">n =</span>
        {NS.map((x) => (
          <button key={x} className={x === n ? 'primary' : ''} onClick={() => setN(x)}>
            {x >= 1e9 ? '10⁹' : x.toLocaleString()}
          </button>
        ))}
      </div>
      <Bars n={n} />
    </div>
  )
}

/** 解析使用者輸入的資料範圍:接受 100000、1e5、10^5、10**5、2*10^5、2e5、1,000 */
export function parseN(raw: string): number | null {
  const s = raw.replace(/[,\s_]/g, '').toLowerCase()
  let m = s.match(/^(\d+(?:\.\d+)?)\*?10(?:\^|\*\*)(\d+)$/)
  if (m) return Number(m[1]) * 10 ** Number(m[2])
  m = s.match(/^10(?:\^|\*\*)(\d+)$/)
  if (m) return 10 ** Number(m[1])
  if (/^\d+(?:\.\d+)?(?:e\d+)?$/.test(s)) return Number(s)
  return null
}

/** 資料範圍 → 建議的最高複雜度(取 1 秒內過得了的最慢等級) */
export function suggest(n: number) {
  const ok = CLASSES.filter((c) => verdict(c.f(n)) === 'ok')
  return ok.at(-1) ?? CLASSES[0]
}

export function BudgetWidget() {
  const [raw, setRaw] = useState('10^5')
  const n = parseN(raw)
  const valid = n !== null && n >= 1 && n <= 1e18
  const best = valid ? suggest(n) : null
  return (
    <div className="widget">
      <div className="widget-head">
        <b>時間預算計算機</b>
        <span className="muted">輸入題目 Constraints 裡 n 的上限</span>
      </div>
      <div className="widget-ctl">
        <label className="gw-input">
          <span className="muted">n ≤</span>
          <input value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="例如 10^5、2*10^4、1e9" />
        </label>
        {['8', '20', '500', '5000', '10^5', '10^6', '10^9'].map((x) => (
          <button key={x} className={x === raw ? 'primary' : ''} onClick={() => setRaw(x)}>
            {x}
          </button>
        ))}
      </div>
      {!valid ? (
        <p className="player-error">看不懂這個數字。可以寫 100000、1e5、10^5 或 2*10^5。</p>
      ) : (
        <>
          <p className="gw-headline">
            n ≤ {n.toLocaleString()} → 最慢可以用到 <b>{best!.name}</b>
            <span className="muted"> · 典型:{best!.eg}</span>
          </p>
          <Bars n={n} />
        </>
      )}
    </div>
  )
}
