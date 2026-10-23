// 和演算法圖鑑重複的講義段落,併進圖鑑的頁面,一個觀念只留一個家。
// from:詞條 id(P02),或「書#段落 id」(P#signals,書頁上的段落);to:圖鑑網址(不含 #/)。
// 被併入的段落在原書只留一個連結,舊網址自動轉到新家。

import type { Book, KbBlock } from './types'
import { BOOKS, ENTRIES } from '.'

export const MERGED: { from: string; to: string }[] = [
  { from: 'P01', to: 'p/two-pointers' },
  { from: 'P02', to: 'p/sliding-window' },
  { from: 'P03', to: 'p/binary-search' },
  { from: 'P04', to: 'p/hash-map' },
  { from: 'P05', to: 'p/stack' },
  { from: 'P06', to: 'p/linked-list' },
  { from: 'P07', to: 'p/tree-dfs' },
  { from: 'P08', to: 'p/graph-traversal' },
  { from: 'P09', to: 'p/backtracking' },
  { from: 'P10', to: 'p/dp-general' },
  { from: 'P11', to: 'p/greedy' },
  { from: 'P12', to: 'p/heap' },
  { from: 'P13', to: 'p/bit-manipulation' },
  { from: 'P14', to: 'c/constraints' },
  { from: 'P#signals', to: 'c/paradigms' },
  { from: 'H05', to: 'c/ds-overview' },
  { from: 'H06', to: 'c/big-o' },
  { from: 'Q03', to: 'c/solving-process' },
]

const BY_FROM = new Map(MERGED.map((m) => [m.from, m.to]))

/** 被併走的詞條或段落的新家(圖鑑網址,不含 #/);沒被併走回 undefined */
export const hostOf = (from: string) => BY_FROM.get(from)

export interface Attached {
  /** 例:P02 滑動視窗 */
  title: string
  book: Book
  blocks: KbBlock[]
}

/** 這個圖鑑頁面收進來的講義段落 */
export function attachedTo(route: string): Attached[] {
  return MERGED.filter((m) => m.to === route).flatMap((m): Attached[] => {
    const [bookId, sec] = m.from.split('#')
    if (sec) {
      const book = BOOKS[bookId]
      const s = book && [...book.front, ...book.back].find((x) => x.id === sec)
      return s ? [{ title: `${bookId} ${s.title}`, book, blocks: s.blocks }] : []
    }
    const found = ENTRIES[m.from]
    return found ? [{ title: `${found.entry.tag} ${found.entry.name}`, book: found.book, blocks: found.entry.blocks }] : []
  })
}
