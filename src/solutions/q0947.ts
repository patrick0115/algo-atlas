import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 947. Most Stones Removed with Same Row or Column
const S = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]]
const F = [
  { note: '(0,0) 與 (0,1) 同列，(0,0) 與 (1,0) 同欄；這些石頭連在同一組。', views: [arr(['(0,0)', '(0,1)', '(1,0)'], { label: '已找到的連通石頭' })] },
  { note: '從 (0,1) 可連到 (2,1)，再連到 (2,2)；關係可透過其他石頭傳遞。', views: [arr(['(0,0)', '(0,1)', '(1,0)', '(2,1)', '(2,2)'], { label: '擴張連通組' })] },
  { note: '(1,2) 也與 (2,2) 同欄，六顆石頭都屬同一組。', views: [arr(S.map((p) => `(${p})`), { label: '單一連通組', done: [0, 1, 2, 3, 4, 5] })] },
  { note: '一組至少留一顆，其餘都能依序移除；6−1=5。', views: [arr([6, 1, 5], { label: '石頭數 / 組數 / 可移除', done: [2] })] },
]
const G = [
  { note: '把每個列座標、欄座標都當成節點；一顆石頭連接自己的列與欄。', views: [arr(['列0—欄0', '列0—欄1'], { label: '前兩顆石頭的邊' })] },
  { note: '(1,0) 連列1與欄0；透過欄0 與前兩顆石頭成同一組。', views: [arr(['列0', '列1', '欄0', '欄1'], { label: '已連通的座標' })] },
  { note: '加入其餘石頭的列欄邊後，所有出現過的座標都連成一組。', views: [arr(['列0', '列1', '列2', '欄0', '欄1', '欄2'], { label: '同一組', done: [0, 1, 2, 3, 4, 5] })] },
  { note: '原本 6 顆石頭，連通組數 1，可移除 5 顆。', views: [arr([5], { label: '答案', done: [0] })] },
]

export const q0947: Solution = {
  id: 947,
  plain: '同列或同欄只要還有別顆石頭，就能移除一顆；問最多能移除多少顆。',
  statement: '每顆石頭位於整數座標 `[row,col]`。若它的列或欄仍有另一顆石頭，就可移除。求最大移除數。',
  examples: [{ input: 'stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]', output: '5' }, { input: 'stones = [[0,0]]', output: '0' }],
  constraints: ['石頭最多 1000 顆；列、欄座標介於 0 到 10000。'],
  insight: ['同列或同欄的石頭屬於同一連通組；每組最後必須留一顆，也能移除其餘所有石頭。', '答案 = 石頭數 − 連通組數；可用 [[p:graph-traversal]] 或 [[p:union-find]]。'],
  approaches: [
    {
      name: '石頭圖的 DFS',
      idea: '同列或同欄的兩顆石頭互相連接，數出有幾個連通組。',
      steps: ['逐顆石頭尋找同列或同欄的其他石頭。', '從每個未訪問石頭啟動 DFS，標記整組。', '回傳石頭數減組數。'],
      figure: { title: 'stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]', steps: F },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每次找鄰居可能掃過所有石頭。' },
      verdict: '連通組觀念最直觀；n=1000 仍可接受。',
      code: {
        python: `def removeStones(stones):
    n = len(stones)
    seen = [False] * n
    groups = 0
    for start in range(n):
        if seen[start]:
            continue
        groups += 1
        seen[start] = True
        stack = [start]
        while stack:
            i = stack.pop()
            for j in range(n):
                if not seen[j] and (stones[i][0] == stones[j][0] or stones[i][1] == stones[j][1]):
                    seen[j] = True     # 同列或同欄屬同一組
                    stack.append(j)
    return n - groups`,
        c: `int removeStones(int **stones, int stonesSize, int *stonesColSize) {
    bool *seen = calloc(stonesSize, sizeof(bool));
    int *stack = malloc(stonesSize * sizeof(int));
    int groups = 0;
    for (int start = 0; start < stonesSize; start++) {
        if (seen[start]) continue;
        groups++;
        int top = 0;
        stack[top++] = start;
        seen[start] = true;
        while (top) {
            int i = stack[--top];
            for (int j = 0; j < stonesSize; j++) {
                if (!seen[j] && (stones[i][0] == stones[j][0] || stones[i][1] == stones[j][1])) {
                    seen[j] = true;
                    stack[top++] = j;
                }
            }
        }
    }
    free(seen);
    free(stack);
    return stonesSize - groups;
}`,
        cpp: `int removeStones(vector<vector<int>>& stones) {
    int n = stones.size(), groups = 0;
    vector<bool> seen(n);
    for (int start = 0; start < n; start++) {
        if (seen[start]) continue;
        groups++;
        stack<int> todo;
        todo.push(start);
        seen[start] = true;
        while (!todo.empty()) {
            int i = todo.top();
            todo.pop();
            for (int j = 0; j < n; j++) {
                if (!seen[j] && (stones[i][0] == stones[j][0] || stones[i][1] == stones[j][1])) {
                    seen[j] = true;
                    todo.push(j);
                }
            }
        }
    }
    return n - groups;
}`,
        java: `int removeStones(int[][] stones) {
    int n = stones.length, groups = 0;
    boolean[] seen = new boolean[n];
    for (int start = 0; start < n; start++) {
        if (seen[start]) continue;
        groups++;
        ArrayDeque<Integer> stack = new ArrayDeque<>();
        stack.push(start);
        seen[start] = true;
        while (!stack.isEmpty()) {
            int i = stack.pop();
            for (int j = 0; j < n; j++) {
                if (!seen[j] && (stones[i][0] == stones[j][0] || stones[i][1] == stones[j][1])) {
                    seen[j] = true;
                    stack.push(j);
                }
            }
        }
    }
    return n - groups;
}`,
        javascript: `function removeStones(stones) {
  const n = stones.length, seen = new Array(n).fill(false);
  let groups = 0;
  for (let start = 0; start < n; start++) {
    if (seen[start]) continue;
    groups++;
    const stack = [start];
    seen[start] = true;
    while (stack.length) {
      const i = stack.pop();
      for (let j = 0; j < n; j++) {
        if (!seen[j] && (stones[i][0] === stones[j][0] || stones[i][1] === stones[j][1])) {
          seen[j] = true;
          stack.push(j);
        }
      }
    }
  }
  return n - groups;
}`,
      },
    },
    {
      name: '列與欄的並查集',
      idea: '一顆石頭把自己的列節點與欄節點連起來；最後數石頭所在的不同根。',
      steps: ['列 r 使用節點 r；欄 c 使用節點 c+10001，避免撞號。', '每顆石頭把列與欄合併。', '數所有石頭列節點的不同根，從石頭總數扣掉。'],
      figure: { title: '列與欄形成一張二分圖', steps: G },
      complexity: { time: 'O(n α(U))', space: 'O(U)', why: 'U 為座標範圍，並查集合併與查找近乎常數。' },
      verdict: '對大量同列同欄的石頭特別有效；列欄編號必須錯開。',
      code: {
        python: `def removeStones(stones):
    parent = {}

    def find(x):
        parent.setdefault(x, x)
        if parent[x] != x:
            parent[x] = find(parent[x])  # 路徑壓縮
        return parent[x]

    for row, col in stones:
        parent[find(row)] = find(col + 10001)
    groups = len({find(row) for row, _ in stones})
    return len(stones) - groups`,
        c: `static int find947(int *parent, int x) {
    if (parent[x] != x) parent[x] = find947(parent, parent[x]);
    return parent[x];
}

int removeStones(int **stones, int stonesSize, int *stonesColSize) {
    int *parent = malloc(20002 * sizeof(int));
    bool *seen = calloc(20002, sizeof(bool));
    for (int i = 0; i < 20002; i++) parent[i] = i;
    for (int i = 0; i < stonesSize; i++) {
        int row = find947(parent, stones[i][0]);
        int col = find947(parent, stones[i][1] + 10001);
        parent[row] = col;
    }
    int groups = 0;
    for (int i = 0; i < stonesSize; i++) {
        int root = find947(parent, stones[i][0]);
        if (!seen[root]) {
            seen[root] = true;
            groups++;
        }
    }
    free(parent);
    free(seen);
    return stonesSize - groups;
}`,
        cpp: `int removeStones(vector<vector<int>>& stones) {
    vector<int> parent(20002);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    };
    for (const auto& stone : stones) parent[find(stone[0])] = find(stone[1] + 10001);
    unordered_set<int> groups;
    for (const auto& stone : stones) groups.insert(find(stone[0]));
    return stones.size() - groups.size();
}`,
        java: `int[] parent947;

int find947(int x) {
    if (parent947[x] != x) parent947[x] = find947(parent947[x]);
    return parent947[x];
}

int removeStones(int[][] stones) {
    parent947 = new int[20002];
    for (int i = 0; i < parent947.length; i++) parent947[i] = i;
    for (int[] stone : stones) parent947[find947(stone[0])] = find947(stone[1] + 10001);
    HashSet<Integer> groups = new HashSet<>();
    for (int[] stone : stones) groups.add(find947(stone[0]));
    return stones.length - groups.size();
}`,
        javascript: `function removeStones(stones) {
  const parent = new Array(20002);
  for (let i = 0; i < parent.length; i++) parent[i] = i;
  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  for (const [row, col] of stones) parent[find(row)] = find(col + 10001);
  const groups = new Set(stones.map(([row]) => find(row)));
  return stones.length - groups.size;
}`,
      },
    },
  ],
  pitfalls: ['不能只看直接相鄰；同組關係可以透過多顆石頭傳遞。', '每個連通組必須至少留一顆。'],
  check: { kind: 'fn', fn: 'removeStones', cases: [
    { args: [S], out: 5 }, { args: [[[0, 0]]], out: 0 },
    { args: [[[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]]], out: 3 },
  ] },
}
