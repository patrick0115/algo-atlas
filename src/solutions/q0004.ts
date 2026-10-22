import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 4. Median of Two Sorted Arrays

const A = [1, 3, 8, 9, 15]
const B = [7, 11, 18, 19, 21, 25]

function mergeFig(): FigStep[] {
  const merged = [...A, ...B].sort((x, y) => x - y)
  const n = merged.length
  const mid = n % 2 ? [n >> 1] : [n / 2 - 1, n / 2]
  return [
    { note: '最直接:像合併排序那樣把兩個陣列合併成一個排序好的陣列,中位數就是正中間那個(偶數個就是中間兩個的平均)', views: [arr(A, { label: 'A' }), arr(B, { label: 'B' })] },
    { note: `合併後共 ${n} 個,中位數是第 ${mid.map((i) => i + 1).join('、')} 小的數 = ${mid.map((i) => merged[i]).join('、')}`, views: [arr(merged, { label: '合併', highlight: mid })] },
    { note: '其實不用真的存下來:用兩個指針往前走到第 (m+n)/2 個就可以停 → O(m + n) 時間、O(1) 空間', views: [arr(merged, { label: '只走到一半', done: range(0, mid[mid.length - 1]), dim: range(mid[mid.length - 1] + 1, n - 1) })] },
  ]
}

function cutFig(): FigStep[] {
  const m = A.length
  const n = B.length
  const half = Math.floor((m + n + 1) / 2)
  let lo = 0
  let hi = m
  const out: FigStep[] = [
    {
      note: `換個角度:中位數把所有數切成「左半」和「右半」,左半 ${half} 個、右半 ${m + n - half} 個,而且左半全部 ≤ 右半。如果 A 切在 i(A 的前 i 個在左半),B 就一定切在 j = ${half} − i`,
      views: [arr(A, { label: 'A(短的那個)' }), arr(B, { label: 'B' })],
    },
  ]
  while (lo <= hi) {
    const i = (lo + hi) >> 1
    const j = half - i
    const aL = i > 0 ? A[i - 1] : -Infinity
    const aR = i < m ? A[i] : Infinity
    const bL = j > 0 ? B[j - 1] : -Infinity
    const bR = j < n ? B[j] : Infinity
    const f = (v: number) => (v === Infinity ? '+∞' : v === -Infinity ? '−∞' : String(v))
    const views = [arr(A, { label: `A:切在 i = ${i}`, highlight: range(0, i - 1), dim: range(i, m - 1) }), arr(B, { label: `B:切在 j = ${j}`, highlight: range(0, j - 1), dim: range(j, n - 1) })]
    if (aL > bR) {
      out.push({ note: `A 左邊最大 ${f(aL)} > B 右邊最小 ${f(bR)}:A 切太多了 → i 往左(hi = i − 1)`, views })
      hi = i - 1
    } else if (bL > aR) {
      out.push({ note: `B 左邊最大 ${f(bL)} > A 右邊最小 ${f(aR)}:A 切太少了 → i 往右(lo = i + 1)`, views })
      lo = i + 1
    } else {
      const left = Math.max(aL, bL)
      const right = Math.min(aR, bR)
      out.push({ note: `${f(aL)} ≤ ${f(bR)} 而且 ${f(bL)} ≤ ${f(aR)}:切對了!總共 ${m + n} 個(${(m + n) % 2 ? '奇數' : '偶數'})→ 中位數 = ${(m + n) % 2 ? `左半最大 = ${left}` : `(${left} + ${right}) / 2 = ${(left + right) / 2}`}`, views })
      break
    }
  }
  return out
}

export const q0004: Solution = {
  id: 4,
  plain: '兩個已經由小到大排好的陣列,找出把它們合在一起之後的「中位數」(排在正中間的數;偶數個就取中間兩個的平均)。難的是要求 O(log(m+n)) —— 不能真的合併。',
  statement: '給兩個已排序的陣列 `nums1`(長度 m)和 `nums2`(長度 n),回傳兩者合併後的**中位數**。整體時間複雜度要求 O(log(m + n))。',
  examples: [
    { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0' },
    { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5' },
  ],
  constraints: ['`0 ≤ m, n ≤ 1000`,`m + n ≥ 1`'],
  insight: [
    '合併再取中間:O(m + n),可以過,但不符合題目要求',
    '中位數的本質是一條「切線」:左半和右半數量相等(或左邊多一個),而且左半最大 ≤ 右半最小',
    '只要決定 A 切在哪(i),B 的切點就跟著決定(j = 總數的一半 − i)',
    '檢查 `A[i−1] ≤ B[j]` 且 `B[j−1] ≤ A[i]`;不成立就知道 i 該往哪邊移 → **對 i 二分搜尋**,在比較短的陣列上做 → O(log min(m, n))',
  ],
  approaches: [
    {
      name: '雙指針合併到一半',
      idea: '兩個指針像合併排序那樣往前走,走到第 `(m+n)/2` 個時停下,記住最後兩個走過的數。',
      steps: ['`i = j = 0`,`prev = cur = 0`', '走 `(m+n)//2 + 1` 步:每步取比較小的那邊,`prev = cur`、`cur = 取到的數`', '奇數 → cur;偶數 → `(prev + cur) / 2`'],
      figure: { title: `A = [${A}],B = [${B}]`, steps: mergeFig() },
      complexity: { time: 'O(m + n)', space: 'O(1)', why: '最多走 (m+n)/2 + 1 步。' },
      verdict: '容易寫對,實際上也很快;但不符合 O(log) 的要求。',
      code: {
        python: `def findMedianSortedArrays(nums1, nums2):
    m, n = len(nums1), len(nums2)
    i = j = 0
    prev = cur = 0
    for _ in range((m + n) // 2 + 1):
        prev = cur
        if j >= n or (i < m and nums1[i] <= nums2[j]):
            cur = nums1[i]
            i += 1
        else:
            cur = nums2[j]
            j += 1
    return float(cur) if (m + n) % 2 else (prev + cur) / 2`,
        c: `double findMedianSortedArrays(int *nums1, int nums1Size, int *nums2, int nums2Size) {
    int m = nums1Size, n = nums2Size, i = 0, j = 0, prev = 0, cur = 0;
    for (int k = 0; k <= (m + n) / 2; k++) {
        prev = cur;
        if (j >= n || (i < m && nums1[i] <= nums2[j])) cur = nums1[i++];
        else cur = nums2[j++];
    }
    return (m + n) % 2 ? cur : (prev + cur) / 2.0;
}`,
        cpp: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    int m = nums1.size(), n = nums2.size(), i = 0, j = 0, prev = 0, cur = 0;
    for (int k = 0; k <= (m + n) / 2; k++) {
        prev = cur;
        if (j >= n || (i < m && nums1[i] <= nums2[j])) cur = nums1[i++];
        else cur = nums2[j++];
    }
    return (m + n) % 2 ? cur : (prev + cur) / 2.0;
}`,
        java: `double findMedianSortedArrays(int[] nums1, int[] nums2) {
    int m = nums1.length, n = nums2.length, i = 0, j = 0, prev = 0, cur = 0;
    for (int k = 0; k <= (m + n) / 2; k++) {
        prev = cur;
        if (j >= n || (i < m && nums1[i] <= nums2[j])) cur = nums1[i++];
        else cur = nums2[j++];
    }
    return (m + n) % 2 == 1 ? cur : (prev + cur) / 2.0;
}`,
        javascript: `function findMedianSortedArrays(nums1, nums2) {
  const m = nums1.length, n = nums2.length;
  let i = 0, j = 0, prev = 0, cur = 0;
  for (let k = 0; k <= (m + n) >> 1; k++) {
    prev = cur;
    if (j >= n || (i < m && nums1[i] <= nums2[j])) cur = nums1[i++];
    else cur = nums2[j++];
  }
  return (m + n) % 2 ? cur : (prev + cur) / 2;
}`,
      },
    },
    {
      name: '在短陣列上二分切點',
      idea: '讓 A 是短的。二分 `i ∈ [0, m]`,`j = (m+n+1)/2 − i`。`A[i−1] > B[j]` → i 太大;`B[j−1] > A[i]` → i 太小;都不是就找到了。',
      steps: ['確保 `len(A) <= len(B)`', '`lo, hi = 0, m`;`half = (m + n + 1) // 2`', '`i = (lo+hi)//2`,`j = half − i`;邊界外用 ±∞', '`A[i−1] > B[j]` → `hi = i − 1`;`B[j−1] > A[i]` → `lo = i + 1`', '否則:奇數回傳 `max(A[i−1], B[j−1])`,偶數再和 `min(A[i], B[j])` 平均'],
      figure: { title: `A = [${A}],B = [${B}]`, steps: cutFig() },
      complexity: { time: 'O(log min(m, n))', space: 'O(1)', why: '只在短的陣列上二分。' },
      verdict: '題目要求的解,[[p:binary-search]]最難的經典題之一。用 ±∞ 處理切在最邊邊的情況,程式就不用一堆特例。',
      code: {
        python: `def findMedianSortedArrays(nums1, nums2):
    A, B = nums1, nums2
    if len(A) > len(B):
        A, B = B, A                           # 在短的上面二分
    m, n = len(A), len(B)
    half = (m + n + 1) // 2                   # 左半的數量(奇數時左邊多一個)
    lo, hi = 0, m
    INF = float('inf')
    while lo <= hi:
        i = (lo + hi) // 2                    # A 的前 i 個放左半
        j = half - i                          # B 的前 j 個放左半
        aL = A[i - 1] if i > 0 else -INF
        aR = A[i] if i < m else INF
        bL = B[j - 1] if j > 0 else -INF
        bR = B[j] if j < n else INF
        if aL > bR:
            hi = i - 1                        # A 放太多到左半
        elif bL > aR:
            lo = i + 1                        # A 放太少
        else:
            if (m + n) % 2:
                return float(max(aL, bL))
            return (max(aL, bL) + min(aR, bR)) / 2`,
        c: `double findMedianSortedArrays(int *nums1, int nums1Size, int *nums2, int nums2Size) {
    if (nums1Size > nums2Size) return findMedianSortedArrays(nums2, nums2Size, nums1, nums1Size);
    int *A = nums1, *B = nums2, m = nums1Size, n = nums2Size;
    int half = (m + n + 1) / 2, lo = 0, hi = m;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        int aL = i > 0 ? A[i - 1] : INT_MIN, aR = i < m ? A[i] : INT_MAX;
        int bL = j > 0 ? B[j - 1] : INT_MIN, bR = j < n ? B[j] : INT_MAX;
        if (aL > bR) hi = i - 1;
        else if (bL > aR) lo = i + 1;
        else {
            int left = aL > bL ? aL : bL;
            if ((m + n) % 2) return left;
            int right = aR < bR ? aR : bR;
            return (left + (double)right) / 2;
        }
    }
    return 0;
}`,
        cpp: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
    vector<int>& A = nums1; vector<int>& B = nums2;
    int m = A.size(), n = B.size(), half = (m + n + 1) / 2, lo = 0, hi = m;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        int aL = i > 0 ? A[i - 1] : INT_MIN, aR = i < m ? A[i] : INT_MAX;
        int bL = j > 0 ? B[j - 1] : INT_MIN, bR = j < n ? B[j] : INT_MAX;
        if (aL > bR) hi = i - 1;
        else if (bL > aR) lo = i + 1;
        else {
            int left = max(aL, bL);
            if ((m + n) % 2) return left;
            return (left + (double)min(aR, bR)) / 2;
        }
    }
    return 0;
}`,
        java: `double findMedianSortedArrays(int[] nums1, int[] nums2) {
    if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
    int[] A = nums1, B = nums2;
    int m = A.length, n = B.length, half = (m + n + 1) / 2, lo = 0, hi = m;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        int aL = i > 0 ? A[i - 1] : Integer.MIN_VALUE, aR = i < m ? A[i] : Integer.MAX_VALUE;
        int bL = j > 0 ? B[j - 1] : Integer.MIN_VALUE, bR = j < n ? B[j] : Integer.MAX_VALUE;
        if (aL > bR) hi = i - 1;
        else if (bL > aR) lo = i + 1;
        else {
            int left = Math.max(aL, bL);
            if ((m + n) % 2 == 1) return left;
            return (left + (double) Math.min(aR, bR)) / 2;
        }
    }
    return 0;
}`,
        javascript: `function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) [nums1, nums2] = [nums2, nums1];
  const A = nums1, B = nums2, m = A.length, n = B.length, half = (m + n + 1) >> 1;
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1, j = half - i;
    const aL = i > 0 ? A[i - 1] : -Infinity, aR = i < m ? A[i] : Infinity;
    const bL = j > 0 ? B[j - 1] : -Infinity, bR = j < n ? B[j] : Infinity;
    if (aL > bR) hi = i - 1;
    else if (bL > aR) lo = i + 1;
    else return (m + n) % 2 ? Math.max(aL, bL) : (Math.max(aL, bL) + Math.min(aR, bR)) / 2;
  }
}`,
      },
    },
  ],
  pitfalls: [
    '在長的陣列上二分:j = half − i 可能變成負數或超過 n',
    '切在最邊邊(i = 0 或 i = m)時直接取 A[i−1] / A[i]:索引越界 → 用 ±∞ 代替',
    '偶數時用整數除法 `(a + b) / 2`:結果要是浮點數',
  ],
  followUp: [{ q: '找兩個排序陣列合併後的第 k 小?', a: '同樣的切點想法,把 half 換成 k;或每次比較 A[k/2−1] 和 B[k/2−1],丟掉比較小那邊的前 k/2 個。' }],
  check: {
    kind: 'fn',
    fn: 'findMedianSortedArrays',
    compare: 'close',
    cases: [
      { args: [[1, 3], [2]], out: 2.0 },
      { args: [[1, 2], [3, 4]], out: 2.5 },
      { args: [A, B], out: 11.0 },
      { args: [[], [1]], out: 1.0 },
      { args: [[2], []], out: 2.0 },
      { args: [[1, 2, 3], [4, 5, 6, 7]], out: 4.0 },
      { args: [[5, 6], [1, 2, 3, 4]], out: 3.5 },
    ],
  },
}
