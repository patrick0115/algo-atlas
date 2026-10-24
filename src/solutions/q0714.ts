import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 714. Best Time to Buy and Sell Stock with Transaction Fee
const P = [1, 3, 2, 8, 4, 9]

export const q0714: Solution = {
  id: 714,
  plain: '可以反覆買賣股票，但每次賣出要付手續費；求最後最多能賺多少。',
  statement: '給每日股價 prices 和每筆交易手續費 fee。可多次交易，但同一時間只能持有一股；每次完成買賣付一次 fee。求最大利潤。',
  examples: [{ input: 'prices = [1,3,2,8,4,9], fee = 2', output: '8' }, { input: 'prices = [1,3,7,5,10,3], fee = 3', output: '6' }],
  constraints: ['1 ≤ prices.length ≤ 5×10⁴；價格和 fee 都是正整數。'],
  insight: ['每天結束只需分兩種狀態：手上有股、手上沒股。', '今天持股可能是昨天已持有，或今天買入；今天空手可能是昨天已空手，或今天賣出。', '這是 [[p:state-machine-dp]]；交易費在賣出時扣一次。'],
  approaches: [
    {
      name: '兩個狀態的動態規劃',
      idea: 'hold 與 cash 各代表當天結束時，持股或空手的最大收益。',
      steps: ['起始 cash=0、hold=−prices[0]。', '逐日以舊狀態更新：新 cash=max(cash,hold+price−fee)，新 hold=max(hold,cash−price)。', '最後必須空手，回傳 cash。'],
      figure: { title: 'prices = [1,3,2,8,4,9], fee = 2', steps: [
        { note: '第 0 天價格 1：不買收益 0；買入後持股收益 −1。', views: [arr([0, -1], { label: 'cash / hold' })] },
        { note: '價格 3、2 時，賣出還不划算；cash=0、hold=−1。', views: [arr([0, -1], { label: '第 2 天 cash / hold' })] },
        { note: '價格 8 時賣出，−1+8−2=5；cash 變 5。', views: [arr([5, -1], { label: '第 3 天 cash / hold', highlight: [0] })] },
        { note: '價格 4 可再買，hold=5−4=1；最後價格 9 賣出得 1+9−2=8。', views: [arr([8, 1], { label: '最後 cash / hold', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每日常數次更新，只保存兩個狀態。' },
      verdict: '最推薦；也適用其他有手續費的交易題。',
      code: {
        python: `def maxProfit(prices, fee):
    cash = 0
    hold = -prices[0]
    for price in prices[1:]:
        next_cash = max(cash, hold + price - fee)  # 今天賣出
        next_hold = max(hold, cash - price)        # 今天買入
        cash, hold = next_cash, next_hold
    return cash`,
        c: `int maxProfit(int *prices, int pricesSize, int fee) {
    int cash = 0;
    int hold = -prices[0];
    for (int i = 1; i < pricesSize; i++) {
        int nextCash = cash > hold + prices[i] - fee ? cash : hold + prices[i] - fee;
        int nextHold = hold > cash - prices[i] ? hold : cash - prices[i];
        cash = nextCash;
        hold = nextHold;
    }
    return cash;
}`,
        cpp: `int maxProfit(vector<int>& prices, int fee) {
    int cash = 0;
    int hold = -prices[0];
    for (int i = 1; i < (int)prices.size(); i++) {
        int nextCash = max(cash, hold + prices[i] - fee);
        int nextHold = max(hold, cash - prices[i]);
        cash = nextCash;
        hold = nextHold;
    }
    return cash;
}`,
        java: `int maxProfit(int[] prices, int fee) {
    int cash = 0;
    int hold = -prices[0];
    for (int i = 1; i < prices.length; i++) {
        int nextCash = Math.max(cash, hold + prices[i] - fee);
        int nextHold = Math.max(hold, cash - prices[i]);
        cash = nextCash;
        hold = nextHold;
    }
    return cash;
}`,
        javascript: `function maxProfit(prices, fee) {
  let cash = 0;
  let hold = -prices[0];
  for (let i = 1; i < prices.length; i++) {
    const nextCash = Math.max(cash, hold + prices[i] - fee);
    const nextHold = Math.max(hold, cash - prices[i]);
    cash = nextCash;
    hold = nextHold;
  }
  return cash;
}`,
      },
    },
    {
      name: '貪心維護有效買入成本',
      idea: '把買入成本連手續費一起記；價格高於成本就先收下利潤，並把成本更新成可續抱的價格。',
      steps: ['cost=首日價格+fee，profit=0。', '價格低於 cost 就換成較便宜的買點。', '價格高於 cost 就把差額加進利潤，並把 cost 改成當前價，供後續上漲延續。'],
      figure: { title: 'prices = [1,3,2,8,4,9], fee = 2', steps: [
        { note: '首日買入成本含手續費是 1+2=3。', views: [arr([1, 3], { label: '價格 / 有效成本' })] },
        { note: '3 沒有超過成本；2 使有效成本維持 3。', views: [arr([3, 2], { label: '後續價格' })] },
        { note: '8 超過成本 3，先收 5；更新成本為 8，表示繼續持有仍可接住後面的漲幅。', views: [arr([5, 8], { label: '利潤 / 成本', highlight: [0] })] },
        { note: '4 降低新買點成本至 6；9 再加 3，總利潤 8。', views: [arr([8], { label: '最終利潤', done: [0] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每天只比較價格和有效成本。' },
      verdict: '程式簡短，但成本更新為當前價的意義需要仔細理解。',
      code: {
        python: `def maxProfit(prices, fee):
    cost = prices[0] + fee
    profit = 0
    for price in prices[1:]:
        if price + fee < cost:
            cost = price + fee            # 找到更低的買點
        elif price > cost:
            profit += price - cost
            cost = price                  # 延續上漲，不重收手續費
    return profit`,
        c: `int maxProfit(int *prices, int pricesSize, int fee) {
    int cost = prices[0] + fee;
    int profit = 0;
    for (int i = 1; i < pricesSize; i++) {
        int price = prices[i];
        if (price + fee < cost) {
            cost = price + fee;
        } else if (price > cost) {
            profit += price - cost;
            cost = price;
        }
    }
    return profit;
}`,
        cpp: `int maxProfit(vector<int>& prices, int fee) {
    int cost = prices[0] + fee;
    int profit = 0;
    for (int i = 1; i < (int)prices.size(); i++) {
        int price = prices[i];
        if (price + fee < cost) {
            cost = price + fee;
        } else if (price > cost) {
            profit += price - cost;
            cost = price;
        }
    }
    return profit;
}`,
        java: `int maxProfit(int[] prices, int fee) {
    int cost = prices[0] + fee;
    int profit = 0;
    for (int i = 1; i < prices.length; i++) {
        int price = prices[i];
        if (price + fee < cost) {
            cost = price + fee;
        } else if (price > cost) {
            profit += price - cost;
            cost = price;
        }
    }
    return profit;
}`,
        javascript: `function maxProfit(prices, fee) {
  let cost = prices[0] + fee;
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    const price = prices[i];
    if (price + fee < cost) {
      cost = price + fee;
    } else if (price > cost) {
      profit += price - cost;
      cost = price;
    }
  }
  return profit;
}`,
      },
    },
  ],
  pitfalls: ['同一時間只能持有一股，不能同時買進多股。', '每筆交易只扣一次費；狀態 DP 選在賣出時扣。', '必須以空手狀態的利潤作答案。'],
  check: { kind: 'fn', fn: 'maxProfit', cases: [
    { args: [P, 2], out: 8 }, { args: [[1, 3, 7, 5, 10, 3], 3], out: 6 }, { args: [[1], 2], out: 0 }, { args: [[1, 10], 2], out: 7 },
  ] },
}
