import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const G = [[1, 0], [0, 1]]
const grid = (cells: number[][], marks: Record<string, [number, number][]> = {}) => ({ kind: 'grid' as const, cells, marks, label: 'grid' })
const labelFig: FigStep[] = [
  { note: '初始有兩塊不相連的陸地：左上與右下，各只有 1 格。', views: [grid(G, { hl: [[0, 0], [1, 1]] })] },
  { note: '走訪左上島，標記為編號 2、面積 1；右下島標記為編號 3、面積 1。', views: [grid([[2, 0], [0, 3]], { done: [[0, 0], [1, 1]] }), arr([1, 1], { label: '島 2 / 島 3 面積' })] },
  { note: '假設翻轉右上角的 0：它相鄰島 2 與島 3，編號不同，面積為 1+1+1=3。', views: [grid([[2, 0], [0, 3]], { hl: [[0, 1]], done: [[0, 0], [1, 1]] }), arr([3], { label: '翻轉後面積' })] },
  { note: '翻轉左下角也得到 3；取最大值，答案為 3。鄰居若屬同一島只能加一次。', views: [grid(G, { hl: [[1, 0]] }), arr([3], { label: '答案', done: [0] })] },
]
const dsuFig: FigStep[] = [
  { note: '把每格映成索引 0、1、2、3；只將相鄰的陸地合併。', views: [grid(G), arr([0, 1, 2, 3], { label: '格子索引' })] },
  { note: '左上 0 與右下 3 不相鄰，保持兩個大小皆為 1 的集合。', views: [grid(G, { done: [[0, 0], [1, 1]] }), arr([1, 1], { label: '集合大小' })] },
  { note: '試把右上水格 1 改為陸地；其左邊根為 0、下邊根為 3。', views: [grid(G, { hl: [[0, 1]], done: [[0, 0], [1, 1]] }), arr([0, 3], { label: '相鄰集合根' })] },
  { note: '兩個根不同，面積加上 1+1 得 3；另一水格也得到 3。', views: [arr([3], { label: '最大面積', done: [0] })] },
]

export const q0827: Solution = {
  id: 827,
  plain: '最多把一格水變成陸地，能形成多大的島？',
  statement: '給定 n×n 的 0/1 網格；1 是陸地，0 是水，島以四方向相連。最多將一個 0 改成 1，回傳最大島面積。',
  examples: [
    { input: 'grid = [[1,0],[0,1]]', output: '3' },
    { input: 'grid = [[1,1],[1,0]]', output: '4' },
    { input: 'grid = [[1,1],[1,1]]', output: '4' },
  ],
  constraints: ['1 ≤ n ≤ 500', 'grid[i][j] 為 0 或 1'],
  insight: ['先算好每座現有島的面積，試翻每個 0 時才能快速求合併面積。', '一個水格可能同時接觸同一島的兩個邊，島編號必須去重。', '可用洪水填色給島編號，也可用並查集合併陸地。'],
  approaches: [
    {
      name: '洪水填色並記錄島面積',
      idea: '用編號 2、3… 改寫不同島的陸地；每個 0 嘗試合併四邊不同編號的島。',
      steps: ['掃整張網格，遇到 1 就用堆疊走完整座島並填上新編號', '記錄每個編號的面積', '再掃每個 0，以 1 為起始面積', '把四鄰不同編號的面積各加一次，更新最大值'],
      figure: { title: 'grid = [[1,0],[0,1]]', steps: labelFig },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每格最多在填色及試翻時各處理一次。' },
      verdict: '最直接的 [[p:graph-traversal]] 解法；島的編號就是可重用的資訊。',
      code: {
        python: `def largestIsland(grid):
    n = len(grid)
    area = {0: 0}
    island = 2
    answer = 0
    for r in range(n):
        for c in range(n):
            if grid[r][c] != 1:
                continue
            stack = [(r, c)]
            grid[r][c] = island
            size = 0
            while stack:
                x, y = stack.pop()
                size += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < n and 0 <= ny < n and grid[nx][ny] == 1:
                        grid[nx][ny] = island  # 入棧時立即標記
                        stack.append((nx, ny))
            area[island] = size
            answer = max(answer, size)
            island += 1
    for r in range(n):
        for c in range(n):
            if grid[r][c] != 0:
                continue
            neighbors = set()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n:
                    neighbors.add(grid[nr][nc])
            answer = max(answer, 1 + sum(area.get(i, 0) for i in neighbors))
    return answer`,
        c: `int largestIsland(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize;
    int *area = calloc(n * n + 2, sizeof(int));
    int *stack = malloc(n * n * sizeof(int));
    int island = 2;
    int answer = 0;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1) {
                continue;
            }
            int top = 0;
            stack[top++] = r * n + c;
            grid[r][c] = island;
            while (top) {
                int pos = stack[--top];
                area[island]++;
                for (int d = 0; d < 4; d++) {
                    int nr = pos / n + dr[d];
                    int nc = pos % n + dc[d];
                    if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                        grid[nr][nc] = island;
                        stack[top++] = nr * n + nc;
                    }
                }
            }
            if (area[island] > answer) {
                answer = area[island];
            }
            island++;
        }
    }
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 0) {
                continue;
            }
            int seen[4];
            int used = 0;
            int size = 1;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d];
                int nc = c + dc[d];
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) {
                    continue;
                }
                int id = grid[nr][nc];
                bool fresh = id >= 2;
                for (int i = 0; i < used; i++) {
                    if (seen[i] == id) {
                        fresh = false;
                    }
                }
                if (fresh) {
                    seen[used++] = id;
                    size += area[id];
                }
            }
            if (size > answer) {
                answer = size;
            }
        }
    }
    free(area);
    free(stack);
    return answer;
}`,
        cpp: `int largestIsland(vector<vector<int>>& grid) {
    int n = grid.size();
    vector<int> area(n * n + 2);
    int island = 2;
    int answer = 0;
    vector<pair<int, int>> directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1) {
                continue;
            }
            vector<pair<int, int>> stack = {{r, c}};
            grid[r][c] = island;
            while (!stack.empty()) {
                auto [x, y] = stack.back();
                stack.pop_back();
                area[island]++;
                for (auto [dx, dy] : directions) {
                    int nx = x + dx;
                    int ny = y + dy;
                    if (nx >= 0 && nx < n && ny >= 0 && ny < n && grid[nx][ny] == 1) {
                        grid[nx][ny] = island;
                        stack.push_back({nx, ny});
                    }
                }
            }
            answer = max(answer, area[island++]);
        }
    }
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 0) {
                continue;
            }
            unordered_set<int> seen;
            int size = 1;
            for (auto [dr, dc] : directions) {
                int nr = r + dr;
                int nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] >= 2 && seen.insert(grid[nr][nc]).second) {
                    size += area[grid[nr][nc]];
                }
            }
            answer = max(answer, size);
        }
    }
    return answer;
}`,
        java: `int largestIsland(int[][] grid) {
    int n = grid.length;
    int[] area = new int[n * n + 2];
    int[] stack = new int[n * n];
    int[] dr = {1, -1, 0, 0};
    int[] dc = {0, 0, 1, -1};
    int island = 2;
    int answer = 0;
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1) {
                continue;
            }
            int top = 0;
            stack[top++] = r * n + c;
            grid[r][c] = island;
            while (top > 0) {
                int pos = stack[--top];
                area[island]++;
                for (int d = 0; d < 4; d++) {
                    int nr = pos / n + dr[d];
                    int nc = pos % n + dc[d];
                    if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                        grid[nr][nc] = island;
                        stack[top++] = nr * n + nc;
                    }
                }
            }
            answer = Math.max(answer, area[island++]);
        }
    }
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 0) {
                continue;
            }
            Set<Integer> seen = new HashSet<>();
            int size = 1;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d];
                int nc = c + dc[d];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] >= 2 && seen.add(grid[nr][nc])) {
                    size += area[grid[nr][nc]];
                }
            }
            answer = Math.max(answer, size);
        }
    }
    return answer;
}`,
        javascript: `function largestIsland(grid) {
  const n = grid.length;
  const area = Array(n * n + 2).fill(0);
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let island = 2;
  let answer = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 1) {
        continue;
      }
      const stack = [[r, c]];
      grid[r][c] = island;
      while (stack.length) {
        const [x, y] = stack.pop();
        area[island]++;
        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < n && ny >= 0 && ny < n && grid[nx][ny] === 1) {
            grid[nx][ny] = island;
            stack.push([nx, ny]);
          }
        }
      }
      answer = Math.max(answer, area[island]);
      island++;
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 0) {
        continue;
      }
      const seen = new Set();
      let size = 1;
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] >= 2 && !seen.has(grid[nr][nc])) {
          seen.add(grid[nr][nc]);
          size += area[grid[nr][nc]];
        }
      }
      answer = Math.max(answer, size);
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '並查集合併既有陸地',
      idea: '先用並查集記錄陸地連通分量及大小；試翻水格時加上相鄰的不同根節點大小。',
      steps: ['讓每格先成為獨立集合，陸地初始大小為 1', '掃陸地並合併上、左相鄰陸地', '對每個水格找四鄰陸地的根，去重後加上集合大小', '取最大值；若全是陸地，回傳 n²'],
      figure: { title: 'grid = [[1,0],[0,1]]', steps: dsuFig },
      complexity: { time: 'O(n² α(n²))', space: 'O(n²)', why: '每格執行常數次帶路徑壓縮的集合查找。' },
      verdict: '適合練習 [[p:union-find]] 的分量大小與去重。',
      code: {
        python: `def largestIsland(grid):
    n = len(grid)
    parent = list(range(n * n))
    size = [1] * (n * n)
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # 路徑壓縮
            x = parent[x]
        return x
    def union(a, b):
        a, b = find(a), find(b)
        if a != b:
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
    for r in range(n):
        for c in range(n):
            if grid[r][c] == 0:
                continue
            if r and grid[r - 1][c]:
                union(r * n + c, (r - 1) * n + c)
            if c and grid[r][c - 1]:
                union(r * n + c, r * n + c - 1)
    answer = 0
    water = False
    for r in range(n):
        for c in range(n):
            if grid[r][c] == 1:
                continue
            water = True
            roots = set()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc]:
                    roots.add(find(nr * n + nc))
            answer = max(answer, 1 + sum(size[x] for x in roots))
    return answer if water else n * n`,
        c: `static int findRoot(int *parent, int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

static void merge(int *parent, int *size, int a, int b) {
    a = findRoot(parent, a);
    b = findRoot(parent, b);
    if (a == b) {
        return;
    }
    if (size[a] < size[b]) {
        int temp = a;
        a = b;
        b = temp;
    }
    parent[b] = a;
    size[a] += size[b];
}

int largestIsland(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize;
    int cells = n * n;
    int *parent = malloc(cells * sizeof(int));
    int *size = malloc(cells * sizeof(int));
    for (int i = 0; i < cells; i++) {
        parent[i] = i;
        size[i] = 1;
    }
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (!grid[r][c]) {
                continue;
            }
            if (r && grid[r - 1][c]) {
                merge(parent, size, r * n + c, (r - 1) * n + c);
            }
            if (c && grid[r][c - 1]) {
                merge(parent, size, r * n + c, r * n + c - 1);
            }
        }
    }
    int answer = 0;
    bool water = false;
    int dr[4] = {1, -1, 0, 0};
    int dc[4] = {0, 0, 1, -1};
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c]) {
                continue;
            }
            water = true;
            int roots[4];
            int used = 0;
            int area = 1;
            for (int d = 0; d < 4; d++) {
                int nr = r + dr[d];
                int nc = c + dc[d];
                if (nr < 0 || nr >= n || nc < 0 || nc >= n || !grid[nr][nc]) {
                    continue;
                }
                int root = findRoot(parent, nr * n + nc);
                bool fresh = true;
                for (int i = 0; i < used; i++) {
                    if (roots[i] == root) {
                        fresh = false;
                    }
                }
                if (fresh) {
                    roots[used++] = root;
                    area += size[root];
                }
            }
            if (area > answer) {
                answer = area;
            }
        }
    }
    free(parent);
    free(size);
    return water ? answer : cells;
}`,
        cpp: `int largestIsland(vector<vector<int>>& grid) {
    int n = grid.size();
    vector<int> parent(n * n);
    vector<int> size(n * n, 1);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    auto unite = [&](int a, int b) {
        a = find(a);
        b = find(b);
        if (a != b) {
            if (size[a] < size[b]) {
                swap(a, b);
            }
            parent[b] = a;
            size[a] += size[b];
        }
    };
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (!grid[r][c]) {
                continue;
            }
            if (r && grid[r - 1][c]) {
                unite(r * n + c, (r - 1) * n + c);
            }
            if (c && grid[r][c - 1]) {
                unite(r * n + c, r * n + c - 1);
            }
        }
    }
    int answer = 0;
    bool water = false;
    vector<pair<int, int>> directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c]) {
                continue;
            }
            water = true;
            unordered_set<int> roots;
            for (auto [dr, dc] : directions) {
                int nr = r + dr;
                int nc = c + dc;
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc]) {
                    roots.insert(find(nr * n + nc));
                }
            }
            int area = 1;
            for (int root : roots) {
                area += size[root];
            }
            answer = max(answer, area);
        }
    }
    return water ? answer : n * n;
}`,
        java: `int[] parent;
int[] size;

int find(int x) {
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

void unite(int a, int b) {
    a = find(a);
    b = find(b);
    if (a != b) {
        if (size[a] < size[b]) {
            int temp = a;
            a = b;
            b = temp;
        }
        parent[b] = a;
        size[a] += size[b];
    }
}

int largestIsland(int[][] grid) {
    int n = grid.length;
    parent = new int[n * n];
    size = new int[n * n];
    for (int i = 0; i < n * n; i++) {
        parent[i] = i;
        size[i] = 1;
    }
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 0) {
                continue;
            }
            if (r > 0 && grid[r - 1][c] == 1) {
                unite(r * n + c, (r - 1) * n + c);
            }
            if (c > 0 && grid[r][c - 1] == 1) {
                unite(r * n + c, r * n + c - 1);
            }
        }
    }
    int answer = 0;
    boolean water = false;
    int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] == 1) {
                continue;
            }
            water = true;
            Set<Integer> roots = new HashSet<>();
            for (int[] d : directions) {
                int nr = r + d[0];
                int nc = c + d[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                    roots.add(find(nr * n + nc));
                }
            }
            int area = 1;
            for (int root : roots) {
                area += size[root];
            }
            answer = Math.max(answer, area);
        }
    }
    return water ? answer : n * n;
}`,
        javascript: `function largestIsland(grid) {
  const n = grid.length;
  const parent = Array.from({ length: n * n }, (_, i) => i);
  const size = Array(n * n).fill(1);
  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }
  function unite(a, b) {
    a = find(a);
    b = find(b);
    if (a !== b) {
      if (size[a] < size[b]) {
        [a, b] = [b, a];
      }
      parent[b] = a;
      size[a] += size[b];
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 0) {
        continue;
      }
      if (r > 0 && grid[r - 1][c] === 1) {
        unite(r * n + c, (r - 1) * n + c);
      }
      if (c > 0 && grid[r][c - 1] === 1) {
        unite(r * n + c, r * n + c - 1);
      }
    }
  }
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let answer = 0;
  let water = false;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) {
        continue;
      }
      water = true;
      const roots = new Set();
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] === 1) {
          roots.add(find(nr * n + nc));
        }
      }
      let area = 1;
      for (const root of roots) {
        area += size[root];
      }
      answer = Math.max(answer, area);
    }
  }
  return water ? answer : n * n;
}`,
      },
    },
  ],
  pitfalls: ['一個水格可能碰到同一座島的兩個格子，面積只能加一次。', '全是陸地時沒有可翻的水格，答案是 n²。', '全是水時仍可翻一格，答案為 1。'],
  check: { kind: 'fn', fn: 'largestIsland', cases: [
    { args: [G], out: 3 },
    { args: [[[1, 1], [1, 0]]], out: 4 },
    { args: [[[1, 1], [1, 1]]], out: 4 },
    { args: [[[0, 0], [0, 0]]], out: 1 },
    { args: [[[1, 0, 1], [1, 0, 1], [1, 1, 1]]], out: 8 },
  ] },
}
