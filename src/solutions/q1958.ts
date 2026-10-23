import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 1958. Check if Move is Legal
const B = Array.from({ length: 8 }, () => Array(8).fill('.') as string[])
B[3][1] = 'B'
B[3][2] = B[3][3] = 'W'
const board = (label: string, marks: Record<string, [number, number][]>): GridViewData => ({ kind: 'grid', label, cells: B, marks })
const rayFig: FigStep[] = [
  { note: '在 (3,4) 放黑棋 B,往左依序看到 W、W、B:中間至少一顆白棋,最後由黑棋封住,因此合法。', views: [board('棋盤,待下位置在 (3,4)', { hl: [[3, 4]], done: [[3, 1]], path: [[3, 2], [3, 3]] })] },
  { note: '只要八個方向有一個方向形成這樣的連線,這步就合法。', views: [arr(['B', 'W', 'W', 'B'], { label: '封住對方棋子的一條線', done: [0, 3] })] },
]
const endpointFig: FigStep[] = [
  { note: '也能從既有的同色棋子找終點:它必須和待下位置在同一列、欄或對角線,而且兩者之間全是對手。', views: [board('從 (3,1) 的 B 看向 (3,4)', { done: [[3, 1]], path: [[3, 2], [3, 3]], hl: [[3, 4]] })] },
  { note: '兩端至少相隔兩格,才能夾住至少一顆對手棋子。', views: [arr([3], { label: '兩端距離', done: [0] })] },
]

export const q1958: Solution = {
  id: 1958,
  plain: '在 8×8 黑白棋盤的空格下一顆棋。如果某個方向能用自己的棋子把一串對方棋子夾住,這一步就合法。',
  statement: '給 8×8 棋盤 board、待下位置 rMove/cMove 和棋色 color,判斷是否存在一個水平、垂直或對角方向,從新棋出發先經過至少一顆對方棋,最後遇到己方棋。',
  examples: [
    { input: 'board 第 3 列有 B W W .;rMove = 3,cMove = 4,color = "B"', output: 'true' },
    { input: '相同棋盤;rMove = 3,cMove = 5,color = "B"', output: 'false' },
  ],
  constraints: ['棋盤固定 8×8,每格為 B、W 或 .', '只需判斷是否合法,不必真的翻轉棋子'],
  insight: ['合法方向的順序一定是:新棋 → 至少一顆對手棋 → 既有己方棋。', '相鄰就碰到己方棋不算,中間有空格也不算。', '八方向可用 dr、dc 各取 -1、0、1 且不能同時為 0。'],
  approaches: [
    {
      name: '從新棋掃八個方向',
      idea: '每個方向連續走,先確認有對方棋,接著尋找己方棋作終點。',
      steps: ['若待下位置不是空格,回傳 false', '對八個方向,從鄰格開始前進', '遇空格就停止;遇對手就記錄已有對手;遇己方且已有對手就回傳 true', '八方向都沒有則回傳 false'],
      figure: { title: '往左夾住白棋', steps: rayFig },
      complexity: { time: 'O(8×8)', space: 'O(1)', why: '八個方向,每個最多走七格。' },
      verdict: '最符合遊戲規則,實作也最短。',
      code: {
        python: `def checkMove(board, rMove, cMove, color):
    if board[rMove][cMove] != '.':
        return False
    other = 'W' if color == 'B' else 'B'
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            r, c = rMove + dr, cMove + dc
            seen = False
            while 0 <= r < 8 and 0 <= c < 8:
                if board[r][c] == other:
                    seen = True
                elif board[r][c] == color:
                    if seen:
                        return True
                    break
                else:
                    break
                r += dr
                c += dc
    return False`,
        c: `bool checkMove(char **board, int boardSize, int *boardColSize, int rMove, int cMove, char color) {
    if (board[rMove][cMove] != '.') return false;
    char other = color == 'B' ? 'W' : 'B';
    for (int dr = -1; dr <= 1; dr++)
        for (int dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            int r = rMove + dr, c = cMove + dc;
            bool seen = false;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] == other) seen = true;
                else if (board[r][c] == color) {
                    if (seen) return true;
                    break;
                } else break;
                r += dr; c += dc;
            }
        }
    return false;
}`,
        cpp: `bool checkMove(vector<vector<char>>& board, int rMove, int cMove, char color) {
    if (board[rMove][cMove] != '.') return false;
    char other = color == 'B' ? 'W' : 'B';
    for (int dr = -1; dr <= 1; dr++)
        for (int dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            int r = rMove + dr, c = cMove + dc;
            bool seen = false;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] == other) seen = true;
                else if (board[r][c] == color) {
                    if (seen) return true;
                    break;
                } else break;
                r += dr; c += dc;
            }
        }
    return false;
}`,
        java: `boolean checkMove(char[][] board, int rMove, int cMove, char color) {
    if (board[rMove][cMove] != '.') return false;
    char other = color == 'B' ? 'W' : 'B';
    for (int dr = -1; dr <= 1; dr++)
        for (int dc = -1; dc <= 1; dc++) {
            if (dr == 0 && dc == 0) continue;
            int r = rMove + dr, c = cMove + dc;
            boolean seen = false;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] == other) seen = true;
                else if (board[r][c] == color) {
                    if (seen) return true;
                    break;
                } else break;
                r += dr; c += dc;
            }
        }
    return false;
}`,
        javascript: `function checkMove(board, rMove, cMove, color) {
  if (board[rMove][cMove] !== '.') return false;
  const other = color === 'B' ? 'W' : 'B';
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      let r = rMove + dr, c = cMove + dc, seen = false;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board[r][c] === other) seen = true;
        else if (board[r][c] === color) {
          if (seen) return true;
          break;
        } else break;
        r += dr; c += dc;
      }
    }
  return false;
}`,
      },
    },
    {
      name: '由己方終點驗證整段',
      idea: '枚舉棋盤上己方棋子作為另一端,只有和新棋對齊且中間全是對方棋時才合法。',
      steps: ['枚舉每個已存在的己方棋子', '檢查兩端在同一列、欄或對角線,且距離至少 2', '沿著兩端方向檢查所有中間格是否都是對手', '找到一條完整線就回傳 true'],
      figure: { title: '從封住的終點回看', steps: endpointFig },
      complexity: { time: 'O(8³)', space: 'O(1)', why: '最多查看 64 個端點,每個端點最多檢查 7 個中間格。' },
      verdict: '更強調「兩端夾住對方」的幾何條件;掃八方向通常更簡潔。',
      code: {
        python: `def checkMove(board, rMove, cMove, color):
    if board[rMove][cMove] != '.':
        return False
    other = 'W' if color == 'B' else 'B'
    for r in range(8):
        for c in range(8):
            if board[r][c] != color:
                continue
            a, b = rMove - r, cMove - c
            if not (a == 0 or b == 0 or abs(a) == abs(b)):
                continue
            steps = max(abs(a), abs(b))
            if steps < 2:
                continue
            dr, dc = a // steps, b // steps
            if all(board[r + dr * t][c + dc * t] == other for t in range(1, steps)):
                return True
    return False`,
        c: `bool checkMove(char **board, int boardSize, int *boardColSize, int rMove, int cMove, char color) {
    if (board[rMove][cMove] != '.') return false;
    char other = color == 'B' ? 'W' : 'B';
    for (int r = 0; r < 8; r++)
        for (int c = 0; c < 8; c++) {
            if (board[r][c] != color) continue;
            int a = rMove - r, b = cMove - c;
            if (a != 0 && b != 0 && abs(a) != abs(b)) continue;
            int steps = abs(a) > abs(b) ? abs(a) : abs(b);
            if (steps < 2) continue;
            int dr = a / steps, dc = b / steps;
            bool valid = true;
            for (int t = 1; t < steps; t++)
                if (board[r + dr * t][c + dc * t] != other) { valid = false; break; }
            if (valid) return true;
        }
    return false;
}`,
        cpp: `bool checkMove(vector<vector<char>>& board, int rMove, int cMove, char color) {
    if (board[rMove][cMove] != '.') return false;
    char other = color == 'B' ? 'W' : 'B';
    for (int r = 0; r < 8; r++)
        for (int c = 0; c < 8; c++) {
            if (board[r][c] != color) continue;
            int a = rMove - r, b = cMove - c;
            if (a && b && abs(a) != abs(b)) continue;
            int steps = max(abs(a), abs(b));
            if (steps < 2) continue;
            int dr = a / steps, dc = b / steps;
            bool valid = true;
            for (int t = 1; t < steps; t++)
                if (board[r + dr * t][c + dc * t] != other) { valid = false; break; }
            if (valid) return true;
        }
    return false;
}`,
        java: `boolean checkMove(char[][] board, int rMove, int cMove, char color) {
    if (board[rMove][cMove] != '.') return false;
    char other = color == 'B' ? 'W' : 'B';
    for (int r = 0; r < 8; r++)
        for (int c = 0; c < 8; c++) {
            if (board[r][c] != color) continue;
            int a = rMove - r, b = cMove - c;
            if (a != 0 && b != 0 && Math.abs(a) != Math.abs(b)) continue;
            int steps = Math.max(Math.abs(a), Math.abs(b));
            if (steps < 2) continue;
            int dr = a / steps, dc = b / steps;
            boolean valid = true;
            for (int t = 1; t < steps; t++)
                if (board[r + dr * t][c + dc * t] != other) { valid = false; break; }
            if (valid) return true;
        }
    return false;
}`,
        javascript: `function checkMove(board, rMove, cMove, color) {
  if (board[rMove][cMove] !== '.') return false;
  const other = color === 'B' ? 'W' : 'B';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== color) continue;
      const a = rMove - r, b = cMove - c;
      if (a && b && Math.abs(a) !== Math.abs(b)) continue;
      const steps = Math.max(Math.abs(a), Math.abs(b));
      if (steps < 2) continue;
      const dr = a / steps, dc = b / steps;
      let valid = true;
      for (let t = 1; t < steps; t++)
        if (board[r + dr * t][c + dc * t] !== other) { valid = false; break; }
      if (valid) return true;
    }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['新棋和己方棋之間至少要有一顆對手棋,直接相鄰不算。', '中間若出現空格或己方棋,這個方向就失敗。', '只要八方向中任何一條成立即可,不用真的翻轉棋子。'],
  check: { kind: 'fn', fn: 'checkMove', cases: [
    { args: [B, 3, 4, 'B'], out: true },
    { args: [B, 3, 4, 'W'], out: false },
    { args: [B, 3, 5, 'B'], out: false },
    { args: [B, 3, 1, 'W'], out: false },
  ] },
}
