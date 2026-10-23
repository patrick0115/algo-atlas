import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 122. Best Time to Buy and Sell Stock II
const P = [7, 1, 5, 3, 6, 4]
const greedyFig: FigStep[] = [
  { note: '可以交易多次,但同時最多持有一股。只要隔天漲價,把這一段漲幅收下。', views: [arr(P, { label: '每日股價', mode: 'bars' })] },
  { note: '1 → 5 賺 4;3 → 6 賺 3,合計 7。連漲數天時逐日加漲幅與一次買低賣高等價。', views: [arr([0, 0, 4, 0, 3, 0], { label: '當天可收的漲幅', done: [2, 4] }), arr([7], { label: '總利潤', done: [0] })] },
]
const stateFig: FigStep[] = [
  { note: '每天收盤只需區分兩種狀態:手上沒股票 cash,或手上有一股 hold。', views: [arr([0, -7], { label: '起始 cash / hold' })] },
  { note: '賣出:cash = max(舊 cash,舊 hold + 今天價格);買入:hold = max(舊 hold,舊 cash − 今天價格)。', views: [arr([7, 3], { label: '結束 cash / hold', done: [0] })] },
]

export const q0122: Solution = {
  id: 122,
  plain: '已知每天股價,可以買賣很多次,但同時只能持有一股。想賺最多,就把每段上漲的價差都收進來。',
  statement: '給每日股價陣列 prices,可以多次買入與賣出,每次買入前必須先賣掉手上的股票。求最大總利潤。',
  examples: [
    { input: 'prices = [7,1,5,3,6,4]', output: '7' },
    { input: 'prices = [1,2,3,4,5]', output: '4' },
    { input: 'prices = [7,6,4,3,1]', output: '0' },
  ],
  constraints: ['至少 1 天,至多 30,000 天', '價格為非負整數'],
  insight: ['不收手續費、也沒有冷卻期;每段正的相鄰價差都能賺到。', '連續上漲時逐日交易與第一天買、最後一天賣獲利相同。', '也可用 [[p:state-machine-dp]] 描述每天持股與空手兩種狀態。'],
  approaches: [
    {
      name: '貪心:累加所有漲幅',
      idea: '若今天比昨天貴,把價差加入答案;跌價日不交易。',
      steps: ['profit = 0', '從第 2 天起比較今天與昨天', '若上漲,加入 prices[i]−prices[i−1]', '回傳 profit'],
      figure: { title: 'prices = [7,1,5,3,6,4]', steps: greedyFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只掃過價格一次。' },
      verdict: '本題沒有額外交易限制,因此最簡潔。',
      code: {
        python: `def maxProfit(prices):
    return sum(max(0, prices[i] - prices[i - 1]) for i in range(1, len(prices)))`,
        c: `int maxProfit(int *prices, int pricesSize) {
    int ans = 0;
    for (int i = 1; i < pricesSize; i++)
        if (prices[i] > prices[i - 1]) ans += prices[i] - prices[i - 1];
    return ans;
}`,
        cpp: `int maxProfit(vector<int>& prices) {
    int ans = 0;
    for (int i = 1; i < (int)prices.size(); i++)
        ans += max(0, prices[i] - prices[i - 1]);
    return ans;
}`,
        java: `int maxProfit(int[] prices) {
    int ans = 0;
    for (int i = 1; i < prices.length; i++)
        ans += Math.max(0, prices[i] - prices[i - 1]);
    return ans;
}`,
        javascript: `function maxProfit(prices) {
  let ans = 0;
  for (let i = 1; i < prices.length; i++)
    ans += Math.max(0, prices[i] - prices[i - 1]);
  return ans;
}`,
      },
    },
    {
      name: '持股與空手狀態 DP',
      idea: '每天更新 cash 與 hold;交易前的舊狀態決定今天是否買入或賣出。',
      steps: ['cash = 0,hold = −prices[0]', '每天先保存舊 cash 與 hold', 'cash = max(舊 cash,舊 hold+價);hold = max(舊 hold,舊 cash−價)', '回傳 cash'],
      figure: { title: '兩個交易狀態', steps: stateFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每天更新兩個數。' },
      verdict: '比貪心稍長,但容易延伸到手續費、冷卻期等變形。',
      code: {
        python: `def maxProfit(prices):
    cash, hold = 0, -prices[0]
    for price in prices[1:]:
        cash, hold = max(cash, hold + price), max(hold, cash - price)
    return cash`,
        c: `int maxProfit(int *prices, int pricesSize) {
    int cash = 0, hold = -prices[0];
    for (int i = 1; i < pricesSize; i++) {
        int oldCash = cash, oldHold = hold;
        cash = oldCash > oldHold + prices[i] ? oldCash : oldHold + prices[i];
        hold = oldHold > oldCash - prices[i] ? oldHold : oldCash - prices[i];
    }
    return cash;
}`,
        cpp: `int maxProfit(vector<int>& prices) {
    int cash = 0, hold = -prices[0];
    for (int price : prices) {
        int oldCash = cash, oldHold = hold;
        cash = max(oldCash, oldHold + price);
        hold = max(oldHold, oldCash - price);
    }
    return cash;
}`,
        java: `int maxProfit(int[] prices) {
    int cash = 0, hold = -prices[0];
    for (int price : prices) {
        int oldCash = cash, oldHold = hold;
        cash = Math.max(oldCash, oldHold + price);
        hold = Math.max(oldHold, oldCash - price);
    }
    return cash;
}`,
        javascript: `function maxProfit(prices) {
  let cash = 0, hold = -prices[0];
  for (const price of prices) {
    const oldCash = cash, oldHold = hold;
    cash = Math.max(oldCash, oldHold + price);
    hold = Math.max(oldHold, oldCash - price);
  }
  return cash;
}`,
      },
    },
  ],
  pitfalls: ['同時只能持有一股,不能在尚未賣出時再買。', '下降的價差不該加入答案。', '狀態 DP 更新時使用同一天更新前的舊值最容易看清轉移。'],
  check: { kind: 'fn', fn: 'maxProfit', cases: [
    { args: [P], out: 7 }, { args: [[1, 2, 3, 4, 5]], out: 4 },
    { args: [[7, 6, 4, 3, 1]], out: 0 }, { args: [[5]], out: 0 },
  ] },
}
