import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

function subsetFig(): FigStep[] {
  const prices = [1, 12, 5, 111, 200, 1000, 10], budget = 50, out: FigStep[] = []
  let best = 0
  for (let mask = 0; mask < (1 << prices.length); mask++) {
    let sum = 0, count = 0
    for (let i = 0; i < prices.length; i++) if (mask & (1 << i)) { sum += prices[i]; count++ }
    if (sum <= budget) best = Math.max(best, count)
    if (mask < 6 || (sum <= budget && count === 4)) out.push({ note: `選擇遮罩 ${mask}：總價 ${sum}，${sum <= budget ? `可買 ${count} 件，當前最多 ${best} 件` : '超過預算，捨棄'}`, views: [arr(prices, { label: '價格', highlight: prices.flatMap((_, i) => mask & (1 << i) ? [i] : []) }), arr([sum, count, best], { label: '總價 / 件數 / 最佳' })] })
  }
  return out
}

function sortedFig(): FigStep[] {
  const prices = [1, 12, 5, 111, 200, 1000, 10].sort((a, b) => a - b), out: FigStep[] = []
  let spent = 0, count = 0
  for (let i = 0; i < prices.length; i++) {
    const fit = spent + prices[i] <= 50
    if (fit) { spent += prices[i]; count++ }
    out.push({ note: `第 ${i + 1} 個最便宜的玩具要 ${prices[i]}；${fit ? `買下後花 ${spent}，共 ${count} 件` : `${spent}+${prices[i]}>50，之後只會更貴，停止`}`, views: [arr(prices, { label: '排序後價格', highlight: [i], done: Array.from({ length: count }, (_, k) => k) }), arr([spent, 50 - spent, count], { label: '已花 / 餘額 / 件數' })] })
    if (!fit) break
  }
  return out
}

export const hrMarkAndToys: HrSolution = {
  slug: 'mark-and-toys',
  plain: '帶固定預算逛玩具店，想把袋子裝得最多件，就先挑便宜的，而不是先挑最喜歡的高價玩具。',
  statement: '輸入每個玩具的價格 prices 和總預算 k。每件玩具最多買一次，總花費不可超過 k；回傳最多可購買的件數。',
  examples: [
    { input: 'prices = [1,12,5,111,200,1000,10], k = 50', output: '4', note: '選 1、5、10、12，共花 28；第五便宜的要 111。' },
    { input: 'prices = [1,2,3,4], k = 7', output: '3', note: '前三件花 6，四件共花 10，超出預算。' },
  ],
  constraints: [
    '1 ≤ prices 長度 ≤ 10^5 → 不能枚舉全部 2^n 種購物組合。',
    '價格都是正整數 → 加入更多玩具只會增加花費；一旦排序後某件買不起，後面也買不起。',
    '預算最多 10^9 → 貪心法只累加不超過 k 的花費,32 位元整數裝得下;枚舉法會累加超出預算的組合,總價要用 64 位元。',
  ],
  insight: [
    '最直接是枚舉每件買或不買，檢查所有組合，卻有指數數量。',
    '若選了較貴玩具而漏選較便宜玩具，交換兩者不會增加件數，還會減少花費。',
    '反覆交換後，最佳選法必是排序後的某個前綴；所以排序並從便宜到貴購買，這是 [[p:greedy]]。',
  ],
  approaches: [
    {
      name: '枚舉購物組合',
      idea: '每件都試買與不買，從合法組合挑件數最大者。',
      steps: ['用位元遮罩表示每一種購買組合。', '掃組合中每個玩具，累加價格和件數。', '總價未超過 k 時更新最多件數。'],
      figure: { title: 'prices = [1,12,5,111,200,1000,10]，k = 50', steps: subsetFig() },
      complexity: { time: 'O(n × 2^n)', space: 'O(1)', why: '2^n 個組合各掃 n 件；只保存加總。' },
      verdict: '只適合很小的 n(例如 n ≤ 20),用來建立正確性基準,無法處理本題上限;而且遮罩是固定寬度整數,n ≥ 63 時位移本身就會出錯。',
      code: {
        python: `def maximumToys(prices, k):
    best = 0
    n = len(prices)
    for mask in range(1 << n):
        cost = 0
        count = 0
        for i in range(n):
            if mask & (1 << i):
                cost += prices[i]
                count += 1
        if cost <= k:  # 只比較預算內的組合
            best = max(best, count)
    return best`,
        c: `int maximumToys(int prices_count, int* prices, int k) {
    int best = 0;
    for (unsigned long long mask = 0; mask < (1ULL << prices_count); mask++) {
        long long cost = 0;
        int count = 0;
        for (int i = 0; i < prices_count; i++) {
            if (mask & (1ULL << i)) {
                cost += prices[i];
                count++;
            }
        }
        if (cost <= k && count > best) best = count;
    }
    return best;
}`,
        cpp: `int maximumToys(vector<int> prices, int k) {
    int best = 0, n = prices.size();
    for (unsigned long long mask = 0; mask < (1ULL << n); mask++) {
        long long cost = 0;
        int count = 0;
        for (int i = 0; i < n; i++) {
            if (mask & (1ULL << i)) {
                cost += prices[i];
                count++;
            }
        }
        if (cost <= k) best = max(best, count);
    }
    return best;
}`,
        java: `public static int maximumToys(List<Integer> prices, int k) {
    int best = 0, n = prices.size();
    for (long mask = 0; mask < (1L << n); mask++) {
        long cost = 0;
        int count = 0;
        for (int i = 0; i < n; i++) {
            if ((mask & (1L << i)) != 0) {
                cost += prices.get(i);
                count++;
            }
        }
        if (cost <= k) best = Math.max(best, count);
    }
    return best;
}`,
        javascript: `function maximumToys(prices, k) {
  let best = 0;
  for (let mask = 0; mask < 2 ** prices.length; mask++) {
    let cost = 0;
    let count = 0;
    for (let i = 0; i < prices.length; i++) {
      if (Math.floor(mask / 2 ** i) % 2) {
        cost += prices[i];
        count++;
      }
    }
    if (cost <= k) best = Math.max(best, count);
  }
  return best;
}`,
      },
    },
    {
      name: '排序後從便宜買起',
      idea: '要最大化件數，每次買目前最便宜且買得起的玩具。',
      steps: ['將價格由小到大排序。', '維護已花金額 spent 與件數 count。', '依序檢查價格；若加入後不超過 k，就買下並更新。', '第一件買不起時停止，回傳 count。'],
      figure: { title: 'prices = [1,12,5,111,200,1000,10]，k = 50', steps: sortedFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) 額外', why: '排序主導時間；排序後只掃一次。實際排序函式可能另用暫存空間。' },
      verdict: '本題標準解，交換論證保證不會因貪心選便宜貨而失去更好的件數。',
      code: {
        python: `def maximumToys(prices, k):
    prices.sort()
    spent = 0
    count = 0
    for price in prices:
        if spent + price > k:  # 後面只會更貴
            break
        spent += price
        count += 1
    return count`,
        c: `int comparePrices(const void* a, const void* b) {
    int x = *(const int*)a, y = *(const int*)b;
    return (x > y) - (x < y);
}

int maximumToys(int prices_count, int* prices, int k) {
    qsort(prices, prices_count, sizeof(int), comparePrices);
    long long spent = 0;
    int count = 0;
    for (int i = 0; i < prices_count; i++) {
        if (spent + prices[i] > k) break;
        spent += prices[i];
        count++;
    }
    return count;
}`,
        cpp: `int maximumToys(vector<int> prices, int k) {
    sort(prices.begin(), prices.end());
    long long spent = 0;
    int count = 0;
    for (int price : prices) {
        if (spent + price > k) break;
        spent += price;
        count++;
    }
    return count;
}`,
        java: `public static int maximumToys(List<Integer> prices, int k) {
    Collections.sort(prices);
    long spent = 0;
    int count = 0;
    for (int price : prices) {
        if (spent + price > k) break;
        spent += price;
        count++;
    }
    return count;
}`,
        javascript: `function maximumToys(prices, k) {
  prices.sort((a, b) => a - b);
  let spent = 0;
  let count = 0;
  for (const price of prices) {
    if (spent + price > k) break;
    spent += price;
    count++;
  }
  return count;
}`,
      },
    },
  ],
  pitfalls: [
    'JavaScript 的 sort 要提供數值比較函式，否則按字典序排列。',
    '價格可以等於剩餘預算，條件應為 `spent + price > k` 才停止。',
    '若第一件就買不起，答案為 0；別預設至少買一件。',
  ],
  check: {
    kind: 'fn', fn: 'maximumToys',
    cases: [
      { args: [[1, 12, 5, 111, 200, 1000, 10], 50], out: 4 },
      { args: [[1, 2, 3, 4], 7], out: 3 },
      { args: [[5], 4], out: 0 },
      { args: [[5], 5], out: 1 },
      { args: [[2, 2, 2], 4], out: 2 },
      { args: [[10, 1, 2], 3], out: 2 },
    ],
  },
}
