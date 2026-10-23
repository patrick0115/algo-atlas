import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1137. N-th Tribonacci Number

const N = 6

function iterFig(): FigStep[] {
  const t = [0, 1, 1]
  for (let i = 3; i <= N; i++) t.push(t[i - 1] + t[i - 2] + t[i - 3])
  return [
    { note: '泰波那契數:T0 = 0、T1 = 1、T2 = 1,之後每一項是**前三項的和**(費氏數列是前兩項)', views: [arr(t.slice(0, 3), { label: 'T0..T2' })] },
    { note: '只需要記住最近三項 a、b、c,每一步算出 a + b + c,再整體往前移一格', views: [arr(t, { label: `T0..T${N}`, highlight: [N - 3, N - 2, N - 1], done: [N] })] },
    { note: `T${N} = ${t[N - 3]} + ${t[N - 2]} + ${t[N - 1]} = ${t[N]}`, views: [arr([t[N]], { label: '答案', done: [0] })] },
  ]
}

function memoFig(): FigStep[] {
  return [
    { note: '直接照定義遞迴 T(n) = T(n−1) + T(n−2) + T(n−3) 會重複計算非常多次(指數時間)', views: [arr(['T(6)', 'T(5) T(4) T(3)', 'T(4) T(3) T(2) …'], { label: '遞迴樹' })] },
    { note: '加上記憶化:每個 T(i) 只算一次 → O(n)', views: [arr([13], { label: 'T(6)', done: [0] })] },
  ]
}

export const q1137: Solution = {
  id: 1137,
  plain: '泰波那契數列:前三項是 0、1、1,之後每一項都是前面三項的和。求第 n 項。',
  statement: '泰波那契序列定義為 T0 = 0、T1 = 1、T2 = 1,且 `T(n+3) = T(n) + T(n+1) + T(n+2)`。給 n,回傳 Tn。',
  examples: [
    { input: 'n = 4', output: '4', note: 'T3 = 2、T4 = 1 + 1 + 2' },
    { input: 'n = 25', output: '1389537' },
  ],
  constraints: ['0 ≤ n ≤ 37(答案在 32 位元內)'],
  insight: ['[[p:dp-1d]] 最基本的形式:每一項只依賴前三項', '只保留三個變數就夠', '和 [509](#/q/509) 費氏數列同一題型'],
  approaches: [
    {
      name: '三個變數迭代',
      idea: '`a, b, c = 0, 1, 1`;重複 n − 2 次 `a, b, c = b, c, a + b + c`。',
      steps: ['n == 0 → 0;n ≤ 2 → 1', '`a, b, c = 0, 1, 1`', '`for _ in range(n − 2)`:`a, b, c = b, c, a + b + c`', '回傳 c'],
      figure: { title: `n = ${N}`, steps: iterFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只有三個變數。' },
      verdict: '最推薦。',
      code: {
        python: `def tribonacci(n):
    if n == 0:
        return 0
    a, b, c = 0, 1, 1                         # T0, T1, T2
    for _ in range(n - 2):
        a, b, c = b, c, a + b + c             # 往前移一格
    return c`,
        c: `int tribonacci(int n) {
    if (n == 0) return 0;
    int a = 0, b = 1, c = 1;
    for (int i = 3; i <= n; i++) { int d = a + b + c; a = b; b = c; c = d; }
    return c;
}`,
        cpp: `int tribonacci(int n) {
    if (n == 0) return 0;
    int a = 0, b = 1, c = 1;
    for (int i = 3; i <= n; i++) { int d = a + b + c; a = b; b = c; c = d; }
    return c;
}`,
        java: `int tribonacci(int n) {
    if (n == 0) return 0;
    int a = 0, b = 1, c = 1;
    for (int i = 3; i <= n; i++) { int d = a + b + c; a = b; b = c; c = d; }
    return c;
}`,
        javascript: `function tribonacci(n) {
  if (n === 0) return 0;
  let a = 0, b = 1, c = 1;
  for (let i = 3; i <= n; i++) [a, b, c] = [b, c, a + b + c];
  return c;
}`,
      },
    },
    {
      name: '記憶化遞迴',
      idea: '`T(n) = T(n−1) + T(n−2) + T(n−3)`,用陣列記住算過的值。',
      steps: ['`memo = {0: 0, 1: 1, 2: 1}`', '`T(n)`:在 memo 就回傳', '否則 `memo[n] = T(n−1) + T(n−2) + T(n−3)`'],
      figure: { title: `n = ${N}`, steps: memoFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個值算一次;遞迴深度 n。' },
      verdict: '直接翻譯定義;用來理解「記憶化 = 由上往下的 DP」。',
      code: {
        python: `from functools import lru_cache

@lru_cache(None)
def tribonacci(n):
    if n < 3:
        return 0 if n == 0 else 1
    return tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3)`,
        c: `static int memo[38];
static bool seen[38];

int tribonacci(int n) {
    if (n < 3) return n == 0 ? 0 : 1;
    if (seen[n]) return memo[n];
    seen[n] = true;
    return memo[n] = tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
}`,
        cpp: `int memo[38] = {0};

int tribonacci(int n) {
    if (n < 3) return n == 0 ? 0 : 1;
    if (memo[n]) return memo[n];
    return memo[n] = tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
}`,
        java: `int[] memo = new int[38];

int tribonacci(int n) {
    if (n < 3) return n == 0 ? 0 : 1;
    if (memo[n] != 0) return memo[n];
    return memo[n] = tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
}`,
        javascript: `const memo = new Map();

function tribonacci(n) {
  if (n < 3) return n === 0 ? 0 : 1;
  if (memo.has(n)) return memo.get(n);
  const v = tribonacci(n - 1) + tribonacci(n - 2) + tribonacci(n - 3);
  memo.set(n, v);
  return v;
}`,
      },
    },
  ],
  pitfalls: ['沒處理 n = 0、1、2', '不加記憶化直接遞迴:n = 37 要算數億次'],
  check: {
    kind: 'fn',
    fn: 'tribonacci',
    cases: [
      { args: [4], out: 4 },
      { args: [25], out: 1389537 },
      { args: [0], out: 0 },
      { args: [1], out: 1 },
      { args: [37], out: 2082876103 },
    ],
  },
}
