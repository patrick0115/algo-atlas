import { arr, range } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 309. Best Time to Buy and Sell Stock with Cooldown

const P = [1, 2, 3, 0, 2]

function stateTable(rows: (number | string)[][], col: number): GridViewData {
  return {
    kind: 'grid',
    label: '每天結束時,三種狀態各自能拿到的最大利潤',
    cells: rows.map((r) => [...r]),
    rowLabels: ['持有 hold', '剛賣 sold', '休息 rest'],
    colLabels: P.map((p, i) => `第${i}天 $${p}`),
    marks: { hl: col >= 0 ? [[0, col], [1, col], [2, col]] : [] },
  }
}

function stateFig(): FigStep[] {
  const rows: (number | string)[][] = [P.map(() => ''), P.map(() => ''), P.map(() => '')]
  const out: FigStep[] = [
    {
      note: '每天結束時你一定在三種狀態之一:**持有**股票、**今天剛賣**(明天要冷卻)、**手上沒股票也不在冷卻**。只要記住每種狀態的最佳利潤',
      views: [arr(P, { label: 'prices', mode: 'bars' }), stateTable(rows, -1)],
    },
  ]
  let hold = -Infinity
  let sold = -Infinity
  let rest = 0
  P.forEach((p, i) => {
    const fmt = (v: number) => (v === -Infinity ? '−∞' : String(v))
    const nh = Math.max(hold, rest - p)
    const ns = hold + p
    const nr = Math.max(rest, sold)
    const msg = `價格 ${p}:hold = max(${fmt(hold)}, ${rest} − ${p}) = ${nh};sold = ${fmt(hold)} + ${p} = ${fmt(ns)};rest = max(${rest}, ${fmt(sold)}) = ${nr}`
    hold = nh
    sold = ns
    rest = nr
    rows[0][i] = hold
    rows[1][i] = sold === -Infinity ? '−∞' : sold
    rows[2][i] = rest
    out.push({
      note: msg,
      views: [arr(P, { label: 'prices', mode: 'bars', highlight: [i], dim: range(0, i - 1) }), stateTable(rows, i)],
    })
  })
  out.push({ note: `最後一天不能還拿著股票 → 答案 = max(sold, rest) = ${Math.max(sold, rest)}(第 0 天買、第 1 天賣、第 2 天冷卻、第 3 天買、第 4 天賣)`, views: [stateTable(rows, P.length - 1)] })
  return out
}

function machineFig(): FigStep[] {
  return [
    { note: '狀態機:rest →(買)→ hold →(賣)→ sold →(冷卻一天)→ rest。hold、rest 也可以原地不動', views: [arr(['rest', '→買→', 'hold', '→賣→', 'sold', '→冷卻→', 'rest'], { label: '一輪交易' })] },
    { note: '冷卻的限制就藏在「sold 只能走到 rest、不能直接買」這條規則裡:買入只能從 rest 出發', views: [arr(['hold ← max(hold, rest − p)', 'sold ← hold + p', 'rest ← max(rest, sold)'], { label: '轉移' })] },
  ]
}

export const q0309: Solution = {
  id: 309,
  plain: '可以買賣股票很多次,但「賣掉的隔天」不能買(要冷卻一天),而且手上最多只能有一張。給每天的股價,最多能賺多少?',
  statement: '`prices[i]` 是第 i 天的股價。可以完成任意多次交易,但:不能同時持有多張(要先賣才能再買);**賣出後的隔天不能買入**(冷卻期一天)。回傳最大利潤。',
  examples: [
    { input: 'prices = [1,2,3,0,2]', output: '3', note: '買、賣、冷卻、買、賣' },
    { input: 'prices = [1]', output: '0' },
  ],
  constraints: ['`n ≤ 5000` → O(n) 或 O(n²) 都可以'],
  insight: [
    '每天結束時只有三種狀態:**hold**(手上有股票)、**sold**(今天剛賣)、**rest**(沒股票、可以買)',
    '`hold = max(hold, rest − p)`:繼續拿著,或從可以買的狀態買入',
    '`sold = hold + p`:今天把手上的賣掉',
    '`rest = max(rest, sold)`:繼續休息,或昨天賣、今天冷卻完畢。冷卻就是「sold 不能直接接買入」',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化(第 i 天、手上有沒有股票)',
      idea: '`f(i, holding)` = 從第 i 天起能賺的最多。沒股票:買(`−p + f(i+1, True)`)或跳過;有股票:賣(`p + f(i+2, False)`,跳過冷卻日)或跳過。',
      steps: ['`i >= n` → 0', '`holding`:`max(f(i+1, True), prices[i] + f(i+2, False))`', '否則:`max(f(i+1, False), −prices[i] + f(i+1, True))`', '記憶化'],
      figure: { title: `prices = [${P}]`, steps: machineFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '狀態 2n 個,每個 O(1)。' },
      verdict: '把冷卻寫成「賣完直接跳到 i + 2」,很直觀。',
      code: {
        python: `from functools import lru_cache

def maxProfit(prices):
    n = len(prices)

    @lru_cache(maxsize=None)
    def f(i, holding):
        if i >= n:
            return 0
        skip = f(i + 1, holding)
        if holding:
            return max(skip, prices[i] + f(i + 2, False))    # 賣,隔天冷卻
        return max(skip, -prices[i] + f(i + 1, True))       # 買

    return f(0, False)`,
        c: `static int memo[5002][2], *P_, N_;

static int f(int i, int h) {
    if (i >= N_) return 0;
    if (memo[i][h] >= 0) return memo[i][h];
    int skip = f(i + 1, h), act;
    if (h) act = P_[i] + f(i + 2, 0);
    else act = -P_[i] + f(i + 1, 1);
    return memo[i][h] = skip > act ? skip : act;
}

int maxProfit(int *prices, int pricesSize) {
    P_ = prices; N_ = pricesSize;
    for (int i = 0; i < pricesSize; i++) memo[i][0] = memo[i][1] = -1;
    return f(0, 0);
}`,
        cpp: `int maxProfit(vector<int>& prices) {
    int n = prices.size();
    vector<array<int, 2>> memo(n, {-1, -1});
    function<int(int, int)> f = [&](int i, int h) -> int {
        if (i >= n) return 0;
        if (memo[i][h] >= 0) return memo[i][h];
        int skip = f(i + 1, h);
        int act = h ? prices[i] + f(i + 2, 0) : -prices[i] + f(i + 1, 1);
        return memo[i][h] = max(skip, act);
    };
    return f(0, 0);
}`,
        java: `private int[][] memo;
private int[] p;

int maxProfit(int[] prices) {
    p = prices;
    memo = new int[prices.length][2];
    for (int[] row : memo) Arrays.fill(row, -1);
    return f(0, 0);
}

private int f(int i, int h) {
    if (i >= p.length) return 0;
    if (memo[i][h] >= 0) return memo[i][h];
    int skip = f(i + 1, h);
    int act = h == 1 ? p[i] + f(i + 2, 0) : -p[i] + f(i + 1, 1);
    return memo[i][h] = Math.max(skip, act);
}`,
        javascript: `function maxProfit(prices) {
  const n = prices.length;
  const memo = Array.from({ length: n }, () => [-1, -1]);
  const f = (i, h) => {
    if (i >= n) return 0;
    if (memo[i][h] >= 0) return memo[i][h];
    const skip = f(i + 1, h);
    const act = h ? prices[i] + f(i + 2, 0) : -prices[i] + f(i + 1, 1);
    return (memo[i][h] = Math.max(skip, act));
  };
  return f(0, 0);
}`,
      },
    },
    {
      name: '狀態機 DP(三個變數)',
      idea: '每天用前一天的 hold、sold、rest 算今天的:`hold = max(hold, rest − p)`、`sold = hold + p`、`rest = max(rest, sold)`。三個要同時更新(用舊值)。',
      steps: ['`hold = −∞, sold = −∞, rest = 0`', '每個價格 p:用舊值算出三個新值', '回傳 `max(sold, rest)`'],
      figure: { title: `prices = [${P}]`, steps: stateFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描,三個變數。' },
      verdict: '最佳解,[[p:state-machine-dp]]「股票系列」的通用模板。改狀態就能解手續費、最多 k 次等變形。',
      code: {
        python: `def maxProfit(prices):
    hold, sold, rest = float('-inf'), float('-inf'), 0
    for p in prices:
        # 三個一起用「昨天」的值更新
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)`,
        c: `int maxProfit(int *prices, int pricesSize) {
    int hold = INT_MIN / 2, sold = INT_MIN / 2, rest = 0;
    for (int i = 0; i < pricesSize; i++) {
        int p = prices[i];
        int nh = hold > rest - p ? hold : rest - p;
        int ns = hold + p;
        int nr = rest > sold ? rest : sold;
        hold = nh; sold = ns; rest = nr;
    }
    return sold > rest ? sold : rest;
}`,
        cpp: `int maxProfit(vector<int>& prices) {
    int hold = INT_MIN / 2, sold = INT_MIN / 2, rest = 0;
    for (int p : prices) {
        int nh = max(hold, rest - p), ns = hold + p, nr = max(rest, sold);
        hold = nh; sold = ns; rest = nr;
    }
    return max(sold, rest);
}`,
        java: `int maxProfit(int[] prices) {
    int hold = Integer.MIN_VALUE / 2, sold = Integer.MIN_VALUE / 2, rest = 0;
    for (int p : prices) {
        int nh = Math.max(hold, rest - p), ns = hold + p, nr = Math.max(rest, sold);
        hold = nh; sold = ns; rest = nr;
    }
    return Math.max(sold, rest);
}`,
        javascript: `function maxProfit(prices) {
  let hold = -Infinity, sold = -Infinity, rest = 0;
  for (const p of prices) [hold, sold, rest] = [Math.max(hold, rest - p), hold + p, Math.max(rest, sold)];
  return Math.max(sold, rest);
}`,
      },
    },
  ],
  pitfalls: [
    '依序更新三個變數:`rest` 用到的 `sold` 已經是今天的,冷卻就失效了 → 一定要用舊值',
    'C/Java 用 `INT_MIN` 當 −∞ 再加 p 會溢位:用 `INT_MIN / 2`',
    '記憶化版本賣出後跳到 `i + 1`:等於沒有冷卻,變成 122 題',
  ],
  followUp: [
    { q: '改成每筆交易收手續費?', a: '714:沒有冷卻,`sold` 和 `rest` 合併,賣出時減掉 fee。' },
    { q: '最多 k 筆交易?', a: '188:狀態多一維「已經用掉幾筆」。' },
  ],
  check: {
    kind: 'fn',
    fn: 'maxProfit',
    cases: [
      { args: [P], out: 3 },
      { args: [[1]], out: 0 },
      { args: [[5, 4, 3, 2, 1]], out: 0 },
      { args: [[1, 2, 4]], out: 3 },
      { args: [[2, 1, 4, 5, 2, 9, 7]], out: 10 },
    ],
  },
}
