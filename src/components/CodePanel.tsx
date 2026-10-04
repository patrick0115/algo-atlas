import { useEffect, useMemo, useRef, useState } from 'react'
import { LANGS, type Lang } from '../types'
import { highlight, parseCode } from '../engine/code'

export function CodePanel({
  code,
  lang,
  onLang,
  activeTag,
  title,
}: {
  code: Record<Lang, string>
  lang: Lang
  onLang: (l: Lang) => void
  activeTag?: string
  title?: string
}) {
  const lines = useMemo(() => parseCode(code[lang]), [code, lang])
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  // 執行行跑出可視範圍時,只捲動程式碼框本身(不要把整頁拉走)
  useEffect(() => {
    const pre = preRef.current
    const el = pre?.querySelector<HTMLElement>('.code-line.active')
    if (!pre || !el) return
    const top = el.offsetTop - pre.offsetTop
    if (top < pre.scrollTop || top + el.offsetHeight > pre.scrollTop + pre.clientHeight) {
      pre.scrollTop = top - pre.clientHeight / 3
    }
  }, [activeTag, lang])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lines.map((l) => l.text.replace(/\s+$/, '')).join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* 不支援剪貼簿就算了 */
    }
  }

  return (
    <div className="code-panel">
      <div className="tabs">
        {LANGS.map((l) => (
          <button key={l.id} className={l.id === lang ? 'active' : ''} onClick={() => onLang(l.id)}>
            {l.label}
          </button>
        ))}
        <span className="tabs-spacer">{title}</span>
        <button className="copy" onClick={copy} title="複製程式碼">
          {copied ? '已複製 ✓' : '複製'}
        </button>
      </div>
      <pre ref={preRef}>
        {lines.map((l, i) => (
          <div key={i} className={`code-line${l.tag && l.tag === activeTag ? ' active' : ''}`}>
            <span className="ln">{i + 1}</span>
            <code>{l.text ? highlight(l.text, lang) : ' '}</code>
          </div>
        ))}
      </pre>
    </div>
  )
}
