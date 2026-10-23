import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2619. Array Prototype Last
export const q2619: Solution = {
  id: 2619,
  languages: ['javascript'],
  plain: '替所有陣列加一個 last() 方法，像翻到書的最後一頁；空陣列則回傳 -1。',
  statement: '在 Array.prototype 上實作 last()，讓每個陣列都能讀取最後一個元素；長度為 0 時回傳 -1。元素可為任何 JSON 值。',
  examples: [{ input: '[null, {}, 3].last()', output: '3' }, { input: '[].last()', output: '-1' }],
  constraints: ['陣列長度可能是 0 至 1000。', '元素可為 null、物件或數字，不可用元素的真假判斷是否為空。'],
  insight: ['方法內的 this 就是呼叫 last() 的陣列。', '最後一格的索引是 length - 1；空陣列先特別處理。'],
  approaches: [
    {
      name: '用長度定位',
      idea: '直接讀取 this.length - 1 的元素。',
      steps: ['取得 this.length', '若長度為 0 回傳 -1', '否則回傳 this[this.length - 1]'],
      figure: { title: '讀取最後一格', steps: [
        { note: '陣列有 3 格，索引從 0 開始。', views: [arr(['null', '{}', 3], { label: 'arr' })] },
        { note: '最後索引是 3-1=2，讀到 3。', views: [arr(['null', '{}', 3], { label: 'arr', done: [2] })] },
      ] },
      complexity: { time: 'O(1)', space: 'O(1)', why: '只讀長度和一個索引。' },
      verdict: '最直接，對任何 JSON 元素都適用。',
      code: { javascript: `Array.prototype.last = function() {
  if (this.length === 0) return -1;
  return this[this.length - 1];
};` },
    },
    {
      name: '用 at(-1)',
      idea: 'at(-1) 可從尾端取第一個元素；空陣列則另行回傳 -1。',
      steps: ['先判斷 this.length 是否為 0', '非空時呼叫 this.at(-1)'],
      figure: { title: '負索引從尾端數', steps: [
        { note: 'at(-1) 表示從最後一格開始數。', views: [arr([1, 2, 3], { label: 'arr', highlight: [2] })] },
        { note: '取得 3；如果空陣列則由長度判斷回傳 -1。', views: [arr([1, 2, 3], { label: 'arr', done: [2] })] },
      ] },
      complexity: { time: 'O(1)', space: 'O(1)', why: '負索引同樣只需定位一個元素。' },
      verdict: '語意簡短，適合熟悉 at() 的 JavaScript 環境。',
      code: { javascript: `Array.prototype.last = function() {
  return this.length === 0 ? -1 : this.at(-1);
};` },
    },
  ],
  pitfalls: ['最後元素可以是 0、false 或 null，不能用 `this.at(-1) || -1`。', '不要寫箭頭函式；箭頭函式的 this 不會指向呼叫它的陣列。'],
  check: { kind: 'script', cases: [
    { run: 'return [null, {}, 3].last()', out: 3 },
    { run: 'return [].last()', out: -1 },
    { run: 'return [0].last()', out: 0 },
    { run: 'return [false, null].last()', out: null },
  ] },
}
