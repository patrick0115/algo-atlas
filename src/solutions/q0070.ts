import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 70. Climbing Stairs

const N = 5

function recFig(): FigStep[] {
  const nodes: RNode[] = []
  const go = (n: number, parent: number) => {
    nodes.push({ parent, label: `f(${n})`, kind: n <= 1 ? 'ok' : undefined })
    if (n <= 1) return
    const id = nodes.length - 1
    go(n - 1, id)
    go(n - 2, id)
  }
  go(N, -1)
  const pos = recLayout(nodes)
  const cnt = new Map<string, number>()
  nodes.forEach((n) => cnt.set(String(n.label), (cnt.get(String(n.label)) ?? 0) + 1))
  return [
    { note: `f(n) = 爬到第 n 階的方法數。最後一步要嘛跨 1 階(從 n−1 上來)、要嘛跨 2 階(從 n−2 上來),所以 f(n) = f(n−1) + f(n−2),f(0) = f(1) = 1`, views: [recView(nodes, pos, 0, '遞迴樹')] },
    { note: `直接遞迴的樹長這樣:f(3) 被算了 ${cnt.get('f(3)')} 次、f(2) ${cnt.get('f(2)')} 次……n 每大 1,樹大約變成 1.6 倍 → O(2ⁿ)`, views: [recView(nodes, pos, nodes.length - 1, '遞迴樹(重複的子問題很多)')] },
    { note: '加上記憶化:每個 f(i) 第一次算完就存起來,之後直接拿。只剩 n 個不同的子問題 → O(n)', views: [arr(range(0, N).map((i) => `f(${i})`), { label: '只需要算這幾個' })] },
  ]
}

function dpFig(): FigStep[] {
  const dp: (number | string)[] = Array(N + 1).fill('?')
  dp[0] = 1
  dp[1] = 1
  const out: FigStep[] = [{ note: 'dp[i] = 爬到第 i 階的方法數。dp[0] = 1(站在地上,什麼都不做也算一種)、dp[1] = 1', views: [arr(dp, { label: 'dp' })] }]
  for (let i = 2; i <= N; i++) {
    dp[i] = (dp[i - 1] as number) + (dp[i - 2] as number)
    out.push({ note: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}(最後一步跨 1 階的 + 最後一步跨 2 階的)`, views: [arr(dp, { label: 'dp', highlight: [i], compare: [i - 1, i - 2] })] })
  }
  out.push({ note: `答案 dp[${N}] = ${dp[N]}。這就是費氏數列`, views: [arr(dp, { label: 'dp', done: [N] })] })
  return out
}

export const q0070: Solution = {
  id: 70,
  plain: '爬一座 n 階的樓梯,每次可以爬 1 階或 2 階,問總共有幾種不同的爬法。關鍵:走到第 n 階的最後一步,只可能是從 n−1 或 n−2 上來的。',
  statement: '爬到 n 階的樓頂,每次可以爬 1 或 2 階。回傳有幾種不同的方法。',
  examples: [
    { input: 'n = 2', output: '2', note: '1+1、2' },
    { input: 'n = 3', output: '3', note: '1+1+1、1+2、2+1' },
  ],
  constraints: ['`1 ≤ n ≤ 45` → 答案最大約 18 億,int 放得下;直接遞迴 2⁴⁵ 會超時'],
  insight: [
    '列舉所有爬法太多了。換個角度:**最後一步**只有兩種 —— 從 n−1 跨 1 階,或從 n−2 跨 2 階',
    '所以 `f(n) = f(n−1) + f(n−2)`:這就是費氏數列。大問題 = 兩個小問題的和 → **動態規劃**',
    '直接照公式遞迴會重複算同一個 f(i) 非常多次;記住算過的(記憶化),或從小到大填表,就是 O(n)',
    '每次只需要前兩個數 → 兩個變數就夠',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(n) = f(n−1) + f(n−2)`,`f(0) = f(1) = 1`。用 memo 記住算過的結果。',
      steps: ['`f(n)`:`n <= 1` → 1', '算過 → 回傳 memo[n]', '`memo[n] = f(n − 1) + f(n − 2)`'],
      figure: { title: `n = ${N}`, steps: recFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個 f(i) 算一次;memo 和遞迴深度各 O(n)。不記憶化是 O(1.6ⁿ)。' },
      verdict: '把「拆成子問題」直接寫成程式,再加上記憶化 —— 這是寫任何 DP 最自然的第一步。',
      code: {
        python: `from functools import lru_cache

def climbStairs(n):
    @lru_cache(maxsize=None)
    def f(i):
        if i <= 1:
            return 1
        return f(i - 1) + f(i - 2)        # 最後一步跨 1 階或 2 階
    return f(n)`,
        c: `static int memo[46];

static int f(int i) {
    if (i <= 1) return 1;
    if (memo[i]) return memo[i];
    return memo[i] = f(i - 1) + f(i - 2);
}

int climbStairs(int n) {
    memset(memo, 0, sizeof(memo));
    return f(n);
}`,
        cpp: `int climbStairs(int n) {
    vector<int> memo(n + 1, 0);
    function<int(int)> f = [&](int i) -> int {
        if (i <= 1) return 1;
        if (memo[i]) return memo[i];
        return memo[i] = f(i - 1) + f(i - 2);
    };
    return f(n);
}`,
        java: `private int[] memo;

int climbStairs(int n) {
    memo = new int[n + 1];
    return f(n);
}

private int f(int i) {
    if (i <= 1) return 1;
    if (memo[i] != 0) return memo[i];
    return memo[i] = f(i - 1) + f(i - 2);
}`,
        javascript: `function climbStairs(n) {
  const memo = new Array(n + 1).fill(0);
  const f = (i) => {
    if (i <= 1) return 1;
    if (memo[i]) return memo[i];
    return (memo[i] = f(i - 1) + f(i - 2));
  };
  return f(n);
}`,
      },
    },
    {
      name: '由下往上填表',
      idea: '`dp[0] = dp[1] = 1`,`dp[i] = dp[i−1] + dp[i−2]`,一路填到 dp[n]。',
      steps: ['`dp = [1, 1, 0, …]`', '`for i in 2..n`:`dp[i] = dp[i−1] + dp[i−2]`', '回傳 `dp[n]`'],
      figure: { title: `n = ${N}`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '填 n + 1 格。' },
      verdict: '[[p:dp-1d]]最基本的形式。',
      code: {
        python: `def climbStairs(n):
    dp = [1] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
        c: `int climbStairs(int n) {
    int dp[46];
    dp[0] = dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}`,
        cpp: `int climbStairs(int n) {
    vector<int> dp(n + 1, 1);
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}`,
        java: `int climbStairs(int n) {
    int[] dp = new int[n + 1];
    dp[0] = 1;
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}`,
        javascript: `function climbStairs(n) {
  const dp = new Array(n + 1).fill(1);
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}`,
      },
    },
    {
      name: '兩個變數滾動',
      idea: '只保留前兩個數:`a = dp[i−2]`、`b = dp[i−1]`,每一步 `a, b = b, a + b`。',
      steps: ['`a = b = 1`', '重複 n − 1 次:`a, b = b, a + b`', '回傳 `b`'],
      figure: { title: `n = ${N}`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只用兩個變數。' },
      verdict: '最佳解。(進階:用矩陣快速冪可以到 O(log n),但這題 n ≤ 45 不需要。)',
      code: {
        python: `def climbStairs(n):
    a = b = 1                             # a = dp[i-2], b = dp[i-1]
    for _ in range(n - 1):
        a, b = b, a + b
    return b`,
        c: `int climbStairs(int n) {
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
        cpp: `int climbStairs(int n) {
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
        java: `int climbStairs(int n) {
    int a = 1, b = 1;
    for (int i = 2; i <= n; i++) { int c = a + b; a = b; b = c; }
    return b;
}`,
        javascript: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}`,
      },
    },
  ],
  pitfalls: [
    '直接遞迴不記憶化:n = 45 要呼叫上億次,會超時',
    'dp[0] 的意義:「0 階」有 1 種爬法(什麼都不做),設成 0 的話 dp[2] 會算成 1',
    '迴圈範圍差一:兩個變數版本要做 n − 1 次',
  ],
  followUp: [
    { q: '每次可以爬 1、2 或 3 階?', a: 'f(n) = f(n−1) + f(n−2) + f(n−3),同樣的寫法多一項。' },
    { q: '每一階有花費,要最便宜?', a: '[746. Min Cost Climbing Stairs](#/q/746):把「加總方法數」改成「取最小花費」。' },
  ],
  check: {
    kind: 'fn',
    fn: 'climbStairs',
    cases: [
      { args: [2], out: 2 },
      { args: [3], out: 3 },
      { args: [1], out: 1 },
      { args: [N], out: 8 },
      { args: [45], out: 1836311903 },
    ],
  },
}
