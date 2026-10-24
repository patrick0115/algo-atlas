import type { Solution } from './types'
import type { GridViewData } from '../types'

// 37. Sudoku Solver
const ROWS = ['53..7....','6..195...','.98....6.','8...6...3','4..8.3..1','7...2...6','.6....28.','...419..5','....8..79']
const B = ROWS.map(r=>r.split(''))
const DONE = ['534678912','672195348','198342567','859761423','426853791','713924856','961537284','287419635','345286179'].map(r=>r.split(''))
const grid = (cells: string[][], r: number, c: number, label: string): GridViewData => ({ kind: 'grid', label, cells, marks: { hl: [[r,c]] } })
const fig = [
  { note: '先從左上逐格掃描，(0,0) 與 (0,1) 已填 5、3；第一個空格是 (0,2)。', views: [grid(B,0,2,'第一個空格')] },
  { note: '從左上往右掃，第一個空格 (0,2) 所在列已有 5、3、7；同欄已有 8；同宮還有 6、9、8，可試 1、2、4。', views: [grid(B,0,2,'候選數')] },
  { note: '先試候選 1，再遞迴處理下一個空格；若後面無解，就把這格復原為點號並改試 2。', views: [grid(B,0,2,'嘗試並準備回溯')] },
  { note: '若填某數導致後續空格沒有合法選擇，就撤銷這格並試下一個數。最後 (0,2) 填 4。', views: [grid(DONE,0,2,'解出後')] },
]

export const q0037: Solution = {
  id: 37,
  plain: '把未完成的數獨填好；每格只能放 1 到 9，同一列、同一行、同一個 3×3 宮都不能重複。',
  statement: '原地修改 9×9 字元棋盤。空格為 "."，填入數字字元使數獨成立；保證恰有一解。',
  examples: [{ input: `board = ${JSON.stringify(B)}`, output: JSON.stringify(DONE) }],
  constraints: ['棋盤固定 9×9，已填數字有效，且只有一個解。', '需要回溯；一次猜錯後必須復原。'],
  insight: ['和 [36](#/q/36) 的合法性檢查相同；差別是要嘗試所有可填數字。', '先用逐列、逐行、逐宮掃描驗證候選數。', '再用位元遮罩保存每列、每行、每宮已用數字，讓合法性查詢更快；兩種都屬 [[p:backtracking]]。'],
  approaches: [
    { name: '逐格檢查並回溯', idea: '找下一個空格，試 1 到 9；每次掃列、行、宮檢查是否合法。', steps: ['找一個空格；沒有空格代表完成。先找下一個空格，已填好的格子不需要再猜。', '對 1 到 9 逐一檢查列、行、宮。候選數要同時通過列、行、九宮格三種檢查。', '合法就填入並遞迴；若後續失敗，恢復成 "."。若後面的空格無法完成，就撤銷剛才的填入再試下一個候選。'], figure: { title: '第一格 (0,2)', steps: fig }, complexity: { time: 'O(9^e)', space: 'O(e)', why: 'e 個空格每個最多試九個數字；遞迴深度 e。' }, verdict: '最符合初學者對數獨的直覺。', code: {
      python: `def solveSudoku(board):

    def valid(r, c, ch):
        for i in range(9):  # 檢查候選數是否和同列、同行或同宮衝突。
            if board[r][i] == ch or board[i][c] == ch:  # 同列或同行已有此數字，就不能填入。
                return False
            if board[r // 3 * 3 + i // 3][c // 3 * 3 + i % 3] == ch:
                return False
        return True

    def dfs():
        for r in range(9):
            for c in range(9):
                if board[r][c] != '.':
                    continue
                for ch in '123456789':
                    if valid(r, c, ch):
                        board[r][c] = ch
                        if dfs():
                            return True
                        board[r][c] = '.'
                return False
        return True
    dfs()`,
      c: `static bool valid(char **b, int r, int c, char x) {
    for (int i = 0; i < 9; i++) {
        if (b[r][i] == x || b[i][c] == x)
            return false;
        if (b[r / 3 * 3 + i / 3][c / 3 * 3 + i % 3] == x)
            return false;
    }
    return true;
}
static bool dfs(char **b) {
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (b[r][c] == '.') {
                for (char x = '1'; x <= '9'; x++)
                    if (valid(b, r, c, x)) {
                        b[r][c] = x;
                        if (dfs(b))
                            return true;
                        b[r][c] = '.';
                    }
                return false;
            }
    return true;
}
void solveSudoku(char **board, int boardSize, int *boardColSize) {
    dfs(board);
}`,
      cpp: `bool valid(vector<vector<char>>& b, int r, int c, char x) {
    for (int i = 0; i < 9; i++) {
        if (b[r][i] == x || b[i][c] == x)
            return false;
        if (b[r / 3 * 3 + i / 3][c / 3 * 3 + i % 3] == x)
            return false;
    }
    return true;
}
bool dfs(vector<vector<char>>& b) {
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (b[r][c] == '.') {
                for (char x = '1'; x <= '9'; x++)
                    if (valid(b, r, c, x)) {
                        b[r][c] = x;
                        if (dfs(b))
                            return true;
                        b[r][c] = '.';
                    }
                return false;
            }
    return true;
}
void solveSudoku(vector<vector<char>>& board) {
    dfs(board);
}`,
      java: `boolean valid(char[][] b, int r, int c, char x) {
    for (int i = 0; i < 9; i++) {
        if (b[r][i] == x || b[i][c] == x)
            return false;
        if (b[r / 3 * 3 + i / 3][c / 3 * 3 + i % 3] == x)
            return false;
    }
    return true;
}
boolean dfs(char[][] b) {
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (b[r][c] == '.') {
                for (char x = '1'; x <= '9'; x++)
                    if (valid(b, r, c, x)) {
                        b[r][c] = x;
                        if (dfs(b))
                            return true;
                        b[r][c] = '.';
                    }
                return false;
            }
    return true;
}
void solveSudoku(char[][] board) {
    dfs(board);
}`,
      javascript: `function solveSudoku(board) {
    function valid(r, c, x) {
        for (let i = 0; i < 9; i++) {
            if (board[r][i] === x || board[i][c] === x)
                return false;
            if (board[Math.floor(r / 3) * 3 + Math.floor(i / 3)][Math.floor(c / 3) * 3 + i % 3] === x)
                return false;
        }
        return true;
    }
    function dfs() {
        for (let r = 0; r < 9; r++)
            for (let c = 0; c < 9; c++)
                if (board[r][c] === '.') {
                    for (const x of '123456789')
                        if (valid(r, c, x)) {
                            board[r][c] = x;
                            if (dfs())
                                return true;
                            board[r][c] = '.';
                        }
                    return false;
                }
        return true;
    }
    dfs();
}`,
    } },
    { name: '位元遮罩加回溯', idea: '三組遮罩分別記每列、行、宮已出現的數字，試填時用 bit 判斷衝突。', steps: ['掃已填格，把對應 bit 設為 1，並收集空格。先找下一個空格，已填好的格子不需要再猜。', '依序處理空格，取列、行、宮遮罩的聯集。候選數要同時通過列、行、九宮格三種檢查。', '對未使用數字填入、更新遮罩並遞迴；失敗就撤銷。若後面的空格無法完成，就撤銷剛才的填入再試下一個候選。'], figure: { title: '第一格 (0,2)', steps: [fig[0], { note: '第 0 列、第 2 行、第 0 宮的已用數字合併後，剩餘 bit 對應候選數；試填時同步更新三組 bit。', views: [grid(B,0,2,'遮罩交集')] }, fig[3]] }, complexity: { time: 'O(9^e)', space: 'O(e)', why: '最壞仍需回溯，但候選檢查為常數時間。' }, verdict: '在空格較多時減少大量重複掃描。', code: {
      python: `def solveSudoku(board):
    row = [0] * 9
    col = [0] * 9
    box = [0] * 9
    empty = []
    for r in range(9):  # 初始化三組遮罩，並記錄每個待填空格。
        for c in range(9):
            if board[r][c] == '.':  # 空格留待 DFS 處理，已填格則立即設置遮罩。
                empty.append((r, c))
            else:
                bit = 1 << int(board[r][c]) - 1
                row[r] |= bit
                col[c] |= bit
                box[r // 3 * 3 + c // 3] |= bit

    def dfs(i):
        if i == len(empty):
            return True
        r, c = empty[i]
        b = r // 3 * 3 + c // 3
        for d in range(9):
            bit = 1 << d
            if (row[r] | col[c] | box[b]) & bit:
                continue
            board[r][c] = str(d + 1)
            row[r] ^= bit
            col[c] ^= bit
            box[b] ^= bit
            if dfs(i + 1):  # 下一格也有解時，保留目前的試填數字。
                return True
            board[r][c] = '.'
            row[r] ^= bit
            col[c] ^= bit
            box[b] ^= bit
        return False
    dfs(0)`,
      c: `static bool dfs(char **a, int *er, int *ec, int e, int i, int *row, int *col, int *box) {
    if (i == e)
        return true;
    int r = er[i], c = ec[i], b = r / 3 * 3 + c / 3;
    for (int d = 0; d < 9; d++) {
        int bit = 1 << d;
        if ((row[r] | col[c] | box[b]) & bit)
            continue;
        a[r][c] = '1' + d;
        row[r] ^= bit;
        col[c] ^= bit;
        box[b] ^= bit;
        if (dfs(a, er, ec, e, i + 1, row, col, box))
            return true;
        a[r][c] = '.';
        row[r] ^= bit;
        col[c] ^= bit;
        box[b] ^= bit;
    }
    return false;
}
void solveSudoku(char **a, int boardSize, int *cols) {
    int row[9] = {0}, col[9] = {0}, box[9] = {0}, er[81], ec[81], e = 0;
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (a[r][c] == '.') {
                er[e] = r;
                ec[e++] = c;
            }
            else {
                int bit = 1 << (a[r][c] - '1');
                row[r] |= bit;
                col[c] |= bit;
                box[r / 3 * 3 + c / 3] |= bit;
            }
    dfs(a, er, ec, e, 0, row, col, box);
}`,
      cpp: `bool dfs(vector<vector<char>>& a, vector<pair<int, int>>& e, int i, int *row, int *col, int *box) {
    if (i == (int)e.size())
        return true;
    auto [r, c] = e[i];
    int b = r / 3 * 3 + c / 3;
    for (int d = 0; d < 9; d++) {
        int bit = 1 << d;
        if ((row[r] | col[c] | box[b]) & bit)
            continue;
        a[r][c] = '1' + d;
        row[r] ^= bit;
        col[c] ^= bit;
        box[b] ^= bit;
        if (dfs(a, e, i + 1, row, col, box))
            return true;
        a[r][c] = '.';
        row[r] ^= bit;
        col[c] ^= bit;
        box[b] ^= bit;
    }
    return false;
}
void solveSudoku(vector<vector<char>>& a) {
    int row[9] = {}, col[9] = {}, box[9] = {};
    vector<pair<int, int>> e;
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (a[r][c] == '.')
                e.push_back({r, c});
            else {
                int bit = 1 << (a[r][c] - '1');
                row[r] |= bit;
                col[c] |= bit;
                box[r / 3 * 3 + c / 3] |= bit;
            }
    dfs(a, e, 0, row, col, box);
}`,
      java: `int[] row = new int[9], col = new int[9], box = new int[9];
List<int[]> empty = new ArrayList<>();
boolean dfs(char[][] a, int i) {
    if (i == empty.size())
        return true;
    int r = empty.get(i)[0], c = empty.get(i)[1], b = r / 3 * 3 + c / 3;
    for (int d = 0; d < 9; d++) {
        int bit = 1 << d;
        if (((row[r] | col[c] | box[b]) & bit) != 0)
            continue;
        a[r][c] = (char)('1' + d);
        row[r] ^= bit;
        col[c] ^= bit;
        box[b] ^= bit;
        if (dfs(a, i + 1))
            return true;
        a[r][c] = '.';
        row[r] ^= bit;
        col[c] ^= bit;
        box[b] ^= bit;
    }
    return false;
}
void solveSudoku(char[][] a) {
    row = new int[9];
    col = new int[9];
    box = new int[9];
    empty = new ArrayList<>();
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++)
            if (a[r][c] == '.')
                empty.add(new int[] {r, c});
            else {
                int bit = 1 << (a[r][c] - '1');
                row[r] |= bit;
                col[c] |= bit;
                box[r / 3 * 3 + c / 3] |= bit;
            }
    dfs(a, 0);
}`,
      javascript: `function solveSudoku(a) {
    const row = Array(9).fill(0), col = Array(9).fill(0), box = Array(9).fill(0), empty = [];
    for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
            if (a[r][c] === '.')
                empty.push([r, c]);
            else {
                const bit = 1 << (Number(a[r][c]) - 1);
                row[r] |= bit;
                col[c] |= bit;
                box[Math.floor(r / 3) * 3 + Math.floor(c / 3)] |= bit;
            }
    function dfs(i) {
        if (i === empty.length)
            return true;
        const [r, c] = empty[i], b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        for (let d = 0; d < 9; d++) {
            const bit = 1 << d;
            if ((row[r] | col[c] | box[b]) & bit)
                continue;
            a[r][c] = String(d + 1);
            row[r] ^= bit;
            col[c] ^= bit;
            box[b] ^= bit;
            if (dfs(i + 1))
                return true;
            a[r][c] = '.';
            row[r] ^= bit;
            col[c] ^= bit;
            box[b] ^= bit;
        }
        return false;
    }
    dfs(0);
}`,
    } },
  ],
  pitfalls: ['填錯後要把棋盤與遮罩都恢復。', '3×3 宮索引是 floor(r/3)*3+floor(c/3)。', '使用的是字元，C 的數字轉字元要加上字元 1。'],
  check: { kind: 'fn', fn: 'solveSudoku', inplace: 0, cases: [{ args: [B], out: DONE }] },
}
