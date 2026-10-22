// 單題題解:一題一個檔案,一題有多個解法,每個解法都有想法、圖示、複雜度與五種語言的程式碼。
// 題意一律用自己的話重述,不抄 LeetCode 原文。
// 文字欄位可用和觀念章相同的行內標記(`程式碼`、**粗體**、[[c:id]]、[[p:id]]、[文字](#/路徑))。

import type { Rich } from '../concepts/types'
import type { Lang, View } from '../types'

/** 圖示的一步:用現成的渲染器(陣列、網格、Hash 表、節點圖)畫一張快照 */
export interface FigStep {
  note: Rich
  views: View[]
}

export interface Approach {
  name: string
  /** 一句話:這個方法的核心想法 */
  idea: Rich
  /** 做法,照著念就能寫出來 */
  steps: Rich[]
  /** 圖示:拿題目範例一步一步畫 */
  figure: { title: string; steps: FigStep[] }
  complexity: { time: string; space: string; why: Rich }
  /** 優缺點、什麼時候選它 */
  verdict: Rich
  code: Record<Lang, string>
}

/**
 * 測資裡要轉成節點的參數:list = 陣列轉 ListNode 串列,tree = 層序陣列(null 表示空)轉 TreeNode,
 * randomList = [[值, random 指向的索引或 null], ...] 轉成有 random 指標的 Node 串列(138 題)
 */
export type NodeKind = 'list' | 'tree' | 'randomList'

/**
 * 測試:把 JavaScript 版的程式碼拿來跑這些例子。
 * fn 是函式名稱;compare 決定怎麼比答案:
 * exact 完全相同 · sorted 一維陣列排序後相同(答案順序不限)· groups 每組內排序、組間排序後相同 · close 浮點數誤差 1e-5 內
 * argKinds / ret 標出哪些參數、回傳值是串列或樹;inplace 是「沒有回傳、直接改參數」的題目要檢查第幾個參數
 * class 是設計題:照 ops 依序呼叫,第一個 op 是建構子,out 對應每次呼叫的回傳值(建構子與沒有回傳的放 null)
 */
export type Check =
  | {
      kind: 'fn'
      fn: string
      compare?: 'exact' | 'sorted' | 'groups' | 'close'
      argKinds?: (NodeKind | null)[]
      ret?: NodeKind
      inplace?: number
      cases: { args: unknown[]; out: unknown }[]
    }
  | { kind: 'class'; cls: string; compare?: 'exact' | 'close'; cases: { ops: string[]; args: unknown[][]; out: unknown[] }[] }

export interface Solution {
  id: number
  /** 白話:一兩句話講這題在做什麼,最好帶一個生活比喻,給第一次看的人 */
  plain: Rich
  /** 題意(自己的話) */
  statement: Rich
  examples: { input: string; output: string; note?: Rich }[]
  /** 限制條件,以及從它推得出什麼 */
  constraints: Rich[]
  /** 讀題觀察:怎麼一步步想到解法 */
  insight: Rich[]
  approaches: Approach[]
  pitfalls: Rich[]
  /** 延伸問題(面試官常追問的 follow-up) */
  followUp?: { q: Rich; a: Rich }[]
  check: Check
}
