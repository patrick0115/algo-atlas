// 全站共用的資料型別。
// 核心概念:演算法 generator 吐出 Frame(快照),通用 renderer 只負責畫 Frame。

export type Lang = 'python' | 'c' | 'cpp' | 'java' | 'javascript'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
]

// ---- 視圖(renderer 的輸入) ----

export interface Pointer {
  name: string
  index: number
  color?: 'a' | 'b' | 'c'
}

export interface ArrayViewData {
  kind: 'array'
  label?: string
  values: (number | string)[]
  /** bars:長條圖(排序用);cells:格子(預設) */
  mode?: 'cells' | 'bars'
  /** 元素的穩定身分;給了之後交換會有滑動動畫 */
  ids?: number[]
  pointers?: Pointer[]
  /** 目前區間,閉區間 [lo, hi];hi < lo 表示空 */
  range?: [number, number]
  /** 本步驟的焦點(黃) */
  highlight?: number[]
  /** 正在比較(藍) */
  compare?: number[]
  /** 已經定案(綠) */
  done?: number[]
  /** 已排除(變淡) */
  dim?: number[]
}

export type Cell = [number, number]

export interface GridViewData {
  kind: 'grid'
  label?: string
  cells: (number | string | null)[][]
  rowLabels?: string[]
  colLabels?: string[]
  /** class 名稱 → 要套用的格子;可用 class:hl cur done wall path dep dim water */
  marks?: Record<string, Cell[]>
}

export interface GraphNode {
  id: string | number
  label: string | number
  x: number
  y: number
  /** hl cur done dim visited queued */
  cls?: string
  /** 節點下方的小字(距離、入度...) */
  sub?: string | number
}

export interface GraphEdge {
  from: string | number
  to: string | number
  label?: string | number
  /** hl done dim */
  cls?: string
  directed?: boolean
}

export interface GraphViewData {
  kind: 'graph'
  label?: string
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export interface KVViewData {
  kind: 'kv'
  label?: string
  entries: [string | number, string | number][]
  highlight?: (string | number)[]
}

export type View = ArrayViewData | GridViewData | GraphViewData | KVViewData

// ---- 快照 ----

export interface Frame {
  /** 對應程式碼裡的 @tag,用來高亮目前執行的行 */
  line: string
  /** 這一步在做什麼(人話) */
  note: string
  vars?: Record<string, string | number>
  views: View[]
}

// ---- 演算法(講義的一章) ----

export interface DemoInput {
  key: string
  label: string
  default: string
}

export interface Demo {
  title: string
  inputs: DemoInput[]
  /** 解析輸入並逐步吐出快照;輸入不合法時 throw Error(訊息會顯示給使用者)。最後一個 Frame 的 vars.answer 是答案 */
  run: (values: Record<string, string>) => Generator<Frame>
  /** 獨立的參考解(測試用,和 run 的答案比對) */
  reference?: (values: Record<string, string>) => string | number
  /** 隨機產生合法輸入(測試用) */
  random?: () => Record<string, string>
  /** 每行尾端可加 `#@tag` 或 `//@tag`,渲染時去掉並用來對應 Frame.line */
  code: Record<Lang, string>
}

export interface Pattern {
  id: string
  /** 一句話白話說明 */
  summary: string
  /** 生活比喻,幫新手建立直覺 */
  analogy: string
  /** 演算法步驟,新手照著念就懂 */
  steps: string[]
  /** 看動畫時要注意什麼 */
  watch: string[]
  /** 題目出現哪些訊號時想到它 */
  whenToUse: string[]
  pitfalls: string[]
  complexity: { time: string; space: string; why: string }
  demo: Demo
}

// ---- 題目 ----

export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type ListId = 'neetcode150' | 'blind75' | 'neetcode450'

export interface Problem {
  id: number
  title: string
  slug: string
  difficulty: Difficulty
  paid: boolean
  tags: string[]
  lists: ListId[]
  patterns: string[]
  /** true:人工精標;false:由官方標籤自動歸類 */
  curated: boolean
  /** 一句話解題關鍵(只有精標題才有) */
  key?: string
}

export type Status = 'ok' | 'fuzzy' | 'no'
