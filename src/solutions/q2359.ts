import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { graphView } from './fig'

// 2359. Find Closest Node to Given Two Nodes

const E = [2, 2, 3, -1]
const EDGES = E.flatMap((v, u) => (v >= 0 ? [[u, v]] : []))
const POS = { 0: { x: 0, y: 0 }, 1: { x: 0, y: 2 }, 2: { x: 1.5, y: 1 }, 3: { x: 3, y: 1 } }

function distFig(): FigStep[] {
  return [
    { note: '每個點最多一條出邊(edges[i] = −1 代表沒有)。從 node1 = 0、node2 = 1 出發,找一個兩人都到得了、而且「比較遠的那個人的距離」最小的點', views: [graphView(4, EDGES, { directed: true, pos: POS, cls: { 0: 'hl', 1: 'hl' } })] },
    { note: '沿著唯一的出邊一路走,記下從 node1 到每個點的距離 d1,從 node2 的距離 d2。走到 −1 或走回看過的點(環)就停', views: [arr([0, -1, 1, 2], { label: 'd1(−1 = 到不了)' }), arr([-1, 0, 1, 2], { label: 'd2' })] },
    { note: '對每個兩人都到得了的點算 max(d1, d2):點 2 → 1,點 3 → 2。最小的是點 2(平手時取編號小的)', views: [arr(['—', '—', 1, 2], { label: 'max(d1, d2)', done: [2] })] },
  ]
}

function walkFig(): FigStep[] {
  return [
    { note: '不存距離陣列:兩個指標同時一步一步走,各自記下走過的點。第 k 步時,如果 A 走到的點 B 已經走過(或反過來),它的 max 距離就是 k', views: [graphView(4, EDGES, { directed: true, pos: POS, cls: { 0: 'hl', 1: 'hl' } })] },
    { note: '第 1 步:A 到 2、B 也到 2 → 互相都看過 → 答案 2。若同一步兩邊各自命中不同點,取編號較小的', views: [graphView(4, EDGES, { directed: true, pos: POS, cls: { 2: 'done' } })] },
  ]
}

export const q2359: Solution = {
  id: 2359,
  plain: '一張有向圖,每個點最多只有一條出去的箭頭。給兩個起點,找一個兩人都走得到的點,讓「兩人中走比較遠的那個」的步數最少;一樣少就選編號小的。',
  statement: '有向圖 n 個點,每點最多一條出邊 `edges[i]`(−1 表示無)。給 `node1`、`node2`,回傳一個兩者都能到達的點,使 `max(dist(node1, x), dist(node2, x))` 最小;若有多個取編號最小者,若不存在回傳 −1。圖可能有環。',
  examples: [
    { input: 'edges = [2,2,3,-1], node1 = 0, node2 = 1', output: '2' },
    { input: 'edges = [1,2,-1], node1 = 0, node2 = 2', output: '2' },
  ],
  constraints: ['n ≤ 10⁵'],
  insight: ['每點最多一條出邊 → 從一個點出發只有一條路,不用 BFS', '分別算出兩個起點到所有點的距離', '在兩邊都到得了的點中,取 max(d1, d2) 最小、編號最小的'],
  approaches: [
    {
      name: '兩次走訪算距離',
      idea: '`dist(s)`:沿出邊走,記錄步數,遇到 −1 或走過的點就停;對每個 i 取 `max(d1[i], d2[i])` 最小者。',
      steps: ['`d1 = walk(node1)`、`d2 = walk(node2)`(到不了是 −1)', '`for i in range(n)`:兩者皆 ≥ 0', '`m = max(d1[i], d2[i])`;`m < best` 才更新(保證編號小的優先)', '回傳 ans(預設 −1)'],
      figure: { title: `edges = [${E}],node1 = 0,node2 = 1`, steps: distFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每次走訪最多 n 步。' },
      verdict: '最推薦,單一出邊的圖([[p:graph-traversal]] 的特例)走訪就是一個 while 迴圈。',
      code: {
        python: `def closestMeetingNode(edges, node1, node2):
    n = len(edges)

    def walk(s):
        d = [-1] * n
        step = 0
        while s != -1 and d[s] == -1:         # 走到盡頭或繞回環上就停
            d[s] = step
            s = edges[s]
            step += 1
        return d

    d1, d2 = walk(node1), walk(node2)
    ans, best = -1, float('inf')
    for i in range(n):
        if d1[i] >= 0 and d2[i] >= 0:
            m = max(d1[i], d2[i])
            if m < best:                      # 嚴格小於:平手時保留小編號
                ans, best = i, m
    return ans`,
        c: `static void walk(int *edges, int n, int s, int *d) {
    for (int i = 0; i < n; i++) d[i] = -1;
    for (int step = 0; s != -1 && d[s] == -1; step++) { d[s] = step; s = edges[s]; }
}

int closestMeetingNode(int *edges, int edgesSize, int node1, int node2) {
    int n = edgesSize, *d1 = malloc(n * sizeof(int)), *d2 = malloc(n * sizeof(int));
    walk(edges, n, node1, d1);
    walk(edges, n, node2, d2);
    int ans = -1, best = INT_MAX;
    for (int i = 0; i < n; i++) {
        if (d1[i] < 0 || d2[i] < 0) continue;
        int m = d1[i] > d2[i] ? d1[i] : d2[i];
        if (m < best) { best = m; ans = i; }
    }
    free(d1); free(d2);
    return ans;
}`,
        cpp: `int closestMeetingNode(vector<int>& edges, int node1, int node2) {
    int n = edges.size();
    auto walk = [&](int s) {
        vector<int> d(n, -1);
        for (int step = 0; s != -1 && d[s] == -1; step++) { d[s] = step; s = edges[s]; }
        return d;
    };
    vector<int> d1 = walk(node1), d2 = walk(node2);
    int ans = -1, best = INT_MAX;
    for (int i = 0; i < n; i++) {
        if (d1[i] < 0 || d2[i] < 0) continue;
        int m = max(d1[i], d2[i]);
        if (m < best) { best = m; ans = i; }
    }
    return ans;
}`,
        java: `int closestMeetingNode(int[] edges, int node1, int node2) {
    int n = edges.length;
    int[] d1 = walk(edges, node1), d2 = walk(edges, node2);
    int ans = -1, best = Integer.MAX_VALUE;
    for (int i = 0; i < n; i++) {
        if (d1[i] < 0 || d2[i] < 0) continue;
        int m = Math.max(d1[i], d2[i]);
        if (m < best) { best = m; ans = i; }
    }
    return ans;
}

int[] walk(int[] edges, int s) {
    int[] d = new int[edges.length];
    Arrays.fill(d, -1);
    for (int step = 0; s != -1 && d[s] == -1; step++) { d[s] = step; s = edges[s]; }
    return d;
}`,
        javascript: `function closestMeetingNode(edges, node1, node2) {
  const n = edges.length;
  const walk = (s) => {
    const d = new Array(n).fill(-1);
    for (let step = 0; s !== -1 && d[s] === -1; step++) {
      d[s] = step;
      s = edges[s];
    }
    return d;
  };
  const d1 = walk(node1), d2 = walk(node2);
  let ans = -1, best = Infinity;
  for (let i = 0; i < n; i++) {
    if (d1[i] < 0 || d2[i] < 0) continue;
    const m = Math.max(d1[i], d2[i]);
    if (m < best) {
      best = m;
      ans = i;
    }
  }
  return ans;
}`,
      },
    },
    {
      name: '兩個指標同步走',
      idea: '`a`、`b` 同時每步前進一格,各自記錄走過的點;某一步 a 落在 b 走過的點、或 b 落在 a 走過的點,就找到答案(兩者都命中取較小編號)。',
      steps: ['`seenA`、`seenB` 布林陣列', '每一步:把 a、b 加入各自的 seen', '`a` 在 seenB 或 `b` 在 seenA → 回傳命中者中的最小編號', 'a、b 前進;下一點已走過(環)或 −1 就停;兩者都停 → −1'],
      figure: { title: `edges = [${E}],node1 = 0,node2 = 1`, steps: walkFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個指標最多走 n 步。' },
      verdict: '在找到答案時就提早結束;第 k 步命中的點,max 距離正好是 k。',
      code: {
        python: `def closestMeetingNode(edges, node1, node2):
    n = len(edges)
    seenA, seenB = [False] * n, [False] * n
    a, b = node1, node2
    while a != -1 or b != -1:
        if a != -1:
            seenA[a] = True
        if b != -1:
            seenB[b] = True
        hit = [x for x in (a, b) if x != -1 and seenA[x] and seenB[x]]
        if hit:
            return min(hit)                   # 這一步命中:max 距離就是目前步數
        a = edges[a] if a != -1 and edges[a] != -1 and not seenA[edges[a]] else -1
        b = edges[b] if b != -1 and edges[b] != -1 and not seenB[edges[b]] else -1
    return -1`,
        c: `int closestMeetingNode(int *edges, int edgesSize, int node1, int node2) {
    int n = edgesSize, a = node1, b = node2, ans = -1;
    bool *sa = calloc(n, sizeof(bool)), *sb = calloc(n, sizeof(bool));
    while (a != -1 || b != -1) {
        if (a != -1) sa[a] = true;
        if (b != -1) sb[b] = true;
        int best = INT_MAX;
        if (a != -1 && sa[a] && sb[a] && a < best) best = a;
        if (b != -1 && sa[b] && sb[b] && b < best) best = b;
        if (best != INT_MAX) { ans = best; break; }
        a = a != -1 && edges[a] != -1 && !sa[edges[a]] ? edges[a] : -1;
        b = b != -1 && edges[b] != -1 && !sb[edges[b]] ? edges[b] : -1;
    }
    free(sa); free(sb);
    return ans;
}`,
        cpp: `int closestMeetingNode(vector<int>& edges, int node1, int node2) {
    int n = edges.size(), a = node1, b = node2;
    vector<bool> sa(n, false), sb(n, false);
    while (a != -1 || b != -1) {
        if (a != -1) sa[a] = true;
        if (b != -1) sb[b] = true;
        int best = INT_MAX;
        if (a != -1 && sa[a] && sb[a]) best = min(best, a);
        if (b != -1 && sa[b] && sb[b]) best = min(best, b);
        if (best != INT_MAX) return best;
        a = a != -1 && edges[a] != -1 && !sa[edges[a]] ? edges[a] : -1;
        b = b != -1 && edges[b] != -1 && !sb[edges[b]] ? edges[b] : -1;
    }
    return -1;
}`,
        java: `int closestMeetingNode(int[] edges, int node1, int node2) {
    int n = edges.length, a = node1, b = node2;
    boolean[] sa = new boolean[n], sb = new boolean[n];
    while (a != -1 || b != -1) {
        if (a != -1) sa[a] = true;
        if (b != -1) sb[b] = true;
        int best = Integer.MAX_VALUE;
        if (a != -1 && sa[a] && sb[a]) best = Math.min(best, a);
        if (b != -1 && sa[b] && sb[b]) best = Math.min(best, b);
        if (best != Integer.MAX_VALUE) return best;
        a = a != -1 && edges[a] != -1 && !sa[edges[a]] ? edges[a] : -1;
        b = b != -1 && edges[b] != -1 && !sb[edges[b]] ? edges[b] : -1;
    }
    return -1;
}`,
        javascript: `function closestMeetingNode(edges, node1, node2) {
  const n = edges.length, sa = new Array(n).fill(false), sb = new Array(n).fill(false);
  let a = node1, b = node2;
  while (a !== -1 || b !== -1) {
    if (a !== -1) sa[a] = true;
    if (b !== -1) sb[b] = true;
    let best = Infinity;
    if (a !== -1 && sa[a] && sb[a]) best = Math.min(best, a);
    if (b !== -1 && sa[b] && sb[b]) best = Math.min(best, b);
    if (best !== Infinity) return best;
    a = a !== -1 && edges[a] !== -1 && !sa[edges[a]] ? edges[a] : -1;
    b = b !== -1 && edges[b] !== -1 && !sb[edges[b]] ? edges[b] : -1;
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['沒處理環:沿出邊走會無限迴圈,要記錄走過的點', '平手時用 `<=` 更新:會選到編號大的', 'node1 == node2 時答案就是它自己'],
  check: {
    kind: 'fn',
    fn: 'closestMeetingNode',
    cases: [
      { args: [E, 0, 1], out: 2 },
      { args: [[1, 2, -1], 0, 2], out: 2 },
      { args: [[4, 4, 8, -1, 9, 8, 4, 4, 1, 1], 5, 6], out: 1 },
      { args: [[1, 0], 0, 1], out: 0 },
      { args: [[-1, -1], 0, 1], out: -1 },
      { args: [[2, 0, 0], 2, 0], out: 0 },
    ],
  },
}
