import { useEffect, useState, type ReactNode } from 'react'
import { CATEGORIES, findStub } from './data/categories'
import { PROBLEMS, problemsOf } from './data/problems'
import { LEVEL_NAME, PRO, type ProNote } from './data/pro'
import { PATTERNS } from './patterns'
import { Player } from './engine/Player'
import { Plan } from './components/Plan'
import { ProblemList } from './components/ProblemList'
import { Review } from './components/Review'
import { Rhythm, RhythmCard } from './components/Rhythm'
import { APPENDIX_KINDS, AppendixPage, BookList, BookPage, EntryPage, KbAttached, SemiOverview, entryHref, setHostName } from './components/KbPage'
import { hostOf } from './kb/merge'
import { BOOKS, ENTRIES } from './kb'
import { BOOK_META, VOLUMES } from './kb/volumes'
import { SummaryPage } from './components/SummaryPage'
import { Toc } from './components/Toc'
import { SUMMARIES } from './data/summaries'
import { ConceptPage } from './components/ConceptPage'
import { SolutionIndex, SolutionPage } from './components/SolutionPage'
import { SOLUTIONS } from './solutions'
import { CONCEPTS, CONCEPT_ORDER, UNITS, conceptsFor } from './concepts'
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
/** 上一章 / 下一章的順序:先走完基礎篇,再進每個分類的演算法;有總結章的話排在該分類最後 */
const CHAPTERS = [
  ...CONCEPT_ORDER.map((c) => ({ key: `c/${c.id}`, href: `#/c/${c.id}`, name: c.name })),
  ...CATEGORIES.flatMap((c) => [
    ...c.patterns.map((p) => ({ key: p.id, href: `#/p/${p.id}`, name: p.name })),
    ...(SUMMARIES[c.id] ? [{ key: `s/${c.id}`, href: `#/s/${c.id}`, name: `${c.name}總結` }] : []),
  ]),
]

function Pager({ at }: { at: string }) {
  const idx = CHAPTERS.findIndex((c) => c.key === at)
  const prev = CHAPTERS[idx - 1]
  const next = CHAPTERS[idx + 1]
  return (
    <nav className="pager">
      {prev ? (
        <a href={prev.href}>
          <span className="muted">← 上一章</span>
          {prev.name}
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a href={next.href} className="next">
          <span className="muted">下一章 →</span>
          {next.name}
        </a>
      )}
    </nav>
  )
}
const nameOf = (id: string) => findStub(id)?.stub.name ?? id
setHostName((r) => (r.startsWith('p/') ? nameOf(r.slice(2)) : r.startsWith('c/') ? (CONCEPTS[r.slice(2)]?.name ?? r) : r))

/** 被併進圖鑑的講義詞條:舊網址直接換到新家 */
function Redirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}

function LevelBadge({ id }: { id: string }) {
  const lv = PRO[id]?.level
  if (!lv) return null
  return <span className={`lv lv-${lv}`} title={`難度:${LEVEL_NAME[lv]}`}>{LEVEL_NAME[lv]}</span>
}

/** 這個頁面屬於哪一卷:決定側欄預設展開哪一卷 */
function volOfCurrent(current: string): string {
  if (current.startsWith('c/')) return 'base'
  if (current.startsWith('k/')) {
    const id = current.slice(2)
    const book = BOOKS[id] ?? ENTRIES[id]?.book
    if (book) return BOOK_META[book.id]?.vol ?? ''
    return id.startsWith('appendix') ? 'appendix' : ''
  }
  if (current.startsWith('v/')) return current.slice(2)
  if (current === 'q' || current === 'problems') return 'sol'
  if (current.startsWith('s/') || ORDER.some((p) => p.id === current)) return 'algo'
  return ''
}

function Sidebar({ current }: { current: string }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const kw = q.trim().toLowerCase()
  const match = (p: { id: string; name: string }) => !kw || p.name.toLowerCase().includes(kw) || p.id.includes(kw)
  const vol = volOfCurrent(current)
  const link = (key: string, href: string, label: ReactNode, extra = '') => (
    <a key={key} href={href} className={`side-link${current === key ? ' active' : ''}${extra}`}>
      {label}
    </a>
  )

  /** 一本講義書:書名一行;正在看這本(或搜尋中)才展開詞條 */
  const bookGroup = (id: string) => {
    const b = BOOKS[id]
    if (!b) return null
    const meta = BOOK_META[id]
    const here = current === `k/${id}` || ENTRIES[current.slice(2)]?.book.id === id
    const es = b.entries.filter((e) => !kw || `${e.tag} ${e.name} ${e.sub}`.toLowerCase().includes(kw))
    if (kw && !es.length && !match({ id: id.toLowerCase(), name: meta.name })) return null
    return (
      <div key={id} className="side-group">
        {link(`k/${id}`, `#/k/${id}`, `${id} ${meta.name}`, ' side-book')}
        {(here || kw) && es.map((e) => link(`k/${e.id}`, entryHref(e.id), `${e.tag} ${e.name}`, ' side-entry'))}
      </div>
    )
  }

  const volume = (id: string, body: ReactNode) => {
    const v = VOLUMES.find((x) => x.id === id)!
    return (
      <details key={id} className="side-vol" open={!!kw || vol === id}>
        <summary>
          <a href={`#/v/${id}`} className={current === `v/${id}` ? 'active' : ''}>
            {v.name}
          </a>
        </summary>
        {body}
      </details>
    )
  }

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
        <input className="side-search" type="search" placeholder="搜尋演算法、詞條…" value={q} onChange={(e) => setQ(e.target.value)} />
        {link('rhythm', '#/rhythm', '刷題節奏')}
        {link('plan', '#/plan', '刷題藍圖')}
        {link('review', '#/review', '複習')}

        {volume(
          'base',
          <>
            {UNITS.map((u) => {
              const cs = u.concepts.filter(match)
              if (!cs.length) return null
              return (
                <div key={u.id} className="side-group">
                  <div className="side-cat">{u.name}</div>
                  {cs.map((c) =>
                    link(
                      `c/${c.id}`,
                      `#/c/${c.id}`,
                      <>
                        {c.name}
                        <i className={`dot lv-dot-${c.level}`} />
                      </>,
                    ),
                  )}
                </div>
              )
            })}
            {VOLUMES.find((v) => v.id === 'base')!.books.map((b) => bookGroup(b.id))}
          </>,
        )}

        {volume(
          'algo',
          <>
            {CATEGORIES.map((c) => {
              const ps = c.patterns.filter(match)
              if (!ps.length) return null
              return (
                <div key={c.id} className="side-group">
                  <div className="side-cat">{c.name}</div>
                  {ps.map((p) =>
                    link(
                      p.id,
                      `#/p/${p.id}`,
                      <>
                        {p.name}
                        <i className={`dot lv-dot-${PRO[p.id]?.level ?? 0}`} />
                      </>,
                      PATTERNS[p.id] ? '' : ' todo',
                    ),
                  )}
                  {SUMMARIES[c.id] && !kw && link(`s/${c.id}`, `#/s/${c.id}`, `${c.name}總結`, ' side-sum')}
                </div>
              )
            })}
            {VOLUMES.find((v) => v.id === 'algo')!.books.map((b) => bookGroup(b.id))}
          </>,
        )}

        {volume(
          'sol',
          <>
            {link('q', '#/q', '題解目錄')}
            {link('problems', '#/problems', '全部題目')}
          </>,
        )}

        {['semi', 'sys', 'swe'].map((id) => volume(id, VOLUMES.find((v) => v.id === id)!.books.map((b) => bookGroup(b.id))))}

        <details className="side-vol" open={!!kw || vol === 'appendix'}>
          <summary>附錄</summary>
          {APPENDIX_KINDS.map((a) => link(`k/appendix/${a.id}`, `#/k/appendix/${a.id}`, a.name))}
        </details>
      </div>
    </nav>
  )
}

/** 卷頁:這一卷有哪些單元、分類、講義書 */
function VolumePage({ id }: { id: string }) {
  const v = VOLUMES.find((x) => x.id === id)!
  return (
    <div className="page kb">
      <div className="crumb">百科目錄</div>
      <h1>{v.name}</h1>
      <p className="lead">{v.desc}</p>
      {id === 'base' && (
        <ol className="unit-list">
          {UNITS.map((u) => (
            <li key={u.id}>
              <div className="unit-head">
                <b>{u.name}</b>
                <span className="muted">{u.desc}</span>
              </div>
              <div className="unit-chips">
                {u.concepts.map((c) => (
                  <a key={c.id} href={`#/c/${c.id}`} className="chip">
                    {c.name}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
      {id === 'algo' && <AlgoGrid />}
      {id === 'sol' && (
        <ul className="kb-books">
          <li>
            <a href="#/q">題解目錄</a>
            <span className="desc">已寫好題解的 {Object.keys(SOLUTIONS).length} 題,依題號排列。</span>
          </li>
          <li>
            <a href="#/problems">全部題目</a>
            <span className="desc">收錄的 {PROBLEMS.length} 題,可依演算法、難度、清單篩選。</span>
          </li>
        </ul>
      )}
      {id === 'semi' && <SemiOverview />}
      {v.books.length > 0 && (
        <>
          <h2>講義</h2>
          <BookList vol={id} />
        </>
      )}
    </div>
  )
}

function VolumeGrid() {
  return (
    <div className="vol-grid">
      {VOLUMES.map((v) => (
        <a key={v.id} href={`#/v/${v.id}`}>
          <b>{v.name}</b>
          <span>{v.desc}</span>
        </a>
      ))}
    </div>
  )
}

function AlgoGrid() {
  return (
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
            {SUMMARIES[c.id] && (
              <li className="cat-sum">
                <a href={`#/s/${c.id}`}>{c.name}總結</a>
                <span className="muted">比較 · 怎麼選 · 測驗</span>
              </li>
            )}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Home() {
  const { store } = useProgress()
  const done = PROBLEMS.filter((p) => store[p.id]?.status === 'ok').length
  return (
    <div className="page">
      <RhythmCard />
      <h1>百科目錄</h1>
      <VolumeGrid />
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
        {CONCEPT_ORDER.length} 章基礎觀念 · {ORDER.length} 個演算法 · 收錄 {PROBLEMS.length} 題 · 你標記「會」的有 {done} 題 · 難度標記:
        <span className="lv lv-1">入門</span> <span className="lv lv-2">中階</span> <span className="lv lv-3">進階</span>
        · 新手建議先讀完所有「入門」,再依分類往下
      </p>
      <section className="base-path">
        <h2>
          基礎篇 <span className="muted">第一次刷題從這裡讀起;已經熟的單元可以跳過</span>
        </h2>
        <ol className="unit-list">
          {UNITS.map((u) => (
            <li key={u.id}>
              <div className="unit-head">
                <b>{u.name}</b>
                <span className="muted">{u.desc}</span>
              </div>
              <div className="unit-chips">
                {u.concepts.map((c) => (
                  <a key={c.id} href={`#/c/${c.id}`} className="chip">
                    {c.name}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="home-plan">
        <a href="#/plan">刷題藍圖 →</a> <span className="muted">NeetCode 150 排成每週進度,每天挑題、寫完標記</span>
      </p>
      <AlgoGrid />
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
  const basics = conceptsFor(id)

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
      {basics.length > 0 && (
        <p className="prereq">
          需要的基礎觀念:
          {basics.map((c) => (
            <a key={c.id} href={`#/c/${c.id}`} className="chip chip-base">
              {c.name}
            </a>
          ))}
        </p>
      )}
      {!pattern ? (
        <p className="lead muted">這個演算法的動畫講義還在製作中,下面先列出相關題目。</p>
      ) : (
        <>
          <Toc sections={SECTIONS} />

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
      <KbAttached at={`p/${id}`} />
      <section id="sec-problems" className="sec">
        <h2>用到這個演算法的題目</h2>
        {problems.length ? <ProblemList key={id} problems={problems} /> : <p className="muted">還沒收錄題目。</p>}
      </section>

      <Pager at={id} />
    </div>
  )
}

export default function App() {
  const hash = useHash()
  const m = hash.match(/^\/p\/([\w-]+)/)
  const sm = hash.match(/^\/s\/([\w-]+)/)
  const cm = hash.match(/^\/c\/([\w-]+)/)
  const qm = hash.match(/^\/q\/(\d+)/)
  const sol = qm ? SOLUTIONS[Number(qm[1])] : undefined
  const concept = cm ? CONCEPTS[cm[1]] : undefined
  const sumCat = sm && SUMMARIES[sm[1]] ? CATEGORIES.find((c) => c.id === sm[1]) : undefined
  const km = hash.match(/^\/k\/([\w-]+)(?:\/([\w-]+))?/)
  const vm = hash.match(/^\/v\/([\w-]+)/)
  const kbBook = km ? BOOKS[km[1]] : undefined
  const kbEntry = km ? ENTRIES[km[1]] : undefined
  const appendix = km && km[1] === 'appendix' ? km[2] : undefined
  const current = km ? `k/${km[1]}${appendix ? `/${appendix}` : ''}` : vm ? `v/${vm[1]}` : m ? m[1] : qm || hash === '/q' ? 'q' : cm ? `c/${cm[1]}` : sm ? `s/${sm[1]}` : hash === '/problems' ? 'problems' : hash === '/review' ? 'review' : hash === '/plan' ? 'plan' : hash === '/rhythm' ? 'rhythm' : ''

  return (
    <div className="layout">
      <Sidebar current={current} />
      <main>
        {km && hostOf(km[1]) ? (
          <Redirect to={`#/${hostOf(km[1])}`} />
        ) : kbBook ? (
          <BookPage key={kbBook.id} book={kbBook} anchor={km![2]} />
        ) : kbEntry ? (
          <EntryPage key={kbEntry.entry.id} entry={kbEntry.entry} book={kbEntry.book} anchor={km![2]} />
        ) : appendix ? (
          <AppendixPage key={appendix} kind={appendix} />
        ) : vm && VOLUMES.some((v) => v.id === vm[1]) ? (
          <VolumePage key={vm[1]} id={vm[1]} />
        ) : m ? (
          <PatternPage key={m[1]} id={m[1]} />
        ) : concept ? (
          <ConceptPage
            key={concept.id}
            c={concept}
            pager={
              <>
                <KbAttached at={`c/${concept.id}`} />
                <Pager at={`c/${concept.id}`} />
              </>
            }
          />
        ) : sumCat ? (
          <SummaryPage key={sumCat.id} cat={sumCat} sum={SUMMARIES[sumCat.id]} pager={<Pager at={`s/${sumCat.id}`} />} />
        ) : sol ? (
          <SolutionPage key={sol.id} sol={sol} />
        ) : hash === '/q' || qm ? (
          <SolutionIndex />
        ) : hash === '/plan' ? (
          <Plan />
        ) : hash === '/rhythm' ? (
          <Rhythm />
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
