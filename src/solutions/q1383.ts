import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1383. Maximum Performance of a Team

const N = 6
const SPEED = [2, 10, 3, 1, 5, 8]
const EFF = [5, 4, 3, 9, 7, 2]
const K = 2

function heapFig(): FigStep[] {
  return [
    { note: `團隊表現 = (速度總和) × (效率最低的那位)。最多選 ${K} 人。依效率由高到低排:走到第 i 人時,讓他當「效率最低的」,前面的人效率都比他高`, views: [arr(['(1,9)', '(5,7)', '(2,5)', '(10,4)', '(3,3)', '(8,2)'], { label: '(速度, 效率) 依效率遞減' })] },
    { note: `他一定要選,其他 ${K - 1} 人從前面挑速度最快的 → 最小堆積維護「目前速度最大的 ${K} 個」,超過就踢掉最慢的`, views: [arr([5, 10], { label: '走到 (10,4) 時的堆積', highlight: [1] })] },
    { note: '(10,4):速度和 5 + 10 = 15,× 4 = 60 —— 最大。和 [2542](#/q/2542) 幾乎一樣,差別在這題是「最多」k 人,所以堆積還沒滿也可以算', views: [arr([9, 42, 35, 60, 45, 36], { label: '每一步的表現', done: [3] })] },
  ]
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:枚舉每個人 i 當「效率最低」,在效率 ≥ 他的人裡挑速度最快的 k − 1 個(排序)', views: [arr(EFF, { label: 'efficiency', highlight: [1] })] },
    { note: '每個 i 都排序一次 → O(n² log n)。最後的答案要對 10⁹ + 7 取餘數,但比大小要用取餘數前的值', views: [arr([60], { label: '答案', done: [0] })] },
  ]
}

export const q1383: Solution = {
  id: 1383,
  plain: '從 n 位工程師裡挑最多 k 位組隊。團隊表現 = 大家的速度加起來 × 團隊裡效率最差的那位的效率。表現最高可以到多少?(答案對 10⁹+7 取餘數)',
  statement: '給 n、`speed`、`efficiency` 和 k。從中選**最多** k 位工程師,團隊表現 = 速度總和 × 效率最小值。回傳最大表現,對 `10⁹ + 7` 取餘數。',
  examples: [
    { input: 'n = 6, speed = [2,10,3,1,5,8], efficiency = [5,4,3,9,7,2], k = 2', output: '60' },
    { input: '同上,k = 3', output: '68' },
    { input: '同上,k = 4', output: '72' },
  ],
  constraints: ['n ≤ 10⁵', '速度 ≤ 10⁵、效率 ≤ 10⁸ → 乘積可達 10¹⁸,要用 64 位元'],
  insight: ['固定「誰的效率最低」:剩下的人效率都要 ≥ 他', '依效率由高到低掃描,候選集合只會變大', '在候選裡挑速度最大的 k 個(含自己)→ 最小堆積維護前 k 大的速度和'],
  approaches: [
    {
      name: '依效率遞減 + 速度的最小堆積',
      idea: '配對依效率遞減;速度推進最小堆積,超過 k 個就彈出最小的;每一步 `best = max(best, sum × 目前效率)`。',
      steps: ['`eng = sorted(zip(efficiency, speed), reverse=True)`', '`for e, s in eng`:push s、`sum += s`;堆積大小 > k → `sum −= pop()`', '`best = max(best, sum * e)`', '回傳 `best % (10⁹ + 7)`'],
      figure: { title: `k = ${K}`, steps: heapFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 + 每人一次堆積操作。' },
      verdict: '最推薦,和 2542 同一個套路。注意先比完大小,最後才取餘數。',
      code: {
        python: `import heapq

def maxPerformance(n, speed, efficiency, k):
    eng = sorted(zip(efficiency, speed), reverse=True)   # 效率由高到低
    h, s, best = [], 0, 0
    for e, sp in eng:
        heapq.heappush(h, sp)
        s += sp
        if len(h) > k:
            s -= heapq.heappop(h)             # 超過 k 人,踢掉最慢的
        best = max(best, s * e)               # e 是目前團隊的最低效率
    return best % (10**9 + 7)`,
        c: `static int *E_;
static int cmpE(const void *a, const void *b) { return E_[*(int *)b] - E_[*(int *)a]; }

int maxPerformance(int n, int *speed, int speedSize, int *efficiency, int efficiencySize, int k) {
    int *idx = malloc(n * sizeof(int)), *h = malloc((k + 2) * sizeof(int)), hn = 0;
    for (int i = 0; i < n; i++) idx[i] = i;
    E_ = efficiency;
    qsort(idx, n, sizeof(int), cmpE);
    long long s = 0, best = 0;
    for (int t = 0; t < n; t++) {
        int i = idx[t];
        h[hn] = speed[i]; s += speed[i];
        for (int c = hn++; c && h[(c - 1) / 2] > h[c]; c = (c - 1) / 2) { int x = h[c]; h[c] = h[(c - 1) / 2]; h[(c - 1) / 2] = x; }
        if (hn > k) {
            s -= h[0];
            h[0] = h[--hn];
            for (int c = 0;;) {
                int m = c, l = 2 * c + 1, r = l + 1;
                if (l < hn && h[l] < h[m]) m = l;
                if (r < hn && h[r] < h[m]) m = r;
                if (m == c) break;
                int x = h[c]; h[c] = h[m]; h[m] = x;
                c = m;
            }
        }
        if (s * efficiency[i] > best) best = s * efficiency[i];
    }
    free(idx); free(h);
    return (int)(best % 1000000007);
}`,
        cpp: `int maxPerformance(int n, vector<int>& speed, vector<int>& efficiency, int k) {
    vector<pair<int, int>> eng(n);
    for (int i = 0; i < n; i++) eng[i] = {efficiency[i], speed[i]};
    sort(eng.rbegin(), eng.rend());
    priority_queue<int, vector<int>, greater<int>> h;
    long long s = 0, best = 0;
    for (auto [e, sp] : eng) {
        h.push(sp); s += sp;
        if ((int)h.size() > k) { s -= h.top(); h.pop(); }
        best = max(best, s * e);
    }
    return best % 1000000007;
}`,
        java: `int maxPerformance(int n, int[] speed, int[] efficiency, int k) {
    Integer[] idx = new Integer[n];
    for (int i = 0; i < n; i++) idx[i] = i;
    Arrays.sort(idx, (a, b) -> efficiency[b] - efficiency[a]);
    PriorityQueue<Integer> h = new PriorityQueue<>();
    long s = 0, best = 0;
    for (int i : idx) {
        h.offer(speed[i]); s += speed[i];
        if (h.size() > k) s -= h.poll();
        best = Math.max(best, s * efficiency[i]);
    }
    return (int) (best % 1_000_000_007);
}`,
        javascript: `function maxPerformance(n, speed, efficiency, k) {
  const idx = [...Array(n).keys()].sort((a, b) => efficiency[b] - efficiency[a]);
  const h = [];
  const push = (v) => {
    h.push(v);
    for (let c = h.length - 1; c && h[(c - 1) >> 1] > h[c]; c = (c - 1) >> 1) [h[c], h[(c - 1) >> 1]] = [h[(c - 1) >> 1], h[c]];
  };
  const pop = () => {
    const top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last;
      for (let c = 0; ; ) {
        let m = c;
        const l = 2 * c + 1, r = l + 1;
        if (l < h.length && h[l] < h[m]) m = l;
        if (r < h.length && h[r] < h[m]) m = r;
        if (m === c) break;
        [h[c], h[m]] = [h[m], h[c]];
        c = m;
      }
    }
    return top;
  };
  let s = 0n, best = 0n;                      // 乘積可達 10¹⁸,用 BigInt
  for (const i of idx) {
    push(speed[i]);
    s += BigInt(speed[i]);
    if (h.length > k) s -= BigInt(pop());
    const p = s * BigInt(efficiency[i]);
    if (p > best) best = p;
  }
  return Number(best % 1000000007n);
}`,
      },
    },
    {
      name: '枚舉最低效率 + 每次排序',
      idea: '每個 i 當最低效率:候選 = 效率比他高(相同時用索引決定)的人,取速度最大的 k − 1 個。',
      steps: ['`for i`:候選速度 = 效率 > e[i](或相等且 j > i)的人', '取最大的 k − 1 個加上 speed[i]', '`best = max(best, 和 × e[i])`', '最後取餘數'],
      figure: { title: `k = ${K}`, steps: bruteFig() },
      complexity: { time: 'O(n² log n)', space: 'O(n)', why: '每個 i 都排序候選。' },
      verdict: '直接照「固定最低效率」的想法做,用來驗證堆積版。',
      code: {
        python: `def maxPerformance(n, speed, efficiency, k):
    best = 0
    for i in range(n):
        cand = sorted((speed[j] for j in range(n) if (efficiency[j], j) > (efficiency[i], i)), reverse=True)
        best = max(best, (speed[i] + sum(cand[:k - 1])) * efficiency[i])
    return best % (10**9 + 7)`,
        c: `static int cmpDesc(const void *a, const void *b) { return *(int *)b - *(int *)a; }

int maxPerformance(int n, int *speed, int speedSize, int *efficiency, int efficiencySize, int k) {
    int *cand = malloc(n * sizeof(int));
    long long best = 0;
    for (int i = 0; i < n; i++) {
        int m = 0;
        for (int j = 0; j < n; j++)
            if (efficiency[j] > efficiency[i] || (efficiency[j] == efficiency[i] && j > i)) cand[m++] = speed[j];
        qsort(cand, m, sizeof(int), cmpDesc);
        long long s = speed[i];
        for (int t = 0; t < k - 1 && t < m; t++) s += cand[t];
        if (s * efficiency[i] > best) best = s * efficiency[i];
    }
    free(cand);
    return (int)(best % 1000000007);
}`,
        cpp: `int maxPerformance(int n, vector<int>& speed, vector<int>& efficiency, int k) {
    long long best = 0;
    for (int i = 0; i < n; i++) {
        vector<int> cand;
        for (int j = 0; j < n; j++)
            if (efficiency[j] > efficiency[i] || (efficiency[j] == efficiency[i] && j > i)) cand.push_back(speed[j]);
        sort(cand.rbegin(), cand.rend());
        long long s = speed[i];
        for (int t = 0; t < k - 1 && t < (int)cand.size(); t++) s += cand[t];
        best = max(best, s * efficiency[i]);
    }
    return best % 1000000007;
}`,
        java: `int maxPerformance(int n, int[] speed, int[] efficiency, int k) {
    long best = 0;
    for (int i = 0; i < n; i++) {
        List<Integer> cand = new ArrayList<>();
        for (int j = 0; j < n; j++)
            if (efficiency[j] > efficiency[i] || (efficiency[j] == efficiency[i] && j > i)) cand.add(speed[j]);
        cand.sort(Collections.reverseOrder());
        long s = speed[i];
        for (int t = 0; t < k - 1 && t < cand.size(); t++) s += cand.get(t);
        best = Math.max(best, s * efficiency[i]);
    }
    return (int) (best % 1_000_000_007);
}`,
        javascript: `function maxPerformance(n, speed, efficiency, k) {
  let best = 0n;
  for (let i = 0; i < n; i++) {
    const cand = [];
    for (let j = 0; j < n; j++) if (efficiency[j] > efficiency[i] || (efficiency[j] === efficiency[i] && j > i)) cand.push(speed[j]);
    cand.sort((a, b) => b - a);
    let s = BigInt(speed[i]);
    for (let t = 0; t < k - 1 && t < cand.length; t++) s += BigInt(cand[t]);
    const p = s * BigInt(efficiency[i]);
    if (p > best) best = p;
  }
  return Number(best % 1000000007n);
}`,
      },
    },
  ],
  pitfalls: ['每一步先取餘數再比大小:取餘數後的大小關係不對', '以為一定要剛好 k 人:「最多」k 人,堆積還沒滿也要計算', 'JavaScript 的乘積超過 2⁵³ 會失準,要用 BigInt'],
  check: {
    kind: 'fn',
    fn: 'maxPerformance',
    cases: [
      { args: [N, SPEED, EFF, 2], out: 60 },
      { args: [N, SPEED, EFF, 3], out: 68 },
      { args: [N, SPEED, EFF, 4], out: 72 },
      { args: [1, [100000], [100000000], 1], out: 999930007 },
    ],
  },
}
