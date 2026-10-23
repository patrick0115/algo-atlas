import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 31. Next Permutation
const A = [1, 3, 5, 4, 2]
const fig = [
  { note: '從最右邊比較相鄰數字：4 ≥ 2、5 ≥ 4，都還在遞減後綴內，指標繼續往左。', views: [arr(A, { label: '向左找樞紐', highlight: [2, 3, 4], dim: [0, 1] })] },
  { note: '由右往左，5、4、2 已經遞減；再往左找到 3 < 5，所以 3 是需要變大的位置。', views: [arr(A, { label: 'nums', highlight: [1], dim: [0] })] },
  { note: '在右側找剛好大於 3 的最小值 4，交換成 [1,4,5,3,2]。', views: [arr([1, 4, 5, 3, 2], { label: '交換', highlight: [1, 3] })] },
  { note: '交換後只需整理索引 2 到 4：它們是 5、3、2，升序後才是最接近原排列的較大排列。', views: [arr([1, 4, 5, 3, 2], { label: '待整理後綴', highlight: [2, 3, 4] })] },
  { note: '右側仍遞減，把它反轉為最小排列，得到 [1,4,2,3,5]。', views: [arr([1, 4, 2, 3, 5], { label: '下一個排列', done: [0, 1, 2, 3, 4] })] },
]
const sortFig = [
  ...fig.slice(0, 4),
  { note: '把後綴 [5,3,2] 排序為 [2,3,5]，整列就變成緊接著的 [1,4,2,3,5]。', views: [arr([1,4,2,3,5], { label: '排序後綴的結果', done: [0,1,2,3,4] })] },
]

export const q0031: Solution = {
  id: 31,
  plain: '把一串數字排成字典順序裡緊接著的下一種排法；若已經是最後一種，就回到第一種。',
  statement: '原地修改 nums，成為字典序的下一個排列，不回傳陣列。',
  examples: [{ input: 'nums = [1,2,3]', output: '[1,3,2]' }, { input: 'nums = [3,2,1]', output: '[1,2,3]' }, { input: 'nums = [1,1,5]', output: '[1,5,1]' }],
  constraints: ['1 ≤ nums.length ≤ 100；數字可能重複。', '進階要求 O(1) 額外空間。'],
  insight: ['右側若一路遞減，單靠調整那段無法變大；必須先讓它左邊的一位變大。', '為了「緊接著」，交換後的後綴要盡可能小，因此將遞減後綴反轉。', '與 [[p:two-pointers]] 的雙指針交換技巧相關。'],
  approaches: [
    { name: '排序後綴', idea: '找樞紐並交換，最後把後綴排序成升序。', steps: ['從右找第一個 nums[i] < nums[i+1]。從右側開始搜尋，才能只改動最靠後、影響最小的位置。', '若存在，從右找第一個大於它的值並交換。選擇剛好較大的值，才能避免跳過中間的排列。', '將 i 後方排序；沒有樞紐時排序整列。整理後綴後，整個排列才會是下一個而不是任意較大的排列。'], figure: { title: `nums = [${A}]`, steps: sortFig }, complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序後綴；語言內建排序通常需要額外空間。' }, verdict: '思路直接，但排序做了多餘工作。', code: {
      python: `def nextPermutation(nums):
    i = len(nums) - 2
    while i >= 0 and nums[i] >= nums[i + 1]:  # 由右往左找需要變大的樞紐與交換對象。
        i -= 1
    if i >= 0:  # 找到樞紐後，才需要交換並整理後綴。
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = (nums[j], nums[i])
    nums[i + 1:] = sorted(nums[i + 1:])`,
      c: `static int cmp(const void *a, const void *b) {
    int x = *(int*)a, y = *(int*)b;
    return (x > y) - (x < y);
}
void nextPermutation(int *nums, int n) {
    int i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        int j = n - 1;
        while (nums[j] <= nums[i])
            j--;
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
    }
    qsort(nums + i + 1, n - i - 1, sizeof(int), cmp);
}`,
      cpp: `void nextPermutation(vector<int>& nums) {
    int i = (int)nums.size() - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        int j = nums.size() - 1;
        while (nums[j] <= nums[i])
            j--;
        swap(nums[i], nums[j]);
    }
    sort(nums.begin() + i + 1, nums.end());
}`,
      java: `void nextPermutation(int[] nums) {
    int i = nums.length - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        int j = nums.length - 1;
        while (nums[j] <= nums[i])
            j--;
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
    }
    Arrays.sort(nums, i + 1, nums.length);
}`,
      javascript: `function nextPermutation(nums) {
    let i = nums.length - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        let j = nums.length - 1;
        while (nums[j] <= nums[i])
            j--;
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    const suffix = nums.slice(i + 1).sort((a, b) => a - b);
    nums.splice(i + 1, suffix.length, ...suffix);
}`,
    } },
    { name: '反轉遞減後綴', idea: '後綴本來就由大到小；交換後直接反轉便是由小到大。', steps: ['從右找樞紐 i。從右側開始搜尋，才能只改動最靠後、影響最小的位置。', '從右找剛好大於 nums[i] 的元素交換。選擇剛好較大的值，才能避免跳過中間的排列。', '雙指針反轉 i+1 到結尾。整理後綴後，整個排列才會是下一個而不是任意較大的排列。'], figure: { title: `nums = [${A}]`, steps: fig }, complexity: { time: 'O(n)', space: 'O(1)', why: '只走陣列幾次並原地交換。' }, verdict: '最佳解；要注意全遞減時 i = -1，應反轉整列。', code: {
      python: `def nextPermutation(nums):
    i = len(nums) - 2
    while i >= 0 and nums[i] >= nums[i + 1]:  # 由右往左找需要變大的樞紐與交換對象。
        i -= 1
    if i >= 0:  # 找到樞紐後，才需要交換並整理後綴。
        j = len(nums) - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = (nums[j], nums[i])
    l, r = (i + 1, len(nums) - 1)
    while l < r:
        nums[l], nums[r] = (nums[r], nums[l])
        l += 1
        r -= 1`,
      c: `void nextPermutation(int *nums, int n) {
    int i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        int j = n - 1;
        while (nums[j] <= nums[i])
            j--;
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
    }
    for (int l = i + 1, r = n - 1; l < r; l++, r--) {
        int t = nums[l];
        nums[l] = nums[r];
        nums[r] = t;
    }
}`,
      cpp: `void nextPermutation(vector<int>& nums) {
    int i = (int)nums.size() - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        int j = nums.size() - 1;
        while (nums[j] <= nums[i])
            j--;
        swap(nums[i], nums[j]);
    }
    reverse(nums.begin() + i + 1, nums.end());
}`,
      java: `void nextPermutation(int[] nums) {
    int i = nums.length - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        int j = nums.length - 1;
        while (nums[j] <= nums[i])
            j--;
        int t = nums[i];
        nums[i] = nums[j];
        nums[j] = t;
    }
    for (int l = i + 1, r = nums.length - 1; l < r; l++, r--) {
        int t = nums[l];
        nums[l] = nums[r];
        nums[r] = t;
    }
}`,
      javascript: `function nextPermutation(nums) {
    let i = nums.length - 2;
    while (i >= 0 && nums[i] >= nums[i + 1])
        i--;
    if (i >= 0) {
        let j = nums.length - 1;
        while (nums[j] <= nums[i])
            j--;
        [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    for (let l = i + 1, r = nums.length - 1; l < r; l++, r--)
        [nums[l], nums[r]] = [nums[r], nums[l]];
}`,
    } },
  ],
  pitfalls: ['樞紐比較必須是嚴格小於；重複值不能誤當成上升。', '右側交換對象要找大於樞紐，不是大於等於。', '函式原地修改，沒有回傳值。'],
  check: { kind: 'fn', fn: 'nextPermutation', inplace: 0, cases: [{ args: [[1,2,3]], out: [1,3,2] }, { args: [[3,2,1]], out: [1,2,3] }, { args: [[1,1,5]], out: [1,5,1] }, { args: [A], out: [1,4,2,3,5] }] },
}
