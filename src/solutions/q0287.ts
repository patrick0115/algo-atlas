import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 287. Find the Duplicate Number

const A = [1, 3, 4, 2, 2]
const B = [3, 1, 3, 4, 2]

function setFig(): FigStep[] {
  const seen: number[] = []
  const out: FigStep[] = [{ note: '最直接:邊走邊記看過的數,第一個「已經看過」的就是重複的', views: [arr(B, { label: 'nums' }), kv([], 'seen')] }]
  for (let i = 0; i < B.length; i++) {
    const dup = seen.includes(B[i])
    out.push({ note: dup ? `${B[i]} 已經看過 → 答案 ${B[i]}` : `${B[i]} 沒看過,記下來`, views: [arr(B, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), kv(seen.map((v) => [v, '✓']), 'seen', [B[i]])] })
    if (dup) return out
    seen.push(B[i])
  }
  return out
}

function bsFig(): FigStep[] {
  const n = B.length - 1
  let lo = 1
  let hi = n
  const out: FigStep[] = [{ note: `值只會在 1 ~ ${n}。鴿籠原理:如果「≤ mid 的數」超過 mid 個,重複的數一定 ≤ mid。對「值」二分,不是對位置`, views: [arr(B, { label: 'nums' }), arr(range(1, n), { label: '可能的答案(值)', range: [0, n - 1] })] }]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const cnt = B.filter((x) => x <= mid).length
    const left = cnt > mid
    out.push({
      note: `mid = ${mid}:nums 裡 ≤ ${mid} 的數有 ${cnt} 個 ${left ? `> ${mid} → 1~${mid} 這 ${mid} 個值擠了 ${cnt} 個數,重複的一定在這裡 → hi = mid` : `≤ ${mid} → 1~${mid} 沒有擠,重複的在右邊 → lo = mid + 1`}`,
      views: [arr(B, { label: 'nums', highlight: B.flatMap((x, i) => (x <= mid ? [i] : [])) }), arr(range(1, n), { label: '可能的答案(值)', range: [lo - 1, hi - 1], compare: [mid - 1] })],
    })
    if (left) hi = mid
    else lo = mid + 1
  }
  out.push({ note: `lo == hi = ${lo} → 答案 ${lo}`, views: [arr(range(1, n), { label: '答案', highlight: [lo - 1] })] })
  return out
}

function floydFig(): FigStep[] {
  const nx = (i: number) => B[i]
  let slow = B[0]
  let fast = B[B[0]]
  const out: FigStep[] = [
    { note: `把陣列看成鏈結串列:索引 i 的「next」是 nums[i]。從 0 出發:0 → ${B[0]} → ${B[B[0]]} → …。有兩個位置的值都指向同一個數(重複的數),所以一定形成環,**環的入口就是答案**`, views: [arr(B, { label: 'nums(索引 i → 下一站 nums[i])' })] },
  ]
  while (slow !== fast) {
    out.push({ note: `第一階段找相遇點:slow = ${slow}、fast = ${fast}`, views: [arr(B, { label: 'nums', pointers: [{ name: 'slow', index: slow }, { name: 'fast', index: fast, color: 'b' }] })] })
    slow = nx(slow)
    fast = nx(nx(fast))
  }
  out.push({ note: `slow 和 fast 在 ${slow} 相遇(在環裡)`, views: [arr(B, { label: 'nums', highlight: [slow], pointers: [{ name: 'slow=fast', index: slow }] })] })
  let p = 0
  while (p !== slow) {
    out.push({ note: `第二階段找入口:一個從 0 出發、一個從相遇點出發,都一次一步。現在 ${p} 和 ${slow}`, views: [arr(B, { label: 'nums', pointers: [{ name: 'p', index: p }, { name: 'slow', index: slow, color: 'b' }] })] })
    p = nx(p)
    slow = nx(slow)
  }
  out.push({ note: `兩個在 ${p} 相遇 → 環的入口是 ${p},它就是重複的數`, views: [arr(B, { label: 'nums', highlight: B.flatMap((x, i) => (x === p ? [i] : [])) })] })
  return out
}

export const q0287: Solution = {
  id: 287,
  plain: '一個裝了 n+1 個數的陣列,每個數都在 1 到 n 之間,所以**一定有一個數重複**(像 5 隻鴿子住 4 個籠子,一定有籠子擠了兩隻)。找出它,但不能改陣列、只能用一點點額外空間。',
  statement: '`nums` 有 `n + 1` 個整數,每個都在 `[1, n]` 之間,其中**剛好一個數重複**(可能重複很多次)。找出它。不能修改陣列,只能用 O(1) 額外空間。',
  examples: [
    { input: 'nums = [1,3,4,2,2]', output: '2' },
    { input: 'nums = [3,1,3,4,2]', output: '3' },
    { input: 'nums = [3,3,3,3,3]', output: '3', note: '重複的數可以出現很多次' },
  ],
  constraints: [
    '`1 ≤ n ≤ 10⁵`',
    '**不能改陣列**(所以不能排序、不能在原陣列做標記)、**O(1) 空間**(所以不能用 set)',
    '值在 `[1, n]` → 值可以拿來當索引,這是解題的關鍵',
  ],
  insight: [
    '沒有限制的話:用 set 一下就找到(O(n) 空間),或排序後看相鄰(會改陣列)',
    '限制只能 O(1) 空間又不能改陣列,就要用「值的範圍是 1~n」這個特性',
    '想法一(二分):數「≤ mid 的數有幾個」。沒有重複的話剛好 mid 個;超過 mid 個,重複的就在 1~mid 裡 → 對值二分',
    '想法二(找環):把 `i → nums[i]` 當成「下一個節點」。兩個不同的索引指向同一個值 → 那個值有兩個「上一個」→ 形成環,**環的入口就是重複的數**。用 Floyd 找環入口',
  ],
  approaches: [
    {
      name: 'Hash Set',
      idea: '邊走邊記,第一個看過的就是答案。',
      steps: ['`seen = set()`', '對每個 `x`:`x in seen` → 回傳 `x`;否則加入'],
      figure: { title: `nums = [${B.join(',')}]`, steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '走一遍;set 最多存 n 個。' },
      verdict: '最快寫出來,但違反 O(1) 空間的限制。當作確認題意用。',
      code: {
        python: `def findDuplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return x
        seen.add(x)
    return -1`,
        c: `int findDuplicate(int *nums, int numsSize) {
    bool *seen = calloc(numsSize, sizeof(bool));   // 值在 1~n,直接當索引
    int ans = -1;
    for (int i = 0; i < numsSize; i++) {
        if (seen[nums[i]]) { ans = nums[i]; break; }
        seen[nums[i]] = true;
    }
    free(seen);
    return ans;
}`,
        cpp: `int findDuplicate(vector<int>& nums) {
    unordered_set<int> seen;
    for (int x : nums) {
        if (seen.count(x)) return x;
        seen.insert(x);
    }
    return -1;
}`,
        java: `int findDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int x : nums)
        if (!seen.add(x)) return x;
    return -1;
}`,
        javascript: `function findDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return x;
    seen.add(x);
  }
  return -1;
}`,
      },
    },
    {
      name: '對「值」二分搜尋(鴿籠原理)',
      idea: '答案在 `[1, n]`。猜 `mid`,數 nums 裡 `≤ mid` 的有幾個:超過 mid 個,重複的就 ≤ mid;否則在右邊。',
      steps: ['`lo = 1`、`hi = n`', '`while lo < hi`:`mid = (lo + hi) / 2`', '`cnt = (x <= mid 的個數)`', '`cnt > mid` → `hi = mid`;否則 `lo = mid + 1`', '回傳 `lo`'],
      figure: { title: `nums = [${B.join(',')}]`, steps: bsFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: '二分 log n 次,每次數一遍 O(n)。' },
      verdict: '符合限制,而且比 Floyd 好想。展示「二分的對象不一定是陣列位置,也可以是答案的值」([[p:binary-search-answer]])。',
      code: {
        python: `def findDuplicate(nums):
    lo, hi = 1, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        cnt = sum(1 for x in nums if x <= mid)
        if cnt > mid:                     # 1~mid 擠了太多數,重複的在這
            hi = mid
        else:
            lo = mid + 1
    return lo`,
        c: `int findDuplicate(int *nums, int numsSize) {
    int lo = 1, hi = numsSize - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2, cnt = 0;
        for (int i = 0; i < numsSize; i++) if (nums[i] <= mid) cnt++;
        if (cnt > mid) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        cpp: `int findDuplicate(vector<int>& nums) {
    int lo = 1, hi = (int)nums.size() - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        int cnt = count_if(nums.begin(), nums.end(), [&](int x) { return x <= mid; });
        if (cnt > mid) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        java: `int findDuplicate(int[] nums) {
    int lo = 1, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2, cnt = 0;
        for (int x : nums) if (x <= mid) cnt++;
        if (cnt > mid) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}`,
        javascript: `function findDuplicate(nums) {
  let lo = 1, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    let cnt = 0;
    for (const x of nums) if (x <= mid) cnt++;
    if (cnt > mid) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      },
    },
    {
      name: '快慢指針找環的入口(Floyd)',
      idea: '把 `nums[i]` 當成「從 i 走到哪裡」。從 0 出發一定會進入一個環,環的入口就是重複的數。第一階段 slow / fast 找到相遇點;第二階段一個回到起點,兩個都一次一步,相遇處就是入口。',
      steps: ['`slow = nums[0]`、`fast = nums[nums[0]]`', '`while slow != fast`:`slow = nums[slow]`、`fast = nums[nums[fast]]`', '`p = 0`;`while p != slow`:`p = nums[p]`、`slow = nums[slow]`', '回傳 `p`'],
      figure: { title: `nums = [${B.join(',')}]`, steps: floydFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '兩個階段各最多走 O(n) 步,只用兩個變數。' },
      verdict: '最佳解,但需要先理解 142. Linked List Cycle II 的「第二階段為什麼會在入口相遇」:相遇點到入口的距離,剛好等於起點到入口的距離(差整數圈)。',
      code: {
        python: `def findDuplicate(nums):
    slow, fast = nums[0], nums[nums[0]]
    while slow != fast:                   # 第一階段:找環裡的相遇點
        slow = nums[slow]
        fast = nums[nums[fast]]
    p = 0
    while p != slow:                      # 第二階段:找環的入口
        p = nums[p]
        slow = nums[slow]
    return p`,
        c: `int findDuplicate(int *nums, int numsSize) {
    int slow = nums[0], fast = nums[nums[0]];
    while (slow != fast) { slow = nums[slow]; fast = nums[nums[fast]]; }
    int p = 0;
    while (p != slow) { p = nums[p]; slow = nums[slow]; }
    return p;
}`,
        cpp: `int findDuplicate(vector<int>& nums) {
    int slow = nums[0], fast = nums[nums[0]];
    while (slow != fast) { slow = nums[slow]; fast = nums[nums[fast]]; }
    int p = 0;
    while (p != slow) { p = nums[p]; slow = nums[slow]; }
    return p;
}`,
        java: `int findDuplicate(int[] nums) {
    int slow = nums[0], fast = nums[nums[0]];
    while (slow != fast) { slow = nums[slow]; fast = nums[nums[fast]]; }
    int p = 0;
    while (p != slow) { p = nums[p]; slow = nums[slow]; }
    return p;
}`,
        javascript: `function findDuplicate(nums) {
  let slow = nums[0], fast = nums[nums[0]];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[nums[fast]];
  }
  let p = 0;
  while (p !== slow) {
    p = nums[p];
    slow = nums[slow];
  }
  return p;
}`,
      },
    },
  ],
  pitfalls: [
    '排序或在原陣列做標記(把 `nums[|x|]` 變負數):能找到答案,但違反「不能改陣列」',
    '二分時數的是「值 ≤ mid 的個數」,不是「索引 ≤ mid」',
    'Floyd 第二階段要從 **0**(起點)出發,不是從 `nums[0]`;兩邊的起點要和第一階段的定義一致',
    '用「總和 − 1~n 的和」:只在重複一次時成立,這題重複的數可能出現很多次',
  ],
  followUp: [
    { q: '為什麼環的入口就是重複的數?', a: '入口是「有兩個不同節點指向它」的那個點。在這張圖裡,指向值 v 的索引就是 nums 裡值為 v 的位置;v 重複 → 有兩個位置指向 v → v 是入口。' },
  ],
  check: {
    kind: 'fn',
    fn: 'findDuplicate',
    cases: [
      { args: [A], out: 2 },
      { args: [B], out: 3 },
      { args: [[3, 3, 3, 3, 3]], out: 3 },
      { args: [[1, 1]], out: 1 },
      { args: [[2, 5, 9, 6, 9, 3, 8, 9, 7, 1]], out: 9 },
    ],
  },
}
