import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 121. Best Time to Buy and Sell Stock

const P = [7, 1, 5, 3, 6, 4]

function bruteFig(): FigStep[] {
  const out: FigStep[] = [{ note: '試每一組「第 i 天買、第 j 天賣」(i < j),利潤 = prices[j] − prices[i]', views: [arr(P, { label: 'prices', mode: 'bars' })] }]
  let best = 0
  for (let i = 0; i < P.length; i++)
    for (let j = i + 1; j < P.length; j++) {
      const p = P[j] - P[i]
      if (p > best) {
        best = p
        out.push({ note: `第 ${i} 天買 ${P[i]}、第 ${j} 天賣 ${P[j]},賺 ${p} → 目前最多`, views: [arr(P, { label: 'prices', mode: 'bars', compare: [i, j], range: [i, j] })] })
      }
    }
  out.push({ note: `全部 ${(P.length * (P.length - 1)) / 2} 組試完,最多賺 ${best}`, views: [arr(P, { label: 'prices', mode: 'bars' })] })
  return out
}

function minFig(): FigStep[] {
  let lo = 0
  let best = 0
  const out: FigStep[] = [{ note: '從左往右走,記住「到今天為止最便宜的那天」。如果今天賣,最好的買點就是它', views: [arr(P, { label: 'prices', mode: 'bars', highlight: [0], pointers: [{ name: 'min', index: 0 }] })] }]
  for (let i = 1; i < P.length; i++) {
    if (P[i] < P[lo]) {
      lo = i
      out.push({ note: `第 ${i} 天 ${P[i]} 比之前最低價還低 → 更新最低價的那天。今天賣不會賺,利潤仍是 ${best}`, views: [arr(P, { label: 'prices', mode: 'bars', highlight: [i], dim: range(0, i - 1), pointers: [{ name: 'min', index: lo }, { name: 'i', index: i, color: 'b' }] })] })
    } else {
      const p = P[i] - P[lo]
      best = Math.max(best, p)
      out.push({ note: `第 ${i} 天賣:${P[i]} − 最低價 ${P[lo]} = ${p},最多 ${best}`, views: [arr(P, { label: 'prices', mode: 'bars', compare: [lo, i], range: [lo, i], pointers: [{ name: 'min', index: lo }, { name: 'i', index: i, color: 'b' }] })] })
    }
  }
  out.push({ note: `答案 = ${best}。只走了一次`, views: [arr(P, { label: 'prices', mode: 'bars' })] })
  return out
}

function dpFig(): FigStep[] {
  const hold: (number | string)[] = P.map(() => '')
  const free: (number | string)[] = P.map(() => '')
  hold[0] = -P[0]
  free[0] = 0
  const out: FigStep[] = [
    {
      note: '把每一天的狀態分成兩種:hold = 手上有股票時的最大「現金」(買了要付錢,所以是負的);free = 手上沒股票時的最大現金。第 0 天:買 → −7,不買 → 0',
      views: [arr(P, { label: 'prices', highlight: [0] }), arr(hold, { label: 'hold', highlight: [0] }), arr(free, { label: 'free', highlight: [0] })],
    },
  ]
  for (let i = 1; i < P.length; i++) {
    const h = Math.max(hold[i - 1] as number, -P[i])
    const f = Math.max(free[i - 1] as number, (hold[i - 1] as number) + P[i])
    hold[i] = h
    free[i] = f
    out.push({
      note: `第 ${i} 天:hold = max(繼續拿著 ${hold[i - 1]}, 今天買 −${P[i]}) = ${h};free = max(繼續空手 ${free[i - 1]}, 今天賣 ${hold[i - 1]} + ${P[i]}) = ${f}`,
      views: [arr(P, { label: 'prices', highlight: [i] }), arr(hold, { label: 'hold', highlight: [i], compare: [i - 1] }), arr(free, { label: 'free', highlight: [i], compare: [i - 1] })],
    })
  }
  out.push({ note: `最後一天空手的最大現金 free = ${free[P.length - 1]} 就是答案。hold 只能從 −價格 來(只能買一次),所以 hold 其實就是「−最低價」`, views: [arr(hold, { label: 'hold' }), arr(free, { label: 'free', done: [P.length - 1] })] })
  return out
}

export const q0121: Solution = {
  id: 121,
  plain: '已知未來每一天的股價,只能買一次、賣一次(先買後賣),最多能賺多少?就是找「前面的最低點」和「後面的最高點」差最多的那一組。',
  statement: '`prices[i]` 是第 `i` 天的股價。你只能**買一次、賣一次**,而且賣要在買之後。回傳最多能賺多少;賺不到錢就回傳 0。',
  examples: [
    { input: 'prices = [7,1,5,3,6,4]', output: '5', note: '第 1 天買 1、第 4 天賣 6' },
    { input: 'prices = [7,6,4,3,1]', output: '0', note: '一路下跌,不交易' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁵` → O(n²) 是 50 億次,超時;要 O(n)', '`0 ≤ prices[i] ≤ 10⁴`'],
  insight: [
    '暴力:每一組 (買, 賣) 都試 → O(n²)',
    '換個角度:**固定賣出那天**,最好的買點一定是「它之前最便宜的那天」。從左往右走時順手記住目前最低價,每一天算一次「今天賣能賺多少」',
    '也可以用狀態機 DP 來看:每天只有「手上有股票」和「沒有股票」兩種狀態。這個角度可以直接推廣到 122、123、188、309 這一整個股票系列',
  ],
  approaches: [
    {
      name: '暴力:試每一組買賣日',
      idea: '兩層迴圈,`i < j`,利潤 `prices[j] − prices[i]` 取最大。',
      steps: ['`best = 0`', '對每個 `i < j`:`best = max(best, prices[j] − prices[i])`'],
      figure: { title: 'prices = [7,1,5,3,6,4](只畫出刷新最大值的那幾步)', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n(n−1)/2 組。' },
      verdict: 'n = 10⁵ 會超時。只當起點。',
      code: {
        python: `def maxProfit(prices):
    best = 0
    for i in range(len(prices)):
        for j in range(i + 1, len(prices)):
            best = max(best, prices[j] - prices[i])
    return best`,
        c: `int maxProfit(int *prices, int pricesSize) {
    int best = 0;
    for (int i = 0; i < pricesSize; i++)
        for (int j = i + 1; j < pricesSize; j++)
            if (prices[j] - prices[i] > best) best = prices[j] - prices[i];
    return best;
}`,
        cpp: `int maxProfit(vector<int>& prices) {
    int best = 0, n = prices.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            best = max(best, prices[j] - prices[i]);
    return best;
}`,
        java: `int maxProfit(int[] prices) {
    int best = 0, n = prices.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            best = Math.max(best, prices[j] - prices[i]);
    return best;
}`,
        javascript: `function maxProfit(prices) {
  let best = 0;
  for (let i = 0; i < prices.length; i++)
    for (let j = i + 1; j < prices.length; j++)
      best = Math.max(best, prices[j] - prices[i]);
  return best;
}`,
      },
    },
    {
      name: '一次遍歷:記住目前最低價',
      idea: '走到第 `i` 天時,`minPrice` 是前面(含今天)的最低價,`prices[i] − minPrice` 就是「今天賣」的最大利潤。',
      steps: ['`minPrice = ∞`、`best = 0`', '對每個價格 `p`:`minPrice = min(minPrice, p)`', '`best = max(best, p − minPrice)`'],
      figure: { title: 'prices = [7,1,5,3,6,4]', steps: minFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '走一次,只記兩個數。' },
      verdict: '標準解。也可以看成[[p:sliding-window]]:`min` 是視窗左端、`i` 是右端,遇到更低價就把左端跳過去。',
      code: {
        python: `def maxProfit(prices):
    min_price = float('inf')
    best = 0
    for p in prices:
        min_price = min(min_price, p)     # 到今天為止最便宜的買點
        best = max(best, p - min_price)   # 今天賣能賺多少
    return best`,
        c: `int maxProfit(int *prices, int pricesSize) {
    int minPrice = INT_MAX, best = 0;
    for (int i = 0; i < pricesSize; i++) {
        if (prices[i] < minPrice) minPrice = prices[i];
        if (prices[i] - minPrice > best) best = prices[i] - minPrice;
    }
    return best;
}`,
        cpp: `int maxProfit(vector<int>& prices) {
    int minPrice = INT_MAX, best = 0;
    for (int p : prices) {
        minPrice = min(minPrice, p);
        best = max(best, p - minPrice);
    }
    return best;
}`,
        java: `int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE, best = 0;
    for (int p : prices) {
        minPrice = Math.min(minPrice, p);
        best = Math.max(best, p - minPrice);
    }
    return best;
}`,
        javascript: `function maxProfit(prices) {
  let minPrice = Infinity, best = 0;
  for (const p of prices) {
    minPrice = Math.min(minPrice, p);
    best = Math.max(best, p - minPrice);
  }
  return best;
}`,
      },
    },
    {
      name: '狀態機 DP:持有 / 空手',
      idea: '`hold` = 手上有股票時的最大現金,`free` = 空手時的最大現金。每天:`hold = max(hold, −price)`(只能買一次,所以從 0 元買);`free = max(free, hold + price)`。',
      steps: ['`hold = −prices[0]`、`free = 0`', '對之後的每天 `p`:`hold = max(hold, −p)`', '`free = max(free, hold + p)`(用的是前一天的 hold)', '回傳 `free`'],
      figure: { title: 'prices = [7,1,5,3,6,4]', steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每天更新兩個狀態,只需要前一天的值。' },
      verdict: '這題用 DP 有點殺雞用牛刀,但它是[[p:state-machine-dp]]的入門:122(買賣無限次)只要把 `−p` 換成 `free − p`;309(冷卻)、714(手續費)都是多一個狀態或多一項成本。',
      code: {
        python: `def maxProfit(prices):
    hold, free = -prices[0], 0            # 持有 / 空手 時的最大現金
    for p in prices[1:]:
        hold, free = max(hold, -p), max(free, hold + p)   # 右邊用的都是昨天的值
    return free`,
        c: `int maxProfit(int *prices, int pricesSize) {
    int hold = -prices[0], free_ = 0;
    for (int i = 1; i < pricesSize; i++) {
        int h = hold > -prices[i] ? hold : -prices[i];
        int f = free_ > hold + prices[i] ? free_ : hold + prices[i];
        hold = h; free_ = f;
    }
    return free_;
}`,
        cpp: `int maxProfit(vector<int>& prices) {
    int hold = -prices[0], free = 0;
    for (size_t i = 1; i < prices.size(); i++) {
        int h = max(hold, -prices[i]);
        int f = max(free, hold + prices[i]);
        hold = h; free = f;
    }
    return free;
}`,
        java: `int maxProfit(int[] prices) {
    int hold = -prices[0], free = 0;
    for (int i = 1; i < prices.length; i++) {
        int h = Math.max(hold, -prices[i]);
        int f = Math.max(free, hold + prices[i]);
        hold = h; free = f;
    }
    return free;
}`,
        javascript: `function maxProfit(prices) {
  let hold = -prices[0], free = 0;
  for (let i = 1; i < prices.length; i++) {
    [hold, free] = [Math.max(hold, -prices[i]), Math.max(free, hold + prices[i])];
  }
  return free;
}`,
      },
    },
  ],
  pitfalls: [
    '先找全域最低價、再找全域最高價:最高價可能在最低價**之前**(`[3, 8, 1]`),那樣不能交易',
    '答案不能是負的:一路下跌時不交易,回傳 0。初始 `best = 0` 就處理掉了',
    'DP 版更新時要用「昨天」的 hold:先改 hold 再用它算 free 的話,等於同一天買又賣(這題剛好不影響答案,但 122 之後的題目會出錯)',
  ],
  followUp: [
    { q: '可以買賣很多次?', a: '122:每一段上漲都賺,答案 = 所有 `max(0, prices[i] − prices[i−1])` 的總和;或 DP 把 `hold = max(hold, −p)` 改成 `max(hold, free − p)`。' },
    { q: '有冷卻期?', a: '309. Best Time with Cooldown:再多一個「剛賣出」的狀態,見[[p:state-machine-dp]]。' },
  ],
  check: {
    kind: 'fn',
    fn: 'maxProfit',
    cases: [
      { args: [[7, 1, 5, 3, 6, 4]], out: 5 },
      { args: [[7, 6, 4, 3, 1]], out: 0 },
      { args: [[1]], out: 0 },
      { args: [[3, 8, 1]], out: 5 },
      { args: [[2, 4, 1, 7]], out: 6 },
      { args: [[1, 2]], out: 1 },
    ],
  },
}
