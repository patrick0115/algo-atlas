import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [3, 1, 2, 4]

function bruteFig(): FigStep[] {
  return [
    { note: '固定左端 3，往右延伸：[3] 最小 3；[3,1]、[3,1,2]、[3,1,2,4] 的最小都是 1，這組共 6。', views: [arr(A, { label: '起點 3', highlight: [0] })] },
    { note: '固定左端 1，三個子陣列 [1]、[1,2]、[1,2,4] 的最小值都是 1，加入 3。', views: [arr(A, { label: '起點 1', highlight: [1] })] },
    { note: '固定左端 2，[2] 與 [2,4] 的最小值都是 2，加入 4。', views: [arr(A, { label: '起點 2', highlight: [2] })] },
    { note: '最後 [4] 加 4；總和 6+3+4+4=17。', views: [arr([6, 3, 4, 4], { label: '各起點貢獻', done: [0, 1, 2, 3] })] },
  ]
}

function stackFig(): FigStep[] {
  return [
    { note: '改問每個值能當多少個子陣列的最小值。堆疊保持值嚴格遞增；先放索引 0（值 3）。', views: [arr(A, { label: 'arr', highlight: [0] }), arr([3], { label: '堆疊值' })] },
    { note: '看到 1，彈出 3。它左邊沒有更小值、右界是 1，只負責 [3]：貢獻 3。', views: [arr(A, { label: 'arr', highlight: [1], done: [0] }), arr([1], { label: '堆疊值' })] },
    { note: '2、4 依序入堆疊。掃描結束後，用尾端哨兵依序結算 4 的貢獻 4、2 的貢獻 4。', views: [arr(A, { label: 'arr', done: [0], highlight: [2, 3] }), arr([1, 2, 4], { label: '待結算' })] },
    { note: '最後結算 1：左可選 2 個起點、右可選 3 個終點，貢獻 1×2×3=6。總和 3+4+4+6=17。', views: [arr([3, 6, 4, 4], { label: '各值貢獻', done: [0, 1, 2, 3] })] },
  ]
}

export const q0907: Solution = {
  id: 907,
  plain: '列出每個連續子陣列，取其中最小值，再把這些最小值加總。',
  statement: '給正整數陣列 arr，求所有非空連續子陣列的最小值之和，答案對 1,000,000,007 取餘數。',
  examples: [{ input: 'arr = [3,1,2,4]', output: '17' }, { input: 'arr = [11,81,94,43,3]', output: '444' }],
  constraints: ['`1 ≤ arr.length ≤ 3 × 10⁴`', '`1 ≤ arr[i] ≤ 3 × 10⁴`'],
  insight: ['直接列舉左右端點，延伸右端時維持目前最小值。', '更快的角度：對每個位置計算它是幾個子陣列的最小值。用 [[p:monotonic-stack]] 找左側嚴格較小與右側小於等於的邊界，重複值只會被分配一次。'],
  approaches: [
    {
      name: '固定左端，逐步延伸右端',
      idea: '每次把右端多延伸一格，更新目前子陣列最小值並加到答案。',
      steps: ['對每個左端 i，令目前最小值為正無窮。', '右端 j 從 i 走到尾端，更新最小值。', '把每個最小值加到答案並取模。'],
      figure: { title: 'arr = [3,1,2,4]', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(1)', why: '共有 n(n+1)/2 個子陣列，除了答案只用常數變數。' },
      verdict: '適合核對小範例，但 n=30000 時不夠快。',
      code: {
        python: `def sumSubarrayMins(arr):
    mod = 1_000_000_007
    answer = 0
    for left in range(len(arr)):
        minimum = float('inf')
        for right in range(left, len(arr)):
            minimum = min(minimum, arr[right])  # 延伸一格就更新最小值
            answer = (answer + minimum) % mod
    return answer`,
        c: `int sumSubarrayMins(int *arr, int arrSize) {
    const int mod = 1000000007;
    long long answer = 0;
    for (int left = 0; left < arrSize; left++) {
        int minimum = INT_MAX;
        for (int right = left; right < arrSize; right++) {
            if (arr[right] < minimum) {
                minimum = arr[right];
            }
            answer = (answer + minimum) % mod;
        }
    }
    return (int)answer;
}`,
        cpp: `int sumSubarrayMins(vector<int>& arr) {
    const int mod = 1000000007;
    long long answer = 0;
    for (int left = 0; left < (int)arr.size(); left++) {
        int minimum = INT_MAX;
        for (int right = left; right < (int)arr.size(); right++) {
            minimum = min(minimum, arr[right]);
            answer = (answer + minimum) % mod;
        }
    }
    return (int)answer;
}`,
        java: `int sumSubarrayMins(int[] arr) {
    final int mod = 1000000007;
    long answer = 0;
    for (int left = 0; left < arr.length; left++) {
        int minimum = Integer.MAX_VALUE;
        for (int right = left; right < arr.length; right++) {
            minimum = Math.min(minimum, arr[right]);
            answer = (answer + minimum) % mod;
        }
    }
    return (int) answer;
}`,
        javascript: `function sumSubarrayMins(arr) {
  const mod = 1000000007;
  let answer = 0;
  for (let left = 0; left < arr.length; left++) {
    let minimum = Infinity;
    for (let right = left; right < arr.length; right++) {
      minimum = Math.min(minimum, arr[right]);
      answer = (answer + minimum) % mod;
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '單調堆疊計算每個值的貢獻',
      idea: '遇到小於等於堆疊頂端的新值，就知道頂端的右邊界；彈出時用左右可選範圍計算貢獻。',
      steps: ['堆疊放索引，維持對應值嚴格遞增。', '掃描新值，若它小於等於頂端，彈出 mid。', '令 left 為彈出後頂端或 −1；加上 `arr[mid]×(mid−left)×(i−mid)`。', '尾端加一個哨兵，把剩餘索引全部結算。'],
      figure: { title: 'arr = [3,1,2,4]', steps: stackFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每個索引最多入堆疊和出堆疊各一次。' },
      verdict: '把所有子陣列分配給唯一的最小值位置；相等值的邊界規則不可混用。',
      code: {
        python: `def sumSubarrayMins(arr):
    mod = 1_000_000_007
    stack = []
    answer = 0
    for i in range(len(arr) + 1):
        while stack and (i == len(arr) or arr[stack[-1]] >= arr[i]):
            mid = stack.pop()
            left = stack[-1] if stack else -1
            answer += arr[mid] * (mid - left) * (i - mid)  # 左右選法相乘
            answer %= mod
        stack.append(i)  # 尾端索引只是哨兵
    return answer`,
        c: `int sumSubarrayMins(int *arr, int arrSize) {
    const long long mod = 1000000007;
    int *stack = malloc((arrSize + 1) * sizeof(int));
    int top = 0;
    long long answer = 0;
    for (int i = 0; i <= arrSize; i++) {
        while (top > 0 && (i == arrSize || arr[stack[top - 1]] >= arr[i])) {
            int mid = stack[--top];
            int left = top > 0 ? stack[top - 1] : -1;
            long long ways = (long long)(mid - left) * (i - mid);
            answer = (answer + ways * arr[mid]) % mod;
        }
        stack[top++] = i;
    }
    free(stack);
    return (int)answer;
}`,
        cpp: `int sumSubarrayMins(vector<int>& arr) {
    const long long mod = 1000000007;
    vector<int> stack;
    long long answer = 0;
    for (int i = 0; i <= (int)arr.size(); i++) {
        while (!stack.empty() && (i == (int)arr.size() || arr[stack.back()] >= arr[i])) {
            int mid = stack.back();
            stack.pop_back();
            int left = stack.empty() ? -1 : stack.back();
            long long ways = (long long)(mid - left) * (i - mid);
            answer = (answer + ways * arr[mid]) % mod;
        }
        stack.push_back(i);
    }
    return (int)answer;
}`,
        java: `int sumSubarrayMins(int[] arr) {
    final long mod = 1000000007;
    int[] stack = new int[arr.length + 1];
    int top = 0;
    long answer = 0;
    for (int i = 0; i <= arr.length; i++) {
        while (top > 0 && (i == arr.length || arr[stack[top - 1]] >= arr[i])) {
            int mid = stack[--top];
            int left = top > 0 ? stack[top - 1] : -1;
            long ways = (long)(mid - left) * (i - mid);
            answer = (answer + ways * arr[mid]) % mod;
        }
        stack[top++] = i;
    }
    return (int) answer;
}`,
        javascript: `function sumSubarrayMins(arr) {
  const mod = 1000000007;
  const stack = [];
  let answer = 0;
  for (let i = 0; i <= arr.length; i++) {
    while (stack.length && (i === arr.length || arr[stack[stack.length - 1]] >= arr[i])) {
      const mid = stack.pop();
      const left = stack.length ? stack[stack.length - 1] : -1;
      answer = (answer + arr[mid] * (mid - left) * (i - mid)) % mod;
    }
    stack.push(i);
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['相等值需要固定一邊先結算；此版用 `>=` 彈出，使右邊界可等於。', '乘積可能很大，C/C++/Java 用 64 位整數；JavaScript 的單次乘積在本題限制內仍小於安全整數。'],
  check: { kind: 'fn', fn: 'sumSubarrayMins', cases: [{ args: [A], out: 17 }, { args: [[11, 81, 94, 43, 3]], out: 444 }, { args: [[2, 2]], out: 6 }, { args: [[1]], out: 1 }] },
}
