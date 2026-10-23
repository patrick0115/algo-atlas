import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 665. Non-decreasing Array
const greedyFig: FigStep[] = [
  { note: '非遞減表示每個後面的數都不小於前一個。[4,2,3] 在 4 > 2 處違規。', views: [arr([4, 2, 3], { label: 'nums', compare: [0, 1] })] },
  { note: '把 4 降到 2,得到 [2,2,3],只改一個數,因此可行。', views: [arr([2, 2, 3], { label: '修改後', done: [0, 1, 2] })] },
  { note: '若前前項太大,不能降低前一項,只好把當前項提高。例如 [3,4,2] 要把 2 提到 4。', views: [arr([3, 4, 4], { label: '提高當前值', done: [2] })] },
]
const tryFig: FigStep[] = [
  { note: '找到第一個相鄰逆序後,可能只需改其中一個位置:降低左邊或提高右邊。', views: [arr([4, 2, 3], { label: '第一個逆序', compare: [0, 1] })] },
  { note: '各做一份拷貝試一次,只要其中一份全部非遞減就回傳 true。', views: [arr([2, 2, 3], { label: '降低左邊:可行', done: [0, 1, 2] }), arr([4, 4, 3], { label: '提高右邊:仍違規', compare: [1, 2] })] },
]

export const q0665: Solution = {
  id: 665,
  plain: '一排數字要從左到右不下降,最多允許改動其中一個數字。問能不能做到。',
  statement: '給整數陣列 nums,判斷是否能修改至多一個元素,使整個陣列非遞減(每個後項 ≥ 前項)。',
  examples: [{ input: 'nums = [4,2,3]', output: 'true' }, { input: 'nums = [4,2,1]', output: 'false' }],
  constraints: ['陣列至少有 1 個元素,長度最多 10⁴', '可把修改的數字改成任意整數'],
  insight: ['違規只會出現在 nums[i−1] > nums[i] 的相鄰位置。', '優先降低前一項,但若前前項大於當前項,降低會造成新的逆序,只能提高當前項。', '超過一次無法修復的逆序就回傳 false。'],
  approaches: [
    {
      name: '一次掃描貪心修正',
      idea: '遇到逆序時試著讓前一項變小;若會破壞前前項的順序,改把當前項變大。',
      steps: ['複製陣列,changes = 0', '每遇到前一項 > 當前項,changes 加 1;大於 1 就失敗', '若 i < 2 或前前項 ≤ 當前項,降低前一項', '否則提高當前項;掃完回傳 true'],
      figure: { title: '遇到逆序時如何選', steps: greedyFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '只掃一次;為了不改原輸入而複製陣列。若允許原地修改可用 O(1) 額外空間。' },
      verdict: '只需一次掃描;條件「前前項 ≤ 當前項」是關鍵。',
      code: {
        python: `def checkPossibility(nums):
    a = nums[:]
    changes = 0
    for i in range(1, len(a)):
        if a[i - 1] <= a[i]:
            continue
        changes += 1
        if changes > 1:
            return False
        if i < 2 or a[i - 2] <= a[i]:
            a[i - 1] = a[i]
        else:
            a[i] = a[i - 1]
    return True`,
        c: `bool checkPossibility(int *nums, int numsSize) {
    int *a = malloc(numsSize * sizeof(int));
    memcpy(a, nums, numsSize * sizeof(int));
    int changes = 0;
    for (int i = 1; i < numsSize; i++) {
        if (a[i - 1] <= a[i]) continue;
        if (++changes > 1) { free(a); return false; }
        if (i < 2 || a[i - 2] <= a[i]) a[i - 1] = a[i];
        else a[i] = a[i - 1];
    }
    free(a);
    return true;
}`,
        cpp: `bool checkPossibility(vector<int>& nums) {
    vector<int> a = nums;
    int changes = 0;
    for (int i = 1; i < (int)a.size(); i++) {
        if (a[i - 1] <= a[i]) continue;
        if (++changes > 1) return false;
        if (i < 2 || a[i - 2] <= a[i]) a[i - 1] = a[i];
        else a[i] = a[i - 1];
    }
    return true;
}`,
        java: `boolean checkPossibility(int[] nums) {
    int[] a = nums.clone();
    int changes = 0;
    for (int i = 1; i < a.length; i++) {
        if (a[i - 1] <= a[i]) continue;
        if (++changes > 1) return false;
        if (i < 2 || a[i - 2] <= a[i]) a[i - 1] = a[i];
        else a[i] = a[i - 1];
    }
    return true;
}`,
        javascript: `function checkPossibility(nums) {
  const a = [...nums];
  let changes = 0;
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] <= a[i]) continue;
    if (++changes > 1) return false;
    if (i < 2 || a[i - 2] <= a[i]) a[i - 1] = a[i];
    else a[i] = a[i - 1];
  }
  return true;
}`,
      },
    },
    {
      name: '試兩種修改並檢查',
      idea: '找到第一個逆序,各做一份拷貝,分別降低左邊和提高右邊,檢查哪個可行。',
      steps: ['先找第一個 a[i−1] > a[i]', '若沒有逆序,直接回傳 true', '拷貝兩份:一份設 a[i−1] = a[i],另一份設 a[i] = a[i−1]', '逐一檢查兩份是否完整非遞減'],
      figure: { title: '試兩種可能的修法', steps: tryFig },
      complexity: { time: 'O(n)', space: 'O(n)', why: '最多拷貝並掃描兩份陣列。' },
      verdict: '邏輯容易驗證;比貪心版多做兩次完整檢查。',
      code: {
        python: `def checkPossibility(nums):
    i = next((i for i in range(1, len(nums)) if nums[i - 1] > nums[i]), None)
    if i is None:
        return True
    a, b = nums[:], nums[:]
    a[i - 1] = a[i]
    b[i] = b[i - 1]
    return any(all(x[j - 1] <= x[j] for j in range(1, len(x))) for x in (a, b))`,
        c: `static bool sorted665(int *a, int n) {
    for (int i = 1; i < n; i++) if (a[i - 1] > a[i]) return false;
    return true;
}
bool checkPossibility(int *nums, int numsSize) {
    int i = 1;
    while (i < numsSize && nums[i - 1] <= nums[i]) i++;
    if (i == numsSize) return true;
    int *a = malloc(numsSize * sizeof(int)), *b = malloc(numsSize * sizeof(int));
    memcpy(a, nums, numsSize * sizeof(int));
    memcpy(b, nums, numsSize * sizeof(int));
    a[i - 1] = a[i]; b[i] = b[i - 1];
    bool ans = sorted665(a, numsSize) || sorted665(b, numsSize);
    free(a); free(b);
    return ans;
}`,
        cpp: `bool checkPossibility(vector<int>& nums) {
    int i = 1, n = nums.size();
    while (i < n && nums[i - 1] <= nums[i]) i++;
    if (i == n) return true;
    vector<int> a = nums, b = nums;
    a[i - 1] = a[i]; b[i] = b[i - 1];
    return is_sorted(a.begin(), a.end()) || is_sorted(b.begin(), b.end());
}`,
        java: `boolean sorted665(int[] a) {
    for (int i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false;
    return true;
}
boolean checkPossibility(int[] nums) {
    int i = 1;
    while (i < nums.length && nums[i - 1] <= nums[i]) i++;
    if (i == nums.length) return true;
    int[] a = nums.clone(), b = nums.clone();
    a[i - 1] = a[i]; b[i] = b[i - 1];
    return sorted665(a) || sorted665(b);
}`,
        javascript: `function checkPossibility(nums) {
  let i = 1;
  while (i < nums.length && nums[i - 1] <= nums[i]) i++;
  if (i === nums.length) return true;
  const a = [...nums], b = [...nums];
  a[i - 1] = a[i]; b[i] = b[i - 1];
  const sorted = x => x.every((v, j) => j === 0 || x[j - 1] <= v);
  return sorted(a) || sorted(b);
}`,
      },
    },
  ],
  pitfalls: ['「非遞減」允許相等,比較條件是前項 ≤ 後項。', '遇到逆序時不能永遠降低左邊,前前項可能因此變得比它大。', '只改一個值,不能把每個逆序分別修正。'],
  check: { kind: 'fn', fn: 'checkPossibility', cases: [
    { args: [[4, 2, 3]], out: true }, { args: [[4, 2, 1]], out: false },
    { args: [[3, 4, 2, 3]], out: false }, { args: [[3, 4, 2]], out: true },
    { args: [[1, 2, 3]], out: true },
  ] },
}
