import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [1, 2, 3, 6]
const CHECK = {
  python: `
def subsetCheck(nums):
    out = largestDivisibleSubset(nums)
    if len(out) != len(set(out)) or any(x not in nums for x in out):
        return -1
    return len(out) if all(max(a, b) % min(a, b) == 0 for a in out for b in out) else -1`,
  c: `
int subsetCheck(int *nums, int numsSize) {
    int size = 0;
    int *out = largestDivisibleSubset(nums, numsSize, &size);
    for (int i = 0; i < size; i++) {
        int found = 0;
        for (int j = 0; j < numsSize; j++) if (out[i] == nums[j]) found = 1;
        if (!found) return -1;
        for (int j = 0; j < i; j++) {
            if (out[i] == out[j]) return -1;
            int big = out[i] > out[j] ? out[i] : out[j];
            int small = out[i] < out[j] ? out[i] : out[j];
            if (big % small) return -1;
        }
    }
    free(out);
    return size;
}`,
  cpp: `
int subsetCheck(vector<int> nums) {
    vector<int> out = largestDivisibleSubset(nums);
    set<int> used(out.begin(), out.end());
    if (used.size() != out.size()) return -1;
    for (int x : out) if (find(nums.begin(), nums.end(), x) == nums.end()) return -1;
    for (int a : out) for (int b : out) if (max(a, b) % min(a, b)) return -1;
    return out.size();
}`,
  java: `
int subsetCheck(int[] nums) {
    List<Integer> out = largestDivisibleSubset(nums);
    Set<Integer> used = new HashSet<>(out);
    if (used.size() != out.size()) return -1;
    for (int x : out) {
        boolean found = false;
        for (int v : nums) if (x == v) found = true;
        if (!found) return -1;
        for (int y : out) if (Math.max(x, y) % Math.min(x, y) != 0) return -1;
    }
    return out.size();
}`,
  javascript: `
function subsetCheck(nums) {
  const out = largestDivisibleSubset(nums);
  if (new Set(out).size !== out.length) return -1;
  for (const a of out) {
    if (!nums.includes(a)) return -1;
    for (const b of out) if (Math.max(a, b) % Math.min(a, b) !== 0) return -1;
  }
  return out.length;
}`,
}

export const q0368: Solution = {
  id: 368,
  plain: '從一群正整數挑最多個，讓挑出的任兩個數，較大的都能被較小的整除。',
  statement: '給互異正整數 nums，回傳任一個最大的整除子集合。子集合內任兩數 a、b，須有 `a % b == 0` 或 `b % a == 0`。',
  examples: [{ input: 'nums = [1,2,3]', output: '[1,2]', note: '[1,3] 也可以。' }, { input: 'nums = [1,2,3,6]', output: '[1,2,6]', note: '[1,3,6] 也可以。' }],
  constraints: ['長度最多 1000，數值為互異的正整數。'],
  insight: ['先排序，若後一個數能被前一個整除，就能接在該整除鏈後面。', '整除有傳遞性：a 整除 b、b 整除 c，則 a 也整除 c；因此只需檢查新數與鏈尾。', '這類選最長鏈的問題可用 [[p:dp-1d]]。'],
  approaches: [
    {
      name: '排序後由小到大動態規劃',
      idea: '`length[i]` 記以第 i 個數結尾的最長鏈，`prev[i]` 用來回溯答案。',
      steps: ['由小到大排序', '對每個 i，查看所有 j<i 且 `nums[i]%nums[j]==0` 的前驅', '挑長度最大的前驅並記錄', '從最長鏈尾端沿 prev 回溯'],
      figure: { title: 'nums = [1,2,3,6]', steps: [
        { note: '排序後仍是 [1,2,3,6]；每個數單獨都能成長度 1 的鏈。', views: [arr(A, { label: '排序後' }), arr([1, 1, 1, 1], { label: 'length' })] },
        { note: '2 能接在 1 後面，所以以 2 結尾的長度成 2。', views: [arr(A, { highlight: [0, 1] }), arr([1, 2, 1, 1], { label: 'length' })] },
        { note: '3 也能接 1，但不能接 2；以 3 結尾也是長度 2。', views: [arr(A, { highlight: [0, 2] }), arr([1, 2, 2, 1], { label: 'length' })] },
        { note: '6 可接 2 或 3 的長度 2 鏈，選一條回溯得長度 3。', views: [arr(A, { done: [0, 1, 3] }), arr([1, 2, 2, 3], { label: 'length', done: [3] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個數檢查前面所有數，保存長度與前驅。' },
      verdict: '推薦；回溯前驅便能得到一組答案。',
      code: {
        python: `def largestDivisibleSubset(nums):
    nums.sort()
    n = len(nums)
    length = [1] * n
    prev = [-1] * n
    for i in range(n):
        for j in range(i):
            if nums[i] % nums[j] == 0 and length[j] + 1 > length[i]:
                length[i] = length[j] + 1  # 接上更長的整除鏈
                prev[i] = j
    at = max(range(n), key=lambda i: length[i])
    out = []
    while at != -1:
        out.append(nums[at])
        at = prev[at]
    return out[::-1]${CHECK.python}`,
        c: `int *largestDivisibleSubset(int *nums, int numsSize, int *returnSize) {
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[j] < nums[i]) {
                int t = nums[i];
                nums[i] = nums[j];
                nums[j] = t;
            }
        }
    }
    int *len = malloc(numsSize * sizeof(int));
    int *prev = malloc(numsSize * sizeof(int));
    int best = 0;
    for (int i = 0; i < numsSize; i++) {
        len[i] = 1;
        prev[i] = -1;
        for (int j = 0; j < i; j++) {
            if (nums[i] % nums[j] == 0 && len[j] + 1 > len[i]) {
                len[i] = len[j] + 1;
                prev[i] = j;
            }
        }
        if (len[i] > len[best]) best = i;
    }
    *returnSize = len[best];
    int *out = malloc(*returnSize * sizeof(int));
    for (int k = *returnSize - 1; k >= 0; k--) {
        out[k] = nums[best];
        best = prev[best];
    }
    free(len);
    free(prev);
    return out;
}${CHECK.c}`,
        cpp: `vector<int> largestDivisibleSubset(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size(), best = 0;
    vector<int> len(n, 1), prev(n, -1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] % nums[j] == 0 && len[j] + 1 > len[i]) {
                len[i] = len[j] + 1;
                prev[i] = j;
            }
        }
        if (len[i] > len[best]) best = i;
    }
    vector<int> out;
    for (int i = best; i >= 0; i = prev[i]) out.push_back(nums[i]);
    reverse(out.begin(), out.end());
    return out;
}${CHECK.cpp}`,
        java: `List<Integer> largestDivisibleSubset(int[] nums) {
    Arrays.sort(nums);
    int n = nums.length, best = 0;
    int[] len = new int[n], prev = new int[n];
    Arrays.fill(len, 1);
    Arrays.fill(prev, -1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] % nums[j] == 0 && len[j] + 1 > len[i]) {
                len[i] = len[j] + 1;
                prev[i] = j;
            }
        }
        if (len[i] > len[best]) best = i;
    }
    List<Integer> out = new ArrayList<>();
    for (int i = best; i >= 0; i = prev[i]) out.add(nums[i]);
    Collections.reverse(out);
    return out;
}${CHECK.java}`,
        javascript: `function largestDivisibleSubset(nums) {
  nums.sort((a, b) => a - b);
  const n = nums.length, len = new Array(n).fill(1), prev = new Array(n).fill(-1);
  let best = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[i] % nums[j] === 0 && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        prev[i] = j;
      }
    }
    if (len[i] > len[best]) best = i;
  }
  const out = [];
  for (let i = best; i >= 0; i = prev[i]) out.push(nums[i]);
  return out.reverse();
}${CHECK.javascript}`,
      },
    },
    {
      name: '排序後從大到小動態規劃',
      idea: '`length[i]` 改記從第 i 個數開始的最長鏈，`next[i]` 指向下一個數。',
      steps: ['排序後從右往左處理', '每個 i 查看所有 j>i 且 `nums[j]%nums[i]==0`', '挑最長的後續鏈，記錄 next', '從最佳開頭沿 next 還原'],
      figure: { title: 'nums = [1,2,3,6]', steps: [
        { note: '從最大的 6 開始，它單獨成長度 1 的鏈。', views: [arr(A, { highlight: [3] }), arr([1], { label: '從 6 開始' })] },
        { note: '3 能接 6，所以從 3 開始長度 2。', views: [arr(A, { highlight: [2, 3] }), arr([2], { label: '從 3 開始' })] },
        { note: '2 也能接 6，從 2 開始同樣長度 2。', views: [arr(A, { highlight: [1, 3] }), arr([2], { label: '從 2 開始' })] },
        { note: '1 可接在長度 2 的鏈前面，得到 1→2→6 或 1→3→6。', views: [arr(A, { done: [0, 1, 3] }), arr([3], { label: '答案長度', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每對排序後的數字最多比較一次。' },
      verdict: '與前一種方向相反，適合體會 DP 狀態如何選定。',
      code: {
        python: `def largestDivisibleSubset(nums):
    nums.sort()
    n = len(nums)
    length = [1] * n
    next_index = [-1] * n
    for i in range(n - 1, -1, -1):
        for j in range(i + 1, n):
            if nums[j] % nums[i] == 0 and length[j] + 1 > length[i]:
                length[i] = length[j] + 1  # 把較長的鏈接在後面
                next_index[i] = j
    at = max(range(n), key=lambda i: length[i])
    out = []
    while at != -1:
        out.append(nums[at])
        at = next_index[at]
    return out${CHECK.python}`,
        c: `static int cmpSubset(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int *largestDivisibleSubset(int *nums, int numsSize, int *returnSize) {
    qsort(nums, numsSize, sizeof(int), cmpSubset);
    int *len = malloc(numsSize * sizeof(int));
    int *next = malloc(numsSize * sizeof(int));
    for (int i = numsSize - 1; i >= 0; i--) {
        len[i] = 1;
        next[i] = -1;
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[j] % nums[i] == 0 && len[j] + 1 > len[i]) {
                len[i] = len[j] + 1;
                next[i] = j;
            }
        }
    }
    int best = 0;
    for (int i = 1; i < numsSize; i++) if (len[i] > len[best]) best = i;
    *returnSize = len[best];
    int *out = malloc(*returnSize * sizeof(int));
    for (int k = 0; k < *returnSize; k++) {
        out[k] = nums[best];
        best = next[best];
    }
    free(len);
    free(next);
    return out;
}${CHECK.c}`,
        cpp: `vector<int> largestDivisibleSubset(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<int> len(n, 1), next(n, -1);
    for (int i = n - 1; i >= 0; i--) {
        for (int j = i + 1; j < n; j++) {
            if (nums[j] % nums[i] == 0 && len[j] + 1 > len[i]) {
                len[i] = len[j] + 1;
                next[i] = j;
            }
        }
    }
    int best = max_element(len.begin(), len.end()) - len.begin();
    vector<int> out;
    for (int i = best; i >= 0; i = next[i]) out.push_back(nums[i]);
    return out;
}${CHECK.cpp}`,
        java: `List<Integer> largestDivisibleSubset(int[] nums) {
    Arrays.sort(nums);
    int n = nums.length;
    int[] len = new int[n], next = new int[n];
    Arrays.fill(len, 1);
    Arrays.fill(next, -1);
    for (int i = n - 1; i >= 0; i--) {
        for (int j = i + 1; j < n; j++) {
            if (nums[j] % nums[i] == 0 && len[j] + 1 > len[i]) {
                len[i] = len[j] + 1;
                next[i] = j;
            }
        }
    }
    int best = 0;
    for (int i = 1; i < n; i++) if (len[i] > len[best]) best = i;
    List<Integer> out = new ArrayList<>();
    for (int i = best; i >= 0; i = next[i]) out.add(nums[i]);
    return out;
}${CHECK.java}`,
        javascript: `function largestDivisibleSubset(nums) {
  nums.sort((a, b) => a - b);
  const n = nums.length, len = new Array(n).fill(1), next = new Array(n).fill(-1);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) {
      if (nums[j] % nums[i] === 0 && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        next[i] = j;
      }
    }
  }
  let best = 0;
  for (let i = 1; i < n; i++) if (len[i] > len[best]) best = i;
  const out = [];
  for (let i = best; i >= 0; i = next[i]) out.push(nums[i]);
  return out;
}${CHECK.javascript}`,
      },
    },
  ],
  pitfalls: ['子集合不一定唯一，不能只比較某個固定陣列。', '先排序才有「整除鏈」由小到大的方向；輸入順序不可直接用。'],
  check: { kind: 'fn', fn: 'subsetCheck', cases: [
    { args: [[1, 2, 3]], out: 2 },
    { args: [A], out: 3 },
    { args: [[1, 2, 4, 8]], out: 4 },
  ] },
}
