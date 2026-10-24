import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { Solution } from './types'

// 350. Intersection of Two Arrays II
export const q0350: Solution = {
  id: 350,
  plain: '找出兩份清單共同擁有的數字；同一數字在兩邊出現幾次，就最多取較少的那個次數。',
  statement: '給 nums1、nums2，回傳兩陣列的交集，重複元素需依兩側較小的出現次數保留。答案順序不限。',
  examples: [{ input: 'nums1 = [1,2,2,1], nums2 = [2,2]', output: '[2,2]' }, { input: 'nums1 = [4,9,5], nums2 = [9,4,9,8,4]', output: '[4,9]' }],
  constraints: ['1 ≤ nums1.length, nums2.length ≤ 1000；0 ≤ 數值 ≤ 1000。'],
  insight: ['只用 set 會丟掉重複次數。', '用 [[p:hash-map]] 記錄第一份清單的數量，第二份每取走一個就減一。', '若先排序，也能用 [[p:two-pointers]] 同步前進。'],
  approaches: [
    {
      name: '計數表消耗庫存',
      idea: '統計第一個陣列；掃第二個陣列時，只取仍有庫存的數字。',
      steps: ['統計 nums1 的每個數字。', '逐個讀 nums2；庫存大於 0 就加入答案。', '每加入一次，庫存減一。'],
      figure: { title: 'nums1 = [1,2,2,1], nums2 = [2,2]', steps: [
        { note: '第一份清單中 1 有兩個、2 有兩個。', views: [kv([[1, 2], [2, 2]], '剩餘數量')] },
        { note: '第二份第一個 2 有庫存，放進答案，2 的庫存變 1。', views: [arr([2, 2], { label: 'nums2', highlight: [0] }), kv([[1, 2], [2, 1]], '剩餘數量')] },
        { note: '第二個 2 也有庫存，再放一個，庫存變 0。', views: [arr([2, 2], { label: 'nums2', highlight: [1] }), kv([[1, 2], [2, 0]], '剩餘數量')] },
        { note: '掃描完成，答案 [2,2]，沒有多取。', views: [arr([2, 2], { label: '交集', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n+m)', space: 'O(n)', why: '兩陣列各掃一次，計數表最多存 n 個元素。' },
      verdict: '推薦；不用改動輸入，也自然保留重複次數。',
      code: {
        python: `def intersect(nums1, nums2):
    count = {}
    for value in nums1:
        count[value] = count.get(value, 0) + 1
    answer = []
    for value in nums2:
        if count.get(value, 0) > 0:
            answer.append(value)
            count[value] -= 1            # 取走一個庫存
    return answer`,
        c: `int *intersect(int *nums1, int nums1Size, int *nums2, int nums2Size, int *returnSize) {
    int count[1001] = {0};
    for (int i = 0; i < nums1Size; i++) {
        count[nums1[i]]++;
    }
    int *answer = malloc((nums1Size + 1) * sizeof(int));
    *returnSize = 0;
    for (int i = 0; i < nums2Size; i++) {
        int value = nums2[i];
        if (count[value] > 0) {
            answer[(*returnSize)++] = value;
            count[value]--;
        }
    }
    return answer;
}`,
        cpp: `vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
    unordered_map<int, int> count;
    for (int value : nums1) {
        count[value]++;
    }
    vector<int> answer;
    for (int value : nums2) {
        if (count[value] > 0) {
            answer.push_back(value);
            count[value]--;
        }
    }
    return answer;
}`,
        java: `int[] intersect(int[] nums1, int[] nums2) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int value : nums1) {
        count.put(value, count.getOrDefault(value, 0) + 1);
    }
    int[] buffer = new int[Math.min(nums1.length, nums2.length)];
    int size = 0;
    for (int value : nums2) {
        if (count.getOrDefault(value, 0) > 0) {
            buffer[size++] = value;
            count.put(value, count.get(value) - 1);
        }
    }
    return Arrays.copyOf(buffer, size);
}`,
        javascript: `function intersect(nums1, nums2) {
  const count = new Map();
  for (const value of nums1) {
    count.set(value, (count.get(value) || 0) + 1);
  }
  const answer = [];
  for (const value of nums2) {
    if ((count.get(value) || 0) > 0) {
      answer.push(value);
      count.set(value, count.get(value) - 1);
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '排序後雙指標',
      idea: '兩份清單排序後，小的指標先走；相等就取一個並一起前進。',
      steps: ['排序 nums1、nums2。', '兩指標比較當前值。', '相等則收集並雙雙前進；不等則移動較小的那邊。'],
      figure: { title: 'nums1 = [1,2,2,1], nums2 = [2,2]', steps: [
        { note: '排序後為 [1,1,2,2] 與 [2,2]。', views: [arr([1, 1, 2, 2], { label: 'nums1' }), arr([2, 2], { label: 'nums2' })] },
        { note: '第一份的 1 比 2 小，兩個 1 都不可能配到，指標前進。', views: [arr([1, 1, 2, 2], { label: 'nums1', dim: [0, 1] })] },
        { note: '現在兩邊都是 2，取第一個 2，兩指標都前進。', views: [arr([1, 1, 2, 2], { label: 'nums1', highlight: [2] }), arr([2, 2], { label: 'nums2', highlight: [0] })] },
        { note: '下一對也是 2，再取一個，結果 [2,2]。', views: [arr([2, 2], { label: '交集', done: [0, 1] })] },
      ] },
      complexity: { time: 'O(n log n + m log m)', space: 'O(n+m)', why: '排序副本耗時與空間。' },
      verdict: '若輸入原本已排序，這個方法只需線性時間。',
      code: {
        python: `def intersect(nums1, nums2):
    first = sorted(nums1)
    second = sorted(nums2)
    i = j = 0
    answer = []
    while i < len(first) and j < len(second):
        if first[i] == second[j]:
            answer.append(first[i])      # 配對一個相同值
            i += 1
            j += 1
        elif first[i] < second[j]:
            i += 1
        else:
            j += 1
    return answer`,
        c: `static int cmp350(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int *intersect(int *nums1, int nums1Size, int *nums2, int nums2Size, int *returnSize) {
    qsort(nums1, nums1Size, sizeof(int), cmp350);
    qsort(nums2, nums2Size, sizeof(int), cmp350);
    int *answer = malloc((nums1Size + 1) * sizeof(int));
    int i = 0;
    int j = 0;
    *returnSize = 0;
    while (i < nums1Size && j < nums2Size) {
        if (nums1[i] == nums2[j]) {
            answer[(*returnSize)++] = nums1[i];
            i++;
            j++;
        } else if (nums1[i] < nums2[j]) {
            i++;
        } else {
            j++;
        }
    }
    return answer;
}`,
        cpp: `vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {
    vector<int> first = nums1;
    vector<int> second = nums2;
    sort(first.begin(), first.end());
    sort(second.begin(), second.end());
    int i = 0;
    int j = 0;
    vector<int> answer;
    while (i < (int)first.size() && j < (int)second.size()) {
        if (first[i] == second[j]) {
            answer.push_back(first[i]);
            i++;
            j++;
        } else if (first[i] < second[j]) {
            i++;
        } else {
            j++;
        }
    }
    return answer;
}`,
        java: `int[] intersect(int[] nums1, int[] nums2) {
    int[] first = nums1.clone();
    int[] second = nums2.clone();
    Arrays.sort(first);
    Arrays.sort(second);
    int[] buffer = new int[Math.min(first.length, second.length)];
    int i = 0;
    int j = 0;
    int size = 0;
    while (i < first.length && j < second.length) {
        if (first[i] == second[j]) {
            buffer[size++] = first[i];
            i++;
            j++;
        } else if (first[i] < second[j]) {
            i++;
        } else {
            j++;
        }
    }
    return Arrays.copyOf(buffer, size);
}`,
        javascript: `function intersect(nums1, nums2) {
  const first = [...nums1].sort((a, b) => a - b);
  const second = [...nums2].sort((a, b) => a - b);
  const answer = [];
  let i = 0;
  let j = 0;
  while (i < first.length && j < second.length) {
    if (first[i] === second[j]) {
      answer.push(first[i]);
      i++;
      j++;
    } else if (first[i] < second[j]) {
      i++;
    } else {
      j++;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['交集要保留重複值，set 不夠。', 'JavaScript 排序數字要給比較函式。', '回傳順序不限，用 sorted 比對。'],
  check: { kind: 'fn', fn: 'intersect', compare: 'sorted', cases: [
    { args: [[1, 2, 2, 1], [2, 2]], out: [2, 2] }, { args: [[4, 9, 5], [9, 4, 9, 8, 4]], out: [4, 9] }, { args: [[1], [2]], out: [] },
  ] },
}
