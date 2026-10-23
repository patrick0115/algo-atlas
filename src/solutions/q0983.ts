import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 983. Minimum Cost For Tickets

const DAYS = [1, 4, 6, 7, 8, 20]
const COSTS = [2, 7, 15]

function dayFig(): FigStep[] {
  const last = DAYS[DAYS.length - 1]
  const dp = Array(last + 1).fill(0)
  const travel = new Set(DAYS)
  for (let d = 1; d <= last; d++) {
    if (!travel.has(d)) dp[d] = dp[d - 1]
    else dp[d] = Math.min(dp[d - 1] + COSTS[0], dp[Math.max(0, d - 7)] + COSTS[1], dp[Math.max(0, d - 30)] + COSTS[2])
  }
  return [
    { note: '票有三種:1 天 2 元、7 天 7 元、30 天 15 元。`dp[d]` = 搞定第 1..d 天的旅行最少花多少', views: [arr(DAYS, { label: '旅行日' }), arr(COSTS, { label: '1 / 7 / 30 天票價' })] },
    { note: '不旅行的日子:dp[d] = dp[d−1]。旅行日:最後一張票是 1 天票 → dp[d−1] + 2;7 天票 → dp[d−7] + 7;30 天票 → dp[d−30] + 15', views: [arr(dp.slice(1, 9), { label: 'dp[1..8]', highlight: [3, 4, 5, 6, 7] })] },
    { note: '第 1 天買 1 天票(2 元)、第 4 天買 7 天票涵蓋 4–10(7 元)、第 20 天買 1 天票(2 元)', views: [arr([2, 7, 2], { label: '購買方式' })] },
    { note: `dp[${last}] = ${dp[last]}`, views: [arr([dp[last]], { label: '答案', done: [0] })] },
  ]
}

function ptrFig(): FigStep[] {
  return [
    { note: '只在旅行日上做 DP:`f[i]` = 從第 i 個旅行日開始,搞定剩下所有旅行的最少花費(由後往前)', views: [arr(DAYS, { label: '旅行日' })] },
    { note: '在第 i 天買 7 天票,下一個要處理的是第一個 ≥ days[i] + 7 的旅行日 j → `f[i] = min(cost + f[j])`。j 用指標或二分搜尋找', views: [arr(DAYS, { label: '從 days[1] = 4 買 7 天票 → 跳到 20', highlight: [1], compare: [5], dim: [2, 3, 4] })] },
  ]
}

export const q0983: Solution = {
  id: 983,
  plain: '一年內有一些日子要搭火車。車票有三種:1 天票、7 天票、30 天票,價格各不同,票從買的那天開始連續有效。怎麼買最省錢?',
  statement: '`days` 是一年中要旅行的日子(遞增,1..365),`costs = [一日票, 七日票, 三十日票]` 的價格。通行證自購買日起連續有效。回傳涵蓋所有旅行日的最低花費。',
  examples: [
    { input: 'days = [1,4,6,7,8,20], costs = [2,7,15]', output: '11' },
    { input: 'days = [1,2,3,4,5,6,7,8,9,10,30,31], costs = [2,7,15]', output: '17' },
  ],
  constraints: ['days.length ≤ 365'],
  insight: ['考慮「最後一張票」買的是哪種 → 三種轉移取最小 → [[p:dp-1d]]', '不旅行的日子不用花錢,直接繼承前一天', '天數只有 365,直接對每一天做 DP 最簡單'],
  approaches: [
    {
      name: '按日曆每天 DP',
      idea: '`dp[d]`:不旅行 → `dp[d−1]`;旅行 → `min(dp[d−1] + c1, dp[d−7] + c7, dp[d−30] + c30)`(負索引當 0)。',
      steps: ['`travel = set(days)`、`dp[0] = 0`', '`for d in 1..days[-1]`', '不在 travel → `dp[d] = dp[d−1]`', '否則取三種票的最小;回傳 `dp[days[-1]]`'],
      figure: { title: `days = [${DAYS}],costs = [${COSTS}]`, steps: dayFig() },
      complexity: { time: 'O(365)', space: 'O(365)', why: '最後一個旅行日之前每天算一次。' },
      verdict: '最推薦,轉移式非常直觀。',
      code: {
        python: `def mincostTickets(days, costs):
    travel = set(days)
    last = days[-1]
    dp = [0] * (last + 1)
    for d in range(1, last + 1):
        if d not in travel:
            dp[d] = dp[d - 1]                 # 這天不用搭車
        else:
            dp[d] = min(dp[d - 1] + costs[0],
                        dp[max(0, d - 7)] + costs[1],
                        dp[max(0, d - 30)] + costs[2])
    return dp[last]`,
        c: `int mincostTickets(int *days, int daysSize, int *costs, int costsSize) {
    int last = days[daysSize - 1], dp[366] = {0};
    bool travel[366] = {false};
    for (int i = 0; i < daysSize; i++) travel[days[i]] = true;
    for (int d = 1; d <= last; d++) {
        if (!travel[d]) { dp[d] = dp[d - 1]; continue; }
        int a = dp[d - 1] + costs[0], b = dp[d > 7 ? d - 7 : 0] + costs[1], c = dp[d > 30 ? d - 30 : 0] + costs[2];
        dp[d] = a < b ? a : b;
        if (c < dp[d]) dp[d] = c;
    }
    return dp[last];
}`,
        cpp: `int mincostTickets(vector<int>& days, vector<int>& costs) {
    int last = days.back();
    vector<int> dp(last + 1, 0);
    vector<bool> travel(last + 1, false);
    for (int d : days) travel[d] = true;
    for (int d = 1; d <= last; d++) {
        if (!travel[d]) { dp[d] = dp[d - 1]; continue; }
        dp[d] = min({dp[d - 1] + costs[0], dp[max(0, d - 7)] + costs[1], dp[max(0, d - 30)] + costs[2]});
    }
    return dp[last];
}`,
        java: `int mincostTickets(int[] days, int[] costs) {
    int last = days[days.length - 1];
    int[] dp = new int[last + 1];
    boolean[] travel = new boolean[last + 1];
    for (int d : days) travel[d] = true;
    for (int d = 1; d <= last; d++) {
        if (!travel[d]) { dp[d] = dp[d - 1]; continue; }
        dp[d] = Math.min(dp[d - 1] + costs[0], Math.min(dp[Math.max(0, d - 7)] + costs[1], dp[Math.max(0, d - 30)] + costs[2]));
    }
    return dp[last];
}`,
        javascript: `function mincostTickets(days, costs) {
  const last = days[days.length - 1], travel = new Set(days), dp = new Array(last + 1).fill(0);
  for (let d = 1; d <= last; d++) {
    if (!travel.has(d)) dp[d] = dp[d - 1];
    else dp[d] = Math.min(dp[d - 1] + costs[0], dp[Math.max(0, d - 7)] + costs[1], dp[Math.max(0, d - 30)] + costs[2]);
  }
  return dp[last];
}`,
      },
    },
    {
      name: '只在旅行日上 DP(由後往前)',
      idea: '`f[i]` = 處理 days[i..] 的最少花費;對三種票各找出第一個不被涵蓋的旅行日 j,`f[i] = min(cost + f[j])`。',
      steps: ['`f[n] = 0`', '`for i in n−1..0`', '每種票 (dur, cost):`j = i`,往後跳到 `days[j] >= days[i] + dur`', '`f[i] = min(cost + f[j])`;回傳 f[0]'],
      figure: { title: `days = [${DAYS}],costs = [${COSTS}]`, steps: ptrFig() },
      complexity: { time: 'O(n · 30)', space: 'O(n)', why: '每種票往後跳最多 30 個旅行日(一天最多一個)。' },
      verdict: '只看旅行日,天數範圍很大時(例如 10⁹)也適用,改用二分搜尋找 j 即可。',
      code: {
        python: `def mincostTickets(days, costs):
    n = len(days)
    f = [0] * (n + 1)
    for i in range(n - 1, -1, -1):
        f[i] = float('inf')
        for dur, cost in zip((1, 7, 30), costs):
            j = i
            while j < n and days[j] < days[i] + dur:
                j += 1                        # 這張票涵蓋到 days[j-1]
            f[i] = min(f[i], cost + f[j])
    return f[0]`,
        c: `int mincostTickets(int *days, int daysSize, int *costs, int costsSize) {
    int n = daysSize, dur[3] = {1, 7, 30};
    int *f = malloc((n + 1) * sizeof(int));
    f[n] = 0;
    for (int i = n - 1; i >= 0; i--) {
        f[i] = INT_MAX;
        for (int k = 0; k < 3; k++) {
            int j = i;
            while (j < n && days[j] < days[i] + dur[k]) j++;
            if (costs[k] + f[j] < f[i]) f[i] = costs[k] + f[j];
        }
    }
    int ans = f[0];
    free(f);
    return ans;
}`,
        cpp: `int mincostTickets(vector<int>& days, vector<int>& costs) {
    int n = days.size(), dur[3] = {1, 7, 30};
    vector<int> f(n + 1, 0);
    for (int i = n - 1; i >= 0; i--) {
        f[i] = INT_MAX;
        for (int k = 0; k < 3; k++) {
            int j = i;
            while (j < n && days[j] < days[i] + dur[k]) j++;
            f[i] = min(f[i], costs[k] + f[j]);
        }
    }
    return f[0];
}`,
        java: `int mincostTickets(int[] days, int[] costs) {
    int n = days.length;
    int[] dur = {1, 7, 30}, f = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        f[i] = Integer.MAX_VALUE;
        for (int k = 0; k < 3; k++) {
            int j = i;
            while (j < n && days[j] < days[i] + dur[k]) j++;
            f[i] = Math.min(f[i], costs[k] + f[j]);
        }
    }
    return f[0];
}`,
        javascript: `function mincostTickets(days, costs) {
  const n = days.length, dur = [1, 7, 30], f = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    f[i] = Infinity;
    for (let k = 0; k < 3; k++) {
      let j = i;
      while (j < n && days[j] < days[i] + dur[k]) j++;
      f[i] = Math.min(f[i], costs[k] + f[j]);
    }
  }
  return f[0];
}`,
      },
    },
  ],
  pitfalls: ['以為 7 天票一定比 7 張 1 天票便宜:價格是輸入給的,要都比較', '`dp[d − 7]` 索引變負數:要和 0 取 max', '貪心「旅行密集就買長票」:不一定最省'],
  check: {
    kind: 'fn',
    fn: 'mincostTickets',
    cases: [
      { args: [DAYS, COSTS], out: 11 },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31], COSTS], out: 17 },
      { args: [[1, 5, 10], [1, 4, 20]], out: 3 },
      { args: [[365], [10, 3, 2]], out: 2 },
    ],
  },
}
