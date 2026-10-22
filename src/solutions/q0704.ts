import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 704. Binary Search

const A = [-1, 0, 3, 5, 9, 12, 15, 20, 31]
const T = 12

function linearFig(): FigStep[] {
  const out: FigStep[] = [{ note: '最直接:從頭一個一個看。沒有用到「已排序」', views: [arr(A, { label: 'nums' })] }]
  for (let i = 0; i < A.length; i++) {
    out.push({ note: `nums[${i}] = ${A[i]}${A[i] === T ? ` = ${T} → 回傳 ${i}` : ''}`, views: [arr(A, { label: 'nums', highlight: [i], dim: range(0, i - 1) })] })
    if (A[i] === T) break
  }
  return out
}

function closedFig(): FigStep[] {
  let lo = 0
  let hi = A.length - 1
  const view = (mid?: number, hl = false) =>
    arr(A, {
      label: 'nums',
      range: [lo, hi],
      dim: [...range(0, lo - 1), ...range(hi + 1, A.length - 1)],
      compare: mid !== undefined && !hl ? [mid] : [],
      highlight: hl && mid !== undefined ? [mid] : [],
      pointers: [{ name: 'lo', index: lo }, { name: 'hi', index: hi, color: 'b' }, ...(mid !== undefined ? [{ name: 'mid', index: mid, color: 'c' as const }] : [])],
    })
  const out: FigStep[] = [{ note: `閉區間 [lo, hi] = [0, ${hi}]:答案如果存在,一定在框框裡。框框不是空的(lo ≤ hi)就繼續`, views: [view()] }]
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1)
    if (A[mid] === T) {
      out.push({ note: `mid = ${mid},nums[mid] = ${A[mid]} = target → 回傳 ${mid}`, views: [view(mid, true)] })
      return out
    }
    const go = A[mid] < T
    out.push({ note: `mid = ${mid},nums[mid] = ${A[mid]} ${go ? `< ${T}:mid 和它左邊都太小 → lo = mid + 1` : `> ${T}:mid 和它右邊都太大 → hi = mid − 1`}`, views: [view(mid)] })
    if (go) lo = mid + 1
    else hi = mid - 1
  }
  out.push({ note: '框框變空了(lo > hi)→ 找不到,回傳 −1', views: [arr(A, { label: 'nums', dim: range(0, A.length - 1) })] })
  return out
}

function lowerFig(): FigStep[] {
  let lo = 0
  let hi = A.length
  const view = (mid?: number) =>
    arr(A, {
      label: 'nums',
      range: [lo, hi - 1],
      dim: [...range(0, lo - 1), ...range(hi, A.length - 1)],
      compare: mid !== undefined ? [mid] : [],
      pointers: [{ name: 'lo', index: lo }, ...(hi < A.length ? [{ name: 'hi', index: hi, color: 'b' as const }] : []), ...(mid !== undefined ? [{ name: 'mid', index: mid, color: 'c' as const }] : [])],
    })
  const out: FigStep[] = [{ note: `另一種寫法:半開區間 [lo, hi) = [0, ${hi}),找「第一個 ≥ target 的位置」。hi 一開始指在陣列外面`, views: [view()] }]
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1)
    const go = A[mid] < T
    out.push({ note: `mid = ${mid},nums[mid] = ${A[mid]} ${go ? `< ${T} → 答案在右邊,lo = mid + 1` : `≥ ${T} → mid 可能就是答案,保留它:hi = mid`}`, views: [view(mid)] })
    if (go) lo = mid + 1
    else hi = mid
  }
  out.push({ note: `lo == hi = ${lo},這就是第一個 ≥ ${T} 的位置。最後再檢查 nums[${lo}] == ${T}? ${A[lo] === T ? `是 → 回傳 ${lo}` : '否 → −1'}`, views: [arr(A, { label: 'nums', highlight: [lo], pointers: [{ name: 'lo=hi', index: lo }] })] })
  return out
}

export const q0704: Solution = {
  id: 704,
  plain: '在一排**已經排好**的數字裡找某個數。每次看中間那個:太大就丟掉右半邊,太小就丟掉左半邊,像翻字典找字一樣。',
  statement: '給一個**由小到大排好、沒有重複**的整數陣列 `nums` 和 `target`,如果 `target` 在陣列裡就回傳它的索引,不在就回傳 `-1`。要 O(log n)。',
  examples: [
    { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
    { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
  ],
  constraints: ['`1 ≤ n ≤ 10⁴`', '**已排序、不重複** → 二分搜尋的前提', '題目要求 **O(log n)** → 線性掃描不符合'],
  insight: [
    '有序陣列中,看中間那個數就能排除一半:中間的數比 target 小,中間和它左邊全部都太小',
    '每次砍一半,n 個數最多砍 log₂ n 次 → O(log n)。n = 10⁴ 只要 14 次',
    '二分最容易錯的是**邊界**:區間是閉的還是半開的、迴圈條件是 `<` 還是 `<=`、更新是 `mid` 還是 `mid ± 1`。挑一種寫法,三者必須一致',
  ],
  approaches: [
    {
      name: '線性掃描',
      idea: '從頭走到尾,看到 `target` 就回傳。',
      steps: ['`for i in range(n)`:`nums[i] == target` → 回傳 `i`', '走完 → `-1`'],
      figure: { title: `nums = [${A.join(',')}], target = ${T}`, steps: linearFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '最壞看完全部 n 個。' },
      verdict: '能過但不符合題目要求;沒有用到「已排序」。',
      code: {
        python: `def search(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1`,
        c: `int search(int *nums, int numsSize, int target) {
    for (int i = 0; i < numsSize; i++)
        if (nums[i] == target) return i;
    return -1;
}`,
        cpp: `int search(vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++)
        if (nums[i] == target) return i;
    return -1;
}`,
        java: `int search(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++)
        if (nums[i] == target) return i;
    return -1;
}`,
        javascript: `function search(nums, target) {
  return nums.indexOf(target);   // 內建的 indexOf 也是線性掃描
}`,
      },
    },
    {
      name: '二分搜尋:閉區間 [lo, hi]',
      idea: '答案一定在 `[lo, hi]` 裡。看 `mid`:等於就回傳;太小就 `lo = mid + 1`;太大就 `hi = mid − 1`。區間變空(`lo > hi`)就是找不到。',
      steps: ['`lo = 0`、`hi = n − 1`', '`while lo <= hi`:`mid = lo + (hi − lo) / 2`', '`nums[mid] == target` → 回傳 `mid`', '`nums[mid] < target` → `lo = mid + 1`;否則 `hi = mid − 1`', '迴圈結束 → `-1`'],
      figure: { title: `nums = [${A.join(',')}], target = ${T}`, steps: closedFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次迴圈區間至少縮成一半。' },
      verdict: '找「某個值在不在」最好寫的版本。三件事要一致:閉區間 → `while lo <= hi` → 更新時跳過 mid(`±1`)。',
      code: {
        python: `def search(nums, target):
    lo, hi = 0, len(nums) - 1             # 閉區間 [lo, hi]
    while lo <= hi:                       # 區間不是空的
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1                  # mid 已經看過,排除
        else:
            hi = mid - 1
    return -1`,
        c: `int search(int *nums, int numsSize, int target) {
    int lo = 0, hi = numsSize - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;     // 不寫 (lo + hi) / 2,避免溢位
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
        cpp: `int search(vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
        java: `int search(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;     // 或 (lo + hi) >>> 1
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`,
        javascript: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
      },
    },
    {
      name: '二分搜尋:半開區間找下界(lower_bound)',
      idea: '找「第一個 ≥ target 的位置」,最後再檢查那格是不是 target。半開區間 `[lo, hi)`,`nums[mid] ≥ target` 時 mid 可能是答案,所以 `hi = mid` 而不是 `mid − 1`。',
      steps: ['`lo = 0`、`hi = n`(注意不是 n − 1)', '`while lo < hi`:`mid = lo + (hi − lo) / 2`', '`nums[mid] < target` → `lo = mid + 1`;否則 `hi = mid`', '結束時 `lo == hi`;`lo < n` 且 `nums[lo] == target` → 回傳 `lo`,否則 `-1`'],
      figure: { title: `nums = [${A.join(',')}], target = ${T}`, steps: lowerFig() },
      complexity: { time: 'O(log n)', space: 'O(1)', why: '每次區間縮成一半,而且迴圈裡少一次「等於」的比較。' },
      verdict: '最萬用的模板:找第一個 ≥ x、最後一個 ≤ x、插入位置(35)、範圍起訖(34)都用它。C++ 的 `lower_bound`、Python 的 `bisect_left` 就是這個。',
      code: {
        python: `def search(nums, target):
    lo, hi = 0, len(nums)                 # 半開區間 [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid                      # mid 可能就是答案,不能丟
    # lo 是第一個 >= target 的位置(等同 bisect_left(nums, target))
    return lo if lo < len(nums) and nums[lo] == target else -1`,
        c: `int search(int *nums, int numsSize, int target) {
    int lo = 0, hi = numsSize;            // 半開區間 [lo, hi)
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo < numsSize && nums[lo] == target ? lo : -1;
}`,
        cpp: `int search(vector<int>& nums, int target) {
    auto it = lower_bound(nums.begin(), nums.end(), target);   // 第一個 >= target
    return it != nums.end() && *it == target ? int(it - nums.begin()) : -1;
}`,
        java: `int search(int[] nums, int target) {
    int lo = 0, hi = nums.length;         // 半開區間 [lo, hi)
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid;
    }
    return lo < nums.length && nums[lo] == target ? lo : -1;
}`,
        javascript: `function search(nums, target) {
  let lo = 0, hi = nums.length;         // 半開區間 [lo, hi)
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo < nums.length && nums[lo] === target ? lo : -1;
}`,
      },
    },
  ],
  pitfalls: [
    '區間和迴圈條件不一致:閉區間配 `lo < hi` 會漏看最後一個;半開區間配 `lo <= hi` 會無窮迴圈或越界',
    '半開區間寫 `hi = mid − 1`:mid 可能正是答案,被丟掉了',
    '`(lo + hi) / 2` 在 C / Java 的 int 可能溢位(lo、hi 都接近 2³¹),寫 `lo + (hi − lo) / 2`',
    '半開版最後忘了檢查 `lo < n`:target 比所有數都大時 `lo == n`,取 `nums[n]` 會越界',
  ],
  followUp: [
    { q: '如果陣列有重複,要找第一次出現的位置?', a: '閉區間版本找到時不能直接回傳;直接用方法三的下界版本,它本來就回傳「第一個」。最後一次出現 = 第一個 > target 的位置 − 1(34. Find First and Last Position)。' },
    { q: '二分還能用在哪?', a: '不一定要在陣列上:只要「答案越大越容易成立」這種單調性存在,就能對答案二分([875. Koko Eating Bananas](#/q/875),見[[p:binary-search-answer]])。' },
  ],
  check: {
    kind: 'fn',
    fn: 'search',
    cases: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], out: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], out: -1 },
      { args: [[5], 5], out: 0 },
      { args: [[5], -5], out: -1 },
      { args: [A, T], out: 5 },
      { args: [A, 40], out: -1 },
      { args: [A, -1], out: 0 },
    ],
  },
}
