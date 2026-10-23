import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 2623. Memoize
export const q2623: Solution = {
  id: 2623,
  languages: ['javascript'],
  plain: '把算過的答案貼在便條紙上；下次收到一模一樣的參數就直接查便條紙，不再重算。',
  statement: '給定函式 fn，回傳帶快取的函式。相同順序、相同數值的參數組合只呼叫 fn 一次；(2,3) 與 (3,2) 是不同輸入。',
  examples: [{ input: 'sum(2,2)，再 sum(2,2)', output: '都回傳 4，原函式只執行 1 次' }, { input: 'sum(2,3)，再 sum(3,2)', output: '都回傳 5，原函式執行 2 次' }],
  constraints: ['題目中的 fn 為 sum、fib 或 factorial，參數都是整數。', '可能有大量呼叫，查快取應接近常數時間。'],
  insight: ['快取要留在回傳函式的閉包中，每個 memoize(fn) 有自己的快取。', '快取鍵須保留參數順序，不能把兩個參數排序。', '即使答案是 0，也應用 has() 判斷是否命中。'],
  approaches: [
    {
      name: '序列化參數做鍵',
      idea: '把參數陣列轉成 JSON 字串，用 Map 保存答案。',
      steps: ['在外層建立 Map', '內層把 args 序列化作為 key', '若 Map 已有該 key，直接回傳快取值', '否則呼叫 fn、存入並回傳'],
      figure: { title: '重複輸入直接命中', steps: [
        { note: '第一次呼叫 (2,3)，計算 5 並存成鍵 [2,3]。', views: [arr(['A', 'B'], { label: 'A=[2,3]，B=[3,2]', done: [0] })] },
        { note: '再呼叫 (2,3) 命中；(3,2) 仍是另一個鍵。', views: [arr(['A', 'B'], { label: 'A=[2,3]，B=[3,2]', highlight: [1] })] },
      ] },
      complexity: { time: '每次 O(k)', space: 'O(mk)', why: 'k 是參數個數，m 是不同的輸入組合；建立 JSON 鍵需走訪參數。' },
      verdict: '題目參數都是整數，因此 JSON 鍵簡單可靠。',
      code: { javascript: `function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const value = fn(...args);
    cache.set(key, value);
    return value;
  };
}` },
    },
    {
      name: '巢狀 Map 保存參數',
      idea: '每一層 Map 對應一個參數，最後一層保存答案。',
      steps: ['建立根 Map 與答案用的特殊 Symbol 鍵', '依參數順序逐層尋找或建立 Map', '到最後一層查答案；沒有才呼叫 fn 並存入'],
      figure: { title: '參數順序形成路徑', steps: [
        { note: '(2,3) 的路徑先走 2，再走 3。', views: [arr([2, 3], { label: '路徑', done: [0] })] },
        { note: '(3,2) 的第一步已不同，因此不會誤命中。', views: [arr([3, 2], { label: '另一條路徑', highlight: [0] })] },
      ] },
      complexity: { time: '每次 O(k)', space: 'O(mk)', why: '每個參數走一層 Map，最多保存 m 條長 k 的路徑。' },
      verdict: '不需要序列化，對未來擴充非整數參數也較方便。',
      code: { javascript: `function memoize(fn) {
  const root = new Map();
  const resultKey = Symbol('result');
  return function(...args) {
    let node = root;
    for (const arg of args) {
      if (!node.has(arg)) node.set(arg, new Map());
      node = node.get(arg);
    }
    if (node.has(resultKey)) return node.get(resultKey);
    const value = fn(...args);
    node.set(resultKey, value);
    return value;
  };
}` },
    },
  ],
  pitfalls: ['不要用 `cache.get(key) || fn(...)`，答案 0 會被重算。', '不要把參數排序，(a,b) 與 (b,a) 需分開。', '只有原函式的直接呼叫被快取；原函式內自行遞迴仍照原本方式執行。'],
  check: { kind: 'script', cases: [
    { run: 'let calls=0; const f=memoize((a,b)=>{calls++;return a+b}); return [f(2,2),f(2,2),calls,f(1,2),calls]', out: [4,4,1,3,2] },
    { run: 'let calls=0; const f=memoize((a,b)=>{calls++;return a+b}); return [f(2,3),f(3,2),calls]', out: [5,5,2] },
    { run: 'let calls=0; const f=memoize(n=>{calls++;return n===0?0:n*n}); return [f(0),f(0),calls]', out: [0,0,1] },
    { run: 'let calls=0; const f=memoize(n=>{calls++;return n<=1?1:n*6}); return [f(3),f(3),calls]', out: [18,18,1] },
  ] },
}
