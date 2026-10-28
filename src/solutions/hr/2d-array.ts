import { arr } from '../../engine/helpers'
import { kv } from '../fig'
import type { FigStep, HrSolution } from '../types'

const BOARD = [
  [1, 1, 1, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [0, 0, 2, 4, 4, 0],
  [0, 0, 0, 2, 0, 0],
  [0, 0, 1, 2, 4, 0],
]

function loopFig(): FigStep[] {
  const out: FigStep[] = []
  let best = -Infinity
  for (let r = 0; r <= 3; r++) {
    for (let c = 0; c <= 3; c++) {
      let sum = 0
      const cells: number[] = []
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          if (dr === 1 && dc !== 1) continue
          sum += BOARD[r + dr][c + dc]
          cells.push((r + dr) * 6 + c + dc)
        }
      }
      best = Math.max(best, sum)
      out.push({ note: `左上角 (${r},${c})：逐格加上沙漏的七格，總和 ${sum}；目前最大 ${best}。`, views: [arr(BOARD.flat(), { label: '6×6 展平成列，實心為沙漏', highlight: cells }), kv([['目前總和', sum], ['最大值', best]])] })
    }
  }
  return out
}

function directFig(): FigStep[] {
  const out: FigStep[] = []
  let best = -Infinity
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const top = BOARD[r][c] + BOARD[r][c + 1] + BOARD[r][c + 2]
      const middle = BOARD[r + 1][c + 1]
      const bottom = BOARD[r + 2][c] + BOARD[r + 2][c + 1] + BOARD[r + 2][c + 2]
      const sum = top + middle + bottom
      best = Math.max(best, sum)
      const chosen = [r * 6 + c, r * 6 + c + 1, r * 6 + c + 2, (r + 1) * 6 + c + 1, (r + 2) * 6 + c, (r + 2) * 6 + c + 1, (r + 2) * 6 + c + 2]
      out.push({ note: `起點 (${r},${c})：上排 ${top}＋中央 ${middle}＋下排 ${bottom}＝${sum}；更新最大為 ${best}。`, views: [arr(BOARD.flat(), { label: '沙漏七格', highlight: chosen }), kv([['上排', top], ['中央', middle], ['下排', bottom], ['最大', best]])] })
    }
  }
  return out
}

export const hr2dArray: HrSolution = {
  slug: '2d-array',
  plain: '像拿一個沙漏形的七格透明模板，在 6×6 數字板上移動，找蓋住的數字總和最大的位置。',
  statement: '給 6×6 整數矩陣 arr。沙漏形包含上排三格、中排中央一格、下排三格。模板不能超出矩陣；計算所有 16 個位置的七格總和，回傳最大值。',
  examples: [
    { input: 'arr = [[1,1,1,0,0,0],[0,1,0,0,0,0],[1,1,1,0,0,0],[0,0,2,4,4,0],[0,0,0,2,0,0],[0,0,1,2,4,0]]', output: '19', note: '右下區域有一個沙漏總和 19，超過其餘位置。' },
    { input: 'arr = 六列，每格都是 -1', output: '-7', note: '每個沙漏都是七個 -1；最大值仍是負數。' },
  ],
  constraints: [
    '矩陣固定 6×6 → 左上角只能取列、欄索引 0 到 3，共 16 個位置。',
    '每格可為負數 → 最大值不能初始化成 0，應用第一個總和或極小值。',
    '每個沙漏固定七格 → 每個位置計算量固定，整題只需掃 16 次。',
  ],
  insight: [
    '先確認形狀：3×3 方塊要排除中排左右兩格，才剩七格。',
    '列舉左上角，對每個 3×3 逐格過濾並加總，是最直接的 [[p:simulation]]。',
    '形狀固定後，可把七格位置直接寫出，避免內層條件判斷，仍逐一更新最大值。',
  ],
  approaches: [
    {
      name: '3×3 視窗逐格判斷',
      idea: '枚舉每個 3×3 視窗，只加上符合沙漏形狀的格子。',
      steps: ['把最大值 best 設為負無限大。', '令左上角 r、c 各從 0 走到 3。', '在 3×3 區域中跳過中排左右兩格，其餘格子加到 sum。', '用 best=max(best,sum) 更新，全部掃完回傳 best。'],
      figure: { title: '6×6 範例：逐格篩選', steps: loopFig() },
      complexity: { time: 'O(16×9)=O(1)', space: 'O(1)', why: '固定 16 個起點，每個檢查九格；只存總和與最大值。' },
      verdict: '形狀容易看懂，也容易改成其他模板。',
      code: {
        python: `def hourglassSum(arr):
    best = float('-inf')
    for r in range(4):
        for c in range(4):
            total = 0
            for dr in range(3):
                for dc in range(3):
                    if dr == 1 and dc != 1:
                        continue
                    total += arr[r + dr][c + dc]  # 只加沙漏七格
            best = max(best, total)
    return best`,
        c: `int hourglassSum(int arr_rows, int arr_columns, int** arr) {
    int best = INT_MIN;
    for (int r = 0; r <= 3; r++) {
        for (int c = 0; c <= 3; c++) {
            int total = 0;
            for (int dr = 0; dr < 3; dr++) {
                for (int dc = 0; dc < 3; dc++) {
                    if (dr == 1 && dc != 1) continue;
                    total += arr[r + dr][c + dc];
                }
            }
            if (total > best) best = total;
        }
    }
    return best;
}`,
        cpp: `int hourglassSum(vector<vector<int>> arr) {
    int best = INT_MIN;
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) {
            int total = 0;
            for (int dr = 0; dr < 3; dr++) {
                for (int dc = 0; dc < 3; dc++) {
                    if (dr == 1 && dc != 1) continue;
                    total += arr[r + dr][c + dc];
                }
            }
            best = max(best, total);
        }
    }
    return best;
}`,
        java: `public static int hourglassSum(List<List<Integer>> arr) {
    int best = Integer.MIN_VALUE;
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) {
            int total = 0;
            for (int dr = 0; dr < 3; dr++) {
                for (int dc = 0; dc < 3; dc++) {
                    if (dr == 1 && dc != 1) continue;
                    total += arr.get(r + dr).get(c + dc);
                }
            }
            best = Math.max(best, total);
        }
    }
    return best;
}`,
        javascript: `function hourglassSum(arr) {
  let best = -Infinity;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let total = 0;
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          if (dr === 1 && dc !== 1) continue;
          total += arr[r + dr][c + dc];
        }
      }
      best = Math.max(best, total);
    }
  }
  return best;
}`,
      },
    },
    {
      name: '直接加七個位置',
      idea: '沙漏偏移位置固定，直接算上三格、中一格、下三格。',
      steps: ['最大值先設為極小值。', 'r、c 各走 0 到 3。', '分別算上排三格、中央一格、下排三格的總和。', '更新最大值並在掃完 16 個起點後回傳。'],
      figure: { title: '6×6 範例：固定七格', steps: directFig() },
      complexity: { time: 'O(16×7)=O(1)', space: 'O(1)', why: '固定 16 個沙漏，每個恰好讀七格；額外只有常數變數。' },
      verdict: '最佳寫法；位置固定時程式短且不必檢查跳過條件。',
      code: {
        python: `def hourglassSum(arr):
    best = float('-inf')
    for r in range(4):
        for c in range(4):
            top = sum(arr[r][c:c + 3])
            middle = arr[r + 1][c + 1]
            bottom = sum(arr[r + 2][c:c + 3])
            best = max(best, top + middle + bottom)  # 七格總和
    return best`,
        c: `int hourglassSum(int arr_rows, int arr_columns, int** arr) {
    int best = INT_MIN;
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) {
            int total = arr[r][c] + arr[r][c + 1] + arr[r][c + 2]
                + arr[r + 1][c + 1]
                + arr[r + 2][c] + arr[r + 2][c + 1] + arr[r + 2][c + 2];
            if (total > best) best = total;
        }
    }
    return best;
}`,
        cpp: `int hourglassSum(vector<vector<int>> arr) {
    int best = INT_MIN;
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) {
            int total = arr[r][c] + arr[r][c + 1] + arr[r][c + 2]
                + arr[r + 1][c + 1]
                + arr[r + 2][c] + arr[r + 2][c + 1] + arr[r + 2][c + 2];
            best = max(best, total);
        }
    }
    return best;
}`,
        java: `public static int hourglassSum(List<List<Integer>> arr) {
    int best = Integer.MIN_VALUE;
    for (int r = 0; r < 4; r++) {
        for (int c = 0; c < 4; c++) {
            int total = arr.get(r).get(c) + arr.get(r).get(c + 1) + arr.get(r).get(c + 2)
                + arr.get(r + 1).get(c + 1)
                + arr.get(r + 2).get(c) + arr.get(r + 2).get(c + 1) + arr.get(r + 2).get(c + 2);
            best = Math.max(best, total);
        }
    }
    return best;
}`,
        javascript: `function hourglassSum(arr) {
  let best = -Infinity;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const total = arr[r][c] + arr[r][c + 1] + arr[r][c + 2]
        + arr[r + 1][c + 1]
        + arr[r + 2][c] + arr[r + 2][c + 1] + arr[r + 2][c + 2];
      best = Math.max(best, total);
    }
  }
  return best;
}`,
      },
    },
  ],
  pitfalls: [
    '沙漏只有七格，中排左右兩格不算。',
    '全負數時答案也可能是負數，best 不可設為 0。',
    '左上角最多到 (3,3)，再往右或往下會超界。',
  ],
  check: {
    kind: 'fn',
    fn: 'hourglassSum',
    cases: [
      { args: [BOARD], out: 19 },
      { args: [Array.from({ length: 6 }, () => Array(6).fill(-1))], out: -7 },
      { args: [Array.from({ length: 6 }, () => Array(6).fill(0))], out: 0 },
      { args: [Array.from({ length: 6 }, () => Array(6).fill(1))], out: 7 },
      { args: [Array.from({ length: 6 }, (_, r) => Array.from({ length: 6 }, (_, c) => r === 0 && c < 3 || r === 1 && c === 1 || r === 2 && c < 3 ? 9 : 0))], out: 63 },
      { args: [Array.from({ length: 6 }, (_, r) => Array.from({ length: 6 }, (_, c) => r === 3 && c >= 3 || r === 4 && c === 4 || r === 5 && c >= 3 ? 2 : 0))], out: 14 },
    ],
  },
}
