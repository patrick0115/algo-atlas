import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const maze = ['...', '.X.', '...']
const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function dfsFig(): FigStep[] {
  const out: FigStep[] = [], seen = new Set<string>()
  let best = Infinity
  function visit(x: number, y: number, depth: number): void {
    const key = `${x},${y}`
    if (depth >= best) return
    out.push({ note: `深搜抵達 (${x},${y})，已走 ${depth} 步；目前最佳 ${Number.isFinite(best) ? best : '未找到'}。`, views: [arr(maze.map((row, i) => row.split('').map((ch, j) => i === x && j === y ? '●' : seen.has(`${i},${j}`) ? '·' : ch).join('')), { label: '目前位置與已走格' }), arr([depth, Number.isFinite(best) ? best : -1], { label: '目前步數、最佳步數' })] })
    if (x === 1 && y === 2) { best = depth; return }
    seen.add(key)
    for (const [dx, dy] of moves) {
      let nx = x + dx, ny = y + dy
      while (nx >= 0 && ny >= 0 && nx < maze.length && ny < maze.length && maze[nx][ny] !== 'X') {
        if (!seen.has(`${nx},${ny}`)) visit(nx, ny, depth + 1)
        nx += dx; ny += dy
      }
    }
    seen.delete(key)
  }
  visit(0, 0, 0)
  return out
}

function bfsFig(): FigStep[] {
  const out: FigStep[] = []
  const dist = Array.from({ length: maze.length }, () => Array(maze.length).fill(-1) as number[])
  const queue: [number, number][] = [[0, 0]]
  dist[0][0] = 0
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head]
    for (const [dx, dy] of moves) {
      let nx = x + dx, ny = y + dy
      while (nx >= 0 && ny >= 0 && nx < maze.length && ny < maze.length && maze[nx][ny] !== 'X') {
        if (dist[nx][ny] === -1) { dist[nx][ny] = dist[x][y] + 1; queue.push([nx, ny]) }
        nx += dx; ny += dy
      }
    }
    out.push({ note: `取出 (${x},${y})，距離 ${dist[x][y]}；同列或同行滑行可達的未訪問格標為 ${dist[x][y] + 1}。待處理 ${queue.length - head - 1} 格。`, views: [{ kind: 'grid', label: '最少移動次數，-1 未到達', cells: dist.map(row => [...row]), marks: { hl: [[x, y]] } }, arr(queue.slice(head + 1).map(([r, c]) => `(${r},${c})`), { label: '佇列' })] })
  }
  return out
}

export const hrCastleOnTheGrid: HrSolution = {
  slug: 'castle-on-the-grid',
  plain: '像城堡裡的棋子，可沿走廊直線滑到任意空格；轉彎才算下一步，找最少要滑幾次。',
  statement: '輸入由 `.` 空格與 `X` 障礙組成的方格、起點座標 (startX,startY) 與終點 (goalX,goalY)。一次移動可沿同一列或行跨過任意個連續空格，但不能穿過障礙或出界。求抵達終點所需的最少移動次數。',
  examples: [
    { input: 'grid=["...",".X.","..."], start=(0,0), goal=(1,2)', output: '2', note: '先橫移到 (0,2)，再直移到 (1,2)。' },
    { input: 'grid=["...","...","..."], start=(0,0), goal=(0,2)', output: '1', note: '同一列可一次滑到終點，中途不需停在 (0,1)。' },
  ],
  constraints: [
    '方格邊長可達 100 → 頂點最多一萬，不能枚舉所有無環路徑。',
    '每次滑行的成本都為 1 → 用 BFS 第一次到達某格就是最少步數。',
    '障礙阻斷直線移動 → 掃描每個方向時遇 X 或邊界立刻停止。',
  ],
  insight: [
    '最直接可深搜所有不重複路徑，找到終點時更新最短步數；但可能有大量不同路徑。',
    '每個空格視為節點，沿列或行可見的空格都是一條成本 1 的邊。',
    '因邊權相同，用 [[p:graph-traversal]] 的 BFS 按步數分層；首次訪問即標記距離，避免重複入列。',
  ],
  approaches: [
    {
      name: '深度搜尋所有簡單路徑',
      idea: '嘗試每次滑行可到的格子，記錄目前路徑與已知最短步數。',
      steps: ['從起點深搜，記下目前格、步數與路徑內已訪問格。', '四個方向各延伸到障礙或邊界前，每個空格都可作下一步終點。', '若抵達目標就更新最短步數；若目前步數已不可能更好就剪枝。', '返回時取消本格的路徑標記，讓其他路徑能使用它。'],
      figure: { title: '3×3 格，起點 (0,0)，終點 (1,2)', steps: dfsFig() },
      complexity: { time: '指數級', space: 'O(n²)', why: '簡單路徑數可能呈指數成長；路徑標記與遞迴深度最多 n² 格。' },
      verdict: '能直觀列舉路徑，但大迷宮會探索太多路徑。',
      code: {
        python: `def minimumMoves(grid, startX, startY, goalX, goalY):
    n = len(grid)
    seen = set()
    answer = [n * n + 1]
    def visit(x, y, steps):
        if steps >= answer[0]:
            return
        if (x, y) == (goalX, goalY):
            answer[0] = steps
            return
        seen.add((x, y))
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            while 0 <= nx < n and 0 <= ny < n and grid[nx][ny] != 'X':
                if (nx, ny) not in seen:
                    visit(nx, ny, steps + 1)  # 此格可當一次滑行的終點
                nx += dx
                ny += dy
        seen.remove((x, y))
    visit(startX, startY, 0)
    return answer[0] if answer[0] <= n * n else -1`,
        c: `void searchGrid(int n, char** grid, int x, int y, int gx, int gy, int steps, int* best, char* seen) {
    if (steps >= *best) return;
    if (x == gx && y == gy) {
        *best = steps;
        return;
    }
    seen[x * n + y] = 1;
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid[nx][ny] != 'X') {
            if (!seen[nx * n + ny]) searchGrid(n, grid, nx, ny, gx, gy, steps + 1, best, seen);
            nx += dx[d];
            ny += dy[d];
        }
    }
    seen[x * n + y] = 0;
}
int minimumMoves(int grid_count, char** grid, int startX, int startY, int goalX, int goalY) {
    char* seen = calloc(grid_count * grid_count, 1);
    int best = grid_count * grid_count + 1;
    searchGrid(grid_count, grid, startX, startY, goalX, goalY, 0, &best, seen);
    free(seen);
    return best <= grid_count * grid_count ? best : -1;
}`,
        cpp: `void searchGrid(const vector<string>& grid, int x, int y, int gx, int gy, int steps, int& best, vector<vector<char>>& seen) {
    int n = grid.size();
    if (steps >= best) return;
    if (x == gx && y == gy) {
        best = steps;
        return;
    }
    seen[x][y] = 1;
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid[nx][ny] != 'X') {
            if (!seen[nx][ny]) searchGrid(grid, nx, ny, gx, gy, steps + 1, best, seen);
            nx += dx[d];
            ny += dy[d];
        }
    }
    seen[x][y] = 0;
}
int minimumMoves(vector<string> grid, int startX, int startY, int goalX, int goalY) {
    int n = grid.size(), best = n * n + 1;
    vector<vector<char>> seen(n, vector<char>(n));
    searchGrid(grid, startX, startY, goalX, goalY, 0, best, seen);
    return best <= n * n ? best : -1;
}`,
        java: `public static void searchGrid(List<String> grid, int x, int y, int gx, int gy, int steps, int[] best, boolean[][] seen) {
    int n = grid.size();
    if (steps >= best[0]) return;
    if (x == gx && y == gy) {
        best[0] = steps;
        return;
    }
    seen[x][y] = true;
    int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
    for (int d = 0; d < 4; d++) {
        int nx = x + dx[d], ny = y + dy[d];
        while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid.get(nx).charAt(ny) != 'X') {
            if (!seen[nx][ny]) searchGrid(grid, nx, ny, gx, gy, steps + 1, best, seen);
            nx += dx[d];
            ny += dy[d];
        }
    }
    seen[x][y] = false;
}
public static int minimumMoves(List<String> grid, int startX, int startY, int goalX, int goalY) {
    int n = grid.size();
    int[] best = {n * n + 1};
    searchGrid(grid, startX, startY, goalX, goalY, 0, best, new boolean[n][n]);
    return best[0] <= n * n ? best[0] : -1;
}`,
        javascript: `function minimumMoves(grid, startX, startY, goalX, goalY) {
  const n = grid.length;
  const seen = Array.from({ length: n }, () => Array(n).fill(false));
  let best = n * n + 1;
  function visit(x, y, steps) {
    if (steps >= best) return;
    if (x === goalX && y === goalY) {
      best = steps;
      return;
    }
    seen[x][y] = true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid[nx][ny] !== 'X') {
        if (!seen[nx][ny]) visit(nx, ny, steps + 1);
        nx += dx;
        ny += dy;
      }
    }
    seen[x][y] = false;
  }
  visit(startX, startY, 0);
  return best <= n * n ? best : -1;
}`,
      },
    },
    {
      name: '逐層廣度優先搜尋',
      idea: '由起點向所有直線可達空格擴張，首次到達某格就是最少步數。',
      steps: ['建立距離表，全設 −1，起點設為 0 並入佇列。', '取出佇列前端格子，向四方逐格滑到障礙或邊界前。', '每個首次遇到的空格設距離為目前距離加 1，並入佇列。', '目標首次到達時可回傳距離；全部探索後仍未到達則回傳 −1。'],
      figure: { title: '3×3 格，起點 (0,0)，終點 (1,2)', steps: bfsFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '最多 n² 格出列，每格四個方向各掃描至多 n 格；距離表與佇列是 n²。' },
      verdict: '比列舉路徑穩定得多，題目大小可用。',
      code: {
        python: `def minimumMoves(grid, startX, startY, goalX, goalY):
    n = len(grid)
    distance = [[-1] * n for _ in range(n)]
    queue = [(startX, startY)]
    distance[startX][startY] = 0
    head = 0
    while head < len(queue):
        x, y = queue[head]
        head += 1
        if (x, y) == (goalX, goalY):
            return distance[x][y]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            while 0 <= nx < n and 0 <= ny < n and grid[nx][ny] != 'X':
                if distance[nx][ny] == -1:
                    distance[nx][ny] = distance[x][y] + 1  # 首次到達就是最短
                    queue.append((nx, ny))
                nx += dx
                ny += dy
    return -1`,
        c: `int minimumMoves(int grid_count, char** grid, int startX, int startY, int goalX, int goalY) {
    int n = grid_count, cells = n * n;
    int* distance = malloc(sizeof(int) * cells);
    int* queue = malloc(sizeof(int) * cells);
    for (int i = 0; i < cells; i++) distance[i] = -1;
    int head = 0, tail = 0;
    int start = startX * n + startY;
    distance[start] = 0;
    queue[tail++] = start;
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    while (head < tail) {
        int at = queue[head++], x = at / n, y = at % n;
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid[nx][ny] != 'X') {
                int next = nx * n + ny;
                if (distance[next] == -1) {
                    distance[next] = distance[at] + 1;
                    queue[tail++] = next;
                }
                nx += dx[d];
                ny += dy[d];
            }
        }
    }
    int answer = distance[goalX * n + goalY];
    free(distance);
    free(queue);
    return answer;
}`,
        cpp: `int minimumMoves(vector<string> grid, int startX, int startY, int goalX, int goalY) {
    int n = grid.size();
    vector<vector<int>> distance(n, vector<int>(n, -1));
    queue<pair<int, int>> pending;
    pending.push({startX, startY});
    distance[startX][startY] = 0;
    int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
    while (!pending.empty()) {
        auto [x, y] = pending.front();
        pending.pop();
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid[nx][ny] != 'X') {
                if (distance[nx][ny] == -1) {
                    distance[nx][ny] = distance[x][y] + 1;
                    pending.push({nx, ny});
                }
                nx += dx[d];
                ny += dy[d];
            }
        }
    }
    return distance[goalX][goalY];
}`,
        java: `public static int minimumMoves(List<String> grid, int startX, int startY, int goalX, int goalY) {
    int n = grid.size();
    int[][] distance = new int[n][n];
    for (int[] row : distance) java.util.Arrays.fill(row, -1);
    java.util.ArrayDeque<int[]> queue = new java.util.ArrayDeque<>();
    queue.add(new int[]{startX, startY});
    distance[startX][startY] = 0;
    int[] dx = {1, -1, 0, 0}, dy = {0, 0, 1, -1};
    while (!queue.isEmpty()) {
        int[] at = queue.remove();
        int x = at[0], y = at[1];
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid.get(nx).charAt(ny) != 'X') {
                if (distance[nx][ny] == -1) {
                    distance[nx][ny] = distance[x][y] + 1;
                    queue.add(new int[]{nx, ny});
                }
                nx += dx[d];
                ny += dy[d];
            }
        }
    }
    return distance[goalX][goalY];
}`,
        javascript: `function minimumMoves(grid, startX, startY, goalX, goalY) {
  const n = grid.length;
  const distance = Array.from({ length: n }, () => Array(n).fill(-1));
  const queue = [[startX, startY]];
  distance[startX][startY] = 0;
  for (let head = 0; head < queue.length; head++) {
    const [x, y] = queue[head];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let nx = x + dx, ny = y + dy;
      while (nx >= 0 && ny >= 0 && nx < n && ny < n && grid[nx][ny] !== 'X') {
        if (distance[nx][ny] === -1) {
          distance[nx][ny] = distance[x][y] + 1;
          queue.push([nx, ny]);
        }
        nx += dx;
        ny += dy;
      }
    }
  }
  return distance[goalX][goalY];
}`,
      },
    },
  ],
  pitfalls: [
    '一次可在同一直線滑行多格，不是每走一格都加一步。',
    '掃描遇到已訪問格仍要繼續向前，後方可能有未訪問空格。',
    '入佇列當下標記距離，避免同一格在同一層重複入列。',
  ],
  check: {
    kind: 'fn', fn: 'minimumMoves', cases: [
      { args: [['...', '.X.', '...'], 0, 0, 1, 2], out: 2 },
      { args: [['...', '...', '...'], 0, 0, 0, 2], out: 1 },
      { args: [['.'], 0, 0, 0, 0], out: 0 },
      { args: [['..', '..'], 0, 0, 1, 1], out: 2 },
      { args: [['.X.', '...', '...'], 0, 0, 0, 2], out: 3 },
      { args: [['...', 'XXX', '...'], 0, 0, 2, 2], out: -1 },
    ],
  },
}
