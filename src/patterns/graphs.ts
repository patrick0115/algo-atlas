import type { Cell, Frame, GraphEdge, GraphNode, GraphViewData, Pattern } from '../types'
import { arr, circleLayout, parseEdges, parseGrid, parseInt_, parseInts, randInt } from '../engine/helpers'
import { forestView, type GNode } from '../engine/tree'

function graphView(n: number, edges: [number, number, number][], opt: { directed?: boolean; weighted?: boolean; cls?: (i: number) => string | undefined; sub?: (i: number) => string | number | undefined; ecls?: (k: number) => string | undefined; label?: string }): GraphViewData {
  const pos = circleLayout(n, Math.max(1.2, n * 0.33))
  const nodes: GraphNode[] = pos.map((p, i) => ({ id: i, label: i, ...p, cls: opt.cls?.(i), sub: opt.sub?.(i) }))
  const es: GraphEdge[] = edges.map(([a, b, w], k) => ({ from: a, to: b, directed: opt.directed, label: opt.weighted ? w : undefined, cls: opt.ecls?.(k) }))
  return { kind: 'graph', label: opt.label, nodes, edges: es }
}

function randEdges(n: number, m: number, weighted = false, directed = false): string {
  const out: string[] = []
  const seen = new Set<string>()
  for (let k = 0; k < m * 3 && out.length < m; k++) {
    const a = randInt(0, n - 1)
    const b = randInt(0, n - 1)
    const key = directed ? `${a}-${b}` : `${Math.min(a, b)}-${Math.max(a, b)}`
    if (a === b || seen.has(key)) continue
    seen.add(key)
    out.push(weighted ? `${a}-${b}:${randInt(1, 9)}` : `${a}-${b}`)
  }
  return out.join(',')
}

// ===== 網格 BFS(200. Number of Islands) =====

function* islandsRun(v: Record<string, string>): Generator<Frame> {
  const g = parseGrid(v.grid, 'grid')
  const R = g.length
  const C = g[0].length
  const seen: boolean[][] = g.map((r) => r.map(() => false))
  const label: (string | number | null)[][] = g.map((r) => r.map((c) => (c === '1' ? '' : null)))
  let count = 0
  let queue: Cell[] = []
  const f = (line: string, note: string, cur: Cell[] = [], answer?: number): Frame => {
    const land: Cell[] = []
    const visited: Cell[] = []
    g.forEach((r, i) => r.forEach((c, j) => (seen[i][j] ? visited : c === '1' ? land : []).push([i, j])))
    return {
      line,
      note,
      vars: answer !== undefined ? { answer } : { 島嶼數: count },
      views: [
        { kind: 'grid', label: '有底色 = 陸地 · 淡灰 = 已經淹掉(拜訪過)· 數字 = 屬於第幾座島 · 虛線 = 在佇列中', cells: label, marks: { land, visited, dep: queue, hl: cur } },
        arr(queue.map(([i, j]) => `${i},${j}`), { label: '佇列 queue(列,行)' }),
      ],
    }
  }
  yield f('init', '從左上往右下掃描每一格。遇到「還沒拜訪過的陸地」,就是一座新島')
  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      if (g[i][j] !== '1' || seen[i][j]) continue
      count++
      seen[i][j] = true
      label[i][j] = count
      queue = [[i, j]]
      yield f('found', `(${i},${j}) 是新的陸地 → 第 ${count} 座島!用 BFS 把整座島「淹掉」,避免重複計算`, [[i, j]])
      while (queue.length) {
        const [r, c] = queue.shift()!
        yield f('pop', `從佇列拿出 (${r},${c}),看它上下左右四個鄰居`, [[r, c]])
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nr = r + dr
          const nc = c + dc
          if (nr < 0 || nc < 0 || nr >= R || nc >= C || g[nr][nc] !== '1' || seen[nr][nc]) continue
          seen[nr][nc] = true
          label[nr][nc] = count
          queue.push([nr, nc])
          yield f('push', `(${nr},${nc}) 是相連的陸地,標記並放進佇列`, [[r, c]])
        }
      }
      yield f('done-island', `第 ${count} 座島淹完了,繼續掃描`)
    }
  }
  yield f('end', `掃描完畢,共 ${count} 座島`, [], count)
}

export const graphTraversal: Pattern = {
  id: 'graph-traversal',
  summary: '圖(以及網格)的 BFS / DFS:從一個起點出發,把「相連的」全部走過一遍。要記得標記走過的點,否則會在環裡繞不停。BFS 一層一層擴散,第一次到達某點時走的步數就是最短距離。',
  analogy: '在地圖上把墨水滴在一塊陸地上,墨水會沿著相連的陸地擴散,但過不了海。數「滴了幾次墨水才把所有陸地染完」,就是島嶼數量。',
  steps: ['準備 visited 標記(或直接把格子改掉)', '起點標記並放進佇列(BFS)或直接遞迴(DFS)', '每次拿出一個點,檢查它的鄰居(網格是上下左右)', '鄰居合法、沒走過 → 標記、加入佇列', '佇列空了,這個連通塊就走完了'],
  watch: ['數字表示這格屬於第幾座島', '「放進佇列時就標記」—— 這樣同一格不會被放進去兩次'],
  whenToUse: ['數連通塊:島嶼數量、省份數量', '最少步數:迷宮最短路、單字接龍、打開轉盤鎖(狀態當成節點)', '多源 BFS:所有起點同時放進佇列(腐爛的橘子、01 矩陣)', '從邊界反向搜尋(被圍繞的區域、太平洋大西洋)'],
  pitfalls: ['要在「放進佇列時」標記,不是「拿出來時」,否則會重複加入', '檢查邊界的順序:先確認座標合法,再讀格子', '遞迴 DFS 在大網格可能堆疊溢位 → 改 BFS'],
  complexity: { time: 'O(V + E),網格是 O(R × C)', space: 'O(V)', why: '每個點只進佇列一次,每條邊只檢查常數次。' },
  demo: {
    title: '數島嶼:1 是陸地、0 是海(LeetCode 200)',
    inputs: [{ key: 'grid', label: 'grid(每列用 / 分隔)', default: '11000/11010/00100/00011/10011' }],
    run: islandsRun,
    reference: (v) => {
      const g = parseGrid(v.grid, 'grid')
      let n = 0
      const sink = (i: number, j: number): void => {
        if (i < 0 || j < 0 || i >= g.length || j >= g[0].length || g[i][j] !== '1') return
        g[i][j] = '0'
        sink(i + 1, j)
        sink(i - 1, j)
        sink(i, j + 1)
        sink(i, j - 1)
      }
      g.forEach((r, i) => r.forEach((_, j) => g[i][j] === '1' && (n++, sink(i, j))))
      return n
    },
    random: () => {
      const R = randInt(1, 5)
      const C = randInt(1, 6)
      return { grid: Array.from({ length: R }, () => Array.from({ length: C }, () => (Math.random() < 0.5 ? '1' : '0')).join('')).join('/') }
    },
    code: {
      python: `from collections import deque
def num_islands(grid):
    R, C, count = len(grid), len(grid[0]), 0    #@init
    for i in range(R):
        for j in range(C):
            if grid[i][j] != '1': continue
            count += 1                          #@found
            grid[i][j] = '0'                    #@found
            q = deque([(i, j)])                 #@found
            while q:
                r, c = q.popleft()              #@pop
                for nr, nc in ((r+1,c),(r-1,c),(r,c+1),(r,c-1)):
                    if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == '1':
                        grid[nr][nc] = '0'      #@push
                        q.append((nr, nc))      #@push
            # 這座島淹完了                     #@done-island
    return count                                #@end`,
      c: `int numIslands(char** grid, int R, int* colSize) {
    int C = colSize[0], count = 0;              //@init
    int *q = malloc(sizeof(int) * R * C);
    int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) {
            if (grid[i][j] != '1') continue;
            count++; grid[i][j] = '0';          //@found
            int head = 0, tail = 0; q[tail++] = i * C + j;  //@found
            while (head < tail) {
                int r = q[head] / C, c = q[head++] % C;     //@pop
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nc < 0 || nr >= R || nc >= C || grid[nr][nc] != '1') continue;
                    grid[nr][nc] = '0';         //@push
                    q[tail++] = nr * C + nc;    //@push
                }
            }
            // 這座島淹完了                    //@done-island
        }
    free(q);
    return count;                               //@end
}`,
      cpp: `int numIslands(vector<vector<char>>& g) {
    int R = g.size(), C = g[0].size(), count = 0;   //@init
    int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) {
            if (g[i][j] != '1') continue;
            count++; g[i][j] = '0';             //@found
            queue<pair<int,int>> q; q.push({i, j});     //@found
            while (!q.empty()) {
                auto [r, c] = q.front(); q.pop();       //@pop
                for (int d = 0; d < 4; d++) {
                    int nr = r + dr[d], nc = c + dc[d];
                    if (nr < 0 || nc < 0 || nr >= R || nc >= C || g[nr][nc] != '1') continue;
                    g[nr][nc] = '0';            //@push
                    q.push({nr, nc});           //@push
                }
            }
            // 這座島淹完了                    //@done-island
        }
    return count;                               //@end
}`,
      java: `int numIslands(char[][] g) {
    int R = g.length, C = g[0].length, count = 0;   //@init
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) {
            if (g[i][j] != '1') continue;
            count++; g[i][j] = '0';             //@found
            Deque<int[]> q = new ArrayDeque<>(); q.add(new int[]{i, j});  //@found
            while (!q.isEmpty()) {
                int[] cur = q.poll();           //@pop
                for (int[] d : dirs) {
                    int nr = cur[0] + d[0], nc = cur[1] + d[1];
                    if (nr < 0 || nc < 0 || nr >= R || nc >= C || g[nr][nc] != '1') continue;
                    g[nr][nc] = '0';            //@push
                    q.add(new int[]{nr, nc});   //@push
                }
            }
            // 這座島淹完了                    //@done-island
        }
    return count;                               //@end
}`,
      javascript: `function numIslands(g) {
  const R = g.length, C = g[0].length; let count = 0;   //@init
  for (let i = 0; i < R; i++)
    for (let j = 0; j < C; j++) {
      if (g[i][j] !== '1') continue;
      count++; g[i][j] = '0';                   //@found
      const q = [[i, j]];                       //@found
      while (q.length) {
        const [r, c] = q.shift();               //@pop
        for (const [nr, nc] of [[r+1,c],[r-1,c],[r,c+1],[r,c-1]]) {
          if (nr < 0 || nc < 0 || nr >= R || nc >= C || g[nr][nc] !== '1') continue;
          g[nr][nc] = '0';                      //@push
          q.push([nr, nc]);                     //@push
        }
      }
      // 這座島淹完了                          //@done-island
    }
  return count;                                 //@end
}`,
    },
  },
}

// ===== 拓撲排序(Kahn) =====

function hasCycle(n: number, edges: [number, number, number][]): boolean {
  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) adj[a].push(b)
  const color = new Array(n).fill(0)
  const dfs = (u: number): boolean => {
    color[u] = 1
    for (const w of adj[u]) if (color[w] === 1 || (color[w] === 0 && dfs(w))) return true
    color[u] = 2
    return false
  }
  return range0(n).some((u) => color[u] === 0 && dfs(u))
}
const range0 = (n: number) => Array.from({ length: n }, (_, i) => i)

function* topoRun(v: Record<string, string>): Generator<Frame> {
  const n = parseInt_(v.n, 'n', 1, 9)
  const edges = parseEdges(v.edges, n, false)
  const adj: number[][] = Array.from({ length: n }, () => [])
  const indeg = new Array(n).fill(0)
  for (const [a, b] of edges) {
    adj[a].push(b)
    indeg[b]++
  }
  const order: number[] = []
  let q: number[] = []
  let cur = -1
  const removed = new Set<number>()
  const f = (line: string, note: string, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      graphView(n, edges, {
        directed: true,
        label: '箭頭 a → b 表示 a 要在 b 之前 · 節點下方是入度(還有幾個前置條件沒完成)',
        cls: (i) => (i === cur ? 'hl' : removed.has(i) ? 'done' : q.includes(i) ? 'queued' : undefined),
        sub: (i) => (removed.has(i) ? '✓' : `入度 ${indeg[i]}`),
        ecls: (k) => (removed.has(edges[k][0]) ? 'dim' : edges[k][0] === cur ? 'hl' : undefined),
      }),
      arr(q, { label: '佇列:入度為 0、可以做了的節點' }),
      arr(order, { label: '拓撲順序' }),
    ],
  })
  yield f('indeg', '先算每個節點的入度(有幾條箭頭指向它 = 有幾個前置條件)')
  q = range0(n).filter((i) => indeg[i] === 0)
  yield f('init', `入度為 0 的節點沒有前置條件,可以先做:${q.join(', ') || '(沒有)'}`)
  while (q.length) {
    cur = q.shift()!
    order.push(cur)
    yield f('pop', `拿出 ${cur},排進順序`)
    for (const w of adj[cur]) {
      indeg[w]--
      if (indeg[w] === 0) q.push(w)
      yield f('relax', `${cur} 完成了,${w} 少一個前置條件,入度變成 ${indeg[w]}${indeg[w] === 0 ? ' → 可以做了,放進佇列' : ''}`)
    }
    removed.add(cur)
    cur = -1
  }
  const ok = order.length === n
  yield f('end', ok ? `全部 ${n} 個節點都排進去了,這就是一個合法順序` : `只排進 ${order.length} 個,剩下的節點入度永遠不會變 0 → 圖中有環,不可能完成`, ok ? 'ok' : 'cycle')
}

export const topologicalSort: Pattern = {
  id: 'topological-sort',
  summary: '有向圖中,箭頭 a → b 代表「a 必須在 b 之前」。拓撲排序找出一個滿足所有先後條件的順序。Kahn 演算法:反覆拿出「已經沒有前置條件」(入度 0)的節點。',
  analogy: '排課表:微積分要先修完才能上工程數學。先上那些沒有先修課的,上完之後,等它們的課就少了一門先修條件。',
  steps: ['算出每個節點的入度', '入度為 0 的全部放進佇列', '拿出一個節點,加入答案', '它指向的每個節點入度 −1;變成 0 就放進佇列', '最後排進答案的數量 < n → 有環'],
  watch: ['節點下方的入度會慢慢減少', '虛線框是在佇列裡、可以做的節點'],
  whenToUse: ['課程表、任務依賴、編譯順序', '判斷有向圖有沒有環', '外星文字典(從單字順序推出字母的先後)', '在 DAG 上做 DP(依拓撲順序轉移)'],
  pitfalls: ['邊的方向要想清楚:[a, b] 是「先修 b 才能修 a」時,箭頭是 b → a', '答案通常不唯一', '用「排進的數量是否 = n」判斷有沒有環'],
  complexity: { time: 'O(V + E)', space: 'O(V + E)', why: '每個節點進出佇列一次,每條邊只讓入度減一次。' },
  demo: {
    title: '課程表:找出一個可以修完所有課的順序(LeetCode 210)',
    inputs: [
      { key: 'n', label: '節點數 n', default: '6' },
      { key: 'edges', label: '邊(a-b 表示 a → b)', default: '0-1,0-2,1-3,2-3,3-4,5-4' },
    ],
    run: topoRun,
    reference: (v) => (hasCycle(Number(v.n), parseEdges(v.edges, Number(v.n), false)) ? 'cycle' : 'ok'),
    random: () => {
      const n = randInt(1, 7)
      return { n: String(n), edges: n > 1 ? randEdges(n, randInt(0, 8), false, true) : '' }
    },
    code: {
      python: `from collections import deque
def topo_sort(n, edges):
    adj, indeg = [[] for _ in range(n)], [0] * n
    for a, b in edges:
        adj[a].append(b); indeg[b] += 1         #@indeg
    q = deque(i for i in range(n) if indeg[i] == 0)  #@init
    order = []
    while q:
        u = q.popleft(); order.append(u)        #@pop
        for w in adj[u]:
            indeg[w] -= 1                       #@relax
            if indeg[w] == 0: q.append(w)       #@relax
    return order if len(order) == n else None   #@end`,
      c: `// adj 用鄰接矩陣簡化;order 長度 n
bool topoSort(int n, int adj[][9], int order[]) {
    int indeg[9] = {0}, q[9], head = 0, tail = 0, cnt = 0;
    for (int a = 0; a < n; a++)
        for (int b = 0; b < n; b++) if (adj[a][b]) indeg[b]++;  //@indeg
    for (int i = 0; i < n; i++) if (!indeg[i]) q[tail++] = i;   //@init
    while (head < tail) {
        int u = q[head++]; order[cnt++] = u;    //@pop
        for (int w = 0; w < n; w++) if (adj[u][w]) {
            if (--indeg[w] == 0) q[tail++] = w; //@relax
        }
    }
    return cnt == n;                            //@end
}`,
      cpp: `vector<int> topoSort(int n, vector<pair<int,int>>& edges) {
    vector<vector<int>> adj(n); vector<int> indeg(n, 0), order;
    for (auto [a, b] : edges) { adj[a].push_back(b); indeg[b]++; }  //@indeg
    queue<int> q;
    for (int i = 0; i < n; i++) if (!indeg[i]) q.push(i);   //@init
    while (!q.empty()) {
        int u = q.front(); q.pop(); order.push_back(u);     //@pop
        for (int w : adj[u])
            if (--indeg[w] == 0) q.push(w);     //@relax
    }
    return order.size() == n ? order : vector<int>{};       //@end
}`,
      java: `int[] topoSort(int n, int[][] edges) {
    List<List<Integer>> adj = new ArrayList<>(); int[] indeg = new int[n];
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) { adj.get(e[0]).add(e[1]); indeg[e[1]]++; }  //@indeg
    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);    //@init
    int[] order = new int[n]; int cnt = 0;
    while (!q.isEmpty()) {
        int u = q.poll(); order[cnt++] = u;     //@pop
        for (int w : adj.get(u))
            if (--indeg[w] == 0) q.add(w);      //@relax
    }
    return cnt == n ? order : new int[0];       //@end
}`,
      javascript: `function topoSort(n, edges) {
  const adj = Array.from({ length: n }, () => []), indeg = new Array(n).fill(0);
  for (const [a, b] of edges) { adj[a].push(b); indeg[b]++; }   //@indeg
  const q = [], order = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) q.push(i);         //@init
  while (q.length) {
    const u = q.shift(); order.push(u);         //@pop
    for (const w of adj[u])
      if (--indeg[w] === 0) q.push(w);          //@relax
  }
  return order.length === n ? order : null;     //@end
}`,
    },
  },
}

// ===== 並查集 =====

function* ufRun(v: Record<string, string>): Generator<Frame> {
  const n = parseInt_(v.n, 'n', 1, 10)
  const edges = parseEdges(v.edges, n, false)
  const parent = range0(n)
  let groups = n
  let curEdge = -1
  const hl: number[] = []
  const forest = (): GraphViewData => {
    const nodes: GNode[] = range0(n).map((i) => ({ id: i, label: String(i), children: [] }))
    const root: GNode = { id: -1, label: '', children: [] }
    range0(n).forEach((i) => (parent[i] === i ? root : nodes[parent[i]]).children.push(nodes[i]))
    const view = forestView(root, { cls: new Map(hl.map((i) => [i, 'hl'] as [number, string])) })
    // 拿掉虛擬根
    view.nodes = view.nodes.filter((nd) => nd.id !== -1).map((nd) => ({ ...nd, y: nd.y - 1.05 }))
    view.edges = view.edges.filter((e) => e.from !== -1).map((e) => ({ ...e, from: e.to, to: e.from, directed: true }))
    view.label = '並查集的森林:箭頭指向 parent,每棵樹的根就是那一組的「代表」'
    return view
  }
  const f = (line: string, note: string, answer?: number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : { 組數: groups },
    views: [
      graphView(n, edges, { label: '原本的圖', ecls: (k) => (k === curEdge ? 'hl' : k < curEdge ? 'done' : 'dim'), cls: (i) => (hl.includes(i) ? 'hl' : undefined) }),
      forest(),
      arr(parent, { label: 'parent 陣列(parent[i] == i 表示自己是代表)', highlight: hl }),
    ],
  })
  function* find(x: number): Generator<Frame, number> {
    const path = [x]
    while (parent[path.at(-1)!] !== path.at(-1)!) path.push(parent[path.at(-1)!])
    const r = path.at(-1)!
    hl.splice(0, hl.length, ...path)
    yield f('find', `find(${x}):一路沿著 parent 往上走 ${path.join(' → ')},代表是 ${r}`)
    let compressed = false
    for (const p of path) if (parent[p] !== r) ((parent[p] = r), (compressed = true))
    if (compressed) yield f('compress', `路徑壓縮:把路上的節點直接指向代表 ${r},下次 find 就一步到位`)
    return r
  }
  yield f('init', `一開始每個節點自己一組,共 ${n} 組`)
  for (let k = 0; k < edges.length; k++) {
    curEdge = k
    const [a, b] = edges[k]
    yield f('edge', `處理邊 ${a} — ${b}:它們在同一組嗎?`)
    const ra = yield* find(a)
    const rb = yield* find(b)
    if (ra === rb) {
      hl.splice(0, hl.length, a, b)
      yield f('same', `${a} 和 ${b} 的代表都是 ${ra} → 早就在同一組了(這條邊會形成環)`)
      continue
    }
    parent[ra] = rb
    groups--
    hl.splice(0, hl.length, ra, rb)
    yield f('union', `代表不同,合併:讓 ${ra} 指向 ${rb}。組數剩 ${groups}`)
  }
  hl.length = 0
  curEdge = edges.length
  yield f('done', `所有邊處理完,共 ${groups} 個連通塊`, groups)
}

export const unionFind: Pattern = {
  id: 'union-find',
  summary: '並查集(Union-Find)專門處理「分組」:哪些東西屬於同一組?把兩組合併。每組用一棵樹表示,樹根就是這組的代表。find 找代表、union 合併兩組,加上路徑壓縮後幾乎是 O(1)。',
  analogy: '每個班級有一個班長。想知道兩個人是不是同班,就各自問「你的班長是誰」,一路問上去,班長相同就是同班。兩班合併時,只要讓其中一個班長聽另一個班長的。',
  steps: ['parent[i] = i:一開始每個人自己是代表', 'find(x):沿著 parent 往上走到根;順便把路上的節點都直接指向根(路徑壓縮)', 'union(a, b):找到兩個代表,不同就讓其中一個指向另一個', '組數 = 成功合併的次數讓 n 一路減少'],
  watch: ['中間的森林:每棵樹是一組', '看路徑壓縮怎麼把長鏈「壓扁」'],
  whenToUse: ['動態加邊、問「是否連通」「有幾個連通塊」', '找讓圖出現環的那條多餘邊(Redundant Connection)', 'Kruskal 最小生成樹', '帳號合併、等式方程是否可滿足'],
  pitfalls: ['union 前一定要先 find,合併的是「代表」而不是節點本身', '只做路徑壓縮在實務上已經夠快;再加「按大小合併」更穩'],
  complexity: { time: '每次操作近乎 O(1)', space: 'O(n)', why: '路徑壓縮 + 按秩合併後是 O(α(n)),α 是極慢成長的函數,實際上 <= 4。' },
  demo: {
    title: '計算無向圖的連通塊數量(LeetCode 323 / 547)',
    inputs: [
      { key: 'n', label: '節點數 n', default: '8' },
      { key: 'edges', label: '邊', default: '0-1,1-2,3-4,5-6,6-7,7-5,2-0' },
    ],
    run: ufRun,
    reference: (v) => {
      const n = Number(v.n)
      const adj: number[][] = Array.from({ length: n }, () => [])
      for (const [a, b] of parseEdges(v.edges, n, false)) adj[a].push(b), adj[b].push(a)
      const seen = new Array(n).fill(false)
      let c = 0
      const dfs = (u: number): void => {
        seen[u] = true
        adj[u].forEach((w) => !seen[w] && dfs(w))
      }
      for (let i = 0; i < n; i++) if (!seen[i]) c++, dfs(i)
      return c
    },
    random: () => {
      const n = randInt(1, 9)
      return { n: String(n), edges: n > 1 ? randEdges(n, randInt(0, 8)) : '' }
    },
    code: {
      python: `def count_components(n, edges):
    parent = list(range(n))                     #@init
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])  # 路徑壓縮   #@compress
        return parent[x]                        #@find
    groups = n
    for a, b in edges:                          #@edge
        ra, rb = find(a), find(b)
        if ra == rb: continue                   #@same
        parent[ra] = rb                         #@union
        groups -= 1                             #@union
    return groups                               #@done`,
      c: `int parent[10000];
int find(int x) {
    if (parent[x] != x)
        parent[x] = find(parent[x]);  // 路徑壓縮   //@compress
    return parent[x];                           //@find
}
int countComponents(int n, int edges[][2], int m) {
    for (int i = 0; i < n; i++) parent[i] = i;  //@init
    int groups = n;
    for (int k = 0; k < m; k++) {               //@edge
        int ra = find(edges[k][0]), rb = find(edges[k][1]);
        if (ra == rb) continue;                 //@same
        parent[ra] = rb; groups--;              //@union
    }
    return groups;                              //@done
}`,
      cpp: `vector<int> parent;
int find(int x) {
    if (parent[x] != x)
        parent[x] = find(parent[x]);  // 路徑壓縮   //@compress
    return parent[x];                           //@find
}
int countComponents(int n, vector<vector<int>>& edges) {
    parent.resize(n); iota(parent.begin(), parent.end(), 0);  //@init
    int groups = n;
    for (auto& e : edges) {                     //@edge
        int ra = find(e[0]), rb = find(e[1]);
        if (ra == rb) continue;                 //@same
        parent[ra] = rb; groups--;              //@union
    }
    return groups;                              //@done
}`,
      java: `int[] parent;
int find(int x) {
    if (parent[x] != x)
        parent[x] = find(parent[x]);  // 路徑壓縮   //@compress
    return parent[x];                           //@find
}
int countComponents(int n, int[][] edges) {
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;  //@init
    int groups = n;
    for (int[] e : edges) {                     //@edge
        int ra = find(e[0]), rb = find(e[1]);
        if (ra == rb) continue;                 //@same
        parent[ra] = rb; groups--;              //@union
    }
    return groups;                              //@done
}`,
      javascript: `function countComponents(n, edges) {
  const parent = Array.from({ length: n }, (_, i) => i);  //@init
  const find = (x) => {
    if (parent[x] !== x)
      parent[x] = find(parent[x]);    // 路徑壓縮   //@compress
    return parent[x];                           //@find
  };
  let groups = n;
  for (const [a, b] of edges) {                 //@edge
    const ra = find(a), rb = find(b);
    if (ra === rb) continue;                    //@same
    parent[ra] = rb; groups--;                  //@union
  }
  return groups;                                //@done
}`,
    },
  },
}

// ===== Dijkstra =====

function* dijkstraRun(v: Record<string, string>): Generator<Frame> {
  const n = parseInt_(v.n, 'n', 1, 8)
  const edges = parseEdges(v.edges, n, true)
  if (edges.some((e) => e[2] < 0)) throw new Error('Dijkstra 不能有負權重')
  const src = parseInt_(v.src, '起點', 0, n - 1)
  const adj: [number, number, number][][] = Array.from({ length: n }, () => [])
  edges.forEach(([a, b, w], k) => {
    adj[a].push([b, w, k])
    adj[b].push([a, w, k])
  })
  const dist = new Array(n).fill(Infinity)
  const done = new Array(n).fill(false)
  const via = new Array(n).fill(-1)
  let cur = -1
  let hlEdge = -1
  let pq: [number, number][] = []
  const show = (d: number) => (d === Infinity ? '∞' : d)
  const f = (line: string, note: string, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [
      graphView(n, edges, {
        weighted: true,
        label: '無向圖,邊上的數字是距離 · 節點下方是目前已知的最短距離 · 粗線是最短路徑樹',
        cls: (i) => (i === cur ? 'hl' : done[i] ? 'done' : dist[i] < Infinity ? 'queued' : undefined),
        sub: (i) => `d=${show(dist[i])}`,
        ecls: (k) => (k === hlEdge ? 'hl' : via.includes(k) ? 'done' : undefined),
      }),
      arr(pq.map(([d, u]) => `${u}:${d}`), { label: '優先佇列(節點:距離,由小到大)' }),
    ],
  })
  dist[src] = 0
  pq = [[0, src]]
  yield f('init', `起點 ${src} 的距離是 0,其他都是 ∞`)
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    const [d, u] = pq.shift()!
    if (done[u]) {
      yield f('skip', `拿出 ${u}:${d},但 ${u} 已經確定過了(這是舊的、比較長的紀錄),跳過`)
      continue
    }
    cur = u
    done[u] = true
    yield f('pop', `目前「未確定」的節點中,${u} 距離最小(${d})→ 它的最短距離確定了`)
    for (const [w, wt, k] of adj[u]) {
      if (done[w]) continue
      hlEdge = k
      const nd = d + wt
      if (nd < dist[w]) {
        dist[w] = nd
        via[w] = k
        pq.push([nd, w])
        yield f('relax', `經過 ${u} 到 ${w}:${d} + ${wt} = ${nd},比原本更短 → 更新`)
      } else {
        yield f('relax', `經過 ${u} 到 ${w}:${d} + ${wt} = ${nd},沒有比原本的 ${show(dist[w])} 短`)
      }
    }
    hlEdge = -1
    cur = -1
  }
  yield f('done', '佇列空了,所有可到達節點的最短距離都確定了', dist.map(show).join(','))
}

export const dijkstra: Pattern = {
  id: 'dijkstra',
  summary: '在權重都是非負數的圖中,求起點到每個點的最短距離。每次從「還沒確定」的點裡挑距離最小的,它的距離就確定了,再用它去更新鄰居。用優先佇列(最小堆)來挑最小的。',
  analogy: '從家裡出發去各個地方:最近的那家便利商店,一定是直接走過去最快(不可能繞遠路反而更近)。確定之後,再看從便利商店出發能不能更快到其他地方。',
  steps: ['dist[起點] = 0,其他 ∞;起點放進最小堆', '從堆中拿出距離最小的點 u(若已確定過就跳過)', '標記 u 已確定', '對 u 的每個鄰居 w:如果 dist[u] + 邊長 < dist[w],就更新並放進堆', '重複到堆空'],
  watch: ['黑色是剛確定的點,淡灰是已確定的點,虛線框是有暫定距離的點', '粗線慢慢連成一棵「最短路徑樹」'],
  whenToUse: ['非負權重的單源最短路徑(網路延遲時間)', '變形:路徑代價是「最大值」(最小體力消耗路徑)或「乘積」(最大機率路徑)', '網格上的最短路徑,每格代價不同'],
  pitfalls: ['不能處理負權重 → 改用 Bellman-Ford', '同一個點可能在堆中出現多次,拿出時要檢查是否已確定', '權重都是 1 的話,BFS 就夠了'],
  complexity: { time: 'O((V + E) log V)', space: 'O(V + E)', why: '每條邊最多讓堆多一筆資料,每次堆操作 log V。' },
  demo: {
    title: '從起點到每個點的最短距離(LeetCode 743)',
    inputs: [
      { key: 'n', label: '節點數 n', default: '6' },
      { key: 'edges', label: '邊(a-b:距離)', default: '0-1:7,0-2:9,0-5:14,1-2:10,1-3:15,2-3:11,2-5:2,3-4:6,4-5:9' },
      { key: 'src', label: '起點', default: '0' },
    ],
    run: dijkstraRun,
    reference: (v) => {
      const n = Number(v.n)
      const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
      for (const [a, b, w] of parseEdges(v.edges, n, true)) d[a][b] = d[b][a] = Math.min(d[a][b], w)
      for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
      return d[Number(v.src)].map((x) => (x === Infinity ? '∞' : x)).join(',')
    },
    random: () => {
      const n = randInt(1, 7)
      return { n: String(n), edges: n > 1 ? randEdges(n, randInt(0, 10), true) : '', src: String(randInt(0, n - 1)) }
    },
    code: {
      python: `import heapq
def dijkstra(n, adj, src):
    dist = [float('inf')] * n
    dist[src] = 0                               #@init
    pq, done = [(0, src)], [False] * n          #@init
    while pq:
        d, u = heapq.heappop(pq)
        if done[u]: continue                    #@skip
        done[u] = True                          #@pop
        for w, wt in adj[u]:
            if d + wt < dist[w]:                #@relax
                dist[w] = d + wt                #@relax
                heapq.heappush(pq, (dist[w], w))  #@relax
    return dist                                 #@done`,
      c: `// 簡化版:O(V²) 每次線性找最小(n 小時常用)
void dijkstra(int n, int w[][8], int src, int dist[]) {
    bool done[8] = {0};
    for (int i = 0; i < n; i++) dist[i] = INT_MAX;
    dist[src] = 0;                              //@init
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int i = 0; i < n; i++)             //@skip
            if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
        if (dist[u] == INT_MAX) break;
        done[u] = true;                         //@pop
        for (int v = 0; v < n; v++)
            if (w[u][v] && dist[u] + w[u][v] < dist[v])   //@relax
                dist[v] = dist[u] + w[u][v];    //@relax
    }
}                                               //@done`,
      cpp: `vector<int> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int src) {
    vector<int> dist(n, INT_MAX); vector<bool> done(n);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    dist[src] = 0; pq.push({0, src});           //@init
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (done[u]) continue;                  //@skip
        done[u] = true;                         //@pop
        for (auto [w, wt] : adj[u])
            if (d + wt < dist[w]) {             //@relax
                dist[w] = d + wt;               //@relax
                pq.push({dist[w], w});          //@relax
            }
    }
    return dist;                                //@done
}`,
      java: `int[] dijkstra(int n, List<int[]>[] adj, int src) {
    int[] dist = new int[n]; Arrays.fill(dist, Integer.MAX_VALUE);
    boolean[] done = new boolean[n];
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    dist[src] = 0; pq.add(new int[]{0, src});   //@init
    while (!pq.isEmpty()) {
        int[] top = pq.poll(); int d = top[0], u = top[1];
        if (done[u]) continue;                  //@skip
        done[u] = true;                         //@pop
        for (int[] e : adj[u])
            if (d + e[1] < dist[e[0]]) {        //@relax
                dist[e[0]] = d + e[1];          //@relax
                pq.add(new int[]{dist[e[0]], e[0]});  //@relax
            }
    }
    return dist;                                //@done
}`,
      javascript: `// 簡化:用排序陣列當優先佇列
function dijkstra(n, adj, src) {
  const dist = new Array(n).fill(Infinity), done = new Array(n).fill(false);
  dist[src] = 0; const pq = [[0, src]];         //@init
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (done[u]) continue;                      //@skip
    done[u] = true;                             //@pop
    for (const [w, wt] of adj[u])
      if (d + wt < dist[w]) {                   //@relax
        dist[w] = d + wt;                       //@relax
        pq.push([dist[w], w]);                  //@relax
      }
  }
  return dist;                                  //@done
}`,
    },
  },
}

// ===== 最小生成樹(Kruskal) =====

function* kruskalRun(v: Record<string, string>): Generator<Frame> {
  const n = parseInt_(v.n, 'n', 1, 8)
  const edges = parseEdges(v.edges, n, true)
  const order = edges.map((_, k) => k).sort((a, b) => edges[a][2] - edges[b][2] || a - b)
  const parent = range0(n)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const chosen = new Set<number>()
  const rejected = new Set<number>()
  let cur = -1
  let total = 0
  const f = (line: string, note: string, answer?: string | number): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : { 總權重: total, 已選邊數: chosen.size },
    views: [
      graphView(n, edges, {
        weighted: true,
        label: '粗線 = 選進生成樹的邊 · 淡線 = 被拒絕(會形成環)的邊',
        ecls: (k) => (k === cur ? 'hl' : chosen.has(k) ? 'done' : rejected.has(k) ? 'dim' : undefined),
        cls: (i) => (cur >= 0 && (edges[cur][0] === i || edges[cur][1] === i) ? 'hl' : undefined),
      }),
      arr(order.map((k) => `${edges[k][0]}-${edges[k][1]}:${edges[k][2]}`), { label: '所有邊依權重由小到大排序', highlight: cur >= 0 ? [order.indexOf(cur)] : [], done: order.map((k, i) => (chosen.has(k) ? i : -1)).filter((i) => i >= 0), dim: order.map((k, i) => (rejected.has(k) ? i : -1)).filter((i) => i >= 0) }),
    ],
  })
  yield f('sort', '把所有邊依權重由小到大排好。從最便宜的開始挑')
  for (const k of order) {
    if (chosen.size === n - 1) break
    cur = k
    const [a, b, w] = edges[k]
    const ra = find(a)
    const rb = find(b)
    if (ra === rb) {
      rejected.add(k)
      yield f('reject', `${a}-${b}(${w}):${a} 和 ${b} 已經連通了,再加這條會形成環 → 不要`)
    } else {
      parent[ra] = rb
      chosen.add(k)
      total += w
      yield f('take', `${a}-${b}(${w}):${a} 和 ${b} 還沒連通 → 選它!總權重 ${total}`)
    }
  }
  cur = -1
  const ok = chosen.size === n - 1
  yield f('done', ok ? `選了 ${n - 1} 條邊,所有點都連起來了,最小總權重 = ${total}` : '邊不夠,圖本身不連通,無法生成一棵樹', ok ? total : 'disconnected')
}

export const mst: Pattern = {
  id: 'mst',
  summary: '最小生成樹:用最少的總成本,把所有點連起來(剛好 n−1 條邊,沒有環)。Kruskal:把邊從便宜到貴排好,一條一條試,只要不會形成環就選它。用並查集判斷會不會形成環。',
  analogy: '幫幾個村莊鋪路,要讓每個村莊都能互通,總花費最少:先鋪最便宜的路;如果某條路連接的兩個村莊早就能互通了,就不用浪費錢再鋪。',
  steps: ['所有邊依權重排序', '並查集初始化:每個點自己一組', '依序看每條邊 (a, b):a、b 不同組 → 選它並合併;同組 → 跳過(會形成環)', '選滿 n−1 條就完成'],
  watch: ['下面的列表是排好序的邊,一條一條被處理', '被拒絕的邊連接的兩點,其實已經能透過粗線互通'],
  whenToUse: ['連接所有點的最小成本(Min Cost to Connect All Points)', '點很多、邊很密(完全圖)時,Prim O(V²) 可能比 Kruskal 快'],
  pitfalls: ['圖不連通時沒有生成樹,要檢查選到的邊數', '完全圖的邊數是 V²,先建全部邊再排序可能太慢'],
  complexity: { time: 'O(E log E)', space: 'O(V + E)', why: '主要時間花在排序;並查集操作幾乎 O(1)。' },
  demo: {
    title: '用 Kruskal 求最小生成樹的總權重(LeetCode 1584 的核心)',
    inputs: [
      { key: 'n', label: '節點數 n', default: '6' },
      { key: 'edges', label: '邊(a-b:成本)', default: '0-1:4,0-2:3,1-2:1,1-3:2,2-3:4,3-4:2,4-5:6,3-5:7,2-4:5' },
    ],
    run: kruskalRun,
    reference: (v) => {
      // Prim O(V²)
      const n = Number(v.n)
      const w = Array.from({ length: n }, () => new Array(n).fill(Infinity))
      for (const [a, b, c] of parseEdges(v.edges, n, true)) w[a][b] = w[b][a] = Math.min(w[a][b], c)
      const inT = new Array(n).fill(false)
      const best = new Array(n).fill(Infinity)
      best[0] = 0
      let total = 0
      for (let it = 0; it < n; it++) {
        let u = -1
        for (let i = 0; i < n; i++) if (!inT[i] && (u < 0 || best[i] < best[u])) u = i
        if (best[u] === Infinity) return 'disconnected'
        inT[u] = true
        total += best[u]
        for (let i = 0; i < n; i++) if (!inT[i]) best[i] = Math.min(best[i], w[u][i])
      }
      return total
    },
    random: () => {
      const n = randInt(1, 7)
      return { n: String(n), edges: n > 1 ? randEdges(n, randInt(n - 1, 12), true) : '' }
    },
    code: {
      python: `def kruskal(n, edges):           # edges: (w, a, b)
    edges.sort()                                #@sort
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    total = used = 0
    for w, a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb: continue                   #@reject
        parent[ra] = rb                         #@take
        total += w; used += 1                   #@take
    return total if used == n - 1 else -1       #@done`,
      c: `int parent[1000];
int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
int cmp(const void *a, const void *b) { return ((int*)a)[0] - ((int*)b)[0]; }
int kruskal(int n, int edges[][3], int m) {     // edges[k] = {w, a, b}
    qsort(edges, m, sizeof edges[0], cmp);      //@sort
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0, used = 0;
    for (int k = 0; k < m; k++) {
        int ra = find(edges[k][1]), rb = find(edges[k][2]);
        if (ra == rb) continue;                 //@reject
        parent[ra] = rb;                        //@take
        total += edges[k][0]; used++;           //@take
    }
    return used == n - 1 ? total : -1;          //@done
}`,
      cpp: `vector<int> parent;
int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
int kruskal(int n, vector<array<int,3>>& edges) {   // {w, a, b}
    sort(edges.begin(), edges.end());           //@sort
    parent.resize(n); iota(parent.begin(), parent.end(), 0);
    int total = 0, used = 0;
    for (auto [w, a, b] : edges) {
        int ra = find(a), rb = find(b);
        if (ra == rb) continue;                 //@reject
        parent[ra] = rb;                        //@take
        total += w; used++;                     //@take
    }
    return used == n - 1 ? total : -1;          //@done
}`,
      java: `int[] parent;
int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
int kruskal(int n, int[][] edges) {             // {w, a, b}
    Arrays.sort(edges, (x, y) -> x[0] - y[0]);  //@sort
    parent = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int total = 0, used = 0;
    for (int[] e : edges) {
        int ra = find(e[1]), rb = find(e[2]);
        if (ra == rb) continue;                 //@reject
        parent[ra] = rb;                        //@take
        total += e[0]; used++;                  //@take
    }
    return used == n - 1 ? total : -1;          //@done
}`,
      javascript: `function kruskal(n, edges) {                    // [w, a, b]
  edges.sort((x, y) => x[0] - y[0]);            //@sort
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  let total = 0, used = 0;
  for (const [w, a, b] of edges) {
    const ra = find(a), rb = find(b);
    if (ra === rb) continue;                    //@reject
    parent[ra] = rb;                            //@take
    total += w; used++;                         //@take
  }
  return used === n - 1 ? total : -1;           //@done
}`,
    },
  },
}

// ===== 回溯(78. Subsets) =====

function* subsetsRun(v: Record<string, string>): Generator<Frame> {
  const nums = parseInts(v.nums, 'nums', { maxLen: 4 })
  let id = 0
  const root: GNode = { id: id++, label: '[]', children: [] }
  const cls = new Map<number, string>()
  const path: number[] = []
  const res: string[] = []
  const f = (line: string, note: string, answer?: string): Frame => ({
    line,
    note,
    vars: answer !== undefined ? { answer } : {},
    views: [forestView(root, { cls, label: '遞迴樹:每個節點是一個「目前選了哪些數」的狀態 · 黑色:目前所在 · 灰色:遞迴堆疊上的祖先' }), arr(path, { label: 'path(目前的選擇)' }), arr(res, { label: '收集到的答案' })],
  })
  function* bt(start: number, node: GNode): Generator<Frame> {
    cls.set(node.id, 'hl')
    res.push(`[${path.join(',')}]`)
    yield f('record', `目前的選擇 [${path.join(', ')}] 就是一個子集,記錄下來`)
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      const child: GNode = { id: id++, label: `[${path.join(',')}]`, children: [] }
      node.children.push(child)
      cls.set(node.id, 'cmp')
      yield f('choose', `做選擇:加入 nums[${i}] = ${nums[i]}。之後只能從第 ${i + 1} 個往後選(避免重複)`)
      yield* bt(i + 1, child)
      path.pop()
      cls.set(child.id, 'done')
      cls.set(node.id, 'hl')
      yield f('undo', `撤銷選擇:把 ${nums[i]} 拿掉,回到 [${path.join(', ')}],試下一個`)
    }
  }
  yield* bt(0, root)
  cls.clear()
  yield f('done', `遞迴樹走完了,共 ${res.length} 個子集`, res.join(' '))
}

export const backtracking: Pattern = {
  id: 'backtracking',
  summary: '回溯 = 有系統地「試所有可能」:做一個選擇 → 遞迴往下試 → 撤銷這個選擇 → 換下一個選擇。所有的試法會形成一棵「遞迴樹」,回溯就是用 DFS 走這棵樹。',
  analogy: '走迷宮時在每個岔路口做記號:先走左邊,走到底不行就退回岔路口,把剛才的記號擦掉,改走右邊。',
  steps: ['定義 path(目前的選擇)與 start(下一個可以從哪裡選)', '進入函式時:如果 path 是一個答案,就記錄', '對每個可選的元素:加入 path(做選擇)→ 遞迴 → 從 path 移除(撤銷)', '剪枝:明顯不可能的分支直接跳過'],
  watch: ['遞迴樹會一個分支一個分支長出來', '注意「撤銷選擇」—— 回到父節點時 path 要恢復原狀'],
  whenToUse: ['列出所有子集、排列、組合', '組合總和、分割回文、括號生成', 'N 皇后、數獨、單字搜尋(網格回溯)', '題目要「所有解」而不是「幾個解」或「最佳解」'],
  pitfalls: ['記錄答案時要複製一份 path(path[:]),不能存參考', '子集 / 組合用 start 避免重複;排列用 used 陣列', '有重複元素時:先排序,同一層跳過相同的數'],
  complexity: { time: 'O(2ⁿ × n)(子集)', space: 'O(n)', why: '共有 2ⁿ 個子集,每個複製要 O(n);遞迴深度最多 n。' },
  demo: {
    title: '列出所有子集(LeetCode 78)',
    inputs: [{ key: 'nums', label: 'nums(最多 4 個)', default: '1,2,3' }],
    run: subsetsRun,
    reference: (v) => {
      const nums = parseInts(v.nums, 'nums', { maxLen: 4 })
      const out: string[] = []
      const go = (start: number, path: number[]): void => {
        out.push(`[${path.join(',')}]`)
        for (let i = start; i < nums.length; i++) go(i + 1, [...path, nums[i]])
      }
      go(0, [])
      return out.join(' ')
    },
    random: () => ({ nums: Array.from({ length: randInt(1, 4) }, () => randInt(0, 9)).join(',') }),
    code: {
      python: `def subsets(nums):
    res, path = [], []
    def bt(start):
        res.append(path[:])                     #@record
        for i in range(start, len(nums)):
            path.append(nums[i])                #@choose
            bt(i + 1)
            path.pop()                          #@undo
    bt(0)
    return res                                  #@done`,
      c: `int res[1 << 10][10], resLen[1 << 10], cnt;
int path[10], depth;
void bt(int *nums, int n, int start) {
    memcpy(res[cnt], path, depth * sizeof(int));    //@record
    resLen[cnt++] = depth;                      //@record
    for (int i = start; i < n; i++) {
        path[depth++] = nums[i];                //@choose
        bt(nums, n, i + 1);
        depth--;                                //@undo
    }
}
// 呼叫 bt(nums, n, 0);                         //@done`,
      cpp: `vector<vector<int>> res; vector<int> path;
void bt(vector<int>& nums, int start) {
    res.push_back(path);                        //@record
    for (int i = start; i < (int)nums.size(); i++) {
        path.push_back(nums[i]);                //@choose
        bt(nums, i + 1);
        path.pop_back();                        //@undo
    }
}
// 呼叫 bt(nums, 0);                            //@done`,
      java: `List<List<Integer>> res = new ArrayList<>();
List<Integer> path = new ArrayList<>();
void bt(int[] nums, int start) {
    res.add(new ArrayList<>(path));             //@record
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);                      //@choose
        bt(nums, i + 1);
        path.remove(path.size() - 1);           //@undo
    }
}
// 呼叫 bt(nums, 0);                            //@done`,
      javascript: `function subsets(nums) {
  const res = [], path = [];
  const bt = (start) => {
    res.push([...path]);                        //@record
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);                       //@choose
      bt(i + 1);
      path.pop();                               //@undo
    }
  };
  bt(0);
  return res;                                   //@done
}`,
    },
  },
}

export const GRAPHS = [graphTraversal, topologicalSort, unionFind, dijkstra, mst, backtracking]
