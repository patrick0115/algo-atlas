import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 746. Min Cost Climbing Stairs

const C = [10, 15, 20, 5, 1]

function recFig(): FigStep[] {
  // f(i) = 站上第 i 階之後,走到頂端還要花的最少錢 = cost[i] + min(f(i+1), f(i+2));i ≥ n 時是 0
  const nodes: RNode[] = []
  const notes: string[] = []
  const n = C.length
  const go = (i: number, parent: number) => {
    nodes.push({ parent, label: i >= n ? '頂' : `f(${i})`, kind: i >= n ? 'ok' : undefined })
    notes.push(i >= n ? '已經到頂端了,不用再花錢 → 0' : `f(${i}) = cost[${i}] + min(f(${i + 1}), f(${i + 2})):要先算兩個子問題`)
    if (i >= n) return
    const id = nodes.length - 1
    go(i + 1, id)
    go(i + 2, id)
  }
  go(1, -1)
  const pos = recLayout(nodes)
  const steps = nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '遞迴樹(從第 1 階出發的那一半)')] }))
  steps.push({ note: '同一個 f(i) 被算了很多次(例如 f(3)、f(4))。加上記憶化(算過就存起來)就只要算 n 次', views: [recView(nodes, pos, nodes.length - 1, '遞迴樹:重複的子問題很多')] })
  return steps
}

function dpFig(): FigStep[] {
  const n = C.length
  const dp: (number | string)[] = Array(n + 1).fill('?')
  dp[0] = 0
  dp[1] = 0
  const out: FigStep[] = [{ note: 'dp[i] = 走到「第 i 階」(還沒付第 i 階的錢)最少要花多少。可以從第 0 或第 1 階開始,所以 dp[0] = dp[1] = 0。頂端是第 n 階', views: [arr(C, { label: 'cost' }), arr(dp, { label: 'dp(最後一格是頂端)' })] }]
  for (let i = 2; i <= n; i++) {
    const a = (dp[i - 1] as number) + C[i - 1]
    const b = (dp[i - 2] as number) + C[i - 2]
    dp[i] = Math.min(a, b)
    out.push({ note: `dp[${i}] = min(從第 ${i - 1} 階走一步:${dp[i - 1]} + ${C[i - 1]} = ${a}, 從第 ${i - 2} 階跨兩步:${dp[i - 2]} + ${C[i - 2]} = ${b}) = ${dp[i]}`, views: [arr(C, { label: 'cost', compare: [i - 1, i - 2] }), arr(dp, { label: 'dp', highlight: [i], done: range(0, i - 1) })] })
  }
  out.push({ note: `dp[${n}](頂端)= ${dp[n]} 就是答案。每一格只用到前兩格,所以兩個變數就夠了`, views: [arr(dp, { label: 'dp', done: [n] })] })
  return out
}

export const q0746: Solution = {
  id: 746,
  plain: '爬樓梯,每一階有過路費;付了這一階的錢,就可以往上走 1 階或 2 階。可以從第 0 階或第 1 階開始,要走到最上面(超過最後一階),最少要花多少錢?',
  statement: '`cost[i]` 是踩在第 i 階要付的錢。付完後可以爬 1 或 2 階。可以從第 0 階或第 1 階出發,回傳到達樓頂(第 n 階,在最後一階之上)的最少花費。',
  examples: [
    { input: 'cost = [10,15,20]', output: '15', note: '從第 1 階出發,付 15,跨兩階到頂' },
    { input: 'cost = [1,100,1,1,1,100,1,1,100,1]', output: '6' },
  ],
  constraints: ['`2 ≤ n ≤ 1000`'],
  insight: [
    '走到第 i 階,上一步一定是從 i − 1(走一步)或 i − 2(跨兩步)來的 —— 只有兩種可能',
    '所以「到第 i 階的最少花費」= min(到 i−1 的花費 + cost[i−1], 到 i−2 的花費 + cost[i−2])。大問題由兩個小問題組成 → **動態規劃**',
    '直接遞迴會重複算同一個子問題(和費氏數列一樣是指數時間);記憶化或由小到大填表就變成 O(n)',
    '每一格只看前兩格 → 只要兩個變數,O(1) 空間',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i)` = 站上第 i 階後,到頂端還要花多少:`cost[i] + min(f(i+1), f(i+2))`,i ≥ n 時是 0。答案是 `min(f(0), f(1))`。用 memo 存算過的結果。',
      steps: ['`f(i)`:`i >= n` → 0', '算過 → 直接回傳 memo', '`memo[i] = cost[i] + min(f(i + 1), f(i + 2))`', '回傳 `min(f(0), f(1))`'],
      figure: { title: `cost = [${C.join(',')}]`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個 f(i) 只算一次;memo 和遞迴深度都是 n。沒有記憶化的話是 O(2ⁿ)。' },
      verdict: '最貼近「把問題拆成小問題」的思考過程。先寫出遞迴、再加記憶化,是學 DP 最自然的路。',
      code: {
        python: `from functools import lru_cache

def minCostClimbingStairs(cost):
    n = len(cost)

    @lru_cache(maxsize=None)              # 記憶化:同一個 i 只算一次
    def f(i):
        if i >= n:
            return 0
        return cost[i] + min(f(i + 1), f(i + 2))

    return min(f(0), f(1))`,
        c: `static int memo[1001], *Cost, Nn;

static int f(int i) {
    if (i >= Nn) return 0;
    if (memo[i] >= 0) return memo[i];
    int a = f(i + 1), b = f(i + 2);
    return memo[i] = Cost[i] + (a < b ? a : b);
}

int minCostClimbingStairs(int *cost, int costSize) {
    Cost = cost; Nn = costSize;
    for (int i = 0; i < costSize; i++) memo[i] = -1;
    int a = f(0), b = f(1);
    return a < b ? a : b;
}`,
        cpp: `int minCostClimbingStairs(vector<int>& cost) {
    int n = cost.size();
    vector<int> memo(n, -1);
    function<int(int)> f = [&](int i) -> int {
        if (i >= n) return 0;
        if (memo[i] >= 0) return memo[i];
        return memo[i] = cost[i] + min(f(i + 1), f(i + 2));
    };
    return min(f(0), f(1));
}`,
        java: `private int[] memo, cost;

int minCostClimbingStairs(int[] cost) {
    this.cost = cost;
    memo = new int[cost.length];
    Arrays.fill(memo, -1);
    return Math.min(f(0), f(1));
}

private int f(int i) {
    if (i >= cost.length) return 0;
    if (memo[i] >= 0) return memo[i];
    return memo[i] = cost[i] + Math.min(f(i + 1), f(i + 2));
}`,
        javascript: `function minCostClimbingStairs(cost) {
  const n = cost.length, memo = new Array(n).fill(-1);
  const f = (i) => {
    if (i >= n) return 0;
    if (memo[i] >= 0) return memo[i];
    return (memo[i] = cost[i] + Math.min(f(i + 1), f(i + 2)));
  };
  return Math.min(f(0), f(1));
}`,
      },
    },
    {
      name: '由下往上填表',
      idea: '`dp[i]` = 到達第 i 階(還沒付第 i 階)的最少花費。`dp[0] = dp[1] = 0`,`dp[i] = min(dp[i−1] + cost[i−1], dp[i−2] + cost[i−2])`。答案 `dp[n]`。',
      steps: ['`dp = [0] * (n + 1)`', '`for i in 2..n`:`dp[i] = min(dp[i−1] + cost[i−1], dp[i−2] + cost[i−2])`', '回傳 `dp[n]`'],
      figure: { title: `cost = [${C.join(',')}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '填 n + 1 格,每格 O(1)。' },
      verdict: '[[p:dp-1d]]的入門題。先定義清楚「dp[i] 是什麼」,轉移式就自然出來了。',
      code: {
        python: `def minCostClimbingStairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)                    # dp[i] = 到第 i 階的最少花費(可以從 0 或 1 免費開始)
    for i in range(2, n + 1):
        dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    return dp[n]`,
        c: `int minCostClimbingStairs(int *cost, int costSize) {
    int dp[1001];
    dp[0] = dp[1] = 0;
    for (int i = 2; i <= costSize; i++) {
        int a = dp[i - 1] + cost[i - 1], b = dp[i - 2] + cost[i - 2];
        dp[i] = a < b ? a : b;
    }
    return dp[costSize];
}`,
        cpp: `int minCostClimbingStairs(vector<int>& cost) {
    int n = cost.size();
    vector<int> dp(n + 1, 0);
    for (int i = 2; i <= n; i++) dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
    return dp[n];
}`,
        java: `int minCostClimbingStairs(int[] cost) {
    int n = cost.length;
    int[] dp = new int[n + 1];
    for (int i = 2; i <= n; i++) dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
    return dp[n];
}`,
        javascript: `function minCostClimbingStairs(cost) {
  const n = cost.length, dp = new Array(n + 1).fill(0);
  for (let i = 2; i <= n; i++) dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
  return dp[n];
}`,
      },
    },
    {
      name: '只留兩個變數',
      idea: 'dp[i] 只用到 dp[i−1] 和 dp[i−2],用兩個變數 `a`(dp[i−2])、`b`(dp[i−1])滾動前進。',
      steps: ['`a = b = 0`', '`for i in 2..n`:`a, b = b, min(b + cost[i−1], a + cost[i−2])`', '回傳 `b`'],
      figure: { title: `cost = [${C.join(',')}]`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用兩個變數。' },
      verdict: '最佳解。「只看前幾格」的 DP 都可以這樣壓縮空間,[70](#/p/dp-1d)、198 都是。',
      code: {
        python: `def minCostClimbingStairs(cost):
    a = b = 0                             # a = dp[i-2], b = dp[i-1]
    for i in range(2, len(cost) + 1):
        a, b = b, min(b + cost[i - 1], a + cost[i - 2])
    return b`,
        c: `int minCostClimbingStairs(int *cost, int costSize) {
    int a = 0, b = 0;
    for (int i = 2; i <= costSize; i++) {
        int x = b + cost[i - 1], y = a + cost[i - 2];
        a = b;
        b = x < y ? x : y;
    }
    return b;
}`,
        cpp: `int minCostClimbingStairs(vector<int>& cost) {
    int a = 0, b = 0;
    for (size_t i = 2; i <= cost.size(); i++) {
        int c = min(b + cost[i - 1], a + cost[i - 2]);
        a = b;
        b = c;
    }
    return b;
}`,
        java: `int minCostClimbingStairs(int[] cost) {
    int a = 0, b = 0;
    for (int i = 2; i <= cost.length; i++) {
        int c = Math.min(b + cost[i - 1], a + cost[i - 2]);
        a = b;
        b = c;
    }
    return b;
}`,
        javascript: `function minCostClimbingStairs(cost) {
  let a = 0, b = 0;
  for (let i = 2; i <= cost.length; i++) [a, b] = [b, Math.min(b + cost[i - 1], a + cost[i - 2])];
  return b;
}`,
      },
    },
  ],
  pitfalls: [
    '頂端是第 n 階(最後一階再上去一格),不是最後一階本身:`[10, 15, 20]` 不用付 20',
    'dp 的定義搞混:「到達 i 時已經付了 cost[i]」和「還沒付」兩種定義的初始值、答案位置都不一樣,挑一種寫清楚',
    '直接遞迴不記憶化:n = 1000 時是 2¹⁰⁰⁰ 次呼叫',
  ],
  followUp: [{ q: '只問有幾種爬法?', a: '[70. Climbing Stairs](#/q/70):dp[i] = dp[i−1] + dp[i−2](費氏數列),見[[p:dp-1d]]。' }],
  check: {
    kind: 'fn',
    fn: 'minCostClimbingStairs',
    cases: [
      { args: [[10, 15, 20]], out: 15 },
      { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], out: 6 },
      { args: [C], out: 20 },
      { args: [[0, 0]], out: 0 },
      { args: [[5, 3]], out: 3 },
    ],
  },
}
