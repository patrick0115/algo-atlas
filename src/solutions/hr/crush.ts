import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const OPS = [[1, 5, 3], [4, 8, 7], [6, 9, 1]]

function directFig(): FigStep[] {
  const a = Array(10).fill(0), out: FigStep[] = []
  for (const [left, right, add] of OPS) {
    for (let i = left - 1; i < right; i++) {
      a[i] += add
      out.push({ note: `操作 [${left},${right}] 加 ${add}：位置 ${i + 1} 現為 ${a[i]}，目前最大 ${Math.max(...a)}。`, views: [arr(a, { label: '逐格加值後', highlight: [i] }), arr([Math.max(...a)], { label: '目前最大值' })] })
    }
  }
  return out
}

function diffFig(): FigStep[] {
  const d = Array(11).fill(0), out: FigStep[] = []
  for (const [left, right, add] of OPS) {
    d[left - 1] += add
    if (right < 10) d[right] -= add
    out.push({ note: `區間 [${left},${right}] 加 ${add}：在起點記 +${add}，終點後記 −${add}；中間暫不碰。`, views: [arr(d.slice(0, 10), { label: '差分', highlight: [left - 1, right].filter(i => i < 10) }), arr([left, right, add], { label: '起點 / 終點 / 增量' })] })
  }
  let run = 0, best = 0
  for (let i = 0; i < 10; i++) {
    run += d[i]
    best = Math.max(best, run)
    out.push({ note: `掃位置 ${i + 1}：前值加差分 ${d[i]} 得 ${run}；最大更新為 ${best}。`, views: [arr(d.slice(0, 10), { label: '差分', highlight: [i] }), arr([run, best], { label: '目前值 / 最大值' })] })
  }
  return out
}

export const hrCrush: HrSolution = {
  slug: 'crush',
  plain: '像替一排座位發補貼：每張單子說從第 a 席到第 b 席都加 k。若只在起點記「開始加」，終點後記「停止加」，最後走一遍就知道每席總額。',
  statement: '先有 n 個值為 0 的位置，編號從 1 開始。每筆查詢 [a,b,k] 使含端點的 a 到 b 都增加 k。全部查詢完成後，回傳陣列中的最大值。',
  examples: [
    { input: 'n = 10, queries = [[1,5,3],[4,8,7],[6,9,1]]', output: '10', note: '第 4、5 格同時得到 3 與 7，總值 10。' },
    { input: 'n = 5, queries = [[1,2,100],[2,5,100],[3,4,100]]', output: '200', note: '第 2、3、4 格各覆蓋兩筆操作，最大 200。' },
  ],
  constraints: [
    'n、查詢數各可達 10^7、2×10^5 → 每筆逐格更新可能遠超時間限制。',
    'a、b 以 1 起算且包含 b → 差分起點索引為 a−1，停止索引為 b。',
    'k 可達 10^9，累加後超過 32 位整數 → 要用 64 位數值；JavaScript Number 在題目上限仍可精確表示。',
  ],
  insight: [
    '逐筆逐格加值完全符合題意，卻會重複掃長區間。',
    '一次區間加法對相鄰差值只改變兩處：區間起點 +k，終點下一格 −k。',
    '所有操作先記在 [[p:difference-array]]，最後做一次 [[p:prefix-sum]] 還原值並同步取最大。',
  ],
  approaches: [
    {
      name: '每筆操作逐格加值',
      idea: '照查詢內容把範圍內每格真的加上 k。',
      steps: ['建立 n 格零陣列。', '每筆 [a,b,k] 走過索引 a−1 到 b−1，逐格加 k。', '全部處理完，掃描陣列取最大值。'],
      figure: { title: 'n = 10，三筆範例操作', steps: directFig() },
      complexity: { time: 'O(n + Σ區間長度)，最壞 O(nq)', space: 'O(n)', why: '每筆會掃自己的整段區間；陣列存 n 格。' },
      verdict: '容易核對，但範圍大時重複更新太多次。',
      code: {
        python: `def arrayManipulation(n, queries):
    values = [0] * n
    for a, b, k in queries:
        for i in range(a - 1, b):
            values[i] += k  # 端點 b 也要加
    return max(values)`,
        c: `long long arrayManipulation(int n, int queries_rows, int queries_columns, int** queries) {
    long long* values = calloc(n, sizeof(long long));
    for (int q = 0; q < queries_rows; q++) {
        for (int i = queries[q][0] - 1; i < queries[q][1]; i++) {
            values[i] += queries[q][2];
        }
    }
    long long best = 0;
    for (int i = 0; i < n; i++) if (values[i] > best) best = values[i];
    free(values);
    return best;
}`,
        cpp: `long long arrayManipulation(int n, vector<vector<int>> queries) {
    vector<long long> values(n, 0);
    for (const auto& q : queries) {
        for (int i = q[0] - 1; i < q[1]; i++) values[i] += q[2];
    }
    return *max_element(values.begin(), values.end());
}`,
        java: `public static long arrayManipulation(int n, List<List<Integer>> queries) {
    long[] values = new long[n];
    for (List<Integer> q : queries) {
        for (int i = q.get(0) - 1; i < q.get(1); i++) {
            values[i] += q.get(2);
        }
    }
    long best = 0;
    for (long value : values) best = Math.max(best, value);
    return best;
}`,
        javascript: `function arrayManipulation(n, queries) {
  const values = Array(n).fill(0);
  for (const [a, b, k] of queries) {
    for (let i = a - 1; i < b; i++) values[i] += k;
  }
  let best = 0;
  for (const v of values) if (v > best) best = v; // n 可達 10^7,不要用 Math.max(...values) 展開
  return best;
}`,
      },
    },
    {
      name: '差分標記，前綴還原',
      idea: '每筆只改區間兩側的差值，最後掃一次還原所有位置。',
      steps: ['建立 n+1 格零差分陣列。', '每筆 [a,b,k] 執行 diff[a−1] += k 與 diff[b] -= k。', '從左向右累加 diff，得到當前格的實際值並更新最大。'],
      figure: { title: 'n = 10，三筆範例操作', steps: diffFig() },
      complexity: { time: 'O(n + q)', space: 'O(n)', why: '每筆只做常數次修改，最後只掃 n 格。' },
      verdict: '能處理大量長區間；同一技巧可對照 LeetCode 1109。',
      code: {
        python: `def arrayManipulation(n, queries):
    diff = [0] * (n + 1)
    for a, b, k in queries:
        diff[a - 1] += k  # 從 a 開始增加
        diff[b] -= k      # b 的下一格停止
    running = 0
    best = 0
    for i in range(n):
        running += diff[i]
        best = max(best, running)
    return best`,
        c: `long long arrayManipulation(int n, int queries_rows, int queries_columns, int** queries) {
    long long* diff = calloc(n + 1, sizeof(long long));
    for (int q = 0; q < queries_rows; q++) {
        diff[queries[q][0] - 1] += queries[q][2];
        diff[queries[q][1]] -= queries[q][2];
    }
    long long running = 0, best = 0;
    for (int i = 0; i < n; i++) {
        running += diff[i];
        if (running > best) best = running;
    }
    free(diff);
    return best;
}`,
        cpp: `long long arrayManipulation(int n, vector<vector<int>> queries) {
    vector<long long> diff(n + 1, 0);
    for (const auto& q : queries) {
        diff[q[0] - 1] += q[2];
        diff[q[1]] -= q[2];
    }
    long long running = 0, best = 0;
    for (int i = 0; i < n; i++) {
        running += diff[i];
        best = max(best, running);
    }
    return best;
}`,
        java: `public static long arrayManipulation(int n, List<List<Integer>> queries) {
    long[] diff = new long[n + 1];
    for (List<Integer> q : queries) {
        diff[q.get(0) - 1] += q.get(2);
        diff[q.get(1)] -= q.get(2);
    }
    long running = 0, best = 0;
    for (int i = 0; i < n; i++) {
        running += diff[i];
        best = Math.max(best, running);
    }
    return best;
}`,
        javascript: `function arrayManipulation(n, queries) {
  const diff = Array(n + 1).fill(0);
  for (const [a, b, k] of queries) {
    diff[a - 1] += k;
    diff[b] -= k;
  }
  let running = 0;
  let best = 0;
  for (let i = 0; i < n; i++) {
    running += diff[i];
    best = Math.max(best, running);
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '查詢使用 1 起算、程式陣列使用 0 起算，左邊界必須減一。',
    '右邊界 b 包含在加值範圍內，所以停止記在 diff[b]。',
    'C/C++/Java 的答案可能超過 int，累加器、差分表、回傳都應是 64 位。',
  ],
  check: {
    kind: 'fn', fn: 'arrayManipulation',
    cases: [
      { args: [10, OPS], out: 10 },
      { args: [5, [[1, 2, 100], [2, 5, 100], [3, 4, 100]]], out: 200 },
      { args: [1, [[1, 1, 7]]], out: 7 },
      { args: [3, [[1, 3, 2]]], out: 2 },
      { args: [3, [[1, 1, 1], [3, 3, 5]]], out: 5 },
      { args: [2, [[1, 2, 1000000000], [1, 2, 1000000000], [1, 2, 1000000000]]], out: 3000000000 },
    ],
  },
}
