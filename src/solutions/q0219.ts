import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

// 219. Contains Duplicate II

const A = [1, 2, 3, 1, 2, 3]
const K = 2

function lastFig(): FigStep[] {
  const last = new Map<number, number>()
  const out: FigStep[] = [{ note: `要找「一樣的兩個數,位置差 ≤ ${K}」。用 Hash 表記每個值**最後一次**出現的位置:新的位置和它比,距離最近`, views: [arr(A, { label: 'nums' }), kv([], '值 → 最後出現的位置')] }]
  A.forEach((x, i) => {
    const p = last.get(x)
    const note = p === undefined ? `${x} 第一次出現,記下位置 ${i}` : `${x} 上次在 ${p},距離 ${i - p} ${i - p <= K ? `≤ ${K} → true` : `> ${K},更新成 ${i}`}`
    last.set(x, i)
    out.push({ note, views: [arr(A, { label: 'nums', highlight: [i], compare: p === undefined ? [] : [p] }), kv([...last.entries()], '值 → 最後出現的位置', [x])] })
  })
  out.push({ note: `每一對相同的數距離都是 3 > ${K} → false`, views: [arr(A, { label: 'nums' })] })
  return out
}

function winFig(): FigStep[] {
  return [
    { note: `另一種:維護一個「最近 ${K} 個數」的集合(滑動視窗)。新的數 x 進來前,先看集合裡有沒有 x`, views: [arr(A, { label: 'nums', range: [1, 2], highlight: [3] }), arr([2, 3], { label: `視窗(最多 ${K} 個)` })] },
    { note: `1 不在 {2, 3} 裡 → 加進去,同時把最左邊的 2 移出(保持最多 ${K} 個)。集合大小固定是 k,空間 O(k)`, views: [arr(A, { label: 'nums', range: [2, 3] }), arr([3, 1], { label: '視窗' })] },
  ]
}

export const q0219: Solution = {
  id: 219,
  plain: '一排數字裡,有沒有兩個「一樣的數」,而且它們的位置距離不超過 k?',
  statement: '給整數陣列 `nums` 和整數 `k`,若存在兩個不同的索引 i、j 使 `nums[i] == nums[j]` 且 `|i − j| ≤ k`,回傳 true。',
  examples: [
    { input: 'nums = [1,2,3,1], k = 3', output: 'true' },
    { input: 'nums = [1,0,1,1], k = 1', output: 'true' },
    { input: 'nums = [1,2,3,1,2,3], k = 2', output: 'false' },
  ],
  constraints: ['n ≤ 10⁵', 'k ≤ 10⁵'],
  insight: ['[217. Contains Duplicate](#/q/217) 加上「距離 ≤ k」的限制', '對每個 x,只需要和**最近一次**出現的位置比', '或者:維護最近 k 個數的集合,新的數在集合裡就成立'],
  approaches: [
    {
      name: 'Hash 表記最後位置',
      idea: '`last[x]` = x 最後出現的索引;`i − last[x] ≤ k` 就 true,否則更新。',
      steps: ['`last = {}`', '`for i, x`:`x in last and i − last[x] <= k` → true', '`last[x] = i`', '回傳 false'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: lastFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '表裡最多 n 個不同的值。' },
      verdict: '最推薦,[[p:hash-map]]一次掃描。',
      code: {
        python: `def containsNearbyDuplicate(nums, k):
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i                           # 只要記最近的一次
    return False`,
        c: `typedef struct { int key, idx; UT_hash_handle hh; } Entry;

bool containsNearbyDuplicate(int *nums, int numsSize, int k) {
    Entry *tab = NULL, *e, *t;
    bool ans = false;
    for (int i = 0; i < numsSize && !ans; i++) {
        HASH_FIND_INT(tab, &nums[i], e);
        if (e) {
            if (i - e->idx <= k) ans = true;
            e->idx = i;
        } else {
            e = malloc(sizeof(Entry)); e->key = nums[i]; e->idx = i;
            HASH_ADD_INT(tab, key, e);
        }
    }
    HASH_ITER(hh, tab, e, t) { HASH_DEL(tab, e); free(e); }
    return ans;
}`,
        cpp: `bool containsNearbyDuplicate(vector<int>& nums, int k) {
    unordered_map<int, int> last;
    for (int i = 0; i < (int)nums.size(); i++) {
        auto it = last.find(nums[i]);
        if (it != last.end() && i - it->second <= k) return true;
        last[nums[i]] = i;
    }
    return false;
}`,
        java: `boolean containsNearbyDuplicate(int[] nums, int k) {
    Map<Integer, Integer> last = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        Integer p = last.put(nums[i], i);     // put 會回傳舊值
        if (p != null && i - p <= k) return true;
    }
    return false;
}`,
        javascript: `function containsNearbyDuplicate(nums, k) {
  const last = new Map();
  for (let i = 0; i < nums.length; i++) {
    if (last.has(nums[i]) && i - last.get(nums[i]) <= k) return true;
    last.set(nums[i], i);
  }
  return false;
}`,
      },
    },
    {
      name: '大小 k 的滑動視窗集合',
      idea: '集合只放最近 k 個數;x 已在集合 → true;否則加入,集合超過 k 個就移掉最舊的。',
      steps: ['`win = set()`', '`for i, x`:`x in win` → true', '`win.add(x)`;`len(win) > k` → `win.remove(nums[i − k])`', '回傳 false'],
      figure: { title: `nums = [${A}],k = ${K}`, steps: winFig() },
      complexity: { time: 'O(n)', space: 'O(min(n, k))', why: '集合最多 k 個元素。' },
      verdict: '[[p:sliding-window]]寫法,空間只跟 k 有關。',
      code: {
        python: `def containsNearbyDuplicate(nums, k):
    win = set()
    for i, x in enumerate(nums):
        if x in win:
            return True
        win.add(x)
        if len(win) > k:
            win.remove(nums[i - k])           # 超出距離 k 的移出視窗
    return False`,
        c: `typedef struct { int key; UT_hash_handle hh; } Entry;

bool containsNearbyDuplicate(int *nums, int numsSize, int k) {
    Entry *win = NULL, *e, *t;
    bool ans = false;
    for (int i = 0; i < numsSize; i++) {
        HASH_FIND_INT(win, &nums[i], e);
        if (e) { ans = true; break; }
        e = malloc(sizeof(Entry)); e->key = nums[i];
        HASH_ADD_INT(win, key, e);
        if (i >= k) {                          // 移出 nums[i - k]
            HASH_FIND_INT(win, &nums[i - k], e);
            HASH_DEL(win, e); free(e);
        }
    }
    HASH_ITER(hh, win, e, t) { HASH_DEL(win, e); free(e); }
    return ans;
}`,
        cpp: `bool containsNearbyDuplicate(vector<int>& nums, int k) {
    unordered_set<int> win;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (win.count(nums[i])) return true;
        win.insert(nums[i]);
        if ((int)win.size() > k) win.erase(nums[i - k]);
    }
    return false;
}`,
        java: `boolean containsNearbyDuplicate(int[] nums, int k) {
    Set<Integer> win = new HashSet<>();
    for (int i = 0; i < nums.length; i++) {
        if (!win.add(nums[i])) return true;
        if (win.size() > k) win.remove(nums[i - k]);
    }
    return false;
}`,
        javascript: `function containsNearbyDuplicate(nums, k) {
  const win = new Set();
  for (let i = 0; i < nums.length; i++) {
    if (win.has(nums[i])) return true;
    win.add(nums[i]);
    if (win.size > k) win.delete(nums[i - k]);
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: ['k = 0 時永遠是 false(不同的索引距離至少 1)', '視窗版先移除再檢查的順序寫反,會漏掉剛好距離 k 的一對'],
  check: {
    kind: 'fn',
    fn: 'containsNearbyDuplicate',
    cases: [
      { args: [[1, 2, 3, 1], 3], out: true },
      { args: [[1, 0, 1, 1], 1], out: true },
      { args: [A, K], out: false },
      { args: [[1, 1], 0], out: false },
      { args: [[99, 99], 2], out: true },
    ],
  },
}
