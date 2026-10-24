import { arr } from '../engine/helpers'
import type { Solution } from './types'

const A = [6, 2, 4]

export const q1130: Solution = {
  id: 1130,
  plain: '葉子順序固定，兩片子樹接起來時要付「各自最大葉子相乘」的費用；求建樹的最小總費用。',
  statement: '給正整數陣列 arr，依序作為二元樹的葉子。每個內部節點的值是左右子樹最大葉值的乘積。求所有內部節點值的最小總和。',
  examples: [{ input: 'arr = [6,2,4]', output: '32' }, { input: 'arr = [4,11]', output: '44' }],
  constraints: ['2 ≤ arr.length ≤ 40，葉值介於 1 到 15。'],
  insight: ['較小葉值最後一定會與左右較近的較小「大鄰居」之一相乘。', '也可用 [[p:interval-dp]] 列舉最後一次合併。'],
  approaches: [
    {
      name: '單調遞減堆疊',
      idea: '遇到更大的值時，把被夾住的小值結算；它乘上左右鄰居中較小的一個。',
      steps: ['堆疊先放無限大哨兵', '逐一讀葉值 x，彈出所有不大於 x 的 mid', '每個 mid 付 mid × min(左邊堆疊頂, x)', '最後把堆疊內剩餘相鄰值依序結算'],
      figure: { title: 'arr = [6,2,4]', steps: [
        { note: '讀 6：它暫留在堆疊，等待右邊的值。', views: [arr([6], { label: '堆疊', highlight: [0] })] },
        { note: '讀 2：比 6 小，繼續留著，堆疊為 6、2。', views: [arr([6, 2], { label: '堆疊', highlight: [1] })] },
        { note: '讀 4：2 被 6 與 4 夾住，選較小的 4，付 2×4=8。', views: [arr([6, 4], { label: '堆疊', highlight: [1] }), arr([8], { label: '費用' })] },
        { note: '最後結算 6×4=24；合計 8+24=32。', views: [arr([8, 24, 32], { label: '兩筆費用 / 總和', done: [2] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個葉值最多進出堆疊各一次。' },
      verdict: '最快；先理解小值何時結算，再記堆疊規則。',
      code: {
        python: `def mctFromLeafValues(arr):
    stack = [float('inf')]
    cost = 0
    for value in arr:
        while stack[-1] <= value:
            middle = stack.pop()
            cost += middle * min(stack[-1], value)  # 小葉與較小的大鄰居合併
        stack.append(value)
    while len(stack) > 2:
        cost += stack.pop() * stack[-1]
    return cost`,
        c: `int mctFromLeafValues(int *arr, int arrSize) {
    int *stack = malloc((arrSize + 1) * sizeof(int));
    int top = 0;
    stack[top++] = INT_MAX;
    int cost = 0;
    for (int i = 0; i < arrSize; i++) {
        int value = arr[i];
        while (stack[top - 1] <= value) {
            int middle = stack[--top];
            int neighbor = stack[top - 1] < value ? stack[top - 1] : value;
            cost += middle * neighbor;
        }
        stack[top++] = value;
    }
    while (top > 2) {
        int middle = stack[--top];
        cost += middle * stack[top - 1];
    }
    free(stack);
    return cost;
}`,
        cpp: `int mctFromLeafValues(vector<int>& arr) {
    vector<int> stack{INT_MAX};
    int cost = 0;
    for (int value : arr) {
        while (stack.back() <= value) {
            int middle = stack.back();
            stack.pop_back();
            cost += middle * min(stack.back(), value);
        }
        stack.push_back(value);
    }
    while (stack.size() > 2) {
        int middle = stack.back();
        stack.pop_back();
        cost += middle * stack.back();
    }
    return cost;
}`,
        java: `int mctFromLeafValues(int[] arr) {
    Deque<Integer> stack = new ArrayDeque<>();
    stack.push(Integer.MAX_VALUE);
    int cost = 0;
    for (int value : arr) {
        while (stack.peek() <= value) {
            int middle = stack.pop();
            cost += middle * Math.min(stack.peek(), value);
        }
        stack.push(value);
    }
    while (stack.size() > 2) {
        cost += stack.pop() * stack.peek();
    }
    return cost;
}`,
        javascript: `function mctFromLeafValues(arr) {
  const stack = [Infinity];
  let cost = 0;
  for (const value of arr) {
    while (stack[stack.length - 1] <= value) {
      const middle = stack.pop();
      cost += middle * Math.min(stack[stack.length - 1], value);
    }
    stack.push(value);
  }
  while (stack.length > 2) {
    cost += stack.pop() * stack[stack.length - 1];
  }
  return cost;
}`,
      },
    },
    {
      name: '區間動態規劃',
      idea: '先算每段的最大葉值，再試每個切點作為左右子樹的最後合併。',
      steps: ['預算 maxLeaf[i][j]', 'dp[i][i] = 0', '按區間長度由小到大計算', 'dp[i][j] = min(dp[i][k] + dp[k+1][j] + maxLeaf[i][k]×maxLeaf[k+1][j])'],
      figure: { title: 'arr = [6,2,4]', steps: [
        { note: '單葉區間不產生內部節點，費用都是 0。', views: [arr([0, 0, 0], { label: '單葉 dp', done: [0, 1, 2] })] },
        { note: '相鄰兩葉：[6,2] 費用 12；[2,4] 費用 8。', views: [arr([12, 8], { label: '長度 2 的區間' })] },
        { note: '最後切在 6 後面，費用 0+8+6×4=32。', views: [arr([32], { label: '切點 0', highlight: [0] })] },
        { note: '最後切在 2 後面，費用 12+0+6×4=36；取較小的 32。', views: [arr([32, 36], { label: '兩種切法', done: [0] })] },
      ] },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '每個區間列舉所有切點。' },
      verdict: '容易驗證正確性，也適合用來理解堆疊法為何能省掉搜尋。',
      code: {
        python: `def mctFromLeafValues(arr):
    n = len(arr)
    maximum = [[0] * n for _ in range(n)]
    dp = [[0] * n for _ in range(n)]
    for i in range(n):
        value = 0
        for j in range(i, n):
            value = max(value, arr[j])
            maximum[i][j] = value
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                candidate = dp[i][k] + dp[k + 1][j] + maximum[i][k] * maximum[k + 1][j]
                dp[i][j] = min(dp[i][j], candidate)  # 枚舉最後合併位置
    return dp[0][n - 1]`,
        c: `int mctFromLeafValues(int *arr, int arrSize) {
    int n = arrSize;
    int maximum[40][40] = {{0}};
    int dp[40][40] = {{0}};
    for (int i = 0; i < n; i++) {
        int value = 0;
        for (int j = i; j < n; j++) {
            if (arr[j] > value) {
                value = arr[j];
            }
            maximum[i][j] = value;
        }
    }
    for (int length = 2; length <= n; length++) {
        for (int i = 0; i + length <= n; i++) {
            int j = i + length - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k < j; k++) {
                int candidate = dp[i][k] + dp[k + 1][j] + maximum[i][k] * maximum[k + 1][j];
                if (candidate < dp[i][j]) {
                    dp[i][j] = candidate;
                }
            }
        }
    }
    return dp[0][n - 1];
}`,
        cpp: `int mctFromLeafValues(vector<int>& arr) {
    int n = arr.size();
    vector<vector<int>> maximum(n, vector<int>(n));
    vector<vector<int>> dp(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        int value = 0;
        for (int j = i; j < n; j++) {
            value = max(value, arr[j]);
            maximum[i][j] = value;
        }
    }
    for (int length = 2; length <= n; length++) {
        for (int i = 0; i + length <= n; i++) {
            int j = i + length - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k < j; k++) {
                int candidate = dp[i][k] + dp[k + 1][j] + maximum[i][k] * maximum[k + 1][j];
                dp[i][j] = min(dp[i][j], candidate);
            }
        }
    }
    return dp[0][n - 1];
}`,
        java: `int mctFromLeafValues(int[] arr) {
    int n = arr.length;
    int[][] maximum = new int[n][n];
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) {
        int value = 0;
        for (int j = i; j < n; j++) {
            value = Math.max(value, arr[j]);
            maximum[i][j] = value;
        }
    }
    for (int length = 2; length <= n; length++) {
        for (int i = 0; i + length <= n; i++) {
            int j = i + length - 1;
            dp[i][j] = Integer.MAX_VALUE;
            for (int k = i; k < j; k++) {
                int candidate = dp[i][k] + dp[k + 1][j] + maximum[i][k] * maximum[k + 1][j];
                dp[i][j] = Math.min(dp[i][j], candidate);
            }
        }
    }
    return dp[0][n - 1];
}`,
        javascript: `function mctFromLeafValues(arr) {
  const n = arr.length;
  const maximum = Array.from({ length: n }, () => new Array(n).fill(0));
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    let value = 0;
    for (let j = i; j < n; j++) {
      value = Math.max(value, arr[j]);
      maximum[i][j] = value;
    }
  }
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length <= n; i++) {
      const j = i + length - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const candidate = dp[i][k] + dp[k + 1][j] + maximum[i][k] * maximum[k + 1][j];
        dp[i][j] = Math.min(dp[i][j], candidate);
      }
    }
  }
  return dp[0][n - 1];
}`,
      },
    },
  ],
  pitfalls: ['堆疊末尾要留下哨兵與一個最大葉值，不能把哨兵拿去相乘。', '區間 DP 的合併費用要用兩個子區間的最大葉值。'],
  check: { kind: 'fn', fn: 'mctFromLeafValues', cases: [
    { args: [A], out: 32 },
    { args: [[4, 11]], out: 44 },
    { args: [[1, 1, 1]], out: 2 },
  ] },
}
