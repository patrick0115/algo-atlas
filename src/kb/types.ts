// 百科的「書 / 詞條」:原 SemiDrill 講義搬進來的資料格式。
// 內容是原講義的 HTML 片段(表格、SVG 圖、條列照搬),版面由 kb.css 統一;
// 互動圖標成 widget,互動程式在 src/kb/widgets/<書>.ts。

export type KbBlock =
  /** 一般內容:段落、表格、圖 */
  | { t: 'html'; html: string }
  /** L1 是什麼 / L2 為什麼 / L3 出問題怎麼辦 */
  | { t: 'lv'; lv: 1 | 2 | 3 | number; title: string; html: string; anchor?: string }
  /** 互動圖:先放原本的標記,再由 widgets 裡同 id 的程式接上互動 */
  | { t: 'widget'; id: string; html: string }
  /** 同一個詞條底下的小節標題(例:K03 拆成好幾段) */
  | { t: 'sub'; title: string; anchor: string }

export interface KbSection {
  id: string
  title: string
  blocks: KbBlock[]
}

export interface Entry {
  /** 全站唯一,也是網址:#/k/L01 */
  id: string
  /** 原講義裡的錨點(l01),舊網址轉址用 */
  anchor: string
  tag: string
  name: string
  /** 目錄上的一句話說明 */
  sub: string
  blocks: KbBlock[]
}

export interface Book {
  /** A–Q */
  id: string
  /** 原檔名,舊網址轉址用 */
  file: string
  title: string
  lead: string
  /** 標題下的小字說明(對應 taxonomy、難度標籤) */
  note: string
  /** 詞條之前:主圖、比較表 */
  front: KbSection[]
  entries: Entry[]
  /** 詞條之後:容易混淆、英文術語、出處 */
  back: KbSection[]
  /** 原頁面自帶的樣式,套用時限定在這本書的範圍內 */
  css?: string
}
