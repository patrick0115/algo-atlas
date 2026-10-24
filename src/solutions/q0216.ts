import { arr } from '../engine/helpers'
import type { Solution } from './types'

export const q0216: Solution = {
  id: 216,
  plain: '從 1 到 9 不重複挑 k 個數，列出所有加起來剛好是 n 的組合。',
  statement: '每個數字 1..9 最多使用一次，找出所有恰好 k 個數且總和為 n 的組合。組合內順序不重要。',
  examples: [{ input: 'k = 3, n = 7', output: '[[1,2,4]]' }, { input: 'k = 3, n = 9', output: '[[1,2,6],[1,3,5],[2,3,4]]' }],
  constraints: ['候選數只有 1..9，每組數字互異；答案中不能出現同一組的不同排列。'],
  insight: ['每次只選比上一個更大的數，就不會重複排列。', '選滿 k 個時檢查總和；若途中總和已超過 n，可以停止該分支。', '這是 [[p:backtracking]]，也可枚舉 9 個位元的所有子集合。'],
  approaches: [
    {
      name: '回溯選下一個數',
      idea: '從小到大選數，記錄目前組合與剩餘總和。',
      steps: ['從 `start=1`、空組合、剩餘 n 開始', '嘗試 start..9 的每個候選數', '選入後遞迴搜尋更大的數，再撤銷選擇', '選滿 k 個且剩餘 0 時記錄'],
      figure: { title: 'k=3, n=7', steps: [
        { note: '先選 1，還需要兩個數湊出 6。', views: [arr([1], { label: '已選', done: [0] }), arr([6], { label: '剩餘' })] },
        { note: '再選 2，還要一個數湊出 4。', views: [arr([1, 2], { label: '已選', done: [0, 1] }), arr([4], { label: '剩餘' })] },
        { note: '選 3 得 1+2+3=6，不夠；回溯改選 4，正好得到 7。', views: [arr([1, 2, 4], { label: '已選', done: [0, 1, 2] })] },
        { note: '其他分支都無法在三個互異數下湊成 7；唯一答案是 [1,2,4]。', views: [arr(['1,2,4'], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(2⁹ × k)', space: 'O(k)，不含答案', why: '每個數只有選或不選兩種可能，複製答案需 O(k)。' },
      verdict: '推薦；start 保證遞增，天然避免重複。',
      code: {
        python: `def combinationSum3(k, n):
    ans = []
    path = []

    def dfs(start, remain):
        if len(path) == k:
            if remain == 0:
                ans.append(path[:])  # 複製這組完成的答案
            return
        for value in range(start, 10):
            if value > remain:
                break
            path.append(value)
            dfs(value + 1, remain - value)
            path.pop()

    dfs(1, n)
    return ans`,
        c: `static void combDfs(int start, int remain, int k, int *path, int len, int ***ans, int **cols, int *count) {
    if (len == k) {
        if (remain == 0) {
            (*ans)[*count] = malloc(k * sizeof(int));
            memcpy((*ans)[*count], path, k * sizeof(int));
            (*cols)[(*count)++] = k;
        }
        return;
    }
    for (int value = start; value <= 9 && value <= remain; value++) {
        path[len] = value;
        combDfs(value + 1, remain - value, k, path, len + 1, ans, cols, count);
    }
}

int **combinationSum3(int k, int n, int *returnSize, int **returnColumnSizes) {
    int **ans = malloc(512 * sizeof(int *));
    *returnColumnSizes = malloc(512 * sizeof(int));
    *returnSize = 0;
    int path[9];
    combDfs(1, n, k, path, 0, &ans, returnColumnSizes, returnSize);
    return ans;
}`,
        cpp: `vector<vector<int>> combinationSum3(int k, int n) {
    vector<vector<int>> ans;
    vector<int> path;
    function<void(int, int)> dfs = [&](int start, int remain) {
        if ((int)path.size() == k) {
            if (remain == 0) ans.push_back(path);
            return;
        }
        for (int value = start; value <= 9 && value <= remain; value++) {
            path.push_back(value);
            dfs(value + 1, remain - value);
            path.pop_back();
        }
    };
    dfs(1, n);
    return ans;
}`,
        java: `List<List<Integer>> combinationSum3(int k, int n) {
    List<List<Integer>> ans = new ArrayList<>();
    combDfs(1, n, k, new ArrayList<>(), ans);
    return ans;
}

void combDfs(int start, int remain, int k, List<Integer> path, List<List<Integer>> ans) {
    if (path.size() == k) {
        if (remain == 0) ans.add(new ArrayList<>(path));
        return;
    }
    for (int value = start; value <= 9 && value <= remain; value++) {
        path.add(value);
        combDfs(value + 1, remain - value, k, path, ans);
        path.remove(path.size() - 1);
    }
}`,
        javascript: `function combinationSum3(k, n) {
  const ans = [], path = [];
  function dfs(start, remain) {
    if (path.length === k) {
      if (remain === 0) ans.push([...path]);
      return;
    }
    for (let value = start; value <= 9 && value <= remain; value++) {
      path.push(value);
      dfs(value + 1, remain - value);
      path.pop();
    }
  }
  dfs(1, n);
  return ans;
}`,
      },
    },
    {
      name: '九位元子集合枚舉',
      idea: '位元 0..8 各代表數字 1..9 是否入選，檢查所有 512 個遮罩。',
      steps: ['mask 從 0 走到 511', '抽出設為 1 的位元所對應的數字', '個數等於 k 且總和等於 n 時記錄'],
      figure: { title: 'k=3, n=7', steps: [
        { note: '每個位元表示一個候選數；例如選 1、2、3 的遮罩可展開為 [1,2,3]。', views: [arr([1, 2, 3], { label: '候選組合' }), arr([6], { label: '總和' })] },
        { note: '[1,2,3] 雖然有三個數，但總和 6，不符合 n=7。', views: [arr([1, 2, 3], { dim: [0, 1, 2] })] },
        { note: '選 1、2、4 的遮罩展開為 [1,2,4]，個數 3、總和 7。', views: [arr([1, 2, 4], { label: '候選組合', done: [0, 1, 2] })] },
        { note: '掃完所有遮罩，只保留符合兩個條件的組合。', views: [arr(['1,2,4'], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(2⁹ × 9)', space: 'O(9)，不含答案', why: '512 個遮罩各檢查 9 個位元。' },
      verdict: '候選範圍固定很小時可用；更大範圍通常選回溯。',
      code: {
        python: `def combinationSum3(k, n):
    ans = []
    for mask in range(1 << 9):
        values = [i + 1 for i in range(9) if mask & (1 << i)]
        if len(values) == k and sum(values) == n:
            ans.append(values)  # 位元對應的數字天然遞增
    return ans`,
        c: `int **combinationSum3(int k, int n, int *returnSize, int **returnColumnSizes) {
    int **ans = malloc(512 * sizeof(int *));
    *returnColumnSizes = malloc(512 * sizeof(int));
    *returnSize = 0;
    for (int mask = 0; mask < (1 << 9); mask++) {
        int values[9], size = 0, sum = 0;
        for (int bit = 0; bit < 9; bit++) {
            if (mask & (1 << bit)) {
                values[size++] = bit + 1;
                sum += bit + 1;
            }
        }
        if (size == k && sum == n) {
            ans[*returnSize] = malloc(k * sizeof(int));
            memcpy(ans[*returnSize], values, k * sizeof(int));
            (*returnColumnSizes)[(*returnSize)++] = k;
        }
    }
    return ans;
}`,
        cpp: `vector<vector<int>> combinationSum3(int k, int n) {
    vector<vector<int>> ans;
    for (int mask = 0; mask < (1 << 9); mask++) {
        vector<int> values;
        int sum = 0;
        for (int bit = 0; bit < 9; bit++) {
            if (mask & (1 << bit)) {
                values.push_back(bit + 1);
                sum += bit + 1;
            }
        }
        if ((int)values.size() == k && sum == n) ans.push_back(values);
    }
    return ans;
}`,
        java: `List<List<Integer>> combinationSum3(int k, int n) {
    List<List<Integer>> ans = new ArrayList<>();
    for (int mask = 0; mask < (1 << 9); mask++) {
        List<Integer> values = new ArrayList<>();
        int sum = 0;
        for (int bit = 0; bit < 9; bit++) {
            if ((mask & (1 << bit)) != 0) {
                values.add(bit + 1);
                sum += bit + 1;
            }
        }
        if (values.size() == k && sum == n) ans.add(values);
    }
    return ans;
}`,
        javascript: `function combinationSum3(k, n) {
  const ans = [];
  for (let mask = 0; mask < (1 << 9); mask++) {
    const values = [];
    let sum = 0;
    for (let bit = 0; bit < 9; bit++) {
      if (mask & (1 << bit)) {
        values.push(bit + 1);
        sum += bit + 1;
      }
    }
    if (values.length === k && sum === n) ans.push(values);
  }
  return ans;
}`,
      },
    },
  ],
  pitfalls: ['選滿 k 個但總和不等於 n 不能加入答案。', '回溯時若下一輪仍從同一數字開始，就會重複使用該數字。'],
  check: { kind: 'fn', fn: 'combinationSum3', compare: 'groups', cases: [
    { args: [3, 7], out: [[1, 2, 4]] },
    { args: [3, 9], out: [[1, 2, 6], [1, 3, 5], [2, 3, 4]] },
    { args: [4, 1], out: [] },
  ] },
}
