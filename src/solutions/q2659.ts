import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 2659. Make Array Empty

const NUMS = [3, 4, -1]

/** 位置照值由小到大排 */
const order = (nums: number[]) => [...nums.keys()].sort((a, b) => nums[a] - nums[b])

function bitFig(): FigStep[] {
  const nums = NUMS
  const n = nums.length
  const pos = order(nums)
  const present = nums.map(() => true)
  const out: FigStep[] = [
    {
      note: '先把每個位置照「上面的值」由小到大排好。值最小的位置最先被取走,所以取的順序就是這個排序。',
      line: 3,
      views: [arr(nums, { label: '值(位置 0..2)' }), kv(pos.map((p, k) => [`第 ${k + 1} 個取`, `位置 ${p}(值 ${nums[p]})`]), '取的順序')],
    },
  ]
  let prev = -1
  let total = n
  for (let k = 0; k < pos.length; k++) {
    const p = pos[k]
    // 從 prev 之後繞到 p,沿路還在隊伍裡的位置就是要轉到隊尾的次數
    const between: number[] = []
    if (p > prev) for (let i = prev + 1; i < p; i++) present[i] && between.push(i)
    else {
      for (let i = prev + 1; i < n; i++) present[i] && between.push(i)
      for (let i = 0; i < p; i++) present[i] && between.push(i)
    }
    out.push({
      note: `取位置 ${p}(值 ${nums[p]})。從上一次取的位置繞過來,中間還剩 ${between.length} 個在隊伍裡${between.length ? `(位置 ${between.join('、')})` : ''},要先把它們轉到隊尾 → ${between.length} 次;再加「取出」這 1 次。`,
      line: 12,
      views: [arr(nums, { label: '還在隊伍裡的(淡色=已取走)', highlight: [p], compare: between, dim: nums.flatMap((_, i) => (present[i] ? [] : [i])) })],
    })
    present[p] = false
    total--
    prev = p
  }
  out.push({ note: '全部取完。把每一段的「轉的次數」加上「取出」的 3 次,總共 2 + 1 + 0 + 1 + 0 + 1 = 5。', line: 15, views: [arr(nums, { label: '清空', dim: nums.map((_, i) => i) })] })
  return out
}

function countFig(): FigStep[] {
  const nums = NUMS
  const n = nums.length
  const pos = order(nums)
  const out: FigStep[] = [
    { note: `位置照值排序後是 [${pos.join(', ')}]。先放 ans = n = ${n}(每個元素都要「取出」一次)。`, line: 4, views: [kv(pos.map((p, k) => [`順位 ${k}`, `位置 ${p}`]), `排序後的位置  ·  ans = ${n}`)] },
  ]
  let ans = n
  for (let i = 1; i < n; i++) {
    const back = pos[i] < pos[i - 1]
    if (back) ans += n - i
    out.push({
      note: back
        ? `pos[${i}] = ${pos[i]} < pos[${i - 1}] = ${pos[i - 1]}:取的位置「回頭」了,表示要繞一圈,把當下還剩的 ${n - i} 個全轉過去 → ans += ${n - i},現在 ans = ${ans}。`
        : `pos[${i}] = ${pos[i]} ≥ pos[${i - 1}] = ${pos[i - 1]}:位置往後走,不用多繞。ans 不變 = ${ans}。`,
      line: back ? 6 : 5,
      views: [arr(pos, { label: '排序後的位置', highlight: [i], compare: [i - 1] })],
    })
  }
  out.push({ note: `最後 ans = ${ans}。`, line: 7, views: [arr(pos, { label: '排序後的位置', done: pos.map((_, i) => i) })] })
  return out
}

export const q2659: Solution = {
  id: 2659,
  plain: '有一排互不相同的數字排成隊伍。每次看隊首:如果它是整排裡最小的就把它拿走,否則把它移到隊尾。一直做到隊伍清空,問總共動作幾次。就像排隊叫號,沒輪到的人先到後面重排。',
  statement: '給整數陣列 `nums`(值互異)。反覆檢查隊首:是目前最小值就移除,否則移到隊尾。回傳清空整個陣列需要的總操作次數。',
  examples: [
    { input: 'nums = [3,4,-1]', output: '5', note: '3→尾、4→尾、取 −1、取 3、取 4' },
    { input: 'nums = [1,2,4,3]', output: '5' },
    { input: 'nums = [1,2,3]', output: '3', note: '本來就由小到大,直接依序取走' },
  ],
  constraints: ['`1 ≤ n ≤ 1e5`', '`nums` 的值互不相同', '答案最多約 `n²/2 ≈ 5e9`,在 JavaScript 的 Number 安全整數範圍內'],
  insight: [
    '每個元素一定會被「取出」一次 → 至少 n 次操作',
    '額外的操作都是「移到隊尾」。把元素照值由小到大一個一個取,關鍵是:從上一個取的位置走到下一個要取的位置,中間「還沒被取走」的元素都要先轉到隊尾',
    '若下一個位置比上一個小,表示隊首已經繞過結尾回到前面 → 要多繞一圈,把當下剩下的元素全轉一遍',
    '「數某段區間還剩幾個」用[[p:segment-tree]](樹狀陣列 BIT)可以 O(log n) 查、O(log n) 改',
  ],
  approaches: [
    {
      name: '樹狀陣列數區間剩餘',
      idea: '位置照值排好依序取。每取一個,就用[[p:segment-tree]](BIT)數「從上一個位置繞到這個位置,中間還剩幾個」當作要轉的次數,再把這個位置從 BIT 移掉。',
      steps: ['`pos` = 位置照 `nums` 值由小到大排序', 'BIT 一開始每個位置都記 1(都在隊伍裡)', '依序處理 `pos`:若當前位置 > 上一個,轉的次數 = 兩者之間還在的個數;否則繞一圈 = (剩總數 − ≤上一個) + (<當前)', '`ans += 轉的次數 + 1`,再把當前位置在 BIT 設 0', '回傳 `ans`'],
      figure: { title: 'nums = [3,4,-1]', steps: bitFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 O(n log n);每個位置查、改 BIT 各一次,每次 O(log n)。' },
      verdict: '最通用的寫法,「數某區間還剩幾個」是 BIT 的典型用途,值很大或要邊取邊查時都適用。',
      code: {
        javascript: `function countOperationsToEmptyArray(nums) {
  const n = nums.length;
  const pos = [...nums.keys()].sort((a, b) => nums[a] - nums[b]); // 位置照值由小到大
  const bit = new Array(n + 1).fill(0);
  const add = (i, d) => { for (i++; i <= n; i += i & -i) bit[i] += d; };
  const sum = (i) => { let s = 0; for (i++; i > 0; i -= i & -i) s += bit[i]; return s; }; // 前 i 個還剩幾個
  for (let i = 0; i < n; i++) add(i, 1);           // 一開始每個位置都在
  let total = n, prev = -1, ans = 0;
  for (const p of pos) {                            // 依值由小到大取
    const passed = p > prev
      ? sum(p - 1) - (prev < 0 ? 0 : sum(prev))      // 直接往後:中間還剩的
      : total - sum(prev) + sum(p - 1);              // 回頭:繞一圈剩下的
    ans += passed + 1;                               // 轉的次數 + 取出這一次
    add(p, -1); total--; prev = p;                   // 取走這個位置
  }
  return ans;
}`,
        python: `def countOperationsToEmptyArray(nums):
    n = len(nums)
    pos = sorted(range(n), key=lambda i: nums[i])   # 位置照值由小到大
    bit = [0] * (n + 1)
    def add(i, d):
        i += 1
        while i <= n:
            bit[i] += d
            i += i & -i
    def pre(i):                                       # 前 i 個還剩幾個
        i += 1; s = 0
        while i > 0:
            s += bit[i]
            i -= i & -i
        return s
    for i in range(n):
        add(i, 1)
    total, prev, ans = n, -1, 0
    for p in pos:
        if p > prev:
            passed = pre(p - 1) - (0 if prev < 0 else pre(prev))
        else:
            passed = total - pre(prev) + pre(p - 1)
        ans += passed + 1
        add(p, -1); total -= 1; prev = p
    return ans`,
        c: `long long countOperationsToEmptyArray(int *nums, int numsSize) {
    int n = numsSize;
    int *pos = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) pos[i] = i;
    for (int i = 1; i < n; i++) {                     // 簡單插入排序照值排位置
        int key = pos[i], j = i - 1;
        while (j >= 0 && nums[pos[j]] > nums[key]) { pos[j + 1] = pos[j]; j--; }
        pos[j + 1] = key;
    }
    long long *bit = calloc(n + 1, sizeof(long long));
    for (int i = 0; i < n; i++) for (int k = i + 1; k <= n; k += k & -k) bit[k]++;
    long long total = n, ans = 0; int prev = -1;
    for (int t = 0; t < n; t++) {
        int p = pos[t];
        long long sp = 0; for (int k = p; k > 0; k -= k & -k) sp += bit[k];        // sum(p-1)
        long long sv = 0; for (int k = prev + 1; k > 0; k -= k & -k) sv += bit[k]; // sum(prev)
        long long passed = p > prev ? sp - (prev < 0 ? 0 : sv) : total - sv + sp;
        ans += passed + 1;
        for (int k = p + 1; k <= n; k += k & -k) bit[k]--;
        total--; prev = p;
    }
    free(pos); free(bit);
    return ans;
}`,
        cpp: `long long countOperationsToEmptyArray(vector<int>& nums) {
    int n = nums.size();
    vector<int> pos(n);
    iota(pos.begin(), pos.end(), 0);
    sort(pos.begin(), pos.end(), [&](int a, int b) { return nums[a] < nums[b]; });
    vector<long long> bit(n + 1, 0);
    auto add = [&](int i, long long d) { for (i++; i <= n; i += i & -i) bit[i] += d; };
    auto sum = [&](int i) { long long s = 0; for (i++; i > 0; i -= i & -i) s += bit[i]; return s; };
    for (int i = 0; i < n; i++) add(i, 1);
    long long total = n, ans = 0; int prev = -1;
    for (int p : pos) {
        long long passed = p > prev ? sum(p - 1) - (prev < 0 ? 0 : sum(prev))
                                    : total - sum(prev) + sum(p - 1);
        ans += passed + 1;
        add(p, -1); total--; prev = p;
    }
    return ans;
}`,
        java: `long countOperationsToEmptyArray(int[] nums) {
    int n = nums.length;
    Integer[] pos = new Integer[n];
    for (int i = 0; i < n; i++) pos[i] = i;
    Arrays.sort(pos, (a, b) -> Integer.compare(nums[a], nums[b]));
    long[] bit = new long[n + 1];
    for (int i = 0; i < n; i++) for (int k = i + 1; k <= n; k += k & -k) bit[k]++;
    long total = n, ans = 0;
    int prev = -1;
    for (int p : pos) {
        long sp = 0; for (int k = p; k > 0; k -= k & -k) sp += bit[k];
        long sv = 0; for (int k = prev + 1; k > 0; k -= k & -k) sv += bit[k];
        long passed = p > prev ? sp - (prev < 0 ? 0 : sv) : total - sv + sp;
        ans += passed + 1;
        for (int k = p + 1; k <= n; k += k & -k) bit[k]--;
        total--; prev = p;
    }
    return ans;
}`,
      },
    },
    {
      name: '排序位置數逆序',
      idea: '位置照值排序後,ans 先放 n;只要相鄰的位置「回頭」(`pos[i] < pos[i−1]`),就表示要繞一圈,把當下還剩的 `n − i` 個全轉過去,逐步[[p:greedy]]累加。',
      steps: ['`pos` = 位置照值排序', '`ans = n`(每個都要取出一次)', '`for i in 1..n−1`:若 `pos[i] < pos[i−1]`,`ans += n − i`', '回傳 `ans`'],
      figure: { title: 'nums = [3,4,-1]', steps: countFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '只有排序是瓶頸;後面一次線性掃過。' },
      verdict: '想通「回頭才要多繞一圈、而且剛好繞當下剩的個數」之後,程式短到不行,是這題最漂亮的解。',
      code: {
        javascript: `function countOperationsToEmptyArray(nums) {
  const n = nums.length;
  const pos = [...nums.keys()].sort((a, b) => nums[a] - nums[b]); // 位置照值排序
  let ans = n;                                      // n 次「取出」一定要做
  for (let i = 1; i < n; i++)
    if (pos[i] < pos[i - 1]) ans += n - i;           // 位置回頭 → 多繞剩下的一圈
  return ans;
}`,
        python: `def countOperationsToEmptyArray(nums):
    n = len(nums)
    pos = sorted(range(n), key=lambda i: nums[i])   # 位置照值排序
    ans = n                                          # n 次「取出」一定要做
    for i in range(1, n):
        if pos[i] < pos[i - 1]:
            ans += n - i                             # 位置回頭 → 多繞剩下的一圈
    return ans`,
        c: `long long countOperationsToEmptyArray(int *nums, int numsSize) {
    int n = numsSize;
    int *pos = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) pos[i] = i;
    for (int i = 1; i < n; i++) {                     // 照值排序位置
        int key = pos[i], j = i - 1;
        while (j >= 0 && nums[pos[j]] > nums[key]) { pos[j + 1] = pos[j]; j--; }
        pos[j + 1] = key;
    }
    long long ans = n;
    for (int i = 1; i < n; i++)
        if (pos[i] < pos[i - 1]) ans += n - i;
    free(pos);
    return ans;
}`,
        cpp: `long long countOperationsToEmptyArray(vector<int>& nums) {
    int n = nums.size();
    vector<int> pos(n);
    iota(pos.begin(), pos.end(), 0);
    sort(pos.begin(), pos.end(), [&](int a, int b) { return nums[a] < nums[b]; });
    long long ans = n;
    for (int i = 1; i < n; i++)
        if (pos[i] < pos[i - 1]) ans += n - i;
    return ans;
}`,
        java: `long countOperationsToEmptyArray(int[] nums) {
    int n = nums.length;
    Integer[] pos = new Integer[n];
    for (int i = 0; i < n; i++) pos[i] = i;
    Arrays.sort(pos, (a, b) -> Integer.compare(nums[a], nums[b]));
    long ans = n;
    for (int i = 1; i < n; i++)
        if (pos[i] < pos[i - 1]) ans += n - i;
    return ans;
}`,
      },
    },
  ],
  pitfalls: [
    '答案最大約 5e9,超過 32 位元整數。JavaScript 的 Number 放得下,但 C/C++/Java 要用 `long long` / `long`',
    '是「位置」照值排序,不是把值本身排序。要記的是每個值原本在第幾格',
    '判斷繞圈用相鄰位置比大小,別跟值的大小搞混',
  ],
  check: {
    kind: 'fn',
    fn: 'countOperationsToEmptyArray',
    cases: [
      { args: [[3, 4, -1]], out: 5 },
      { args: [[1, 2, 4, 3]], out: 5 },
      { args: [[1, 2, 3]], out: 3 },
      { args: [[-23, 45, 12, 0, 7]], out: 8 },
    ],
  },
}
