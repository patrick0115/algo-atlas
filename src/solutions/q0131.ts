import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 131. Palindrome Partitioning

const S = 'aab'
const isPal = (s: string) => s === [...s].reverse().join('')

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const cur: string[] = []
  const go = (start: number, parent: number, label: string) => {
    const id = nodes.length
    const done = start === S.length
    nodes.push({ parent, label, sub: cur.join('|') || '—', kind: done ? 'ok' : undefined })
    notes.push(parent < 0 ? '每一層從目前位置往後切出一段「前綴」:是迴文才能切,切完對剩下的字串做同樣的事。切到字串結尾就是一種切法' : done ? `切到最後了 → 一種切法 [${cur.map((x) => `"${x}"`).join(', ')}]` : `切出 "${label}"(是迴文),剩下 "${S.slice(start)}" 繼續切`)
    if (done) return
    for (let end = start + 1; end <= S.length; end++) {
      const piece = S.slice(start, end)
      if (!isPal(piece)) {
        nodes.push({ parent: id, label: piece, sub: '不是迴文', kind: 'cut' })
        notes.push(`"${piece}" 不是迴文 → 這刀不能切`)
        continue
      }
      cur.push(piece)
      go(end, id, piece)
      cur.pop()
    }
  }
  go(0, -1, '"aab"')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(節點是切出來的那段,下方是目前的切法)')] }))
}

function dpFig(): FigStep[] {
  const n = S.length
  const pal = Array.from({ length: n }, () => Array(n).fill(false))
  const view = (hl: [number, number][] = []): GridViewData => ({
    kind: 'grid',
    label: 'pal[i][j]:s[i..j] 是不是迴文(✓ / ·)',
    cells: pal.map((row, i) => row.map((v, j) => (j < i ? '' : v ? '✓' : '·'))),
    rowLabels: [...S].map((c, i) => `${i}:${c}`),
    colLabels: [...S].map((c, j) => `${j}:${c}`),
    marks: { hl, done: pal.flatMap((row, i) => row.flatMap((v, j) => (v ? [[i, j] as [number, number]] : []))) },
  })
  const out: FigStep[] = [{ note: '方法一每切一刀都重新檢查迴文,很多段會被重複檢查。先用 DP 把「s[i..j] 是不是迴文」全部算好:兩端字母相同,而且中間那段也是迴文', views: [view()] }]
  for (let i = n - 1; i >= 0; i--)
    for (let j = i; j < n; j++) {
      pal[i][j] = S[i] === S[j] && (j - i < 2 || pal[i + 1][j - 1])
      out.push({ note: `s[${i}..${j}] = "${S.slice(i, j + 1)}":${S[i] === S[j] ? `兩端都是 ${S[i]}${j - i < 2 ? ',長度 ≤ 2 → 迴文' : `,中間 s[${i + 1}..${j - 1}] ${pal[i + 1][j - 1] ? '是' : '不是'}迴文`}` : '兩端不同 → 不是'}`, views: [view([[i, j]])] })
    }
  out.push({ note: '之後回溯時,判斷一段是不是迴文只要查表 O(1)', views: [view()] })
  return out
}

export const q0131: Solution = {
  id: 131,
  plain: '把一個字串切成好幾段,**每一段都要是迴文**(正著念倒著念一樣)。列出所有切法。像把 "aab" 切成 "a|a|b" 或 "aa|b"。',
  statement: '給字串 `s`,把它切成若干段,使每一段都是**迴文**。回傳所有可能的切法。',
  examples: [
    { input: 's = "aab"', output: '[["a","a","b"],["aa","b"]]' },
    { input: 's = "a"', output: '[["a"]]' },
  ],
  constraints: ['`1 ≤ s.length ≤ 16` → 切法最多 2¹⁵ 種(每個空隙切或不切),回溯沒問題'],
  insight: [
    '「切法」= 在字串的空隙裡決定切不切。用回溯:從目前位置開始,試著切出長度 1、2、3… 的前綴',
    '前綴不是迴文就不能切(剪枝);是迴文就把它放進目前的切法,對剩下的部分遞迴',
    '同一段子字串會被檢查很多次是不是迴文 → 可以先用 DP 把所有 `s[i..j]` 是否為迴文算好',
  ],
  approaches: [
    {
      name: '回溯 + 每次檢查迴文',
      idea: '`dfs(start)`:start 到結尾就收下;否則對 end 從 start+1 到 n:`s[start:end]` 是迴文就放進 cur、遞迴 `dfs(end)`、拿出來。',
      steps: ['`dfs(start)`:`start == n` → 收下 cur 的複製', '`for end in start+1..n`:`piece = s[start:end]`', '`piece` 是迴文 → `cur.append(piece)`、`dfs(end)`、`cur.pop()`'],
      figure: { title: `s = "${S}"`, steps: btFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)', why: '最多 2ⁿ⁻¹ 種切法,每一刀檢查迴文 O(n)。遞迴深度 n。' },
      verdict: '標準解。[[p:backtracking]]的「切割型」:每層決定下一刀切在哪。',
      code: {
        python: `def partition(s):
    res, cur = [], []

    def dfs(start):
        if start == len(s):
            res.append(cur[:])
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece == piece[::-1]:      # 是迴文才能切
                cur.append(piece)
                dfs(end)
                cur.pop()

    dfs(0)
    return res`,
        c: `static char ***res, *cur[16];
static int *cols, cnt, len, n;
static char *S;

static bool isPal(int i, int j) {
    while (i < j) if (S[i++] != S[j--]) return false;
    return true;
}

static void dfs(int start) {
    if (start == n) {
        res[cnt] = malloc(len * sizeof(char *));
        for (int k = 0; k < len; k++) res[cnt][k] = strdup(cur[k]);
        cols[cnt++] = len;
        return;
    }
    for (int end = start; end < n; end++) {
        if (!isPal(start, end)) continue;
        char *p = malloc(end - start + 2);
        memcpy(p, S + start, end - start + 1);
        p[end - start + 1] = '\\0';
        cur[len++] = p;
        dfs(end + 1);
        free(cur[--len]);
    }
}

char ***partition(char *s, int *returnSize, int **returnColumnSizes) {
    S = s; n = strlen(s); cnt = len = 0;
    res = malloc((1 << (n - 1)) * sizeof(char **));
    cols = malloc((1 << (n - 1)) * sizeof(int));
    dfs(0);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<string>> partition(string s) {
    vector<vector<string>> res;
    vector<string> cur;
    auto isPal = [&](int i, int j) {
        while (i < j) if (s[i++] != s[j--]) return false;
        return true;
    };
    function<void(int)> dfs = [&](int start) {
        if (start == (int)s.size()) { res.push_back(cur); return; }
        for (int end = start; end < (int)s.size(); end++) {
            if (!isPal(start, end)) continue;
            cur.push_back(s.substr(start, end - start + 1));
            dfs(end + 1);
            cur.pop_back();
        }
    };
    dfs(0);
    return res;
}`,
        java: `List<List<String>> partition(String s) {
    List<List<String>> res = new ArrayList<>();
    dfs(s, 0, new ArrayList<>(), res);
    return res;
}

private void dfs(String s, int start, List<String> cur, List<List<String>> res) {
    if (start == s.length()) { res.add(new ArrayList<>(cur)); return; }
    for (int end = start; end < s.length(); end++) {
        if (!isPal(s, start, end)) continue;
        cur.add(s.substring(start, end + 1));
        dfs(s, end + 1, cur, res);
        cur.remove(cur.size() - 1);
    }
}

private boolean isPal(String s, int i, int j) {
    while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
    return true;
}`,
        javascript: `function partition(s) {
  const res = [], cur = [];
  const isPal = (i, j) => {
    while (i < j) if (s[i++] !== s[j--]) return false;
    return true;
  };
  const dfs = (start) => {
    if (start === s.length) {
      res.push([...cur]);
      return;
    }
    for (let end = start; end < s.length; end++) {
      if (!isPal(start, end)) continue;
      cur.push(s.slice(start, end + 1));
      dfs(end + 1);
      cur.pop();
    }
  };
  dfs(0);
  return res;
}`,
      },
    },
    {
      name: '回溯 + 預先用 DP 算好迴文表',
      idea: '`pal[i][j]` = `s[i] == s[j]` 且(長度 ≤ 2 或 `pal[i+1][j−1]`)。i 從後往前算。之後回溯判斷迴文只要查表。',
      steps: ['`i` 從 n−1 往前、`j` 從 i 往後:`pal[i][j] = s[i] == s[j] and (j − i < 2 or pal[i+1][j−1])`', '回溯同方法一,判斷改成查 `pal[start][end]`'],
      figure: { title: `s = "${S}"`, steps: dpFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(n²)', why: '預處理 O(n²);回溯時每刀 O(1) 判斷,但複製答案仍要 O(n),所以總時間的量級不變,常數變小。' },
      verdict: '「同一個子問題被算很多次 → 先算好存起來」的典型優化。這張迴文表也是 5、647、132 的基礎([[p:interval-dp]])。',
      code: {
        python: `def partition(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):        # i 要從後往前,才能用到 pal[i+1][...]
        for j in range(i, n):
            pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
    res, cur = [], []

    def dfs(start):
        if start == n:
            res.append(cur[:])
            return
        for end in range(start, n):
            if pal[start][end]:
                cur.append(s[start:end + 1])
                dfs(end + 1)
                cur.pop()

    dfs(0)
    return res`,
        c: `static char ***res, *cur[16];
static int *cols, cnt, len, n;
static bool pal[16][16];
static char *S;

static void dfs(int start) {
    if (start == n) {
        res[cnt] = malloc(len * sizeof(char *));
        for (int k = 0; k < len; k++) res[cnt][k] = strdup(cur[k]);
        cols[cnt++] = len;
        return;
    }
    for (int end = start; end < n; end++) {
        if (!pal[start][end]) continue;
        char *p = malloc(end - start + 2);
        memcpy(p, S + start, end - start + 1);
        p[end - start + 1] = '\\0';
        cur[len++] = p;
        dfs(end + 1);
        free(cur[--len]);
    }
}

char ***partition(char *s, int *returnSize, int **returnColumnSizes) {
    S = s; n = strlen(s); cnt = len = 0;
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);
    res = malloc((1 << (n - 1)) * sizeof(char **));
    cols = malloc((1 << (n - 1)) * sizeof(int));
    dfs(0);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<string>> partition(string s) {
    int n = s.size();
    vector<vector<bool>> pal(n, vector<bool>(n, false));
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) pal[i][j] = s[i] == s[j] && (j - i < 2 || pal[i + 1][j - 1]);
    vector<vector<string>> res;
    vector<string> cur;
    function<void(int)> dfs = [&](int start) {
        if (start == n) { res.push_back(cur); return; }
        for (int end = start; end < n; end++) {
            if (!pal[start][end]) continue;
            cur.push_back(s.substr(start, end - start + 1));
            dfs(end + 1);
            cur.pop_back();
        }
    };
    dfs(0);
    return res;
}`,
        java: `List<List<String>> partition(String s) {
    int n = s.length();
    boolean[][] pal = new boolean[n][n];
    for (int i = n - 1; i >= 0; i--)
        for (int j = i; j < n; j++) pal[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1]);
    List<List<String>> res = new ArrayList<>();
    dfs(s, pal, 0, new ArrayList<>(), res);
    return res;
}

private void dfs(String s, boolean[][] pal, int start, List<String> cur, List<List<String>> res) {
    if (start == s.length()) { res.add(new ArrayList<>(cur)); return; }
    for (int end = start; end < s.length(); end++) {
        if (!pal[start][end]) continue;
        cur.add(s.substring(start, end + 1));
        dfs(s, pal, end + 1, cur, res);
        cur.remove(cur.size() - 1);
    }
}`,
        javascript: `function partition(s) {
  const n = s.length;
  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--)
    for (let j = i; j < n; j++) pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);
  const res = [], cur = [];
  const dfs = (start) => {
    if (start === n) {
      res.push([...cur]);
      return;
    }
    for (let end = start; end < n; end++) {
      if (!pal[start][end]) continue;
      cur.push(s.slice(start, end + 1));
      dfs(end + 1);
      cur.pop();
    }
  };
  dfs(0);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    'DP 表的迴圈方向:`pal[i][j]` 要用到 `pal[i+1][j−1]`(下一列),所以 i 要從後往前',
    '長度 1 和 2 的特例:`j − i < 2` 時只要兩端相同就是迴文,不能去查 `pal[i+1][j−1]`(會越界或查到 i > j 的格子)',
    '收答案沒有複製 cur',
  ],
  followUp: [{ q: '最少要切幾刀?', a: '132. Palindrome Partitioning II:不用列出所有切法,改成 DP:`cut[j] = min(cut[i−1] + 1)`,其中 `s[i..j]` 是迴文。' }],
  check: {
    kind: 'fn',
    fn: 'partition',
    compare: 'sorted',
    cases: [
      { args: ['aab'], out: [['a', 'a', 'b'], ['aa', 'b']] },
      { args: ['a'], out: [['a']] },
      { args: ['aba'], out: [['a', 'b', 'a'], ['aba']] },
      { args: ['abba'], out: [['a', 'b', 'b', 'a'], ['a', 'bb', 'a'], ['abba']] },
    ],
  },
}
