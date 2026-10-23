import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1220. Count Vowels Permutation

const RULE = [[0, 1], [1, 0], [1, 2], [2, 0], [2, 1], [2, 3], [2, 4], [3, 2], [3, 4], [4, 0]]
const POS = { 0: { x: 0, y: 0 }, 1: { x: 2, y: 0 }, 2: { x: 3, y: 1.5 }, 3: { x: 1, y: 2.5 }, 4: { x: -1, y: 1.5 } }
const NAMES = { 0: 'a', 1: 'e', 2: 'i', 3: 'o', 4: 'u' }

function dpFig(): FigStep[] {
  let cnt = [1, 1, 1, 1, 1]
  const rows = [cnt]
  for (let s = 2; s <= 3; s++) {
    const [a, e, i, o, u] = cnt
    cnt = [e + i + u, a + i, e + o, i, i + o]
    rows.push(cnt)
  }
  return [
    { note: '規則:a 後面只能接 e;e 後面接 a 或 i;i 後面不能接 i;o 後面接 i 或 u;u 後面只能接 a。畫成「下一個字母」的有向圖', views: [graphView(5, RULE, { directed: true, pos: POS, subs: NAMES })] },
    { note: '`cnt[c]` = 長度 L、以 c 結尾的字串數。反過來看「誰能接到 c 前面」:a ← e、i、u;e ← a、i;i ← e、o;o ← i;u ← i、o', views: [arr(['a = e + i + u', 'e = a + i', 'i = e + o', 'o = i', 'u = i + o'], { label: '轉移' })] },
    { note: `長度 1、2、3 的各字母計數,總和分別是 5、10、19`, views: rows.map((r, k) => arr(r, { label: `長度 ${k + 1}:a e i o u` })) },
  ]
}

function matFig(): FigStep[] {
  return [
    { note: '轉移是線性的 → 寫成 5 × 5 矩陣 M,`cnt_L = M^(L−1) × [1,1,1,1,1]`', views: [arr(['M[a] = [0,1,1,0,1]', 'M[e] = [1,0,1,0,0]', 'M[i] = [0,1,0,1,0]', 'M[o] = [0,0,1,0,0]', 'M[u] = [0,0,1,1,0]'], { label: '轉移矩陣(列 = 結尾字母)' })] },
    { note: '用快速冪算 M^(n−1),只要 O(5³ log n) → n 到 10¹⁸ 也算得出來', views: [arr([68], { label: 'n = 5 的答案', done: [0] })] },
  ]
}

export const q1220: Solution = {
  id: 1220,
  plain: '用 a、e、i、o、u 五個母音組成長度 n 的字串,但每個字母後面能接什麼有規定。總共能組出幾種?答案取餘 10⁹ + 7。',
  statement: '計算長度 n、只由小寫母音組成且符合規則的字串數:`a` 後只能接 `e`;`e` 後接 `a` 或 `i`;`i` 後不能接 `i`;`o` 後接 `i` 或 `u`;`u` 後只能接 `a`。答案對 10⁹ + 7 取餘。',
  examples: [
    { input: 'n = 1', output: '5' },
    { input: 'n = 2', output: '10' },
    { input: 'n = 5', output: '68' },
  ],
  constraints: ['1 ≤ n ≤ 2·10⁴'],
  insight: ['只需要知道「最後一個字母」→ 5 個狀態的 [[p:dp-1d]]', '把規則反過來:誰能接到 c 的前面', '線性轉移 → 也能用矩陣快速冪'],
  approaches: [
    {
      name: '五狀態 DP',
      idea: '`a, e, i, o, u = e+i+u, a+i, e+o, i, i+o`(用舊值同時更新),重複 n − 1 次。',
      steps: ['`a = e = i = o = u = 1`', '重複 n − 1 次:依轉移式同時更新(取餘)', '回傳 `(a + e + i + o + u) % MOD`'],
      figure: { title: '母音接續規則', steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每步 5 個加法。' },
      verdict: '最推薦;狀態機 DP 的簡單例子。',
      code: {
        python: `def countVowelPermutation(n):
    MOD = 10 ** 9 + 7
    a = e = i = o = u = 1                     # 長度 1:各一種
    for _ in range(n - 1):
        a, e, i, o, u = (e + i + u) % MOD, (a + i) % MOD, (e + o) % MOD, i, (i + o) % MOD
    return (a + e + i + o + u) % MOD`,
        c: `int countVowelPermutation(int n) {
    const long long MOD = 1000000007;
    long long a = 1, e = 1, i = 1, o = 1, u = 1;
    for (int k = 1; k < n; k++) {
        long long na = (e + i + u) % MOD, ne = (a + i) % MOD, ni = (e + o) % MOD, no = i, nu = (i + o) % MOD;
        a = na; e = ne; i = ni; o = no; u = nu;
    }
    return (int)((a + e + i + o + u) % MOD);
}`,
        cpp: `int countVowelPermutation(int n) {
    const long long MOD = 1e9 + 7;
    long long a = 1, e = 1, i = 1, o = 1, u = 1;
    for (int k = 1; k < n; k++) {
        long long na = (e + i + u) % MOD, ne = (a + i) % MOD, ni = (e + o) % MOD, no = i, nu = (i + o) % MOD;
        a = na; e = ne; i = ni; o = no; u = nu;
    }
    return (a + e + i + o + u) % MOD;
}`,
        java: `int countVowelPermutation(int n) {
    final long MOD = 1_000_000_007;
    long a = 1, e = 1, i = 1, o = 1, u = 1;
    for (int k = 1; k < n; k++) {
        long na = (e + i + u) % MOD, ne = (a + i) % MOD, ni = (e + o) % MOD, no = i, nu = (i + o) % MOD;
        a = na; e = ne; i = ni; o = no; u = nu;
    }
    return (int) ((a + e + i + o + u) % MOD);
}`,
        javascript: `function countVowelPermutation(n) {
  const MOD = 1e9 + 7;
  let a = 1, e = 1, i = 1, o = 1, u = 1;
  for (let k = 1; k < n; k++) [a, e, i, o, u] = [(e + i + u) % MOD, (a + i) % MOD, (e + o) % MOD, i, (i + o) % MOD];
  return (a + e + i + o + u) % MOD;
}`,
      },
    },
    {
      name: '矩陣快速冪',
      idea: '`v_L = M × v_{L−1}`;`v_n = M^(n−1) × 1`。用平方乘法 O(log n) 次矩陣乘法。',
      steps: ['定義 5 × 5 的 M(列 c:哪些字母能接到 c 前面)', '`P = M^(n−1)`(快速冪)', '答案 = P 所有元素的總和'],
      figure: { title: '母音接續規則', steps: matFig() },
      complexity: { time: 'O(5³ · log n)', space: 'O(25)', why: 'log n 次 5 × 5 矩陣乘法。' },
      verdict: '線性遞推都能這樣加速;n 很大時(例如 10¹⁸)唯一可行的作法。',
      code: {
        python: `def countVowelPermutation(n):
    MOD = 10 ** 9 + 7
    M = [[0, 1, 1, 0, 1],                     # a ← e, i, u
         [1, 0, 1, 0, 0],                     # e ← a, i
         [0, 1, 0, 1, 0],                     # i ← e, o
         [0, 0, 1, 0, 0],                     # o ← i
         [0, 0, 1, 1, 0]]                     # u ← i, o

    def mul(A, B):
        return [[sum(A[r][k] * B[k][c] for k in range(5)) % MOD for c in range(5)] for r in range(5)]

    P = [[int(r == c) for c in range(5)] for r in range(5)]
    e = n - 1
    while e:
        if e & 1:
            P = mul(P, M)
        M = mul(M, M)
        e >>= 1
    return sum(map(sum, P)) % MOD`,
        c: `static const long long MOD = 1000000007;

static void mul(long long A[5][5], long long B[5][5], long long C[5][5]) {
    long long T[5][5];
    for (int r = 0; r < 5; r++)
        for (int c = 0; c < 5; c++) {
            long long s = 0;
            for (int k = 0; k < 5; k++) s = (s + A[r][k] * B[k][c]) % MOD;
            T[r][c] = s;
        }
    memcpy(C, T, sizeof T);
}

int countVowelPermutation(int n) {
    long long M[5][5] = {{0, 1, 1, 0, 1}, {1, 0, 1, 0, 0}, {0, 1, 0, 1, 0}, {0, 0, 1, 0, 0}, {0, 0, 1, 1, 0}};
    long long P[5][5] = {{0}};
    for (int i = 0; i < 5; i++) P[i][i] = 1;
    for (int e = n - 1; e; e >>= 1) {
        if (e & 1) mul(P, M, P);
        mul(M, M, M);
    }
    long long s = 0;
    for (int r = 0; r < 5; r++) for (int c = 0; c < 5; c++) s = (s + P[r][c]) % MOD;
    return (int)s;
}`,
        cpp: `int countVowelPermutation(int n) {
    const long long MOD = 1e9 + 7;
    using Mat = array<array<long long, 5>, 5>;
    Mat M = {{{0, 1, 1, 0, 1}, {1, 0, 1, 0, 0}, {0, 1, 0, 1, 0}, {0, 0, 1, 0, 0}, {0, 0, 1, 1, 0}}};
    auto mul = [&](const Mat &A, const Mat &B) {
        Mat C{};
        for (int r = 0; r < 5; r++)
            for (int c = 0; c < 5; c++)
                for (int k = 0; k < 5; k++) C[r][c] = (C[r][c] + A[r][k] * B[k][c]) % MOD;
        return C;
    };
    Mat P{};
    for (int i = 0; i < 5; i++) P[i][i] = 1;
    for (int e = n - 1; e; e >>= 1) {
        if (e & 1) P = mul(P, M);
        M = mul(M, M);
    }
    long long s = 0;
    for (auto &row : P) for (long long v : row) s = (s + v) % MOD;
    return s;
}`,
        java: `final long MOD = 1_000_000_007;

long[][] mul(long[][] A, long[][] B) {
    long[][] C = new long[5][5];
    for (int r = 0; r < 5; r++)
        for (int c = 0; c < 5; c++)
            for (int k = 0; k < 5; k++) C[r][c] = (C[r][c] + A[r][k] * B[k][c]) % MOD;
    return C;
}

int countVowelPermutation(int n) {
    long[][] M = {{0, 1, 1, 0, 1}, {1, 0, 1, 0, 0}, {0, 1, 0, 1, 0}, {0, 0, 1, 0, 0}, {0, 0, 1, 1, 0}};
    long[][] P = new long[5][5];
    for (int i = 0; i < 5; i++) P[i][i] = 1;
    for (int e = n - 1; e > 0; e >>= 1) {
        if ((e & 1) == 1) P = mul(P, M);
        M = mul(M, M);
    }
    long s = 0;
    for (long[] row : P) for (long v : row) s = (s + v) % MOD;
    return (int) s;
}`,
        javascript: `function countVowelPermutation(n) {
  const MOD = 1000000007n;
  let M = [[0, 1, 1, 0, 1], [1, 0, 1, 0, 0], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 1, 0]].map((r) => r.map(BigInt));
  const mul = (A, B) => A.map((_, r) => B[0].map((_, c) => A[r].reduce((s, v, k) => s + v * B[k][c], 0n) % MOD));
  let P = M.map((_, r) => M.map((_, c) => (r === c ? 1n : 0n)));
  for (let e = n - 1; e > 0; e >>= 1) {
    if (e & 1) P = mul(P, M);
    M = mul(M, M);
  }
  return Number(P.flat().reduce((a, b) => a + b, 0n) % MOD);
}`,
      },
    },
  ],
  pitfalls: ['用新值更新後面的狀態:五個要同時用舊值更新', '轉移方向搞反:規則是「x 後面能接 y」,要算「以 y 結尾」時是 x 轉到 y', '每步沒取餘:很快溢位'],
  check: {
    kind: 'fn',
    fn: 'countVowelPermutation',
    cases: [
      { args: [1], out: 5 },
      { args: [2], out: 10 },
      { args: [5], out: 68 },
      { args: [144], out: 18208803 },
      { args: [20000], out: 759959057 },
    ],
  },
}
