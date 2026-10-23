import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 1658. Minimum Operations to Reduce X to Zero

const A = [3, 2, 20, 1, 1, 3]
const X = 10

function winFig(): FigStep[] {
  const total = A.reduce((a, b) => a + b, 0)
  const target = total - X
  let l = 0
  let s = 0
  let best = -1
  const out: FigStep[] = [{ note: `從兩端拿掉的數總和要剛好 ${X} → 反過來,**剩下的中間那段**總和 = 總和 − x = ${total} − ${X} = ${target}。要拿最少 → 中間那段要最長`, views: [arr(A, { label: 'nums' })] }]
  for (let r = 0; r < A.length; r++) {
    s += A[r]
    while (s > target && l <= r) s -= A[l++]
    if (s === target) best = Math.max(best, r - l + 1)
    out.push({ note: `r = ${r}:視窗 [${l}, ${r}] 總和 ${s}${s === target ? ` = ${target} ✓,長度 ${r - l + 1}` : s > target ? '' : ` < ${target}`}${best >= 0 ? `,最長 ${best}` : ''}`, views: [arr(A, { label: 'nums', range: [l, r], highlight: [r] })] })
  }
  out.push({ note: `中間最長 ${best} → 兩端要拿 ${A.length} − ${best} = ${A.length - best} 個(左邊 3、2,右邊 1、1、3)`, views: [arr(A, { label: 'nums', dim: [2], done: [0, 1, 3, 4, 5] })] })
  return out
}

function preFig(): FigStep[] {
  return [
    { note: '另一種:左邊拿 i 個的總和 = pre[i]。對每個 i,右邊要拿的總和 = x − pre[i];把「右邊拿 j 個的總和 → j」存進 Hash 表,直接查', views: [kv([[0, 0], [3, 1], [4, 2], [5, 3], [25, 4], [27, 5], [30, 6]], '右邊拿的總和 → 個數', [5])] },
    { note: '左邊拿 2 個(3 + 2 = 5)→ 右邊要 5:查表得 3 個(1 + 1 + 3)→ 共 5 次。全部 i 取最小', views: [arr(A, { label: 'nums', done: [0, 1, 3, 4, 5] })] },
  ]
}

export const q1658: Solution = {
  id: 1658,
  plain: '每次可以從陣列的最左邊或最右邊拿走一個數,並把 x 減掉它。最少要拿幾次,才能讓 x 剛好變成 0?做不到就回傳 −1。',
  statement: '給正整數陣列 `nums` 和整數 `x`。每次操作移除 nums 的最左或最右元素,並從 x 減去它的值。回傳使 x **恰好**變為 0 的最少操作次數;不可能則回傳 −1。',
  examples: [
    { input: 'nums = [1,1,4,2,3], x = 5', output: '2', note: '拿右邊的 3 和 2' },
    { input: 'nums = [5,6,7,8,9], x = 4', output: '-1' },
    { input: 'nums = [3,2,20,1,1,3], x = 10', output: '5' },
  ],
  constraints: ['n ≤ 10⁵,值 ≥ 1', 'x ≤ 10⁹'],
  insight: ['從兩端拿 = 留下中間連續的一段([1423](#/q/1423) 同一招)', '拿走的和 = x ⇔ 留下的和 = 總和 − x', '拿最少 ⇔ 留下的最長 → 「和恰好等於 target 的最長子陣列」,全是正數 → 滑動視窗'],
  approaches: [
    {
      name: '反轉思考 + 滑動視窗',
      idea: '`target = sum − x`;找和恰好為 target 的最長視窗 L,答案 `n − L`(找不到 → −1)。',
      steps: ['`target = sum(nums) − x`;`target < 0` → −1', '`for r`:`s += nums[r]`;`while s > target`:`s -= nums[l]`、`l += 1`', '`s == target` → `best = max(best, r − l + 1)`', '回傳 `n − best`(best 沒更新過 → −1)'],
      figure: { title: `nums = [${A}],x = ${X}`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: 'l、r 各走 n 步。' },
      verdict: '最推薦。「兩端」不好處理,轉成「中間連續」就是標準視窗。',
      code: {
        python: `def minOperations(nums, x):
    target = sum(nums) - x                    # 留在中間的和
    if target < 0:
        return -1
    l = s = 0
    best = -1
    for r, v in enumerate(nums):
        s += v
        while s > target:
            s -= nums[l]
            l += 1
        if s == target:
            best = max(best, r - l + 1)       # 中間越長,拿得越少
    return -1 if best == -1 else len(nums) - best`,
        c: `int minOperations(int *nums, int numsSize, int x) {
    long long total = 0;
    for (int i = 0; i < numsSize; i++) total += nums[i];
    long long target = total - x, s = 0;
    if (target < 0) return -1;
    int l = 0, best = -1;
    for (int r = 0; r < numsSize; r++) {
        s += nums[r];
        while (s > target) s -= nums[l++];
        if (s == target && r - l + 1 > best) best = r - l + 1;
    }
    return best == -1 ? -1 : numsSize - best;
}`,
        cpp: `int minOperations(vector<int>& nums, int x) {
    long long target = accumulate(nums.begin(), nums.end(), 0LL) - x, s = 0;
    if (target < 0) return -1;
    int n = nums.size(), l = 0, best = -1;
    for (int r = 0; r < n; r++) {
        s += nums[r];
        while (s > target) s -= nums[l++];
        if (s == target) best = max(best, r - l + 1);
    }
    return best == -1 ? -1 : n - best;
}`,
        java: `int minOperations(int[] nums, int x) {
    long total = 0;
    for (int v : nums) total += v;
    long target = total - x, s = 0;
    if (target < 0) return -1;
    int l = 0, best = -1;
    for (int r = 0; r < nums.length; r++) {
        s += nums[r];
        while (s > target) s -= nums[l++];
        if (s == target) best = Math.max(best, r - l + 1);
    }
    return best == -1 ? -1 : nums.length - best;
}`,
        javascript: `function minOperations(nums, x) {
  const target = nums.reduce((a, b) => a + b, 0) - x;
  if (target < 0) return -1;
  let l = 0, s = 0, best = -1;
  for (let r = 0; r < nums.length; r++) {
    s += nums[r];
    while (s > target) s -= nums[l++];
    if (s === target) best = Math.max(best, r - l + 1);
  }
  return best === -1 ? -1 : nums.length - best;
}`,
      },
    },
    {
      name: '左邊前綴 + 右邊後綴的 Hash 表',
      idea: '`suf[和] = 右邊要拿幾個`;對每個左邊拿 i 個(和 pre),查 `suf[x − pre]`,總數 `i + j`(不能重疊)。',
      steps: ['建表:右邊拿 j 個的和 → j(j = 0..n)', '`for i in 0..n`:`need = x − pre[i]`;`need in suf` 且 `i + suf[need] ≤ n` → 更新答案', '`pre[i] > x` 就停(都是正數,之後只會更大)'],
      figure: { title: `nums = [${A}],x = ${X}`, steps: preFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '一張表加一次掃描。' },
      verdict: '直接照「左拿幾個、右拿幾個」思考,但多用 O(n) 空間。',
      code: {
        python: `def minOperations(nums, x):
    n = len(nums)
    suf, s = {0: 0}, 0
    for j in range(1, n + 1):
        s += nums[n - j]
        suf[s] = j                            # 右邊拿 j 個的和(都是正數,和不會重複)
    best, pre = float('inf'), 0
    for i in range(n + 1):
        if i > 0:
            pre += nums[i - 1]
        if pre > x:
            break
        j = suf.get(x - pre)
        if j is not None and i + j <= n:      # 兩邊不能重疊
            best = min(best, i + j)
    return -1 if best == float('inf') else best`,
        c: `typedef struct { long long key; int j; UT_hash_handle hh; } Entry;

int minOperations(int *nums, int numsSize, int x) {
    int n = numsSize;
    Entry *suf = NULL, *e, *t;
    long long s = 0;
    for (int j = 0; j <= n; j++) {
        if (j > 0) s += nums[n - j];
        e = malloc(sizeof(Entry)); e->key = s; e->j = j;
        HASH_ADD(hh, suf, key, sizeof(long long), e);
    }
    int best = INT_MAX;
    long long pre = 0;
    for (int i = 0; i <= n; i++) {
        if (i > 0) pre += nums[i - 1];
        if (pre > x) break;
        long long need = x - pre;
        HASH_FIND(hh, suf, &need, sizeof(long long), e);
        if (e && i + e->j <= n && i + e->j < best) best = i + e->j;
    }
    HASH_ITER(hh, suf, e, t) { HASH_DEL(suf, e); free(e); }
    return best == INT_MAX ? -1 : best;
}`,
        cpp: `int minOperations(vector<int>& nums, int x) {
    int n = nums.size(), best = INT_MAX;
    unordered_map<long long, int> suf{{0, 0}};
    long long s = 0;
    for (int j = 1; j <= n; j++) { s += nums[n - j]; suf[s] = j; }
    long long pre = 0;
    for (int i = 0; i <= n; i++) {
        if (i > 0) pre += nums[i - 1];
        if (pre > x) break;
        auto it = suf.find(x - pre);
        if (it != suf.end() && i + it->second <= n) best = min(best, i + it->second);
    }
    return best == INT_MAX ? -1 : best;
}`,
        java: `int minOperations(int[] nums, int x) {
    int n = nums.length, best = Integer.MAX_VALUE;
    Map<Long, Integer> suf = new HashMap<>();
    suf.put(0L, 0);
    long s = 0;
    for (int j = 1; j <= n; j++) { s += nums[n - j]; suf.put(s, j); }
    long pre = 0;
    for (int i = 0; i <= n; i++) {
        if (i > 0) pre += nums[i - 1];
        if (pre > x) break;
        Integer j = suf.get(x - pre);
        if (j != null && i + j <= n) best = Math.min(best, i + j);
    }
    return best == Integer.MAX_VALUE ? -1 : best;
}`,
        javascript: `function minOperations(nums, x) {
  const n = nums.length, suf = new Map([[0, 0]]);
  let s = 0;
  for (let j = 1; j <= n; j++) {
    s += nums[n - j];
    suf.set(s, j);
  }
  let best = Infinity, pre = 0;
  for (let i = 0; i <= n; i++) {
    if (i > 0) pre += nums[i - 1];
    if (pre > x) break;
    const j = suf.get(x - pre);
    if (j !== undefined && i + j <= n) best = Math.min(best, i + j);
  }
  return best === Infinity ? -1 : best;
}`,
      },
    },
  ],
  pitfalls: ['用貪心每次拿兩端比較大的:不一定能湊出恰好 x', 'target = 0 時(x 剛好等於總和)中間長度是 0,答案是 n', 'x 比總和還大:target < 0,直接 −1'],
  check: {
    kind: 'fn',
    fn: 'minOperations',
    cases: [
      { args: [[1, 1, 4, 2, 3], 5], out: 2 },
      { args: [[5, 6, 7, 8, 9], 4], out: -1 },
      { args: [A, X], out: 5 },
      { args: [[1, 1], 3], out: -1 },
      { args: [[8828, 9581, 49, 9818, 9974, 9869, 9991, 10000, 10000, 10000, 9999, 9993, 9904, 8819, 1231, 6309], 134365], out: 16 },
    ],
  },
}
