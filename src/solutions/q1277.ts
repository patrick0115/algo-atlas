import { arr } from '../engine/helpers'
import type { Cell, GridViewData } from '../types'
import type { Solution } from './types'

// 1277. Count Square Submatrices with All Ones
const M = [[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]]

function grid(cells: number[][], opt: { label?: string; marks?: Record<string, Cell[]> } = {}): GridViewData {
  return { kind: 'grid', cells, label: opt.label, marks: opt.marks }
}

export const q1277: Solution = {
  id: 1277,
  plain: '在 0/1 方格裡數出所有完全由 1 組成的正方形；同一位置上不同大小也要分別計算。',
  statement: '給二維 0/1 矩陣 matrix，計算其中每個元素都是 1 的正方形子矩陣總數。',
  examples: [
    { input: 'matrix = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]', output: '15', note: '10 個 1×1、4 個 2×2、1 個 3×3。' },
    { input: 'matrix = [[1,0,1],[1,1,0],[1,1,0]]', output: '7' },
  ],
  constraints: ['1 ≤ 列數、欄數 ≤ 300；元素只有 0 或 1。'],
  insight: ['固定右下角，一個最大的 k×k 全 1 正方形，同時也代表此處有大小 1 到 k 的 k 個正方形。', '若目前是 1，能擴到多大，取決於上、左、左上三個方向各自能提供多大的正方形。'],
  approaches: [
    {
      name: '逐個左上角與邊長檢查',
      idea: '枚舉每個正方形，掃描範圍內所有格子確認是否都是 1。',
      steps: ['枚舉左上角 (r,c)。', '枚舉不超出矩陣的邊長 size。', '逐格檢查這個正方形；全為 1 就把答案加一。'],
      figure: { title: 'matrix = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]', steps: [
        { note: '先看 1×1，除了兩個 0，其餘 10 格各算一個。', views: [grid(M, { label: '10 個單格正方形', marks: { dim: [[0, 0], [2, 0]] } })] },
        { note: '以 (0,1) 為左上角，右下角 (1,2) 圍出全 1 的 2×2，新增 1 個。', views: [grid(M, { marks: { hl: [[0, 1], [0, 2], [1, 1], [1, 2]] } })] },
        { note: '2×2 在上排起點 1、2 與中排起點 1、2 都成立，共新增 4 個。', views: [arr([10, 4], { label: '1×1 / 2×2 的數量', done: [0, 1] })] },
        { note: '只有左上角 (0,1) 能形成 3×3 全 1；再加 1，答案 15。', views: [grid(M, { marks: { hl: [[0, 1], [0, 2], [0, 3], [1, 1], [1, 2], [1, 3], [2, 1], [2, 2], [2, 3]] } })] },
      ] },
      complexity: { time: 'O(mn · min(m,n)³)', space: 'O(1)', why: '每個起點試多種邊長，每次再掃至多邊長平方個格子。' },
      verdict: '直覺但有大量重複掃描，適合小矩陣驗算。',
      code: {
        python: `def countSquares(matrix):
    rows, cols = len(matrix), len(matrix[0])
    answer = 0
    for r in range(rows):
        for c in range(cols):
            for size in range(1, min(rows - r, cols - c) + 1):
                good = True
                for i in range(r, r + size):
                    for j in range(c, c + size):
                        if matrix[i][j] == 0:
                            good = False
                if good:
                    answer += 1  # 這個起點與邊長形成全 1 正方形
    return answer`,
        c: `int countSquares(int **matrix, int matrixSize, int *matrixColSize) {
    int rows = matrixSize;
    int cols = matrixColSize[0];
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            for (int size = 1; r + size <= rows && c + size <= cols; size++) {
                bool good = true;
                for (int i = r; i < r + size; i++) {
                    for (int j = c; j < c + size; j++) {
                        if (matrix[i][j] == 0) {
                            good = false;
                        }
                    }
                }
                if (good) {
                    answer++;
                }
            }
        }
    }
    return answer;
}`,
        cpp: `int countSquares(vector<vector<int>>& matrix) {
    int rows = matrix.size();
    int cols = matrix[0].size();
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            for (int size = 1; r + size <= rows && c + size <= cols; size++) {
                bool good = true;
                for (int i = r; i < r + size; i++) {
                    for (int j = c; j < c + size; j++) {
                        if (matrix[i][j] == 0) {
                            good = false;
                        }
                    }
                }
                if (good) {
                    answer++;
                }
            }
        }
    }
    return answer;
}`,
        java: `int countSquares(int[][] matrix) {
    int rows = matrix.length;
    int cols = matrix[0].length;
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            for (int size = 1; r + size <= rows && c + size <= cols; size++) {
                boolean good = true;
                for (int i = r; i < r + size; i++) {
                    for (int j = c; j < c + size; j++) {
                        if (matrix[i][j] == 0) {
                            good = false;
                        }
                    }
                }
                if (good) {
                    answer++;
                }
            }
        }
    }
    return answer;
}`,
        javascript: `function countSquares(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let answer = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let size = 1; r + size <= rows && c + size <= cols; size++) {
        let good = true;
        for (let i = r; i < r + size; i++) {
          for (let j = c; j < c + size; j++) {
            if (matrix[i][j] === 0) {
              good = false;
            }
          }
        }
        if (good) {
          answer++;
        }
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '動態規劃：以右下角計數',
      idea: 'dp[r][c] 表示以 (r,c) 為右下角的最大全 1 正方形邊長；所有 dp 值相加就是答案。',
      steps: ['遇到 0，dp = 0。', '遇到第一排或第一欄的 1，dp = 1。', '其他 1：dp = 1 + min(上、左、左上)。', '每算一格就把 dp 加入答案。'],
      figure: { title: 'matrix = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]', steps: [
        { note: '第一列與第一欄只能形成單格正方形，先寫入 0、1。', views: [grid([[0, 1, 1, 1], [1, 0, 0, 0], [0, 0, 0, 0]], { label: 'dp：已計算邊界', marks: { hl: [[0, 1], [1, 0]] } })] },
        { note: '算第二列：左上角的 0 限制了 (1,1)，所以 dp=1；(1,2)、(1,3) 可長到 2。', views: [grid([[0, 1, 1, 1], [1, 1, 2, 2], [0, 0, 0, 0]], { label: 'dp', marks: { hl: [[1, 2], [1, 3]] } })] },
        { note: '第三列的 (2,1) 左邊是 0，因此 dp=1；(2,2) 的三個鄰居最小為 1，dp=2。', views: [grid([[0, 1, 1, 1], [1, 1, 2, 2], [0, 1, 2, 0]], { label: 'dp', marks: { hl: [[2, 2]] } })] },
        { note: '(2,3) 的上、左、左上都是 2，於是 dp=3，新增大小 1、2、3 的三個正方形。', views: [grid([[0, 1, 1, 1], [1, 1, 2, 2], [0, 1, 2, 3]], { label: 'dp', marks: { hl: [[2, 3]] } })] },
        { note: '把所有 dp 格子相加，答案是 15。', views: [arr([0, 1, 1, 1, 1, 1, 2, 2, 0, 1, 2, 3], { label: 'dp 展平後相加', done: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] })] },
      ] },
      complexity: { time: 'O(mn)', space: 'O(mn)', why: '每格只計算一次，另存同尺寸 dp 表。' },
      verdict: '標準解；三個鄰居中最短的邊，決定目前能擴出的最大正方形。',
      code: {
        python: `def countSquares(matrix):
    rows, cols = len(matrix), len(matrix[0])
    dp = [[0] * cols for _ in range(rows)]
    answer = 0
    for r in range(rows):
        for c in range(cols):
            if matrix[r][c] == 0:
                continue
            if r == 0 or c == 0:
                dp[r][c] = 1
            else:
                dp[r][c] = 1 + min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1])
            answer += dp[r][c]  # 最大邊長 k 同時帶來 k 個正方形
    return answer`,
        c: `int countSquares(int **matrix, int matrixSize, int *matrixColSize) {
    int rows = matrixSize;
    int cols = matrixColSize[0];
    int *dp = calloc(rows * cols, sizeof(int));
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (matrix[r][c] == 0) {
                continue;
            }
            int value = 1;
            if (r > 0 && c > 0) {
                int up = dp[(r - 1) * cols + c];
                int left = dp[r * cols + c - 1];
                int diag = dp[(r - 1) * cols + c - 1];
                int least = up < left ? up : left;
                if (diag < least) {
                    least = diag;
                }
                value += least;
            }
            dp[r * cols + c] = value;
            answer += value;
        }
    }
    free(dp);
    return answer;
}`,
        cpp: `int countSquares(vector<vector<int>>& matrix) {
    int rows = matrix.size();
    int cols = matrix[0].size();
    vector<vector<int>> dp(rows, vector<int>(cols, 0));
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (matrix[r][c] == 0) {
                continue;
            }
            dp[r][c] = r == 0 || c == 0 ? 1 : 1 + min({dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]});
            answer += dp[r][c];
        }
    }
    return answer;
}`,
        java: `int countSquares(int[][] matrix) {
    int rows = matrix.length;
    int cols = matrix[0].length;
    int[][] dp = new int[rows][cols];
    int answer = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (matrix[r][c] == 0) {
                continue;
            }
            dp[r][c] = r == 0 || c == 0 ? 1 : 1 + Math.min(dp[r - 1][c], Math.min(dp[r][c - 1], dp[r - 1][c - 1]));
            answer += dp[r][c];
        }
    }
    return answer;
}`,
        javascript: `function countSquares(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(0));
  let answer = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 0) {
        continue;
      }
      dp[r][c] = r === 0 || c === 0 ? 1 : 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);
      answer += dp[r][c];
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['dp 值不是正方形面積，而是最大邊長，也是該右下角能形成的正方形數。', '遇到 0 時 dp 必須保持 0；不能沿用鄰居的值。'],
  check: { kind: 'fn', fn: 'countSquares', cases: [
    { args: [M], out: 15 },
    { args: [[[1, 0, 1], [1, 1, 0], [1, 1, 0]]], out: 7 },
    { args: [[[0]]], out: 0 },
    { args: [[[1]]], out: 1 },
  ] },
}
