import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2693. Call Function with Custom Context
export const q2693: Solution = {
  id: 2693,
  languages: ['javascript'],
  plain: "把函式借給指定物件執行，讓函式裡的 this 指向那個物件。",
  statement: "替所有函式加入 callPolyfill(obj,...args) 方法，使 obj 成為原函式執行時的 this，後續參數依序傳入；不能使用內建 Function.call。",
  examples: [{"input":"function add(b){return this.a+b}，obj={a:5}，b=7","output":"12"},{"input":"function f(){return this.x}，obj={x:3}","output":"3"}],
  constraints: ["obj 是非 null 的物件。","參數總數為 1 到 100；原函式可能依賴 this。"],
  insight: ["方法形式呼叫 obj[key](...) 時，函式內 this 就是 obj。","用 Symbol 作暫時鍵，不容易撞到原物件的鍵，並在執行後清除。","Reflect.apply 也能指定 this，且不使用被禁止的 Function.call。"],
  approaches: [
    {
      name: "暫掛 Symbol 方法",
      idea: "將原函式短暫放到 obj 上，以方法形式呼叫再刪除。",
      steps: ["建立唯一 Symbol 鍵","把 this 指向的原函式掛到 obj","用 obj[key](...args) 執行","finally 刪除暫時鍵"],
      figure: { title: "this 指到 obj", steps: [
        { note: "obj 有 a=5，暫掛 add。", views: [arr(["obj","add","7"], { label: "呼叫資訊", highlight: [0] })] },
        { note: "以方法形式執行，得到 5+7=12。", views: [arr([5,7,12], { label: "計算", done: [2] })] },
      ] },
      complexity: { time: "O(K)", space: "O(1)", why: "K 是參數數量；展開參數時需傳遞 K 個值。" },
      verdict: "展示 JavaScript 方法呼叫如何決定 this。",
      code: { javascript: "Function.prototype.callPolyfill = function(obj, ...args) {\n  const key = Symbol('temporary');\n  obj[key] = this;\n  try {\n    return obj[key](...args);\n  } finally {\n    delete obj[key];\n  }\n};" },
    },
    {
      name: "Reflect.apply",
      idea: "使用反射 API 直接指定原函式、this 與參數陣列。",
      steps: ["取得 this 指向的原函式","將 obj 與剩餘參數交給 Reflect.apply","回傳執行結果"],
      figure: { title: "直接設定執行環境", steps: [
        { note: "原函式需要讀取 this.a。", views: [arr(["函式","obj","參數"], { label: "三部分", highlight: [1] })] },
        { note: "Reflect.apply 以 obj 作 this，得到 12。", views: [arr([5,7,12], { label: "計算", done: [2] })] },
      ] },
      complexity: { time: "O(K)", space: "O(K)", why: "K 個參數由剩餘參數陣列保存並傳入。" },
      verdict: "程式短，也不會短暫修改 obj。",
      code: { javascript: "Function.prototype.callPolyfill = function(obj, ...args) {\n  return Reflect.apply(this, obj, args);\n};" },
    },
  ],
  pitfalls: ["不要寫 fn(obj,...args)，那只會把 obj 當第一個參數。","不能使用 Function.call。","暫掛方法要用 finally 清理，即使原函式丟錯也不能留下鍵。"],
  check: { kind: 'script', cases: [
    { run: "function add(b){return this.a+b};return add.callPolyfill({a:5},7)", out: 12 },
    { run: "function f(a,b){return this.x+a+b};return f.callPolyfill({x:3},4,5)", out: 12 },
    { run: "function f(){return this.x};const o={x:7};const v=f.callPolyfill(o);return [v,Reflect.ownKeys(o).length]", out: [7,1] },
  ] },
}

