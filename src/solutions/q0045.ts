import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 45. Jump Game II

const A = [2, 3, 1, 1, 4, 1, 2]

function dpFig(): FigStep[] {
  const n = A.length
  const dp: (number | string)[] = Array(n).fill('∞')
  dp[0] = 0
  const out: FigStep[] = [{ note: 'dp[i] = 跳到第 i 格最少要幾步。dp[0] = 0。從每一格 i 往後能跳到的每一格 j,都可以用 dp[i] + 1 更新', views: [arr(A, { label: 'nums(每格最多能跳幾步)' }), arr(dp, { label: 'dp' })] }]
  for (let i = 0; i < n; i++) {
    const reach = range(i + 1, Math.min(n - 1, i + A[i]))
    for (const j of reach) dp[j] = Math.min(dp[j] === '∞' ? Infinity : (dp[j] as number), (dp[i] as number) + 1)
    out.push({ note: `從第 ${i} 格(${dp[i]} 步)最多跳 ${A[i]} 格,能到 ${reach.length ? reach.join('、') : '(沒有新的格子)'} → 這些格子最多 ${(dp[i] as number) + 1} 步`, views: [arr(A, { label: 'nums', highlight: [i], compare: reach }), arr(dp, { label: 'dp', highlight: reach })] })
  }
  return out
}

function bfsFig(): FigStep[] {
  const n = A.length
  let jumps = 0
  let end = 0
  let far = 0
  const out: FigStep[] = [{ note: '像 BFS 分層:跳 0 步能到的是 [0, 0];跳 1 步能到的是一段連續的格子;跳 2 步又是下一段……只要記「這一層的右邊界 end」和「下一層最遠能到 far」', views: [arr(A, { label: 'nums', range: [0, 0] })] }]
  for (let i = 0; i < n - 1; i++) {
    far = Math.max(far, i + A[i])
    if (i === end) {
      jumps++
      out.push({ note: `走到這一層的盡頭(第 ${i} 格):這一層的格子最遠能跳到 ${far} → 必須再跳一次,第 ${jumps} 步能到 [${end + 1}, ${Math.min(far, n - 1)}]`, views: [arr(A, { label: 'nums', range: [end + 1, Math.min(far, n - 1)], highlight: [i] })] })
      end = far
      if (end >= n - 1) break
    } else out.push({ note: `第 ${i} 格:最遠可以到 ${i} + ${A[i]} = ${i + A[i]},目前下一層最遠 ${far}`, views: [arr(A, { label: 'nums', highlight: [i], range: [i, Math.min(far, n - 1)] })] })
  }
  out.push({ note: `最後一格在第 ${jumps} 層的範圍裡 → 最少 ${jumps} 步`, views: [arr(A, { label: 'nums', done: [n - 1] })] })
  return out
}

export const q0045: Solution = {
  id: 45,
  plain: '站在一排格子的第一格,每一格寫著「從這裡最多能往前跳幾格」。問最少要跳幾次才能到最後一格(題目保證到得了)。',
  statement: '`nums[i]` 是從第 i 格最多能往前跳的距離。從第 0 格出發,回傳到達最後一格的**最少跳躍次數**。保證一定到得了。',
  examples: [
    { input: 'nums = [2,3,1,1,4]', output: '2', note: '0 → 1 → 4' },
    { input: 'nums = [2,3,0,1,4]', output: '2' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁴`,`nums[i] ≤ 1000` → DP 最壞 10⁷,能過;但有 O(n) 解'],
  insight: [
    'DP:`dp[j] = min(dp[i] + 1)`,其中 i 能跳到 j。O(n · 最大跳距)',
    '換成 BFS 的角度:跳 0 次能到第 0 格;跳 1 次能到的是**一段連續的區間**;跳 2 次又是下一段區間……(因為能跳到 k 就能跳到 k 之前的任何格子)',
    '所以只要一邊走一邊記「這一層的右邊界」和「下一層最遠能到哪」。走到這層邊界時,就必須再跳一次,新的邊界是 far',
  ],
  approaches: [
    {
      name: '動態規劃',
      idea: '`dp[i]` = 到第 i 格的最少步數。對每個 i,把它能跳到的每個 j 更新成 `min(dp[j], dp[i] + 1)`。',
      steps: ['`dp = [∞] * n`、`dp[0] = 0`', '`for i`:`for j in i+1..min(n−1, i+nums[i])`:`dp[j] = min(dp[j], dp[i] + 1)`', '回傳 `dp[n−1]`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: dpFig() },
      complexity: { time: 'O(n · k)', space: 'O(n)', why: 'k 是最大跳距。每格往後更新最多 k 格。' },
      verdict: '直觀,能過這題的範圍。展示「最少步數 → DP / BFS」的基本想法。',
      code: {
        python: `def jump(nums):
    n = len(nums)
    dp = [float('inf')] * n
    dp[0] = 0
    for i in range(n):
        for j in range(i + 1, min(n, i + nums[i] + 1)):
            dp[j] = min(dp[j], dp[i] + 1)
    return dp[-1]`,
        c: `int jump(int *nums, int numsSize) {
    int *dp = malloc(numsSize * sizeof(int));
    for (int i = 0; i < numsSize; i++) dp[i] = INT_MAX;
    dp[0] = 0;
    for (int i = 0; i < numsSize; i++)
        for (int j = i + 1; j < numsSize && j <= i + nums[i]; j++)
            if (dp[i] + 1 < dp[j]) dp[j] = dp[i] + 1;
    int ans = dp[numsSize - 1];
    free(dp);
    return ans;
}`,
        cpp: `int jump(vector<int>& nums) {
    int n = nums.size();
    vector<int> dp(n, INT_MAX);
    dp[0] = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n && j <= i + nums[i]; j++)
            dp[j] = min(dp[j], dp[i] + 1);
    return dp[n - 1];
}`,
        java: `int jump(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0] = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n && j <= i + nums[i]; j++)
            dp[j] = Math.min(dp[j], dp[i] + 1);
    return dp[n - 1];
}`,
        javascript: `function jump(nums) {
  const n = nums.length, dp = new Array(n).fill(Infinity);
  dp[0] = 0;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n && j <= i + nums[i]; j++) dp[j] = Math.min(dp[j], dp[i] + 1);
  return dp[n - 1];
}`,
      },
    },
    {
      name: '貪心:BFS 分層(邊界 + 最遠)',
      idea: '`end` = 目前跳躍次數能到的最右邊,`far` = 再跳一次最遠能到哪。走到 `i == end` 時,必須跳一次:`jumps += 1`、`end = far`。',
      steps: ['`jumps = end = far = 0`', '`for i in 0..n−2`:`far = max(far, i + nums[i])`', '`i == end` → `jumps += 1`、`end = far`', '回傳 `jumps`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: bfsFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只走一遍,記三個數。' },
      verdict: '標準解,[[p:greedy]]版的 BFS。迴圈只跑到 n − 2:站在最後一格時不需要再跳。',
      code: {
        python: `def jump(nums):
    jumps = end = far = 0
    for i in range(len(nums) - 1):        # 不用處理最後一格
        far = max(far, i + nums[i])       # 下一層最遠能到哪
        if i == end:                      # 這一層走完了,必須再跳一次
            jumps += 1
            end = far
    return jumps`,
        c: `int jump(int *nums, int numsSize) {
    int jumps = 0, end = 0, far = 0;
    for (int i = 0; i < numsSize - 1; i++) {
        if (i + nums[i] > far) far = i + nums[i];
        if (i == end) { jumps++; end = far; }
    }
    return jumps;
}`,
        cpp: `int jump(vector<int>& nums) {
    int jumps = 0, end = 0, far = 0;
    for (int i = 0; i < (int)nums.size() - 1; i++) {
        far = max(far, i + nums[i]);
        if (i == end) { jumps++; end = far; }
    }
    return jumps;
}`,
        java: `int jump(int[] nums) {
    int jumps = 0, end = 0, far = 0;
    for (int i = 0; i < nums.length - 1; i++) {
        far = Math.max(far, i + nums[i]);
        if (i == end) { jumps++; end = far; }
    }
    return jumps;
}`,
        javascript: `function jump(nums) {
  let jumps = 0, end = 0, far = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    far = Math.max(far, i + nums[i]);
    if (i === end) {
      jumps++;
      end = far;
    }
  }
  return jumps;
}`,
      },
    },
  ],
  pitfalls: [
    '迴圈跑到 n − 1:如果剛好走到最後一格時 `i == end`,會多算一次跳躍(`nums = [0]` 會回傳 1)',
    '「每次都跳到能跳最遠的格子」是錯的貪心:要選的是「跳過去之後下一步能到最遠」的那格,分層寫法自動做到了這件事',
  ],
  followUp: [{ q: '只問到不到得了?', a: '[55. Jump Game](#/q/55):只要維護「最遠能到哪」,途中 i > far 就到不了。' }],
  check: {
    kind: 'fn',
    fn: 'jump',
    cases: [
      { args: [[2, 3, 1, 1, 4]], out: 2 },
      { args: [[2, 3, 0, 1, 4]], out: 2 },
      { args: [[0]], out: 0 },
      { args: [A], out: 3 },
      { args: [[1, 1, 1, 1]], out: 3 },
      { args: [[5, 1, 1, 1, 1, 1]], out: 1 },
    ],
  },
}
