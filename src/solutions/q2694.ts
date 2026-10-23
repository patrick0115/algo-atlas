import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2694. Event Emitter
export const q2694: Solution = {
  id: 2694,
  languages: ['javascript'],
  plain: "像活動通知名單：訂閱者按加入順序收到消息，取消後就不再收到。",
  statement: "設計 EventEmitter，提供 subscribe(eventName,callback) 與 emit(eventName,args)。同一事件可有多個回呼，emit 依訂閱順序呼叫並回傳結果陣列；subscribe 回傳具 unsubscribe() 的物件，取消後不再收到事件。",
  examples: [{"input":"訂閱 A 的兩個回呼分別回傳 5、6，再 emit(\"A\")","output":"[5,6]"},{"input":"取消第一個訂閱後再次 emit(\"A\")","output":"[6]"}],
  constraints: ["操作次數為 1 到 10。","每次訂閱的回呼是不同函式；emit 的參數陣列可省略。"],
  insight: ["以事件名稱找該事件的訂閱者。","陣列或 Set 都能保留加入順序。","取消時只移除自己的回呼，不可刪掉同事件其他人的訂閱。"],
  approaches: [
    {
      name: "Map 搭配回呼陣列",
      idea: "每個事件保存一個回呼陣列，取消時尋找並移除。",
      steps: ["建立 Map","訂閱時取得或建立事件陣列並 push 回呼","退訂時找出該回呼並 splice","發送時依序呼叫並收集結果"],
      figure: { title: "通知順序", steps: [
        { note: "先訂閱回傳 5 的回呼。", views: [arr(["5","6"], { label: "訂閱順序", highlight: [0] })] },
        { note: "再訂閱回傳 6 的回呼，emit 得 [5,6]。", views: [arr(["5","6"], { label: "回傳", done: [0,1] })] },
      ] },
      complexity: { time: "subscribe O(1)、emit O(L)、unsubscribe O(L)", space: "O(S)", why: "L 是單一事件回呼數，S 是全部訂閱數。" },
      verdict: "陣列概念簡單，取消訂閱要線性尋找。",
      code: { javascript: "var EventEmitter = function() {\n  this.events = new Map();\n};\nEventEmitter.prototype.subscribe = function(eventName, callback) {\n  if (!this.events.has(eventName)) this.events.set(eventName, []);\n  const list = this.events.get(eventName);\n  list.push(callback);\n  return { unsubscribe: () => {\n    const index = list.indexOf(callback);\n    if (index !== -1) list.splice(index, 1);\n  } };\n};\nEventEmitter.prototype.emit = function(eventName, args = []) {\n  const list = this.events.get(eventName) || [];\n  return list.map(callback => callback(...args));\n};" },
    },
    {
      name: "Map 搭配 Set",
      idea: "Set 保留插入順序，並能直接刪掉指定回呼。",
      steps: ["每個事件對應一個 Set","訂閱時 add 回呼","退訂時 delete 回呼","發送時依 Set 順序執行"],
      figure: { title: "刪掉單一訂閱", steps: [
        { note: "事件 A 有兩位訂閱者。", views: [arr(["5","6"], { label: "回呼", highlight: [0,1] })] },
        { note: "取消第一位後只留下第二位。", views: [arr(["5","6"], { label: "回呼", done: [1] })] },
      ] },
      complexity: { time: "平均 subscribe/unsubscribe O(1)、emit O(L)", space: "O(S)", why: "Map 和 Set 保存每個訂閱，emit 逐一執行 L 個回呼。" },
      verdict: "退訂較快；題目保證回呼不重複，所以 Set 合適。",
      code: { javascript: "var EventEmitter = function() {\n  this.events = new Map();\n};\nEventEmitter.prototype.subscribe = function(eventName, callback) {\n  if (!this.events.has(eventName)) this.events.set(eventName, new Set());\n  const listeners = this.events.get(eventName);\n  listeners.add(callback);\n  return { unsubscribe: () => { listeners.delete(callback); } };\n};\nEventEmitter.prototype.emit = function(eventName, args = []) {\n  const out = [];\n  for (const callback of this.events.get(eventName) || []) out.push(callback(...args));\n  return out;\n};" },
    },
  ],
  pitfalls: ["emit 必須回傳各回呼的結果陣列。","沒有訂閱者時回傳 []。","同事件的回呼依訂閱順序執行。","unsubscribe 只移除那次訂閱。"],
  check: { kind: 'script', cases: [
    { run: "const e=new EventEmitter();const a=e.subscribe(\"x\",()=>5);e.subscribe(\"x\",()=>6);const before=e.emit(\"x\");a.unsubscribe();return [before,e.emit(\"x\"),e.emit(\"none\")]", out: [[5,6],[6],[]] },
    { run: "const e=new EventEmitter();e.subscribe(\"sum\",(a,b)=>a+b);return e.emit(\"sum\",[2,3])", out: [5] },
    { run: "const e=new EventEmitter();const s=e.subscribe(\"x\",()=>1);s.unsubscribe();s.unsubscribe();return e.emit(\"x\")", out: [] },
  ] },
}

