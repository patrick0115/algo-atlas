import { arr } from '../engine/helpers'
import { kv } from './fig'
import type { Solution } from './types'

// 992. Subarrays with K Different Integers
const A = [1, 2, 1, 2, 3]

export const q0992: Solution = {
  id: 992,
  plain: '數出恰好含 k 種不同數字的連續片段。',
  statement: '給 nums 和正整數 k，回傳不同整數的種類數恰好等於 k 的非空連續子陣列數量。',
  examples: [{ input: 'nums = [1,2,1,2,3], k = 2', output: '7' }, { input: 'nums = [1,2,1,3,4], k = 3', output: '3' }],
  constraints: ['1 ≤ k ≤ nums.length ≤ 2×10⁴；1 ≤ nums[i] ≤ nums.length。'],
  insight: ['「恰好 k 種」的視窗不易直接計數。', '「至多 k 種」較容易：固定右端，合法起點形成連續範圍。', '恰好 k = 至多 k − 至多 k−1，屬於 [[p:sliding-window]]。'],
  approaches: [
    {
      name: '兩次至多 K 的滑動視窗',
      idea: '分別算至多 k 種及至多 k−1 種的片段數，兩者相減。',
      steps: ['寫 atMost(limit)：右端加入一個數並更新次數。', '不同數字過多時，縮小左端直到合法。', '每個右端新增 right−left+1 段；最後相減。'],
      figure: { title: 'nums = [1,2,1,2,3], k = 2', steps: [
        { note: '至多 2 種時，右端到第一個 1，合法起點只有索引 0，新增 1 段。', views: [arr(A, { label: '視窗', highlight: [0] }), kv([[1, 1]], '次數')] },
        { note: '右端到 2，視窗 [1,2] 含兩種；新增 [2]、[1,2] 共 2 段。', views: [arr(A, { label: '視窗', highlight: [0, 1] }), kv([[1, 1], [2, 1]], '次數')] },
        { note: '到索引 3 前，前四個數只有 1、2，至多 2 的累計是 1+2+3+4=10。', views: [arr(A, { label: '視窗', highlight: [0, 1, 2, 3] })] },
        { note: '加入 3 後出現第三種，左界縮到索引 3；至多 2 的總數 12。', views: [arr(A, { label: '縮小視窗', dim: [0, 1, 2], highlight: [3, 4] })] },
        { note: '同法算至多 1 種為 5 段，所以恰好 2 種是 12−5=7。', views: [arr([12, 5, 7], { label: '至多2 / 至多1 / 恰好2', done: [2] })] },
      ] },
      complexity: { time: 'O(n)', space: 'O(n)', why: '兩次線性視窗；次數表最多存 n 種數字。' },
      verdict: '標準解；先理解固定右端新增的段數。',
      code: {
        python: `def subarraysWithKDistinct(nums, k):
    def at_most(limit):
        count = {}
        left = 0
        answer = 0
        for right, value in enumerate(nums):
            count[value] = count.get(value, 0) + 1
            while len(count) > limit:
                old = nums[left]
                count[old] -= 1
                if count[old] == 0:
                    del count[old]        # 視窗不再含這種數
                left += 1
            answer += right - left + 1   # 固定右端的所有合法起點
        return answer
    return at_most(k) - at_most(k - 1)`,
        c: `static int atMost992(int *nums, int n, int limit) {
    int *count = calloc(n + 1, sizeof(int));
    int left = 0;
    int distinct = 0;
    int answer = 0;
    for (int right = 0; right < n; right++) {
        if (count[nums[right]]++ == 0) {
            distinct++;
        }
        while (distinct > limit) {
            if (--count[nums[left]] == 0) {
                distinct--;
            }
            left++;
        }
        answer += right - left + 1;
    }
    free(count);
    return answer;
}

int subarraysWithKDistinct(int *nums, int numsSize, int k) {
    return atMost992(nums, numsSize, k) - atMost992(nums, numsSize, k - 1);
}`,
        cpp: `int subarraysWithKDistinct(vector<int>& nums, int k) {
    auto atMost = [&](int limit) {
        vector<int> count(nums.size() + 1);
        int left = 0;
        int distinct = 0;
        int answer = 0;
        for (int right = 0; right < (int)nums.size(); right++) {
            if (count[nums[right]]++ == 0) {
                distinct++;
            }
            while (distinct > limit) {
                if (--count[nums[left]] == 0) {
                    distinct--;
                }
                left++;
            }
            answer += right - left + 1;
        }
        return answer;
    };
    return atMost(k) - atMost(k - 1);
}`,
        java: `int subarraysWithKDistinct(int[] nums, int k) {
    return atMost992(nums, k) - atMost992(nums, k - 1);
}

int atMost992(int[] nums, int limit) {
    int[] count = new int[nums.length + 1];
    int left = 0;
    int distinct = 0;
    int answer = 0;
    for (int right = 0; right < nums.length; right++) {
        if (count[nums[right]]++ == 0) {
            distinct++;
        }
        while (distinct > limit) {
            if (--count[nums[left]] == 0) {
                distinct--;
            }
            left++;
        }
        answer += right - left + 1;
    }
    return answer;
}`,
        javascript: `function subarraysWithKDistinct(nums, k) {
  function atMost(limit) {
    const count = new Map();
    let left = 0;
    let answer = 0;
    for (let right = 0; right < nums.length; right++) {
      count.set(nums[right], (count.get(nums[right]) || 0) + 1);
      while (count.size > limit) {
        const old = nums[left++];
        count.set(old, count.get(old) - 1);
        if (count.get(old) === 0) {
          count.delete(old);
        }
      }
      answer += right - left + 1;
    }
    return answer;
  }
  return atMost(k) - atMost(k - 1);
}`,
      },
    },
    {
      name: '固定起點列舉右端',
      idea: '對每個起點持續加入數字；種類到 k 時計數，超過 k 就停止。',
      steps: ['每個 left 建立空次數表。', 'right 向右增加，首次出現的新數讓種類加一。', '種類等於 k 就計數；大於 k 就結束此起點。'],
      figure: { title: 'nums = [1,2,1,2,3], k = 2', steps: [
        { note: '固定左端 0，右端先到 1，只有一種，不計。', views: [arr(A, { label: '左端 0', highlight: [0] })] },
        { note: '右端到索引 1 時有 1、2 兩種，計第一段。', views: [arr(A, { label: '合法', highlight: [0, 1] })] },
        { note: '延伸到索引 2、3 仍是兩種，各再計一段。', views: [arr(A, { label: '合法', highlight: [0, 1, 2, 3] })] },
        { note: '延伸到 3 這個值時變三種；此起點停止，再試其他起點，總共 7 段。', views: [arr(A, { label: '種類超過 2', highlight: [4] }), arr([7], { label: '答案', done: [0] })] },
      ] },
      complexity: { time: 'O(n²)', space: 'O(n)', why: '每個起點可能掃完整段，次數表最多 n 種。' },
      verdict: '直觀但最大測資會較慢。',
      code: {
        python: `def subarraysWithKDistinct(nums, k):
    answer = 0
    for left in range(len(nums)):
        seen = set()
        for right in range(left, len(nums)):
            seen.add(nums[right])
            if len(seen) > k:
                break                    # 種類只會增加
            if len(seen) == k:
                answer += 1
    return answer`,
        c: `int subarraysWithKDistinct(int *nums, int numsSize, int k) {
    int answer = 0;
    for (int left = 0; left < numsSize; left++) {
        bool *seen = calloc(numsSize + 1, sizeof(bool));
        int distinct = 0;
        for (int right = left; right < numsSize; right++) {
            if (!seen[nums[right]]) {
                seen[nums[right]] = true;
                distinct++;
            }
            if (distinct > k) {
                break;
            }
            if (distinct == k) {
                answer++;
            }
        }
        free(seen);
    }
    return answer;
}`,
        cpp: `int subarraysWithKDistinct(vector<int>& nums, int k) {
    int answer = 0;
    for (int left = 0; left < (int)nums.size(); left++) {
        unordered_set<int> seen;
        for (int right = left; right < (int)nums.size(); right++) {
            seen.insert(nums[right]);
            if ((int)seen.size() > k) {
                break;
            }
            if ((int)seen.size() == k) {
                answer++;
            }
        }
    }
    return answer;
}`,
        java: `int subarraysWithKDistinct(int[] nums, int k) {
    int answer = 0;
    for (int left = 0; left < nums.length; left++) {
        Set<Integer> seen = new HashSet<>();
        for (int right = left; right < nums.length; right++) {
            seen.add(nums[right]);
            if (seen.size() > k) {
                break;
            }
            if (seen.size() == k) {
                answer++;
            }
        }
    }
    return answer;
}`,
        javascript: `function subarraysWithKDistinct(nums, k) {
  let answer = 0;
  for (let left = 0; left < nums.length; left++) {
    const seen = new Set();
    for (let right = left; right < nums.length; right++) {
      seen.add(nums[right]);
      if (seen.size > k) {
        break;
      }
      if (seen.size === k) {
        answer++;
      }
    }
  }
  return answer;
}`,
      },
    },
  ],
  pitfalls: ['atMost(k−1) 在 k=1 時 limit=0；縮窗後應得到 0 段。', '計數依「固定右端」進行，新增的是 right−left+1 段。'],
  check: { kind: 'fn', fn: 'subarraysWithKDistinct', cases: [
    { args: [A, 2], out: 7 }, { args: [[1, 2, 1, 3, 4], 3], out: 3 }, { args: [[1, 1, 1], 1], out: 6 },
  ] },
}
