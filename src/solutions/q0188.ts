import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

const P = [3, 2, 6, 5, 0, 3]

function tableFig(): FigStep[] {
  return [
    { note: 'k=2。每天分「手上持股 buy[t]」與「手上現金 sell[t]」；t 表示最多可完成幾筆交易。第一天價 3，買入後是 −3。', views: [kv([['buy[1]', -3], ['sell[1]', 0], ['buy[2]', -3], ['sell[2]', 0]], '第 0 天')] },
    { note: '價格降到 2，把持股狀態改善為 −2；價格升到 6，第一次賣出可賺 6−2=4。', views: [arr(P, { label: '價格', highlight: [1, 2] }), kv([['sell[1]', 4]], '第 2 天')] },
    { note: '之後價格落到 0，可用第一筆賺得的 4 再買，第二筆持股狀態 buy[2]=4−0=4。', views: [arr(P, { label: '價格', highlight: [4] }), kv([['buy[2]', 4]], '第 4 天')] },
    { note: '最後價格 3 賣出第二筆，sell[2]=4+3=7；兩筆交易分別賺 4 和 3。', views: [kv([['第一次', '2→6，賺 4'], ['第二次', '0→3，賺 3'], ['總計', 7]], '答案')] },
  ]
}

function rollFig(): FigStep[] {
  return [
    { note: '只保留今天所需的 k 組 buy、sell，不用保存過去每一天的整張表。', views: [kv([['buy[1]', '-∞'], ['sell[1]', 0], ['buy[2]', '-∞'], ['sell[2]', 0]], '初始')] },
    { note: '掃到價 2 時，buy[1]=−2；掃到價 6 時，sell[1]=4，表示完成一次交易的最佳利潤。', views: [arr(P, { label: '價格', highlight: [1, 2] }), kv([['buy[1]', -2], ['sell[1]', 4]], '目前最佳')] },
    { note: '掃到價 0 時，buy[2]=sell[1]−0=4；此數可為正，因為裡面含第一筆已實現利潤。', views: [arr(P, { label: '價格', highlight: [4] }), kv([['buy[2]', 4]], '目前最佳')] },
    { note: '價 3 時更新 sell[2]=max(舊值,4+3)=7，回傳 7。', views: [kv([['sell[2]', 7]], '答案')] },
  ]
}

export const q0188: Solution = {
  id: 188,
  plain: '給每天股價，最多做 k 次買進再賣出的交易，求最大利潤；同時只能持有一股。',
  statement: '給整數 k 與 prices，最多完成 k 筆交易（一次買進和一次賣出），不可同時持有多股，求最大利潤。可以選擇不交易。',
  examples: [{ input: 'k = 2, prices = [2,4,1]', output: '2' }, { input: 'k = 2, prices = [3,2,6,5,0,3]', output: '7' }],
  constraints: ['`1 ≤ k ≤ 100`', '`1 ≤ prices.length ≤ 1000`', '`0 ≤ prices[i] ≤ 1000`'],
  insight: ['每天有「持股」與「空手」兩種狀態；買入只能從少一筆的空手狀態來，賣出只能從對應持股狀態來。', '[[p:state-machine-dp]] 可以先寫成每天一列的表，再發現今天只依賴昨天，壓縮到 O(k) 空間。'],
  approaches: [
    {
      name: '每日買賣狀態表',
      idea: '`buy[day][t]` 是最多 t 筆交易且當日持股的最大利潤；`sell[day][t]` 是空手的最大利潤。',
      steps: ['第一天 buy[t]=−prices[0]、sell[t]=0。', '每天用昨天狀態更新 `buy[d][t]=max(舊買入, sell[d−1][t−1]−price)`。', '更新 `sell[d][t]=max(舊賣出, buy[d−1][t]+price)`。', '答案為最後一天 sell[k]。'],
      figure: { title: 'k = 2, prices = [3,2,6,5,0,3]', steps: tableFig() },
      complexity: { time: 'O(nk)', space: 'O(nk)', why: '每天計算 k 組買賣狀態，保存完整表。' },
      verdict: '狀態來源清楚，適合先理解交易次數怎麼計。',
      code: {
        python: `def maxProfit(k, prices):
    if not prices or k == 0:
        return 0
    n = len(prices)
    buy = [[0] * (k + 1) for _ in range(n)]
    sell = [[0] * (k + 1) for _ in range(n)]
    for t in range(1, k + 1):
        buy[0][t] = -prices[0]  # 第一天買入
    for day in range(1, n):
        price = prices[day]
        for t in range(1, k + 1):
            buy[day][t] = max(buy[day - 1][t], sell[day - 1][t - 1] - price)
            sell[day][t] = max(sell[day - 1][t], buy[day - 1][t] + price)
    return sell[-1][k]`,
        c: `int maxProfit(int k, int *prices, int pricesSize) {
    if (pricesSize == 0 || k == 0) {
        return 0;
    }
    int width = k + 1;
    int *buy = calloc(pricesSize * width, sizeof(int));
    int *sell = calloc(pricesSize * width, sizeof(int));
    for (int t = 1; t <= k; t++) {
        buy[t] = -prices[0];
    }
    for (int day = 1; day < pricesSize; day++) {
        for (int t = 1; t <= k; t++) {
            int keepBuy = buy[(day - 1) * width + t];
            int newBuy = sell[(day - 1) * width + t - 1] - prices[day];
            buy[day * width + t] = keepBuy > newBuy ? keepBuy : newBuy;
            int keepSell = sell[(day - 1) * width + t];
            int newSell = keepBuy + prices[day];
            sell[day * width + t] = keepSell > newSell ? keepSell : newSell;
        }
    }
    int answer = sell[(pricesSize - 1) * width + k];
    free(buy);
    free(sell);
    return answer;
}`,
        cpp: `int maxProfit(int k, vector<int>& prices) {
    if (prices.empty() || k == 0) {
        return 0;
    }
    int n = prices.size();
    vector<vector<int>> buy(n, vector<int>(k + 1, 0));
    vector<vector<int>> sell(n, vector<int>(k + 1, 0));
    for (int t = 1; t <= k; t++) {
        buy[0][t] = -prices[0];
    }
    for (int day = 1; day < n; day++) {
        for (int t = 1; t <= k; t++) {
            buy[day][t] = max(buy[day - 1][t], sell[day - 1][t - 1] - prices[day]);
            sell[day][t] = max(sell[day - 1][t], buy[day - 1][t] + prices[day]);
        }
    }
    return sell[n - 1][k];
}`,
        java: `int maxProfit(int k, int[] prices) {
    if (prices.length == 0 || k == 0) {
        return 0;
    }
    int n = prices.length;
    int[][] buy = new int[n][k + 1];
    int[][] sell = new int[n][k + 1];
    for (int t = 1; t <= k; t++) {
        buy[0][t] = -prices[0];
    }
    for (int day = 1; day < n; day++) {
        for (int t = 1; t <= k; t++) {
            buy[day][t] = Math.max(buy[day - 1][t], sell[day - 1][t - 1] - prices[day]);
            sell[day][t] = Math.max(sell[day - 1][t], buy[day - 1][t] + prices[day]);
        }
    }
    return sell[n - 1][k];
}`,
        javascript: `function maxProfit(k, prices) {
  if (!prices.length || k === 0) {
    return 0;
  }
  const n = prices.length;
  const buy = Array.from({ length: n }, () => new Array(k + 1).fill(0));
  const sell = Array.from({ length: n }, () => new Array(k + 1).fill(0));
  for (let t = 1; t <= k; t++) {
    buy[0][t] = -prices[0];
  }
  for (let day = 1; day < n; day++) {
    for (let t = 1; t <= k; t++) {
      buy[day][t] = Math.max(buy[day - 1][t], sell[day - 1][t - 1] - prices[day]);
      sell[day][t] = Math.max(sell[day - 1][t], buy[day - 1][t] + prices[day]);
    }
  }
  return sell[n - 1][k];
}`,
      },
    },
    {
      name: '壓縮成 k 組狀態',
      idea: '每天只需上一天的 k 組買賣結果，原地更新 buy[t]、sell[t]。',
      steps: ['buy[t] 設為負無窮、sell[t] 設為 0。', '每天對 t=1..k 更新買入與賣出狀態。', '同一天賣出又買入不增加利潤，因此原地更新不影響最佳值。', '回傳 sell[k]。'],
      figure: { title: 'k = 2, prices = [3,2,6,5,0,3]', steps: rollFig() },
      complexity: { time: 'O(nk)', space: 'O(k)', why: '每個價格更新 k 組狀態，只保留當前最佳值。' },
      verdict: '推薦解法，記憶體只與最多交易數有關。',
      code: {
        python: `def maxProfit(k, prices):
    buy = [float('-inf')] * (k + 1)
    sell = [0] * (k + 1)
    for price in prices:
        for t in range(1, k + 1):
            buy[t] = max(buy[t], sell[t - 1] - price)  # 買入第 t 筆
            sell[t] = max(sell[t], buy[t] + price)  # 賣出第 t 筆
    return sell[k]`,
        c: `int maxProfit(int k, int *prices, int pricesSize) {
    int *buy = malloc((k + 1) * sizeof(int));
    int *sell = calloc(k + 1, sizeof(int));
    for (int t = 0; t <= k; t++) {
        buy[t] = INT_MIN / 2;
    }
    for (int day = 0; day < pricesSize; day++) {
        for (int t = 1; t <= k; t++) {
            int candidateBuy = sell[t - 1] - prices[day];
            if (candidateBuy > buy[t]) {
                buy[t] = candidateBuy;
            }
            int candidateSell = buy[t] + prices[day];
            if (candidateSell > sell[t]) {
                sell[t] = candidateSell;
            }
        }
    }
    int answer = sell[k];
    free(buy);
    free(sell);
    return answer;
}`,
        cpp: `int maxProfit(int k, vector<int>& prices) {
    vector<int> buy(k + 1, INT_MIN / 2);
    vector<int> sell(k + 1, 0);
    for (int price : prices) {
        for (int t = 1; t <= k; t++) {
            buy[t] = max(buy[t], sell[t - 1] - price);
            sell[t] = max(sell[t], buy[t] + price);
        }
    }
    return sell[k];
}`,
        java: `int maxProfit(int k, int[] prices) {
    int[] buy = new int[k + 1];
    int[] sell = new int[k + 1];
    Arrays.fill(buy, Integer.MIN_VALUE / 2);
    for (int price : prices) {
        for (int t = 1; t <= k; t++) {
            buy[t] = Math.max(buy[t], sell[t - 1] - price);
            sell[t] = Math.max(sell[t], buy[t] + price);
        }
    }
    return sell[k];
}`,
        javascript: `function maxProfit(k, prices) {
  const buy = new Array(k + 1).fill(-Infinity);
  const sell = new Array(k + 1).fill(0);
  for (const price of prices) {
    for (let t = 1; t <= k; t++) {
      buy[t] = Math.max(buy[t], sell[t - 1] - price);
      sell[t] = Math.max(sell[t], buy[t] + price);
    }
  }
  return sell[k];
}`,
      },
    },
  ],
  pitfalls: ['買入第 t 筆應從已完成 t−1 筆的空手狀態轉移。', '沒有價格或 k=0 時答案是 0，不能索引第一天的股價。'],
  check: { kind: 'fn', fn: 'maxProfit', cases: [{ args: [2, [2, 4, 1]], out: 2 }, { args: [2, P], out: 7 }, { args: [0, P], out: 0 }, { args: [2, []], out: 0 }, { args: [3, [1, 2, 3, 4, 5]], out: 4 }] },
}
