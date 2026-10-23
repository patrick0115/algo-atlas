import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2665. Counter II
export const q2665: Solution = {
  id: 2665,
  languages: ['javascript'],
  plain: "小計數器有三個按鈕：加一、減一，以及回到出廠初值。",
  statement: "createCounter(init) 回傳含 increment、decrement、reset 三個函式的物件；它們分別更新目前值並回傳更新後的值。reset 回到最初的 init。",
  examples: [{"input":"init=5；increment、reset、decrement","output":"[6,5,4]"},{"input":"init=0；increment、increment、reset","output":"[1,2,0]"}],
  constraints: ["初值介於 -1000 到 1000。","最多 1000 次操作，三個方法共用一份狀態。"],
  insight: ["目前值要放在 createCounter 的閉包裡，三個方法才會共享。","reset 要用固定的 init，不能用目前值。"],
  approaches: [
    {
      name: "可變目前值",
      idea: "外層存 value，三個方法各自修改它。",
      steps: ["令 value=init","increment 先加一再回傳","decrement 先減一再回傳","reset 指派 init 再回傳"],
      figure: { title: "按鈕更新狀態", steps: [
        { note: "起點 5，按加一成 6。", views: [arr([5,6], { label: "狀態", highlight: [1] })] },
        { note: "重設回 5，再減一成 4。", views: [arr([6,5,4], { label: "狀態", done: [2] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "每個操作僅更新一個數值。" },
      verdict: "最符合題意，適合說明閉包。",
      code: { javascript: "var createCounter = function(init) {\n  let value = init;\n  return {\n    increment() { return ++value; },\n    decrement() { return --value; },\n    reset() { value = init; return value; }\n  };\n};" },
    },
    {
      name: "保存相對位移",
      idea: "只記錄目前值與 init 的差，重設時把差設回零。",
      steps: ["令 offset=0","加減按鈕修改 offset","回傳 init+offset","reset 令 offset=0"],
      figure: { title: "初值加位移", steps: [
        { note: "init=5、位移 1，值是 6。", views: [arr([5,1,6], { label: "計算", highlight: [2] })] },
        { note: "位移歸零後值又是 5。", views: [arr([5,0,5], { label: "重設", done: [2] })] },
      ] },
      complexity: { time: "每次 O(1)", space: "O(1)", why: "只保存一個相對位移。" },
      verdict: "也正確，但比直接保存目前值多一道心算。",
      code: { javascript: "var createCounter = function(init) {\n  let offset = 0;\n  return {\n    increment() { return init + ++offset; },\n    decrement() { return init + --offset; },\n    reset() { offset = 0; return init; }\n  };\n};" },
    },
  ],
  pitfalls: ["increment 與 decrement 要先改再回傳。","reset 回到原始 init，不是 0。","每次 createCounter 都應有獨立狀態。"],
  check: { kind: 'script', cases: [
    { run: "const c=createCounter(5);return [c.increment(),c.reset(),c.decrement()]", out: [6,5,4] },
    { run: "const c=createCounter(0);return [c.increment(),c.increment(),c.decrement(),c.reset(),c.reset()]", out: [1,2,1,0,0] },
    { run: "const a=createCounter(1),b=createCounter(9);return [a.increment(),b.decrement(),a.increment()]", out: [2,8,3] },
  ] },
}

