import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 1. Two Sum

const A = [3, 8, 11, 2, 7, 15]
const T = 9

function bruteFig(): FigStep[] {
  const out: FigStep[] = [{ note: `找兩個位置加起來等於 ${T}。暴力法:每一對都試`, views: [arr(A, { label: 'nums' })] }]
  for (let i = 0; i < A.length; i++) {
    for (let j = i + 1; j < A.length; j++) {
      const hit = A[i] + A[j] === T
      out.push({
        note: `nums[${i}] + nums[${j}] = ${A[i]} + ${A[j]} = ${A[i] + A[j]}${hit ? ` = ${T} → 回傳 [${i}, ${j}]` : ''}`,
        views: [arr(A, { label: 'nums', compare: [i, j], highlight: hit ? [i, j] : [], pointers: [{ name: 'i', index: i }, { name: 'j', index: j, color: 'b' }] })],
      })
      if (hit) return out
    }
  }
  return out
}

function twoPtrFig(): FigStep[] {
  const pairs = A.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0])
  const vals = pairs.map((p) => p[0])
  const ids = pairs.map((p) => `#${p[1]}`)
  const views = (l: number, r: number, hl = false) => [
    arr(vals, { label: '排序後的值', compare: [l, r], highlight: hl ? [l, r] : [], dim: [...range(0, l - 1), ...range(r + 1, vals.length - 1)], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }] }),
    arr(ids, { label: '原本的索引(一起帶著走)', dim: [...range(0, l - 1), ...range(r + 1, vals.length - 1)] }),
  ]
  const out: FigStep[] = [
    { note: '把「值」和「原索引」綁在一起排序 —— 答案要回傳原本的位置,排序後索引會亂掉', views: [arr(A, { label: 'nums' })] },
  ]
  let l = 0
  let r = vals.length - 1
  while (l < r) {
    const sum = vals[l] + vals[r]
    if (sum === T) {
      out.push({ note: `${vals[l]} + ${vals[r]} = ${T},找到!回傳原索引 [${pairs[l][1]}, ${pairs[r][1]}]`, views: views(l, r, true) })
      break
    }
    out.push({
      note: sum < T ? `${vals[l]} + ${vals[r]} = ${sum} < ${T},太小 → 左邊換大一點的,L 往右` : `${vals[l]} + ${vals[r]} = ${sum} > ${T},太大 → 右邊換小一點的,R 往左`,
      views: views(l, r),
    })
    if (sum < T) l++
    else r--
  }
  return out
}

function hashFig(): FigStep[] {
  const seen = new Map<number, number>()
  const out: FigStep[] = [{ note: '準備一個 Hash Map:key 是看過的值,value 是它的索引', views: [arr(A, { label: 'nums' }), kv([], 'seen(值 → 索引)')] }]
  for (let i = 0; i < A.length; i++) {
    const need = T - A[i]
    if (seen.has(need)) {
      out.push({
        note: `nums[${i}] = ${A[i]},需要 ${T} − ${A[i]} = ${need}。${need} 在 seen 裡(索引 ${seen.get(need)})→ 回傳 [${seen.get(need)}, ${i}]`,
        views: [arr(A, { label: 'nums', highlight: [i, seen.get(need)!], dim: range(0, i - 1).filter((k) => k !== seen.get(need)) }), kv(seen, 'seen(值 → 索引)', [need])],
      })
      return out
    }
    seen.set(A[i], i)
    out.push({
      note: `nums[${i}] = ${A[i]},需要 ${need},seen 裡沒有 → 把 ${A[i]} 記下來(先查再存,才不會自己配自己)`,
      views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), kv(seen, 'seen(值 → 索引)', [A[i]])],
    })
  }
  return out
}

export const q0001: Solution = {
  id: 1,
  plain: '在一堆數字裡,找出**哪兩個加起來剛好是目標**,回傳它們的位置。就像拿著 100 元去買兩樣東西要剛好花完:看到一個 30 元的,就想「有沒有 70 元的?」',
  statement:
    '給一個整數陣列 `nums` 和目標值 `target`,找出**兩個不同位置**的數,讓它們加起來等於 `target`,回傳這兩個位置(順序不限)。題目保證剛好有一組答案,同一個位置不能用兩次。',
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', note: '2 + 7 = 9' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', note: '不能用 3 + 3(同一個位置用兩次)' },
    { input: 'nums = [3,3], target = 6', output: '[0,1]', note: '值一樣但位置不同,可以' },
  ],
  constraints: [
    '`2 ≤ nums.length ≤ 10⁴` → O(n²) 是 1 億次,勉強能過,但面試一定會追問 O(n) 解',
    '`-10⁹ ≤ nums[i], target ≤ 10⁹` → 有負數,兩數相加最多 2·10⁹,在 C / Java 的 int 邊緣;用 `target - x` 不會溢位',
    '**回傳的是索引不是值** → 如果排序,要記得帶著原索引',
  ],
  insight: [
    '暴力:每一對都試 → O(n²)',
    '換個問法:走到 `x` 時,我要找的是 `target − x`。問題變成「`target − x` **之前出現過嗎?在哪?**」—— 這正是 Hash Map 最擅長的(O(1) 查)',
    '如果陣列有序,還可以用左右夾擠:和太小就讓左邊變大、太大就讓右邊變小(這就是 167. Two Sum II)',
  ],
  approaches: [
    {
      name: '暴力:試每一對',
      idea: '兩層迴圈列出所有 `i < j`,和等於 `target` 就回傳。',
      steps: ['外層 `i` 從 0 開始', '內層 `j` 從 `i+1` 開始', '`nums[i] + nums[j] == target` → 回傳 `[i, j]`'],
      figure: { title: 'nums = [3,8,11,2,7,15], target = 9', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最多比 n(n−1)/2 對。' },
      verdict: '寫得出來、這題也能過(n ≤ 10⁴),但只是起點。',
      code: {
        python: `def twoSum(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
        c: `int *twoSum(int *nums, int numsSize, int target, int *returnSize) {
    for (int i = 0; i < numsSize; i++)
        for (int j = i + 1; j < numsSize; j++)
            if ((long long)nums[i] + nums[j] == target) {
                int *r = malloc(2 * sizeof(int));
                r[0] = i; r[1] = j;
                *returnSize = 2;
                return r;
            }
    *returnSize = 0;
    return NULL;
}`,
        cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    int n = nums.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if ((long long)nums[i] + nums[j] == target) return {i, j};
    return {};
}`,
        java: `int[] twoSum(int[] nums, int target) {
    int n = nums.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if ((long) nums[i] + nums[j] == target) return new int[]{i, j};
    return new int[0];
}`,
        javascript: `function twoSum(nums, target) {
  const n = nums.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (nums[i] + nums[j] === target) return [i, j];
  return [];
}`,
      },
    },
    {
      name: '排序 + 左右雙指針',
      idea: '把 (值, 原索引) 一起排序,再用兩個指針從兩端往中間夾:和太小 `L++`、太大 `R--`。',
      steps: ['建 `pairs = [(nums[i], i)]`,依值排序', '`L = 0`、`R = n−1`', '`sum < target` → `L++`;`sum > target` → `R--`', '相等 → 回傳兩個**原索引**'],
      figure: { title: 'nums = [3,8,11,2,7,15], target = 9', steps: twoPtrFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序 O(n log n),夾擠一次 O(n)。要存 (值, 索引) 配對,所以 O(n) 空間。' },
      verdict: '比 Hash Map 慢,但這個「夾擠」思路是 [[p:two-pointers]] 的核心,3Sum、4Sum 都靠它。如果題目給的已經是有序陣列(167),它就是 O(n)、O(1) 的最佳解。',
      code: {
        python: `def twoSum(nums, target):
    pairs = sorted((x, i) for i, x in enumerate(nums))
    l, r = 0, len(pairs) - 1
    while l < r:
        s = pairs[l][0] + pairs[r][0]
        if s == target:
            return [pairs[l][1], pairs[r][1]]
        if s < target:
            l += 1
        else:
            r -= 1
    return []`,
        c: `typedef struct { int val, idx; } Pair;

int cmpPair(const void *a, const void *b) {
    int x = ((const Pair *)a)->val, y = ((const Pair *)b)->val;
    return (x > y) - (x < y);
}

int *twoSum(int *nums, int numsSize, int target, int *returnSize) {
    Pair *p = malloc(numsSize * sizeof(Pair));
    for (int i = 0; i < numsSize; i++) { p[i].val = nums[i]; p[i].idx = i; }
    qsort(p, numsSize, sizeof(Pair), cmpPair);
    int l = 0, r = numsSize - 1;
    int *res = NULL;
    *returnSize = 0;
    while (l < r) {
        long long s = (long long)p[l].val + p[r].val;
        if (s == target) {
            res = malloc(2 * sizeof(int));
            res[0] = p[l].idx; res[1] = p[r].idx;
            *returnSize = 2;
            break;
        }
        if (s < target) l++; else r--;
    }
    free(p);
    return res;
}`,
        cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    vector<pair<int, int>> p;               // (值, 原索引)
    for (int i = 0; i < (int)nums.size(); i++) p.push_back({nums[i], i});
    sort(p.begin(), p.end());
    int l = 0, r = p.size() - 1;
    while (l < r) {
        long long s = (long long)p[l].first + p[r].first;
        if (s == target) return {p[l].second, p[r].second};
        if (s < target) l++; else r--;
    }
    return {};
}`,
        java: `int[] twoSum(int[] nums, int target) {
    int n = nums.length;
    Integer[] idx = new Integer[n];              // 排「索引」,比較時看值
    for (int i = 0; i < n; i++) idx[i] = i;
    Arrays.sort(idx, (a, b) -> Integer.compare(nums[a], nums[b]));
    int l = 0, r = n - 1;
    while (l < r) {
        long s = (long) nums[idx[l]] + nums[idx[r]];
        if (s == target) return new int[]{idx[l], idx[r]};
        if (s < target) l++; else r--;
    }
    return new int[0];
}`,
        javascript: `function twoSum(nums, target) {
  const idx = nums.map((_, i) => i).sort((a, b) => nums[a] - nums[b]);
  let l = 0, r = idx.length - 1;
  while (l < r) {
    const s = nums[idx[l]] + nums[idx[r]];
    if (s === target) return [idx[l], idx[r]];
    if (s < target) l++;
    else r--;
  }
  return [];
}`,
      },
    },
    {
      name: 'Hash Map 一次遍歷',
      idea: '走到 `x` 時查 `target − x` 有沒有出現過;沒有就把 `x → 索引` 記下來。**先查再存**,保證不會配到自己。',
      steps: ['`seen = {}`(值 → 索引)', '對每個 `i`:`need = target − nums[i]`', '`need` 在 `seen` → 回傳 `[seen[need], i]`', '否則 `seen[nums[i]] = i`'],
      figure: { title: 'nums = [3,8,11,2,7,15], target = 9', steps: hashFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數查一次、存一次,平均 O(1)。最壞情況答案在最後,map 存了 n−1 個數。' },
      verdict: '標準解。「邊走邊查 + 邊走邊記」是 [[p:hash-map]] 最常見的用法,560(和為 K 的子陣列)、523 都是同一招加上[[p:prefix-sum]]。',
      code: {
        python: `def twoSum(nums, target):
    seen = {}                      # 值 -> 索引
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []`,
        c: `// C 沒有內建 Hash Map,這裡用 uthash(LeetCode 環境內建)
typedef struct { int key, idx; UT_hash_handle hh; } Item;

int *twoSum(int *nums, int numsSize, int target, int *returnSize) {
    Item *seen = NULL, *it, *tmp;
    int *res = NULL;
    *returnSize = 0;
    for (int i = 0; i < numsSize && !res; i++) {
        int need = target - nums[i];
        HASH_FIND_INT(seen, &need, it);
        if (it) {
            res = malloc(2 * sizeof(int));
            res[0] = it->idx; res[1] = i;
            *returnSize = 2;
        } else {
            it = malloc(sizeof(Item));
            it->key = nums[i]; it->idx = i;
            HASH_ADD_INT(seen, key, it);
        }
    }
    HASH_ITER(hh, seen, it, tmp) { HASH_DEL(seen, it); free(it); }
    return res;
}`,
        cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;          // 值 -> 索引
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = seen.find(target - nums[i]);
        if (it != seen.end()) return {it->second, i};
        seen[nums[i]] = i;
    }
    return {};
}`,
        java: `int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();   // 值 -> 索引
    for (int i = 0; i < nums.length; i++) {
        Integer j = seen.get(target - nums[i]);
        if (j != null) return new int[]{j, i};
        seen.put(nums[i], i);
    }
    return new int[0];
}`,
        javascript: `function twoSum(nums, target) {
  const seen = new Map();                // 值 -> 索引
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
      },
    },
  ],
  pitfalls: [
    '**先存再查**會配到自己:`nums = [3,2,4], target = 6`,走到 3 時先存 3 再查 3 → 回傳 `[0, 0]`。一定要先查再存',
    '排序法忘了帶原索引,回傳的是排序後的位置',
    '先把整個陣列放進 map 再查(兩次遍歷)也行,但要額外判斷 `seen[need] != i`;一次遍歷天生沒有這個問題',
    'C / Java 的 `nums[i] + nums[j]` 在極端值可能溢位,比較時轉成 `long`;Hash 法用 `target − x` 不會溢位',
  ],
  followUp: [
    { q: '如果陣列已經排序?', a: '167. Two Sum II:直接左右雙指針,O(n) 時間、O(1) 空間,不需要 Hash Map。' },
    { q: '如果要找所有和為 0 的三元組?', a: '[15. 3Sum](#/q/15):排序後固定第一個數,剩下兩個用雙指針 —— 這就是為什麼方法二值得學。' },
  ],
  check: {
    kind: 'fn',
    fn: 'twoSum',
    compare: 'sorted',
    cases: [
      { args: [[2, 7, 11, 15], 9], out: [0, 1] },
      { args: [[3, 2, 4], 6], out: [1, 2] },
      { args: [[3, 3], 6], out: [0, 1] },
      { args: [[3, 8, 11, 2, 7, 15], 9], out: [3, 4] },
      { args: [[-3, 4, 3, 90], 0], out: [0, 2] },
    ],
  },
}
