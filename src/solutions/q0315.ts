import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { FigStep, Solution } from './types'

const A = [5, 2, 6, 1]

function bruteFig(): FigStep[] {
  return [
    { note: '對 5 看右邊 [2,6,1]：2、1 比 5 小，共 2 個。', views: [arr(A, { label: 'nums', highlight: [0], compare: [1, 3] })] },
    { note: '對 2 看 [6,1]：只有 1 比 2 小，記 1。', views: [arr(A, { label: 'nums', highlight: [1], compare: [3] })] },
    { note: '對 6 看 [1]：1 比 6 小，記 1。', views: [arr(A, { label: 'nums', highlight: [2], compare: [3] })] },
    { note: '最後的 1 右邊沒有數，記 0；答案 [2,1,1,0]。', views: [arr([2, 1, 1, 0], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

function bitFig(): FigStep[] {
  return [
    { note: '先把不同值排序成 [1,2,5,6]，映射為名次 1、2、3、4；從右向左處理，已加入的值恰好都在目前位置右邊。', views: [kv([[1, 1], [2, 2], [5, 3], [6, 4]], '值 → 名次')] },
    { note: '先加入最右邊的 1（名次 1）；它右邊沒有值，答案[3]=0。', views: [arr([1], { label: '已加入的值', done: [0] })] },
    { note: '處理 6：查名次小於 4 的個數，目前有 1 個；再加入 6。處理 2：查名次小於 2 的個數，也有 1 個。', views: [arr([1, 6, 2], { label: '已加入的值', done: [0, 1, 2] })] },
    { note: '處理 5：已加入的 1、2 比它小，查到 2；結果 [2,1,1,0]。Fenwick 樹讓「查前綴個數」和「加入一個值」都很快。', views: [arr([2, 1, 1, 0], { label: '答案', done: [0, 1, 2, 3] })] },
  ]
}

export const q0315: Solution = {
  id: 315,
  plain: '對每個數，數一數它右邊有幾個數嚴格比它小。',
  statement: '給整數陣列 nums，回傳 answer，其中 answer[i] 是 i 右側比 nums[i] 小的元素個數。',
  examples: [{ input: 'nums = [5,2,6,1]', output: '[2,1,1,0]' }, { input: 'nums = [-1]', output: '[0]' }, { input: 'nums = [-1,-1]', output: '[0,0]' }],
  constraints: ['`1 ≤ nums.length ≤ 10⁵`', '`−10⁴ ≤ nums[i] ≤ 10⁴`'],
  insight: ['直接比較每個 i 與右邊所有位置最直觀，但有 O(n²) 次比較。', '從右往左掃時，已處理的值就是右側元素；將值排序後給名次，Fenwick 樹能快速求「比目前名次小」的出現總數。相等值不能計入。'],
  approaches: [
    {
      name: '逐一檢查右側',
      idea: '每個位置都掃描它後面的數，遇到嚴格較小的就計數。',
      steps: ['建立全 0 的答案。', '固定 i，掃描 j=i+1..n−1。', '若 nums[j]<nums[i]，答案[i] 加一。'],
      figure: { title: 'nums = [5,2,6,1]', steps: bruteFig() },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '總共比較 n(n−1)/2 對；答案佔 n 格。' },
      verdict: '概念簡單，可用來對照最佳化版本。',
      code: {
        python: `def countSmaller(nums):
    answer = [0] * len(nums)
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[j] < nums[i]:  # 相等不算較小
                answer[i] += 1
    return answer`,
        c: `int *countSmaller(int *nums, int numsSize, int *returnSize) {
    int *answer = calloc(numsSize, sizeof(int));
    *returnSize = numsSize;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[j] < nums[i]) {
                answer[i]++;
            }
        }
    }
    return answer;
}`,
        cpp: `vector<int> countSmaller(vector<int>& nums) {
    int n = nums.size();
    vector<int> answer(n, 0);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (nums[j] < nums[i]) {
                answer[i]++;
            }
        }
    }
    return answer;
}`,
        java: `List<Integer> countSmaller(int[] nums) {
    List<Integer> answer = new ArrayList<>();
    for (int i = 0; i < nums.length; i++) {
        int count = 0;
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[j] < nums[i]) {
                count++;
            }
        }
        answer.add(count);
    }
    return answer;
}`,
        javascript: `function countSmaller(nums) {
  const answer = new Array(nums.length).fill(0);
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[j] < nums[i]) {
        answer[i]++;
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '離散化與 Fenwick 樹',
      idea: '依值排序得到名次；從右往左查名次 1..rank−1 的已出現個數，然後把當前名次加入樹。',
      steps: ['排序去重，取得每個值的名次。', '從最右邊開始，每次查詢比目前名次小的前綴和。', '把目前名次的出現次數加一。', '逐格向左直到完成。'],
      figure: { title: 'nums = [5,2,6,1]', steps: bitFig() },
      complexity: { time: 'O(n log n)', space: 'O(n)', why: '排序與每次樹狀陣列查詢、更新各花 O(log n)。' },
      verdict: '適合 10⁵ 筆資料；務必查 rank−1，排除相等值。',
      code: {
        python: `def countSmaller(nums):
    values = sorted(set(nums))
    rank = {value: i + 1 for i, value in enumerate(values)}
    tree = [0] * (len(values) + 1)

    def query(i):
        total = 0
        while i > 0:
            total += tree[i]
            i -= i & -i
        return total

    def add(i):
        while i < len(tree):
            tree[i] += 1
            i += i & -i

    answer = [0] * len(nums)
    for i in range(len(nums) - 1, -1, -1):
        r = rank[nums[i]]
        answer[i] = query(r - 1)  # 只算嚴格較小的值
        add(r)  # 留給更左邊的位置查詢
    return answer`,
        c: `int compareInt315(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int *countSmaller(int *nums, int numsSize, int *returnSize) {
    int n = numsSize;
    int *values = malloc(n * sizeof(int));
    int *tree = calloc(n + 1, sizeof(int));
    int *answer = malloc(n * sizeof(int));
    memcpy(values, nums, n * sizeof(int));
    qsort(values, n, sizeof(int), compareInt315);
    int size = 0;
    for (int i = 0; i < n; i++) {
        if (size == 0 || values[i] != values[size - 1]) {
            values[size++] = values[i];
        }
    }
    for (int i = n - 1; i >= 0; i--) {
        int left = 0;
        int right = size;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (values[mid] < nums[i]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        int rank = left + 1;
        answer[i] = 0;
        for (int j = rank - 1; j > 0; j -= j & -j) {
            answer[i] += tree[j];
        }
        for (int j = rank; j <= size; j += j & -j) {
            tree[j]++;
        }
    }
    free(values);
    free(tree);
    *returnSize = n;
    return answer;
}`,
        cpp: `vector<int> countSmaller(vector<int>& nums) {
    vector<int> values = nums;
    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());
    vector<int> tree(values.size() + 1, 0);
    vector<int> answer(nums.size());
    for (int i = (int)nums.size() - 1; i >= 0; i--) {
        int rank = lower_bound(values.begin(), values.end(), nums[i]) - values.begin() + 1;
        for (int j = rank - 1; j > 0; j -= j & -j) {
            answer[i] += tree[j];
        }
        for (int j = rank; j < (int)tree.size(); j += j & -j) {
            tree[j]++;
        }
    }
    return answer;
}`,
        java: `List<Integer> countSmaller(int[] nums) {
    int[] values = nums.clone();
    Arrays.sort(values);
    int size = 0;
    for (int value : values) {
        if (size == 0 || value != values[size - 1]) {
            values[size++] = value;
        }
    }
    int[] tree = new int[size + 1];
    Integer[] answer = new Integer[nums.length];
    for (int i = nums.length - 1; i >= 0; i--) {
        int rank = Arrays.binarySearch(values, 0, size, nums[i]) + 1;
        int count = 0;
        for (int j = rank - 1; j > 0; j -= j & -j) {
            count += tree[j];
        }
        answer[i] = count;
        for (int j = rank; j <= size; j += j & -j) {
            tree[j]++;
        }
    }
    return Arrays.asList(answer);
}`,
        javascript: `function countSmaller(nums) {
  const values = [...new Set(nums)].sort((a, b) => a - b);
  const ranks = new Map(values.map((value, i) => [value, i + 1]));
  const tree = new Array(values.length + 1).fill(0);
  const answer = new Array(nums.length).fill(0);
  for (let i = nums.length - 1; i >= 0; i--) {
    const rank = ranks.get(nums[i]);
    for (let j = rank - 1; j > 0; j -= j & -j) {
      answer[i] += tree[j];
    }
    for (let j = rank; j < tree.length; j += j & -j) {
      tree[j]++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['查詢 rank−1，不要查 rank，否則相等的右側元素會被算進去。', '必須從右向左處理，樹裡才剛好是目前元素的右側。'],
  check: { kind: 'fn', fn: 'countSmaller', cases: [{ args: [A], out: [2, 1, 1, 0] }, { args: [[-1]], out: [0] }, { args: [[-1, -1]], out: [0, 0] }, { args: [[3, 2, 1]], out: [2, 1, 0] }] },
}
