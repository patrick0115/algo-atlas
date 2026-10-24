import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1248. Count Number of Nice Subarrays
const A = [1, 1, 2, 1, 1]

function prefixFig(): FigStep[] {
  return [
    { note: '先把問題改成「子陣列裡恰好有 3 個奇數」。掃描前，奇數前綴和是 0，出現過 1 次。', views: [arr(A, { label: 'nums' }), arr([1], { label: '前綴和 0 的次數' })] },
    { note: '讀到前兩個 1，奇數數量變成 2；還沒有能配對的「目前總數減 3」。', views: [arr(A, { label: 'nums', done: [0, 1] }), arr([0, 1, 2], { label: '奇數前綴和' })] },
    { note: '讀到 2，奇數數量仍是 2，但前綴和 2 多出一個起點；偶數也能改變子陣列的起點。', views: [arr(A, { label: 'nums', done: [0, 1, 2] }), arr([0, 1, 2, 2], { label: '奇數前綴和' })] },
    { note: '讀到第四格的 1，總數是 3。找舊前綴和 0，得到 1 個漂亮子陣列。', views: [arr(A, { label: 'nums', highlight: [3] }), arr([0, 1, 2, 2, 3], { label: '奇數前綴和', compare: [0], highlight: [4] })] },
    { note: '最後一個 1 使總數變 4；舊前綴和 1 有 1 次，因此答案變 2。', views: [arr(A, { label: 'nums', done: [0, 1, 2, 3, 4] }), arr([2], { label: '答案', done: [0] })] },
  ]
}

function windowFig(): FigStep[] {
  return [
    { note: '計算「至多 3 個奇數」的子陣列數，再扣掉「至多 2 個」。剩下的才是恰好 3 個。', views: [arr(A, { label: 'nums' })] },
    { note: '至多 3 個時，右端走到索引 3，左端仍在 0；以這格結尾的 4 個起點都合法。', views: [arr(A, { label: '至多 3', done: [0, 1, 2, 3] })] },
    { note: '右端走到索引 4，有 4 個奇數，左端移過第一個 1；合法起點是 1 到 4，共 4 個。', views: [arr(A, { label: '至多 3', dim: [0], done: [1, 2, 3, 4] })] },
    { note: '完整掃描後，至多 3 的數量是 14，至多 2 是 12；相減得到 2。', views: [arr([14, 12, 2], { label: '至多 3 / 至多 2 / 恰好 3', done: [2] })] },
  ]
}

export const q1248: Solution = {
  id: 1248,
  plain: '找出陣列中有多少段連續區間，裡面剛好有 k 個奇數。',
  statement: '給定整數陣列 `nums` 和整數 `k`。若一段非空連續子陣列恰好含有 `k` 個奇數，稱為漂亮子陣列；回傳其數量。',
  examples: [
    { input: 'nums = [1,1,2,1,1], k = 3', output: '2' },
    { input: 'nums = [2,4,6], k = 1', output: '0' },
    { input: 'nums = [2,2,2,1,2,2], k = 1', output: '12' },
  ],
  constraints: ['1 ≤ nums.length ≤ 5·10⁴', '1 ≤ k ≤ nums.length', '1 ≤ nums[i] ≤ 10⁵'],
  insight: ['把每個數字當作奇數 1、偶數 0，問題變成子陣列和恰好為 k。', '目前前綴和為 s，任何先前的 `s-k` 都能當起點。', '另一種想法是「恰好 k = 至多 k − 至多 k−1」。'],
  approaches: [
    {
      name: '前綴和與次數表',
      idea: '記住每個奇數前綴和出現幾次。掃到新位置時，累加先前 `sum-k` 的次數。',
      steps: ['`count[0] = 1`，空前綴也是一個起點', '逐一讀取 x；奇數讓 `sum` 加 1', '把 `count[sum-k]` 加進答案', '再增加 `count[sum]`，供後面的右端點使用'],
      figure: { title: 'nums = [1,1,2,1,1], k = 3', steps: prefixFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '掃描一次；前綴和只有 0 到 n。' },
      verdict: '最容易直接看出「恰好 k」的來源，也是 [[p:prefix-sum]] 的典型用法。',
      code: {
        python: `def numberOfSubarrays(nums, k):
    count = [0] * (len(nums) + 1)
    count[0] = 1                         # 空前綴可當起點
    odd = ans = 0
    for x in nums:
        odd += x % 2                     # 只累計奇數個數
        if odd >= k:
            ans += count[odd - k]        # 找到所有合法起點
        count[odd] += 1
    return ans`,
        c: `int numberOfSubarrays(int *nums, int numsSize, int k) {
    int *count = calloc(numsSize + 1, sizeof(int));
    count[0] = 1;
    int odd = 0;
    int ans = 0;
    for (int i = 0; i < numsSize; i++) {
        odd += nums[i] % 2;
        if (odd >= k) {
            ans += count[odd - k];
        }
        count[odd]++;
    }
    free(count);
    return ans;
}`,
        cpp: `int numberOfSubarrays(vector<int>& nums, int k) {
    vector<int> count(nums.size() + 1);
    count[0] = 1;
    int odd = 0;
    int ans = 0;
    for (int x : nums) {
        odd += x % 2;
        if (odd >= k) {
            ans += count[odd - k];
        }
        count[odd]++;
    }
    return ans;
}`,
        java: `int numberOfSubarrays(int[] nums, int k) {
    int[] count = new int[nums.length + 1];
    count[0] = 1;
    int odd = 0;
    int ans = 0;
    for (int x : nums) {
        odd += x % 2;
        if (odd >= k) {
            ans += count[odd - k];
        }
        count[odd]++;
    }
    return ans;
}`,
        javascript: `function numberOfSubarrays(nums, k) {
  const count = Array(nums.length + 1).fill(0);
  count[0] = 1;
  let odd = 0;
  let ans = 0;
  for (const x of nums) {
    odd += x % 2;
    if (odd >= k) {
      ans += count[odd - k];
    }
    count[odd]++;
  }
  return ans;
}`,
      },
    },
    {
      name: '兩次滑動視窗',
      idea: '先寫一個 `atMost(t)` 計算至多 t 個奇數的子陣列數，再回傳 `atMost(k)-atMost(k-1)`。',
      steps: ['對固定 t，設左端 `left=0`、奇數數 `odd=0`', '右端逐格前進，奇數就使 odd 加 1', '當 odd 超過 t，移動左端直到合法', '以目前右端結尾的合法區間有 `right-left+1` 個；做兩次相減'],
      figure: { title: 'nums = [1,1,2,1,1], k = 3', steps: windowFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '每次視窗的左右端都只往前走。' },
      verdict: '不需要額外陣列；也能套用到「恰好 k 種不同數字」等 [[p:sliding-window]] 問題。',
      code: {
        python: `def numberOfSubarrays(nums, k):
    def at_most(limit):
        left = odd = total = 0
        for right, x in enumerate(nums):
            odd += x % 2
            while odd > limit:
                odd -= nums[left] % 2    # 左端移出視窗
                left += 1
            total += right - left + 1    # 固定右端的合法起點數
        return total

    return at_most(k) - at_most(k - 1)`,
        c: `static int atMostOdd(int *nums, int size, int limit) {
    int left = 0;
    int odd = 0;
    int total = 0;
    for (int right = 0; right < size; right++) {
        odd += nums[right] % 2;
        while (odd > limit) {
            odd -= nums[left] % 2;
            left++;
        }
        total += right - left + 1;
    }
    return total;
}

int numberOfSubarrays(int *nums, int numsSize, int k) {
    return atMostOdd(nums, numsSize, k) - atMostOdd(nums, numsSize, k - 1);
}`,
        cpp: `int numberOfSubarrays(vector<int>& nums, int k) {
    auto atMost = [&](int limit) {
        int left = 0;
        int odd = 0;
        int total = 0;
        for (int right = 0; right < (int)nums.size(); right++) {
            odd += nums[right] % 2;
            while (odd > limit) {
                odd -= nums[left] % 2;
                left++;
            }
            total += right - left + 1;
        }
        return total;
    };
    return atMost(k) - atMost(k - 1);
}`,
        java: `int numberOfSubarrays(int[] nums, int k) {
    return atMostOdd(nums, k) - atMostOdd(nums, k - 1);
}

int atMostOdd(int[] nums, int limit) {
    int left = 0;
    int odd = 0;
    int total = 0;
    for (int right = 0; right < nums.length; right++) {
        odd += nums[right] % 2;
        while (odd > limit) {
            odd -= nums[left] % 2;
            left++;
        }
        total += right - left + 1;
    }
    return total;
}`,
        javascript: `function numberOfSubarrays(nums, k) {
  function atMost(limit) {
    let left = 0;
    let odd = 0;
    let total = 0;
    for (let right = 0; right < nums.length; right++) {
      odd += nums[right] % 2;
      while (odd > limit) {
        odd -= nums[left] % 2;
        left++;
      }
      total += right - left + 1;
    }
    return total;
  }
  return atMost(k) - atMost(k - 1);
}`,
      },
    },
  ],
  pitfalls: ['前綴和次數要在計算答案後才增加，才只會取到較早的起點。', '偶數不會改變奇數總數，但會產生另一個起點，仍須記錄。', '「至多 k」不能直接當作「恰好 k」。'],
  check: {
    kind: 'fn', fn: 'numberOfSubarrays',
    cases: [
      { args: [A, 3], out: 2 },
      { args: [[2, 4, 6], 1], out: 0 },
      { args: [[2, 2, 2, 1, 2, 2], 1], out: 12 },
      { args: [[1], 1], out: 1 },
      { args: [[2, 2], 2], out: 0 },
    ],
  },
}
