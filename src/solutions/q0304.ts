import type { GridViewData } from '../types'
import type { FigStep, Solution } from './types'

// 304. Range Sum Query 2D - Immutable

const M = [
  [3, 0, 1, 4, 2],
  [5, 6, 3, 2, 1],
  [1, 2, 0, 1, 5],
  [4, 1, 0, 1, 7],
  [1, 0, 3, 0, 5],
]

function prefix2d(): number[][] {
  const P = Array.from({ length: M.length + 1 }, () => Array(M[0].length + 1).fill(0))
  for (let r = 0; r < M.length; r++) for (let c = 0; c < M[0].length; c++) P[r + 1][c + 1] = P[r][c + 1] + P[r + 1][c] - P[r][c] + M[r][c]
  return P
}

function mView(marks: Record<string, [number, number][]>, label = 'matrix'): GridViewData {
  return { kind: 'grid', label, cells: M.map((r) => [...r]), marks }
}

function pView(marks: Record<string, [number, number][]>): GridViewData {
  const P = prefix2d()
  return { kind: 'grid', label: 'P[r][c] = 左上角 r × c 區塊的總和(多一列一行 0)', cells: P.map((r) => [...r]), marks }
}

function rect(r1: number, c1: number, r2: number, c2: number): [number, number][] {
  const out: [number, number][] = []
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) out.push([r, c])
  return out
}

function fig2d(): FigStep[] {
  const P = prefix2d()
  return [
    { note: '建構時先算二維前綴和 P:P[r+1][c+1] = 上面 P[r][c+1] + 左邊 P[r+1][c] − 左上 P[r][c](重複加了一次)+ 自己 M[r][c]', views: [pView({ hl: [[3, 3]], cmp: [[2, 3], [3, 2], [2, 2]] })] },
    { note: '查 (2,1)–(4,3) 這個矩形:', views: [mView({ hl: rect(2, 1, 4, 3) }, '要的矩形')] },
    { note: `= P[5][4](整個左上大塊)− P[2][4](上面多的)− P[5][1](左邊多的)+ P[2][1](左上角被減了兩次,加回來)= ${P[5][4]} − ${P[2][4]} − ${P[5][1]} + ${P[2][1]} = ${P[5][4] - P[2][4] - P[5][1] + P[2][1]}`, views: [pView({ hl: [[5, 4]], cmp: [[2, 4], [5, 1]], dep: [[2, 1]] })] },
  ]
}

function rowFig(): FigStep[] {
  return [
    { note: '簡單一點:每一列各自做一維前綴和。查詢時,矩形涵蓋的每一列各做一次減法', views: [mView({ hl: rect(2, 1, 4, 3) }, '每一列各算一段')] },
    { note: '第 2 列:2+0+1 = 3;第 3 列:1+0+1 = 2;第 4 列:0+3+0 = 3 → 共 8。每次查詢 O(列數)', views: [mView({ done: rect(2, 1, 4, 3) }, '三列加起來 = 8')] },
  ]
}

export const q0304: Solution = {
  id: 304,
  plain: '一張固定的數字表格,會被問很多次「某個長方形區塊裡的數字加起來是多少」。先算好「從左上角到每一格的總和」,之後任何長方形都能用四個數加加減減秒答。',
  statement: '設計類別 `NumMatrix`:建構子接收二維矩陣 `matrix`(之後不會修改);`sumRegion(row1, col1, row2, col2)` 回傳左上角 (row1, col1)、右下角 (row2, col2) 這個矩形內元素的總和。要求每次查詢 O(1)。',
  examples: [
    { input: '["NumMatrix","sumRegion","sumRegion","sumRegion"]\n[[matrix],[2,1,4,3],[1,1,2,2],[1,2,2,4]]', output: '[null,8,11,12]' },
  ],
  constraints: ['m, n ≤ 200', 'sumRegion 最多呼叫 10⁴ 次'],
  insight: ['[303](#/q/303) 的二維版', '`P[r][c]` = 左上 r × c 區塊的總和;矩形和 = 大塊 − 上面 − 左邊 + 左上(容斥原理)', '前綴和多開一列一行 0,就不用處理邊界'],
  approaches: [
    {
      name: '二維前綴和',
      idea: '`P[r+1][c+1] = P[r][c+1] + P[r+1][c] − P[r][c] + M[r][c]`;查詢 `P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]`。',
      steps: ['`P` 開 (m+1) × (n+1),全 0', '逐格填 P(上 + 左 − 左上 + 自己)', '查詢:四個角的容斥'],
      figure: { title: '5 × 5 矩陣', steps: fig2d() },
      complexity: { time: '建構 O(mn),查詢 O(1)', space: 'O(mn)', why: '一張 (m+1)(n+1) 的表。' },
      verdict: '最推薦。二維[[p:prefix-sum]]的標準寫法,「加兩次的要減一次」的容斥要記熟。',
      code: {
        python: `class NumMatrix:
    def __init__(self, matrix):
        m, n = len(matrix), len(matrix[0])
        self.P = [[0] * (n + 1) for _ in range(m + 1)]
        for r in range(m):
            for c in range(n):
                # 上 + 左 − 左上(被加了兩次)+ 自己
                self.P[r + 1][c + 1] = self.P[r][c + 1] + self.P[r + 1][c] - self.P[r][c] + matrix[r][c]

    def sumRegion(self, row1, col1, row2, col2):
        P = self.P
        return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1]`,
        c: `typedef struct {
    int **P;
    int m;
} NumMatrix;

NumMatrix *numMatrixCreate(int **matrix, int matrixSize, int *matrixColSize) {
    int m = matrixSize, n = matrixColSize[0];
    NumMatrix *o = malloc(sizeof(NumMatrix));
    o->m = m;
    o->P = malloc((m + 1) * sizeof(int *));
    for (int r = 0; r <= m; r++) o->P[r] = calloc(n + 1, sizeof(int));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            o->P[r + 1][c + 1] = o->P[r][c + 1] + o->P[r + 1][c] - o->P[r][c] + matrix[r][c];
    return o;
}

int numMatrixSumRegion(NumMatrix *o, int row1, int col1, int row2, int col2) {
    int **P = o->P;
    return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
}

void numMatrixFree(NumMatrix *o) {
    for (int r = 0; r <= o->m; r++) free(o->P[r]);
    free(o->P); free(o);
}`,
        cpp: `class NumMatrix {
    vector<vector<int>> P;
public:
    NumMatrix(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        P.assign(m + 1, vector<int>(n + 1, 0));
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                P[r + 1][c + 1] = P[r][c + 1] + P[r + 1][c] - P[r][c] + matrix[r][c];
    }

    int sumRegion(int row1, int col1, int row2, int col2) {
        return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
    }
};`,
        java: `class NumMatrix {
    private final int[][] P;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        P = new int[m + 1][n + 1];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++)
                P[r + 1][c + 1] = P[r][c + 1] + P[r + 1][c] - P[r][c] + matrix[r][c];
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
    }
}`,
        javascript: `class NumMatrix {
  constructor(matrix) {
    const m = matrix.length, n = matrix[0].length;
    this.P = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let r = 0; r < m; r++)
      for (let c = 0; c < n; c++)
        this.P[r + 1][c + 1] = this.P[r][c + 1] + this.P[r + 1][c] - this.P[r][c] + matrix[r][c];
  }

  sumRegion(row1, col1, row2, col2) {
    const P = this.P;
    return P[row2 + 1][col2 + 1] - P[row1][col2 + 1] - P[row2 + 1][col1] + P[row1][col1];
  }
}`,
      },
    },
    {
      name: '每列各自的一維前綴和',
      idea: '`rowPre[r][c+1] = rowPre[r][c] + M[r][c]`;查詢時對 row1..row2 每列做一次減法。',
      steps: ['每一列做一維前綴和', '查詢:`sum(rowPre[r][col2 + 1] − rowPre[r][col1] for r in row1..row2)`'],
      figure: { title: '5 × 5 矩陣', steps: rowFig() },
      complexity: { time: '建構 O(mn),查詢 O(m)', space: 'O(mn)', why: '每次查詢要走過涵蓋的列。' },
      verdict: '比較好想,但查詢不是 O(1)。拿來當通往二維前綴和的跳板。',
      code: {
        python: `class NumMatrix:
    def __init__(self, matrix):
        self.rows = []
        for row in matrix:
            pre = [0]
            for x in row:
                pre.append(pre[-1] + x)
            self.rows.append(pre)

    def sumRegion(self, row1, col1, row2, col2):
        return sum(self.rows[r][col2 + 1] - self.rows[r][col1] for r in range(row1, row2 + 1))`,
        c: `typedef struct {
    int **R;
    int m;
} NumMatrix;

NumMatrix *numMatrixCreate(int **matrix, int matrixSize, int *matrixColSize) {
    int m = matrixSize, n = matrixColSize[0];
    NumMatrix *o = malloc(sizeof(NumMatrix));
    o->m = m;
    o->R = malloc(m * sizeof(int *));
    for (int r = 0; r < m; r++) {
        o->R[r] = calloc(n + 1, sizeof(int));
        for (int c = 0; c < n; c++) o->R[r][c + 1] = o->R[r][c] + matrix[r][c];
    }
    return o;
}

int numMatrixSumRegion(NumMatrix *o, int row1, int col1, int row2, int col2) {
    int s = 0;
    for (int r = row1; r <= row2; r++) s += o->R[r][col2 + 1] - o->R[r][col1];
    return s;
}

void numMatrixFree(NumMatrix *o) {
    for (int r = 0; r < o->m; r++) free(o->R[r]);
    free(o->R); free(o);
}`,
        cpp: `class NumMatrix {
    vector<vector<int>> R;
public:
    NumMatrix(vector<vector<int>>& matrix) {
        for (auto &row : matrix) {
            vector<int> pre(row.size() + 1, 0);
            for (size_t c = 0; c < row.size(); c++) pre[c + 1] = pre[c] + row[c];
            R.push_back(pre);
        }
    }

    int sumRegion(int row1, int col1, int row2, int col2) {
        int s = 0;
        for (int r = row1; r <= row2; r++) s += R[r][col2 + 1] - R[r][col1];
        return s;
    }
};`,
        java: `class NumMatrix {
    private final int[][] R;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        R = new int[m][n + 1];
        for (int r = 0; r < m; r++)
            for (int c = 0; c < n; c++) R[r][c + 1] = R[r][c] + matrix[r][c];
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        int s = 0;
        for (int r = row1; r <= row2; r++) s += R[r][col2 + 1] - R[r][col1];
        return s;
    }
}`,
        javascript: `class NumMatrix {
  constructor(matrix) {
    this.R = matrix.map((row) => {
      const pre = [0];
      for (const x of row) pre.push(pre[pre.length - 1] + x);
      return pre;
    });
  }

  sumRegion(row1, col1, row2, col2) {
    let s = 0;
    for (let r = row1; r <= row2; r++) s += this.R[r][col2 + 1] - this.R[r][col1];
    return s;
  }
}`,
      },
    },
  ],
  pitfalls: ['容斥忘了加回左上角 `P[row1][col1]`(被減了兩次)', '索引差一:P 比 matrix 多一列一行,查詢時右下角要 +1'],
  check: {
    kind: 'class',
    cls: 'NumMatrix',
    cases: [
      { ops: ['NumMatrix', 'sumRegion', 'sumRegion', 'sumRegion'], args: [[M], [2, 1, 4, 3], [1, 1, 2, 2], [1, 2, 2, 4]], out: [null, 8, 11, 12] },
      { ops: ['NumMatrix', 'sumRegion', 'sumRegion'], args: [[[[-4, -5]]], [0, 0, 0, 0], [0, 0, 0, 1]], out: [null, -4, -9] },
    ],
  },
}
