import type { Solution } from './types'
import type { GridViewData } from '../types'

// 542. 01 Matrix
const M = [[0,0,0],[0,1,0],[1,1,1]]
const O = [[0,0,0],[0,1,0],[1,2,1]]
const grid = (cells: number[][], hl: [number,number][] = [], label = 'matrix'): GridViewData => ({ kind: 'grid', label, cells, marks: { hl } })
const fig = [
  { note: '所有 0 的距離都是 0，把它們同時放進 BFS 佇列，向四周擴散。', views: [grid(M, [[0,0],[0,1],[0,2],[1,0],[1,2]])] },
  { note: '處理第一層時，(1,1)、(2,0)、(2,2) 都能從相鄰的 0 一步到達，所以距離更新為 1。', views: [grid([[0,0,0],[0,1,0],[1,9,1]], [[1,1],[2,0],[2,2]], '距離 1 的格子')] },
  { note: '下一層從距離 1 的格子擴展到 (2,1)，它第一次被到達時距離是 2。', views: [grid(O, [[2,1]], '距離 2 的格子')] },
  { note: '中間格 (1,1) 離 0 一步；底部中間格 (2,1) 最近的 0 需兩步。', views: [grid(O, [[2,1]], '到最近 0 的距離')] },
]

export const q0542: Solution = {
  id: 542,
  plain: '每個 1 格子要知道走上下左右幾步才碰到最近的 0。',
  statement: '給只含 0 和 1 的矩陣，回傳同尺寸矩陣，值為每格到最近 0 的曼哈頓距離。',
  examples: [{ input: 'mat = [[0,0,0],[0,1,0],[1,1,1]]', output: '[[0,0,0],[0,1,0],[1,2,1]]' }],
  constraints: ['1 ≤ m,n ≤ 10⁴，總格數 ≤ 10⁴；至少有一個 0。', '只可向上下左右移動。'],
  insight: ['從每個 1 分別找最近的 0 會重複走很多格。', '把所有 0 當成同一層起點做 [[p:graph-traversal]]，首次到達某格的層數即最近距離。', '另一條路是兩次 DP 掃描：左上到右下處理上、左；右下到左上處理下、右。'],
  approaches: [
    { name: '多源 BFS', idea: '所有 0 同時起跑，距離一層一層往外傳。', steps: ['把所有 0 放進佇列，其他距離先設成大值。0 格是所有距離的起點，因此它們先確定為距離 0。', '依序取格子，走四個鄰居。只從已知較短的鄰居傳遞距離，避免把較長路徑當答案。', '若鄰居可改善成目前距離+1，就更新並入隊。四個方向的可能路徑都考慮過後，矩陣才保存每格的最短距離。'], figure: { title: 'mat = [[0,0,0],[0,1,0],[1,1,1]]', steps: fig }, complexity: { time: 'O(mn)', space: 'O(mn)', why: '每格最多入隊一次；距離與佇列需保存格子。' }, verdict: '適合理解「從所有源頭同時擴散」。', code: {
      python: `from collections import deque

def updateMatrix(mat):
    m, n = (len(mat), len(mat[0]))
    d = [[10 ** 9] * n for _ in range(m)]
    q = deque()
    for r in range(m):  # 逐格傳遞到最近 0 的距離。
        for c in range(n):
            if mat[r][c] == 0:  # 只有找到更短距離時才更新鄰居。
                d[r][c] = 0
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            x, y = (r + dr, c + dc)
            if 0 <= x < m and 0 <= y < n and (d[x][y] > d[r][c] + 1):
                d[x][y] = d[r][c] + 1
                q.append((x, y))
    return d`,
      c: `int **updateMatrix(int **mat, int m, int *cols, int *returnSize, int **returnColumnSizes) {
    int n = cols[0], total = m * n, **d = malloc(m * sizeof(int*)), *q = malloc(total * sizeof(int)), h = 0, z = 0;
    *returnSize = m;
    *returnColumnSizes = malloc(m * sizeof(int));
    for (int r = 0; r < m; r++) {
        d[r] = malloc(n * sizeof(int));
        (*returnColumnSizes)[r] = n;
        for (int c = 0; c < n; c++) {
            d[r][c] = mat[r][c] == 0 ? 0 : 1000000000;
            if (mat[r][c] == 0)
                q[z++] = r * n + c;
        }
    }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (h < z) {
        int at = q[h++], r = at / n, c = at % n;
        for (int t = 0; t < 4; t++) {
            int x = r + dr[t], y = c + dc[t];
            if (x >= 0 && x < m && y >= 0 && y < n && d[x][y] > d[r][c] + 1) {
                d[x][y] = d[r][c] + 1;
                q[z++] = x * n + y;
            }
        }
    }
    free(q);
    return d;
}`,
      cpp: `vector < vector<int>> updateMatrix(vector < vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    vector < vector<int>> d(m, vector<int> (n, 1000000000));
    queue < pair<int, int>> q;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (mat[r][c] == 0) {
                d[r][c] = 0;
                q.push( {r, c});
            }
    int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();
        for (int t = 0; t < 4; t++) {
            int x = r + dr[t], y = c + dc[t];
            if (x >= 0 && x < m && y >= 0 && y < n && d[x][y] > d[r][c] + 1) {
                d[x][y] = d[r][c] + 1;
                q.push( {x, y});
            }
        }
    }
    return d;
}`,
      java: `int[][] updateMatrix(int[][] mat) {
    int m = mat.length, n = mat[0].length;
    int[][] d = new int[m][n];
    Queue < int[] > q = new ArrayDeque<>();
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (mat[r][c] == 0)
                q.offer(new int[] {r, c});
    else
        d[r][c] = 1000000000;
    int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
    while (!q.isEmpty()) {
        int[] at = q.poll();
        int r = at[0], c = at[1];
        for (int t = 0; t < 4; t++) {
            int x = r + dr[t], y = c + dc[t];
            if (x >= 0 && x < m && y >= 0 && y < n && d[x][y] > d[r][c] + 1) {
                d[x][y] = d[r][c] + 1;
                q.offer(new int[] {x, y});
            }
        }
    }
    return d;
}`,
      javascript: `function updateMatrix(mat) {
    const m = mat.length, n = mat[0].length, d = Array.from( {length : m}, () => Array(n).fill(1e9)), q = [];
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++)
            if (mat[r][c] === 0) {
                d[r][c] = 0;
                q.push([r, c]);
            }
    for (let h = 0; h < q.length; h++) {
        const [r, c] = q[h];
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const x = r + dr, y = c + dc;
            if (x >= 0 && x < m && y >= 0 && y < n && d[x][y] > d[r][c] + 1) {
                d[x][y] = d[r][c] + 1;
                q.push([x, y]);
            }
        }
    }
    return d;
}`,
    } },
    { name: '兩方向 DP 掃描', idea: '任何最短路的最後一步來自四鄰；分正向和反向兩次涵蓋四方向。', steps: ['0 格距離設 0，1 格設大值。0 格是所有距離的起點，因此它們先確定為距離 0。', '由左上到右下，用上、左鄰更新。只從已知較短的鄰居傳遞距離，避免把較長路徑當答案。', '由右下到左上，用下、右鄰更新。四個方向的可能路徑都考慮過後，矩陣才保存每格的最短距離。'], figure: { title: 'mat = [[0,0,0],[0,1,0],[1,1,1]]', steps: [{ note: '先把所有 0 設為距離 0，所有 1 暫設為很大，表示尚未找到通往 0 的路。', views: [grid(M, [[0,0],[0,1],[0,2],[1,0],[1,2]], '初始距離')] }, { note: '從左上掃到右下，用上方和左方更新；例如 (1,1) 可以從上方的 0 到達，距離成為 1。', views: [grid([[0,0,0],[0,1,0],[1,2,1]], [[1,1],[2,1]], '正向掃描')] }, { note: '反向再檢查下方與右方，確認底部中間格的最短距離是 2，得到完整答案。', views: [grid(O, [[2,1]], '兩次掃描後')] }] }, complexity: { time: 'O(mn)', space: 'O(mn)', why: '建立輸出距離矩陣，正反各掃一次。' }, verdict: '不需要佇列，程式較短。', code: {
      python: `def updateMatrix(mat):
    m, n = (len(mat), len(mat[0]))
    d = [[0 if mat[r][c] == 0 else 10 ** 9 for c in range(n)] for r in range(m)]
    for r in range(m):  # 逐格傳遞到最近 0 的距離。
        for c in range(n):
            if r:  # 只有找到更短距離時才更新鄰居。
                d[r][c] = min(d[r][c], d[r - 1][c] + 1)
            if c:
                d[r][c] = min(d[r][c], d[r][c - 1] + 1)
    for r in range(m - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            if r + 1 < m:
                d[r][c] = min(d[r][c], d[r + 1][c] + 1)
            if c + 1 < n:
                d[r][c] = min(d[r][c], d[r][c + 1] + 1)
    return d`,
      c: `int **updateMatrix(int **mat, int m, int *cols, int *returnSize, int **returnColumnSizes) {
    int n = cols[0], **d = malloc(m * sizeof(int*));
    *returnSize = m;
    *returnColumnSizes = malloc(m * sizeof(int));
    for (int r = 0; r < m; r++) {
        d[r] = malloc(n * sizeof(int));
        (*returnColumnSizes)[r] = n;
        for (int c = 0; c < n; c++)
            d[r][c] = mat[r][c] ? 1000000000 : 0;
    }
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (r && d[r - 1][c] + 1 < d[r][c])
                d[r][c] = d[r - 1][c] + 1;
            if (c && d[r][c - 1] + 1 < d[r][c])
                d[r][c] = d[r][c - 1] + 1;
        }
    for (int r = m - 1; r >= 0; r--)
        for (int c = n - 1; c >= 0; c--) {
            if (r + 1 < m && d[r + 1][c] + 1 < d[r][c])
                d[r][c] = d[r + 1][c] + 1;
            if (c + 1 < n && d[r][c + 1] + 1 < d[r][c])
                d[r][c] = d[r][c + 1] + 1;
        }
    return d;
}`,
      cpp: `vector < vector<int>> updateMatrix(vector < vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    vector < vector<int>> d(m, vector<int> (n, 1000000000));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (mat[r][c] == 0)
                d[r][c] = 0;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (r)
                d[r][c] = min(d[r][c], d[r - 1][c] + 1);
            if (c)
                d[r][c] = min(d[r][c], d[r][c - 1] + 1);
        }
    for (int r = m - 1; r >= 0; r--)
        for (int c = n - 1; c >= 0; c--) {
            if (r + 1 < m)
                d[r][c] = min(d[r][c], d[r + 1][c] + 1);
            if (c + 1 < n)
                d[r][c] = min(d[r][c], d[r][c + 1] + 1);
        }
    return d;
}`,
      java: `int[][] updateMatrix(int[][] mat) {
    int m = mat.length, n = mat[0].length;
    int[][] d = new int[m][n];
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            d[r][c] = mat[r][c] == 0 ? 0 : 1000000000;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (r > 0)
                d[r][c] = Math.min(d[r][c], d[r - 1][c] + 1);
            if (c > 0)
                d[r][c] = Math.min(d[r][c], d[r][c - 1] + 1);
        }
    for (int r = m - 1; r >= 0; r--)
        for (int c = n - 1; c >= 0; c--) {
            if (r + 1 < m)
                d[r][c] = Math.min(d[r][c], d[r + 1][c] + 1);
            if (c + 1 < n)
                d[r][c] = Math.min(d[r][c], d[r][c + 1] + 1);
        }
    return d;
}`,
      javascript: `function updateMatrix(mat) {
    const m = mat.length, n = mat[0].length, d = mat.map(row => row.map(x => x === 0 ? 0 : 1e9));
    for (let r = 0; r < m; r++)
        for (let c = 0; c < n; c++) {
            if (r)
                d[r][c] = Math.min(d[r][c], d[r - 1][c] + 1);
            if (c)
                d[r][c] = Math.min(d[r][c], d[r][c - 1] + 1);
        }
    for (let r = m - 1; r >= 0; r--)
        for (let c = n - 1; c >= 0; c--) {
            if (r + 1 < m)
                d[r][c] = Math.min(d[r][c], d[r + 1][c] + 1);
            if (c + 1 < n)
                d[r][c] = Math.min(d[r][c], d[r][c + 1] + 1);
        }
    return d;
}`,
    } },
  ],
  pitfalls: ['BFS 起點是所有 0，不是一個 0。', 'DP 初值要足夠大，不能把 1 當作已知距離。', '兩方向掃描都必須做，才能涵蓋四個方向。'],
  check: { kind: 'fn', fn: 'updateMatrix', cases: [{ args: [M], out: O }, { args: [[[0,1],[1,1]]], out: [[0,1],[1,2]] }, { args: [[[0]]], out: [[0]] }] },
}
