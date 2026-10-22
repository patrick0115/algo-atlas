import type { Cell, GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 79. Word Search

const B = [
  ['A', 'B', 'C', 'E'],
  ['S', 'F', 'C', 'S'],
  ['A', 'D', 'E', 'E'],
]
const W = 'ABCCED'

function grid(marks: GridViewData['marks'] = {}): GridViewData {
  return { kind: 'grid', label: 'board', cells: B.map((r) => [...r]), marks }
}

function dfsFig(): FigStep[] {
  const out: FigStep[] = [{ note: `找 "${W}":從每一格當起點試試看。每走一步,只能往上下左右走到下一個字母,而且**同一格不能用兩次** —— 走過的格子先標記起來,退回來時再取消`, views: [grid()] }]
  const path: Cell[] = []
  const used = B.map((r) => r.map(() => false))
  const dfs = (r: number, c: number, k: number): boolean => {
    if (r < 0 || c < 0 || r >= B.length || c >= B[0].length || used[r][c] || B[r][c] !== W[k]) return false
    used[r][c] = true
    path.push([r, c])
    out.push({ note: `(${r},${c}) = ${B[r][c]},是第 ${k} 個字母 ✓${k === W.length - 1 ? ' → 整個單字都找到了!' : `,接著在四個方向找 "${W[k + 1]}"`}`, views: [grid({ path: [...path], hl: [[r, c]] })] })
    if (k === W.length - 1) return true
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) if (dfs(r + dr, c + dc, k + 1)) return true
    used[r][c] = false
    path.pop()
    out.push({ note: `(${r},${c}) 往四個方向都走不下去 → 退回來,取消標記`, views: [grid({ path: [...path], dim: [[r, c]] })] })
    return false
  }
  for (let r = 0; r < B.length; r++) for (let c = 0; c < B[0].length; c++) if (dfs(r, c, 0)) return out
  return out
}

function pruneFig(): FigStep[] {
  const need = new Map<string, number>()
  for (const ch of W) need.set(ch, (need.get(ch) ?? 0) + 1)
  const have = new Map<string, number>()
  for (const row of B) for (const ch of row) have.set(ch, (have.get(ch) ?? 0) + 1)
  return [
    { note: '剪枝一:先數字母。單字需要的某個字母,如果整個盤面都不夠,直接回傳 false,不用搜', views: [kv([...need].map(([k, v]) => [k, `需要 ${v}、盤面有 ${have.get(k) ?? 0}`]), '字母數量')] },
    { note: '剪枝二:如果單字**開頭**的字母在盤面上比**結尾**的多,就把單字反過來找 —— 起點變少,很多無用的搜尋一開始就被擋掉', views: [grid({ hl: B.flatMap((r, i) => r.flatMap((v, j) => (v === W[0] ? [[i, j] as Cell] : []))), cmp: B.flatMap((r, i) => r.flatMap((v, j) => (v === W[W.length - 1] ? [[i, j] as Cell] : []))) })] },
  ]
}

export const q0079: Solution = {
  id: 79,
  plain: '在一個字母格子盤上,找找看能不能「一筆畫」拼出一個單字:每次只能走到上下左右相鄰的格子,同一格不能重複使用。像拼字遊戲。',
  statement: '給一個 m×n 的字母網格 `board` 和單字 `word`,判斷 word 能不能由網格中**相鄰**(上下左右)的格子依序拼出來。同一格不能用兩次。',
  examples: [
    { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
    { input: '同上, word = "SEE"', output: 'true' },
    { input: '同上, word = "ABCB"', output: 'false', note: 'B 不能用兩次' },
  ],
  constraints: ['`m, n ≤ 6`,`word.length ≤ 15`', 'Follow-up:能不能加剪枝讓大盤面也很快?'],
  insight: [
    '每一格都可能是起點;從起點開始,每一步有最多 4 個方向可以試 → **網格上的 DFS / 回溯**',
    '「同一格不能用兩次」:走進一格時先標記,這條路試完退回來時**取消標記**(回溯的「撤銷選擇」),讓別的路徑還能用這一格',
    '最壞情況:m·n 個起點 × 每步 3 個方向(不能走回頭)× 單字長度 L → O(m·n·3ᴸ)',
  ],
  approaches: [
    {
      name: '每格當起點 + DFS 回溯',
      idea: '`dfs(r, c, k)`:這一格要對上 `word[k]`。超出邊界、走過了、字母不對 → false;k 是最後一個 → true;否則標記這格,往四個方向找 `k + 1`,最後取消標記。',
      steps: ['對每一格 `(r, c)`:`dfs(r, c, 0)` 成功就回傳 true', '`dfs`:不合法 → false;`k == len − 1` → true', '標記 `board[r][c] = "#"`(暫時改掉)', '四個方向任一成功 → true;最後把字母改回來'],
      figure: { title: `word = "${W}"`, steps: dfsFig() },
      complexity: { time: 'O(m · n · 3ᴸ)', space: 'O(L)', why: 'm·n 個起點,每一步最多 3 個新方向(不會走回來),深度 L。直接改 board 當標記,不需要另外的 visited。' },
      verdict: '標準解,[[p:backtracking]] + [[p:graph-traversal]]。「暫時改掉格子當作走過」再改回來,是網格回溯的常用寫法。',
      code: {
        python: `def exist(board, word):
    m, n = len(board), len(board[0])

    def dfs(r, c, k):
        if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != word[k]:
            return False
        if k == len(word) - 1:
            return True
        tmp, board[r][c] = board[r][c], '#'   # 標記成走過
        found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or
                 dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))
        board[r][c] = tmp                 # 退回來時取消標記
        return found

    return any(dfs(r, c, 0) for r in range(m) for c in range(n))`,
        c: `static char **B, *Wd;
static int M, N, L;

static bool dfs(int r, int c, int k) {
    if (r < 0 || c < 0 || r >= M || c >= N || B[r][c] != Wd[k]) return false;
    if (k == L - 1) return true;
    char t = B[r][c];
    B[r][c] = '#';
    bool ok = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    B[r][c] = t;
    return ok;
}

bool exist(char **board, int boardSize, int *boardColSize, char *word) {
    B = board; M = boardSize; N = boardColSize[0]; Wd = word; L = strlen(word);
    for (int r = 0; r < M; r++)
        for (int c = 0; c < N; c++)
            if (dfs(r, c, 0)) return true;
    return false;
}`,
        cpp: `bool exist(vector<vector<char>>& board, string word) {
    int m = board.size(), n = board[0].size();
    function<bool(int, int, int)> dfs = [&](int r, int c, int k) -> bool {
        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != word[k]) return false;
        if (k == (int)word.size() - 1) return true;
        char t = board[r][c];
        board[r][c] = '#';
        bool ok = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
        board[r][c] = t;
        return ok;
    };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (dfs(r, c, 0)) return true;
    return false;
}`,
        java: `boolean exist(char[][] board, String word) {
    for (int r = 0; r < board.length; r++)
        for (int c = 0; c < board[0].length; c++)
            if (dfs(board, word, r, c, 0)) return true;
    return false;
}

private boolean dfs(char[][] b, String w, int r, int c, int k) {
    if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != w.charAt(k)) return false;
    if (k == w.length() - 1) return true;
    char t = b[r][c];
    b[r][c] = '#';
    boolean ok = dfs(b, w, r + 1, c, k + 1) || dfs(b, w, r - 1, c, k + 1)
              || dfs(b, w, r, c + 1, k + 1) || dfs(b, w, r, c - 1, k + 1);
    b[r][c] = t;
    return ok;
}`,
        javascript: `function exist(board, word) {
  const m = board.length, n = board[0].length;
  const dfs = (r, c, k) => {
    if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== word[k]) return false;
    if (k === word.length - 1) return true;
    const t = board[r][c];
    board[r][c] = '#';
    const ok = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = t;
    return ok;
  };
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (dfs(r, c, 0)) return true;
  return false;
}`,
      },
    },
    {
      name: '加上剪枝:字母數量檢查 + 從比較少的那一端開始',
      idea: '搜尋前先做兩件事:① 數字母,盤面上某個字母不夠就直接 false;② 單字開頭的字母在盤面上比結尾的多,就把單字反過來搜,起點會少很多。',
      steps: ['數 board 和 word 的字母,word 需要的比 board 多 → false', '`word[0]` 在 board 出現的次數 > `word[-1]` 的次數 → `word = word[::-1]`', '之後同方法一'],
      figure: { title: `word = "${W}"`, steps: pruneFig() },
      complexity: { time: '最壞仍是 O(m · n · 3ᴸ)', space: 'O(L + 字母種類)', why: '理論最壞情況不變,但能把「不可能」和「起點很多」這兩種最慢的測資大幅加速。' },
      verdict: 'Follow-up 的答案。像 `board` 全是 A、`word = "AAAAAAAAAAAAB"` 這種測資,沒有剪枝會跑非常久。',
      code: {
        python: `from collections import Counter

def exist(board, word):
    m, n = len(board), len(board[0])
    have = Counter(ch for row in board for ch in row)
    need = Counter(word)
    if any(have[ch] < c for ch, c in need.items()):
        return False                      # 字母不夠,不可能
    if have[word[0]] > have[word[-1]]:
        word = word[::-1]                 # 從比較稀有的那一端開始

    def dfs(r, c, k):
        if r < 0 or c < 0 or r >= m or c >= n or board[r][c] != word[k]:
            return False
        if k == len(word) - 1:
            return True
        tmp, board[r][c] = board[r][c], '#'
        found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or
                 dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))
        board[r][c] = tmp
        return found

    return any(dfs(r, c, 0) for r in range(m) for c in range(n))`,
        c: `static char **B, *Wd;
static int M, N, L;

static bool dfs(int r, int c, int k) {
    if (r < 0 || c < 0 || r >= M || c >= N || B[r][c] != Wd[k]) return false;
    if (k == L - 1) return true;
    char t = B[r][c];
    B[r][c] = '#';
    bool ok = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    B[r][c] = t;
    return ok;
}

bool exist(char **board, int boardSize, int *boardColSize, char *word) {
    M = boardSize; N = boardColSize[0]; L = strlen(word); B = board;
    int have[128] = {0}, need[128] = {0};
    for (int r = 0; r < M; r++) for (int c = 0; c < N; c++) have[(int)board[r][c]]++;
    for (int i = 0; i < L; i++) need[(int)word[i]]++;
    for (int ch = 0; ch < 128; ch++) if (need[ch] > have[ch]) return false;
    char *w = strdup(word);
    if (have[(int)w[0]] > have[(int)w[L - 1]])
        for (int i = 0, j = L - 1; i < j; i++, j--) { char t = w[i]; w[i] = w[j]; w[j] = t; }
    Wd = w;
    bool ok = false;
    for (int r = 0; r < M && !ok; r++)
        for (int c = 0; c < N && !ok; c++) ok = dfs(r, c, 0);
    free(w);
    return ok;
}`,
        cpp: `bool exist(vector<vector<char>>& board, string word) {
    int m = board.size(), n = board[0].size();
    int have[128] = {0}, need[128] = {0};
    for (auto& row : board) for (char ch : row) have[(int)ch]++;
    for (char ch : word) need[(int)ch]++;
    for (int ch = 0; ch < 128; ch++) if (need[ch] > have[ch]) return false;
    if (have[(int)word[0]] > have[(int)word.back()]) reverse(word.begin(), word.end());
    function<bool(int, int, int)> dfs = [&](int r, int c, int k) -> bool {
        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != word[k]) return false;
        if (k == (int)word.size() - 1) return true;
        char t = board[r][c];
        board[r][c] = '#';
        bool ok = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
        board[r][c] = t;
        return ok;
    };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (dfs(r, c, 0)) return true;
    return false;
}`,
        java: `boolean exist(char[][] board, String word) {
    int[] have = new int[128], need = new int[128];
    for (char[] row : board) for (char ch : row) have[ch]++;
    for (char ch : word.toCharArray()) need[ch]++;
    for (int ch = 0; ch < 128; ch++) if (need[ch] > have[ch]) return false;
    if (have[word.charAt(0)] > have[word.charAt(word.length() - 1)])
        word = new StringBuilder(word).reverse().toString();
    for (int r = 0; r < board.length; r++)
        for (int c = 0; c < board[0].length; c++)
            if (dfs(board, word, r, c, 0)) return true;
    return false;
}

private boolean dfs(char[][] b, String w, int r, int c, int k) {
    if (r < 0 || c < 0 || r >= b.length || c >= b[0].length || b[r][c] != w.charAt(k)) return false;
    if (k == w.length() - 1) return true;
    char t = b[r][c];
    b[r][c] = '#';
    boolean ok = dfs(b, w, r + 1, c, k + 1) || dfs(b, w, r - 1, c, k + 1)
              || dfs(b, w, r, c + 1, k + 1) || dfs(b, w, r, c - 1, k + 1);
    b[r][c] = t;
    return ok;
}`,
        javascript: `function exist(board, word) {
  const m = board.length, n = board[0].length;
  const have = new Map(), need = new Map();
  for (const row of board) for (const ch of row) have.set(ch, (have.get(ch) ?? 0) + 1);
  for (const ch of word) need.set(ch, (need.get(ch) ?? 0) + 1);
  for (const [ch, c] of need) if ((have.get(ch) ?? 0) < c) return false;
  if ((have.get(word[0]) ?? 0) > (have.get(word[word.length - 1]) ?? 0)) word = [...word].reverse().join('');
  const dfs = (r, c, k) => {
    if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== word[k]) return false;
    if (k === word.length - 1) return true;
    const t = board[r][c];
    board[r][c] = '#';
    const ok = dfs(r + 1, c, k + 1) || dfs(r - 1, c, k + 1) || dfs(r, c + 1, k + 1) || dfs(r, c - 1, k + 1);
    board[r][c] = t;
    return ok;
  };
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (dfs(r, c, 0)) return true;
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    '退回來時忘了取消標記:這一格會被當成「永遠用過」,其他路徑就不能再經過它',
    '用一個全域的 visited 卻在每個起點之間沒有清乾淨(用「暫時改掉格子再改回來」就沒有這個問題)',
    '先檢查 `k == len − 1` 再檢查字母相不相等:會把最後一個字母不對的情況也當成成功',
  ],
  followUp: [{ q: '要在同一個盤面找很多個單字?', a: '[212. Word Search II](#/q/212):把單字建成 Trie,一次 DFS 同時找所有單字,沿著 Trie 走不下去就剪枝。' }],
  check: {
    kind: 'fn',
    fn: 'exist',
    cases: [
      { args: [B, 'ABCCED'], out: true },
      { args: [B, 'SEE'], out: true },
      { args: [B, 'ABCB'], out: false },
      { args: [[['a']], 'a'], out: true },
      { args: [[['a', 'b'], ['c', 'd']], 'abdc'], out: true },
      { args: [[['a', 'b'], ['c', 'd']], 'abcd'], out: false },
    ],
  },
}
