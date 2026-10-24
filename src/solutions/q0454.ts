import { arr } from '../engine/helpers'
import type { FigStep, Solution } from './types'

const bruteFig: FigStep[] = [
  { note: '四個陣列分別是 [1,2]、[-2,-1]、[-1,2]、[0,2]。先固定前兩個數 1 和 -2，還需要後兩個數合成 1。', views: [arr([1, -2], { label: 'A、B', highlight: [0, 1] })] },
  { note: 'C = -1、D = 2 正好合成 1，所以找到第一組 (1,-2,-1,2)。', views: [arr([1, -2, -1, 2], { label: '第 1 組', done: [0, 1, 2, 3] })] },
  { note: '繼續枚舉，(2,-1,-1,0) 也合成 0；每種索引組合都要各算一次。', views: [arr([2, -1, -1, 0], { label: '第 2 組', done: [0, 1, 2, 3] })] },
  { note: '四層迴圈全部結束，答案是 2。', views: [arr([2], { label: '答案', done: [0] })] },
]

const hashFig: FigStep[] = [
  { note: '先算 A+B 的四種組合：-1、0、0、1。把每種和出現幾次存起來。', views: [arr([-1, 0, 0, 1], { label: 'A+B', done: [0, 1, 2, 3] })] },
  { note: 'C=-1、D=0 時，C+D=-1；表裡的相反數 1 出現一次，答案加 1。', views: [arr([-1, 0, 0, 1], { label: 'A+B', highlight: [3] }), arr([-1], { label: 'C+D' })] },
  { note: 'C=-1、D=2 時，和為 1；相反數 -1 也出現一次，再加 1。', views: [arr([-1, 0, 0, 1], { label: 'A+B', highlight: [0] }), arr([1], { label: 'C+D' })] },
  { note: '其餘 C+D 沒有配對；總數 2。若某個和重複出現，要加它的出現次數。', views: [arr([2], { label: '答案', done: [0] })] },
]

export const q0454: Solution = {
  id: 454,
  plain: '從四張數字清單各挑一個數，問有多少種挑法能讓總和是 0。',
  statement: '給四個長度相同的整數陣列 nums1 到 nums4。計算索引四元組 (i,j,k,l) 的數量，條件是四個選到的數相加為 0。',
  examples: [
    { input: 'nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2]', output: '2' },
    { input: 'nums1 = [0], nums2 = [0], nums3 = [0], nums4 = [0]', output: '1' },
  ],
  constraints: ['每個陣列長度至多 200；四層迴圈最壞要做 200⁴ 次。', '答案可達數十億；C 的計數使用 long long，最後轉回題目要求的 int。'],
  insight: ['直接枚舉四個位置容易想，但太慢。', '把四個數拆成 (A+B) 與 (C+D)：只要兩個和互為相反數，就湊成 0。', '用 [[p:hash-map]] 計數，重複的兩數和也能正確累加。'],
  approaches: [
    {
      name: '四層迴圈枚舉',
      idea: '把四種索引組合全部走過，總和為 0 就加一。',
      steps: ['依序挑 A、B、C、D。', '四數相加為 0 時加一。', '走完所有組合後回傳。'],
      figure: { title: '四個長度 2 的陣列', steps: bruteFig },
      complexity: { time: 'O(n⁴)', space: 'O(1)', why: '每個陣列各有 n 個選擇。' },
      verdict: '可作為小資料的基準，但正式限制會超時。',
      code: {
        python: `def fourSumCount(nums1, nums2, nums3, nums4):
    answer = 0
    for a in nums1:
        for b in nums2:
            for c in nums3:
                for d in nums4:
                    if a + b + c + d == 0:
                        answer += 1  # 這組索引符合條件
    return answer`,
        c: `int fourSumCount(int *nums1, int nums1Size, int *nums2, int nums2Size, int *nums3, int nums3Size, int *nums4, int nums4Size) {
    long long answer = 0;
    for (int i = 0; i < nums1Size; i++) {
        for (int j = 0; j < nums2Size; j++) {
            for (int k = 0; k < nums3Size; k++) {
                for (int l = 0; l < nums4Size; l++) {
                    if ((long long) nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0) {
                        answer++;
                    }
                }
            }
        }
    }
    return (int) answer;
}`,
        cpp: `int fourSumCount(vector<int>& nums1, vector<int>& nums2, vector<int>& nums3, vector<int>& nums4) {
    int answer = 0;
    for (int a : nums1) {
        for (int b : nums2) {
            for (int c : nums3) {
                for (int d : nums4) {
                    if ((long long) a + b + c + d == 0) {
                        answer++;
                    }
                }
            }
        }
    }
    return answer;
}`,
        java: `int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
    int answer = 0;
    for (int a : nums1) {
        for (int b : nums2) {
            for (int c : nums3) {
                for (int d : nums4) {
                    if ((long) a + b + c + d == 0) {
                        answer++;
                    }
                }
            }
        }
    }
    return answer;
}`,
        javascript: `function fourSumCount(nums1, nums2, nums3, nums4) {
  let answer = 0;
  for (const a of nums1) {
    for (const b of nums2) {
      for (const c of nums3) {
        for (const d of nums4) {
          if (a + b + c + d === 0) {
            answer++;
          }
        }
      }
    }
  }
  return answer;
}`,
      },
    },
    {
      name: '兩兩分組與計數表',
      idea: '先記錄每種 A+B 的出現次數；枚舉 C+D 時查需要的相反數。',
      steps: ['對每個 a、b，將 a+b 的計數加一。', '對每個 c、d，查表中 -(c+d) 出現幾次。', '把查到的次數加進答案。'],
      figure: { title: '四個長度 2 的陣列', steps: hashFig },
      complexity: { time: 'O(n²)', space: 'O(n²)', why: '兩邊各有 n² 種配對；表最多存 n² 種和。' },
      verdict: '推薦解法，記得表中存的是次數，不只是有沒有出現。',
      code: {
        python: `from collections import Counter

def fourSumCount(nums1, nums2, nums3, nums4):
    counts = Counter()
    for a in nums1:
        for b in nums2:
            counts[a + b] += 1  # 相同的和可以來自不同索引
    answer = 0
    for c in nums3:
        for d in nums4:
            answer += counts[-c - d]  # 找能補成 0 的前半組
    return answer`,
        c: `typedef struct {
    long long key;
    int count;
    bool used;
} SumEntry;

int fourSumCount(int *nums1, int nums1Size, int *nums2, int nums2Size, int *nums3, int nums3Size, int *nums4, int nums4Size) {
    int capacity = 1;
    while (capacity < nums1Size * nums2Size * 4 + 1) {
        capacity *= 2;
    }
    SumEntry *table = calloc(capacity, sizeof(SumEntry));
    for (int i = 0; i < nums1Size; i++) {
        for (int j = 0; j < nums2Size; j++) {
            long long key = (long long) nums1[i] + nums2[j];
            unsigned int pos = (unsigned long long) key * 2654435761u & (capacity - 1);
            while (table[pos].used && table[pos].key != key) {
                pos = (pos + 1) & (capacity - 1);
            }
            table[pos].used = true;
            table[pos].key = key;
            table[pos].count++;
        }
    }
    long long answer = 0;
    for (int i = 0; i < nums3Size; i++) {
        for (int j = 0; j < nums4Size; j++) {
            long long key = -(long long) nums3[i] - nums4[j];
            unsigned int pos = (unsigned long long) key * 2654435761u & (capacity - 1);
            while (table[pos].used && table[pos].key != key) {
                pos = (pos + 1) & (capacity - 1);
            }
            if (table[pos].used) {
                answer += table[pos].count;
            }
        }
    }
    free(table);
    return (int) answer;
}`,
        cpp: `int fourSumCount(vector<int>& nums1, vector<int>& nums2, vector<int>& nums3, vector<int>& nums4) {
    unordered_map<long long, int> counts;
    for (int a : nums1) {
        for (int b : nums2) {
            counts[(long long) a + b]++;
        }
    }
    int answer = 0;
    for (int c : nums3) {
        for (int d : nums4) {
            answer += counts[-(long long) c - d];
        }
    }
    return answer;
}`,
        java: `int fourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
    Map<Long, Integer> counts = new HashMap<>();
    for (int a : nums1) {
        for (int b : nums2) {
            long sum = (long) a + b;
            counts.put(sum, counts.getOrDefault(sum, 0) + 1);
        }
    }
    int answer = 0;
    for (int c : nums3) {
        for (int d : nums4) {
            answer += counts.getOrDefault(-(long) c - d, 0);
        }
    }
    return answer;
}`,
        javascript: `function fourSumCount(nums1, nums2, nums3, nums4) {
  const counts = new Map();
  for (const a of nums1) {
    for (const b of nums2) {
      const sum = a + b;
      counts.set(sum, (counts.get(sum) ?? 0) + 1);
    }
  }
  let answer = 0;
  for (const c of nums3) {
    for (const d of nums4) {
      answer += counts.get(-c - d) ?? 0;
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['重複的數字仍代表不同索引；計數表不可只存 true。', '計算相反數前注意整數溢位。'],
  check: { kind: 'fn', fn: 'fourSumCount', cases: [
    { args: [[1, 2], [-2, -1], [-1, 2], [0, 2]], out: 2 },
    { args: [[0], [0], [0], [0]], out: 1 },
    { args: [[0, 0], [0, 0], [0, 0], [0, 0]], out: 16 },
    { args: [[], [], [], []], out: 0 },
  ] },
}
