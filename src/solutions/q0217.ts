import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'
import { kv } from './fig'

// 217. Contains Duplicate

const A = [3, 1, 4, 2, 5, 4]

function bruteFig(): FigStep[] {
  const out: FigStep[] = [{ note: '兩層迴圈:固定 i,讓 j 從 i+1 往後,把每一對都比一次', views: [arr(A, { label: 'nums' })] }]
  for (let i = 0; i < A.length; i++) {
    for (let j = i + 1; j < A.length; j++) {
      const same = A[i] === A[j]
      out.push({
        note: `比 nums[${i}]=${A[i]} 和 nums[${j}]=${A[j]}${same ? ' → 一樣!回傳 true' : ',不一樣'}`,
        views: [arr(A, { label: 'nums', compare: [i, j], highlight: same ? [i, j] : [], pointers: [{ name: 'i', index: i }, { name: 'j', index: j, color: 'b' }] })],
      })
      if (same) return out
    }
  }
  return out
}

function sortFig(): FigStep[] {
  const s = [...A].sort((a, b) => a - b)
  const out: FigStep[] = [
    { note: '先排序。排完之後,相同的數一定會黏在一起', views: [arr(A, { label: 'nums' })] },
    { note: '排序完成', views: [arr(s, { label: '排序後' })] },
  ]
  for (let i = 1; i < s.length; i++) {
    const same = s[i] === s[i - 1]
    out.push({
      note: `只要看相鄰的:s[${i - 1}]=${s[i - 1]} 和 s[${i}]=${s[i]}${same ? ' → 一樣,回傳 true' : ',不一樣'}`,
      views: [arr(s, { label: '排序後', compare: [i - 1, i], highlight: same ? [i - 1, i] : [], done: range(0, i - 2) })],
    })
    if (same) break
  }
  return out
}

function setFig(): FigStep[] {
  const seen: number[] = []
  const out: FigStep[] = [{ note: '準備一個空的 Set,記住「看過的數」', views: [arr(A, { label: 'nums' }), kv([], 'seen')] }]
  for (let i = 0; i < A.length; i++) {
    const x = A[i]
    if (seen.includes(x)) {
      out.push({ note: `${x} 已經在 seen 裡 → 出現第二次,回傳 true`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), kv(seen.map((v) => [v, '✓']), 'seen', [x])] })
      return out
    }
    seen.push(x)
    out.push({ note: `${x} 不在 seen 裡,加進去`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) }), kv(seen.map((v) => [v, '✓']), 'seen', [x])] })
  }
  return out
}

export const q0217: Solution = {
  id: 217,
  statement: '給一個整數陣列 `nums`,只要有任何一個數**出現至少兩次**就回傳 `true`;每個數都只出現一次則回傳 `false`。',
  examples: [
    { input: 'nums = [1,2,3,1]', output: 'true', note: '1 出現了兩次' },
    { input: 'nums = [1,2,3,4]', output: 'false' },
    { input: 'nums = [1,1,1,3,3,4,3,2,4,2]', output: 'true' },
  ],
  constraints: [
    '`1 ≤ nums.length ≤ 10⁵` → n 到 10 萬,O(n²) 是 100 億次,會超時;要 O(n log n) 以下',
    '`-10⁹ ≤ nums[i] ≤ 10⁹` → 值域太大,不能開「值當索引」的陣列,要用 Hash Set 或排序',
  ],
  insight: [
    '最直接:每一對都比一次 → O(n²),n = 10⁵ 太慢',
    '慢在哪?對每個數,我們都「重新掃一遍」去找它有沒有出現過。如果能**記住看過的數**、O(1) 查詢,就只要掃一次 → Hash Set',
    '另一條路:排序後相同的數會相鄰,只需比較鄰居 → O(n log n),而且可以不用額外空間',
  ],
  approaches: [
    {
      name: '暴力:兩兩比較',
      idea: '每一對 `(i, j)`、`i < j` 都比一次,有一對相等就是有重複。',
      steps: ['外層 `i` 從 0 到 n−1', '內層 `j` 從 `i+1` 到 n−1', '`nums[i] == nums[j]` → `true`', '全部比完 → `false`'],
      figure: { title: 'nums = [3,1,4,2,5,4]', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '共有 n(n−1)/2 對,每對比一次。沒有用到額外的資料結構。' },
      verdict: '會超時,只當作思考起點。面試時講一句「暴力是 O(n²),可以用 Hash Set 降到 O(n)」就好。',
      code: {
        python: `def containsDuplicate(nums):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] == nums[j]:
                return True
    return False`,
        c: `bool containsDuplicate(int *nums, int numsSize) {
    for (int i = 0; i < numsSize; i++)
        for (int j = i + 1; j < numsSize; j++)
            if (nums[i] == nums[j]) return true;
    return false;
}`,
        cpp: `bool containsDuplicate(vector<int>& nums) {
    int n = nums.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (nums[i] == nums[j]) return true;
    return false;
}`,
        java: `boolean containsDuplicate(int[] nums) {
    int n = nums.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (nums[i] == nums[j]) return true;
    return false;
}`,
        javascript: `function containsDuplicate(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (nums[i] === nums[j]) return true;
  return false;
}`,
      },
    },
    {
      name: '排序後看相鄰',
      idea: '排序之後,相同的數一定連在一起,所以只要檢查 `nums[i] == nums[i-1]`。',
      steps: ['把 `nums` 排序', '`i` 從 1 走到 n−1', '`nums[i] == nums[i-1]` → `true`', '走完 → `false`'],
      figure: { title: 'nums = [3,1,4,2,5,4]', steps: sortFig() },
      complexity: { time: 'O(n log n)', space: 'O(1) ~ O(n)', why: '排序 O(n log n) 加一次掃描 O(n)。原地排序的額外空間看語言:C 的 qsort 約 O(log n),Python 的 sorted() 會複製一份 O(n)。' },
      verdict: '記憶體很緊、不能開 Hash Set 時的選擇。代價是會改動輸入陣列(要保留原陣列就得先複製)。',
      code: {
        python: `def containsDuplicate(nums):
    nums.sort()
    for i in range(1, len(nums)):
        if nums[i] == nums[i - 1]:
            return True
    return False`,
        c: `int cmpInt(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);   // 不要寫 x - y,會溢位
}

bool containsDuplicate(int *nums, int numsSize) {
    qsort(nums, numsSize, sizeof(int), cmpInt);
    for (int i = 1; i < numsSize; i++)
        if (nums[i] == nums[i - 1]) return true;
    return false;
}`,
        cpp: `bool containsDuplicate(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    for (size_t i = 1; i < nums.size(); i++)
        if (nums[i] == nums[i - 1]) return true;
    return false;
}`,
        java: `boolean containsDuplicate(int[] nums) {
    Arrays.sort(nums);
    for (int i = 1; i < nums.length; i++)
        if (nums[i] == nums[i - 1]) return true;
    return false;
}`,
        javascript: `function containsDuplicate(nums) {
  const s = [...nums].sort((a, b) => a - b);   // 預設 sort 是字串排序,一定要給比較函式
  for (let i = 1; i < s.length; i++)
    if (s[i] === s[i - 1]) return true;
  return false;
}`,
      },
    },
    {
      name: 'Hash Set:看過就記住',
      idea: '邊走邊把數字放進 Set。放之前先查:已經在裡面 → 有重複。',
      steps: ['`seen = 空的 Set`', '對每個 `x`:`x` 在 `seen` 裡 → `true`', '否則把 `x` 加進 `seen`', '走完 → `false`'],
      figure: { title: 'nums = [3,1,4,2,5,4]', steps: setFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個數查一次、存一次,Hash Set 平均 O(1)。最壞情況(全都不重複)Set 會存 n 個數。' },
      verdict: '標準解,用空間換時間。只需要「有沒有出現過」所以用 Set 就好,不需要 Map。',
      code: {
        python: `def containsDuplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
# 一行版:return len(set(nums)) < len(nums)(但不會提早結束)`,
        c: `// C 沒有內建 Hash Set,這裡用 uthash(LeetCode 環境內建)
typedef struct { int key; UT_hash_handle hh; } Item;

bool containsDuplicate(int *nums, int numsSize) {
    Item *seen = NULL, *it, *tmp;
    bool dup = false;
    for (int i = 0; i < numsSize && !dup; i++) {
        HASH_FIND_INT(seen, &nums[i], it);
        if (it) {
            dup = true;
        } else {
            it = malloc(sizeof(Item));
            it->key = nums[i];
            HASH_ADD_INT(seen, key, it);
        }
    }
    HASH_ITER(hh, seen, it, tmp) { HASH_DEL(seen, it); free(it); }
    return dup;
}`,
        cpp: `bool containsDuplicate(vector<int>& nums) {
    unordered_set<int> seen;
    for (int x : nums) {
        if (seen.count(x)) return true;
        seen.insert(x);
    }
    return false;
}`,
        java: `boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int x : nums)
        if (!seen.add(x)) return true;   // add 回傳 false 代表已經存在
    return false;
}`,
        javascript: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
      },
    },
  ],
  pitfalls: [
    'JavaScript 的 `sort()` 不給比較函式時是**字串排序**:`[10, 9, 1]` 會排成 `[1, 10, 9]`,這題剛好不影響「相等是否相鄰」,但其他題會出錯,養成習慣一律寫 `(a, b) => a - b`',
    'C 的比較函式寫成 `return x - y` 在 `x = 10⁹、y = -10⁹` 時會溢位,要寫 `(x > y) - (x < y)`',
    '只需要「有沒有」就用 Set;用 Map 存次數也對,但多做了事',
  ],
  followUp: [
    { q: '如果要求 O(1) 額外空間?', a: '用排序法(原地排序)。如果值域很小(例如 0 ~ n−1),還可以把數字當索引、在原陣列做標記(見 448、287)。' },
    { q: '如果只要判斷「距離 k 以內」有沒有重複?', a: '那是 219. Contains Duplicate II:用大小為 k 的[滑動視窗](#/p/sliding-window)維護 Set。' },
  ],
  check: {
    kind: 'fn',
    fn: 'containsDuplicate',
    cases: [
      { args: [[1, 2, 3, 1]], out: true },
      { args: [[1, 2, 3, 4]], out: false },
      { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], out: true },
      { args: [[7]], out: false },
      { args: [[-1000000000, 1000000000, -1000000000]], out: true },
    ],
  },
}
