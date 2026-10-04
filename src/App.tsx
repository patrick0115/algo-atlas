import { useEffect, useState } from 'react'
import { CATEGORIES, findStub } from './data/categories'
import { PROBLEMS, problemsOf } from './data/problems'
import { LEVEL_NAME, PRO, type ProNote } from './data/pro'
import { PATTERNS } from './patterns'
import { Player } from './engine/Player'
import { ProblemList } from './components/ProblemList'
import { Review } from './components/Review'
import { highlight } from './engine/code'
import { useLang, useProgress } from './engine/progress'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/')
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash.slice(1) || '/')
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

const ORDER = CATEGORIES.flatMap((c) => c.patterns)
const nameOf = (id: string) => findStub(id)?.stub.name ?? id

function LevelBadge({ id }: { id: string }) {
  const lv = PRO[id]?.level
  if (!lv) return null
  return <span className={`lv lv-${lv}`} title={`難度:${LEVEL_NAME[lv]}`}>{LEVEL_NAME[lv]}</span>
}

function Sidebar({ current }: { current: string }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const kw = q.trim().toLowerCase()
  const match = (p: { id: string; name: string }) => !kw || p.name.toLowerCase().includes(kw) || p.id.includes(kw)

  return (
    <nav
      className={`sidebar${open ? ' open' : ''}`}
      onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}
    >
      <div className="side-top">
        <a href="#/" className="brand">
          LeetCode 演算法圖鑑
        </a>
        <button className="side-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? '收起目錄' : '☰ 目錄'}
        </button>
      </div>
      <div className="side-body">
        <input className="side-search" type="search" placeholder="搜尋演算法…" value={q} onChange={(e) => setQ(e.target.value)} />
        <a href="#/review" className={`side-link${current === 'review' ? ' active' : ''}`}>
          複習
        </a>
        <a href="#/problems" className={`side-link${current === 'problems' ? ' active' : ''}`}>
          全部題目
        </a>
        {CATEGORIES.map((c) => {
          const ps = c.patterns.filter(match)
          if (!ps.length) return null
          return (
            <div key={c.id} className="side-group">
              <div className="side-cat">{c.name}</div>
              {ps.map((p) => (
                <a
                  key={p.id}
                  href={`#/p/${p.id}`}
                  className={`side-link${current === p.id ? ' active' : ''}${PATTERNS[p.id] ? '' : ' todo'}`}
                >
                  {p.name}
                  <i className={`dot lv-dot-${PRO[p.id]?.level ?? 0}`} />
                </a>
              ))}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

function Home() {
  const { store } = useProgress()
  const done = PROBLEMS.filter((p) => store[p.id]?.status === 'ok').length
  return (
    <div className="page">
      <h1>演算法總覽</h1>
      <p className="lead">
        LeetCode 有幾千題,但用到的演算法只有這幾十種。每一頁從白話和比喻開始,用可以自己改輸入的動畫一步一步跑給你看,
        再往上講到「為什麼正確、通用模板、常見變形、面試怎麼講」,最後列出所有用到它的題目。
      </p>

      <div className="howto">
        <div>
          <b>① 白話</b>
          <span>一句話 + 生活比喻,先抓直覺</span>
        </div>
        <div>
          <b>② 動畫</b>
          <span>改輸入、單步執行,程式碼同步高亮;可切到「猜下一步」自我測驗</span>
        </div>
        <div>
          <b>③ 判斷</b>
          <span>題目出現什麼訊號要想到它、哪裡最容易錯</span>
        </div>
        <div>
          <b>④ 專業</b>
          <span>不變量 / 正確性、通用模板、變形題、和相近演算法比較</span>
        </div>
        <div>
          <b>⑤ 練習</b>
          <span>相關題目、標記會不會,進複習排程</span>
        </div>
      </div>

      <p className="legend">
        {ORDER.length} 個演算法 · 收錄 {PROBLEMS.length} 題 · 你標記「會」的有 {done} 題 · 難度標記:
        <span className="lv lv-1">入門</span> <span className="lv lv-2">中階</span> <span className="lv lv-3">進階</span>
        · 新手建議先讀完所有「入門」,再依分類往下
      </p>
      <div className="cat-grid">
        {CATEGORIES.map((c) => (
          <section key={c.id} className="cat-card">
            <h2>{c.name}</h2>
            <ul>
              {c.patterns.map((p) => {
                const n = problemsOf(p.id).length
                return (
                  <li key={p.id} className={PATTERNS[p.id] ? '' : 'todo'}>
                    <a href={`#/p/${p.id}`}>{p.name}</a>
                    <span className="muted">
                      <LevelBadge id={p.id} /> {n > 0 ? `${n} 題` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

// ---- 演算法頁 ----

const SECTIONS = [
  { id: 'sec-plain', label: '① 白話' },
  { id: 'sec-demo', label: '② 動畫' },
  { id: 'sec-judge', label: '③ 判斷' },
  { id: 'sec-pro', label: '④ 專業' },
  { id: 'sec-problems', label: '⑤ 題目' },
]

function Toc() {
  const [active, setActive] = useState(SECTIONS[0].id)
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e)
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { rootMargin: '-60px 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
  return (
    <div className="toc" role="navigation" aria-label="本頁段落">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          className={active === s.id ? 'on' : ''}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

function ProSection({ pro }: { pro: ProNote }) {
  const [showTpl, setShowTpl] = useState(true)
  return (
    <>
      <div className="pro-block">
        <h3>為什麼是對的(不變量)</h3>
        <p>{pro.invariant}</p>
      </div>

      <div className="pro-block">
        <h3>
          通用模板 <span className="muted">Python,把中文的部分換成題目的邏輯</span>
          <button className="ghost small" onClick={() => setShowTpl(!showTpl)}>
            {showTpl ? '收起' : '展開'}
          </button>
        </h3>
        {showTpl && (
          <pre className="tpl">
            {pro.template.split('\n').map((l, i) => (
              <div key={i}>{l ? highlight(l, 'python') : ' '}</div>
            ))}
          </pre>
        )}
      </div>

      <div className="pro-block">
        <h3>常見變形</h3>
        <dl className="variants">
          {pro.variants.map((v) => (
            <div key={v.name}>
              <dt>{v.name}</dt>
              <dd>{v.desc}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="notes">
        <section>
          <h3>和相近演算法比較</h3>
          <ul>
            {pro.compare.map((c) => (
              <li key={c.id}>
                <a href={`#/p/${c.id}`}>{nameOf(c.id)}</a>:{c.diff}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>面試時怎麼講</h3>
          <ul>{pro.interview.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      </div>
    </>
  )
}

function PatternPage({ id }: { id: string }) {
  const [lang, setLang] = useLang()
  const pattern = PATTERNS[id]
  const pro = PRO[id]
  const found = findStub(id)
  const problems = problemsOf(id)
  const idx = ORDER.findIndex((p) => p.id === id)
  const prev = ORDER[idx - 1]
  const next = ORDER[idx + 1]

  if (!found) return <div className="page">找不到這個演算法。</div>

  return (
    <div className="page">
      <div className="crumb">
        {found.cat.name} <LevelBadge id={id} />
      </div>
      <h1>{found.stub.name}</h1>
      {pro && pro.prereq.length > 0 && (
        <p className="prereq">
          先讀過會更好懂:
          {pro.prereq.map((p) => (
            <a key={p} href={`#/p/${p}`} className="chip">
              {nameOf(p)}
            </a>
          ))}
        </p>
      )}
      {!pattern ? (
        <p className="lead muted">這個演算法的動畫講義還在製作中,下面先列出相關題目。</p>
      ) : (
        <>
          <Toc />

          <section id="sec-plain" className="sec">
            <p className="lead">{pattern.summary}</p>
            <p className="analogy">
              <b>生活比喻</b>
              {pattern.analogy}
            </p>
          </section>

          <section id="sec-demo" className="sec">
            <div className="notes">
              <section>
                <h3>步驟</h3>
                <ol>{pattern.steps.map((t) => <li key={t}>{t}</li>)}</ol>
              </section>
              <section>
                <h3>看動畫時注意</h3>
                <ul>{pattern.watch.map((t) => <li key={t}>{t}</li>)}</ul>
              </section>
            </div>
            <div className="demo-title">動畫:{pattern.demo.title}</div>
            <Player key={id} demo={pattern.demo} lang={lang} onLang={setLang} />
          </section>

          <section id="sec-judge" className="sec">
            <h2>什麼時候用、哪裡會錯</h2>
            <div className="notes">
              <section>
                <h3>什麼時候想到它</h3>
                <ul>{pattern.whenToUse.map((t) => <li key={t}>{t}</li>)}</ul>
              </section>
              <section>
                <h3>常見錯誤</h3>
                <ul>{pattern.pitfalls.map((t) => <li key={t}>{t}</li>)}</ul>
              </section>
              <section className="complexity">
                <h3>複雜度</h3>
                <p>
                  <b>時間</b>
                  {pattern.complexity.time}
                  <br />
                  <b>空間</b>
                  {pattern.complexity.space}
                </p>
                <p className="muted">{pattern.complexity.why}</p>
              </section>
            </div>
          </section>

          {pro && (
            <section id="sec-pro" className="sec">
              <h2>進階:為什麼對、怎麼變形</h2>
              <ProSection pro={pro} />
            </section>
          )}
        </>
      )}
      <section id="sec-problems" className="sec">
        <h2>用到這個演算法的題目</h2>
        {problems.length ? <ProblemList key={id} problems={problems} /> : <p className="muted">還沒收錄題目。</p>}
      </section>

      <nav className="pager">
        {prev ? (
          <a href={`#/p/${prev.id}`}>
            <span className="muted">← 上一章</span>
            {prev.name}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={`#/p/${next.id}`} className="next">
            <span className="muted">下一章 →</span>
            {next.name}
          </a>
        )}
      </nav>
    </div>
  )
}

export default function App() {
  const hash = useHash()
  const m = hash.match(/^\/p\/([\w-]+)/)
  const current = m ? m[1] : hash === '/problems' ? 'problems' : hash === '/review' ? 'review' : ''

  return (
    <div className="layout">
      <Sidebar current={current} />
      <main>
        {m ? (
          <PatternPage key={m[1]} id={m[1]} />
        ) : hash === '/review' ? (
          <Review />
        ) : hash === '/problems' ? (
          <div className="page">
            <h1>全部題目</h1>
            <ProblemList problems={PROBLEMS} showPatterns />
          </div>
        ) : (
          <Home />
        )}
      </main>
    </div>
  )
}
