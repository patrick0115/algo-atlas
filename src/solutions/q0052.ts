import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 52. N-Queens II

const N = 4

function board(qs: number[], label: string): GridViewData {
  const cells = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (qs[r] === c ? '♛' : '')))
  const attacked: Cell[] = []
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (qs[r] === c) continue
      if (qs.some((qc, qr) => qc === c || qr - qc === r - c || qr + qc === r + c)) attacked.push([r, c])
    }
  return { kind: 'grid', label, cells, marks: { wall: attacked, done: qs.map((c, r) => [r, c] as Cell) } }
}

function setFig(): FigStep[] {
  return [
    { note: '和 [51](#/q/51) 一模一樣的回溯,只是不用畫出棋盤,找到一組就計數 +1。逐列放皇后,用三個集合記錄被佔的「行」「↘ 斜線 r − c」「↙ 斜線 r + c」', views: [board([], '空棋盤')] },
    { note: '第 0 列放第 1 行 → 第 1 列只能放第 3 行 → 第 2 列放第 0 行 → 第 3 列放第 2 行:第一組解', views: [board([1, 3, 0, 2], '解 1')] },
    { note: '繼續回溯,第 0 列放第 2 行會得到鏡像的第二組解。4 皇后共 2 組', views: [board([2, 0, 3, 1], '解 2'), arr([2], { label: '答案', done: [0] })] },
  ]
}

function bitFig(): FigStep[] {
  return [
    { note: '位元版:cols、d1、d2 都改成 n 位的整數。往下一列時,↘ 斜線的佔用整體左移一格、↙ 的右移一格', views: [arr(['0010', '0100', '0001'], { label: 'cols / d1 / d2(放了第 0 列第 1 行之後,下一列看到的)' })] },
    { note: '`avail = ~(cols | d1 | d2) & full` 就是這一列能放的格子;`avail & −avail` 取最低位的 1 逐一嘗試', views: [arr(['1', '0', '0', '0'], { label: '第 1 列 avail(只剩第 3 行)', done: [0] })] },
  ]
}

export const q0052: Solution = {
  id: 52,
  plain: '在 n × n 的西洋棋盤上放 n 個皇后,讓她們彼此都吃不到(同列、同行、同斜線都不行)。總共有幾種放法?',
  statement: '給整數 n,回傳 **n 皇后問題**不同解的個數:在 n × n 棋盤上放置 n 個皇后,任兩個不在同一列、同一行或同一斜線上。',
  examples: [
    { input: 'n = 4', output: '2' },
    { input: 'n = 1', output: '1' },
  ],
  constraints: ['1 ≤ n ≤ 9'],
  insight: ['每一列剛好一個皇后 → 逐列決定行號', '同一條 ↘ 斜線 r − c 相同、↙ 斜線 r + c 相同', '只要計數不用輸出棋盤 → 可以改用位元運算加速'],
  approaches: [
    {
      name: '回溯 + 三個集合',
      idea: '`dfs(r)`:`r == n` → 計數 +1;否則每個 c 若 c、r − c、r + c 都沒被佔就放、遞迴、撤回。',
      steps: ['`cols, d1, d2 = set(), set(), set()`', '`dfs(r)`:`r == n` → `count += 1`', '`for c in range(n)`:三者皆未佔 → 加入、`dfs(r + 1)`、移除'],
      figure: { title: `n = ${N}`, steps: setFig() },
      complexity: { time: 'O(n!)', space: 'O(n)', why: '第 r 列最多 n − r 個可選位置;遞迴深度 n。' },
      verdict: '最推薦,[[p:backtracking]]的經典;和 51 只差在收答案的方式。',
      code: {
        python: `def totalNQueens(n):
    cols, d1, d2 = set(), set(), set()
    count = 0

    def dfs(r):
        nonlocal count
        if r == n:
            count += 1                        # 放滿 n 列 = 一組解
            return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c)
            dfs(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)

    dfs(0)
    return count`,
        c: `static bool cols[9], d1[17], d2[17];
static int N, cnt;

static void dfs(int r) {
    if (r == N) { cnt++; return; }
    for (int c = 0; c < N; c++) {
        if (cols[c] || d1[r - c + N - 1] || d2[r + c]) continue;
        cols[c] = d1[r - c + N - 1] = d2[r + c] = true;
        dfs(r + 1);
        cols[c] = d1[r - c + N - 1] = d2[r + c] = false;
    }
}

int totalNQueens(int n) {
    N = n; cnt = 0;
    memset(cols, 0, sizeof cols); memset(d1, 0, sizeof d1); memset(d2, 0, sizeof d2);
    dfs(0);
    return cnt;
}`,
        cpp: `int totalNQueens(int n) {
    vector<bool> cols(n), d1(2 * n), d2(2 * n);
    int cnt = 0;
    function<void(int)> dfs = [&](int r) {
        if (r == n) { cnt++; return; }
        for (int c = 0; c < n; c++) {
            if (cols[c] || d1[r - c + n] || d2[r + c]) continue;
            cols[c] = d1[r - c + n] = d2[r + c] = true;
            dfs(r + 1);
            cols[c] = d1[r - c + n] = d2[r + c] = false;
        }
    };
    dfs(0);
    return cnt;
}`,
        java: `int cnt;

int totalNQueens(int n) {
    cnt = 0;
    dfs(0, n, new boolean[n], new boolean[2 * n], new boolean[2 * n]);
    return cnt;
}

void dfs(int r, int n, boolean[] cols, boolean[] d1, boolean[] d2) {
    if (r == n) { cnt++; return; }
    for (int c = 0; c < n; c++) {
        if (cols[c] || d1[r - c + n] || d2[r + c]) continue;
        cols[c] = d1[r - c + n] = d2[r + c] = true;
        dfs(r + 1, n, cols, d1, d2);
        cols[c] = d1[r - c + n] = d2[r + c] = false;
    }
}`,
        javascript: `function totalNQueens(n) {
  const cols = new Set(), d1 = new Set(), d2 = new Set();
  let cnt = 0;
  const dfs = (r) => {
    if (r === n) {
      cnt++;
      return;
    }
    for (let c = 0; c < n; c++) {
      if (cols.has(c) || d1.has(r - c) || d2.has(r + c)) continue;
      cols.add(c); d1.add(r - c); d2.add(r + c);
      dfs(r + 1);
      cols.delete(c); d1.delete(r - c); d2.delete(r + c);
    }
  };
  dfs(0);
  return cnt;
}`,
      },
    },
    {
      name: '位元回溯',
      idea: '`dfs(cols, d1, d2)`:`avail = ~(cols | d1 | d2) & full`;逐一取最低位 p,遞迴 `dfs(cols|p, (d1|p) << 1, (d2|p) >> 1)`。',
      steps: ['`full = (1 << n) − 1`', '`cols == full` → 計數 +1', '`avail = ~(cols | d1 | d2) & full`', '`while avail`:`p = avail & −avail`、`avail −= p`、遞迴(斜線左移 / 右移)'],
      figure: { title: `n = ${N}`, steps: bitFig() },
      complexity: { time: 'O(n!)', space: 'O(n)', why: '同樣的搜尋樹,但每一步都是幾個位元運算。' },
      verdict: '常數小很多,是 N 皇后計數最快的寫法之一;[[p:bit-manipulation]]的漂亮應用。',
      code: {
        python: `def totalNQueens(n):
    full = (1 << n) - 1

    def dfs(cols, d1, d2):
        if cols == full:
            return 1
        cnt = 0
        avail = ~(cols | d1 | d2) & full      # 這一列還能放的格子
        while avail:
            p = avail & -avail                # 最低位的 1
            avail -= p
            cnt += dfs(cols | p, (d1 | p) << 1 & full, (d2 | p) >> 1)
        return cnt

    return dfs(0, 0, 0)`,
        c: `static int full;

static int dfs(int cols, int d1, int d2) {
    if (cols == full) return 1;
    int cnt = 0, avail = ~(cols | d1 | d2) & full;
    while (avail) {
        int p = avail & -avail;
        avail -= p;
        cnt += dfs(cols | p, ((d1 | p) << 1) & full, (d2 | p) >> 1);
    }
    return cnt;
}

int totalNQueens(int n) {
    full = (1 << n) - 1;
    return dfs(0, 0, 0);
}`,
        cpp: `int totalNQueens(int n) {
    int full = (1 << n) - 1;
    function<int(int, int, int)> dfs = [&](int cols, int d1, int d2) {
        if (cols == full) return 1;
        int cnt = 0, avail = ~(cols | d1 | d2) & full;
        while (avail) {
            int p = avail & -avail;
            avail -= p;
            cnt += dfs(cols | p, ((d1 | p) << 1) & full, (d2 | p) >> 1);
        }
        return cnt;
    };
    return dfs(0, 0, 0);
}`,
        java: `int full;

int totalNQueens(int n) {
    full = (1 << n) - 1;
    return dfs(0, 0, 0);
}

int dfs(int cols, int d1, int d2) {
    if (cols == full) return 1;
    int cnt = 0, avail = ~(cols | d1 | d2) & full;
    while (avail != 0) {
        int p = avail & -avail;
        avail -= p;
        cnt += dfs(cols | p, ((d1 | p) << 1) & full, (d2 | p) >> 1);
    }
    return cnt;
}`,
        javascript: `function totalNQueens(n) {
  const full = (1 << n) - 1;
  const dfs = (cols, d1, d2) => {
    if (cols === full) return 1;
    let cnt = 0, avail = ~(cols | d1 | d2) & full;
    while (avail) {
      const p = avail & -avail;
      avail -= p;
      cnt += dfs(cols | p, ((d1 | p) << 1) & full, (d2 | p) >> 1);
    }
    return cnt;
  };
  return dfs(0, 0, 0);
}`,
      },
    },
  ],
  pitfalls: ['斜線只檢查一條方向', 'r − c 可能是負數:用陣列時要加位移 n', '位元版左移後沒 `& full`:高位殘留雖不影響正確性,但容易讓人誤會'],
  check: {
    kind: 'fn',
    fn: 'totalNQueens',
    cases: [
      { args: [N], out: 2 },
      { args: [1], out: 1 },
      { args: [2], out: 0 },
      { args: [5], out: 10 },
      { args: [8], out: 92 },
      { args: [9], out: 352 },
    ],
  },
}
