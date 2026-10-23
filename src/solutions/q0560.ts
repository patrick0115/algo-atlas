import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 560. Subarray Sum Equals K

const A = [1, 2, 1, -1, 2]
const K = 3

function hashFig(): FigStep[] {
  const cnt = new Map<number, number>([[0, 1]])
  let pre = 0
  let ans = 0
  const out: FigStep[] = [{ note: `子陣列 (i, j] 的和 = pre[j] − pre[i]。要它等於 k → 找前面有幾個 pre[i] = pre[j] − k。用 Hash 表記「每個前綴和出現過幾次」,一開始放 {0: 1}(代表「什麼都不選」的空前綴)`, views: [arr(A, { label: 'nums' }), kv([...cnt.entries()], '前綴和 → 出現次數')] }]
  A.forEach((x, j) => {
    pre += x
    const need = pre - K
    const got = cnt.get(need) ?? 0
    ans += got
    cnt.set(pre, (cnt.get(pre) ?? 0) + 1)
    out.push({ note: `加上 ${x},前綴和 = ${pre}。要找 ${pre} − ${K} = ${need}:表裡有 ${got} 個 → 答案 + ${got} = ${ans}。再把 ${pre} 記進表`, views: [arr(A, { label: 'nums', highlight: [j], done: Array.from({ length: j }, (_, k) => k) }), kv([...cnt.entries()], '前綴和 → 出現次數', [need, pre])] })
  })
  out.push({ note: `總共 ${ans} 個:[1,2]、[2,1]、[1,2,1,−1]`, views: [arr(A, { label: 'nums', done: A.map((_, i) => i) })] })
  return out
}

function bruteFig(): FigStep[] {
  return [
    { note: '暴力:固定起點 i,往右延伸 j,一路累加;和等於 k 就計數', views: [arr(A, { label: 'i = 0', range: [0, 1], highlight: [0, 1] })] },
    { note: '每個起點都往右掃一遍 → O(n²)。有負數,所以不能用滑動視窗(和不會單調變大)', views: [arr(A, { label: 'i = 1', range: [1, 2], highlight: [1, 2] })] },
  ]
}

export const q0560: Solution = {
  id: 560,
  plain: '一排數字(可能有負數),有幾段「連續的一段」加起來剛好等於 k?',
  statement: '給整數陣列 `nums` 和整數 `k`,回傳總和等於 k 的**連續子陣列**個數。',
  examples: [
    { input: 'nums = [1,1,1], k = 2', output: '2' },
    { input: 'nums = [1,2,3], k = 3', output: '2' },
  ],
  constraints: ['n ≤ 2·10⁴', '值在 −1000 ~ 1000(有負數!)', 'k 在 ±10⁷'],
  insight: ['有負數 → 滑動視窗不能用(擴大視窗,和不一定變大)', '子陣列和 = 兩個前綴和相減:`pre[j] − pre[i] = k` ⇔ `pre[i] = pre[j] − k`', '掃到 j 時,問「前面有幾個前綴和等於 pre[j] − k」→ Hash 表計數', '表一開始要有 {0: 1},才能算到從開頭開始的子陣列'],
  approaches: [
    {
      name: '前綴和 + Hash 表計數',
      idea: '`cnt = {0: 1}`;每一步 `pre += x`、`ans += cnt[pre − k]`、`cnt[pre] += 1`。',
      steps: ['`cnt = {0: 1}`、`pre = ans = 0`', '`for x in nums`:`pre += x`', '`ans += cnt.get(pre − k, 0)`', '`cnt[pre] += 1`(先查再記,避免自己配自己)'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: hashFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '一次掃描;表最多存 n+1 個前綴和。' },
      verdict: '最推薦,[[p:prefix-sum]] + [[p:hash-map]]的經典題。「區間和 = 某值」的題目幾乎都是這一招。',
      code: {
        python: `def subarraySum(nums, k):
    cnt = {0: 1}                              # 空前綴:讓「從開頭開始」的子陣列也被算到
    pre = ans = 0
    for x in nums:
        pre += x
        ans += cnt.get(pre - k, 0)            # 前面有幾個前綴和 = pre − k
        cnt[pre] = cnt.get(pre, 0) + 1
    return ans`,
        c: `// 用 uthash 當 Hash 表:前綴和 → 出現次數
typedef struct { int key, cnt; UT_hash_handle hh; } Entry;

int subarraySum(int *nums, int numsSize, int k) {
    Entry *tab = NULL, *e;
    e = malloc(sizeof(Entry)); e->key = 0; e->cnt = 1;
    HASH_ADD_INT(tab, key, e);
    int pre = 0, ans = 0;
    for (int i = 0; i < numsSize; i++) {
        pre += nums[i];
        int need = pre - k;
        HASH_FIND_INT(tab, &need, e);
        if (e) ans += e->cnt;
        HASH_FIND_INT(tab, &pre, e);
        if (e) e->cnt++;
        else { e = malloc(sizeof(Entry)); e->key = pre; e->cnt = 1; HASH_ADD_INT(tab, key, e); }
    }
    Entry *tmp;
    HASH_ITER(hh, tab, e, tmp) { HASH_DEL(tab, e); free(e); }
    return ans;
}`,
        cpp: `int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> cnt{{0, 1}};
    int pre = 0, ans = 0;
    for (int x : nums) {
        pre += x;
        auto it = cnt.find(pre - k);
        if (it != cnt.end()) ans += it->second;
        cnt[pre]++;
    }
    return ans;
}`,
        java: `int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> cnt = new HashMap<>();
    cnt.put(0, 1);
    int pre = 0, ans = 0;
    for (int x : nums) {
        pre += x;
        ans += cnt.getOrDefault(pre - k, 0);
        cnt.merge(pre, 1, Integer::sum);
    }
    return ans;
}`,
        javascript: `function subarraySum(nums, k) {
  const cnt = new Map([[0, 1]]);
  let pre = 0, ans = 0;
  for (const x of nums) {
    pre += x;
    ans += cnt.get(pre - k) ?? 0;
    cnt.set(pre, (cnt.get(pre) ?? 0) + 1);
  }
  return ans;
}`,
      },
    },
    {
      name: '枚舉起點,往右累加',
      idea: '每個起點 i,j 往右累加 `s += nums[j]`,`s == k` 就計數。',
      steps: ['`for i`:`s = 0`', '`for j in i..n−1`:`s += nums[j]`;`s == k` → `ans += 1`'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: 'n = 2·10⁴ 時約 2·10⁸ 次加法,邊緣。' },
      verdict: '正確、好懂。注意不能遇到 s > k 就停(後面可能有負數拉回來)。',
      code: {
        python: `def subarraySum(nums, k):
    ans = 0
    for i in range(len(nums)):
        s = 0
        for j in range(i, len(nums)):
            s += nums[j]
            if s == k:
                ans += 1                      # 不能 break:後面可能有負數
    return ans`,
        c: `int subarraySum(int *nums, int numsSize, int k) {
    int ans = 0;
    for (int i = 0; i < numsSize; i++)
        for (int j = i, s = 0; j < numsSize; j++)
            if ((s += nums[j]) == k) ans++;
    return ans;
}`,
        cpp: `int subarraySum(vector<int>& nums, int k) {
    int n = nums.size(), ans = 0;
    for (int i = 0; i < n; i++)
        for (int j = i, s = 0; j < n; j++)
            if ((s += nums[j]) == k) ans++;
    return ans;
}`,
        java: `int subarraySum(int[] nums, int k) {
    int ans = 0;
    for (int i = 0; i < nums.length; i++)
        for (int j = i, s = 0; j < nums.length; j++)
            if ((s += nums[j]) == k) ans++;
    return ans;
}`,
        javascript: `function subarraySum(nums, k) {
  let ans = 0;
  for (let i = 0; i < nums.length; i++)
    for (let j = i, s = 0; j < nums.length; j++) if ((s += nums[j]) === k) ans++;
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['忘了 `cnt = {0: 1}`:從開頭開始的子陣列(像 nums = [3], k = 3)會漏掉', '先記 `cnt[pre]` 再查:k = 0 時會把空子陣列也算進去', '用滑動視窗:有負數時不成立'],
  check: {
    kind: 'fn',
    fn: 'subarraySum',
    cases: [
      { args: [[1, 1, 1], 2], out: 2 },
      { args: [[1, 2, 3], 3], out: 2 },
      { args: [A, K], out: 3 },
      { args: [[0, 0, 0], 0], out: 6 },
      { args: [[-1, -1, 1], 0], out: 1 },
      { args: [[3], 3], out: 1 },
    ],
  },
}
