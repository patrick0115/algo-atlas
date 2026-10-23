import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 26. Remove Duplicates from Sorted Array

const A = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]

function twoPtrFig(): FigStep[] {
  const a = [...A]
  let w = 1
  const out: FigStep[] = [{ note: '陣列已排序,重複的一定挨在一起。w = 下一個「新數字」該放的位置;第 0 個一定保留,所以 w 從 1 開始', views: [arr([...a], { label: 'nums', done: [0], pointers: [{ name: 'w', index: 1 }] })] }]
  for (let i = 1; i < a.length; i++) {
    if (a[i] !== a[w - 1]) {
      a[w] = a[i]
      out.push({ note: `nums[${i}] = ${a[i]} 和已保留的最後一個 ${a[w - 1]} 不同 → 寫到 nums[${w}],w 變 ${w + 1}`, views: [arr([...a], { label: 'nums', highlight: [w], compare: [i], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
      w++
    } else if (i <= 2) {
      out.push({ note: `nums[${i}] = ${a[i]} 和已保留的最後一個一樣 → 跳過`, views: [arr([...a], { label: 'nums', dim: [i], done: Array.from({ length: w }, (_, k) => k), pointers: [{ name: 'w', index: w }, { name: 'i', index: i, color: 'b' }] })] })
    }
  }
  out.push({ note: `回傳 k = ${w},前 ${w} 個就是不重複的 [${a.slice(0, w)}](後面剩什麼不重要)`, views: [arr(a, { label: 'nums', done: Array.from({ length: w }, (_, k) => k), dim: Array.from({ length: a.length - w }, (_, k) => w + k) })] })
  return out
}

function setFig(): FigStep[] {
  const u = [...new Set(A)]
  return [
    { note: '不管順序的話,先把不重複的收集起來(因為已排序,也可以直接比前一個)', views: [arr(A, { label: 'nums' }), arr(u, { label: '不重複的值' })] },
    { note: `再把它們寫回 nums 的前 ${u.length} 格,回傳 ${u.length}。多用了 O(n) 空間,不符合原地的要求`, views: [arr([...u, ...A.slice(u.length)], { label: 'nums', done: u.map((_, i) => i) })] },
  ]
}

export const q0026: Solution = {
  id: 26,
  plain: '一排已經由小到大排好的數字,同一個數可能出現好幾次。把每種數字只留一個、依序擠到最前面,告訴我留下了幾個。後面剩下什麼不用管。',
  statement: '給**非遞減排序**的陣列 `nums`,**原地**刪除重複元素,使每個值只出現一次並保持相對順序。回傳不重複元素的個數 k;nums 的前 k 個元素必須是這些不重複的值。',
  examples: [
    { input: 'nums = [1,1,2]', output: '2,nums 前 2 個 = [1,2]' },
    { input: 'nums = [0,0,1,1,1,2,2,3,3,4]', output: '5,nums 前 5 個 = [0,1,2,3,4]' },
  ],
  constraints: ['n ≤ 3·10⁴', '已排序 → 重複的一定相鄰', 'O(1) 額外空間'],
  insight: ['已排序 → 「是不是新數字」只要和**上一個保留的**比較', '快慢指標:i 掃過全部,w 指著下一個該寫的位置', '這個寫法可以推廣成「每個數最多留 k 個」:和 `nums[w − k]` 比較([80](#/q/80))'],
  approaches: [
    {
      name: '快慢指標',
      idea: '`w = 1`;`nums[i] != nums[w−1]` 時 `nums[w] = nums[i]`、`w += 1`。',
      steps: ['n = 0 時回傳 0', '`w = 1`', '`for i in 1..n−1`:`nums[i] != nums[w − 1]` → `nums[w] = nums[i]`、`w += 1`', '回傳 w'],
      figure: { title: `nums = [${A}]`, steps: twoPtrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描,只用兩個指標。' },
      verdict: '最推薦。[[p:two-pointers]]的快慢指標標準題,和 [27](#/q/27)、[283](#/q/283) 是同一個模板。',
      code: {
        python: `def removeDuplicates(nums):
    if not nums:
        return 0
    w = 1                                     # nums[0] 一定保留
    for i in range(1, len(nums)):
        if nums[i] != nums[w - 1]:            # 和最後保留的那個不同 → 新數字
            nums[w] = nums[i]
            w += 1
    return w`,
        c: `int removeDuplicates(int *nums, int numsSize) {
    if (numsSize == 0) return 0;
    int w = 1;
    for (int i = 1; i < numsSize; i++)
        if (nums[i] != nums[w - 1]) nums[w++] = nums[i];
    return w;
}`,
        cpp: `int removeDuplicates(vector<int>& nums) {
    if (nums.empty()) return 0;
    int w = 1;
    for (size_t i = 1; i < nums.size(); i++)
        if (nums[i] != nums[w - 1]) nums[w++] = nums[i];
    return w;
}`,
        java: `int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;
    int w = 1;
    for (int i = 1; i < nums.length; i++)
        if (nums[i] != nums[w - 1]) nums[w++] = nums[i];
    return w;
}`,
        javascript: `function removeDuplicates(nums) {
  if (!nums.length) return 0;
  let w = 1;
  for (let i = 1; i < nums.length; i++) if (nums[i] !== nums[w - 1]) nums[w++] = nums[i];
  return w;
}`,
      },
    },
    {
      name: '收集不重複值再寫回',
      idea: '先用集合 / 新陣列收集不重複的值(依序),再寫回 nums 的前面。',
      steps: ['`u` = 依序不重複的值', '`nums[:len(u)] = u`', '回傳 `len(u)`'],
      figure: { title: `nums = [${A}]`, steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '多開了一個存不重複值的陣列。' },
      verdict: '好懂但不符合 O(1) 空間。拿來對照快慢指標的寫法。',
      code: {
        python: `def removeDuplicates(nums):
    u = list(dict.fromkeys(nums))             # 依原順序去重
    nums[:len(u)] = u
    return len(u)`,
        c: `int removeDuplicates(int *nums, int numsSize) {
    int *u = malloc((numsSize + 1) * sizeof(int)), k = 0;
    for (int i = 0; i < numsSize; i++)
        if (k == 0 || u[k - 1] != nums[i]) u[k++] = nums[i];
    memcpy(nums, u, k * sizeof(int));
    free(u);
    return k;
}`,
        cpp: `int removeDuplicates(vector<int>& nums) {
    vector<int> u;
    for (int x : nums) if (u.empty() || u.back() != x) u.push_back(x);
    copy(u.begin(), u.end(), nums.begin());
    return u.size();
}`,
        java: `int removeDuplicates(int[] nums) {
    Set<Integer> u = new LinkedHashSet<>();
    for (int x : nums) u.add(x);
    int k = 0;
    for (int x : u) nums[k++] = x;
    return k;
}`,
        javascript: `function removeDuplicates(nums) {
  const u = [...new Set(nums)];
  u.forEach((x, i) => (nums[i] = x));
  return u.length;
}`,
      },
    },
  ],
  pitfalls: ['和 `nums[i − 1]` 比較也可以(已排序),但和 `nums[w − 1]` 比較才能推廣到「最多留 k 個」', '空陣列時 w 從 1 開始會回傳錯的值'],
  check: {
    kind: 'fn',
    fn: 'removeDuplicates',
    cases: [
      { args: [[1, 1, 2]], out: 2 },
      { args: [A], out: 5 },
      { args: [[7]], out: 1 },
      { args: [[-3, -3, -1, 0, 0, 0]], out: 3 },
    ],
  },
}
