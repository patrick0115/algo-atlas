import type { Cell, Frame, Pattern } from '../types'
import { arr, parseInt_, parseInts, parseStr, randInt, randInts, randStr, range } from '../engine/helpers'
import { forestView, type GNode } from '../engine/tree'

function parseNumGrid(s: string, name: string): number[][] {
  const rows = s
    .split(/[\/\n]+/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r.split(/[\s,]+/).filter(Boolean).map(Number))
  if (!rows.length || rows.some((r) => r.some((x) => !Number.isInteger(x) || x < 0 || x > 99))) throw new Error(`${name} 格式例如 1,3,1/1,5,1/4,2,1(0~99 的整數)`)
  if (rows.some((r) => r.length !== rows[0].length)) throw new Error(`${name} 每列長度要一樣`)
  if (rows.length > 7 || rows[0].length > 8) throw new Error('示範用,最多 7 列 × 8 行')
  return rows
}

// ===== DP 入門:記憶化(費波那契) =====

function* memoRun(v: Record<string, string>): Generator<Frame> {
  const n = parseInt_(v.n, 'n', 1, 7)
  const memo = new Map<number, number>()
  let id = 0
  let calls = 0
  const root: GNode = { id: id++, label: `f(${n})`, children: [] }
  const cls = new Map<number, string>()
  const sub = new Map<number, string>()
  const f = (line: string, note: string, answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { 呼叫次數: calls, answer } : { 呼叫次數: calls },
    views: [
      forestView(root, { cls, sub, label: '遞迴呼叫樹 · 黑色:正在算 · 淡色:算完了 · 虛線:直接查備忘錄,不用再往下算' }),
      arr([...memo.entries()].sort((a, b) => a[0] - b[0]).map(([k, x]) => `f(${k})=${x}`), { label: '備忘錄 memo(算過的答案)' }),
    ],
  })
  function* fib(k: number, node: GNode): Generator<Frame, number> {
    calls++
    cls.set(node.id, 'hl')
    if (k <= 1) {
      sub.set(node.id, `= ${k}`)
      cls.set(node.id, 'done')
      yield f('base', `f(${k}) 是最小的情況,直接回傳 ${k}`)
      return k
    }
    if (memo.has(k)) {
      sub.set(node.id, `查表 ${memo.get(k)}`)
      cls.set(node.id, 'queued')
      yield f('hit', `f(${k}) 之前算過了!直接從備忘錄拿 ${memo.get(k)},整棵子樹都省掉`)
      return memo.get(k)!
    }
    yield f('call', `要算 f(${k}),需要 f(${k - 1}) 和 f(${k - 2})`)
    cls.set(node.id, 'cmp')
    const a: GNode = { id: id++, label: `f(${k - 1})`, children: [] }
    node.children.push(a)
    const x = yield* fib(k - 1, a)
    const b: GNode = { id: id++, label: `f(${k - 2})`, children: [] }
    node.children.push(b)
    const y = yield* fib(k - 2, b)
    memo.set(k, x + y)
    cls.set(node.id, 'done')
    sub.set(node.id, `= ${x + y}`)
    yield f('save', `f(${k}) = ${x} + ${y} = ${x + y},記進備忘錄`)
    return x + y
  }
  const ans = yield* fib(n, root)
  yield f('done', `答案 f(${n}) = ${ans}。只呼叫了 ${calls} 次;沒有備忘錄的話要呼叫 ${2 * fibPlain(n + 1) - 1} 次`, ans)
}
const fibPlain = (k: number): number => (k <= 1 ? k : fibPlain(k - 1) + fibPlain(k - 2))

export const dpGeneral: Pattern = {
  id: 'dp-general',
  summary: '動態規劃(DP)= 把大問題拆成小問題,而且「同一個小問題只算一次」。最直覺的寫法是記憶化遞迴:先照定義寫遞迴,再加一個備忘錄,算過的直接查表。',
  analogy: '老師問「1+1+1+1+1 等於多少?」你數了一下說 5。老師再加一個「+1」,你不用重數,直接說 6 —— 因為你記得前面的答案。',
  steps: [
    '定義狀態:f(i) 代表什麼?(例如「爬到第 i 階有幾種方法」)',
    '找轉移:f(i) 怎麼由更小的狀態組成?(f(i) = f(i−1) + f(i−2))',
    '找起點:最小的狀態答案是什麼?(f(0)、f(1))',
    '加備忘錄避免重算(由上往下),或改成由小到大填表(由下往上)',
  ],
  watch: ['虛線框的節點是「查表」—— 沒有備忘錄的話,它底下還要長出一整棵子樹', '最後比較呼叫次數:有沒有備忘錄差非常多'],
  whenToUse: ['題目問「有幾種方法」「最少 / 最多是多少」「能不能做到」', '暴力遞迴時發現同樣的參數被重複計算', '選擇會影響後面的狀態,貪心不一定對'],
  pitfalls: ['狀態定義是最難的一步:先用文字寫清楚 dp[i] 的意思', '填表順序要保證「用到的格子已經算好」', '初始值(base case)錯了,整張表都會錯'],
  complexity: { time: 'O(狀態數 × 每個狀態的轉移成本)', space: 'O(狀態數)', why: '每個狀態只算一次。費波那契有 n 個狀態、每個 O(1),所以 O(n)。' },
  demo: {
    title: '費波那契數列:記憶化遞迴怎麼省下重複計算',
    inputs: [{ key: 'n', label: 'n(1~7)', default: '5' }],
    run: memoRun,
    reference: (v) => fibPlain(Number(v.n)),
    random: () => ({ n: String(randInt(1, 7)) }),
    code: {
      python: `memo = {}
def fib(n):
    if n <= 1: return n                         #@base
    if n in memo: return memo[n]                #@hit
    memo[n] = fib(n - 1) + fib(n - 2)           #@call
    return memo[n]                              #@save
# 答案 = fib(n)                                 #@done`,
      c: `long long memo[100];   // 初始為 0 代表沒算過
long long fib(int n) {
    if (n <= 1) return n;                       //@base
    if (memo[n]) return memo[n];                //@hit
    memo[n] = fib(n - 1) + fib(n - 2);          //@call
    return memo[n];                             //@save
}
// 答案 = fib(n)                                //@done`,
      cpp: `unordered_map<int, long long> memo;
long long fib(int n) {
    if (n <= 1) return n;                       //@base
    if (memo.count(n)) return memo[n];          //@hit
    memo[n] = fib(n - 1) + fib(n - 2);          //@call
    return memo[n];                             //@save
}
// 答案 = fib(n)                                //@done`,
      java: `Map<Integer, Long> memo = new HashMap<>();
long fib(int n) {
    if (n <= 1) return n;                       //@base
    if (memo.containsKey(n)) return memo.get(n);    //@hit
    long r = fib(n - 1) + fib(n - 2);           //@call
    memo.put(n, r);                             //@save
    return r;                                   //@save
}
// 答案 = fib(n)                                //@done`,
      javascript: `const memo = new Map();
function fib(n) {
  if (n <= 1) return n;                         //@base
  if (memo.has(n)) return memo.get(n);          //@hit
  memo.set(n, fib(n - 1) + fib(n - 2));         //@call
  return memo.get(n);                           //@save
}
// 答案 = fib(n)                                //@done`,
    },
  },
}

// ===== 一維 DP(198. House Robber) =====

function* robRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { min: 0, max: 99, maxLen: 10 })
  const dp: (number | string)[] = a.map(() => '')
  const f = (line: string, note: string, i: number, cmp: number[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [arr(a, { label: '每間房子的錢', highlight: i >= 0 ? [i] : [] }), arr(dp, { label: 'dp[i]:只考慮前 i+1 間房子,最多能偷多少', highlight: i >= 0 ? [i] : [], compare: cmp })],
  })
  dp[0] = a[0]
  yield f('init', `dp[0] = ${a[0]}:只有第一間,就偷它`, 0)
  if (a.length > 1) {
    dp[1] = Math.max(a[0], a[1])
    yield f('init', `dp[1] = max(${a[0]}, ${a[1]}) = ${dp[1]}:前兩間相鄰,只能選一間`, 1, [0])
  }
  for (let i = 2; i < a.length; i++) {
    const skip = dp[i - 1] as number
    const take = (dp[i - 2] as number) + a[i]
    yield f('choose', `第 ${i} 間有兩個選擇:不偷 → 沿用 dp[${i - 1}] = ${skip};偷 → 上上間的 dp[${i - 2}] + ${a[i]} = ${take}`, i, [i - 1, i - 2])
    dp[i] = Math.max(skip, take)
    yield f('fill', `dp[${i}] = max(${skip}, ${take}) = ${dp[i]}`, i)
  }
  const ans = dp[a.length - 1] as number
  yield f('done', `最後一格就是答案:${ans}`, a.length - 1, [], ans)
}

export const dp1d: Pattern = {
  id: 'dp-1d',
  summary: '一維 DP:dp[i] 只依賴前面幾格(通常是 dp[i−1]、dp[i−2])。由左往右填一排格子,最後一格(或整排的最大值)就是答案。',
  analogy: '沿著一條街偷房子,但不能偷相鄰兩間(會觸發警報)。走到每一間時只要想:「偷這間 + 上上間為止的最好結果」和「不偷,沿用上一間為止的最好結果」哪個大?',
  steps: ['定義 dp[i]:考慮前 i+1 間房子時,最多能偷多少', '轉移:dp[i] = max(dp[i−1], dp[i−2] + nums[i])', '起點:dp[0] = nums[0],dp[1] = max(nums[0], nums[1])', '答案:dp[n−1]'],
  watch: ['灰框的兩格是 dp[i] 參考的兩個來源', '注意每一格都只看左邊 —— 所以由左往右填一定來得及'],
  whenToUse: ['爬樓梯、打家劫舍、解碼方法、最大子陣列和', '第 i 步的最佳答案只取決於前面常數個狀態', '只依賴前兩格時,可以用兩個變數取代整個陣列(O(1) 空間)'],
  pitfalls: ['陣列長度 1 或 2 的邊界情況', '想清楚 dp[i] 是「以 i 結尾」還是「前 i 個」,兩種定義的轉移不同'],
  complexity: { time: 'O(n)', space: 'O(n),可優化成 O(1)', why: '每一格 O(1) 算完;只用到前兩格,所以可以只存兩個變數。' },
  demo: {
    title: '打家劫舍:不能偷相鄰的房子,最多偷多少(LeetCode 198)',
    inputs: [{ key: 'nums', label: '每間的錢', default: '2,7,9,3,1,5' }],
    run: robRun,
    reference: (v) => {
      const a = parseInts(v.nums, 'nums', { min: 0, max: 99, maxLen: 10 })
      let best = 0
      for (let m = 0; m < 1 << a.length; m++) {
        if (m & (m >> 1)) continue
        best = Math.max(best, a.reduce((s, x, i) => s + (m >> i & 1 ? x : 0), 0))
      }
      return best
    },
    random: () => ({ nums: randInts(randInt(1, 9), 0, 20).join(',') }),
    code: {
      python: `def rob(nums):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]                             #@init
    if n > 1: dp[1] = max(nums[0], nums[1])     #@init
    for i in range(2, n):
        skip, take = dp[i-1], dp[i-2] + nums[i] #@choose
        dp[i] = max(skip, take)                 #@fill
    return dp[-1]                               #@done`,
      c: `int rob(int* nums, int n) {
    int dp[100];
    dp[0] = nums[0];                            //@init
    if (n > 1) dp[1] = nums[0] > nums[1] ? nums[0] : nums[1];  //@init
    for (int i = 2; i < n; i++) {
        int skip = dp[i-1], take = dp[i-2] + nums[i];   //@choose
        dp[i] = skip > take ? skip : take;      //@fill
    }
    return dp[n - 1];                           //@done
}`,
      cpp: `int rob(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n);
    dp[0] = nums[0];                            //@init
    if (n > 1) dp[1] = max(nums[0], nums[1]);   //@init
    for (int i = 2; i < n; i++) {
        int skip = dp[i-1], take = dp[i-2] + nums[i];   //@choose
        dp[i] = max(skip, take);                //@fill
    }
    return dp[n - 1];                           //@done
}`,
      java: `int rob(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    dp[0] = nums[0];                            //@init
    if (n > 1) dp[1] = Math.max(nums[0], nums[1]);  //@init
    for (int i = 2; i < n; i++) {
        int skip = dp[i-1], take = dp[i-2] + nums[i];   //@choose
        dp[i] = Math.max(skip, take);           //@fill
    }
    return dp[n - 1];                           //@done
}`,
      javascript: `function rob(nums) {
  const n = nums.length, dp = new Array(n);
  dp[0] = nums[0];                              //@init
  if (n > 1) dp[1] = Math.max(nums[0], nums[1]);    //@init
  for (let i = 2; i < n; i++) {
    const skip = dp[i-1], take = dp[i-2] + nums[i]; //@choose
    dp[i] = Math.max(skip, take);               //@fill
  }
  return dp[n - 1];                             //@done
}`,
    },
  },
}

// ===== 網格 DP(64. Minimum Path Sum) =====

function* gridRun(v: Record<string, string>): Generator<Frame> {
  const g = parseNumGrid(v.grid, 'grid')
  const R = g.length
  const C = g[0].length
  const dp: (number | null)[][] = g.map((r) => r.map(() => null))
  const f = (line: string, note: string, cur: Cell[] = [], dep: Cell[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      { kind: 'grid', label: 'grid:每格的成本', cells: g, marks: { hl: cur } },
      { kind: 'grid', label: 'dp[i][j]:從左上走到 (i,j) 的最小成本(只能往右或往下)', cells: dp, marks: { hl: cur, dep, done: dp.flatMap((r, i) => r.map((_, j) => [i, j] as Cell).filter(([a, b]) => dp[a][b] !== null && !(a === cur[0]?.[0] && b === cur[0]?.[1]))) } },
    ],
  })
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (i === 0 && j === 0) {
        dp[0][0] = g[0][0]
        yield f('init', `起點 dp[0][0] = ${g[0][0]}`, [[0, 0]])
        continue
      }
      const from: Cell[] = []
      if (i > 0) from.push([i - 1, j])
      if (j > 0) from.push([i, j - 1])
      const best = Math.min(...from.map(([a, b]) => dp[a][b]!))
      const desc = from.map(([a, b]) => `${a === i ? '左' : '上'} ${dp[a][b]}`).join('、')
      yield f('look', `(${i},${j}) 只能從${from.length === 2 ? '上面或左邊' : i === 0 ? '左邊' : '上面'}走來:${desc}`, [[i, j]], from)
      dp[i][j] = g[i][j] + best
      yield f('fill', `dp[${i}][${j}] = ${g[i][j]} + ${best} = ${dp[i][j]}`, [[i, j]], from)
    }
  }
  const ans = dp[R - 1][C - 1]!
  yield f('done', `右下角 dp = ${ans} 就是答案`, [[R - 1, C - 1]], [], ans)
}

export const dpGrid: Pattern = {
  id: 'dp-grid',
  summary: '網格 DP:在一張表格上,每一格的答案由「上面」和「左邊」(有時加上左上)的格子決定。從左上往右下一列一列填,右下角就是答案。',
  analogy: '從家(左上)走到學校(右下),只能往右或往下。走到每個路口時,「到這裡最省力的走法」一定是從「上一個路口」或「左邊路口」最省力的走法再走一步。',
  steps: ['定義 dp[i][j]:走到 (i, j) 的最佳答案', '轉移:dp[i][j] = grid[i][j] + min(dp[i−1][j], dp[i][j−1])', '邊界:第一列只能從左邊來、第一行只能從上面來', '答案:dp[R−1][C−1]'],
  watch: ['虛線框是目前這格參考的來源', '填表順序由上而下、由左而右,保證來源已經算好'],
  whenToUse: ['網格路徑數、最小路徑和、有障礙物的路徑', '最大正方形(看上、左、左上三格)', '三角形最小路徑和(由下往上)'],
  pitfalls: ['第一列、第一行的邊界要單獨處理(或多開一圈哨兵)', '只依賴上一列時,可以壓成一維陣列'],
  complexity: { time: 'O(R × C)', space: 'O(R × C),可優化成 O(C)', why: '每格 O(1);每一列只需要上一列的資料。' },
  demo: {
    title: '最小路徑和:從左上走到右下(LeetCode 64)',
    inputs: [{ key: 'grid', label: 'grid(每列用 / 分隔)', default: '1,3,1,2/1,5,1,3/4,2,1,1' }],
    run: gridRun,
    reference: (v) => {
      const g = parseNumGrid(v.grid, 'grid')
      const best = (i: number, j: number): number => (i === 0 && j === 0 ? g[0][0] : g[i][j] + Math.min(i > 0 ? best(i - 1, j) : Infinity, j > 0 ? best(i, j - 1) : Infinity))
      return best(g.length - 1, g[0].length - 1)
    },
    random: () => {
      const R = randInt(1, 4)
      const C = randInt(1, 4)
      return { grid: Array.from({ length: R }, () => randInts(C, 0, 9).join(',')).join('/') }
    },
    code: {
      python: `def min_path_sum(grid):
    R, C = len(grid), len(grid[0])
    dp = [[0] * C for _ in range(R)]
    for i in range(R):
        for j in range(C):
            if i == 0 and j == 0:
                dp[0][0] = grid[0][0]; continue #@init
            best = min(dp[i-1][j] if i else float('inf'),   #@look
                       dp[i][j-1] if j else float('inf'))   #@look
            dp[i][j] = grid[i][j] + best        #@fill
    return dp[-1][-1]                           #@done`,
      c: `int minPathSum(int** grid, int R, int* colSize) {
    int C = colSize[0], dp[200][200];
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) {
            if (!i && !j) { dp[0][0] = grid[0][0]; continue; }  //@init
            int best = INT_MAX;                 //@look
            if (i) best = dp[i-1][j];           //@look
            if (j && dp[i][j-1] < best) best = dp[i][j-1];  //@look
            dp[i][j] = grid[i][j] + best;       //@fill
        }
    return dp[R-1][C-1];                        //@done
}`,
      cpp: `int minPathSum(vector<vector<int>>& g) {
    int R = g.size(), C = g[0].size();
    vector<vector<int>> dp(R, vector<int>(C));
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) {
            if (!i && !j) { dp[0][0] = g[0][0]; continue; }    //@init
            int best = min(i ? dp[i-1][j] : INT_MAX,    //@look
                           j ? dp[i][j-1] : INT_MAX);   //@look
            dp[i][j] = g[i][j] + best;          //@fill
        }
    return dp[R-1][C-1];                        //@done
}`,
      java: `int minPathSum(int[][] g) {
    int R = g.length, C = g[0].length;
    int[][] dp = new int[R][C];
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) {
            if (i == 0 && j == 0) { dp[0][0] = g[0][0]; continue; }    //@init
            int best = Math.min(i > 0 ? dp[i-1][j] : Integer.MAX_VALUE,    //@look
                                j > 0 ? dp[i][j-1] : Integer.MAX_VALUE);   //@look
            dp[i][j] = g[i][j] + best;          //@fill
        }
    return dp[R-1][C-1];                        //@done
}`,
      javascript: `function minPathSum(g) {
  const R = g.length, C = g[0].length;
  const dp = Array.from({ length: R }, () => new Array(C));
  for (let i = 0; i < R; i++)
    for (let j = 0; j < C; j++) {
      if (!i && !j) { dp[0][0] = g[0][0]; continue; }  //@init
      const best = Math.min(i ? dp[i-1][j] : Infinity,  //@look
                            j ? dp[i][j-1] : Infinity); //@look
      dp[i][j] = g[i][j] + best;                //@fill
    }
  return dp[R-1][C-1];                          //@done
}`,
    },
  },
}

// ===== 0/1 背包 =====

function* knapRun(v: Record<string, string>): Generator<Frame> {
  const w = parseInts(v.weights, '重量', { min: 1, max: 9, maxLen: 5 })
  const val = parseInts(v.values, '價值', { min: 0, max: 99, maxLen: 5 })
  if (w.length !== val.length) throw new Error('重量和價值的個數要一樣')
  const W = parseInt_(v.cap, '背包容量', 1, 10)
  const n = w.length
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: W + 1 }, () => (i === 0 ? 0 : null)))
  const f = (line: string, note: string, cur: Cell[] = [], dep: Cell[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      {
        kind: 'grid',
        label: 'dp[i][c]:只用前 i 個物品、容量 c 時的最大價值',
        cells: dp,
        rowLabels: ['無物品', ...w.map((x, i) => `#${i + 1} 重${x} 值${val[i]}`)],
        colLabels: range(0, W).map((c) => `c=${c}`),
        marks: { hl: cur, dep },
      },
    ],
  })
  yield f('init', '第 0 列:沒有任何物品可選,價值都是 0')
  for (let i = 1; i <= n; i++) {
    for (let c = 0; c <= W; c++) {
      const skip = dp[i - 1][c]!
      if (w[i - 1] > c) {
        dp[i][c] = skip
        yield f('skip', `物品 #${i}(重 ${w[i - 1]})放不進容量 ${c} → 只能不拿,沿用上面 ${skip}`, [[i, c]], [[i - 1, c]])
        continue
      }
      const take = dp[i - 1][c - w[i - 1]]! + val[i - 1]
      dp[i][c] = Math.max(skip, take)
      yield f('choose', `物品 #${i}、容量 ${c}:不拿 = ${skip};拿 = 剩餘容量 ${c - w[i - 1]} 時的 ${dp[i - 1][c - w[i - 1]]} + 價值 ${val[i - 1]} = ${take} → 取 ${dp[i][c]}`, [[i, c]], [[i - 1, c], [i - 1, c - w[i - 1]]])
    }
  }
  const ans = dp[n][W]!
  yield f('done', `右下角 = ${ans},就是最大價值`, [[n, W]], [], ans)
}

export const knapsack: Pattern = {
  id: 'knapsack',
  summary: '背包問題:有一些物品(各有重量和價值),背包容量有限,怎麼選價值最大?0/1 背包每個物品只能拿一次;完全背包每個物品可以拿無限次。很多題目換個說法就是背包。',
  analogy: '出國旅行行李限重 20 公斤,每樣東西都有重量和「想帶的程度」。對每樣東西只有兩個選擇:帶或不帶。',
  steps: ['dp[i][c]:只考慮前 i 個物品、容量為 c 時的最大價值', '不拿第 i 個:dp[i−1][c]', '拿第 i 個(放得下時):dp[i−1][c − 重量] + 價值', '取兩者較大;答案是 dp[n][W]'],
  watch: ['每一格只看「正上方」和「上一列往左跳 重量 格」兩個地方', '列 = 物品,行 = 容量'],
  whenToUse: [
    '0/1 背包:分割等和子集、目標和、一和零(二維容量)',
    '完全背包:零錢兌換(最少硬幣)、零錢兌換 II(組合數)',
    '關鍵訊號:「從一堆東西中選一些,總和受限 / 要剛好等於某值」',
  ],
  pitfalls: [
    '壓成一維時:0/1 背包容量要「倒著」迴圈,完全背包要「正著」迴圈',
    '求組合數時物品在外層、容量在內層;求排列數則相反',
    '「剛好裝滿」和「不超過」的初始值不同(前者用 −∞ 表示不可能)',
  ],
  complexity: { time: 'O(n × W)', space: 'O(n × W),可壓成 O(W)', why: '表格有 (n+1) × (W+1) 格,每格 O(1)。' },
  demo: {
    title: '0/1 背包:容量有限,拿哪些物品價值最大',
    inputs: [
      { key: 'weights', label: '重量', default: '1,3,4,5' },
      { key: 'values', label: '價值', default: '1,4,5,7' },
      { key: 'cap', label: '背包容量', default: '7' },
    ],
    run: knapRun,
    reference: (v) => {
      const w = parseInts(v.weights, 'w', { min: 1, max: 9, maxLen: 5 })
      const val = parseInts(v.values, 'v', { min: 0, max: 99, maxLen: 5 })
      let best = 0
      for (let m = 0; m < 1 << w.length; m++) {
        let tw = 0
        let tv = 0
        for (let i = 0; i < w.length; i++) if (m >> i & 1) (tw += w[i]), (tv += val[i])
        if (tw <= Number(v.cap)) best = Math.max(best, tv)
      }
      return best
    },
    random: () => {
      const n = randInt(1, 5)
      return { weights: randInts(n, 1, 6).join(','), values: randInts(n, 0, 20).join(','), cap: String(randInt(1, 10)) }
    },
    code: {
      python: `def knapsack(w, val, W):
    n = len(w)
    dp = [[0] * (W + 1) for _ in range(n + 1)]  #@init
    for i in range(1, n + 1):
        for c in range(W + 1):
            dp[i][c] = dp[i-1][c]               #@skip
            if w[i-1] <= c:
                dp[i][c] = max(dp[i][c], dp[i-1][c - w[i-1]] + val[i-1])  #@choose
    return dp[n][W]                             #@done`,
      c: `int knapsack(int w[], int val[], int n, int W) {
    int dp[101][1001] = {0};                    //@init
    for (int i = 1; i <= n; i++)
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i-1][c];              //@skip
            if (w[i-1] <= c && dp[i-1][c - w[i-1]] + val[i-1] > dp[i][c])
                dp[i][c] = dp[i-1][c - w[i-1]] + val[i-1];  //@choose
        }
    return dp[n][W];                            //@done
}`,
      cpp: `int knapsack(vector<int>& w, vector<int>& val, int W) {
    int n = w.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));   //@init
    for (int i = 1; i <= n; i++)
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i-1][c];              //@skip
            if (w[i-1] <= c)
                dp[i][c] = max(dp[i][c], dp[i-1][c - w[i-1]] + val[i-1]);  //@choose
        }
    return dp[n][W];                            //@done
}`,
      java: `int knapsack(int[] w, int[] val, int W) {
    int n = w.length;
    int[][] dp = new int[n + 1][W + 1];         //@init
    for (int i = 1; i <= n; i++)
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i-1][c];              //@skip
            if (w[i-1] <= c)
                dp[i][c] = Math.max(dp[i][c], dp[i-1][c - w[i-1]] + val[i-1]);  //@choose
        }
    return dp[n][W];                            //@done
}`,
      javascript: `function knapsack(w, val, W) {
  const n = w.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));  //@init
  for (let i = 1; i <= n; i++)
    for (let c = 0; c <= W; c++) {
      dp[i][c] = dp[i-1][c];                    //@skip
      if (w[i-1] <= c)
        dp[i][c] = Math.max(dp[i][c], dp[i-1][c - w[i-1]] + val[i-1]);   //@choose
    }
  return dp[n][W];                              //@done
}`,
    },
  },
}

// ===== LIS =====

function* lisRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.nums, 'nums', { maxLen: 10 })
  const dp: (number | string)[] = a.map(() => '')
  const f = (line: string, note: string, i: number, cmp: number[] = [], hl: number[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [arr(a, { label: 'nums', mode: 'bars', highlight: i >= 0 ? [i] : hl, compare: cmp }), arr(dp, { label: 'dp[i]:以 nums[i] 結尾的最長遞增子序列長度', highlight: i >= 0 ? [i] : hl, compare: cmp })],
  })
  for (let i = 0; i < a.length; i++) {
    dp[i] = 1
    yield f('init', `dp[${i}] 至少是 1(只有 ${a[i]} 自己)`, i)
    for (let j = 0; j < i; j++) {
      if (a[j] < a[i]) {
        const cand = (dp[j] as number) + 1
        const better = cand > (dp[i] as number)
        if (better) dp[i] = cand
        yield f('extend', `${a[j]} < ${a[i]}:可以把 ${a[i]} 接在以 ${a[j]} 結尾的序列後面,長度 ${cand}${better ? ' → 更新' : ''}`, i, [j])
      } else {
        yield f('skip', `${a[j]} >= ${a[i]}:不能接`, i, [j])
      }
    }
  }
  const ans = Math.max(...(dp as number[]))
  yield f('done', `dp 的最大值 ${ans} 就是答案(序列可以在任何位置結尾)`, -1, [], dp.map((x, i) => (x === ans ? i : -1)).filter((i) => i >= 0), ans)
}

export const lis: Pattern = {
  id: 'lis',
  summary: '最長遞增子序列(LIS):從陣列中挑出一些數(保持原本順序),讓它們嚴格遞增,最長可以多長?dp[i] = 以 nums[i] 結尾的 LIS 長度,看前面所有比它小的數,接在最長的那個後面。',
  analogy: '疊積木塔,每一塊都要比下面那塊大。對每一塊積木,問:「它可以疊在前面哪一座塔上面?選最高的那座。」',
  steps: ['dp[i] = 1(自己一個)', '對每個 j < i:如果 nums[j] < nums[i],dp[i] = max(dp[i], dp[j] + 1)', '答案是 dp 的最大值(不一定在最後一格)', '進階:維護 tails 陣列 + 二分搜尋,可以做到 O(n log n)'],
  watch: ['上面長條圖中灰框的是正在比較的 j', '注意答案取整個 dp 的最大值'],
  whenToUse: ['最長遞增 / 遞減子序列', '俄羅斯套娃信封(兩個維度:排序後對另一維做 LIS)', '最大整除子集、山形陣列(左右各做一次 LIS)'],
  pitfalls: ['子序列不需要連續,子陣列才需要', '「嚴格遞增」用 <,「非遞減」用 <=', 'O(n log n) 版本的 tails 陣列不是真正的 LIS,只有長度是對的'],
  complexity: { time: 'O(n²),二分版 O(n log n)', space: 'O(n)', why: '每個 i 都要看前面所有 j。' },
  demo: {
    title: '最長遞增子序列的長度(LeetCode 300)',
    inputs: [{ key: 'nums', label: 'nums', default: '10,9,2,5,3,7,101,18' }],
    run: lisRun,
    reference: (v) => {
      const tails: number[] = []
      for (const x of parseInts(v.nums, 'nums', { maxLen: 10 })) {
        let lo = 0
        let hi = tails.length
        while (lo < hi) {
          const m = (lo + hi) >> 1
          if (tails[m] < x) lo = m + 1
          else hi = m
        }
        tails[lo] = x
      }
      return tails.length
    },
    random: () => ({ nums: randInts(randInt(1, 9), 0, 20).join(',') }),
    code: {
      python: `def length_of_lis(nums):
    n = len(nums)
    dp = [1] * n                                #@init
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)   #@extend
            # else: 不能接                       #@skip
    return max(dp)                              #@done`,
      c: `int lengthOfLIS(int* nums, int n) {
    int dp[2500], best = 0;
    for (int i = 0; i < n; i++) {
        dp[i] = 1;                              //@init
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i] && dp[j] + 1 > dp[i])
                dp[i] = dp[j] + 1;              //@extend
            // else: 不能接                     //@skip
        }
        if (dp[i] > best) best = dp[i];
    }
    return best;                                //@done
}`,
      cpp: `int lengthOfLIS(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, 1);                       //@init
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i])
                dp[i] = max(dp[i], dp[j] + 1);  //@extend
            // else: 不能接                     //@skip
        }
    return *max_element(dp.begin(), dp.end());  //@done
}`,
      java: `int lengthOfLIS(int[] nums) {
    int n = nums.length, best = 0;
    int[] dp = new int[n];
    for (int i = 0; i < n; i++) {
        dp[i] = 1;                              //@init
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i])
                dp[i] = Math.max(dp[i], dp[j] + 1);     //@extend
            // else: 不能接                     //@skip
        }
        best = Math.max(best, dp[i]);
    }
    return best;                                //@done
}`,
      javascript: `function lengthOfLIS(nums) {
  const n = nums.length, dp = new Array(n).fill(1); //@init
  for (let i = 0; i < n; i++)
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i])
        dp[i] = Math.max(dp[i], dp[j] + 1);     //@extend
      // else: 不能接                           //@skip
    }
  return Math.max(...dp);                       //@done
}`,
    },
  },
}

// ===== LCS =====

function* lcsRun(v: Record<string, string>): Generator<Frame> {
  const a = parseStr(v.a, 'text1', { maxLen: 8 })
  const b = parseStr(v.b, 'text2', { maxLen: 8 })
  const m = a.length
  const n = b.length
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : null)))
  const f = (line: string, note: string, cur: Cell[] = [], dep: Cell[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      {
        kind: 'grid',
        label: `dp[i][j]:「${a}」的前 i 個字 和「${b}」的前 j 個字 的最長共同子序列長度`,
        cells: dp,
        rowLabels: ['∅', ...a.split('')],
        colLabels: ['∅', ...b.split('')],
        marks: { hl: cur, dep },
      },
    ],
  })
  yield f('init', '第 0 列、第 0 行:其中一個字串是空的,共同子序列長度是 0')
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]! + 1
        yield f('match', `${a[i - 1]} == ${b[j - 1]}:這個字可以一起用!= 左上 ${dp[i - 1][j - 1]} + 1 = ${dp[i][j]}`, [[i, j]], [[i - 1, j - 1]])
      } else {
        dp[i][j] = Math.max(dp[i - 1][j]!, dp[i][j - 1]!)
        yield f('skip', `${a[i - 1]} ≠ ${b[j - 1]}:丟掉其中一個字,取 上 ${dp[i - 1][j]} 和 左 ${dp[i][j - 1]} 較大的 = ${dp[i][j]}`, [[i, j]], [[i - 1, j], [i, j - 1]])
      }
    }
  }
  yield f('done', `右下角 ${dp[m][n]} 就是答案`, [[m, n]], [], dp[m][n]!)
}

export const lcs: Pattern = {
  id: 'lcs',
  summary: '兩個字串的 DP:dp[i][j] 表示「第一個字串的前 i 個字」和「第二個字串的前 j 個字」的答案。比較最後一個字:相同時一起用掉(看左上),不同時丟掉其中一個(看上或左)。',
  analogy: '比對兩份名單找出最長的「共同順序」:從頭一個一個比,遇到相同的就劃掉兩邊一起算一個;不同時,試試跳過左邊名單的這個、或跳過右邊名單的這個,哪個結果好就用哪個。',
  steps: ['多開一列一行代表空字串,值為 0', '字元相同:dp[i][j] = dp[i−1][j−1] + 1', '字元不同:dp[i][j] = max(dp[i−1][j], dp[i][j−1])', '答案:dp[m][n]'],
  watch: ['虛線框是這格參考的來源:相同時只看左上,不同時看上和左', '列標題、行標題就是兩個字串的字母'],
  whenToUse: ['最長共同子序列、刪除操作讓兩字串相同', '編輯距離(多一個「替換」的選項:左上 + 1)', '正則 / 萬用字元匹配、交錯字串、不同的子序列', '關鍵訊號:兩個字串(或陣列)、逐字比對'],
  pitfalls: ['dp 的索引比字串多 1:dp[i][j] 比較的是 a[i−1] 和 b[j−1]', '子序列可以不連續;要連續(最長共同子字串)時,不相同就歸零'],
  complexity: { time: 'O(m × n)', space: 'O(m × n),可壓成 O(n)', why: '表格有 (m+1)(n+1) 格,每格 O(1)。' },
  demo: {
    title: '最長共同子序列(LeetCode 1143)',
    inputs: [
      { key: 'a', label: 'text1', default: 'abcbdab' },
      { key: 'b', label: 'text2', default: 'bdcaba' },
    ],
    run: lcsRun,
    reference: (v) => {
      const a = v.a.trim()
      const b = v.b.trim()
      let best = 0
      for (let m = 0; m < 1 << a.length; m++) {
        const sub = a.split('').filter((_, i) => m >> i & 1)
        let j = 0
        for (const ch of b) if (j < sub.length && sub[j] === ch) j++
        if (j === sub.length) best = Math.max(best, sub.length)
      }
      return best
    },
    random: () => ({ a: randStr(randInt(1, 7)), b: randStr(randInt(1, 7)) }),
    code: {
      python: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]  #@init
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1     #@match
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])  #@skip
    return dp[m][n]                             #@done`,
      c: `int longestCommonSubsequence(char* a, char* b) {
    int m = strlen(a), n = strlen(b);
    static int dp[1001][1001];
    memset(dp, 0, sizeof dp);                   //@init
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a[i-1] == b[j-1])
                dp[i][j] = dp[i-1][j-1] + 1;    //@match
            else
                dp[i][j] = dp[i-1][j] > dp[i][j-1] ? dp[i-1][j] : dp[i][j-1];  //@skip
        }
    return dp[m][n];                            //@done
}`,
      cpp: `int longestCommonSubsequence(string a, string b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));   //@init
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a[i-1] == b[j-1])
                dp[i][j] = dp[i-1][j-1] + 1;    //@match
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);     //@skip
        }
    return dp[m][n];                            //@done
}`,
      java: `int longestCommonSubsequence(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];         //@init
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a.charAt(i-1) == b.charAt(j-1))
                dp[i][j] = dp[i-1][j-1] + 1;    //@match
            else
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);    //@skip
        }
    return dp[m][n];                            //@done
}`,
      javascript: `function longestCommonSubsequence(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));  //@init
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      if (a[i-1] === b[j-1])
        dp[i][j] = dp[i-1][j-1] + 1;            //@match
      else
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);    //@skip
    }
  return dp[m][n];                              //@done
}`,
    },
  },
}

// ===== 區間 DP(516. 最長回文子序列) =====

function* intervalRun(v: Record<string, string>): Generator<Frame> {
  const s = parseStr(v.s, 's', { maxLen: 8 })
  const n = s.length
  const dp: (number | null)[][] = Array.from({ length: n }, () => new Array(n).fill(null))
  const f = (line: string, note: string, cur: Cell[] = [], dep: Cell[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      {
        kind: 'grid',
        label: 'dp[i][j]:s[i..j] 這一段的最長回文子序列長度(只用右上半部)',
        cells: dp,
        rowLabels: s.split('').map((c, i) => `i=${i} ${c}`),
        colLabels: s.split('').map((c, j) => `j=${j} ${c}`),
        marks: { hl: cur, dep, wall: range(0, n - 1).flatMap((i) => range(0, i - 1).map((j) => [i, j] as Cell)) },
      },
    ],
  })
  for (let i = 0; i < n; i++) dp[i][i] = 1
  yield f('init', '長度 1 的區間(對角線):一個字母自己就是回文,長度 1', range(0, n - 1).map((i) => [i, i] as Cell))
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      if (s[i] === s[j]) {
        const inner = len === 2 ? 0 : dp[i + 1][j - 1]!
        dp[i][j] = inner + 2
        yield f('match', `區間 [${i}..${j}](長度 ${len}):兩端 ${s[i]} == ${s[j]},可以包在中間那段外面 → ${inner} + 2 = ${dp[i][j]}`, [[i, j]], len > 2 ? [[i + 1, j - 1]] : [])
      } else {
        dp[i][j] = Math.max(dp[i + 1][j]!, dp[i][j - 1]!)
        yield f('skip', `區間 [${i}..${j}](長度 ${len}):兩端 ${s[i]} ≠ ${s[j]},去掉左端或右端 → max(${dp[i + 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`, [[i, j]], [[i + 1, j], [i, j - 1]])
      }
    }
  }
  yield f('done', `右上角 dp[0][${n - 1}] = ${dp[0][n - 1]} 就是整個字串的答案`, [[0, n - 1]], [], dp[0][n - 1]!)
}

export const intervalDp: Pattern = {
  id: 'interval-dp',
  summary: '區間 DP:dp[i][j] 代表「區間 [i, j] 這一段」的答案,大區間由小區間組成。所以填表順序是「依區間長度由短到長」,在表格上看起來是一條一條對角線往右上角推進。',
  analogy: '剝洋蔥的反過程:先知道最裡面每一小片的答案,再一層一層往外包,最後得到整顆洋蔥的答案。',
  steps: ['長度 1 的區間(對角線)直接給答案', '長度從 2 到 n:對每個起點 i,j = i + len − 1', '用更短的區間算 dp[i][j](例如 dp[i+1][j−1]、dp[i+1][j]、dp[i][j−1],或枚舉切點 k)', '答案:dp[0][n−1]'],
  watch: ['填表是一條一條斜線往右上推進,不是一列一列', '斜線條紋的格子(i > j)不是合法區間,不使用'],
  whenToUse: ['回文相關:最長回文子序列 / 子字串、回文分割', '「最後一步」在區間中間:戳氣球、切棍子、多邊形三角剖分', '合併石頭、奇怪的印表機'],
  pitfalls: ['外層迴圈是「區間長度」,不是 i', '枚舉切點 k 時,左右兩段的邊界(含不含 k)要想清楚', '時間常常是 O(n³),n 通常不大'],
  complexity: { time: 'O(n²)(本題)/ O(n³)(枚舉切點)', space: 'O(n²)', why: '有 n² 個區間;需要枚舉切點時每個區間再花 O(n)。' },
  demo: {
    title: '最長回文子序列(LeetCode 516)',
    inputs: [{ key: 's', label: 's', default: 'bbbab' }],
    run: intervalRun,
    reference: (v) => {
      const s = v.s.trim()
      let best = 0
      for (let m = 1; m < 1 << s.length; m++) {
        const t = s.split('').filter((_, i) => m >> i & 1).join('')
        if (t === [...t].reverse().join('')) best = Math.max(best, t.length)
      }
      return best
    },
    random: () => ({ s: randStr(randInt(1, 8)) }),
    code: {
      python: `def longest_palindrome_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n): dp[i][i] = 1             #@init
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = dp[i+1][j-1] + 2     #@match
            else:
                dp[i][j] = max(dp[i+1][j], dp[i][j-1])  #@skip
    return dp[0][n-1]                           #@done`,
      c: `int longestPalindromeSubseq(char* s) {
    int n = strlen(s);
    static int dp[1000][1000];
    memset(dp, 0, sizeof dp);
    for (int i = 0; i < n; i++) dp[i][i] = 1;   //@init
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            if (s[i] == s[j])
                dp[i][j] = dp[i+1][j-1] + 2;    //@match
            else
                dp[i][j] = dp[i+1][j] > dp[i][j-1] ? dp[i+1][j] : dp[i][j-1];  //@skip
        }
    return dp[0][n-1];                          //@done
}`,
      cpp: `int longestPalindromeSubseq(string s) {
    int n = s.size();
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++) dp[i][i] = 1;   //@init
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            if (s[i] == s[j])
                dp[i][j] = dp[i+1][j-1] + 2;    //@match
            else
                dp[i][j] = max(dp[i+1][j], dp[i][j-1]);     //@skip
        }
    return dp[0][n-1];                          //@done
}`,
      java: `int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = 1;   //@init
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            if (s.charAt(i) == s.charAt(j))
                dp[i][j] = dp[i+1][j-1] + 2;    //@match
            else
                dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);    //@skip
        }
    return dp[0][n-1];                          //@done
}`,
      javascript: `function longestPalindromeSubseq(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) dp[i][i] = 1;     //@init
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      if (s[i] === s[j])
        dp[i][j] = (len === 2 ? 0 : dp[i+1][j-1]) + 2;  //@match
      else
        dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);    //@skip
    }
  return dp[0][n-1];                            //@done
}`,
    },
  },
}

// ===== 狀態機 DP(309. 含冷凍期的股票) =====

function* stockRun(v: Record<string, string>): Generator<Frame> {
  const p = parseInts(v.prices, 'prices', { min: 0, max: 99, maxLen: 9 })
  const n = p.length
  const rows: (number | null)[][] = [new Array(n).fill(null), new Array(n).fill(null), new Array(n).fill(null)]
  const [hold, sold, rest] = rows
  const f = (line: string, note: string, d: number, dep: Cell[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      arr(p, { label: '每天股價', mode: 'bars', highlight: d >= 0 ? [d] : [] }),
      {
        kind: 'grid',
        label: '三種狀態在每天結束時的最大利潤',
        cells: rows,
        rowLabels: ['持有股票', '今天剛賣', '空手可買'],
        colLabels: p.map((_, i) => `第${i}天`),
        marks: { hl: d >= 0 ? [[0, d], [1, d], [2, d]] : [], dep },
      },
    ],
  })
  hold[0] = -p[0]
  rest[0] = 0 // sold[0] 不可能,保持空白
  yield f('init', `第 0 天:買入 → 持有 = −${p[0]};不可能已經賣出;什麼都不做 → 空手 = 0`, 0)
  for (let i = 1; i < n; i++) {
    const sPrev = sold[i - 1] ?? -Infinity
    hold[i] = Math.max(hold[i - 1]!, rest[i - 1]! - p[i])
    yield f('hold', `持有:昨天就持有(${hold[i - 1]}),或昨天空手今天買入(${rest[i - 1]} − ${p[i]} = ${rest[i - 1]! - p[i]})→ ${hold[i]}`, i, [[0, i - 1], [2, i - 1]])
    sold[i] = hold[i - 1]! + p[i]
    yield f('sell', `今天剛賣:一定是昨天持有、今天賣出 → ${hold[i - 1]} + ${p[i]} = ${sold[i]}`, i, [[0, i - 1]])
    rest[i] = Math.max(rest[i - 1]!, sPrev)
    yield f('rest', `空手可買:昨天就空手(${rest[i - 1]}),或昨天剛賣、今天冷凍期結束(${sPrev === -Infinity ? '不可能' : sPrev})→ ${rest[i]}`, i, [[2, i - 1], [1, i - 1]])
  }
  const ans = Math.max(sold[n - 1] ?? 0, rest[n - 1]!)
  yield f('done', `最後一天不能還持有股票,答案 = max(剛賣, 空手) = ${ans}`, n - 1, [], ans)
}

export const stateMachineDp: Pattern = {
  id: 'state-machine-dp',
  summary: '每一天(每一步)你處在幾種「狀態」之一(例如持有股票、剛賣出、空手)。為每種狀態各開一排 dp,畫出狀態之間怎麼轉換,轉移式就照著箭頭寫。',
  analogy: '紅綠燈:每個時刻燈號是紅、黃、綠其中之一,而且只能依照固定的規則換。只要知道上一刻每種燈號的最佳情況,就能推出這一刻的。',
  steps: ['列出所有狀態(持有 / 剛賣 / 冷凍後空手)', '畫出狀態轉換:持有 →(賣)→ 剛賣 →(等一天)→ 空手 →(買)→ 持有', '每天每個狀態 = 所有能到達它的「昨天狀態 + 動作收益」取最大', '答案是最後一天的合法結束狀態'],
  watch: ['下方表格的三列就是三種狀態', '虛線框是這格由昨天哪些狀態轉移過來'],
  whenToUse: ['買賣股票系列(冷凍期、手續費、最多 k 次交易)', '每一步有幾種「模式」且模式之間有轉換規則', '打家劫舍也可以看成「偷 / 不偷」兩種狀態'],
  pitfalls: ['初始值:第 0 天不可能的狀態要設成 −∞,不是 0', '狀態要能完整描述「之後能做什麼」,少一個狀態就會算錯'],
  complexity: { time: 'O(n × 狀態數)', space: 'O(狀態數)', why: '每天每個狀態 O(1);只需要昨天的值。' },
  demo: {
    title: '買賣股票(含一天冷凍期)的最大利潤(LeetCode 309)',
    inputs: [{ key: 'prices', label: '每天股價', default: '1,2,3,0,2,5,1' }],
    run: stockRun,
    reference: (v) => {
      const p = parseInts(v.prices, 'prices', { min: 0, max: 99, maxLen: 9 })
      const memo = new Map<string, number>()
      const go = (i: number, holding: boolean, cool: boolean): number => {
        if (i >= p.length) return 0
        const k = `${i},${holding},${cool}`
        if (memo.has(k)) return memo.get(k)!
        let r = go(i + 1, holding, false)
        if (holding) r = Math.max(r, p[i] + go(i + 2, false, false))
        else if (!cool) r = Math.max(r, -p[i] + go(i + 1, true, false))
        memo.set(k, r)
        return r
      }
      return go(0, false, false)
    },
    random: () => ({ prices: randInts(randInt(1, 9), 0, 10).join(',') }),
    code: {
      python: `def max_profit(prices):
    hold, sold, rest = -prices[0], float('-inf'), 0     #@init
    for p in prices[1:]:
        h = max(hold, rest - p)                 #@hold
        s = hold + p                            #@sell
        r = max(rest, sold)                     #@rest
        hold, sold, rest = h, s, r
    return max(sold, rest)                      #@done`,
      c: `int maxProfit(int* prices, int n) {
    int hold = -prices[0], sold = INT_MIN / 2, rest = 0;    //@init
    for (int i = 1; i < n; i++) {
        int h = hold > rest - prices[i] ? hold : rest - prices[i];  //@hold
        int s = hold + prices[i];               //@sell
        int r = rest > sold ? rest : sold;      //@rest
        hold = h; sold = s; rest = r;
    }
    return sold > rest ? sold : rest;           //@done
}`,
      cpp: `int maxProfit(vector<int>& prices) {
    int hold = -prices[0], sold = INT_MIN / 2, rest = 0;    //@init
    for (int i = 1; i < (int)prices.size(); i++) {
        int h = max(hold, rest - prices[i]);    //@hold
        int s = hold + prices[i];               //@sell
        int r = max(rest, sold);                //@rest
        hold = h; sold = s; rest = r;
    }
    return max(sold, rest);                     //@done
}`,
      java: `int maxProfit(int[] prices) {
    int hold = -prices[0], sold = Integer.MIN_VALUE / 2, rest = 0;  //@init
    for (int i = 1; i < prices.length; i++) {
        int h = Math.max(hold, rest - prices[i]);   //@hold
        int s = hold + prices[i];               //@sell
        int r = Math.max(rest, sold);           //@rest
        hold = h; sold = s; rest = r;
    }
    return Math.max(sold, rest);                //@done
}`,
      javascript: `function maxProfit(prices) {
  let hold = -prices[0], sold = -Infinity, rest = 0;    //@init
  for (let i = 1; i < prices.length; i++) {
    const h = Math.max(hold, rest - prices[i]); //@hold
    const s = hold + prices[i];                 //@sell
    const r = Math.max(rest, sold);             //@rest
    hold = h; sold = s; rest = r;
  }
  return Math.max(sold, rest);                  //@done
}`,
    },
  },
}

// ===== 位元 DP(1879. Minimum XOR Sum of Two Arrays) =====

function* bitmaskRun(v: Record<string, string>): Generator<Frame> {
  const a = parseInts(v.a, 'nums1', { min: 0, max: 15, maxLen: 4 })
  const b = parseInts(v.b, 'nums2', { min: 0, max: 15, maxLen: 4 })
  if (a.length !== b.length) throw new Error('兩個陣列長度要一樣')
  const n = a.length
  const full = (1 << n) - 1
  const dp: (number | string)[] = new Array(1 << n).fill('∞')
  const bin = (m: number) => m.toString(2).padStart(n, '0')
  const pop = (m: number) => m.toString(2).split('1').length - 1
  const f = (line: string, note: string, cur: number, cmp: number[] = [], answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      {
        kind: 'grid',
        label: `成本表:nums1[i] XOR nums2[j]`,
        cells: a.map((x) => b.map((y) => x ^ y)),
        rowLabels: a.map((x, i) => `nums1[${i}]=${x}`),
        colLabels: b.map((y, j) => `nums2[${j}]=${y}`),
      },
      {
        kind: 'grid',
        label: 'dp[mask]:mask 的第 j 位是 1 代表 nums2[j] 已被用掉;值 = 最小成本(nums1 依序配對,已配到第 popcount(mask) 個)',
        cells: [dp],
        colLabels: dp.map((_, m) => bin(m)),
        marks: { hl: cur >= 0 ? [[0, cur]] : [], dep: cmp.map((m) => [0, m] as Cell) },
      },
    ],
  })
  dp[0] = 0
  yield f('init', `dp[${bin(0)}] = 0:還沒有任何配對。nums1 依序配對,mask 記錄 nums2 哪些已經被用掉`, 0)
  for (let m = 0; m <= full; m++) {
    if (dp[m] === '∞') continue
    const i = pop(m)
    if (i >= n) continue
    for (let j = 0; j < n; j++) {
      if (m >> j & 1) continue
      const nm = m | (1 << j)
      const cost = (dp[m] as number) + (a[i] ^ b[j])
      const better = dp[nm] === '∞' || cost < (dp[nm] as number)
      if (better) dp[nm] = cost
      yield f('trans', `從 ${bin(m)} 出發:nums1[${i}] 配 nums2[${j}],成本 ${dp[m]} + ${a[i] ^ b[j]} = ${cost} → dp[${bin(nm)}]${better ? ' 更新' : ' 沒有更好'}`, nm, [m])
    }
  }
  yield f('done', `dp[${bin(full)}](全部用掉)= ${dp[full]} 就是答案`, full, [], dp[full] as number)
}

export const bitmaskDp: Pattern = {
  id: 'bitmask-dp',
  summary: '當 n 很小(通常 <= 20),可以用一個整數的二進位來表示「哪些東西已經用過」,把它當成 DP 的狀態。dp[mask] = 用掉 mask 這些東西時的最佳答案,共 2ⁿ 個狀態。',
  analogy: '點名簿上每個人旁邊一個小方格,打勾代表已經分配好工作。整張點名簿的打勾情況就是一個「狀態」,用一串 0 和 1 就能記下來。',
  steps: ['mask 的第 j 位 = 1 表示第 j 個東西已經用過', '從 dp[0] 出發,對每個 mask 嘗試加入一個還沒用的 j', 'dp[mask | (1 << j)] = min(…, dp[mask] + 成本)', '答案:dp[全部是 1]'],
  watch: ['下排每一格的標題就是 mask 的二進位', '每一格只會轉移到「多一個 1」的格子,所以由小到大填一定來得及'],
  whenToUse: ['n <= 20 的分配 / 配對問題', '旅行推銷員(TSP)、訪問所有節點的最短路徑', '分成 k 個等和子集、最少工作時段'],
  pitfalls: ['2ⁿ × n 在 n = 20 時約 2000 萬,剛好可以;n 再大就不行', '位元運算的優先順序:一定要加括號 (mask >> j) & 1', '如果配對順序固定(依序處理 nums1),第幾個要配對 = popcount(mask)'],
  complexity: { time: 'O(2ⁿ × n)', space: 'O(2ⁿ)', why: '2ⁿ 個狀態,每個嘗試 n 種轉移。' },
  demo: {
    title: '兩陣列最小 XOR 配對和(LeetCode 1879)',
    inputs: [
      { key: 'a', label: 'nums1', default: '1,0,3' },
      { key: 'b', label: 'nums2', default: '5,3,4' },
    ],
    run: bitmaskRun,
    reference: (v) => {
      const a = parseInts(v.a, 'a', { min: 0, max: 15, maxLen: 4 })
      const b = parseInts(v.b, 'b', { min: 0, max: 15, maxLen: 4 })
      let best = Infinity
      const go = (i: number, used: boolean[], s: number): void => {
        if (i === a.length) return void (best = Math.min(best, s))
        for (let j = 0; j < b.length; j++) if (!used[j]) (used[j] = true), go(i + 1, used, s + (a[i] ^ b[j])), (used[j] = false)
      }
      go(0, [], 0)
      return best
    },
    random: () => {
      const n = randInt(1, 3)
      return { a: randInts(n, 0, 15).join(','), b: randInts(n, 0, 15).join(',') }
    },
    code: {
      python: `def minimum_xor_sum(a, b):
    n = len(a)
    dp = [float('inf')] * (1 << n)
    dp[0] = 0                                   #@init
    for mask in range(1 << n):
        i = bin(mask).count('1')
        if i >= n: continue
        for j in range(n):
            if not mask >> j & 1:
                nm = mask | 1 << j
                dp[nm] = min(dp[nm], dp[mask] + (a[i] ^ b[j]))  #@trans
    return dp[-1]                               #@done`,
      c: `int minimumXORSum(int* a, int n, int* b, int m) {
    int dp[1 << 14];
    for (int s = 0; s < (1 << n); s++) dp[s] = INT_MAX;
    dp[0] = 0;                                  //@init
    for (int mask = 0; mask < (1 << n); mask++) {
        int i = __builtin_popcount(mask);
        if (i >= n || dp[mask] == INT_MAX) continue;
        for (int j = 0; j < n; j++)
            if (!((mask >> j) & 1)) {
                int nm = mask | (1 << j), c = dp[mask] + (a[i] ^ b[j]);
                if (c < dp[nm]) dp[nm] = c;     //@trans
            }
    }
    return dp[(1 << n) - 1];                    //@done
}`,
      cpp: `int minimumXORSum(vector<int>& a, vector<int>& b) {
    int n = a.size();
    vector<int> dp(1 << n, INT_MAX);
    dp[0] = 0;                                  //@init
    for (int mask = 0; mask < (1 << n); mask++) {
        int i = __builtin_popcount(mask);
        if (i >= n || dp[mask] == INT_MAX) continue;
        for (int j = 0; j < n; j++)
            if (!((mask >> j) & 1))
                dp[mask | (1 << j)] = min(dp[mask | (1 << j)], dp[mask] + (a[i] ^ b[j]));  //@trans
    }
    return dp[(1 << n) - 1];                    //@done
}`,
      java: `int minimumXORSum(int[] a, int[] b) {
    int n = a.length;
    int[] dp = new int[1 << n];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;                                  //@init
    for (int mask = 0; mask < (1 << n); mask++) {
        int i = Integer.bitCount(mask);
        if (i >= n || dp[mask] == Integer.MAX_VALUE) continue;
        for (int j = 0; j < n; j++)
            if (((mask >> j) & 1) == 0)
                dp[mask | (1 << j)] = Math.min(dp[mask | (1 << j)], dp[mask] + (a[i] ^ b[j]));  //@trans
    }
    return dp[(1 << n) - 1];                    //@done
}`,
      javascript: `function minimumXORSum(a, b) {
  const n = a.length, dp = new Array(1 << n).fill(Infinity);
  dp[0] = 0;                                    //@init
  for (let mask = 0; mask < (1 << n); mask++) {
    const i = mask.toString(2).split('1').length - 1;
    if (i >= n) continue;
    for (let j = 0; j < n; j++)
      if (!((mask >> j) & 1))
        dp[mask | (1 << j)] = Math.min(dp[mask | (1 << j)], dp[mask] + (a[i] ^ b[j]));  //@trans
  }
  return dp[(1 << n) - 1];                      //@done
}`,
    },
  },
}

export const DP = [dpGeneral, dp1d, dpGrid, knapsack, lis, lcs, intervalDp, stateMachineDp, bitmaskDp]
