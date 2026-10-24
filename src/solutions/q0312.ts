import { arr, range } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 312. Burst Balloons

const A = [3, 1, 5, 8]
const V = [1, ...A, 1]

function table(dp: (number | string)[][], hl: Cell[] = []): GridViewData {
  const n = V.length
  return { kind: 'grid', label: 'dp[l][r]:只戳開區間 (l, r) 裡面的氣球(l、r 本身不戳),最多拿幾分', cells: dp.map((row, l) => row.map((v, r) => (r <= l + 1 ? '' : v))), rowLabels: V.map((v, i) => `${i}:${v}`), colLabels: range(0, n - 1).map((i) => `${i}:${V[i]}`), marks: { hl } }
}

function dpFig(): FigStep[] {
  const n = V.length
  const dp: (number | string)[][] = Array.from({ length: n }, () => Array(n).fill(''))
  for (let l = 0; l < n; l++) for (let r = l; r < Math.min(n, l + 2); r++) dp[l][r] = 0
  const out: FigStep[] = [
    { note: '先在兩端補上 1(戳到邊界時就當成乘 1)。反過來想:不要想「第一個戳誰」,要想「**最後**戳誰」', views: [arr(V, { label: 'nums(兩端補 1)', dim: [0, n - 1] })] },
    { note: '在區間 (l, r) 裡,如果 k 是**最後**被戳的,那時它的左右鄰居一定是 l 和 r(中間其他都戳完了)→ 得分 V[l]·V[k]·V[r] + dp[l][k] + dp[k][r]。兩邊的子問題互不影響!', views: [arr(V, { label: '例:l = 0, r = 5, k = 4 最後戳', highlight: [4], compare: [0, 5] })] },
  ]
  for (let len = 2; len < n; len++) {
    const hl: Cell[] = []
    let ex = ''
    for (let l = 0; l + len < n; l++) {
      const r = l + len
      let best = 0
      let bk = -1
      for (let k = l + 1; k < r; k++) {
        const v = V[l] * V[k] * V[r] + (dp[l][k] as number) + (dp[k][r] as number)
        if (v > best) (best = v), (bk = k)
      }
      dp[l][r] = best
      hl.push([l, r])
      if (!ex) ex = `例如 dp[${l}][${r}]:最後戳 ${bk}(值 ${V[bk]})最好 = ${V[l]}·${V[bk]}·${V[r]} + dp[${l}][${bk}] + dp[${bk}][${r}] = ${best}`
    }
    out.push({ note: `區間長度 ${len}(裡面有 ${len - 1} 顆氣球):${ex}`, views: [table(dp, hl)] })
  }
  out.push({ note: `答案 dp[0][${n - 1}] = ${dp[0][n - 1]}`, views: [table(dp, [[0, n - 1]])] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:試所有戳的順序。戳掉 1 之後 3 和 5 變成鄰居 → 每一步都會改變剩下的鄰居關係', views: [arr(A, { label: 'nums', highlight: [1] }), arr([3, 5, 8], { label: '戳掉 1 之後(得 3·1·5 = 15)' })] },
    { note: 'n 顆氣球有 n! 種順序,n = 300 完全不可能。「第一個戳誰」會讓左右兩邊互相影響,很難拆成子問題', views: [arr([3, 5, 8], { label: '剩下', highlight: [1] }), arr([3, 8], { label: '再戳 5(得 3·5·8 = 120)' })] },
  ]
}

function memoFig(): FigStep[] {
  const n = V.length
  const memo = new Map<string, number>()
  const f = (l: number, r: number): number => {
    if (r - l < 2) return 0
    const key = `${l},${r}`
    const hit = memo.get(key)
    if (hit !== undefined) return hit
    let best = 0
    for (let k = l + 1; k < r; k++) best = Math.max(best, V[l] * V[k] * V[r] + f(l, k) + f(k, r))
    memo.set(key, best)
    return best
  }
  const total = f(0, n - 1)
  const out: FigStep[] = [...bruteFig()]
  for (let k = 1; k < n - 1; k++) {
    const v = V[0] * V[k] * V[n - 1] + f(0, k) + f(k, n - 1)
    out.push({ note: `f(0, ${n - 1}) 試「最後戳 k = ${k}」(值 ${V[k]}):${V[0]}·${V[k]}·${V[n - 1]} + f(0, ${k}) + f(${k}, ${n - 1}) = ${V[0] * V[k] * V[n - 1]} + ${f(0, k)} + ${f(k, n - 1)} = ${v}`, views: [arr(V, { label: '最後戳 k,左右鄰居是 l = 0、r = ' + (n - 1), highlight: [k], compare: [0, n - 1] })] })
  }
  const dp: (number | string)[][] = Array.from({ length: n }, (_, l) => Array.from({ length: n }, (_, r) => memo.get(`${l},${r}`) ?? ''))
  const hl: Cell[] = [...memo.keys()].map((s) => s.split(',').map(Number) as Cell)
  out.push({ note: `取最大 → f(0, ${n - 1}) = ${total}。遞迴途中算過的 f(l, r) 都存進 memo,下次直接拿;子問題只有 O(n²) 個`, views: [table(dp, hl)] })
  return out
}

export const q0312: Solution = {
  id: 312,
  plain: '一排氣球,每顆上面有個數字。戳破一顆得到「它 × 左邊鄰居 × 右邊鄰居」的分數(邊界外當作 1),戳破後左右兩顆就變成鄰居。按什麼順序戳,總分最高?',
  statement: '有 n 個氣球,`nums[i]` 是第 i 個的數字。戳破第 i 個可以得到 `nums[i−1] · nums[i] · nums[i+1]` 枚硬幣(超出邊界視為 1),之後 i−1 和 i+1 變成相鄰。求戳破所有氣球能得到的最多硬幣數。',
  examples: [
    { input: 'nums = [3,1,5,8]', output: '167', note: '3·1·5 + 3·5·8 + 1·3·8 + 1·8·1 = 15 + 120 + 24 + 8' },
    { input: 'nums = [1,5]', output: '10' },
  ],
  constraints: ['`n ≤ 300` → O(n³) = 2700 萬,可以'],
  insight: [
    '「先戳誰」會改變鄰居,左右兩邊糾纏在一起,沒辦法拆成子問題',
    '**反過來想最後戳誰**:在區間 (l, r) 中,若 k 是最後戳的,那時只剩 l、k、r → 得分 `v[l]·v[k]·v[r]`',
    '而 k 把區間切成 (l, k) 和 (k, r),兩邊在 k 被戳之前各自獨立 → `dp[l][r] = max(dp[l][k] + dp[k][r] + v[l]·v[k]·v[r])`',
    '兩端補 1 讓邊界統一;區間由短到長填 → **區間 DP**',
  ],
  approaches: [
    {
      name: '遞迴 + 記憶化(最後戳誰)',
      idea: '`f(l, r)`:開區間 (l, r) 內全部戳完的最高分。枚舉最後戳的 k:`v[l]·v[k]·v[r] + f(l, k) + f(k, r)`。',
      steps: ['`v = [1] + nums + [1]`', '`f(l, r)`:`r − l < 2` → 0', '`max(v[l]·v[k]·v[r] + f(l, k) + f(k, r) for k in (l, r))`', '回傳 `f(0, n + 1)`'],
      figure: { title: `nums = [${A}]`, steps: memoFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: 'n² 個區間,每個枚舉 n 個 k。' },
      verdict: '想通「最後戳誰」之後程式很短。',
      code: {
        python: `from functools import lru_cache

def maxCoins(nums):
    v = [1] + nums + [1]

    @lru_cache(maxsize=None)
    def f(l, r):                              # 開區間 (l, r) 全部戳完的最高分
        if r - l < 2:
            return 0
        return max(v[l] * v[k] * v[r] + f(l, k) + f(k, r) for k in range(l + 1, r))   # k 最後戳

    return f(0, len(v) - 1)`,
        c: `static int V_[302], memo[302][302], N_;

static int f(int l, int r) {
    if (r - l < 2) return 0;
    if (memo[l][r] >= 0) return memo[l][r];
    int best = 0;
    for (int k = l + 1; k < r; k++) {
        int s = V_[l] * V_[k] * V_[r] + f(l, k) + f(k, r);
        if (s > best) best = s;
    }
    return memo[l][r] = best;
}

int maxCoins(int *nums, int numsSize) {
    N_ = numsSize + 2;
    V_[0] = V_[N_ - 1] = 1;
    for (int i = 0; i < numsSize; i++) V_[i + 1] = nums[i];
    for (int i = 0; i < N_; i++) for (int j = 0; j < N_; j++) memo[i][j] = -1;
    return f(0, N_ - 1);
}`,
        cpp: `int maxCoins(vector<int>& nums) {
    vector<int> v{1};
    v.insert(v.end(), nums.begin(), nums.end());
    v.push_back(1);
    int n = v.size();
    vector<vector<int>> memo(n, vector<int>(n, -1));
    function<int(int, int)> f = [&](int l, int r) -> int {
        if (r - l < 2) return 0;
        if (memo[l][r] >= 0) return memo[l][r];
        int best = 0;
        for (int k = l + 1; k < r; k++) best = max(best, v[l] * v[k] * v[r] + f(l, k) + f(k, r));
        return memo[l][r] = best;
    };
    return f(0, n - 1);
}`,
        java: `private int[] v;
private int[][] memo;

int maxCoins(int[] nums) {
    int n = nums.length + 2;
    v = new int[n];
    v[0] = v[n - 1] = 1;
    for (int i = 0; i < nums.length; i++) v[i + 1] = nums[i];
    memo = new int[n][n];
    for (int[] row : memo) Arrays.fill(row, -1);
    return f(0, n - 1);
}

private int f(int l, int r) {
    if (r - l < 2) return 0;
    if (memo[l][r] >= 0) return memo[l][r];
    int best = 0;
    for (int k = l + 1; k < r; k++) best = Math.max(best, v[l] * v[k] * v[r] + f(l, k) + f(k, r));
    return memo[l][r] = best;
}`,
        javascript: `function maxCoins(nums) {
  const v = [1, ...nums, 1], n = v.length;
  const memo = Array.from({ length: n }, () => new Array(n).fill(-1));
  const f = (l, r) => {
    if (r - l < 2) return 0;
    if (memo[l][r] >= 0) return memo[l][r];
    let best = 0;
    for (let k = l + 1; k < r; k++) best = Math.max(best, v[l] * v[k] * v[r] + f(l, k) + f(k, r));
    return (memo[l][r] = best);
  };
  return f(0, n - 1);
}`,
      },
    },
    {
      name: '區間 DP(由短到長)',
      idea: '`dp[l][r]` 同上。外層枚舉區間長度 `len = 2..n+1`,內層枚舉 l(r = l + len),再枚舉 k。',
      steps: ['`v = [1] + nums + [1]`,`dp` 全 0', '`for len in 2..n+1`:`for l`:`r = l + len`', '`dp[l][r] = max(v[l]·v[k]·v[r] + dp[l][k] + dp[k][r])`', '回傳 `dp[0][n+1]`'],
      figure: { title: `nums = [${A}]`, steps: dpFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '三層迴圈;區間長度由短到長,保證子區間先算好。' },
      verdict: '標準解,[[p:interval-dp]]的經典題。「最後一步做什麼」是區間 DP 最常用的切法。',
      code: {
        python: `def maxCoins(nums):
    v = [1] + nums + [1]
    n = len(v)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):                # 區間由短到長
        for l in range(n - length):
            r = l + length
            dp[l][r] = max(v[l] * v[k] * v[r] + dp[l][k] + dp[k][r] for k in range(l + 1, r))
    return dp[0][n - 1]`,
        c: `int maxCoins(int *nums, int numsSize) {
    int n = numsSize + 2;
    int *v = malloc(n * sizeof(int));
    v[0] = v[n - 1] = 1;
    for (int i = 0; i < numsSize; i++) v[i + 1] = nums[i];
    int (*dp)[302] = calloc(n, sizeof(*dp));
    for (int len = 2; len < n; len++)
        for (int l = 0; l + len < n; l++) {
            int r = l + len;
            for (int k = l + 1; k < r; k++) {
                int s = v[l] * v[k] * v[r] + dp[l][k] + dp[k][r];
                if (s > dp[l][r]) dp[l][r] = s;
            }
        }
    int res = dp[0][n - 1];
    free(v); free(dp);
    return res;
}`,
        cpp: `int maxCoins(vector<int>& nums) {
    vector<int> v{1};
    v.insert(v.end(), nums.begin(), nums.end());
    v.push_back(1);
    int n = v.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 2; len < n; len++)
        for (int l = 0; l + len < n; l++) {
            int r = l + len;
            for (int k = l + 1; k < r; k++) dp[l][r] = max(dp[l][r], v[l] * v[k] * v[r] + dp[l][k] + dp[k][r]);
        }
    return dp[0][n - 1];
}`,
        java: `int maxCoins(int[] nums) {
    int n = nums.length + 2;
    int[] v = new int[n];
    v[0] = v[n - 1] = 1;
    for (int i = 0; i < nums.length; i++) v[i + 1] = nums[i];
    int[][] dp = new int[n][n];
    for (int len = 2; len < n; len++)
        for (int l = 0; l + len < n; l++) {
            int r = l + len;
            for (int k = l + 1; k < r; k++) dp[l][r] = Math.max(dp[l][r], v[l] * v[k] * v[r] + dp[l][k] + dp[k][r]);
        }
    return dp[0][n - 1];
}`,
        javascript: `function maxCoins(nums) {
  const v = [1, ...nums, 1], n = v.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len < n; len++)
    for (let l = 0; l + len < n; l++) {
      const r = l + len;
      for (let k = l + 1; k < r; k++) dp[l][r] = Math.max(dp[l][r], v[l] * v[k] * v[r] + dp[l][k] + dp[k][r]);
    }
  return dp[0][n - 1];
}`,
      },
    },
  ],
  pitfalls: [
    '枚舉「第一個戳誰」:左右兩邊會因為鄰居改變而互相影響,子問題不獨立',
    '用閉區間 [l, r] 定義:邊界的鄰居不好處理;開區間 (l, r) 搭配兩端補 1 最乾淨',
    '依 l、r 的順序填表(而不是依長度):dp[l][k]、dp[k][r] 可能還沒算',
  ],
  followUp: [{ q: '同類型的區間 DP?', a: '1039 多邊形三角剖分的最低分(同樣枚舉「和邊 (l, r) 組成三角形的頂點 k」)、1547 切棍子的最小成本。' }],
  check: {
    kind: 'fn',
    fn: 'maxCoins',
    cases: [
      { args: [A], out: 167 },
      { args: [[1, 5]], out: 10 },
      { args: [[7]], out: 7 },
      { args: [[2, 3]], out: 9 },
      { args: [[9, 76, 64, 21]], out: 116718 },
    ],
  },
}
