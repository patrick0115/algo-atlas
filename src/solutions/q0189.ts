import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 189. Rotate Array

const A = [1, 2, 3, 4, 5, 6, 7]
const K = 3

function copyFig(): FigStep[] {
  const n = A.length
  const res = Array(n).fill('')
  A.forEach((v, i) => (res[(i + K) % n] = v))
  return [
    { note: `往右轉 ${K} 格 = 每個數從位置 i 搬到 (i + ${K}) mod ${n}。開一個新陣列照這個規則放`, views: [arr(A, { label: 'nums', highlight: [n - K, n - K + 1, n - K + 2] }), arr(Array(n).fill(''), { label: '新陣列' })] },
    { note: `例如最後 ${K} 個 ${A.slice(n - K)} 繞回最前面;其他往後移 ${K} 格。最後抄回 nums → [${res}]`, views: [arr(res, { label: '新陣列', highlight: [0, 1, 2] })] },
  ]
}

function revFig(): FigStep[] {
  const n = A.length
  const a = [...A]
  const rev = (l: number, r: number) => {
    for (; l < r; l++, r--) [a[l], a[r]] = [a[r], a[l]]
  }
  const out: FigStep[] = [{ note: `轉完的結果是「後 ${K} 個 + 前 ${n - K} 個」。用三次反轉就能原地做到`, views: [arr([...a], { label: 'nums', range: [n - K, n - 1] })] }]
  rev(0, n - 1)
  out.push({ note: '① 整個反轉:後面那段跑到前面了,但兩段內部都是反的', views: [arr([...a], { label: '整個反轉', highlight: a.map((_, i) => i) })] })
  rev(0, K - 1)
  out.push({ note: `② 反轉前 ${K} 個,轉回正確順序`, views: [arr([...a], { label: `反轉 [0, ${K - 1}]`, highlight: Array.from({ length: K }, (_, i) => i) })] })
  rev(K, n - 1)
  out.push({ note: `③ 反轉後 ${n - K} 個 → [${a}],完成`, views: [arr([...a], { label: `反轉 [${K}, ${n - 1}]`, highlight: Array.from({ length: n - K }, (_, i) => K + i), done: Array.from({ length: K }, (_, i) => i) })] })
  return out
}

export const q0189: Solution = {
  id: 189,
  plain: '一排人往右挪 k 個位置,最右邊被擠出去的人繞回最左邊排隊。例如 [1..7] 往右轉 3 格,變成 [5,6,7,1,2,3,4]。',
  statement: '給陣列 `nums`,**原地**向右旋轉 k 步(k ≥ 0)。Follow-up:O(1) 額外空間。',
  examples: [
    { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]' },
    { input: 'nums = [-1,-100,3,99], k = 2', output: '[3,99,-1,-100]' },
  ],
  constraints: ['n ≤ 10⁵', 'k ≤ 10⁵ → k 可能比 n 大,先 `k %= n`'],
  insight: ['轉 n 圈等於沒轉 → `k %= n`', '位置 i 的數會到 `(i + k) % n` → 開新陣列很簡單', '原地:結果 = 「後 k 個」+「前 n−k 個」→ 整個反轉,再各自反轉兩段'],
  approaches: [
    {
      name: '額外陣列',
      idea: '`res[(i + k) % n] = nums[i]`,再抄回 nums。',
      steps: ['`k %= n`', '`res[(i + k) % n] = nums[i]`', '`nums[:] = res`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: copyFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多一個陣列。' },
      verdict: '最直接,先寫這個確認索引公式。',
      code: {
        python: `def rotate(nums, k):
    n = len(nums)
    res = [0] * n
    for i, v in enumerate(nums):
        res[(i + k) % n] = v                  # 位置 i 的數往右移 k 格(繞回開頭)
    nums[:] = res                             # 寫回原陣列(不是讓 nums 指向新串列)`,
        c: `void rotate(int *nums, int numsSize, int k) {
    int n = numsSize, *res = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) res[(i + k) % n] = nums[i];
    memcpy(nums, res, n * sizeof(int));
    free(res);
}`,
        cpp: `void rotate(vector<int>& nums, int k) {
    int n = nums.size();
    vector<int> res(n);
    for (int i = 0; i < n; i++) res[(i + k) % n] = nums[i];
    nums = res;
}`,
        java: `void rotate(int[] nums, int k) {
    int n = nums.length;
    int[] res = new int[n];
    for (int i = 0; i < n; i++) res[(i + k) % n] = nums[i];
    System.arraycopy(res, 0, nums, 0, n);
}`,
        javascript: `function rotate(nums, k) {
  const n = nums.length, res = new Array(n);
  nums.forEach((v, i) => (res[(i + k) % n] = v));
  res.forEach((v, i) => (nums[i] = v));
}`,
      },
    },
    {
      name: '三次反轉',
      idea: '`k %= n`;反轉整個、反轉 `[0, k−1]`、反轉 `[k, n−1]`。',
      steps: ['`k %= n`', '`reverse(0, n − 1)`', '`reverse(0, k − 1)`', '`reverse(k, n − 1)`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: revFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每個元素被交換約兩次。' },
      verdict: '最推薦(Follow-up 的答案)。「把兩段對調」都可以用三次反轉,字串左旋也是同一招。',
      code: {
        python: `def rotate(nums, k):
    n = len(nums)
    k %= n

    def rev(l, r):
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1
            r -= 1

    rev(0, n - 1)                             # 後 k 個跑到前面,但順序是反的
    rev(0, k - 1)                             # 把前 k 個轉正
    rev(k, n - 1)                             # 把後 n-k 個轉正`,
        c: `static void rev(int *a, int l, int r) {
    for (; l < r; l++, r--) { int t = a[l]; a[l] = a[r]; a[r] = t; }
}

void rotate(int *nums, int numsSize, int k) {
    k %= numsSize;
    rev(nums, 0, numsSize - 1);
    rev(nums, 0, k - 1);
    rev(nums, k, numsSize - 1);
}`,
        cpp: `void rotate(vector<int>& nums, int k) {
    k %= nums.size();
    reverse(nums.begin(), nums.end());
    reverse(nums.begin(), nums.begin() + k);
    reverse(nums.begin() + k, nums.end());
}`,
        java: `void rotate(int[] nums, int k) {
    int n = nums.length;
    k %= n;
    rev(nums, 0, n - 1);
    rev(nums, 0, k - 1);
    rev(nums, k, n - 1);
}

private void rev(int[] a, int l, int r) {
    for (; l < r; l++, r--) { int t = a[l]; a[l] = a[r]; a[r] = t; }
}`,
        javascript: `function rotate(nums, k) {
  const n = nums.length;
  k %= n;
  const rev = (l, r) => {
    for (; l < r; l++, r--) [nums[l], nums[r]] = [nums[r], nums[l]];
  };
  rev(0, n - 1);
  rev(0, k - 1);
  rev(k, n - 1);
}`,
      },
    },
  ],
  pitfalls: ['忘了 `k %= n`:k > n 時索引會超出範圍', 'Python 寫 `nums = nums[-k:] + nums[:-k]`:只改了區域變數;而且 k = 0 時 `nums[-0:]` 是整個陣列'],
  check: {
    kind: 'fn',
    fn: 'rotate',
    inplace: 0,
    cases: [
      { args: [A, K], out: [5, 6, 7, 1, 2, 3, 4] },
      { args: [[-1, -100, 3, 99], 2], out: [3, 99, -1, -100] },
      { args: [[1, 2], 5], out: [2, 1] },
      { args: [[1], 0], out: [1] },
      { args: [[1, 2, 3], 3], out: [1, 2, 3] },
    ],
  },
}
