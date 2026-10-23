import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2483. Minimum Penalty for a Shop

const C = 'YYNY'

function prefixFig(): FigStep[] {
  const n = C.length
  const preN = [0]
  for (const c of C) preN.push(preN[preN.length - 1] + (c === 'N' ? 1 : 0))
  const sufY = Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) sufY[i] = sufY[i + 1] + (C[i] === 'Y' ? 1 : 0)
  const pen = preN.map((v, j) => v + sufY[j])
  const best = pen.indexOf(Math.min(...pen))
  return [
    { note: '在第 j 小時關門(j = 0..n):開門的 0..j−1 小時裡「沒客人 N」各罰 1;關門的 j..n−1 小時裡「有客人 Y」各罰 1', views: [arr(C.split(''), { label: 'customers' })] },
    { note: '前綴:preN[j] = 前 j 小時有幾個 N。後綴:sufY[j] = 從第 j 小時起有幾個 Y', views: [arr(preN, { label: 'preN[0..n]' }), arr(sufY, { label: 'sufY[0..n]' })] },
    { note: `懲罰 = preN[j] + sufY[j]。最小是 ${pen[best]},最早出現在 j = ${best}`, views: [arr(pen, { label: '每個 j 的懲罰', highlight: [best] })] },
  ]
}

function oneFig(): FigStep[] {
  let score = 0
  let best = 0
  let ans = 0
  const sc: number[] = [0]
  C.split('').forEach((c, i) => {
    score += c === 'Y' ? 1 : -1
    sc.push(score)
    if (score > best) {
      best = score
      ans = i + 1
    }
  })
  return [
    { note: '只看「關門時間從 j 往後延一小時」懲罰怎麼變:那小時是 Y → 少罰 1;是 N → 多罰 1。所以用 Y = +1、N = −1 累加,累加值最大的地方懲罰最小', views: [arr(C.split(''), { label: 'customers' }), arr(sc, { label: '累加(Y +1、N −1)', highlight: [ans] })] },
    { note: `累加值最大 ${best},第一次出現在 j = ${ans} → 答案 ${ans}。不用前綴陣列,一個變數就夠`, views: [arr(sc, { label: '累加', done: [ans] })] },
  ]
}

export const q2483: Solution = {
  id: 2483,
  plain: '一家店有 n 個小時的營業紀錄:Y 代表那小時有客人,N 代表沒客人。你要選一個時間關門:開著但沒客人罰 1 分,關了卻有客人來也罰 1 分。最早在第幾小時關門,罰分最少?',
  statement: '給只含 `Y`/`N` 的字串 `customers`。若在第 j 小時關門(0 ≤ j ≤ n,j = n 表示整天都開),懲罰 = 前 j 小時中 N 的個數 + 第 j 小時起 Y 的個數。回傳懲罰最小的**最早** j。',
  examples: [
    { input: 'customers = "YYNY"', output: '2' },
    { input: 'customers = "NNNNN"', output: '0' },
    { input: 'customers = "YYYY"', output: '4' },
  ],
  constraints: ['n ≤ 10⁵ → 每個 j 重新數是 O(n²),太慢'],
  insight: ['懲罰 = 左邊的 N 數 + 右邊的 Y 數 → 前綴和 + 後綴和', '更進一步:j 往右一格,懲罰的變化只看那一小時(Y 減 1、N 加 1)', '所以累加 Y = +1、N = −1,找最大值第一次出現的位置'],
  approaches: [
    {
      name: '前綴 N + 後綴 Y',
      idea: '`pen[j] = preN[j] + sufY[j]`,取最小的最早 j。',
      steps: ['`preN[j]` = 前 j 個裡 N 的數量', '`sufY[j]` = 從 j 開始 Y 的數量', '掃 j = 0..n 找 `preN[j] + sufY[j]` 的最小值(嚴格小於才更新,保留最早的)'],
      figure: { title: `customers = "${C}"`, steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩個長度 n+1 的陣列。' },
      verdict: '直接照題意拆成兩半,最好懂。',
      code: {
        python: `def bestClosingTime(customers):
    n = len(customers)
    pre_n = [0] * (n + 1)
    for i, c in enumerate(customers):
        pre_n[i + 1] = pre_n[i] + (c == 'N')
    suf_y = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suf_y[i] = suf_y[i + 1] + (customers[i] == 'Y')
    best = 0
    for j in range(n + 1):
        if pre_n[j] + suf_y[j] < pre_n[best] + suf_y[best]:   # 嚴格小於 → 保留最早的
            best = j
    return best`,
        c: `int bestClosingTime(char *customers) {
    int n = strlen(customers);
    int *preN = calloc(n + 1, sizeof(int)), *sufY = calloc(n + 1, sizeof(int));
    for (int i = 0; i < n; i++) preN[i + 1] = preN[i] + (customers[i] == 'N');
    for (int i = n - 1; i >= 0; i--) sufY[i] = sufY[i + 1] + (customers[i] == 'Y');
    int best = 0;
    for (int j = 1; j <= n; j++)
        if (preN[j] + sufY[j] < preN[best] + sufY[best]) best = j;
    free(preN); free(sufY);
    return best;
}`,
        cpp: `int bestClosingTime(string customers) {
    int n = customers.size();
    vector<int> preN(n + 1, 0), sufY(n + 1, 0);
    for (int i = 0; i < n; i++) preN[i + 1] = preN[i] + (customers[i] == 'N');
    for (int i = n - 1; i >= 0; i--) sufY[i] = sufY[i + 1] + (customers[i] == 'Y');
    int best = 0;
    for (int j = 1; j <= n; j++)
        if (preN[j] + sufY[j] < preN[best] + sufY[best]) best = j;
    return best;
}`,
        java: `int bestClosingTime(String customers) {
    int n = customers.length();
    int[] preN = new int[n + 1], sufY = new int[n + 1];
    for (int i = 0; i < n; i++) preN[i + 1] = preN[i] + (customers.charAt(i) == 'N' ? 1 : 0);
    for (int i = n - 1; i >= 0; i--) sufY[i] = sufY[i + 1] + (customers.charAt(i) == 'Y' ? 1 : 0);
    int best = 0;
    for (int j = 1; j <= n; j++)
        if (preN[j] + sufY[j] < preN[best] + sufY[best]) best = j;
    return best;
}`,
        javascript: `function bestClosingTime(customers) {
  const n = customers.length, preN = new Array(n + 1).fill(0), sufY = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) preN[i + 1] = preN[i] + (customers[i] === 'N' ? 1 : 0);
  for (let i = n - 1; i >= 0; i--) sufY[i] = sufY[i + 1] + (customers[i] === 'Y' ? 1 : 0);
  let best = 0;
  for (let j = 1; j <= n; j++) if (preN[j] + sufY[j] < preN[best] + sufY[best]) best = j;
  return best;
}`,
      },
    },
    {
      name: '一次掃描(看懲罰的變化量)',
      idea: '`score` 累加 Y = +1、N = −1;score 創新高時記下 `i + 1`。',
      steps: ['`score = best = ans = 0`', '`for i, c`:`score += 1 if c == "Y" else −1`', '`score > best` → `best = score`、`ans = i + 1`', '回傳 ans'],
      figure: { title: `customers = "${C}"`, steps: oneFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描,兩個變數。' },
      verdict: '最推薦。懲罰本身不用算出來,只要知道「延後一小時關門是賺是賠」就夠了。',
      code: {
        python: `def bestClosingTime(customers):
    score = best = ans = 0
    for i, c in enumerate(customers):
        score += 1 if c == 'Y' else -1        # 延後一小時關:Y 少罰,N 多罰
        if score > best:                      # 嚴格大於 → 保留最早的
            best, ans = score, i + 1
    return ans`,
        c: `int bestClosingTime(char *customers) {
    int score = 0, best = 0, ans = 0;
    for (int i = 0; customers[i]; i++) {
        score += customers[i] == 'Y' ? 1 : -1;
        if (score > best) { best = score; ans = i + 1; }
    }
    return ans;
}`,
        cpp: `int bestClosingTime(string customers) {
    int score = 0, best = 0, ans = 0;
    for (int i = 0; i < (int)customers.size(); i++) {
        score += customers[i] == 'Y' ? 1 : -1;
        if (score > best) { best = score; ans = i + 1; }
    }
    return ans;
}`,
        java: `int bestClosingTime(String customers) {
    int score = 0, best = 0, ans = 0;
    for (int i = 0; i < customers.length(); i++) {
        score += customers.charAt(i) == 'Y' ? 1 : -1;
        if (score > best) { best = score; ans = i + 1; }
    }
    return ans;
}`,
        javascript: `function bestClosingTime(customers) {
  let score = 0, best = 0, ans = 0;
  for (let i = 0; i < customers.length; i++) {
    score += customers[i] === 'Y' ? 1 : -1;
    if (score > best) {
      best = score;
      ans = i + 1;
    }
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['用 `<=`(或 `>=`)更新:會回傳最晚而不是最早的 j', 'j 的範圍是 0..n(共 n+1 種),漏了 j = n(整天開)'],
  check: {
    kind: 'fn',
    fn: 'bestClosingTime',
    cases: [
      { args: [C], out: 2 },
      { args: ['NNNNN'], out: 0 },
      { args: ['YYYY'], out: 4 },
      { args: ['YN'], out: 1 },
      { args: ['NYNY'], out: 0 },
    ],
  },
}
