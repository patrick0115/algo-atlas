import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2648. Generate Fibonacci Sequence
export const q2648: Solution = {
  id: 2648,
  languages: ['javascript'],
  plain: "像接力報數：先說 0、1，之後每個數都是前兩個數相加。",
  statement: "撰寫 generator 函式 fibGenerator，每次呼叫 next() 才產生下一個費波那契數，序列從 0、1 開始。",
  examples: [{"input":"呼叫 next() 五次","output":"[0,1,1,2,3]"},{"input":"呼叫零次","output":"[]"}],
  constraints: ["最多呼叫 next() 50 次。","不需事先建立完整序列。"],
  insight: ["generator 的 yield 會暫停函式並保留區域變數。","保存相鄰兩項 a、b，每次產生 a 後更新為 b、a+b。"],
  approaches: [
    {
      name: "兩個變數循環",
      idea: "在無限迴圈內逐次 yield，並同步更新兩個數。",
      steps: ["令 a=0、b=1","yield a","把 a、b 更新成 b、a+b","持續重複"],
      figure: { title: "相鄰兩項前進", steps: [
        { note: "先產生 0。", views: [arr([0,1], { label: "a、b", highlight: [0] })] },
        { note: "更新後產生 1，再得到 1。", views: [arr([1,1,2], { label: "後續", done: [1] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "每次只做加法並保存兩個數。" },
      verdict: "最精簡且真正按需求值。",
      code: { javascript: "var fibGenerator = function*() {\n  let a = 0, b = 1;\n  while (true) {\n    yield a;\n    [a, b] = [b, a + b];\n  }\n};" },
    },
    {
      name: "先產生前兩項",
      idea: "先 yield 0 和 1，之後在迴圈裡計算新項。",
      steps: ["先 yield 0，再 yield 1","保存前兩項 0、1","計算總和並 yield","將兩個記錄往前移"],
      figure: { title: "從第三項開始相加", steps: [
        { note: "前兩項固定是 0、1。", views: [arr([0,1], { label: "開頭", highlight: [0,1] })] },
        { note: "第三項是 0+1=1。", views: [arr([0,1,1], { label: "序列", done: [2] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "每個 next 只做固定次數運算。" },
      verdict: "能清楚看出起始條件，程式稍長。",
      code: { javascript: "var fibGenerator = function*() {\n  yield 0;\n  yield 1;\n  let prev = 0, cur = 1;\n  while (true) {\n    const next = prev + cur;\n    yield next;\n    prev = cur;\n    cur = next;\n  }\n};" },
    },
  ],
  pitfalls: ["不要只回傳陣列，要回傳 generator 物件。","yield 會暫停，下一次 next 才繼續。","前兩項是 0 和 1。"],
  check: { kind: 'script', cases: [
    { run: "const g=fibGenerator();return Array.from({length:5},()=>g.next().value)", out: [0,1,1,2,3] },
    { run: "const g=fibGenerator();return Array.from({length:8},()=>g.next().value)", out: [0,1,1,2,3,5,8,13] },
  ] },
}

