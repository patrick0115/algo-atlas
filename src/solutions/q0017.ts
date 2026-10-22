import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv, recLayout, recView, type RNode } from './fig'

// 17. Letter Combinations of a Phone Number

const D = '23'
const MAP: Record<string, string> = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' }

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const go = (i: number, s: string, parent: number, label: string) => {
    const done = i === D.length
    const id = nodes.length
    nodes.push({ parent, label, sub: s || '""', kind: done ? 'ok' : undefined })
    notes.push(parent < 0 ? `第 i 層處理第 i 個數字:它對應幾個字母,就分出幾條路` : done ? `每個數字都選好字母了 → "${s}"` : `選 ${label},接著處理數字 ${D[i]}(${MAP[D[i]]})`)
    if (done) return
    for (const c of MAP[D[i]]) go(i + 1, s + c, id, c)
  }
  go(0, '', -1, '開始')
  const pos = recLayout(nodes)
  return [
    { note: '手機鍵盤:每個數字對應幾個字母', views: [kv(Object.entries(MAP), '數字 → 字母', [...D])] },
    ...nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(節點下方是目前的字串)')] })),
  ]
}

function bfsFig(): FigStep[] {
  let res = ['']
  const out: FigStep[] = [{ note: '迭代:從空字串開始,每處理一個數字,就把目前每個字串都接上這個數字的每個字母', views: [arr(['""'], { label: '目前的組合' })] }]
  for (const d of D) {
    res = res.flatMap((s) => [...MAP[d]].map((c) => s + c))
    out.push({ note: `處理 ${d}(${MAP[d]}):每個字串分裂成 ${MAP[d].length} 個 → ${res.length} 個`, views: [arr(res, { label: '目前的組合' })] })
  }
  return out
}

export const q0017: Solution = {
  id: 17,
  plain: '手機的舊式鍵盤上,每個數字鍵對應幾個字母(2 是 abc、3 是 def…)。給一串數字,列出它們可能拼出的所有字母組合。',
  statement: '給一個只含 2~9 的字串 `digits`,回傳它在電話按鍵上能代表的所有字母組合,順序不限。`digits` 是空字串時回傳空陣列。',
  examples: [
    { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
    { input: 'digits = ""', output: '[]' },
    { input: 'digits = "2"', output: '["a","b","c"]' },
  ],
  constraints: ['`0 ≤ digits.length ≤ 4` → 最多 4⁴ = 256 個組合'],
  insight: [
    '每個數字各自選一個字母,所有組合 = 每個數字的字母數相乘(笛卡兒積)',
    '回溯:第 i 層決定第 i 個數字要用哪個字母;走到最底層就是一個組合',
    '迭代:從 `[""]` 開始,每處理一個數字,就把目前每個字串接上它的每個字母',
  ],
  approaches: [
    {
      name: '回溯',
      idea: '`dfs(i, cur)`:i 到底就收下 cur;否則對 `digits[i]` 的每個字母 c,遞迴 `dfs(i + 1, cur + c)`。',
      steps: ['`digits` 空 → `[]`', '`dfs(i, cur)`:`i == len` → 收下', '`for c in MAP[digits[i]]`:`dfs(i + 1, cur + c)`'],
      figure: { title: `digits = "${D}"`, steps: btFig() },
      complexity: { time: 'O(n · 4ⁿ)', space: 'O(n)', why: '最多 4ⁿ 個組合(7、9 有 4 個字母),每個長度 n。' },
      verdict: '標準解。每一層的「選項」來自不同的集合,是回溯的另一種形式(不是從同一個陣列挑)。',
      code: {
        python: `def letterCombinations(digits):
    if not digits:
        return []
    m = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
         '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}
    res = []

    def dfs(i, cur):
        if i == len(digits):
            res.append(cur)
            return
        for c in m[digits[i]]:
            dfs(i + 1, cur + c)

    dfs(0, '')
    return res`,
        c: `static const char *M[10] = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
static char **res, cur[5];
static int cnt, n;
static char *D;

static void dfs(int i) {
    if (i == n) { cur[n] = '\\0'; res[cnt++] = strdup(cur); return; }
    for (const char *p = M[D[i] - '0']; *p; p++) {
        cur[i] = *p;
        dfs(i + 1);
    }
}

char **letterCombinations(char *digits, int *returnSize) {
    D = digits; n = strlen(digits); cnt = 0;
    res = malloc(256 * sizeof(char *));
    if (n) dfs(0);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<string> letterCombinations(string digits) {
    if (digits.empty()) return {};
    const vector<string> m = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    vector<string> res;
    string cur;
    function<void(int)> dfs = [&](int i) {
        if (i == (int)digits.size()) { res.push_back(cur); return; }
        for (char c : m[digits[i] - '0']) {
            cur.push_back(c);
            dfs(i + 1);
            cur.pop_back();
        }
    };
    dfs(0);
    return res;
}`,
        java: `private static final String[] M = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

List<String> letterCombinations(String digits) {
    List<String> res = new ArrayList<>();
    if (digits.isEmpty()) return res;
    dfs(digits, 0, new StringBuilder(), res);
    return res;
}

private void dfs(String d, int i, StringBuilder cur, List<String> res) {
    if (i == d.length()) { res.add(cur.toString()); return; }
    for (char c : M[d.charAt(i) - '0'].toCharArray()) {
        cur.append(c);
        dfs(d, i + 1, cur, res);
        cur.deleteCharAt(cur.length() - 1);
    }
}`,
        javascript: `function letterCombinations(digits) {
  if (!digits) return [];
  const m = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  const res = [];
  const dfs = (i, cur) => {
    if (i === digits.length) {
      res.push(cur);
      return;
    }
    for (const c of m[digits[i]]) dfs(i + 1, cur + c);
  };
  dfs(0, '');
  return res;
}`,
      },
    },
    {
      name: '迭代(逐層展開)',
      idea: '`res = [""]`;每個數字 d:`res = [s + c for s in res for c in MAP[d]]`。',
      steps: ['`digits` 空 → `[]`', '`res = [""]`', '每個數字:把 res 的每個字串接上它的每個字母,得到新的 res'],
      figure: { title: `digits = "${D}"`, steps: bfsFig() },
      complexity: { time: 'O(n · 4ⁿ)', space: 'O(4ⁿ)', why: '每一層產生新的一批字串。' },
      verdict: '不用遞迴,像 BFS 一層一層長出來。',
      code: {
        python: `def letterCombinations(digits):
    if not digits:
        return []
    m = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
         '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}
    res = ['']
    for d in digits:
        res = [s + c for s in res for c in m[d]]
    return res`,
        c: `char **letterCombinations(char *digits, int *returnSize) {
    static const char *M[10] = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    int n = strlen(digits);
    *returnSize = 0;
    if (n == 0) return malloc(sizeof(char *));
    char **res = malloc(256 * sizeof(char *)), **nxt = malloc(256 * sizeof(char *));
    int cnt = 1;
    res[0] = strdup("");
    for (int i = 0; i < n; i++) {
        int m = 0;
        for (int k = 0; k < cnt; k++) {
            for (const char *p = M[digits[i] - '0']; *p; p++) {
                char *s = malloc(i + 2);
                memcpy(s, res[k], i);
                s[i] = *p; s[i + 1] = '\\0';
                nxt[m++] = s;
            }
            free(res[k]);
        }
        char **t = res; res = nxt; nxt = t;
        cnt = m;
    }
    free(nxt);
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<string> letterCombinations(string digits) {
    if (digits.empty()) return {};
    const vector<string> m = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    vector<string> res = {""};
    for (char d : digits) {
        vector<string> next;
        for (auto& s : res)
            for (char c : m[d - '0']) next.push_back(s + c);
        res = next;
    }
    return res;
}`,
        java: `List<String> letterCombinations(String digits) {
    String[] m = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    List<String> res = new ArrayList<>();
    if (digits.isEmpty()) return res;
    res.add("");
    for (char d : digits.toCharArray()) {
        List<String> next = new ArrayList<>();
        for (String s : res)
            for (char c : m[d - '0'].toCharArray()) next.add(s + c);
        res = next;
    }
    return res;
}`,
        javascript: `function letterCombinations(digits) {
  if (!digits) return [];
  const m = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  let res = [''];
  for (const d of digits) res = res.flatMap((s) => [...m[d]].map((c) => s + c));
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '`digits` 是空字串時要回傳 `[]`,不是 `[""]`(迭代版從 `[""]` 開始,一定要先擋掉)',
    '7 和 9 有 4 個字母,不是 3 個',
    '用數字當陣列索引時要減掉 `\'0\'`',
  ],
  followUp: [{ q: '同一招還能做什麼?', a: '任何「每一格從一組選項中挑一個」的笛卡兒積都一樣,例如 784. Letter Case Permutation(每個字母大寫或小寫)。' }],
  check: {
    kind: 'fn',
    fn: 'letterCombinations',
    compare: 'sorted',
    cases: [
      { args: ['23'], out: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'] },
      { args: [''], out: [] },
      { args: ['2'], out: ['a', 'b', 'c'] },
      { args: ['79'], out: ['pw', 'px', 'py', 'pz', 'qw', 'qx', 'qy', 'qz', 'rw', 'rx', 'ry', 'rz', 'sw', 'sx', 'sy', 'sz'] },
    ],
  },
}
