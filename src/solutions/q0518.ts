import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 518. Coin Change II

const COINS = [1, 2, 5]
const AMT = 5

function tableFig(): FigStep[] {
  const rows: number[][] = []
  let dp = Array(AMT + 1).fill(0)
  dp[0] = 1
  const view = (hl: [number, number][] = []): GridViewData => ({
    kind: 'grid',
    label: '第 i 列 = 只用前 i 種硬幣時,湊出每個金額的組合數',
    cells: [[1, ...Array(AMT).fill(0)], ...rows],
    rowLabels: ['不用硬幣', ...rows.map((_, i) => `+${COINS[i]}`)],
    colLabels: Array.from({ length: AMT + 1 }, (_, a) => `${a}`),
    marks: { hl },
  })
  const out: FigStep[] = [{ note: '只要「組合」(1+2 和 2+1 算同一種)。訣竅:一種一種硬幣加進來。一開始什麼硬幣都沒有,只有金額 0 能湊出來(1 種:什麼都不拿)', views: [view()] }]
  COINS.forEach((c, i) => {
    dp = [...dp]
    for (let a = c; a <= AMT; a++) dp[a] += dp[a - c]
    rows.push([...dp])
    out.push({ note: `加入硬幣 ${c}:dp[a] += dp[a − ${c}](a 由小到大)。意思是「不用 ${c} 的組合」+「至少用一枚 ${c} 的組合(先拿一枚,剩下 a − ${c} 也可以再用 ${c})」`, views: [view(Array.from({ length: AMT + 1 - c }, (_, k) => [i + 1, c + k] as [number, number]))] })
  })
  out.push({ note: `答案 = 最後一列的 dp[${AMT}] = ${dp[AMT]}`, views: [view([[COINS.length, AMT]])] })
  return out
}

function wrongFig(): FigStep[] {
  const perm = Array(AMT + 1).fill(0)
  perm[0] = 1
  for (let a = 1; a <= AMT; a++) for (const c of COINS) if (c <= a) perm[a] += perm[a - c]
  return [
    { note: '常見的錯:外層是金額、內層是硬幣。這樣算出來的是「排列數」:1+2 和 2+1 被當成兩種', views: [arr(perm, { label: '外層金額時的 dp(這是 377 題的答案)' })] },
    { note: `所以 dp[${AMT}] 會變成 ${perm[AMT]},比正確答案大。外層放硬幣,才能保證每個組合裡的硬幣「照固定順序」出現,只被算一次`, views: [arr(perm, { label: '錯誤的結果', highlight: [AMT] })] },
  ]
}

export const q0518: Solution = {
  id: 518,
  plain: '有幾種面額的硬幣(每種無限多),湊出某個金額有**幾種不同的組合**?「1+2」和「2+1」算同一種。關鍵在迴圈順序:一種一種硬幣加進來,就不會重複算。',
  statement: '`coins` 是硬幣面額(每種無限多),回傳湊出 `amount` 的**組合數**(不看順序)。湊不出來就是 0。',
  examples: [
    { input: 'amount = 5, coins = [1,2,5]', output: '4', note: '5、2+2+1、2+1+1+1、1+1+1+1+1' },
    { input: 'amount = 3, coins = [2]', output: '0' },
    { input: 'amount = 10, coins = [10]', output: '1' },
  ],
  constraints: ['`amount ≤ 5000`,硬幣最多 300 種', '答案保證在 32 位元整數內'],
  insight: [
    '和 [322](#/q/322) 同樣是完全背包,但要的是「方法數」:把 min 換成加總',
    '難點是**不能重複**:如果對每個金額都試所有硬幣當「最後一枚」,1+2 和 2+1 會被算成兩種(那是排列數)',
    '解法:**外層迴圈是硬幣**。處理硬幣 c 時,`dp[a] += dp[a − c]` 代表「在只用前面那些硬幣的組合上,再加 c」。每個組合裡硬幣出現的順序被固定住,就只會算一次',
    '二維的想法:`dp[i][a]` = 只用前 i 種硬幣湊出 a 的組合數 = 不用第 i 種(`dp[i−1][a]`)+ 至少用一枚(`dp[i][a − c]`)',
  ],
  approaches: [
    {
      name: '二維 DP:前 i 種硬幣',
      idea: '`dp[i][a] = dp[i−1][a] + dp[i][a − coins[i−1]]`。第一項不用這種硬幣,第二項至少用一枚(用完還能再用,所以是同一列 i)。',
      steps: ['`dp[0][0] = 1`,其他是 0', '`for i in 1..k`、`for a in 0..amount`:`dp[i][a] = dp[i−1][a]`', '`a >= c` → `dp[i][a] += dp[i][a − c]`', '回傳 `dp[k][amount]`'],
      figure: { title: `coins = [${COINS}], amount = ${AMT}`, steps: tableFig() },
      complexity: { time: 'O(k · amount)', space: 'O(k · amount)', why: 'k 種硬幣 × amount 個金額。' },
      verdict: '最清楚地看出「用不用這種硬幣」兩種情況,也看得出為什麼不會重複。',
      code: {
        python: `def change(amount, coins):
    k = len(coins)
    dp = [[0] * (amount + 1) for _ in range(k + 1)]
    dp[0][0] = 1
    for i in range(1, k + 1):
        c = coins[i - 1]
        for a in range(amount + 1):
            dp[i][a] = dp[i - 1][a]           # 不用第 i 種硬幣
            if a >= c:
                dp[i][a] += dp[i][a - c]      # 至少用一枚(還能繼續用)
    return dp[k][amount]`,
        c: `int change(int amount, int *coins, int coinsSize) {
    int k = coinsSize;
    unsigned long long **dp = malloc((k + 1) * sizeof(*dp));
    for (int i = 0; i <= k; i++) dp[i] = calloc(amount + 1, sizeof(unsigned long long));
    dp[0][0] = 1;
    for (int i = 1; i <= k; i++)
        for (int a = 0; a <= amount; a++) {
            dp[i][a] = dp[i - 1][a];
            if (a >= coins[i - 1]) dp[i][a] += dp[i][a - coins[i - 1]];
        }
    int ans = (int)dp[k][amount];
    for (int i = 0; i <= k; i++) free(dp[i]);
    free(dp);
    return ans;
}`,
        cpp: `int change(int amount, vector<int>& coins) {
    int k = coins.size();
    vector<vector<unsigned long long>> dp(k + 1, vector<unsigned long long>(amount + 1, 0));
    dp[0][0] = 1;
    for (int i = 1; i <= k; i++)
        for (int a = 0; a <= amount; a++) {
            dp[i][a] = dp[i - 1][a];
            if (a >= coins[i - 1]) dp[i][a] += dp[i][a - coins[i - 1]];
        }
    return (int)dp[k][amount];
}`,
        java: `int change(int amount, int[] coins) {
    int k = coins.length;
    long[][] dp = new long[k + 1][amount + 1];
    dp[0][0] = 1;
    for (int i = 1; i <= k; i++)
        for (int a = 0; a <= amount; a++) {
            dp[i][a] = dp[i - 1][a];
            if (a >= coins[i - 1]) dp[i][a] += dp[i][a - coins[i - 1]];
        }
    return (int) dp[k][amount];
}`,
        javascript: `function change(amount, coins) {
  const k = coins.length;
  const dp = Array.from({ length: k + 1 }, () => new Array(amount + 1).fill(0));
  dp[0][0] = 1;
  for (let i = 1; i <= k; i++)
    for (let a = 0; a <= amount; a++) {
      dp[i][a] = dp[i - 1][a];
      if (a >= coins[i - 1]) dp[i][a] += dp[i][a - coins[i - 1]];
    }
  return dp[k][amount];
}`,
      },
    },
    {
      name: '一維 DP:外層硬幣、內層金額',
      idea: '二維表每一列只用到上一列同位置和同一列左邊 → 壓成一維。`for c in coins: for a in c..amount: dp[a] += dp[a − c]`。',
      steps: ['`dp = [1] + [0] * amount`', '`for c in coins`(外層!)', '`for a in c..amount`(由小到大):`dp[a] += dp[a − c]`', '回傳 `dp[amount]`'],
      figure: { title: `coins = [${COINS}], amount = ${AMT}`, steps: [...tableFig().slice(-1), ...wrongFig()] },
      complexity: { time: 'O(k · amount)', space: 'O(amount)', why: '同上,只留一列。' },
      verdict: '標準解。[[p:knapsack]]的口訣:完全背包「內層金額由小到大」;求組合數「外層物品」,求排列數「外層金額」。',
      code: {
        python: `def change(amount, coins):
    dp = [1] + [0] * amount               # dp[0] = 1:什麼都不拿
    for c in coins:                       # 外層是硬幣 → 算的是組合
        for a in range(c, amount + 1):    # 由小到大 → 同一種硬幣可以重複用
            dp[a] += dp[a - c]
    return dp[amount]`,
        c: `int change(int amount, int *coins, int coinsSize) {
    unsigned long long *dp = calloc(amount + 1, sizeof(unsigned long long));
    dp[0] = 1;
    for (int k = 0; k < coinsSize; k++)
        for (int a = coins[k]; a <= amount; a++) dp[a] += dp[a - coins[k]];
    int ans = (int)dp[amount];
    free(dp);
    return ans;
}`,
        cpp: `int change(int amount, vector<int>& coins) {
    vector<unsigned long long> dp(amount + 1, 0);   // 中間值可能超過 int(題目只保證答案不會)
    dp[0] = 1;
    for (int c : coins)
        for (int a = c; a <= amount; a++) dp[a] += dp[a - c];
    return (int)dp[amount];
}`,
        java: `int change(int amount, int[] coins) {
    long[] dp = new long[amount + 1];
    dp[0] = 1;
    for (int c : coins)
        for (int a = c; a <= amount; a++) dp[a] += dp[a - c];
    return (int) dp[amount];
}`,
        javascript: `function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const c of coins) for (let a = c; a <= amount; a++) dp[a] += dp[a - c];
  return dp[amount];
}`,
      },
    },
  ],
  pitfalls: [
    '迴圈順序反了(外層金額、內層硬幣):算出來的是排列數,`[1,2,5]` 湊 5 會得到 9 而不是 4',
    '內層金額由大到小:那是 0/1 背包(每種硬幣只能用一次),這題可以重複用,要由小到大',
    'dp[0] 要是 1(湊出 0 元有一種方法:什麼都不拿)',
    'C++ / Java 中間的 dp 值可能超過 int(題目只保證最後的答案不會),中間用 64 位元',
  ],
  followUp: [{ q: '如果順序不同算不同的方法?', a: '377. Combination Sum IV:外層金額、內層硬幣。' }],
  check: {
    kind: 'fn',
    fn: 'change',
    cases: [
      { args: [5, [1, 2, 5]], out: 4 },
      { args: [3, [2]], out: 0 },
      { args: [10, [10]], out: 1 },
      { args: [0, [7]], out: 1 },
      { args: [100, [1, 5, 10, 25]], out: 242 },
    ],
  },
}
