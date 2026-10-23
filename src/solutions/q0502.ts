import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 502. IPO

const PROFITS = [1, 2, 3]
const CAP = [0, 1, 1]
const K = 2
const W = 0

function heapFig(): FigStep[] {
  return [
    { note: `一開始資本 w = ${W}。專案依「需要的資本」排序;每一輪把所有「現在付得起」的專案的利潤丟進最大堆積,挑利潤最大的做`, views: [arr(PROFITS.map((p, i) => `#${i} 需 ${CAP[i]} 賺 ${p}`), { label: '專案' })] },
    { note: '第 1 輪:w = 0,只付得起 #0 → 做 #0,w = 1', views: [arr([1], { label: '可做專案的利潤(最大堆積)', highlight: [0] }), arr(['w = 1'], { label: '資本' })] },
    { note: '第 2 輪:w = 1,#1、#2 都付得起了 → 堆積 {2, 3},做利潤 3 的 #2 → w = 4。做滿 k = 2 個,答案 4', views: [arr([3, 2], { label: '最大堆積', highlight: [0] }), arr(['w = 4'], { label: '資本', done: [0] })] },
  ]
}

function scanFig(): FigStep[] {
  return [
    { note: '簡單版:每一輪掃過所有沒做過的專案,挑「付得起而且利潤最大」的', views: [arr(PROFITS.map((p, i) => `#${i} 賺 ${p}`), { label: "專案" })] },
    { note: '沒有任何付得起的就提早結束。每輪 O(n),k 輪 → O(n · k)', views: [arr(['w = 4'], { label: '答案' })] },
  ]
}

export const q0502: Solution = {
  id: 502,
  plain: '你有一筆初始資金,最多能做 k 個專案。每個專案要有足夠資本才能開始,做完會賺一筆利潤(資本變多)。要怎麼挑專案,最後的資本最多?',
  statement: '給 k、初始資本 w、`profits` 和 `capital`。專案 i 需要資本 ≥ `capital[i]` 才能開始,完成後資本增加 `profits[i]`(不扣除成本)。最多完成 k 個不同專案,回傳最終的最大資本。',
  examples: [
    { input: 'k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]', output: '4' },
    { input: 'k = 3, w = 0, profits = [1,2,3], capital = [0,1,2]', output: '6' },
  ],
  constraints: ['n, k ≤ 10⁵'],
  insight: ['資本只會變多,所以每一步做「現在付得起、利潤最大」的專案一定最好(貪心)', '付得起的專案集合只會越來越大 → 依需要的資本排序,用指標把新解鎖的專案丟進最大堆積', '堆積空了代表沒有付得起的專案,提早結束'],
  approaches: [
    {
      name: '依資本排序 + 利潤的最大堆積',
      idea: '專案依 capital 排序;每輪先把 `capital ≤ w` 的利潤推進最大堆積,再彈出最大的加到 w。',
      steps: ['`proj = sorted(zip(capital, profits))`、`i = 0`', '重複 k 次:`while i < n and proj[i].cap <= w`:推進堆積、`i += 1`', '堆積空 → 結束;否則 `w += 堆積彈出的最大利潤`', '回傳 w'],
      figure: { title: `k = ${K},w = ${W}`, steps: heapFig() },
      complexity: { time: 'O(n log n + k log n)', space: 'O(n)', why: '排序 + 每個專案進出堆積一次。' },
      verdict: '最推薦。「解鎖條件單調變寬 + 每次取最好的」→ 排序加指標,配一個堆積。',
      code: {
        python: `import heapq

def findMaximizedCapital(k, w, profits, capital):
    proj = sorted(zip(capital, profits))
    h, i = [], 0
    for _ in range(k):
        while i < len(proj) and proj[i][0] <= w:
            heapq.heappush(h, -proj[i][1])    # 付得起了:利潤放進最大堆積
            i += 1
        if not h:
            break                             # 沒有付得起的專案
        w -= heapq.heappop(h)                 # 做利潤最大的
    return w`,
        c: `static int *C_;
static int cmpC(const void *a, const void *b) { return C_[*(int *)a] - C_[*(int *)b]; }

int findMaximizedCapital(int k, int w, int *profits, int profitsSize, int *capital, int capitalSize) {
    int n = profitsSize, *idx = malloc(n * sizeof(int)), *h = malloc(n * sizeof(int)), hn = 0, i = 0;
    for (int t = 0; t < n; t++) idx[t] = t;
    C_ = capital;
    qsort(idx, n, sizeof(int), cmpC);
    while (k--) {
        while (i < n && capital[idx[i]] <= w) {
            h[hn] = profits[idx[i++]];
            for (int c = hn++; c && h[(c - 1) / 2] < h[c]; c = (c - 1) / 2) { int x = h[c]; h[c] = h[(c - 1) / 2]; h[(c - 1) / 2] = x; }
        }
        if (!hn) break;
        w += h[0];
        h[0] = h[--hn];
        for (int c = 0;;) {
            int m = c, l = 2 * c + 1, r = l + 1;
            if (l < hn && h[l] > h[m]) m = l;
            if (r < hn && h[r] > h[m]) m = r;
            if (m == c) break;
            int x = h[c]; h[c] = h[m]; h[m] = x;
            c = m;
        }
    }
    free(idx); free(h);
    return w;
}`,
        cpp: `int findMaximizedCapital(int k, int w, vector<int>& profits, vector<int>& capital) {
    int n = profits.size(), i = 0;
    vector<pair<int, int>> proj(n);
    for (int t = 0; t < n; t++) proj[t] = {capital[t], profits[t]};
    sort(proj.begin(), proj.end());
    priority_queue<int> pq;
    while (k--) {
        while (i < n && proj[i].first <= w) pq.push(proj[i++].second);
        if (pq.empty()) break;
        w += pq.top(); pq.pop();
    }
    return w;
}`,
        java: `int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
    int n = profits.length, i = 0;
    Integer[] idx = new Integer[n];
    for (int t = 0; t < n; t++) idx[t] = t;
    Arrays.sort(idx, (a, b) -> capital[a] - capital[b]);
    PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
    while (k-- > 0) {
        while (i < n && capital[idx[i]] <= w) pq.offer(profits[idx[i++]]);
        if (pq.isEmpty()) break;
        w += pq.poll();
    }
    return w;
}`,
        javascript: `function findMaximizedCapital(k, w, profits, capital) {
  const n = profits.length, idx = [...Array(n).keys()].sort((a, b) => capital[a] - capital[b]);
  const h = [];
  let i = 0;
  while (k-- > 0) {
    while (i < n && capital[idx[i]] <= w) {
      h.push(profits[idx[i++]]);
      for (let c = h.length - 1; c && h[(c - 1) >> 1] < h[c]; c = (c - 1) >> 1) [h[c], h[(c - 1) >> 1]] = [h[(c - 1) >> 1], h[c]];
    }
    if (!h.length) break;
    w += h[0];
    h[0] = h[h.length - 1];
    h.pop();
    for (let c = 0; ; ) {
      let m = c;
      const l = 2 * c + 1, r = l + 1;
      if (l < h.length && h[l] > h[m]) m = l;
      if (r < h.length && h[r] > h[m]) m = r;
      if (m === c) break;
      [h[c], h[m]] = [h[m], h[c]];
      c = m;
    }
  }
  return w;
}`,
      },
    },
    {
      name: '每輪線性掃描',
      idea: '每一輪掃過所有未做的專案,挑 `capital ≤ w` 中利潤最大的。',
      steps: ['`done = [False] * n`', '重複 k 次:找付得起且未做、利潤最大的 j', '找不到 → 結束;否則 `w += profits[j]`、`done[j] = True`'],
      figure: { title: `k = ${K},w = ${W}`, steps: scanFig() },
      complexity: { time: 'O(n · k)', space: 'O(n)', why: 'k 輪,每輪掃 n 個。' },
      verdict: '貪心的邏輯完全一樣,只是「找最大」沒有用堆積。n、k 都是 10⁵ 時會超時。',
      code: {
        python: `def findMaximizedCapital(k, w, profits, capital):
    n = len(profits)
    done = [False] * n
    for _ in range(k):
        best = -1
        for j in range(n):
            if not done[j] and capital[j] <= w and (best < 0 or profits[j] > profits[best]):
                best = j
        if best < 0:
            break
        done[best] = True
        w += profits[best]
    return w`,
        c: `int findMaximizedCapital(int k, int w, int *profits, int profitsSize, int *capital, int capitalSize) {
    int n = profitsSize;
    char *done = calloc(n, 1);
    while (k--) {
        int best = -1;
        for (int j = 0; j < n; j++)
            if (!done[j] && capital[j] <= w && (best < 0 || profits[j] > profits[best])) best = j;
        if (best < 0) break;
        done[best] = 1;
        w += profits[best];
    }
    free(done);
    return w;
}`,
        cpp: `int findMaximizedCapital(int k, int w, vector<int>& profits, vector<int>& capital) {
    int n = profits.size();
    vector<bool> done(n);
    while (k--) {
        int best = -1;
        for (int j = 0; j < n; j++)
            if (!done[j] && capital[j] <= w && (best < 0 || profits[j] > profits[best])) best = j;
        if (best < 0) break;
        done[best] = true;
        w += profits[best];
    }
    return w;
}`,
        java: `int findMaximizedCapital(int k, int w, int[] profits, int[] capital) {
    int n = profits.length;
    boolean[] done = new boolean[n];
    while (k-- > 0) {
        int best = -1;
        for (int j = 0; j < n; j++)
            if (!done[j] && capital[j] <= w && (best < 0 || profits[j] > profits[best])) best = j;
        if (best < 0) break;
        done[best] = true;
        w += profits[best];
    }
    return w;
}`,
        javascript: `function findMaximizedCapital(k, w, profits, capital) {
  const n = profits.length, done = new Array(n).fill(false);
  while (k-- > 0) {
    let best = -1;
    for (let j = 0; j < n; j++) if (!done[j] && capital[j] <= w && (best < 0 || profits[j] > profits[best])) best = j;
    if (best < 0) break;
    done[best] = true;
    w += profits[best];
  }
  return w;
}`,
      },
    },
  ],
  pitfalls: ['每一輪都重新把所有付得起的專案放進堆積:已經放過的會重複', '堆積空了還繼續做:沒有專案可以做,要提早結束', '以為要扣掉資本:題目說資本只是門檻,不會被花掉'],
  check: {
    kind: 'fn',
    fn: 'findMaximizedCapital',
    cases: [
      { args: [K, W, PROFITS, CAP], out: 4 },
      { args: [3, 0, [1, 2, 3], [0, 1, 2]], out: 6 },
      { args: [1, 0, [1, 2, 3], [1, 1, 2]], out: 0 },
      { args: [10, 0, [1, 2, 3], [0, 1, 1]], out: 6 },
    ],
  },
}
