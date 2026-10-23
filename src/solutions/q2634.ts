import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2634. Filter Elements from Array
export const q2634: Solution = {
  id: 2634,
  languages: ['javascript'],
  plain: "像過篩子：逐一詢問 fn，答覆為真值才把原元素放進新陣列。",
  statement: "給陣列 arr 與判斷函式 fn，保留讓 fn(arr[i],i) 為真值的原元素並維持順序；不能使用 Array.filter。",
  examples: [{"input":"arr=[0,10,20,30]，fn=n=>n>10","output":"[20,30]"},{"input":"arr=[1,2,3]，fn=(n,i)=>i===0","output":"[1]"}],
  constraints: ["陣列長度為 0 到 1000。","fn 的結果依 JavaScript 真值規則判斷，不一定是布林值。"],
  insight: ["回傳陣列放原值，不是 fn 算出的值。","第二個參數是元素在原陣列中的索引。"],
  approaches: [
    {
      name: "索引迴圈",
      idea: "依位置呼叫 fn；通過才加入答案。",
      steps: ["建立空答案","從索引 0 逐一走訪","fn(arr[i],i) 為真就 push arr[i]"],
      figure: { title: "留下通過者", steps: [
        { note: "20 的判斷通過。", views: [arr([0,10,20,30], { label: "原陣列", highlight: [2] })] },
        { note: "30 也通過，結果為 [20,30]。", views: [arr([20,30], { label: "結果", done: [0,1] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "每個元素判斷一次，答案最多放 N 個。" },
      verdict: "索引來源清楚，最適合初學者。",
      code: { javascript: "var filter = function(arr, fn) {\n  const out = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (fn(arr[i], i)) out.push(arr[i]);\n  }\n  return out;\n};" },
    },
    {
      name: "for...of 搭配索引",
      idea: "另外保存索引，走訪元素時同步遞增。",
      steps: ["建立空答案與索引 i","逐項讀取元素","判斷後按需加入答案","每次把 i 加一"],
      figure: { title: "元素與索引同行", steps: [
        { note: "第一項的索引為 0。", views: [arr([1,2,3], { label: "原陣列", highlight: [0] })] },
        { note: "只保留索引 0 的元素。", views: [arr([1], { label: "結果", done: [0] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "遍歷 N 項並建立最多 N 項的新陣列。" },
      verdict: "也可行，但需記得手動更新索引。",
      code: { javascript: "var filter = function(arr, fn) {\n  const out = [];\n  let i = 0;\n  for (const value of arr) {\n    if (fn(value, i)) out.push(value);\n    i++;\n  }\n  return out;\n};" },
    },
  ],
  pitfalls: ["要加入原元素，不是 fn 的回傳值。","0 是假值，非零數字是真值。","不能使用內建 filter。"],
  check: { kind: 'script', cases: [
    { run: "return filter([0,10,20,30],n=>n>10)", out: [20,30] },
    { run: "return filter([1,2,3],(n,i)=>i===0)", out: [1] },
    { run: "return filter([-2,-1,0,1,2],n=>n+1)", out: [-2,0,1,2] },
    { run: "return filter([],()=>true)", out: [] },
  ] },
}

