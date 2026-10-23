import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 926. Flip String to Monotone Increasing

const S = '00110'

function splitFig(): FigStep[] {
  const n = S.length
  const costs: number[] = []
  for (let k = 0; k <= n; k++) {
    const ones = [...S.slice(0, k)].filter((c) => c === '1').length
    const zeros = [...S.slice(k)].filter((c) => c === '0').length
    costs.push(ones + zeros)
  }
  return [
    { note: '單調遞增的 0/1 字串長這樣:前面全 0、後面全 1。枚舉「分界點」k:前 k 個都要變 0、後面都要變 1', views: [arr(S.split(''), { label: 's' })] },
    { note: '分界 k 的成本 = 前 k 個裡 1 的個數 + 後面 0 的個數。用前綴和 O(1) 算出每個 k', views: [arr(costs, { label: 'cost[k](k = 0..n)', highlight: [costs.indexOf(Math.min(...costs))] })] },
    { note: `最小成本 ${Math.min(...costs)}:例如把最後的 0 改成 1 → "00111"`, views: [arr('00111'.split(''), { label: '結果', done: [4] })] },
  ]
}

function dpFig(): FigStep[] {
  return [
    { note: '一次掃描的 DP:`ones` = 目前看過幾個 1;`flips` = 讓前綴變成單調的最少翻轉數', views: [arr(S.split(''), { label: 's' })] },
    { note: '遇到 1:前綴還是單調,flips 不變,ones += 1。遇到 0:要嘛把這個 0 翻成 1(flips + 1),要嘛把前面所有 1 翻成 0(ones),取小', views: [arr([0, 0, 0, 0, 1], { label: 'flips 變化', done: [4] })] },
  ]
}

export const q0926: Solution = {
  id: 926,
  plain: '一個只有 0 和 1 的字串,要把它改成「前面都是 0、後面都是 1」的樣子(可以全 0 或全 1)。每次可以把一個字元翻轉,最少要翻幾次?',
  statement: '0/1 字串若由若干個 0 後接若干個 1 組成(各可為 0 個),稱為**單調遞增**。給字串 `s`,每次可把一個 0 翻成 1 或 1 翻成 0,回傳使 s 單調遞增的最少翻轉次數。',
  examples: [
    { input: 's = "00110"', output: '1' },
    { input: 's = "010110"', output: '2' },
    { input: 's = "00011000"', output: '2' },
  ],
  constraints: ['長度 ≤ 10⁵'],
  insight: ['結果一定是 0…01…1 → 枚舉分界點([[p:prefix-sum]])', '或一次掃描 DP:遇到 0 時決定「翻它」還是「翻掉前面所有 1」', '[[p:dp-1d]] 的狀態只需要兩個整數'],
  approaches: [
    {
      name: '枚舉分界點 + 前綴和',
      idea: '`cost(k) = 前 k 個中 1 的數量 + 後面 0 的數量`;k 從 0 到 n 取最小。',
      steps: ['`zeros_total = s.count("0")`', '`ones = 0`、`zeros_right = zeros_total`、`best = zeros_right`(k = 0)', '每看一個字元:是 1 → `ones += 1`;是 0 → `zeros_right −= 1`', '`best = min(best, ones + zeros_right)`'],
      figure: { title: `s = "${S}"`, steps: splitFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩次掃描(或一次邊走邊算)。' },
      verdict: '最好理解:把「改成什麼樣子」先固定,再算成本。',
      code: {
        python: `def minFlipsMonoIncr(s):
    zeros_right = s.count('0')                # 分界在最左:全部都要是 1
    ones, best = 0, zeros_right
    for c in s:
        if c == '1':
            ones += 1                         # 分界左邊的 1 要翻成 0
        else:
            zeros_right -= 1                  # 這個 0 移到左邊,不用翻了
        best = min(best, ones + zeros_right)
    return best`,
        c: `int minFlipsMonoIncr(char *s) {
    int zr = 0, ones = 0;
    for (char *p = s; *p; p++) zr += *p == '0';
    int best = zr;
    for (char *p = s; *p; p++) {
        if (*p == '1') ones++;
        else zr--;
        if (ones + zr < best) best = ones + zr;
    }
    return best;
}`,
        cpp: `int minFlipsMonoIncr(string s) {
    int zr = count(s.begin(), s.end(), '0'), ones = 0, best = zr;
    for (char c : s) {
        if (c == '1') ones++;
        else zr--;
        best = min(best, ones + zr);
    }
    return best;
}`,
        java: `int minFlipsMonoIncr(String s) {
    int zr = 0, ones = 0;
    for (char c : s.toCharArray()) if (c == '0') zr++;
    int best = zr;
    for (char c : s.toCharArray()) {
        if (c == '1') ones++;
        else zr--;
        best = Math.min(best, ones + zr);
    }
    return best;
}`,
        javascript: `function minFlipsMonoIncr(s) {
  let zr = 0, ones = 0;
  for (const c of s) if (c === '0') zr++;
  let best = zr;
  for (const c of s) {
    if (c === '1') ones++;
    else zr--;
    best = Math.min(best, ones + zr);
  }
  return best;
}`,
      },
    },
    {
      name: '一次掃描 DP',
      idea: '`ones` 計數;遇到 0:`flips = min(flips + 1, ones)`。',
      steps: ['`ones = flips = 0`', '是 1 → `ones += 1`', '是 0 → `flips = min(flips + 1, ones)`', '回傳 flips'],
      figure: { title: `s = "${S}"`, steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描。' },
      verdict: '最精簡;想清楚「遇到 0 只有兩種處理法」就寫得出來。',
      code: {
        python: `def minFlipsMonoIncr(s):
    ones = flips = 0
    for c in s:
        if c == '1':
            ones += 1
        else:
            flips = min(flips + 1, ones)      # 翻這個 0,或把前面的 1 全翻掉
    return flips`,
        c: `int minFlipsMonoIncr(char *s) {
    int ones = 0, flips = 0;
    for (char *p = s; *p; p++) {
        if (*p == '1') ones++;
        else flips = flips + 1 < ones ? flips + 1 : ones;
    }
    return flips;
}`,
        cpp: `int minFlipsMonoIncr(string s) {
    int ones = 0, flips = 0;
    for (char c : s) {
        if (c == '1') ones++;
        else flips = min(flips + 1, ones);
    }
    return flips;
}`,
        java: `int minFlipsMonoIncr(String s) {
    int ones = 0, flips = 0;
    for (char c : s.toCharArray()) {
        if (c == '1') ones++;
        else flips = Math.min(flips + 1, ones);
    }
    return flips;
}`,
        javascript: `function minFlipsMonoIncr(s) {
  let ones = 0, flips = 0;
  for (const c of s) {
    if (c === '1') ones++;
    else flips = Math.min(flips + 1, ones);
  }
  return flips;
}`,
      },
    },
  ],
  pitfalls: ['只考慮「把 0 都翻成 1」或「把 1 都翻成 0」其中一種', '分界點沒包含 k = 0 與 k = n(全 1、全 0)'],
  check: {
    kind: 'fn',
    fn: 'minFlipsMonoIncr',
    cases: [
      { args: [S], out: 1 },
      { args: ['010110'], out: 2 },
      { args: ['00011000'], out: 2 },
      { args: ['1'], out: 0 },
      { args: ['10'], out: 1 },
    ],
  },
}
