import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2626. Array Reduce Transformation
export const q2626: Solution = {
  id: 2626,
  languages: ['javascript'],
  plain: "拿一個累計盒從左到右走陣列，每讀到一個數就更新盒裡的值。",
  statement: "給整數陣列 nums、函式 fn 與初值 init，依序把累計值及目前元素交給 fn，最後回傳累計值；不能使用 Array.reduce。空陣列直接回傳 init。",
  examples: [{"input":"nums=[1,2,3,4], fn=(a,b)=>a+b, init=0","output":"10"},{"input":"nums=[], init=25","output":"25"}],
  constraints: ["nums 長度為 0 到 1000。","每個元素與 init 為 0 到 1000；fn 決定更新規則。"],
  insight: ["初值已經是第一個累計值，不要先取 nums[0]。","處理順序不能交換，因為 fn 不一定可交換。"],
  approaches: [
    {
      name: "for...of 累計",
      idea: "每讀到一個值便呼叫 fn 更新答案。",
      steps: ["令 acc=init","依序讀取 nums","將 acc 設為 fn(acc,目前值)","回傳 acc"],
      figure: { title: "逐項更新", steps: [
        { note: "初值為 0，先讀 1。", views: [arr(["0","1","2","3"], { label: "累計與輸入", highlight: [1] })] },
        { note: "依序加入 2、3、4，累計 3 → 6 → 10。", views: [arr(["1","3","6","10"], { label: "累計過程", done: [3] })] },
      ] },
      complexity: { time: "O(N)", space: "O(1)", why: "每個元素呼叫 fn 一次，僅保存累計值。" },
      verdict: "最容易讀懂。",
      code: { javascript: "var reduce = function(nums, fn, init) {\n  let acc = init;\n  for (const value of nums) acc = fn(acc, value);\n  return acc;\n};" },
    },
    {
      name: "索引迴圈",
      idea: "明確用索引走訪，可以看出每個位置都只處理一次。",
      steps: ["建立 acc=init","從索引 0 到 length-1 呼叫 fn","回傳 acc"],
      figure: { title: "索引從零開始", steps: [
        { note: "索引 0 對應數值 1。", views: [arr([1,2,3,4], { label: "nums", highlight: [0] })] },
        { note: "索引 3 更新後得到最後值。", views: [arr([1,2,3,4], { label: "nums", done: [3] })] },
      ] },
      complexity: { time: "O(N)", space: "O(1)", why: "走訪 N 個位置，額外只用一個累計值。" },
      verdict: "適合想明確控制索引時使用。",
      code: { javascript: "var reduce = function(nums, fn, init) {\n  let acc = init;\n  for (let i = 0; i < nums.length; i++) acc = fn(acc, nums[i]);\n  return acc;\n};" },
    },
  ],
  pitfalls: ["空陣列回傳 init，不能回傳 0。","每一步都要把上一個 fn 的回傳值帶入下一步。","不能使用內建 reduce。"],
  check: { kind: 'script', cases: [
    { run: "return reduce([1,2,3,4],(a,b)=>a+b,0)", out: 10 },
    { run: "return reduce([1,2,3,4],(a,b)=>a+b*b,100)", out: 130 },
    { run: "return reduce([],()=>0,25)", out: 25 },
    { run: "return reduce([2,3],(a,b)=>a*10+b,1)", out: 123 },
  ] },
}

