import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1260. Shift 2D Grid
const G = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
const shifted = [[9, 1, 2], [3, 4, 5], [6, 7, 8]]
const view = (cells: number[][], label: string): GridViewData => ({ kind: 'grid', cells, label })
const indexFig: FigStep[] = [
  { note: '矩陣可想成長度 m×n 的一條環狀序列;整體向右移 k 格。', views: [view(G, '原矩陣'), arr([1, 2, 3, 4, 5, 6, 7, 8, 9], { label: '攤平成一列' })] },
  { note: '原索引 idx 的新索引是 (idx+k) % (m×n)。k=1 時最後的 9 回到最前面。', views: [arr([9, 1, 2, 3, 4, 5, 6, 7, 8], { label: '移動後的一列' }), view(shifted, '答案')] },
]
const repeatFig: FigStep[] = [
  { note: '也能真的移動一格:先保存右下角,再由最後一格往前,讓每格讀取前一格的舊值。', views: [view(G, '移動前'), arr([9], { label: '先保存' })] },
  { note: '重複 k 次就完成,但 k 很大時會比一次計算索引慢。', views: [view(shifted, '移動 1 次後')] },
]

export const q1260: Solution = {
  id: 1260,
  plain: '把矩陣所有格子當成排成一圈的隊伍,每個值往後移 k 個位置;右下角會繞回左上角。',
  statement: '給 m×n 矩陣 grid 和整數 k,每次把每格的值移到依列優先順序的下一格,最後一格回到第一格。回傳移動 k 次後的矩陣。',
  examples: [{ input: 'grid = [[1,2,3],[4,5,6],[7,8,9]], k = 1', output: '[[9,1,2],[3,4,5],[6,7,8]]' }, { input: 'grid = [[1]], k = 100', output: '[[1]]' }],
  constraints: ['m、n 最多 50;k 最多 100', '輸出尺寸與原矩陣相同'],
  insight: ['列優先攤平成一維後,這只是長度 m×n 的環狀位移。', '原位置 idx = r×n+c,新位置 (idx+k) % (m×n)。', '若逐次模擬,要從後往前覆蓋,否則會讀到已改過的值。'],
  approaches: [
    {
      name: '索引直接映射',
      idea: '每個原格子計算平移後的一維索引,再換算成新列與新欄。',
      steps: ['k 對 m×n 取餘數', '對每個 (r,c),令 next = (r×n+c+k) % (m×n)', '答案[next/n][next%n] = grid[r][c]', '回傳答案矩陣'],
      figure: { title: '3×3 矩陣向右移 1 格', steps: indexFig },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每個格子搬一次,輸出矩陣需要同樣大小。' },
      verdict: '推薦;時間不受 k 影響。',
      code: {
        python: `def shiftGrid(grid, k):
    m, n = len(grid), len(grid[0])
    size = m * n
    ans = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            idx = (r * n + c + k) % size
            ans[idx // n][idx % n] = grid[r][c]
    return ans`,
        c: `int **shiftGrid(int **grid, int gridSize, int *gridColSize, int k, int *returnSize, int **returnColumnSizes) {
    int m = gridSize, n = gridColSize[0], size = m * n;
    int **ans = malloc(m * sizeof(int *));
    *returnColumnSizes = malloc(m * sizeof(int));
    for (int r = 0; r < m; r++) {
        ans[r] = malloc(n * sizeof(int));
        (*returnColumnSizes)[r] = n;
    }
    *returnSize = m;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            int idx = (r * n + c + k) % size;
            ans[idx / n][idx % n] = grid[r][c];
        }
    return ans;
}`,
        cpp: `vector<vector<int>> shiftGrid(vector<vector<int>>& grid, int k) {
    int m = grid.size(), n = grid[0].size(), size = m * n;
    vector<vector<int>> ans(m, vector<int>(n));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            int idx = (r * n + c + k) % size;
            ans[idx / n][idx % n] = grid[r][c];
        }
    return ans;
}`,
        java: `List<List<Integer>> shiftGrid(int[][] grid, int k) {
    int m = grid.length, n = grid[0].length, size = m * n;
    int[][] ans = new int[m][n];
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            int idx = (r * n + c + k) % size;
            ans[idx / n][idx % n] = grid[r][c];
        }
    List<List<Integer>> out = new ArrayList<>();
    for (int[] row : ans) {
        List<Integer> values = new ArrayList<>();
        for (int x : row) values.add(x);
        out.add(values);
    }
    return out;
}`,
        javascript: `function shiftGrid(grid, k) {
  const m = grid.length, n = grid[0].length, size = m * n;
  const ans = Array.from({ length: m }, () => Array(n).fill(0));
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      const idx = (r * n + c + k) % size;
      ans[Math.floor(idx / n)][idx % n] = grid[r][c];
    }
  return ans;
}`,
      },
    },
    {
      name: '逐次移動一格',
      idea: '保存最後一格,由後往前把前一格的值搬過來,重複 k 次。',
      steps: ['複製矩陣', '每輪先保存右下角的值', '列、欄都倒序遍歷,把前一位置的值寫進目前位置', '左上角放先前保存的值;重複 k 次'],
      figure: { title: '一次移動的過程', steps: repeatFig },
      complexity: { time: 'O(kmn)', space: 'O(mn)', why: '每次位移都掃過整張矩陣,另有輸出拷貝。' },
      verdict: '步驟直觀,但 k 大時重複工作較多。',
      code: {
        python: `def shiftGrid(grid, k):
    a = [row[:] for row in grid]
    m, n = len(a), len(a[0])
    for _ in range(k % (m * n)):
        last = a[m - 1][n - 1]
        for r in range(m - 1, -1, -1):
            for c in range(n - 1, -1, -1):
                if r == 0 and c == 0:
                    a[0][0] = last
                elif c:
                    a[r][c] = a[r][c - 1]
                else:
                    a[r][c] = a[r - 1][n - 1]
    return a`,
        c: `int **shiftGrid(int **grid, int gridSize, int *gridColSize, int k, int *returnSize, int **returnColumnSizes) {
    int m = gridSize, n = gridColSize[0];
    int **a = malloc(m * sizeof(int *));
    *returnColumnSizes = malloc(m * sizeof(int));
    for (int r = 0; r < m; r++) {
        a[r] = malloc(n * sizeof(int));
        memcpy(a[r], grid[r], n * sizeof(int));
        (*returnColumnSizes)[r] = n;
    }
    *returnSize = m;
    for (int step = 0; step < k % (m * n); step++) {
        int last = a[m - 1][n - 1];
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--)
                if (r == 0 && c == 0) a[0][0] = last;
                else if (c) a[r][c] = a[r][c - 1];
                else a[r][c] = a[r - 1][n - 1];
    }
    return a;
}`,
        cpp: `vector<vector<int>> shiftGrid(vector<vector<int>>& grid, int k) {
    vector<vector<int>> a = grid;
    int m = a.size(), n = a[0].size();
    for (int step = 0; step < k % (m * n); step++) {
        int last = a[m - 1][n - 1];
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--)
                if (r == 0 && c == 0) a[0][0] = last;
                else if (c) a[r][c] = a[r][c - 1];
                else a[r][c] = a[r - 1][n - 1];
    }
    return a;
}`,
        java: `List<List<Integer>> shiftGrid(int[][] grid, int k) {
    int m = grid.length, n = grid[0].length;
    int[][] a = new int[m][n];
    for (int r = 0; r < m; r++) a[r] = grid[r].clone();
    for (int step = 0; step < k % (m * n); step++) {
        int last = a[m - 1][n - 1];
        for (int r = m - 1; r >= 0; r--)
            for (int c = n - 1; c >= 0; c--)
                if (r == 0 && c == 0) a[0][0] = last;
                else if (c > 0) a[r][c] = a[r][c - 1];
                else a[r][c] = a[r - 1][n - 1];
    }
    List<List<Integer>> out = new ArrayList<>();
    for (int[] row : a) {
        List<Integer> values = new ArrayList<>();
        for (int x : row) values.add(x);
        out.add(values);
    }
    return out;
}`,
        javascript: `function shiftGrid(grid, k) {
  const a = grid.map(row => [...row]), m = a.length, n = a[0].length;
  for (let step = 0; step < k % (m * n); step++) {
    const last = a[m - 1][n - 1];
    for (let r = m - 1; r >= 0; r--)
      for (let c = n - 1; c >= 0; c--)
        if (r === 0 && c === 0) a[0][0] = last;
        else if (c) a[r][c] = a[r][c - 1];
        else a[r][c] = a[r - 1][n - 1];
  }
  return a;
}`,
      },
    },
  ],
  pitfalls: ['右下角的值會繞回左上角,不能丟失。', '逐次原地移動時要由後往前,避免用到已覆寫的值。', 'k 是整張矩陣的環狀位移,可先對 m×n 取餘數。'],
  check: { kind: 'fn', fn: 'shiftGrid', cases: [
    { args: [G, 1], out: shifted }, { args: [[[1]], 100], out: [[1]] },
    { args: [G, 9], out: G }, { args: [[[1, 2], [3, 4]], 2], out: [[3, 4], [1, 2]] },
  ] },
}
