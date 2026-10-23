import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 123. Best Time to Buy and Sell Stock III
const P = [3,3,5,0,0,3,1,4]
const fig = [
  { note: '正向掃描前幾天，價格 3、3、5 讓第一筆交易最高賺 2；遇到價格 0 時，最低買價改為 0。', views: [arr(P, { label: '正向掃描', highlight: [0,1,2,3] })] },
  { note: '最多兩筆交易：低價買、高價賣，且賣完第一筆才能開始第二筆。這裡 0→3 利潤 3、1→4 利潤 3。', views: [arr(P, { label: 'prices', highlight: [4,5,6,7], dim: [0,1,2,3] })] },
  { note: '把分界放在第 5 天；左段最佳利潤 3，右段最佳利潤 3，合計 6。', views: [arr([0,0,2,2,2,3,3,4], { label: 'left[i]：前 i 天最多一筆', highlight: [5] }), arr([4,4,4,4,4,3,3,0], { label: 'right[i]：從 i 天起最多一筆', highlight: [6] })] },
  { note: '比較其他分界後，兩段利潤的最大總和仍是 6，因此回傳 6。', views: [arr([6], { label: '最大總利潤', done: [0] })] },
]

export const q0123: Solution = {
  id: 123,
  plain: '股票可買賣最多兩次；挑兩段先買後賣的價差，讓總獲利最大。',
  statement: '給每日股價 prices，最多完成兩筆不能重疊的交易，回傳最大利潤；可以不交易。',
  examples: [{ input: 'prices = [3,3,5,0,0,3,1,4]', output: '6' }, { input: 'prices = [1,2,3,4,5]', output: '4' }, { input: 'prices = [7,6,4,3,1]', output: '0' }],
  constraints: ['1 ≤ prices.length ≤ 10⁵。', '持有股票時不能再買進；每筆交易必須先買後賣。'],
  insight: ['可枚舉兩筆交易的分界：左段最多一筆、右段最多一筆。', '更省空間：維持買第一次、賣第一次、買第二次、賣第二次的最佳資產值。', '狀態更新是 [[p:state-machine-dp]]；第 t 天的每個狀態只依賴先前狀態。'],
  approaches: [
    { name: '前後綴單筆利潤', idea: 'left[i] 是截至 i 的最佳一筆，right[i] 是從 i 開始的最佳一筆。', steps: ['正向掃描，保存最低買價與 left。一筆交易必須先買後賣，狀態或分界都要遵守時間順序。', '反向掃描，保存最高賣價與 right。每個新價格只在能改善獲利時更新對應的最佳狀態。', '對每個分界 i，比較 left[i]+right[i+1]。最後比較所有合法分界或賣出狀態，得到最多兩筆交易的獲利。'], figure: { title: 'prices = [3,3,5,0,0,3,1,4]', steps: fig }, complexity: { time: 'O(n)', space: 'O(n)', why: '兩次掃描，保存兩個長度 n 陣列。' }, verdict: '容易看出兩筆交易的時間順序。', code: {
      python: `def maxProfit(prices):
    n = len(prices)
    left = [0] * n
    right = [0] * n
    low = prices[0]
    for i in range(1, n):  # 正向掃描，記下當天以前的一筆交易最佳利潤。
        low = min(low, prices[i])
        left[i] = max(left[i - 1], prices[i] - low)
    high = prices[-1]
    for i in range(n - 2, -1, -1):  # 反向掃描，記下當天以後的一筆交易最佳利潤。
        high = max(high, prices[i])
        right[i] = max(right[i + 1], high - prices[i])
    return max((left[i] + (right[i + 1] if i + 1 < n else 0) for i in range(n)))`,
      c: `int maxProfit(int *p, int n) {
    int *l = calloc(n, sizeof(int)), *r = calloc(n, sizeof(int)), low = p[0], high = p[n - 1], ans = 0;
    for (int i = 1; i < n; i++) {
        if (p[i] < low)
            low = p[i];
        int v = p[i] - low;
        l[i] = l[i - 1] > v ? l[i - 1] : v;
    }
    for (int i = n - 2; i >= 0; i--) {
        if (p[i] > high)
            high = p[i];
        int v = high - p[i];
        r[i] = r[i + 1] > v ? r[i + 1] : v;
    }
    for (int i = 0; i < n; i++) {
        int v = l[i] + (i + 1 < n ? r[i + 1] : 0);
        if (v > ans)
            ans = v;
    }
    free(l);
    free(r);
    return ans;
}`,
      cpp: `int maxProfit(vector<int>& p) {
    int n = p.size(), low = p[0], high = p.back(), ans = 0;
    vector<int> l(n), r(n);
    for (int i = 1; i < n; i++) {
        low = min(low, p[i]);
        l[i] = max(l[i - 1], p[i] - low);
    }
    for (int i = n - 2; i >= 0; i--) {
        high = max(high, p[i]);
        r[i] = max(r[i + 1], high - p[i]);
    }
    for (int i = 0; i < n; i++)
        ans = max(ans, l[i] + (i + 1 < n ? r[i + 1] : 0));
    return ans;
}`,
      java: `int maxProfit(int[] p) {
    int n = p.length, low = p[0], high = p[n - 1], ans = 0;
    int[] l = new int[n], r = new int[n];
    for (int i = 1; i < n; i++) {
        low = Math.min(low, p[i]);
        l[i] = Math.max(l[i - 1], p[i] - low);
    }
    for (int i = n - 2; i >= 0; i--) {
        high = Math.max(high, p[i]);
        r[i] = Math.max(r[i + 1], high - p[i]);
    }
    for (int i = 0; i < n; i++)
        ans = Math.max(ans, l[i] + (i + 1 < n ? r[i + 1] : 0));
    return ans;
}`,
      javascript: `function maxProfit(p) {
    const n = p.length, l = Array(n).fill(0), r = Array(n).fill(0);
    let low = p[0], high = p[n - 1], ans = 0;
    for (let i = 1; i < n; i++) {
        low = Math.min(low, p[i]);
        l[i] = Math.max(l[i - 1], p[i] - low);
    }
    for (let i = n - 2; i >= 0; i--) {
        high = Math.max(high, p[i]);
        r[i] = Math.max(r[i + 1], high - p[i]);
    }
    for (let i = 0; i < n; i++)
        ans = Math.max(ans, l[i] + (i + 1 < n ? r[i + 1] : 0));
    return ans;
}`,
    } },
    { name: '四狀態動態規劃', idea: '每個價位更新第一次買後、第一次賣後、第二次買後、第二次賣後的最佳資產。', steps: ['buy1=buy2=−∞，sell1=sell2=0。一筆交易必須先買後賣，狀態或分界都要遵守時間順序。', '每個價格 p：buy1=max(buy1,−p)、sell1=max(sell1,buy1+p)。每個新價格只在能改善獲利時更新對應的最佳狀態。', 'buy2=max(buy2,sell1−p)、sell2=max(sell2,buy2+p)。最後比較所有合法分界或賣出狀態，得到最多兩筆交易的獲利。'], figure: { title: 'prices = [3,3,5,0,0,3,1,4]', steps: [{ note: '第一天價格 3，買入後淨資產是 −3；兩個賣出狀態暫時都是 0。', views: [arr([-3,0,-3,0], { label: '買一／賣一／買二／賣二', highlight: [0] })] }, { note: '掃到價格 0，第一次買入狀態改善為 0；先前在價格 5 賣出的利潤 2 可用於第二次買入。', views: [arr([0,2,2,2], { label: '價格 0 後的四狀態', highlight: [0,2] })] }, { note: '最後價格 4 使第二次賣出的淨利達 6，因此回傳 sell2=6。', views: [arr([0,4,2,6], { label: '最後四狀態', done: [3] })] }] }, complexity: { time: 'O(n)', space: 'O(1)', why: '每天只更新四個狀態。' }, verdict: '最省空間；需理解買入狀態是扣除成本後的淨資產。', code: {
      python: `def maxProfit(prices):
    buy1 = buy2 = float('-inf')
    sell1 = sell2 = 0
    for p in prices:  # 依當天價格更新四種持有或賣出的最佳狀態。
        buy1 = max(buy1, -p)
        sell1 = max(sell1, buy1 + p)
        buy2 = max(buy2, sell1 - p)  # 第二次買入前，第一筆交易已經賣出。
        sell2 = max(sell2, buy2 + p)
    return sell2`,
      c: `int maxProfit(int *prices, int n) {
    int b1 = INT_MIN / 2, b2 = INT_MIN / 2, s1 = 0, s2 = 0;
    for (int i = 0; i < n; i++) {
        int p = prices[i];
        if (-p > b1)
            b1 = -p;
        if (b1 + p > s1)
            s1 = b1 + p;
        if (s1 - p > b2)
            b2 = s1 - p;
        if (b2 + p > s2)
            s2 = b2 + p;
    }
    return s2;
}`,
      cpp: `int maxProfit(vector<int>& prices) {
    int b1 = INT_MIN / 2, b2 = INT_MIN / 2, s1 = 0, s2 = 0;
    for (int p : prices) {
        b1 = max(b1, -p);
        s1 = max(s1, b1 + p);
        b2 = max(b2, s1 - p);
        s2 = max(s2, b2 + p);
    }
    return s2;
}`,
      java: `int maxProfit(int[] prices) {
    int b1 = Integer.MIN_VALUE / 2, b2 = Integer.MIN_VALUE / 2, s1 = 0, s2 = 0;
    for (int p : prices) {
        b1 = Math.max(b1, -p);
        s1 = Math.max(s1, b1 + p);
        b2 = Math.max(b2, s1 - p);
        s2 = Math.max(s2, b2 + p);
    }
    return s2;
}`,
      javascript: `function maxProfit(prices) {
    let b1 = -Infinity, b2 = -Infinity, s1 = 0, s2 = 0;
    for (const p of prices) {
        b1 = Math.max(b1, -p);
        s1 = Math.max(s1, b1 + p);
        b2 = Math.max(b2, s1 - p);
        s2 = Math.max(s2, b2 + p);
    }
    return s2;
}`,
    } },
  ],
  pitfalls: ['兩筆交易不可同時持有兩張股票。', '價格只下降時答案為 0。', '前後綴分界要使第二筆開始在第一筆結束之後。'],
  check: { kind: 'fn', fn: 'maxProfit', cases: [{ args: [P], out: 6 }, { args: [[1,2,3,4,5]], out: 4 }, { args: [[7,6,4,3,1]], out: 0 }, { args: [[1]], out: 0 }] },
}
