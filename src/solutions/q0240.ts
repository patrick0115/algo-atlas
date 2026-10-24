import type { Solution } from './types'
import type { GridViewData } from '../types'

// 240. Search a 2D Matrix II
const M = [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]]
const view = (r: number, c: number, note: string): GridViewData => ({ kind: 'grid', label: note, cells: M, marks: { hl: [[r,c]], dim: M.flatMap((row,i)=>row.flatMap((_,j)=>i<r||j>c?[[i,j] as [number,number]]:[])) } })
const fig = [
  { note: '從右上角 11 出發，目標 5 比 11 小；11 下方只會更大，因此排除這一欄，向左移。', views: [view(0,3,'右上角開始')] },
  { note: '來到 7、4。4 比 5 小，左邊更小，因此整列的左半都不可能，往下移。', views: [view(0,1,'4 < 5，向下')] },
  { note: '從 (0,1) 往下走，列索引變成 1，欄索引仍是 1；新位置的值是 5。', views: [view(1,1,'向下移動一格')] },
  { note: '走到 (1,1) 的 5，找到目標。每步都能排除一列或一行。', views: [view(1,1,'找到 5')] },
]

export const q0240: Solution = {
  id: 240,
  plain: '在每一列與每一行都已排序的表格找數字。可像走樓梯一樣，每一步排除一整段。',
  statement: '給 m×n 矩陣，列由左至右遞增、行由上至下遞增；判斷 target 是否出現。',
  examples: [{ input: 'matrix = [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target = 5', output: 'true' }, { input: 'matrix = [[1,4],[2,5]], target = 3', output: 'false' }],
  constraints: ['1 ≤ m,n ≤ 300；矩陣值可為負。', '兩個方向各自排序，但把矩陣攤平後不一定排序。'],
  insight: ['對每一列做二分搜尋可行，複雜度 O(m log n)。', '右上角有特殊性：左邊更小，下邊更大；比較一次就能排掉一整行或一整列。', '這是 [[p:binary-search]] 的有序資訊運用。'],
  approaches: [
    { name: '逐列二分搜尋', idea: '每一列都是已排序陣列，對每列查 target。', steps: ['對每列設 l=0、r=n−1。每列的排序讓我們能排除一部分不可能的位置。', '比較中點與 target，縮小左右範圍。比較中點或右上角目前值後，才知道要捨棄哪一側。', '任一列找到就回傳 true；全找不到回傳 false。找到相等值就可以立即停止；否則持續縮小尚未排除的範圍。'], figure: { title: 'target = 5', steps: [{ note: '第一列的搜尋範圍先是 [1,4,7,11]，中點 4 比目標 5 小，因此左界移到 7。', views: [view(0,1,'第一列：比較 4')] }, { note: '接著比較 7，它又比 5 大，第一列的搜尋範圍因此縮空。', views: [view(0,2,'第一列：比較 7')] }, { note: '第二列從中點 5 開始比較，剛好等於目標，立即回傳 true。', views: [view(1,1,'第二列找到 5')] }] }, complexity: { time: 'O(m log n)', space: 'O(1)', why: '每列各做一次二分搜尋。' }, verdict: '可直接利用列排序，未利用行排序。', code: {
      python: `def searchMatrix(matrix, target):
    for row in matrix:  # 利用每列或右上角的排序資訊縮小搜尋範圍。
        l, r = (0, len(row) - 1)
        while l <= r:
            mid = (l + r) // 2
            if row[mid] == target:  # 比較目前值與目標後，排除不可能的區域。
                return True
            if row[mid] < target:
                l = mid + 1
            else:
                r = mid - 1
    return False`,
      c: `bool searchMatrix(int **matrix, int m, int *cols, int target) {
    for (int i = 0; i < m; i++) {
        int l = 0, r = cols[i] - 1;
        while (l <= r) {
            int x = l + (r - l) / 2;
            if (matrix[i][x] == target)
                return true;
            if (matrix[i][x] < target)
                l = x + 1;
            else
                r = x - 1;
        }
    }
    return false;
}`,
      cpp: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    for (auto& row : matrix) {
        int l = 0, r = (int)row.size() - 1;
        while (l <= r) {
            int x = l + (r - l) / 2;
            if (row[x] == target)
                return true;
            if (row[x] < target)
                l = x + 1;
            else
                r = x - 1;
        }
    }
    return false;
}`,
      java: `boolean searchMatrix(int[][] matrix, int target) {
    for (int[] row : matrix) {
        int l = 0, r = row.length - 1;
        while (l <= r) {
            int x = l + (r - l) / 2;
            if (row[x] == target)
                return true;
            if (row[x] < target)
                l = x + 1;
            else
                r = x - 1;
        }
    }
    return false;
}`,
      javascript: `function searchMatrix(matrix, target) {
    for (const row of matrix) {
        let l = 0, r = row.length - 1;
        while (l <= r) {
            const x = (l + r) >> 1;
            if (row[x] === target)
                return true;
            if (row[x] < target)
                l = x + 1;
            else
                r = x - 1;
        }
    }
    return false;
}`,
    } },
    { name: '右上角階梯搜尋', idea: '目標較小就向左，較大就向下；每步排除一行或一列。', steps: ['設 r=0、c=n−1。每列的排序讓我們能排除一部分不可能的位置。', '若相等，回傳 true。比較中點或右上角目前值後，才知道要捨棄哪一側。', '若目前值過大，c−−；過小則 r++；越界後回傳 false。找到相等值就可以立即停止；否則持續縮小尚未排除的範圍。'], figure: { title: 'target = 5', steps: fig }, complexity: { time: 'O(m+n)', space: 'O(1)', why: '最多向左 n 次、向下 m 次。' }, verdict: '同時利用列與行排序，是本題最簡潔解。', code: {
      python: `def searchMatrix(matrix, target):
    if not matrix or not matrix[0]:  # 空矩陣直接回傳 false
        return False
    r, c = (0, len(matrix[0]) - 1)
    while r < len(matrix) and c >= 0:  # 利用每列或右上角的排序資訊縮小搜尋範圍。
        if matrix[r][c] == target:
            return True
        if matrix[r][c] > target:  # 比較目前值與目標後，排除不可能的區域。
            c -= 1
        else:
            r += 1
    return False`,
      c: `bool searchMatrix(int **matrix, int m, int *cols, int target) {
    if (!m || !cols[0])
        return false;
    int r = 0, c = cols[0] - 1;
    while (r < m && c >= 0) {
        if (matrix[r][c] == target)
            return true;
        if (matrix[r][c] > target)
            c--;
        else
            r++;
    }
    return false;
}`,
      cpp: `bool searchMatrix(vector<vector<int>>& matrix, int target) {
    if (matrix.empty() || matrix[0].empty())
        return false;
    int r = 0, c = (int)matrix[0].size() - 1;
    while (r < (int)matrix.size() && c >= 0) {
        if (matrix[r][c] == target)
            return true;
        if (matrix[r][c] > target)
            c--;
        else
            r++;
    }
    return false;
}`,
      java: `boolean searchMatrix(int[][] matrix, int target) {
    if (matrix.length == 0 || matrix[0].length == 0)
        return false;
    int r = 0, c = matrix[0].length - 1;
    while (r < matrix.length && c >= 0) {
        if (matrix[r][c] == target)
            return true;
        if (matrix[r][c] > target)
            c--;
        else
            r++;
    }
    return false;
}`,
      javascript: `function searchMatrix(matrix, target) {
    if (!matrix.length || !matrix[0].length)
        return false;
    let r = 0, c = matrix[0].length - 1;
    while (r < matrix.length && c >= 0) {
        if (matrix[r][c] === target)
            return true;
        if (matrix[r][c] > target)
            c--;
        else
            r++;
    }
    return false;
}`,
    } },
  ],
  pitfalls: ['不能對整張矩陣直接做攤平二分；每列尾端未必小於下一列開頭。', '從右上角遇到過大要向左，遇到過小要向下。'],
  check: { kind: 'fn', fn: 'searchMatrix', cases: [{ args: [M,5], out: true }, { args: [M,15], out: false }, { args: [[[1]],1], out: true }, { args: [[[1]],2], out: false }] },
}
