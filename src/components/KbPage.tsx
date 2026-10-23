import { useEffect, useRef } from 'react'
import type { Book, Entry, KbBlock, KbSection } from '../kb/types'
import { BOOKS, ENTRIES, OVERVIEW, routeOfOld } from '../kb'
import { BOOK_META, VOLUMES } from '../kb/volumes'
import { MOUNTS } from '../kb/widgets'
import { attachedTo, hostOf } from '../kb/merge'
import '../kb/kb.css'

// 百科的書頁(#/k/L)、詞條頁(#/k/L01)、卷頁(#/v/sys)、附錄(#/k/appendix/confuse)。

/** 原講義裡的連結(L-bus.html#l01、#a05-l2)換成站內網址 */
function fixLinks(html: string, book: Book): string {
  return html.replace(/(<a\b[^>]*?\shref=")([^"]*)"/g, (_, pre: string, href: string) => {
    let to = href
    const m = href.match(/^([A-Q]-[\w-]+\.html)?(?:#(.*))?$/)
    if (href.startsWith('../index.html#')) to = href.slice('../index.html'.length)
    else if (m && (m[1] || m[2])) to = routeOfOld(m[1] ?? book.file, m[2])
    return `${pre}${to}"`
  })
}

function Html({ html, book }: { html: string; book: Book }) {
  return <div dangerouslySetInnerHTML={{ __html: fixLinks(html, book) }} />
}

function Widget({ id, html, book }: { id: string; html: string; book: Book }) {
  return <div className="kb-widget" data-widget={id} dangerouslySetInnerHTML={{ __html: fixLinks(html, book) }} />
}

const hasWidget = (blocks: KbBlock[]) => blocks.some((b) => b.t === 'widget')

/** 頁面上有互動圖,就在畫好之後掛上這本書的互動程式;離開頁面時清掉 */
function useMount(book: Book, active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mount = MOUNTS[book.id]
    if (!active || !mount || !ref.current) return
    let cleanup: void | (() => void)
    try {
      cleanup = mount(ref.current)
    } catch (e) {
      console.error(`互動圖 ${book.id} 掛載失敗`, e)
    }
    return () => cleanup?.()
  }, [book.id, active])
  // 互動程式動態產生的連結(例:href="#a03")沒經過 fixLinks,點下去時再換成站內網址
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const on = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a')
      const href = a?.getAttribute('href') ?? ''
      if (!a || href.startsWith('#/') || !/^([A-Q]-[\w-]+\.html)?#?[\w-]*$/.test(href) || href === '') return
      const m = href.match(/^([A-Q]-[\w-]+\.html)?(?:#(.*))?$/)!
      e.preventDefault()
      window.location.hash = routeOfOld(m[1] ?? book.file, m[2]).slice(1)
    }
    el.addEventListener('click', on)
    return () => el.removeEventListener('click', on)
  }, [book.file])
  return ref
}

const LV_CLASS = ['', 'lv', 'lv l2', 'lv l3']

function Blocks({ blocks, book }: { blocks: KbBlock[]; book: Book }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.t === 'html' ? (
          <Html key={i} html={b.html} book={book} />
        ) : b.t === 'widget' ? (
          <Widget key={i} id={b.id} html={b.html} book={book} />
        ) : b.t === 'sub' ? (
          <h2 key={i} id={b.anchor} className="kb-sub">
            {b.title}
          </h2>
        ) : (
          <div key={i} id={b.anchor} className="block kb-lv">
            <h3>
              <span className={LV_CLASS[b.lv] ?? 'lv'}>L{b.lv}</span>
              {b.title}
            </h3>
            <Html html={b.html} book={book} />
          </div>
        ),
      )}
    </>
  )
}

function Section({ s, book }: { s: KbSection; book: Book }) {
  const host = hostOf(`${book.id}#${s.id}`)
  if (host)
    return (
      <section className="kb-sec" id={s.id || undefined}>
        <h2>{s.title}</h2>
        <p className="muted">
          這一段已併入 <a href={`#/${host}`}>{hostName(host)}</a>。
        </p>
      </section>
    )
  return (
    <section className="kb-sec" id={s.id || undefined}>
      <h2>{s.title}</h2>
      <Blocks blocks={s.blocks} book={book} />
    </section>
  )
}

function BookCss({ book }: { book: Book }) {
  return book.css ? <style>{book.css}</style> : null
}

/** 進到頁面或網址的錨點變了,就捲到那個元素 */
function useAnchor(anchor?: string) {
  useEffect(() => {
    if (!anchor) return
    const t = setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' }), 0)
    return () => clearTimeout(t)
  }, [anchor])
}

const volOf = (book: Book) => VOLUMES.find((v) => v.id === BOOK_META[book.id]?.vol)

/** 全部講義書照卷的順序排,給上一本 / 下一本用 */
const BOOK_ORDER = VOLUMES.flatMap((v) => v.books.map((b) => b.id)).filter((id) => BOOKS[id])

function Crumb({ book, entry }: { book: Book; entry?: Entry }) {
  const vol = volOf(book)
  return (
    <div className="crumb">
      {vol && <a href={`#/v/${vol.id}`}>{vol.name}</a>} ／ {entry ? <a href={`#/k/${book.id}`}>{book.id} {BOOK_META[book.id]?.name}</a> : `${book.id} ${BOOK_META[book.id]?.name}`}
      {entry && ` ／ ${entry.tag}`}
    </div>
  )
}

export function BookPage({ book, anchor }: { book: Book; anchor?: string }) {
  useAnchor(anchor)
  const ref = useMount(book, [...book.front, ...book.back].some((s) => hasWidget(s.blocks)))
  const i = BOOK_ORDER.indexOf(book.id)
  const prev = BOOKS[BOOK_ORDER[i - 1]]
  const next = BOOKS[BOOK_ORDER[i + 1]]
  return (
    <div className={`page kb kb-${book.id}`} ref={ref}>
      <BookCss book={book} />
      <div className="kb-head">
        <Crumb book={book} />
        <h1>{book.title}</h1>
        <p className="lead" dangerouslySetInnerHTML={{ __html: fixLinks(book.lead, book) }} />
        <div className="note" dangerouslySetInnerHTML={{ __html: fixLinks(book.note, book) }} />
      </div>
      {book.front.map((s) => (
        <Section key={s.id || s.title} s={s} book={book} />
      ))}
      <section className="kb-sec" id="entries">
        <h2>詞條</h2>
        <ul className="kb-entries">
          {book.entries.map((e) => (
            <li key={e.id}>
              <a href={entryHref(e.id)}>
                <span className="tag">{e.tag}</span>
                <b>{e.name}</b>
                <span className="small">{hostOf(e.id) ? `已併入:${hostName(hostOf(e.id)!)}` : e.sub}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      {book.back.map((s) => (
        <Section key={s.id || s.title} s={s} book={book} />
      ))}
      <nav className="pager">
        {prev ? (
          <a href={`#/k/${prev.id}`}>
            <span className="muted">← 上一本</span>
            {prev.id} {BOOK_META[prev.id]?.name}
          </a>
        ) : (
          <span />
        )}
        {next && (
          <a href={`#/k/${next.id}`} className="next">
            <span className="muted">下一本 →</span>
            {next.id} {BOOK_META[next.id]?.name}
          </a>
        )}
      </nav>
    </div>
  )
}

export function EntryPage({ entry, book, anchor }: { entry: Entry; book: Book; anchor?: string }) {
  useAnchor(anchor)
  const ref = useMount(book, hasWidget(entry.blocks))
  const i = book.entries.indexOf(entry)
  const prev = book.entries[i - 1]
  const next = book.entries[i + 1]
  return (
    <div className={`page kb kb-${book.id}`} ref={ref}>
      <BookCss book={book} />
      <div className="kb-head">
        <Crumb book={book} entry={entry} />
        <h1>
          <span className="tag">{entry.tag}</span>
          {entry.name}
        </h1>
        {entry.sub && <p className="lead muted">{entry.sub}</p>}
      </div>
      <section className="kb-sec">
        <Blocks blocks={entry.blocks} book={book} />
      </section>
      <nav className="pager">
        {prev ? (
          <a href={`#/k/${prev.id}`}>
            <span className="muted">← 上一條</span>
            {prev.tag} {prev.name}
          </a>
        ) : (
          <a href={`#/k/${book.id}`}>
            <span className="muted">← 回到</span>
            {book.id} {BOOK_META[book.id]?.name}
          </a>
        )}
        {next ? (
          <a href={`#/k/${next.id}`} className="next">
            <span className="muted">下一條 →</span>
            {next.tag} {next.name}
          </a>
        ) : (
          <a href={`#/k/${book.id}`} className="next">
            <span className="muted">回到 →</span>
            {book.id} {BOOK_META[book.id]?.name}
          </a>
        )}
      </nav>
    </div>
  )
}

export function BookList({ vol }: { vol: string }) {
  const v = VOLUMES.find((x) => x.id === vol)
  if (!v) return null
  return (
    <ul className="kb-books">
      {v.books
        .filter((b) => BOOKS[b.id])
        .map((b) => (
          <li key={b.id}>
            <span className="tag">{b.range}</span>
            <a href={`#/k/${b.id}`}>
              {b.id} {b.name}
            </a>
            <span className="desc">{b.desc}</span>
          </li>
        ))}
    </ul>
  )
}

/** 詞條的網址:被併進圖鑑的,直接連到新家 */
export function entryHref(id: string): string {
  const host = hostOf(id)
  return host ? `#/${host}` : `#/k/${id}`
}

/** 圖鑑頁面的名稱(給「已併入 → 某頁」用);由 App 注入,避免這裡反向依賴圖鑑資料 */
let hostName: (route: string) => string = (r) => r
export function setHostName(f: (route: string) => string) {
  hostName = f
}

/** 圖鑑頁面(演算法、基礎觀念)底下,收進來的講義段落 */
export function KbAttached({ at }: { at: string }) {
  const list = attachedTo(at)
  if (!list.length) return null
  return (
    <>
      {list.map((a) => (
        <AttachedOne key={a.title} a={a} />
      ))}
    </>
  )
}

function AttachedOne({ a }: { a: ReturnType<typeof attachedTo>[number] }) {
  const ref = useMount(a.book, hasWidget(a.blocks))
  return (
    <section className={`sec kb kb-${a.book.id} kb-attached`}>
      <div ref={ref}>
      <BookCss book={a.book} />
      <h2>
        觀念整理 <span className="muted">· {a.title}</span>
      </h2>
      <p className="muted small">
        由 <a href={`#/k/${a.book.id}`}>{a.book.id} {BOOK_META[a.book.id]?.name}</a> 講義併入,分成 L1 是什麼、L2 為什麼、L3 出問題怎麼辦。
      </p>
      <Blocks blocks={a.blocks} book={a.book} />
      </div>
    </section>
  )
}

/** 卷四的開場:一顆晶片的一生(原 overview.html) */
export function SemiOverview() {
  const ov = OVERVIEW
  if (!ov) return null
  return (
    <div className="kb">
      <h2>{ov.title}</h2>
      <p className="lead" dangerouslySetInnerHTML={{ __html: fixLinks(ov.lead, ov) }} />
      <div className="note" dangerouslySetInnerHTML={{ __html: fixLinks(ov.note, ov) }} />
      {ov.front.map((s) => (
        <Section key={s.title} s={s} book={ov} />
      ))}
    </div>
  )
}

const APPENDIX: Record<string, string> = { confuse: '容易混淆', terms: '英文術語' }

/** 附錄:把每本書的「容易混淆」或「英文術語」集中在一頁 */
export function AppendixPage({ kind }: { kind: string }) {
  const books = BOOK_ORDER.map((id) => BOOKS[id])
  return (
    <div className="page kb">
      <div className="crumb">附錄</div>
      <h1>{APPENDIX[kind]}</h1>
      <p className="lead">每本講義書末的「{APPENDIX[kind]}」集中在這一頁,依卷的順序排。</p>
      {books.map((b) => {
        const s = b.back.find((x) => x.id === kind)
        if (!s) return null
        return (
          <section key={b.id} className={`kb-sec kb-${b.id}`}>
            <BookCss book={b} />
            <h2>
              <a href={`#/k/${b.id}`}>
                {b.id} {BOOK_META[b.id]?.name}
              </a>
            </h2>
            <Blocks blocks={s.blocks} book={b} />
          </section>
        )
      })}
    </div>
  )
}

export const APPENDIX_KINDS = Object.entries(APPENDIX).map(([id, name]) => ({ id, name }))

/** 詞條搜尋:比對編號、名稱、一句話說明 */
export function searchEntries(kw: string) {
  if (!kw) return []
  return Object.values(ENTRIES).filter(({ entry: e }) => `${e.tag} ${e.name} ${e.sub}`.toLowerCase().includes(kw))
}
