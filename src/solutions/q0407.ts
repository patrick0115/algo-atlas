import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

const H = [[1, 4, 3, 1, 3, 2], [3, 2, 1, 3, 2, 4], [2, 3, 3, 2, 3, 1]]
const grid = (cells: number[][], opt: { label: string; marks?: { hl: Cell[] } }): GridViewData => ({
  kind: 'grid',
  cells,
  label: opt.label,
  marks: opt.marks,
})
const relaxFig: FigStep[] = [
  { note: '邊界格子的水面高度等於自己高度，因為水能直接流出地圖；內部格子先視為無限高。', views: [grid(H, { label: '地形' })] },
  { note: '中央高度 2 的格子往左邊界高度 3 流，水面最多被降到 3，可存 1 單位水。', views: [grid(H, { label: '地形', marks: { hl: [[1, 1], [1, 0]] } })] },
  { note: '中央高度 1 的格子接到高度 3 的外流路線，水面為 3，可存 2 單位。', views: [grid(H, { label: '地形', marks: { hl: [[1, 2], [0, 2]] } })] },
  { note: '另一個高度 2 的格子水面也是 3，存 1 單位；反覆更新直到不再下降，總量 4。', views: [grid(H, { label: '地形', marks: { hl: [[1, 4]] } }), arr([1, 2, 1, 4], { label: '三格水量 / 總量' })] },
]
const heapFig: FigStep[] = [
  { note: '所有邊界格子入最小堆，當作已知的外流邊界；從最低的水面開始擴張。', views: [grid(H, { label: '地形', marks: { hl: [[0, 0], [0, 3], [2, 5]] } })] },
  { note: '從高度 3 的邊界走到內部高度 2 的格子，水面至少 3，所以存 1。新邊界水面仍是 3。', views: [grid(H, { label: '地形', marks: { hl: [[1, 1]] } }), arr([1], { label: '累計水量' })] },
  { note: '走到中央高度 1，外圍最小可逃脫水面是 3，因此存 2，累計 3。', views: [grid(H, { label: '地形', marks: { hl: [[1, 2]] } }), arr([3], { label: '累計水量' })] },
  { note: '高度 2 的另一格再存 1，合計 4。即使附近地形較低，也不能把水面降到已知邊界以下。', views: [grid(H, { label: '地形', marks: { hl: [[1, 4]] } }), arr([4], { label: '總水量', done: [0] })] },
]

export const q0407: Solution = {
  id: 407,
  plain: '想像高低不平的土地被雨淹沒。水能從地圖四周流走，問凹下去的地方總共能留下多少水。',
  statement: '給二維高度圖 heightMap，每格寬與長都是 1。水可以向上下左右流動，地圖邊界會漏水。回傳所有格子能積的水量總和。',
  examples: [{ input: 'heightMap = [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]', output: '4' }, { input: 'heightMap = [[3,3,3,3],[3,1,1,3],[3,3,3,3]]', output: '4' }],
  constraints: ['格子數最多 40000；一列或一行沒有內部格子，答案為 0。', '只看單格上下左右的高低不夠；水可能經由遠處的低出口流失。'],
  insight: ['一格能維持的水面，是從它走到邊界的所有路線中，「最高門檻」最低的那條路。', '可用反覆鬆弛求每格最低可逃脫水面；也可從邊界用 [[p:heap]] 按水面高度向內擴張。'],
  approaches: [
    {
      name: '反覆更新可逃脫水面', idea: '邊界水面固定為地面高度；內部從無限高開始，反覆用鄰居的逃脫水面降低自己。',
      steps: ['邊界設為自身高度，內部先設為無限大。', '對內部格子與每個鄰居，試著以 max(自身高度,鄰居水面) 更新。', '直到整輪沒有變化。', '把各格水面減地面高度後加總。'],
      figure: { title: 'heightMap = [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]', steps: relaxFig },
      complexity: { time: 'O((mn)²)', space: 'O(mn)', why: '一次全圖掃描 O(mn)；最壞資訊沿彎曲路徑逐輪傳播 O(mn) 輪。' },
      verdict: '比較容易從「水會從哪裡漏走」推導，但大圖可能很慢。',
      code: {
        python: `def trapRainWater(heightMap):
    if not heightMap or not heightMap[0]:
        return 0
    rows, cols = len(heightMap), len(heightMap[0])
    level = [[float('inf')] * cols for _ in range(rows)]
    for r in range(rows):
        level[r][0] = heightMap[r][0]
        level[r][cols - 1] = heightMap[r][cols - 1]
    for c in range(cols):
        level[0][c] = heightMap[0][c]
        level[rows - 1][c] = heightMap[rows - 1][c]
    changed = True
    while changed:
        changed = False
        for r in range(1, rows - 1):
            for c in range(1, cols - 1):
                for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    candidate = max(heightMap[r][c], level[r + dr][c + dc])
                    if candidate < level[r][c]:
                        level[r][c] = candidate  # 找到更低的外流路線
                        changed = True
    return sum(level[r][c] - heightMap[r][c] for r in range(rows) for c in range(cols))`,
        c: `int trapRainWater(int **heightMap, int heightMapSize, int *heightMapColSize) {
    int rows = heightMapSize;
    if (rows == 0) {
        return 0;
    }
    int cols = heightMapColSize[0];
    int *level = malloc(rows * cols * sizeof(int));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            bool border = r == 0 || c == 0 || r == rows - 1 || c == cols - 1;
            level[r * cols + c] = border ? heightMap[r][c] : INT_MAX;
        }
    }
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    bool changed = true;
    while (changed) {
        changed = false;
        for (int r = 1; r < rows - 1; r++) {
            for (int c = 1; c < cols - 1; c++) {
                for (int d = 0; d < 4; d++) {
                    int neighbor = level[(r + dr[d]) * cols + c + dc[d]];
                    int candidate = heightMap[r][c] > neighbor ? heightMap[r][c] : neighbor;
                    if (candidate < level[r * cols + c]) {
                        level[r * cols + c] = candidate;
                        changed = true;
                    }
                }
            }
        }
    }
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            answer += level[r * cols + c] - heightMap[r][c];
        }
    }
    free(level);
    return answer;
}`,
        cpp: `int trapRainWater(vector<vector<int>>& heightMap) {
    int rows = heightMap.size();
    if (!rows) {
        return 0;
    }
    int cols = heightMap[0].size();
    vector<vector<int>> level(rows, vector<int>(cols, INT_MAX));
    for (int r = 0; r < rows; r++) {
        level[r][0] = heightMap[r][0];
        level[r][cols - 1] = heightMap[r][cols - 1];
    }
    for (int c = 0; c < cols; c++) {
        level[0][c] = heightMap[0][c];
        level[rows - 1][c] = heightMap[rows - 1][c];
    }
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    bool changed = true;
    while (changed) {
        changed = false;
        for (int r = 1; r < rows - 1; r++) {
            for (int c = 1; c < cols - 1; c++) {
                for (int d = 0; d < 4; d++) {
                    int candidate = max(heightMap[r][c], level[r + dr[d]][c + dc[d]]);
                    if (candidate < level[r][c]) {
                        level[r][c] = candidate;
                        changed = true;
                    }
                }
            }
        }
    }
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            answer += level[r][c] - heightMap[r][c];
        }
    }
    return answer;
}`,
        java: `int trapRainWater(int[][] heightMap) {
    int rows = heightMap.length;
    if (rows == 0) {
        return 0;
    }
    int cols = heightMap[0].length;
    int[][] level = new int[rows][cols];
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            boolean border = r == 0 || c == 0 || r == rows - 1 || c == cols - 1;
            level[r][c] = border ? heightMap[r][c] : Integer.MAX_VALUE;
        }
    }
    int[] dr = {1, -1, 0, 0};
    int[] dc = {0, 0, 1, -1};
    boolean changed = true;
    while (changed) {
        changed = false;
        for (int r = 1; r < rows - 1; r++) {
            for (int c = 1; c < cols - 1; c++) {
                for (int d = 0; d < 4; d++) {
                    int candidate = Math.max(heightMap[r][c], level[r + dr[d]][c + dc[d]]);
                    if (candidate < level[r][c]) {
                        level[r][c] = candidate;
                        changed = true;
                    }
                }
            }
        }
    }
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            answer += level[r][c] - heightMap[r][c];
        }
    }
    return answer;
}`,
        javascript: `function trapRainWater(heightMap) {
  const rows = heightMap.length;
  if (rows === 0) {
    return 0;
  }
  const cols = heightMap[0].length;
  const level = Array.from({ length: rows }, () => new Array(cols).fill(Infinity));
  for (let r = 0; r < rows; r++) {
    level[r][0] = heightMap[r][0];
    level[r][cols - 1] = heightMap[r][cols - 1];
  }
  for (let c = 0; c < cols; c++) {
    level[0][c] = heightMap[0][c];
    level[rows - 1][c] = heightMap[rows - 1][c];
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        for (const [dr, dc] of dirs) {
          const candidate = Math.max(heightMap[r][c], level[r + dr][c + dc]);
          if (candidate < level[r][c]) {
            level[r][c] = candidate;
            changed = true;
          }
        }
      }
    }
  }
  let answer = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      answer += level[r][c] - heightMap[r][c];
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '從邊界向內的最小堆', idea: '目前最低的外流邊界先向內擴張；新格子的水面是地面高度與邊界水面的較大值。',
      steps: ['所有邊界格子入最小堆並標記已見。', '取出水面最低格子，訪問未見鄰居。', '鄰居可存 max(0,水面−地面)；以 max(水面,地面) 入堆。', '堆空後回傳總水量。'],
      figure: { title: 'heightMap = [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]', steps: heapFig },
      complexity: { time: 'O(mn log(mn))', space: 'O(mn)', why: '每格至多進出堆一次。' },
      verdict: '推薦解法，可把它想成從邊界向內求「最低可逃脫水面」。',
      code: {
        python: `import heapq

def trapRainWater(heightMap):
    if not heightMap or not heightMap[0]:
        return 0
    rows, cols = len(heightMap), len(heightMap[0])
    seen = [[False] * cols for _ in range(rows)]
    heap = []
    for r in range(rows):
        for c in (0, cols - 1):
            if not seen[r][c]:
                seen[r][c] = True
                heapq.heappush(heap, (heightMap[r][c], r, c))
    for c in range(cols):
        for r in (0, rows - 1):
            if not seen[r][c]:
                seen[r][c] = True
                heapq.heappush(heap, (heightMap[r][c], r, c))
    answer = 0
    while heap:
        level, r, c = heapq.heappop(heap)  # 最低的外流邊界先擴張
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and not seen[nr][nc]:
                seen[nr][nc] = True
                ground = heightMap[nr][nc]
                answer += max(0, level - ground)  # 邊界高於地面才能蓄水
                heapq.heappush(heap, (max(level, ground), nr, nc))
    return answer`,
        c: `typedef struct {
    int level;
    int row;
    int col;
} Cell407;

static void push407(Cell407 *heap, int *size, Cell407 value) {
    int i = (*size)++;
    while (i > 0 && heap[(i - 1) / 2].level > value.level) {
        heap[i] = heap[(i - 1) / 2];
        i = (i - 1) / 2;
    }
    heap[i] = value;
}

static Cell407 pop407(Cell407 *heap, int *size) {
    Cell407 top = heap[0];
    Cell407 value = heap[--(*size)];
    int i = 0;
    while (i * 2 + 1 < *size) {
        int child = i * 2 + 1;
        if (child + 1 < *size && heap[child + 1].level < heap[child].level) {
            child++;
        }
        if (heap[child].level >= value.level) {
            break;
        }
        heap[i] = heap[child];
        i = child;
    }
    if (*size > 0) {
        heap[i] = value;
    }
    return top;
}

int trapRainWater(int **heightMap, int heightMapSize, int *heightMapColSize) {
    int rows = heightMapSize;
    if (rows == 0) {
        return 0;
    }
    int cols = heightMapColSize[0];
    int capacity = rows * cols;
    unsigned char *seen = calloc(capacity, 1);
    Cell407 *heap = malloc(capacity * sizeof(Cell407));
    int size = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (r == 0 || c == 0 || r == rows - 1 || c == cols - 1) {
                seen[r * cols + c] = 1;
                push407(heap, &size, (Cell407) {heightMap[r][c], r, c});
            }
        }
    }
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int answer = 0;
    while (size > 0) {
        Cell407 cell = pop407(heap, &size);
        for (int d = 0; d < 4; d++) {
            int nr = cell.row + dr[d];
            int nc = cell.col + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr * cols + nc]) {
                continue;
            }
            seen[nr * cols + nc] = 1;
            int ground = heightMap[nr][nc];
            if (cell.level > ground) {
                answer += cell.level - ground;
            }
            int level = cell.level > ground ? cell.level : ground;
            push407(heap, &size, (Cell407) {level, nr, nc});
        }
    }
    free(seen);
    free(heap);
    return answer;
}`,
        cpp: `int trapRainWater(vector<vector<int>>& heightMap) {
    int rows = heightMap.size();
    if (!rows) {
        return 0;
    }
    int cols = heightMap[0].size();
    using Cell = array<int, 3>;
    priority_queue<Cell, vector<Cell>, greater<Cell>> heap;
    vector<vector<bool>> seen(rows, vector<bool>(cols));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (r == 0 || c == 0 || r == rows - 1 || c == cols - 1) {
                seen[r][c] = true;
                heap.push({heightMap[r][c], r, c});
            }
        }
    }
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    int answer = 0;
    while (!heap.empty()) {
        auto [level, r, c] = heap.top();
        heap.pop();
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d];
            int nc = c + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) {
                continue;
            }
            seen[nr][nc] = true;
            answer += max(0, level - heightMap[nr][nc]);
            heap.push({max(level, heightMap[nr][nc]), nr, nc});
        }
    }
    return answer;
}`,
        java: `int trapRainWater(int[][] heightMap) {
    int rows = heightMap.length;
    if (rows == 0) {
        return 0;
    }
    int cols = heightMap[0].length;
    boolean[][] seen = new boolean[rows][cols];
    PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (r == 0 || c == 0 || r == rows - 1 || c == cols - 1) {
                seen[r][c] = true;
                heap.offer(new int[] {heightMap[r][c], r, c});
            }
        }
    }
    int[] dr = {1, -1, 0, 0};
    int[] dc = {0, 0, 1, -1};
    int answer = 0;
    while (!heap.isEmpty()) {
        int[] cell = heap.poll();
        for (int d = 0; d < 4; d++) {
            int nr = cell[1] + dr[d];
            int nc = cell[2] + dc[d];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) {
                continue;
            }
            seen[nr][nc] = true;
            int ground = heightMap[nr][nc];
            answer += Math.max(0, cell[0] - ground);
            heap.offer(new int[] {Math.max(cell[0], ground), nr, nc});
        }
    }
    return answer;
}`,
        javascript: `function trapRainWater(heightMap) {
  const rows = heightMap.length;
  if (rows === 0) {
    return 0;
  }
  const cols = heightMap[0].length;
  const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
  const heap = [];
  function push(cell) {
    let i = heap.length;
    heap.push(cell);
    while (i > 0 && heap[Math.floor((i - 1) / 2)][0] > cell[0]) {
      heap[i] = heap[Math.floor((i - 1) / 2)];
      i = Math.floor((i - 1) / 2);
    }
    heap[i] = cell;
  }
  function pop() {
    const top = heap[0];
    const value = heap.pop();
    if (heap.length > 0) {
      let i = 0;
      while (2 * i + 1 < heap.length) {
        let child = 2 * i + 1;
        if (child + 1 < heap.length && heap[child + 1][0] < heap[child][0]) {
          child++;
        }
        if (heap[child][0] >= value[0]) {
          break;
        }
        heap[i] = heap[child];
        i = child;
      }
      heap[i] = value;
    }
    return top;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) {
        seen[r][c] = true;
        push([heightMap[r][c], r, c]);
      }
    }
  }
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let answer = 0;
  while (heap.length > 0) {
    const [level, r, c] = pop();
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || seen[nr][nc]) {
        continue;
      }
      seen[nr][nc] = true;
      const ground = heightMap[nr][nc];
      answer += Math.max(0, level - ground);
      push([Math.max(level, ground), nr, nc]);
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['邊界不可能蓄水，需一開始全部入堆。', '訪問鄰居時立刻標記已見，避免重複入堆。', '水面高度會沿路傳遞，不能只用鄰格的原始地面高度。'],
  check: { kind: 'fn', fn: 'trapRainWater', cases: [
    { args: [H], out: 4 },
    { args: [[[3, 3, 3, 3], [3, 1, 1, 3], [3, 3, 3, 3]]], out: 4 },
    { args: [[[1, 2, 3]]], out: 0 },
  ] },
}
