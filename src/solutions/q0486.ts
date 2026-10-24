import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 486. Predict the Winner
const A = [1, 5, 2]
const fig = [
  { note: '輪到先手，能拿左端 1 或右端 2；目標是最後分數不低於對手。', views: [arr(A, { label: 'nums', highlight: [0, 2] })] },
  { note: '若先拿 1，剩下 [5,2]；對手會拿 5，先手最後只能再拿 2。', views: [arr([5, 2], { label: '剩餘', highlight: [0] })] },
  { note: '若先拿 2，剩下 [1,5]；對手仍會拿 5。', views: [arr([1, 5], { label: '剩餘', highlight: [1] })] },
  { note: '先拿 2 時分差是 2+1−5=−2，比先拿 1 的 −2 一樣；先手無法打平，答案 false。', views: [arr([-2], { label: '最佳分差', done: [0] })] },
]
const tableFig = [
  { note: '單一數字的區間，當前玩家可全拿：dp[i][i] 分別是 1、5、2。', views: [arr([1, 5, 2], { label: '長度 1' })] },
  { note: '區間 [1,5]：拿 5 比拿 1 好，分差為 5−1=4。', views: [arr([4, 0], { label: '長度 2：[1,5]、[5,2]', highlight: [0] })] },
  { note: '區間 [5,2]：拿 5 後對手拿 2，分差是 3。', views: [arr([4, 3], { label: '長度 2', highlight: [1] })] },
  { note: '整段 [1,5,2]：max(1−3, 2−4)=−2，無法打平。', views: [arr([-2], { label: 'dp[0][2]', done: [0] })] },
]

export const q0486: Solution = {
  id: 486,
  plain: '兩人輪流從數列的左右端拿數字，都會挑對自己最有利的一端；判斷先手能否至少打平。',
  statement: '兩名玩家輪流取 `nums` 最左或最右的一個值，累計各自分數。兩人都做最佳選擇，先手分數大於或等於後手就回傳 true。',
  examples: [{ input: 'nums = [1,5,2]', output: 'false' }, { input: 'nums = [1,5,233,7]', output: 'true' }],
  constraints: ['1 ≤ n ≤ 20；分數可由「我比對手多多少」表示。'],
  insight: ['目前玩家拿左端後，剩下區間的分差會變成對手的優勢；所以要用 `拿到的值 − 剩餘區間分差`。', '狀態是左右邊界，屬於 [[p:interval-dp]]。'],
  approaches: [
    {
      name: '記憶化極小極大搜尋',
      idea: '函式回傳當前玩家相對對手的最佳分差，兩端各試一次。',
      steps: ['只剩一個數時直接拿它。', '拿左端的分差為 `nums[l]−dfs(l+1,r)`。', '拿右端的分差為 `nums[r]−dfs(l,r−1)`。', '取較大者；總分差非負就能贏或打平。'],
      figure: { title: 'nums = [1,5,2]', steps: fig },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '左右邊界共有 O(n²) 個狀態，各算一次。' },
      verdict: '公式直接反映兩人輪流拿的過程。',
      code: {
        python: `from functools import lru_cache

def predictTheWinner(nums):
    @lru_cache(None)
    def dfs(left, right):
        if left == right:
            return nums[left]
        take_left = nums[left] - dfs(left + 1, right)   # 剩下是對手的優勢
        take_right = nums[right] - dfs(left, right - 1)
        return max(take_left, take_right)
    return dfs(0, len(nums) - 1) >= 0`,
        c: `static int solve486(int *a, int left, int right, int **memo, bool **seen) {
    if (left == right) return a[left];
    if (seen[left][right]) return memo[left][right];
    int x = a[left] - solve486(a, left + 1, right, memo, seen);
    int y = a[right] - solve486(a, left, right - 1, memo, seen);
    seen[left][right] = true;
    memo[left][right] = x > y ? x : y;
    return memo[left][right];
}

bool predictTheWinner(int *nums, int numsSize) {
    int **memo = malloc(numsSize * sizeof(int *));
    bool **seen = malloc(numsSize * sizeof(bool *));
    for (int i = 0; i < numsSize; i++) {
        memo[i] = calloc(numsSize, sizeof(int));
        seen[i] = calloc(numsSize, sizeof(bool));
    }
    bool answer = solve486(nums, 0, numsSize - 1, memo, seen) >= 0;
    for (int i = 0; i < numsSize; i++) {
        free(memo[i]);
        free(seen[i]);
    }
    free(memo);
    free(seen);
    return answer;
}`,
        cpp: `bool predictTheWinner(vector<int>& nums) {
    int n = nums.size();
    vector<vector<int>> memo(n, vector<int>(n));
    vector<vector<bool>> seen(n, vector<bool>(n));
    function<int(int, int)> dfs = [&](int l, int r) {
        if (l == r) return nums[l];
        if (seen[l][r]) return memo[l][r];
        seen[l][r] = true;
        return memo[l][r] = max(nums[l] - dfs(l + 1, r), nums[r] - dfs(l, r - 1));
    };
    return dfs(0, n - 1) >= 0;
}`,
        java: `int[][] memo486;
boolean[][] seen486;

int diff486(int[] nums, int left, int right) {
    if (left == right) return nums[left];
    if (seen486[left][right]) return memo486[left][right];
    seen486[left][right] = true;
    int a = nums[left] - diff486(nums, left + 1, right);
    int b = nums[right] - diff486(nums, left, right - 1);
    memo486[left][right] = Math.max(a, b);
    return memo486[left][right];
}

boolean predictTheWinner(int[] nums) {
    memo486 = new int[nums.length][nums.length];
    seen486 = new boolean[nums.length][nums.length];
    return diff486(nums, 0, nums.length - 1) >= 0;
}`,
        javascript: `function predictTheWinner(nums) {
  const memo = Array.from({ length: nums.length }, () => new Array(nums.length));
  function dfs(left, right) {
    if (left === right) return nums[left];
    if (memo[left][right] !== undefined) return memo[left][right];
    const a = nums[left] - dfs(left + 1, right);
    const b = nums[right] - dfs(left, right - 1);
    memo[left][right] = Math.max(a, b);
    return memo[left][right];
  }
  return dfs(0, nums.length - 1) >= 0;
}`,
      },
    },
    {
      name: '由短區間往長區間填表',
      idea: '一維陣列 `dp[l]` 在處理右端 r 時代表區間 [l,r] 的最佳分差。',
      steps: ['單一元素的分差是該值。', '固定右端 r，左端 l 由 r−1 倒著走。', '`dp[l] = max(nums[l]−dp[l+1], nums[r]−dp[l])`。', '最後檢查 `dp[0] >= 0`。'],
      figure: { title: 'nums = [1,5,2]', steps: tableFig },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '處理所有區間，但只保留上一層需要的一列。' },
      verdict: '空間較省；更新順序必須由右往左。',
      code: {
        python: `def predictTheWinner(nums):
    n = len(nums)
    dp = nums[:]
    for right in range(1, n):
        for left in range(right - 1, -1, -1):
            dp[left] = max(nums[left] - dp[left + 1], nums[right] - dp[left])  # 兩端擇優
    return dp[0] >= 0`,
        c: `bool predictTheWinner(int *nums, int numsSize) {
    int *dp = malloc(numsSize * sizeof(int));
    for (int i = 0; i < numsSize; i++) dp[i] = nums[i];
    for (int r = 1; r < numsSize; r++) {
        for (int l = r - 1; l >= 0; l--) {
            int a = nums[l] - dp[l + 1];
            int b = nums[r] - dp[l];
            dp[l] = a > b ? a : b;
        }
    }
    bool answer = dp[0] >= 0;
    free(dp);
    return answer;
}`,
        cpp: `bool predictTheWinner(vector<int>& nums) {
    vector<int> dp = nums;
    for (int r = 1; r < (int)nums.size(); r++) {
        for (int l = r - 1; l >= 0; l--) {
            dp[l] = max(nums[l] - dp[l + 1], nums[r] - dp[l]);
        }
    }
    return dp[0] >= 0;
}`,
        java: `boolean predictTheWinner(int[] nums) {
    int[] dp = nums.clone();
    for (int r = 1; r < nums.length; r++) {
        for (int l = r - 1; l >= 0; l--) {
            dp[l] = Math.max(nums[l] - dp[l + 1], nums[r] - dp[l]);
        }
    }
    return dp[0] >= 0;
}`,
        javascript: `function predictTheWinner(nums) {
  const dp = [...nums];
  for (let r = 1; r < nums.length; r++) {
    for (let l = r - 1; l >= 0; l--) {
      dp[l] = Math.max(nums[l] - dp[l + 1], nums[r] - dp[l]);
    }
  }
  return dp[0] >= 0;
}`,
      },
    },
  ],
  pitfalls: ['打平算先手獲勝，所以條件是分差 ≥ 0。', '不能只挑眼前較大的端點；要考慮對手下一步。'],
  check: { kind: 'fn', fn: 'predictTheWinner', cases: [
    { args: [A], out: false }, { args: [[1, 5, 233, 7]], out: true },
    { args: [[0]], out: true }, { args: [[1, 1]], out: true },
  ] },
}
