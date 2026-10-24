import type { Solution } from './types'

// 174. Dungeon Game
const D = [[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]
const view = (cells: number[][], label: string) => ({ kind: 'grid' as const, label, cells })
const F = [
  { note: '從終點往回算：公主格是 −5，進入時至少要有 6 點血，扣 5 後還剩 1。', views: [view([[0, 0, 0], [0, 0, 0], [0, 0, 6]], '最低入格血量')] },
  { note: '終點上方是 +1，只需帶 5 點，走下去能以 6 點進入終點。', views: [view([[0, 0, 0], [0, 0, 5], [0, 0, 6]], '由下往上')] },
  { note: '終點左方是 +30，只需 1 點；往左上推時，每格選右、下所需血量較少的方向。', views: [view([[0, 0, 0], [0, 0, 5], [1, 1, 6]], '底排')] },
  { note: '全部倒推後，起點入格至少要 7 點；每格需求都不能低於 1。', views: [view([[7, 5, 2], [6, 11, 5], [1, 1, 6]], '完整需求')] },
]
const G = [
  { note: '只保留目前這一排的需求；先從右下角算出 6。', views: [view([[0, 0, 6]], 'dp')] },
  { note: '往左算底排：+30、+10 都讓需求降到最低的 1。', views: [view([[1, 1, 6]], 'dp')] },
  { note: '移到中排，每格可沿用下方需求，並與右方需求比較。', views: [view([[6, 11, 5]], 'dp')] },
  { note: '算完頂排，dp[0] = 7，就是最少初始血量。', views: [view([[7, 5, 2]], 'dp')] },
]

export const q0174: Solution = {
  id: 174,
  plain: '騎士從左上角走到右下角救公主，只能往右或往下；每格會扣血或補血，求出發時至少要有多少血。',
  statement: '進入每格後立刻加上 `dungeon[r][c]`，過程中血量必須一直大於 0。求能到達右下角的最小初始血量。',
  examples: [{ input: 'dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]', output: '7' }, { input: 'dungeon = [[0]]', output: '1' }],
  constraints: ['1 ≤ 列、欄 ≤ 200；初始與途中血量至少為 1。'],
  insight: ['從起點往前走，單靠「目前最小需求」無法判斷，因為未來的大補血可能改變最佳路線。', '從終點倒推每格**進入前至少需要的血量**，就是 [[p:dp-grid]]。'],
  approaches: [
    {
      name: '二維倒推 DP',
      idea: '下一步走向右或下，選所需血量較少的路；扣除目前格子的補扣血。',
      steps: ['終點需求是 `max(1, 1−dungeon[end])`。', '倒序掃每格，取右、下需求的較小者。', '目前需求 `max(1, 下一格需求−目前格數值)`。'],
      figure: { title: 'dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]', steps: F },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每格計算一次並保存完整需求表。' },
      verdict: '狀態意義最清楚，適合先學。',
      code: {
        python: `def calculateMinimumHP(dungeon):
    m, n = len(dungeon), len(dungeon[0])
    need = [[float('inf')] * (n + 1) for _ in range(m + 1)]
    need[m][n - 1] = need[m - 1][n] = 1  # 終點外的虛擬出口
    for r in range(m - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            need[r][c] = max(1, min(need[r + 1][c], need[r][c + 1]) - dungeon[r][c])
    return need[0][0]`,
        c: `int calculateMinimumHP(int **dungeon, int dungeonSize, int *dungeonColSize) {
    int m = dungeonSize, n = dungeonColSize[0];
    int **need = malloc((m + 1) * sizeof(int *));
    for (int r = 0; r <= m; r++) {
        need[r] = malloc((n + 1) * sizeof(int));
        for (int c = 0; c <= n; c++) need[r][c] = INT_MAX;
    }
    need[m][n - 1] = 1;
    need[m - 1][n] = 1;
    for (int r = m - 1; r >= 0; r--) {
        for (int c = n - 1; c >= 0; c--) {
            int next = need[r + 1][c] < need[r][c + 1] ? need[r + 1][c] : need[r][c + 1];
            int value = next - dungeon[r][c];
            need[r][c] = value > 1 ? value : 1;
        }
    }
    int answer = need[0][0];
    for (int r = 0; r <= m; r++) free(need[r]);
    free(need);
    return answer;
}`,
        cpp: `int calculateMinimumHP(vector<vector<int>>& dungeon) {
    int m = dungeon.size(), n = dungeon[0].size();
    vector<vector<int>> need(m + 1, vector<int>(n + 1, INT_MAX));
    need[m][n - 1] = need[m - 1][n] = 1;
    for (int r = m - 1; r >= 0; r--) {
        for (int c = n - 1; c >= 0; c--) {
            need[r][c] = max(1, min(need[r + 1][c], need[r][c + 1]) - dungeon[r][c]);
        }
    }
    return need[0][0];
}`,
        java: `int calculateMinimumHP(int[][] dungeon) {
    int m = dungeon.length, n = dungeon[0].length;
    int[][] need = new int[m + 1][n + 1];
    for (int[] row : need) Arrays.fill(row, Integer.MAX_VALUE);
    need[m][n - 1] = need[m - 1][n] = 1;
    for (int r = m - 1; r >= 0; r--) {
        for (int c = n - 1; c >= 0; c--) {
            need[r][c] = Math.max(1, Math.min(need[r + 1][c], need[r][c + 1]) - dungeon[r][c]);
        }
    }
    return need[0][0];
}`,
        javascript: `function calculateMinimumHP(dungeon) {
  const m = dungeon.length, n = dungeon[0].length;
  const need = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(Infinity));
  need[m][n - 1] = need[m - 1][n] = 1;
  for (let r = m - 1; r >= 0; r--) {
    for (let c = n - 1; c >= 0; c--) {
      need[r][c] = Math.max(1, Math.min(need[r + 1][c], need[r][c + 1]) - dungeon[r][c]);
    }
  }
  return need[0][0];
}`,
      },
    },
    {
      name: '一維倒推 DP',
      idea: '處理同一排時，`dp[c]` 是下方需求，`dp[c+1]` 是右方需求。',
      steps: ['建立 n+1 格需求，全部先設無窮大。', '從最下排、最右格倒序走。', '每格用 `min(dp[c], dp[c+1])` 更新。'],
      figure: { title: '逐排壓縮需求', steps: G },
      complexity: { time: 'O(mn)', space: 'O(n)', why: '只存一排及右側哨兵。' },
      verdict: '時間相同，省下整張表的空間。',
      code: {
        python: `def calculateMinimumHP(dungeon):
    m, n = len(dungeon), len(dungeon[0])
    need = [float('inf')] * (n + 1)
    need[n - 1] = 1                    # 終點下方的虛擬出口
    for r in range(m - 1, -1, -1):
        for c in range(n - 1, -1, -1):
            need[c] = max(1, min(need[c], need[c + 1]) - dungeon[r][c])
    return need[0]`,
        c: `int calculateMinimumHP(int **dungeon, int dungeonSize, int *dungeonColSize) {
    int m = dungeonSize, n = dungeonColSize[0];
    int *need = malloc((n + 1) * sizeof(int));
    for (int c = 0; c <= n; c++) need[c] = INT_MAX;
    need[n - 1] = 1;
    for (int r = m - 1; r >= 0; r--) {
        for (int c = n - 1; c >= 0; c--) {
            int next = need[c] < need[c + 1] ? need[c] : need[c + 1];
            int value = next - dungeon[r][c];
            need[c] = value > 1 ? value : 1;
        }
    }
    int answer = need[0];
    free(need);
    return answer;
}`,
        cpp: `int calculateMinimumHP(vector<vector<int>>& dungeon) {
    int m = dungeon.size(), n = dungeon[0].size();
    vector<int> need(n + 1, INT_MAX);
    need[n - 1] = 1;
    for (int r = m - 1; r >= 0; r--) {
        for (int c = n - 1; c >= 0; c--) {
            need[c] = max(1, min(need[c], need[c + 1]) - dungeon[r][c]);
        }
    }
    return need[0];
}`,
        java: `int calculateMinimumHP(int[][] dungeon) {
    int m = dungeon.length, n = dungeon[0].length;
    int[] need = new int[n + 1];
    Arrays.fill(need, Integer.MAX_VALUE);
    need[n - 1] = 1;
    for (int r = m - 1; r >= 0; r--) {
        for (int c = n - 1; c >= 0; c--) {
            need[c] = Math.max(1, Math.min(need[c], need[c + 1]) - dungeon[r][c]);
        }
    }
    return need[0];
}`,
        javascript: `function calculateMinimumHP(dungeon) {
  const m = dungeon.length, n = dungeon[0].length;
  const need = new Array(n + 1).fill(Infinity);
  need[n - 1] = 1;
  for (let r = m - 1; r >= 0; r--) {
    for (let c = n - 1; c >= 0; c--) {
      need[c] = Math.max(1, Math.min(need[c], need[c + 1]) - dungeon[r][c]);
    }
  }
  return need[0];
}`,
      },
    },
  ],
  pitfalls: ['血量等於 0 已經死亡，最低需求是 1。', '二維表在終點外要設虛擬出口 1，其餘越界方向要是無窮大。'],
  check: { kind: 'fn', fn: 'calculateMinimumHP', cases: [
    { args: [D], out: 7 }, { args: [[[0]]], out: 1 }, { args: [[[-3, 5]]], out: 4 },
  ] },
}
