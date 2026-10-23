import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 169. Majority Element

const A = [2, 2, 1, 1, 1, 2, 2]

function countFig(): FigStep[] {
  const cnt = new Map<number, number>()
  const out: FigStep[] = []
  A.forEach((x, i) => {
    cnt.set(x, (cnt.get(x) ?? 0) + 1)
    if (i === 0 || i === 3 || i === A.length - 1) out.push({ note: `看到 ${x},它的次數變成 ${cnt.get(x)}`, views: [arr(A, { label: 'nums', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), kv([...cnt.entries()], '次數', [x])] })
  })
  out.push({ note: `次數超過 n/2 = ${Math.floor(A.length / 2)} 的是 2(出現 ${cnt.get(2)} 次)`, views: [kv([...cnt.entries()], '次數', [2])] })
  return out
}

function sortFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return [
    { note: '排序之後,一樣的數會排在一起', views: [arr(s, { label: '排序後' })] },
    { note: `多數元素佔了超過一半的位置,不管它排在左邊還是右邊,一定會蓋過正中間 [${m}]。所以答案就是 s[${m}] = ${s[m]}`, views: [arr(s, { label: '排序後', highlight: [m], pointers: [{ name: 'n/2', index: m }] })] },
  ]
}

function bmFig(): FigStep[] {
  let cand = 0
  let c = 0
  const out: FigStep[] = [{ note: '想像不同的數一對一「同歸於盡」:多數元素比其他人加起來還多,最後一定是它活下來。cand = 候選人,count = 它還剩幾票', views: [arr(A, { label: 'nums' }), arr(['-', 0], { label: 'cand / count' })] }]
  A.forEach((x, i) => {
    let note: string
    if (c === 0) {
      cand = x
      c = 1
      note = `count 是 0,沒有候選人 → ${x} 當候選人,count = 1`
    } else if (x === cand) {
      c++
      note = `${x} 和候選人一樣,count + 1 = ${c}`
    } else {
      c--
      note = `${x} 和候選人 ${cand} 不同,互相抵消一票,count − 1 = ${c}`
    }
    out.push({ note, views: [arr(A, { label: 'nums', highlight: [i], done: Array.from({ length: i }, (_, k) => k) }), arr([cand, c], { label: 'cand / count', highlight: [1] })] })
  })
  out.push({ note: `最後的候選人 ${cand} 就是答案(題目保證多數元素一定存在)`, views: [arr([cand, c], { label: 'cand / count', done: [0] })] })
  return out
}

export const q0169: Solution = {
  id: 169,
  plain: '班上投票,有一個人的票數超過全班的一半。給你所有的票,找出那個人。因為他「超過一半」,所以不管怎麼算,他都會勝出。',
  statement: '給長度 n 的陣列 `nums`,回傳**多數元素**:出現次數**大於** `⌊n/2⌋` 的那個數。保證一定存在。',
  examples: [
    { input: 'nums = [3,2,3]', output: '3' },
    { input: 'nums = [2,2,1,1,1,2,2]', output: '2' },
  ],
  constraints: ['n ≤ 5·10⁴', 'Follow-up:O(n) 時間、O(1) 空間'],
  insight: [
    '最直接:數每個數出現幾次(Hash 表)',
    '「超過一半」有個特別的性質:排序後它一定蓋住正中間',
    '更妙的:讓不同的數兩兩抵消,多數元素一定撐到最後 → **Boyer-Moore 投票法**,O(1) 空間',
  ],
  approaches: [
    {
      name: 'Hash 表計數',
      idea: '用 Hash 表記每個數的次數,一超過 n/2 就回傳。',
      steps: ['`cnt = {}`', '`for x in nums`:`cnt[x] += 1`', '`cnt[x] > n // 2` → 回傳 x'],
      figure: { title: `nums = [${A}]`, steps: countFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數進表一次;最壞有 n/2 種不同的數。' },
      verdict: '最好想,也能直接改成「找出現超過 k 次的數」。',
      code: {
        python: `def majorityElement(nums):
    cnt = {}
    for x in nums:
        cnt[x] = cnt.get(x, 0) + 1
        if cnt[x] > len(nums) // 2:
            return x`,
        c: `// C 沒有內建 Hash 表:先排序再數連續段(和排序法同概念)
static int cmp(const void *a, const void *b) { return (*(int *)a > *(int *)b) - (*(int *)a < *(int *)b); }

int majorityElement(int *nums, int numsSize) {
    qsort(nums, numsSize, sizeof(int), cmp);
    for (int i = 0, j; i < numsSize; i = j) {
        for (j = i; j < numsSize && nums[j] == nums[i]; j++) {}
        if (j - i > numsSize / 2) return nums[i];     // 這一段的長度就是次數
    }
    return -1;
}`,
        cpp: `int majorityElement(vector<int>& nums) {
    unordered_map<int, int> cnt;
    for (int x : nums)
        if (++cnt[x] > (int)nums.size() / 2) return x;
    return -1;
}`,
        java: `int majorityElement(int[] nums) {
    Map<Integer, Integer> cnt = new HashMap<>();
    for (int x : nums)
        if (cnt.merge(x, 1, Integer::sum) > nums.length / 2) return x;
    return -1;
}`,
        javascript: `function majorityElement(nums) {
  const cnt = new Map();
  for (const x of nums) {
    cnt.set(x, (cnt.get(x) ?? 0) + 1);
    if (cnt.get(x) > nums.length / 2) return x;
  }
}`,
      },
    },
    {
      name: '排序取中間',
      idea: '排序後回傳 `nums[n / 2]`。',
      steps: ['排序', '回傳 `nums[n // 2]`'],
      figure: { title: `nums = [${A}]`, steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(log n)', why: '排序的成本;取答案 O(1)。' },
      verdict: '兩行解決,但比 O(n) 慢,也會改動原陣列。',
      code: {
        python: `def majorityElement(nums):
    nums.sort()
    return nums[len(nums) // 2]               # 多數元素一定蓋住正中間`,
        c: `static int cmp(const void *a, const void *b) { return (*(int *)a > *(int *)b) - (*(int *)a < *(int *)b); }

int majorityElement(int *nums, int numsSize) {
    qsort(nums, numsSize, sizeof(int), cmp);
    return nums[numsSize / 2];
}`,
        cpp: `int majorityElement(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    return nums[nums.size() / 2];
}`,
        java: `int majorityElement(int[] nums) {
    Arrays.sort(nums);
    return nums[nums.length / 2];
}`,
        javascript: `function majorityElement(nums) {
  nums.sort((a, b) => a - b);
  return nums[nums.length >> 1];
}`,
      },
    },
    {
      name: 'Boyer-Moore 投票法',
      idea: '`count == 0` 時換候選人;同候選人 +1,不同 −1。多數元素的票比其他全部加起來還多,抵消完一定剩它。',
      steps: ['`cand = 0, count = 0`', '`for x in nums`:`count == 0` → `cand = x`', '`count += 1 if x == cand else -1`', '回傳 cand'],
      figure: { title: `nums = [${A}]`, steps: bmFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '一次掃描,只用兩個變數。' },
      verdict: '最推薦,也是 Follow-up 的標準答案。注意它只在「保證有多數元素」時才對;不保證時要再掃一次確認次數。',
      code: {
        python: `def majorityElement(nums):
    cand, count = 0, 0
    for x in nums:
        if count == 0:
            cand = x                          # 沒有人站著 → 換 x 上台
        count += 1 if x == cand else -1       # 同黨 +1,不同黨互相抵消
    return cand`,
        c: `int majorityElement(int *nums, int numsSize) {
    int cand = 0, count = 0;
    for (int i = 0; i < numsSize; i++) {
        if (count == 0) cand = nums[i];
        count += nums[i] == cand ? 1 : -1;
    }
    return cand;
}`,
        cpp: `int majorityElement(vector<int>& nums) {
    int cand = 0, count = 0;
    for (int x : nums) {
        if (count == 0) cand = x;
        count += x == cand ? 1 : -1;
    }
    return cand;
}`,
        java: `int majorityElement(int[] nums) {
    int cand = 0, count = 0;
    for (int x : nums) {
        if (count == 0) cand = x;
        count += x == cand ? 1 : -1;
    }
    return cand;
}`,
        javascript: `function majorityElement(nums) {
  let cand = 0, count = 0;
  for (const x of nums) {
    if (count === 0) cand = x;
    count += x === cand ? 1 : -1;
  }
  return cand;
}`,
      },
    },
  ],
  pitfalls: ['投票法裡先判斷 count == 0 換人,再加減票;順序反了會錯', '題目若不保證有多數元素,投票法的結果要再數一次確認'],
  followUp: [{ q: '找出所有出現超過 ⌊n/3⌋ 次的數?', a: '229. Majority Element II:最多兩個答案,投票法改成同時維護兩個候選人,最後再掃一次確認。' }],
  check: {
    kind: 'fn',
    fn: 'majorityElement',
    cases: [
      { args: [[3, 2, 3]], out: 3 },
      { args: [A], out: 2 },
      { args: [[1]], out: 1 },
      { args: [[-1, -1, 5]], out: -1 },
      { args: [[6, 5, 5]], out: 5 },
    ],
  },
}
