import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 22. Generate Parentheses

const N = 2

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const go = (s: string, open: number, close: number, parent: number, label: string) => {
    const id = nodes.length
    const done = s.length === 2 * N
    nodes.push({ parent, label, sub: s || '""', kind: done ? 'ok' : undefined })
    notes.push(parent < 0 ? `兩條規則就能保證合法:① 左括號用了不到 n = ${N} 個,就可以再放左括號;② 右括號比左括號少,才可以放右括號(不然會出現沒人配對的右括號)` : done ? `長度到 ${2 * N} → 得到 "${s}"` : `放 "${label}" → "${s}"(左 ${open}、右 ${close})${open < N ? '' : ',左括號用完了'}${close < open ? '' : ',右括號不能比左括號多'}`)
    if (done) return
    if (open < N) go(s + '(', open + 1, close, id, '(')
    if (close < open) go(s + ')', open, close + 1, id, ')')
  }
  go('', 0, 0, -1, '開始')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(節點下方是目前的字串)')] }))
}

function bruteFig(): FigStep[] {
  const all: string[] = []
  const gen = (s: string) => {
    if (s.length === 2 * N) {
      all.push(s)
      return
    }
    gen(s + '(')
    gen(s + ')')
  }
  gen('')
  const ok = (s: string) => {
    let b = 0
    for (const c of s) {
      b += c === '(' ? 1 : -1
      if (b < 0) return false
    }
    return b === 0
  }
  return [
    { note: `暴力:每個位置都可能是 ( 或 ),長度 2n = ${2 * N} 共 2^${2 * N} = ${all.length} 種字串`, views: [arr(all, { label: '所有字串' })] },
    { note: '一個一個檢查是不是合法的括號(餘額從不為負、最後是 0)', views: [arr(all, { label: '所有字串', highlight: all.flatMap((s, i) => (ok(s) ? [i] : [])), dim: all.flatMap((s, i) => (ok(s) ? [] : [i])) })] },
  ]
}

function dpFig(): FigStep[] {
  const dp: string[][] = [['']]
  const out: FigStep[] = [{ note: '另一種想法:任何合法字串的第一個字一定是 "(",它配對的 ")" 把字串切成兩段:"(" + A + ")" + B,A 和 B 也都是合法字串。dp[k] = k 對括號的所有答案', views: [arr(['""'], { label: 'dp[0]' })] }]
  for (let k = 1; k <= N; k++) {
    const cur: string[] = []
    for (let i = 0; i < k; i++) for (const a of dp[i]) for (const b of dp[k - 1 - i]) cur.push(`(${a})${b}`)
    dp.push(cur)
    out.push({ note: `dp[${k}]:A 用 i 對、B 用 ${k} − 1 − i 對,i = 0..${k - 1} 全部組合`, views: [arr(cur, { label: `dp[${k}]` })] })
  }
  return out
}

export const q0022: Solution = {
  id: 22,
  plain: '列出所有由 n 對括號組成的「合法」字串:每個左括號都有對應的右括號,而且不會出現「還沒開就先關」的情況。',
  statement: '給 n,產生所有由 n 對括號組成、**格式正確**的字串。',
  examples: [
    { input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' },
    { input: 'n = 1', output: '["()"]' },
  ],
  constraints: ['`1 ≤ n ≤ 8` → 答案數是卡特蘭數,n = 8 時 1430 個'],
  insight: [
    '暴力:每一格放 ( 或 ),共 2²ⁿ 種,再一個一個檢查 → 大部分都是浪費',
    '其實在**放的當下**就能知道合不合法:① 左括號最多放 n 個;② 任何時候右括號都不能比左括號多',
    '只照這兩條規則往下長,長出來的每一條路都是答案,完全不會走冤枉路 —— 這就是回溯的「剪枝」',
  ],
  approaches: [
    {
      name: '暴力產生 + 檢查',
      idea: '產生所有長度 2n 的 ( ) 字串,留下合法的。',
      steps: ['遞迴產生所有 2²ⁿ 個字串', '檢查:由左往右「( 加 1、) 減 1」,過程不能為負,最後要是 0'],
      figure: { title: `n = ${N}`, steps: bruteFig() },
      complexity: { time: 'O(2²ⁿ · n)', space: 'O(n)', why: '2²ⁿ 個字串,每個檢查 O(n)。n = 8 時 65536 個,其實還能跑。' },
      verdict: '能過但浪費,絕大多數字串都不合法。',
      code: {
        python: `def generateParenthesis(n):
    res = []

    def valid(s):
        bal = 0
        for c in s:
            bal += 1 if c == '(' else -1
            if bal < 0:
                return False
        return bal == 0

    def gen(s):
        if len(s) == 2 * n:
            if valid(s):
                res.append(s)
            return
        gen(s + '(')
        gen(s + ')')

    gen('')
    return res`,
        c: `static char **res, cur[17];
static int cnt;

static bool valid(int len) {
    int bal = 0;
    for (int i = 0; i < len; i++) { bal += cur[i] == '(' ? 1 : -1; if (bal < 0) return false; }
    return bal == 0;
}

static void gen(int len, int n) {
    if (len == 2 * n) {
        if (valid(len)) { cur[len] = '\\0'; res[cnt++] = strdup(cur); }
        return;
    }
    cur[len] = '('; gen(len + 1, n);
    cur[len] = ')'; gen(len + 1, n);
}

char **generateParenthesis(int n, int *returnSize) {
    res = malloc(1430 * sizeof(char *));   // n = 8 的答案數
    cnt = 0;
    gen(0, n);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<string> generateParenthesis(int n) {
    vector<string> res;
    function<void(string)> gen = [&](string s) {
        if ((int)s.size() == 2 * n) {
            int bal = 0;
            for (char c : s) { bal += c == '(' ? 1 : -1; if (bal < 0) return; }
            if (bal == 0) res.push_back(s);
            return;
        }
        gen(s + '(');
        gen(s + ')');
    };
    gen("");
    return res;
}`,
        java: `List<String> generateParenthesis(int n) {
    List<String> res = new ArrayList<>();
    gen("", n, res);
    return res;
}

private void gen(String s, int n, List<String> res) {
    if (s.length() == 2 * n) {
        int bal = 0;
        for (char c : s.toCharArray()) { bal += c == '(' ? 1 : -1; if (bal < 0) return; }
        if (bal == 0) res.add(s);
        return;
    }
    gen(s + "(", n, res);
    gen(s + ")", n, res);
}`,
        javascript: `function generateParenthesis(n) {
  const res = [];
  const valid = (s) => {
    let bal = 0;
    for (const c of s) {
      bal += c === '(' ? 1 : -1;
      if (bal < 0) return false;
    }
    return bal === 0;
  };
  const gen = (s) => {
    if (s.length === 2 * n) {
      if (valid(s)) res.push(s);
      return;
    }
    gen(s + '(');
    gen(s + ')');
  };
  gen('');
  return res;
}`,
      },
    },
    {
      name: '回溯:只放合法的括號',
      idea: '`dfs(s, open, close)`:`open < n` 可以放 (;`close < open` 可以放 )。長度到 2n 就收。',
      steps: ['`dfs("", 0, 0)`', '`len(s) == 2n` → 收下', '`open < n` → `dfs(s + "(", open + 1, close)`', '`close < open` → `dfs(s + ")", open, close + 1)`'],
      figure: { title: `n = ${N}`, steps: btFig() },
      complexity: { time: 'O(4ⁿ / √n)', space: 'O(n)', why: '答案個數是第 n 個卡特蘭數 ≈ 4ⁿ / (n^1.5),每個長度 2n。每條路都會走到一個答案,沒有浪費。' },
      verdict: '標準解。重點是兩條「什麼時候可以放」的規則,它們同時就是剪枝。',
      code: {
        python: `def generateParenthesis(n):
    res = []

    def dfs(s, open_, close):
        if len(s) == 2 * n:
            res.append(s)
            return
        if open_ < n:                     # 左括號還有額度
            dfs(s + '(', open_ + 1, close)
        if close < open_:                 # 有還沒配對的左括號,才能放右括號
            dfs(s + ')', open_, close + 1)

    dfs('', 0, 0)
    return res`,
        c: `static char **res, cur[17];
static int cnt;

static void dfs(int n, int open, int close) {
    if (open + close == 2 * n) { cur[2 * n] = '\\0'; res[cnt++] = strdup(cur); return; }
    if (open < n) { cur[open + close] = '('; dfs(n, open + 1, close); }
    if (close < open) { cur[open + close] = ')'; dfs(n, open, close + 1); }
}

char **generateParenthesis(int n, int *returnSize) {
    res = malloc(1430 * sizeof(char *));
    cnt = 0;
    dfs(n, 0, 0);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<string> generateParenthesis(int n) {
    vector<string> res;
    string s;
    function<void(int, int)> dfs = [&](int open, int close) {
        if ((int)s.size() == 2 * n) { res.push_back(s); return; }
        if (open < n) { s.push_back('('); dfs(open + 1, close); s.pop_back(); }
        if (close < open) { s.push_back(')'); dfs(open, close + 1); s.pop_back(); }
    };
    dfs(0, 0);
    return res;
}`,
        java: `List<String> generateParenthesis(int n) {
    List<String> res = new ArrayList<>();
    dfs(new StringBuilder(), 0, 0, n, res);
    return res;
}

private void dfs(StringBuilder s, int open, int close, int n, List<String> res) {
    if (s.length() == 2 * n) { res.add(s.toString()); return; }
    if (open < n) { s.append('('); dfs(s, open + 1, close, n, res); s.deleteCharAt(s.length() - 1); }
    if (close < open) { s.append(')'); dfs(s, open, close + 1, n, res); s.deleteCharAt(s.length() - 1); }
}`,
        javascript: `function generateParenthesis(n) {
  const res = [];
  const dfs = (s, open, close) => {
    if (s.length === 2 * n) {
      res.push(s);
      return;
    }
    if (open < n) dfs(s + '(', open + 1, close);
    if (close < open) dfs(s + ')', open, close + 1);
  };
  dfs('', 0, 0);
  return res;
}`,
      },
    },
    {
      name: '動態規劃:( A ) B 拆解',
      idea: '合法字串的第一個 ( 和它配對的 ) 把字串分成 `(A)B`,A、B 都合法。`dp[k]` = 所有 `(a)b`,a 屬於 `dp[i]`、b 屬於 `dp[k − 1 − i]`。',
      steps: ['`dp[0] = [""]`', '`dp[k] = ["(" + a + ")" + b for i in 0..k−1 for a in dp[i] for b in dp[k−1−i]]`', '回傳 `dp[n]`'],
      figure: { title: `n = ${N}`, steps: dpFig() },
      complexity: { time: 'O(4ⁿ / √n)', space: 'O(4ⁿ / √n)', why: '每個 dp[k] 的大小就是第 k 個卡特蘭數;要把所有小的答案都存起來。' },
      verdict: '展示卡特蘭數的遞迴結構(和「n 個節點的二元樹有幾種」是同一個數列)。面試當補充。',
      code: {
        python: `def generateParenthesis(n):
    dp = [['']]
    for k in range(1, n + 1):
        dp.append(['(' + a + ')' + b for i in range(k) for a in dp[i] for b in dp[k - 1 - i]])
    return dp[n]`,
        c: `char **generateParenthesis(int n, int *returnSize) {
    char **dp[9];
    int sz[9];
    dp[0] = malloc(sizeof(char *)); dp[0][0] = strdup(""); sz[0] = 1;
    for (int k = 1; k <= n; k++) {
        int total = 0;
        for (int i = 0; i < k; i++) total += sz[i] * sz[k - 1 - i];
        dp[k] = malloc(total * sizeof(char *));
        sz[k] = 0;
        for (int i = 0; i < k; i++)
            for (int a = 0; a < sz[i]; a++)
                for (int b = 0; b < sz[k - 1 - i]; b++) {
                    char *s = malloc(2 * k + 1);
                    sprintf(s, "(%s)%s", dp[i][a], dp[k - 1 - i][b]);
                    dp[k][sz[k]++] = s;
                }
    }
    *returnSize = sz[n];
    return dp[n];
}`,
        cpp: `vector<string> generateParenthesis(int n) {
    vector<vector<string>> dp(n + 1);
    dp[0] = {""};
    for (int k = 1; k <= n; k++)
        for (int i = 0; i < k; i++)
            for (auto& a : dp[i])
                for (auto& b : dp[k - 1 - i]) dp[k].push_back("(" + a + ")" + b);
    return dp[n];
}`,
        java: `List<String> generateParenthesis(int n) {
    List<List<String>> dp = new ArrayList<>();
    dp.add(List.of(""));
    for (int k = 1; k <= n; k++) {
        List<String> cur = new ArrayList<>();
        for (int i = 0; i < k; i++)
            for (String a : dp.get(i))
                for (String b : dp.get(k - 1 - i)) cur.add("(" + a + ")" + b);
        dp.add(cur);
    }
    return dp.get(n);
}`,
        javascript: `function generateParenthesis(n) {
  const dp = [['']];
  for (let k = 1; k <= n; k++) {
    const cur = [];
    for (let i = 0; i < k; i++)
      for (const a of dp[i]) for (const b of dp[k - 1 - i]) cur.push('(' + a + ')' + b);
    dp.push(cur);
  }
  return dp[n];
}`,
      },
    },
  ],
  pitfalls: [
    '右括號的條件寫成 `close < n`:會產生 `"())("` 這種先關後開的字串',
    '回溯用同一個可變字串(C++ / Java 的 builder)時忘了 pop / deleteCharAt',
    'n = 8 時 C 的答案陣列要開到 1430 個',
  ],
  followUp: [{ q: '給一個括號字串,最少刪幾個能變合法?', a: '301. Remove Invalid Parentheses(列出所有最少刪除的結果,BFS 或回溯)、1249(只要一個結果,用堆疊)。' }],
  check: {
    kind: 'fn',
    fn: 'generateParenthesis',
    compare: 'sorted',
    cases: [
      { args: [3], out: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
      { args: [1], out: ['()'] },
      { args: [2], out: ['(())', '()()'] },
    ],
  },
}
