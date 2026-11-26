import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 220. Contains Duplicate III

type KV = { kind: 'kv'; label?: string; entries: [number, number][]; highlight?: number[] }
const kv = (label: string, entries: [number, number][], highlight: number[] = []): KV => ({ kind: 'kv', label, entries, highlight })

// 桶:example nums = [1,2,3,1], indexDiff = 3, valueDiff = 0 → w = 1,每個數自己一桶
function bucketFig(): FigStep[] {
  return [
    { note: 'i = 0,x = 1。桶寬 `w = valueDiff + 1 = 1`,落在桶 `floor(1/1) = 1`。桶是空的 → 放進去', line: 11, views: [kv('桶 → 值', [[1, 1]], [1])] },
    { note: 'i = 1,x = 2,落在桶 2。看左右鄰桶:桶 1 有 1,`|2 − 1| = 1 > 0`,不算。桶 2 空 → 放進去', line: 7, views: [kv('桶 → 值', [[1, 1], [2, 2]], [2])] },
    { note: 'i = 2,x = 3,落在桶 3,鄰桶都差太多 → 放進去', line: 11, views: [kv('桶 → 值', [[1, 1], [2, 2], [3, 3]], [3])] },
    { note: 'i = 3,x = 1,落在桶 1 —— 桶 1 已經有 1 了!同桶一定成立,`|0 − 3| = 3 ≤ indexDiff`,回傳 true', line: 8, views: [kv('桶 → 值', [[1, 1], [2, 2], [3, 3]], [1])] },
  ]
}

// 有序視窗:example nums = [1,2,3,1], indexDiff = 3, valueDiff = 0
function windowFig(): FigStep[] {
  return [
    { note: 'i = 0,x = 1,視窗空 → 放入。視窗永遠保持排序', line: 16, views: [arr([1], { label: '有序視窗', highlight: [0] })] },
    { note: 'i = 1,x = 2。二分找「≥ x − valueDiff = 2」的最小值 → 沒有 ≤ 2 + 0 的 → 放入', line: 15, views: [arr([1, 2], { label: '有序視窗', highlight: [1] })] },
    { note: 'i = 2,x = 3 → 放入', line: 16, views: [arr([1, 2, 3], { label: '有序視窗', highlight: [2] })] },
    { note: 'i = 3,x = 1。找「≥ 1」的最小值 = 1,而 `1 ≤ x + valueDiff = 1` → 命中,回傳 true', line: 15, views: [arr([1, 2, 3], { label: '有序視窗', compare: [0] })] },
  ]
}

export const q0220: Solution = {
  id: 220,
  plain: '陣列裡找兩個「位置離得近、數值也離得近」的數。像在一條時間軸上滑一個視窗,看視窗內有沒有兩個數字幾乎一樣大。',
  statement: '給整數陣列 `nums` 與 `indexDiff`、`valueDiff`。問是否存在 `i ≠ j`,使 `|i − j| ≤ indexDiff` 且 `|nums[i] − nums[j]| ≤ valueDiff`。',
  examples: [
    { input: 'nums = [1,2,3,1], indexDiff = 3, valueDiff = 0', output: 'true', note: '索引 0 和 3 都是 1:距離 3 ≤ 3,值差 0 ≤ 0' },
    { input: 'nums = [1,5,9,1,5,9], indexDiff = 2, valueDiff = 3', output: 'false' },
  ],
  constraints: [
    '`2 ≤ nums.length`',
    '`−2³¹ ≤ nums[i] ≤ 2³¹ − 1` → 數值可能為負,分桶的除法要用「向下取整」(`Math.floor`),不能用會往 0 截斷的整數除法',
    '`1 ≤ indexDiff`、`0 ≤ valueDiff` → valueDiff 可能是 0,桶寬 `w = valueDiff + 1` 永遠 ≥ 1',
  ],
  insight: [
    '「位置離得近」= 只看最近 indexDiff 個數 → 一個大小 indexDiff 的滑動視窗,用 [[p:sliding-window]]',
    '「數值離得近」= 視窗內要快速找「跟 x 差 ≤ valueDiff 的數」。兩條路:分桶把差距變成「同桶或鄰桶」,或維護一個有序結構用二分找',
    '桶寬取 `valueDiff + 1`:同一桶裡任兩數差一定 `≤ valueDiff`,所以同桶直接成立',
  ],
  approaches: [
    {
      name: '分桶',
      idea: '桶寬 `w = valueDiff + 1`,x 落在桶 `floor(x / w)`。同桶必成立,否則只需看左右相鄰兩桶;視窗超過 indexDiff 就刪掉最舊的桶。',
      steps: [
        '`w = valueDiff + 1`,`bucket = {}`',
        '對每個 i:算 `b = floor(nums[i] / w)`',
        '`b` 已有值 → 同桶,回傳 true',
        '`b − 1`、`b + 1` 有值且與 nums[i] 差 `≤ valueDiff` → 回傳 true',
        '把 nums[i] 放進桶 b;若 `i ≥ indexDiff`,刪掉 `nums[i − indexDiff]` 所在的桶',
      ],
      figure: { title: 'nums = [1,2,3,1], indexDiff = 3, valueDiff = 0', steps: bucketFig() },
      complexity: { time: 'O(n)', space: 'O(min(n, indexDiff))', why: '每個數進出桶各一次;視窗裡最多 indexDiff + 1 個桶。' },
      verdict: '最快,線性時間。重點是用 [[p:counting-sort]] 的「分桶」把「找相近值」變成「查固定幾個桶」。負數的 `floor` 要小心。',
      code: {
        python: `def containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff):
    if valueDiff < 0:
        return False
    w = valueDiff + 1
    bucket = {}
    for i, x in enumerate(nums):
        b = x // w                       # Python 的 // 對負數就是向下取整
        if b in bucket:
            return True
        if b - 1 in bucket and abs(x - bucket[b - 1]) <= valueDiff:
            return True
        if b + 1 in bucket and abs(x - bucket[b + 1]) <= valueDiff:
            return True
        bucket[b] = x
        if i >= indexDiff:
            del bucket[nums[i - indexDiff] // w]
    return False`,
        c: `#include <stdlib.h>
#include <stdbool.h>

typedef struct Node { long long key, val; struct Node *next; } Node;

static int hpos(long long k, int cap) {
    long long h = k % cap;
    if (h < 0) h += cap;
    return (int)h;
}

bool containsNearbyAlmostDuplicate(int* nums, int numsSize, int indexDiff, int valueDiff) {
    if (valueDiff < 0) return false;
    long long w = (long long)valueDiff + 1;
    int cap = numsSize > 0 ? numsSize : 1;
    Node **tab = calloc(cap, sizeof(Node *));
    bool ans = false;
    for (int i = 0; i < numsSize && !ans; i++) {
        long long x = nums[i];
        long long b = x >= 0 ? x / w : (x - w + 1) / w;   /* 向下取整 */
        for (long long nb = b - 1; nb <= b + 1 && !ans; nb++)
            for (Node *p = tab[hpos(nb, cap)]; p; p = p->next)
                if (p->key == nb) {
                    if (nb == b || llabs(x - p->val) <= valueDiff) ans = true;
                    break;
                }
        if (ans) break;
        int hb = hpos(b, cap);
        Node *n = malloc(sizeof(Node));
        n->key = b; n->val = x; n->next = tab[hb]; tab[hb] = n;
        if (i >= indexDiff) {
            long long ox = nums[i - indexDiff];
            long long ob = ox >= 0 ? ox / w : (ox - w + 1) / w;
            Node **pp = &tab[hpos(ob, cap)];
            while (*pp) {
                if ((*pp)->key == ob) { Node *d = *pp; *pp = d->next; free(d); break; }
                pp = &(*pp)->next;
            }
        }
    }
    return ans;
}`,
        cpp: `bool containsNearbyAlmostDuplicate(vector<int>& nums, int indexDiff, int valueDiff) {
    if (valueDiff < 0) return false;
    long long w = (long long)valueDiff + 1;
    unordered_map<long long, long long> bucket;
    auto idx = [&](long long x) { return x >= 0 ? x / w : (x - w + 1) / w; };
    for (int i = 0; i < (int)nums.size(); i++) {
        long long x = nums[i], b = idx(x);
        if (bucket.count(b)) return true;
        if (bucket.count(b - 1) && llabs(x - bucket[b - 1]) <= valueDiff) return true;
        if (bucket.count(b + 1) && llabs(x - bucket[b + 1]) <= valueDiff) return true;
        bucket[b] = x;
        if (i >= indexDiff) bucket.erase(idx(nums[i - indexDiff]));
    }
    return false;
}`,
        java: `public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
    if (valueDiff < 0) return false;
    long w = (long) valueDiff + 1;
    Map<Long, Long> bucket = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        long x = nums[i], b = Math.floorDiv(x, w);
        if (bucket.containsKey(b)) return true;
        if (bucket.containsKey(b - 1) && Math.abs(x - bucket.get(b - 1)) <= valueDiff) return true;
        if (bucket.containsKey(b + 1) && Math.abs(x - bucket.get(b + 1)) <= valueDiff) return true;
        bucket.put(b, x);
        if (i >= indexDiff) bucket.remove(Math.floorDiv((long) nums[i - indexDiff], w));
    }
    return false;
}`,
        javascript: `function containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff) {
  if (valueDiff < 0) return false;
  const w = valueDiff + 1;
  const bucket = new Map();
  const idx = (x) => Math.floor(x / w);
  for (let i = 0; i < nums.length; i++) {
    const b = idx(nums[i]);
    if (bucket.has(b)) return true;
    if (bucket.has(b - 1) && Math.abs(nums[i] - bucket.get(b - 1)) <= valueDiff) return true;
    if (bucket.has(b + 1) && Math.abs(nums[i] - bucket.get(b + 1)) <= valueDiff) return true;
    bucket.set(b, nums[i]);
    if (i >= indexDiff) bucket.delete(idx(nums[i - indexDiff]));
  }
  return false;
}`,
      },
    },
    {
      name: '有序視窗 + 二分',
      idea: '維護一個大小 ≤ indexDiff 的「保持排序」視窗。對新的 x,二分找「≥ x − valueDiff」的最小值,看它是否 `≤ x + valueDiff`。',
      steps: [
        '視窗用一個排序好的陣列(或平衡樹 / 有序集合)',
        '對每個 i:二分找第一個 `≥ nums[i] − valueDiff` 的值',
        '找到且該值 `≤ nums[i] + valueDiff` → 回傳 true',
        '把 nums[i] 插進視窗(保持排序)',
        '若 `i ≥ indexDiff`,把 `nums[i − indexDiff]` 從視窗移除',
      ],
      figure: { title: 'nums = [1,2,3,1], indexDiff = 3, valueDiff = 0', steps: windowFig() },
      complexity: { time: 'O(n log k)', space: 'O(k)', why: 'k = indexDiff;每次二分與插入都是 O(log k)(用陣列插入搬移是 O(k),用平衡樹是 O(log k))。' },
      verdict: '觀念最直覺,用 [[p:binary-search]] 在 [[p:sliding-window]] 裡找最接近的值。C++ 用 `set`、Java 用 `TreeSet` 可做到真正的 O(n log k)。',
      code: {
        python: `from bisect import bisect_left, insort

def containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff):
    win = []
    for i, x in enumerate(nums):
        pos = bisect_left(win, x - valueDiff)
        if pos < len(win) and win[pos] <= x + valueDiff:
            return True
        insort(win, x)
        if i >= indexDiff:
            win.pop(bisect_left(win, nums[i - indexDiff]))
    return False`,
        c: `#include <stdlib.h>
#include <stdbool.h>

static int lb(long long *w, int len, long long x) {
    int lo = 0, hi = len;
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (w[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

bool containsNearbyAlmostDuplicate(int* nums, int numsSize, int indexDiff, int valueDiff) {
    long long *win = malloc((numsSize + 1) * sizeof(long long));
    int len = 0;
    bool ans = false;
    for (int i = 0; i < numsSize && !ans; i++) {
        long long x = nums[i];
        int pos = lb(win, len, x - valueDiff);
        if (pos < len && win[pos] <= x + valueDiff) { ans = true; break; }
        int ins = lb(win, len, x);
        for (int t = len; t > ins; t--) win[t] = win[t - 1];
        win[ins] = x; len++;
        if (i >= indexDiff) {
            int r = lb(win, len, nums[i - indexDiff]);
            for (int t = r; t < len - 1; t++) win[t] = win[t + 1];
            len--;
        }
    }
    free(win);
    return ans;
}`,
        cpp: `bool containsNearbyAlmostDuplicate(vector<int>& nums, int indexDiff, int valueDiff) {
    set<long long> win;
    for (int i = 0; i < (int)nums.size(); i++) {
        long long x = nums[i];
        auto it = win.lower_bound(x - (long long)valueDiff);
        if (it != win.end() && *it <= x + (long long)valueDiff) return true;
        win.insert(x);
        if (i >= indexDiff) win.erase((long long)nums[i - indexDiff]);
    }
    return false;
}`,
        java: `public boolean containsNearbyAlmostDuplicate(int[] nums, int indexDiff, int valueDiff) {
    TreeSet<Long> win = new TreeSet<>();
    for (int i = 0; i < nums.length; i++) {
        long x = nums[i];
        Long c = win.ceiling(x - (long) valueDiff);
        if (c != null && c <= x + (long) valueDiff) return true;
        win.add(x);
        if (i >= indexDiff) win.remove((long) nums[i - indexDiff]);
    }
    return false;
}`,
        javascript: `function containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff) {
  if (valueDiff < 0) return false;
  const win = [];
  const lb = (x) => {
    let lo = 0, hi = win.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (win[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  for (let i = 0; i < nums.length; i++) {
    const pos = lb(nums[i] - valueDiff);
    if (pos < win.length && win[pos] <= nums[i] + valueDiff) return true;
    win.splice(lb(nums[i]), 0, nums[i]);
    if (i >= indexDiff) win.splice(lb(nums[i - indexDiff]), 1);
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    '負數分桶:`-1 / 3` 在多數語言會往 0 截斷成 0,導致 -1 和 1 落同桶。要用向下取整(`Math.floor`、Python `//`、Java `Math.floorDiv`)',
    '桶寬要用 `valueDiff + 1`,不是 valueDiff;否則 valueDiff = 0 時桶寬 0,除法爆掉',
    '刪舊桶的時機:`i ≥ indexDiff` 時刪 `nums[i − indexDiff]`,讓視窗大小剛好不超過 indexDiff',
    '所有算術用 64 位元(`long long` / `long`),nums[i] 可到 2³¹,相減可能溢位',
  ],
  check: {
    kind: 'fn',
    fn: 'containsNearbyAlmostDuplicate',
    cases: [
      { args: [[1, 2, 3, 1], 3, 0], out: true },
      { args: [[1, 5, 9, 1, 5, 9], 2, 3], out: false },
      { args: [[1, 2, 3, 1], 2, 2], out: true },
      { args: [[-1, -1], 1, 0], out: true },
      { args: [[-3, 3], 2, 4], out: false },
    ],
  },
}
