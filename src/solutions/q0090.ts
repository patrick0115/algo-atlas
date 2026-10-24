import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv, recLayout, recView, type RNode } from './fig'

// 90. Subsets II

const A = [1, 2, 2]
const fmt = (s: number[]) => `[${s.join(',')}]`

function btFig(): FigStep[] {
  const nodes: RNode[] = []
  const notes: string[] = []
  const cur: number[] = []
  const go = (start: number, parent: number, label: string) => {
    const id = nodes.length
    nodes.push({ parent, label, sub: fmt(cur), kind: 'ok' })
    notes.push(parent < 0 ? '先排序,讓相同的數相鄰。每個節點本身就是一個子集(收下),再從 start 往後挑下一個要加的數。**同一層**如果遇到和前一個相同的數就跳過,不然會長出一模一樣的子樹' : `加上 ${label} → 子集 ${fmt(cur)}`)
    for (let i = start; i < A.length; i++) {
      if (i > start && A[i] === A[i - 1]) {
        nodes.push({ parent: id, label: A[i], sub: '同層重複', kind: 'cut' })
        notes.push(`同一層已經試過 ${A[i]} 了(第 ${i - 1} 個),第 ${i} 個 ${A[i]} 長出來的子樹會一模一樣 → 跳過`)
        continue
      }
      cur.push(A[i])
      go(i + 1, id, String(A[i]))
      cur.pop()
    }
  }
  go(0, -1, '[]')
  const pos = recLayout(nodes)
  return nodes.map((_, k) => ({ note: notes[k], views: [recView(nodes, pos, k, '決策樹(每個節點都是一個子集)')] }))
}

function countFig(): FigStep[] {
  const cnt = new Map<number, number>()
  for (const x of A) cnt.set(x, (cnt.get(x) ?? 0) + 1)
  let res: number[][] = [[]]
  const out: FigStep[] = [{ note: '另一種角度:重複的數不是「選或不選」,而是「選 0 個、1 個、2 個…」。先數每個數出現幾次', views: [kv([...cnt], '數 → 次數')] }]
  for (const [x, c] of cnt) {
    const next: number[][] = []
    for (const s of res) for (let k = 0; k <= c; k++) next.push([...s, ...Array(k).fill(x)])
    res = next
    out.push({ note: `處理 ${x}(${c} 個):每個舊的子集分別加上 0 ~ ${c} 個 ${x}`, views: [arr(res.map(fmt), { label: '目前的子集' })] })
  }
  return out
}

export const q0090: Solution = {
  id: 90,
  plain: '和「列出所有子集」一樣,但這次數字**可能重複**。像 [1,2,2]:選第一個 2 或第二個 2 結果都是 [1,2],只能算一次。',
  statement: '給一個**可能有重複元素**的整數陣列 `nums`,回傳所有可能的子集,答案中不能有重複的子集。',
  examples: [
    { input: 'nums = [1,2,2]', output: '[[],[1],[1,2],[1,2,2],[2],[2,2]]' },
    { input: 'nums = [0]', output: '[[],[0]]' },
  ],
  constraints: ['`1 ≤ n ≤ 10`'],
  insight: [
    '直接用 [78](#/q/78) 的做法會產生重複:[1,2₁] 和 [1,2₂] 是同一個子集',
    '先**排序**讓相同的數相鄰。重複發生在「同一層選了兩個相同的值」:例如第一層先選 2₁ 和先選 2₂,長出來的子樹一模一樣',
    '所以規則是:**同一層**(同一個 for 迴圈裡)遇到和前一個相同的值就跳過;但往下一層時可以再選(這樣才能得到 [2,2])',
    '另一種想法:把重複的數看成「選 0 個、1 個、2 個…」',
  ],
  approaches: [
    {
      name: '排序 + 回溯 + 同層去重',
      idea: '`dfs(start)`:先收下目前的 cur;再對 i 從 start 開始:`i > start and nums[i] == nums[i−1]` 就跳過,否則選它並 `dfs(i + 1)`。',
      steps: ['排序', '`dfs(start)`:收下 cur 的複製', '`for i in start..n−1`:`i > start` 且和前一個相同 → continue', '`cur.append(nums[i])`、`dfs(i + 1)`、`cur.pop()`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: btFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)', why: '最多 2ⁿ 個子集(沒重複時),每個複製 O(n)。' },
      verdict: '標準解。「排序 + `i > start` 的同層去重」是所有「有重複元素的回溯」(40、47、491)共用的技巧。條件是 `i > start` 不是 `i > 0`!',
      code: {
        python: `def subsetsWithDup(nums):
    nums = sorted(nums)
    res, cur = [], []

    def dfs(start):
        res.append(cur[:])                # 每個節點都是一個子集
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue                  # 同一層選過一樣的值了
            cur.append(nums[i])
            dfs(i + 1)
            cur.pop()

    dfs(0)
    return res`,
        c: `static int **res, *cols, cnt, cur[10], len;

static int cmpInt(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }

static void dfs(int *a, int n, int start) {
    res[cnt] = malloc((len ? len : 1) * sizeof(int));
    memcpy(res[cnt], cur, len * sizeof(int));
    cols[cnt++] = len;
    for (int i = start; i < n; i++) {
        if (i > start && a[i] == a[i - 1]) continue;
        cur[len++] = a[i];
        dfs(a, n, i + 1);
        len--;
    }
}

int **subsetsWithDup(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmpInt);
    res = malloc((1 << numsSize) * sizeof(int *));
    cols = malloc((1 << numsSize) * sizeof(int));
    cnt = len = 0;
    dfs(nums, numsSize, 0);
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> subsetsWithDup(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    vector<int> cur;
    function<void(int)> dfs = [&](int start) {
        res.push_back(cur);
        for (int i = start; i < (int)nums.size(); i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            cur.push_back(nums[i]);
            dfs(i + 1);
            cur.pop_back();
        }
    };
    dfs(0);
    return res;
}`,
        java: `List<List<Integer>> subsetsWithDup(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    dfs(nums, 0, new ArrayList<>(), res);
    return res;
}

private void dfs(int[] a, int start, List<Integer> cur, List<List<Integer>> res) {
    res.add(new ArrayList<>(cur));
    for (int i = start; i < a.length; i++) {
        if (i > start && a[i] == a[i - 1]) continue;
        cur.add(a[i]);
        dfs(a, i + 1, cur, res);
        cur.remove(cur.size() - 1);
    }
}`,
        javascript: `function subsetsWithDup(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const res = [], cur = [];
  const dfs = (start) => {
    res.push([...cur]);
    for (let i = start; i < a.length; i++) {
      if (i > start && a[i] === a[i - 1]) continue;
      cur.push(a[i]);
      dfs(i + 1);
      cur.pop();
    }
  };
  dfs(0);
  return res;
}`,
      },
    },
    {
      name: '計數:每個值選 0 ~ c 個',
      idea: '數每個值出現幾次。從 `[[]]` 開始,每個值 x(出現 c 次):每個舊子集分別加上 0、1、…、c 個 x。',
      steps: ['`cnt = Counter(nums)`', '`res = [[]]`', '對每個 `(x, c)`:`res = [s + [x] * k for s in res for k in 0..c]`'],
      figure: { title: `nums = [${A.join(',')}]`, steps: countFig() },
      complexity: { time: 'O(n · 2ⁿ)', space: 'O(n)', why: '產生的子集數 = Π(cᵢ + 1) ≤ 2ⁿ。' },
      verdict: '不用排序、不用想去重條件,重複的數天生不會產生重複子集。',
      code: {
        python: `from collections import Counter

def subsetsWithDup(nums):
    res = [[]]
    for x, c in Counter(nums).items():
        res = [s + [x] * k for s in res for k in range(c + 1)]   # 加 0 ~ c 個 x
    return res`,
        c: `static int cmpInt(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }

int **subsetsWithDup(int *nums, int numsSize, int *returnSize, int **returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmpInt);       // 排序後相同的值相鄰,方便數次數
    int cap = 1 << numsSize;
    int **res = malloc(cap * sizeof(int *)), *cols = malloc(cap * sizeof(int)), cnt = 1;
    res[0] = malloc(sizeof(int)); cols[0] = 0;
    for (int i = 0; i < numsSize;) {
        int j = i;
        while (j < numsSize && nums[j] == nums[i]) j++;
        int c = j - i, now = cnt;
        for (int s = 0; s < now; s++)
            for (int k = 1; k <= c; k++) {
                res[cnt] = malloc((cols[s] + k) * sizeof(int));
                memcpy(res[cnt], res[s], cols[s] * sizeof(int));
                for (int t = 0; t < k; t++) res[cnt][cols[s] + t] = nums[i];
                cols[cnt++] = cols[s] + k;
            }
        i = j;
    }
    *returnSize = cnt;
    *returnColumnSizes = cols;
    return res;
}`,
        cpp: `vector<vector<int>> subsetsWithDup(vector<int>& nums) {
    map<int, int> cnt;
    for (int x : nums) cnt[x]++;
    vector<vector<int>> res = {{}};
    for (auto& [x, c] : cnt) {
        int now = res.size();
        for (int s = 0; s < now; s++) {
            vector<int> cur = res[s];
            for (int k = 1; k <= c; k++) {
                cur.push_back(x);
                res.push_back(cur);
            }
        }
    }
    return res;
}`,
        java: `List<List<Integer>> subsetsWithDup(int[] nums) {
    Map<Integer, Integer> cnt = new TreeMap<>();
    for (int x : nums) cnt.merge(x, 1, Integer::sum);
    List<List<Integer>> res = new ArrayList<>();
    res.add(new ArrayList<>());
    for (var e : cnt.entrySet()) {
        int now = res.size();
        for (int s = 0; s < now; s++) {
            List<Integer> cur = new ArrayList<>(res.get(s));
            for (int k = 1; k <= e.getValue(); k++) {
                cur.add(e.getKey());
                res.add(new ArrayList<>(cur));
            }
        }
    }
    return res;
}`,
        javascript: `function subsetsWithDup(nums) {
  const cnt = new Map();
  for (const x of nums) cnt.set(x, (cnt.get(x) ?? 0) + 1);
  let res = [[]];
  for (const [x, c] of cnt) {
    const next = [];
    for (const s of res) for (let k = 0; k <= c; k++) next.push([...s, ...new Array(k).fill(x)]);
    res = next;
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: [
    '忘了先排序:相同的數不相鄰,`nums[i] == nums[i−1]` 的去重條件就失效',
    '去重條件寫成 `i > 0`:會連 [2,2] 這種「下一層選相同值」的合法子集都跳掉。要用 `i > start`(只擋同一層)',
    '用 set 存答案來去重:可以,但要把子集排序再轉成 tuple,而且白白產生了很多重複的分支',
  ],
  followUp: [{ q: '同樣的去重技巧?', a: '[40. Combination Sum II](#/q/40)、47. Permutations II、491. Non-decreasing Subsequences。' }],
  check: {
    kind: 'fn',
    fn: 'subsetsWithDup',
    compare: 'groups',
    cases: [
      { args: [[1, 2, 2]], out: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
      { args: [[0]], out: [[], [0]] },
      { args: [[4, 4, 4, 1, 4]], out: [[], [1], [1, 4], [1, 4, 4], [1, 4, 4, 4], [1, 4, 4, 4, 4], [4], [4, 4], [4, 4, 4], [4, 4, 4, 4]] },
    ],
  },
}
