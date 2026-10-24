import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

// 118. Pascal's Triangle

const R = 5

function dpFig(): FigStep[] {
  const rows: number[][] = []
  const out: FigStep[] = []
  for (let i = 0; i < R; i++) {
    const row = Array(i + 1).fill(1)
    for (let j = 1; j < i; j++) row[j] = rows[i - 1][j - 1] + rows[i - 1][j]
    rows.push(row)
    out.push({
      note: i < 2 ? `第 ${i} 列:頭尾都是 1` : `第 ${i} 列:中間每個數 = 上一列「左上 + 右上」,例如 ${rows[i - 1][0]} + ${rows[i - 1][1]} = ${row[1]}`,
      views: rows.map((r, k) => arr(r, { label: `第 ${k} 列`, highlight: k === i ? r.map((_, j) => j).slice(1, -1) : [], compare: k === i - 1 && i >= 2 ? [0, 1] : [] })),
    })
  }
  return out
}

function combFig(): FigStep[] {
  return [
    { note: '第 i 列第 j 個數就是組合數 C(i, j)。同一列可以從左往右遞推:C(i, j) = C(i, j−1) × (i − j + 1) / j', views: [arr([1, 4, 6, 4, 1], { label: '第 4 列' })] },
    { note: '1 → 1 × 4 / 1 = 4 → 4 × 3 / 2 = 6 → 6 × 2 / 3 = 4 → 4 × 1 / 4 = 1。先乘後除一定整除', views: [arr([1, 4, 6, 4, 1], { label: '第 4 列', done: [0, 1, 2, 3, 4] })] },
  ]
}

export const q0118: Solution = {
  id: 118,
  plain: '產生「巴斯卡三角形」的前幾列:每列頭尾是 1,中間每個數等於它上面兩個數相加。',
  statement: '給整數 `numRows`,回傳巴斯卡三角形的前 numRows 列。每個數是它正上方兩數之和。',
  examples: [
    { input: 'numRows = 5', output: '[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]' },
    { input: 'numRows = 1', output: '[[1]]' },
  ],
  constraints: ['1 ≤ numRows ≤ 30'],
  insight: ['`row[i][j] = row[i−1][j−1] + row[i−1][j]`:最基本的 [[p:dp-general]]', '頭尾固定是 1', '第 i 列就是 C(i, 0..i)'],
  approaches: [
    {
      name: '逐列 DP',
      idea: '每列先填滿 1,再用上一列算中間:`row[j] = prev[j−1] + prev[j]`。',
      steps: ['`res = []`', '`for i in range(numRows)`:`row = [1] * (i + 1)`', '`for j in 1..i−1`:`row[j] = res[−1][j−1] + res[−1][j]`', '`res.append(row)`'],
      figure: { title: `numRows = ${R}`, steps: dpFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '輸出本身有 n(n+1)/2 個數。' },
      verdict: '最推薦,DP 的入門題。',
      code: {
        python: `def generate(numRows):
    res = []
    for i in range(numRows):
        row = [1] * (i + 1)                   # 頭尾都是 1
        for j in range(1, i):
            row[j] = res[-1][j - 1] + res[-1][j]   # 左上 + 右上
        res.append(row)
    return res`,
        c: `int **generate(int numRows, int *returnSize, int **returnColumnSizes) {
    int **res = malloc(numRows * sizeof(int *));
    *returnColumnSizes = malloc(numRows * sizeof(int));
    for (int i = 0; i < numRows; i++) {
        res[i] = malloc((i + 1) * sizeof(int));
        (*returnColumnSizes)[i] = i + 1;
        res[i][0] = res[i][i] = 1;
        for (int j = 1; j < i; j++) res[i][j] = res[i - 1][j - 1] + res[i - 1][j];
    }
    *returnSize = numRows;
    return res;
}`,
        cpp: `vector<vector<int>> generate(int numRows) {
    vector<vector<int>> res;
    for (int i = 0; i < numRows; i++) {
        vector<int> row(i + 1, 1);
        for (int j = 1; j < i; j++) row[j] = res[i - 1][j - 1] + res[i - 1][j];
        res.push_back(row);
    }
    return res;
}`,
        java: `List<List<Integer>> generate(int numRows) {
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < numRows; i++) {
        List<Integer> row = new ArrayList<>();
        for (int j = 0; j <= i; j++)
            row.add(j == 0 || j == i ? 1 : res.get(i - 1).get(j - 1) + res.get(i - 1).get(j));
        res.add(row);
    }
    return res;
}`,
        javascript: `function generate(numRows) {
  const res = [];
  for (let i = 0; i < numRows; i++) {
    const row = new Array(i + 1).fill(1);
    for (let j = 1; j < i; j++) row[j] = res[i - 1][j - 1] + res[i - 1][j];
    res.push(row);
  }
  return res;
}`,
      },
    },
    {
      name: '組合數公式',
      idea: '第 i 列:`c = 1`,`for j in 1..i`:`c = c × (i − j + 1) / j`。',
      steps: ['`for i`:`row = [1]`、`c = 1`', '`for j in 1..i`:`c = c * (i − j + 1) // j`,append', '收進答案'],
      figure: { title: `numRows = ${R}`, steps: combFig() },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '同樣要輸出全部的數。' },
      verdict: '每一列可以獨立算出來,不依賴上一列;要單獨求某一列時(119)很方便。',
      code: {
        python: `def generate(numRows):
    res = []
    for i in range(numRows):
        row, c = [1], 1
        for j in range(1, i + 1):
            c = c * (i - j + 1) // j          # C(i, j) 由 C(i, j-1) 遞推
            row.append(c)
        res.append(row)
    return res`,
        c: `int **generate(int numRows, int *returnSize, int **returnColumnSizes) {
    int **res = malloc(numRows * sizeof(int *));
    *returnColumnSizes = malloc(numRows * sizeof(int));
    for (int i = 0; i < numRows; i++) {
        res[i] = malloc((i + 1) * sizeof(int));
        (*returnColumnSizes)[i] = i + 1;
        long long c = 1;
        res[i][0] = 1;
        for (int j = 1; j <= i; j++) { c = c * (i - j + 1) / j; res[i][j] = (int)c; }
    }
    *returnSize = numRows;
    return res;
}`,
        cpp: `vector<vector<int>> generate(int numRows) {
    vector<vector<int>> res;
    for (int i = 0; i < numRows; i++) {
        vector<int> row{1};
        long long c = 1;
        for (int j = 1; j <= i; j++) { c = c * (i - j + 1) / j; row.push_back(c); }
        res.push_back(row);
    }
    return res;
}`,
        java: `List<List<Integer>> generate(int numRows) {
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < numRows; i++) {
        List<Integer> row = new ArrayList<>();
        long c = 1;
        row.add(1);
        for (int j = 1; j <= i; j++) { c = c * (i - j + 1) / j; row.add((int) c); }
        res.add(row);
    }
    return res;
}`,
        javascript: `function generate(numRows) {
  const res = [];
  for (let i = 0; i < numRows; i++) {
    const row = [1];
    let c = 1;
    for (let j = 1; j <= i; j++) {
      c = (c * (i - j + 1)) / j;
      row.push(c);
    }
    res.push(row);
  }
  return res;
}`,
      },
    },
  ],
  pitfalls: ['公式先除後乘:`c / j * (i − j + 1)` 可能不整除', '第 0、1 列沒有「中間」,迴圈範圍要小心'],
  check: {
    kind: 'fn',
    fn: 'generate',
    cases: [
      { args: [R], out: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]] },
      { args: [1], out: [[1]] },
      { args: [2], out: [[1], [1, 1]] },
    ],
  },
}
