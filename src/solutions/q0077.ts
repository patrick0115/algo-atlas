import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 77. Combinations

const N = 4
const K = 2
const fmt = (s: number[]) => `[${s.join(',')}]`

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const cur: number[] = []
  const go = (start: number, parent: number, label: string) => {
    const id = nodes.length
    const full = cur.length === K
    nodes.push({ parent, label, sub: fmt(cur), kind: full ? 'ok' : undefined })
    notes.push(parent < 0 ? `從 1..${N} 挑 ${K} 個,不在乎順序 → 只往「比上一個大」的數挑,就不會出現 [2,1] 這種重複` : full ? `湊滿 ${K} 個:${fmt(cur)} 收進答案` : `選了 ${label},目前 ${fmt(cur)},接著只能從 ${start} 以後挑`)
    if (full) return
    for (let i = start; i <= N; i++) {
      if (N - i + 1 < K - cur.length) {
        nodes.push({ parent: id, label: i, sub: '剩下不夠', kind: 'cut' })
        notes.push(`從 ${i} 開始只剩 ${N - i + 1} 個數,還需要 ${K - cur.length} 個 → 不可能湊滿,剪掉`)
        break
      }
      cur.push(i)
      go(i + 1, id, String(i))
      cur.pop()
    }
  }
  go(1, -1, '[]')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(實心 = 找到答案,淡色 = 剪掉)')] }))
}

function bitFig(): FigStep[] {
  return [
    { note: `另一種:每個組合對應一個 ${N} 位的二進位數,第 i 位是 1 代表選了 i + 1。枚舉 0..2^${N} − 1,只留下剛好有 ${K} 個 1 的`, views: [arr(['0011', '0101', '0110', '1001', '1010', '1100'], { label: `有 ${K} 個 1 的遮罩` })] },
    { note: '0011 → [1,2]、0101 → [1,3]、0110 → [2,3]…共 C(4,2) = 6 個。缺點是要掃全部 2ⁿ 個遮罩', views: [arr(['[1,2]', '[1,3]', '[2,3]', '[1,4]', '[2,4]', '[3,4]'], { label: '答案', done: [0, 1, 2, 3, 4, 5] })] },
  ]
}

export const q0077: Solution = {
  id: 77,
  plain: '從 1 到 n 這些數字裡挑出 k 個(不在乎順序),把所有挑法列出來。',
  statement: '給兩個整數 n 和 k,回傳從 `[1, n]` 中選出 k 個數的所有組合,順序不限。',
  examples: [
    { input: 'n = 4, k = 2', output: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' },
    { input: 'n = 1, k = 1', output: '[[1]]' },
  ],
  constraints: ['1 ≤ k ≤ n ≤ 20'],
  insight: ['組合不在乎順序 → 規定只能由小往大挑,每種組合只會出現一次', '[[p:backtracking]]:選一個、遞迴、撤回', '剪枝:剩下的數不夠湊滿 k 個就不用往下'],
  approaches: [
    {
      name: '回溯 + 剪枝',
      idea: '`dfs(start)`:湊滿 k 個就收下;否則 `for i in start..n − (k − len) + 1`:選 i、`dfs(i + 1)`、撤回。',
      steps: ['`cur = []`', '`len(cur) == k` → 收下 `cur[:]`', '`for i in range(start, n − (k − len(cur)) + 2)`', 'push i、`dfs(i + 1)`、pop'],
      figure: { title: `n = ${N},k = ${K}`, steps: btFig() },
      complexity: { time: 'O(k · C(n, k))', space: 'O(k)', why: '共 C(n, k) 個組合,每個複製花 O(k);遞迴深度 k。' },
      verdict: '最推薦,組合類回溯的模板;上界 `n − (k − len) + 1` 是很好用的剪枝。',
      code: {
        python: `def combine(n, k):
    res, cur = [], []

    def dfs(start):
        if len(cur) == k:
            res.append(cur[:])                # 湊滿了,收一份拷貝
            return
        for i in range(start, n - (k - len(cur)) + 2):   # 剩下的數要夠
            cur.append(i)
            dfs(i + 1)                        # 下一個只能比 i 大
            cur.pop()

    dfs(1)
    return res`,
        c: `static int **res, cnt, cur[20], len, N, K;

static void dfs(int start) {
    if (len == K) {
        res[cnt] = malloc(K * sizeof(int));
        memcpy(res[cnt++], cur, K * sizeof(int));
        return;
    }
    for (int i = start; i <= N - (K - len) + 1; i++) {
        cur[len++] = i;
        dfs(i + 1);
        len--;
    }
}

int **combine(int n, int k, int *returnSize, int **returnColumnSizes) {
    long long total = 1;
    for (int i = 1; i <= k; i++) total = total * (n - k + i) / i;   // C(n, k)
    res = malloc(total * sizeof(int *));
    cnt = len = 0; N = n; K = k;
    dfs(1);
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = k;
    return res;
}`,
        cpp: `vector<vector<int>> combine(int n, int k) {
    vector<vector<int>> res;
    vector<int> cur;
    function<void(int)> dfs = [&](int start) {
        if ((int)cur.size() == k) { res.push_back(cur); return; }
        for (int i = start; i <= n - (k - (int)cur.size()) + 1; i++) {
            cur.push_back(i);
            dfs(i + 1);
            cur.pop_back();
        }
    };
    dfs(1);
    return res;
}`,
        java: `List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> res = new ArrayList<>();
    dfs(1, n, k, new ArrayList<>(), res);
    return res;
}

void dfs(int start, int n, int k, List<Integer> cur, List<List<Integer>> res) {
    if (cur.size() == k) { res.add(new ArrayList<>(cur)); return; }
    for (int i = start; i <= n - (k - cur.size()) + 1; i++) {
        cur.add(i);
        dfs(i + 1, n, k, cur, res);
        cur.remove(cur.size() - 1);
    }
}`,
        javascript: `function combine(n, k) {
  const res = [], cur = [];
  const dfs = (start) => {
    if (cur.length === k) {
      res.push([...cur]);
      return;
    }
    for (let i = start; i <= n - (k - cur.length) + 1; i++) {
      cur.push(i);
      dfs(i + 1);
      cur.pop();
    }
  };
  dfs(1);
  return res;
}`,
      },
    },
    {
      name: '位元遮罩枚舉',
      idea: '枚舉 `mask` 從 0 到 2ⁿ − 1,1 的個數剛好是 k 的就轉成組合。',
      steps: ['`for mask in range(1 << n)`', '`popcount(mask) == k` → 把每個為 1 的位 i 換成 i + 1', '收進答案'],
      figure: { title: `n = ${N},k = ${K}`, steps: bitFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(k)', why: '掃全部遮罩,每個檢查 n 位。' },
      verdict: '寫法短、不用遞迴;n ≤ 20 時 2ⁿ ≈ 10⁶ 還可以,但比回溯多做很多無用功。',
      code: {
        python: `def combine(n, k):
    res = []
    for mask in range(1 << n):
        if bin(mask).count('1') == k:         # 剛好選了 k 個
            res.append([i + 1 for i in range(n) if mask >> i & 1])
    return res`,
        c: `int **combine(int n, int k, int *returnSize, int **returnColumnSizes) {
    int cap = 0;
    for (int m = 0; m < (1 << n); m++) if (__builtin_popcount(m) == k) cap++;
    int **res = malloc(cap * sizeof(int *));
    *returnColumnSizes = malloc(cap * sizeof(int));
    int cnt = 0;
    for (int m = 0; m < (1 << n); m++) {
        if (__builtin_popcount(m) != k) continue;
        res[cnt] = malloc(k * sizeof(int));
        int t = 0;
        for (int i = 0; i < n; i++) if (m >> i & 1) res[cnt][t++] = i + 1;
        (*returnColumnSizes)[cnt++] = k;
    }
    *returnSize = cnt;
    return res;
}`,
        cpp: `vector<vector<int>> combine(int n, int k) {
    vector<vector<int>> res;
    for (int m = 0; m < (1 << n); m++) {
        if (__builtin_popcount(m) != k) continue;
        vector<int> c;
        for (int i = 0; i < n; i++) if (m >> i & 1) c.push_back(i + 1);
        res.push_back(c);
    }
    return res;
}`,
        java: `List<List<Integer>> combine(int n, int k) {
    List<List<Integer>> res = new ArrayList<>();
    for (int m = 0; m < (1 << n); m++) {
        if (Integer.bitCount(m) != k) continue;
        List<Integer> c = new ArrayList<>();
        for (int i = 0; i < n; i++) if ((m >> i & 1) == 1) c.add(i + 1);
        res.add(c);
    }
    return res;
}`,
        javascript: `function combine(n, k) {
  const res = [];
  for (let m = 0; m < 1 << n; m++) {
    const c = [];
    for (let i = 0; i < n; i++) if ((m >> i) & 1) c.push(i + 1);
    if (c.length === k) res.push(c);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['下一層從 0 或 start 開始而不是 i + 1:會選到重複的數或出現 [2,1]', '收答案時放進 cur 本身而不是拷貝:之後 pop 會把答案改掉'],
  check: {
    kind: 'fn',
    fn: 'combine',
    compare: 'groups',
    cases: [
      { args: [N, K], out: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]] },
      { args: [1, 1], out: [[1]] },
      { args: [3, 3], out: [[1, 2, 3]] },
      { args: [5, 1], out: [[1], [2], [3], [4], [5]] },
    ],
  },
}
