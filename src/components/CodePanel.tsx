import { useMemo } from 'react'
import { LANGS, type Lang } from '../types'

const TAG = /\s*(?:#|\/\/)@([\w-]+)\s*$/

function parse(src: string) {
  return src.split('\n').map((raw) => {
    const m = raw.match(TAG)
    return { text: m ? raw.slice(0, m.index) : raw, tag: m?.[1] }
  })
}

export function CodePanel({
  code,
  lang,
  onLang,
  activeTag,
}: {
  code: Record<Lang, string>
  lang: Lang
  onLang: (l: Lang) => void
  activeTag?: string
}) {
  const lines = useMemo(() => parse(code[lang]), [code, lang])

  return (
    <div className="code-panel">
      <div className="tabs">
        {LANGS.map((l) => (
          <button key={l.id} className={l.id === lang ? 'active' : ''} onClick={() => onLang(l.id)}>
            {l.label}
          </button>
        ))}
      </div>
      <pre>
        {lines.map((l, i) => (
          <div key={i} className={`code-line${l.tag && l.tag === activeTag ? ' active' : ''}`}>
            <span className="ln">{i + 1}</span>
            <code>{l.text || ' '}</code>
          </div>
        ))}
      </pre>
    </div>
  )
}
