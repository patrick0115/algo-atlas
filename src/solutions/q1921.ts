import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1921. Eliminate Maximum Number of Monsters

const D = [1, 3, 4]
const SP = [1, 1, 1]

function sortFig(): FigStep[] {
  const t = D.map((d, i) => Math.ceil(d / SP[i]))
  return [
    { note: '每個怪物到達城市的時間 = ⌈dist / speed⌉(分鐘)。武器每分鐘只能開一槍,第 0 分鐘就可以開第一槍', views: [arr(D, { label: 'dist' }), arr(SP, { label: 'speed' }), arr(t, { label: '到達時間' })] },
    { note: '貪心:先打最快到的。把到達時間排序,第 i 槍在第 i 分鐘開,必須 `i < 到達時間[i]` 才來得及', views: [arr([...t].sort((a, b) => a - b), { label: '排序後的到達時間', highlight: [0] }), arr([0, 1, 2], { label: '開槍的分鐘' })] },
    { note: '0 < 1 ✓、1 < 3 ✓、2 < 4 ✓ → 三隻都打得掉', views: [arr([1, 3, 4], { label: '到達時間', done: [0, 1, 2] }), arr([3], { label: '答案', done: [0] })] },
  ]
}

function bucketFig(): FigStep[] {
  return [
    { note: '不用排序:到達時間 ≥ n 的怪物一定來得及(n 槍內就能打完)→ 全部丟進桶 n。數每個到達時間有幾隻', views: [arr([0, 1, 0, 2], { label: 'cnt[時間](0..n,≥ n 的併進最後一格)' })] },
    { note: '由小到大累加:到時間 t 為止已經到的怪物數 > t 就失敗(t 分鐘內只開得了 t 槍)。答案是失敗前打掉的數量', views: [arr([0, 1, 1], { label: '時間 0..n−1 的累計(都沒超過時間)', done: [0, 1, 2] })] },
  ]
}

export const q1921: Solution = {
  id: 1921,
  plain: '一群怪物從不同距離、用不同速度衝向城市。你每分鐘只能開一槍打死一隻,只要有任何一隻到達城市你就輸了。最多能打死幾隻?',
  statement: '`dist[i]` 是第 i 隻怪物的初始距離,`speed[i]` 是速度(每分鐘)。武器充能 1 分鐘,一開始已充滿(第 0 分鐘可開槍)。怪物在你開槍的同一瞬間到達也算輸。回傳在輸之前最多能消滅幾隻怪物(全滅則回傳 n)。',
  examples: [
    { input: 'dist = [1,3,4], speed = [1,1,1]', output: '3' },
    { input: 'dist = [1,1,2,3], speed = [1,1,1,1]', output: '1' },
    { input: 'dist = [3,2,4], speed = [5,3,2]', output: '1' },
  ],
  constraints: ['n ≤ 10⁵'],
  insight: ['只在乎每隻怪物「幾分鐘後到」= ⌈dist / speed⌉', '[[p:greedy]]:永遠先打最快到的那隻', '第 i 槍在第 i 分鐘開,要嚴格小於那隻的到達時間'],
  approaches: [
    {
      name: '計算到達時間 + 排序',
      idea: '`t[i] = ceil(dist[i] / speed[i])`;排序;第一個 `t[i] <= i` 的 i 就是答案,都沒有就回傳 n。',
      steps: ['`t = [(d + s − 1) // s for d, s]`', '`t.sort()`', '`for i`:`t[i] <= i` → 回傳 i', '回傳 n'],
      figure: { title: `dist = [${D}],speed = [${SP}]`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序。' },
      verdict: '最推薦,轉換成「到達時間」之後就是一般的排程貪心。',
      code: {
        python: `def eliminateMaximum(dist, speed):
    t = sorted((d + s - 1) // s for d, s in zip(dist, speed))   # 整數版的 ceil
    for i, x in enumerate(t):
        if x <= i:
            return i                          # 第 i 分鐘才開槍,牠已經到了
    return len(t)`,
        c: `static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

int eliminateMaximum(int *dist, int distSize, int *speed, int speedSize) {
    int n = distSize, *t = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) t[i] = (dist[i] + speed[i] - 1) / speed[i];
    qsort(t, n, sizeof(int), cmp);
    int ans = n;
    for (int i = 0; i < n; i++) if (t[i] <= i) { ans = i; break; }
    free(t);
    return ans;
}`,
        cpp: `int eliminateMaximum(vector<int>& dist, vector<int>& speed) {
    int n = dist.size();
    vector<int> t(n);
    for (int i = 0; i < n; i++) t[i] = (dist[i] + speed[i] - 1) / speed[i];
    sort(t.begin(), t.end());
    for (int i = 0; i < n; i++) if (t[i] <= i) return i;
    return n;
}`,
        java: `int eliminateMaximum(int[] dist, int[] speed) {
    int n = dist.length;
    int[] t = new int[n];
    for (int i = 0; i < n; i++) t[i] = (dist[i] + speed[i] - 1) / speed[i];
    Arrays.sort(t);
    for (int i = 0; i < n; i++) if (t[i] <= i) return i;
    return n;
}`,
        javascript: `function eliminateMaximum(dist, speed) {
  const t = dist.map((d, i) => Math.ceil(d / speed[i])).sort((a, b) => a - b);
  for (let i = 0; i < t.length; i++) if (t[i] <= i) return i;
  return t.length;
}`,
      },
    },
    {
      name: '計數桶',
      idea: '到達時間 ≥ n 的都放進桶 n;`cnt[t]` 統計。累加 `arrived`,在時間 t 時 `arrived > t` 就回傳 t。',
      steps: ['`cnt = [0] * (n + 1)`;`cnt[min(n, t)] += 1`', '`arrived = 0`', '`for t in 0..n − 1`:`arrived += cnt[t]`;`arrived > t` → 回傳 t', '回傳 n'],
      figure: { title: `dist = [${D}],speed = [${SP}]`, steps: bucketFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '計數取代排序。' },
      verdict: '值域只有 0..n 有意義時,計數排序把 log 拿掉。',
      code: {
        python: `def eliminateMaximum(dist, speed):
    n = len(dist)
    cnt = [0] * (n + 1)
    for d, s in zip(dist, speed):
        cnt[min(n, (d + s - 1) // s)] += 1    # 太晚到的都一樣:一定打得到
    arrived = 0
    for t in range(n):
        arrived += cnt[t]
        if arrived > t:
            return t                          # t 分鐘只開了 t 槍
    return n`,
        c: `int eliminateMaximum(int *dist, int distSize, int *speed, int speedSize) {
    int n = distSize, *cnt = calloc(n + 1, sizeof(int)), ans = n, arrived = 0;
    for (int i = 0; i < n; i++) {
        int t = (dist[i] + speed[i] - 1) / speed[i];
        cnt[t < n ? t : n]++;
    }
    for (int t = 0; t < n; t++) {
        arrived += cnt[t];
        if (arrived > t) { ans = t; break; }
    }
    free(cnt);
    return ans;
}`,
        cpp: `int eliminateMaximum(vector<int>& dist, vector<int>& speed) {
    int n = dist.size();
    vector<int> cnt(n + 1, 0);
    for (int i = 0; i < n; i++) cnt[min(n, (dist[i] + speed[i] - 1) / speed[i])]++;
    int arrived = 0;
    for (int t = 0; t < n; t++) {
        arrived += cnt[t];
        if (arrived > t) return t;
    }
    return n;
}`,
        java: `int eliminateMaximum(int[] dist, int[] speed) {
    int n = dist.length;
    int[] cnt = new int[n + 1];
    for (int i = 0; i < n; i++) cnt[Math.min(n, (dist[i] + speed[i] - 1) / speed[i])]++;
    int arrived = 0;
    for (int t = 0; t < n; t++) {
        arrived += cnt[t];
        if (arrived > t) return t;
    }
    return n;
}`,
        javascript: `function eliminateMaximum(dist, speed) {
  const n = dist.length, cnt = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) cnt[Math.min(n, Math.ceil(dist[i] / speed[i]))]++;
  let arrived = 0;
  for (let t = 0; t < n; t++) {
    arrived += cnt[t];
    if (arrived > t) return t;
  }
  return n;
}`,
      },
    },
  ],
  pitfalls: ['用浮點數 dist / speed 比較:精度問題,用整數 ceil', '條件寫成 `t[i] < i`:同時到達也算輸,要 `<=`'],
  check: {
    kind: 'fn',
    fn: 'eliminateMaximum',
    cases: [
      { args: [D, SP], out: 3 },
      { args: [[1, 1, 2, 3], [1, 1, 1, 1]], out: 1 },
      { args: [[3, 2, 4], [5, 3, 2]], out: 1 },
      { args: [[4, 2, 3], [2, 1, 1]], out: 3 },
      { args: [[5], [10]], out: 1 },
    ],
  },
}
