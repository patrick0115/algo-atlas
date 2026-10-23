import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 279. Perfect Squares
const dpFig: FigStep[] = [
  { note: '12 可以拆成 4 + 4 + 4,共 3 個平方數。', views: [arr([1, 4, 9], { label: '可用平方數' }), arr([4, 4, 4], { label: '最佳拆法' })] },
  { note: '`dp[x]` 是湊成 x 最少要幾個平方數。最後拿一個 s,剩餘 x−s 已經算好。', views: [arr([0, 1, 2, 3, 1, 2, 3, 4, 2, 1, 2, 3, 3], { label: 'dp[0..12]', done: [12] })] },
]
const bfsFig: FigStep[] = [
  { note: '把餘數當節點,每減去一個平方數就走一條邊。從 12 開始逐層搜尋。', views: [arr([12], { label: '起點' }), arr([11, 8, 3], { label: '減 1、4、9' })] },
  { note: '第一次走到 0 就是最少步數。12 → 8 → 4 → 0,共 3 步。', views: [arr([12, 8, 4, 0], { label: '最短路徑', done: [3] })] },
]

export const q0279: Solution = {
  id: 279,
  plain: '用 1、4、9、16……這些平方數當硬幣,湊出指定數字,問最少要拿幾枚。每種平方數可以重複使用。',
  statement: '給正整數 `n`,找出最少幾個完全平方數相加能等於 n。',
  examples: [{ input: 'n = 12', output: '3', note: '4 + 4 + 4' }, { input: 'n = 13', output: '2', note: '4 + 9' }],
  constraints: ['1 ≤ n ≤ 10,000'],
  insight: ['最後放進的平方數可以是任一個 `s ≤ x`,所以先解較小的 `x−s`。', '和 [322](#/q/322) 零錢兌換相同,只是可用面額是平方數。', '也能把「減掉一個平方數」視為一步,用 BFS 找到 0 的最短距離。'],
  approaches: [
    {
      name: '動態規劃',
      idea: '由小到大計算每個 x 的最小平方數個數。',
      steps: ['`dp[0] = 0`,其他先設為無限大', '對 `x = 1..n`,嘗試所有 `s = k² ≤ x`', '`dp[x] = min(dp[x], dp[x−s]+1)`', '回傳 `dp[n]`'],
      figure: { title: 'n = 12', steps: dpFig },
      complexity: { time: 'O(n√n)', space: 'O(n)', why: '每個 x 最多試 √x 個平方數。' },
      verdict: '狀態和轉移都簡單,是首選。',
      code: {
        python: `def numSquares(n):
    dp = [0] + [n + 1] * n
    for x in range(1, n + 1):
        k = 1
        while k * k <= x:
            dp[x] = min(dp[x], dp[x - k * k] + 1)
            k += 1
    return dp[n]`,
        c: `int numSquares(int n) {
    int *dp = malloc((n + 1) * sizeof(int));
    dp[0] = 0;
    for (int x = 1; x <= n; x++) {
        dp[x] = n + 1;
        for (int k = 1; k * k <= x; k++)
            if (dp[x - k * k] + 1 < dp[x]) dp[x] = dp[x - k * k] + 1;
    }
    int ans = dp[n];
    free(dp);
    return ans;
}`,
        cpp: `int numSquares(int n) {
    vector<int> dp(n + 1, n + 1);
    dp[0] = 0;
    for (int x = 1; x <= n; x++)
        for (int k = 1; k * k <= x; k++) dp[x] = min(dp[x], dp[x - k * k] + 1);
    return dp[n];
}`,
        java: `int numSquares(int n) {
    int[] dp = new int[n + 1];
    Arrays.fill(dp, n + 1);
    dp[0] = 0;
    for (int x = 1; x <= n; x++)
        for (int k = 1; k * k <= x; k++) dp[x] = Math.min(dp[x], dp[x - k * k] + 1);
    return dp[n];
}`,
        javascript: `function numSquares(n) {
  const dp = Array(n + 1).fill(n + 1);
  dp[0] = 0;
  for (let x = 1; x <= n; x++)
    for (let k = 1; k * k <= x; k++) dp[x] = Math.min(dp[x], dp[x - k * k] + 1);
  return dp[n];
}`,
      },
    },
    {
      name: '廣度優先搜尋',
      idea: '從 n 開始每次減去一個平方數,逐層探索餘數;第一次碰到 0 的層數就是答案。',
      steps: ['列出不超過 n 的平方數', '佇列從 n 開始,記錄已訪問餘數', '每層把能減出的新餘數入隊', '出現 0 時回傳目前層數'],
      figure: { title: 'n = 12 的餘數圖', steps: bfsFig },
      complexity: { time: 'O(n√n)', space: 'O(n)', why: '餘數最多 n 種,每種嘗試所有可減平方數。' },
      verdict: '想練最短路徑時很合適;需要額外管理佇列與去重。',
      code: {
        python: `from collections import deque

def numSquares(n):
    q, seen, steps = deque([n]), {n}, 0
    while q:
        steps += 1
        for _ in range(len(q)):
            x = q.popleft()
            for k in range(1, int(x ** 0.5) + 1):
                y = x - k * k
                if y == 0: return steps
                if y not in seen:
                    seen.add(y)
                    q.append(y)`,
        c: `int numSquares(int n) {
    int *q = malloc((n + 1) * sizeof(int));
    bool *seen = calloc(n + 1, sizeof(bool));
    int head = 0, tail = 0, steps = 0;
    q[tail++] = n; seen[n] = true;
    while (head < tail) {
        int end = tail;
        steps++;
        while (head < end) {
            int x = q[head++];
            for (int k = 1; k * k <= x; k++) {
                int y = x - k * k;
                if (!y) { free(q); free(seen); return steps; }
                if (!seen[y]) { seen[y] = true; q[tail++] = y; }
            }
        }
    }
    free(q); free(seen);
    return -1;
}`,
        cpp: `int numSquares(int n) {
    queue<int> q; q.push(n);
    vector<bool> seen(n + 1); seen[n] = true;
    int steps = 0;
    while (!q.empty()) {
        int size = q.size(); steps++;
        while (size--) {
            int x = q.front(); q.pop();
            for (int k = 1; k * k <= x; k++) {
                int y = x - k * k;
                if (!y) return steps;
                if (!seen[y]) { seen[y] = true; q.push(y); }
            }
        }
    }
    return -1;
}`,
        java: `int numSquares(int n) {
    Queue<Integer> q = new ArrayDeque<>();
    boolean[] seen = new boolean[n + 1];
    q.add(n); seen[n] = true;
    int steps = 0;
    while (!q.isEmpty()) {
        int size = q.size(); steps++;
        while (size-- > 0) {
            int x = q.remove();
            for (int k = 1; k * k <= x; k++) {
                int y = x - k * k;
                if (y == 0) return steps;
                if (!seen[y]) { seen[y] = true; q.add(y); }
            }
        }
    }
    return -1;
}`,
        javascript: `function numSquares(n) {
  const q = [n], seen = new Set([n]);
  let head = 0, steps = 0;
  while (head < q.length) {
    const end = q.length; steps++;
    while (head < end) {
      const x = q[head++];
      for (let k = 1; k * k <= x; k++) {
        const y = x - k * k;
        if (y === 0) return steps;
        if (!seen.has(y)) { seen.add(y); q.push(y); }
      }
    }
  }
  return -1;
}`,
      },
    },
  ],
  pitfalls: ['平方數可以重複用,例如 12 = 4 + 4 + 4。', 'BFS 必須在入隊時標記已訪問,避免同一餘數重複入隊。'],
  check: { kind: 'fn', fn: 'numSquares', cases: [
    { args: [12], out: 3 }, { args: [13], out: 2 }, { args: [1], out: 1 }, { args: [43], out: 3 },
  ] },
}
