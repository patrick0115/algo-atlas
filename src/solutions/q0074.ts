import { range } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 74. Search a 2D Matrix

const M = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
]
const T = 16
const R = M.length
const C = M[0].length

function grid(marks: GridViewData['marks'] = {}, label = 'matrix'): GridViewData {
  return { kind: 'grid', label, cells: M.map((r) => [...r]), rowLabels: range(0, R - 1).map(String), colLabels: range(0, C - 1).map(String), marks }
}

function stairFig(): FigStep[] {
  let r = 0
  let c = C - 1
  const out: FigStep[] = [{ note: '從**右上角**出發:它是這一列最大、這一行最小。比 target 大就往左(整行都更大,排除),小就往下(整列都更小,排除)', views: [grid({ hl: [[r, c]] })] }]
  const gone: Cell[] = []
  while (r < R && c >= 0) {
    const v = M[r][c]
    if (v === T) {
      out.push({ note: `matrix[${r}][${c}] = ${v} = target → 找到`, views: [grid({ hl: [[r, c]], dim: gone })] })
      return out
    }
    if (v > T) {
      out.push({ note: `matrix[${r}][${c}] = ${v} > ${T}:這一行往下只會更大 → 整行排除,往左`, views: [grid({ cmp: [[r, c]], dim: [...gone] })] })
      for (let k = 0; k < R; k++) gone.push([k, c])
      c--
    } else {
      out.push({ note: `matrix[${r}][${c}] = ${v} < ${T}:這一列往左只會更小 → 整列排除,往下`, views: [grid({ cmp: [[r, c]], dim: [...gone] })] })
      for (let k = 0; k < C; k++) gone.push([r, k])
      r++
    }
  }
  out.push({ note: '走出矩陣 → 找不到', views: [grid({ dim: gone })] })
  return out
}

function flatFig(): FigStep[] {
  let lo = 0
  let hi = R * C - 1
  const cellOf = (k: number): Cell => [Math.floor(k / C), k % C]
  const inRange = () => range(lo, hi).map(cellOf)
  const out: FigStep[] = [{ note: `每一列接在上一列後面就是一個長度 ${R * C} 的有序陣列。第 k 個 = matrix[k / ${C}][k % ${C}],直接對 k 二分`, views: [grid({ path: inRange() })] }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const [r, c] = cellOf(mid)
    const v = M[r][c]
    if (v === T) {
      out.push({ note: `mid = ${mid} → (${r}, ${c}) = ${v} = target → 找到`, views: [grid({ path: inRange(), hl: [[r, c]] })] })
      return out
    }
    out.push({ note: `區間 [${lo}, ${hi}],mid = ${mid} → (${mid} / ${C}, ${mid} % ${C}) = (${r}, ${c}),值 ${v} ${v < T ? `< ${T} → lo = mid + 1` : `> ${T} → hi = mid − 1`}`, views: [grid({ path: inRange(), cmp: [[r, c]] })] })
    if (v < T) lo = mid + 1
    else hi = mid - 1
  }
  out.push({ note: '區間變空 → 找不到', views: [grid()] })
  return out
}

function twoFig(): FigStep[] {
  // 先找列:最後一個 matrix[r][0] <= target 的列
  let lo = 0
  let hi = R - 1
  const out: FigStep[] = [{ note: '分兩次二分:先在**第一行**找「target 該在哪一列」,再在那一列裡找', views: [grid({ path: range(0, R - 1).map((r) => [r, 0] as Cell) })] }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    out.push({ note: `列的區間 [${lo}, ${hi}],看 matrix[${mid}][0] = ${M[mid][0]} ${M[mid][0] <= T ? `≤ ${T} → 答案在這列或更下面,lo = mid + 1` : `> ${T} → 在更上面,hi = mid − 1`}`, views: [grid({ path: range(lo, hi).map((r) => [r, 0] as Cell), cmp: [[mid, 0]] })] })
    if (M[mid][0] <= T) lo = mid + 1
    else hi = mid - 1
  }
  const row = hi
  out.push({ note: `第一行裡最後一個 ≤ ${T} 的是第 ${row} 列 → target 只可能在這一列`, views: [grid({ path: range(0, C - 1).map((c) => [row, c] as Cell) })] })
  lo = 0
  hi = C - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const v = M[row][mid]
    if (v === T) {
      out.push({ note: `在第 ${row} 列二分:matrix[${row}][${mid}] = ${v} = target → 找到`, views: [grid({ hl: [[row, mid]] })] })
      return out
    }
    out.push({ note: `在第 ${row} 列二分:matrix[${row}][${mid}] = ${v} ${v < T ? '太小,往右' : '太大,往左'}`, views: [grid({ path: range(lo, hi).map((c) => [row, c] as Cell), cmp: [[row, mid]] })] })
    if (v < T) lo = mid + 1
    else hi = mid - 1
  }
  return out
}

export const q0074: Solution = {
  id: 74,
  statement: '給一個 `m × n` 的整數矩陣:**每一列由左到右遞增**,而且**每一列的第一個數都比上一列的最後一個數大**。判斷 `target` 在不在矩陣裡,要 O(log(m·n))。',
  examples: [
    { input: 'matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3', output: 'true' },
    { input: '同上, target = 13', output: 'false' },
  ],
  constraints: ['`1 ≤ m, n ≤ 100` → 全部掃也只有 10⁴ 格,但題目要求 O(log(m·n))', '兩個條件合起來 = **整個矩陣攤平後是有序的**'],
  insight: [
    '條件二(每列開頭 > 上一列結尾)代表:把每一列接起來,就是**一個有序的一維陣列**',
    '所以可以直接對「第 k 個元素」二分,只要會把 k 換成 `(k / n, k % n)`',
    '另一個做法:先二分找列、再二分找行。兩次都是 O(log),合起來也是 O(log m + log n) = O(log(m·n))',
    '從右上角走的「階梯法」只用到「列遞增、行遞增」,是 O(m + n);它是 240. Search a 2D Matrix II(沒有條件二)的標準解',
  ],
  approaches: [
    {
      name: '階梯法:從右上角走',
      idea: '右上角是「這一列最大、這一行最小」。比 target 大 → 這一行都太大,往左;比 target 小 → 這一列都太小,往下。',
      steps: ['`r = 0`、`c = n − 1`', '`while r < m and c >= 0`', '等於 → `true`;大於 → `c--`;小於 → `r++`', '走出矩陣 → `false`'],
      figure: { title: `target = ${T}`, steps: stairFig() },
      complexity: { time: 'O(m + n)', space: 'O(1)', why: '每一步排除一整列或一整行,最多 m + n 步。' },
      verdict: '比二分慢,但不需要「每列開頭 > 上一列結尾」這個條件,適用範圍更廣(240 題)。',
      code: {
        python: `def searchMatrix(matrix, target):
    r, c = 0, len(matrix[0]) - 1
    while r < len(matrix) and c >= 0:
        v = matrix[r][c]
        if v == target:
            return True
        if v > target:
            c -= 1                        # 這一行往下更大,排除
        else:
            r += 1                        # 這一列往左更小,排除
    return False`,
        c: `bool searchMatrix(int **matrix, int matrixSize, int *matrixColSize, int target) {
    int r = 0, c = matrixColSize[0] - 1;
    while (r < matrixSize && c >= 0) {
        int v = matrix[r][c];
        if (v == target) return true;
        if (v > target) c--;
        else r++;
    }
    return false;
}`,
        cpp: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    int r = 0, c = (int)matrix[0].size() - 1;
    while (r < (int)matrix.size() && c >= 0) {
        int v = matrix[r][c];
        if (v == target) return true;
        if (v > target) c--;
        else r++;
    }
    return false;
}`,
        java: `boolean searchMatrix(int[][] matrix, int target) {
    int r = 0, c = matrix[0].length - 1;
    while (r < matrix.length && c >= 0) {
        int v = matrix[r][c];
        if (v == target) return true;
        if (v > target) c--;
        else r++;
    }
    return false;
}`,
        javascript: `function searchMatrix(matrix, target) {
  let r = 0, c = matrix[0].length - 1;
  while (r < matrix.length && c >= 0) {
    const v = matrix[r][c];
    if (v === target) return true;
    if (v > target) c--;
    else r++;
  }
  return false;
}`,
      },
    },
    {
      name: '兩次二分:先找列,再找行',
      idea: '第一次在第一行找「最後一個 `matrix[r][0] ≤ target`」的列 `r`;第二次在第 `r` 列裡找 target。',
      steps: ['二分找最後一個 `matrix[r][0] ≤ target` 的 `r`;沒有(target 比全部都小)→ `false`', '在 `matrix[r]` 裡一般二分'],
      figure: { title: `target = ${T}`, steps: twoFig() },
      complexity: { time: 'O(log m + log n)', space: 'O(1)', why: '兩次二分。log m + log n = log(m·n)。' },
      verdict: '想法自然,但要寫兩個二分,第一個還是「找最後一個 ≤」的變形,比較容易寫錯邊界。',
      code: {
        python: `from bisect import bisect_right, bisect_left

def searchMatrix(matrix, target):
    # 第一行裡最後一個 <= target 的列
    r = bisect_right([row[0] for row in matrix], target) - 1
    if r < 0:
        return False
    row = matrix[r]
    c = bisect_left(row, target)
    return c < len(row) and row[c] == target`,
        c: `bool searchMatrix(int **matrix, int matrixSize, int *matrixColSize, int target) {
    int lo = 0, hi = matrixSize - 1;
    while (lo <= hi) {                    // 找最後一個 matrix[r][0] <= target
        int mid = lo + (hi - lo) / 2;
        if (matrix[mid][0] <= target) lo = mid + 1;
        else hi = mid - 1;
    }
    if (hi < 0) return false;
    int *row = matrix[hi];
    lo = 0;
    int h2 = matrixColSize[hi] - 1;
    while (lo <= h2) {
        int mid = lo + (h2 - lo) / 2;
        if (row[mid] == target) return true;
        if (row[mid] < target) lo = mid + 1;
        else h2 = mid - 1;
    }
    return false;
}`,
        cpp: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    // upper_bound:第一個「第一個元素 > target」的列,前一列就是候選
    auto it = upper_bound(matrix.begin(), matrix.end(), target,
                          [](int t, const vector<int>& row) { return t < row[0]; });
    if (it == matrix.begin()) return false;
    const vector<int>& row = *prev(it);
    return binary_search(row.begin(), row.end(), target);
}`,
        java: `boolean searchMatrix(int[][] matrix, int target) {
    int lo = 0, hi = matrix.length - 1;
    while (lo <= hi) {                    // 找最後一個 matrix[r][0] <= target
        int mid = lo + (hi - lo) / 2;
        if (matrix[mid][0] <= target) lo = mid + 1;
        else hi = mid - 1;
    }
    if (hi < 0) return false;
    return Arrays.binarySearch(matrix[hi], target) >= 0;
}`,
        javascript: `function searchMatrix(matrix, target) {
  let lo = 0, hi = matrix.length - 1;
  while (lo <= hi) {                    // 找最後一個 matrix[r][0] <= target
    const mid = (lo + hi) >> 1;
    if (matrix[mid][0] <= target) lo = mid + 1;
    else hi = mid - 1;
  }
  if (hi < 0) return false;
  const row = matrix[hi];
  let l = 0, r = row.length - 1;
  while (l <= r) {
    const mid = (l + r) >> 1;
    if (row[mid] === target) return true;
    if (row[mid] < target) l = mid + 1;
    else r = mid - 1;
  }
  return false;
}`,
      },
    },
    {
      name: '當成一維陣列二分',
      idea: '索引 `k` 從 0 到 `m·n − 1`,第 `k` 個元素是 `matrix[k / n][k % n]`。直接做一次普通的二分。',
      steps: ['`lo = 0`、`hi = m·n − 1`', '`mid` → `v = matrix[mid / n][mid % n]`', '等於 → `true`;小於 → `lo = mid + 1`;大於 → `hi = mid − 1`'],
      figure: { title: `target = ${T}(灰底 = 目前的搜尋區間)`, steps: flatFig() },
      complexity: { time: 'O(log(m·n))', space: 'O(1)', why: '對 m·n 個元素二分一次。' },
      verdict: '最簡潔的標準解。「二維索引 ↔ 一維索引」的轉換(`k / n`、`k % n`)在網格題裡到處都用得到。',
      code: {
        python: `def searchMatrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    lo, hi = 0, m * n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = matrix[mid // n][mid % n]     # 一維索引 -> (列, 行)
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
        c: `bool searchMatrix(int **matrix, int matrixSize, int *matrixColSize, int target) {
    int m = matrixSize, n = matrixColSize[0];
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int v = matrix[mid / n][mid % n];
        if (v == target) return true;
        if (v < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
        cpp: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    int m = matrix.size(), n = matrix[0].size();
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int v = matrix[mid / n][mid % n];
        if (v == target) return true;
        if (v < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
        java: `boolean searchMatrix(int[][] matrix, int target) {
    int m = matrix.length, n = matrix[0].length;
    int lo = 0, hi = m * n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        int v = matrix[mid / n][mid % n];
        if (v == target) return true;
        if (v < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return false;
}`,
        javascript: `function searchMatrix(matrix, target) {
  const m = matrix.length, n = matrix[0].length;
  let lo = 0, hi = m * n - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = matrix[Math.floor(mid / n)][mid % n];
    if (v === target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    '一維轉二維用錯除數:是除以**行數** `n`(每列有幾個),不是列數 `m`',
    '兩次二分的版本:target 比第一個數還小時,找列的結果是 −1,要先擋掉再取 `matrix[-1]`(Python 會取到最後一列,不會報錯但答案錯)',
    '階梯法從左上角出發走不通:左上角往右、往下都變大,沒辦法排除任何一邊',
  ],
  followUp: [
    { q: '如果只有「每列遞增、每行遞增」,沒有條件二?', a: '240. Search a 2D Matrix II:攤平後不再有序,不能一維二分;用方法一的階梯法,O(m + n)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'searchMatrix',
    cases: [
      { args: [M, 3], out: true },
      { args: [M, 13], out: false },
      { args: [M, T], out: true },
      { args: [M, 60], out: true },
      { args: [M, 0], out: false },
      { args: [M, 61], out: false },
      { args: [[[1]], 1], out: true },
      { args: [[[1, 3]], 2], out: false },
    ],
  },
}
