import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2627. Debounce
export const q2627: Solution = {
  id: 2627,
  languages: ['javascript'],
  plain: "像輸入框停止打字後才搜尋：每次再輸入都重新倒數，只執行最後一次。",
  statement: "給函式 fn 與等待時間 t，回傳防抖函式。每次呼叫都取消先前尚未執行的排程，並安排 t 毫秒後用本次參數呼叫 fn。",
  examples: [{"input":"t=50，時刻 0 呼叫(1)，時刻 20 呼叫(2)","output":"約時刻 70 才執行 fn(2)"},{"input":"t=20，時刻 0 呼叫(1)，時刻 40 呼叫(2)","output":"兩次皆執行"}],
  constraints: ["0 ≤ t ≤ 1000 毫秒；最多 10 次呼叫。","每次呼叫的參數可能不同，要保留最新一次的參數。"],
  insight: ["setTimeout 回傳計時器代號，clearTimeout 可取消尚未執行的排程。","計時器代號需留在閉包，讓下一次呼叫找得到。"],
  approaches: [
    {
      name: "取消舊計時器",
      idea: "每次呼叫先取消前一筆，再建立新計時器。",
      steps: ["外層保存 timer","內層先 clearTimeout(timer)","以本次 args 安排 setTimeout"],
      figure: { title: "重新倒數", steps: [
        { note: "時刻 0 的呼叫排在 50。", views: [arr(["0","20","50","70"], { label: "時間軸", highlight: [2] })] },
        { note: "時刻 20 重排，只有 70 執行。", views: [arr(["0","20","50","70"], { label: "時間軸", done: [3] })] },
      ] },
      complexity: { time: "呼叫 O(1)", space: "O(1)", why: "每次只取消與新增一個計時器，閉包保存一個代號。" },
      verdict: "最直接，也能避免舊排程一直等待。",
      code: { javascript: "var debounce = function(fn, t) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), t);\n  };\n};" },
    },
    {
      name: "版本號辨識最新呼叫",
      idea: "每次呼叫增加版本，計時器到時只讓目前版本執行。",
      steps: ["外層保存版本號","每次呼叫加一並記住自己的版本","到時比較版本，相同才呼叫 fn"],
      figure: { title: "只認最新版本", steps: [
        { note: "第一筆拿到版本 1。", views: [arr(["1","2"], { label: "呼叫版本", highlight: [0] })] },
        { note: "第二筆變為版本 2，第一筆到時略過。", views: [arr(["1","2"], { label: "呼叫版本", done: [1] })] },
      ] },
      complexity: { time: "呼叫 O(1)", space: "O(c)", why: "c 是等待中的計時器數；每次呼叫都建立一個。" },
      verdict: "觀念清楚，但舊計時器仍會醒來檢查。",
      code: { javascript: "var debounce = function(fn, t) {\n  let version = 0;\n  return function(...args) {\n    const mine = ++version;\n    setTimeout(() => {\n      if (mine === version) fn(...args);\n    }, t);\n  };\n};" },
    },
  ],
  pitfalls: ["延遲從最後一次呼叫重新算。","不要在呼叫防抖函式的當下執行 fn。","要捕捉本次參數，避免後續呼叫覆蓋。"],
  check: { kind: 'script', cases: [
    { run: "const out=[]; const d=debounce(x=>out.push(x),20); d(1); d(2); await new Promise(r=>setTimeout(r,40)); return out", out: [2] },
    { run: "const out=[]; const d=debounce(x=>out.push(x),10); d(1); await new Promise(r=>setTimeout(r,25)); d(2); await new Promise(r=>setTimeout(r,25)); return out", out: [1,2] },
  ] },
}

