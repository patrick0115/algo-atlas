import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 909. Snakes and Ladders

const BOARD = [
  [-1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1],
  [-1, 35, -1, -1, 13, -1],
  [-1, -1, -1, -1, -1, -1],
  [-1, 15, -1, -1, -1, -1],
]

function labels(): number[][] {
  const n = BOARD.length
  const lab = BOARD.map((row) => row.map(() => 0))
  let k = 1
  for (let i = 0; i < n; i++) {
    const r = n - 1 - i
    for (let j = 0; j < n; j++) lab[r][i % 2 === 0 ? j : n - 1 - j] = k++
  }
  return lab
}

function boardView(label: string): GridViewData {
  const lab = labels()
  return {
    kind: 'grid',
    label,
    cells: BOARD.map((row, r) => row.map((v, c) => (v === -1 ? lab[r][c] : `${lab[r][c]}→${v}`))),
    marks: { hl: BOARD.flatMap((row, r) => row.flatMap((v, c) => (v !== -1 ? [[r, c] as [number, number]] : []))) },
  }
}

function bfsFig(): FigStep[] {
  return [
    { note: '格子編號從左下角 1 開始,蛇行排列(一列往右、下一列往左)。有標「a→b」的格子是蛇或梯子:停在 a 就會被傳到 b', views: [boardView('棋盤(格子編號)')] },
    { note: '先把棋盤攤平成一維陣列 `jump[1..n²]`,每格記錄「停在這裡會被傳去哪」。之後就跟座標無關了', views: [arr(['2 → 15', '14 → 35', '17 → 13'], { label: '這個棋盤的蛇 / 梯子(格子編號)' })] },
    { note: '每一步可以前進 1–6 格(落點有蛇 / 梯子就跟著走),每步代價相同 → BFS 求最少步數。第 1 步:從 1 擲到 2 → 爬梯子到 15', views: [arr([1, 15], { label: '第 1 步後', done: [1] })] },
    { note: '第 2 步:15 擲到 17 → 被蛇送回 13;第 3 步:13 擲到 14 → 爬梯子到 35;第 4 步:35 擲 1 到 36。共 4 步', views: [arr([1, 15, 13, 35, 36], { label: '最短路徑上的落點', done: [4] }), arr([4], { label: '答案', done: [0] })] },
  ]
}

function relaxFig(): FigStep[] {
  return [
    { note: '另一種:`dist[i]` = 到格子 i 的最少擲骰數。反覆鬆弛:從每個 i 擲 1–6 到 j(傳送後),`dist[j] = min(dist[j], dist[i] + 1)`', views: [arr(['dist[1] = 0'], { label: '起點' })] },
    { note: '一直掃到沒有任何更新為止(像 Bellman–Ford)。蛇會讓編號往回走,所以單次由小到大掃不夠', views: [arr([4], { label: '答案', done: [0] })] },
  ]
}

export const q0909: Solution = {
  id: 909,
  plain: '蛇梯棋:n × n 的棋盤,從第 1 格走到最後一格,每次擲骰子前進 1 到 6 格。停在梯子底部會爬上去、停在蛇頭會滑下來。最少要擲幾次骰子?',
  statement: '`n × n` 棋盤的格子從左下角開始依「牛耕式」(boustrophedon)編號 1..n²。`board[r][c] != -1` 表示該格有蛇或梯子,目的地是 `board[r][c]`。每回合從目前格 curr 前進到 `[curr+1, min(curr+6, n²)]` 之一;若落點有蛇 / 梯子就移動到其目的地(每回合最多傳送一次)。回傳到達 n² 的最少回合數,不可能則回傳 −1。',
  examples: [
    { input: 'board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]', output: '4' },
    { input: 'board = [[-1,-1],[-1,3]]', output: '1' },
  ],
  constraints: ['2 ≤ n ≤ 20'],
  insight: ['每擲一次骰子代價都是 1 → [[p:graph-traversal]] 的 BFS', '先把蛇行編號轉成一維陣列,避免在 BFS 裡算座標', '一回合只傳送一次:梯子終點又是蛇頭也不會繼續傳'],
  approaches: [
    {
      name: '攤平 + BFS',
      idea: '`jump[k]` 為格子 k 的傳送目的地(沒有就是 k 自己);從 1 BFS,鄰居是 `jump[k + 1..k + 6]`。',
      steps: ['依蛇行順序把 board 攤平成 `jump[1..n²]`', '`dist[1] = 0`,佇列 [1]', '彈出 k:`for d in 1..6`:`nxt = jump[k + d]`', '沒看過 → `dist[nxt] = dist[k] + 1`;是 n² 就回傳'],
      figure: { title: '6 × 6 棋盤', steps: bfsFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: 'n² 個格子,每個最多 6 個鄰居。' },
      verdict: '最推薦,難點只在編號轉換;攤平之後就是最普通的 BFS。',
      code: {
        python: `from collections import deque

def snakesAndLadders(board):
    n = len(board)
    jump = [0]                                # jump[k]:停在 k 會到哪(1-indexed)
    for i in range(n):
        row = board[n - 1 - i]
        if i % 2:
            row = row[::-1]                   # 蛇行:奇數列由右往左
        jump.extend(row)
    target = n * n
    dist = [-1] * (target + 1)
    dist[1] = 0
    q = deque([1])
    while q:
        k = q.popleft()
        for d in range(1, 7):
            if k + d > target:
                break
            nxt = jump[k + d] if jump[k + d] != -1 else k + d
            if dist[nxt] == -1:
                dist[nxt] = dist[k] + 1
                if nxt == target:
                    return dist[nxt]
                q.append(nxt)
    return 0 if target == 1 else -1`,
        c: `int snakesAndLadders(int **board, int boardSize, int *boardColSize) {
    int n = boardSize, target = n * n, k = 1;
    int *jump = malloc((target + 1) * sizeof(int)), *dist = malloc((target + 1) * sizeof(int)), *q = malloc((target + 1) * sizeof(int));
    for (int i = 0; i < n; i++) {
        int r = n - 1 - i;
        for (int j = 0; j < n; j++) jump[k++] = board[r][i % 2 ? n - 1 - j : j];
    }
    for (int i = 0; i <= target; i++) dist[i] = -1;
    int h = 0, t = 0, ans = -1;
    dist[1] = 0; q[t++] = 1;
    while (h < t && ans < 0) {
        int u = q[h++];
        for (int d = 1; d <= 6 && u + d <= target; d++) {
            int nx = jump[u + d] != -1 ? jump[u + d] : u + d;
            if (dist[nx] != -1) continue;
            dist[nx] = dist[u] + 1;
            if (nx == target) { ans = dist[nx]; break; }
            q[t++] = nx;
        }
    }
    free(jump); free(dist); free(q);
    return ans;
}`,
        cpp: `int snakesAndLadders(vector<vector<int>>& board) {
    int n = board.size(), target = n * n;
    vector<int> jump(1, 0);
    for (int i = 0; i < n; i++) {
        vector<int> row = board[n - 1 - i];
        if (i % 2) reverse(row.begin(), row.end());
        jump.insert(jump.end(), row.begin(), row.end());
    }
    vector<int> dist(target + 1, -1);
    queue<int> q;
    dist[1] = 0;
    q.push(1);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int d = 1; d <= 6 && u + d <= target; d++) {
            int nx = jump[u + d] != -1 ? jump[u + d] : u + d;
            if (dist[nx] != -1) continue;
            dist[nx] = dist[u] + 1;
            if (nx == target) return dist[nx];
            q.push(nx);
        }
    }
    return -1;
}`,
        java: `int snakesAndLadders(int[][] board) {
    int n = board.length, target = n * n, k = 1;
    int[] jump = new int[target + 1];
    for (int i = 0; i < n; i++) {
        int r = n - 1 - i;
        for (int j = 0; j < n; j++) jump[k++] = board[r][i % 2 == 1 ? n - 1 - j : j];
    }
    int[] dist = new int[target + 1];
    Arrays.fill(dist, -1);
    Deque<Integer> q = new ArrayDeque<>();
    dist[1] = 0;
    q.offer(1);
    while (!q.isEmpty()) {
        int u = q.poll();
        for (int d = 1; d <= 6 && u + d <= target; d++) {
            int nx = jump[u + d] != -1 ? jump[u + d] : u + d;
            if (dist[nx] != -1) continue;
            dist[nx] = dist[u] + 1;
            if (nx == target) return dist[nx];
            q.offer(nx);
        }
    }
    return -1;
}`,
        javascript: `function snakesAndLadders(board) {
  const n = board.length, target = n * n, jump = [0];
  for (let i = 0; i < n; i++) {
    const row = [...board[n - 1 - i]];
    if (i % 2) row.reverse();
    jump.push(...row);
  }
  const dist = new Array(target + 1).fill(-1), q = [1];
  dist[1] = 0;
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (let d = 1; d <= 6 && u + d <= target; d++) {
      const nx = jump[u + d] !== -1 ? jump[u + d] : u + d;
      if (dist[nx] !== -1) continue;
      dist[nx] = dist[u] + 1;
      if (nx === target) return dist[nx];
      q.push(nx);
    }
  }
  return -1;
}`,
      },
    },
    {
      name: '反覆鬆弛',
      idea: '`dist[1] = 0`;重複掃描所有格子,從每個可達的 i 擲 1–6 更新落點,直到沒有更新。',
      steps: ['攤平成 jump', '`dist = ∞`,`dist[1] = 0`', '重複:`for i`:`dist[i] < ∞` → 每個 d:`j = jump(i + d)`,`dist[j] = min(dist[j], dist[i] + 1)`', '沒有更新就停,回傳 `dist[n²]`'],
      figure: { title: '6 × 6 棋盤', steps: relaxFig() },
      complexity: { time: 'O(n⁴)', space: 'O(n²)', why: '最多 n² 輪,每輪掃 n² 格。' },
      verdict: '不用佇列,但比 BFS 慢;用來體會「為什麼 BFS 第一次到達就是最短」。',
      code: {
        python: `def snakesAndLadders(board):
    n = len(board)
    jump = [0]
    for i in range(n):
        row = board[n - 1 - i]
        jump.extend(row[::-1] if i % 2 else row)
    target, INF = n * n, float('inf')
    dist = [INF] * (target + 1)
    dist[1] = 0
    changed = True
    while changed:                            # 一直鬆弛到穩定
        changed = False
        for i in range(1, target):
            if dist[i] == INF:
                continue
            for d in range(1, 7):
                if i + d > target:
                    break
                j = jump[i + d] if jump[i + d] != -1 else i + d
                if dist[i] + 1 < dist[j]:
                    dist[j] = dist[i] + 1
                    changed = True
    return -1 if dist[target] == INF else dist[target]`,
        c: `int snakesAndLadders(int **board, int boardSize, int *boardColSize) {
    int n = boardSize, target = n * n, k = 1, INF = 1 << 29;
    int *jump = malloc((target + 1) * sizeof(int)), *dist = malloc((target + 1) * sizeof(int));
    for (int i = 0; i < n; i++) {
        int r = n - 1 - i;
        for (int j = 0; j < n; j++) jump[k++] = board[r][i % 2 ? n - 1 - j : j];
    }
    for (int i = 0; i <= target; i++) dist[i] = INF;
    dist[1] = 0;
    for (bool changed = true; changed;) {
        changed = false;
        for (int i = 1; i < target; i++) {
            if (dist[i] == INF) continue;
            for (int d = 1; d <= 6 && i + d <= target; d++) {
                int j = jump[i + d] != -1 ? jump[i + d] : i + d;
                if (dist[i] + 1 < dist[j]) { dist[j] = dist[i] + 1; changed = true; }
            }
        }
    }
    int ans = dist[target] == INF ? -1 : dist[target];
    free(jump); free(dist);
    return ans;
}`,
        cpp: `int snakesAndLadders(vector<vector<int>>& board) {
    int n = board.size(), target = n * n, INF = 1 << 29;
    vector<int> jump(1, 0);
    for (int i = 0; i < n; i++) {
        vector<int> row = board[n - 1 - i];
        if (i % 2) reverse(row.begin(), row.end());
        jump.insert(jump.end(), row.begin(), row.end());
    }
    vector<int> dist(target + 1, INF);
    dist[1] = 0;
    for (bool changed = true; changed;) {
        changed = false;
        for (int i = 1; i < target; i++) {
            if (dist[i] == INF) continue;
            for (int d = 1; d <= 6 && i + d <= target; d++) {
                int j = jump[i + d] != -1 ? jump[i + d] : i + d;
                if (dist[i] + 1 < dist[j]) { dist[j] = dist[i] + 1; changed = true; }
            }
        }
    }
    return dist[target] == INF ? -1 : dist[target];
}`,
        java: `int snakesAndLadders(int[][] board) {
    int n = board.length, target = n * n, k = 1, INF = 1 << 29;
    int[] jump = new int[target + 1], dist = new int[target + 1];
    for (int i = 0; i < n; i++) {
        int r = n - 1 - i;
        for (int j = 0; j < n; j++) jump[k++] = board[r][i % 2 == 1 ? n - 1 - j : j];
    }
    Arrays.fill(dist, INF);
    dist[1] = 0;
    for (boolean changed = true; changed;) {
        changed = false;
        for (int i = 1; i < target; i++) {
            if (dist[i] == INF) continue;
            for (int d = 1; d <= 6 && i + d <= target; d++) {
                int j = jump[i + d] != -1 ? jump[i + d] : i + d;
                if (dist[i] + 1 < dist[j]) { dist[j] = dist[i] + 1; changed = true; }
            }
        }
    }
    return dist[target] == INF ? -1 : dist[target];
}`,
        javascript: `function snakesAndLadders(board) {
  const n = board.length, target = n * n, jump = [0];
  for (let i = 0; i < n; i++) {
    const row = [...board[n - 1 - i]];
    if (i % 2) row.reverse();
    jump.push(...row);
  }
  const dist = new Array(target + 1).fill(Infinity);
  dist[1] = 0;
  for (let changed = true; changed; ) {
    changed = false;
    for (let i = 1; i < target; i++) {
      if (dist[i] === Infinity) continue;
      for (let d = 1; d <= 6 && i + d <= target; d++) {
        const j = jump[i + d] !== -1 ? jump[i + d] : i + d;
        if (dist[i] + 1 < dist[j]) {
          dist[j] = dist[i] + 1;
          changed = true;
        }
      }
    }
  }
  return dist[target] === Infinity ? -1 : dist[target];
}`,
      },
    },
  ],
  pitfalls: ['蛇行編號算錯:從最下面一列開始,而且奇數列(由下往上數)是由右往左', '一次傳送後又繼續傳送:題目規定每回合最多一次', '把「有梯子的格子」標成走過:要標記的是傳送後的落點'],
  check: {
    kind: 'fn',
    fn: 'snakesAndLadders',
    cases: [
      { args: [BOARD], out: 4 },
      { args: [[[-1, -1], [-1, 3]]], out: 1 },
      { args: [[[-1, -1, -1], [-1, 9, 8], [-1, 8, 9]]], out: 1 },
      { args: [[[1, 1, -1], [1, 1, 1], [-1, 1, 1]]], out: -1 },
    ],
  },
}
