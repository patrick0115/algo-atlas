import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [1, 15, 7, 9, 2, 5, 10]
const topFig: FigStep[] = [
  { note: '從索引 0 開始，第一段可取 1、2 或 3 個數；選 [1,15,7] 時，三格都改為最大值 15，先得到 45。', views: [arr(A, { label: 'arr', highlight: [0, 1, 2] }), arr([45], { label: '第一段得分' })] },
  { note: '遞迴處理索引 3 之後。若下一段只取 [9]，得到 9，剩下從索引 4 繼續算。', views: [arr(A, { label: 'arr', done: [0, 1, 2], highlight: [3] })] },
  { note: '剩下 [2,5,10] 作一段，最大值 10 乘三格是 30；這條分割總和 45+9+30=84。', views: [arr(A, { label: 'arr', highlight: [4, 5, 6] }), arr([45, 9, 30], { label: '各段得分' })] },
  { note: '每個起點的最佳尾端答案只算一次並快取；比較所有切法後回傳 84。', views: [arr([84], { label: '答案', done: [0] })] },
]
const bottomFig: FigStep[] = [
  { note: 'dp[i] 代表前 i 個數的最大總和。dp[0]=0；只有 [1] 時 dp[1]=1。', views: [arr([0, 1], { label: 'dp' })] },
  { note: '前 3 個數可整段 [1,15,7]，得 15×3=45，所以 dp[3]=45。', views: [arr(A, { label: 'arr', highlight: [0, 1, 2] }), arr([0, 1, 30, 45], { label: 'dp' })] },
  { note: '到索引 3 的 9 時，可在 dp[3] 後接單格 [9]，dp[4]=54；繼續測試不同段長。', views: [arr([0, 1, 30, 45, 54], { label: 'dp', highlight: [4] })] },
  { note: '最後從 dp[4]=54 接 [2,5,10] 的 30，得到 dp[7]=84。', views: [arr([54, 30, 84], { label: '前段 / 最後一段 / 答案', done: [2] })] },
]

export const q1043: Solution = {
  id: 1043,
  plain: '把數列切成很多段，每段最多 k 格；每格都變成該段最大值，想讓改完後的總和最高。',
  statement: '給 arr 與 k。將 arr 分割為連續、非空、長度不超過 k 的子陣列；每段所有值替換為該段最大值。回傳可得的最大總和。',
  examples: [{ input: 'arr = [1,15,7,9,2,5,10], k = 3', output: '84' }, { input: 'arr = [1,4,1,5,7,3,6,1,9,9,3], k = 4', output: '83' }],
  constraints: ['arr 長度至多 500，k 至多 arr 長度。', '每個切點只需嘗試最後一段的 1..k 種長度。'],
  insight: ['若第一段長度固定，得分是段內最大值乘長度，剩下部分又是相同問題。', '用 [[p:dp-1d]] 記住每個起點或前綴長度的最佳答案，可避免反覆枚舉同一後綴。'],
  approaches: [
    {
      name: '遞迴加備忘錄', idea: 'solve(i) 是從索引 i 到結尾的最佳得分；嘗試下一段的所有合法長度。',
      steps: ['到結尾時回傳 0。', '從 i 向右試至多 k 格，同時更新這段最大值。', '候選值是段長×段最大值 + solve(下一位置)。', '快取 solve(i) 的最大值。'],
      figure: { title: 'arr = [1,15,7,9,2,5,10], k = 3', steps: topFig },
      complexity: { time: 'O(nk)', space: 'O(n)', why: '每個起點只算一次，每次試至多 k 種段長。' },
      verdict: '由問題定義直接推到遞迴式，容易理解。',
      code: {
        python: `from functools import cache

def maxSumAfterPartitioning(arr, k):
    @cache
    def solve(start):
        if start == len(arr):
            return 0
        best = 0
        maximum = 0
        for end in range(start, min(len(arr), start + k)):
            maximum = max(maximum, arr[end])  # 維持這一段最大值
            length = end - start + 1
            best = max(best, maximum * length + solve(end + 1))
        return best

    return solve(0)`,
        c: `static int solve1043(int *arr, int n, int k, int start, int *memo) {
    if (start == n) {
        return 0;
    }
    if (memo[start] >= 0) {
        return memo[start];
    }
    int maximum = 0;
    int best = 0;
    for (int end = start; end < n && end < start + k; end++) {
        if (arr[end] > maximum) {
            maximum = arr[end];
        }
        int candidate = maximum * (end - start + 1) + solve1043(arr, n, k, end + 1, memo);
        if (candidate > best) {
            best = candidate;
        }
    }
    memo[start] = best;
    return best;
}

int maxSumAfterPartitioning(int *arr, int arrSize, int k) {
    int *memo = malloc(arrSize * sizeof(int));
    for (int i = 0; i < arrSize; i++) {
        memo[i] = -1;
    }
    int answer = solve1043(arr, arrSize, k, 0, memo);
    free(memo);
    return answer;
}`,
        cpp: `int maxSumAfterPartitioning(vector<int>& arr, int k) {
    int n = arr.size();
    vector<int> memo(n, -1);
    function<int(int)> solve = [&](int start) {
        if (start == n) {
            return 0;
        }
        if (memo[start] >= 0) {
            return memo[start];
        }
        int maximum = 0;
        int best = 0;
        for (int end = start; end < n && end < start + k; end++) {
            maximum = max(maximum, arr[end]);
            best = max(best, maximum * (end - start + 1) + solve(end + 1));
        }
        return memo[start] = best;
    };
    return solve(0);
}`,
        java: `int solve(int[] arr, int k, int start, int[] memo) {
    if (start == arr.length) {
        return 0;
    }
    if (memo[start] >= 0) {
        return memo[start];
    }
    int maximum = 0;
    int best = 0;
    for (int end = start; end < arr.length && end < start + k; end++) {
        maximum = Math.max(maximum, arr[end]);
        best = Math.max(best, maximum * (end - start + 1) + solve(arr, k, end + 1, memo));
    }
    memo[start] = best;
    return best;
}

int maxSumAfterPartitioning(int[] arr, int k) {
    int[] memo = new int[arr.length];
    Arrays.fill(memo, -1);
    return solve(arr, k, 0, memo);
}`,
        javascript: `function maxSumAfterPartitioning(arr, k) {
  const memo = new Array(arr.length).fill(-1);
  function solve(start) {
    if (start === arr.length) {
      return 0;
    }
    if (memo[start] >= 0) {
      return memo[start];
    }
    let maximum = 0;
    let best = 0;
    for (let end = start; end < arr.length && end < start + k; end++) {
      maximum = Math.max(maximum, arr[end]);
      best = Math.max(best, maximum * (end - start + 1) + solve(end + 1));
    }
    memo[start] = best;
    return best;
  }
  return solve(0);
}`,
      },
    },
    {
      name: '從左到右的 DP', idea: 'dp[i] 是前 i 個元素的最佳總和；枚舉最後一段長度。',
      steps: ['dp[0]=0。', '對每個右端，往左試最多 k 個元素，維持這段最大值。', '用 dp[段起點]+段長×最大值 更新 dp[右端+1]。'],
      figure: { title: 'arr = [1,15,7,9,2,5,10], k = 3', steps: bottomFig },
      complexity: { time: 'O(nk)', space: 'O(n)', why: '每個右端檢查至多 k 種最後一段長度。' },
      verdict: '推薦解法，沒有遞迴深度問題。',
      code: {
        python: `def maxSumAfterPartitioning(arr, k):
    dp = [0] * (len(arr) + 1)
    for end in range(1, len(arr) + 1):
        maximum = 0
        for length in range(1, min(k, end) + 1):
            maximum = max(maximum, arr[end - length])  # 最後一段的最大值
            dp[end] = max(dp[end], dp[end - length] + maximum * length)
    return dp[-1]`,
        c: `int maxSumAfterPartitioning(int *arr, int arrSize, int k) {
    int *dp = calloc(arrSize + 1, sizeof(int));
    for (int end = 1; end <= arrSize; end++) {
        int maximum = 0;
        for (int length = 1; length <= k && length <= end; length++) {
            if (arr[end - length] > maximum) {
                maximum = arr[end - length];
            }
            int candidate = dp[end - length] + maximum * length;
            if (candidate > dp[end]) {
                dp[end] = candidate;
            }
        }
    }
    int answer = dp[arrSize];
    free(dp);
    return answer;
}`,
        cpp: `int maxSumAfterPartitioning(vector<int>& arr, int k) {
    vector<int> dp(arr.size() + 1);
    for (int end = 1; end <= (int) arr.size(); end++) {
        int maximum = 0;
        for (int length = 1; length <= k && length <= end; length++) {
            maximum = max(maximum, arr[end - length]);
            dp[end] = max(dp[end], dp[end - length] + maximum * length);
        }
    }
    return dp.back();
}`,
        java: `int maxSumAfterPartitioning(int[] arr, int k) {
    int[] dp = new int[arr.length + 1];
    for (int end = 1; end <= arr.length; end++) {
        int maximum = 0;
        for (int length = 1; length <= k && length <= end; length++) {
            maximum = Math.max(maximum, arr[end - length]);
            dp[end] = Math.max(dp[end], dp[end - length] + maximum * length);
        }
    }
    return dp[arr.length];
}`,
        javascript: `function maxSumAfterPartitioning(arr, k) {
  const dp = new Array(arr.length + 1).fill(0);
  for (let end = 1; end <= arr.length; end++) {
    let maximum = 0;
    for (let length = 1; length <= k && length <= end; length++) {
      maximum = Math.max(maximum, arr[end - length]);
      dp[end] = Math.max(dp[end], dp[end - length] + maximum * length);
    }
  }
  return dp[arr.length];
}`,
      },
    },
  ],
  pitfalls: ['每段必須連續，而且長度不可超過 k。', '段的得分是最大值乘段長，不是段內原始數值總和。'],
  check: { kind: 'fn', fn: 'maxSumAfterPartitioning', cases: [
    { args: [A, 3], out: 84 },
    { args: [[1, 4, 1, 5, 7, 3, 6, 1, 9, 9, 3], 4], out: 83 },
    { args: [[1], 1], out: 1 },
  ] },
}
