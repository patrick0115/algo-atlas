import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 322. Coin Change

const COINS = [1, 3, 4]
const AMT = 6

function dpFig(): FigStep[] {
  const dp: (number | string)[] = Array(AMT + 1).fill('∞')
  dp[0] = 0
  const out: FigStep[] = [{ note: `dp[a] = 湊出金額 a 最少要幾枚硬幣。dp[0] = 0。要湊 a,最後一枚硬幣可能是任何一種 c → dp[a] = min(dp[a − c] + 1)`, views: [arr(COINS, { label: 'coins' }), arr(dp, { label: 'dp[0..amount]' })] }]
  for (let a = 1; a <= AMT; a++) {
    const tries: string[] = []
    let best = Infinity
    let from = -1
    for (const c of COINS) {
      if (c > a || dp[a - c] === '∞') {
        tries.push(`${c}:不行`)
        continue
      }
      const v = (dp[a - c] as number) + 1
      tries.push(`${c}:dp[${a - c}]+1=${v}`)
      if (v < best) (best = v), (from = a - c)
    }
    dp[a] = best === Infinity ? '∞' : best
    out.push({ note: `dp[${a}]:最後一枚試 ${tries.join('、')} → ${dp[a]}`, views: [arr(COINS, { label: 'coins' }), arr(dp, { label: 'dp', highlight: [a], compare: from >= 0 ? [from] : [], done: range(0, a - 1) })] })
  }
  out.push({ note: `答案 dp[${AMT}] = ${dp[AMT]}(3 + 3)。注意貪心(先拿最大的 4)會得到 4 + 1 + 1 = 3 枚,不是最少`, views: [arr(dp, { label: 'dp', done: [AMT] })] })
  return out
}

function bfsFig(): FigStep[] {
  const seen = new Set([AMT])
  let level = [AMT]
  const out: FigStep[] = [{ note: '換成圖的角度:金額是節點,用一枚硬幣就從 a 走到 a − c。最少幾枚 = 從 amount 走到 0 的最短步數 → BFS', views: [arr(level, { label: '第 0 步' })] }]
  for (let step = 1; level.length; step++) {
    const next: number[] = []
    for (const a of level)
      for (const c of COINS) {
        const b = a - c
        if (b >= 0 && !seen.has(b)) {
          seen.add(b)
          next.push(b)
        }
      }
    out.push({ note: `用 ${step} 枚硬幣能到的剩餘金額:${next.join('、')}${next.includes(0) ? ` → 碰到 0 了,答案 ${step}` : ''}`, views: [arr(next, { label: `第 ${step} 步`, highlight: next.includes(0) ? [next.indexOf(0)] : [] })] })
    if (next.includes(0)) break
    level = next
  }
  return out
}

export const q0322: Solution = {
  id: 322,
  plain: '有幾種面額的硬幣(每種無限多),要湊出某個金額,**最少**要幾枚硬幣?湊不出來就回傳 −1。要小心:先拿最大面額(貪心)不一定最少。',
  statement: '`coins` 是硬幣面額(每種數量無限),回傳湊出 `amount` 所需的最少硬幣數;湊不出來回傳 -1。',
  examples: [
    { input: 'coins = [1,2,5], amount = 11', output: '3', note: '5 + 5 + 1' },
    { input: 'coins = [2], amount = 3', output: '-1' },
    { input: 'coins = [1], amount = 0', output: '0' },
  ],
  constraints: ['`1 ≤ coins.length ≤ 12`,`amount ≤ 10⁴`'],
  insight: [
    '貪心不對:`coins = [1,3,4]`、`amount = 6`,先拿 4 會變成 4+1+1(3 枚),但 3+3 只要 2 枚',
    '湊出 a 的最後一枚硬幣是某個 c,前面就是「湊出 a − c 的最少枚數」→ `dp[a] = min(dp[a − c] + 1)`。這是**完全背包**(每種硬幣可以用無限次)',
    '從 dp[0] = 0 一路填到 dp[amount];湊不出來的保持 ∞',
    '也可以看成最短路:每用一枚硬幣金額減少 c,BFS 找從 amount 到 0 的最少步數',
  ],
  approaches: [
    {
      name: '完全背包 DP',
      idea: '`dp[0] = 0`,其他是 ∞。對每個金額 a、每種硬幣 c(c ≤ a):`dp[a] = min(dp[a], dp[a − c] + 1)`。',
      steps: ['`dp = [0] + [∞] * amount`', '`for a in 1..amount`:`for c in coins`:`c <= a` → `dp[a] = min(dp[a], dp[a−c] + 1)`', '回傳 `dp[amount]`(∞ → −1)'],
      figure: { title: `coins = [${COINS}], amount = ${AMT}`, steps: dpFig() },
      complexity: { time: 'O(amount · k)', space: 'O(amount)', why: 'k 是硬幣種類數。每個金額試每種硬幣一次。' },
      verdict: '標準解,[[p:knapsack]]「完全背包求最少個數」的模板。外層金額、內層硬幣,或反過來都可以(求最小值和順序無關)。',
      code: {
        python: `def coinChange(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount             # dp[a]:湊出 a 最少幾枚
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1     # 最後一枚是 c
    return dp[amount] if dp[amount] < INF else -1`,
        c: `int coinChange(int *coins, int coinsSize, int amount) {
    int *dp = malloc((amount + 1) * sizeof(int));
    dp[0] = 0;
    for (int a = 1; a <= amount; a++) {
        dp[a] = INT_MAX;
        for (int k = 0; k < coinsSize; k++)
            if (coins[k] <= a && dp[a - coins[k]] != INT_MAX && dp[a - coins[k]] + 1 < dp[a])
                dp[a] = dp[a - coins[k]] + 1;
    }
    int ans = dp[amount] == INT_MAX ? -1 : dp[amount];
    free(dp);
    return ans;
}`,
        cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a && dp[a - c] != INT_MAX) dp[a] = min(dp[a], dp[a - c] + 1);
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}`,
        java: `int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a && dp[a - c] != Integer.MAX_VALUE) dp[a] = Math.min(dp[a], dp[a - c] + 1);
    return dp[amount] == Integer.MAX_VALUE ? -1 : dp[amount];
}`,
        javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++)
    for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      },
    },
    {
      name: 'BFS 最短路',
      idea: '從 amount 出發,每一層代表多用一枚硬幣,走到 a − c。第一次碰到 0 的層數就是答案。走過的金額不再走。',
      steps: ['`amount == 0` → 0', '`q = [amount]`、`seen = {amount}`、`steps = 0`', '每一層:`steps += 1`;對每個 a、每種 c:`b = a − c`,`b == 0` → 回傳 steps;`b > 0` 且沒看過 → 放進佇列', '佇列空了 → −1'],
      figure: { title: `coins = [${COINS}], amount = ${AMT}`, steps: bfsFig() },
      complexity: { time: 'O(amount · k)', space: 'O(amount)', why: '每個金額最多進佇列一次。' },
      verdict: '「最少幾步」的題目都能想成 BFS。和 DP 的複雜度一樣,但找到答案就能提早停。',
      code: {
        python: `from collections import deque

def coinChange(coins, amount):
    if amount == 0:
        return 0
    seen = {amount}
    q = deque([amount])
    steps = 0
    while q:
        steps += 1
        for _ in range(len(q)):
            a = q.popleft()
            for c in coins:
                b = a - c
                if b == 0:
                    return steps
                if b > 0 and b not in seen:
                    seen.add(b)
                    q.append(b)
    return -1`,
        c: `int coinChange(int *coins, int coinsSize, int amount) {
    if (amount == 0) return 0;
    bool *seen = calloc(amount + 1, sizeof(bool));
    int *q = malloc((amount + 1) * sizeof(int)), head = 0, tail = 0, steps = 0, ans = -1;
    q[tail++] = amount; seen[amount] = true;
    while (head < tail && ans < 0) {
        steps++;
        int end = tail;
        while (head < end && ans < 0) {
            int a = q[head++];
            for (int k = 0; k < coinsSize; k++) {
                int b = a - coins[k];
                if (b == 0) { ans = steps; break; }
                if (b > 0 && !seen[b]) { seen[b] = true; q[tail++] = b; }
            }
        }
    }
    free(seen); free(q);
    return ans;
}`,
        cpp: `int coinChange(vector<int>& coins, int amount) {
    if (amount == 0) return 0;
    vector<bool> seen(amount + 1, false);
    queue<int> q;
    q.push(amount);
    seen[amount] = true;
    for (int steps = 1; !q.empty(); steps++)
        for (int s = q.size(); s > 0; s--) {
            int a = q.front(); q.pop();
            for (int c : coins) {
                int b = a - c;
                if (b == 0) return steps;
                if (b > 0 && !seen[b]) { seen[b] = true; q.push(b); }
            }
        }
    return -1;
}`,
        java: `int coinChange(int[] coins, int amount) {
    if (amount == 0) return 0;
    boolean[] seen = new boolean[amount + 1];
    Deque<Integer> q = new ArrayDeque<>();
    q.offer(amount);
    seen[amount] = true;
    for (int steps = 1; !q.isEmpty(); steps++)
        for (int s = q.size(); s > 0; s--) {
            int a = q.poll();
            for (int c : coins) {
                int b = a - c;
                if (b == 0) return steps;
                if (b > 0 && !seen[b]) { seen[b] = true; q.offer(b); }
            }
        }
    return -1;
}`,
        javascript: `function coinChange(coins, amount) {
  if (amount === 0) return 0;
  const seen = new Array(amount + 1).fill(false);
  let level = [amount];
  seen[amount] = true;
  for (let steps = 1; level.length; steps++) {
    const next = [];
    for (const a of level)
      for (const c of coins) {
        const b = a - c;
        if (b === 0) return steps;
        if (b > 0 && !seen[b]) {
          seen[b] = true;
          next.push(b);
        }
      }
    level = next;
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: [
    '用貪心(一直拿最大面額):`[1,3,4]` 湊 6 會錯',
    'dp 用 INT_MAX 代表「湊不出來」時,`dp[a−c] + 1` 會溢位,先檢查',
    'amount = 0 要回傳 0',
  ],
  followUp: [{ q: '問的是「有幾種組合」?', a: '[518. Coin Change II](#/q/518):把 min 換成相加,而且外層一定要是硬幣(避免把不同順序算成不同組合)。' }],
  check: {
    kind: 'fn',
    fn: 'coinChange',
    cases: [
      { args: [[1, 2, 5], 11], out: 3 },
      { args: [[2], 3], out: -1 },
      { args: [[1], 0], out: 0 },
      { args: [COINS, AMT], out: 2 },
      { args: [[186, 419, 83, 408], 6249], out: 20 },
    ],
  },
}
