import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { recLayout, recView, type RNode } from './fig'

// 78. Subsets

const A = [1, 2, 3]

const fmt = (s: number[]) => `[${s.join(',')}]`

function pickFig(): FigStep[] {
  // 「選或不選」的決策樹:第 i 層決定 A[i] 要不要放
  const nodes: RNode[] = []
  const notes: string[] = []
  const res: string[] = []
  const go = (i: number, cur: number[], parent: number, how: string) => {
    const id = nodes.length
    nodes.push({ parent, label: parent < 0 ? '開始' : how, sub: fmt(cur), kind: i === A.length ? 'ok' : undefined })
    if (i === A.length) {
      res.push(fmt(cur))
      notes.push(`每個數都決定好了 → 得到一個子集 ${fmt(cur)}(第 ${res.length} 個)`)
      return
    }
    notes.push(parent < 0 ? '每一層決定一個數「要」或「不要」,走到底就是一個子集。3 個數 → 2³ = 8 個子集' : `${how}:目前 ${fmt(cur)},接著決定 ${A[i]}`)
    go(i + 1, [...cur, A[i]], id, `要 ${A[i]}`)
    go(i + 1, cur, id, `不要 ${A[i]}`)
  }
  go(0, [], -1, '')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k)] }))
}

function iterFig(): FigStep[] {
  let res: number[][] = [[]]
  const out: FigStep[] = [{ note: '一開始只有空集合。之後每來一個數,就把「目前所有子集」各複製一份、加上這個數', views: [arr(res.map(fmt), { label: '目前的子集' })] }]
  for (const x of A) {
    const add = res.map((s) => [...s, x])
    res = [...res, ...add]
    out.push({ note: `加入 ${x}:原本的 ${res.length / 2} 個子集都多一份「加上 ${x}」的版本 → 共 ${res.length} 個`, views: [arr(res.map(fmt), { label: '目前的子集', highlight: add.map((_, i) => res.length / 2 + i) })] })
  }
  return out
}

function bitFig(): FigStep[] {
  const n = A.length
  const out: FigStep[] = [{ note: `n 個數的每個子集,可以對應到一個 n 位元的二進位數:第 i 位是 1 就代表選了 A[i]。所以 0 到 2ⁿ − 1 = ${2 ** n - 1} 剛好列出所有子集`, views: [arr(A, { label: 'nums' })] }]
  for (let m = 0; m < 1 << n; m++) {
    const s = A.filter((_, i) => m & (1 << i))
    const bits = m.toString(2).padStart(n, '0')
    out.push({ note: `mask = ${m} = ${bits}(二進位,右邊是第 0 位)→ ${fmt(s)}`, views: [arr([...bits].reverse(), { label: '第 0、1、2 位', highlight: [...bits].reverse().flatMap((b, i) => (b === '1' ? [i] : [])) }), arr(A, { label: 'nums', highlight: A.flatMap((_, i) => (m & (1 << i) ? [i] : [])) })] })
  }
  return out
}

export const q0078: Solution = {
  id: 78,
  plain: '列出一堆數字的**所有子集**(包含什麼都不選、全部都選)。每個數只有兩種命運:選或不選,所以 n 個數會有 2ⁿ 種組合。',
  statement: '給一個整數陣列 `nums`(元素都不同),回傳它所有可能的子集(冪集),不能有重複的子集,順序不限。',
  examples: [
    { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
    { input: 'nums = [0]', output: '[[],[0]]' },
  ],
  constraints: ['`1 ≤ n ≤ 10`,元素都不同 → 最多 2¹⁰ = 1024 個子集,全部列出來沒問題'],
  insight: [
    '子集的個數是 2ⁿ:每個數「選或不選」兩種,n 個數就是 2 × 2 × … × 2',
    '回溯的想法:畫出一棵決策樹,第 i 層決定第 i 個數要不要,走到最底層就得到一個子集',
    '迭代的想法:有了前 i 個數的所有子集,加入第 i+1 個數 = 原本的全部 + 原本的全部各加上新的數',
    '位元的想法:一個子集 ⇔ 一個 n 位元的二進位數(第 i 位是不是 1 = 有沒有選第 i 個)',
  ],
  approaches: [
    {
      name: '回溯:每個數選或不選',
      idea: '`dfs(i, cur)`:i 走到底就把 cur 收進答案;否則先「選 nums[i]」遞迴,再「不選」遞迴。',
      steps: ['`dfs(i)`:`i == n` → 收下 `cur` 的複製', '`cur.append(nums[i])`,`dfs(i + 1)`,`cur.pop()`(回溯:還原)', '`dfs(i + 1)`(不選)'],
      figure: { title: `nums = [${A.join(',')}]`, steps: pickFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)', why: '共 2ⁿ 個子集,每個複製出來要 O(n)。遞迴深度 n(不算答案)。' },
      verdict: '[[p:backtracking]]的入門題。「做選擇 → 遞迴 → 撤銷選擇」這個模板,90、39、40、46 都是在它上面加條件。',
      code: {
        python: `def subsets(nums):
    res, cur = [], []

    def dfs(i):
        if i == len(nums):
            res.append(cur[:])            # 要複製,cur 之後還會變
            return
        cur.append(nums[i])               # 選 nums[i]
        dfs(i + 1)
        cur.pop()                         # 撤銷選擇
        dfs(i + 1)                        # 不選 nums[i]

    dfs(0)
    return res`,
        c: `static int **res, *cols, cnt, cur[10], len;

static void dfs(int *nums, int n, int i) {
    if (i == n) {
        res[cnt] = malloc((len ? len : 1) * sizeof(int));
        memcpy(res[cnt], cur, len * sizeof(int));
        cols[cnt++] = len;
        return;
    }
    cur[len++] = nums[i];
    dfs(nums, n, i + 1);
    len--;
    dfs(nums, n, i + 1);
}

int **subsets(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    res = malloc((1 << numsSize) * sizeof(int *));
    cols = malloc((1 << numsSize) * sizeof(int));
    cnt = len = 0;
    dfs(nums, numsSize, 0);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> res;
    vector<int> cur;
    function<void(int)> dfs = [&](int i) {
        if (i == (int)nums.size()) { res.push_back(cur); return; }
        cur.push_back(nums[i]);
        dfs(i + 1);
        cur.pop_back();
        dfs(i + 1);
    };
    dfs(0);
    return res;
}`,
        java: `List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    dfs(nums, 0, new ArrayList<>(), res);
    return res;
}

private void dfs(int[] nums, int i, List<Integer> cur, List<List<Integer>> res) {
    if (i == nums.length) { res.add(new ArrayList<>(cur)); return; }
    cur.add(nums[i]);
    dfs(nums, i + 1, cur, res);
    cur.remove(cur.size() - 1);
    dfs(nums, i + 1, cur, res);
}`,
        javascript: `function subsets(nums) {
  const res = [], cur = [];
  const dfs = (i) => {
    if (i === nums.length) {
      res.push([...cur]);
      return;
    }
    cur.push(nums[i]);
    dfs(i + 1);
    cur.pop();
    dfs(i + 1);
  };
  dfs(0);
  return res;
}`,
      },
    },
    {
      name: '迭代:每加一個數,答案翻倍',
      idea: '從 `[[]]` 開始。每個數 x:把目前所有子集各複製一份並加上 x,接到後面。',
      steps: ['`res = [[]]`', '對每個 `x`:`res += [s + [x] for s in res]`', '回傳 `res`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: iterFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(1)', why: '總共產生 2ⁿ 個子集;除了答案不需要額外空間。' },
      verdict: '最短、最直觀,不用遞迴。',
      code: {
        python: `def subsets(nums):
    res = [[]]
    for x in nums:
        res += [s + [x] for s in res]     # 每個舊的子集都多一份「加上 x」的版本
    return res`,
        c: `int **subsets(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    int total = 1 << numsSize, cnt = 1;
    int **res = malloc(total * sizeof(int *));
    int *cols = malloc(total * sizeof(int));
    res[0] = malloc(sizeof(int)); cols[0] = 0;
    for (int k = 0; k < numsSize; k++) {
        int now = cnt;
        for (int i = 0; i < now; i++) {
            res[cnt] = malloc((cols[i] + 1) * sizeof(int));
            memcpy(res[cnt], res[i], cols[i] * sizeof(int));
            res[cnt][cols[i]] = nums[k];
            cols[cnt++] = cols[i] + 1;
        }
    }
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> res = {{}};
    for (int x : nums) {
        int now = res.size();
        for (int i = 0; i < now; i++) {
            res.push_back(res[i]);
            res.back().push_back(x);
        }
    }
    return res;
}`,
        java: `List<List<Integer>> subsets(int[] nums) {
    List<List<Integer>> res = new ArrayList<>();
    res.add(new ArrayList<>());
    for (int x : nums) {
        int now = res.size();
        for (int i = 0; i < now; i++) {
            List<Integer> s = new ArrayList<>(res.get(i));
            s.add(x);
            res.add(s);
        }
    }
    return res;
}`,
        javascript: `function subsets(nums) {
  let res = [[]];
  for (const x of nums) res = [...res, ...res.map((s) => [...s, x])];
  return res;
}`,
      },
    },
    {
      name: '位元遮罩',
      idea: '`mask` 從 0 到 2ⁿ − 1,第 i 位是 1 就把 `nums[i]` 放進這個子集。',
      steps: ['對 `mask` 從 0 到 `2ⁿ − 1`', '`[nums[i] for i if mask & (1 << i)]` 收進答案'],
      figure: { title: `nums = [${A.join(',')}]`, steps: bitFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(1)', why: '2ⁿ 個 mask,每個檢查 n 位。' },
      verdict: '最機械化,也是[[p:bit-manipulation]]列舉子集的標準手法。n 最多到 30 左右(int 的位數)。',
      code: {
        python: `def subsets(nums):
    n = len(nums)
    return [[nums[i] for i in range(n) if mask >> i & 1] for mask in range(1 << n)]`,
        c: `int **subsets(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    int total = 1 << numsSize;
    int **res = malloc(total * sizeof(int *));
    int *cols = malloc(total * sizeof(int));
    for (int mask = 0; mask < total; mask++) {
        res[mask] = malloc((numsSize ? numsSize : 1) * sizeof(int));
        cols[mask] = 0;
        for (int i = 0; i < numsSize; i++)
            if (mask >> i & 1) res[mask][cols[mask]++] = nums[i];
    }
    *returnSize = total;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> subsets(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> res;
    for (int mask = 0; mask < (1 << n); mask++) {
        vector<int> s;
        for (int i = 0; i < n; i++) if (mask >> i & 1) s.push_back(nums[i]);
        res.push_back(s);
    }
    return res;
}`,
        java: `List<List<Integer>> subsets(int[] nums) {
    int n = nums.length;
    List<List<Integer>> res = new ArrayList<>();
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> s = new ArrayList<>();
        for (int i = 0; i < n; i++) if ((mask >> i & 1) == 1) s.add(nums[i]);
        res.add(s);
    }
    return res;
}`,
        javascript: `function subsets(nums) {
  const n = nums.length, res = [];
  for (let mask = 0; mask < 1 << n; mask++) res.push(nums.filter((_, i) => (mask >> i) & 1));
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '收答案時直接放 `cur`(沒有複製):之後 cur 被修改,答案裡的子集全部一起變',
    '回溯忘了 `pop`(撤銷選擇):後面的分支會帶著前面選過的數',
    '空集合 `[]` 也是子集,不能漏掉',
  ],
  followUp: [
    { q: '有重複的數?', a: '[90. Subsets II](#/q/90):先排序,同一層遇到和前一個相同的數就跳過。' },
    { q: '只要大小剛好 k 的子集?', a: '77. Combinations:回溯時 cur 長度到 k 就收,也可以剪掉「剩下的數不夠湊到 k」的分支。' },
  ],
  check: {
    kind: 'fn',
    fn: 'subsets',
    compare: 'groups',
    cases: [
      { args: [[1, 2, 3]], out: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]] },
      { args: [[0]], out: [[], [0]] },
      { args: [[5, -1]], out: [[], [5], [-1], [5, -1]] },
    ],
  },
}
