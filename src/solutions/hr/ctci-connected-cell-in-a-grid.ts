import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const GRID = [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [1, 0, 0, 0]]
const DIRS = [-1, 0, 1].flatMap(dr => [-1, 0, 1].filter(dc => dr !== 0 || dc !== 0).map(dc => [dr, dc]))

function bruteFig(): FigStep[] {
  const out: FigStep[] = []
  let best = 0
  for (let r = 0; r < GRID.length; r++) for (let c = 0; c < GRID[0].length; c++) {
    if (!GRID[r][c]) continue
    const seen = GRID.map(row => row.map(() => false))
    const stack = [[r, c]]
    seen[r][c] = true
    let size = 0
    while (stack.length) {
      const [x, y] = stack.pop()!
      size++
      for (const [dr, dc] of DIRS) {
        const nr = x + dr, nc = y + dc
        if (nr >= 0 && nr < GRID.length && nc >= 0 && nc < GRID[0].length && GRID[nr][nc] && !seen[nr][nc]) { seen[nr][nc] = true; stack.push([nr, nc]) }
      }
      if (r + c < 3 || stack.length === 0) out.push({ note: `從 (${r},${c}) 重找區域；已走到 (${x},${y})，本次大小 ${size}，待探索 ${stack.length} 格。`, views: [{ kind: 'grid', label: '1 為實心格，外框是當前格', cells: GRID, marks: { hl: [[x, y]], done: seen.flatMap((row, i) => row.flatMap((v, j) => v ? [[i, j] as [number, number]] : [])) } }, arr([size, best], { label: '本次大小、先前最大' })] })
    }
    best = Math.max(best, size)
  }
  return out
}

function visitedFig(): FigStep[] {
  const seen = GRID.map(row => row.map(() => false)), out: FigStep[] = []
  let best = 0
  for (let r = 0; r < GRID.length; r++) for (let c = 0; c < GRID[0].length; c++) {
    if (!GRID[r][c] || seen[r][c]) continue
    const stack = [[r, c]]
    seen[r][c] = true
    let size = 0
    while (stack.length) {
      const [x, y] = stack.pop()!
      size++
      for (const [dr, dc] of DIRS) {
        const nr = x + dr, nc = y + dc
        if (nr >= 0 && nr < GRID.length && nc >= 0 && nc < GRID[0].length && GRID[nr][nc] && !seen[nr][nc]) { seen[nr][nc] = true; stack.push([nr, nc]) }
      }
      best = Math.max(best, size)
      out.push({ note: `本區從 (${r},${c}) 出發，取出 (${x},${y})；目前 ${size} 格，最大暫為 ${best}，堆疊尚有 ${stack.length} 格。`, views: [{ kind: 'grid', label: '全域已訪格', cells: GRID, marks: { hl: [[x, y]], done: seen.flatMap((row, i) => row.flatMap((v, j) => v ? [[i, j] as [number, number]] : [])) } }, arr([size, best, stack.length], { label: '本區大小、最大、待探索' })] })
    }
  }
  return out
}

export const hrCtciConnectedCellInAGrid: HrSolution = {
  slug: 'ctci-connected-cell-in-a-grid',
  plain: '像在方格紙上找一整片相連的實心格；角對角碰到也算連在一起，求最大的一片有幾格。',
  statement: '輸入 0/1 矩陣。值為 1 的格子若在水平、垂直或對角相鄰，就屬於同一區域；連接關係可繼續傳遞。回傳最大區域包含的 1 格數量，沒有 1 就是 0。',
  examples: [
    { input: 'grid = [[1,1,0,0],[0,1,1,0],[0,0,1,0],[1,0,0,0]]', output: '5', note: '左上到中間的五個 1 連成一區；左下的 1 獨立。' },
    { input: 'grid = [[1,0],[0,1]]', output: '2', note: '兩個 1 雖不共邊，但對角相鄰。' },
  ],
  constraints: [
    '矩陣有列與欄 → 每格最多檢查八個方向，適合圖遍歷。',
    '區域只由值為 1 的格組成 → 0 格不能入隊。',
    '相鄰包含對角線 → 只用上下左右會漏掉區域。',
  ],
  insight: [
    '可從每個 1 格各做一次搜尋，數出它所屬的區域；但同一片會被重複搜尋許多遍。',
    '每格所屬區域固定，第一次探索後就標為已訪；後續遇到同區格直接跳過。',
    '用 [[p:graph-traversal]] 的 DFS 或 BFS，在八方向擴張，每個 1 格只處理一次。這和 [695](#/q/695) 類似，但此題還算對角相鄰。',
  ],
  approaches: [
    {
      name: '每格重新搜尋',
      idea: '從每個 1 格各自探索完整區域，取最大值。',
      steps: ['逐格掃矩陣，跳過 0。', '每個 1 格都重新建立一張局部已訪表。', '從它出發檢查八方向，數出整片區域大小。', '更新最大值。'],
      figure: { title: '四列四欄範例', steps: bruteFig() },
      complexity: { time: 'O((RC)²)', space: 'O(RC)', why: '最多 RC 個起點，每次可能重走 RC 格；局部已訪表也是 RC 大小。' },
      verdict: '概念直接，但同一大片區域會被重走許多次。',
      code: {
        python: `def maxRegion(grid):
    rows, cols = len(grid), len(grid[0])
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 0:
                continue
            seen = [[False] * cols for _ in range(rows)]
            stack = [(r, c)]
            seen[r][c] = True
            size = 0
            while stack:
                x, y = stack.pop()
                size += 1
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] and not seen[nx][ny]:
                            seen[nx][ny] = True
                            stack.append((nx, ny))  # 包含對角方向
            best = max(best, size)
    return best`,
        c: `int maxRegion(int grid_rows, int grid_columns, int** grid) {
    int total = grid_rows * grid_columns, best = 0;
    for (int start = 0; start < total; start++) {
        if (!grid[start / grid_columns][start % grid_columns]) continue;
        char* seen = calloc(total, 1);
        int* stack = malloc(total * sizeof(int));
        int top = 0, size = 0;
        stack[top++] = start; seen[start] = 1;
        while (top) {
            int u = stack[--top], r = u / grid_columns, c = u % grid_columns;
            size++;
            for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= grid_rows || nc < 0 || nc >= grid_columns) continue;
                int v = nr * grid_columns + nc;
                if (grid[nr][nc] && !seen[v]) { seen[v] = 1; stack[top++] = v; }
            }
        }
        if (size > best) best = size;
        free(seen); free(stack);
    }
    return best;
}`,
        cpp: `int maxRegion(vector<vector<int>> grid) {
    int rows = grid.size(), cols = grid[0].size(), best = 0;
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
        if (!grid[r][c]) continue;
        vector<vector<bool>> seen(rows, vector<bool>(cols));
        vector<pair<int, int>> stack = {{r, c}}; seen[r][c] = true;
        int size = 0;
        while (!stack.empty()) {
            auto [x, y] = stack.back(); stack.pop_back(); size++;
            for (int dx = -1; dx <= 1; dx++) for (int dy = -1; dy <= 1; dy++) {
                int nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid[nx][ny] && !seen[nx][ny]) {
                    seen[nx][ny] = true; stack.push_back({nx, ny});
                }
            }
        }
        best = max(best, size);
    }
    return best;
}`,
        java: `public static int maxRegion(List<List<Integer>> grid) {
    int rows = grid.size(), cols = grid.get(0).size(), best = 0;
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
        if (grid.get(r).get(c) == 0) continue;
        boolean[][] seen = new boolean[rows][cols];
        Deque<int[]> stack = new ArrayDeque<>(); stack.push(new int[]{r, c}); seen[r][c] = true;
        int size = 0;
        while (!stack.isEmpty()) {
            int[] p = stack.pop(); size++;
            for (int dx = -1; dx <= 1; dx++) for (int dy = -1; dy <= 1; dy++) {
                int nx = p[0] + dx, ny = p[1] + dy;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid.get(nx).get(ny) == 1 && !seen[nx][ny]) {
                    seen[nx][ny] = true; stack.push(new int[]{nx, ny});
                }
            }
        }
        best = Math.max(best, size);
    }
    return best;
}`,
        javascript: `function maxRegion(grid) {
    const rows = grid.length, cols = grid[0].length;
    let best = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (!grid[r][c]) continue;
        const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
        const stack = [[r, c]]; seen[r][c] = true;
        let size = 0;
        while (stack.length) {
            const [x, y] = stack.pop(); size++;
            for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid[nx][ny] && !seen[nx][ny]) {
                    seen[nx][ny] = true; stack.push([nx, ny]);
                }
            }
        }
        best = Math.max(best, size);
    }
    return best;
}`,
      },
    },
    {
      name: '全域已訪 DFS',
      idea: '一片區域只搜尋一次，之後遇到其中格子就略過。',
      steps: ['建立全域已訪表。', '掃到尚未訪過的 1 時啟動堆疊。', '每次取一格，把八方向中未訪的 1 標記並放入堆疊。', '此區搜尋結束後更新最大值。'],
      figure: { title: '四列四欄範例', steps: visitedFig() },
      complexity: { time: 'O(RC)', space: 'O(RC)', why: '每格至多進堆疊一次，且只檢查固定八個方向。' },
      verdict: '消除重複走訪；迭代堆疊也避免深度過大造成遞迴溢位。',
      code: {
        python: `def maxRegion(grid):
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    best = 0
    for r in range(rows):
        for c in range(cols):
            if not grid[r][c] or seen[r][c]:
                continue
            stack = [(r, c)]
            seen[r][c] = True
            size = 0
            while stack:
                x, y = stack.pop()
                size += 1
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] and not seen[nx][ny]:
                            seen[nx][ny] = True  # 入堆疊時就標記，避免重複
                            stack.append((nx, ny))
            best = max(best, size)
    return best`,
        c: `int maxRegion(int grid_rows, int grid_columns, int** grid) {
    int total = grid_rows * grid_columns, best = 0;
    char* seen = calloc(total, 1);
    int* stack = malloc(total * sizeof(int));
    for (int start = 0; start < total; start++) {
        if (!grid[start / grid_columns][start % grid_columns] || seen[start]) continue;
        int top = 0, size = 0;
        stack[top++] = start; seen[start] = 1;
        while (top) {
            int u = stack[--top], r = u / grid_columns, c = u % grid_columns;
            size++;
            for (int dr = -1; dr <= 1; dr++) for (int dc = -1; dc <= 1; dc++) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= grid_rows || nc < 0 || nc >= grid_columns) continue;
                int v = nr * grid_columns + nc;
                if (grid[nr][nc] && !seen[v]) { seen[v] = 1; stack[top++] = v; }
            }
        }
        if (size > best) best = size;
    }
    free(seen); free(stack);
    return best;
}`,
        cpp: `int maxRegion(vector<vector<int>> grid) {
    int rows = grid.size(), cols = grid[0].size(), best = 0;
    vector<vector<bool>> seen(rows, vector<bool>(cols));
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
        if (!grid[r][c] || seen[r][c]) continue;
        vector<pair<int, int>> stack = {{r, c}}; seen[r][c] = true;
        int size = 0;
        while (!stack.empty()) {
            auto [x, y] = stack.back(); stack.pop_back(); size++;
            for (int dx = -1; dx <= 1; dx++) for (int dy = -1; dy <= 1; dy++) {
                int nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid[nx][ny] && !seen[nx][ny]) {
                    seen[nx][ny] = true; stack.push_back({nx, ny});
                }
            }
        }
        best = max(best, size);
    }
    return best;
}`,
        java: `public static int maxRegion(List<List<Integer>> grid) {
    int rows = grid.size(), cols = grid.get(0).size(), best = 0;
    boolean[][] seen = new boolean[rows][cols];
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) {
        if (grid.get(r).get(c) == 0 || seen[r][c]) continue;
        Deque<int[]> stack = new ArrayDeque<>(); stack.push(new int[]{r, c}); seen[r][c] = true;
        int size = 0;
        while (!stack.isEmpty()) {
            int[] p = stack.pop(); size++;
            for (int dx = -1; dx <= 1; dx++) for (int dy = -1; dy <= 1; dy++) {
                int nx = p[0] + dx, ny = p[1] + dy;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid.get(nx).get(ny) == 1 && !seen[nx][ny]) {
                    seen[nx][ny] = true; stack.push(new int[]{nx, ny});
                }
            }
        }
        best = Math.max(best, size);
    }
    return best;
}`,
        javascript: `function maxRegion(grid) {
    const rows = grid.length, cols = grid[0].length;
    const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
    let best = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        if (!grid[r][c] || seen[r][c]) continue;
        const stack = [[r, c]]; seen[r][c] = true;
        let size = 0;
        while (stack.length) {
            const [x, y] = stack.pop(); size++;
            for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && grid[nx][ny] && !seen[nx][ny]) {
                    seen[nx][ny] = true; stack.push([nx, ny]);
                }
            }
        }
        best = Math.max(best, size);
    }
    return best;
}`,
      },
    },
  ],
  pitfalls: [
    '八方向包含對角；即使只在角上接觸仍是一區。',
    '格子入堆疊時就標記已訪，避免鄰格重複推入。',
    '全是 0 時要回傳 0；最大值初始為 0。',
  ],
  check: {
    kind: 'fn', fn: 'maxRegion',
    cases: [
      { args: [GRID], out: 5 },
      { args: [[[1, 0], [0, 1]]], out: 2 },
      { args: [[[0]]], out: 0 },
      { args: [[[1]]], out: 1 },
      { args: [[[1, 1], [1, 1]]], out: 4 },
      { args: [[[1, 0, 1, 0, 1]]], out: 1 },
    ],
  },
}
