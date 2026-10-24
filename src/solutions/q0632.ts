import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const LISTS = [[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]

function pointersFig(): FigStep[] {
  return [
    { note: '三列的起始值是 4、0、5，涵蓋它們的範圍是 [0,5]。最小值來自第二列。', views: [arr([4, 0, 5], { label: '目前三列的值', highlight: [1] })] },
    { note: '只推進最小值所在的第二列，變成 4、9、5；新範圍 [4,9]。若移動其他列，左界 0 不會變。', views: [arr([4, 9, 5], { label: '目前三列的值', highlight: [0] })] },
    { note: '繼續每次推進目前最小值所在列；途中會比較 [9,15]、[18,24] 等候選。', views: [arr([24, 20, 22], { label: '接近答案的三列值', highlight: [1] })] },
    { note: '三列值 24、20、22 落在 [20,24]，長度 4；後續沒有更短範圍，回傳 [20,24]。', views: [arr([20, 24], { label: '答案', done: [0, 1] })] },
  ]
}

function windowFig(): FigStep[] {
  return [
    { note: '將每個值與來源列一起攤平排序，開頭是 0(B)、4(A)、5(C)、9(B)。', views: [arr(['0B', '4A', '5C', '9B'], { label: '排序後前四項' })] },
    { note: '右端讀到 5(C) 時，視窗 [0,5] 首次包含 A、B、C 三列。', views: [arr(['0B', '4A', '5C'], { label: '有效視窗', done: [0, 1, 2] })] },
    { note: '後來右端讀到 24(A)，左端縮到 20(B)；視窗內還有 22(C)。', views: [arr(['20B', '22C', '24A'], { label: '縮小後視窗', done: [0, 1, 2] })] },
    { note: '此時範圍 [20,24] 長度 4，比先前候選短，最終回傳它。', views: [arr([20, 24], { label: '答案', done: [0, 1] })] },
  ]
}

export const q0632: Solution = {
  id: 632,
  plain: '從每個已排序清單至少選到一個數，找能同時包住這些數的最短整數區間。',
  statement: '給 k 個遞增整數清單 nums，找閉區間 [a,b]，使每個清單至少有一個元素在其中。先比較區間長度 b−a；長度相同時選 a 較小者。',
  examples: [
    { input: 'nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]', output: '[20,24]' },
    { input: 'nums = [[1,2,3],[1,2,3],[1,2,3]]', output: '[1,1]' },
  ],
  constraints: ['1 ≤ 清單數 ≤ 3500；每個清單非空且已依遞增順序排列。'],
  insight: ['若目前每列各選一個值，候選範圍是其中最小值到最大值。', '要使左界前進，只能推進目前最小值所在列；另一種做法是將所有值排序後用滑動視窗覆蓋所有來源列。'],
  approaches: [
    {
      name: '每列指標逐步前進',
      idea: '每次看 k 個指標指向的值，記錄範圍，然後只推進其中最小的一列。',
      steps: ['每列指標從 0 開始。', '找目前最小值與最大值並更新答案。', '推進最小值所在列；若該列走完，搜尋結束。'],
      figure: { title: '三列逐步選值', steps: pointersFig() },
      complexity: { time: 'O(kN)', space: 'O(k)', why: '總共推進 N 次，每次線性掃描 k 列的目前值。' },
      verdict: '思路最直接；清單數很多時可用最小堆優化找最小值。',
      code: {
        python: `def smallestRange(nums):
    positions = [0] * len(nums)
    answer = [0, float('inf')]
    while True:
        values = [nums[i][positions[i]] for i in range(len(nums))]
        smallest = min(values)
        largest = max(values)
        if largest - smallest < answer[1] - answer[0] or (largest - smallest == answer[1] - answer[0] and smallest < answer[0]):
            answer = [smallest, largest]  # 所有清單都被目前範圍涵蓋
        row = values.index(smallest)
        positions[row] += 1               # 只能推進目前最小的一列
        if positions[row] == len(nums[row]):
            return answer`,
        c: `int *smallestRange(int **nums, int numsSize, int *numsColSize, int *returnSize) {
    int *positions = calloc(numsSize, sizeof(int));
    int *answer = malloc(2 * sizeof(int));
    int bestWidth = INT_MAX;
    while (true) {
        int smallest = INT_MAX, largest = INT_MIN, row = -1;
        for (int i = 0; i < numsSize; i++) {
            int value = nums[i][positions[i]];
            if (value < smallest) {
                smallest = value;
                row = i;
            }
            if (value > largest) {
                largest = value;
            }
        }
        int width = largest - smallest;
        if (width < bestWidth || (width == bestWidth && smallest < answer[0])) {
            bestWidth = width;
            answer[0] = smallest;
            answer[1] = largest;
        }
        positions[row]++;
        if (positions[row] == numsColSize[row]) {
            break;
        }
    }
    free(positions);
    *returnSize = 2;
    return answer;
}`,
        cpp: `vector<int> smallestRange(vector<vector<int>>& nums) {
    int k = nums.size();
    vector<int> positions(k, 0);
    vector<int> answer{0, INT_MAX};
    while (true) {
        int smallest = INT_MAX, largest = INT_MIN, row = -1;
        for (int i = 0; i < k; i++) {
            int value = nums[i][positions[i]];
            if (value < smallest) {
                smallest = value;
                row = i;
            }
            largest = max(largest, value);
        }
        if (largest - smallest < answer[1] - answer[0] ||
            (largest - smallest == answer[1] - answer[0] && smallest < answer[0])) {
            answer = {smallest, largest};
        }
        positions[row]++;
        if (positions[row] == (int)nums[row].size()) {
            break;
        }
    }
    return answer;
}`,
        java: `int[] smallestRange(List<List<Integer>> nums) {
    int k = nums.size();
    int[] positions = new int[k];
    int[] answer = {0, Integer.MAX_VALUE};
    while (true) {
        int smallest = Integer.MAX_VALUE, largest = Integer.MIN_VALUE, row = -1;
        for (int i = 0; i < k; i++) {
            int value = nums.get(i).get(positions[i]);
            if (value < smallest) {
                smallest = value;
                row = i;
            }
            largest = Math.max(largest, value);
        }
        long width = (long)largest - smallest;
        long bestWidth = (long)answer[1] - answer[0];
        if (width < bestWidth || (width == bestWidth && smallest < answer[0])) {
            answer[0] = smallest;
            answer[1] = largest;
        }
        positions[row]++;
        if (positions[row] == nums.get(row).size()) {
            return answer;
        }
    }
}`,
        javascript: `function smallestRange(nums) {
  const positions = new Array(nums.length).fill(0);
  let answer = [0, Infinity];
  while (true) {
    let smallest = Infinity;
    let largest = -Infinity;
    let row = -1;
    for (let i = 0; i < nums.length; i++) {
      const value = nums[i][positions[i]];
      if (value < smallest) {
        smallest = value;
        row = i;
      }
      largest = Math.max(largest, value);
    }
    const width = largest - smallest;
    if (width < answer[1] - answer[0] || (width === answer[1] - answer[0] && smallest < answer[0])) {
      answer = [smallest, largest];
    }
    positions[row]++;
    if (positions[row] === nums[row].length) {
      return answer;
    }
  }
}`,
      },
    },
    {
      name: '攤平排序加滑動視窗',
      idea: '每個值附上來源列，排序後找同時含全部來源的最短連續視窗。',
      steps: ['將所有值轉成（值、來源列）並排序。', '右端逐一加入，統計視窗內有幾種來源。', '涵蓋所有來源時更新答案並持續移動左端，直到不再涵蓋。'],
      figure: { title: '排序後以來源列覆蓋視窗', steps: windowFig() },
      complexity: { time: 'O(N log N)', space: 'O(N + k)', why: '排序 N 個值，視窗計數另用 k 個位置。' },
      verdict: '適合練習將多列問題轉為 [[p:sliding-window]]。',
      code: {
        python: `def smallestRange(nums):
    items = []
    for row, values in enumerate(nums):
        for value in values:
            items.append((value, row))
    items.sort()
    counts = [0] * len(nums)
    covered = left = 0
    answer = [0, float('inf')]
    for right, (value, row) in enumerate(items):
        if counts[row] == 0:
            covered += 1           # 新增一種來源
        counts[row] += 1
        while covered == len(nums):
            low = items[left][0]
            if value - low < answer[1] - answer[0] or (value - low == answer[1] - answer[0] and low < answer[0]):
                answer = [low, value]
            old_row = items[left][1]
            counts[old_row] -= 1
            if counts[old_row] == 0:
                covered -= 1
            left += 1
    return answer`,
        c: `typedef struct {
    int value;
    int row;
} RangeItem;

static int compareRangeItems(const void *a, const void *b) {
    const RangeItem *x = a, *y = b;
    return (x->value > y->value) - (x->value < y->value);
}

int *smallestRange(int **nums, int numsSize, int *numsColSize, int *returnSize) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) {
        total += numsColSize[i];
    }
    RangeItem *items = malloc(total * sizeof(RangeItem));
    int size = 0;
    for (int row = 0; row < numsSize; row++) {
        for (int j = 0; j < numsColSize[row]; j++) {
            items[size++] = (RangeItem){nums[row][j], row};
        }
    }
    qsort(items, size, sizeof(RangeItem), compareRangeItems);
    int *counts = calloc(numsSize, sizeof(int));
    int *answer = malloc(2 * sizeof(int));
    int bestWidth = INT_MAX, covered = 0, left = 0;
    for (int right = 0; right < size; right++) {
        int row = items[right].row;
        if (counts[row]++ == 0) {
            covered++;
        }
        while (covered == numsSize) {
            int low = items[left].value, high = items[right].value;
            if (high - low < bestWidth || (high - low == bestWidth && low < answer[0])) {
                bestWidth = high - low;
                answer[0] = low;
                answer[1] = high;
            }
            int oldRow = items[left].row;
            if (--counts[oldRow] == 0) {
                covered--;
            }
            left++;
        }
    }
    free(items);
    free(counts);
    *returnSize = 2;
    return answer;
}`,
        cpp: `vector<int> smallestRange(vector<vector<int>>& nums) {
    vector<pair<int, int>> items;
    for (int row = 0; row < (int)nums.size(); row++) {
        for (int value : nums[row]) {
            items.push_back({value, row});
        }
    }
    sort(items.begin(), items.end());
    vector<int> counts(nums.size(), 0);
    int covered = 0, left = 0;
    vector<int> answer{0, INT_MAX};
    for (int right = 0; right < (int)items.size(); right++) {
        int row = items[right].second;
        if (counts[row]++ == 0) {
            covered++;
        }
        while (covered == (int)nums.size()) {
            int low = items[left].first, high = items[right].first;
            if (high - low < answer[1] - answer[0] ||
                (high - low == answer[1] - answer[0] && low < answer[0])) {
                answer = {low, high};
            }
            if (--counts[items[left].second] == 0) {
                covered--;
            }
            left++;
        }
    }
    return answer;
}`,
        java: `int[] smallestRange(List<List<Integer>> nums) {
    List<int[]> items = new ArrayList<>();
    for (int row = 0; row < nums.size(); row++) {
        for (int value : nums.get(row)) {
            items.add(new int[]{value, row});
        }
    }
    items.sort((a, b) -> Integer.compare(a[0], b[0]));
    int[] counts = new int[nums.size()];
    int[] answer = {0, Integer.MAX_VALUE};
    int covered = 0, left = 0;
    for (int right = 0; right < items.size(); right++) {
        int row = items.get(right)[1];
        if (counts[row]++ == 0) {
            covered++;
        }
        while (covered == nums.size()) {
            int low = items.get(left)[0], high = items.get(right)[0];
            long width = (long)high - low;
            long bestWidth = (long)answer[1] - answer[0];
            if (width < bestWidth || (width == bestWidth && low < answer[0])) {
                answer[0] = low;
                answer[1] = high;
            }
            if (--counts[items.get(left)[1]] == 0) {
                covered--;
            }
            left++;
        }
    }
    return answer;
}`,
        javascript: `function smallestRange(nums) {
  const items = [];
  for (let row = 0; row < nums.length; row++) {
    for (const value of nums[row]) {
      items.push([value, row]);
    }
  }
  items.sort((a, b) => a[0] - b[0]);
  const counts = new Array(nums.length).fill(0);
  let covered = 0;
  let left = 0;
  let answer = [0, Infinity];
  for (let right = 0; right < items.length; right++) {
    const row = items[right][1];
    if (counts[row]++ === 0) {
      covered++;
    }
    while (covered === nums.length) {
      const low = items[left][0];
      const high = items[right][0];
      if (high - low < answer[1] - answer[0] || (high - low === answer[1] - answer[0] && low < answer[0])) {
        answer = [low, high];
      }
      if (--counts[items[left][1]] === 0) {
        covered--;
      }
      left++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['答案比較先看 b−a，再看較小的 a。', '每一列至少要有一個值被區間涵蓋，不能只涵蓋 k 個來自同一列的元素。'],
  check: {
    kind: 'fn',
    fn: 'smallestRange',
    cases: [
      { args: [LISTS], out: [20, 24] },
      { args: [[[1, 2, 3], [1, 2, 3], [1, 2, 3]]], out: [1, 1] },
      { args: [[[1], [2], [3]]], out: [1, 3] },
    ],
  },
}
