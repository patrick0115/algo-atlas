import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2695. Array Wrapper
export const q2695: Solution = {
  id: 2695,
  languages: ['javascript'],
  plain: "替整數陣列做個包裝：相加時當作所有元素總和，轉字串時印出方括號內容。",
  statement: "建立 ArrayWrapper 類別，建構子收整數陣列。兩個實例用 + 相加時得到兩邊元素總和；String(實例) 得到如 \"[1,2,3]\" 的字串。",
  examples: [{"input":"new ArrayWrapper([1,2]) + new ArrayWrapper([3,4])","output":"10"},{"input":"String(new ArrayWrapper([23,98,42]))","output":"\"[23,98,42]\""}],
  constraints: ["陣列長度可為 0 到 1000。","每個數字介於 0 到 1000；空陣列的總和是 0。"],
  insight: ["+ 運算會要求物件轉成原始值；valueOf 可提供數值。","String() 可呼叫 toString 取得字串表示。"],
  approaches: [
    {
      name: "valueOf 與 toString",
      idea: "分別定義數值轉換與字串轉換。",
      steps: ["建構子保存 nums","valueOf 累計所有元素","toString 用 join 加上方括號"],
      figure: { title: "同一物件兩種表現", steps: [
        { note: "[1,2] 當數值是 3。", views: [arr([1,2,3], { label: "加總", highlight: [2] })] },
        { note: "轉字串時呈現 [1,2]。", views: [arr(["1","2","[1,2]"], { label: "字串", done: [2] })] },
      ] },
      complexity: { time: "每次轉換 O(N)", space: "字串 O(N)", why: "數值轉換需走訪 N 項，字串要組合 N 項。" },
      verdict: "符合 JavaScript 常見物件轉型慣例。",
      code: { javascript: "var ArrayWrapper = function(nums) {\n  this.nums = nums;\n};\nArrayWrapper.prototype.valueOf = function() {\n  return this.nums.reduce((sum, n) => sum + n, 0);\n};\nArrayWrapper.prototype.toString = function() {\n  return '[' + this.nums.join(',') + ']';\n};" },
    },
    {
      name: "Symbol.toPrimitive",
      idea: "在同一個方法內依轉型提示決定回傳字串或數值。",
      steps: ["建構子保存 nums","字串提示時回傳方括號字串","其他提示時回傳元素總和"],
      figure: { title: "轉型提示決定結果", steps: [
        { note: "+ 使用數值方向，兩個總和相加。", views: [arr([3,7,10], { label: "加法", highlight: [2] })] },
        { note: "String 使用字串方向。", views: [arr(["1","2","[1,2]"], { label: "字串", done: [2] })] },
      ] },
      complexity: { time: "每次轉換 O(N)", space: "字串 O(N)", why: "需讀取 N 項來加總或串接。" },
      verdict: "集中控制轉型，適合進一步理解原始值轉換。",
      code: { javascript: "var ArrayWrapper = function(nums) {\n  this.nums = nums;\n};\nArrayWrapper.prototype[Symbol.toPrimitive] = function(hint) {\n  if (hint === 'string') return '[' + this.nums.join(',') + ']';\n  let sum = 0;\n  for (const n of this.nums) sum += n;\n  return sum;\n};" },
    },
  ],
  pitfalls: ["+ 需要數值結果，否則可能變成字串串接。","空陣列加總是 0，字串是 []。","toString 中不要多出空格。"],
  check: { kind: 'script', cases: [
    { run: "return new ArrayWrapper([1,2])+new ArrayWrapper([3,4])", out: 10 },
    { run: "return String(new ArrayWrapper([23,98,42]))", out: "[23,98,42]" },
    { run: "return [new ArrayWrapper([])+new ArrayWrapper([]),String(new ArrayWrapper([]))]", out: [0,"[]"] },
  ] },
}

