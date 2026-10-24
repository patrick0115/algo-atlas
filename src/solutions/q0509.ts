import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const F = [0, 1, 1, 2, 3, 5]

function recursionFig(): FigStep[] {
  return [
    { note: '從 F(5) 開始：它要先等 F(4) 和 F(3) 算完，才能相加。', views: [arr(F, { label: '目標 F(5)', highlight: [5] })] },
    { note: 'F(4) 又需要 F(3) 與 F(2)；同一個 F(3) 會在不同分支再算一次。', views: [arr(F, { label: '拆開 F(4)', highlight: [4], compare: [3, 2] })] },
    { note: '往下拆到 F(1)=1、F(0)=0，才有可以直接回傳的數。', views: [arr(F, { label: '遞迴邊界', done: [0, 1] })] },
    { note: '由小結果往上相加：F(2)=1、F(3)=2、F(4)=3，最後 F(5)=3+2=5。', views: [arr(F, { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

function iterationFig(): FigStep[] {
  return [
    { note: '只記住相鄰兩項：a=F(0)=0、b=F(1)=1。', views: [arr(F, { label: 'a,b', highlight: [0, 1] })] },
    { note: '往右一格：新的 b=a+b=F(2)=1；舊 b 變成新的 a。', views: [arr(F, { label: 'a,b', highlight: [1, 2], done: [0] })] },
    { note: '再往右算 F(3)=1+1=2、F(4)=1+2=3。先更新兩個變數，避免蓋掉舊值。', views: [arr(F, { label: 'a,b', highlight: [3, 4], done: [0, 1, 2] })] },
    { note: '到 F(5)=2+3=5 時，b 就是答案。', views: [arr(F, { label: 'F(5)', highlight: [5], done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q0509: Solution = {
  id: 509,
  plain: '費波那契數列從 0、1 開始，之後每一項都是前兩項相加。求第 n 項。',
  statement: '定義 F(0)=0、F(1)=1，且 n≥2 時 F(n)=F(n−1)+F(n−2)。給整數 n，回傳 F(n)。',
  examples: [
    { input: 'n = 2', output: '1' },
    { input: 'n = 3', output: '2' },
    { input: 'n = 5', output: '5', note: '0、1、1、2、3、5' },
  ],
  constraints: ['`0 ≤ n ≤ 30`'],
  insight: ['照定義遞迴最直觀，但同一個 F(k) 會被算很多遍。', '從小到大算時，只需保留前兩項，不必存整張表。這是 [[p:dp-1d]] 的空間優化。'],
  approaches: [
    {
      name: '照定義遞迴',
      idea: 'n 是 0 或 1 就直接回傳；否則分別求前兩項並相加。',
      steps: ['檢查 n 是否為 0 或 1。', '呼叫 F(n−1) 與 F(n−2)。', '把兩個結果相加。'],
      figure: { title: 'n = 5', steps: recursionFig() },
      complexity: { time: 'O(2^n)', space: 'O(n)', why: '重複展開兩個分支；最深的呼叫堆疊有 n 層。' },
      verdict: '適合理解定義，但 n 增大時重複計算很多。',
      code: {
        python: `def fib(n):
    if n < 2:
        return n  # F(0) 與 F(1) 是遞迴邊界
    return fib(n - 1) + fib(n - 2)  # 拆成前兩項`,
        c: `int fib(int n) {
    if (n < 2) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}`,
        cpp: `int fib(int n) {
    if (n < 2) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}`,
        java: `int fib(int n) {
    if (n < 2) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}`,
        javascript: `function fib(n) {
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}`,
      },
    },
    {
      name: '迭代保留前兩項',
      idea: '用 a、b 表示目前相鄰兩項，每輪同時移到下一對。',
      steps: ['令 a=0、b=1。', '重複 n 次，把 (a,b) 更新成 (b,a+b)。', '此時 a=F(n)，回傳 a。'],
      figure: { title: 'n = 5', steps: iterationFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每項只算一次，始終只用兩個變數。' },
      verdict: '實作短、沒有重複計算，是這題最實用的做法。',
      code: {
        python: `def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b  # 同時移到下一對，a 會是 F(n)
    return a`,
        c: `int fib(int n) {
    int a = 0;
    int b = 1;
    for (int i = 0; i < n; i++) {
        int next = a + b;
        a = b;
        b = next;
    }
    return a;
}`,
        cpp: `int fib(int n) {
    int a = 0;
    int b = 1;
    for (int i = 0; i < n; i++) {
        int next = a + b;
        a = b;
        b = next;
    }
    return a;
}`,
        java: `int fib(int n) {
    int a = 0;
    int b = 1;
    for (int i = 0; i < n; i++) {
        int next = a + b;
        a = b;
        b = next;
    }
    return a;
}`,
        javascript: `function fib(n) {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) {
    const next = a + b;
    a = b;
    b = next;
  }
  return a;
}`,
      },
    },
  ],
  pitfalls: ['n=0 時答案是 0，不要直接回傳初始的 b=1。', '迭代更新 a、b 時要先保留舊值，避免第二次相加用到新 a。'],
  check: { kind: 'fn', fn: 'fib', cases: [{ args: [0], out: 0 }, { args: [1], out: 1 }, { args: [2], out: 1 }, { args: [5], out: 5 }, { args: [30], out: 832040 }] },
}
