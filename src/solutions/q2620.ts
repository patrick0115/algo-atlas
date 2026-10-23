import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2620. Counter
export const q2620: Solution = {
  id: 2620,
  languages: ['javascript'],
  plain: '做一台從 n 開始的計數器，每按一次按鈕就顯示下一個數字。',
  statement: '給整數 n，回傳一個函式。第一次呼叫回傳 n，此後每次呼叫比上次多 1；不同計數器要各自記住自己的值。',
  examples: [{ input: 'n=10，連續呼叫 3 次', output: '[10,11,12]' }, { input: 'n=-2，連續呼叫 3 次', output: '[-2,-1,0]' }],
  constraints: ['-1000 ≤ n ≤ 1000。', '最多呼叫 1000 次。'],
  insight: ['回傳的函式仍然能讀取建立它時的 n，這就是閉包。', '每個 createCounter 呼叫都會有自己的一份 n。'],
  approaches: [
    {
      name: '先回傳再遞增',
      idea: '用 n++ 取得目前值，之後才加一。',
      steps: ['在外層函式保留 n', '回傳一個不收參數的函式', '內層使用 n++ 回傳舊值並更新狀態'],
      figure: { title: 'n 從 10 開始', steps: [
        { note: '第一次回傳 10，狀態更新為 11。', views: [arr([10, 11, 12], { label: '依序輸出', done: [0] })] },
        { note: '第二次回傳 11，狀態更新為 12。', views: [arr([10, 11, 12], { label: '依序輸出', done: [0, 1] })] },
        { note: '第三次回傳 12。', views: [arr([10, 11, 12], { label: '依序輸出', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(1) / 次', space: 'O(1) / 計數器', why: '只保存一個目前數字。' },
      verdict: '最短，需看懂後置遞增先取值再加一。',
      code: { javascript: `function createCounter(n) {
  return function() {
    return n++;
  };
}` },
    },
    {
      name: '分開讀取與更新',
      idea: '先保存答案，再明確把狀態加一。',
      steps: ['保留 n 作為閉包狀態', '呼叫時先將 n 存在 current', '令 n 加一，再回傳 current'],
      figure: { title: '輸出與下一狀態', steps: [
        { note: 'n=10，current 保存 10。', views: [arr([10, 11], { label: '目前 / 下一個', highlight: [0] })] },
        { note: 'n 更新為 11，但這次仍回傳 current=10。', views: [arr([10, 11], { label: '目前 / 下一個', done: [0], highlight: [1] })] },
      ] },
      complexity: { time: 'O(1) / 次', space: 'O(1) / 計數器', why: '閉包只記住一個整數。' },
      verdict: '多兩行但適合初學者追蹤狀態。',
      code: { javascript: `function createCounter(n) {
  return function() {
    const current = n;
    n = n + 1;
    return current;
  };
}` },
    },
  ],
  pitfalls: ['若先用 ++n，第一次會回傳 n+1。', '每次建立的計數器應各自保存狀態，不要放在全域變數。'],
  check: { kind: 'script', cases: [
    { run: 'const c = createCounter(10); return [c(), c(), c()]', out: [10, 11, 12] },
    { run: 'const c = createCounter(-2); return [c(), c(), c(), c(), c()]', out: [-2, -1, 0, 1, 2] },
    { run: 'const a = createCounter(1), b = createCounter(9); return [a(), b(), a(), b()]', out: [1, 9, 2, 10] },
  ] },
}
