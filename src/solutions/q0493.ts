import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [2, 4, 3, 5, 1]

export const q0493: Solution = {
  id: 493,
  plain: '數有多少組左邊數字比右邊數字的兩倍還大；順序必須是左邊索引較小。',
  statement: '給整數陣列 nums，計算滿足 `i < j` 且 `nums[i] > 2 × nums[j]` 的索引對數量。',
  examples: [{ input: 'nums = [1,3,2,3,1]', output: '2' }, { input: 'nums = [2,4,3,5,1]', output: '3' }],
  constraints: ['長度最多 5×10⁴，數值可能是 32 位元整數的極值；乘 2 時須使用較大的整數型別。'],
  insight: ['直接檢查每一對最容易想到，但 O(n²) 太慢。', '合併排序時，左右半邊各已排序；對每個左值，符合條件的右值是一段前綴。', '計數指標只會向右走，然後再正常合併；這是 [[p:merge-sort]] 的延伸。'],
  approaches: [
    {
      name: '兩層迴圈逐對檢查',
      idea: '固定左索引 i，遍歷所有更右邊的 j。',
      steps: ['答案從 0 開始', '對每個 i，讓 j 從 i+1 走到尾端', '符合嚴格大於條件就加 1'],
      figure: { title: 'nums = [2,4,3,5,1]', steps: [
        { note: '固定 2：右邊只有 1 可能接近，但 2 並不大於 2×1，所以沒有配對。', views: [arr(A, { highlight: [0, 4] }), arr([0], { label: '累計' })] },
        { note: '固定 4：與最後的 1 配對，4 > 2，累計 1。', views: [arr(A, { highlight: [1, 4] }), arr([1], { label: '累計' })] },
        { note: '固定 3：與最後的 1 配對，3 > 2，累計 2。', views: [arr(A, { highlight: [2, 4] }), arr([2], { label: '累計' })] },
        { note: '固定 5：與最後的 1 配對，5 > 2，累計 3。', views: [arr(A, { highlight: [3, 4] }), arr([3], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '檢查 n(n−1)/2 對。' },
      verdict: '適合驗算小範例；大輸入應改用合併排序。',
      code: {
        python: `def reversePairs(nums):
    ans = 0
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] > 2 * nums[j]:
                ans += 1  # i 必須在 j 左邊
    return ans`,
        c: `int reversePairs(int *nums, int numsSize) {
    int ans = 0;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if ((long long)nums[i] > 2LL * nums[j]) ans++;
        }
    }
    return ans;
}`,
        cpp: `int reversePairs(vector<int>& nums) {
    int ans = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        for (int j = i + 1; j < (int)nums.size(); j++) {
            if ((long long)nums[i] > 2LL * nums[j]) ans++;
        }
    }
    return ans;
}`,
        java: `int reversePairs(int[] nums) {
    int ans = 0;
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if ((long) nums[i] > 2L * nums[j]) ans++;
        }
    }
    return ans;
}`,
        javascript: `function reversePairs(nums) {
  let ans = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > 2 * nums[j]) ans++;
    }
  }
  return ans;
}`,
      },
    },
    {
      name: '合併排序時計跨半區對數',
      idea: '兩半已排序時，每個左值對應的合法右值形成前綴；計數後再合併。',
      steps: ['遞迴排序左右半邊並取得內部對數', '對每個左值，把右指標推到首個不符合條件的位置', '加入右半起點到指標前的個數', '正常合併兩個已排序半邊'],
      figure: { title: 'nums = [2,4,3,5,1]', steps: [
        { note: '先拆成 [2,4] 與 [3,5,1]；每一半都先計數並排序。', views: [arr([2, 4], { label: '左半' }), arr([3, 5, 1], { label: '右半' })] },
        { note: '左半 [2,4] 中沒有合法對，本來就已排序。', views: [arr([2, 4], { label: '左半已排序', done: [0, 1] })] },
        { note: '右半內部找到 (5,1)、(3,1) 共 2 對，排序成 [1,3,5]。', views: [arr([1, 3, 5], { label: '右半已排序', done: [0, 1, 2] })] },
        { note: '跨半區只有 4 > 2×1 這 1 對；合計 0+2+1=3，合併成 [1,2,3,4,5]。', views: [arr([2, 4], { label: '左半已排序', highlight: [1] }), arr([1, 3, 5], { label: '右半已排序', highlight: [0] }), arr([1, 2, 3, 4, 5], { label: '合併結果', done: [0, 1, 2, 3, 4] }), arr([3], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '每層用線性時間計數與合併，共 log n 層。' },
      verdict: '推薦；重點是先數跨半區配對，再覆寫排序資料。',
      code: {
        python: `def reversePairs(nums):
    temp = [0] * len(nums)

    def sort(lo, hi):
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        count = sort(lo, mid) + sort(mid, hi)
        j = mid
        for i in range(lo, mid):
            while j < hi and nums[i] > 2 * nums[j]:
                j += 1
            count += j - mid  # 右半合法值是一段前綴
        i, j, k = lo, mid, lo
        while i < mid and j < hi:
            if nums[i] <= nums[j]:
                temp[k] = nums[i]
                i += 1
            else:
                temp[k] = nums[j]
                j += 1
            k += 1
        while i < mid:
            temp[k] = nums[i]
            i += 1
            k += 1
        while j < hi:
            temp[k] = nums[j]
            j += 1
            k += 1
        nums[lo:hi] = temp[lo:hi]
        return count

    return sort(0, len(nums))`,
        c: `static int countMerge(int *a, int *tmp, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = lo + (hi - lo) / 2;
    int ans = countMerge(a, tmp, lo, mid) + countMerge(a, tmp, mid, hi);
    int j = mid;
    for (int i = lo; i < mid; i++) {
        while (j < hi && (long long)a[i] > 2LL * a[j]) j++;
        ans += j - mid;
    }
    int i = lo, k = lo;
    j = mid;
    while (i < mid && j < hi) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else tmp[k++] = a[j++];
    }
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    for (k = lo; k < hi; k++) a[k] = tmp[k];
    return ans;
}

int reversePairs(int *nums, int numsSize) {
    int *tmp = malloc(numsSize * sizeof(int));
    int ans = countMerge(nums, tmp, 0, numsSize);
    free(tmp);
    return ans;
}`,
        cpp: `int reversePairs(vector<int>& nums) {
    vector<int> tmp(nums.size());
    function<int(int, int)> solve = [&](int lo, int hi) {
        if (hi - lo <= 1) return 0;
        int mid = lo + (hi - lo) / 2;
        int ans = solve(lo, mid) + solve(mid, hi);
        int j = mid;
        for (int i = lo; i < mid; i++) {
            while (j < hi && (long long)nums[i] > 2LL * nums[j]) j++;
            ans += j - mid;
        }
        int i = lo, k = lo;
        j = mid;
        while (i < mid && j < hi) {
            tmp[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];
        }
        while (i < mid) tmp[k++] = nums[i++];
        while (j < hi) tmp[k++] = nums[j++];
        for (int t = lo; t < hi; t++) nums[t] = tmp[t];
        return ans;
    };
    return solve(0, nums.size());
}`,
        java: `int reversePairs(int[] nums) {
    int[] temp = new int[nums.length];
    return countMerge(nums, temp, 0, nums.length);
}

int countMerge(int[] a, int[] temp, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = lo + (hi - lo) / 2;
    int ans = countMerge(a, temp, lo, mid) + countMerge(a, temp, mid, hi);
    int j = mid;
    for (int i = lo; i < mid; i++) {
        while (j < hi && (long) a[i] > 2L * a[j]) j++;
        ans += j - mid;
    }
    int i = lo, k = lo;
    j = mid;
    while (i < mid && j < hi) {
        temp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    }
    while (i < mid) temp[k++] = a[i++];
    while (j < hi) temp[k++] = a[j++];
    for (int t = lo; t < hi; t++) a[t] = temp[t];
    return ans;
}`,
        javascript: `function reversePairs(nums) {
  const temp = new Array(nums.length);
  function solve(lo, hi) {
    if (hi - lo <= 1) return 0;
    const mid = Math.floor((lo + hi) / 2);
    let ans = solve(lo, mid) + solve(mid, hi);
    let j = mid;
    for (let i = lo; i < mid; i++) {
      while (j < hi && nums[i] > 2 * nums[j]) j++;
      ans += j - mid;
    }
    let i = lo, k = lo;
    j = mid;
    while (i < mid && j < hi) {
      temp[k++] = nums[i] <= nums[j] ? nums[i++] : nums[j++];
    }
    while (i < mid) temp[k++] = nums[i++];
    while (j < hi) temp[k++] = nums[j++];
    for (let t = lo; t < hi; t++) nums[t] = temp[t];
    return ans;
  }
  return solve(0, nums.length);
}`,
      },
    },
  ],
  pitfalls: ['比較是嚴格大於，等於兩倍不能算。', 'C、C++、Java 的整數乘 2 要先提升成較寬型別；負數也可能溢位。', '合併排序需先數配對再覆寫兩半。'],
  check: { kind: 'fn', fn: 'reversePairs', cases: [
    { args: [[1, 3, 2, 3, 1]], out: 2 },
    { args: [A], out: 3 },
    { args: [[2147483647, -2147483648]], out: 1 },
    { args: [[2, 1]], out: 0 },
  ] },
}
