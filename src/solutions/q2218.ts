import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 2218. Maximum Value of K Coins From Piles

const PILES = [[1, 100, 3], [7, 8, 9]]
const K = 2

function table(): number[][] {
  const n = PILES.length
  const dp = Array.from({ length: n + 1 }, () => Array(K + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= K; c++) {
      dp[i][c] = dp[i - 1][c]
      let s = 0
      for (let t = 1; t <= Math.min(c, PILES[i - 1].length); t++) {
        s += PILES[i - 1][t - 1]
        dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - t] + s)
      }
    }
  }
  return dp
}

function view(dp: (number | string)[][], hl: [number, number][] = [], cmp: [number, number][] = []): GridViewData {
  return { kind: 'grid', label: 'dp[i][c] = 只用前 i 堆、拿 c 枚的最大價值', cells: dp.map((r) => [...r]), rowLabels: ['0 堆', ...PILES.map((_, i) => `前 ${i + 1} 堆`)], colLabels: Array.from({ length: K + 1 }, (_, c) => `c=${c}`), marks: { hl, cmp } }
}

function dpFig(): FigStep[] {
  const dp = table()
  const blank: (number | string)[][] = dp.map((r, i) => (i === 0 ? [...r] : r.map(() => '')))
  const out: FigStep[] = [{ note: '每一堆只能從上面拿,所以從第 i 堆拿 t 枚,價值就是它**前 t 枚的和**。問題變成:每堆選一個 t(可以是 0),總共 k 枚,價值最大 → 分組背包', views: [arr(PILES[0], { label: '第 1 堆(由上而下)' }), arr(PILES[1], { label: '第 2 堆' })] }]
  out.push({ note: '第 0 列:一堆都不用,價值都是 0', views: [view(blank)] })
  for (let i = 1; i <= PILES.length; i++) {
    blank[i] = [...dp[i]]
    const c = K
    out.push({ note: `第 ${i} 堆:dp[${i}][c] = max(不拿 dp[${i - 1}][c],拿 t 枚 dp[${i - 1}][c−t] + 前 t 枚的和)。例如 c = ${c}:${Array.from({ length: Math.min(c, PILES[i - 1].length) + 1 }, (_, t) => `t=${t} → ${dp[i - 1][c - t] + PILES[i - 1].slice(0, t).reduce((a, b) => a + b, 0)}`).join(',')} → ${dp[i][c]}`, views: [view(blank, [[i, c]], Array.from({ length: Math.min(c, PILES[i - 1].length) + 1 }, (_, t) => [i - 1, c - t] as [number, number]))] })
  }
  out.push({ note: `答案 dp[${PILES.length}][${K}] = ${dp[PILES.length][K]}(第 1 堆拿 1、100;第 2 堆一枚都不拿)`, views: [view(dp, [[PILES.length, K]])] })
  return out
}

function memoFig(): FigStep[] {
  return [
    { note: 'f(i, c) = 從第 i 堆以後、還能拿 c 枚時的最大價值。第 i 堆可以拿 0..min(c, 長度) 枚', views: [arr(['f(0,2)', '→ t=0: f(1,2)', '→ t=1: 1 + f(1,1)', '→ t=2: 101 + f(1,0)'], { label: '第 1 堆的選擇' })] },
    { note: 'f(1, 2) = 15(拿 7、8)、1 + f(1,1) = 1 + 7 = 8、101 + 0 = 101 → 最大 101', views: [arr([15, 8, 101], { label: '三種選擇的價值', done: [2] })] },
  ]
}

export const q2218: Solution = {
  id: 2218,
  plain: '桌上有好幾疊硬幣,每疊只能從最上面一枚一枚拿。總共只能拿 k 枚,怎麼拿總價值最大?有時候為了拿到下面那枚很值錢的,得先拿上面不值錢的。',
  statement: '`piles[i]` 是第 i 疊硬幣由上到下的面額。每次只能拿某一疊**最上面**的一枚。恰好拿 k 枚,回傳總面額的最大值。',
  examples: [
    { input: 'piles = [[1,100,3],[7,8,9]], k = 2', output: '101', note: '第一疊拿 1 和 100' },
    { input: 'piles = [[100],[100],[100],[100],[100],[100],[1,1,1,1,1,1,700]], k = 7', output: '706' },
  ],
  constraints: ['n ≤ 1000,所有硬幣總數 ≤ 2000,k ≤ 硬幣總數', '→ O(總硬幣數 × k) 約 4·10⁶'],
  insight: ['每一疊只能拿「上面連續 t 枚」→ 價值是前綴和', '每疊選一個 t,總和恰好 k → **分組背包**:每組(每疊)最多選一個選項', '`dp[i][c]` = 前 i 疊拿 c 枚的最大值;轉移時枚舉第 i 疊拿幾枚'],
  approaches: [
    {
      name: '分組背包(由下往上,一維滾動)',
      idea: '`dp[c]` = 目前處理過的疊、拿 c 枚的最大值;每疊對 c 由大到小,枚舉拿 t 枚:`dp[c] = max(dp[c], dp[c−t] + pre[t])`。',
      steps: ['`dp = [0] * (k + 1)`', '每一疊:算前綴和 pre', '`for c in k..1`(由大到小):`for t in 1..min(c, len)`:`dp[c] = max(dp[c], dp[c − t] + pre[t])`', '回傳 `dp[k]`'],
      figure: { title: `piles = ${JSON.stringify(PILES)},k = ${K}`, steps: dpFig() },
      complexity: { time: 'O(總硬幣數 × k)', space: 'O(k)', why: '每疊的每個 t 對每個 c 試一次;Σ 長度 = 總硬幣數。' },
      verdict: '最推薦。c 由大到小,才能保證 `dp[c − t]` 還是「上一疊」的值(同一疊不會選兩次),和 0/1 背包一樣。',
      code: {
        python: `def maxValueOfCoins(piles, k):
    dp = [0] * (k + 1)                        # dp[c]:拿 c 枚的最大價值
    for pile in piles:
        pre = [0]
        for v in pile:
            pre.append(pre[-1] + v)           # pre[t]:這疊上面 t 枚的和
        for c in range(k, 0, -1):             # 由大到小:dp[c−t] 還是上一疊的結果
            for t in range(1, min(c, len(pile)) + 1):
                dp[c] = max(dp[c], dp[c - t] + pre[t])
    return dp[k]`,
        c: `int maxValueOfCoins(int **piles, int pilesSize, int *pilesColSize, int k) {
    int *dp = calloc(k + 1, sizeof(int));
    for (int i = 0; i < pilesSize; i++) {
        int len = pilesColSize[i];
        int *pre = calloc(len + 1, sizeof(int));
        for (int t = 0; t < len; t++) pre[t + 1] = pre[t] + piles[i][t];
        for (int c = k; c >= 1; c--)
            for (int t = 1; t <= len && t <= c; t++)
                if (dp[c - t] + pre[t] > dp[c]) dp[c] = dp[c - t] + pre[t];
        free(pre);
    }
    int ans = dp[k];
    free(dp);
    return ans;
}`,
        cpp: `int maxValueOfCoins(vector<vector<int>>& piles, int k) {
    vector<int> dp(k + 1, 0);
    for (auto &pile : piles) {
        vector<int> pre(pile.size() + 1, 0);
        for (size_t t = 0; t < pile.size(); t++) pre[t + 1] = pre[t] + pile[t];
        for (int c = k; c >= 1; c--)
            for (int t = 1; t <= (int)pile.size() && t <= c; t++)
                dp[c] = max(dp[c], dp[c - t] + pre[t]);
    }
    return dp[k];
}`,
        java: `int maxValueOfCoins(List<List<Integer>> piles, int k) {
    int[] dp = new int[k + 1];
    for (List<Integer> pile : piles) {
        int len = pile.size();
        int[] pre = new int[len + 1];
        for (int t = 0; t < len; t++) pre[t + 1] = pre[t] + pile.get(t);
        for (int c = k; c >= 1; c--)
            for (int t = 1; t <= len && t <= c; t++)
                dp[c] = Math.max(dp[c], dp[c - t] + pre[t]);
    }
    return dp[k];
}`,
        javascript: `function maxValueOfCoins(piles, k) {
  const dp = new Array(k + 1).fill(0);
  for (const pile of piles) {
    const pre = [0];
    for (const v of pile) pre.push(pre[pre.length - 1] + v);
    for (let c = k; c >= 1; c--)
      for (let t = 1; t <= pile.length && t <= c; t++) dp[c] = Math.max(dp[c], dp[c - t] + pre[t]);
  }
  return dp[k];
}`,
      },
    },
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i, c)`:第 i 疊拿 t = 0..min(c, len) 枚,`max(pre[t] + f(i + 1, c − t))`。',
      steps: ['`f(n, c) = 0`', '`f(i, c)`:`best = f(i + 1, c)`(這疊不拿)', '`for t in 1..min(c, len)`:`best = max(best, pre[t] + f(i + 1, c − t))`', '記憶化;答案 `f(0, k)`'],
      figure: { title: `piles = ${JSON.stringify(PILES)},k = ${K}`, steps: memoFig() },
      complexity: { time: 'O(總硬幣數 × k)', space: 'O(n × k)', why: '狀態 n × (k+1),每個狀態試這疊的 t。' },
      verdict: '直接照「每疊拿幾枚」的選擇寫,最好想。記憶表比一維 DP 大。',
      code: {
        python: `from functools import lru_cache

def maxValueOfCoins(piles, k):
    pres = []
    for pile in piles:
        pre = [0]
        for v in pile:
            pre.append(pre[-1] + v)
        pres.append(pre)

    @lru_cache(maxsize=None)
    def f(i, c):                              # 從第 i 疊起,還能拿 c 枚
        if i == len(piles) or c == 0:
            return 0
        best = f(i + 1, c)                    # 這疊不拿
        for t in range(1, min(c, len(piles[i])) + 1):
            best = max(best, pres[i][t] + f(i + 1, c - t))
        return best

    return f(0, k)`,
        c: `static int **P_, *L_, N_, *memo_, K_;
static int **pre_;

static int f(int i, int c) {
    if (i == N_ || c == 0) return 0;
    int *m = &memo_[i * (K_ + 1) + c];
    if (*m >= 0) return *m;
    int best = f(i + 1, c);
    for (int t = 1; t <= L_[i] && t <= c; t++) {
        int v = pre_[i][t] + f(i + 1, c - t);
        if (v > best) best = v;
    }
    return *m = best;
}

int maxValueOfCoins(int **piles, int pilesSize, int *pilesColSize, int k) {
    P_ = piles; L_ = pilesColSize; N_ = pilesSize; K_ = k;
    pre_ = malloc(N_ * sizeof(int *));
    for (int i = 0; i < N_; i++) {
        pre_[i] = calloc(L_[i] + 1, sizeof(int));
        for (int t = 0; t < L_[i]; t++) pre_[i][t + 1] = pre_[i][t] + piles[i][t];
    }
    memo_ = malloc(N_ * (k + 1) * sizeof(int));
    for (int i = 0; i < N_ * (k + 1); i++) memo_[i] = -1;
    int ans = f(0, k);
    for (int i = 0; i < N_; i++) free(pre_[i]);
    free(pre_); free(memo_);
    return ans;
}`,
        cpp: `int maxValueOfCoins(vector<vector<int>>& piles, int k) {
    int n = piles.size();
    vector<vector<int>> pre(n), memo(n, vector<int>(k + 1, -1));
    for (int i = 0; i < n; i++) {
        pre[i].assign(piles[i].size() + 1, 0);
        for (size_t t = 0; t < piles[i].size(); t++) pre[i][t + 1] = pre[i][t] + piles[i][t];
    }
    function<int(int, int)> f = [&](int i, int c) -> int {
        if (i == n || c == 0) return 0;
        int &r = memo[i][c];
        if (r >= 0) return r;
        r = f(i + 1, c);
        for (int t = 1; t <= (int)piles[i].size() && t <= c; t++) r = max(r, pre[i][t] + f(i + 1, c - t));
        return r;
    };
    return f(0, k);
}`,
        java: `private int[][] memo, pre;

int maxValueOfCoins(List<List<Integer>> piles, int k) {
    int n = piles.size();
    pre = new int[n][];
    for (int i = 0; i < n; i++) {
        pre[i] = new int[piles.get(i).size() + 1];
        for (int t = 0; t < piles.get(i).size(); t++) pre[i][t + 1] = pre[i][t] + piles.get(i).get(t);
    }
    memo = new int[n][k + 1];
    for (int[] row : memo) Arrays.fill(row, -1);
    return f(0, k);
}

private int f(int i, int c) {
    if (i == pre.length || c == 0) return 0;
    if (memo[i][c] >= 0) return memo[i][c];
    int best = f(i + 1, c);
    for (int t = 1; t < pre[i].length && t <= c; t++) best = Math.max(best, pre[i][t] + f(i + 1, c - t));
    return memo[i][c] = best;
}`,
        javascript: `function maxValueOfCoins(piles, k) {
  const n = piles.length;
  const pre = piles.map((p) => {
    const a = [0];
    for (const v of p) a.push(a[a.length - 1] + v);
    return a;
  });
  const memo = Array.from({ length: n }, () => new Array(k + 1).fill(-1));
  const f = (i, c) => {
    if (i === n || c === 0) return 0;
    if (memo[i][c] >= 0) return memo[i][c];
    let best = f(i + 1, c);
    for (let t = 1; t <= piles[i].length && t <= c; t++) best = Math.max(best, pre[i][t] + f(i + 1, c - t));
    return (memo[i][c] = best);
  };
  return f(0, k);
}`,
      },
    },
  ],
  pitfalls: ['貪心每次拿最上面最大的那枚:例 1 會先拿 7,錯過底下的 100', '一維 DP 的 c 由小到大:同一疊會被選好幾次', 't 的上限要同時受 c 和這疊長度限制'],
  check: {
    kind: 'fn',
    fn: 'maxValueOfCoins',
    cases: [
      { args: [PILES, K], out: 101 },
      { args: [[[100], [100], [100], [100], [100], [100], [1, 1, 1, 1, 1, 1, 700]], 7], out: 706 },
      { args: [[[5, 4, 3]], 3], out: 12 },
      { args: [[[1, 2], [3, 4]], 1], out: 3 },
    ],
  },
}
