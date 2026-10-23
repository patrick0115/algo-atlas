import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2637. Promise Time Limit
export const q2637: Solution = {
  id: 2637,
  languages: ['javascript'],
  plain: "替非同步工作設鬧鐘：工作先完成就交答案，鬧鐘先響就報超時。",
  statement: "給回傳 Promise 的函式 fn 與毫秒數 t，回傳有限時的函式。fn 在期限內完成就採用其結果或錯誤；超過期限則拒絕並給出字串 \"Time Limit Exceeded\"。",
  examples: [{"input":"fn 約 100ms 後回傳 25，t=50","output":"拒絕 \"Time Limit Exceeded\""},{"input":"fn 約 100ms 後回傳 25，t=150","output":"成功回傳 25"}],
  constraints: ["輸入參數最多 10 個；0 ≤ t ≤ 1000。","fn 回傳 Promise，且可能自行拒絕。"],
  insight: ["工作與計時器誰先落定，外層 Promise 就採用誰。","fn 原本的拒絕理由應原樣傳出，不可都改成超時。"],
  approaches: [
    {
      name: "Promise.race",
      idea: "讓工作 Promise 與超時 Promise 競速。",
      steps: ["呼叫 fn(...args) 建立工作","建立 t 毫秒後拒絕的 Promise","用 Promise.race 回傳先落定者","完成後清除計時器"],
      figure: { title: "兩條時間線競速", steps: [
        { note: "期限 50，工作預計 100 才完成。", views: [arr(["0","50","100"], { label: "毫秒", highlight: [1] })] },
        { note: "計時器先落定，回傳超時。", views: [arr(["0","50","100"], { label: "毫秒", done: [1] })] },
      ] },
      complexity: { time: "O(1) 包裝成本", space: "O(1)", why: "每次呼叫只建立固定數量的 Promise 與計時器。" },
      verdict: "精簡且直接表現競速觀念。",
      code: { javascript: "var timeLimit = function(fn, t) {\n  return async function(...args) {\n    let timer;\n    const timeout = new Promise((_, reject) => {\n      timer = setTimeout(() => reject(\"Time Limit Exceeded\"), t);\n    });\n    try {\n      return await Promise.race([Promise.resolve().then(() => fn(...args)), timeout]);\n    } finally {\n      clearTimeout(timer);\n    }\n  };\n};" },
    },
    {
      name: "手動建立外層 Promise",
      idea: "把 fn 的成功或失敗接到外層，同時安排超時計時器。",
      steps: ["建立外層 Promise","安排 t 毫秒後拒絕","執行 fn 並接住結果或錯誤","工作先完成時取消計時器"],
      figure: { title: "先到者決定結果", steps: [
        { note: "工作若在 30 完成，比期限 50 早。", views: [arr(["0","30","50"], { label: "毫秒", highlight: [1] })] },
        { note: "取消鬧鐘，採用工作結果。", views: [arr(["0","30","50"], { label: "毫秒", done: [1] })] },
      ] },
      complexity: { time: "O(1) 包裝成本", space: "O(1)", why: "額外只保存計時器及固定數量的回呼。" },
      verdict: "程式稍長，適合學習 Promise 的 resolve 與 reject。",
      code: { javascript: "var timeLimit = function(fn, t) {\n  return function(...args) {\n    return new Promise((resolve, reject) => {\n      const timer = setTimeout(() => reject(\"Time Limit Exceeded\"), t);\n      Promise.resolve().then(() => fn(...args)).then(\n        value => { clearTimeout(timer); resolve(value); },\n        error => { clearTimeout(timer); reject(error); }\n      );\n    });\n  };\n};" },
    },
  ],
  pitfalls: ["fn 自行拒絕時，要保留原本錯誤。","不要忘記傳入所有 args。","Promise 已落定後再次 resolve 或 reject 不會改變結果，但清除計時器較省資源。"],
  check: { kind: 'script', cases: [
    { run: "const f=timeLimit(async n=>n*n,30); return await f(5)", out: 25 },
    { run: "const f=timeLimit(async()=>{await new Promise(r=>setTimeout(r,30));return 1},5); try{await f();return \"錯\"}catch(e){return e}", out: "Time Limit Exceeded" },
    { run: "const f=timeLimit(async()=>{throw \"原錯誤\"},30); try{await f();return \"錯\"}catch(e){return e}", out: "原錯誤" },
  ] },
}

