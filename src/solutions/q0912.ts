import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 912. Sort an Array

const A = [5, 2, 3, 1, 4]

function mergeFig(): FigStep[] {
  return [
    { note: '合併排序:把陣列切成兩半,各自排好,再合併。一路切到只剩一個元素', views: [arr([5, 2], { label: '左' }), arr([3, 1, 4], { label: '右' })] },
    { note: '左半 → [2, 5];右半 → [1, 3, 4]。合併:兩個指標各指一邊,每次拿比較小的', views: [arr([2, 5], { label: '左(排好)', pointers: [{ name: 'i', index: 0 }] }), arr([1, 3, 4], { label: '右(排好)', pointers: [{ name: 'j', index: 0, color: 'b' }] })] },
    { note: '1 → 2 → 3 → 4 → 5。每層合併 O(n),共 log n 層 → 穩定的 O(n log n)', views: [arr([1, 2, 3, 4, 5], { label: '結果', done: [0, 1, 2, 3, 4] })] },
  ]
}

function heapFig(): FigStep[] {
  return [
    { note: '堆積排序:先把陣列原地調整成「最大堆積」(每個父節點 ≥ 子節點),最大值在 [0]', views: [arr([5, 4, 3, 1, 2], { label: '建好的最大堆積', highlight: [0] })] },
    { note: '把 [0](最大)和最後一個交換,最大值就定位了;剩下的範圍縮小 1,對新的 [0] 做「下沉」恢復堆積。重複 n − 1 次', views: [arr([4, 2, 3, 1, 5], { label: '一輪之後', done: [4] })] },
    { note: '結果由小到大。O(n log n) 而且 O(1) 額外空間,但不穩定', views: [arr([1, 2, 3, 4, 5], { label: '結果', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q0912: Solution = {
  id: 912,
  plain: '把一個整數陣列由小到大排序,而且**不能用內建的排序函式**,要在 O(n log n) 內完成、盡量少用額外空間。',
  statement: '給整數陣列 `nums`,不使用內建函式,以 O(n log n) 時間、盡可能小的空間將它升序排序並回傳。',
  examples: [
    { input: 'nums = [5,2,3,1]', output: '[1,2,3,5]' },
    { input: 'nums = [5,1,1,2,0,0]', output: '[0,0,1,1,2,5]' },
  ],
  constraints: ['n ≤ 5·10⁴', '值在 −5·10⁴ ~ 5·10⁴'],
  insight: ['O(n log n) 的比較排序:合併、堆積、快速(平均)', '快速排序最壞 O(n²)(測資常有已排序或大量重複的陣列),要隨機選 pivot', '合併排序穩定但要 O(n) 輔助陣列;堆積排序 O(1) 空間但不穩定'],
  approaches: [
    {
      name: '合併排序',
      idea: '`sort(l, r)`:切一半遞迴,再用輔助陣列合併。',
      steps: ['`sort(l, r)`:`l >= r` 就返回', '`m = (l + r) // 2`;`sort(l, m)`、`sort(m + 1, r)`', '兩個指標合併到 tmp,再抄回 nums[l..r]'],
      figure: { title: `nums = [${A}]`, steps: mergeFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每層合併 O(n),log n 層;輔助陣列 O(n)。' },
      verdict: '最推薦:最壞情況也保證 O(n log n),而且穩定。[[p:merge-sort]]的標準模板。',
      code: {
        python: `def sortArray(nums):
    tmp = [0] * len(nums)

    def sort(l, r):
        if l >= r:
            return
        m = (l + r) // 2
        sort(l, m)
        sort(m + 1, r)
        i, j, k = l, m + 1, l
        while i <= m and j <= r:              # 合併兩段排好的
            if nums[i] <= nums[j]:
                tmp[k] = nums[i]; i += 1
            else:
                tmp[k] = nums[j]; j += 1
            k += 1
        while i <= m:
            tmp[k] = nums[i]; i += 1; k += 1
        while j <= r:
            tmp[k] = nums[j]; j += 1; k += 1
        nums[l:r + 1] = tmp[l:r + 1]

    sort(0, len(nums) - 1)
    return nums`,
        c: `static void msort(int *a, int *tmp, int l, int r) {
    if (l >= r) return;
    int m = (l + r) / 2;
    msort(a, tmp, l, m);
    msort(a, tmp, m + 1, r);
    int i = l, j = m + 1, k = l;
    while (i <= m && j <= r) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i <= m) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    memcpy(a + l, tmp + l, (r - l + 1) * sizeof(int));
}

int *sortArray(int *nums, int numsSize, int *returnSize) {
    int *tmp = malloc(numsSize * sizeof(int));
    msort(nums, tmp, 0, numsSize - 1);
    free(tmp);
    *returnSize = numsSize;
    return nums;
}`,
        cpp: `void msort(vector<int> &a, vector<int> &tmp, int l, int r) {
    if (l >= r) return;
    int m = (l + r) / 2;
    msort(a, tmp, l, m);
    msort(a, tmp, m + 1, r);
    int i = l, j = m + 1, k = l;
    while (i <= m && j <= r) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i <= m) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    copy(tmp.begin() + l, tmp.begin() + r + 1, a.begin() + l);
}

vector<int> sortArray(vector<int>& nums) {
    vector<int> tmp(nums.size());
    msort(nums, tmp, 0, nums.size() - 1);
    return nums;
}`,
        java: `int[] sortArray(int[] nums) {
    msort(nums, new int[nums.length], 0, nums.length - 1);
    return nums;
}

private void msort(int[] a, int[] tmp, int l, int r) {
    if (l >= r) return;
    int m = (l + r) / 2;
    msort(a, tmp, l, m);
    msort(a, tmp, m + 1, r);
    int i = l, j = m + 1, k = l;
    while (i <= m && j <= r) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i <= m) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    System.arraycopy(tmp, l, a, l, r - l + 1);
}`,
        javascript: `function sortArray(nums) {
  const tmp = new Array(nums.length);
  const sort = (l, r) => {
    if (l >= r) return;
    const m = (l + r) >> 1;
    sort(l, m);
    sort(m + 1, r);
    let i = l, j = m + 1, k = l;
    while (i <= m && j <= r) tmp[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];
    while (i <= m) tmp[k++] = nums[i++];
    while (j <= r) tmp[k++] = nums[j++];
    for (let t = l; t <= r; t++) nums[t] = tmp[t];
  };
  sort(0, nums.length - 1);
  return nums;
}`,
      },
    },
    {
      name: '堆積排序',
      idea: '原地建最大堆積;重複「把堆頂換到最後、範圍縮小、下沉」。',
      steps: ['`for i in n/2−1..0`:`sift(i, n)`(建堆積)', '`for end in n−1..1`:交換 nums[0] 和 nums[end];`sift(0, end)`', '`sift(i, size)`:和比較大的孩子交換,直到孩子都比自己小'],
      figure: { title: `nums = [${A}]`, steps: heapFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '建堆積 O(n),n 次下沉各 O(log n);原地完成。' },
      verdict: '最省空間的 O(n log n) 排序。不穩定、快取效率較差,實務上通常比合併慢。',
      code: {
        python: `def sortArray(nums):
    n = len(nums)

    def sift(i, size):                        # 讓 i 往下沉,維持最大堆積
        while True:
            big, l, r = i, 2 * i + 1, 2 * i + 2
            if l < size and nums[l] > nums[big]:
                big = l
            if r < size and nums[r] > nums[big]:
                big = r
            if big == i:
                return
            nums[i], nums[big] = nums[big], nums[i]
            i = big

    for i in range(n // 2 - 1, -1, -1):       # 建堆積
        sift(i, n)
    for end in range(n - 1, 0, -1):
        nums[0], nums[end] = nums[end], nums[0]   # 最大的放到最後
        sift(0, end)
    return nums`,
        c: `static void sift(int *a, int i, int size) {
    for (;;) {
        int big = i, l = 2 * i + 1, r = l + 1;
        if (l < size && a[l] > a[big]) big = l;
        if (r < size && a[r] > a[big]) big = r;
        if (big == i) return;
        int t = a[i]; a[i] = a[big]; a[big] = t;
        i = big;
    }
}

int *sortArray(int *nums, int numsSize, int *returnSize) {
    for (int i = numsSize / 2 - 1; i >= 0; i--) sift(nums, i, numsSize);
    for (int end = numsSize - 1; end > 0; end--) {
        int t = nums[0]; nums[0] = nums[end]; nums[end] = t;
        sift(nums, 0, end);
    }
    *returnSize = numsSize;
    return nums;
}`,
        cpp: `void sift(vector<int> &a, int i, int size) {
    for (;;) {
        int big = i, l = 2 * i + 1, r = l + 1;
        if (l < size && a[l] > a[big]) big = l;
        if (r < size && a[r] > a[big]) big = r;
        if (big == i) return;
        swap(a[i], a[big]);
        i = big;
    }
}

vector<int> sortArray(vector<int>& nums) {
    int n = nums.size();
    for (int i = n / 2 - 1; i >= 0; i--) sift(nums, i, n);
    for (int end = n - 1; end > 0; end--) {
        swap(nums[0], nums[end]);
        sift(nums, 0, end);
    }
    return nums;
}`,
        java: `int[] sortArray(int[] nums) {
    int n = nums.length;
    for (int i = n / 2 - 1; i >= 0; i--) sift(nums, i, n);
    for (int end = n - 1; end > 0; end--) {
        int t = nums[0]; nums[0] = nums[end]; nums[end] = t;
        sift(nums, 0, end);
    }
    return nums;
}

private void sift(int[] a, int i, int size) {
    for (;;) {
        int big = i, l = 2 * i + 1, r = l + 1;
        if (l < size && a[l] > a[big]) big = l;
        if (r < size && a[r] > a[big]) big = r;
        if (big == i) return;
        int t = a[i]; a[i] = a[big]; a[big] = t;
        i = big;
    }
}`,
        javascript: `function sortArray(nums) {
  const n = nums.length;
  const sift = (i, size) => {
    for (;;) {
      let big = i;
      const l = 2 * i + 1, r = l + 1;
      if (l < size && nums[l] > nums[big]) big = l;
      if (r < size && nums[r] > nums[big]) big = r;
      if (big === i) return;
      [nums[i], nums[big]] = [nums[big], nums[i]];
      i = big;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
  for (let end = n - 1; end > 0; end--) {
    [nums[0], nums[end]] = [nums[end], nums[0]];
    sift(0, end);
  }
  return nums;
}`,
      },
    },
  ],
  pitfalls: ['快速排序固定選第一個當 pivot:已排序或全部相同的測資會變 O(n²) 超時', '用氣泡 / 插入排序:O(n²),n = 5·10⁴ 會超時', '堆積排序建堆積要從 n/2 − 1 往前,不是從 0 往後'],
  check: {
    kind: 'fn',
    fn: 'sortArray',
    cases: [
      { args: [[5, 2, 3, 1]], out: [1, 2, 3, 5] },
      { args: [[5, 1, 1, 2, 0, 0]], out: [0, 0, 1, 1, 2, 5] },
      { args: [A], out: [1, 2, 3, 4, 5] },
      { args: [[1]], out: [1] },
      { args: [[-4, 0, 7, 4, 9, -5, -1, 0, -7, -1]], out: [-7, -5, -4, -1, -1, 0, 0, 4, 7, 9] },
    ],
  },
}
