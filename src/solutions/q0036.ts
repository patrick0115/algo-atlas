import { range } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 36. Valid Sudoku

const ROWS = [
  '53..7....',
  '6..195...',
  '398....6.', // (2,0) 的 3 和 (0,1) 的 3 在同一宮 → 不合法
  '8...6...3',
  '4..8.3..1',
  '7...2...6',
  '.6....28.',
  '...419..5',
  '....8..79',
]
const B = ROWS.map((r) => r.split(''))
const boxOf = (r: number, c: number) => Math.floor(r / 3) * 3 + Math.floor(c / 3)
const rowCells = (r: number): Cell[] => range(0, 8).map((c) => [r, c])
const colCells = (c: number): Cell[] => range(0, 8).map((r) => [r, c])
const boxCells = (b: number): Cell[] => range(0, 8).map((k) => [Math.floor(b / 3) * 3 + Math.floor(k / 3), (b % 3) * 3 + (k % 3)])

function board(marks: GridViewData['marks'] = {}, label = 'board(同一宮 = 同一個 3×3 區塊)'): GridViewData {
  return { kind: 'grid', label, cells: B.map((r) => r.map((v) => (v === '.' ? '' : v))), rowLabels: range(0, 8).map(String), colLabels: range(0, 8).map(String), marks }
}

function threePassFig(): FigStep[] {
  return [
    { note: '數獨要檢查三種「單位」:9 列、9 行、9 宮。每個單位裡 1~9 不能重複(空格不管)', views: [board()] },
    { note: '先檢查列。第 0 列有 5、3、7,沒有重複 ✓', views: [board({ path: rowCells(0) })] },
    { note: '第 2 列有 3、9、8、6,沒有重複 ✓。9 列全部檢查完都 OK', views: [board({ path: rowCells(2) })] },
    { note: '再檢查行。第 0 行有 5、6、3、8、4、7,沒有重複 ✓。9 行全部 OK', views: [board({ path: colCells(0) })] },
    { note: '最後檢查宮。第 0 宮(左上)有 5、3、6、3、9、8 —— 3 出現兩次 ✗', views: [board({ path: boxCells(0), cmp: [[0, 1], [2, 0]] })] },
    { note: '回傳 false。注意這個衝突只在「宮」才抓得到:列和行都沒有重複', views: [board({ cmp: [[0, 1], [2, 0]] })] },
  ]
}

function onePassFig(mode: 'set' | 'bits'): FigStep[] {
  const rows = Array.from({ length: 9 }, () => new Set<string>())
  const cols = Array.from({ length: 9 }, () => new Set<string>())
  const boxes = Array.from({ length: 9 }, () => new Set<string>())
  const show = (s: Set<string>) => (mode === 'set' ? (s.size ? [...s].sort().join(' ') : '∅') : bits(s))
  const out: FigStep[] = [
    {
      note: mode === 'set' ? '準備 9 個列 set、9 個行 set、9 個宮 set。由左到右、由上到下走過每一格,一次檢查三個 set' : '和 set 同一個想法,但每個單位只用一個整數:第 d 個 bit 是 1 代表數字 d 已經出現過',
      views: [board()],
    },
  ]
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = B[r][c]
      if (v === '.') continue
      const b = boxOf(r, c)
      const hit = rows[r].has(v) ? `列 ${r}` : cols[c].has(v) ? `行 ${c}` : boxes[b].has(v) ? `宮 ${b}` : ''
      const hitKey = rows[r].has(v) ? `rows[${r}]` : cols[c].has(v) ? `cols[${c}]` : `boxes[${b}]`
      // 衝突的另一格:掃描順序在前、值相同、同列 / 同行 / 同宮
      const other = range(0, r * 9 + c - 1)
        .map((k): Cell => [Math.floor(k / 9), k % 9])
        .find(([rr, cc]) => B[rr][cc] === v && (rr === r || cc === c || boxOf(rr, cc) === b))
      const views = (hl: string[]) => [
        board({ path: boxCells(b), hl: [[r, c]], ...(hit && other ? { cmp: [other] } : {}) }),
        kv(
          [
            [`rows[${r}]`, show(rows[r])],
            [`cols[${c}]`, show(cols[c])],
            [`boxes[${b}]`, show(boxes[b])],
          ],
          mode === 'set' ? '這一格要查的三個 set' : '這一格要查的三個 bitmask(右邊是 bit 1,左邊是 bit 9)',
          hl,
        ),
      ]
      if (hit) {
        out.push({ note: `(${r},${c}) = ${v},${mode === 'set' ? `${hit} 的 set 裡已經有 ${v}` : `${hit} 的第 ${v} 個 bit 已經是 1`} → 重複,回傳 false`, views: views([hitKey]) })
        return out
      }
      rows[r].add(v)
      cols[c].add(v)
      boxes[b].add(v)
      out.push({
        note: `(${r},${c}) = ${v},在第 ${b} 宮(${Math.floor(r / 3)}·3 + ${Math.floor(c / 3)})。三個${mode === 'set' ? ' set 都沒有' : ' bitmask 的第 ' + v + ' 個 bit 都是 0'} → 記下來`,
        views: views([`rows[${r}]`, `cols[${c}]`, `boxes[${b}]`]),
      })
    }
  }
  return out
}

function bits(s: Set<string>): string {
  let m = 0
  for (const v of s) m |= 1 << Number(v)
  return (m >> 1).toString(2).padStart(9, '0')
}

export const q0036: Solution = {
  id: 36,
  plain: '檢查一個填到一半的數獨有沒有犯規:每一橫排、每一直排、每一個 3×3 小格子裡,同一個數字都不能出現兩次。不用把它解完。',
  statement:
    '給一個 9×9 的數獨盤面(已經填了一部分,空格是 `.`),判斷**目前填的數字**有沒有違反規則:每一列、每一行、每一個 3×3 宮裡,1~9 都不能重複。不用管這盤數獨解不解得出來。',
  examples: [
    { input: 'board = 標準的合法盤面', output: 'true' },
    { input: 'board = 左上宮出現兩個 8', output: 'false', note: '只要有一個單位重複就不合法' },
  ],
  constraints: [
    '盤面固定 9×9 → 不管怎麼寫都是常數時間,重點是**寫得乾淨、不漏檢查**',
    '格子只有 `1`~`9` 或 `.` → 每個單位只要記 9 種數字,可以用長度 10 的布林陣列,甚至一個整數的 bit',
  ],
  insight: [
    '規則有三條(列、行、宮),最直覺是**各掃一次**,每次用一個 set 檢查重複',
    '能不能只掃一次?可以:走到 `(r, c)` 時,同時查它所屬的列、行、宮三個 set',
    '唯一要想的是「`(r, c)` 在第幾宮」:宮的列號 `r / 3`、行號 `c / 3`,攤平成 `(r / 3) * 3 + c / 3`(整數除法)',
  ],
  approaches: [
    {
      name: '分三次檢查:列、行、宮',
      idea: '寫一個「檢查 9 個格子有沒有重複」的小函式,對 9 列、9 行、9 宮各呼叫一次。',
      steps: ['`ok(9 個格子)`:用 set 記看過的數字,空格跳過,重複就回傳 false', '對每一列呼叫 `ok`', '對每一行呼叫 `ok`', '對每一宮(左上角是 `(3i, 3j)`)呼叫 `ok`'],
      figure: { title: '左上宮有兩個 3 的盤面', steps: threePassFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: 'n = 9。每一格會被看 3 次(列、行、宮各一次),共 3n² 次;同時只開一個 set,最多 n 個數。盤面固定,所以實際上是 O(1)。' },
      verdict: '最容易想、最不容易寫錯。面試時可以先講這個,再說「可以合成一次掃描」。',
      code: {
        python: `def isValidSudoku(board):
    def ok(cells):
        seen = set()
        for v in cells:
            if v == '.':
                continue
            if v in seen:
                return False
            seen.add(v)
        return True

    for i in range(9):
        if not ok(board[i]):                                # 第 i 列
            return False
        if not ok([board[r][i] for r in range(9)]):         # 第 i 行
            return False
    for br in range(0, 9, 3):                               # 每一宮的左上角
        for bc in range(0, 9, 3):
            box = [board[r][c] for r in range(br, br + 3) for c in range(bc, bc + 3)]
            if not ok(box):
                return False
    return True`,
        c: `bool isValidSudoku(char **board, int boardSize, int *boardColSize) {
    bool seen[10];
    for (int i = 0; i < 9; i++) {
        memset(seen, 0, sizeof(seen));                       // 第 i 列
        for (int c = 0; c < 9; c++) {
            if (board[i][c] == '.') continue;
            int d = board[i][c] - '0';
            if (seen[d]) return false;
            seen[d] = true;
        }
        memset(seen, 0, sizeof(seen));                       // 第 i 行
        for (int r = 0; r < 9; r++) {
            if (board[r][i] == '.') continue;
            int d = board[r][i] - '0';
            if (seen[d]) return false;
            seen[d] = true;
        }
        memset(seen, 0, sizeof(seen));                       // 第 i 宮
        for (int k = 0; k < 9; k++) {
            int r = i / 3 * 3 + k / 3, c = i % 3 * 3 + k % 3;
            if (board[r][c] == '.') continue;
            int d = board[r][c] - '0';
            if (seen[d]) return false;
            seen[d] = true;
        }
    }
    return true;
}`,
        cpp: `bool isValidSudoku(vector<vector<char>>& board) {
    // 第 i 個單位的第 k 格在哪:kind 0 = 列、1 = 行、2 = 宮
    auto cell = [&](int kind, int i, int k) -> char {
        if (kind == 0) return board[i][k];
        if (kind == 1) return board[k][i];
        return board[i / 3 * 3 + k / 3][i % 3 * 3 + k % 3];
    };
    for (int kind = 0; kind < 3; kind++)
        for (int i = 0; i < 9; i++) {
            bool seen[10] = {false};
            for (int k = 0; k < 9; k++) {
                char v = cell(kind, i, k);
                if (v == '.') continue;
                if (seen[v - '0']) return false;
                seen[v - '0'] = true;
            }
        }
    return true;
}`,
        java: `boolean isValidSudoku(char[][] board) {
    for (int kind = 0; kind < 3; kind++)          // 0 = 列、1 = 行、2 = 宮
        for (int i = 0; i < 9; i++) {
            boolean[] seen = new boolean[10];
            for (int k = 0; k < 9; k++) {
                char v = kind == 0 ? board[i][k]
                       : kind == 1 ? board[k][i]
                       : board[i / 3 * 3 + k / 3][i % 3 * 3 + k % 3];
                if (v == '.') continue;
                if (seen[v - '0']) return false;
                seen[v - '0'] = true;
            }
        }
    return true;
}`,
        javascript: `function isValidSudoku(board) {
  const ok = (cells) => {
    const seen = new Set();
    for (const v of cells) {
      if (v === '.') continue;
      if (seen.has(v)) return false;
      seen.add(v);
    }
    return true;
  };
  for (let i = 0; i < 9; i++) {
    const row = board[i];
    const col = board.map((r) => r[i]);
    const box = [];
    for (let k = 0; k < 9; k++) box.push(board[Math.floor(i / 3) * 3 + Math.floor(k / 3)][(i % 3) * 3 + (k % 3)]);
    if (!ok(row) || !ok(col) || !ok(box)) return false;
  }
  return true;
}`,
      },
    },
    {
      name: '一次掃描:27 個 set',
      idea: '開 9 個列 set、9 個行 set、9 個宮 set。每一格只看一次,同時查、同時記三個 set。',
      steps: ['`rows`、`cols`、`boxes` 各 9 個空 set', '走過每一格 `(r, c)`,空格跳過', '`b = (r / 3) * 3 + c / 3`', '`v` 已經在 `rows[r]`、`cols[c]` 或 `boxes[b]` 任何一個 → false', '否則三個都加進 `v`'],
      figure: { title: '左上宮有兩個 3 的盤面(灰底 = 這一格所在的宮)', steps: onePassFig('set') },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每一格只看一次;27 個 set 總共最多存 3n² 個數。n = 9,實際上是 O(1)。' },
      verdict: '最常見的標準寫法,一次掃完、程式短。數字只有 1~9,set 可以換成 `bool[9][10]` 陣列,更快。',
      code: {
        python: `def isValidSudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == '.':
                continue
            b = (r // 3) * 3 + c // 3
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[b].add(v)
    return True`,
        c: `bool isValidSudoku(char **board, int boardSize, int *boardColSize) {
    bool rows[9][10] = {0}, cols[9][10] = {0}, boxes[9][10] = {0};   // 數字只有 1~9,用布林陣列當 set
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) {
            if (board[r][c] == '.') continue;
            int d = board[r][c] - '0';
            int b = r / 3 * 3 + c / 3;
            if (rows[r][d] || cols[c][d] || boxes[b][d]) return false;
            rows[r][d] = cols[c][d] = boxes[b][d] = true;
        }
    return true;
}`,
        cpp: `bool isValidSudoku(vector<vector<char>>& board) {
    vector<unordered_set<char>> rows(9), cols(9), boxes(9);
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) {
            char v = board[r][c];
            if (v == '.') continue;
            int b = r / 3 * 3 + c / 3;
            if (rows[r].count(v) || cols[c].count(v) || boxes[b].count(v)) return false;
            rows[r].insert(v);
            cols[c].insert(v);
            boxes[b].insert(v);
        }
    return true;
}`,
        java: `boolean isValidSudoku(char[][] board) {
    List<Set<Character>> rows = new ArrayList<>(), cols = new ArrayList<>(), boxes = new ArrayList<>();
    for (int i = 0; i < 9; i++) {
        rows.add(new HashSet<>());
        cols.add(new HashSet<>());
        boxes.add(new HashSet<>());
    }
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) {
            char v = board[r][c];
            if (v == '.') continue;
            int b = r / 3 * 3 + c / 3;
            // add 回傳 false 代表已經存在
            if (!rows.get(r).add(v) || !cols.get(c).add(v) || !boxes.get(b).add(v)) return false;
        }
    return true;
}`,
        javascript: `function isValidSudoku(board) {
  const mk = () => Array.from({ length: 9 }, () => new Set());
  const rows = mk(), cols = mk(), boxes = mk();
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v === '.') continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) return false;
      rows[r].add(v);
      cols[c].add(v);
      boxes[b].add(v);
    }
  return true;
}`,
      },
    },
    {
      name: '一次掃描:位元遮罩',
      idea: '每個單位只用一個整數當 set:數字 `d` 出現過,就把第 `d` 個 bit 設成 1。查詢用 `mask & (1 << d)`,記錄用 `mask |= 1 << d`。',
      steps: ['`rows`、`cols`、`boxes` 各 9 個整數,初始 0', '走過每一格,`bit = 1 << d`', '`rows[r] & bit` 或 `cols[c] & bit` 或 `boxes[b] & bit` 不是 0 → false', '否則三個都 `|= bit`'],
      figure: { title: '左上宮有兩個 3 的盤面', steps: onePassFig('bits') },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每一格看一次;只用 27 個整數,每個整數 O(1)。比 set 版少很多記憶體和 hash 計算。' },
      verdict: '最省、最快,也是[[p:bit-manipulation]]的入門應用。37. Sudoku Solver 回溯時用 bitmask 會快很多。',
      code: {
        python: `def isValidSudoku(board):
    rows = [0] * 9
    cols = [0] * 9
    boxes = [0] * 9
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == '.':
                continue
            bit = 1 << int(v)
            b = (r // 3) * 3 + c // 3
            if rows[r] & bit or cols[c] & bit or boxes[b] & bit:
                return False
            rows[r] |= bit
            cols[c] |= bit
            boxes[b] |= bit
    return True`,
        c: `bool isValidSudoku(char **board, int boardSize, int *boardColSize) {
    int rows[9] = {0}, cols[9] = {0}, boxes[9] = {0};
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) {
            if (board[r][c] == '.') continue;
            int bit = 1 << (board[r][c] - '0');
            int b = r / 3 * 3 + c / 3;
            if ((rows[r] | cols[c] | boxes[b]) & bit) return false;
            rows[r] |= bit;
            cols[c] |= bit;
            boxes[b] |= bit;
        }
    return true;
}`,
        cpp: `bool isValidSudoku(vector<vector<char>>& board) {
    int rows[9] = {0}, cols[9] = {0}, boxes[9] = {0};
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) {
            if (board[r][c] == '.') continue;
            int bit = 1 << (board[r][c] - '0');
            int b = r / 3 * 3 + c / 3;
            if ((rows[r] | cols[c] | boxes[b]) & bit) return false;
            rows[r] |= bit;
            cols[c] |= bit;
            boxes[b] |= bit;
        }
    return true;
}`,
        java: `boolean isValidSudoku(char[][] board) {
    int[] rows = new int[9], cols = new int[9], boxes = new int[9];
    for (int r = 0; r < 9; r++)
        for (int c = 0; c < 9; c++) {
            if (board[r][c] == '.') continue;
            int bit = 1 << (board[r][c] - '0');
            int b = r / 3 * 3 + c / 3;
            if (((rows[r] | cols[c] | boxes[b]) & bit) != 0) return false;
            rows[r] |= bit;
            cols[c] |= bit;
            boxes[b] |= bit;
        }
    return true;
}`,
        javascript: `function isValidSudoku(board) {
  const rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === '.') continue;
      const bit = 1 << Number(board[r][c]);
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if ((rows[r] | cols[c] | boxes[b]) & bit) return false;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
    }
  return true;
}`,
      },
    },
  ],
  pitfalls: [
    '宮的編號算錯:要用整數除法 `(r / 3) * 3 + c / 3`。Python 要寫 `//`,JavaScript 要 `Math.floor`,不然會得到小數',
    '忘了檢查宮 —— 只檢查列和行,上面圖示那種盤面會誤判成合法',
    '把 `.` 也當成數字加進 set,第二個空格就會被判重複',
    '題目只問「目前合不合法」,不需要解數獨;盤面解不出來也可能回傳 true',
    'Java 的 `(mask & bit) != 0` 要加括號:`&` 的優先序比 `!=` 低',
  ],
  followUp: [
    { q: '如果盤面是 n²×n²(例如 16×16)?', a: '同樣三組檢查,宮的邊長變成 n:`(r / n) * n + c / n`。時間 O(n⁴)(盤面格數),空間 O(n⁴)。' },
    { q: '如果要真的把數獨解出來?', a: '37. Sudoku Solver:[[p:backtracking]],每一格試 1~9,用這題的 bitmask 快速判斷能不能放。' },
  ],
  check: {
    kind: 'fn',
    fn: 'isValidSudoku',
    cases: [
      {
        args: [['53..7....', '6..195...', '.98....6.', '8...6...3', '4..8.3..1', '7...2...6', '.6....28.', '...419..5', '....8..79'].map((r) => r.split(''))],
        out: true,
      },
      { args: [ROWS.map((r) => r.split(''))], out: false },
      {
        args: [['83..7....', '6..195...', '.98....6.', '8...6...3', '4..8.3..1', '7...2...6', '.6....28.', '...419..5', '....8..79'].map((r) => r.split(''))],
        out: false,
      },
      { args: [Array.from({ length: 9 }, () => '.........'.split(''))], out: true },
      { args: [['5....5...', ...Array.from({ length: 8 }, () => '.........')].map((r) => r.split(''))], out: false },
    ],
  },
}
