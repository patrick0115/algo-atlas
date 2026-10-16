// 基礎篇的「觀念章」:不是某個演算法,而是刷題前要先有的底子(複雜度、指標、語言、資料結構...)。
// 和演算法章(Pattern)不同,觀念章由一串 Block 組成,版面比較自由。

import type { Lang } from '../types'

/**
 * 文字欄位可用的行內標記:
 * `程式碼`、**粗體**、[[c:觀念章 id]]、[[p:演算法 id]](會換成連結,顯示該章名稱)
 */
export type Rich = string

export interface MemCell {
  /** 所在區域:同一個區域的格子畫在同一欄,例如 'main()'、'swap()'、'heap' */
  region: string
  name: string
  addr?: string
  value: string
  /** 指向哪一格(同一步裡另一格的 name);有的話畫成「→ 名稱」並標出被指的格子 */
  ref?: string
  /** 這一步剛改過 */
  hl?: boolean
}

export interface MemStep {
  /** 目前執行到第幾行(1 起算) */
  line: number
  note: Rich
  cells: MemCell[]
}

export type WidgetId = 'growth' | 'budget'

export type Block =
  | { t: 'p'; text: Rich }
  | { t: 'list'; items: Rich[]; ordered?: boolean }
  | { t: 'table'; cols: string[]; rows: Rich[][]; note?: Rich }
  /** 多語言程式碼:只給一種語言就只顯示那一種,不出現分頁 */
  | { t: 'code'; title?: string; code: Partial<Record<Lang, string>> }
  | { t: 'note'; kind: 'tip' | 'warn' | 'key'; title: string; text: Rich }
  /** 記憶體逐步圖:左邊程式碼、右邊每個變數的位址與值,一步一步走 */
  | { t: 'memory'; title: string; lang: Lang; code: string; steps: MemStep[] }
  | { t: 'widget'; id: WidgetId }
  /** 純文字圖(樹的形狀、記憶體排列...),等寬字型原樣顯示 */
  | { t: 'pre'; text: string; caption?: Rich }

export interface ConceptQuiz {
  q: Rich
  options: string[]
  /** 正確選項的索引 */
  a: number
  why: Rich
}

export interface Concept {
  id: string
  name: string
  /** 1 入門 · 2 中階 · 3 進階 */
  level: 1 | 2 | 3
  /** 建議先讀的觀念章(只能指向排在前面的章) */
  prereq: string[]
  lead: Rich
  analogy?: Rich
  sections: { title: string; blocks: Block[] }[]
  pitfalls: Rich[]
  quiz: ConceptQuiz[]
  /** 學完可以接著讀的演算法;演算法頁也會反過來把這章列為「基礎觀念」 */
  next: string[]
}

export interface Unit {
  id: string
  name: string
  /** 這個單元在整條路線上的角色 */
  desc: string
  concepts: Concept[]
}
