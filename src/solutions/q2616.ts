import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 2616. Minimize the Maximum Difference of Pairs

const A = [10, 1, 2, 7, 1, 3]
const P = 2

function canFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const out: FigStep[] = [{ note: `要選 ${P} 對(每個數最多用一次),讓「最大的差」最小。先排序:差最小的一定在相鄰的位置。然後二分搜尋答案 x:「能不能湊出 ${P} 對,每對的差都 ≤ x」`, views: [arr(s, { label: '排序後' })] }]
  const check = (x: number) => {
    let cnt = 0
    const used: number[] = []
    for (let i = 0; i + 1 < s.length; ) {
      if (s[i + 1] - s[i] <= x) {
        cnt++
        used.push(i, i + 1)
        i += 2
      } else i++
    }
    return [cnt, used] as const
  }
  for (const x of [0, 1]) {
    const [cnt, used] = check(x)
    out.push({ note: `試 x = ${x}:從左往右貪心,相鄰差 ≤ ${x} 就配成一對、跳過兩個 → 湊出 ${cnt} 對 ${cnt >= P ? `≥ ${P},可以` : `< ${P},不行`}`, views: [arr(s, { label: `x = ${x}`, done: used as number[] })] })
  }
  out.push({ note: '為什麼貪心「能配就配」是對的?如果 s[i] 和 s[i+1] 能配卻不配,s[i] 只能跟更遠的配(差更大)或不配,不會更好。答案 x = 1', views: [arr(s, { label: '答案 1', done: [0, 1, 2, 3] })] })
  return out
}

function candFig(): FigStep[] {
  return [
    { note: '答案一定是某兩個相鄰數的差(或 0)。把所有相鄰差收集起來排序,當作候選答案', views: [arr([0, 1, 1, 4, 3], { label: '相鄰差(排序前)' }), arr([0, 1, 1, 3, 4], { label: '候選答案(排序後)' })] },
    { note: '從小到大一個一個試(同樣用貪心檢查),第一個可行的就是答案 → 1。最壞試 n 個候選,O(n²)', views: [arr([0, 1, 1, 3, 4], { label: '候選答案', dim: [0], done: [1] })] },
  ]
}

export const q2616: Solution = {
  id: 2616,
  plain: '從一堆數字裡挑出 p 對(每個數最多用一次),每一對算「兩數相差多少」。目標是讓這 p 對裡差最大的那一對,差得盡量小。',
  statement: '給整數陣列 `nums` 和 `p`,找出 p 對索引(每個索引最多出現一次),使所有配對中 `|nums[i] − nums[j]|` 的**最大值最小**。回傳這個最小的最大值(p = 0 時為 0)。',
  examples: [
    { input: 'nums = [10,1,2,7,1,3], p = 2', output: '1', note: '配 (1,1) 和 (2,3)' },
    { input: 'nums = [4,2,1,2], p = 1', output: '0' },
  ],
  constraints: ['n ≤ 10⁵,值 ≤ 10⁹', '0 ≤ p ≤ n/2'],
  insight: ['「最大值最小化」→ 二分搜尋答案 x,問題變成「差都 ≤ x 的配對能湊幾對」', '排序後,好的配對一定是相鄰的兩個數', '檢查時從左往右貪心:相鄰差 ≤ x 就配,跳過這兩個;否則跳一個'],
  approaches: [
    {
      name: '排序 + 二分答案 + 貪心檢查',
      idea: '在 [0, max − min] 二分 x;`can(x)` = 貪心配對數 ≥ p。',
      steps: ['排序', '`can(x)`:`i = 0`、`cnt = 0`;`nums[i+1] − nums[i] <= x` → `cnt += 1`、`i += 2`,否則 `i += 1`', '二分找最小的 x 使 `can(x)` 成立'],
      figure: { title: `nums = [${A}],p = ${P}`, steps: canFig() },
      complexity: { time: 'O(n log n + n log V)', space: 'O(1) ~ O(n)', why: '排序 + 二分 log V 次、每次 O(n)。' },
      verdict: '最推薦。[[p:binary-search-answer]]的經典組合:二分答案 + 貪心驗證。',
      code: {
        python: `def minimizeMax(nums, p):
    nums.sort()

    def can(x):                               # 差 ≤ x 的配對能不能湊到 p 對
        cnt, i = 0, 0
        while i + 1 < len(nums) and cnt < p:
            if nums[i + 1] - nums[i] <= x:
                cnt += 1
                i += 2                        # 能配就配
            else:
                i += 1
        return cnt >= p

    lo, hi = 0, nums[-1] - nums[0]
    while lo < hi:
        m = (lo + hi) // 2
        if can(m):
            hi = m
        else:
            lo = m + 1
    return lo`,
        c: `static int cmp(const void *a, const void *b) { int x = *(int *)a, y = *(int *)b; return (x > y) - (x < y); }

static bool can(int *a, int n, int p, int x) {
    int cnt = 0;
    for (int i = 0; i + 1 < n && cnt < p;) {
        if (a[i + 1] - a[i] <= x) { cnt++; i += 2; }
        else i++;
    }
    return cnt >= p;
}

int minimizeMax(int *nums, int numsSize, int p) {
    qsort(nums, numsSize, sizeof(int), cmp);
    int lo = 0, hi = nums[numsSize - 1] - nums[0];
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        if (can(nums, numsSize, p, m)) hi = m;
        else lo = m + 1;
    }
    return lo;
}`,
        cpp: `int minimizeMax(vector<int>& nums, int p) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    auto can = [&](int x) {
        int cnt = 0;
        for (int i = 0; i + 1 < n && cnt < p;) {
            if (nums[i + 1] - nums[i] <= x) { cnt++; i += 2; }
            else i++;
        }
        return cnt >= p;
    };
    int lo = 0, hi = nums[n - 1] - nums[0];
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        if (can(m)) hi = m;
        else lo = m + 1;
    }
    return lo;
}`,
        java: `int minimizeMax(int[] nums, int p) {
    Arrays.sort(nums);
    int n = nums.length, lo = 0, hi = nums[n - 1] - nums[0];
    while (lo < hi) {
        int m = lo + (hi - lo) / 2, cnt = 0;
        for (int i = 0; i + 1 < n && cnt < p;) {
            if (nums[i + 1] - nums[i] <= m) { cnt++; i += 2; }
            else i++;
        }
        if (cnt >= p) hi = m;
        else lo = m + 1;
    }
    return lo;
}`,
        javascript: `function minimizeMax(nums, p) {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  const can = (x) => {
    let cnt = 0;
    for (let i = 0; i + 1 < n && cnt < p; ) {
      if (nums[i + 1] - nums[i] <= x) {
        cnt++;
        i += 2;
      } else i++;
    }
    return cnt >= p;
  };
  let lo = 0, hi = nums[n - 1] - nums[0];
  while (lo < hi) {
    const m = Math.floor((lo + hi) / 2);
    if (can(m)) hi = m;
    else lo = m + 1;
  }
  return lo;
}`,
      },
    },
    {
      name: '枚舉候選答案(相鄰差)',
      idea: '答案一定是 0 或某個相鄰差;把相鄰差排序後由小到大逐一檢查,第一個可行的就是答案。',
      steps: ['排序', '`cands = sorted({0} ∪ {nums[i+1] − nums[i]})`', '由小到大:`can(x)` 成立就回傳'],
      figure: { title: `nums = [${A}],p = ${P}`, steps: candFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '最多 n 個候選,每個檢查 O(n)。' },
      verdict: '縮小了答案的範圍,但線性地試還是太慢;改成在候選上二分就和方法一一樣快。',
      code: {
        python: `def minimizeMax(nums, p):
    nums.sort()

    def can(x):
        cnt, i = 0, 0
        while i + 1 < len(nums) and cnt < p:
            if nums[i + 1] - nums[i] <= x:
                cnt += 1
                i += 2
            else:
                i += 1
        return cnt >= p

    cands = sorted({0} | {nums[i + 1] - nums[i] for i in range(len(nums) - 1)})
    for x in cands:                           # 答案一定在這些候選裡
        if can(x):
            return x
    return 0`,
        c: `static int cmp(const void *a, const void *b) { int x = *(int *)a, y = *(int *)b; return (x > y) - (x < y); }

static bool can(int *a, int n, int p, int x) {
    int cnt = 0;
    for (int i = 0; i + 1 < n && cnt < p;) {
        if (a[i + 1] - a[i] <= x) { cnt++; i += 2; }
        else i++;
    }
    return cnt >= p;
}

int minimizeMax(int *nums, int numsSize, int p) {
    qsort(nums, numsSize, sizeof(int), cmp);
    int *c = malloc(numsSize * sizeof(int)), m = 0;
    c[m++] = 0;
    for (int i = 0; i + 1 < numsSize; i++) c[m++] = nums[i + 1] - nums[i];
    qsort(c, m, sizeof(int), cmp);
    int ans = 0;
    for (int k = 0; k < m; k++) if (can(nums, numsSize, p, c[k])) { ans = c[k]; break; }
    free(c);
    return ans;
}`,
        cpp: `int minimizeMax(vector<int>& nums, int p) {
    sort(nums.begin(), nums.end());
    int n = nums.size();
    auto can = [&](int x) {
        int cnt = 0;
        for (int i = 0; i + 1 < n && cnt < p;) {
            if (nums[i + 1] - nums[i] <= x) { cnt++; i += 2; }
            else i++;
        }
        return cnt >= p;
    };
    vector<int> c{0};
    for (int i = 0; i + 1 < n; i++) c.push_back(nums[i + 1] - nums[i]);
    sort(c.begin(), c.end());
    for (int x : c) if (can(x)) return x;
    return 0;
}`,
        java: `int minimizeMax(int[] nums, int p) {
    Arrays.sort(nums);
    int n = nums.length;
    int[] c = new int[n];
    for (int i = 0; i + 1 < n; i++) c[i + 1] = nums[i + 1] - nums[i];
    Arrays.sort(c);
    for (int x : c) {
        int cnt = 0;
        for (int i = 0; i + 1 < n && cnt < p;) {
            if (nums[i + 1] - nums[i] <= x) { cnt++; i += 2; }
            else i++;
        }
        if (cnt >= p) return x;
    }
    return 0;
}`,
        javascript: `function minimizeMax(nums, p) {
  nums.sort((a, b) => a - b);
  const n = nums.length;
  const can = (x) => {
    let cnt = 0;
    for (let i = 0; i + 1 < n && cnt < p; ) {
      if (nums[i + 1] - nums[i] <= x) {
        cnt++;
        i += 2;
      } else i++;
    }
    return cnt >= p;
  };
  const c = [0];
  for (let i = 0; i + 1 < n; i++) c.push(nums[i + 1] - nums[i]);
  c.sort((a, b) => a - b);
  for (const x of c) if (can(x)) return x;
  return 0;
}`,
      },
    },
  ],
  pitfalls: ['忘了排序就貪心:相鄰的兩個數不一定差最小', '貪心配對後只跳一個(i += 1):同一個數會被用兩次', 'p = 0 時答案是 0'],
  check: {
    kind: 'fn',
    fn: 'minimizeMax',
    cases: [
      { args: [A, P], out: 1 },
      { args: [[4, 2, 1, 2], 1], out: 0 },
      { args: [[1, 5], 0], out: 0 },
      { args: [[3, 4, 2, 3, 2, 1, 2], 3], out: 1 },
      { args: [[1, 100, 101, 200], 2], out: 99 },
    ],
  },
}
