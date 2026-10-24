import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 130. Surrounded Regions

const B = ['XXXX', 'XOOX', 'XXOX', 'XOXX', 'XOOX'].map((r) => r.split(''))

function view(b: string[][], hl: Cell[] = [], label = 'board'): GridViewData {
  return {
    kind: 'grid',
    label,
    cells: b.map((r) => r.map((v) => (v === 'T' ? 'O' : v))),
    marks: {
      wall: b.flatMap((r, i) => r.flatMap((v, j) => (v === 'X' ? [[i, j] as Cell] : []))),
      done: b.flatMap((r, i) => r.flatMap((v, j) => (v === 'T' ? [[i, j] as Cell] : []))),
      hl,
    },
  }
}

function borderFig(): FigStep[] {
  const b = B.map((r) => [...r])
  const m = b.length
  const n = b[0].length
  const out: FigStep[] = [{ note: '被 X 包圍的 O 要翻成 X。反過來想:**不會**被包圍的 O,一定和邊界上的某個 O 相連。所以從邊界的 O 出發,把相連的 O 都標記成「安全」', views: [view(b)] }]
  const mark = (r: number, c: number, path: Cell[]) => {
    if (r < 0 || c < 0 || r >= m || c >= n || b[r][c] !== 'O') return
    b[r][c] = 'T'
    path.push([r, c])
    mark(r + 1, c, path)
    mark(r - 1, c, path)
    mark(r, c + 1, path)
    mark(r, c - 1, path)
  }
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if ((r === 0 || c === 0 || r === m - 1 || c === n - 1) && b[r][c] === 'O') {
        const path: Cell[] = []
        mark(r, c, path)
        out.push({ note: `邊界上的 (${r},${c}) 是 O → 它和相連的 ${path.length} 個 O 都碰得到邊界,標成安全`, views: [view(b, path)] })
      }
    }
  const flipped: Cell[] = []
  b.forEach((row, i) => row.forEach((v, j) => v === 'O' && flipped.push([i, j])))
  out.push({ note: `剩下還是 O 的(${flipped.length} 個)都碰不到邊界 → 被包圍了`, views: [view(b, flipped)] })
  for (const row of b) for (let j = 0; j < row.length; j++) row[j] = row[j] === 'O' ? 'X' : row[j] === 'T' ? 'O' : row[j]
  out.push({ note: '最後掃一遍:還是 O 的翻成 X,標記成安全的改回 O', views: [view(b, flipped, '結果')] })
  return out
}

function ufFig(): FigStep[] {
  return [
    { note: '並查集的做法:多開一個虛擬節點「邊界」。邊界上的 O 都和「邊界」合併;相鄰的 O 互相合併', views: [view(B)] },
    { note: '最後,和「邊界」不在同一組的 O 就是被包圍的,翻成 X', views: [view(B, [[1, 1], [1, 2], [2, 2]], '被包圍的 O')] },
  ]
}

export const q0130: Solution = {
  id: 130,
  plain: '棋盤上有 X 和 O。完全被 X 圍起來的 O(碰不到棋盤邊緣)要全部翻成 X。訣竅反過來想:先把「碰得到邊緣」的 O 找出來保護好,剩下的就是被包圍的。',
  statement: '`board` 是只含 `X` 和 `O` 的 m×n 網格。把所有**被 X 包圍**的 O 區域都改成 X。和邊界上的 O 相連(上下左右)的 O 不算被包圍。直接修改 board,不用回傳。',
  examples: [
    { input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]', note: '最下面的 O 在邊界上,不會被翻' },
    { input: 'board = [["X"]]', output: '[["X"]]' },
  ],
  constraints: ['`m, n ≤ 200`'],
  insight: [
    '正面做:對每個 O 區域判斷「有沒有碰到邊界」,要先找出整個區域才知道 —— 可以,但要小心不能邊找邊翻',
    '反過來做比較簡單:**碰得到邊界的 O** 一定和「邊界上的 O」相連。從邊界上每個 O 出發 DFS / BFS,把相連的 O 標成安全',
    '最後掃一遍:沒被標記的 O → 翻成 X;標記過的改回 O',
    '和 [417](#/q/417) 一樣是「從邊界反向搜尋」',
  ],
  approaches: [
    {
      name: '從邊界的 O 反向標記(DFS)',
      idea: '四條邊上的每個 O 做 DFS,把相連的 O 暫時改成 `T`(安全)。之後全盤掃一次:O → X、T → O。',
      steps: ['對四條邊上的每一格:是 O → `dfs` 把相連的 O 改成 T', '全盤掃:`O` → `X`(被包圍)', '`T` → `O`(還原安全的)'],
      figure: { title: 'board(5 × 4)', steps: borderFig() },
      complexity: { time: 'O(m · n)', space: 'O(m · n)', why: '每格最多被標記一次;遞迴深度最壞 m·n。' },
      verdict: '標準解。用暫時的符號 T 當 visited,不用另外開陣列。',
      code: {
        python: `def solve(board):
    m, n = len(board), len(board[0])

    def mark(r, c):                       # 和邊界相連的 O → 暫時改成 T(安全)
        if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != 'O':
            return
        board[r][c] = 'T'
        mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1)

    for r in range(m):
        mark(r, 0); mark(r, n - 1)
    for c in range(n):
        mark(0, c); mark(m - 1, c)
    for r in range(m):
        for c in range(n):
            if board[r][c] == 'O':
                board[r][c] = 'X'         # 被包圍
            elif board[r][c] == 'T':
                board[r][c] = 'O'         # 還原`,
        c: `static char **Bd;
static int M, N;

static void mark(int r, int c) {
    if (r < 0 || c < 0 || r >= M || c >= N || Bd[r][c] != 'O') return;
    Bd[r][c] = 'T';
    mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1);
}

void solve(char **board, int boardSize, int *boardColSize) {
    Bd = board; M = boardSize; N = boardColSize[0];
    for (int r = 0; r < M; r++) { mark(r, 0); mark(r, N - 1); }
    for (int c = 0; c < N; c++) { mark(0, c); mark(M - 1, c); }
    for (int r = 0; r < M; r++)
        for (int c = 0; c < N; c++)
            board[r][c] = board[r][c] == 'O' ? 'X' : board[r][c] == 'T' ? 'O' : board[r][c];
}`,
        cpp: `void solve(vector<vector<char>>& board) {
    int m = board.size(), n = board[0].size();
    function<void(int, int)> mark = [&](int r, int c) {
        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != 'O') return;
        board[r][c] = 'T';
        mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1);
    };
    for (int r = 0; r < m; r++) { mark(r, 0); mark(r, n - 1); }
    for (int c = 0; c < n; c++) { mark(0, c); mark(m - 1, c); }
    for (auto& row : board)
        for (char& ch : row) ch = ch == 'O' ? 'X' : ch == 'T' ? 'O' : ch;
}`,
        java: `void solve(char[][] board) {
    int m = board.length, n = board[0].length;
    for (int r = 0; r < m; r++) { mark(board, r, 0); mark(board, r, n - 1); }
    for (int c = 0; c < n; c++) { mark(board, 0, c); mark(board, m - 1, c); }
    for (char[] row : board)
        for (int c = 0; c < n; c++) row[c] = row[c] == 'O' ? 'X' : row[c] == 'T' ? 'O' : row[c];
}

private void mark(char[][] b, int r, int c) {
    if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != 'O') return;
    b[r][c] = 'T';
    mark(b, r + 1, c); mark(b, r - 1, c); mark(b, r, c + 1); mark(b, r, c - 1);
}`,
        javascript: `function solve(board) {
  const m = board.length, n = board[0].length;
  const mark = (r, c) => {
    if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== 'O') return;
    board[r][c] = 'T';
    mark(r + 1, c); mark(r - 1, c); mark(r, c + 1); mark(r, c - 1);
  };
  for (let r = 0; r < m; r++) { mark(r, 0); mark(r, n - 1); }
  for (let c = 0; c < n; c++) { mark(0, c); mark(m - 1, c); }
  for (const row of board)
    for (let c = 0; c < n; c++) row[c] = row[c] === 'O' ? 'X' : row[c] === 'T' ? 'O' : row[c];
}`,
      },
    },
    {
      name: '並查集 + 虛擬的「邊界」節點',
      idea: '每格一個節點,再多一個「邊界」節點 `n·m`。邊界上的 O 和「邊界」合併;每個 O 和右邊、下面的 O 合併。最後和「邊界」不同組的 O 翻成 X。',
      steps: ['`parent = [0 .. m·n]`(多一個 dummy)', '邊界上的 O → `union(格子, dummy)`', '每個 O 和右、下的 O → `union`', '`find(格子) != find(dummy)` 的 O → X'],
      figure: { title: 'board(5 × 4)', steps: ufFig() },
      complexity: { time: 'O(m · n · α)', space: 'O(m · n)', why: 'α 幾乎是常數。' },
      verdict: '不用遞迴。「多開一個虛擬節點代表一整群特殊的點(邊界、源頭)」是[[p:union-find]]常用的技巧。',
      code: {
        python: `def solve(board):
    m, n = len(board), len(board[0])
    parent = list(range(m * n + 1))
    dummy = m * n                         # 代表「邊界」

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        parent[find(a)] = find(b)

    for r in range(m):
        for c in range(n):
            if board[r][c] != 'O':
                continue
            if r in (0, m - 1) or c in (0, n - 1):
                union(r * n + c, dummy)
            if r + 1 < m and board[r + 1][c] == 'O':
                union(r * n + c, (r + 1) * n + c)
            if c + 1 < n and board[r][c + 1] == 'O':
                union(r * n + c, r * n + c + 1)
    root = find(dummy)
    for r in range(m):
        for c in range(n):
            if board[r][c] == 'O' and find(r * n + c) != root:
                board[r][c] = 'X'`,
        c: `static int *P;
static int find(int x) { while (P[x] != x) { P[x] = P[P[x]]; x = P[x]; } return x; }
static void unite(int a, int b) { P[find(a)] = find(b); }

void solve(char **board, int boardSize, int *boardColSize) {
    int m = boardSize, n = boardColSize[0], dummy = m * n;
    P = malloc((m * n + 1) * sizeof(int));
    for (int i = 0; i <= m * n; i++) P[i] = i;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (board[r][c] != 'O') continue;
            if (r == 0 || c == 0 || r == m - 1 || c == n - 1) unite(r * n + c, dummy);
            if (r + 1 < m && board[r + 1][c] == 'O') unite(r * n + c, (r + 1) * n + c);
            if (c + 1 < n && board[r][c + 1] == 'O') unite(r * n + c, r * n + c + 1);
        }
    int root = find(dummy);
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (board[r][c] == 'O' && find(r * n + c) != root) board[r][c] = 'X';
    free(P);
}`,
        cpp: `void solve(vector<vector<char>>& board) {
    int m = board.size(), n = board[0].size(), dummy = m * n;
    vector<int> parent(m * n + 1);
    iota(parent.begin(), parent.end(), 0);
    function<int(int)> find = [&](int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); };
    auto unite = [&](int a, int b) { parent[find(a)] = find(b); };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (board[r][c] != 'O') continue;
            if (r == 0 || c == 0 || r == m - 1 || c == n - 1) unite(r * n + c, dummy);
            if (r + 1 < m && board[r + 1][c] == 'O') unite(r * n + c, (r + 1) * n + c);
            if (c + 1 < n && board[r][c + 1] == 'O') unite(r * n + c, r * n + c + 1);
        }
    int root = find(dummy);
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (board[r][c] == 'O' && find(r * n + c) != root) board[r][c] = 'X';
}`,
        java: `private int[] parent;
private int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

void solve(char[][] board) {
    int m = board.length, n = board[0].length, dummy = m * n;
    parent = new int[m * n + 1];
    for (int i = 0; i <= m * n; i++) parent[i] = i;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) {
            if (board[r][c] != 'O') continue;
            if (r == 0 || c == 0 || r == m - 1 || c == n - 1) parent[find(r * n + c)] = find(dummy);
            if (r + 1 < m && board[r + 1][c] == 'O') parent[find(r * n + c)] = find((r + 1) * n + c);
            if (c + 1 < n && board[r][c + 1] == 'O') parent[find(r * n + c)] = find(r * n + c + 1);
        }
    int root = find(dummy);
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (board[r][c] == 'O' && find(r * n + c) != root) board[r][c] = 'X';
}`,
        javascript: `function solve(board) {
  const m = board.length, n = board[0].length, dummy = m * n;
  const parent = Array.from({ length: m * n + 1 }, (_, i) => i);
  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const unite = (a, b) => (parent[find(a)] = find(b));
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++) {
      if (board[r][c] !== 'O') continue;
      if (r === 0 || c === 0 || r === m - 1 || c === n - 1) unite(r * n + c, dummy);
      if (r + 1 < m && board[r + 1][c] === 'O') unite(r * n + c, (r + 1) * n + c);
      if (c + 1 < n && board[r][c + 1] === 'O') unite(r * n + c, r * n + c + 1);
    }
  const root = find(dummy);
  for (let r = 0; r < m; r++)
    for (let c = 0; c < n; c++)
      if (board[r][c] === 'O' && find(r * n + c) !== root) board[r][c] = 'X';
}`,
      },
    },
  ],
  pitfalls: [
    '從內部的 O 開始判斷,邊找邊翻:找到一半才發現碰到邊界,前面翻掉的要還原,很麻煩',
    '最後一步忘了把 T 改回 O',
    '只檢查和邊界「直接相鄰」的 O:要沿著相連的 O 一路走下去',
  ],
  followUp: [{ q: '同類型的題?', a: '1020. Number of Enclaves(數被包圍的陸地格數)、1254. Number of Closed Islands,都是「先從邊界淹掉,再數剩下的」。' }],
  check: {
    kind: 'fn',
    fn: 'solve',
    inplace: 0,
    cases: [
      {
        args: [['XXXX', 'XOOX', 'XXOX', 'XOXX'].map((r) => r.split(''))],
        out: ['XXXX', 'XXXX', 'XXXX', 'XOXX'].map((r) => r.split('')),
      },
      { args: [[['X']]], out: [['X']] },
      { args: [B], out: ['XXXX', 'XXXX', 'XXXX', 'XOXX', 'XOOX'].map((r) => r.split('')) },
      { args: [['OOO', 'OXO', 'OOO'].map((r) => r.split(''))], out: ['OOO', 'OXO', 'OOO'].map((r) => r.split('')) },
      { args: [['XXX', 'XOX', 'XXX'].map((r) => r.split(''))], out: ['XXX', 'XXX', 'XXX'].map((r) => r.split('')) },
    ],
  },
}
