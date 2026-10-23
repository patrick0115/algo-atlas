import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 463. Island Perimeter

const G = [
  [0, 1, 0, 0],
  [1, 1, 1, 0],
  [0, 1, 0, 0],
  [1, 1, 0, 0],
]

const land: Cell[] = G.flatMap((row, r) => row.flatMap((v, c) => (v ? [[r, c] as Cell] : [])))
const water: Cell[] = G.flatMap((row, r) => row.flatMap((v, c) => (v ? [] : [[r, c] as Cell])))

function view(label: string, cells: (string | number)[][], hl: Cell[] = []): GridViewData {
  return { kind: 'grid', label, cells, marks: { land, water, hl } }
}

function edgeFig(): FigStep[] {
  const cnt = G.map((row, r) =>
    row.map((v, c) => {
      if (!v) return ''
      let e = 0
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nc < 0 || nr >= G.length || nc >= G[0].length || !G[nr][nc]) e++
      }
      return e
    }),
  )
  return [
    { note: '周長 = 陸地格子「面向水或邊界」的邊數。每塊陸地有 4 條邊,逐一檢查四個方向', views: [view('grid(1 = 陸地)', G.map((row) => row.map((v) => (v ? 1 : ''))))] },
    { note: '格子裡的數字 = 這塊陸地貢獻幾條外邊。例如 (0,1) 只有下方是陸地 → 3 條', views: [view('每格的外邊數', cnt, [[0, 1]])] },
    { note: '全部加起來 3 + 3 + 0 + 3 + 2 + 3 + 2 = 16(中間那格四面都是陸地,貢獻 0)', views: [arr([16], { label: '周長', done: [0] })] },
  ]
}

function countFig(): FigStep[] {
  return [
    { note: '公式版:每塊陸地 4 條邊,每有一對相鄰的陸地,兩邊各少 1 條 → 周長 = 4 × 陸地數 − 2 × 相鄰對數', views: [view('grid', G.map((row) => row.map((v) => (v ? 1 : ''))))] },
    { note: '陸地 7 塊,相鄰對 6 對(只數「右邊」和「下面」避免重複)→ 28 − 12 = 16', views: [arr([7, 6, 16], { label: '陸地 / 相鄰對 / 周長', done: [2] })] },
  ]
}

export const q0463: Solution = {
  id: 463,
  plain: '一張方格地圖,1 是陸地、0 是水,地圖上剛好只有一座島(沒有湖)。算這座島的周長。',
  statement: '給 `row × col` 的網格 `grid`,1 代表陸地、0 代表水。格子只能水平或垂直相連,網格中**恰有一座島**且島內沒有湖。每格邊長為 1,回傳島的周長。',
  examples: [
    { input: 'grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]', output: '16' },
    { input: 'grid = [[1]]', output: '4' },
    { input: 'grid = [[1,0]]', output: '4' },
  ],
  constraints: ['row, col ≤ 100'],
  insight: ['不用 DFS:周長只跟「每條邊兩側是不是陸地」有關', '每塊陸地 4 條邊,和其他陸地共用的邊不算', '4 × 陸地 − 2 × 相鄰對'],
  approaches: [
    {
      name: '逐格數外邊',
      idea: '每個陸地格檢查四個方向,鄰居是水或超出邊界就 +1。',
      steps: ['`for` 每個格子', '是陸地 → 看上下左右', '出界或是水 → `perim += 1`'],
      figure: { title: 'grid(4 × 4)', steps: edgeFig() },
      complexity: { time: 'O(R · C)', space: 'O(1)', why: '每格看 4 個鄰居。' },
      verdict: '最推薦,最直接地照定義數;雖然是島嶼題,卻不需要[[p:graph-traversal]]。',
      code: {
        python: `def islandPerimeter(grid):
    R, C = len(grid), len(grid[0])
    perim = 0
    for r in range(R):
        for c in range(C):
            if not grid[r][c]:
                continue
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if not (0 <= nr < R and 0 <= nc < C) or not grid[nr][nc]:
                    perim += 1                # 這條邊外面是水或邊界
    return perim`,
        c: `int islandPerimeter(int **grid, int gridSize, int *gridColSize) {
    int R = gridSize, C = gridColSize[0], perim = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (!grid[r][c]) continue;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C || !grid[nr][nc]) perim++;
            }
        }
    return perim;
}`,
        cpp: `int islandPerimeter(vector<vector<int>>& grid) {
    int R = grid.size(), C = grid[0].size(), perim = 0;
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (!grid[r][c]) continue;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C || !grid[nr][nc]) perim++;
            }
        }
    return perim;
}`,
        java: `int islandPerimeter(int[][] grid) {
    int R = grid.length, C = grid[0].length, perim = 0;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 0) continue;
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc] == 0) perim++;
            }
        }
    return perim;
}`,
        javascript: `function islandPerimeter(grid) {
  const R = grid.length, C = grid[0].length;
  let perim = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (!grid[r][c]) continue;
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]])
        if (nr < 0 || nc < 0 || nr >= R || nc >= C || !grid[nr][nc]) perim++;
    }
  return perim;
}`,
      },
    },
    {
      name: '4 × 陸地 − 2 × 相鄰對',
      idea: '數陸地數 land 與相鄰對數 adj(只看右邊、下面);答案 `4 × land − 2 × adj`。',
      steps: ['`for` 每個陸地格:`land += 1`', '右邊是陸地 → `adj += 1`;下面是陸地 → `adj += 1`', '回傳 `4 * land − 2 * adj`'],
      figure: { title: 'grid(4 × 4)', steps: countFig() },
      complexity: { time: 'O(R · C)', space: 'O(1)', why: '每格看 2 個鄰居。' },
      verdict: '換個角度數:每條共用邊讓周長少 2。',
      code: {
        python: `def islandPerimeter(grid):
    R, C = len(grid), len(grid[0])
    land = adj = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c]:
                land += 1
                if c + 1 < C and grid[r][c + 1]:
                    adj += 1                  # 和右邊共用一條邊
                if r + 1 < R and grid[r + 1][c]:
                    adj += 1                  # 和下面共用一條邊
    return 4 * land - 2 * adj`,
        c: `int islandPerimeter(int **grid, int gridSize, int *gridColSize) {
    int R = gridSize, C = gridColSize[0], land = 0, adj = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (!grid[r][c]) continue;
            land++;
            if (c + 1 < C && grid[r][c + 1]) adj++;
            if (r + 1 < R && grid[r + 1][c]) adj++;
        }
    return 4 * land - 2 * adj;
}`,
        cpp: `int islandPerimeter(vector<vector<int>>& grid) {
    int R = grid.size(), C = grid[0].size(), land = 0, adj = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (!grid[r][c]) continue;
            land++;
            if (c + 1 < C && grid[r][c + 1]) adj++;
            if (r + 1 < R && grid[r + 1][c]) adj++;
        }
    return 4 * land - 2 * adj;
}`,
        java: `int islandPerimeter(int[][] grid) {
    int R = grid.length, C = grid[0].length, land = 0, adj = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 0) continue;
            land++;
            if (c + 1 < C && grid[r][c + 1] == 1) adj++;
            if (r + 1 < R && grid[r + 1][c] == 1) adj++;
        }
    return 4 * land - 2 * adj;
}`,
        javascript: `function islandPerimeter(grid) {
  const R = grid.length, C = grid[0].length;
  let land = 0, adj = 0;
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++) {
      if (!grid[r][c]) continue;
      land++;
      if (c + 1 < C && grid[r][c + 1]) adj++;
      if (r + 1 < R && grid[r + 1][c]) adj++;
    }
  return 4 * land - 2 * adj;
}`,
      },
    },
  ],
  pitfalls: ['相鄰對四個方向都數:每對會被算兩次', '忘了網格邊界也算外邊'],
  check: {
    kind: 'fn',
    fn: 'islandPerimeter',
    cases: [
      { args: [G], out: 16 },
      { args: [[[1]]], out: 4 },
      { args: [[[1, 0]]], out: 4 },
      { args: [[[1, 1], [1, 1]]], out: 8 },
    ],
  },
}
