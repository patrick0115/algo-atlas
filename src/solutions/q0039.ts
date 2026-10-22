import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 39. Combination Sum

const C = [2, 3, 5]
const T = 8
const fmt = (s: number[]) => `[${s.join(',')}]`

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const cur: number[] = []
  const go = (start: number, left: number, parent: number, label: string) => {
    const id = nodes.length
    const ok = left === 0
    nodes.push({ parent, label, sub: fmt(cur), kind: ok ? 'ok' : undefined })
    notes.push(parent < 0 ? `每一層挑一個數加進來。為了不產生 [2,3] 和 [3,2] 這種重複,規定「只能挑和上一個一樣、或比它後面的數」(start 不往回)。同一個數可以重複挑,所以遞迴時 start 不 +1` : ok ? `加上 ${label} 剛好湊到 ${T} → 收下 ${fmt(cur)}` : `加上 ${label},還差 ${left}`)
    if (ok) return
    for (let i = start; i < C.length; i++) {
      if (C[i] > left) {
        nodes.push({ parent: id, label: C[i], sub: '超過', kind: 'cut' })
        notes.push(`${C[i]} 比還差的 ${left} 大 → 剪掉。陣列排好序,後面的數更大,也不用試了`)
        break
      }
      cur.push(C[i])
      go(i, left - C[i], id, String(C[i]))
      cur.pop()
    }
  }
  go(0, T, -1, '開始')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(節點下方是目前選的數)')] }))
}

function dpFig(): FigStep[] {
  const dp: number[][][] = Array.from({ length: T + 1 }, () => [])
  dp[0] = [[]]
  const view = (hl: number): GridViewData => ({
    kind: 'grid',
    label: 'dp[金額] = 湊出這個金額的所有組合',
    cells: dp.map((list, a) => [a, list.length ? list.map(fmt).join(' ') : '—']),
    colLabels: ['金額', '組合'],
    marks: { hl: hl >= 0 ? [[hl, 1]] : [] },
  })
  const out: FigStep[] = [{ note: '像完全背包:一次處理一種數,讓每個金額的組合加上「用這種數」的版本。一種數處理完才換下一種,所以組合裡的數會照順序出現,不會重複', views: [view(0)] }]
  for (const c of C) {
    for (let a = c; a <= T; a++) for (const comb of dp[a - c]) dp[a].push([...comb, c])
    out.push({ note: `處理 ${c}:對每個金額 a ≥ ${c},把 dp[a − ${c}] 的每個組合都加上 ${c},放進 dp[a]`, views: [view(T)] })
  }
  out.push({ note: `dp[${T}] 就是答案:${dp[T].map(fmt).join('、')}`, views: [view(T)] })
  return out
}

export const q0039: Solution = {
  id: 39,
  plain: '有幾種面額的硬幣(每種都可以用無限多個),列出所有能**剛好湊成目標金額**的組合。同樣的硬幣、只是順序不同,算同一種組合。',
  statement: '給一個**不重複**的正整數陣列 `candidates` 和目標 `target`,找出所有和為 target 的組合。同一個數可以**重複使用無限次**;兩個組合只要某個數的使用次數不同就算不同。',
  examples: [
    { input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]' },
    { input: 'candidates = [2,3,5], target = 8', output: '[[2,2,2,2],[2,3,3],[3,5]]' },
    { input: 'candidates = [2], target = 1', output: '[]' },
  ],
  constraints: ['`1 ≤ candidates.length ≤ 30`,值在 2~40,`target ≤ 40`', '保證答案少於 150 組'],
  insight: [
    '和 [78](#/q/78) 子集一樣是回溯,但多了兩個變化:① 每個數可以重複用;② 要湊到剛好的和',
    '避免重複組合([2,3] 和 [3,2]):規定組合裡的數**照陣列順序**出現 —— 遞迴時傳一個 `start`,只能從 start 往後挑',
    '可以重複用 → 遞迴下去時 start **還是 i**(不是 i + 1)',
    '剪枝:先排序,目前的數已經超過「還差多少」,後面更大的也不用試了',
  ],
  approaches: [
    {
      name: '回溯 + start 防重複 + 排序剪枝',
      idea: '`dfs(start, left)`:left 是還差多少。left == 0 → 收下;否則對 i 從 start 開始:`c[i] > left` 就停,否則選它並遞迴 `dfs(i, left − c[i])`。',
      steps: ['排序 candidates', '`dfs(start, left)`:`left == 0` → 收下 cur 的複製', '`for i in start..n−1`:`c[i] > left` → break(後面更大)', '`cur.append(c[i])`、`dfs(i, left − c[i])`(i 不加 1:可以再選)、`cur.pop()`'],
      figure: { title: `candidates = [${C.join(',')}], target = ${T}`, steps: btFig() },
      complexity: { time: 'O(n^(T/min))', space: 'O(T/min)', why: '最壞情況決策樹的深度是 target / 最小的數,每層最多 n 個分支。實際上有剪枝和答案數上限,很快。' },
      verdict: '標準解。和 40(每個數只能用一次 → 遞迴傳 i + 1,並同層去重)、216、377 一起練,分清楚「start 傳 i 還是 i + 1」。',
      code: {
        python: `def combinationSum(candidates, target):
    candidates = sorted(candidates)
    res, cur = [], []

    def dfs(start, left):
        if left == 0:
            res.append(cur[:])
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > left:
                break                     # 排序過,後面只會更大
            cur.append(c)
            dfs(i, left - c)              # 傳 i:同一個數還能再選
            cur.pop()

    dfs(0, target)
    return res`,
        c: `static int **res, *cols, cnt, cur[40], len;

static int cmpInt(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }

static void dfs(int *c, int n, int start, int left) {
    if (left == 0) {
        res[cnt] = malloc((len ? len : 1) * sizeof(int));
        memcpy(res[cnt], cur, len * sizeof(int));
        cols[cnt++] = len;
        return;
    }
    for (int i = start; i < n && c[i] <= left; i++) {
        cur[len++] = c[i];
        dfs(c, n, i, left - c[i]);
        len--;
    }
}

int **combinationSum(int *candidates, int candidatesSize, int target, int *returnSize, int **returnColumnSizes) {
    qsort(candidates, candidatesSize, sizeof(int), cmpInt);
    res = malloc(150 * sizeof(int *));
    cols = malloc(150 * sizeof(int));
    cnt = len = 0;
    dfs(candidates, candidatesSize, 0, target);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    sort(candidates.begin(), candidates.end());
    vector<vector<int>> res;
    vector<int> cur;
    function<void(int, int)> dfs = [&](int start, int left) {
        if (left == 0) { res.push_back(cur); return; }
        for (int i = start; i < (int)candidates.size() && candidates[i] <= left; i++) {
            cur.push_back(candidates[i]);
            dfs(i, left - candidates[i]);
            cur.pop_back();
        }
    };
    dfs(0, target);
    return res;
}`,
        java: `List<List<Integer>> combinationSum(int[] candidates, int target) {
    Arrays.sort(candidates);
    List<List<Integer>> res = new ArrayList<>();
    dfs(candidates, 0, target, new ArrayList<>(), res);
    return res;
}

private void dfs(int[] c, int start, int left, List<Integer> cur, List<List<Integer>> res) {
    if (left == 0) { res.add(new ArrayList<>(cur)); return; }
    for (int i = start; i < c.length && c[i] <= left; i++) {
        cur.add(c[i]);
        dfs(c, i, left - c[i], cur, res);
        cur.remove(cur.size() - 1);
    }
}`,
        javascript: `function combinationSum(candidates, target) {
  const c = [...candidates].sort((a, b) => a - b);
  const res = [], cur = [];
  const dfs = (start, left) => {
    if (left === 0) {
      res.push([...cur]);
      return;
    }
    for (let i = start; i < c.length && c[i] <= left; i++) {
      cur.push(c[i]);
      dfs(i, left - c[i]);
      cur.pop();
    }
  };
  dfs(0, target);
  return res;
}`,
      },
    },
    {
      name: '完全背包式的 DP(列出所有組合)',
      idea: '`dp[a]` = 湊出金額 a 的所有組合。外層迴圈是「數」,內層是「金額」:處理數 c 時,`dp[a] += [組合 + [c] for 組合 in dp[a − c]]`。外層是數,保證每個組合裡的數照順序加入,不會重複。',
      steps: ['`dp[0] = [[]]`,其他是空的', '對每個數 `c`:`a` 從 c 到 target:把 `dp[a − c]` 的每個組合加上 c,放進 `dp[a]`', '回傳 `dp[target]`'],
      figure: { title: `candidates = [${C.join(',')}], target = ${T}`, steps: dpFig() },
      complexity: { time: 'O(n · target · 答案大小)', space: 'O(target · 答案大小)', why: '每個金額要存所有組合。target 只有 40,很快。' },
      verdict: '如果只問「有幾種組合」,這就是 [518. Coin Change II](#/q/518) 的標準 DP(只存數量)。兩題對照,能看出回溯和 DP 的關係。',
      code: {
        python: `def combinationSum(candidates, target):
    dp = [[] for _ in range(target + 1)]
    dp[0] = [[]]
    for c in candidates:                  # 外層是數:組合裡的數照順序加入,不會重複
        for a in range(c, target + 1):
            for comb in dp[a - c]:
                dp[a].append(comb + [c])
    return dp[target]`,
        c: `// 每個金額存一串組合(和長度)
typedef struct { int **v; int *len; int n, cap; } Bucket;

static void push(Bucket *b, int *v, int len) {
    if (b->n == b->cap) {
        b->cap = b->cap ? b->cap * 2 : 4;
        b->v = realloc(b->v, b->cap * sizeof(int *));
        b->len = realloc(b->len, b->cap * sizeof(int));
    }
    b->v[b->n] = v;
    b->len[b->n++] = len;
}

int **combinationSum(int *candidates, int candidatesSize, int target, int *returnSize, int **returnColumnSizes) {
    Bucket *dp = calloc(target + 1, sizeof(Bucket));
    push(&dp[0], malloc(sizeof(int)), 0);
    for (int k = 0; k < candidatesSize; k++) {
        int c = candidates[k];
        for (int a = c; a <= target; a++)
            for (int j = 0, m = dp[a - c].n; j < m; j++) {
                int l = dp[a - c].len[j];
                int *v = malloc((l + 1) * sizeof(int));
                memcpy(v, dp[a - c].v[j], l * sizeof(int));
                v[l] = c;
                push(&dp[a], v, l + 1);
            }
    }
    *returnSize = dp[target].n;
    *returnColumnSizes = dp[target].len;
    return dp[target].v;
}`,
        cpp: `vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
    vector<vector<vector<int>>> dp(target + 1);
    dp[0] = {{}};
    for (int c : candidates)
        for (int a = c; a <= target; a++)
            for (auto comb : dp[a - c]) {      // 複製一份再加上 c
                comb.push_back(c);
                dp[a].push_back(comb);
            }
    return dp[target];
}`,
        java: `List<List<Integer>> combinationSum(int[] candidates, int target) {
    List<List<List<Integer>>> dp = new ArrayList<>();
    for (int a = 0; a <= target; a++) dp.add(new ArrayList<>());
    dp.get(0).add(new ArrayList<>());
    for (int c : candidates)
        for (int a = c; a <= target; a++)
            for (List<Integer> comb : dp.get(a - c)) {
                List<Integer> next = new ArrayList<>(comb);
                next.add(c);
                dp.get(a).add(next);
            }
    return dp.get(target);
}`,
        javascript: `function combinationSum(candidates, target) {
  const dp = Array.from({ length: target + 1 }, () => []);
  dp[0] = [[]];
  for (const c of candidates)
    for (let a = c; a <= target; a++) for (const comb of dp[a - c]) dp[a].push([...comb, c]);
  return dp[target];
}`,
      },
    },
  ],
  pitfalls: [
    '遞迴時傳 `i + 1`:每個數只能用一次(那是 40 題),這題要傳 `i`',
    '遞迴時從 0 開始(不傳 start):會產生 [2,3,3]、[3,2,3]、[3,3,2] 這種重複組合',
    '沒排序就用 break 剪枝:後面可能還有更小的數,會漏答案(沒排序的話只能用 continue)',
    'DP 版外層放金額、內層放數:會把不同順序當成不同組合(那是 377 題「排列數」)',
  ],
  followUp: [
    { q: '每個數只能用一次、而且陣列有重複?', a: '[40. Combination Sum II](#/q/40):遞迴傳 `i + 1`,並且同一層跳過和前一個相同的數。' },
    { q: '只要組合數量?', a: '[518. Coin Change II](#/q/518):dp[a] += dp[a − c],外層是硬幣、內層是金額。' },
  ],
  check: {
    kind: 'fn',
    fn: 'combinationSum',
    compare: 'groups',
    cases: [
      { args: [[2, 3, 6, 7], 7], out: [[2, 2, 3], [7]] },
      { args: [C, T], out: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
      { args: [[2], 1], out: [] },
      { args: [[7, 3, 2], 18], out: [[2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 3, 3], [2, 2, 2, 2, 3, 7], [2, 2, 2, 3, 3, 3, 3], [2, 2, 7, 7], [2, 3, 3, 3, 7], [3, 3, 3, 3, 3, 3]] },
    ],
  },
}
