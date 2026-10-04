import type { ReactNode } from 'react'
import type { Lang } from '../types'

// 程式碼字串的解析(@tag)與極簡語法著色,播放器、模板區塊、猜題選項共用。

const TAG = /\s*(?:#|\/\/)@([\w-]+)\s*$/

export function parseCode(src: string) {
  return src.split('\n').map((raw) => {
    const m = raw.match(TAG)
    return { text: m ? raw.slice(0, m.index) : raw, tag: m?.[1] }
  })
}

// ---- 極簡語法著色:只分關鍵字 / 字串 / 註解 / 數字,配合黑白主題用粗細與灰階區分 ----

const KEYWORDS = new Set(
  (
    'def return if elif else for while in not and or is None True False class import from as with lambda yield pass break continue global nonlocal try except finally raise del ' +
    'int long char bool void double float auto const static struct new delete public private protected final boolean null nullptr this let var function of typeof instanceof switch case default do sizeof unsigned template typename vector string'
  ).split(' '),
)

// Python 的註解是 #(// 是整數除法);其他語言是 //(# 是前置處理器)
const TOKEN_PY = /(#.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g
const TOKEN_C = /(\/\/.*$|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g

export function highlight(text: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(lang === 'python' ? TOKEN_PY : TOKEN_C)) {
    const tok = m[0]
    const i = m.index ?? 0
    const isComment = tok.startsWith('#') || tok.startsWith('//')
    let cls = ''
    if (isComment) cls = 'tk-c'
    else if (/^["'`]/.test(tok)) cls = 'tk-s'
    else if (/^\d/.test(tok)) cls = 'tk-n'
    else if (KEYWORDS.has(tok)) cls = 'tk-k'
    if (!cls) continue
    if (i > last) out.push(text.slice(last, i))
    out.push(
      <span key={i} className={cls}>
        {tok}
      </span>,
    )
    last = i + tok.length
    if (isComment) break
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
