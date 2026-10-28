import { arr } from '../../engine/helpers'
import type { FigStep, HrSolution } from '../types'

const CLOUDS = [0, 0, 1, 0, 0, 1, 0]

function dpFig(): FigStep[] {
  const dp = Array(CLOUDS.length).fill(99)
  const out: FigStep[] = []
  dp[0] = 0
  for (let i = 1; i < CLOUDS.length; i++) {
    if (CLOUDS[i] === 0) {
      if (CLOUDS[i - 1] === 0) dp[i] = Math.min(dp[i], dp[i - 1] + 1)
      if (i >= 2 && CLOUDS[i - 2] === 0) dp[i] = Math.min(dp[i], dp[i - 2] + 1)
    }
    out.push({ note: `到雲 ${i}：${CLOUDS[i] ? '雷雲不能落腳' : `從 i-1 或 i-2 的安全雲取較少跳數，dp[${i}]=${dp[i]}`}。`, views: [arr(CLOUDS, { label: '0 安全／1 雷雲', highlight: [i] }), arr(dp.map(x => x === 99 ? '∞' : x), { label: '最少跳數', highlight: [i] })] })
  }
  return out
}

function greedyFig(): FigStep[] {
  const out: FigStep[] = []
  let pos = 0, jumps = 0
  while (pos < CLOUDS.length - 1) {
    const canTwo = pos + 2 < CLOUDS.length && CLOUDS[pos + 2] === 0
    const next = pos + (canTwo ? 2 : 1)
    jumps++
    out.push({ note: `站在 ${pos}，${canTwo ? `兩格後的 ${next} 安全，所以跳兩格` : `不能跳兩格，改跳到 ${next}`}；累計 ${jumps} 跳。`, views: [arr(CLOUDS, { label: '雲列', highlight: [pos, next], done: [next] }), arr([pos, next, jumps], { label: '起點／落點／跳數' })] })
    pos = next
  }
  return out
}

export const hrJumpingOnTheClouds: HrSolution = {
  slug: 'jumping-on-the-clouds',
  plain: '像走一排踏石，只能跨一格或兩格；標成雷雲的踏石不能踩，問最少跳幾次抵達終點。',
  statement: '陣列 c 以 0 表示安全雲、1 表示雷雲。從索引 0 出發，每次前進 1 或 2 格，落點必須安全；保證終點可達，回傳抵達最後一格所需的最少跳數。',
  examples: [
    { input: 'c = [0,0,1,0,0,1,0]', output: '4', note: '走 0→1→3→4→6，共四跳；索引 2 與 5 不能踩。' },
    { input: 'c = [0,0,0,0,1,0]', output: '3', note: '走 0→2→3→5，共三跳。' },
  ],
  constraints: [
    '雲朵數量至少 2 → 必須至少跳一次。',
    '雲朵數量最多 100 → 動態規劃和貪心都足夠快。',
    '起點與終點是安全雲且保證可達 → 貪心需要跳一格時不會卡死。',
  ],
  insight: [
    '先想「抵達每格最少幾跳」：該格只能由前一格或前兩格而來，因此可做 [[p:dp-1d]]。',
    '每跳的代價都一樣。若能安全跳兩格，比先跳一格更接近終點，而且不會錯過任何必要中繼點。',
    '因此在每個位置都優先跳兩格，否則跳一格，就是更省空間的 [[p:greedy]]。',
  ],
  approaches: [
    {
      name: '逐格記錄最少跳數',
      idea: '用 dp[i] 保存抵達安全雲 i 所需的最少跳數。',
      steps: ['建立長度 n 的 dp，先全填無限大，設 dp[0]=0。', '由左到右處理每格；雷雲直接略過。', '安全雲從安全的 i-1、i-2 取較小 dp，再加 1。', '回傳 dp[n-1]。'],
      figure: { title: '七朵雲的最少跳數表', steps: dpFig() },
      complexity: { time: 'O(n)', space: 'O(n)', why: '每格只看兩個前驅；dp 保留 n 個值。' },
      verdict: '推導清楚，若每格跳躍代價不同也容易擴充。',
      code: {
        python: `def jumpingOnClouds(c):
    dp = [10**9] * len(c)
    dp[0] = 0
    for i in range(1, len(c)):
        if c[i] == 1:
            continue
        if c[i - 1] == 0:
            dp[i] = min(dp[i], dp[i - 1] + 1)
        if i >= 2 and c[i - 2] == 0:
            dp[i] = min(dp[i], dp[i - 2] + 1)  # 從兩格前跳來
    return dp[-1]`,
        c: `int jumpingOnClouds(int c_count, int* c) {
    int* dp = malloc(sizeof(int) * c_count);
    for (int i = 0; i < c_count; i++) dp[i] = 1000000;
    dp[0] = 0;
    for (int i = 1; i < c_count; i++) {
        if (c[i]) continue;
        if (!c[i - 1] && dp[i - 1] + 1 < dp[i]) dp[i] = dp[i - 1] + 1;
        if (i >= 2 && !c[i - 2] && dp[i - 2] + 1 < dp[i]) dp[i] = dp[i - 2] + 1;
    }
    int answer = dp[c_count - 1];
    free(dp);
    return answer;
}`,
        cpp: `int jumpingOnClouds(vector<int> c) {
    vector<int> dp(c.size(), 1000000);
    dp[0] = 0;
    for (int i = 1; i < (int)c.size(); i++) {
        if (c[i]) continue;
        if (!c[i - 1]) dp[i] = min(dp[i], dp[i - 1] + 1);
        if (i >= 2 && !c[i - 2]) dp[i] = min(dp[i], dp[i - 2] + 1);
    }
    return dp.back();
}`,
        java: `public static int jumpingOnClouds(List<Integer> c) {
    int[] dp = new int[c.size()];
    Arrays.fill(dp, 1000000);
    dp[0] = 0;
    for (int i = 1; i < c.size(); i++) {
        if (c.get(i) == 1) continue;
        if (c.get(i - 1) == 0) dp[i] = Math.min(dp[i], dp[i - 1] + 1);
        if (i >= 2 && c.get(i - 2) == 0) dp[i] = Math.min(dp[i], dp[i - 2] + 1);
    }
    return dp[c.size() - 1];
}`,
        javascript: `function jumpingOnClouds(c) {
  const dp = Array(c.length).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i < c.length; i++) {
    if (c[i] === 1) continue;
    if (c[i - 1] === 0) dp[i] = Math.min(dp[i], dp[i - 1] + 1);
    if (i >= 2 && c[i - 2] === 0) dp[i] = Math.min(dp[i], dp[i - 2] + 1);
  }
  return dp[c.length - 1];
}`,
      },
    },
    {
      name: '能跳兩格就跳',
      idea: '每一步先檢查兩格後能否安全落腳，能就選兩格。',
      steps: ['位置 pos=0，跳數 jumps=0。', '在 pos 未到最後一格時，檢查 pos+2 是否在範圍內且安全。', '能跳兩格就 pos+=2，否則 pos+=1；jumps 加一。', '到終點時回傳 jumps。'],
      figure: { title: '七朵雲的貪心跳法', steps: greedyFig() },
      complexity: { time: 'O(n)', space: 'O(1)', why: '位置單調向右，每步至少移動一格；只保留位置和跳數。' },
      verdict: '最佳解；利用每次最多只能跨兩格、每跳代價相同。',
      code: {
        python: `def jumpingOnClouds(c):
    pos = 0
    jumps = 0
    while pos < len(c) - 1:
        if pos + 2 < len(c) and c[pos + 2] == 0:
            pos += 2  # 能跨兩格就優先跨
        else:
            pos += 1
        jumps += 1
    return jumps`,
        c: `int jumpingOnClouds(int c_count, int* c) {
    int pos = 0, jumps = 0;
    while (pos < c_count - 1) {
        if (pos + 2 < c_count && c[pos + 2] == 0) pos += 2;
        else pos++;
        jumps++;
    }
    return jumps;
}`,
        cpp: `int jumpingOnClouds(vector<int> c) {
    int pos = 0, jumps = 0;
    while (pos < (int)c.size() - 1) {
        if (pos + 2 < (int)c.size() && c[pos + 2] == 0) pos += 2;
        else pos++;
        jumps++;
    }
    return jumps;
}`,
        java: `public static int jumpingOnClouds(List<Integer> c) {
    int pos = 0, jumps = 0;
    while (pos < c.size() - 1) {
        if (pos + 2 < c.size() && c.get(pos + 2) == 0) pos += 2;
        else pos++;
        jumps++;
    }
    return jumps;
}`,
        javascript: `function jumpingOnClouds(c) {
  let pos = 0, jumps = 0;
  while (pos < c.length - 1) {
    if (pos + 2 < c.length && c[pos + 2] === 0) pos += 2;
    else pos++;
    jumps++;
  }
  return jumps;
}`,
      },
    },
  ],
  pitfalls: [
    '跳兩格前要先確認索引沒有超出陣列。',
    '雷雲不能當作落點；動態規劃時不要更新雷雲。',
    '答案是跳的次數，不是經過的安全雲數。',
  ],
  check: {
    kind: 'fn',
    fn: 'jumpingOnClouds',
    cases: [
      { args: [[0, 0, 1, 0, 0, 1, 0]], out: 4 },
      { args: [[0, 0, 0, 0, 1, 0]], out: 3 },
      { args: [[0, 0]], out: 1 },
      { args: [[0, 0, 0]], out: 1 },
      { args: [[0, 1, 0]], out: 1 },
      { args: [[0, 0, 0, 0, 0, 0, 0]], out: 3 },
    ],
  },
}
