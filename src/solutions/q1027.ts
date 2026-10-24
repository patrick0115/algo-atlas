import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const A = [3, 6, 9, 12]
const pairFig: FigStep[] = [
  { note: '固定起頭的 3、6，公差是 3，這條序列目前長度 2。', views: [arr(A, { label: 'nums', highlight: [0, 1] })] },
  { note: '往後掃到 9，正好是 6+3，接上後長度變 3。', views: [arr(A, { label: 'nums', done: [0, 1], highlight: [2] })] },
  { note: '再掃到 12，正好是 9+3，接上後長度變 4。', views: [arr(A, { label: 'nums', done: [0, 1, 2], highlight: [3] })] },
  { note: '繼續比較其他起頭兩數的公差；這條長度 4 已涵蓋整個陣列。', views: [arr([4], { label: '答案', done: [0] })] },
]
const dpFig: FigStep[] = [
  { note: 'dp[i][d] 表示以索引 i 結尾、公差 d 的最長長度。看 3→6，d=3，得到 dp[1][3]=2。', views: [arr(A, { label: 'nums', highlight: [0, 1] }), arr([2], { label: 'dp[1][3]' })] },
  { note: '看 6→9，公差仍是 3；接在先前長度 2 後面，dp[2][3]=3。', views: [arr(A, { label: 'nums', highlight: [1, 2] }), arr([3], { label: 'dp[2][3]' })] },
  { note: '看 9→12，同理 dp[3][3]=4。', views: [arr(A, { label: 'nums', highlight: [2, 3] }), arr([4], { label: 'dp[3][3]' })] },
  { note: '所有結尾與公差都比較完，最大長度為 4。', views: [arr([2, 3, 4], { label: '公差 3 的進展', done: [0, 1, 2] })] },
]

export const q1027: Solution = {
  id: 1027,
  plain: '從陣列挑出一串順序不變的數，讓相鄰數字的差都一樣；求最長能挑幾個。',
  statement: '給整數陣列 nums，回傳最長等差子序列長度。子序列可跳過元素，但不可更改原本順序。',
  examples: [{ input: 'nums = [3,6,9,12]', output: '4' }, { input: 'nums = [9,4,7,2,10]', output: '3' }, { input: 'nums = [20,1,15,3,10,5,8]', output: '4' }],
  constraints: ['元素個數至少 2、至多 1000；元素值在 0..500。', '公差可為負數或 0。'],
  insight: ['前兩個數確定公差；後面只要找下一個期待的值即可，但枚舉所有起頭會重複掃描。', '用 [[p:dp-general]] 記錄「以 i 結尾、公差 d」的最長長度；掃到一對 j<i 時，可延長 j 的答案。'],
  approaches: [
    {
      name: '枚舉起頭兩數', idea: '固定前兩個數及公差，再向右依次找下一個期待的數。',
      steps: ['枚舉 i<j，設定公差 nums[j]−nums[i]。', '從 j 之後往右，遇到前一個值加公差就接上。', '更新所有配對中的最長長度。'],
      figure: { title: 'nums = [3,6,9,12]', steps: pairFig },
      complexity: { time: 'O(n³)', space: 'O(1)', why: 'O(n²) 對起頭，每對最多掃 O(n) 個後續元素。' },
      verdict: '能直接理解等差子序列，但 n=1000 時會太慢。',
      code: {
        python: `def longestArithSeqLength(nums):
    answer = 2
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            difference = nums[j] - nums[i]
            last = nums[j]
            length = 2
            for value in nums[j + 1:]:
                if value - last == difference:
                    length += 1  # 接上下一個期待的數
                    last = value
            answer = max(answer, length)
    return answer`,
        c: `int longestArithSeqLength(int *nums, int numsSize) {
    int answer = 2;
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            int difference = nums[j] - nums[i];
            int last = nums[j];
            int length = 2;
            for (int k = j + 1; k < numsSize; k++) {
                if (nums[k] - last == difference) {
                    length++;
                    last = nums[k];
                }
            }
            if (length > answer) {
                answer = length;
            }
        }
    }
    return answer;
}`,
        cpp: `int longestArithSeqLength(vector<int>& nums) {
    int answer = 2;
    for (int i = 0; i < (int) nums.size(); i++) {
        for (int j = i + 1; j < (int) nums.size(); j++) {
            int difference = nums[j] - nums[i];
            int last = nums[j];
            int length = 2;
            for (int k = j + 1; k < (int) nums.size(); k++) {
                if (nums[k] - last == difference) {
                    length++;
                    last = nums[k];
                }
            }
            answer = max(answer, length);
        }
    }
    return answer;
}`,
        java: `int longestArithSeqLength(int[] nums) {
    int answer = 2;
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            int difference = nums[j] - nums[i];
            int last = nums[j];
            int length = 2;
            for (int k = j + 1; k < nums.length; k++) {
                if (nums[k] - last == difference) {
                    length++;
                    last = nums[k];
                }
            }
            answer = Math.max(answer, length);
        }
    }
    return answer;
}`,
        javascript: `function longestArithSeqLength(nums) {
  let answer = 2;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const difference = nums[j] - nums[i];
      let last = nums[j];
      let length = 2;
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[k] - last === difference) {
          length++;
          last = nums[k];
        }
      }
      answer = Math.max(answer, length);
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '以結尾與公差做 DP', idea: '每對 j<i 都可形成一條長度至少 2 的序列；若 j 已有相同公差的序列，就延長它。',
      steps: ['為每個結尾 i 建立公差到最長長度的表。', '枚舉 j<i，令 d=nums[i]−nums[j]。', '更新 dp[i][d]=max(dp[i][d], dp[j][d]+1，至少 2)。', '回傳所有狀態最大值。'],
      figure: { title: 'nums = [3,6,9,12]', steps: dpFig },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '每對位置計算一次；各結尾最多有 O(n) 種公差。' },
      verdict: '推薦解法；公差是狀態的一部分，不能只記每個位置一個答案。',
      code: {
        python: `def longestArithSeqLength(nums):
    dp = [{} for _ in nums]
    answer = 2
    for i in range(len(nums)):
        for j in range(i):
            difference = nums[i] - nums[j]
            length = dp[j].get(difference, 1) + 1  # 延長以 j 結尾的序列
            dp[i][difference] = max(dp[i].get(difference, 0), length)
            answer = max(answer, dp[i][difference])
    return answer`,
        c: `int longestArithSeqLength(int *nums, int numsSize) {
    int width = 1001;
    int *dp = calloc(numsSize * width, sizeof(int));
    int answer = 2;
    for (int i = 0; i < numsSize; i++) {
        for (int j = 0; j < i; j++) {
            int offset = nums[i] - nums[j] + 500;
            int previous = dp[j * width + offset];
            int length = (previous > 0 ? previous : 1) + 1;
            if (length > dp[i * width + offset]) {
                dp[i * width + offset] = length;
            }
            if (length > answer) {
                answer = length;
            }
        }
    }
    free(dp);
    return answer;
}`,
        cpp: `int longestArithSeqLength(vector<int>& nums) {
    vector<unordered_map<int, int>> dp(nums.size());
    int answer = 2;
    for (int i = 0; i < (int) nums.size(); i++) {
        for (int j = 0; j < i; j++) {
            int difference = nums[i] - nums[j];
            int previous = dp[j].count(difference) ? dp[j][difference] : 1;
            dp[i][difference] = max(dp[i][difference], previous + 1);
            answer = max(answer, dp[i][difference]);
        }
    }
    return answer;
}`,
        java: `int longestArithSeqLength(int[] nums) {
    List<Map<Integer, Integer>> dp = new ArrayList<>();
    for (int i = 0; i < nums.length; i++) {
        dp.add(new HashMap<>());
    }
    int answer = 2;
    for (int i = 0; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            int difference = nums[i] - nums[j];
            int length = dp.get(j).getOrDefault(difference, 1) + 1;
            dp.get(i).put(difference, Math.max(dp.get(i).getOrDefault(difference, 0), length));
            answer = Math.max(answer, dp.get(i).get(difference));
        }
    }
    return answer;
}`,
        javascript: `function longestArithSeqLength(nums) {
  const dp = Array.from({ length: nums.length }, () => new Map());
  let answer = 2;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      const difference = nums[i] - nums[j];
      const length = (dp[j].get(difference) ?? 1) + 1;
      dp[i].set(difference, Math.max(dp[i].get(difference) ?? 0, length));
      answer = Math.max(answer, dp[i].get(difference));
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['等差子序列允許跳過原陣列元素。', '公差可能為負或 0；不能只開非負公差表。', '長度 2 的任意兩數本身就是等差序列。'],
  check: { kind: 'fn', fn: 'longestArithSeqLength', cases: [
    { args: [A], out: 4 },
    { args: [[9, 4, 7, 2, 10]], out: 3 },
    { args: [[20, 1, 15, 3, 10, 5, 8]], out: 4 },
    { args: [[1, 1, 1]], out: 3 },
  ] },
}
