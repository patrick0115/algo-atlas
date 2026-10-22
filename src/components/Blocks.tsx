import { Fragment, useState, type ReactNode } from 'react'
import { CONCEPTS } from '../concepts'
import type { Block, MemStep, Rich } from '../concepts/types'
import { findStub } from '../data/categories'
import { highlight } from '../engine/code'
import { useLang } from '../engine/progress'
import { LANGS, type Lang } from '../types'
import { BudgetWidget, GrowthWidget } from './widgets'

// 觀念章的內容區塊。文字欄位的行內標記見 concepts/types.ts 的 Rich。

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\[\[[cp]:[\w-]+\]\]|\[[^[\]]+\]\(#\/[^)]*\))/g

export function rich(text: Rich): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return <code key={i}>{part.slice(1, -1)}</code>
    if (part.startsWith('**') && part.endsWith('**')) return <b key={i}>{part.slice(2, -2)}</b>
    const m = part.match(/^\[\[([cp]):([\w-]+)\]\]$/)
    if (m) {
      const [, kind, id] = m
      const name = kind === 'c' ? CONCEPTS[id]?.name : findStub(id)?.stub.name
      return (
        <a key={i} href={`#/${kind}/${id}`}>
          {name ?? id}
        </a>
      )
    }
    const link = part.match(/^\[([^[\]]+)\]\((#\/[^)]*)\)$/)
    if (link) {
      return (
        <a key={i} href={link[2]}>
          {link[1]}
        </a>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </>
  )
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case 'p':
      return <p className="c-p">{rich(b.text)}</p>
    case 'list': {
      const items = b.items.map((t, i) => <li key={i}>{rich(t)}</li>)
      return b.ordered ? <ol className="c-list">{items}</ol> : <ul className="c-list">{items}</ul>
    }
    case 'table':
      return (
        <div className="c-table">
          <div className="table-scroll">
            <table className="sum-table">
              <thead>
                <tr>
                  {b.cols.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{rich(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.note && <p className="muted small-note">{rich(b.note)}</p>}
        </div>
      )
    case 'code':
      return <MultiCode title={b.title} code={b.code} />
    case 'note':
      return (
        <div className={`c-note c-note-${b.kind}`}>
          <b>
            {{ tip: '小技巧', warn: '注意', key: '重點' }[b.kind]} · {b.title}
          </b>
          <p>{rich(b.text)}</p>
        </div>
      )
    case 'memory':
      return <MemoryStepper title={b.title} lang={b.lang} code={b.code} steps={b.steps} />
    case 'pre':
      return (
        <figure className="c-fig">
          <pre>{b.text}</pre>
          {b.caption && <figcaption className="muted">{rich(b.caption)}</figcaption>}
        </figure>
      )
    case 'widget':
      return b.id === 'growth' ? <GrowthWidget /> : <BudgetWidget />
  }
}

export function CodeLines({ code, lang, active }: { code: string; lang: Lang; active?: number }) {
  return (
    <pre className="c-code">
      {code.split('\n').map((l, i) => (
        <div key={i} className={`code-line${active === i + 1 ? ' active' : ''}`}>
          <span className="ln">{i + 1}</span>
          <code>{l ? highlight(l, lang) : ' '}</code>
        </div>
      ))}
    </pre>
  )
}

export function MultiCode({ title, code }: { title?: string; code: Partial<Record<Lang, string>> }) {
  const [pref, setLang] = useLang()
  const langs = LANGS.filter((l) => code[l.id] !== undefined)
  const lang = code[pref] !== undefined ? pref : langs[0].id
  return (
    <div className="c-codebox">
      <div className="tabs">
        {langs.length > 1 ? (
          langs.map((l) => (
            <button key={l.id} className={l.id === lang ? 'active' : ''} onClick={() => setLang(l.id)}>
              {l.label}
            </button>
          ))
        ) : (
          <button className="active">{langs[0].label}</button>
        )}
        {title && <span className="tabs-spacer c-code-title">{title}</span>}
      </div>
      <CodeLines code={code[lang]!} lang={lang} />
    </div>
  )
}

function MemoryStepper({ title, lang, code, steps }: { title: string; lang: Lang; code: string; steps: MemStep[] }) {
  const [i, setI] = useState(0)
  const s = steps[i]
  const regions = [...new Set(s.cells.map((c) => c.region))]
  const pointed = new Set(s.cells.flatMap((c) => (c.ref ? [c.ref] : [])))
  return (
    <div className="mem">
      <div className="mem-title">{title}</div>
      <div className="mem-body">
        <CodeLines code={code} lang={lang} active={s.line} />
        <div className="mem-side">
          <div className="mem-regions">
            {regions.length === 0 && <span className="muted">(記憶體裡還沒有東西)</span>}
            {regions.map((r) => (
              <div key={r} className="mem-region">
                <div className="mem-region-name">{r}</div>
                {s.cells
                  .filter((c) => c.region === r)
                  .map((c) => (
                    <div key={c.name} className={`mem-cell${c.hl ? ' hl' : ''}${pointed.has(c.name) ? ' pointed' : ''}`}>
                      <span className="mem-name">{c.name}</span>
                      {c.addr && <span className="mem-addr">{c.addr}</span>}
                      <span className="mem-val">
                        {c.value}
                        {c.ref && <span className="mem-ref"> → {c.ref}</span>}
                      </span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
          <div className="stage-note">
            <span className="note-step">
              {i + 1}/{steps.length}
            </span>
            {rich(s.note)}
          </div>
          <div className="controls">
            <button onClick={() => setI(0)} disabled={i === 0}>
              ⏮
            </button>
            <button onClick={() => setI(i - 1)} disabled={i === 0}>
              ◀ 上一步
            </button>
            <button className="primary" onClick={() => setI(i + 1)} disabled={i === steps.length - 1}>
              下一步 ▶
            </button>
            <input type="range" min={0} max={steps.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))} aria-label="步驟" />
          </div>
        </div>
      </div>
      <p className="muted small-note">粗框 = 這一步剛改過;虛線框 = 正被某個指標 / 參考指著。</p>
    </div>
  )
}
