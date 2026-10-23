import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 1049. Last Stone Weight II
const S = [2, 7, 4, 1, 8, 1]

function dpFig(): FigStep[] {
  return [
    { note: '把石頭分成兩堆,最後的重量差就是兩堆總重的差。總重 23,其中一堆盡量接近一半 11。', views: [arr(S, { label: '石頭重量' }), arr([11, 12], { label: '理想分堆' })] },
    { note: '`dp[s]` 表示能否從已看過的石頭選出總重 s。每顆石頭只能用一次,所以 s 必須由大到小更新。', views: [arr([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], { label: '考慮的重量 0..11' })] },
    { note: '可以湊到 11,另一堆是 12,答案為 12 − 11 = 1。', views: [arr([11, 12, 1], { label: '兩堆與差值', done: [2] })] },
  ]
}

function setFig(): FigStep[] {
  return [
    { note: '也能直接保存「目前能湊出的所有重量」。每加入一顆 w,把每個舊重量 s 對應的 s + w 加進新集合。', views: [arr([0], { label: '起點' }), arr([0, 2], { label: '加入 2' }), arr([0, 2, 7, 9], { label: '再加入 7' })] },
    { note: '最後從不超過總重一半的重量中挑最大的,一樣得到差值 1。', views: [arr([11, 12, 1], { label: '答案', done: [2] })] },
  ]
}

export const q1049: Solution = {
  id: 1049,
  plain: '兩顆石頭互撞會留下重量差。想像把所有石頭分成兩隊互相抵消,兩隊重量越接近,最後剩下的石頭就越輕。',
  statement: '給正整數陣列 `stones`,每次選兩顆石頭相撞,相同則都消失,不同則留下重量差。求可能留下的最小重量。',
  examples: [
    { input: 'stones = [2,7,4,1,8,1]', output: '1' },
    { input: 'stones = [31,26,33,21,40]', output: '5' },
  ],
  constraints: ['石頭數 ≤ 30,每顆重量 ≤ 100;總重最多 3000'],
  insight: ['碰撞的結果可寫成每顆重量加或減,等價於分成兩堆並最小化重量差。', '設總重為 T,只需找不超過 T/2 的最大可達子集合重量 s;答案是 T − 2s。', '每顆只能選一次,這是 [[p:knapsack]]。'],
  approaches: [
    {
      name: '一維 0/1 背包',
      idea: '布林陣列記錄可湊出的重量,由大到小更新,最後從 T/2 往回找第一個可達值。',
      steps: ['`T = sum(stones)`,容量 `cap = floor(T/2)`', '`dp[0] = true`', '每顆 w:令 `s` 從 cap 遞減至 w,更新 `dp[s] |= dp[s−w]`', '找最大的可達 s,回傳 `T − 2s`'],
      figure: { title: 'stones = [2,7,4,1,8,1]', steps: dpFig() },
      complexity: { time: 'O(nT)', space: 'O(T)', why: '每顆石頭掃描至多一半總重。' },
      verdict: '容量不大時最直接,而且空間固定。',
      code: {
        python: `def lastStoneWeightII(stones):
    total = sum(stones)
    cap = total // 2
    dp = [False] * (cap + 1)
    dp[0] = True
    for w in stones:
        for s in range(cap, w - 1, -1):
            dp[s] |= dp[s - w]
    for s in range(cap, -1, -1):
        if dp[s]:
            return total - 2 * s`,
        c: `int lastStoneWeightII(int *stones, int stonesSize) {
    int total = 0;
    for (int i = 0; i < stonesSize; i++) total += stones[i];
    int cap = total / 2;
    bool *dp = calloc(cap + 1, sizeof(bool));
    dp[0] = true;
    for (int i = 0; i < stonesSize; i++)
        for (int s = cap; s >= stones[i]; s--) dp[s] |= dp[s - stones[i]];
    int ans = total;
    for (int s = cap; s >= 0; s--) if (dp[s]) { ans = total - 2 * s; break; }
    free(dp);
    return ans;
}`,
        cpp: `int lastStoneWeightII(vector<int>& stones) {
    int total = accumulate(stones.begin(), stones.end(), 0), cap = total / 2;
    vector<bool> dp(cap + 1);
    dp[0] = true;
    for (int w : stones)
        for (int s = cap; s >= w; s--) dp[s] = dp[s] || dp[s - w];
    for (int s = cap; s >= 0; s--) if (dp[s]) return total - 2 * s;
    return total;
}`,
        java: `int lastStoneWeightII(int[] stones) {
    int total = 0;
    for (int w : stones) total += w;
    int cap = total / 2;
    boolean[] dp = new boolean[cap + 1];
    dp[0] = true;
    for (int w : stones)
        for (int s = cap; s >= w; s--) dp[s] |= dp[s - w];
    for (int s = cap; s >= 0; s--) if (dp[s]) return total - 2 * s;
    return total;
}`,
        javascript: `function lastStoneWeightII(stones) {
  const total = stones.reduce((a, b) => a + b, 0), cap = Math.floor(total / 2);
  const dp = Array(cap + 1).fill(false);
  dp[0] = true;
  for (const w of stones)
    for (let s = cap; s >= w; s--) dp[s] ||= dp[s - w];
  for (let s = cap; s >= 0; s--) if (dp[s]) return total - 2 * s;
  return total;
}`,
      },
    },
    {
      name: '可達重量集合',
      idea: '保存所有可達的子集合重量,每讀一顆石頭就把它加到既有的每個重量上。',
      steps: ['從 `{0}` 開始', '每顆 w:對舊集合裡的 s,加入 `s+w`', '找最接近 T/2 的可達重量', '回傳兩堆重量差'],
      figure: { title: '逐顆擴展可達重量', steps: setFig() },
      complexity: { time: 'O(nT)', space: 'O(T)', why: '集合最多包含 0..T 的重量。' },
      verdict: '寫法直觀,能清楚看到所有可達和;通常比布林陣列多一些集合操作成本。',
      code: {
        python: `def lastStoneWeightII(stones):
    possible = {0}
    for w in stones:
        possible |= {s + w for s in possible}
    total = sum(stones)
    return min(abs(total - 2 * s) for s in possible)`,
        c: `int lastStoneWeightII(int *stones, int stonesSize) {
    int total = 0;
    for (int i = 0; i < stonesSize; i++) total += stones[i];
    bool *possible = calloc(total + 1, sizeof(bool));
    possible[0] = true;
    int seen = 0;
    for (int i = 0; i < stonesSize; i++) {
        int w = stones[i];
        for (int s = seen; s >= 0; s--) if (possible[s]) possible[s + w] = true;
        seen += w;
    }
    int ans = total;
    for (int s = 0; s <= total; s++) if (possible[s] && abs(total - 2 * s) < ans) ans = abs(total - 2 * s);
    free(possible);
    return ans;
}`,
        cpp: `int lastStoneWeightII(vector<int>& stones) {
    unordered_set<int> possible = {0};
    int total = 0;
    for (int w : stones) {
        total += w;
        auto next = possible;
        for (int s : possible) next.insert(s + w);
        possible.swap(next);
    }
    int ans = total;
    for (int s : possible) ans = min(ans, abs(total - 2 * s));
    return ans;
}`,
        java: `int lastStoneWeightII(int[] stones) {
    Set<Integer> possible = new HashSet<>();
    possible.add(0);
    int total = 0;
    for (int w : stones) {
        total += w;
        Set<Integer> next = new HashSet<>(possible);
        for (int s : possible) next.add(s + w);
        possible = next;
    }
    int ans = total;
    for (int s : possible) ans = Math.min(ans, Math.abs(total - 2 * s));
    return ans;
}`,
        javascript: `function lastStoneWeightII(stones) {
  let possible = new Set([0]);
  let total = 0;
  for (const w of stones) {
    total += w;
    const next = new Set(possible);
    for (const s of possible) next.add(s + w);
    possible = next;
  }
  return Math.min(...[...possible].map(s => Math.abs(total - 2 * s)));
}`,
      },
    },
  ],
  pitfalls: ['一維 0/1 背包要由大到小更新,由小到大會把同一顆石頭重複選取。', '目標是讓兩堆接近,不是單純湊到某個指定重量。'],
  check: { kind: 'fn', fn: 'lastStoneWeightII', cases: [
    { args: [S], out: 1 }, { args: [[31, 26, 33, 21, 40]], out: 5 }, { args: [[1]], out: 1 }, { args: [[1, 1]], out: 0 },
  ] },
}
