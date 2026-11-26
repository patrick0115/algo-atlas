import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 1649. Create Sorted Array through Instructions

const INS = [1, 5, 6, 2]

function bitFig(): FigStep[] {
  const ins = INS
  const mx = Math.max(...ins)
  const cnt = new Array(mx + 1).fill(0) // 每個值目前出現幾次(直接用計數陣列示意)
  let cost = 0
  const out: FigStep[] = [
    { note: '用一個計數表記「每個值已經插入幾次」。插入 v 前,查比它小的總數與比它大的總數,取較小的當這次成本。', line: 7, views: [arr(cnt.map((_, v) => v), { label: '值域 0..6' }), kv([['成本 cost', 0]], '累計成本')] },
  ]
  for (let t = 0; t < ins.length; t++) {
    const v = ins[t]
    let less = 0
    let greater = 0
    for (let x = 1; x < v; x++) less += cnt[x]
    for (let x = v + 1; x <= mx; x++) greater += cnt[x]
    const add = Math.min(less, greater)
    cost += add
    out.push({
      note: `插入 ${v}:已插入的裡面,比它小的有 ${less} 個、比它大的有 ${greater} 個 → 成本 += min(${less}, ${greater}) = ${add},cost = ${cost}。`,
      line: 10,
      views: [arr(cnt.slice(), { label: '各值目前的出現次數(索引 = 值)', highlight: [v], compare: Array.from({ length: Math.max(0, v - 1) }, (_, i) => i + 1), done: Array.from({ length: mx - v }, (_, i) => v + 1 + i) }), kv([['比它小', less], ['比它大', greater], ['本次 +', add], ['cost', cost]], `插入 ${v}`)],
    })
    cnt[v]++
  }
  out.push({ note: `全部插完,總成本 = ${cost}。最後再取一次 mod 1e9+7。`, line: 14, views: [kv([['總成本', cost]], '答案')] })
  return out
}

function segFig(): FigStep[] {
  return [
    { note: '線段樹的葉子存「每個值出現幾次」,內部節點存區間總和。插入 v 前,查區間 [1, v−1] 與 [v+1, max] 的和。', line: 15, views: [arr([0, 0, 0, 0, 0, 0], { label: '值 1..6 的出現次數(葉子)' })] },
    { note: '插入 1、5、6 後(都沒有更小/更大的夾擊,成本 0)。插入 2 時:查 [1,1] = 1 個比它小,查 [3,6] = 2 個比它大 → 成本 += min(1, 2) = 1。', line: 17, views: [arr([1, 0, 0, 0, 1, 1], { label: '插入 1,5,6 後', highlight: [1], compare: [0], done: [2, 3, 4, 5] }), kv([['[1,1] 比它小', 1], ['[3,6] 比它大', 2], ['本次 +', 1]], '插入 2')] },
    { note: '把 2 的次數 +1,更新沿路節點。總成本 = 1。', line: 18, views: [arr([1, 1, 0, 0, 1, 1], { label: '最終出現次數', done: [0, 1, 4, 5] })] },
  ]
}

export const q1649: Solution = {
  id: 1649,
  plain: '依序把數字一個一個插入一個「保持排序」的陣列。每插一個,成本是「它左邊比它小的個數」和「右邊比它大的個數」裡較小的那個。把所有成本加起來(最後取餘數)。就像把書一本一本插進按編號排好的書架,每次挑左右兩邊比較近的那側數要跨過幾本。',
  statement: '依序插入 `instructions` 的每個數,維持陣列由小到大。每次插入的成本 = min(已插入中比它小的個數, 已插入中比它大的個數)。回傳總成本對 `1e9+7` 取餘數。',
  examples: [
    { input: 'instructions = [1,5,6,2]', output: '1', note: '插 1,5,6 成本都 0;插 2 時左邊 1 個({1})、右邊 2 個({5,6})→ min = 1' },
    { input: 'instructions = [1,2,3,6,5,4]', output: '3' },
    { input: 'instructions = [1,3,3,3,2,4,2,1,2]', output: '4' },
  ],
  constraints: ['`1 ≤ instructions.length ≤ 1e5`', '`1 ≤ instructions[i] ≤ 1e5`', '值域不大 → 可以開一個長度 = 最大值的計數結構', '只在最後取一次餘數,過程不取(取了會讓 min 比較失真)'],
  insight: [
    '每次要問的是「已經插入的數裡,有幾個比 v 小、幾個比 v 大」——這是一個會動態變化的「值域計數」問題',
    '把值當索引,用[[p:segment-tree]](樹狀陣列 BIT)記每個值出現幾次:查「< v 的個數」就是前綴和[[p:prefix-sum]] `query(v−1)`',
    '「> v 的個數」= 目前已插入總數 − `query(v)`',
    '取 min 累加,再把 v 的次數 +1。全部做完才對答案取餘數',
  ],
  approaches: [
    {
      name: '樹狀陣列計數值域',
      idea: '[[p:segment-tree]](BIT)記每個值出現幾次。插入 v 前用前綴和[[p:prefix-sum]]查「< v 的個數」和「> v 的個數」,取 min 累加,再把 v 加進 BIT。',
      steps: ['`bit` 長度 = 最大值;`cost = 0`、`inserted = 0`', '對每個 `v`:`less = query(v−1)`、`greater = inserted − query(v)`', '`cost += min(less, greater)`', '`add(v)`、`inserted++`', '回傳 `cost % (1e9+7)`'],
      figure: { title: 'instructions = [1,5,6,2]', steps: bitFig() },
      complexity: { time: 'O(n log m)', space: 'O(m)', why: 'n 個數,每個查、改 BIT 各 O(log m),m 是最大值。' },
      verdict: '最推薦。BIT 程式短、常數小,處理「動態前綴計數」正是它的拿手好戲。',
      code: {
        javascript: `function createSortedArray(instructions) {
  const MOD = 1000000007n;
  const mx = Math.max(...instructions);
  const bit = new Array(mx + 1).fill(0);
  const add = (i) => { for (; i <= mx; i += i & -i) bit[i]++; };
  const query = (i) => { let s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }; // ≤ i 的個數
  let cost = 0n, inserted = 0;
  for (const v of instructions) {
    const less = query(v - 1);            // < v 的個數
    const greater = inserted - query(v);  // > v 的個數
    cost += BigInt(Math.min(less, greater));
    add(v); inserted++;
  }
  return Number(cost % MOD);              // 最後才取餘數
}`,
        python: `def createSortedArray(instructions):
    MOD = 1_000_000_007
    mx = max(instructions)
    bit = [0] * (mx + 1)
    def add(i):
        while i <= mx:
            bit[i] += 1
            i += i & -i
    def query(i):                           # ≤ i 的個數
        s = 0
        while i > 0:
            s += bit[i]
            i -= i & -i
        return s
    cost, inserted = 0, 0
    for v in instructions:
        less = query(v - 1)                 # < v 的個數
        greater = inserted - query(v)       # > v 的個數
        cost += min(less, greater)
        add(v); inserted += 1
    return cost % MOD                       # 最後才取餘數`,
        c: `int createSortedArray(int *instructions, int n) {
    const long long MOD = 1000000007LL;
    int mx = 0;
    for (int i = 0; i < n; i++) if (instructions[i] > mx) mx = instructions[i];
    long long *bit = calloc(mx + 1, sizeof(long long));
    long long cost = 0;
    int inserted = 0;
    for (int t = 0; t < n; t++) {
        int v = instructions[t];
        long long less = 0, all = 0;
        for (int i = v - 1; i > 0; i -= i & -i) less += bit[i];  // < v 的個數
        for (int i = v; i > 0; i -= i & -i) all += bit[i];       // ≤ v 的個數
        long long greater = inserted - all;                      // > v 的個數
        cost += less < greater ? less : greater;
        for (int i = v; i <= mx; i += i & -i) bit[i]++;
        inserted++;
    }
    free(bit);
    return (int)(cost % MOD);
}`,
        cpp: `int createSortedArray(vector<int>& instructions) {
    const long long MOD = 1000000007LL;
    int mx = *max_element(instructions.begin(), instructions.end());
    vector<long long> bit(mx + 1, 0);
    auto add = [&](int i) { for (; i <= mx; i += i & -i) bit[i]++; };
    auto query = [&](int i) { long long s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; };
    long long cost = 0;
    int inserted = 0;
    for (int v : instructions) {
        long long less = query(v - 1);
        long long greater = inserted - query(v);
        cost += min(less, greater);
        add(v); inserted++;
    }
    return (int)(cost % MOD);
}`,
        java: `int createSortedArray(int[] instructions) {
    final long MOD = 1000000007L;
    int mx = 0;
    for (int v : instructions) mx = Math.max(mx, v);
    long[] bit = new long[mx + 1];
    long cost = 0;
    int inserted = 0;
    for (int v : instructions) {
        long less = 0, all = 0;
        for (int i = v - 1; i > 0; i -= i & -i) less += bit[i];
        for (int i = v; i > 0; i -= i & -i) all += bit[i];
        long greater = inserted - all;
        cost += Math.min(less, greater);
        for (int i = v; i <= mx; i += i & -i) bit[i]++;
        inserted++;
    }
    return (int)(cost % MOD);
}`,
      },
    },
    {
      name: '線段樹計數',
      idea: '[[p:segment-tree]]存值域每個值的出現次數,內部節點存區間和。插入 v 前,查區間 `[1, v−1]`(比它小)與 `[v+1, max]`(比它大),取 min 累加。',
      steps: ['建一棵覆蓋值域 `[1, max]` 的線段樹,初始全 0', '對每個 `v`:`less = 區間和[1, v−1]`、`greater = 區間和[v+1, max]`', '`cost += min(less, greater)`', '在葉子 `v` 做 +1 並往上更新', '回傳 `cost % (1e9+7)`'],
      figure: { title: 'instructions = [1,5,6,2]', steps: segFig() },
      complexity: { time: 'O(n log m)', space: 'O(m)', why: '每次兩段區間查詢加一次單點更新,都是 O(log m)。' },
      verdict: '和 BIT 等價,但區間查詢寫起來更直觀。值域更複雜(例如要查任意區間、要離散化)時,線段樹擴充性更好。',
      code: {
        javascript: `function createSortedArray(instructions) {
  const MOD = 1000000007n;
  const mx = Math.max(...instructions);
  const seg = new Array(4 * (mx + 1)).fill(0);
  function update(node, lo, hi, idx) {        // 葉子 idx 次數 +1
    seg[node]++;
    if (lo === hi) return;
    const mid = (lo + hi) >> 1;
    if (idx <= mid) update(2 * node, lo, mid, idx);
    else update(2 * node + 1, mid + 1, hi, idx);
  }
  function query(node, lo, hi, l, r) {        // 區間 [l, r] 的出現總數
    if (r < l || r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return seg[node];
    const mid = (lo + hi) >> 1;
    return query(2 * node, lo, mid, l, r) + query(2 * node + 1, mid + 1, hi, l, r);
  }
  let cost = 0n;
  for (const v of instructions) {
    const less = query(1, 1, mx, 1, v - 1);
    const greater = query(1, 1, mx, v + 1, mx);
    cost += BigInt(Math.min(less, greater));
    update(1, 1, mx, v);
  }
  return Number(cost % MOD);
}`,
        python: `def createSortedArray(instructions):
    MOD = 1_000_000_007
    mx = max(instructions)
    seg = [0] * (4 * (mx + 1))
    def update(node, lo, hi, idx):
        seg[node] += 1
        if lo == hi:
            return
        mid = (lo + hi) // 2
        if idx <= mid:
            update(2 * node, lo, mid, idx)
        else:
            update(2 * node + 1, mid + 1, hi, idx)
    def query(node, lo, hi, l, r):
        if r < l or r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return seg[node]
        mid = (lo + hi) // 2
        return query(2 * node, lo, mid, l, r) + query(2 * node + 1, mid + 1, hi, l, r)
    cost = 0
    for v in instructions:
        less = query(1, 1, mx, 1, v - 1)
        greater = query(1, 1, mx, v + 1, mx)
        cost += min(less, greater)
        update(1, 1, mx, v)
    return cost % MOD`,
        c: `static long long *seg;
static int MX;
static void update(int node, int lo, int hi, int idx) {
    seg[node]++;
    if (lo == hi) return;
    int mid = (lo + hi) / 2;
    if (idx <= mid) update(2 * node, lo, mid, idx);
    else update(2 * node + 1, mid + 1, hi, idx);
}
static long long query(int node, int lo, int hi, int l, int r) {
    if (r < l || r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return seg[node];
    int mid = (lo + hi) / 2;
    return query(2 * node, lo, mid, l, r) + query(2 * node + 1, mid + 1, hi, l, r);
}
int createSortedArray(int *instructions, int n) {
    const long long MOD = 1000000007LL;
    MX = 0;
    for (int i = 0; i < n; i++) if (instructions[i] > MX) MX = instructions[i];
    seg = calloc(4 * (MX + 1), sizeof(long long));
    long long cost = 0;
    for (int t = 0; t < n; t++) {
        int v = instructions[t];
        long long less = query(1, 1, MX, 1, v - 1);
        long long greater = query(1, 1, MX, v + 1, MX);
        cost += less < greater ? less : greater;
        update(1, 1, MX, v);
    }
    free(seg);
    return (int)(cost % MOD);
}`,
        cpp: `class Seg {
public:
    vector<long long> seg;
    int mx;
    Seg(int m) : seg(4 * (m + 1), 0), mx(m) {}
    void update(int node, int lo, int hi, int idx) {
        seg[node]++;
        if (lo == hi) return;
        int mid = (lo + hi) / 2;
        if (idx <= mid) update(2 * node, lo, mid, idx);
        else update(2 * node + 1, mid + 1, hi, idx);
    }
    long long query(int node, int lo, int hi, int l, int r) {
        if (r < l || r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return seg[node];
        int mid = (lo + hi) / 2;
        return query(2 * node, lo, mid, l, r) + query(2 * node + 1, mid + 1, hi, l, r);
    }
};
int createSortedArray(vector<int>& instructions) {
    const long long MOD = 1000000007LL;
    int mx = *max_element(instructions.begin(), instructions.end());
    Seg t(mx);
    long long cost = 0;
    for (int v : instructions) {
        long long less = t.query(1, 1, mx, 1, v - 1);
        long long greater = t.query(1, 1, mx, v + 1, mx);
        cost += min(less, greater);
        t.update(1, 1, mx, v);
    }
    return (int)(cost % MOD);
}`,
        java: `class Solution {
    long[] seg;
    int mx;
    void update(int node, int lo, int hi, int idx) {
        seg[node]++;
        if (lo == hi) return;
        int mid = (lo + hi) / 2;
        if (idx <= mid) update(2 * node, lo, mid, idx);
        else update(2 * node + 1, mid + 1, hi, idx);
    }
    long query(int node, int lo, int hi, int l, int r) {
        if (r < l || r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return seg[node];
        int mid = (lo + hi) / 2;
        return query(2 * node, lo, mid, l, r) + query(2 * node + 1, mid + 1, hi, l, r);
    }
    int createSortedArray(int[] instructions) {
        final long MOD = 1000000007L;
        mx = 0;
        for (int v : instructions) mx = Math.max(mx, v);
        seg = new long[4 * (mx + 1)];
        long cost = 0;
        for (int v : instructions) {
            long less = query(1, 1, mx, 1, v - 1);
            long greater = query(1, 1, mx, v + 1, mx);
            cost += Math.min(less, greater);
            update(1, 1, mx, v);
        }
        return (int)(cost % MOD);
    }
}`,
      },
    },
  ],
  pitfalls: [
    '過程中就取餘數會讓 `min(less, greater)` 比較的是取餘後的值 → 錯。只在最後取一次',
    '`greater = inserted − query(v)` 要用「已插入總數」,不是用「≤ v 的個數」直接相減別的量',
    '重複值要算在「相等」裡,既不算小也不算大,所以用 `query(v−1)` 和 `inserted − query(v)` 剛好把等於 v 的排除',
  ],
  check: {
    kind: 'fn',
    fn: 'createSortedArray',
    cases: [
      { args: [[1, 5, 6, 2]], out: 1 },
      { args: [[1, 2, 3, 6, 5, 4]], out: 3 },
      { args: [[1, 3, 3, 3, 2, 4, 2, 1, 2]], out: 4 },
      { args: [[5, 4, 3, 2, 1]], out: 0 },
    ],
  },
}
