import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 494. Target Sum

const A = [1, 1, 1, 1, 1]
const T = 3

function mapFig(): FigStep[] {
  let ways = new Map([[0, 1]])
  const out: FigStep[] = [{ note: '一個一個數決定正負號。用 map 記「目前能得到的總和 → 有幾種方式」。一開始只有總和 0,1 種', views: [kv([...ways], '總和 → 方式數')] }]
  A.forEach((x, i) => {
    const next = new Map<number, number>()
    for (const [s, c] of ways) {
      next.set(s + x, (next.get(s + x) ?? 0) + c)
      next.set(s - x, (next.get(s - x) ?? 0) + c)
    }
    ways = next
    out.push({ note: `第 ${i} 個數 ${x}:每個舊的總和分成 +${x} 和 −${x} 兩條路,方式數累加`, views: [arr(A, { label: 'nums', highlight: [i] }), kv([...ways].sort((a, b) => a[0] - b[0]), '總和 → 方式數', [T])] })
  })
  out.push({ note: `總和 ${T} 有 ${ways.get(T) ?? 0} 種`, views: [kv([...ways].sort((a, b) => a[0] - b[0]), '總和 → 方式數', [T])] })
  return out
}

function knapFig(): FigStep[] {
  const total = A.reduce((a, b) => a + b, 0)
  const P = (total + T) / 2
  const dp = Array(P + 1).fill(0)
  dp[0] = 1
  const out: FigStep[] = [
    { note: `數學轉換:把帶 + 的數叫 P 堆、帶 − 的叫 N 堆。P − N = target、P + N = 總和 → P = (總和 + target) / 2 = (${total} + ${T}) / 2 = ${P}。問題變成「挑出一些數和為 ${P},有幾種挑法」→ 0/1 背包計數`, views: [arr(A, { label: 'nums' }), arr(dp, { label: `dp[0..${P}](湊出 s 的方法數)` })] },
  ]
  A.forEach((x, i) => {
    for (let s = P; s >= x; s--) dp[s] += dp[s - x]
    out.push({ note: `加入第 ${i} 個數 ${x}:s 由大到小,dp[s] += dp[s − ${x}]`, views: [arr(A, { label: 'nums', highlight: [i] }), arr([...dp], { label: 'dp', highlight: [P] })] })
  })
  out.push({ note: `答案 dp[${P}] = ${dp[P]}`, views: [arr(dp, { label: 'dp', done: [P] })] })
  return out
}

export const q0494: Solution = {
  id: 494,
  plain: '在每個數字前面放 + 或 −,算出總和。有幾種放法能讓總和剛好等於目標?例如 [1,1,1,1,1] 要湊 3,就是挑一個放 −、其他放 +,共 5 種。',
  statement: '給整數陣列 `nums` 和 `target`。在每個數前面加上 `+` 或 `-`,串成一個運算式。回傳運算結果等於 target 的不同運算式數量。',
  examples: [
    { input: 'nums = [1,1,1,1,1], target = 3', output: '5' },
    { input: 'nums = [1], target = 1', output: '1' },
  ],
  constraints: ['`n ≤ 20`,每個數 0 ~ 1000,總和 ≤ 1000'],
  insight: [
    '暴力:每個數兩種符號,2²⁰ ≈ 100 萬種,其實能過;但同樣的「前 i 個數、目前和為 s」會被走很多次',
    '記憶化 / DP:狀態是 (處理到第幾個數, 目前總和),總和範圍只有 −1000 ~ 1000',
    '漂亮的轉換:正號的數總和 P、負號的 N,`P − N = target`、`P + N = sum` → `P = (sum + target) / 2`。變成「挑一些數湊出 P 有幾種」—— 0/1 背包計數',
    '`sum + target` 是奇數或 `|target| > sum` → 0 種',
  ],
  approaches: [
    {
      name: '逐個數展開,用 map 記總和的方式數',
      idea: '`ways` = {目前總和: 方式數}。每個數 x:每個舊的總和 s 都變成 s + x 和 s − x,方式數加過去。',
      steps: ['`ways = {0: 1}`', '對每個 x:`next[s + x] += c`、`next[s − x] += c`', '回傳 `ways[target]`'],
      figure: { title: `nums = [${A}], target = ${T}`, steps: mapFig() },
      complexity: { time: 'O(n · S)', space: 'O(S)', why: 'S 是總和的範圍(最多 2001 種)。每個數處理每種總和一次。' },
      verdict: '最直觀的 DP(就是暴力法把相同的狀態合併起來)。',
      code: {
        python: `from collections import defaultdict

def findTargetSumWays(nums, target):
    ways = {0: 1}                         # 目前總和 -> 方式數
    for x in nums:
        nxt = defaultdict(int)
        for s, c in ways.items():
            nxt[s + x] += c
            nxt[s - x] += c
        ways = nxt
    return ways.get(target, 0)`,
        c: `int findTargetSumWays(int *nums, int numsSize, int target) {
    // 總和範圍 -1000 ~ 1000,加上偏移 1000 當索引
    int cur[2001] = {0}, nxt[2001];
    cur[1000] = 1;
    for (int i = 0; i < numsSize; i++) {
        memset(nxt, 0, sizeof(nxt));
        for (int s = 0; s <= 2000; s++) {
            if (!cur[s]) continue;
            if (s + nums[i] <= 2000) nxt[s + nums[i]] += cur[s];
            if (s - nums[i] >= 0) nxt[s - nums[i]] += cur[s];
        }
        memcpy(cur, nxt, sizeof(cur));
    }
    return target + 1000 >= 0 && target + 1000 <= 2000 ? cur[target + 1000] : 0;
}`,
        cpp: `int findTargetSumWays(vector<int>& nums, int target) {
    unordered_map<int, int> ways{{0, 1}};
    for (int x : nums) {
        unordered_map<int, int> nxt;
        for (auto& [s, c] : ways) { nxt[s + x] += c; nxt[s - x] += c; }
        ways = move(nxt);
    }
    return ways.count(target) ? ways[target] : 0;
}`,
        java: `int findTargetSumWays(int[] nums, int target) {
    Map<Integer, Integer> ways = new HashMap<>();
    ways.put(0, 1);
    for (int x : nums) {
        Map<Integer, Integer> nxt = new HashMap<>();
        for (var e : ways.entrySet()) {
            nxt.merge(e.getKey() + x, e.getValue(), Integer::sum);
            nxt.merge(e.getKey() - x, e.getValue(), Integer::sum);
        }
        ways = nxt;
    }
    return ways.getOrDefault(target, 0);
}`,
        javascript: `function findTargetSumWays(nums, target) {
  let ways = new Map([[0, 1]]);
  for (const x of nums) {
    const nxt = new Map();
    for (const [s, c] of ways) {
      nxt.set(s + x, (nxt.get(s + x) ?? 0) + c);
      nxt.set(s - x, (nxt.get(s - x) ?? 0) + c);
    }
    ways = nxt;
  }
  return ways.get(target) ?? 0;
}`,
      },
    },
    {
      name: '轉成 0/1 背包計數',
      idea: '`P = (sum + target) / 2`。`dp[s]` = 挑出和為 s 的方法數:`dp[0] = 1`,每個 x:s 由大到小 `dp[s] += dp[s − x]`。',
      steps: ['`(sum + target)` 是奇數或 `|target| > sum` → 0', '`P = (sum + target) / 2`', '`dp = [1] + [0] * P`', '每個 x:`for s in P..x`(遞減):`dp[s] += dp[s − x]`', '回傳 `dp[P]`'],
      figure: { title: `nums = [${A}], target = ${T}`, steps: knapFig() },
      complexity: { time: 'O(n · P)', space: 'O(P)', why: 'P ≤ 1000。' },
      verdict: '最佳解,[[p:knapsack]]的經典轉換。看到「每個數選正或負」,就想到「分成兩堆」→ 子集和。注意 0:`dp[0]` 會因為 0 而變成 2、4…,這是對的(0 前面放 + 或 − 是兩種)。',
      code: {
        python: `def findTargetSumWays(nums, target):
    total = sum(nums)
    if abs(target) > total or (total + target) % 2:
        return 0
    p = (total + target) // 2             # 正號那堆的和
    dp = [1] + [0] * p                    # dp[s]:挑出和為 s 的方法數
    for x in nums:
        for s in range(p, x - 1, -1):     # 0/1 背包:由大到小
            dp[s] += dp[s - x]
    return dp[p]`,
        c: `int findTargetSumWays(int *nums, int numsSize, int target) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    if (abs(target) > total || (total + target) % 2) return 0;
    int p = (total + target) / 2;
    int *dp = calloc(p + 1, sizeof(int));
    dp[0] = 1;
    for (int i = 0; i < numsSize; i++)
        for (int s = p; s >= nums[i]; s--) dp[s] += dp[s - nums[i]];
    int ans = dp[p];
    free(dp);
    return ans;
}`,
        cpp: `int findTargetSumWays(vector<int>& nums, int target) {
    int total = accumulate(nums.begin(), nums.end(), 0);
    if (abs(target) > total || (total + target) % 2) return 0;
    int p = (total + target) / 2;
    vector<int> dp(p + 1, 0);
    dp[0] = 1;
    for (int x : nums)
        for (int s = p; s >= x; s--) dp[s] += dp[s - x];
    return dp[p];
}`,
        java: `int findTargetSumWays(int[] nums, int target) {
    int total = 0;
    for (int x : nums) total += x;
    if (Math.abs(target) > total || (total + target) % 2 != 0) return 0;
    int p = (total + target) / 2;
    int[] dp = new int[p + 1];
    dp[0] = 1;
    for (int x : nums)
        for (int s = p; s >= x; s--) dp[s] += dp[s - x];
    return dp[p];
}`,
        javascript: `function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2) return 0;
  const p = (total + target) / 2;
  const dp = new Array(p + 1).fill(0);
  dp[0] = 1;
  for (const x of nums) for (let s = p; s >= x; s--) dp[s] += dp[s - x];
  return dp[p];
}`,
      },
    },
  ],
  pitfalls: [
    '忘了檢查 `|target| > sum`:P 會是負的或超過範圍',
    '`(sum + target)` 是奇數時 P 不是整數,答案是 0',
    '0/1 背包內層由小到大:同一個數會被重複使用',
    '陣列裡有 0 時,它放 + 或 − 結果一樣,但算兩種不同的運算式 —— 兩種方法都會自動算對',
  ],
  followUp: [{ q: '要最小化兩堆的差?', a: '1049. Last Stone Weight II:同樣分兩堆,找最接近 sum/2 的子集和。' }],
  check: {
    kind: 'fn',
    fn: 'findTargetSumWays',
    cases: [
      { args: [A, T], out: 5 },
      { args: [[1], 1], out: 1 },
      { args: [[1], 2], out: 0 },
      { args: [[0, 0, 1], 1], out: 4 },
      { args: [[1, 2, 3, 4, 5], 3], out: 3 },
      { args: [[100], -200], out: 0 },
    ],
  },
}
