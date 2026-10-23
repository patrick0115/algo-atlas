import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 41. First Missing Positive

const A = [3, 4, -1, 1]

function setFig(): FigStep[] {
  return [
    { note: '答案一定在 1..n+1 之間(n 個數最多佔滿 1..n)。先把所有數放進集合', views: [arr(A, { label: 'nums' }), arr([...new Set(A)], { label: '集合' })] },
    { note: '從 1 開始問:1 在 ✓、2 不在 → 答案 2', views: [arr([1, 2, 3, 4, 5], { label: '1..n+1', done: [0], highlight: [1] })] },
  ]
}

function swapFig(): FigStep[] {
  const a = [...A]
  const n = a.length
  const out: FigStep[] = [{ note: '目標:把每個 1..n 的數 v 放到「它的家」索引 v−1。就像把號碼牌放回對應的座位。不在 1..n 的數(負數、太大)不管它', views: [arr(a, { label: 'nums(索引 0..3 = 1..4 的家)' })] }]
  for (let i = 0; i < n; i++) {
    while (a[i] >= 1 && a[i] <= n && a[a[i] - 1] !== a[i]) {
      const v = a[i]
      const j = v - 1
      ;[a[i], a[j]] = [a[j], a[i]]
      out.push({ note: `nums[${i}] = ${v},它的家是索引 ${j} → 交換。換回來的 ${a[i]} 還要繼續看`, views: [arr([...a], { label: 'nums', highlight: [i, j] })] })
    }
  }
  const miss = a.findIndex((v, i) => v !== i + 1)
  out.push({ note: `全部歸位後從左掃:索引 ${miss} 放的不是 ${miss + 1} → 答案 ${miss + 1}`, views: [arr(a, { label: 'nums', done: a.map((v, i) => (v === i + 1 ? i : -1)).filter((i) => i >= 0), highlight: [miss] })] })
  return out
}

export const q0041: Solution = {
  id: 41,
  plain: '一堆號碼牌(有負數、有重複、有很大的數),找出「最小的、沒出現過的正整數」。例如有 3、4、−1、1,那 1 有了、2 沒有,答案就是 2。難的地方在於:只能掃幾遍、不能多開表。',
  statement: '給未排序的整數陣列 `nums`,回傳**沒出現的最小正整數**。要求 O(n) 時間、O(1) 額外空間。',
  examples: [
    { input: 'nums = [1,2,0]', output: '3' },
    { input: 'nums = [3,4,-1,1]', output: '2' },
    { input: 'nums = [7,8,9,11,12]', output: '1' },
  ],
  constraints: ['n ≤ 10⁵', '值可以是任意 32 位元整數', '限制:O(n) 時間、O(1) 額外空間'],
  insight: ['關鍵觀察:答案一定在 **1..n+1**(n 個數最多把 1..n 全部佔滿)', '所以只需要關心 1..n 的數,其他都可以忽略', '1..n 剛好對應索引 0..n−1 → 拿陣列自己當表:把 v 放到索引 v−1(循環排序)'],
  approaches: [
    {
      name: 'Hash 集合',
      idea: '全部放進集合,從 1 往上找第一個不在的。',
      steps: ['`s = set(nums)`', '`for k in 1..n+1`:不在 s 裡就回傳 k'],
      figure: { title: `nums = [${A}]`, steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '集合存 n 個數;最多問 n+1 次。' },
      verdict: '最好懂,但不符合 O(1) 空間的要求。先寫這個確定邏輯,再想怎麼省空間。',
      code: {
        python: `def firstMissingPositive(nums):
    s = set(nums)
    for k in range(1, len(nums) + 2):         # 答案一定在 1..n+1
        if k not in s:
            return k`,
        c: `// 只關心 1..n,用長度 n+2 的標記表就夠(仍是 O(n) 空間)
int firstMissingPositive(int *nums, int numsSize) {
    char *seen = calloc(numsSize + 2, 1);
    for (int i = 0; i < numsSize; i++)
        if (nums[i] >= 1 && nums[i] <= numsSize) seen[nums[i]] = 1;
    int k = 1;
    while (seen[k]) k++;
    free(seen);
    return k;
}`,
        cpp: `int firstMissingPositive(vector<int>& nums) {
    unordered_set<int> s(nums.begin(), nums.end());
    for (int k = 1;; k++) if (!s.count(k)) return k;
}`,
        java: `int firstMissingPositive(int[] nums) {
    Set<Integer> s = new HashSet<>();
    for (int x : nums) s.add(x);
    int k = 1;
    while (s.contains(k)) k++;
    return k;
}`,
        javascript: `function firstMissingPositive(nums) {
  const s = new Set(nums);
  let k = 1;
  while (s.has(k)) k++;
  return k;
}`,
      },
    },
    {
      name: '原地歸位(循環排序)',
      idea: '對每個 i:只要 `nums[i]` 在 1..n 而且它的家 `nums[i]−1` 還沒放對,就交換過去。最後第一個 `nums[i] != i+1` 的位置就是答案。',
      steps: ['`for i in 0..n−1`:`while 1 ≤ nums[i] ≤ n and nums[nums[i]−1] != nums[i]`:交換 nums[i] 與 nums[nums[i]−1]', '再掃一次:第一個 `nums[i] != i + 1` → 回傳 `i + 1`', '全部都對 → 回傳 `n + 1`'],
      figure: { title: `nums = [${A}]`, steps: swapFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每次交換都讓一個數歸位,總共最多 n 次交換;while 看起來是巢狀,但總次數是 O(n)。' },
      verdict: '最推薦(符合題目要求)。「值域 1..n 對應索引」時的標準招式,[448](#/q/448)、[287](#/q/287) 都是同一家。',
      code: {
        python: `def firstMissingPositive(nums):
    n = len(nums)
    for i in range(n):
        # nums[i] 在 1..n、而且它的家還沒放對 → 送它回家
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`,
        c: `int firstMissingPositive(int *nums, int numsSize) {
    int n = numsSize;
    for (int i = 0; i < n; i++)
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            int j = nums[i] - 1, t = nums[i];
            nums[i] = nums[j]; nums[j] = t;
        }
    for (int i = 0; i < n; i++)
        if (nums[i] != i + 1) return i + 1;
    return n + 1;
}`,
        cpp: `int firstMissingPositive(vector<int>& nums) {
    int n = nums.size();
    for (int i = 0; i < n; i++)
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i])
            swap(nums[i], nums[nums[i] - 1]);
    for (int i = 0; i < n; i++)
        if (nums[i] != i + 1) return i + 1;
    return n + 1;
}`,
        java: `int firstMissingPositive(int[] nums) {
    int n = nums.length;
    for (int i = 0; i < n; i++)
        while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
            int j = nums[i] - 1, t = nums[i];
            nums[i] = nums[j]; nums[j] = t;
        }
    for (int i = 0; i < n; i++)
        if (nums[i] != i + 1) return i + 1;
    return n + 1;
}`,
        javascript: `function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++)
    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const j = nums[i] - 1;
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
  for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
  return n + 1;
}`,
      },
    },
  ],
  pitfalls: [
    'while 條件寫成 `nums[i] != i + 1`:遇到重複的數會無限交換,要比較的是「家裡是不是已經放對了」',
    'C++ 的 `swap(nums[i], nums[nums[i] − 1])` 可以,但自己寫三行交換時要先把 j 存起來,否則 nums[i] 改了之後 j 就變了',
    '全部都歸位時答案是 n + 1,別忘了',
  ],
  check: {
    kind: 'fn',
    fn: 'firstMissingPositive',
    cases: [
      { args: [[1, 2, 0]], out: 3 },
      { args: [A], out: 2 },
      { args: [[7, 8, 9, 11, 12]], out: 1 },
      { args: [[1, 1]], out: 2 },
      { args: [[2, 1]], out: 3 },
      { args: [[-2147483648]], out: 1 },
    ],
  },
}
