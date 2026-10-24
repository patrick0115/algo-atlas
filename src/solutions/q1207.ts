import { arr } from '../engine/helpers'
import type { Solution } from './types'

// 1207. Unique Number of Occurrences
const A = [1, 2, 2, 1, 1, 3]

export const q1207: Solution = {
  id: 1207,
  plain: '先數每個數字出現幾次，再問：有沒有兩種不同的數字，剛好出現一樣多次？沒有才回傳 true。',
  statement: '給整數陣列 arr，若所有不同數值的出現次數都互不相同，回傳 true；否則回傳 false。',
  examples: [
    { input: 'arr = [1,2,2,1,1,3]', output: 'true', note: '1、2、3 分別出現 3、2、1 次。' },
    { input: 'arr = [1,2]', output: 'false' },
    { input: 'arr = [-3,0,1,-3,1,1,1,-3,10,0]', output: 'true' },
  ],
  constraints: ['1 ≤ arr.length ≤ 1000；-1000 ≤ arr[i] ≤ 1000。'],
  insight: ['先將原陣列轉成「數值 → 次數」，再檢查次數有沒有重複。', '有界值域可以使用固定陣列計數；排序後也可以把同值聚在一起。'],
  approaches: [
    {
      name: '計數陣列與次數集合',
      idea: '用偏移量把負數轉成陣列索引，計數後逐一把非零次數放進集合。',
      steps: ['準備 2001 格計數陣列；數值 x 對應 x + 1000。', '走過 arr，累加每個數值的次數。', '若某個非零次數已在集合中，立即回傳 false；否則放入。', '全部檢查完回傳 true。'],
      figure: { title: 'arr = [1,2,2,1,1,3]', steps: [
        { note: '讀第一個 1，記錄 1 目前出現 1 次。', views: [arr(A, { highlight: [0], dim: [1, 2, 3, 4, 5] })] },
        { note: '讀完第二個 2，它的次數是 2；1 暫時還是 1 次。', views: [arr(A, { done: [0, 1, 2], dim: [3, 4, 5] })] },
        { note: '讀完整列後，1 有 3 次、2 有 2 次、3 有 1 次。', views: [arr([3, 2, 1], { label: '1 / 2 / 3 的次數' })] },
        { note: '依序把 3、2、1 放入集合，沒有碰到重複次數，所以是 true。', views: [arr([3, 2, 1], { label: '已檢查的次數', done: [0, 1, 2] })] },
      ] },
      complexity: { time: 'O(n + 2001)', space: 'O(2001)', why: '值域固定，掃描計數陣列至多 2001 格。' },
      verdict: '利用題目給的值域，實作直接。',
      code: {
        python: `def uniqueOccurrences(arr):
    count = [0] * 2001
    for x in arr:
        count[x + 1000] += 1  # 負數平移成合法索引
    seen = set()
    for times in count:
        if times == 0:
            continue
        if times in seen:
            return False  # 兩個數字的出現次數相同
        seen.add(times)
    return True`,
        c: `bool uniqueOccurrences(int *arr, int arrSize) {
    int count[2001] = {0};
    bool seen[1001] = {false};
    for (int i = 0; i < arrSize; i++) {
        count[arr[i] + 1000]++;
    }
    for (int i = 0; i < 2001; i++) {
        int times = count[i];
        if (times == 0) {
            continue;
        }
        if (seen[times]) {
            return false;
        }
        seen[times] = true;
    }
    return true;
}`,
        cpp: `bool uniqueOccurrences(vector<int>& arr) {
    vector<int> count(2001, 0);
    for (int x : arr) {
        count[x + 1000]++;
    }
    unordered_set<int> seen;
    for (int times : count) {
        if (times > 0 && !seen.insert(times).second) {
            return false;
        }
    }
    return true;
}`,
        java: `boolean uniqueOccurrences(int[] arr) {
    int[] count = new int[2001];
    for (int x : arr) {
        count[x + 1000]++;
    }
    Set<Integer> seen = new HashSet<>();
    for (int times : count) {
        if (times > 0 && !seen.add(times)) {
            return false;
        }
    }
    return true;
}`,
        javascript: `function uniqueOccurrences(arr) {
  const count = new Array(2001).fill(0);
  for (const x of arr) {
    count[x + 1000]++;
  }
  const seen = new Set();
  for (const times of count) {
    if (times === 0) {
      continue;
    }
    if (seen.has(times)) {
      return false;
    }
    seen.add(times);
  }
  return true;
}`,
      },
    },
    {
      name: '排序後統計連續段',
      idea: '排序會讓相同的數字相鄰；每段長度就是該數字的出現次數。',
      steps: ['先排序 arr。', '從左到右找出每段相同數值的範圍。', '把段長放入集合；若已存在就回傳 false。', '走完所有段回傳 true。'],
      figure: { title: 'arr = [1,2,2,1,1,3]', steps: [
        { note: '先排序，相同數值會排在一起。', views: [arr([1, 1, 1, 2, 2, 3])] },
        { note: '第一段有三個 1，把長度 3 記下來。', views: [arr([1, 1, 1, 2, 2, 3], { done: [0, 1, 2] })] },
        { note: '第二段有兩個 2，長度 2 與 3 不同。', views: [arr([1, 1, 1, 2, 2, 3], { done: [0, 1, 2], highlight: [3, 4] })] },
        { note: '最後一段只有一個 3，長度 1 也沒重複。', views: [arr([1, 1, 1, 2, 2, 3], { done: [0, 1, 2, 3, 4], highlight: [5] })] },
      ] },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序耗時 O(n log n)，集合至多存 n 個段長。' },
      verdict: '不依賴數值範圍；若不想改動輸入，先複製再排序。',
      code: {
        python: `def uniqueOccurrences(arr):
    values = sorted(arr)
    seen = set()
    i = 0
    while i < len(values):
        j = i + 1
        while j < len(values) and values[j] == values[i]:
            j += 1
        times = j - i  # 這一整段是同一個數字
        if times in seen:
            return False
        seen.add(times)
        i = j
    return True`,
        c: `static int compareInt(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

bool uniqueOccurrences(int *arr, int arrSize) {
    int *values = malloc(arrSize * sizeof(int));
    memcpy(values, arr, arrSize * sizeof(int));
    qsort(values, arrSize, sizeof(int), compareInt);
    bool seen[1001] = {false};
    int i = 0;
    while (i < arrSize) {
        int j = i + 1;
        while (j < arrSize && values[j] == values[i]) {
            j++;
        }
        int times = j - i;
        if (seen[times]) {
            free(values);
            return false;
        }
        seen[times] = true;
        i = j;
    }
    free(values);
    return true;
}`,
        cpp: `bool uniqueOccurrences(vector<int>& arr) {
    vector<int> values = arr;
    sort(values.begin(), values.end());
    unordered_set<int> seen;
    int i = 0;
    while (i < (int)values.size()) {
        int j = i + 1;
        while (j < (int)values.size() && values[j] == values[i]) {
            j++;
        }
        if (!seen.insert(j - i).second) {
            return false;
        }
        i = j;
    }
    return true;
}`,
        java: `boolean uniqueOccurrences(int[] arr) {
    int[] values = arr.clone();
    Arrays.sort(values);
    Set<Integer> seen = new HashSet<>();
    int i = 0;
    while (i < values.length) {
        int j = i + 1;
        while (j < values.length && values[j] == values[i]) {
            j++;
        }
        if (!seen.add(j - i)) {
            return false;
        }
        i = j;
    }
    return true;
}`,
        javascript: `function uniqueOccurrences(arr) {
  const values = [...arr].sort((a, b) => a - b);
  const seen = new Set();
  let i = 0;
  while (i < values.length) {
    let j = i + 1;
    while (j < values.length && values[j] === values[i]) {
      j++;
    }
    if (seen.has(j - i)) {
      return false;
    }
    seen.add(j - i);
    i = j;
  }
  return true;
}`,
      },
    },
  ],
  pitfalls: ['次數為 0 的值沒有出現，不能納入比較。', '排序 JavaScript 數字時要提供數值比較函式。'],
  check: { kind: 'fn', fn: 'uniqueOccurrences', cases: [
    { args: [A], out: true },
    { args: [[1, 2]], out: false },
    { args: [[-3, 0, 1, -3, 1, 1, 1, -3, 10, 0]], out: true },
    { args: [[7]], out: true },
  ] },
}
