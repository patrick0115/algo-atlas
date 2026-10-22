import type { FigStep, Solution } from './types'
import { kv, recLayout, recView, type RNode } from './fig'

// 40. Combination Sum II

const C = [10, 1, 2, 7, 6, 1, 5]
const T = 8
const S = [...C].sort((a, b) => a - b)
const fmt = (s: number[]) => `[${s.join(',')}]`

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const cur: number[] = []
  const go = (start: number, left: number, parent: number, label: string) => {
    const id = nodes.length
    const ok = left === 0
    nodes.push({ parent, label, sub: fmt(cur), kind: ok ? 'ok' : undefined })
    notes.push(parent < 0 ? `排序後 [${S.join(',')}]。每個數只能用一次 → 遞迴傳 i + 1;有重複的數 → 同一層跳過和前一個相同的值(和 90 題一樣)` : ok ? `剛好湊到 ${T} → 收下 ${fmt(cur)}` : `選 ${label},還差 ${left}`)
    if (ok) return
    for (let i = start; i < S.length; i++) {
      if (i > start && S[i] === S[i - 1]) {
        nodes.push({ parent: id, label: S[i], sub: '同層重複', kind: 'cut' })
        notes.push(`同一層已經試過 ${S[i]} → 跳過`)
        continue
      }
      if (S[i] > left) {
        nodes.push({ parent: id, label: S[i], sub: '超過', kind: 'cut' })
        notes.push(`${S[i]} > 還差的 ${left},後面更大 → 這一層結束`)
        break
      }
      cur.push(S[i])
      go(i + 1, left - S[i], id, String(S[i]))
      cur.pop()
    }
  }
  go(0, T, -1, '開始')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(節點下方是目前選的數)')] }))
}

function countFig(): FigStep[] {
  const cnt = new Map<number, number>()
  for (const x of S) cnt.set(x, (cnt.get(x) ?? 0) + 1)
  return [
    { note: '另一種寫法:先把相同的數合併成 (值, 次數)。每一層處理一種值,決定用 0 ~ 次數 個', views: [kv([...cnt], '值 → 次數')] },
    { note: '例如 1 出現 2 次:這一層分成「用 0 個 1」「用 1 個 1」「用 2 個 1」三條路,天生不會產生重複的組合', views: [kv([...cnt], '值 → 次數', [1])] },
  ]
}

export const q0040: Solution = {
  id: 40,
  plain: '從一堆數字裡挑出幾個,加起來剛好等於目標。這次**每個數字只能用一次**,而且數字本身可能重複,所以要小心不要列出一樣的組合。',
  statement: '給整數陣列 `candidates`(可能有重複)和 `target`,找出所有和為 target 的組合。每個位置的數**只能用一次**,答案不能有重複的組合。',
  examples: [
    { input: 'candidates = [10,1,2,7,6,1,5], target = 8', output: '[[1,1,6],[1,2,5],[1,7],[2,6]]' },
    { input: 'candidates = [2,5,2,1,2], target = 5', output: '[[1,2,2],[5]]' },
  ],
  constraints: ['`1 ≤ n ≤ 100`,值在 1~50,`target ≤ 30`'],
  insight: [
    '和 [39](#/q/39) 的差別:① 每個數只能用一次 → 遞迴傳 `i + 1`;② 陣列有重複 → 要去重',
    '去重和 [90](#/q/90) 一模一樣:排序後,同一層遇到和前一個相同的值就跳過',
    '排序還能剪枝:目前的數已經大於「還差多少」,後面的都不用試了',
  ],
  approaches: [
    {
      name: '排序 + 回溯 + 同層去重',
      idea: '`dfs(start, left)`:left == 0 收下;對 i 從 start 開始:同層重複就跳過,超過 left 就停,否則選它並 `dfs(i + 1, left − c[i])`。',
      steps: ['排序', '`for i in start..n−1`:`i > start` 且 `c[i] == c[i−1]` → continue', '`c[i] > left` → break', '`cur.append(c[i])`、`dfs(i + 1, left − c[i])`、`cur.pop()`'],
      figure: { title: `candidates = [${C.join(',')}], target = ${T}`, steps: btFig() },
      complexity: { time: 'O(2ⁿ · n)', space: 'O(n)', why: '最壞是所有子集;排序和剪枝讓實際上快很多。' },
      verdict: '標準解。這題把 39(組合)和 90(去重)兩個技巧組合起來。',
      code: {
        python: `def combinationSum2(candidates, target):
    c = sorted(candidates)
    res, cur = [], []

    def dfs(start, left):
        if left == 0:
            res.append(cur[:])
            return
        for i in range(start, len(c)):
            if i > start and c[i] == c[i - 1]:
                continue                  # 同一層不要選兩次一樣的值
            if c[i] > left:
                break
            cur.append(c[i])
            dfs(i + 1, left - c[i])       # i + 1:每個數只用一次
            cur.pop()

    dfs(0, target)
    return res`,
        c: `static int **res, *cols, cnt, cap, cur[100], len;

static int cmpInt(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }

static void dfs(int *c, int n, int start, int left) {
    if (left == 0) {
        if (cnt == cap) { cap *= 2; res = realloc(res, cap * sizeof(int *)); cols = realloc(cols, cap * sizeof(int)); }
        res[cnt] = malloc((len ? len : 1) * sizeof(int));
        memcpy(res[cnt], cur, len * sizeof(int));
        cols[cnt++] = len;
        return;
    }
    for (int i = start; i < n && c[i] <= left; i++) {
        if (i > start && c[i] == c[i - 1]) continue;
        cur[len++] = c[i];
        dfs(c, n, i + 1, left - c[i]);
        len--;
    }
}

int **combinationSum2(int *candidates, int candidatesSize, int target, int *returnSize, int **returnColumnSizes) {
    qsort(candidates, candidatesSize, sizeof(int), cmpInt);
    cap = 16; cnt = len = 0;
    res = malloc(cap * sizeof(int *));
    cols = malloc(cap * sizeof(int));
    dfs(candidates, candidatesSize, 0, target);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());
    vector<vector<int>> res;
    vector<int> cur;
    function<void(int, int)> dfs = [&](int start, int left) {
        if (left == 0) { res.push_back(cur); return; }
        for (int i = start; i < (int)candidates.size() && candidates[i] <= left; i++) {
            if (i > start && candidates[i] == candidates[i - 1]) continue;
            cur.push_back(candidates[i]);
            dfs(i + 1, left - candidates[i]);
            cur.pop_back();
        }
    };
    dfs(0, target);
    return res;
}`,
        java: `List<List<Integer>> combinationSum2(int[] candidates, int target) {
    Arrays.sort(candidates);
    List<List<Integer>> res = new ArrayList<>();
    dfs(candidates, 0, target, new ArrayList<>(), res);
    return res;
}

private void dfs(int[] c, int start, int left, List<Integer> cur, List<List<Integer>> res) {
    if (left == 0) { res.add(new ArrayList<>(cur)); return; }
    for (int i = start; i < c.length && c[i] <= left; i++) {
        if (i > start && c[i] == c[i - 1]) continue;
        cur.add(c[i]);
        dfs(c, i + 1, left - c[i], cur, res);
        cur.remove(cur.size() - 1);
    }
}`,
        javascript: `function combinationSum2(candidates, target) {
  const c = [...candidates].sort((a, b) => a - b);
  const res = [], cur = [];
  const dfs = (start, left) => {
    if (left === 0) {
      res.push([...cur]);
      return;
    }
    for (let i = start; i < c.length && c[i] <= left; i++) {
      if (i > start && c[i] === c[i - 1]) continue;
      cur.push(c[i]);
      dfs(i + 1, left - c[i]);
      cur.pop();
    }
  };
  dfs(0, target);
  return res;
}`,
      },
    },
    {
      name: '合併成 (值, 次數) 再回溯',
      idea: '數每個值出現幾次,排成 `(值, 次數)` 的清單。`dfs(k, left)`:處理第 k 種值,分別用 0、1、…、min(次數, left / 值) 個。',
      steps: ['`items = sorted(Counter(candidates).items())`', '`dfs(k, left)`:`left == 0` → 收下;`k == len(items)` → 結束', '`(v, c) = items[k]`:`for use in 0..c`(`use · v ≤ left`):放 use 個 v,`dfs(k + 1, left − use · v)`'],
      figure: { title: `candidates = [${C.join(',')}], target = ${T}`, steps: countFig() },
      complexity: { time: 'O(Π(cᵢ + 1))', space: 'O(n)', why: '每種值有 cᵢ + 1 種用法。重複很多時比方法一的分支少。' },
      verdict: '把「去重」換成「計數」,不需要記 `i > start` 這個條件。',
      code: {
        python: `from collections import Counter

def combinationSum2(candidates, target):
    items = sorted(Counter(candidates).items())
    res, cur = [], []

    def dfs(k, left):
        if left == 0:
            res.append(cur[:])
            return
        if k == len(items) or items[k][0] > left:
            return
        v, c = items[k]
        dfs(k + 1, left)                  # 用 0 個 v
        used = 0
        while used < c and (used + 1) * v <= left:
            used += 1
            cur.append(v)
            dfs(k + 1, left - used * v)   # 用 used 個 v
        del cur[len(cur) - used:]

    dfs(0, target)
    return res`,
        c: `static int **res, *cols, cnt, cap, cur[100], len, vals[51], cnts[51], m;

static void dfs(int k, int left) {
    if (left == 0) {
        if (cnt == cap) { cap *= 2; res = realloc(res, cap * sizeof(int *)); cols = realloc(cols, cap * sizeof(int)); }
        res[cnt] = malloc((len ? len : 1) * sizeof(int));
        memcpy(res[cnt], cur, len * sizeof(int));
        cols[cnt++] = len;
        return;
    }
    if (k == m || vals[k] > left) return;
    dfs(k + 1, left);
    int used = 0;
    while (used < cnts[k] && (used + 1) * vals[k] <= left) {
        used++;
        cur[len++] = vals[k];
        dfs(k + 1, left - used * vals[k]);
    }
    len -= used;
}

int **combinationSum2(int *candidates, int candidatesSize, int target, int *returnSize, int **returnColumnSizes) {
    int count[51] = {0};
    for (int i = 0; i < candidatesSize; i++) count[candidates[i]]++;
    m = 0;
    for (int v = 1; v <= 50; v++) if (count[v]) { vals[m] = v; cnts[m++] = count[v]; }
    cap = 16; cnt = len = 0;
    res = malloc(cap * sizeof(int *));
    cols = malloc(cap * sizeof(int));
    dfs(0, target);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> combinationSum2(vector<int>& candidates, int target) {
    map<int, int> cntMap;
    for (int x : candidates) cntMap[x]++;
    vector<pair<int, int>> items(cntMap.begin(), cntMap.end());
    vector<vector<int>> res;
    vector<int> cur;
    function<void(int, int)> dfs = [&](int k, int left) {
        if (left == 0) { res.push_back(cur); return; }
        if (k == (int)items.size() || items[k].first > left) return;
        auto [v, c] = items[k];
        dfs(k + 1, left);
        int used = 0;
        while (used < c && (used + 1) * v <= left) {
            used++;
            cur.push_back(v);
            dfs(k + 1, left - used * v);
        }
        cur.resize(cur.size() - used);
    };
    dfs(0, target);
    return res;
}`,
        java: `List<List<Integer>> combinationSum2(int[] candidates, int target) {
    TreeMap<Integer, Integer> cnt = new TreeMap<>();
    for (int x : candidates) cnt.merge(x, 1, Integer::sum);
    List<int[]> items = new ArrayList<>();
    for (var e : cnt.entrySet()) items.add(new int[]{e.getKey(), e.getValue()});
    List<List<Integer>> res = new ArrayList<>();
    dfs(items, 0, target, new ArrayList<>(), res);
    return res;
}

private void dfs(List<int[]> items, int k, int left, List<Integer> cur, List<List<Integer>> res) {
    if (left == 0) { res.add(new ArrayList<>(cur)); return; }
    if (k == items.size() || items.get(k)[0] > left) return;
    int v = items.get(k)[0], c = items.get(k)[1];
    dfs(items, k + 1, left, cur, res);
    int used = 0;
    while (used < c && (used + 1) * v <= left) {
        used++;
        cur.add(v);
        dfs(items, k + 1, left - used * v, cur, res);
    }
    for (int t = 0; t < used; t++) cur.remove(cur.size() - 1);
}`,
        javascript: `function combinationSum2(candidates, target) {
  const cnt = new Map();
  for (const x of candidates) cnt.set(x, (cnt.get(x) ?? 0) + 1);
  const items = [...cnt].sort((a, b) => a[0] - b[0]);
  const res = [], cur = [];
  const dfs = (k, left) => {
    if (left === 0) {
      res.push([...cur]);
      return;
    }
    if (k === items.length || items[k][0] > left) return;
    const [v, c] = items[k];
    dfs(k + 1, left);
    let used = 0;
    while (used < c && (used + 1) * v <= left) {
      used++;
      cur.push(v);
      dfs(k + 1, left - used * v);
    }
    cur.length -= used;
  };
  dfs(0, target);
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '遞迴傳 `i` 而不是 `i + 1`:同一個位置的數會被用很多次(那是 39 題)',
    '去重條件用 `i > 0`:會擋掉 [1,1,6] 這種「下一層選相同值」的合法組合',
    '用 set 去重後才輸出:答案對,但 n = 100 時重複的分支太多會超時',
  ],
  followUp: [{ q: '只能選 k 個、而且只能用 1~9?', a: '216. Combination Sum III:同樣的回溯,多一個「選了幾個」的限制。' }],
  check: {
    kind: 'fn',
    fn: 'combinationSum2',
    compare: 'groups',
    cases: [
      { args: [C, T], out: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] },
      { args: [[2, 5, 2, 1, 2], 5], out: [[1, 2, 2], [5]] },
      { args: [[1], 2], out: [] },
      { args: [[1, 1, 1, 1], 2], out: [[1, 1]] },
    ],
  },
}
