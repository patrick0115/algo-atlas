import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 51. N-Queens

const N = 4

function board(qs: number[], label: string, hl: Cell[] = []): GridViewData {
  const cells = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (qs[r] === c ? '♛' : '')))
  const attacked: Cell[] = []
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (qs[r] === c) continue
      if (qs.some((qc, qr) => qc === c || qr - qc === r - c || qr + qc === r + c)) attacked.push([r, c])
    }
  return { kind: 'grid', label, cells, marks: { wall: attacked, done: qs.map((c, r) => [r, c] as Cell), hl } }
}

function btFig(): FigStep[] {
  const out: FigStep[] = [{ note: '一列放一個皇后(每列一定剛好一個)。逐列決定放在哪一行;放之前檢查同一行、兩條斜線有沒有被佔', views: [board([], '空棋盤')] }]
  const qs: number[] = []
  const cols = new Set<number>()
  const d1 = new Set<number>()
  const d2 = new Set<number>()
  let found = 0
  const go = (r: number) => {
    if (found >= 1) return
    if (r === N) {
      found++
      out.push({ note: `四列都放好了 → 找到一組解`, views: [board([...qs], '解')] })
      return
    }
    for (let c = 0; c < N; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue
      qs.push(c)
      cols.add(c)
      d1.add(r - c)
      d2.add(r + c)
      out.push({ note: `第 ${r} 列放在第 ${c} 行(斜線格 = 被攻擊,不能再放)`, views: [board([...qs], `第 ${r} 列`, [[r, c]])] })
      go(r + 1)
      if (found >= 1) return
      qs.pop()
      cols.delete(c)
      d1.delete(r - c)
      d2.delete(r + c)
      out.push({ note: `第 ${r} 列放第 ${c} 行,後面怎麼放都走不下去 → 回溯:拿掉它,改試下一行`, views: [board([...qs], '回溯')] })
    }
  }
  go(0)
  return out
}

function diagFig(): FigStep[] {
  const g = (f: (r: number, c: number) => number, label: string): GridViewData => ({ kind: 'grid', label, cells: Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => f(r, c))), marks: { hl: [[0, 1], [1, 2], [2, 3]] } })
  return [
    { note: '同一條「↘」斜線上的格子,r − c 都一樣;同一條「↙」斜線上的格子,r + c 都一樣。所以用三個集合(行、r − c、r + c)就能 O(1) 判斷', views: [g((r, c) => r - c, 'r − c(↘ 斜線編號)')] },
    { note: '↙ 斜線用 r + c', views: [g((r, c) => r + c, 'r + c(↙ 斜線編號)')] },
  ]
}

const SOL4 = [
  ['.Q..', '...Q', 'Q...', '..Q.'],
  ['..Q.', 'Q...', '...Q', '.Q..'],
]

export const q0051: Solution = {
  id: 51,
  plain: '在 n × n 的西洋棋盤上放 n 個皇后,讓她們**互相吃不到**(皇后可以直走、橫走、斜走任意格)。列出所有放法。',
  statement: '給整數 `n`,回傳所有不同的 n 皇后放置方案。每個方案用 n 個字串表示,`Q` 是皇后、`.` 是空格。',
  examples: [
    { input: 'n = 4', output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
    { input: 'n = 1', output: '[["Q"]]' },
  ],
  constraints: ['`1 ≤ n ≤ 9`'],
  insight: [
    '每一列剛好放一個皇后 → 逐列決定「這一列放第幾行」,這就是回溯的決策樹',
    '放之前檢查:同一行、同一條 ↘ 斜線(r − c 相同)、同一條 ↙ 斜線(r + c 相同)有沒有皇后',
    '用三個集合記錄被佔用的行和斜線,檢查是 O(1);回溯時記得移除',
  ],
  approaches: [
    {
      name: '回溯 + 每次掃描檢查',
      idea: '逐列放皇后,放之前往上掃前面每一列的皇后,看是否同行或同斜線。',
      steps: ['`queens[r]` = 第 r 列皇后的行', '`ok(r, c)`:對每個 `pr < r`,`queens[pr] == c` 或 `|queens[pr] − c| == r − pr` → 衝突', '合法就放、遞迴下一列、拿掉'],
      figure: { title: `n = ${N}`, steps: btFig() },
      complexity: { time: 'O(n! · n)', space: 'O(n)', why: '第 r 列最多 n − r 個選擇;每次檢查 O(n)。' },
      verdict: '最直覺,n ≤ 9 完全夠用。',
      code: {
        python: `def solveNQueens(n):
    res, queens = [], []                      # queens[r] = 第 r 列皇后在第幾行

    def ok(r, c):
        for pr, pc in enumerate(queens):
            if pc == c or abs(pc - c) == r - pr:   # 同行或同斜線
                return False
        return True

    def bt(r):
        if r == n:
            res.append(['.' * c + 'Q' + '.' * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if ok(r, c):
                queens.append(c)
                bt(r + 1)
                queens.pop()

    bt(0)
    return res`,
        c: `static int Q[9], NN, CNT, CAP;
static char ***RES;

static bool ok(int r, int c) {
    for (int pr = 0; pr < r; pr++)
        if (Q[pr] == c || abs(Q[pr] - c) == r - pr) return false;
    return true;
}

static void bt(int r) {
    if (r == NN) {
        if (CNT == CAP) { CAP *= 2; RES = realloc(RES, CAP * sizeof(char **)); }
        char **b = malloc(NN * sizeof(char *));
        for (int i = 0; i < NN; i++) {
            b[i] = malloc(NN + 1);
            memset(b[i], '.', NN);
            b[i][Q[i]] = 'Q';
            b[i][NN] = '\\0';
        }
        RES[CNT++] = b;
        return;
    }
    for (int c = 0; c < NN; c++)
        if (ok(r, c)) { Q[r] = c; bt(r + 1); }
}

char ***solveNQueens(int n, int *returnSize, int **returnColumnSizes) {
    NN = n; CNT = 0; CAP = 16;
    RES = malloc(CAP * sizeof(char **));
    bt(0);
    *returnSize = CNT;
    *returnColumnSizes = malloc((CNT + 1) * sizeof(int));
    for (int i = 0; i < CNT; i++) (*returnColumnSizes)[i] = n;
    return RES;
}`,
        cpp: `vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> res;
    vector<int> q;
    auto ok = [&](int r, int c) {
        for (int pr = 0; pr < r; pr++)
            if (q[pr] == c || abs(q[pr] - c) == r - pr) return false;
        return true;
    };
    function<void(int)> bt = [&](int r) {
        if (r == n) {
            vector<string> b(n, string(n, '.'));
            for (int i = 0; i < n; i++) b[i][q[i]] = 'Q';
            res.push_back(b);
            return;
        }
        for (int c = 0; c < n; c++)
            if (ok(r, c)) { q.push_back(c); bt(r + 1); q.pop_back(); }
    };
    bt(0);
    return res;
}`,
        java: `private List<List<String>> res;
private int[] q;
private int n;

List<List<String>> solveNQueens(int n) {
    this.n = n;
    res = new ArrayList<>();
    q = new int[n];
    bt(0);
    return res;
}

private boolean ok(int r, int c) {
    for (int pr = 0; pr < r; pr++)
        if (q[pr] == c || Math.abs(q[pr] - c) == r - pr) return false;
    return true;
}

private void bt(int r) {
    if (r == n) {
        List<String> b = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            char[] row = new char[n];
            Arrays.fill(row, '.');
            row[q[i]] = 'Q';
            b.add(new String(row));
        }
        res.add(b);
        return;
    }
    for (int c = 0; c < n; c++)
        if (ok(r, c)) { q[r] = c; bt(r + 1); }
}`,
        javascript: `function solveNQueens(n) {
  const res = [], q = [];
  const ok = (r, c) => q.every((pc, pr) => pc !== c && Math.abs(pc - c) !== r - pr);
  const bt = (r) => {
    if (r === n) {
      res.push(q.map((c) => '.'.repeat(c) + 'Q' + '.'.repeat(n - c - 1)));
      return;
    }
    for (let c = 0; c < n; c++) if (ok(r, c)) { q.push(c); bt(r + 1); q.pop(); }
  };
  bt(0);
  return res;
}`,
      },
    },
    {
      name: '回溯 + 三個集合(行、兩條斜線)',
      idea: '`cols`、`diag1`(r − c)、`diag2`(r + c)記錄被佔的。放之前 O(1) 檢查,放了加入、回溯時移除。',
      steps: ['`if c in cols or r − c in diag1 or r + c in diag2`:跳過', '加入三個集合、記下 `queens[r] = c`', '遞迴 `bt(r + 1)`', '從三個集合移除'],
      figure: { title: '用 r − c 和 r + c 表示斜線', steps: diagFig() },
      complexity: { time: 'O(n!)', space: 'O(n)', why: '每次檢查 O(1);決策樹最多 n! 個葉子。' },
      verdict: '最推薦,[[p:backtracking]]的經典題。用位元(bitmask)代替集合還能更快。',
      code: {
        python: `def solveNQueens(n):
    res, queens = [], []
    cols, d1, d2 = set(), set(), set()

    def bt(r):
        if r == n:
            res.append(['.' * c + 'Q' + '.' * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue                      # 被攻擊:剪枝
            queens.append(c); cols.add(c); d1.add(r - c); d2.add(r + c)
            bt(r + 1)
            queens.pop(); cols.remove(c); d1.remove(r - c); d2.remove(r + c)

    bt(0)
    return res`,
        c: `static int Q[9], NN, CNT, CAP;
static bool COL[9], D1[17], D2[17];
static char ***RES;

static void bt(int r) {
    if (r == NN) {
        if (CNT == CAP) { CAP *= 2; RES = realloc(RES, CAP * sizeof(char **)); }
        char **b = malloc(NN * sizeof(char *));
        for (int i = 0; i < NN; i++) {
            b[i] = malloc(NN + 1);
            memset(b[i], '.', NN);
            b[i][Q[i]] = 'Q';
            b[i][NN] = '\\0';
        }
        RES[CNT++] = b;
        return;
    }
    for (int c = 0; c < NN; c++) {
        if (COL[c] || D1[r - c + NN - 1] || D2[r + c]) continue;   // r − c 可能是負的,平移 n − 1
        Q[r] = c;
        COL[c] = D1[r - c + NN - 1] = D2[r + c] = true;
        bt(r + 1);
        COL[c] = D1[r - c + NN - 1] = D2[r + c] = false;
    }
}

char ***solveNQueens(int n, int *returnSize, int **returnColumnSizes) {
    NN = n; CNT = 0; CAP = 16;
    memset(COL, 0, sizeof(COL)); memset(D1, 0, sizeof(D1)); memset(D2, 0, sizeof(D2));
    RES = malloc(CAP * sizeof(char **));
    bt(0);
    *returnSize = CNT;
    *returnColumnSizes = malloc((CNT + 1) * sizeof(int));
    for (int i = 0; i < CNT; i++) (*returnColumnSizes)[i] = n;
    return RES;
}`,
        cpp: `vector<vector<string>> solveNQueens(int n) {
    vector<vector<string>> res;
    vector<string> b(n, string(n, '.'));
    vector<bool> col(n), d1(2 * n), d2(2 * n);
    function<void(int)> bt = [&](int r) {
        if (r == n) { res.push_back(b); return; }
        for (int c = 0; c < n; c++) {
            if (col[c] || d1[r - c + n] || d2[r + c]) continue;
            b[r][c] = 'Q';
            col[c] = d1[r - c + n] = d2[r + c] = true;
            bt(r + 1);
            col[c] = d1[r - c + n] = d2[r + c] = false;
            b[r][c] = '.';
        }
    };
    bt(0);
    return res;
}`,
        java: `private List<List<String>> res;
private char[][] b;
private boolean[] col, d1, d2;
private int n;

List<List<String>> solveNQueens(int n) {
    this.n = n;
    res = new ArrayList<>();
    b = new char[n][n];
    for (char[] row : b) Arrays.fill(row, '.');
    col = new boolean[n]; d1 = new boolean[2 * n]; d2 = new boolean[2 * n];
    bt(0);
    return res;
}

private void bt(int r) {
    if (r == n) {
        List<String> s = new ArrayList<>();
        for (char[] row : b) s.add(new String(row));
        res.add(s);
        return;
    }
    for (int c = 0; c < n; c++) {
        if (col[c] || d1[r - c + n] || d2[r + c]) continue;
        b[r][c] = 'Q';
        col[c] = d1[r - c + n] = d2[r + c] = true;
        bt(r + 1);
        col[c] = d1[r - c + n] = d2[r + c] = false;
        b[r][c] = '.';
    }
}`,
        javascript: `function solveNQueens(n) {
  const res = [], b = Array.from({ length: n }, () => new Array(n).fill('.'));
  const col = new Set(), d1 = new Set(), d2 = new Set();
  const bt = (r) => {
    if (r === n) { res.push(b.map((row) => row.join(''))); return; }
    for (let c = 0; c < n; c++) {
      if (col.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      b[r][c] = 'Q'; col.add(c); d1.add(r - c); d2.add(r + c);
      bt(r + 1);
      b[r][c] = '.'; col.delete(c); d1.delete(r - c); d2.delete(r + c);
    }
  };
  bt(0);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '只檢查同一行、忘了斜線',
    '斜線只檢查一個方向(↘ 或 ↙):兩條都要',
    '陣列版本用 `r − c` 當索引:會是負數,要加上 n − 1 平移',
  ],
  followUp: [{ q: '只要數有幾種解?', a: '52. N-Queens II:同樣的回溯,只計數不建棋盤;用位元表示三個集合會非常快。' }],
  check: {
    kind: 'fn',
    fn: 'solveNQueens',
    compare: 'sorted',
    cases: [
      { args: [4], out: SOL4 },
      { args: [1], out: [['Q']] },
      { args: [2], out: [] },
      { args: [3], out: [] },
      {
        args: [5],
        out: [
          ['Q....', '..Q..', '....Q', '.Q...', '...Q.'],
          ['Q....', '...Q.', '.Q...', '....Q', '..Q..'],
          ['.Q...', '...Q.', 'Q....', '..Q..', '....Q'],
          ['.Q...', '....Q', '..Q..', 'Q....', '...Q.'],
          ['..Q..', 'Q....', '...Q.', '.Q...', '....Q'],
          ['..Q..', '....Q', '.Q...', '...Q.', 'Q....'],
          ['...Q.', 'Q....', '..Q..', '....Q', '.Q...'],
          ['...Q.', '.Q...', '....Q', '..Q..', 'Q....'],
          ['....Q', '.Q...', '...Q.', 'Q....', '..Q..'],
          ['....Q', '..Q..', 'Q....', '...Q.', '.Q...'],
        ],
      },
    ],
  },
}
