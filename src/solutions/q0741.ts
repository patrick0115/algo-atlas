import { arr } from '../engine/helpers'
import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

const G = [[0, 1, -1], [1, 0, -1], [1, 1, 1]]

function board(first: [number, number], second: [number, number], label: string): GridViewData {
  return {
    kind: 'grid',
    label,
    cells: G,
    marks: {
      hl: [first],
      cmp: first[0] === second[0] && first[1] === second[1] ? [] : [second],
      wall: [[0, 2], [1, 2]],
    },
  }
}

function pairFig(): FigStep[] {
  return [
    { note: '把「去程再回程」想成兩人同時從左上往右下。起點 (0,0) 沒櫻桃，累計 0。', views: [board([0, 0], [0, 0], '實心是甲，外框是乙；變淡格不可走'), arr([0], { label: '櫻桃' })] },
    { note: '第 1 步，甲到 (0,1) 摘 1 顆，乙到 (1,0) 摘 1 顆，合計 2。', views: [board([0, 1], [1, 0], '第 1 步'), arr([2], { label: '累計' })] },
    { note: '第 2 步，甲到 (1,1) 沒櫻桃，乙到 (2,0) 摘 1 顆，合計 3。', views: [board([1, 1], [2, 0], '第 2 步'), arr([3], { label: '累計' })] },
    { note: '第 3 步兩人在 (2,1) 相遇，只能摘同一顆一次；最後 (2,2) 再摘一顆，總共 5。', views: [board([2, 1], [2, 1], '第 3 步同格'), board([2, 2], [2, 2], '終點'), arr([5], { label: '答案' })] },
  ]
}

function bottomFig(): FigStep[] {
  return [
    { note: '兩人同時走了 t 步時，列 r 就決定欄 c = t − r；狀態只需記 t、甲列、乙列。', views: [board([0, 0], [0, 0], 't = 0'), arr([0, 0, 0], { label: 't / 甲列 / 乙列' })] },
    { note: 't = 1 時，可選甲在 (0,1)、乙在 (1,0)，這格狀態的櫻桃數是 2。', views: [board([0, 1], [1, 0], 't = 1'), arr([2], { label: '最高收穫' })] },
    { note: 't = 2，甲 (1,1)、乙 (2,0) 的狀態可由上一格轉移，累計 3。荊棘格 -1 不進入 DP。', views: [board([1, 1], [2, 0], 't = 2'), arr([3], { label: '最高收穫' })] },
    { note: 't = 3 相遇只加一次 (2,1)；t = 4 到終點再加 (2,2)，最後答案 5。', views: [board([2, 1], [2, 1], 't = 3'), board([2, 2], [2, 2], 't = 4'), arr([5], { label: '答案' })] },
  ]
}

export const q0741: Solution = {
  id: 741,
  plain: '從網格左上走到右下，再走回左上，沿路摘最多櫻桃；每格只能摘一次，障礙不能走。',
  statement: 'grid 的 1 是櫻桃，0 是空格，-1 是障礙。去程只能向右或向下，回程只能向左或向上。求最多可摘幾顆；無法完成往返則回傳 0。',
  examples: [
    { input: 'grid = [[0,1,-1],[1,0,-1],[1,1,1]]', output: '5' },
    { input: 'grid = [[1,1,-1],[1,-1,1],[-1,1,1]]', output: '0' },
  ],
  constraints: ['網格為 n × n，1 ≤ n ≤ 50；格子值只有 -1、0、1。'],
  insight: ['將回程路徑反向看，等於有兩人同時從左上走向右下。', '兩人每一步的步數相同，所以第二人的欄可由第一人的列欄和第二人的列推得。'],
  approaches: [
    {
      name: '雙人同步 DFS 加記憶化',
      idea: '狀態用（甲列、甲欄、乙列），兩人各自走右或下，從四種下一步中取最大。',
      steps: ['根據共同步數算出乙欄。越界或踩到障礙時回傳不可行。', '本步收穫是兩格之和；若兩人同格則只加一次。', '遞迴試四種移動組合，記錄每個狀態的最高收穫。', '無可行路線時回傳 0。'],
      figure: { title: '兩人同步走過範例網格', steps: pairFig() },
      complexity: { time: 'O(n³)', space: 'O(n³)', why: '可行狀態至多 n³，每格只試四種移動。' },
      verdict: '把往返轉成同步雙人，是理解此題的關鍵。',
      code: {
        python: `from functools import lru_cache

def cherryPickup(grid):
    n = len(grid)
    impossible = -10**9

    @lru_cache(None)
    def search(r1, c1, r2):
        c2 = r1 + c1 - r2            # 兩人走的步數相同
        if r1 >= n or c1 >= n or r2 >= n or c2 < 0 or c2 >= n:
            return impossible
        if grid[r1][c1] == -1 or grid[r2][c2] == -1:
            return impossible
        cherries = grid[r1][c1]
        if r1 != r2 or c1 != c2:
            cherries += grid[r2][c2]  # 同格只摘一次
        if r1 == n - 1 and c1 == n - 1:
            return cherries
        next_best = max(search(r1 + 1, c1, r2 + 1),
                        search(r1 + 1, c1, r2),
                        search(r1, c1 + 1, r2 + 1),
                        search(r1, c1 + 1, r2))
        return cherries + next_best

    return max(0, search(0, 0, 0))`,
        c: `static int cherrySearch(int **grid, int n, int r1, int c1, int r2, int *memo) {
    int c2 = r1 + c1 - r2;
    if (r1 >= n || c1 >= n || r2 >= n || c2 < 0 || c2 >= n) {
        return -100000000;
    }
    if (grid[r1][c1] == -1 || grid[r2][c2] == -1) {
        return -100000000;
    }
    int index = (r1 * n + c1) * n + r2;
    if (memo[index] != INT_MIN) {
        return memo[index];
    }
    int cherries = grid[r1][c1];
    if (r1 != r2 || c1 != c2) {
        cherries += grid[r2][c2];
    }
    if (r1 == n - 1 && c1 == n - 1) {
        return memo[index] = cherries;
    }
    int best = cherrySearch(grid, n, r1 + 1, c1, r2 + 1, memo);
    int option = cherrySearch(grid, n, r1 + 1, c1, r2, memo);
    if (option > best) {
        best = option;
    }
    option = cherrySearch(grid, n, r1, c1 + 1, r2 + 1, memo);
    if (option > best) {
        best = option;
    }
    option = cherrySearch(grid, n, r1, c1 + 1, r2, memo);
    if (option > best) {
        best = option;
    }
    return memo[index] = cherries + best;
}

int cherryPickup(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize;
    int *memo = malloc(n * n * n * sizeof(int));
    for (int i = 0; i < n * n * n; i++) {
        memo[i] = INT_MIN;
    }
    int answer = cherrySearch(grid, n, 0, 0, 0, memo);
    free(memo);
    return answer > 0 ? answer : 0;
}`,
        cpp: `int cherryPickup(vector<vector<int>>& grid) {
    int n = grid.size();
    const int impossible = -100000000;
    vector<vector<vector<int>>> memo(n, vector<vector<int>>(n, vector<int>(n, INT_MIN)));
    function<int(int, int, int)> search = [&](int r1, int c1, int r2) {
        int c2 = r1 + c1 - r2;
        if (r1 >= n || c1 >= n || r2 >= n || c2 < 0 || c2 >= n) {
            return impossible;
        }
        if (grid[r1][c1] == -1 || grid[r2][c2] == -1) {
            return impossible;
        }
        int& result = memo[r1][c1][r2];
        if (result != INT_MIN) {
            return result;
        }
        int cherries = grid[r1][c1];
        if (r1 != r2 || c1 != c2) {
            cherries += grid[r2][c2];
        }
        if (r1 == n - 1 && c1 == n - 1) {
            return result = cherries;
        }
        int best = max({search(r1 + 1, c1, r2 + 1), search(r1 + 1, c1, r2),
                        search(r1, c1 + 1, r2 + 1), search(r1, c1 + 1, r2)});
        return result = cherries + best;
    };
    return max(0, search(0, 0, 0));
}`,
        java: `int[][] grid;
int[][][] memo;
int n;

int search(int r1, int c1, int r2) {
    int c2 = r1 + c1 - r2;
    if (r1 >= n || c1 >= n || r2 >= n || c2 < 0 || c2 >= n) {
        return -100000000;
    }
    if (grid[r1][c1] == -1 || grid[r2][c2] == -1) {
        return -100000000;
    }
    if (memo[r1][c1][r2] != Integer.MIN_VALUE) {
        return memo[r1][c1][r2];
    }
    int cherries = grid[r1][c1];
    if (r1 != r2 || c1 != c2) {
        cherries += grid[r2][c2];
    }
    if (r1 == n - 1 && c1 == n - 1) {
        return memo[r1][c1][r2] = cherries;
    }
    int best = Math.max(search(r1 + 1, c1, r2 + 1), search(r1 + 1, c1, r2));
    best = Math.max(best, search(r1, c1 + 1, r2 + 1));
    best = Math.max(best, search(r1, c1 + 1, r2));
    return memo[r1][c1][r2] = cherries + best;
}

int cherryPickup(int[][] grid) {
    this.grid = grid;
    n = grid.length;
    memo = new int[n][n][n];
    for (int[][] layer : memo) {
        for (int[] row : layer) {
            Arrays.fill(row, Integer.MIN_VALUE);
        }
    }
    return Math.max(0, search(0, 0, 0));
}`,
        javascript: `function cherryPickup(grid) {
  const n = grid.length;
  const impossible = -100000000;
  const memo = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => new Array(n).fill(null)));
  function search(r1, c1, r2) {
    const c2 = r1 + c1 - r2;
    if (r1 >= n || c1 >= n || r2 >= n || c2 < 0 || c2 >= n) {
      return impossible;
    }
    if (grid[r1][c1] === -1 || grid[r2][c2] === -1) {
      return impossible;
    }
    if (memo[r1][c1][r2] !== null) {
      return memo[r1][c1][r2];
    }
    let cherries = grid[r1][c1];
    if (r1 !== r2 || c1 !== c2) {
      cherries += grid[r2][c2];
    }
    if (r1 === n - 1 && c1 === n - 1) {
      return (memo[r1][c1][r2] = cherries);
    }
    const best = Math.max(search(r1 + 1, c1, r2 + 1), search(r1 + 1, c1, r2),
      search(r1, c1 + 1, r2 + 1), search(r1, c1 + 1, r2));
    return (memo[r1][c1][r2] = cherries + best);
  }
  return Math.max(0, search(0, 0, 0));
}`,
      },
    },
    {
      name: '按共同步數做迭代 DP',
      idea: '第 t 步只存兩人的列座標；四種上一格組合中取最高收穫。',
      steps: ['起點狀態 dp[0][0] 設為起點櫻桃數。', '對 t 從 1 到 2n−2，枚舉甲列 r1、乙列 r2，推得兩人的欄。', '跳過障礙，從四種前一格選最大值，再加入本格櫻桃。', '終點狀態不可行時回傳 0。'],
      figure: { title: '逐步推進兩人狀態', steps: bottomFig() },
      complexity: { time: 'O(n³)', space: 'O(n²)', why: '共有 O(n³) 狀態，只需保留前一個步數的 n² 格。' },
      verdict: '與記憶化解法相同的狀態，但可將空間降為 O(n²)。',
      code: {
        python: `def cherryPickup(grid):
    n = len(grid)
    if grid[0][0] == -1:
        return 0
    impossible = -10**9
    previous = [[impossible] * n for _ in range(n)]
    previous[0][0] = grid[0][0]
    for step in range(1, 2 * n - 1):
        current = [[impossible] * n for _ in range(n)]
        for r1 in range(n):
            c1 = step - r1
            if c1 < 0 or c1 >= n or grid[r1][c1] == -1:
                continue
            for r2 in range(n):
                c2 = step - r2
                if c2 < 0 or c2 >= n or grid[r2][c2] == -1:
                    continue
                best = impossible
                for old_r1 in (r1, r1 - 1):
                    for old_r2 in (r2, r2 - 1):
                        if old_r1 >= 0 and old_r2 >= 0:
                            best = max(best, previous[old_r1][old_r2])
                if best == impossible:
                    continue
                gain = grid[r1][c1]
                if r1 != r2:
                    gain += grid[r2][c2]  # 同一格只加一次
                current[r1][r2] = best + gain
        previous = current
    return max(0, previous[n - 1][n - 1])`,
        c: `int cherryPickup(int **grid, int gridSize, int *gridColSize) {
    int n = gridSize, impossible = -100000000;
    if (grid[0][0] == -1) {
        return 0;
    }
    int *previous = malloc(n * n * sizeof(int));
    int *current = malloc(n * n * sizeof(int));
    for (int i = 0; i < n * n; i++) {
        previous[i] = impossible;
    }
    previous[0] = grid[0][0];
    for (int step = 1; step <= 2 * n - 2; step++) {
        for (int i = 0; i < n * n; i++) {
            current[i] = impossible;
        }
        for (int r1 = 0; r1 < n; r1++) {
            int c1 = step - r1;
            if (c1 < 0 || c1 >= n || grid[r1][c1] == -1) {
                continue;
            }
            for (int r2 = 0; r2 < n; r2++) {
                int c2 = step - r2;
                if (c2 < 0 || c2 >= n || grid[r2][c2] == -1) {
                    continue;
                }
                int best = impossible;
                for (int a = 0; a <= 1; a++) {
                    for (int b = 0; b <= 1; b++) {
                        int oldR1 = r1 - a, oldR2 = r2 - b;
                        if (oldR1 >= 0 && oldR2 >= 0 && previous[oldR1 * n + oldR2] > best) {
                            best = previous[oldR1 * n + oldR2];
                        }
                    }
                }
                if (best == impossible) {
                    continue;
                }
                int gain = grid[r1][c1];
                if (r1 != r2) {
                    gain += grid[r2][c2];
                }
                current[r1 * n + r2] = best + gain;
            }
        }
        int *temporary = previous;
        previous = current;
        current = temporary;
    }
    int answer = previous[(n - 1) * n + n - 1];
    free(previous);
    free(current);
    return answer > 0 ? answer : 0;
}`,
        cpp: `int cherryPickup(vector<vector<int>>& grid) {
    int n = grid.size(), impossible = -100000000;
    if (grid[0][0] == -1) {
        return 0;
    }
    vector<vector<int>> previous(n, vector<int>(n, impossible));
    previous[0][0] = grid[0][0];
    for (int step = 1; step <= 2 * n - 2; step++) {
        vector<vector<int>> current(n, vector<int>(n, impossible));
        for (int r1 = 0; r1 < n; r1++) {
            int c1 = step - r1;
            if (c1 < 0 || c1 >= n || grid[r1][c1] == -1) {
                continue;
            }
            for (int r2 = 0; r2 < n; r2++) {
                int c2 = step - r2;
                if (c2 < 0 || c2 >= n || grid[r2][c2] == -1) {
                    continue;
                }
                int best = impossible;
                for (int oldR1 : {r1, r1 - 1}) {
                    for (int oldR2 : {r2, r2 - 1}) {
                        if (oldR1 >= 0 && oldR2 >= 0) {
                            best = max(best, previous[oldR1][oldR2]);
                        }
                    }
                }
                if (best != impossible) {
                    int gain = grid[r1][c1];
                    if (r1 != r2) {
                        gain += grid[r2][c2];
                    }
                    current[r1][r2] = best + gain;
                }
            }
        }
        previous.swap(current);
    }
    return max(0, previous[n - 1][n - 1]);
}`,
        java: `int cherryPickup(int[][] grid) {
    int n = grid.length, impossible = -100000000;
    if (grid[0][0] == -1) {
        return 0;
    }
    int[][] previous = new int[n][n];
    for (int[] row : previous) {
        Arrays.fill(row, impossible);
    }
    previous[0][0] = grid[0][0];
    for (int step = 1; step <= 2 * n - 2; step++) {
        int[][] current = new int[n][n];
        for (int[] row : current) {
            Arrays.fill(row, impossible);
        }
        for (int r1 = 0; r1 < n; r1++) {
            int c1 = step - r1;
            if (c1 < 0 || c1 >= n || grid[r1][c1] == -1) {
                continue;
            }
            for (int r2 = 0; r2 < n; r2++) {
                int c2 = step - r2;
                if (c2 < 0 || c2 >= n || grid[r2][c2] == -1) {
                    continue;
                }
                int best = impossible;
                for (int a = 0; a <= 1; a++) {
                    for (int b = 0; b <= 1; b++) {
                        if (r1 - a >= 0 && r2 - b >= 0) {
                            best = Math.max(best, previous[r1 - a][r2 - b]);
                        }
                    }
                }
                if (best != impossible) {
                    int gain = grid[r1][c1];
                    if (r1 != r2) {
                        gain += grid[r2][c2];
                    }
                    current[r1][r2] = best + gain;
                }
            }
        }
        previous = current;
    }
    return Math.max(0, previous[n - 1][n - 1]);
}`,
        javascript: `function cherryPickup(grid) {
  const n = grid.length;
  const impossible = -100000000;
  if (grid[0][0] === -1) {
    return 0;
  }
  let previous = Array.from({ length: n }, () => new Array(n).fill(impossible));
  previous[0][0] = grid[0][0];
  for (let step = 1; step <= 2 * n - 2; step++) {
    const current = Array.from({ length: n }, () => new Array(n).fill(impossible));
    for (let r1 = 0; r1 < n; r1++) {
      const c1 = step - r1;
      if (c1 < 0 || c1 >= n || grid[r1][c1] === -1) {
        continue;
      }
      for (let r2 = 0; r2 < n; r2++) {
        const c2 = step - r2;
        if (c2 < 0 || c2 >= n || grid[r2][c2] === -1) {
          continue;
        }
        let best = impossible;
        for (const oldR1 of [r1, r1 - 1]) {
          for (const oldR2 of [r2, r2 - 1]) {
            if (oldR1 >= 0 && oldR2 >= 0) {
              best = Math.max(best, previous[oldR1][oldR2]);
            }
          }
        }
        if (best !== impossible) {
          let gain = grid[r1][c1];
          if (r1 !== r2) {
            gain += grid[r2][c2];
          }
          current[r1][r2] = best + gain;
        }
      }
    }
    previous = current;
  }
  return Math.max(0, previous[n - 1][n - 1]);
}`,
      },
    },
  ],
  pitfalls: ['兩人同時站在同一格時，櫻桃只算一次。', '一人到障礙或越界，該狀態不可行；不要把不可行當 0 分。', '無法完成完整往返時才將最終答案截為 0。'],
  check: {
    kind: 'fn',
    fn: 'cherryPickup',
    cases: [
      { args: [G], out: 5 },
      { args: [[[1, 1, -1], [1, -1, 1], [-1, 1, 1]]], out: 0 },
      { args: [[[1]]], out: 1 },
      { args: [[[0, 1], [1, 1]]], out: 3 },
    ],
  },
}
