import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2677. Chunk Array
export const q2677: Solution = {
  id: 2677,
  languages: ['javascript'],
  plain: "把一排物品每 size 個裝成一包；最後不夠一包也要保留。",
  statement: "給陣列 arr 與正整數 size，依原順序切成多個小陣列，每組最多 size 項；最後一組可較短，空輸入回傳空陣列。",
  examples: [{"input":"arr=[1,9,6,3,2], size=3","output":"[[1,9,6],[3,2]]"},{"input":"arr=[], size=1","output":"[]"}],
  constraints: ["size 至少為 1。","可能只有一組，或最後一組不滿 size。"],
  insight: ["每個完整組從索引 0、size、2×size 開始。","切片的終點不包含在結果內，超出尾端時會自動停在陣列末端。"],
  approaches: [
    {
      name: "依起點切片",
      idea: "每次把從 i 起最多 size 項切成一組。",
      steps: ["建立空結果","i 從 0 開始，每次增加 size","將 arr.slice(i,i+size) 放進結果"],
      figure: { title: "每三項一組", steps: [
        { note: "前 3 項形成第一組。", views: [arr([1,9,6,3,2], { label: "原陣列", highlight: [0,1,2] })] },
        { note: "剩下 2 項成為最後一組。", views: [arr([1,9,6,3,2], { label: "原陣列", done: [3,4] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "每個元素被複製到某一組一次。" },
      verdict: "最簡潔，適合已熟悉 slice 的讀者。",
      code: { javascript: "var chunk = function(arr, size) {\n  const out = [];\n  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));\n  return out;\n};" },
    },
    {
      name: "逐項裝滿再換包",
      idea: "一項一項加入目前小組，滿 size 就開始下一組。",
      steps: ["建立結果陣列","走訪每個原元素","當目前組不存在或已滿時建立新組","把元素加入目前組"],
      figure: { title: "裝滿換下一包", steps: [
        { note: "前三項依序裝進同一包。", views: [arr([1,9,6,3,2], { label: "原陣列", highlight: [0,1,2] })] },
        { note: "第四項開新包，第五項接在後面。", views: [arr([1,9,6,3,2], { label: "原陣列", done: [3,4] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "只走訪原陣列一次，所有元素存進新分組。" },
      verdict: "不依賴 slice，能清楚展示分組狀態。",
      code: { javascript: "var chunk = function(arr, size) {\n  const out = [];\n  for (const item of arr) {\n    if (!out.length || out[out.length - 1].length === size) out.push([]);\n    out[out.length - 1].push(item);\n  }\n  return out;\n};" },
    },
  ],
  pitfalls: ["最後一組可以少於 size。","空輸入要回傳 []，不能產生一個空組。","size 為正整數，迴圈每次前進 size。"],
  check: { kind: 'script', cases: [
    { run: "return chunk([1,9,6,3,2],3)", out: [[1,9,6],[3,2]] },
    { run: "return chunk([1,2,3],1)", out: [[1],[2],[3]] },
    { run: "return chunk([],1)", out: [] },
    { run: "return chunk([8,5],6)", out: [[8,5]] },
  ] },
}

