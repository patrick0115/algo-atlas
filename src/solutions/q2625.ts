import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2625. Flatten Deeply Nested Array
export const q2625: Solution = {
  id: 2625,
  languages: ['javascript'],
  plain: "像拆禮物盒一樣，把多層陣列最多拆開 n 層；還沒輪到的內盒原樣保留。",
  statement: "給巢狀整數陣列 arr 與深度 n，依原本順序攤平最多 n 層，不能使用 Array.flat。n 為 0 時不拆任何一層。",
  examples: [{"input":"arr=[1,[2,[3]],4], n=1","output":"[1,2,[3],4]"},{"input":"arr=[[1],[],[2,[3]]], n=2","output":"[1,2,3]"}],
  constraints: ["數字與子陣列各最多 10⁵ 個；巢狀深度及 n 最多 1000。","空陣列不產生元素，輸出仍須維持原本順序。"],
  insight: ["遇到子陣列且已拆層數小於 n，才繼續走入。","達到上限後，整個子陣列當成一個元素放入答案。"],
  approaches: [
    {
      name: "遞迴走訪",
      idea: "函式帶著已拆層數；可拆就遞迴，不可拆就直接加入。",
      steps: ["建立答案陣列","依序檢查每個元素","子陣列且深度未達 n 就遞迴","否則直接加入"],
      figure: { title: "只拆一層", steps: [
        { note: "外層遇到 [2,[3]]，還能拆。", views: [arr(["1","[2,[3]]","4"], { label: "輸入", highlight: [1] })] },
        { note: "下一層的 [3] 留在答案內。", views: [arr(["1","2","[3]","4"], { label: "輸出", done: [2] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N+d)", why: "N 是數字和子陣列總數，d 是遞迴深度；答案也占空間。" },
      verdict: "容易理解，極深輸入可能碰到呼叫堆疊限制。",
      code: { javascript: "var flat = function(arr, n) {\n  const out = [];\n  function visit(list, depth) {\n    for (const item of list) {\n      if (Array.isArray(item) && depth < n) visit(item, depth + 1);\n      else out.push(item);\n    }\n  }\n  visit(arr, 0);\n  return out;\n};" },
    },
    {
      name: "顯式堆疊",
      idea: "自己記錄待走訪項目與深度，避免深層遞迴爆堆疊。",
      steps: ["頂層元素倒序放入堆疊","取出一項；可拆的子陣列倒序放回","其他值放入答案"],
      figure: { title: "堆疊維持順序", steps: [
        { note: "先處理最左邊的 1。", views: [arr(["1","[2,[3]]","4"], { label: "待處理", highlight: [0] })] },
        { note: "展開後先處理 2，保留 [3]。", views: [arr(["1","2","[3]","4"], { label: "輸出", done: [1] })] },
      ] },
      complexity: { time: "O(N)", space: "O(N)", why: "每個項目進出堆疊至多一次；答案與堆疊占空間。" },
      verdict: "能安全處理很深的巢狀陣列。",
      code: { javascript: "var flat = function(arr, n) {\n  const out = [], stack = [];\n  for (let i = arr.length - 1; i >= 0; i--) stack.push([arr[i], 0]);\n  while (stack.length) {\n    const [item, depth] = stack.pop();\n    if (Array.isArray(item) && depth < n) {\n      for (let i = item.length - 1; i >= 0; i--) stack.push([item[i], depth + 1]);\n    } else out.push(item);\n  }\n  return out;\n};" },
    },
  ],
  pitfalls: ["判斷是 depth < n，不能多拆一層。","不能用 flat；也不要把數字 0 誤認為空值。","堆疊展開時要倒序放入，才能維持左到右。"],
  check: { kind: 'script', cases: [
    { run: "return flat([1,[2,[3]],4],1)", out: [1,2,[3],4] },
    { run: "return flat([[1],[],[2,[3]]],2)", out: [1,2,3] },
    { run: "return flat([1,[2]],0)", out: [1,[2]] },
    { run: "return flat([],10)", out: [] },
  ] },
}

