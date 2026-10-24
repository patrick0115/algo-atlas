import { arr, range } from '../engine/helpers'
import type { Solution } from './types'

const N = 8

export const q0278: Solution = {
  id: 278,
  plain: '產品版本從某一版開始全是壞的；用檢查函式找出第一個壞版本。',
  statement: '版本編號 1..n，存在 firstBad，使它之前都正常、它以後都壞。只能透過 `isBadVersion(version)` 詢問，回傳 firstBad。題解用 `badGame(n, firstBad)` 模擬該函式驗證。',
  examples: [{ input: 'n = 5, firstBad = 4', output: '4' }, { input: 'n = 1, firstBad = 1', output: '1' }],
  constraints: ['`n ≤ 2³¹−1`，中點運算不能讓整數溢位。'],
  insight: ['檢查結果從正常切換為壞，之後不會再變；這是單調條件。', '線性掃描能找到答案；[[p:binary-search]] 每次可以丟掉一半候選版本。', '若中點是壞的，它仍可能是第一個，所以右邊界保留中點。'],
  approaches: [
    {
      name: '由前往後逐版檢查',
      idea: '從版本 1 開始問，第一個回傳壞的就是答案。',
      steps: ['version 從 1 到 n', '詢問 `isBadVersion(version)`', '第一次得到 true 就回傳 version'],
      figure: { title: 'n=8, firstBad=5', steps: [
        { note: '檢查 1：正常，繼續往後。', views: [arr(range(1, N), { highlight: [0] })] },
        { note: '檢查 2、3：仍正常。', views: [arr(range(1, N), { done: [0, 1, 2] })] },
        { note: '檢查 4：最後一個正常版本，還得往後問。', views: [arr(range(1, N), { done: [0, 1, 2, 3] })] },
        { note: '檢查 5：第一次變壞，立即回傳 5。', views: [arr(range(1, N), { done: [0, 1, 2, 3], highlight: [4] }), arr([5], { label: '答案' })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞詢問 n 次。' },
      verdict: '概念簡單，但 n 很大時詢問太多次。',
      code: {
        python: `def firstBadVersion(n):
    for version in range(1, n + 1):
        if isBadVersion(version):
            return version  # 第一次壞就是邊界

def badGame(n, firstBad):
    global isBadVersion
    isBadVersion = lambda version: version >= firstBad
    return firstBadVersion(n)`,
        c: `static int FIRST_BAD;
bool isBadVersion(int version) {
    return version >= FIRST_BAD;
}

int firstBadVersion(int n) {
    for (int version = 1; version <= n; version++) {
        if (isBadVersion(version)) return version;
    }
    return -1;
}

int badGame(int n, int firstBad) {
    FIRST_BAD = firstBad;
    return firstBadVersion(n);
}`,
        cpp: `static int FIRST_BAD;
bool isBadVersion(int version) {
    return version >= FIRST_BAD;
}

int firstBadVersion(int n) {
    for (int version = 1; version <= n; version++) {
        if (isBadVersion(version)) return version;
    }
    return -1;
}

int badGame(int n, int firstBad) {
    FIRST_BAD = firstBad;
    return firstBadVersion(n);
}`,
        java: `int firstBad;

boolean isBadVersion(int version) {
    return version >= firstBad;
}

int firstBadVersion(int n) {
    for (int version = 1; version <= n; version++) {
        if (isBadVersion(version)) return version;
    }
    return -1;
}

int badGame(int n, int firstBad) {
    this.firstBad = firstBad;
    return firstBadVersion(n);
}`,
        javascript: `function firstBadVersion(n) {
  for (let version = 1; version <= n; version++) {
    if (isBadVersion(version)) return version;
  }
}

function badGame(n, firstBad) {
  isBadVersion = (version) => version >= firstBad;
  return firstBadVersion(n);
}`,
      },
    },
    {
      name: '二分找第一個壞版本',
      idea: '維持答案在閉區間 `[lo,hi]`，每次檢查中間版。',
      steps: ['`lo=1, hi=n`', '若中點壞，令 `hi=mid`', '否則令 `lo=mid+1`', '兩端相遇時回傳 lo'],
      figure: { title: 'n=8, firstBad=5', steps: [
        { note: '答案在 [1,8]；中點 4 正常，前四版都可排除。', views: [arr(range(1, N), { highlight: [3], range: [0, 7] })] },
        { note: '縮到 [5,8]；中點 6 壞了，答案可能是 5 或 6。', views: [arr(range(1, N), { highlight: [5], range: [4, 7] })] },
        { note: '縮到 [5,6]；中點 5 也是壞的，仍保留它。', views: [arr(range(1, N), { highlight: [4], range: [4, 5] })] },
        { note: '區間變 [5,5]，所以第一個壞版本是 5。', views: [arr(range(1, N), { range: [4, 4], done: [4] })] },
      ] },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次至少排除一半版本。' },
      verdict: '推薦；用 `lo+(hi−lo)/2` 避免中點溢位。',
      code: {
        python: `def firstBadVersion(n):
    lo, hi = 1, n
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if isBadVersion(mid):
            hi = mid  # 這版可能就是第一個壞版
        else:
            lo = mid + 1
    return lo

def badGame(n, firstBad):
    global isBadVersion
    isBadVersion = lambda version: version >= firstBad
    return firstBadVersion(n)`,
        c: `static int FIRST_BAD;
bool isBadVersion(int version) {
    return version >= FIRST_BAD;
}

int firstBadVersion(int n) {
    int lo = 1, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (isBadVersion(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int badGame(int n, int firstBad) {
    FIRST_BAD = firstBad;
    return firstBadVersion(n);
}`,
        cpp: `static int FIRST_BAD;
bool isBadVersion(int version) {
    return version >= FIRST_BAD;
}

int firstBadVersion(int n) {
    int lo = 1, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (isBadVersion(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int badGame(int n, int firstBad) {
    FIRST_BAD = firstBad;
    return firstBadVersion(n);
}`,
        java: `int firstBad;

boolean isBadVersion(int version) {
    return version >= firstBad;
}

int firstBadVersion(int n) {
    int lo = 1, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (isBadVersion(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int badGame(int n, int firstBad) {
    this.firstBad = firstBad;
    return firstBadVersion(n);
}`,
        javascript: `function firstBadVersion(n) {
  let lo = 1, hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (isBadVersion(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

function badGame(n, firstBad) {
  isBadVersion = (version) => version >= firstBad;
  return firstBadVersion(n);
}`,
      },
    },
  ],
  pitfalls: ['中點是壞的時不能設 `hi=mid−1`，因為 mid 可能就是第一個壞版本。', 'C/Java 的 `(lo+hi)/2` 可能溢位。'],
  check: { kind: 'fn', fn: 'badGame', cases: [
    { args: [5, 4], out: 4 },
    { args: [1, 1], out: 1 },
    { args: [8, 5], out: 5 },
  ] },
}
