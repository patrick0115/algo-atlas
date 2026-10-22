import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 46. Permutations

const A = [1, 2, 3]
const fmt = (s: number[]) => `[${s.join(',')}]`

function usedFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const used = A.map(() => false)
  const cur: number[] = []
  const go = (parent: number, label: string) => {
    const id = nodes.length
    const done = cur.length === A.length
    nodes.push({ parent, label, sub: fmt(cur), kind: done ? 'ok' : undefined })
    notes.push(parent < 0 ? '每一層從「還沒用過的數」裡挑一個放到下一格。第 1 格有 3 種選法、第 2 格 2 種、第 3 格 1 種 → 3! = 6 種排列' : done ? `每一格都放好了 → 得到排列 ${fmt(cur)}` : `放 ${label}:目前 ${fmt(cur)},還沒用過的是 ${A.filter((_, i) => !used[i]).join('、')}`)
    if (done) return
    A.forEach((x, i) => {
      if (used[i]) return
      used[i] = true
      cur.push(x)
      go(id, String(x))
      cur.pop()
      used[i] = false
    })
  }
  go(-1, '開始')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(節點下方是目前的排列)')] }))
}

function swapFig(): FigStep[] {
  const a = [...A]
  const out: FigStep[] = [{ note: '不用 used 陣列:第 i 格要放誰,就把那個數**換**到第 i 格。i 左邊是已經決定好的,右邊是還能選的', views: [arr(a, { label: 'nums' })] }]
  const go = (i: number) => {
    if (i === a.length) {
      out.push({ note: `全部決定好 → ${fmt(a)}`, views: [arr(a, { label: 'nums', done: a.map((_, k) => k) })] })
      return
    }
    for (let j = i; j < a.length; j++) {
      ;[a[i], a[j]] = [a[j], a[i]]
      out.push({ note: `第 ${i} 格放 ${a[i]}(和第 ${j} 格交換)`, views: [arr(a, { label: 'nums', highlight: [i], compare: j !== i ? [j] : [], done: a.map((_, k) => k).filter((k) => k < i) })] })
      go(i + 1)
      ;[a[i], a[j]] = [a[j], a[i]]
    }
  }
  go(0)
  return out
}

function insertFig(): FigStep[] {
  let res: number[][] = [[]]
  const out: FigStep[] = [{ note: '迭代:從空的排列開始,每來一個新的數,就把它插進目前每個排列的**每一個空隙**', views: [arr(['[]'], { label: '目前的排列' })] }]
  for (const x of A) {
    const next: number[][] = []
    for (const p of res) for (let k = 0; k <= p.length; k++) next.push([...p.slice(0, k), x, ...p.slice(k)])
    res = next
    out.push({ note: `插入 ${x}:每個長度 ${res[0].length - 1} 的排列有 ${res[0].length} 個空隙 → 共 ${res.length} 個排列`, views: [arr(res.map(fmt), { label: '目前的排列' })] })
  }
  return out
}

export const q0046: Solution = {
  id: 46,
  plain: '列出一組數字的**所有排列方式**(順序不同就算不同)。像 3 個人排隊,第 1 個位置有 3 種人選、第 2 個剩 2 種、第 3 個剩 1 種,共 6 種。',
  statement: '給一個**元素都不同**的整數陣列 `nums`,回傳所有可能的排列,順序不限。',
  examples: [
    { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
    { input: 'nums = [0,1]', output: '[[0,1],[1,0]]' },
  ],
  constraints: ['`1 ≤ n ≤ 6` → 最多 6! = 720 個排列'],
  insight: [
    '排列和子集([78](#/q/78))的差別:子集是「選不選」,排列是「每一格放誰」,而且每個數只能用一次',
    '回溯:每一層填一格,從「還沒用過的數」裡挑一個;用 `used` 陣列記哪些用過',
    '也可以用「交換」:把要放在第 i 格的數換到第 i 格,左邊是已決定的、右邊是剩下的,不需要 used',
  ],
  approaches: [
    {
      name: '回溯 + used 陣列',
      idea: '`dfs()`:cur 滿了就收;否則對每個還沒用過的數:標記、放進 cur、遞迴、再撤銷。',
      steps: ['`used = [False] * n`、`cur = []`', '`len(cur) == n` → 收下 `cur` 的複製', '對每個 `i`:`used[i]` 就跳過', '`used[i] = True`、`cur.append(nums[i])`、`dfs()`、`cur.pop()`、`used[i] = False`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: usedFig() },
      complexity: { time: 'O(n · n!)', space: 'O(n)', why: 'n! 個排列,每個複製 O(n)。遞迴深度 n,used 陣列 n。' },
      verdict: '標準解,[[p:backtracking]]「排列型」的模板。47(有重複)就是在這裡加一個「同層去重」的條件。',
      code: {
        python: `def permute(nums):
    res, cur = [], []
    used = [False] * len(nums)

    def dfs():
        if len(cur) == len(nums):
            res.append(cur[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True                # 做選擇
            cur.append(x)
            dfs()
            cur.pop()                     # 撤銷選擇
            used[i] = False

    dfs()
    return res`,
        c: `static int **res, cnt, cur[6], len;
static bool used[6];

static void dfs(int *nums, int n) {
    if (len == n) {
        res[cnt] = malloc(n * sizeof(int));
        memcpy(res[cnt++], cur, n * sizeof(int));
        return;
    }
    for (int i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = true;
        cur[len++] = nums[i];
        dfs(nums, n);
        len--;
        used[i] = false;
    }
}

int **permute(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    int total = 1;
    for (int i = 2; i <= numsSize; i++) total *= i;
    res = malloc(total * sizeof(int *));
    cnt = len = 0;
    memset(used, 0, sizeof(used));
    dfs(nums, numsSize);
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = numsSize;
    return res;
}`,
        cpp: `vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> cur;
    vector<bool> used(nums.size(), false);
    function<void()> dfs = [&]() {
        if (cur.size() == nums.size()) { res.push_back(cur); return; }
        for (size_t i = 0; i < nums.size(); i++) {
            if (used[i]) continue;
            used[i] = true;
            cur.push_back(nums[i]);
            dfs();
            cur.pop_back();
            used[i] = false;
        }
    };
    dfs();
    return res;
}`,
        java: `List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    dfs(nums, new boolean[nums.length], new ArrayList<>(), res);
    return res;
}

private void dfs(int[] nums, boolean[] used, List<Integer> cur, List<List<Integer>> res) {
    if (cur.size() == nums.length) { res.add(new ArrayList<>(cur)); return; }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        used[i] = true;
        cur.add(nums[i]);
        dfs(nums, used, cur, res);
        cur.remove(cur.size() - 1);
        used[i] = false;
    }
}`,
        javascript: `function permute(nums) {
  const res = [], cur = [], used = new Array(nums.length).fill(false);
  const dfs = () => {
    if (cur.length === nums.length) {
      res.push([...cur]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      cur.push(nums[i]);
      dfs();
      cur.pop();
      used[i] = false;
    }
  };
  dfs();
  return res;
}`,
      },
    },
    {
      name: '回溯 + 原地交換',
      idea: '`dfs(i)`:第 i 格要放誰?讓 j 從 i 到 n−1,把 `nums[j]` 換到第 i 格,遞迴 `dfs(i + 1)`,再換回來。',
      steps: ['`dfs(i)`:`i == n` → 收下 `nums` 的複製', '`for j in i..n−1`:`swap(i, j)`、`dfs(i + 1)`、`swap(i, j)`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: swapFig() },
      complexity: { time: 'O(n · n!)', space: 'O(n)', why: '同樣產生 n! 個;不需要 used 和 cur,只有遞迴深度 n。' },
      verdict: '省掉 used 陣列。輸出的順序和字典序不同,題目不要求順序所以沒關係。',
      code: {
        python: `def permute(nums):
    res = []

    def dfs(i):
        if i == len(nums):
            res.append(nums[:])
            return
        for j in range(i, len(nums)):
            nums[i], nums[j] = nums[j], nums[i]   # 把 nums[j] 換到第 i 格
            dfs(i + 1)
            nums[i], nums[j] = nums[j], nums[i]   # 換回來

    dfs(0)
    return res`,
        c: `static int **res, cnt;

static void dfs(int *a, int n, int i) {
    if (i == n) {
        res[cnt] = malloc(n * sizeof(int));
        memcpy(res[cnt++], a, n * sizeof(int));
        return;
    }
    for (int j = i; j < n; j++) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
        dfs(a, n, i + 1);
        t = a[i]; a[i] = a[j]; a[j] = t;
    }
}

int **permute(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    int total = 1;
    for (int i = 2; i <= numsSize; i++) total *= i;
    res = malloc(total * sizeof(int *));
    cnt = 0;
    dfs(nums, numsSize, 0);
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = numsSize;
    return res;
}`,
        cpp: `vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> res;
    function<void(int)> dfs = [&](int i) {
        if (i == (int)nums.size()) { res.push_back(nums); return; }
        for (int j = i; j < (int)nums.size(); j++) {
            swap(nums[i], nums[j]);
            dfs(i + 1);
            swap(nums[i], nums[j]);
        }
    };
    dfs(0);
    return res;
}`,
        java: `List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    dfs(nums, 0, res);
    return res;
}

private void dfs(int[] a, int i, List<List<Integer>> res) {
    if (i == a.length) {
        List<Integer> p = new ArrayList<>();
        for (int x : a) p.add(x);
        res.add(p);
        return;
    }
    for (int j = i; j < a.length; j++) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
        dfs(a, i + 1, res);
        t = a[i]; a[i] = a[j]; a[j] = t;
    }
}`,
        javascript: `function permute(nums) {
  const a = [...nums], res = [];
  const dfs = (i) => {
    if (i === a.length) {
      res.push([...a]);
      return;
    }
    for (let j = i; j < a.length; j++) {
      [a[i], a[j]] = [a[j], a[i]];
      dfs(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
  };
  dfs(0);
  return res;
}`,
      },
    },
    {
      name: '迭代:把新的數插進每個空隙',
      idea: '從 `[[]]` 開始。每來一個數 x,對目前的每個排列,把 x 插到每一個可能的位置(長度 L 的排列有 L + 1 個位置)。',
      steps: ['`res = [[]]`', '對每個 `x`:`res = [p[:k] + [x] + p[k:] for p in res for k in 0..len(p)]`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: insertFig() },
      complexity: { time: 'O(n · n!)', space: 'O(n!)', why: '每一輪都產生新的一批排列。' },
      verdict: '不用遞迴,很好理解「為什麼是 n!」:1 × 2 × 3 × … × n 個空隙的選法。',
      code: {
        python: `def permute(nums):
    res = [[]]
    for x in nums:
        res = [p[:k] + [x] + p[k:] for p in res for k in range(len(p) + 1)]
    return res`,
        c: `int **permute(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    int total = 1;
    for (int i = 2; i <= numsSize; i++) total *= i;
    int **cur = malloc(total * sizeof(int *)), **nxt = malloc(total * sizeof(int *));
    int cnt = 1;
    cur[0] = malloc(sizeof(int));
    for (int len = 0; len < numsSize; len++) {          // 目前每個排列的長度是 len
        int m = 0;
        for (int p = 0; p < cnt; p++)
            for (int k = 0; k <= len; k++) {
                int *q = malloc((len + 1) * sizeof(int));
                memcpy(q, cur[p], k * sizeof(int));
                q[k] = nums[len];
                memcpy(q + k + 1, cur[p] + k, (len - k) * sizeof(int));
                nxt[m++] = q;
            }
        for (int p = 0; p < cnt; p++) free(cur[p]);
        int **t = cur; cur = nxt; nxt = t;
        cnt = m;
    }
    free(nxt);
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = numsSize;
    return cur;
}`,
        cpp: `vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> res = {{}};
    for (int x : nums) {
        vector<vector<int>> next;
        for (auto& p : res)
            for (size_t k = 0; k <= p.size(); k++) {
                auto q = p;
                q.insert(q.begin() + k, x);
                next.push_back(q);
            }
        res = next;
    }
    return res;
}`,
        java: `List<List<Integer>> permute(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    res.add(new ArrayList<>());
    for (int x : nums) {
        List<List<Integer>> next = new ArrayList<>();
        for (List<Integer> p : res)
            for (int k = 0; k <= p.size(); k++) {
                List<Integer> q = new ArrayList<>(p);
                q.add(k, x);
                next.add(q);
            }
        res = next;
    }
    return res;
}`,
        javascript: `function permute(nums) {
  let res = [[]];
  for (const x of nums) {
    const next = [];
    for (const p of res)
      for (let k = 0; k <= p.length; k++) next.push([...p.slice(0, k), x, ...p.slice(k)]);
    res = next;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '收答案時沒有複製 cur(或 nums):之後的修改會改到已經收下的答案',
    '回溯忘了把 `used[i]` 改回 False:之後的分支會以為這個數還被用著',
    '交換版忘了換回來:陣列狀態會亂掉,產生重複或漏掉的排列',
  ],
  followUp: [
    { q: '有重複的數?', a: '47. Permutations II:先排序,`used` 版加上「`nums[i] == nums[i−1]` 且 `nums[i−1]` 這一層還沒用過 → 跳過」。' },
    { q: '只要「下一個」排列?', a: '31. Next Permutation:從右邊找第一個下降的位置,和右邊比它大的最小數交換,再把右半段反轉,O(n)。' },
  ],
  check: {
    kind: 'fn',
    fn: 'permute',
    compare: 'sorted',
    cases: [
      { args: [[1, 2, 3]], out: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[0, 1]], out: [[0, 1], [1, 0]] },
      { args: [[1]], out: [[1]] },
    ],
  },
}
