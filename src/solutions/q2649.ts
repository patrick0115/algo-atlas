import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2649. Nested Array Generator
export const q2649: Solution = {
  id: 2649,
  languages: ['javascript'],
  plain: "沿著巢狀陣列由左往右走，遇到數字才交出；盒子本身不交出。",
  statement: "給包含整數與子陣列的多層陣列，寫 inorderTraversal 產生器，依由左到右的深度優先順序逐個 yield 整數，不必先攤平成新陣列。",
  examples: [{"input":"[[[6]],[1,3],[]]","output":"依序 6、1、3"},{"input":"[]","output":"沒有產生值"}],
  constraints: ["展開後最多 10⁵ 個整數，巢狀深度可達 10⁵。","極深巢狀可能讓遞迴超出 JavaScript 呼叫堆疊。"],
  insight: ["堆疊要保存目前陣列與下一個要看的索引。","遇到子陣列就往下一層走，遇到整數才 yield。"],
  approaches: [
    {
      name: "堆疊保存走訪位置",
      idea: "每層用一個框架記錄陣列和索引，不建立平坦副本。",
      steps: ["把根陣列與索引 0 放入堆疊","頂層若讀完就移除","讀到子陣列就加入新框架","讀到數字就 yield"],
      figure: { title: "逐層進出", steps: [
        { note: "先進入 [[6]]。", views: [arr(["[[6]]","[1,3]","[]"], { label: "外層", highlight: [0] })] },
        { note: "先交出 6，再走向 1、3。", views: [arr([6,1,3], { label: "產生順序", done: [0] })] },
      ] },
      complexity: { time: "完整走訪 O(N)", space: "O(d)", why: "N 為所有項目數，d 為巢狀深度；只保存目前路徑。" },
      verdict: "能處理非常深的輸入，也符合不建立平坦陣列的延伸要求。",
      code: { javascript: "var inorderTraversal = function*(arr) {\n  const stack = [{ list: arr, index: 0 }];\n  while (stack.length) {\n    const top = stack[stack.length - 1];\n    if (top.index >= top.list.length) {\n      stack.pop();\n      continue;\n    }\n    const item = top.list[top.index++];\n    if (Array.isArray(item)) stack.push({ list: item, index: 0 });\n    else yield item;\n  }\n};" },
    },
    {
      name: "反向推入待處理堆疊",
      idea: "子陣列的元素倒序放進堆疊，彈出順序便是原順序。",
      steps: ["根元素倒序放入堆疊","彈出一個項目","若是陣列，元素倒序放入","若是整數，就 yield"],
      figure: { title: "後進先出", steps: [
        { note: "倒序放入後最左邊元素先出。", views: [arr(["[[6]]","[1,3]","[]"], { label: "原順序", highlight: [0] })] },
        { note: "持續展開，整數順序仍是 6、1、3。", views: [arr([6,1,3], { label: "產生順序", done: [2] })] },
      ] },
      complexity: { time: "完整走訪 O(N)", space: "O(w)", why: "w 是待處理堆疊最大項目數，最壞可達 N。" },
      verdict: "實作簡短，但可能保存尚未處理的大量項目。",
      code: { javascript: "var inorderTraversal = function*(arr) {\n  const stack = [];\n  for (let i = arr.length - 1; i >= 0; i--) stack.push(arr[i]);\n  while (stack.length) {\n    const item = stack.pop();\n    if (Array.isArray(item)) {\n      for (let i = item.length - 1; i >= 0; i--) stack.push(item[i]);\n    } else yield item;\n  }\n};" },
    },
  ],
  pitfalls: ["只 yield 整數，不要 yield 子陣列。","遍歷次序要由左至右。","深度上限很大，直接遞迴可能爆堆疊。"],
  check: { kind: 'script', cases: [
    { run: "return [...inorderTraversal([[[6]],[1,3],[]])]", out: [6,1,3] },
    { run: "return [...inorderTraversal([])]", out: [] },
    { run: "return [...inorderTraversal([0,[1,[2]],3])]", out: [0,1,2,3] },
  ] },
}

