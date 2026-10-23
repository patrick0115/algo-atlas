import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv, recLayout, recView, type RNode } from './fig'

// 47. Permutations II

const A = [1, 1, 2]
const fmt = (s: number[]) => `[${s.join(',')}]`

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const cur: number[] = []
  const used = A.map(() => false)
  const go = (parent: number, label: string) => {
    const id = nodes.length
    const full = cur.length === A.length
    nodes.push({ parent, label, sub: fmt(cur), kind: full ? 'ok' : undefined })
    notes.push(parent < 0 ? '先排序讓相同的數相鄰。每一層挑一個還沒用過的數放到下一個位置;**同一層**不能放兩次相同的值,否則會長出一樣的子樹' : full ? `排滿了:${fmt(cur)}` : `放 ${label} → ${fmt(cur)}`)
    if (full) return
    for (let i = 0; i < A.length; i++) {
      if (used[i]) continue
      if (i > 0 && A[i] === A[i - 1] && !used[i - 1]) {
        nodes.push({ parent: id, label: A[i], sub: '同層重複', kind: 'cut' })
        notes.push(`第 ${i} 個 ${A[i]} 和第 ${i - 1} 個一樣,而第 ${i - 1} 個在這一層剛試過(已經撤回、沒在使用中)→ 跳過`)
        continue
      }
      used[i] = true
      cur.push(A[i])
      go(id, String(A[i]))
      cur.pop()
      used[i] = false
    }
  }
  go(-1, '[]')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(實心 = 找到答案,淡色 = 剪掉)')] }))
}

function countFig(): FigStep[] {
  return [
    { note: '另一種:不看「第幾個」,只看「每個值還剩幾個」。每一層從計數表裡挑一個**值**(值本身不重複,自然不會重複)', views: [kv([[1, 2], [2, 1]], '值 → 剩幾個')] },
    { note: '挑 1(剩 1)→ 挑 1(剩 0)→ 挑 2 → [1,1,2];回頭改挑 2 → [1,2,1];最上層改挑 2 → [2,1,1]', views: [arr(['[1,1,2]', '[1,2,1]', '[2,1,1]'], { label: '答案', done: [0, 1, 2] })] },
  ]
}

export const q0047: Solution = {
  id: 47,
  plain: '把一串數字(裡面可能有重複的)排成所有不同的順序。重複的數字互換位置算同一種,不能重複列出。',
  statement: '給可能含重複數字的陣列 `nums`,回傳所有**不重複**的全排列,順序不限。',
  examples: [
    { input: 'nums = [1,1,2]', output: '[[1,1,2],[1,2,1],[2,1,1]]' },
    { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
  ],
  constraints: ['n ≤ 8'],
  insight: ['[46](#/q/46) 加上去重', '排序後,相同的值相鄰;同一層只讓「第一個沒被用的」那個出場', '條件 `nums[i] == nums[i−1] and not used[i−1]`:前一個相同的值在這層已經試過了'],
  approaches: [
    {
      name: '排序 + used 陣列剪枝',
      idea: '排序;`dfs`:`for i`:用過的跳過;`i > 0 and nums[i] == nums[i−1] and not used[i−1]` 跳過;選 i、遞迴、撤回。',
      steps: ['`nums.sort()`', '`len(cur) == n` → 收下', '跳過 used[i];跳過「同值而前一個沒在用」的 i', '`used[i] = True`、push、遞迴、撤回'],
      figure: { title: `nums = [${A}]`, steps: btFig() },
      complexity: { time: 'O(n · n!)', space: 'O(n)', why: '最多 n! 個排列,每個複製 O(n)。' },
      verdict: '最推薦。「同一層去重」的寫法和 [40](#/q/40)、[90](#/q/90) 是同一招。',
      code: {
        python: `def permuteUnique(nums):
    nums.sort()                               # 相同的值排在一起
    n, res, cur = len(nums), [], []
    used = [False] * n

    def dfs():
        if len(cur) == n:
            res.append(cur[:])
            return
        for i in range(n):
            if used[i]:
                continue
            if i and nums[i] == nums[i - 1] and not used[i - 1]:
                continue                      # 同一層已經放過這個值
            used[i] = True
            cur.append(nums[i])
            dfs()
            cur.pop()
            used[i] = False

    dfs()
    return res`,
        c: `static int **res, cnt, cur[8], len, *A, N;
static bool used[8];

static int cmp(const void *a, const void *b) { return *(int *)a - *(int *)b; }

static void dfs(void) {
    if (len == N) {
        res[cnt] = malloc(N * sizeof(int));
        memcpy(res[cnt++], cur, N * sizeof(int));
        return;
    }
    for (int i = 0; i < N; i++) {
        if (used[i]) continue;
        if (i && A[i] == A[i - 1] && !used[i - 1]) continue;
        used[i] = true;
        cur[len++] = A[i];
        dfs();
        len--;
        used[i] = false;
    }
}

int **permuteUnique(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmp);
    int total = 1;
    for (int i = 2; i <= numsSize; i++) total *= i;
    res = malloc(total * sizeof(int *));
    cnt = len = 0; A = nums; N = numsSize;
    memset(used, 0, sizeof(used));
    dfs();
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = N;
    return res;
}`,
        cpp: `vector<vector<int>> permuteUnique(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    vector<vector<int>> res;
    vector<int> cur;
    vector<bool> used(n, false);
    function<void()> dfs = [&]() {
        if ((int)cur.size() == n) { res.push_back(cur); return; }
        for (int i = 0; i < n; i++) {
            if (used[i]) continue;
            if (i && nums[i] == nums[i - 1] && !used[i - 1]) continue;
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
        java: `List<List<Integer>> permuteUnique(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    dfs(nums, new boolean[nums.length], new ArrayList<>(), res);
    return res;
}

void dfs(int[] nums, boolean[] used, List<Integer> cur, List<List<Integer>> res) {
    if (cur.size() == nums.length) { res.add(new ArrayList<>(cur)); return; }
    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1]) continue;
        used[i] = true;
        cur.add(nums[i]);
        dfs(nums, used, cur, res);
        cur.remove(cur.size() - 1);
        used[i] = false;
    }
}`,
        javascript: `function permuteUnique(nums) {
  nums.sort((a, b) => a - b);
  const n = nums.length, res = [], cur = [], used = new Array(n).fill(false);
  const dfs = () => {
    if (cur.length === n) {
      res.push([...cur]);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      if (i && nums[i] === nums[i - 1] && !used[i - 1]) continue;
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
      name: '計數表回溯',
      idea: '統計每個值剩幾個;每一層對「每種值」挑一次(剩 > 0 才挑),值不重複所以不會產生重複排列。',
      steps: ['`cnt = Counter(nums)`', '`len(cur) == n` → 收下', '`for v in cnt`:`cnt[v] > 0` → `cnt[v] -= 1`、push、遞迴、撤回'],
      figure: { title: `nums = [${A}]`, steps: countFig() },
      complexity: { time: 'O(n · n!)', space: 'O(n)', why: '同上;每層迴圈只跑不同值的個數。' },
      verdict: '不用排序也不用想 `used[i−1]` 的條件,比較不容易寫錯。',
      code: {
        python: `from collections import Counter

def permuteUnique(nums):
    cnt, n, res, cur = Counter(nums), len(nums), [], []

    def dfs():
        if len(cur) == n:
            res.append(cur[:])
            return
        for v in cnt:                         # 每種值只試一次
            if cnt[v]:
                cnt[v] -= 1
                cur.append(v)
                dfs()
                cur.pop()
                cnt[v] += 1

    dfs()
    return res`,
        c: `static int **res, cnt, cur[8], len, N, vals[8], left[8], m;

static void dfs(void) {
    if (len == N) {
        res[cnt] = malloc(N * sizeof(int));
        memcpy(res[cnt++], cur, N * sizeof(int));
        return;
    }
    for (int j = 0; j < m; j++) {
        if (!left[j]) continue;
        left[j]--;
        cur[len++] = vals[j];
        dfs();
        len--;
        left[j]++;
    }
}

int **permuteUnique(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    m = 0;
    for (int i = 0; i < numsSize; i++) {
        int j = 0;
        while (j < m && vals[j] != nums[i]) j++;
        if (j == m) { vals[m] = nums[i]; left[m++] = 0; }
        left[j]++;
    }
    int total = 1;
    for (int i = 2; i <= numsSize; i++) total *= i;
    res = malloc(total * sizeof(int *));
    cnt = len = 0; N = numsSize;
    dfs();
    *returnSize = cnt;
    *returnColumnSizes = malloc(cnt * sizeof(int));
    for (int i = 0; i < cnt; i++) (*returnColumnSizes)[i] = N;
    return res;
}`,
        cpp: `vector<vector<int>> permuteUnique(vector<int>& nums) {
    map<int, int> cnt;
    for (int x : nums) cnt[x]++;
    int n = nums.size();
    vector<vector<int>> res;
    vector<int> cur;
    function<void()> dfs = [&]() {
        if ((int)cur.size() == n) { res.push_back(cur); return; }
        for (auto &[v, c] : cnt) {
            if (!c) continue;
            c--;
            cur.push_back(v);
            dfs();
            cur.pop_back();
            c++;
        }
    };
    dfs();
    return res;
}`,
        java: `List<List<Integer>> permuteUnique(int[] nums) {
    Map<Integer, Integer> cnt = new TreeMap<>();
    for (int x : nums) cnt.merge(x, 1, Integer::sum);
    List<List<Integer>> res = new ArrayList<>();
    dfs(cnt, nums.length, new ArrayList<>(), res);
    return res;
}

void dfs(Map<Integer, Integer> cnt, int n, List<Integer> cur, List<List<Integer>> res) {
    if (cur.size() == n) { res.add(new ArrayList<>(cur)); return; }
    for (int v : cnt.keySet()) {
        if (cnt.get(v) == 0) continue;
        cnt.put(v, cnt.get(v) - 1);
        cur.add(v);
        dfs(cnt, n, cur, res);
        cur.remove(cur.size() - 1);
        cnt.put(v, cnt.get(v) + 1);
    }
}`,
        javascript: `function permuteUnique(nums) {
  const cnt = new Map(), n = nums.length, res = [], cur = [];
  for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);
  const dfs = () => {
    if (cur.length === n) {
      res.push([...cur]);
      return;
    }
    for (const [v, c] of cnt) {
      if (!c) continue;
      cnt.set(v, c - 1);
      cur.push(v);
      dfs();
      cur.pop();
      cnt.set(v, c);
    }
  };
  dfs();
  return res;
}`,
      },
    },
  ],
  pitfalls: ['沒排序就用 `nums[i] == nums[i−1]` 判斷:相同的值不相鄰,去重失效', '條件寫成 `used[i−1]`(不是 not):也能得到正確答案但剪枝很差,初學者容易搞混為什麼', '用 set 存結果事後去重:可以過,但做了很多重複的搜尋'],
  check: {
    kind: 'fn',
    fn: 'permuteUnique',
    compare: 'sorted',
    cases: [
      { args: [A], out: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] },
      { args: [[1, 2, 3]], out: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[2, 2, 2]], out: [[2, 2, 2]] },
      { args: [[3, 3, 0, 3]], out: [[0, 3, 3, 3], [3, 0, 3, 3], [3, 3, 0, 3], [3, 3, 3, 0]] },
    ],
  },
}
