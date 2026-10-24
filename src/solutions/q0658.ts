import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 658. Find K Closest Elements

const A = [1, 2, 3, 4, 5, 6, 7, 8]
const K = 3
const X = 5

function shrinkFig(): FigStep[] {
  let l = 0
  let r = A.length - 1
  const out: FigStep[] = [{ note: `答案一定是連續的 ${K} 個。從整個陣列開始,每次把兩端「離 x = ${X} 比較遠」的那個丟掉,直到剩 ${K} 個`, views: [arr(A, { label: 'arr', range: [l, r], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] }]
  while (r - l + 1 > K) {
    const dl = X - A[l]
    const dr = A[r] - X
    const dropL = dl > dr
    out.push({ note: `|${A[l]} − ${X}| = ${dl} vs |${A[r]} − ${X}| = ${dr} → ${dropL ? `左邊比較遠,丟掉 ${A[l]}` : dl === dr ? `一樣遠,題目規定小的優先,丟掉右邊的 ${A[r]}` : `右邊比較遠,丟掉 ${A[r]}`}`, views: [arr(A, { label: 'arr', range: [l, r], dim: [dropL ? l : r], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] })] })
    if (dropL) l++
    else r--
  }
  out.push({ note: `剩下 [${A.slice(l, r + 1)}]`, views: [arr(A, { label: 'arr', done: Array.from({ length: K }, (_, i) => l + i) })] })
  return out
}

function bsFig(): FigStep[] {
  let lo = 0
  let hi = A.length - K
  const out: FigStep[] = [{ note: `直接二分搜尋「視窗的起點」s(範圍 0..n−k = ${hi})。比較 arr[s] 和 arr[s+k]:視窗 [s, s+k) 往右移一格,就是丟掉 arr[s]、換進 arr[s+k]`, views: [arr(A, { label: 'arr', range: [lo, hi] })] }]
  while (lo < hi) {
    const m = (lo + hi) >> 1
    const right = X - A[m] > A[m + K] - X
    out.push({ note: `s = ${m}:x − arr[${m}] = ${X - A[m]},arr[${m + K}] − x = ${A[m + K] - X} → ${right ? '左端比較遠,起點要往右:lo = m + 1' : '左端不比較遠,起點可以是 m 或更左:hi = m'}`, views: [arr(A, { label: 'arr', range: [m, m + K - 1], compare: [m, m + K] })] })
    if (right) lo = m + 1
    else hi = m
  }
  out.push({ note: `起點 = ${lo},答案 [${A.slice(lo, lo + K)}]`, views: [arr(A, { label: 'arr', done: Array.from({ length: K }, (_, i) => lo + i) })] })
  return out
}

export const q0658: Solution = {
  id: 658,
  plain: '一排排好序的數字,找出最靠近 x 的 k 個(一樣近的話選比較小的),由小到大列出來。就像在一排身高排好的人裡,挑出身高最接近某人的 k 個。',
  statement: '給**已排序**陣列 `arr`、整數 `k`、`x`,回傳最接近 x 的 k 個數(由小到大)。a 比 b 接近的定義:`|a−x| < |b−x|`,或距離相同且 `a < b`。',
  examples: [
    { input: 'arr = [1,2,3,4,5], k = 4, x = 3', output: '[1,2,3,4]' },
    { input: 'arr = [1,1,2,3,4,5], k = 4, x = -1', output: '[1,1,2,3]' },
  ],
  constraints: ['k ≤ n ≤ 10⁴', 'x 可以不在陣列裡,也可以超出範圍'],
  insight: ['答案在原陣列裡一定是**連續的一段**(已排序,離 x 越近的越集中)', '從兩端往內丟掉比較遠的,剩 k 個 → O(n)', '或二分搜尋視窗起點 s:比較 `x − arr[s]` 和 `arr[s+k] − x` 決定往哪邊 → O(log(n−k))'],
  approaches: [
    {
      name: '左右夾逼',
      idea: '`l = 0`、`r = n − 1`;`r − l + 1 > k` 時丟掉比較遠的一端(一樣遠丟右邊)。',
      steps: ['`l, r = 0, n − 1`', '`while r − l + 1 > k`:`x − arr[l] > arr[r] − x` → `l += 1`,否則 `r -= 1`', '回傳 `arr[l : r + 1]`'],
      figure: { title: `arr = [${A}],k = ${K},x = ${X}`, steps: shrinkFig() },
      complexity: { time: 'O(n − k)', space: 'O(1)', why: '每次丟一個,丟 n − k 次。' },
      verdict: '最直觀,而且「一樣遠丟右邊」自然滿足了小的優先。',
      code: {
        python: `def findClosestElements(arr, k, x):
    l, r = 0, len(arr) - 1
    while r - l + 1 > k:
        if x - arr[l] > arr[r] - x:           # 左邊比較遠(arr 已排序,不用 abs 也對)
            l += 1
        else:                                 # 右邊比較遠或一樣遠 → 丟右邊(小的優先)
            r -= 1
    return arr[l:r + 1]`,
        c: `int *findClosestElements(int *arr, int arrSize, int k, int x, int *returnSize) {
    int l = 0, r = arrSize - 1;
    while (r - l + 1 > k) {
        if (x - arr[l] > arr[r] - x) l++;
        else r--;
    }
    int *res = malloc(k * sizeof(int));
    memcpy(res, arr + l, k * sizeof(int));
    *returnSize = k;
    return res;
}`,
        cpp: `vector<int> findClosestElements(vector<int>& arr, int k, int x) {
    int l = 0, r = arr.size() - 1;
    while (r - l + 1 > k) {
        if (x - arr[l] > arr[r] - x) l++;
        else r--;
    }
    return vector<int>(arr.begin() + l, arr.begin() + r + 1);
}`,
        java: `List<Integer> findClosestElements(int[] arr, int k, int x) {
    int l = 0, r = arr.length - 1;
    while (r - l + 1 > k) {
        if (x - arr[l] > arr[r] - x) l++;
        else r--;
    }
    List<Integer> res = new ArrayList<>();
    for (int i = l; i <= r; i++) res.add(arr[i]);
    return res;
}`,
        javascript: `function findClosestElements(arr, k, x) {
  let l = 0, r = arr.length - 1;
  while (r - l + 1 > k) {
    if (x - arr[l] > arr[r] - x) l++;
    else r--;
  }
  return arr.slice(l, r + 1);
}`,
      },
    },
    {
      name: '二分搜尋視窗起點',
      idea: '在 `[0, n−k]` 二分 s;`x − arr[m] > arr[m+k] − x` 代表左端比換進來的那個更遠 → `lo = m + 1`,否則 `hi = m`。',
      steps: ['`lo, hi = 0, n − k`', '`while lo < hi`:`m = (lo + hi) // 2`', '`x − arr[m] > arr[m + k] − x` → `lo = m + 1`;否則 `hi = m`', '回傳 `arr[lo : lo + k]`'],
      figure: { title: `arr = [${A}],k = ${K},x = ${X}`, steps: bsFig() },
      complexity: { time: 'O(log(n − k) + k)', space: 'O(1)', why: '二分找起點,再複製 k 個。' },
      verdict: '最推薦(最快)。關鍵是比較「視窗左端」和「視窗右邊下一個」:誰比較遠,視窗就該往另一邊移。不要用 abs,否則 x 不在兩者之間(例如兩個都比 x 小)時會判斷錯。',
      code: {
        python: `def findClosestElements(arr, k, x):
    lo, hi = 0, len(arr) - k
    while lo < hi:
        m = (lo + hi) // 2
        if x - arr[m] > arr[m + k] - x:       # 視窗左端比右邊下一個更遠 → 起點往右
            lo = m + 1
        else:
            hi = m
    return arr[lo:lo + k]`,
        c: `int *findClosestElements(int *arr, int arrSize, int k, int x, int *returnSize) {
    int lo = 0, hi = arrSize - k;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (x - arr[m] > arr[m + k] - x) lo = m + 1;
        else hi = m;
    }
    int *res = malloc(k * sizeof(int));
    memcpy(res, arr + lo, k * sizeof(int));
    *returnSize = k;
    return res;
}`,
        cpp: `vector<int> findClosestElements(vector<int>& arr, int k, int x) {
    int lo = 0, hi = arr.size() - k;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (x - arr[m] > arr[m + k] - x) lo = m + 1;
        else hi = m;
    }
    return vector<int>(arr.begin() + lo, arr.begin() + lo + k);
}`,
        java: `List<Integer> findClosestElements(int[] arr, int k, int x) {
    int lo = 0, hi = arr.length - k;
    while (lo < hi) {
        int m = (lo + hi) / 2;
        if (x - arr[m] > arr[m + k] - x) lo = m + 1;
        else hi = m;
    }
    List<Integer> res = new ArrayList<>();
    for (int i = lo; i < lo + k; i++) res.add(arr[i]);
    return res;
}`,
        javascript: `function findClosestElements(arr, k, x) {
  let lo = 0, hi = arr.length - k;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (x - arr[m] > arr[m + k] - x) lo = m + 1;
    else hi = m;
  }
  return arr.slice(lo, lo + k);
}`,
      },
    },
  ],
  pitfalls: ['二分時用 `abs(x − arr[m]) > abs(arr[m+k] − x)`:有重複值時(如 [1,1,2,2,2,2,2,3,3],k=3,x=3)會判斷錯', '回傳前忘了保持由小到大(用 heap 依距離挑的話要再排序)'],
  check: {
    kind: 'fn',
    fn: 'findClosestElements',
    cases: [
      { args: [[1, 2, 3, 4, 5], 4, 3], out: [1, 2, 3, 4] },
      { args: [[1, 1, 2, 3, 4, 5], 4, -1], out: [1, 1, 2, 3] },
      { args: [A, K, X], out: [4, 5, 6] },
      { args: [[1, 1, 2, 2, 2, 2, 2, 3, 3], 3, 3], out: [2, 3, 3] },
      { args: [[1, 3], 1, 2], out: [1] },
      { args: [[1, 2, 3], 2, 10], out: [2, 3] },
    ],
  },
}
