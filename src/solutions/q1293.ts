import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

const G = [[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]]
const view = (hl: Cell[]): GridViewData => ({ kind: 'grid', label: '0 可走，1 障礙', cells: G, marks: { hl } })
const stateFig: FigStep[] = [
  { note: '起點 (0,0)，還可消除 1 個障礙；BFS 先走所有距離 1 的狀態。', views: [view([[0, 0]]), arr([1], { label: '剩餘消除次數' })] },
  { note: '沿頂列到 (0,2)，距離 2，仍可消除 1 次。往下走 (1,2) 也不耗次數。', views: [view([[0, 0], [0, 1], [0, 2]]), arr([1], { label: '剩餘消除次數' })] },
  { note: '走到 (2,2) 後，下一格 (3,2) 是障礙；花掉一次消除機會，距離變 5、剩餘 0。', views: [view([[2, 2], [3, 2]]), arr([0], { label: '剩餘消除次數' })] },
  { note: '再走一步到終點 (4,2)，最短距離是 6。即使同一格曾到過，只要剩餘次數不同仍是不同狀態。', views: [view([[3, 2], [4, 2]]), arr([6], { label: '最短步數', done: [0] })] },
]
const pruneFig: FigStep[] = [
  { note: '到 (0,2) 時還剩 1 次，記錄這是目前到該格最有利的狀態。', views: [view([[0, 2]]), arr([1], { label: '該格最佳剩餘次數' })] },
  { note: '若另一條同長或更長的路到 (0,2) 只剩 0 次，它往後的選擇更少，可以丟掉。', views: [view([[0, 2]]), arr([1, 0], { label: '保留 / 略過' })] },
  { note: '到 (3,2) 花掉一次消除，剩 0 次；記錄最佳值 0，仍可走向終點。', views: [view([[3, 2]]), arr([0], { label: '最佳剩餘次數' })] },
  { note: 'BFS 第 6 層到 (4,2)，立刻回傳 6。剪枝只省去不可能更好的重複狀態。', views: [view([[4, 2]]), arr([6], { label: '答案', done: [0] })] },
]

export const q1293: Solution = {
  id: 1293,
  plain: '在格子迷宮裡走最短路，可以拆掉最多 k 道牆；同一格帶著不同拆牆次數，後續選擇也不同。',
  statement: 'grid 的 0 可走、1 是障礙。從左上到右下，每步上下左右移動，可消除至多 k 個障礙。回傳最少步數，無法抵達回傳 -1。',
  examples: [{ input: 'grid = [[0,0,0],[1,1,0],[0,0,0],[0,1,1],[0,0,0]], k = 1', output: '6' }, { input: 'grid = [[0,1,1],[1,1,1],[1,0,0]], k = 1', output: '-1' }],
  constraints: ['格子長寬至多 40；起點和終點都是 0。', '若 k 足夠拆掉曼哈頓最短路上的所有障礙，可直接回傳 rows+cols−2。'],
  insight: ['普通 BFS 的狀態只有座標；這題還必須加上「剩餘幾次消除」。', '完整 [[p:graph-traversal]] 可用三維 visited。', '同一格若已在更短或相同步數抵達，且剩餘次數更多，較差狀態可剪掉。'],
  approaches: [
    {
      name: '三維狀態 BFS', idea: '把 (列、行、剩餘消除次數) 當作一個狀態，按步數逐層擴展。',
      steps: ['起點狀態是 (0,0,k)。', '往鄰格走時，若是障礙就扣一次。', '相同三維狀態只入隊一次。', '第一次出隊終點時回傳步數。'],
      figure: { title: '範例迷宮，k = 1', steps: stateFig },
      complexity: { time: 'O(mnk)', space: 'O(mnk)', why: '每格最多有 k+1 種剩餘次數。' },
      verdict: '狀態定義最直接；適合先確認正確性。',
      code: {
        python: `from collections import deque

def shortestPath(grid, k):
    rows, cols = len(grid), len(grid[0])
    if k >= rows + cols - 2:
        return rows + cols - 2
    queue = deque([(0, 0, k, 0)])
    seen = {(0, 0, k)}
    while queue:
        r, c, left, steps = queue.popleft()
        if r == rows - 1 and c == cols - 1:
            return steps  # BFS 第一次抵達就是最短路
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                remain = left - grid[nr][nc]  # 障礙會消耗一次
                state = (nr, nc, remain)
                if remain >= 0 and state not in seen:
                    seen.add(state)
                    queue.append((nr, nc, remain, steps + 1))
    return -1`,
        c: `typedef struct {
    int row;
    int col;
    int left;
    int steps;
} State1293;

int shortestPath(int **grid, int gridSize, int *gridColSize, int k) {
    int rows = gridSize;
    int cols = gridColSize[0];
    if (k >= rows + cols - 2) {
        return rows + cols - 2;
    }
    int capacity = rows * cols * (k + 1);
    unsigned char *seen = calloc(capacity, 1);
    State1293 *queue = malloc(capacity * sizeof(State1293));
    int front = 0;
    int back = 0;
    queue[back++] = (State1293) {0, 0, k, 0};
    seen[k] = 1;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int answer = -1;
    while (front < back) {
        State1293 state = queue[front++];
        if (state.row == rows - 1 && state.col == cols - 1) {
            answer = state.steps;
            break;
        }
        for (int d = 0; d < 4; d++) {
            int nr = state.row + dr[d];
            int nc = state.col + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                continue;
            }
            int left = state.left - grid[nr][nc];
            if (left < 0) {
                continue;
            }
            int id = (nr * cols + nc) * (k + 1) + left;
            if (!seen[id]) {
                seen[id] = 1;
                queue[back++] = (State1293) {nr, nc, left, state.steps + 1};
            }
        }
    }
    free(seen);
    free(queue);
    return answer;
}`,
        cpp: `int shortestPath(vector<vector<int>>& grid, int k) {
    int rows = grid.size();
    int cols = grid[0].size();
    if (k >= rows + cols - 2) {
        return rows + cols - 2;
    }
    vector<vector<vector<bool>>> seen(rows, vector<vector<bool>>(cols, vector<bool>(k + 1)));
    queue<array<int, 4>> states;
    states.push({0, 0, k, 0});
    seen[0][0][k] = true;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    while (!states.empty()) {
        auto [r, c, left, steps] = states.front();
        states.pop();
        if (r == rows - 1 && c == cols - 1) {
            return steps;
        }
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                continue;
            }
            int remain = left - grid[nr][nc];
            if (remain >= 0 && !seen[nr][nc][remain]) {
                seen[nr][nc][remain] = true;
                states.push({nr, nc, remain, steps + 1});
            }
        }
    }
    return -1;
}`,
        java: `int shortestPath(int[][] grid, int k) {
    int rows = grid.length;
    int cols = grid[0].length;
    if (k >= rows + cols - 2) {
        return rows + cols - 2;
    }
    boolean[][][] seen = new boolean[rows][cols][k + 1];
    Deque<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[] {0, 0, k, 0});
    seen[0][0][k] = true;
    int[] dr = {1, -1, 0, 0};
    int[] dc = {0, 0, 1, -1};
    while (!queue.isEmpty()) {
        int[] state = queue.poll();
        if (state[0] == rows - 1 && state[1] == cols - 1) {
            return state[3];
        }
        for (int d = 0; d < 4; d++) {
            int nr = state[0] + dr[d];
            int nc = state[1] + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                continue;
            }
            int remain = state[2] - grid[nr][nc];
            if (remain >= 0 && !seen[nr][nc][remain]) {
                seen[nr][nc][remain] = true;
                queue.offer(new int[] {nr, nc, remain, state[3] + 1});
            }
        }
    }
    return -1;
}`,
        javascript: `function shortestPath(grid, k) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (k >= rows + cols - 2) {
    return rows + cols - 2;
  }
  const seen = new Set(['0,0,' + k]);
  const queue = [[0, 0, k, 0]];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let front = 0; front < queue.length; front++) {
    const [r, c, left, steps] = queue[front];
    if (r === rows - 1 && c === cols - 1) {
      return steps;
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        continue;
      }
      const remain = left - grid[nr][nc];
      const key = nr + ',' + nc + ',' + remain;
      if (remain >= 0 && !seen.has(key)) {
        seen.add(key);
        queue.push([nr, nc, remain, steps + 1]);
      }
    }
  }
  return -1;
}`,
      },
    },
    {
      name: '記錄每格最佳剩餘次數', idea: '同一格只保留剩餘消除次數比舊紀錄更好的狀態。',
      steps: ['best[r][c] 記目前看過的最大剩餘次數，初始皆 -1。', 'BFS 擴展鄰格，扣除障礙花費。', '只有 remain > best[nr][nc] 才更新並入隊。', '第一次到終點即回傳距離。'],
      figure: { title: '範例迷宮，k = 1', steps: pruneFig },
      complexity: { time: 'O(mnk)', space: 'O(mnk)', why: '每格剩餘次數最多改進 k+1 次；通常比完整三維 visited 少很多狀態。' },
      verdict: '推薦解法，剪去到同一格卻剩更少機會的路。',
      code: {
        python: `from collections import deque

def shortestPath(grid, k):
    rows, cols = len(grid), len(grid[0])
    if k >= rows + cols - 2:
        return rows + cols - 2
    best = [[-1] * cols for _ in range(rows)]
    best[0][0] = k
    queue = deque([(0, 0, k, 0)])
    while queue:
        r, c, left, steps = queue.popleft()
        if r == rows - 1 and c == cols - 1:
            return steps  # BFS 首次到終點最短
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                remain = left - grid[nr][nc]
                if remain > best[nr][nc]:
                    best[nr][nc] = remain  # 只保留更有利的剩餘次數
                    queue.append((nr, nc, remain, steps + 1))
    return -1`,
        c: `typedef struct {
    int row;
    int col;
    int left;
    int steps;
} State1293;

int shortestPath(int **grid, int gridSize, int *gridColSize, int k) {
    int rows = gridSize;
    int cols = gridColSize[0];
    if (k >= rows + cols - 2) {
        return rows + cols - 2;
    }
    int capacity = rows * cols * (k + 1);
    int *best = malloc(rows * cols * sizeof(int));
    State1293 *queue = malloc(capacity * sizeof(State1293));
    for (int i = 0; i < rows * cols; i++) {
        best[i] = -1;
    }
    best[0] = k;
    int front = 0;
    int back = 0;
    queue[back++] = (State1293) {0, 0, k, 0};
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int answer = -1;
    while (front < back) {
        State1293 state = queue[front++];
        if (state.row == rows - 1 && state.col == cols - 1) {
            answer = state.steps;
            break;
        }
        for (int d = 0; d < 4; d++) {
            int nr = state.row + dr[d];
            int nc = state.col + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                continue;
            }
            int left = state.left - grid[nr][nc];
            if (left > best[nr * cols + nc]) {
                best[nr * cols + nc] = left;
                queue[back++] = (State1293) {nr, nc, left, state.steps + 1};
            }
        }
    }
    free(best);
    free(queue);
    return answer;
}`,
        cpp: `int shortestPath(vector<vector<int>>& grid, int k) {
    int rows = grid.size();
    int cols = grid[0].size();
    if (k >= rows + cols - 2) {
        return rows + cols - 2;
    }
    vector<vector<int>> best(rows, vector<int>(cols, -1));
    queue<array<int, 4>> states;
    states.push({0, 0, k, 0});
    best[0][0] = k;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    while (!states.empty()) {
        auto [r, c, left, steps] = states.front();
        states.pop();
        if (r == rows - 1 && c == cols - 1) {
            return steps;
        }
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                continue;
            }
            int remain = left - grid[nr][nc];
            if (remain > best[nr][nc]) {
                best[nr][nc] = remain;
                states.push({nr, nc, remain, steps + 1});
            }
        }
    }
    return -1;
}`,
        java: `int shortestPath(int[][] grid, int k) {
    int rows = grid.length;
    int cols = grid[0].length;
    if (k >= rows + cols - 2) {
        return rows + cols - 2;
    }
    int[][] best = new int[rows][cols];
    for (int[] row : best) {
        Arrays.fill(row, -1);
    }
    Deque<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[] {0, 0, k, 0});
    best[0][0] = k;
    int[] dr = {1, -1, 0, 0};
    int[] dc = {0, 0, 1, -1};
    while (!queue.isEmpty()) {
        int[] state = queue.poll();
        if (state[0] == rows - 1 && state[1] == cols - 1) {
            return state[3];
        }
        for (int d = 0; d < 4; d++) {
            int nr = state[0] + dr[d];
            int nc = state[1] + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
                continue;
            }
            int remain = state[2] - grid[nr][nc];
            if (remain > best[nr][nc]) {
                best[nr][nc] = remain;
                queue.offer(new int[] {nr, nc, remain, state[3] + 1});
            }
        }
    }
    return -1;
}`,
        javascript: `function shortestPath(grid, k) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (k >= rows + cols - 2) {
    return rows + cols - 2;
  }
  const best = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  best[0][0] = k;
  const queue = [[0, 0, k, 0]];
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let front = 0; front < queue.length; front++) {
    const [r, c, left, steps] = queue[front];
    if (r === rows - 1 && c === cols - 1) {
      return steps;
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
        continue;
      }
      const remain = left - grid[nr][nc];
      if (remain > best[nr][nc]) {
        best[nr][nc] = remain;
        queue.push([nr, nc, remain, steps + 1]);
      }
    }
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['同一格可能以不同剩餘次數到達，不可只用二維 boolean visited。', '消除機會不能變成負數。', '開始與終點都可能在同一格，此時答案是 0。'],
  check: { kind: 'fn', fn: 'shortestPath', cases: [
    { args: [G, 1], out: 6 },
    { args: [[[0, 1, 1], [1, 1, 1], [1, 0, 0]], 1], out: -1 },
    { args: [[[0]], 0], out: 0 },
    { args: [[[0, 1], [1, 0]], 1], out: 2 },
  ] },
}
