import type { Solution } from './types'

// 289. Game of Life
const B = [[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]
const NEXT = [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]
const view = (cells: number[][], label: string) => ({ kind: 'grid' as const, label, cells })
const fig = [
  { note: '先看舊棋盤；每格的下一代必須同時根據這張舊棋盤計算。', views: [view(B, '舊棋盤')] },
  { note: '上排中間的活細胞只有 1 個活鄰居，下一代會死亡。', views: [view([[0, 0, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]], '上排已計算')] },
  { note: '中排左右兩格原本是死細胞，各恰有 3 個活鄰居，下一代復活。', views: [view([[0, 0, 0], [1, 0, 1], [1, 1, 1], [0, 0, 0]], '中排已計算')] },
  { note: '每格都以同一代的鄰居數決定後，得到完整下一代。', views: [view(NEXT, '下一代')] },
]
const inplaceFig = [
  { note: '舊值 0/1 先保留在最低位；下一代的新值寫入第二位。', views: [view(B, '舊值')] },
  { note: '中排左格由 0 變 1，暫存成二進位 10，也就是 2。', views: [view([[0, 1, 0], [2, 0, 1], [1, 1, 1], [0, 0, 0]], '暫存狀態')] },
  { note: '下排中格由 1 保持 1，暫存為二進位 11，也就是 3。', views: [view([[0, 1, 0], [2, 0, 1], [1, 3, 1], [0, 0, 0]], '新舊值共存')] },
  { note: '全部格子算完後右移一位，只留下新值。', views: [view(NEXT, '下一代')] },
]

export const q0289: Solution = {
  id: 289,
  plain: '模擬生命遊戲的一回合：每格依照周圍八格原本的狀態，決定下一回合生或死。',
  statement: '棋盤 `board` 由 0（死）與 1（活）組成。活細胞有 2 或 3 個活鄰居才存活；死細胞恰有 3 個活鄰居才復活。原地更新整張棋盤。',
  examples: [{ input: 'board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]', output: '[[0,0,0],[1,0,1],[0,1,1],[0,1,0]]' }],
  constraints: ['1 ≤ 列、欄 ≤ 25；八個方向都要檢查，越界的不計。'],
  insight: ['所有格子要**同時**更新；不能讓先更新的格子影響後面的鄰居計數。', '最直接是建立新棋盤；也能用兩個位元同時存舊值和新值，見 [[p:simulation]]。'],
  approaches: [
    {
      name: '另開新棋盤',
      idea: '一直讀舊棋盤，把結果寫進新棋盤，最後複製回原棋盤。',
      steps: ['對每格計算八個鄰居中有幾個活著。', '按照存活與復活規則寫入新棋盤。', '全算完後把新值寫回原棋盤。'],
      figure: { title: 'board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]', steps: fig },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每格檢查固定八個方向，另存完整棋盤。' },
      verdict: '新舊狀態分明，最容易寫對。',
      code: {
        python: `def gameOfLife(board):
    m, n = len(board), len(board[0])
    next_board = [[0] * n for _ in range(m)]
    for r in range(m):
        for c in range(n):
            live = 0
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if dr == 0 and dc == 0:
                        continue
                    nr, nc = r + dr, c + dc
                    if 0 <= nr < m and 0 <= nc < n:
                        live += board[nr][nc]  # 只讀舊棋盤
            next_board[r][c] = int(live == 3 or board[r][c] == 1 and live == 2)
    for r in range(m):
        board[r][:] = next_board[r]`,
        c: `void gameOfLife(int **board, int boardSize, int *boardColSize) {
    int m = boardSize, n = boardColSize[0];
    int **next = malloc(m * sizeof(int *));
    for (int r = 0; r < m; r++) next[r] = calloc(n, sizeof(int));
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    if (dr == 0 && dc == 0) continue;
                    int nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc];
                }
            }
            next[r][c] = live == 3 || (board[r][c] && live == 2);
        }
    }
    for (int r = 0; r < m; r++) {
        memcpy(board[r], next[r], n * sizeof(int));
        free(next[r]);
    }
    free(next);
}`,
        cpp: `void gameOfLife(vector<vector<int>>& board) {
    int m = board.size(), n = board[0].size();
    vector<vector<int>> next(m, vector<int>(n));
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    int nr = r + dr, nc = c + dc;
                    if ((dr || dc) && nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc];
                }
            }
            next[r][c] = live == 3 || (board[r][c] && live == 2);
        }
    }
    board = next;
}`,
        java: `void gameOfLife(int[][] board) {
    int m = board.length, n = board[0].length;
    int[][] next = new int[m][n];
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    int nr = r + dr, nc = c + dc;
                    if ((dr != 0 || dc != 0) && nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc];
                }
            }
            next[r][c] = live == 3 || (board[r][c] == 1 && live == 2) ? 1 : 0;
        }
    }
    for (int r = 0; r < m; r++) System.arraycopy(next[r], 0, board[r], 0, n);
}`,
        javascript: `function gameOfLife(board) {
  const m = board.length, n = board[0].length;
  const next = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      let live = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if ((dr || dc) && nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc];
        }
      }
      next[r][c] = +(live === 3 || board[r][c] === 1 && live === 2);
    }
  }
  for (let r = 0; r < m; r++) board[r] = next[r];
}`,
      },
    },
    {
      name: '兩個位元原地更新',
      idea: '最低位保留舊值，第二位暫存新值；最後整張棋盤右移一位。',
      steps: ['計數時只讀 `board[nr][nc] & 1`。', '下一代要活著就加上位元 2。', '全部算完再把每格右移 1 位。'],
      figure: { title: '同一個棋盤的暫存值', steps: inplaceFig },
      complexity: { time: 'O(mn)', space: 'O(1)', why: '每格只用固定個數的暫存變數。' },
      verdict: '符合額外空間 O(1)；兩個位元的含義要記清楚。',
      code: {
        python: `def gameOfLife(board):
    m, n = len(board), len(board[0])
    for r in range(m):
        for c in range(n):
            live = 0
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    nr, nc = r + dr, c + dc
                    if (dr or dc) and 0 <= nr < m and 0 <= nc < n:
                        live += board[nr][nc] & 1  # 最低位仍是舊值
            if live == 3 or board[r][c] & 1 and live == 2:
                board[r][c] |= 2             # 第二位記下一代
    for r in range(m):
        for c in range(n):
            board[r][c] >>= 1`,
        c: `void gameOfLife(int **board, int boardSize, int *boardColSize) {
    int m = boardSize, n = boardColSize[0];
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    int nr = r + dr, nc = c + dc;
                    if ((dr || dc) && nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc] & 1;
                }
            }
            if (live == 3 || ((board[r][c] & 1) && live == 2)) board[r][c] |= 2;
        }
    }
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) board[r][c] >>= 1;
    }
}`,
        cpp: `void gameOfLife(vector<vector<int>>& board) {
    int m = board.size(), n = board[0].size();
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    int nr = r + dr, nc = c + dc;
                    if ((dr || dc) && nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc] & 1;
                }
            }
            if (live == 3 || ((board[r][c] & 1) && live == 2)) board[r][c] |= 2;
        }
    }
    for (auto& row : board) {
        for (int& cell : row) cell >>= 1;
    }
}`,
        java: `void gameOfLife(int[][] board) {
    int m = board.length, n = board[0].length;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++) {
                for (int dc = -1; dc <= 1; dc++) {
                    int nr = r + dr, nc = c + dc;
                    if ((dr != 0 || dc != 0) && nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc] & 1;
                }
            }
            if (live == 3 || ((board[r][c] & 1) == 1 && live == 2)) board[r][c] |= 2;
        }
    }
    for (int[] row : board) {
        for (int c = 0; c < n; c++) row[c] >>= 1;
    }
}`,
        javascript: `function gameOfLife(board) {
  const m = board.length, n = board[0].length;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      let live = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if ((dr || dc) && nr >= 0 && nr < m && nc >= 0 && nc < n) live += board[nr][nc] & 1;
        }
      }
      if (live === 3 || (board[r][c] & 1) && live === 2) board[r][c] |= 2;
    }
  }
  for (const row of board) {
    for (let c = 0; c < n; c++) row[c] >>= 1;
  }
}`,
      },
    },
  ],
  pitfalls: ['計數要排除自己。', '原地版本計數時讀最低位，否則會讀到已算出的下一代。'],
  check: { kind: 'fn', fn: 'gameOfLife', inplace: 0, cases: [
    { args: [B], out: NEXT }, { args: [[[1, 1], [1, 0]]], out: [[1, 1], [1, 1]] },
  ] },
}
