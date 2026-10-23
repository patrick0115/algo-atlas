import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2635. Apply Transform Over Each Element in Array
export const q2635: Solution = {
  id: 2635,
  languages: ['javascript'],
  plain: "像流水線加工：每個原元素連同位置交給 fn，把加工結果放進同位置的新陣列。",
  statement: "給整數陣列 arr 和轉換函式 fn，回傳新陣列，使第 i 項等於 fn(arr[i],i)；不能使用 Array.map。",
  examples: [{"input":"arr=[1,2,3], fn=n=>n+1","output":"[2,3,4]"},{"input":"arr=[1,2,3], fn=(n,i)=>n+i","output":"[1,3,5]"}],
  constraints: ["陣列長度為 0 到 1000。","原元素在 -10⁹ 到 10⁹，fn 回傳整數。"],
  insight: ["fn 同時收到原數值與原索引。","輸出長度必須與輸入一致，不能因結果為 0 就跳過。"],
  approaches: [
    {
      name: "索引指派",
      idea: "預先建立答案陣列，在相同索引寫入結果。",
      steps: ["建立與原陣列同長的新陣列","逐一計算 fn(arr[i],i)","將結果放在 out[i]"],
      figure: { title: "位置一一對應", steps: [
        { note: "索引 1 的 2 加上索引得到 3。", views: [arr([1,2,3], { label: "輸入", highlight: [1] })] },
        { note: "每個位置都寫入對應結果。", views: [arr([1,3,5], { label: "輸出", done: [1] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "每項計算一次，答案需要 N 個位置。" },
      verdict: "最直接顯示輸入與輸出位置的關係。",
      code: { javascript: "var map = function(arr, fn) {\n  const out = new Array(arr.length);\n  for (let i = 0; i < arr.length; i++) out[i] = fn(arr[i], i);\n  return out;\n};" },
    },
    {
      name: "push 新值",
      idea: "依順序把每個轉換結果加入新陣列。",
      steps: ["建立空答案","由左到右走索引","將 fn 的結果 push 進答案"],
      figure: { title: "依序累積答案", steps: [
        { note: "先處理 1，得到 2。", views: [arr([1,2,3], { label: "輸入", highlight: [0] })] },
        { note: "後續依序放入 3、4。", views: [arr([2,3,4], { label: "輸出", done: [2] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "每個元素呼叫 fn 一次，新陣列有 N 項。" },
      verdict: "不需事先知道答案長度，也很易讀。",
      code: { javascript: "var map = function(arr, fn) {\n  const out = [];\n  for (let i = 0; i < arr.length; i++) out.push(fn(arr[i], i));\n  return out;\n};" },
    },
  ],
  pitfalls: ["要把索引 i 傳給 fn。","要回傳新陣列，不是修改原陣列。","不能使用內建 map。"],
  check: { kind: 'script', cases: [
    { run: "return map([1,2,3],n=>n+1)", out: [2,3,4] },
    { run: "return map([1,2,3],(n,i)=>n+i)", out: [1,3,5] },
    { run: "return map([10,20],()=>0)", out: [0,0] },
    { run: "return map([],()=>7)", out: [] },
  ] },
}

