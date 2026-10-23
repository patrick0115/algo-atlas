import type { Book, Entry } from './types'
import { BOOK_META } from './volumes'

// 每本書一個資料檔(src/kb/books/<書>.ts),在這裡收齊並建立「詞條 id → 詞條」的索引。
const mods = import.meta.glob<{ book: Book }>('./books/*.ts', { eager: true })

export const BOOKS: Record<string, Book> = Object.fromEntries(
  Object.values(mods)
    .map((m) => m.book)
    .filter((b) => BOOK_META[b.id])
    .map((b) => [b.id, b]),
)

/** 卷四(半導體)的開場:原 overview.html */
export const OVERVIEW: Book | undefined = Object.values(mods).find((m) => m.book.id === 'overview')?.book

export const ENTRIES: Record<string, { entry: Entry; book: Book }> = Object.fromEntries(
  Object.values(BOOKS).flatMap((b) => b.entries.map((e) => [e.id, { entry: e, book: b }])),
)

/** 舊網址(semi/L-bus.html#l01-l1)→ 新網址(#/k/L01/l01-l1) */
export function routeOfOld(file: string, anchor = ''): string {
  const b = Object.values(BOOKS).find((x) => x.file === file)
  if (!b) return '#/'
  if (!anchor) return `#/k/${b.id}`
  const e = b.entries.find((x) => anchor === x.anchor || anchor.startsWith(x.anchor + '-'))
  if (e) return anchor === e.anchor ? `#/k/${e.id}` : `#/k/${e.id}/${anchor}`
  return `#/k/${b.id}/${anchor}`
}
