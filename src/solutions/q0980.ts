import type { FigStep, Solution } from './types'

const G = [[1, 0, 0], [0, 0, 2]]
const view = (marks: Record<string, [number, number][]>) => ({ kind: 'grid' as const, cells: G, label: 'grid', marks })
const backFig: FigStep[] = [
  { note: '從起點 1 出發。共有 6 個非障礙格；抵達終點時必須剛好走過全部 6 格。', views: [view({ hl: [[0, 0]] })] },
  { note: '若先往右走，經過上排到終點 2 時，下排仍有未走的格子；這條路不算。', views: [view({ path: [[0, 0], [0, 1], [0, 2]], hl: [[1, 2]], dim: [[1, 0], [1, 1]] })] },
  { note: '回溯起點，改往下走，依序經過左下、中下、中上、右上。', views: [view({ path: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2]], hl: [[1, 2]] })] },
  { note: '最後進入終點時 6 格都走過，得到 1 條有效路徑；退出分支時還原拜訪標記。', views: [view({ done: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [1, 2]] })] },
]
const memoFig: FigStep[] = [
  { note: '給每格一個位元；走過的格子在 mask 中記為 1。起點先設為已走過。', views: [view({ hl: [[0, 0]] })] },
  { note: '狀態由「目前位置、已走格子的 mask」組成。往相鄰未走格移動就打開對應位元。', views: [view({ path: [[0, 0], [1, 0], [1, 1]] })] },
  { note: '到終點時，只在 mask 含全部 6 格時回傳 1；太早抵達就回傳 0。', views: [view({ path: [[0, 0], [0, 1], [0, 2]], hl: [[1, 2]], dim: [[1, 0], [1, 1]] })] },
  { note: '相同位置與 mask 的後續答案相同，可快取；此例完整路徑數為 1。', views: [view({ done: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [1, 2]] })] },
]

export const q0980: Solution = {
  id: 980,
  plain: '在網格上從起點走到終點，每個可走格都必須剛好走一次；數出路徑數。',
  statement: '矩陣中 1 是起點、2 是終點、0 是空格、−1 是障礙。只能上下左右走；回傳從起點到終點、且每個非障礙格恰好經過一次的路徑數。',
  examples: [
    { input: 'grid = [[1,0,0],[0,0,2]]', output: '1' },
    { input: 'grid = [[1,0,0,0],[0,0,0,0],[0,0,2,-1]]', output: '2' },
  ],
  constraints: ['1 ≤ m,n ≤ 20', 'm·n ≤ 20', '恰有一個起點與一個終點'],
  insight: ['只要提早走進終點，這條路即使抵達也不合格。', '回溯時暫時標記目前格，探索完再還原，才不會影響其他分支。', '格子總數不超過 20，可以用位元遮罩表示拜訪狀態。'],
  approaches: [
    {
      name: '原地標記與回溯',
      idea: '先數出可走格。DFS 每踏入一格就減少剩餘數量；到終點且剩餘為 1 才算成功。',
      steps: ['找起點並計算非障礙格數', 'DFS 若抵達終點，只在剩餘格數為 1 時計 1', '把目前格暫改為 −1，走向四個可走鄰格', '回來後還原目前格，累加所有分支'],
      figure: { title: 'grid = [[1,0,0],[0,0,2]]', steps: backFig },
      complexity: { time: 'O(4^V)', space: 'O(V)', why: '最多 V 層遞迴，每格嘗試四方向；障礙和已走格會剪枝。' },
      verdict: '最容易理解的 [[p:backtracking]] 寫法；格子至多 20，能直接探索。',
      code: {
        python: `def uniquePathsIII(grid):
    rows, cols = len(grid), len(grid[0])
    remain = 0
    start = (0, 0)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != -1:
                remain += 1             # 起點、終點也要走
            if grid[r][c] == 1:
                start = (r, c)

    def dfs(r, c, left):
        if grid[r][c] == 2:
            return int(left == 1)       # 終點必須是最後一格
        old = grid[r][c]
        grid[r][c] = -1                  # 暫時標記已走
        total = 0
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != -1:
                total += dfs(nr, nc, left - 1)
        grid[r][c] = old                 # 回溯，讓其他分支可走
        return total

    return dfs(*start, remain)`,
        c: `static int walk(int **grid, int rows, int cols, int r, int c, int left) {
    if (grid[r][c] == 2) {
        return left == 1;
    }
    int old = grid[r][c];
    grid[r][c] = -1;
    int ans = 0;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int k = 0; k < 4; k++) {
        int nr = r + dr[k];
        int nc = c + dc[k];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] != -1) {
            ans += walk(grid, rows, cols, nr, nc, left - 1);
        }
    }
    grid[r][c] = old;
    return ans;
}

int uniquePathsIII(int **grid, int gridSize, int *gridColSize) {
    int rows = gridSize;
    int cols = gridColSize[0];
    int left = 0;
    int sr = 0;
    int sc = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != -1) {
                left++;
            }
            if (grid[r][c] == 1) {
                sr = r;
                sc = c;
            }
        }
    }
    return walk(grid, rows, cols, sr, sc, left);
}`,
        cpp: `int uniquePathsIII(vector<vector<int>>& grid) {
    int rows = grid.size();
    int cols = grid[0].size();
    int left = 0;
    int sr = 0;
    int sc = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != -1) {
                left++;
            }
            if (grid[r][c] == 1) {
                sr = r;
                sc = c;
            }
        }
    }
    function<int(int, int, int)> dfs = [&](int r, int c, int remain) {
        if (grid[r][c] == 2) {
            return remain == 1 ? 1 : 0;
        }
        int old = grid[r][c];
        grid[r][c] = -1;
        int ans = 0;
        for (auto [dr, dc] : vector<pair<int, int>>{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}) {
            int nr = r + dr;
            int nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] != -1) {
                ans += dfs(nr, nc, remain - 1);
            }
        }
        grid[r][c] = old;
        return ans;
    };
    return dfs(sr, sc, left);
}`,
        java: `int uniquePathsIII(int[][] grid) {
    int rows = grid.length;
    int cols = grid[0].length;
    int left = 0;
    int sr = 0;
    int sc = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] != -1) {
                left++;
            }
            if (grid[r][c] == 1) {
                sr = r;
                sc = c;
            }
        }
    }
    return walk(grid, sr, sc, left);
}

int walk(int[][] grid, int r, int c, int left) {
    if (grid[r][c] == 2) {
        return left == 1 ? 1 : 0;
    }
    int old = grid[r][c];
    grid[r][c] = -1;
    int ans = 0;
    int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] d : directions) {
        int nr = r + d[0];
        int nc = c + d[1];
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc] != -1) {
            ans += walk(grid, nr, nc, left - 1);
        }
    }
    grid[r][c] = old;
    return ans;
}`,
        javascript: `function uniquePathsIII(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let left = 0;
  let sr = 0;
  let sc = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== -1) {
        left++;
      }
      if (grid[r][c] === 1) {
        sr = r;
        sc = c;
      }
    }
  }
  function dfs(r, c, remain) {
    if (grid[r][c] === 2) {
      return remain === 1 ? 1 : 0;
    }
    const old = grid[r][c];
    grid[r][c] = -1;
    let ans = 0;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== -1) {
        ans += dfs(nr, nc, remain - 1);
      }
    }
    grid[r][c] = old;
    return ans;
  }
  return dfs(sr, sc, left);
}`,
      },
    },
    {
      name: '位元遮罩與記憶化',
      idea: '以 mask 記錄已走格，快取每個「目前位置、mask」狀態的後續路徑數。',
      steps: ['把每格對應到位元，建立所有可走格的 full mask', '起點位元先設為 1', 'DFS 只走相鄰且位元尚未設為 1 的格子', '抵達終點時比較 mask 與 full，並快取每個狀態'],
      figure: { title: 'grid = [[1,0,0],[0,0,2]]', steps: memoFig },
      complexity: { time: 'O(V·2^V)', space: 'O(V·2^V)', why: '每個位置與 mask 組合最多計算一次。' },
      verdict: '展示 [[p:bitmask-dp]]；若同一狀態可由不同路徑到達，快取能省下重複探索。',
      code: {
        python: `from functools import lru_cache

def uniquePathsIII(grid):
    rows, cols = len(grid), len(grid[0])
    full = 0
    start = end = 0
    for r in range(rows):
        for c in range(cols):
            bit = 1 << (r * cols + c)
            if grid[r][c] != -1:
                full |= bit              # 所有必須走到的格子
            if grid[r][c] == 1:
                start = r * cols + c
            if grid[r][c] == 2:
                end = r * cols + c

    @lru_cache(None)
    def dfs(pos, mask):
        if pos == end:
            return int(mask == full)     # 提早抵達不計入
        r, c = divmod(pos, cols)
        total = 0
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != -1:
                nxt = nr * cols + nc
                if not mask & (1 << nxt):
                    total += dfs(nxt, mask | (1 << nxt))
        return total

    return dfs(start, 1 << start)`,
        c: `static int countMask(int **grid, int rows, int cols, int pos, int end, int mask, int full, int *memo) {
    if (pos == end) {
        return mask == full;
    }
    int cells = rows * cols;
    int key = mask * cells + pos;
    if (memo[key] != -1) {
        return memo[key];
    }
    int ans = 0;
    int r = pos / cols;
    int c = pos % cols;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int k = 0; k < 4; k++) {
        int nr = r + dr[k];
        int nc = c + dc[k];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] == -1) {
            continue;
        }
        int next = nr * cols + nc;
        if (!(mask & (1 << next))) {
            ans += countMask(grid, rows, cols, next, end, mask | (1 << next), full, memo);
        }
    }
    memo[key] = ans;
    return ans;
}

int uniquePathsIII(int **grid, int gridSize, int *gridColSize) {
    int rows = gridSize;
    int cols = gridColSize[0];
    int cells = rows * cols;
    int full = 0;
    int start = 0;
    int end = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            int pos = r * cols + c;
            if (grid[r][c] != -1) {
                full |= 1 << pos;
            }
            if (grid[r][c] == 1) {
                start = pos;
            }
            if (grid[r][c] == 2) {
                end = pos;
            }
        }
    }
    int states = (1 << cells) * cells;
    int *memo = malloc(states * sizeof(int));
    for (int i = 0; i < states; i++) {
        memo[i] = -1;
    }
    int ans = countMask(grid, rows, cols, start, end, 1 << start, full, memo);
    free(memo);
    return ans;
}`,
        cpp: `int uniquePathsIII(vector<vector<int>>& grid) {
    int rows = grid.size();
    int cols = grid[0].size();
    int full = 0;
    int start = 0;
    int end = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            int pos = r * cols + c;
            if (grid[r][c] != -1) {
                full |= 1 << pos;
            }
            if (grid[r][c] == 1) {
                start = pos;
            }
            if (grid[r][c] == 2) {
                end = pos;
            }
        }
    }
    unordered_map<long long, int> memo;
    function<int(int, int)> dfs = [&](int pos, int mask) {
        if (pos == end) {
            return mask == full ? 1 : 0;
        }
        long long key = ((long long)mask << 5) | pos;
        if (memo.count(key)) {
            return memo[key];
        }
        int r = pos / cols;
        int c = pos % cols;
        int ans = 0;
        for (auto [dr, dc] : vector<pair<int, int>>{{1, 0}, {-1, 0}, {0, 1}, {0, -1}}) {
            int nr = r + dr;
            int nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] == -1) {
                continue;
            }
            int next = nr * cols + nc;
            if (!(mask & (1 << next))) {
                ans += dfs(next, mask | (1 << next));
            }
        }
        return memo[key] = ans;
    };
    return dfs(start, 1 << start);
}`,
        java: `Map<Long, Integer> memo = new HashMap<>();
int[][] cells;
int rows;
int cols;
int end;
int full;

int uniquePathsIII(int[][] grid) {
    cells = grid;
    rows = grid.length;
    cols = grid[0].length;
    full = 0;
    int start = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            int pos = r * cols + c;
            if (grid[r][c] != -1) {
                full |= 1 << pos;
            }
            if (grid[r][c] == 1) {
                start = pos;
            }
            if (grid[r][c] == 2) {
                end = pos;
            }
        }
    }
    memo.clear();
    return dfs(start, 1 << start);
}

int dfs(int pos, int mask) {
    if (pos == end) {
        return mask == full ? 1 : 0;
    }
    long key = ((long) mask << 5) | pos;
    if (memo.containsKey(key)) {
        return memo.get(key);
    }
    int r = pos / cols;
    int c = pos % cols;
    int ans = 0;
    int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int[] d : directions) {
        int nr = r + d[0];
        int nc = c + d[1];
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || cells[nr][nc] == -1) {
            continue;
        }
        int next = nr * cols + nc;
        if ((mask & (1 << next)) == 0) {
            ans += dfs(next, mask | (1 << next));
        }
    }
    memo.put(key, ans);
    return ans;
}`,
        javascript: `function uniquePathsIII(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let full = 0;
  let start = 0;
  let end = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pos = r * cols + c;
      if (grid[r][c] !== -1) {
        full |= 1 << pos;
      }
      if (grid[r][c] === 1) {
        start = pos;
      }
      if (grid[r][c] === 2) {
        end = pos;
      }
    }
  }
  const memo = new Map();
  function dfs(pos, mask) {
    if (pos === end) {
      return mask === full ? 1 : 0;
    }
    const key = mask * 32 + pos;
    if (memo.has(key)) {
      return memo.get(key);
    }
    const r = Math.floor(pos / cols);
    const c = pos % cols;
    let ans = 0;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] === -1) {
        continue;
      }
      const next = nr * cols + nc;
      if ((mask & (1 << next)) === 0) {
        ans += dfs(next, mask | (1 << next));
      }
    }
    memo.set(key, ans);
    return ans;
  }
  return dfs(start, 1 << start);
}`,
      },
    },
  ],
  pitfalls: ['不能提早抵達終點；此時尚有空格未走。', '回溯法每條分支結束都必須還原網格。', '遮罩法以實際格子位置編位元，障礙格不放進 full。'],
  check: { kind: 'fn', fn: 'uniquePathsIII', cases: [
    { args: [G], out: 1 },
    { args: [[[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, -1]]], out: 2 },
    { args: [[[1, 0], [0, 2]]], out: 0 },
    { args: [[[1, 2]]], out: 1 },
  ] },
}
