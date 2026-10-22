import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 55. Jump Game

const A = [3, 2, 1, 0, 4]
const B = [2, 3, 1, 1, 4]

function farFig(nums: number[]): FigStep[] {
  let far = 0
  const out: FigStep[] = [{ note: '從左往右走,維護「目前最遠能到的格子 far」。走到某一格時,如果它比 far 還遠,代表根本到不了這裡', views: [arr(nums, { label: 'nums', range: [0, 0] })] }]
  for (let i = 0; i < nums.length; i++) {
    if (i > far) {
      out.push({ note: `第 ${i} 格比最遠能到的 ${far} 還遠 → 到不了 → false`, views: [arr(nums, { label: 'nums', range: [0, far], compare: [i] })] })
      return out
    }
    far = Math.max(far, i + nums[i])
    out.push({ note: `第 ${i} 格到得了。從這裡最遠能跳到 ${i} + ${nums[i]} = ${i + nums[i]},目前最遠 far = ${far}${far >= nums.length - 1 ? ' ≥ 最後一格 → true' : ''}`, views: [arr(nums, { label: 'nums', range: [0, Math.min(far, nums.length - 1)], highlight: [i] })] })
    if (far >= nums.length - 1) return out
  }
  return out
}

function goalFig(nums: number[]): FigStep[] {
  let goal = nums.length - 1
  const out: FigStep[] = [{ note: '反過來想:目標一開始是最後一格。從右往左看,如果第 i 格跳得到目標,那「能到第 i 格」就等於「能到終點」→ 目標往左移到 i', views: [arr(nums, { label: 'nums', highlight: [goal] })] }]
  for (let i = nums.length - 2; i >= 0; i--) {
    const can = i + nums[i] >= goal
    out.push({ note: `第 ${i} 格最遠到 ${i + nums[i]}${can ? ` ≥ 目標 ${goal} → 目標移到 ${i}` : ` < 目標 ${goal},不行`}`, views: [arr(nums, { label: 'nums', highlight: [can ? i : goal], compare: can ? [] : [i], done: range(goal, nums.length - 1) })] })
    if (can) goal = i
  }
  out.push({ note: goal === 0 ? '目標移到了起點 → true' : `目標停在 ${goal},起點跳不到 → false`, views: [arr(nums, { label: 'nums', highlight: [goal] })] })
  return out
}

function dpFig(nums: number[]): FigStep[] {
  const ok = nums.map(() => false)
  ok[0] = true
  const out: FigStep[] = [{ note: 'DP:can[i] = 第 i 格到不到得了。can[0] = true;能到的格子 i,把它能跳到的 i+1 … i+nums[i] 都標成 true', views: [arr(nums, { label: 'nums' }), arr(ok.map((v) => (v ? '✓' : '·')), { label: 'can' })] }]
  for (let i = 0; i < nums.length; i++) {
    if (!ok[i]) continue
    const reach = range(i + 1, Math.min(nums.length - 1, i + nums[i]))
    reach.forEach((j) => (ok[j] = true))
    out.push({ note: `第 ${i} 格到得了,標記 ${reach.join('、') || '(沒有新的)'}`, views: [arr(nums, { label: 'nums', highlight: [i], compare: reach }), arr(ok.map((v) => (v ? '✓' : '·')), { label: 'can', highlight: reach })] })
  }
  return out
}

export const q0055: Solution = {
  id: 55,
  plain: '站在第一格,每一格寫著「從這裡最多能往前跳幾格」。問能不能跳到最後一格。訣竅:一邊走一邊記「目前最遠能跳到哪」,如果走到一個連最遠都到不了的格子,就失敗了。',
  statement: '`nums[i]` 是在第 i 格時最多能往前跳的步數。從第 0 格出發,判斷能不能到達最後一格。',
  examples: [
    { input: 'nums = [2,3,1,1,4]', output: 'true' },
    { input: 'nums = [3,2,1,0,4]', output: 'false', note: '不管怎麼跳都會卡在第 3 格(它是 0)' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁴`,`nums[i] ≤ 10⁵`'],
  insight: [
    '如果能到第 k 格,就一定能到 k 之前的每一格(在路上停下來就好)。所以「能到的格子」永遠是從 0 開始的一段連續區間',
    '那只要記一個數:目前最遠能到 far。走到第 i 格時,`i > far` 就代表斷掉了;否則用 `i + nums[i]` 更新 far',
    '反過來想也行:從終點往回,能跳到「目標」的格子就變成新的目標,最後看目標有沒有移到 0',
  ],
  approaches: [
    {
      name: 'DP:標記每一格能不能到',
      idea: '`can[0] = True`;每個能到的格子 i,把 i+1 到 i+nums[i] 都標成能到。',
      steps: ['`can = [False] * n`、`can[0] = True`', '`for i`:`can[i]` 是 False 就跳過', '把 `i+1 .. min(n−1, i+nums[i])` 都設成 True', '回傳 `can[n−1]`'],
      figure: { title: `nums = [${B.join(',')}]`, steps: dpFig(B) },
      complexity: { time: 'O(n · k)', space: 'O(n)', why: 'k 是最大跳距,最壞 10⁹ 次操作會超時。' },
      verdict: '直觀,但跳距很大時太慢。用來理解「能到的格子是連續區間」。',
      code: {
        python: `def canJump(nums):
    n = len(nums)
    can = [False] * n
    can[0] = True
    for i in range(n):
        if not can[i]:
            continue
        for j in range(i + 1, min(n, i + nums[i] + 1)):
            can[j] = True
    return can[-1]`,
        c: `bool canJump(int *nums, int numsSize) {
    bool *can = calloc(numsSize, sizeof(bool));
    can[0] = true;
    for (int i = 0; i < numsSize; i++) {
        if (!can[i]) continue;
        for (long long j = i + 1; j < numsSize && j <= (long long)i + nums[i]; j++) can[j] = true;
    }
    bool ok = can[numsSize - 1];
    free(can);
    return ok;
}`,
        cpp: `bool canJump(vector<int>& nums) {
    int n = nums.size();
    vector<bool> can(n, false);
    can[0] = true;
    for (int i = 0; i < n; i++) {
        if (!can[i]) continue;
        for (int j = i + 1; j < n && j <= i + nums[i]; j++) can[j] = true;
    }
    return can[n - 1];
}`,
        java: `boolean canJump(int[] nums) {
    int n = nums.length;
    boolean[] can = new boolean[n];
    can[0] = true;
    for (int i = 0; i < n; i++) {
        if (!can[i]) continue;
        for (int j = i + 1; j < n && j <= i + nums[i]; j++) can[j] = true;
    }
    return can[n - 1];
}`,
        javascript: `function canJump(nums) {
  const n = nums.length, can = new Array(n).fill(false);
  can[0] = true;
  for (let i = 0; i < n; i++) {
    if (!can[i]) continue;
    for (let j = i + 1; j < n && j <= i + nums[i]; j++) can[j] = true;
  }
  return can[n - 1];
}`,
      },
    },
    {
      name: '貪心:維護最遠能到的位置',
      idea: '`far` = 目前最遠能到的格子。走到 i 時 `i > far` → false;否則 `far = max(far, i + nums[i])`,far 到終點就是 true。',
      steps: ['`far = 0`', '`for i in 0..n−1`:`i > far` → false', '`far = max(far, i + nums[i])`', '`far >= n − 1` → true'],
      figure: { title: `nums = [${A.join(',')}]`, steps: farFig(A) },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只走一遍。' },
      verdict: '標準解,[[p:greedy]]。45 題(最少跳幾次)就是在這上面多記一個「這一層的邊界」。',
      code: {
        python: `def canJump(nums):
    far = 0
    for i, x in enumerate(nums):
        if i > far:
            return False                  # 這一格根本到不了
        far = max(far, i + x)
        if far >= len(nums) - 1:
            return True
    return True`,
        c: `bool canJump(int *nums, int numsSize) {
    long long far = 0;
    for (int i = 0; i < numsSize; i++) {
        if (i > far) return false;
        if (i + (long long)nums[i] > far) far = i + nums[i];
        if (far >= numsSize - 1) return true;
    }
    return true;
}`,
        cpp: `bool canJump(vector<int>& nums) {
    int far = 0, n = nums.size();
    for (int i = 0; i < n; i++) {
        if (i > far) return false;
        far = max(far, i + nums[i]);
        if (far >= n - 1) return true;
    }
    return true;
}`,
        java: `boolean canJump(int[] nums) {
    int far = 0, n = nums.length;
    for (int i = 0; i < n; i++) {
        if (i > far) return false;
        far = Math.max(far, i + nums[i]);
        if (far >= n - 1) return true;
    }
    return true;
}`,
        javascript: `function canJump(nums) {
  let far = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > far) return false;
    far = Math.max(far, i + nums[i]);
    if (far >= nums.length - 1) return true;
  }
  return true;
}`,
      },
    },
    {
      name: '貪心:從終點往回移動目標',
      idea: '`goal` 一開始是最後一格。從右往左:`i + nums[i] >= goal` → `goal = i`。最後 `goal == 0` 就到得了。',
      steps: ['`goal = n − 1`', '`for i from n−2 down to 0`:`i + nums[i] >= goal` → `goal = i`', '回傳 `goal == 0`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: goalFig(A) },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只走一遍。' },
      verdict: '同樣 O(n),換個方向想。「能到 X 的格子就等於能到終點」這種把目標往回推的想法,在 DP 題也很常見。',
      code: {
        python: `def canJump(nums):
    goal = len(nums) - 1
    for i in range(len(nums) - 2, -1, -1):
        if i + nums[i] >= goal:           # 從 i 跳得到目標 → i 成為新的目標
            goal = i
    return goal == 0`,
        c: `bool canJump(int *nums, int numsSize) {
    int goal = numsSize - 1;
    for (int i = numsSize - 2; i >= 0; i--)
        if ((long long)i + nums[i] >= goal) goal = i;
    return goal == 0;
}`,
        cpp: `bool canJump(vector<int>& nums) {
    int goal = nums.size() - 1;
    for (int i = goal - 1; i >= 0; i--)
        if (i + nums[i] >= goal) goal = i;
    return goal == 0;
}`,
        java: `boolean canJump(int[] nums) {
    int goal = nums.length - 1;
    for (int i = goal - 1; i >= 0; i--)
        if (i + nums[i] >= goal) goal = i;
    return goal == 0;
}`,
        javascript: `function canJump(nums) {
  let goal = nums.length - 1;
  for (let i = goal - 1; i >= 0; i--) if (i + nums[i] >= goal) goal = i;
  return goal === 0;
}`,
      },
    },
  ],
  pitfalls: [
    '卡在 0 的格子:`[3,2,1,0,4]` 前面三格最遠都只能到第 3 格,而它是 0,要能偵測出「斷掉」',
    '只有一格 `[0]`:已經在終點了,要回傳 true',
    'C 的 `i + nums[i]` 在跳距很大時可能溢位(這題 n · 10⁵ 不會,但養成習慣)',
  ],
  followUp: [{ q: '最少要跳幾次?', a: '[45. Jump Game II](#/q/45):BFS 分層的貪心。' }],
  check: {
    kind: 'fn',
    fn: 'canJump',
    cases: [
      { args: [B], out: true },
      { args: [A], out: false },
      { args: [[0]], out: true },
      { args: [[0, 1]], out: false },
      { args: [[2, 0, 0]], out: true },
      { args: [[1, 0, 1, 0]], out: false },
    ],
  },
}
