import { useEffect, useState } from 'react'
import { CATEGORIES, findStub } from './data/categories'
import { PROBLEMS, problemsOf } from './data/problems'
import { PATTERNS } from './patterns'
import { Player } from './engine/Player'
import { ProblemList } from './components/ProblemList'
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

function Sidebar({ current }: { current: string }) {
  return (
    <nav className="sidebar">
      <a href="#/" className="brand">
        LeetCode 演算法圖鑑
      </a>
      <a href="#/problems" className={`side-link${current === 'problems' ? ' active' : ''}`}>
        全部題目
      </a>
      {CATEGORIES.map((c) => (
        <div key={c.id} className="side-group">
          <div className="side-cat">{c.name}</div>
          {c.patterns.map((p) => (
            <a
              key={p.id}
              href={`#/p/${p.id}`}
              className={`side-link${current === p.id ? ' active' : ''}${PATTERNS[p.id] ? '' : ' todo'}`}
            >
              {p.name}
            </a>
          ))}
        </div>
      ))}
    </nav>
  )
}

function Home() {
  const { store } = useProgress()
  const ready = Object.keys(PATTERNS).length
  const total = CATEGORIES.reduce((n, c) => n + c.patterns.length, 0)
  const done = PROBLEMS.filter((p) => store[p.id]?.status === 'ok').length
  return (
    <div className="page">
      <h1>演算法總覽</h1>
      <p className="lead">
        LeetCode 有幾千題,但用到的演算法只有這幾十種。每一頁先用白話和比喻講懂一個演算法,
        再用動畫一步一步跑給你看,最後列出所有用到它的題目,讓你邊刷邊複習。
      </p>
      <p className="legend">
        已完成 {ready} / {total} 個演算法動畫(黑字可點,灰字製作中)· 收錄 {PROBLEMS.length} 題 · 你標記「會」的有 {done} 題 ·
        新手建議由左上往右下的順序讀
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
                    <span className="muted">{n > 0 ? `${n} 題` : ''}</span>
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

function PatternPage({ id }: { id: string }) {
  const [lang, setLang] = useLang()
  const pattern = PATTERNS[id]
  const found = findStub(id)
  const problems = problemsOf(id)

  if (!found) return <div className="page">找不到這個演算法。</div>

  return (
    <div className="page">
      <div className="crumb">{found.cat.name}</div>
      <h1>{found.stub.name}</h1>
      {!pattern ? (
        <p className="lead muted">這個演算法的動畫講義還在製作中,下面先列出相關題目。</p>
      ) : (
        <>
          <p className="lead">{pattern.summary}</p>
          <p className="analogy">
            <b>生活比喻</b>
            {pattern.analogy}
          </p>

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
                <b>時間</b>{pattern.complexity.time}
                <br />
                <b>空間</b>{pattern.complexity.space}
              </p>
              <p className="muted">{pattern.complexity.why}</p>
            </section>
          </div>
        </>
      )}
      <h2>用到這個演算法的題目</h2>
      {problems.length ? <ProblemList key={id} problems={problems} /> : <p className="muted">還沒收錄題目。</p>}
    </div>
  )
}

export default function App() {
  const hash = useHash()
  const m = hash.match(/^\/p\/([\w-]+)/)
  const current = m ? m[1] : hash === '/problems' ? 'problems' : ''

  return (
    <div className="layout">
      <Sidebar current={current} />
      <main>
        {m ? (
          <PatternPage id={m[1]} />
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
