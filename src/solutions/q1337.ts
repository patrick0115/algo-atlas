import { arr } from '../engine/helpers'
import type { Solution } from './types'

const M = [[1, 1, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 1, 1, 1, 1]]

export const q1337: Solution = {
  id: 1337,
  plain: '每排左邊是士兵、右邊是平民；挑出士兵最少的 k 排。',
  statement: '給只含 0、1 的矩陣 mat，每列的 1 都在 0 前面。按士兵數由少到多、同數時按列索引由小到大，回傳前 k 列的索引。',
  examples: [{ input: 'mat = [[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]], k = 3', output: '[2,0,3]' }],
  constraints: ['矩陣最多 100×100；1 ≤ k ≤ 列數。'],
  insight: ['每列的強度就是 1 的個數。', '因為 1 都在左邊，也能用 [[p:binary-search]] 找第一個 0。'],
  approaches: [
    {
      name: '逐列計數並排序',
      idea: '記下每列的「士兵數、原索引」，按這兩個欄位排序。',
      steps: ['逐列加總 1 的數量', '建立 (數量, 索引) 配對', '先按數量、再按索引排序', '取前 k 個索引'],
      figure: { title: '五列矩陣，k = 3', steps: [
        { note: '第 0 列有 2 人，第 1 列有 4 人。', views: [arr([2, 4], { label: '前兩列人數' })] },
        { note: '接著三列分別有 1、2、5 人。', views: [arr([2, 4, 1, 2, 5], { label: '各列人數' })] },
        { note: '依人數排序，同為 2 人時索引 0 排在 3 前面。', views: [arr([2, 0, 3, 1, 4], { label: '由弱到強的索引', highlight: [0, 1, 2] })] },
        { note: '取前三列，答案是 [2,0,3]。', views: [arr([2, 0, 3], { label: '答案', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(mn + m log m)', space: 'O(m)', why: '逐格計數，再對 m 列排序。' },
      verdict: '最容易寫對，矩陣尺寸也很小。',
      code: {
        python: `def kWeakestRows(mat, k):
    ranked = []
    for index, row in enumerate(mat):
        ranked.append((sum(row), index))  # 同數量時索引會排前面
    ranked.sort()
    return [index for _, index in ranked[:k]]`,
        c: `static int compare1337(const void *a, const void *b) {
    const int *x = a;
    const int *y = b;
    if (x[0] != y[0]) {
        return x[0] - y[0];
    }
    return x[1] - y[1];
}

int *kWeakestRows(int **mat, int matSize, int *matColSize, int k, int *returnSize) {
    int (*ranked)[2] = malloc(matSize * sizeof(*ranked));
    for (int i = 0; i < matSize; i++) {
        int count = 0;
        for (int j = 0; j < matColSize[i]; j++) {
            count += mat[i][j];
        }
        ranked[i][0] = count;
        ranked[i][1] = i;
    }
    qsort(ranked, matSize, sizeof(*ranked), compare1337);
    int *answer = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) {
        answer[i] = ranked[i][1];
    }
    free(ranked);
    *returnSize = k;
    return answer;
}`,
        cpp: `vector<int> kWeakestRows(vector<vector<int>>& mat, int k) {
    vector<pair<int, int>> ranked;
    for (int i = 0; i < (int)mat.size(); i++) {
        int count = accumulate(mat[i].begin(), mat[i].end(), 0);
        ranked.push_back({count, i});
    }
    sort(ranked.begin(), ranked.end());
    vector<int> answer;
    for (int i = 0; i < k; i++) {
        answer.push_back(ranked[i].second);
    }
    return answer;
}`,
        java: `int[] kWeakestRows(int[][] mat, int k) {
    int[][] ranked = new int[mat.length][2];
    for (int i = 0; i < mat.length; i++) {
        int count = 0;
        for (int value : mat[i]) {
            count += value;
        }
        ranked[i][0] = count;
        ranked[i][1] = i;
    }
    Arrays.sort(ranked, (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    int[] answer = new int[k];
    for (int i = 0; i < k; i++) {
        answer[i] = ranked[i][1];
    }
    return answer;
}`,
        javascript: `function kWeakestRows(mat, k) {
  const ranked = mat.map((row, i) => [row.reduce((sum, x) => sum + x, 0), i]);
  ranked.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const answer = [];
  for (let i = 0; i < k; i++) {
    answer.push(ranked[i][1]);
  }
  return answer;
}`,
      },
    },
    {
      name: '二分計數並排序',
      idea: '每列已排成先 1 後 0；第一個 0 的位置就是士兵數。',
      steps: ['每列用二分找第一個 0', '以該位置為士兵數', '將 (人數, 索引) 排序', '回傳前 k 列索引'],
      figure: { title: '第 1 列 [1,1,1,1,0]', steps: [
        { note: '第 1 列的搜尋範圍是索引 0 到 5。', views: [arr([1, 1, 1, 1, 0], { label: '第 1 列' })] },
        { note: '查中點 2，仍是 1，第一個 0 必在右側。', views: [arr([1, 1, 1, 1, 0], { label: '第 1 列', highlight: [2] })] },
        { note: '查中點 4，看到 0，邊界左縮，最後停在 4。', views: [arr([1, 1, 1, 1, 0], { label: '第 1 列', highlight: [4] })] },
        { note: '此列士兵數為 4；其他列同法得到 [2,4,1,2,5]，排序後取前三列。', views: [arr([2, 0, 3], { label: '答案', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(m log n + m log m)', space: 'O(m)', why: '每列二分，再排序 m 筆資料。' },
      verdict: '當列很長時，可利用既有的排序性。',
      code: {
        python: `def kWeakestRows(mat, k):
    ranked = []
    for index, row in enumerate(mat):
        left, right = 0, len(row)
        while left < right:
            middle = (left + right) // 2
            if row[middle] == 1:
                left = middle + 1
            else:
                right = middle
        ranked.append((left, index))  # 第一個 0 的索引
    ranked.sort()
    return [index for _, index in ranked[:k]]`,
        c: `static int compare1337(const void *a, const void *b) {
    const int *x = a;
    const int *y = b;
    if (x[0] != y[0]) {
        return x[0] - y[0];
    }
    return x[1] - y[1];
}

int *kWeakestRows(int **mat, int matSize, int *matColSize, int k, int *returnSize) {
    int (*ranked)[2] = malloc(matSize * sizeof(*ranked));
    for (int i = 0; i < matSize; i++) {
        int left = 0;
        int right = matColSize[i];
        while (left < right) {
            int middle = left + (right - left) / 2;
            if (mat[i][middle] == 1) {
                left = middle + 1;
            } else {
                right = middle;
            }
        }
        ranked[i][0] = left;
        ranked[i][1] = i;
    }
    qsort(ranked, matSize, sizeof(*ranked), compare1337);
    int *answer = malloc(k * sizeof(int));
    for (int i = 0; i < k; i++) {
        answer[i] = ranked[i][1];
    }
    free(ranked);
    *returnSize = k;
    return answer;
}`,
        cpp: `vector<int> kWeakestRows(vector<vector<int>>& mat, int k) {
    vector<pair<int, int>> ranked;
    for (int i = 0; i < (int)mat.size(); i++) {
        int left = 0;
        int right = mat[i].size();
        while (left < right) {
            int middle = left + (right - left) / 2;
            if (mat[i][middle] == 1) {
                left = middle + 1;
            } else {
                right = middle;
            }
        }
        ranked.push_back({left, i});
    }
    sort(ranked.begin(), ranked.end());
    vector<int> answer;
    for (int i = 0; i < k; i++) {
        answer.push_back(ranked[i].second);
    }
    return answer;
}`,
        java: `int[] kWeakestRows(int[][] mat, int k) {
    int[][] ranked = new int[mat.length][2];
    for (int i = 0; i < mat.length; i++) {
        int left = 0;
        int right = mat[i].length;
        while (left < right) {
            int middle = left + (right - left) / 2;
            if (mat[i][middle] == 1) {
                left = middle + 1;
            } else {
                right = middle;
            }
        }
        ranked[i][0] = left;
        ranked[i][1] = i;
    }
    Arrays.sort(ranked, (a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
    int[] answer = new int[k];
    for (int i = 0; i < k; i++) {
        answer[i] = ranked[i][1];
    }
    return answer;
}`,
        javascript: `function kWeakestRows(mat, k) {
  const ranked = [];
  for (let i = 0; i < mat.length; i++) {
    let left = 0;
    let right = mat[i].length;
    while (left < right) {
      const middle = Math.floor((left + right) / 2);
      if (mat[i][middle] === 1) {
        left = middle + 1;
      } else {
        right = middle;
      }
    }
    ranked.push([left, i]);
  }
  ranked.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return ranked.slice(0, k).map((pair) => pair[1]);
}`,
      },
    },
  ],
  pitfalls: ['士兵數相同時，較小的列索引必須先輸出。', '全 1 的列沒有 0，二分應回傳整列長度。'],
  check: { kind: 'fn', fn: 'kWeakestRows', cases: [
    { args: [M, 3], out: [2, 0, 3] },
    { args: [[[1, 0], [0, 0], [1, 1]], 2], out: [1, 0] },
  ] },
}
