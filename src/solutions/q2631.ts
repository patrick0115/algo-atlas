import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2631. Group By
export const q2631: Solution = {
  id: 2631,
  languages: ['javascript'],
  plain: "把同標籤的物品放進同一個盒子，盒內順序照原來排。",
  statement: "在 Array.prototype 增加 groupBy(fn)。每個元素由 fn 算出字串鍵，回傳以鍵對應原元素陣列的物件；不能使用 lodash 的 groupBy。",
  examples: [{"input":"[{id:\"1\"},{id:\"1\"},{id:\"2\"}]，依 id 分組","output":"{\"1\":[前兩項],\"2\":[第三項]}"},{"input":"[1,2,3,4]，依奇偶分組","output":"兩組，組內保留原順序"}],
  constraints: ["陣列可有 0 到 10⁵ 個元素。","fn 對每個元素回傳字串鍵。"],
  insight: ["用 this 取得呼叫 groupBy 的陣列。","先為新鍵建立空陣列，再把原元素推進該組。","特殊鍵如 __proto__ 不該撞到一般物件的原型。"],
  approaches: [
    {
      name: "無原型物件",
      idea: "以 Object.create(null) 建立乾淨的分組字典。",
      steps: ["建立無原型結果物件","逐項呼叫 fn 求鍵","首次遇到鍵時建立空陣列","把元素推入該陣列"],
      figure: { title: "依鍵裝盒", steps: [
        { note: "前兩項的 id 都是 1。", views: [arr(["1","1","2"], { label: "id", highlight: [0,1] })] },
        { note: "最後一項進入鍵 2 的盒子。", views: [arr(["1","1","2"], { label: "id", done: [2] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "每個元素走一次並存入一個分組陣列。" },
      verdict: "直接回傳題目要求的物件，安全處理特殊鍵。",
      code: { javascript: "Array.prototype.groupBy = function(fn) {\n  const groups = Object.create(null);\n  for (const item of this) {\n    const key = fn(item);\n    if (!Object.hasOwn(groups, key)) groups[key] = [];\n    groups[key].push(item);\n  }\n  return groups;\n};" },
    },
    {
      name: "Map 後轉物件",
      idea: "先用 Map 分組，再把各鍵寫入結果物件。",
      steps: ["建立 Map","逐項求鍵並加入對應陣列","把 Map 轉成無原型物件"],
      figure: { title: "兩段式分組", steps: [
        { note: "先將 id=1 放進 Map。", views: [arr(["1","1","2"], { label: "id", highlight: [0,1] })] },
        { note: "轉成物件時保留各組內的順序。", views: [arr(["1","1","2"], { label: "id", done: [0,1] })] },
      ] },
      complexity: { time: "O(N+K)", space: "O(N+K)", why: "N 是元素數，K 是不同鍵數；轉物件需再走訪 K 組。" },
      verdict: "Map 操作清楚，但比直接寫結果多一步。",
      code: { javascript: "Array.prototype.groupBy = function(fn) {\n  const map = new Map();\n  for (const item of this) {\n    const key = fn(item);\n    if (!map.has(key)) map.set(key, []);\n    map.get(key).push(item);\n  }\n  const groups = Object.create(null);\n  for (const [key, items] of map) groups[key] = items;\n  return groups;\n};" },
    },
  ],
  pitfalls: ["回傳的是分組物件，值才是陣列。","不能把相同鍵的元素排序，原順序要保留。","普通 {} 的 __proto__ 鍵可能與原型衝突。"],
  check: { kind: 'script', cases: [
    { run: "return [1,2,3,4].groupBy(x=>String(x%2))", out: {"0":[2,4],"1":[1,3]} },
    { run: "return [].groupBy(x=>String(x))", out: {} },
    { run: "return Object.entries([\"a\",\"b\"].groupBy(()=>(\"__proto__\")))", out: [["__proto__", ["a", "b"]]] },
  ] },
}

