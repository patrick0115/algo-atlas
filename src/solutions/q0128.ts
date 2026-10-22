import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 128. Longest Consecutive Sequence

const A = [100, 4, 200, 1, 3, 2, 101]

function sortFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const out: FigStep[] = [
    { note: '先排序,連續的數就會排在一起', views: [arr(A, { label: 'nums' })] },
    { note: '排序完成。接著從左到右數「目前這一段連續了幾個」', views: [arr(s, { label: '排序後' })] },
  ]
  let cur = 1
  let best = 1
  let start = 0
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) continue
    if (s[i] === s[i - 1] + 1) {
      cur++
      best = Math.max(best, cur)
      out.push({ note: `${s[i]} = ${s[i - 1]} + 1,接得上 → 目前這段長 ${cur},最長 ${best}`, views: [arr(s, { label: '排序後', range: [start, i], highlight: [i] })] })
    } else {
      out.push({ note: `${s[i]} 和 ${s[i - 1]} 差超過 1,斷掉了 → 從 ${s[i]} 重新開始算,目前長 1,最長仍是 ${best}`, views: [arr(s, { label: '排序後', range: [i, i], highlight: [i] })] })
      cur = 1
      start = i
    }
  }
  out.push({ note: `答案 = ${best}`, views: [arr(s, { label: '排序後', done: range(0, 3) })] })
  return out
}

function setFig(): FigStep[] {
  const set = new Set(A)
  const setView = (hl: number[] = []) => kv([...set].sort((a, b) => a - b).map((v) => [v, '✓']), 'set(所有出現過的數)', hl)
  const out: FigStep[] = [{ note: '把所有數放進 Hash Set,之後問「x 在不在」都是 O(1)', views: [arr(A, { label: 'nums' }), setView()] }]
  let best = 0
  A.forEach((x, i) => {
    if (set.has(x - 1)) {
      out.push({ note: `${x}:${x - 1} 也在 set 裡,代表 ${x} 不是一段的開頭 → 跳過(之後從開頭數的時候會數到它)`, views: [arr(A, { label: 'nums', highlight: [i] }), setView([x, x - 1])] })
      return
    }
    let y = x
    while (set.has(y + 1)) y++
    best = Math.max(best, y - x + 1)
    const seq = range(x, y)
    out.push({
      note: `${x}:${x - 1} 不在 set 裡 → ${x} 是開頭!往上數 ${seq.join('、')},長度 ${y - x + 1},最長 ${best}`,
      views: [arr(A, { label: 'nums', highlight: [i] }), setView(seq)],
    })
  })
  out.push({ note: `答案 = ${best}。每個數最多被「往上數」經過一次,所以總共是 O(n)`, views: [setView()] })
  return out
}

function mapFig(): FigStep[] {
  const len = new Map<number, number>()
  const view = (hl: number[] = []) => kv([...len].sort((a, b) => a[0] - b[0]), 'len(區間端點 → 那段區間的長度)', hl)
  const out: FigStep[] = [{ note: '另一種想法:把連續的數看成「區間」。map 只要保證每段區間的**兩個端點**記著正確的長度', views: [arr(A, { label: 'nums' }), view()] }]
  let best = 0
  A.forEach((x, i) => {
    if (len.has(x)) return
    const left = len.get(x - 1) ?? 0
    const right = len.get(x + 1) ?? 0
    const total = left + right + 1
    len.set(x, total)
    len.set(x - left, total)
    len.set(x + right, total)
    best = Math.max(best, total)
    out.push({
      note: `加入 ${x}:左邊相鄰區間長 ${left}、右邊長 ${right} → 合併成長 ${total} 的區間 [${x - left}, ${x + right}],更新兩個端點。最長 ${best}`,
      views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), view([x - left, x + right])],
    })
  })
  out.push({ note: `答案 = ${best}`, views: [view()] })
  return out
}

export const q0128: Solution = {
  id: 128,
  plain: '給一堆亂排的數字,找出最長的「連續整數」有幾個,例如裡面有 1、2、3、4 就是 4 個。數字原本的位置不重要。',
  statement: '給一個**沒有排序**的整數陣列 `nums`,找出「值連續」的最長序列有多長(例如 1, 2, 3, 4)。數字在陣列裡的位置不重要,只看值。要求 O(n) 時間。',
  examples: [
    { input: 'nums = [100,4,200,1,3,2]', output: '4', note: '1, 2, 3, 4' },
    { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9', note: '0 到 8,重複的 0 只算一次' },
    { input: 'nums = []', output: '0' },
  ],
  constraints: [
    '`0 ≤ nums.length ≤ 10⁵` → 陣列可能是空的,要回傳 0',
    '`-10⁹ ≤ nums[i] ≤ 10⁹` → 值域太大,不能開「值當索引」的陣列',
    '題目明確要求 **O(n)** → 排序(O(n log n))能過,但不是題目要的答案',
  ],
  insight: [
    '最直覺:排序後由左往右數連續段 → O(n log n)',
    '不排序的話,對每個 `x` 一直問「`x+1` 在不在?」可以用 Hash Set 做到 O(1)。但如果每個數都往上數,`[1,2,…,n]` 會變成 1 + 2 + … + n = O(n²)',
    '關鍵剪枝:**只從一段的起點開始數**。`x − 1` 在 set 裡就代表 `x` 不是起點,跳過。這樣每個數只會在「從它的起點往上數」時被經過一次 → O(n)',
  ],
  approaches: [
    {
      name: '排序後數連續段',
      idea: '排序後連續的數會相鄰。走一遍:和前一個相等就跳過(重複),差 1 就延長,否則重新開始。',
      steps: ['空陣列 → 0', '排序', '`cur = best = 1`;`i` 從 1 開始', '`nums[i] == nums[i−1]` → 跳過;`== nums[i−1] + 1` → `cur++`;否則 `cur = 1`', '每步更新 `best`'],
      figure: { title: 'nums = [100,4,200,1,3,2,101]', steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '排序 O(n log n),之後一次掃描。額外空間看排序的實作。' },
      verdict: '好寫、不容易錯,但不符合題目要求的 O(n)。面試時當作 baseline 講。',
      code: {
        python: `def longestConsecutive(nums):
    if not nums:
        return 0
    nums.sort()
    best = cur = 1
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            continue                      # 重複的數不影響長度
        if nums[i] == nums[i - 1] + 1:
            cur += 1
        else:
            cur = 1
        best = max(best, cur)
    return best`,
        c: `int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int longestConsecutive(int *nums, int numsSize) {
    if (numsSize == 0) return 0;
    qsort(nums, numsSize, sizeof(int), cmpInt);
    int best = 1, cur = 1;
    for (int i = 1; i < numsSize; i++) {
        if (nums[i] == nums[i - 1]) continue;
        if ((long long)nums[i] == (long long)nums[i - 1] + 1) cur++;
        else cur = 1;
        if (cur > best) best = cur;
    }
    return best;
}`,
        cpp: `int longestConsecutive(vector<int>& nums) {
    if (nums.empty()) return 0;
    sort(nums.begin(), nums.end());
    int best = 1, cur = 1;
    for (size_t i = 1; i < nums.size(); i++) {
        if (nums[i] == nums[i - 1]) continue;
        if ((long long)nums[i] == (long long)nums[i - 1] + 1) cur++;
        else cur = 1;
        best = max(best, cur);
    }
    return best;
}`,
        java: `int longestConsecutive(int[] nums) {
    if (nums.length == 0) return 0;
    Arrays.sort(nums);
    int best = 1, cur = 1;
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] == nums[i - 1]) continue;
        if ((long) nums[i] == (long) nums[i - 1] + 1) cur++;
        else cur = 1;
        best = Math.max(best, cur);
    }
    return best;
}`,
        javascript: `function longestConsecutive(nums) {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  let best = 1, cur = 1;
  for (let i = 1; i < s.length; i++) {
    if (s[i] === s[i - 1]) continue;
    cur = s[i] === s[i - 1] + 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return best;
}`,
      },
    },
    {
      name: 'Hash Set,只從起點往上數',
      idea: '所有數放進 set。只有 `x − 1` 不在 set 裡的 `x` 才是一段的起點,從起點一路問 `x+1`、`x+2`… 在不在,數出這段長度。',
      steps: ['`s = set(nums)`', '對 `s` 裡每個 `x`:`x − 1` 在 `s` → 跳過', '否則 `y = x`,`while y + 1 in s: y += 1`', '`best = max(best, y − x + 1)`'],
      figure: { title: 'nums = [100,4,200,1,3,2,101]', steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數最多被 while 經過一次(只有它所在那段的起點會往上數),加上外層 n 次查詢,總共 O(n)。set 存 n 個數。' },
      verdict: '題目要的標準解。「只從起點開始」這個剪枝是重點,面試時一定要講出為什麼是 O(n) 而不是 O(n²)。要走訪 set 而不是原陣列,原陣列有大量重複的起點時才不會重算。',
      code: {
        python: `def longestConsecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 in s:
            continue                      # 不是起點
        y = x
        while y + 1 in s:
            y += 1
        best = max(best, y - x + 1)
    return best`,
        c: `// C 沒有內建 Hash Set,這裡用 uthash(LeetCode 環境內建)
typedef struct { int key; UT_hash_handle hh; } Item;

static bool has(Item *s, long long v) {
    if (v < INT_MIN || v > INT_MAX) return false;
    int k = (int)v;
    Item *it;
    HASH_FIND_INT(s, &k, it);
    return it != NULL;
}

int longestConsecutive(int *nums, int numsSize) {
    Item *s = NULL, *it, *tmp;
    for (int i = 0; i < numsSize; i++) {
        HASH_FIND_INT(s, &nums[i], it);
        if (!it) {
            it = malloc(sizeof(Item));
            it->key = nums[i];
            HASH_ADD_INT(s, key, it);
        }
    }
    int best = 0;
    HASH_ITER(hh, s, it, tmp) {
        long long x = it->key;
        if (has(s, x - 1)) continue;      // 不是起點
        long long y = x;
        while (has(s, y + 1)) y++;
        if (y - x + 1 > best) best = (int)(y - x + 1);
    }
    HASH_ITER(hh, s, it, tmp) { HASH_DEL(s, it); free(it); }
    return best;
}`,
        cpp: `int longestConsecutive(vector<int>& nums) {
    unordered_set<int> s(nums.begin(), nums.end());
    int best = 0;
    for (int x : s) {
        if (x != INT_MIN && s.count(x - 1)) continue;   // 不是起點
        int len = 1;
        for (long long y = (long long)x + 1; y <= INT_MAX && s.count((int)y); y++) len++;
        best = max(best, len);
    }
    return best;
}`,
        java: `int longestConsecutive(int[] nums) {
    Set<Integer> s = new HashSet<>();
    for (int x : nums) s.add(x);
    int best = 0;
    for (int x : s) {
        if (s.contains(x - 1)) continue;          // 不是起點
        int y = x;
        while (y < Integer.MAX_VALUE && s.contains(y + 1)) y++;
        best = Math.max(best, y - x + 1);
    }
    return best;
}`,
        javascript: `function longestConsecutive(nums) {
  const s = new Set(nums);
  let best = 0;
  for (const x of s) {
    if (s.has(x - 1)) continue;                 // 不是起點
    let y = x;
    while (s.has(y + 1)) y++;
    best = Math.max(best, y - x + 1);
  }
  return best;
}`,
      },
    },
    {
      name: 'Hash Map 合併區間端點',
      idea: '把連續段當成區間。加入 `x` 時,左鄰區間長 `left = len[x−1]`、右鄰 `right = len[x+1]`,合併後長 `left + right + 1`,只要更新**新區間的兩個端點**。',
      steps: ['`len = {}`', '對每個 `x`(已經在 `len` 裡就跳過)', '`left = len.get(x−1, 0)`、`right = len.get(x+1, 0)`、`total = left + right + 1`', '`len[x] = len[x − left] = len[x + right] = total`', '`best = max(best, total)`'],
      figure: { title: 'nums = [100,4,200,1,3,2,101]', steps: mapFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數只做常數次 Hash 操作。只有端點的值保證正確,中間的值過期了也沒關係,因為新的數只會接在端點旁邊。' },
      verdict: '一次遍歷、可以「邊讀邊算」(資料串流也能用)。想法比 set 版難一點,是 [[p:union-find]] 合併集合的簡化版。',
      code: {
        python: `def longestConsecutive(nums):
    length = {}                           # 區間端點 -> 區間長度
    best = 0
    for x in nums:
        if x in length:
            continue
        left = length.get(x - 1, 0)
        right = length.get(x + 1, 0)
        total = left + right + 1
        length[x] = total                 # x 自己也記下,之後重複出現才會跳過
        length[x - left] = total
        length[x + right] = total
        best = max(best, total)
    return best`,
        c: `typedef struct { long long key; int len; UT_hash_handle hh; } Item;

static Item *find(Item *m, long long k) {
    Item *it;
    HASH_FIND(hh, m, &k, sizeof(long long), it);
    return it;
}

static void put(Item **m, long long k, int len) {
    Item *it = find(*m, k);
    if (!it) {
        it = malloc(sizeof(Item));
        it->key = k;
        HASH_ADD(hh, *m, key, sizeof(long long), it);
    }
    it->len = len;
}

int longestConsecutive(int *nums, int numsSize) {
    Item *m = NULL, *it, *tmp;
    int best = 0;
    for (int i = 0; i < numsSize; i++) {
        long long x = nums[i];
        if (find(m, x)) continue;
        Item *l = find(m, x - 1), *r = find(m, x + 1);
        int left = l ? l->len : 0, right = r ? r->len : 0, total = left + right + 1;
        put(&m, x, total);
        put(&m, x - left, total);
        put(&m, x + right, total);
        if (total > best) best = total;
    }
    HASH_ITER(hh, m, it, tmp) { HASH_DEL(m, it); free(it); }
    return best;
}`,
        cpp: `int longestConsecutive(vector<int>& nums) {
    unordered_map<long long, int> len;     // 區間端點 -> 區間長度
    int best = 0;
    for (int v : nums) {
        long long x = v;
        if (len.count(x)) continue;
        auto get = [&](long long k) { auto it = len.find(k); return it == len.end() ? 0 : it->second; };
        int left = get(x - 1), right = get(x + 1), total = left + right + 1;
        len[x] = len[x - left] = len[x + right] = total;
        best = max(best, total);
    }
    return best;
}`,
        java: `int longestConsecutive(int[] nums) {
    Map<Long, Integer> len = new HashMap<>();   // 區間端點 -> 區間長度
    int best = 0;
    for (int v : nums) {
        long x = v;
        if (len.containsKey(x)) continue;
        int left = len.getOrDefault(x - 1, 0), right = len.getOrDefault(x + 1, 0);
        int total = left + right + 1;
        len.put(x, total);
        len.put(x - left, total);
        len.put(x + right, total);
        best = Math.max(best, total);
    }
    return best;
}`,
        javascript: `function longestConsecutive(nums) {
  const len = new Map();                // 區間端點 -> 區間長度
  let best = 0;
  for (const x of nums) {
    if (len.has(x)) continue;
    const left = len.get(x - 1) ?? 0, right = len.get(x + 1) ?? 0;
    const total = left + right + 1;
    len.set(x, total);
    len.set(x - left, total);
    len.set(x + right, total);
    best = Math.max(best, total);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '沒有「只從起點開始」的剪枝,每個數都往上數 → `[1..n]` 這種輸入會變成 O(n²) 超時',
    '走訪原陣列而不是 set:陣列裡有很多重複的起點(例如一萬個 0)時,每個 0 都會重新往上數一次',
    '排序法忘了處理重複的數:`[1,2,2,3]` 的答案是 3,遇到相等要**跳過**而不是重新開始',
    '空陣列要回傳 0,排序法的 `best = 1` 初始值要先擋掉這個情況',
    'C / C++ / Java 的 `x + 1` 在 `x = INT_MAX` 時會溢位,要用更大的型別或先檢查',
  ],
  followUp: [
    { q: '為什麼 set 版是 O(n) 而不是 O(n²)?', a: '內層 while 只有在 `x` 是起點時才會跑,而每個數只屬於一段、只會被它那段的起點數到一次。所以所有 while 加起來最多跑 n 次。' },
    { q: '用並查集怎麼做?', a: '把每個數當節點,`x` 和 `x+1` 都存在就合併,答案是最大的集合大小。也是 O(n·α(n)),但程式比 set 版長,見 [[p:union-find]]。' },
  ],
  check: {
    kind: 'fn',
    fn: 'longestConsecutive',
    cases: [
      { args: [[100, 4, 200, 1, 3, 2]], out: 4 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], out: 9 },
      { args: [[]], out: 0 },
      { args: [[1, 2, 2, 3]], out: 3 },
      { args: [[9, 1, 4, 7, 3, -1, 0, 5, 8, -1, 6]], out: 7 },
      { args: [[2147483647, -2147483648, 2147483646]], out: 2 },
    ],
  },
}
