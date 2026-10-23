import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1423. Maximum Points You Can Obtain from Cards

const C = [1, 2, 3, 4, 5, 6, 1]
const K = 3

function splitFig(): FigStep[] {
  const n = C.length
  let left = 0
  let right = C.slice(n - K).reduce((a, b) => a + b, 0)
  const out: FigStep[] = [{ note: `每次只能從頭或尾拿一張,總共 ${K} 張 → 結果一定是「左邊拿 i 張 + 右邊拿 ${K} − i 張」。先試左邊 0 張、右邊 ${K} 張:${right}`, views: [arr(C, { label: 'cardPoints', highlight: Array.from({ length: K }, (_, t) => n - K + t) })] }]
  let best = right
  for (let i = 1; i <= K; i++) {
    left += C[i - 1]
    right -= C[n - K + i - 1]
    best = Math.max(best, left + right)
    out.push({ note: `左邊 ${i} 張、右邊 ${K - i} 張:把右邊最內側那張換成左邊的下一張 → ${left} + ${right} = ${left + right},最大 ${best}`, views: [arr(C, { label: 'cardPoints', highlight: [...Array.from({ length: i }, (_, t) => t), ...Array.from({ length: K - i }, (_, t) => n - K + i + t)] })] })
  }
  return out
}

function midFig(): FigStep[] {
  const n = C.length
  const total = C.reduce((a, b) => a + b, 0)
  return [
    { note: `反過來想:拿走的 ${K} 張在兩端,剩下的 ${n - K} 張一定是**中間連續的一段**。總和 ${total} 固定 → 讓中間那段最小`, views: [arr(C, { label: 'cardPoints', range: [0, n - K - 1] })] },
    { note: `長度 ${n - K} 的視窗滑一遍,最小和是 [1,2,3,4] = 10 → 答案 ${total} − 10 = ${total - 10}`, views: [arr(C, { label: 'cardPoints', range: [0, n - K - 1], done: [4, 5, 6] })] },
  ]
}

export const q1423: Solution = {
  id: 1423,
  plain: '一排撲克牌,每張有點數。你要拿 k 張,但每次只能從最左邊或最右邊拿。怎麼拿總點數最大?',
  statement: '給整數陣列 `cardPoints` 和 `k`。每一步可以從陣列的**開頭或結尾**拿走一張牌,恰好拿 k 張,回傳能得到的最大點數和。',
  examples: [
    { input: 'cardPoints = [1,2,3,4,5,6,1], k = 3', output: '12', note: '拿右邊三張 6+5+1' },
    { input: 'cardPoints = [2,2,2], k = 2', output: '4' },
    { input: 'cardPoints = [9,7,7,9,7,7,9], k = 7', output: '55' },
  ],
  constraints: ['n ≤ 10⁵', 'k ≤ n'],
  insight: ['拿的順序不重要,只看最後拿了「左邊 i 張 + 右邊 k − i 張」', '只有 k + 1 種組合,從 i = 0 開始,每次把右邊一張換成左邊一張 → O(k)', '等價於:剩下的 n − k 張是中間連續一段,讓它最小(固定長度視窗)'],
  approaches: [
    {
      name: '枚舉左邊拿幾張',
      idea: '先拿右邊 k 張;之後每次左邊多一張、右邊少一張,取最大。',
      steps: ['`right = sum(最後 k 張)`、`left = 0`、`best = right`', '`for i in 1..k`:`left += c[i − 1]`、`right −= c[n − k + i − 1]`', '`best = max(best, left + right)`'],
      figure: { title: `cardPoints = [${C}],k = ${K}`, steps: splitFig() },
      complexity: { time: 'O(k)', space: 'O(1)', why: '只看 k + 1 種組合,每次 O(1) 更新。' },
      verdict: '最推薦。只碰兩端 k 張,k 小時比方法二快。',
      code: {
        python: `def maxScore(cardPoints, k):
    n = len(cardPoints)
    left, right = 0, sum(cardPoints[n - k:])  # 先全部從右邊拿
    best = right
    for i in range(1, k + 1):
        left += cardPoints[i - 1]             # 左邊多拿一張
        right -= cardPoints[n - k + i - 1]    # 右邊少拿一張(最內側那張)
        best = max(best, left + right)
    return best`,
        c: `int maxScore(int *cardPoints, int n, int k) {
    int left = 0, right = 0;
    for (int i = n - k; i < n; i++) right += cardPoints[i];
    int best = right;
    for (int i = 1; i <= k; i++) {
        left += cardPoints[i - 1];
        right -= cardPoints[n - k + i - 1];
        if (left + right > best) best = left + right;
    }
    return best;
}`,
        cpp: `int maxScore(vector<int>& cardPoints, int k) {
    int n = cardPoints.size(), left = 0;
    int right = accumulate(cardPoints.end() - k, cardPoints.end(), 0), best = right;
    for (int i = 1; i <= k; i++) {
        left += cardPoints[i - 1];
        right -= cardPoints[n - k + i - 1];
        best = max(best, left + right);
    }
    return best;
}`,
        java: `int maxScore(int[] cardPoints, int k) {
    int n = cardPoints.length, left = 0, right = 0;
    for (int i = n - k; i < n; i++) right += cardPoints[i];
    int best = right;
    for (int i = 1; i <= k; i++) {
        left += cardPoints[i - 1];
        right -= cardPoints[n - k + i - 1];
        best = Math.max(best, left + right);
    }
    return best;
}`,
        javascript: `function maxScore(cardPoints, k) {
  const n = cardPoints.length;
  let left = 0, right = 0;
  for (let i = n - k; i < n; i++) right += cardPoints[i];
  let best = right;
  for (let i = 1; i <= k; i++) {
    left += cardPoints[i - 1];
    right -= cardPoints[n - k + i - 1];
    best = Math.max(best, left + right);
  }
  return best;
}`,
      },
    },
    {
      name: '中間 n − k 張的最小視窗',
      idea: '答案 = 總和 − 長度 n − k 的連續子陣列的最小和。',
      steps: ['`total = sum(c)`、`w = n − k`', '固定長度 w 的視窗滑一遍,記最小和', '回傳 `total − 最小和`'],
      figure: { title: `cardPoints = [${C}],k = ${K}`, steps: midFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '視窗滑過整個陣列。' },
      verdict: '換個角度把「兩端」變成「中間連續」,就是標準的[[p:sliding-window]]。',
      code: {
        python: `def maxScore(cardPoints, k):
    n, total = len(cardPoints), sum(cardPoints)
    w = n - k                                 # 剩下的牌是中間連續的 w 張
    if w == 0:
        return total
    s = sum(cardPoints[:w])
    mn = s
    for i in range(w, n):
        s += cardPoints[i] - cardPoints[i - w]
        mn = min(mn, s)
    return total - mn`,
        c: `int maxScore(int *cardPoints, int n, int k) {
    int total = 0, w = n - k, s = 0;
    for (int i = 0; i < n; i++) total += cardPoints[i];
    if (w == 0) return total;
    for (int i = 0; i < w; i++) s += cardPoints[i];
    int mn = s;
    for (int i = w; i < n; i++) {
        s += cardPoints[i] - cardPoints[i - w];
        if (s < mn) mn = s;
    }
    return total - mn;
}`,
        cpp: `int maxScore(vector<int>& cardPoints, int k) {
    int n = cardPoints.size(), w = n - k;
    int total = accumulate(cardPoints.begin(), cardPoints.end(), 0);
    if (w == 0) return total;
    int s = accumulate(cardPoints.begin(), cardPoints.begin() + w, 0), mn = s;
    for (int i = w; i < n; i++) {
        s += cardPoints[i] - cardPoints[i - w];
        mn = min(mn, s);
    }
    return total - mn;
}`,
        java: `int maxScore(int[] cardPoints, int k) {
    int n = cardPoints.length, w = n - k, total = 0, s = 0;
    for (int x : cardPoints) total += x;
    if (w == 0) return total;
    for (int i = 0; i < w; i++) s += cardPoints[i];
    int mn = s;
    for (int i = w; i < n; i++) {
        s += cardPoints[i] - cardPoints[i - w];
        mn = Math.min(mn, s);
    }
    return total - mn;
}`,
        javascript: `function maxScore(cardPoints, k) {
  const n = cardPoints.length, w = n - k;
  const total = cardPoints.reduce((a, b) => a + b, 0);
  if (w === 0) return total;
  let s = 0;
  for (let i = 0; i < w; i++) s += cardPoints[i];
  let mn = s;
  for (let i = w; i < n; i++) {
    s += cardPoints[i] - cardPoints[i - w];
    mn = Math.min(mn, s);
  }
  return total - mn;
}`,
      },
    },
  ],
  pitfalls: ['貪心每次拿兩端比較大的那張:[1, 1000, 1, 1, 1, 1, 100]、k = 2 會先拿 100,錯過 1 後面的 1000', 'k = n 時中間視窗長度是 0,要特判'],
  check: {
    kind: 'fn',
    fn: 'maxScore',
    cases: [
      { args: [C, K], out: 12 },
      { args: [[2, 2, 2], 2], out: 4 },
      { args: [[9, 7, 7, 9, 7, 7, 9], 7], out: 55 },
      { args: [[1, 1000, 1], 1], out: 1 },
      { args: [[1, 79, 80, 1, 1, 1, 200, 1], 3], out: 202 },
    ],
  },
}
