import type { Cell, GraphViewData, GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 212. Word Search II

const B = [
  ['o', 'a', 'a', 'n'],
  ['e', 't', 'a', 'e'],
  ['i', 'h', 'k', 'r'],
  ['i', 'f', 'l', 'v'],
]
const W = ['oath', 'pea', 'eat', 'rain']

function grid(path: Cell[], done: Cell[], label: string): GridViewData {
  return { kind: 'grid', label, cells: B.map((r) => [...r]), marks: { path, done, hl: path.length ? [path[path.length - 1]] : [] } }
}

function trieView(hl: string[] = []): GraphViewData {
  // 只畫和範例有關的前綴:o-a-t-h、e-a-t、p-e-a、r-a-i-n
  const words = W
  const nodes: GraphViewData['nodes'] = [{ id: '', label: '·', x: 3, y: 0 }]
  const edges: GraphViewData['edges'] = []
  words.forEach((w, wi) => {
    for (let k = 1; k <= w.length; k++) {
      const id = w.slice(0, k)
      if (nodes.some((n) => n.id === id)) continue
      nodes.push({ id, label: w[k - 1], x: wi * 2, y: k, cls: hl.includes(id) ? 'hl' : k === w.length ? 'done' : undefined })
      edges.push({ from: w.slice(0, k - 1), to: id, directed: true })
    }
  })
  return { kind: 'graph', label: 'Trie(綠色 = 單字結尾)', nodes, edges }
}

function trieFig(): FigStep[] {
  const oath: Cell[] = [[0, 0], [0, 1], [1, 1], [2, 1]]
  const eat: Cell[] = [[1, 3], [1, 2], [1, 1]]
  return [
    { note: '把所有單字放進一棵 Trie(字首樹)。共同的前綴只存一次', views: [trieView()] },
    { note: '從每一格出發做 DFS,但**同時**在 Trie 上往下走:格子的字母不是 Trie 目前節點的孩子 → 立刻停(沒有任何單字以這個前綴開頭)', views: [grid([[0, 0]], [], '從 (0,0) "o" 出發'), trieView(['o'])] },
    { note: 'o → a → t → h:每一步都在 Trie 上找得到,走到 "oath" 的結尾 → 找到一個單字', views: [grid(oath, [], '路徑 o-a-t-h'), trieView(['o', 'oa', 'oat', 'oath'])] },
    { note: '從 (1,3) "e" 出發:e → a → t,找到 "eat"。"pea" 的 p 不在棋盤上、"rain" 走到 r-a 就斷了', views: [grid(eat, oath, '路徑 e-a-t'), trieView(['e', 'ea', 'eat'])] },
    { note: '一次 DFS 同時比對所有單字,而不是每個單字各搜一次。找到的單字把結尾標記清掉,避免重複加入', views: [grid([], [...oath, ...eat], '答案:["oath", "eat"]')] },
  ]
}

function eachFig(): FigStep[] {
  return [
    { note: '直接重複 [79. Word Search](#/q/79):每個單字都對整個棋盤做一次 DFS', views: [grid([[0, 0], [0, 1], [1, 1], [2, 1]], [], 'oath')] },
    { note: '單字有 3·10⁴ 個時,很多共同前綴(例如 "oat"、"oath"、"oats")會被重複搜好幾次 → 太慢', views: [grid([[1, 3], [1, 2], [1, 1]], [], 'eat')] },
  ]
}

export const q0212: Solution = {
  id: 212,
  plain: '一張字母棋盤和一串單字,找出哪些單字能在棋盤上「連」出來:從某一格開始,每次往上下左右相鄰的格子走,同一條路線上一格只能用一次。',
  statement: '給 m × n 的字元棋盤 `board` 和字串陣列 `words`,回傳所有能在棋盤上找到的單字。單字必須由相鄰(上下左右)的格子依序組成,同一個單字中每格只能使用一次。',
  examples: [
    { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' },
    { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: '[]' },
  ],
  constraints: ['m, n ≤ 12;words 最多 3·10⁴ 個,每個長度 ≤ 10'],
  insight: [
    '一個單字:[79. Word Search](#/q/79) 的回溯。很多單字:每個都搜一次,共同前綴被重複搜尋',
    '把單字放進 **Trie**,DFS 時同時沿著 Trie 往下走:走到 Trie 沒有的字母就剪枝',
    '這樣一次 DFS 就同時找所有單字;Trie 節點上存完整單字,走到就加入答案',
    '找到後把單字清掉(避免重複),甚至可以把沒用的 Trie 葉子刪掉,讓之後的搜尋更快',
  ],
  approaches: [
    {
      name: '每個單字各做一次 Word Search',
      idea: '對每個單字呼叫 79 題的 `exist(board, word)`。',
      steps: ['`for w in words`', '從每一格開始回溯,比對 w', '找到就加入答案'],
      figure: { title: 'board 4 × 4', steps: eachFig() },
      complexity: { time: 'O(W · m · n · 4^L)', space: 'O(L)', why: 'W 個單字,每個最壞 m·n 個起點 × 4^L 條路徑。' },
      verdict: '單字少時可以,單字一多就超時。',
      code: {
        python: `def findWords(board, words):
    m, n = len(board), len(board[0])

    def exist(word):
        def dfs(r, c, k):
            if k == len(word):
                return True
            if not (0 <= r < m and 0 <= c < n) or board[r][c] != word[k]:
                return False
            tmp, board[r][c] = board[r][c], '#'
            ok = any(dfs(r + dr, c + dc, k + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            board[r][c] = tmp
            return ok
        return any(dfs(r, c, 0) for r in range(m) for c in range(n))

    return [w for w in words if exist(w)]`,
        c: `static char **G;
static int M, N;

static bool dfs(int r, int c, const char *w) {
    if (!*w) return true;
    if (r < 0 || c < 0 || r >= M || c >= N || G[r][c] != *w) return false;
    char t = G[r][c];
    G[r][c] = '#';
    bool ok = dfs(r + 1, c, w + 1) || dfs(r - 1, c, w + 1) || dfs(r, c + 1, w + 1) || dfs(r, c - 1, w + 1);
    G[r][c] = t;
    return ok;
}

char **findWords(char **board, int boardSize, int *boardColSize, char **words, int wordsSize, int *returnSize) {
    G = board; M = boardSize; N = boardColSize[0];
    char **res = malloc(wordsSize * sizeof(char *));
    *returnSize = 0;
    for (int i = 0; i < wordsSize; i++) {
        bool found = false;
        for (int r = 0; r < M && !found; r++)
            for (int c = 0; c < N && !found; c++)
                if (dfs(r, c, words[i])) found = true;
        if (found) res[(*returnSize)++] = words[i];
    }
    return res;
}`,
        cpp: `vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
    int m = board.size(), n = board[0].size();
    function<bool(int, int, const string&, int)> dfs = [&](int r, int c, const string& w, int k) -> bool {
        if (k == (int)w.size()) return true;
        if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] != w[k]) return false;
        char t = board[r][c];
        board[r][c] = '#';
        bool ok = dfs(r + 1, c, w, k + 1) || dfs(r - 1, c, w, k + 1) || dfs(r, c + 1, w, k + 1) || dfs(r, c - 1, w, k + 1);
        board[r][c] = t;
        return ok;
    };
    vector<string> res;
    for (auto& w : words) {
        bool found = false;
        for (int r = 0; r < m && !found; r++)
            for (int c = 0; c < n && !found; c++) found = dfs(r, c, w, 0);
        if (found) res.push_back(w);
    }
    return res;
}`,
        java: `private char[][] g;

List<String> findWords(char[][] board, String[] words) {
    g = board;
    List<String> res = new ArrayList<>();
    for (String w : words) {
        boolean found = false;
        for (int r = 0; r < g.length && !found; r++)
            for (int c = 0; c < g[0].length && !found; c++) found = dfs(r, c, w, 0);
        if (found) res.add(w);
    }
    return res;
}

private boolean dfs(int r, int c, String w, int k) {
    if (k == w.length()) return true;
    if (r < 0 || c < 0 || r >= g.length || c >= g[0].length || g[r][c] != w.charAt(k)) return false;
    char t = g[r][c];
    g[r][c] = '#';
    boolean ok = dfs(r + 1, c, w, k + 1) || dfs(r - 1, c, w, k + 1) || dfs(r, c + 1, w, k + 1) || dfs(r, c - 1, w, k + 1);
    g[r][c] = t;
    return ok;
}`,
        javascript: `function findWords(board, words) {
  const m = board.length, n = board[0].length;
  const dfs = (r, c, w, k) => {
    if (k === w.length) return true;
    if (r < 0 || c < 0 || r >= m || c >= n || board[r][c] !== w[k]) return false;
    const t = board[r][c];
    board[r][c] = '#';
    const ok = dfs(r + 1, c, w, k + 1) || dfs(r - 1, c, w, k + 1) || dfs(r, c + 1, w, k + 1) || dfs(r, c - 1, w, k + 1);
    board[r][c] = t;
    return ok;
  };
  return words.filter((w) => {
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (dfs(r, c, w, 0)) return true;
    return false;
  });
}`,
      },
    },
    {
      name: 'Trie + 回溯',
      idea: '建 Trie,節點上的 `word` 存完整單字。從每格 DFS:`node = node.children[board[r][c]]`,沒有就剪枝;`node.word` 不是空的就加入答案並清空。',
      steps: ['把 words 插入 Trie(結尾節點存 word)', '每格 `dfs(r, c, root)`:字母不在 `node.children` → return', '`node = child`;`node.word` → 加入答案、`node.word = None`', '標記走過、往四個方向遞迴、還原'],
      figure: { title: `board 4 × 4,words = [${W.map((w) => `"${w}"`).join(', ')}]`, steps: trieFig() },
      complexity: { time: 'O(m · n · 4 · 3^(L−1))', space: 'O(所有單字的總長度)', why: '每個起點最多走 L 步(第一步 4 個方向,之後最多 3 個);Trie 讓不可能的前綴立刻停下。' },
      verdict: '標準解,[[p:trie]] + [[p:backtracking]] 的組合題。比 79 題多的只有「在 Trie 上同步往下走」這一步。',
      code: {
        python: `def findWords(board, words):
    root = {}
    for w in words:                           # 建 Trie,結尾放 '$' = 完整單字
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node['$'] = w

    m, n, res = len(board), len(board[0]), []

    def dfs(r, c, parent):
        ch = board[r][c]
        node = parent.get(ch)
        if not node:
            return                            # 沒有單字以這個前綴開頭:剪枝
        if '$' in node:
            res.append(node.pop('$'))         # 找到,並移除避免重複
        board[r][c] = '#'
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < m and 0 <= nc < n and board[nr][nc] != '#':
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            parent.pop(ch)                    # 這個分支已經沒有單字了,刪掉

    for r in range(m):
        for c in range(n):
            dfs(r, c, root)
    return res`,
        c: `typedef struct Trie { struct Trie *ch[26]; char *word; } Trie;

static char **G, **RES;
static int M, N, CNT;

static void dfs(int r, int c, Trie *node) {
    char ch = G[r][c];
    if (ch == '#' || !node->ch[ch - 'a']) return;
    node = node->ch[ch - 'a'];
    if (node->word) { RES[CNT++] = node->word; node->word = NULL; }
    G[r][c] = '#';
    if (r > 0) dfs(r - 1, c, node);
    if (r < M - 1) dfs(r + 1, c, node);
    if (c > 0) dfs(r, c - 1, node);
    if (c < N - 1) dfs(r, c + 1, node);
    G[r][c] = ch;
}

char **findWords(char **board, int boardSize, int *boardColSize, char **words, int wordsSize, int *returnSize) {
    Trie *root = calloc(1, sizeof(Trie));
    for (int i = 0; i < wordsSize; i++) {
        Trie *node = root;
        for (char *p = words[i]; *p; p++) {
            if (!node->ch[*p - 'a']) node->ch[*p - 'a'] = calloc(1, sizeof(Trie));
            node = node->ch[*p - 'a'];
        }
        node->word = words[i];
    }
    G = board; M = boardSize; N = boardColSize[0]; CNT = 0;
    RES = malloc((wordsSize + 1) * sizeof(char *));
    for (int r = 0; r < M; r++)
        for (int c = 0; c < N; c++) dfs(r, c, root);
    *returnSize = CNT;
    return RES;
}`,
        cpp: `struct Trie {
    Trie* ch[26] = {};
    string word;
};

vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
    Trie* root = new Trie();
    for (auto& w : words) {
        Trie* node = root;
        for (char c : w) {
            if (!node->ch[c - 'a']) node->ch[c - 'a'] = new Trie();
            node = node->ch[c - 'a'];
        }
        node->word = w;
    }
    int m = board.size(), n = board[0].size();
    vector<string> res;
    function<void(int, int, Trie*)> dfs = [&](int r, int c, Trie* node) {
        char ch = board[r][c];
        if (ch == '#' || !node->ch[ch - 'a']) return;
        node = node->ch[ch - 'a'];
        if (!node->word.empty()) { res.push_back(node->word); node->word.clear(); }
        board[r][c] = '#';
        if (r > 0) dfs(r - 1, c, node);
        if (r < m - 1) dfs(r + 1, c, node);
        if (c > 0) dfs(r, c - 1, node);
        if (c < n - 1) dfs(r, c + 1, node);
        board[r][c] = ch;
    };
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++) dfs(r, c, root);
    return res;
}`,
        java: `private static class Trie { Trie[] ch = new Trie[26]; String word; }

private char[][] g;
private List<String> res;

List<String> findWords(char[][] board, String[] words) {
    Trie root = new Trie();
    for (String w : words) {
        Trie node = root;
        for (char c : w.toCharArray()) {
            if (node.ch[c - 'a'] == null) node.ch[c - 'a'] = new Trie();
            node = node.ch[c - 'a'];
        }
        node.word = w;
    }
    g = board;
    res = new ArrayList<>();
    for (int r = 0; r < g.length; r++)
        for (int c = 0; c < g[0].length; c++) dfs(r, c, root);
    return res;
}

private void dfs(int r, int c, Trie node) {
    char ch = g[r][c];
    if (ch == '#' || node.ch[ch - 'a'] == null) return;
    node = node.ch[ch - 'a'];
    if (node.word != null) { res.add(node.word); node.word = null; }
    g[r][c] = '#';
    if (r > 0) dfs(r - 1, c, node);
    if (r < g.length - 1) dfs(r + 1, c, node);
    if (c > 0) dfs(r, c - 1, node);
    if (c < g[0].length - 1) dfs(r, c + 1, node);
    g[r][c] = ch;
}`,
        javascript: `function findWords(board, words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const ch of w) node = node[ch] ??= {};
    node.$ = w;
  }
  const m = board.length, n = board[0].length, res = [];
  const dfs = (r, c, parent) => {
    const ch = board[r][c], node = parent[ch];
    if (!node) return;
    if (node.$) { res.push(node.$); delete node.$; }
    board[r][c] = '#';
    if (r > 0) dfs(r - 1, c, node);
    if (r < m - 1) dfs(r + 1, c, node);
    if (c > 0) dfs(r, c - 1, node);
    if (c < n - 1) dfs(r, c + 1, node);
    board[r][c] = ch;
  };
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) dfs(r, c, root);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '找到單字後沒有清掉標記:同一個單字從不同路徑被找到好幾次,答案重複',
    '找到單字就 return:更長的單字(例如 "oat" 之後的 "oath")會被漏掉',
    '回溯結束沒有把格子還原:其他起點的搜尋會出錯',
  ],
  check: {
    kind: 'fn',
    fn: 'findWords',
    compare: 'sorted',
    cases: [
      { args: [B.map((r) => [...r]), W], out: ['eat', 'oath'] },
      { args: [[['a', 'b'], ['c', 'd']], ['abcb']], out: [] },
      { args: [[['a', 'b'], ['c', 'd']], ['ab', 'abdc', 'ad', 'acdb', 'ba']], out: ['ab', 'abdc', 'acdb', 'ba'] },
      { args: [[['a']], ['a', 'aa']], out: ['a'] },
      { args: [[['o', 'a', 'b', 'n'], ['o', 't', 'a', 'e'], ['a', 'h', 'k', 'r'], ['a', 'f', 'l', 'v']], ['oa', 'oaa']], out: ['oa', 'oaa'] },
    ],
  },
}
