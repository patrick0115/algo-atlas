import { arr, range } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 167. Two Sum II - Input Array Is Sorted

const A = [1, 3, 4, 6, 9, 11, 15]
const T = 14

function bsFig(): FigStep[] {
  const out: FigStep[] = [{ note: `陣列有序。固定第一個數 a,另一個數一定是 ${T} − a,用二分搜尋在右邊找它`, views: [arr(A, { label: 'numbers' })] }]
  for (let i = 0; i < A.length; i++) {
    const need = T - A[i]
    let lo = i + 1
    let hi = A.length - 1
    out.push({ note: `固定 numbers[${i}] = ${A[i]},要找 ${need},搜尋範圍 [${lo}, ${hi}]`, views: [arr(A, { label: 'numbers', highlight: [i], range: [lo, hi] })] })
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (A[mid] === need) {
        out.push({ note: `mid = ${mid},numbers[mid] = ${A[mid]} = ${need} → 找到!回傳 [${i + 1}, ${mid + 1}](題目要 1-indexed)`, views: [arr(A, { label: 'numbers', highlight: [i, mid], range: [lo, hi] })] })
        return out
      }
      out.push({ note: `mid = ${mid},numbers[mid] = ${A[mid]} ${A[mid] < need ? `< ${need} → 往右半找` : `> ${need} → 往左半找`}`, views: [arr(A, { label: 'numbers', highlight: [i], compare: [mid], range: [lo, hi] })] })
      if (A[mid] < need) lo = mid + 1
      else hi = mid - 1
    }
  }
  return out
}

function twoPtrFig(): FigStep[] {
  let l = 0
  let r = A.length - 1
  const view = (opt: Parameters<typeof arr>[1] = {}) => arr(A, { label: 'numbers', dim: [...range(0, l - 1), ...range(r + 1, A.length - 1)], pointers: [{ name: 'L', index: l }, { name: 'R', index: r, color: 'b' }], ...opt })
  const out: FigStep[] = [{ note: 'L 指最小、R 指最大。和太小就讓 L 變大,太大就讓 R 變小', views: [view()] }]
  while (l < r) {
    const s = A[l] + A[r]
    if (s === T) {
      out.push({ note: `${A[l]} + ${A[r]} = ${T} → 回傳 [${l + 1}, ${r + 1}]`, views: [view({ highlight: [l, r] })] })
      return out
    }
    out.push({
      note: s < T
        ? `${A[l]} + ${A[r]} = ${s} < ${T}。${A[l]} 配最大的 ${A[r]} 都不夠,配其他數更不夠 → ${A[l]} 不可能是答案,L++`
        : `${A[l]} + ${A[r]} = ${s} > ${T}。${A[r]} 配最小的 ${A[l]} 都太大,配其他數更大 → ${A[r]} 不可能是答案,R--`,
      views: [view({ compare: [l, r] })],
    })
    if (s < T) l++
    else r--
  }
  return out
}

export const q0167: Solution = {
  id: 167,
  plain: '和 Two Sum 一樣找兩個數加起來等於目標,但這次數字**已經從小排到大**。可以從兩頭往中間夾:太大就把右邊換小一點,太小就把左邊換大一點。',
  statement:
    '給一個**由小到大排好**的整數陣列 `numbers` 和目標 `target`,找兩個不同位置的數加起來等於 `target`,回傳它們的位置(**從 1 開始算**,小的在前)。保證剛好一組答案。只能用常數的額外空間。',
  examples: [
    { input: 'numbers = [2,7,11,15], target = 9', output: '[1,2]', note: '2 + 7 = 9' },
    { input: 'numbers = [2,3,4], target = 6', output: '[1,3]' },
    { input: 'numbers = [-1,0], target = -1', output: '[1,2]' },
  ],
  constraints: [
    '`2 ≤ numbers.length ≤ 3·10⁴` → O(n²) 是 9 億次,太慢',
    '陣列**已經排序** → 這是最重要的提示,可以用二分搜尋或左右雙指針',
    '要求 **O(1) 額外空間** → [1. Two Sum](#/q/1) 的 Hash Map 解法不符合',
  ],
  insight: [
    '[1. Two Sum](#/q/1) 用 Hash Map 是 O(n) 時間、O(n) 空間;這題多了「已排序」和「O(1) 空間」',
    '有序 → 固定一個數 `a`,另一個 `target − a` 可以用**二分搜尋**找 → O(n log n)',
    '更好:左右各放一個指針。和太小 → 左邊那個數配最大的都不夠,可以丟掉;和太大 → 右邊那個配最小的都太大,也可以丟掉。每一步丟掉一個數 → O(n)',
  ],
  approaches: [
    {
      name: '暴力:試每一對',
      idea: '兩層迴圈,和等於 `target` 就回傳。沒有用到「有序」。',
      steps: ['`i` 從 0 開始,`j` 從 `i+1` 開始', '`numbers[i] + numbers[j] == target` → 回傳 `[i+1, j+1]`'],
      figure: { title: `numbers = [${A.join(',')}], target = ${T}`, steps: [{ note: '和 [1. Two Sum](#/q/1) 的暴力法一樣:每一對都試,最多 n(n−1)/2 對', views: [arr(A, { label: 'numbers' })] }, { note: `1 配誰都湊不到 ${T}(要 ${T - 1});換 3:3 + 4、3 + 6、3 + 9 都不對,3 + 11 = ${T}`, views: [arr(A, { label: 'numbers', highlight: [1, 5] })] }] },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '最多比 n(n−1)/2 對。' },
      verdict: 'n = 3·10⁴ 會超時。只當起點。',
      code: {
        python: `def twoSum(numbers, target):
    n = len(numbers)
    for i in range(n):
        for j in range(i + 1, n):
            if numbers[i] + numbers[j] == target:
                return [i + 1, j + 1]
    return []`,
        c: `int *twoSum(int *numbers, int numbersSize, int target, int *returnSize) {
    int *r = malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < numbersSize; i++)
        for (int j = i + 1; j < numbersSize; j++)
            if (numbers[i] + numbers[j] == target) { r[0] = i + 1; r[1] = j + 1; return r; }
    *returnSize = 0;
    return r;
}`,
        cpp: `vector<int> twoSum(vector<int>& numbers, int target) {
    int n = numbers.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (numbers[i] + numbers[j] == target) return {i + 1, j + 1};
    return {};
}`,
        java: `int[] twoSum(int[] numbers, int target) {
    int n = numbers.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            if (numbers[i] + numbers[j] == target) return new int[]{i + 1, j + 1};
    return new int[0];
}`,
        javascript: `function twoSum(numbers, target) {
  const n = numbers.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (numbers[i] + numbers[j] === target) return [i + 1, j + 1];
  return [];
}`,
      },
    },
    {
      name: '固定一個 + 二分搜尋另一個',
      idea: '對每個 `i`,要找的數是 `target − numbers[i]`。陣列有序,就在 `i` 右邊做[[p:binary-search]]。',
      steps: ['對每個 `i`:`need = target − numbers[i]`', '在 `[i+1, n−1]` 二分搜尋 `need`', '找到位置 `j` → 回傳 `[i+1, j+1]`'],
      figure: { title: `numbers = [${A.join(',')}], target = ${T}`, steps: bsFig() },
      complexity: { time: 'O(n log n)', space: 'O(1)', why: 'n 個起點,每個二分 O(log n)。只用幾個整數變數。' },
      verdict: '有用到「有序」,也符合 O(1) 空間,但比雙指針多一個 log。當作過渡想法。',
      code: {
        python: `def twoSum(numbers, target):
    n = len(numbers)
    for i in range(n):
        need = target - numbers[i]
        lo, hi = i + 1, n - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if numbers[mid] == need:
                return [i + 1, mid + 1]
            if numbers[mid] < need:
                lo = mid + 1
            else:
                hi = mid - 1
    return []`,
        c: `int *twoSum(int *numbers, int numbersSize, int target, int *returnSize) {
    int *r = malloc(2 * sizeof(int));
    *returnSize = 2;
    for (int i = 0; i < numbersSize; i++) {
        int need = target - numbers[i];
        int lo = i + 1, hi = numbersSize - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (numbers[mid] == need) { r[0] = i + 1; r[1] = mid + 1; return r; }
            if (numbers[mid] < need) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    *returnSize = 0;
    return r;
}`,
        cpp: `vector<int> twoSum(vector<int>& numbers, int target) {
    int n = numbers.size();
    for (int i = 0; i < n; i++) {
        int need = target - numbers[i];
        // lower_bound:第一個 >= need 的位置
        auto it = lower_bound(numbers.begin() + i + 1, numbers.end(), need);
        if (it != numbers.end() && *it == need) return {i + 1, int(it - numbers.begin()) + 1};
    }
    return {};
}`,
        java: `int[] twoSum(int[] numbers, int target) {
    int n = numbers.length;
    for (int i = 0; i < n; i++) {
        int need = target - numbers[i];
        int lo = i + 1, hi = n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (numbers[mid] == need) return new int[]{i + 1, mid + 1};
            if (numbers[mid] < need) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return new int[0];
}`,
        javascript: `function twoSum(numbers, target) {
  const n = numbers.length;
  for (let i = 0; i < n; i++) {
    const need = target - numbers[i];
    let lo = i + 1, hi = n - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (numbers[mid] === need) return [i + 1, mid + 1];
      if (numbers[mid] < need) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return [];
}`,
      },
    },
    {
      name: '左右雙指針夾擠',
      idea: '`L` 在最左、`R` 在最右。和太小 `L++`,和太大 `R--`,相等就是答案。每一步都排除掉一個不可能的數。',
      steps: ['`L = 0`、`R = n − 1`', '`s = numbers[L] + numbers[R]`', '`s == target` → 回傳 `[L+1, R+1]`', '`s < target` → `L++`;`s > target` → `R--`'],
      figure: { title: `numbers = [${A.join(',')}], target = ${T}`, steps: twoPtrFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每一步 L 右移或 R 左移,兩者最多合計走 n 步。' },
      verdict: '標準解。「為什麼可以丟掉」是面試重點:和太小時,`numbers[L]` 配目前最大的數都不夠,配其他(更小的)數只會更小,所以它不可能在答案裡。[15. 3Sum](#/q/15) 就是外面再套一層迴圈。',
      code: {
        python: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1
    return []`,
        c: `int *twoSum(int *numbers, int numbersSize, int target, int *returnSize) {
    int *r = malloc(2 * sizeof(int));
    *returnSize = 2;
    int lo = 0, hi = numbersSize - 1;
    while (lo < hi) {
        int s = numbers[lo] + numbers[hi];
        if (s == target) { r[0] = lo + 1; r[1] = hi + 1; return r; }
        if (s < target) lo++;
        else hi--;
    }
    *returnSize = 0;
    return r;
}`,
        cpp: `vector<int> twoSum(vector<int>& numbers, int target) {
    int l = 0, r = (int)numbers.size() - 1;
    while (l < r) {
        int s = numbers[l] + numbers[r];
        if (s == target) return {l + 1, r + 1};
        if (s < target) l++;
        else r--;
    }
    return {};
}`,
        java: `int[] twoSum(int[] numbers, int target) {
    int l = 0, r = numbers.length - 1;
    while (l < r) {
        int s = numbers[l] + numbers[r];
        if (s == target) return new int[]{l + 1, r + 1};
        if (s < target) l++;
        else r--;
    }
    return new int[0];
}`,
        javascript: `function twoSum(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const s = numbers[l] + numbers[r];
    if (s === target) return [l + 1, r + 1];
    if (s < target) l++;
    else r--;
  }
  return [];
}`,
      },
    },
  ],
  pitfalls: [
    '回傳的是 **1-indexed**:索引要 +1',
    '雙指針的迴圈條件是 `L < R`(不能用同一個位置兩次),不是 `L <= R`',
    '二分搜尋要從 `i + 1` 開始找,不然 `[3, 3]` 以外的情況可能會找到自己(例如 `target = 2·numbers[i]`)',
    '這題的值都在 `[-1000, 1000]`,相加不會溢位;題目數字大的話 C / Java 要用 `long`',
  ],
  followUp: [
    { q: '如果陣列沒排序?', a: '回到 [1. Two Sum](#/q/1):Hash Map O(n)。或者先排序再雙指針,但要帶著原索引。' },
    { q: '如果要找三個數?', a: '[15. 3Sum](#/q/15):排序後固定第一個數,剩下的就是這題。' },
  ],
  check: {
    kind: 'fn',
    fn: 'twoSum',
    cases: [
      { args: [[2, 7, 11, 15], 9], out: [1, 2] },
      { args: [[2, 3, 4], 6], out: [1, 3] },
      { args: [[-1, 0], -1], out: [1, 2] },
      { args: [A, T], out: [2, 6] },
      { args: [[0, 0, 3, 4], 0], out: [1, 2] },
      { args: [[5, 25, 75], 100], out: [2, 3] },
    ],
  },
}
