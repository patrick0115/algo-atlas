import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 523. Continuous Subarray Sum

const A = [23, 2, 4, 6, 7]
const K = 6

function modFig(): FigStep[] {
  const first = new Map<number, number>([[0, -1]])
  let pre = 0
  const out: FigStep[] = [{ note: `子陣列 (i, j] 的和是 k 的倍數 ⇔ pre[j] 和 pre[i] 除以 k 的**餘數相同**。用表記「每個餘數第一次出現的位置」,一開始放 {0: −1}`, views: [arr(A, { label: 'nums' }), kv([...first.entries()], '餘數 → 第一次出現的索引')] }]
  for (let j = 0; j < A.length; j++) {
    pre = (pre + A[j]) % K
    if (first.has(pre)) {
      const i = first.get(pre)!
      const ok = j - i >= 2
      out.push({ note: `前綴和 mod ${K} = ${pre},之前在索引 ${i} 出現過 → 子陣列 (${i}, ${j}] 長度 ${j - i}${ok ? ' ≥ 2 → true' : ' < 2,不算,也不更新(保留最早的位置)'}`, views: [arr(A, { label: 'nums', range: [i + 1, j], highlight: [j] }), kv([...first.entries()], '餘數 → 第一次出現的索引', [pre])] })
      if (ok) return out
    } else {
      first.set(pre, j)
      out.push({ note: `前綴和 mod ${K} = ${pre},第一次出現 → 記下位置 ${j}`, views: [arr(A, { label: 'nums', highlight: [j] }), kv([...first.entries()], '餘數 → 第一次出現的索引', [pre])] })
    }
  }
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:每個起點 i 往右累加,長度 ≥ 2 且和 % k == 0 就回傳 true', views: [arr(A, { label: 'i = 0', range: [0, 1] })] },
    { note: 'i = 1:2 + 4 = 6,是 6 的倍數 → true。最壞 O(n²),n = 10⁵ 太慢', views: [arr(A, { label: 'i = 1', range: [1, 2], done: [1, 2] })] },
  ]
}

export const q0523: Solution = {
  id: 523,
  plain: '一排非負整數裡,有沒有一段**至少兩個數**的連續子陣列,加起來是 k 的倍數(0 也算 k 的倍數)?',
  statement: '給整數陣列 `nums` 和整數 `k`,若存在長度**至少 2** 的連續子陣列,其總和是 k 的倍數(包含 0),回傳 true,否則 false。',
  examples: [
    { input: 'nums = [23,2,4,6,7], k = 6', output: 'true', note: '[2,4] 和為 6' },
    { input: 'nums = [23,2,6,4,7], k = 6', output: 'true', note: '整個陣列和為 42' },
    { input: 'nums = [23,2,6,4,7], k = 13', output: 'false' },
  ],
  constraints: ['n ≤ 10⁵', '0 ≤ nums[i] ≤ 10⁹,1 ≤ k ≤ 2³¹ − 1'],
  insight: ['區間和 = 前綴和相減:`pre[j] − pre[i]` 是 k 的倍數 ⇔ `pre[j] % k == pre[i] % k`', '[560](#/q/560) 的變形:Hash 表記的是「餘數」而不是前綴和本身', '要長度 ≥ 2 → 記餘數**第一次**出現的位置(越早越長),再比距離', '表一開始放 {0: −1}:從開頭開始的子陣列也能被找到'],
  approaches: [
    {
      name: '前綴和餘數 + 最早位置',
      idea: '`first = {0: −1}`;`r = pre % k`,r 出現過且 `j − first[r] ≥ 2` → true;沒出現過才記下。',
      steps: ['`first = {0: −1}`、`r = 0`', '`for j, x`:`r = (r + x) % k`', '`r in first` → `j − first[r] >= 2` 就回傳 true', '否則 `first[r] = j`(只記第一次)', '回傳 false'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: modFig() },
      complexity: { time: 'O(n)', space: 'O(min(n, k))', why: '一次掃描;表裡最多 min(n, k) 個餘數。' },
      verdict: '最推薦。「和是 k 的倍數」就想到「餘數相同」,這是前綴和題的常見轉換(974 題也是)。',
      code: {
        python: `def checkSubarraySum(nums, k):
    first = {0: -1}                           # 餘數 → 第一次出現的位置
    r = 0
    for j, x in enumerate(nums):
        r = (r + x) % k
        if r in first:
            if j - first[r] >= 2:             # 長度至少 2
                return True
        else:
            first[r] = j                      # 只記最早的,才能讓長度最大
    return False`,
        c: `typedef struct { int key, idx; UT_hash_handle hh; } Entry;

bool checkSubarraySum(int *nums, int numsSize, int k) {
    Entry *tab = NULL, *e, *tmp;
    e = malloc(sizeof(Entry)); e->key = 0; e->idx = -1;
    HASH_ADD_INT(tab, key, e);
    long long r = 0;
    bool ans = false;
    for (int j = 0; j < numsSize && !ans; j++) {
        r = (r + nums[j]) % k;
        int key = (int)r;
        HASH_FIND_INT(tab, &key, e);
        if (e) { if (j - e->idx >= 2) ans = true; }
        else { e = malloc(sizeof(Entry)); e->key = key; e->idx = j; HASH_ADD_INT(tab, key, e); }
    }
    HASH_ITER(hh, tab, e, tmp) { HASH_DEL(tab, e); free(e); }
    return ans;
}`,
        cpp: `bool checkSubarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> first{{0, -1}};
    long long r = 0;
    for (int j = 0; j < (int)nums.size(); j++) {
        r = (r + nums[j]) % k;
        auto it = first.find(r);
        if (it != first.end()) { if (j - it->second >= 2) return true; }
        else first[r] = j;
    }
    return false;
}`,
        java: `boolean checkSubarraySum(int[] nums, int k) {
    Map<Integer, Integer> first = new HashMap<>();
    first.put(0, -1);
    long r = 0;
    for (int j = 0; j < nums.length; j++) {
        r = (r + nums[j]) % k;
        Integer i = first.get((int) r);
        if (i != null) { if (j - i >= 2) return true; }
        else first.put((int) r, j);
    }
    return false;
}`,
        javascript: `function checkSubarraySum(nums, k) {
  const first = new Map([[0, -1]]);
  let r = 0;
  for (let j = 0; j < nums.length; j++) {
    r = (r + nums[j]) % k;
    if (first.has(r)) {
      if (j - first.get(r) >= 2) return true;
    } else first.set(r, j);
  }
  return false;
}`,
      },
    },
    {
      name: '暴力枚舉',
      idea: '每個起點 i,往右累加;長度 ≥ 2 且 `s % k == 0` 就回傳 true。',
      steps: ['`for i`:`s = nums[i]`', '`for j in i+1..n−1`:`s += nums[j]`;`s % k == 0` → true', '回傳 false'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '所有長度 ≥ 2 的子陣列。' },
      verdict: '正確但太慢,總和還可能超過 int。',
      code: {
        python: `def checkSubarraySum(nums, k):
    n = len(nums)
    for i in range(n):
        s = nums[i]
        for j in range(i + 1, n):
            s += nums[j]
            if s % k == 0:
                return True
    return False`,
        c: `bool checkSubarraySum(int *nums, int numsSize, int k) {
    for (int i = 0; i < numsSize; i++) {
        long long s = nums[i];
        for (int j = i + 1; j < numsSize; j++)
            if ((s += nums[j]) % k == 0) return true;
    }
    return false;
}`,
        cpp: `bool checkSubarraySum(vector<int>& nums, int k) {
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        long long s = nums[i];
        for (int j = i + 1; j < n; j++)
            if ((s += nums[j]) % k == 0) return true;
    }
    return false;
}`,
        java: `boolean checkSubarraySum(int[] nums, int k) {
    for (int i = 0; i < nums.length; i++) {
        long s = nums[i];
        for (int j = i + 1; j < nums.length; j++)
            if ((s += nums[j]) % k == 0) return true;
    }
    return false;
}`,
        javascript: `function checkSubarraySum(nums, k) {
  for (let i = 0; i < nums.length; i++) {
    let s = nums[i];
    for (let j = i + 1; j < nums.length; j++) if ((s += nums[j]) % k === 0) return true;
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['餘數已經在表裡時又更新成新位置:會讓子陣列變短,可能誤判長度 < 2', '忘了 {0: −1}:像 [6, 6]、k = 6 從開頭開始的會漏', '[0, 0] 和 k 任意都是 true(0 是 k 的倍數)'],
  check: {
    kind: 'fn',
    fn: 'checkSubarraySum',
    cases: [
      { args: [A, K], out: true },
      { args: [[23, 2, 6, 4, 7], 6], out: true },
      { args: [[23, 2, 6, 4, 7], 13], out: false },
      { args: [[0, 0], 1], out: true },
      { args: [[5, 0, 0, 0], 3], out: true },
      { args: [[1, 0], 2], out: false },
      { args: [[6], 6], out: false },
    ],
  },
}
