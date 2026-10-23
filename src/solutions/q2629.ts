import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2629. Function Composition
export const q2629: Solution = {
  id: 2629,
  languages: ['javascript'],
  plain: "像一條加工線：從最右邊的函式開始，把輸出交給左邊的函式。",
  statement: "給一組只收一個整數的函式，回傳它們的組合函式。對 [f,g,h]，執行順序是 h、g、f；空陣列時原樣回傳輸入。",
  examples: [{"input":"[x=>x+1, x=>x*x, x=>2*x]，x=4","output":"65"},{"input":"[]，x=42","output":"42"}],
  constraints: ["函式數量為 0 到 1000，輸入 x 為 -1000 到 1000。","每個函式都接受並回傳整數。"],
  insight: ["合成的書寫順序與執行順序相反。","以 x 作累計值，從陣列最後一項往前套用即可。"],
  approaches: [
    {
      name: "倒序索引迴圈",
      idea: "由最後一個函式往第一個函式更新結果。",
      steps: ["回傳接收 x 的函式","從 functions.length-1 走到 0","逐步更新 x","回傳 x"],
      figure: { title: "右往左套用", steps: [
        { note: "x=4，先做 2*x 得 8。", views: [arr(["加一","平方","乘二"], { label: "函式順序", highlight: [2] })] },
        { note: "再平方得 64、加一得 65。", views: [arr(["8","64","65"], { label: "中間值", done: [2] })] },
      ] },
      complexity: { time: "O(N)", space: "O(1)", why: "每個函式呼叫一次，只保存目前值。" },
      verdict: "順序明確，空陣列自然回傳 x。",
      code: { javascript: "var compose = function(functions) {\n  return function(x) {\n    for (let i = functions.length - 1; i >= 0; i--) x = functions[i](x);\n    return x;\n  };\n};" },
    },
    {
      name: "複製後反向走訪",
      idea: "先建立反向副本，再照副本從左到右執行。",
      steps: ["複製並反轉函式陣列","回傳接收 x 的函式","依反向副本逐一更新 x"],
      figure: { title: "反轉後直接走", steps: [
        { note: "原順序是加一、平方、乘二。", views: [arr(["加一","平方","乘二"], { label: "原順序", highlight: [2] })] },
        { note: "反轉後依序乘二、平方、加一。", views: [arr(["乘二","平方","加一"], { label: "執行順序", done: [2] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "反轉副本需要 N 個位置，每次執行 N 個函式。" },
      verdict: "便於理解執行順序，但多存一份陣列。",
      code: { javascript: "var compose = function(functions) {\n  const order = [...functions].reverse();\n  return function(x) {\n    for (const fn of order) x = fn(x);\n    return x;\n  };\n};" },
    },
  ],
  pitfalls: ["不能從左往右執行原陣列。","不要直接 reverse 原輸入，會改動呼叫者持有的陣列。","空陣列應回傳 x。"],
  check: { kind: 'script', cases: [
    { run: "return compose([x=>x+1,x=>x*x,x=>2*x])(4)", out: 65 },
    { run: "return compose([])(42)", out: 42 },
    { run: "return compose([x=>x*10,x=>x+1])(2)", out: 30 },
  ] },
}

