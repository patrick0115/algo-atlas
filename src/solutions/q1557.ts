import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 1557. Minimum Number of Vertices to Reach All Nodes

const N = 6
const E = [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]
const POS = { 0: { x: 0, y: 0 }, 1: { x: -1, y: 1 }, 2: { x: 1, y: 1 }, 3: { x: 3, y: 0 }, 4: { x: 2.5, y: 1 }, 5: { x: 1, y: 2 } }

function indegFig(): FigStep[] {
  const indeg = Array(N).fill(0)
  for (const [, v] of E) indeg[v]++
  return [
    { note: '有向無環圖,要挑最少的起點,使所有點都能從某個起點走到', views: [graphView(N, E, { directed: true, pos: POS })] },
    { note: '關鍵:入度 = 0 的點**沒有任何人能走到它** → 一定得當起點。其他點都有人指向它,沿著箭頭往回追,一定會追到某個入度 0 的點', views: [graphView(N, E, { directed: true, pos: POS, subs: Object.fromEntries(indeg.map((d, i) => [i, `入度 ${d}`])) })] },
    { note: '入度 0 的是 0 和 3 → 從它們出發就能走到全部', views: [graphView(N, E, { directed: true, pos: POS, cls: { 0: 'done', 3: 'done' } }), arr([0, 3], { label: '答案', done: [0, 1] })] },
  ]
}

function setFig(): FigStep[] {
  return [
    { note: '同一個想法的另一種寫法:把所有「被指向的點」(邊的終點)放進集合', views: [arr([1, 2, 5, 4, 2], { label: '邊的終點' })] },
    { note: '不在集合裡的點就是答案:{0..5} − {1, 2, 4, 5} = {0, 3}', views: [arr([0, 3], { label: '答案', done: [0, 1] })] },
  ]
}

export const q1557: Solution = {
  id: 1557,
  plain: '一張有方向、沒有環的地圖。要選最少的出發點,讓地圖上每個點都能從某個出發點沿著箭頭走到。選哪些?',
  statement: '給有向無環圖,n 個節點編號 0..n−1,`edges[i] = [from, to]`。找出最小的點集合,使得從這些點出發可到達圖中所有點。回傳這些點(順序不限,保證答案唯一)。',
  examples: [
    { input: 'n = 6, edges = [[0,1],[0,2],[2,5],[3,4],[4,2]]', output: '[0,3]' },
    { input: 'n = 5, edges = [[0,1],[2,1],[3,1],[1,4],[2,4]]', output: '[0,2,3]' },
  ],
  constraints: ['n ≤ 10⁵'],
  insight: ['入度 0 的點沒人能到 → 必選', '其他點往回追一定追到入度 0 的點(無環)→ 不用選', '答案 = 所有入度 0 的點'],
  approaches: [
    {
      name: '計算入度',
      idea: '統計每個點的入度,回傳入度為 0 的點。',
      steps: ['`indeg = [0] * n`', '`for u, v in edges`:`indeg[v] += 1`', '回傳 `[i for i in range(n) if indeg[i] == 0]`'],
      figure: { title: `n = ${N}`, steps: indegFig() },
      complexity: { time: 'O(n + E)', space: 'O(n)', why: '掃一次邊、一次點。' },
      verdict: '最推薦。圖論題不一定要 BFS/DFS:先想想「入度 / 出度」能不能直接回答。',
      code: {
        python: `def findSmallestSetOfVertices(n, edges):
    indeg = [0] * n
    for _, v in edges:
        indeg[v] += 1                         # 有人能走到 v
    return [i for i in range(n) if indeg[i] == 0]`,
        c: `int *findSmallestSetOfVertices(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    int *indeg = calloc(n, sizeof(int)), *res = malloc(n * sizeof(int)), cnt = 0;
    for (int i = 0; i < edgesSize; i++) indeg[edges[i][1]]++;
    for (int i = 0; i < n; i++) if (!indeg[i]) res[cnt++] = i;
    free(indeg);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> findSmallestSetOfVertices(int n, vector<vector<int>>& edges) {
    vector<int> indeg(n, 0), res;
    for (auto &e : edges) indeg[e[1]]++;
    for (int i = 0; i < n; i++) if (!indeg[i]) res.push_back(i);
    return res;
}`,
        java: `List<Integer> findSmallestSetOfVertices(int n, List<List<Integer>> edges) {
    int[] indeg = new int[n];
    for (List<Integer> e : edges) indeg[e.get(1)]++;
    List<Integer> res = new ArrayList<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) res.add(i);
    return res;
}`,
        javascript: `function findSmallestSetOfVertices(n, edges) {
  const indeg = new Array(n).fill(0);
  for (const [, v] of edges) indeg[v]++;
  const res = [];
  for (let i = 0; i < n; i++) if (!indeg[i]) res.push(i);
  return res;
}`,
      },
    },
    {
      name: '終點集合',
      idea: '把所有邊的終點放進集合(或布林陣列),不在裡面的點就是答案。',
      steps: ['`reached = set(v for _, v in edges)`', '回傳不在 reached 裡的點'],
      figure: { title: `n = ${N}`, steps: setFig() },
      complexity: { time: 'O(n + E)', space: 'O(n)', why: '同上。' },
      verdict: '只需要知道「有沒有人指向它」,不需要確切的入度數。',
      code: {
        python: `def findSmallestSetOfVertices(n, edges):
    reached = {v for _, v in edges}           # 被指向過的點
    return [i for i in range(n) if i not in reached]`,
        c: `int *findSmallestSetOfVertices(int n, int **edges, int edgesSize, int *edgesColSize, int *returnSize) {
    bool *reached = calloc(n, sizeof(bool));
    int *res = malloc(n * sizeof(int)), cnt = 0;
    for (int i = 0; i < edgesSize; i++) reached[edges[i][1]] = true;
    for (int i = 0; i < n; i++) if (!reached[i]) res[cnt++] = i;
    free(reached);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<int> findSmallestSetOfVertices(int n, vector<vector<int>>& edges) {
    vector<bool> reached(n, false);
    for (auto &e : edges) reached[e[1]] = true;
    vector<int> res;
    for (int i = 0; i < n; i++) if (!reached[i]) res.push_back(i);
    return res;
}`,
        java: `List<Integer> findSmallestSetOfVertices(int n, List<List<Integer>> edges) {
    boolean[] reached = new boolean[n];
    for (List<Integer> e : edges) reached[e.get(1)] = true;
    List<Integer> res = new ArrayList<>();
    for (int i = 0; i < n; i++) if (!reached[i]) res.add(i);
    return res;
}`,
        javascript: `function findSmallestSetOfVertices(n, edges) {
  const reached = new Set(edges.map((e) => e[1]));
  const res = [];
  for (let i = 0; i < n; i++) if (!reached.has(i)) res.push(i);
  return res;
}`,
      },
    },
  ],
  pitfalls: ['從每個點跑 BFS 再挑最少的組合:完全不必要', '入度數錯成出度'],
  check: {
    kind: 'fn',
    fn: 'findSmallestSetOfVertices',
    compare: 'sorted',
    cases: [
      { args: [N, E], out: [0, 3] },
      { args: [5, [[0, 1], [2, 1], [3, 1], [1, 4], [2, 4]]], out: [0, 2, 3] },
      { args: [3, [[0, 1], [1, 2]]], out: [0] },
    ],
  },
}
