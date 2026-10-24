import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const dpFig: FigStep[] = [
  { note: '第 0 列只有 [1]；每一列左右端都為 1。', views: [arr([1], { label: '第 0 列' })] },
  { note: '加入第 1 列的右端 1，得到 [1,1]。', views: [arr([1, 1], { label: '第 1 列' })] },
  { note: '第 2 列從右往左更新內部：1+1=2，得到 [1,2,1]。', views: [arr([1, 2, 1], { label: '第 2 列', highlight: [1] })] },
  { note: '第 3 列得 [1,3,3,1]；第 4 列依序變成 [1,4,6,4,1]。', views: [arr([1, 3, 3, 1], { label: '第 3 列' }), arr([1, 4, 6, 4, 1], { label: '答案', done: [0, 1, 2, 3, 4] })] },
]
const mathFig: FigStep[] = [
  { note: '第 4 列的第 k 個值是組合數 C(4,k)；先從 C(4,0)=1 開始。', views: [arr([1], { label: '目前列' })] },
  { note: '用 C(4,1)=C(4,0)×4/1 得到 4。', views: [arr([1, 4], { label: '目前列', highlight: [1] })] },
  { note: '接著 C(4,2)=4×3/2=6，從前一項直接推出下一項。', views: [arr([1, 4, 6], { label: '目前列', highlight: [2] })] },
  { note: '繼續得到 C(4,3)=4、C(4,4)=1，答案為 [1,4,6,4,1]。', views: [arr([1, 4, 6, 4, 1], { label: '答案', done: [0, 1, 2, 3, 4] })] },
]

export const q0119: Solution = {
  id: 119,
  plain: '只產生楊輝三角形指定的那一列。',
  statement: '第 0 列是 [1]；每列內部元素等於上一列正上方兩個元素的和。給定 rowIndex，回傳該列。',
  examples: [{ input: 'rowIndex = 3', output: '[1,3,3,1]' }, { input: 'rowIndex = 0', output: '[1]' }, { input: 'rowIndex = 1', output: '[1,1]' }],
  constraints: ['0 ≤ rowIndex ≤ 33'],
  insight: ['每列只依賴上一列，可重複使用同一陣列。', '原地更新要由右到左，避免左邊的新值污染尚未計算的位置。', '第 n 列的元素也等於組合數 C(n,k)。'],
  approaches: [
    {
      name: '由右往左原地更新',
      idea: '每列先在尾端加 1，再由右往左把內部元素更新為自己加左鄰。',
      steps: ['row 先設為 [1]', '每往下一列在尾端加 1', '從倒數第二格往左到索引 1，加上左鄰', '重複到指定列'],
      figure: { title: 'rowIndex = 4', steps: dpFig },
      complexity: { time: 'O(k²)', space: 'O(k)', why: '第 r 列更新 r−1 個內部元素，只保留一列。' },
      verdict: '最貼近定義的 [[p:dp-1d]] 寫法。',
      code: {
        python: `def getRow(rowIndex):
    row = [1]
    for depth in range(1, rowIndex + 1):
        row.append(1)                    # 新列右端
        for j in range(depth - 1, 0, -1):
            row[j] += row[j - 1]         # 由右往左保留舊值
    return row`,
        c: `int *getRow(int rowIndex, int *returnSize) {
    int *row = calloc(rowIndex + 1, sizeof(int));
    row[0] = 1;
    for (int depth = 1; depth <= rowIndex; depth++) {
        row[depth] = 1;
        for (int j = depth - 1; j > 0; j--) {
            row[j] += row[j - 1];
        }
    }
    *returnSize = rowIndex + 1;
    return row;
}`,
        cpp: `vector<int> getRow(int rowIndex) {
    vector<int> row = {1};
    for (int depth = 1; depth <= rowIndex; depth++) {
        row.push_back(1);
        for (int j = depth - 1; j > 0; j--) {
            row[j] += row[j - 1];
        }
    }
    return row;
}`,
        java: `List<Integer> getRow(int rowIndex) {
    List<Integer> row = new ArrayList<>();
    row.add(1);
    for (int depth = 1; depth <= rowIndex; depth++) {
        row.add(1);
        for (int j = depth - 1; j > 0; j--) {
            row.set(j, row.get(j) + row.get(j - 1));
        }
    }
    return row;
}`,
        javascript: `function getRow(rowIndex) {
  const row = [1];
  for (let depth = 1; depth <= rowIndex; depth++) {
    row.push(1);
    for (let j = depth - 1; j > 0; j--) {
      row[j] += row[j - 1];
    }
  }
  return row;
}`,
      },
    },
    {
      name: '組合數遞推',
      idea: '從 C(n,0)=1 開始；下一項等於目前值乘以 n−k+1，再除以 k。',
      steps: ['value=1，答案先放 1', '對 k=1..rowIndex', 'value 乘以 n−k+1，再除以 k', '把 value 加入答案'],
      figure: { title: 'rowIndex = 4', steps: mathFig },
      complexity: { time: 'O(k)', space: 'O(k)', why: '每個元素直接從前一個推出。' },
      verdict: '更快的 [[p:math]] 寫法；中間乘法應用較寬整數型別。',
      code: {
        python: `def getRow(rowIndex):
    row = [1]
    value = 1
    for k in range(1, rowIndex + 1):
        value = value * (rowIndex - k + 1) // k  # 組合數比值
        row.append(value)
    return row`,
        c: `int *getRow(int rowIndex, int *returnSize) {
    int *row = malloc((rowIndex + 1) * sizeof(int));
    long long value = 1;
    row[0] = 1;
    for (int k = 1; k <= rowIndex; k++) {
        value = value * (rowIndex - k + 1) / k;
        row[k] = (int)value;
    }
    *returnSize = rowIndex + 1;
    return row;
}`,
        cpp: `vector<int> getRow(int rowIndex) {
    vector<int> row;
    long long value = 1;
    row.push_back(1);
    for (int k = 1; k <= rowIndex; k++) {
        value = value * (rowIndex - k + 1) / k;
        row.push_back(value);
    }
    return row;
}`,
        java: `List<Integer> getRow(int rowIndex) {
    List<Integer> row = new ArrayList<>();
    long value = 1;
    row.add(1);
    for (int k = 1; k <= rowIndex; k++) {
        value = value * (rowIndex - k + 1) / k;
        row.add((int) value);
    }
    return row;
}`,
        javascript: `function getRow(rowIndex) {
  const row = [1];
  let value = 1;
  for (let k = 1; k <= rowIndex; k++) {
    value = value * (rowIndex - k + 1) / k;
    row.push(value);
  }
  return row;
}`,
      },
    },
  ],
  pitfalls: ['第 0 列是 [1]。', '原地 DP 若由左往右更新，會錯用本列的新值。', '組合數中間乘法可能比結果大，C、C++、Java 要用長整數。'],
  check: { kind: 'fn', fn: 'getRow', cases: [
    { args: [0], out: [1] },
    { args: [1], out: [1, 1] },
    { args: [3], out: [1, 3, 3, 1] },
    { args: [4], out: [1, 4, 6, 4, 1] },
  ] },
}
