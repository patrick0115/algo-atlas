import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2666. Allow One Function Call
export const q2666: Solution = {
  id: 2666,
  languages: ['javascript'],
  plain: "替函式裝一道只能通過一次的門；第一通正常執行，以後都直接回傳 undefined。",
  statement: "once(fn) 回傳新函式。第一次呼叫要把參數交給 fn 並回傳其結果；之後每次呼叫都不能再執行 fn，並回傳 undefined。",
  examples: [{"input":"fn=(a,b,c)=>a+b+c，依序呼叫 (1,2,3)、(2,3,6)","output":"先得 6，後得 undefined；fn 只執行一次"}],
  constraints: ["呼叫次數為 1 到 10。","每次呼叫可帶多個參數。"],
  insight: ["是否呼叫過應由閉包保存，不可根據結果是否為真值判斷。","第一次呼叫前就標記已用過，之後無論 fn 回傳什麼都不能再呼叫。"],
  approaches: [
    {
      name: "布林旗標",
      idea: "用 used 記錄門是否已經開過。",
      steps: ["在外層建立 used=false","呼叫時若 used 為真便回傳 undefined","否則標記 used=true 並執行 fn"],
      figure: { title: "門只開一次", steps: [
        { note: "第一次呼叫，門仍可開。", views: [arr(["第一次","第二次"], { label: "呼叫", highlight: [0] })] },
        { note: "用過後第二次被擋下。", views: [arr(["第一次","第二次"], { label: "呼叫", done: [1] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "只記錄一個布林值；不計 fn 自身成本。" },
      verdict: "最清楚，而且 fn 即使回傳 0 也不會重跑。",
      code: { javascript: "var once = function(fn) {\n  let used = false;\n  return function(...args) {\n    if (used) return undefined;\n    used = true;\n    return fn(...args);\n  };\n};" },
    },
    {
      name: "呼叫次數計數",
      idea: "把已呼叫次數放在閉包，只有次數為零時執行。",
      steps: ["在外層令 calls=0","每次呼叫先檢查 calls","首次遞增並呼叫 fn","其他情況回傳 undefined"],
      figure: { title: "次數從零到一", steps: [
        { note: "calls=0 時執行 fn。", views: [arr([0,1], { label: "已呼叫次數", highlight: [0] })] },
        { note: "calls=1 時直接略過。", views: [arr([0,1], { label: "已呼叫次數", done: [1] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "只保存一個計數器。" },
      verdict: "也能完成需求，旗標更能表達只有一次。",
      code: { javascript: "var once = function(fn) {\n  let calls = 0;\n  return function(...args) {\n    if (calls !== 0) return undefined;\n    calls++;\n    return fn(...args);\n  };\n};" },
    },
  ],
  pitfalls: ["fn 回傳 0、false 或 undefined 也算已呼叫。","不能在包裝 once 時就執行 fn。","後續呼叫應回傳 undefined。"],
  check: { kind: 'script', cases: [
    { run: "let n=0;const f=once((a,b)=>{n++;return a+b});return [f(1,2),f(3,4),n]", out: [3,null,1] },
    { run: "let n=0;const f=once(()=>{n++;return 0});return [f(),f(),n]", out: [0,null,1] },
  ] },
}

