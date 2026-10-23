import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1626. Best Team With No Conflicts

const SC = [4, 5, 6, 5]
const AG = [2, 1, 2, 1]

function dpFig(): FigStep[] {
  const ps = SC.map((s, i) => [AG[i], s]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const dp = ps.map(([, s]) => s)
  for (let i = 0; i < ps.length; i++) for (let j = 0; j < i; j++) if (ps[j][1] <= ps[i][1]) dp[i] = Math.max(dp[i], dp[j] + ps[i][1])
  return [
    { note: '衝突:年紀小的人分數**嚴格高於**年紀大的人。同年紀沒有衝突。要選一隊沒有衝突、總分最高的球員', views: [arr(SC, { label: 'scores' }), arr(AG, { label: 'ages' })] },
    { note: '依 (年紀, 分數) 排序。排序後,選出的隊伍分數必須「非遞減」才不會衝突 → 變成「和最大的非遞減子序列」', views: [arr(ps.map(([a, s]) => `${a}歲:${s}`), { label: '排序後' })] },
    { note: '`dp[i]` = 以第 i 人為「分數最高者」的最大總分:`dp[i] = score[i] + max(dp[j])`,其中 `score[j] ≤ score[i]`', views: [arr(dp, { label: 'dp', done: [dp.indexOf(Math.max(...dp))] })] },
    { note: `答案 ${Math.max(...dp)}:1 歲的 5、5 加上 2 歲的 6。2 歲的 4 不能選(比 1 歲的 5 低 → 衝突)`, views: [arr([Math.max(...dp)], { label: '答案', done: [0] })] },
  ]
}

function bitFig(): FigStep[] {
  return [
    { note: '加速:排序後依序處理,需要「分數 ≤ s 的人中 dp 最大值」→ 用樹狀陣列(BIT)維護字首最大值', views: [arr(['query(s) = max dp[分數 ≤ s]', 'update(s, dp)'], { label: '兩個操作' })] },
    { note: '每個人 O(log 最大分數),總共 O(n log M)', views: [arr([16], { label: '答案', done: [0] })] },
  ]
}

export const q1626: Solution = {
  id: 1626,
  plain: '要從一群球員中挑一隊,隊伍總分是成員分數的和。但如果隊裡有年紀較小的人分數比年紀較大的人還高,就會起衝突。不能有衝突的前提下,最高總分是多少?',
  statement: '`scores[i]`、`ages[i]` 是第 i 位球員的分數與年齡。若隊中有一位較年輕的球員分數**嚴格高於**較年長的球員,則發生衝突(同齡不衝突)。回傳沒有衝突的隊伍可能的最高總分。',
  examples: [
    { input: 'scores = [1,3,5,10,15], ages = [1,2,3,4,5]', output: '34', note: '全選' },
    { input: 'scores = [4,5,6,5], ages = [2,1,2,1]', output: '16', note: '後三位' },
    { input: 'scores = [1,2,3,5], ages = [8,9,10,1]', output: '6' },
  ],
  constraints: ['n ≤ 1000,分數 ≤ 10⁶'],
  insight: ['依年齡排序(同齡再依分數),合法隊伍 ⇔ 分數非遞減', '= 「總和最大」的非遞減子序列 → [[p:lis]] 的變形', 'O(n²) DP 或 BIT 加速'],
  approaches: [
    {
      name: '排序 + LIS 式 DP',
      idea: '依 (age, score) 排序;`dp[i] = score[i] + max(dp[j] for j < i if score[j] <= score[i])`;答案 max(dp)。',
      steps: ['`ps = sorted(zip(ages, scores))`', '`dp[i] = ps[i].score`', '`for j < i`:`ps[j].score <= ps[i].score` → `dp[i] = max(dp[i], dp[j] + ps[i].score)`', '回傳 `max(dp)`'],
      figure: { title: `scores = [${SC}],ages = [${AG}]`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'n ≤ 1000,10⁶ 次運算。' },
      verdict: '最推薦;關鍵在排序後把「兩個維度」降成「一個維度的非遞減」。',
      code: {
        python: `def bestTeamScore(scores, ages):
    ps = sorted(zip(ages, scores))            # 年齡小的在前,同齡分數小的在前
    n = len(ps)
    dp = [s for _, s in ps]
    for i in range(n):
        for j in range(i):
            if ps[j][1] <= ps[i][1]:          # 分數不遞減才不衝突
                dp[i] = max(dp[i], dp[j] + ps[i][1])
    return max(dp)`,
        c: `static int *Ag, *Sc;

static int cmpP(const void *x, const void *y) {
    int a = *(int *)x, b = *(int *)y;
    return Ag[a] != Ag[b] ? Ag[a] - Ag[b] : Sc[a] - Sc[b];
}

int bestTeamScore(int *scores, int scoresSize, int *ages, int agesSize) {
    int n = scoresSize, *id = malloc(n * sizeof(int)), *dp = malloc(n * sizeof(int)), best = 0;
    Ag = ages; Sc = scores;
    for (int i = 0; i < n; i++) id[i] = i;
    qsort(id, n, sizeof(int), cmpP);
    for (int i = 0; i < n; i++) {
        int si = scores[id[i]];
        dp[i] = si;
        for (int j = 0; j < i; j++)
            if (scores[id[j]] <= si && dp[j] + si > dp[i]) dp[i] = dp[j] + si;
        if (dp[i] > best) best = dp[i];
    }
    free(id); free(dp);
    return best;
}`,
        cpp: `int bestTeamScore(vector<int>& scores, vector<int>& ages) {
    int n = scores.size();
    vector<pair<int, int>> ps(n);
    for (int i = 0; i < n; i++) ps[i] = {ages[i], scores[i]};
    sort(ps.begin(), ps.end());
    vector<int> dp(n);
    int best = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = ps[i].second;
        for (int j = 0; j < i; j++)
            if (ps[j].second <= ps[i].second) dp[i] = max(dp[i], dp[j] + ps[i].second);
        best = max(best, dp[i]);
    }
    return best;
}`,
        java: `int bestTeamScore(int[] scores, int[] ages) {
    int n = scores.length;
    int[][] ps = new int[n][];
    for (int i = 0; i < n; i++) ps[i] = new int[]{ages[i], scores[i]};
    Arrays.sort(ps, (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    int[] dp = new int[n];
    int best = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = ps[i][1];
        for (int j = 0; j < i; j++)
            if (ps[j][1] <= ps[i][1]) dp[i] = Math.max(dp[i], dp[j] + ps[i][1]);
        best = Math.max(best, dp[i]);
    }
    return best;
}`,
        javascript: `function bestTeamScore(scores, ages) {
  const ps = scores.map((s, i) => [ages[i], s]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const dp = ps.map(([, s]) => s);
  for (let i = 0; i < ps.length; i++)
    for (let j = 0; j < i; j++) if (ps[j][1] <= ps[i][1]) dp[i] = Math.max(dp[i], dp[j] + ps[i][1]);
  return Math.max(...dp);
}`,
      },
    },
    {
      name: '排序 + 樹狀陣列(字首最大值)',
      idea: '依 (age, score) 排序後,依序對每人 `best = query(score) + score`,再 `update(score, best)`;BIT 以分數為索引,維護字首最大值。',
      steps: ['`bit = [0] * (maxScore + 1)`', '`query(s)`:`s` 往下跳 `s −= s & −s`,取最大', '`update(s, v)`:`s` 往上跳 `s += s & −s`,取最大', '依序處理,答案是所有 best 的最大值'],
      figure: { title: `scores = [${SC}],ages = [${AG}]`, steps: bitFig() },
      complexity: { time: 'O(n log M)', space: 'O(M)', why: 'M 是最大分數(10⁶)。' },
      verdict: '把 LIS 的內層迴圈換成 BIT 查詢;n 很大時才需要。',
      code: {
        python: `def bestTeamScore(scores, ages):
    M = max(scores)
    bit = [0] * (M + 1)

    def query(s):                             # 分數 ≤ s 的最大 dp
        r = 0
        while s > 0:
            r = max(r, bit[s])
            s -= s & -s
        return r

    def update(s, v):
        while s <= M:
            bit[s] = max(bit[s], v)
            s += s & -s

    best = 0
    for age, s in sorted(zip(ages, scores)):
        cur = query(s) + s
        update(s, cur)
        best = max(best, cur)
    return best`,
        c: `static int *Ag2, *Sc2;

static int cmpP2(const void *x, const void *y) {
    int a = *(int *)x, b = *(int *)y;
    return Ag2[a] != Ag2[b] ? Ag2[a] - Ag2[b] : Sc2[a] - Sc2[b];
}

int bestTeamScore(int *scores, int scoresSize, int *ages, int agesSize) {
    int n = scoresSize, M = 0, best = 0, *id = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) { id[i] = i; if (scores[i] > M) M = scores[i]; }
    Ag2 = ages; Sc2 = scores;
    qsort(id, n, sizeof(int), cmpP2);
    int *bit = calloc(M + 1, sizeof(int));
    for (int k = 0; k < n; k++) {
        int s = scores[id[k]], q = 0;
        for (int x = s; x > 0; x -= x & -x) if (bit[x] > q) q = bit[x];
        int cur = q + s;
        for (int x = s; x <= M; x += x & -x) if (cur > bit[x]) bit[x] = cur;
        if (cur > best) best = cur;
    }
    free(id); free(bit);
    return best;
}`,
        cpp: `int bestTeamScore(vector<int>& scores, vector<int>& ages) {
    int n = scores.size(), M = *max_element(scores.begin(), scores.end()), best = 0;
    vector<pair<int, int>> ps(n);
    for (int i = 0; i < n; i++) ps[i] = {ages[i], scores[i]};
    sort(ps.begin(), ps.end());
    vector<int> bit(M + 1, 0);
    for (auto [a, s] : ps) {
        int q = 0;
        for (int x = s; x > 0; x -= x & -x) q = max(q, bit[x]);
        int cur = q + s;
        for (int x = s; x <= M; x += x & -x) bit[x] = max(bit[x], cur);
        best = max(best, cur);
    }
    return best;
}`,
        java: `int bestTeamScore(int[] scores, int[] ages) {
    int n = scores.length, M = 0, best = 0;
    int[][] ps = new int[n][];
    for (int i = 0; i < n; i++) { ps[i] = new int[]{ages[i], scores[i]}; M = Math.max(M, scores[i]); }
    Arrays.sort(ps, (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    int[] bit = new int[M + 1];
    for (int[] p : ps) {
        int s = p[1], q = 0;
        for (int x = s; x > 0; x -= x & -x) q = Math.max(q, bit[x]);
        int cur = q + s;
        for (int x = s; x <= M; x += x & -x) bit[x] = Math.max(bit[x], cur);
        best = Math.max(best, cur);
    }
    return best;
}`,
        javascript: `function bestTeamScore(scores, ages) {
  const M = Math.max(...scores), bit = new Array(M + 1).fill(0);
  const ps = scores.map((s, i) => [ages[i], s]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let best = 0;
  for (const [, s] of ps) {
    let q = 0;
    for (let x = s; x > 0; x -= x & -x) q = Math.max(q, bit[x]);
    const cur = q + s;
    for (let x = s; x <= M; x += x & -x) bit[x] = Math.max(bit[x], cur);
    best = Math.max(best, cur);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: ['同齡沒有依分數排序:同齡的人會被誤判成衝突', '比較用 `<`:分數相同不算衝突,要 `<=`', '貪心選分數最高的人:會和其他人衝突'],
  check: {
    kind: 'fn',
    fn: 'bestTeamScore',
    cases: [
      { args: [[1, 3, 5, 10, 15], [1, 2, 3, 4, 5]], out: 34 },
      { args: [SC, AG], out: 16 },
      { args: [[1, 2, 3, 5], [8, 9, 10, 1]], out: 6 },
      { args: [[9, 2, 8, 8, 2], [4, 1, 3, 3, 5]], out: 27 },
    ],
  },
}
