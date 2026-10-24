import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1572. Matrix Diagonal Sum
const M = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
const view: GridViewData = { kind: 'grid', label: '兩條對角線', cells: M, marks: { done: [[0, 0], [1, 1], [2, 2], [0, 2], [2, 0]] } }
const centerFig: FigStep[] = [
  { note: '主對角線 1+5+9=15,副對角線 3+5+7=15。中央 5 被加了兩次,要扣掉一次。', views: [view, arr([15, 15, -5, 25], { label: '主線 / 副線 / 重複中心 / 答案', done: [3] })] },
  { note: '若邊長是偶數,兩條對角線不會交在同一格,不需要扣除中央。', views: [arr([8], { label: '4×4 全是 1 時的答案', done: [0] })] },
]
const rowFig: FigStep[] = [
  { note: '逐列取第 i 欄和第 n−1−i 欄。若兩個欄位是同一格,只加一次。', views: [view] },
  { note: 'n=3 的中央列兩個欄位都為 1,只加中央的 5 一次。', views: [arr([4, 9, 25], { label: '逐列累加示意', done: [2] })] },
]

export const q1572: Solution = {
  id: 1572,
  plain: '把正方形矩陣的兩條對角線加起來,交叉的正中央只算一次。',
  statement: '給 n×n 矩陣 mat,求主對角線與副對角線上所有不同格子的數字總和。',
  examples: [{ input: 'mat = [[1,2,3],[4,5,6],[7,8,9]]', output: '25' }, { input: 'mat = [[5]]', output: '5' }],
  constraints: ['矩陣是正方形,n 至多 100'],
  insight: ['第 i 列主對角線在欄 i,副對角線在欄 n−1−i。', 'n 為奇數時兩條線在中央相交,不能重複計算。', '可先加兩條線再扣中心,或逐列檢查兩欄是否相同。'],
  approaches: [
    {
      name: '兩條線相加再扣中心',
      idea: '每列加兩個對角位置;若 n 是奇數,最後扣掉被算兩次的中央值。',
      steps: ['sum = 0', '對每列 i 加 mat[i][i] 和 mat[i][n−1−i]', '若 n 是奇數,扣 mat[n/2][n/2]', '回傳 sum'],
      figure: { title: '3×3 的交叉中心', steps: centerFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '只讀每列兩格。' },
      verdict: '公式最短,中心重複是唯一特例。',
      code: {
        python: `def diagonalSum(mat):
    n = len(mat)
    total = sum(mat[i][i] + mat[i][n - 1 - i] for i in range(n))
    if n % 2:
        total -= mat[n // 2][n // 2]
    return total`,
        c: `int diagonalSum(int **mat, int matSize, int *matColSize) {
    int n = matSize, total = 0;
    for (int i = 0; i < n; i++) total += mat[i][i] + mat[i][n - 1 - i];
    if (n % 2) total -= mat[n / 2][n / 2];
    return total;
}`,
        cpp: `int diagonalSum(vector<vector<int>>& mat) {
    int n = mat.size(), total = 0;
    for (int i = 0; i < n; i++) total += mat[i][i] + mat[i][n - 1 - i];
    if (n % 2) total -= mat[n / 2][n / 2];
    return total;
}`,
        java: `int diagonalSum(int[][] mat) {
    int n = mat.length, total = 0;
    for (int i = 0; i < n; i++) total += mat[i][i] + mat[i][n - 1 - i];
    if (n % 2 == 1) total -= mat[n / 2][n / 2];
    return total;
}`,
        javascript: `function diagonalSum(mat) {
  const n = mat.length;
  let total = 0;
  for (let i = 0; i < n; i++) total += mat[i][i] + mat[i][n - 1 - i];
  if (n % 2) total -= mat[Math.floor(n / 2)][Math.floor(n / 2)];
  return total;
}`,
      },
    },
    {
      name: '逐列只加不同格',
      idea: '每列先加主對角位置;若副對角位置不是同一欄,再加副對角。',
      steps: ['對 i = 0..n−1,加 mat[i][i]', '若 i != n−1−i,再加 mat[i][n−1−i]', '回傳總和'],
      figure: { title: '每一列比較兩個欄位', steps: rowFig },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每列最多取兩個值。' },
      verdict: '不用最後再做扣除,單格矩陣也自然適用。',
      code: {
        python: `def diagonalSum(mat):
    n = len(mat)
    total = 0
    for i in range(n):
        total += mat[i][i]
        if i != n - 1 - i:
            total += mat[i][n - 1 - i]
    return total`,
        c: `int diagonalSum(int **mat, int matSize, int *matColSize) {
    int n = matSize, total = 0;
    for (int i = 0; i < n; i++) {
        total += mat[i][i];
        if (i != n - 1 - i) total += mat[i][n - 1 - i];
    }
    return total;
}`,
        cpp: `int diagonalSum(vector<vector<int>>& mat) {
    int n = mat.size(), total = 0;
    for (int i = 0; i < n; i++) {
        total += mat[i][i];
        if (i != n - 1 - i) total += mat[i][n - 1 - i];
    }
    return total;
}`,
        java: `int diagonalSum(int[][] mat) {
    int n = mat.length, total = 0;
    for (int i = 0; i < n; i++) {
        total += mat[i][i];
        if (i != n - 1 - i) total += mat[i][n - 1 - i];
    }
    return total;
}`,
        javascript: `function diagonalSum(mat) {
  const n = mat.length;
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += mat[i][i];
    if (i !== n - 1 - i) total += mat[i][n - 1 - i];
  }
  return total;
}`,
      },
    },
  ],
  pitfalls: ['奇數邊長的中央格會同時落在兩條對角線上,只能算一次。', '副對角線的欄是 n−1−i,不是固定的 n−1。'],
  check: { kind: 'fn', fn: 'diagonalSum', cases: [
    { args: [M], out: 25 }, { args: [[[5]]], out: 5 },
    { args: [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]], out: 8 },
  ] },
}
