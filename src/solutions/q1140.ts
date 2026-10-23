import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1140. Stone Game II

const P = [2, 7, 9, 4, 4]

function suffix(): number[] {
  const s = Array(P.length + 1).fill(0)
  for (let i = P.length - 1; i >= 0; i--) s[i] = s[i + 1] + P[i]
  return s
}

function memoFig(): FigStep[] {
  const suf = suffix()
  return [
    { note: '先算後綴和 suf[i] = 從第 i 堆到最後的總石頭數。關鍵想法:f(i, M) = 「輪到某人、從第 i 堆開始、參數 M」時,**這個人**最多拿多少', views: [arr(P, { label: 'piles' }), arr(suf, { label: 'suf(後綴和)' })] },
    { note: '這個人拿走 X 堆(1 ≤ X ≤ 2M)後,對手面對 f(i+X, max(M, X))。剩下的石頭總共 suf[i],對手拿多少,我就少多少 → 我拿 suf[i] − f(i+X, …),取所有 X 中最大的', views: [arr(P, { label: 'piles', highlight: [0], range: [1, 4] })] },
    { note: `剩下的堆數 ≤ 2M 時,一次全拿最好:f(i, M) = suf[i]。例:f(3, 2) = suf[3] = ${suf[3]}`, views: [arr(P, { label: 'piles', done: [3, 4] })] },
    { note: 'Alice 從 f(0, 1) 開始(總共 26 顆):拿 1 堆 → Bob 面對 f(1, 1) = 16,Alice 得 26 − 16 = 10;拿 2 堆 → Bob 面對 f(2, 2) = 17(剩 3 堆 ≤ 4,全拿),Alice 得 9。取大的 → 10', views: [arr(P, { label: 'piles', highlight: [0], compare: [1, 2] })] },
  ]
}

function tableFig(): FigStep[] {
  const n = P.length
  const suf = suffix()
  const dp: (number | string)[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(''))
  for (let i = n; i >= 0; i--)
    for (let m = 1; m <= n; m++) {
      if (i === n) dp[i][m] = 0
      else if (i + 2 * m >= n) dp[i][m] = suf[i]
      else {
        let best = 0
        for (let x = 1; x <= 2 * m; x++) best = Math.max(best, suf[i] - (dp[i + x][Math.max(m, x)] as number))
        dp[i][m] = best
      }
    }
  const view = (hl: [number, number][]): GridViewData => ({ kind: 'grid', label: 'dp[i][M](列 = 從第 i 堆開始,行 = M)', cells: dp.map((r) => r.slice(1)), rowLabels: Array.from({ length: n + 1 }, (_, i) => `i=${i}`), colLabels: Array.from({ length: n }, (_, m) => `M=${m + 1}`), marks: { hl } })
  return [
    { note: '由下往上填表(i 從大到小):dp[i][M] 只依賴 i 更大的格子', views: [view([])] },
    { note: `答案 dp[0][1] = ${dp[0][1]}`, views: [view([[0, 0]])] },
  ]
}

export const q1140: Solution = {
  id: 1140,
  plain: 'Alice 和 Bob 輪流從一排石頭堆的**最前面**拿走若干堆。一開始 M = 1,每次可以拿 1 到 2M 堆,拿了 X 堆之後 M 變成 max(M, X)。兩人都用最聰明的方式玩,Alice 先手,她最多能拿到幾顆石頭?',
  statement: '`piles[i]` 是第 i 堆的石頭數。兩人輪流從剩下的最前面拿走 X 堆(1 ≤ X ≤ 2M),然後 `M = max(M, X)`;一開始 M = 1,Alice 先。雙方都採最佳策略,回傳 Alice 最多拿到的石頭數。',
  examples: [
    { input: 'piles = [2,7,9,4,4]', output: '10', note: 'Alice 拿 1 堆(2),Bob 拿 1 堆(7),Alice 拿 2 堆(9+4)…;算到底 Alice 最多 10' },
    { input: 'piles = [1,2,3,4,5,100]', output: '104' },
  ],
  constraints: ['n ≤ 100 → 狀態 (i, M) 最多 100 × 100 個,每個試 2M 種 → O(n³) 約 10⁶'],
  insight: [
    '雙人零和遊戲:「我拿得多」= 「對手拿得少」',
    '狀態只要 (i, M):從第 i 堆開始、目前的 M。不用記「輪到誰」,因為 f 定義成「**目前這個人**最多拿多少」',
    '`f(i, M) = max over X of (suf[i] − f(i+X, max(M, X)))`:剩下的石頭裡,對手拿走他的最佳值,剩下都是我的',
    '剩下的堆數 ≤ 2M 時全拿',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化',
      idea: '`f(i, M)`:`i + 2M ≥ n` → `suf[i]`;否則 `max(suf[i] − f(i + X, max(M, X)))`,X = 1..2M。',
      steps: ['算後綴和 suf', '`f(i, M)`:`i + 2M >= n` → 回傳 `suf[i]`', '否則對 X = 1..2M 取 `suf[i] − f(i + X, max(M, X))` 的最大值', '記憶化;答案 `f(0, 1)`'],
      figure: { title: `piles = [${P}]`, steps: memoFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '狀態 n × n 個,每個最多試 2M ≤ 2n 種拿法。' },
      verdict: '最推薦。博弈 DP 的標準寫法:用「總數 − 對手的最佳」把兩個玩家統一成同一個函式。',
      code: {
        python: `from functools import lru_cache

def stoneGameII(piles):
    n = len(piles)
    suf = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suf[i] = suf[i + 1] + piles[i]

    @lru_cache(maxsize=None)
    def f(i, M):                              # 目前這個人從第 i 堆開始最多拿多少
        if i + 2 * M >= n:
            return suf[i]                     # 剩下的一次拿光
        return max(suf[i] - f(i + X, max(M, X)) for X in range(1, 2 * M + 1))

    return f(0, 1)`,
        c: `static int memo[101][101], suf[102], N_;

static int f(int i, int M) {
    if (i + 2 * M >= N_) return suf[i];
    if (memo[i][M]) return memo[i][M];
    int best = 0;
    for (int X = 1; X <= 2 * M; X++) {
        int v = suf[i] - f(i + X, M > X ? M : X);
        if (v > best) best = v;
    }
    return memo[i][M] = best;
}

int stoneGameII(int *piles, int pilesSize) {
    N_ = pilesSize;
    suf[N_] = 0;
    for (int i = N_ - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
    memset(memo, 0, sizeof memo);
    return f(0, 1);
}`,
        cpp: `int stoneGameII(vector<int>& piles) {
    int n = piles.size();
    vector<int> suf(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
    vector<vector<int>> memo(n, vector<int>(n + 1, -1));
    function<int(int, int)> f = [&](int i, int M) {
        if (i + 2 * M >= n) return suf[i];
        int &r = memo[i][M];
        if (r >= 0) return r;
        r = 0;
        for (int X = 1; X <= 2 * M; X++) r = max(r, suf[i] - f(i + X, max(M, X)));
        return r;
    };
    return f(0, 1);
}`,
        java: `private int[] suf;
private int[][] memo;
private int n;

int stoneGameII(int[] piles) {
    n = piles.length;
    suf = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
    memo = new int[n][n + 1];
    return f(0, 1);
}

private int f(int i, int M) {
    if (i + 2 * M >= n) return suf[i];
    if (memo[i][M] > 0) return memo[i][M];
    int best = 0;
    for (int X = 1; X <= 2 * M; X++) best = Math.max(best, suf[i] - f(i + X, Math.max(M, X)));
    return memo[i][M] = best;
}`,
        javascript: `function stoneGameII(piles) {
  const n = piles.length, suf = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
  const memo = new Map();
  const f = (i, M) => {
    if (i + 2 * M >= n) return suf[i];
    const key = i * 1000 + M;
    if (memo.has(key)) return memo.get(key);
    let best = 0;
    for (let X = 1; X <= 2 * M; X++) best = Math.max(best, suf[i] - f(i + X, Math.max(M, X)));
    memo.set(key, best);
    return best;
  };
  return f(0, 1);
}`,
      },
    },
    {
      name: '由下往上填表',
      idea: '`dp[i][M]` 同上,i 從 n−1 往 0 填;M 只需要到 n(超過 n 的 M 和 n 一樣,都能全拿)。',
      steps: ['`dp[n][*] = 0`', '`for i in n−1..0`、`for M in 1..n`:', '`i + 2M >= n` → `suf[i]`;否則 `max(suf[i] − dp[i + X][min(n, max(M, X))])`', '回傳 `dp[0][1]`'],
      figure: { title: `piles = [${P}]`, steps: tableFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '同上,沒有遞迴的呼叫成本。' },
      verdict: '和記憶化一樣,只是改成迴圈。填表順序要確保用到的格子(i 更大)已經算好。',
      code: {
        python: `def stoneGameII(piles):
    n = len(piles)
    suf = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        suf[i] = suf[i + 1] + piles[i]
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for M in range(1, n + 1):
            if i + 2 * M >= n:
                dp[i][M] = suf[i]
            else:
                dp[i][M] = max(suf[i] - dp[i + X][max(M, X)] for X in range(1, 2 * M + 1))
    return dp[0][1]`,
        c: `int stoneGameII(int *piles, int pilesSize) {
    int n = pilesSize;
    int suf[102] = {0}, dp[102][102] = {{0}};
    for (int i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
    for (int i = n - 1; i >= 0; i--)
        for (int M = 1; M <= n; M++) {
            if (i + 2 * M >= n) { dp[i][M] = suf[i]; continue; }
            int best = 0;
            for (int X = 1; X <= 2 * M; X++) {
                int v = suf[i] - dp[i + X][M > X ? M : X];
                if (v > best) best = v;
            }
            dp[i][M] = best;
        }
    return dp[0][1];
}`,
        cpp: `int stoneGameII(vector<int>& piles) {
    int n = piles.size();
    vector<int> suf(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
    vector<vector<int>> dp(n + 1, vector<int>(n + 1, 0));
    for (int i = n - 1; i >= 0; i--)
        for (int M = 1; M <= n; M++) {
            if (i + 2 * M >= n) { dp[i][M] = suf[i]; continue; }
            for (int X = 1; X <= 2 * M; X++) dp[i][M] = max(dp[i][M], suf[i] - dp[i + X][max(M, X)]);
        }
    return dp[0][1];
}`,
        java: `int stoneGameII(int[] piles) {
    int n = piles.length;
    int[] suf = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
    int[][] dp = new int[n + 1][n + 1];
    for (int i = n - 1; i >= 0; i--)
        for (int M = 1; M <= n; M++) {
            if (i + 2 * M >= n) { dp[i][M] = suf[i]; continue; }
            for (int X = 1; X <= 2 * M; X++) dp[i][M] = Math.max(dp[i][M], suf[i] - dp[i + X][Math.max(M, X)]);
        }
    return dp[0][1];
}`,
        javascript: `function stoneGameII(piles) {
  const n = piles.length, suf = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suf[i] = suf[i + 1] + piles[i];
  const dp = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let M = 1; M <= n; M++) {
      if (i + 2 * M >= n) {
        dp[i][M] = suf[i];
        continue;
      }
      for (let X = 1; X <= 2 * M; X++) dp[i][M] = Math.max(dp[i][M], suf[i] - dp[i + X][Math.max(M, X)]);
    }
  return dp[0][1];
}`,
      },
    },
  ],
  pitfalls: ['狀態多記一個「輪到誰」:可以但沒必要,用「總數 − 對手最佳」就統一了', 'M 的上限:i + X ≤ n 時 max(M, X) ≤ n,表開 n+1 行就夠', '忘了「剩下 ≤ 2M 堆就全拿」的終止條件,會讓 i + X 超出範圍'],
  check: {
    kind: 'fn',
    fn: 'stoneGameII',
    cases: [
      { args: [P], out: 10 },
      { args: [[1, 2, 3, 4, 5, 100]], out: 104 },
      { args: [[5]], out: 5 },
      { args: [[3, 1]], out: 4 },
      { args: [[8, 1, 1, 1, 9]], out: 10 },
    ],
  },
}
